import io
import re

from pypdf import PdfReader
from pypdf.errors import PyPdfError

from study_buddy.domain.errors import DocumentParsingError, EmptyDocumentError
from study_buddy.domain.models import Document, Page

_PDF_CONTENT_TYPES = frozenset({"application/pdf", "application/x-pdf"})


class PdfLoader:
    """Extracts text from PDF files page by page."""

    def supports(self, filename: str, content_type: str | None) -> bool:
        return (
            filename.lower().endswith(".pdf")
            or (content_type or "").lower() in _PDF_CONTENT_TYPES
        )

    def load(self, data: bytes, filename: str) -> Document:
        try:
            reader = PdfReader(io.BytesIO(data))
            if reader.is_encrypted:
                reader.decrypt("")
            pages = [
                Page(number=number, text=_normalize(page.extract_text() or ""))
                for number, page in enumerate(reader.pages, start=1)
            ]
        except (PyPdfError, ValueError) as exc:
            raise DocumentParsingError(f"Could not read PDF '{filename}': {exc}") from exc

        pages = [page for page in pages if page.text]
        if not pages:
            raise EmptyDocumentError(
                f"'{filename}' contains no extractable text (scanned PDFs need OCR)."
            )
        return Document(source=filename, pages=pages)


def _normalize(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
