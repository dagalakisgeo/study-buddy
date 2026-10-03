import pytest

from study_buddy.domain.models import Document, Page
from study_buddy.infrastructure.splitters.recursive_splitter import RecursiveCharacterSplitter


def test_short_text_is_a_single_chunk() -> None:
    splitter = RecursiveCharacterSplitter(chunk_size=100, chunk_overlap=10)
    assert splitter.split_text("  Hello world.  ") == ["Hello world."]


def test_long_text_respects_chunk_size() -> None:
    splitter = RecursiveCharacterSplitter(chunk_size=50, chunk_overlap=10)
    text = " ".join(f"Sentence number {i} is here." for i in range(40))

    chunks = splitter.split_text(text)

    assert len(chunks) > 1
    assert all(len(chunk) <= 50 for chunk in chunks)


def test_chunks_overlap() -> None:
    splitter = RecursiveCharacterSplitter(chunk_size=40, chunk_overlap=15)
    text = " ".join(f"word{i}" for i in range(50))

    chunks = splitter.split_text(text)

    for previous, current in zip(chunks, chunks[1:], strict=False):
        tail_words = previous.split()[-1]
        assert tail_words in current


def test_unbroken_text_is_hard_split() -> None:
    splitter = RecursiveCharacterSplitter(chunk_size=10, chunk_overlap=0)
    assert splitter.split_text("x" * 25) == ["x" * 10, "x" * 10, "x" * 5]


def test_split_document_keeps_pages_and_global_indexes() -> None:
    splitter = RecursiveCharacterSplitter(chunk_size=30, chunk_overlap=0)
    document = Document(
        id="doc1",
        source="notes.pdf",
        pages=[
            Page(number=1, text="First page has some words in it. More words follow."),
            Page(number=2, text="Second page."),
        ],
    )

    chunks = splitter.split(document)

    assert [c.chunk_index for c in chunks] == list(range(len(chunks)))
    assert chunks[-1].page == 2
    assert chunks[-1].text == "Second page."
    assert {c.page for c in chunks[:-1]} == {1}
    assert all(c.document_id == "doc1" and c.source == "notes.pdf" for c in chunks)


@pytest.mark.parametrize(("size", "overlap"), [(0, 0), (10, 10), (10, -1)])
def test_invalid_configuration_is_rejected(size: int, overlap: int) -> None:
    with pytest.raises(ValueError):
        RecursiveCharacterSplitter(chunk_size=size, chunk_overlap=overlap)
