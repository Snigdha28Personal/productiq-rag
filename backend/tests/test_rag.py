import pytest
from backend.rag.grounding import evaluate_grounding, INSUFFICIENT_EVIDENCE_MESSAGE
from backend.rag.citations import build_citations
from backend.rag.pipeline import RAGPipeline

def test_grounding_evaluator_insufficient():
    has_evidence, score, exp = evaluate_grounding(
        retrieved_chunks=[],
        query="What is Q4 revenue?",
        custom_threshold=0.35
    )
    assert not has_evidence
    assert score == 0.0

def test_grounding_evaluator_sufficient():
    chunks = [{"similarity_score": 0.85, "text": "Setup takes 45 mins", "filename": "doc.txt"}]
    has_evidence, score, exp = evaluate_grounding(
        retrieved_chunks=chunks,
        query="How long is setup?",
        custom_threshold=0.35
    )
    assert has_evidence
    assert score == 0.85

def test_citation_builder():
    chunks = [
        {
            "chunk_id": "c1",
            "document_id": "d1",
            "filename": "feedback.md",
            "page_number": 2,
            "text": "Unexpected billing charge occurred.",
            "similarity_score": 0.91,
            "source": "feedback.md (Page 2)"
        }
    ]
    citations = build_citations(chunks)
    assert len(citations) == 1
    assert citations[0].citation_id == 1
    assert citations[0].filename == "feedback.md"
    assert citations[0].page_number == 2
