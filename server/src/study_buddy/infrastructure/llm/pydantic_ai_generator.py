from collections.abc import Sequence
from dataclasses import dataclass

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models import Model

from study_buddy.domain.errors import GenerationError
from study_buddy.domain.models import Answer, Citation, ScoredChunk

SYSTEM_PROMPT = """\
You are Study Buddy, a helpful study assistant.
Answer the user's question using ONLY the numbered context passages provided below.
If the passages do not contain the answer, say that you don't know; never invent facts.
Always answer in the same language as the user's question (e.g. Greek for a Greek question).
List the numbers of the passages you relied on in `cited_passages`.
Be concise and accurate. Use markdown when it helps readability."""


class AnswerDraft(BaseModel):
    """Structured output requested from the LLM."""

    answer: str = Field(description="The answer to the user's question, in markdown.")
    cited_passages: list[int] = Field(
        default_factory=list,
        description="Numbers of the context passages the answer is based on, e.g. [1, 3].",
    )


@dataclass(frozen=True)
class RagContext:
    passages: Sequence[ScoredChunk]


def _context_prompt(ctx: RunContext[RagContext]) -> str:
    blocks = ["Context passages:"]
    for number, item in enumerate(ctx.deps.passages, start=1):
        chunk = item.chunk
        blocks.append(f"[{number}] (source: {chunk.source}, page {chunk.page})\n{chunk.text}")
    return "\n\n".join(blocks)


class PydanticAIGenerator:
    """Generates grounded answers with a pydantic_ai Agent.

    The model is injected, so any pydantic_ai model (Groq, Gemini, Ollama, or
    `TestModel` in tests) can be used without changing this class.
    """

    def __init__(self, model: Model | str, snippet_length: int = 240, retries: int = 2) -> None:
        self._snippet_length = snippet_length
        self._agent: Agent[RagContext, AnswerDraft] = Agent(
            model,
            deps_type=RagContext,
            output_type=AnswerDraft,
            system_prompt=SYSTEM_PROMPT,
            retries=retries,
        )
        self._agent.system_prompt(_context_prompt)

    async def generate(self, question: str, context: Sequence[ScoredChunk]) -> Answer:
        try:
            result = await self._agent.run(question, deps=RagContext(passages=list(context)))
        except Exception as exc:  # adapter boundary: translate any provider failure
            raise GenerationError(f"The language model failed to answer: {exc}") from exc

        draft = result.output
        return Answer(answer=draft.answer, citations=self._citations(draft, context))

    def _citations(self, draft: AnswerDraft, context: Sequence[ScoredChunk]) -> list[Citation]:
        citations: list[Citation] = []
        seen: set[int] = set()
        for number in draft.cited_passages:
            if number in seen or not 1 <= number <= len(context):
                continue
            seen.add(number)
            item = context[number - 1]
            citations.append(
                Citation(
                    document_id=item.chunk.document_id,
                    source=item.chunk.source,
                    page=item.chunk.page,
                    snippet=_snippet(item.chunk.text, self._snippet_length),
                    score=item.score,
                )
            )
        return citations


def _snippet(text: str, length: int) -> str:
    text = " ".join(text.split())
    return text if len(text) <= length else text[: length - 1].rstrip() + "…"
