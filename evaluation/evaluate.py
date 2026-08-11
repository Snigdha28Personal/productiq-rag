import sys
import json
import os
from pathlib import Path
from typing import List, Dict, Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.config import settings
from backend.ingestion.parsers import parse_document
from backend.ingestion.chunker import process_and_chunk_document
from backend.vectorstore.chroma_store import ChromaStore
from backend.rag.pipeline import RAGPipeline

def run_rag_evaluation():
    print("==================================================")
    print("     PRODUCTIQ RAG BENCHMARK EVALUATION           ")
    print("==================================================")
    print(f"Embedding Mode: {settings.active_embedding_mode}")
    print(f"Active Threshold: {settings.active_threshold}")
    print(f"Top K Retrieval: {settings.TOP_K}")
    print("--------------------------------------------------")

    store = ChromaStore()
    store.clear()
    
    sample_files = [
        "customer_interviews.pdf",
        "support_tickets.md",
        "user_survey.txt",
        "product_feedback.docx",
        "enterprise_interviews.md"
    ]
    
    total_chunks = 0
    for fname in sample_files:
        fpath = settings.SAMPLE_DATA_DIR / fname
        if not fpath.exists():
            continue
        with open(fpath, "rb") as f:
            content = f.read()
        ext = fname.split(".")[-1].lower()
        parsed_pages = parse_document(fname, content)
        chunks = process_and_chunk_document(
            document_id=f"eval_{fname.replace('.', '_')}",
            filename=fname,
            document_type=ext.upper(),
            upload_date="2026-01-01",
            parsed_pages=parsed_pages
        )
        store.add_documents(chunks)
        total_chunks += len(chunks)

    print(f"Indexed {len(sample_files)} sample documents ({total_chunks} total chunks).")
    print("--------------------------------------------------")

    test_json_path = Path(__file__).resolve().parent / "test_questions.json"
    with open(test_json_path, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    from backend.rag.retriever import ResearchRetriever
    retriever = ResearchRetriever(vector_store=store)
    pipeline = RAGPipeline(retriever=retriever)

    total_queries = len(test_cases)
    retrieval_recalls = []
    citation_accuracies = []
    grounded_correct_count = 0
    detailed_results = []

    for item in test_cases:
        qid = item["id"]
        qtext = item["question"]
        expected_sources = set(item.get("expected_sources", []))
        should_be_insufficient = item.get("should_be_insufficient", False)

        response = pipeline.run(query=qtext, custom_threshold=settings.active_threshold)

        retrieved_sources = set()
        if response.debug_info and "retrieved_chunks" in response.debug_info:
            for rc in response.debug_info["retrieved_chunks"]:
                if rc.get("filename"):
                    retrieved_sources.add(rc.get("filename"))

        if expected_sources:
            overlap = expected_sources.intersection(retrieved_sources)
            recall = len(overlap) / float(len(expected_sources))
        else:
            recall = 1.0 if not retrieved_sources or response.is_insufficient_evidence else 0.0
        retrieval_recalls.append(recall)

        cited_sources = set(c.filename for c in response.citations)
        if expected_sources and cited_sources:
            cit_accuracy = len(expected_sources.intersection(cited_sources)) / float(len(cited_sources))
        elif should_be_insufficient and response.is_insufficient_evidence:
            cit_accuracy = 1.0
        else:
            cit_accuracy = 1.0 if not expected_sources else 0.0
        citation_accuracies.append(cit_accuracy)

        if should_be_insufficient:
            is_grounded_correct = response.is_insufficient_evidence
        else:
            ans_text = (response.key_finding + " " + " ".join(response.evidence) + " " + response.interpretation).lower()
            keywords = [k.lower() for k in item.get("expected_answer_keywords", [])]
            match_count = sum(1 for kw in keywords if kw in ans_text)
            is_grounded_correct = (not response.is_insufficient_evidence) and (match_count >= min(1, len(keywords)))

        if is_grounded_correct:
            grounded_correct_count += 1

        print(f"[{qid}] '{qtext[:40]}...' -> Recall: {recall*100:.0f}%, Grounded: {is_grounded_correct}")

        detailed_results.append({
            "id": qid,
            "question": qtext,
            "should_be_insufficient": should_be_insufficient,
            "expected_sources": list(expected_sources),
            "retrieved_sources": list(retrieved_sources),
            "cited_sources": list(cited_sources),
            "recall": round(recall, 2),
            "citation_accuracy": round(cit_accuracy, 2),
            "grounded_correct": is_grounded_correct,
            "is_insufficient_evidence_response": response.is_insufficient_evidence
        })

    avg_recall = round(sum(retrieval_recalls) / float(total_queries) * 100, 1)
    avg_cit_acc = round(sum(citation_accuracies) / float(total_queries) * 100, 1)
    grounded_rate = round((grounded_correct_count / float(total_queries)) * 100, 1)

    print("--------------------------------------------------")
    print("EVALUATION RESULTS SUMMARY:")
    print(f"Total Benchmark Questions: {total_queries}")
    print(f"Retrieval Recall@K:        {avg_recall}%")
    print(f"Citation Accuracy:         {avg_cit_acc}%")
    print(f"Grounded Answer Rate:      {grounded_rate}%")
    print("--------------------------------------------------")

    report_data = {
        "embedding_mode": settings.active_embedding_mode,
        "total_questions": total_queries,
        "retrieval_recall_pct": avg_recall,
        "citation_accuracy_pct": avg_cit_acc,
        "grounded_answer_rate_pct": grounded_rate,
        "detailed_results": detailed_results
    }

    report_path = Path(__file__).resolve().parent / "evaluation_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)

    print(f"Full evaluation report saved to: {report_path}")
    print("==================================================")

if __name__ == "__main__":
    run_rag_evaluation()
