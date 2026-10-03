import asyncio
from collections.abc import Sequence

import anyio.to_thread
from sentence_transformers import SentenceTransformer


class SentenceTransformerEmbedder:
    """Local, free embeddings via sentence-transformers.

    The model is loaded on startup (or lazily on first use) and encoding runs in a
    worker thread so it doesn't block the event loop.
    """

    def __init__(
        self,
        model_name: str,
        query_prefix: str = "",
        document_prefix: str = "",
        batch_size: int = 32,
    ) -> None:
        self._model_name = model_name
        self._query_prefix = query_prefix
        self._document_prefix = document_prefix
        self._batch_size = batch_size
        self._model: SentenceTransformer | None = None
        self._lock = asyncio.Lock()

    async def startup(self) -> None:
        await self._get_model()

    async def shutdown(self) -> None:
        self._model = None

    async def embed_documents(self, texts: Sequence[str]) -> list[list[float]]:
        if not texts:
            return []
        model = await self._get_model()
        prefixed = [self._document_prefix + text for text in texts]
        return await anyio.to_thread.run_sync(self._encode, model, prefixed)

    async def embed_query(self, text: str) -> list[float]:
        model = await self._get_model()
        vectors = await anyio.to_thread.run_sync(self._encode, model, [self._query_prefix + text])
        return vectors[0]

    async def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            async with self._lock:
                if self._model is None:
                    self._model = await anyio.to_thread.run_sync(
                        SentenceTransformer, self._model_name
                    )
        return self._model

    def _encode(self, model: SentenceTransformer, texts: list[str]) -> list[list[float]]:
        vectors = model.encode(
            texts,
            batch_size=self._batch_size,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return [[float(x) for x in vector] for vector in vectors]
