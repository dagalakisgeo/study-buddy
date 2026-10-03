from study_buddy.domain.errors import DocumentNotFoundError
from study_buddy.domain.models import DocumentInfo
from study_buddy.domain.ports import VectorStore


class DocumentService:
    """Manages documents that have already been ingested."""

    def __init__(self, store: VectorStore) -> None:
        self._store = store

    async def list_documents(self) -> list[DocumentInfo]:
        documents = await self._store.list_documents()
        return sorted(documents, key=lambda doc: doc.source.lower())

    async def delete_document(self, document_id: str) -> None:
        if await self._store.delete_document(document_id) == 0:
            raise DocumentNotFoundError(f"Document '{document_id}' was not found.")
