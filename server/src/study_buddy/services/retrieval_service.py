from study_buddy.domain.models import ScoredChunk
from study_buddy.domain.ports import Embedder, VectorStore


class RetrievalService:
    """Finds the chunks most relevant to a query."""

    def __init__(
        self,
        embedder: Embedder,
        store: VectorStore,
        default_top_k: int = 5,
        min_score: float = 0.0,
    ) -> None:
        self._embedder = embedder
        self._store = store
        self._default_top_k = default_top_k
        self._min_score = min_score

    async def retrieve(self, query: str, top_k: int | None = None) -> list[ScoredChunk]:
        vector = await self._embedder.embed_query(query)
        results = await self._store.search(vector, top_k or self._default_top_k)
        return [item for item in results if item.score >= self._min_score]
