from study_buddy.domain.models import Answer
from study_buddy.domain.ports import AnswerGenerator, Retriever

NO_CONTEXT_ANSWER = "I couldn't find anything relevant in your documents to answer that question."


class RagService:
    """Answers questions by retrieving context and passing it to the generator."""

    def __init__(self, retriever: Retriever, generator: AnswerGenerator) -> None:
        self._retriever = retriever
        self._generator = generator

    async def ask(self, question: str, top_k: int | None = None) -> Answer:
        context = await self._retriever.retrieve(question, top_k)
        if not context:
            return Answer(answer=NO_CONTEXT_ANSWER)
        return await self._generator.generate(question, context)
