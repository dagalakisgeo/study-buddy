import math
from collections import Counter
from collections.abc import Sequence

from study_buddy.domain.models import Chunk, DocumentInfo, ScoredChunk


class InMemoryVectorStore:
    """Brute-force cosine search held in process memory.

    Useful for tests and quick local runs; data is lost on restart.
    """

    name = "vector_store"

    def __init__(self) -> None:
        self._items: dict[str, tuple[Chunk, list[float]]] = {}

    async def upsert(self, chunks: Sequence[Chunk], vectors: Sequence[Sequence[float]]) -> None:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors must have the same length")
        for chunk, vector in zip(chunks, vectors, strict=True):
            self._items[chunk.id] = (chunk, list(vector))

    async def search(self, vector: Sequence[float], top_k: int) -> list[ScoredChunk]:
        scored = [
            ScoredChunk(chunk=chunk, score=_cosine(vector, stored))
            for chunk, stored in self._items.values()
        ]
        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:top_k]

    async def delete_document(self, document_id: str) -> int:
        ids = [cid for cid, (chunk, _) in self._items.items() if chunk.document_id == document_id]
        for cid in ids:
            del self._items[cid]
        return len(ids)

    async def list_documents(self) -> list[DocumentInfo]:
        counts = Counter(chunk.document_id for chunk, _ in self._items.values())
        sources = {chunk.document_id: chunk.source for chunk, _ in self._items.values()}
        return [
            DocumentInfo(document_id=doc_id, source=sources[doc_id], chunk_count=count)
            for doc_id, count in counts.items()
        ]

    async def is_healthy(self) -> bool:
        return True


def _cosine(a: Sequence[float], b: Sequence[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    norm = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    return dot / norm if norm else 0.0
