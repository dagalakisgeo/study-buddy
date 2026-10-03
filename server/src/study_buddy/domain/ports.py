"""Abstractions the services depend on (Dependency Inversion).

Each protocol is small and role-specific (Interface Segregation), so adapters
only implement what they actually provide.
"""

from collections.abc import Sequence
from typing import Protocol

from study_buddy.domain.models import Answer, Chunk, Document, DocumentInfo, ScoredChunk


class DocumentLoader(Protocol):
    def supports(self, filename: str, content_type: str | None) -> bool: ...

    def load(self, data: bytes, filename: str) -> Document: ...


class TextSplitter(Protocol):
    def split(self, document: Document) -> list[Chunk]: ...


class Embedder(Protocol):
    async def embed_documents(self, texts: Sequence[str]) -> list[list[float]]: ...

    async def embed_query(self, text: str) -> list[float]: ...


class VectorStore(Protocol):
    async def upsert(self, chunks: Sequence[Chunk], vectors: Sequence[Sequence[float]]) -> None: ...

    async def search(self, vector: Sequence[float], top_k: int) -> list[ScoredChunk]: ...

    async def delete_document(self, document_id: str) -> int:
        """Delete all chunks of a document and return how many were removed."""
        ...

    async def list_documents(self) -> list[DocumentInfo]: ...


class Retriever(Protocol):
    async def retrieve(self, query: str, top_k: int | None = None) -> list[ScoredChunk]: ...


class AnswerGenerator(Protocol):
    async def generate(self, question: str, context: Sequence[ScoredChunk]) -> Answer: ...


class Lifecycle(Protocol):
    """A component that needs to be started and stopped with the application."""

    async def startup(self) -> None: ...

    async def shutdown(self) -> None: ...


class HealthCheck(Protocol):
    @property
    def name(self) -> str: ...

    async def is_healthy(self) -> bool: ...
