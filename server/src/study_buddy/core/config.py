from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, read from environment variables and `.env`."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Study Buddy RAG API"
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # LLM
    groq_api_key: SecretStr | None = None
    llm_model: str = "openai/gpt-oss-120b"

    # Embeddings
    # multilingual-e5 handles Greek and ~100 other languages; it expects these prefixes.
    embedding_model: str = "intfloat/multilingual-e5-small"
    embedding_query_prefix: str = "query: "
    embedding_document_prefix: str = "passage: "

    # Vector store
    vector_store: Literal["weaviate", "memory"] = "weaviate"
    weaviate_url: str | None = None
    weaviate_api_key: SecretStr | None = None
    weaviate_collection: str = "DocumentChunk"

    # Chunking & retrieval
    chunk_size: int = Field(default=1000, gt=0)
    chunk_overlap: int = Field(default=150, ge=0)
    top_k: int = Field(default=5, gt=0, le=50)
    min_relevance_score: float = Field(default=0.0, ge=-1.0, le=1.0)
    max_upload_mb: int = Field(default=20, gt=0)

    @model_validator(mode="after")
    def _check_chunking(self) -> "Settings":
        if self.chunk_overlap >= self.chunk_size:
            raise ValueError("CHUNK_OVERLAP must be smaller than CHUNK_SIZE")
        return self

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
