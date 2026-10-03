from collections.abc import AsyncIterator, Sequence
from contextlib import asynccontextmanager

import weaviate
from weaviate.classes.aggregate import GroupByAggregate
from weaviate.classes.config import Configure, DataType, Property, Tokenization, VectorDistances
from weaviate.classes.data import DataObject
from weaviate.classes.init import Auth
from weaviate.classes.query import Filter, MetadataQuery
from weaviate.collections import CollectionAsync
from weaviate.exceptions import WeaviateBaseError
from weaviate.util import generate_uuid5

from study_buddy.domain.errors import VectorStoreError
from study_buddy.domain.models import Chunk, DocumentInfo, ScoredChunk

_MAX_LISTED_DOCUMENTS = 1000


class WeaviateVectorStore:
    """Vector store backed by a Weaviate Cloud cluster (e.g. the free sandbox).

    Vectors are computed by our own embedder ("bring your own vectors"), so the
    collection is created without a Weaviate vectorizer.
    """

    name = "vector_store"

    def __init__(self, cluster_url: str, api_key: str, collection_name: str) -> None:
        self._collection_name = collection_name
        self._client = weaviate.use_async_with_weaviate_cloud(
            cluster_url=cluster_url,
            auth_credentials=Auth.api_key(api_key),
        )

    async def startup(self) -> None:
        async with _translate_errors("connect to Weaviate"):
            await self._client.connect()
            if not await self._client.collections.exists(self._collection_name):
                await self._client.collections.create(
                    name=self._collection_name,
                    vectorizer_config=Configure.Vectorizer.none(),
                    vector_index_config=Configure.VectorIndex.hnsw(
                        distance_metric=VectorDistances.COSINE
                    ),
                    properties=[
                        Property(name="text", data_type=DataType.TEXT),
                        Property(
                            name="document_id",
                            data_type=DataType.TEXT,
                            tokenization=Tokenization.FIELD,
                        ),
                        Property(name="source", data_type=DataType.TEXT),
                        Property(name="page", data_type=DataType.INT),
                        Property(name="chunk_index", data_type=DataType.INT),
                    ],
                )

    async def shutdown(self) -> None:
        await self._client.close()

    async def upsert(self, chunks: Sequence[Chunk], vectors: Sequence[Sequence[float]]) -> None:
        if len(chunks) != len(vectors):
            raise ValueError("chunks and vectors must have the same length")
        objects = [
            DataObject(
                uuid=generate_uuid5(chunk.id),
                properties={
                    "text": chunk.text,
                    "document_id": chunk.document_id,
                    "source": chunk.source,
                    "page": chunk.page,
                    "chunk_index": chunk.chunk_index,
                },
                vector=list(vector),
            )
            for chunk, vector in zip(chunks, vectors, strict=True)
        ]
        async with _translate_errors("store chunks"):
            result = await self._collection.data.insert_many(objects)
        if result.has_errors:
            first = next(iter(result.errors.values()))
            raise VectorStoreError(
                f"Failed to store {len(result.errors)} of {len(objects)} chunks: {first.message}"
            )

    async def search(self, vector: Sequence[float], top_k: int) -> list[ScoredChunk]:
        async with _translate_errors("search"):
            response = await self._collection.query.near_vector(
                near_vector=list(vector),
                limit=top_k,
                return_metadata=MetadataQuery(distance=True),
            )
        results: list[ScoredChunk] = []
        for obj in response.objects:
            props = obj.properties
            distance = obj.metadata.distance if obj.metadata.distance is not None else 1.0
            chunk = Chunk(
                document_id=str(props["document_id"]),
                source=str(props["source"]),
                page=int(str(props["page"])),
                chunk_index=int(str(props["chunk_index"])),
                text=str(props["text"]),
            )
            # Weaviate's cosine distance is 1 - cosine similarity.
            results.append(ScoredChunk(chunk=chunk, score=1.0 - distance))
        return results

    async def delete_document(self, document_id: str) -> int:
        async with _translate_errors("delete document"):
            result = await self._collection.data.delete_many(
                where=Filter.by_property("document_id").equal(document_id)
            )
        return int(result.successful)

    async def list_documents(self) -> list[DocumentInfo]:
        async with _translate_errors("list documents"):
            response = await self._collection.aggregate.over_all(
                group_by=GroupByAggregate(prop="document_id", limit=_MAX_LISTED_DOCUMENTS),
                total_count=True,
            )
            documents: list[DocumentInfo] = []
            for group in response.groups:
                document_id = str(group.grouped_by.value)
                sample = await self._collection.query.fetch_objects(
                    filters=Filter.by_property("document_id").equal(document_id),
                    limit=1,
                    return_properties=["source"],
                )
                source = str(sample.objects[0].properties["source"]) if sample.objects else ""
                documents.append(
                    DocumentInfo(
                        document_id=document_id,
                        source=source,
                        chunk_count=group.total_count or 0,
                    )
                )
        return documents

    async def is_healthy(self) -> bool:
        try:
            return bool(await self._client.is_ready())
        except WeaviateBaseError:
            return False

    @property
    def _collection(self) -> CollectionAsync:
        return self._client.collections.get(self._collection_name)


@asynccontextmanager
async def _translate_errors(action: str) -> AsyncIterator[None]:
    try:
        yield
    except WeaviateBaseError as exc:
        raise VectorStoreError(f"Weaviate failed to {action}: {exc}") from exc
