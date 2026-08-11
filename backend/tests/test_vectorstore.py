import pytest
from backend.vectorstore.chroma_store import ChromaStore
from backend.ingestion.models import DocumentChunk

def test_chroma_store_operations():
    store = ChromaStore(collection_name="test_collection")
    store.clear()
    assert store.count() == 0

    chunk1 = DocumentChunk(
        chunk_id="chunk_1",
        document_id="doc_1",
        filename="interviews.pdf",
        document_type="PDF",
        upload_date="2026-01-01",
        page_number=1,
        chunk_index=0,
        text="Onboarding configuration took over 45 minutes for team setup.",
        source="interviews.pdf (Page 1)",
        metadata={"filename": "interviews.pdf", "document_id": "doc_1", "source": "interviews.pdf (Page 1)"}
    )

    added = store.add_documents([chunk1])
    assert added == 1
    assert store.count() >= 1

    results = store.search(query="onboarding configuration setup time", top_k=1)
    assert len(results) == 1
    assert results[0]["filename"] == "interviews.pdf"
    assert results[0]["similarity_score"] > 0.0

    store.delete_document("doc_1")
    store.clear()
