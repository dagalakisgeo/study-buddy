from collections.abc import Sequence

import anyio.to_thread

from study_buddy.domain.errors import (
    DocumentTooLargeError,
    EmptyDocumentError,
    UnsupportedDocumentError,
)
from study_buddy.domain.models import IngestionResult
from study_buddy.domain.ports import DocumentLoader, Embedder, TextSplitter, VectorStore


class IngestionService:
    """Turns an uploaded file into embedded chunks in the vector store.

    New file types are supported by passing another `DocumentLoader`; this class
    does not change (Open/Closed).
    """

    def __init__(
        self,
        loaders: Sequence[DocumentLoader],
        splitter: TextSplitter,
        embedder: Embedder,
        store: VectorStore,
        max_bytes: int,
    ) -> None:
        self._loaders = list(loaders)
        self._splitter = splitter
        self._embedder = embedder
        self._store = store
        self._max_bytes = max_bytes

    async def ingest(
        self, data: bytes, filename: str, content_type: str | None = None
    ) -> IngestionResult:
        if not data:
            raise EmptyDocumentError(f"'{filename}' is empty.")
        if len(data) > self._max_bytes:
            limit_mb = self._max_bytes / (1024 * 1024)
            raise DocumentTooLargeError(f"'{filename}' exceeds the {limit_mb:g} MB upload limit.")

        loader = self._find_loader(filename, content_type)
        document = await anyio.to_thread.run_sync(loader.load, data, filename)
        chunks = await anyio.to_thread.run_sync(self._splitter.split, document)
        if not chunks:
            raise EmptyDocumentError(f"'{filename}' produced no text chunks.")

        vectors = await self._embedder.embed_documents([chunk.text for chunk in chunks])
        await self._store.upsert(chunks, vectors)

        return IngestionResult(
            document_id=document.id,
            source=document.source,
            page_count=len(document.pages),
            chunk_count=len(chunks),
        )

    def _find_loader(self, filename: str, content_type: str | None) -> DocumentLoader:
        for loader in self._loaders:
            if loader.supports(filename, content_type):
                return loader
        raise UnsupportedDocumentError(
            f"Unsupported file type for '{filename}' ({content_type or 'unknown type'})."
        )
