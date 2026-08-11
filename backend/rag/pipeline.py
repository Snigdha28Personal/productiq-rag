from typing import Dict, Any, Optional
from backend.rag.retriever import ResearchRetriever
from backend.rag.grounding import evaluate_grounding, INSUFFICIENT_EVIDENCE_MESSAGE
from backend.rag.generator import generate_rag_answer, StructuredRAGAnswer
from backend.rag.citations import build_citations
from backend.config import settings

class RAGPipeline:
    def __init__(self, retriever: Optional[ResearchRetriever] = None):
        self.retriever = retriever or ResearchRetriever()

    def run(
        self, 
        query: str, 
        top_k: Optional[int] = None, 
        custom_threshold: Optional[float] = None
    ) -> StructuredRAGAnswer:
        k = top_k if top_k is not None else settings.TOP_K
        threshold = custom_threshold if custom_threshold is not None else settings.active_threshold

        # Step 1: Semantic Vector Retrieval
        retrieved_chunks = self.retriever.retrieve(query=query, top_k=k)

        # Step 2: Grounding Evaluation
        has_evidence, highest_score, explanation = evaluate_grounding(
            retrieved_chunks=retrieved_chunks,
            query=query,
            custom_threshold=threshold
        )

        debug_info = {
            "query": query,
            "embedding_mode": settings.active_embedding_mode,
            "top_k": k,
            "similarity_threshold": threshold,
            "chunks_retrieved": len(retrieved_chunks),
            "highest_similarity_score": round(highest_score, 4),
            "has_sufficient_evidence": has_evidence,
            "grounding_explanation": explanation,
            "retrieved_chunks": [
                {
                    "chunk_id": c.get("chunk_id"),
                    "filename": c.get("filename"),
                    "page_number": c.get("page_number"),
                    "similarity_score": c.get("similarity_score"),
                    "snippet": c.get("text", "")[:100] + "..."
                }
                for c in retrieved_chunks
            ]
        }

        # Step 3: Handle Insufficient Evidence
        if not has_evidence:
            citations = build_citations(retrieved_chunks) if retrieved_chunks else []
            return StructuredRAGAnswer(
                key_finding=INSUFFICIENT_EVIDENCE_MESSAGE,
                evidence=[],
                interpretation=f"ProductIQ grounding rule enforced: {explanation}",
                citations=citations,
                is_insufficient_evidence=True,
                debug_info=debug_info
            )

        # Step 4: Grounded Answer Generation
        answer = generate_rag_answer(query=query, retrieved_chunks=retrieved_chunks)
        answer.debug_info = debug_info
        return answer
