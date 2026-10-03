import pytest

from study_buddy.domain.errors import (
    DocumentNotFoundError,
    DocumentTooLargeError,
    EmptyDocumentError,
    UnsupportedDocumentError,
)
from study_buddy.infrastructure.loaders.pdf_loader import PdfLoader
from study_buddy.infrastructure.splitters.recursive_splitter import RecursiveCharacterSplitter
from study_buddy.infrastructure.vectorstores.in_memory_store import InMemoryVectorStore
from study_buddy.services.document_service import DocumentService
from study_buddy.services.ingestion_service import IngestionService
from study_buddy.services.rag_service import NO_CONTEXT_ANSWER, RagService
from study_buddy.services.retrieval_service import RetrievalService
from tests.fakes import FakeEmbedder, SpyGenerator, build_pdf


def _ingestion(store: InMemoryVectorStore, max_bytes: int = 1_000_000) -> IngestionService:
    return IngestionService(
        loaders=[PdfLoader()],
        splitter=RecursiveCharacterSplitter(chunk_size=200, chunk_overlap=20),
        embedder=FakeEmbedder(),
        store=store,
        max_bytes=max_bytes,
    )


async def test_ingest_stores_chunks() -> None:
    store = InMemoryVectorStore()
    data = build_pdf(["Mitochondria are the powerhouse of the cell.", "Chloroplasts."])

    result = await _ingestion(store).ingest(data, "bio.pdf", "application/pdf")

    assert result.page_count == 2
    assert result.chunk_count == 2
    [info] = await store.list_documents()
    assert info.document_id == result.document_id
    assert info.chunk_count == 2


async def test_ingest_validates_input() -> None:
    service = _ingestion(InMemoryVectorStore(), max_bytes=10)
    with pytest.raises(EmptyDocumentError):
        await service.ingest(b"", "empty.pdf")
    with pytest.raises(DocumentTooLargeError):
        await service.ingest(b"x" * 11, "big.pdf")
    with pytest.raises(UnsupportedDocumentError):
        await service.ingest(b"hello", "notes.txt", "text/plain")


async def test_retrieval_filters_by_min_score() -> None:
    store = InMemoryVectorStore()
    await _ingestion(store).ingest(
        build_pdf(["Mitochondria make energy.", "Unrelated cooking recipe."]), "mix.pdf"
    )

    results = await RetrievalService(FakeEmbedder(), store, min_score=0.3).retrieve(
        "mitochondria energy"
    )

    assert [r.chunk.page for r in results] == [1]


async def test_rag_skips_generator_without_context() -> None:
    generator = SpyGenerator()
    retriever = RetrievalService(FakeEmbedder(), InMemoryVectorStore())

    answer = await RagService(retriever, generator).ask("anything?")

    assert answer.answer == NO_CONTEXT_ANSWER
    assert generator.calls == []


async def test_rag_passes_retrieved_context_to_generator() -> None:
    store = InMemoryVectorStore()
    await _ingestion(store).ingest(build_pdf(["Mitochondria make energy."]), "bio.pdf")
    generator = SpyGenerator("ok")

    answer = await RagService(RetrievalService(FakeEmbedder(), store), generator).ask(
        "What do mitochondria do?", top_k=1
    )

    assert answer.answer == "ok"
    [(question, context)] = generator.calls
    assert question == "What do mitochondria do?"
    assert len(context) == 1


async def test_delete_unknown_document_raises() -> None:
    with pytest.raises(DocumentNotFoundError):
        await DocumentService(InMemoryVectorStore()).delete_document("missing")
