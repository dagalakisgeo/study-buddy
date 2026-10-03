from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class Page(BaseModel):
    model_config = ConfigDict(frozen=True)

    number: int
    text: str


class Document(BaseModel):
    """A parsed source document, split into pages."""

    model_config = ConfigDict(frozen=True)

    id: str = Field(default_factory=lambda: uuid4().hex)
    source: str
    pages: list[Page]


class Chunk(BaseModel):
    """A piece of a document that is embedded and stored for retrieval."""

    model_config = ConfigDict(frozen=True)

    document_id: str
    source: str
    page: int
    chunk_index: int
    text: str

    @property
    def id(self) -> str:
        return f"{self.document_id}:{self.chunk_index}"


class ScoredChunk(BaseModel):
    model_config = ConfigDict(frozen=True)

    chunk: Chunk
    score: float


class DocumentInfo(BaseModel):
    document_id: str
    source: str
    chunk_count: int


class IngestionResult(BaseModel):
    document_id: str
    source: str
    page_count: int
    chunk_count: int


class Citation(BaseModel):
    document_id: str
    source: str
    page: int
    snippet: str
    score: float


class Answer(BaseModel):
    answer: str
    citations: list[Citation] = Field(default_factory=list)
