"""Runs against a real Weaviate cluster. Skipped unless WEAVIATE_URL and WEAVIATE_API_KEY are set.

    poetry run pytest -m integration
"""

import os
from uuid import uuid4

import pytest

from study_buddy.domain.models import Chunk

pytestmark = pytest.mark.integration

WEAVIATE_URL = os.getenv("WEAVIATE_URL")
WEAVIATE_API_KEY = os.getenv("WEAVIATE_API_KEY")


@pytest.mark.skipif(
    not (WEAVIATE_URL and WEAVIATE_API_KEY), reason="Weaviate credentials not configured"
)
async def test_round_trip() -> None:
    from study_buddy.infrastructure.vectorstores.weaviate_store import WeaviateVectorStore

    assert WEAVIATE_URL and WEAVIATE_API_KEY
    store = WeaviateVectorStore(WEAVIATE_URL, WEAVIATE_API_KEY, "StudyBuddyIntegrationTest")
    document_id = uuid4().hex
    chunks = [
        Chunk(document_id=document_id, source="it.pdf", page=1, chunk_index=i, text=f"text {i}")
        for i in range(2)
    ]

    await store.startup()
    try:
        assert await store.is_healthy()
        await store.upsert(chunks, [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]])

        results = await store.search([1.0, 0.0, 0.0], top_k=1)
        assert results[0].chunk == chunks[0]
        assert results[0].score == pytest.approx(1.0, abs=1e-4)

        listed = {doc.document_id: doc for doc in await store.list_documents()}
        assert listed[document_id].chunk_count == 2
    finally:
        assert await store.delete_document(document_id) == 2
        await store.shutdown()
