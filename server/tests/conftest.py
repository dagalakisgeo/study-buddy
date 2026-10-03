from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from pydantic_ai.models.test import TestModel

from study_buddy.core.config import Settings
from study_buddy.core.container import Container, assemble_container
from study_buddy.infrastructure.vectorstores.in_memory_store import InMemoryVectorStore
from study_buddy.main import create_app
from tests.fakes import FakeEmbedder

TEST_ANSWER = "Mitochondria produce ATP, the cell's energy currency."


@pytest.fixture
def settings() -> Settings:
    return Settings(
        _env_file=None,  # type: ignore[call-arg]
        vector_store="memory",
        chunk_size=200,
        chunk_overlap=20,
        top_k=3,
        max_upload_mb=1,
    )


@pytest.fixture
def embedder() -> FakeEmbedder:
    return FakeEmbedder()


@pytest.fixture
def store() -> InMemoryVectorStore:
    return InMemoryVectorStore()


@pytest.fixture
def llm_model() -> TestModel:
    return TestModel(custom_output_args={"answer": TEST_ANSWER, "cited_passages": [1]})


@pytest.fixture
def container(
    settings: Settings, embedder: FakeEmbedder, store: InMemoryVectorStore, llm_model: TestModel
) -> Container:
    return assemble_container(
        settings,
        embedder=embedder,
        vector_store=store,
        llm_model=llm_model,
        health_checks=[store],
    )


@pytest.fixture
def client(container: Container, settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(container=container, settings=settings)) as test_client:
        yield test_client
