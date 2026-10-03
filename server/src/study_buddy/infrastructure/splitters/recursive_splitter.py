from collections.abc import Sequence

from study_buddy.domain.models import Chunk, Document

DEFAULT_SEPARATORS: tuple[str, ...] = ("\n\n", "\n", ". ", " ", "")


class RecursiveCharacterSplitter:
    """Splits text on the coarsest separator that keeps pieces under `chunk_size`,
    then merges neighbouring pieces into chunks that overlap by `chunk_overlap` chars.

    Chunks never span pages, so every chunk can be cited with a page number.
    """

    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 150,
        separators: Sequence[str] = DEFAULT_SEPARATORS,
    ) -> None:
        if chunk_size <= 0:
            raise ValueError("chunk_size must be positive")
        if not 0 <= chunk_overlap < chunk_size:
            raise ValueError("chunk_overlap must be >= 0 and smaller than chunk_size")
        if not separators or separators[-1] != "":
            separators = (*separators, "")
        self._chunk_size = chunk_size
        self._chunk_overlap = chunk_overlap
        self._separators = tuple(separators)

    def split(self, document: Document) -> list[Chunk]:
        chunks: list[Chunk] = []
        for page in document.pages:
            for text in self.split_text(page.text):
                chunks.append(
                    Chunk(
                        document_id=document.id,
                        source=document.source,
                        page=page.number,
                        chunk_index=len(chunks),
                        text=text,
                    )
                )
        return chunks

    def split_text(self, text: str) -> list[str]:
        return self._merge(self._split_recursive(text.strip(), self._separators))

    def _split_recursive(self, text: str, separators: Sequence[str]) -> list[str]:
        if len(text) <= self._chunk_size:
            return [text] if text else []

        separator, *finer = separators
        if separator == "":
            size = self._chunk_size
            return [text[i : i + size] for i in range(0, len(text), size)]

        parts = text.split(separator)
        pieces: list[str] = []
        for i, part in enumerate(parts):
            # Keep the separator attached so merged chunks read naturally.
            piece = part + separator if i < len(parts) - 1 else part
            if len(piece) <= self._chunk_size:
                if piece:
                    pieces.append(piece)
            else:
                pieces.extend(self._split_recursive(piece, finer))
        return pieces

    def _merge(self, pieces: list[str]) -> list[str]:
        chunks: list[str] = []
        current = ""
        for piece in pieces:
            if current and len(current) + len(piece) > self._chunk_size:
                chunks.append(current.strip())
                overlap = min(self._chunk_overlap, self._chunk_size - len(piece))
                current = current[-overlap:] if overlap > 0 else ""
            current += piece
        if current.strip():
            chunks.append(current.strip())
        return [chunk for chunk in chunks if chunk]
