from fastapi.testclient import TestClient

from study_buddy.services.rag_service import NO_CONTEXT_ANSWER
from tests.conftest import TEST_ANSWER
from tests.fakes import build_pdf

API = "/api/v1"


def _upload(client: TestClient, data: bytes, filename: str = "biology.pdf",
            content_type: str = "application/pdf") -> dict[str, object]:
    response = client.post(f"{API}/documents", files={"file": (filename, data, content_type)})
    assert response.status_code == 201, response.text
    body: dict[str, object] = response.json()
    return body


def test_health(client: TestClient) -> None:
    response = client.get(f"{API}/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "checks": {"vector_store": True}}


def test_upload_list_and_query(client: TestClient) -> None:
    pdf = build_pdf(
        ["Mitochondria are the powerhouse of the cell.", "Photosynthesis happens in chloroplasts."]
    )
    uploaded = _upload(client, pdf)
    assert uploaded["filename"] == "biology.pdf"
    assert uploaded["pages"] == 2
    assert uploaded["chunks"] == 2

    documents = client.get(f"{API}/documents").json()
    assert documents == [
        {"document_id": uploaded["document_id"], "filename": "biology.pdf", "chunks": 2}
    ]

    response = client.post(f"{API}/query", json={"question": "What are mitochondria?"})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["answer"] == TEST_ANSWER
    [citation] = body["citations"]
    assert citation["page"] == 1
    assert citation["filename"] == "biology.pdf"
    assert "Mitochondria" in citation["snippet"]


def test_upload_strips_client_directories(client: TestClient) -> None:
    uploaded = _upload(client, build_pdf(["Some text."]), filename="C:\\Users\\me\\notes.pdf")
    assert uploaded["filename"] == "notes.pdf"


def test_delete_document(client: TestClient) -> None:
    uploaded = _upload(client, build_pdf(["Mitochondria make energy."]))
    url = f"{API}/documents/{uploaded['document_id']}"

    assert client.delete(url).status_code == 204
    assert client.delete(url).status_code == 404
    assert client.get(f"{API}/documents").json() == []

    response = client.post(f"{API}/query", json={"question": "mitochondria?"})
    assert response.json() == {"answer": NO_CONTEXT_ANSWER, "citations": []}


def test_upload_rejects_unsupported_type(client: TestClient) -> None:
    response = client.post(
        f"{API}/documents", files={"file": ("notes.txt", b"hello", "text/plain")}
    )
    assert response.status_code == 415


def test_upload_rejects_corrupt_pdf(client: TestClient) -> None:
    response = client.post(
        f"{API}/documents", files={"file": ("broken.pdf", b"not a pdf", "application/pdf")}
    )
    assert response.status_code == 422
    assert "broken.pdf" in response.json()["detail"]


def test_upload_rejects_large_files(client: TestClient) -> None:
    too_big = b"%PDF" + b"0" * (1024 * 1024)
    response = client.post(
        f"{API}/documents", files={"file": ("big.pdf", too_big, "application/pdf")}
    )
    assert response.status_code == 413


def test_query_validation(client: TestClient) -> None:
    assert client.post(f"{API}/query", json={"question": ""}).status_code == 422
    assert client.post(f"{API}/query", json={"question": "q", "top_k": 0}).status_code == 422
