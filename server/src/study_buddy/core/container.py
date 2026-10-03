"""Composition root: the only place that knows which concrete classes are used."""

import logging
from collections.abc import Sequence
from dataclasses import dataclass, field

from pydantic_ai.models import Model

from study_buddy.core.config import Settings
from study_buddy.domain.errors import ConfigurationError
from study_buddy.domain.ports import Embedder, HealthCheck, Lifecycle, VectorStore
from study_buddy.infrastructure.llm.pydantic_ai_generator import PydanticAIGenerator
from study_buddy.infrastructure.loaders.pdf_loader import PdfLoader
from study_buddy.infrastructure.splitters.recursive_splitter import RecursiveCharacterSplitter
from study_buddy.services.document_service import DocumentService
from study_buddy.services.ingestion_service import IngestionService
from study_buddy.services.rag_service import RagService
from study_buddy.services.retrieval_service import RetrievalService

logger = logging.getLogger(__name__)


@dataclass
class Container:
    ingestion_service: IngestionService
    document_service: DocumentService
    rag_service: RagService
    health_checks: list[HealthCheck] = field(default_factory=list)
    resources: list[Lifecycle] = field(default_factory=list)
    _started: list[Lifecycle] = field(default_factory=list, init=False, repr=False)

    async def startup(self) -> None:
        try:
            for resource in self.resources:
                await resource.startup()
                self._started.append(resource)
        except BaseException:
            await self.shutdown()
            raise

    async def shutdown(self) -> None:
        while self._started:
            resource = self._started.pop()
            try:
                await resource.shutdown()
            except Exception:
                logger.exception("Error while shutting down %r", resource)


def assemble_container(
    settings: Settings,
    *,
    embedder: Embedder,
    vector_store: VectorStore,
    llm_model: Model | str,
    resources: Sequence[Lifecycle] = (),
    health_checks: Sequence[HealthCheck] = (),
) -> Container:
    """Wire services from already-built adapters. Tests use this with fakes."""
    splitter = RecursiveCharacterSplitter(settings.chunk_size, settings.chunk_overlap)
    retriever = RetrievalService(
        embedder, vector_store, settings.top_k, settings.min_relevance_score
    )
    return Container(
        ingestion_service=IngestionService(
            loaders=[PdfLoader()],
            splitter=splitter,
            embedder=embedder,
            store=vector_store,
            max_bytes=settings.max_upload_bytes,
        ),
        document_service=DocumentService(vector_store),
        rag_service=RagService(retriever, PydanticAIGenerator(llm_model)),
        health_checks=list(health_checks),
        resources=list(resources),
    )


def build_container(settings: Settings) -> Container:
    """Build the production container from settings."""
    # Heavy adapters (torch, weaviate) are imported here so tests that only use
    # `assemble_container` with fakes stay fast.
    from study_buddy.infrastructure.embeddings.sentence_transformer_embedder import (
        SentenceTransformerEmbedder,
    )

    embedder = SentenceTransformerEmbedder(
        settings.embedding_model,
        query_prefix=settings.embedding_query_prefix,
        document_prefix=settings.embedding_document_prefix,
    )
    vector_store, store_resources, store_checks = _build_vector_store(settings)
    return assemble_container(
        settings,
        embedder=embedder,
        vector_store=vector_store,
        llm_model=_build_llm_model(settings),
        resources=[embedder, *store_resources],
        health_checks=store_checks,
    )


def _build_vector_store(
    settings: Settings,
) -> tuple[VectorStore, list[Lifecycle], list[HealthCheck]]:
    if settings.vector_store == "memory":
        from study_buddy.infrastructure.vectorstores.in_memory_store import InMemoryVectorStore

        memory_store = InMemoryVectorStore()
        return memory_store, [], [memory_store]

    if not settings.weaviate_url or settings.weaviate_api_key is None:
        raise ConfigurationError(
            "WEAVIATE_URL and WEAVIATE_API_KEY must be set (or set VECTOR_STORE=memory)."
        )
    from study_buddy.infrastructure.vectorstores.weaviate_store import WeaviateVectorStore

    store = WeaviateVectorStore(
        cluster_url=settings.weaviate_url,
        api_key=settings.weaviate_api_key.get_secret_value(),
        collection_name=settings.weaviate_collection,
    )
    return store, [store], [store]


def _build_llm_model(settings: Settings) -> Model:
    if settings.groq_api_key is None:
        raise ConfigurationError("GROQ_API_KEY must be set (free key: https://console.groq.com).")
    from pydantic_ai.models.groq import GroqModel
    from pydantic_ai.providers.groq import GroqProvider

    return GroqModel(
        settings.llm_model,
        provider=GroqProvider(api_key=settings.groq_api_key.get_secret_value()),
    )
