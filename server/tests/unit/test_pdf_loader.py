import pytest

from study_buddy.domain.errors import DocumentParsingError, EmptyDocumentError
from study_buddy.infrastructure.loaders.pdf_loader import PdfLoader
from tests.fakes import build_pdf


@pytest.mark.parametrize(
    ("filename", "content_type", "expected"),
    [
        ("notes.pdf", None, True),
        ("NOTES.PDF", "application/octet-stream", True),
        ("download", "application/pdf", True),
        ("notes.txt", "text/plain", False),
    ],
)
def test_supports(filename: str, content_type: str | None, expected: bool) -> None:
    assert PdfLoader().supports(filename, content_type) is expected


def test_load_extracts_text_per_page() -> None:
    data = build_pdf(["Cells contain mitochondria.", "Plants use photosynthesis."])

    document = PdfLoader().load(data, "biology.pdf")

    assert document.source == "biology.pdf"
    assert [page.number for page in document.pages] == [1, 2]
    assert "mitochondria" in document.pages[0].text
    assert "photosynthesis" in document.pages[1].text


def test_load_skips_blank_pages() -> None:
    document = PdfLoader().load(build_pdf(["", "Only text here."]), "x.pdf")
    assert [page.number for page in document.pages] == [2]


def test_load_rejects_invalid_pdf() -> None:
    with pytest.raises(DocumentParsingError):
        PdfLoader().load(b"this is not a pdf", "broken.pdf")


def test_load_rejects_pdf_without_text() -> None:
    with pytest.raises(EmptyDocumentError):
        PdfLoader().load(build_pdf([""]), "scan.pdf")
