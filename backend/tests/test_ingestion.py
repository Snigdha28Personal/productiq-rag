import pytest
from backend.ingestion.parsers import parse_txt, parse_markdown, parse_document, DocumentParsingError
from backend.ingestion.chunker import process_and_chunk_document
from backend.ingestion.models import ParsedPage

def test_parse_txt_valid():
    text_content = b"Sarah: Configuring initial workspace settings took over 45 minutes."
    pages = parse_txt(text_content)
    assert len(pages) == 1
    assert "Configuring initial workspace" in pages[0].text

def test_parse_empty_document():
    with pytest.raises(DocumentParsingError):
        parse_txt(b"")

def test_chunking_sliding_window():
    parsed_pages = [ParsedPage(page_number=1, text="Word " * 200)]
    chunks = process_and_chunk_document(
        document_id="doc_test",
        filename="test.txt",
        document_type="TXT",
        upload_date="2026-01-01",
        parsed_pages=parsed_pages,
        chunk_size=100,
        chunk_overlap=20
    )
    assert len(chunks) > 1
    assert chunks[0].chunk_id.startswith("doc_test_c0_")
    assert chunks[0].page_number == 1
    assert chunks[0].filename == "test.txt"
