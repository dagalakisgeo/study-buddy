from study_buddy.domain.models import Chunk
from study_buddy.infrastructure.vectorstores.in_memory_store import InMemoryVectorStore


def _chunk(document_id: str, index: int, source: str = "a.pdf") -> Chunk:
    return Chunk(document_id=document_id, source=source, page=1, chunk_index=index, text=f"t{index}")


async def test_search_orders_by_similarity() -> None:
    store = InMemoryVectorStore()
    await store.upsert(
        [_chunk("d", 0), _chunk("d", 1), _chunk("d", 2)],
        [[1.0, 0.0], [0.0, 1.0], [0.7, 0.7]],
    )

    results = await store.search([1.0, 0.0], top_k=2)

    assert [r.chunk.chunk_index for r in results] == [0, 2]
    assert results[0].score > results[1].score


async def test_upsert_replaces_existing_chunk() -> None:
    store = InMemoryVectorStore()
    await store.upsert([_chunk("d", 0)], [[1.0, 0.0]])
    await store.upsert([_chunk("d", 0)], [[0.0, 1.0]])

    results = await store.search([0.0, 1.0], top_k=5)

    assert len(results) == 1
    assert results[0].score == 1.0


async def test_list_and_delete_documents() -> None:
    store = InMemoryVectorStore()
    await store.upsert(
        [_chunk("d1", 0, "one.pdf"), _chunk("d1", 1, "one.pdf"), _chunk("d2", 0, "two.pdf")],
        [[1.0], [1.0], [1.0]],
    )

    documents = {doc.document_id: doc for doc in await store.list_documents()}
    assert documents["d1"].chunk_count == 2
    assert documents["d2"].source == "two.pdf"

    assert await store.delete_document("d1") == 2
    assert await store.delete_document("d1") == 0
    assert [doc.document_id for doc in await store.list_documents()] == ["d2"]
