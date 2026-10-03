import pytest
from pydantic_ai.messages import ModelMessage, ModelResponse, SystemPromptPart, ToolCallPart
from pydantic_ai.models.function import AgentInfo, FunctionModel
from pydantic_ai.models.test import TestModel

from study_buddy.domain.errors import GenerationError
from study_buddy.domain.models import Chunk, ScoredChunk
from study_buddy.infrastructure.llm.pydantic_ai_generator import PydanticAIGenerator


def _context() -> list[ScoredChunk]:
    return [
        ScoredChunk(
            chunk=Chunk(
                document_id="d1", source="bio.pdf", page=page, chunk_index=page, text=text
            ),
            score=score,
        )
        for page, text, score in [(1, "Mitochondria make ATP.", 0.9), (2, "Cells divide.", 0.5)]
    ]


async def test_maps_cited_passages_to_citations() -> None:
    model = TestModel(custom_output_args={"answer": "ATP.", "cited_passages": [2, 2, 1, 7]})

    answer = await PydanticAIGenerator(model).generate("What makes ATP?", _context())

    assert answer.answer == "ATP."
    assert [(c.page, c.source) for c in answer.citations] == [(2, "bio.pdf"), (1, "bio.pdf")]
    assert answer.citations[1].snippet == "Mitochondria make ATP."
    assert answer.citations[1].score == 0.9


async def test_context_is_sent_to_the_model() -> None:
    system_prompts: list[str] = []

    def respond(messages: list[ModelMessage], info: AgentInfo) -> ModelResponse:
        for message in messages:
            for part in message.parts:
                if isinstance(part, SystemPromptPart):
                    system_prompts.append(part.content)
        output_tool = info.output_tools[0]
        return ModelResponse(
            parts=[ToolCallPart(output_tool.name, {"answer": "x", "cited_passages": [1]})]
        )

    answer = await PydanticAIGenerator(FunctionModel(respond)).generate("q", _context())

    prompt = "\n".join(system_prompts)
    assert "[1] (source: bio.pdf, page 1)\nMitochondria make ATP." in prompt
    assert "[2] (source: bio.pdf, page 2)\nCells divide." in prompt
    assert answer.citations[0].page == 1


async def test_provider_failures_become_generation_errors() -> None:
    def explode(messages: list[ModelMessage], info: AgentInfo) -> ModelResponse:
        raise RuntimeError("rate limited")

    with pytest.raises(GenerationError, match="rate limited"):
        await PydanticAIGenerator(FunctionModel(explode)).generate("q", _context())
