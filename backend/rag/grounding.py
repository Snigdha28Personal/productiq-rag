from typing import List, Dict, Any, Tuple
from backend.config import settings

INSUFFICIENT_EVIDENCE_MESSAGE = "I couldn't find enough evidence in your uploaded research to answer this confidently."

def evaluate_grounding(
    retrieved_chunks: List[Dict[str, Any]],
    query: str,
    custom_threshold: float = None
) -> Tuple[bool, float, str]:
    """
    Evaluates whether retrieved vector chunks provide sufficient grounded evidence 
    to answer the user's question without hallucination.

    Returns:
      (has_sufficient_evidence, highest_score, explanation)
    """
    if not retrieved_chunks:
        return False, 0.0, "No relevant document chunks found in research vector store."

    threshold = custom_threshold if custom_threshold is not None else settings.active_threshold
    highest_score = max(c.get("similarity_score", 0.0) for c in retrieved_chunks)

    if highest_score < threshold:
        return (
            False,
            highest_score,
            f"Highest relevance score ({highest_score:.2f}) is below active similarity threshold ({threshold:.2f})."
        )

    return True, highest_score, "Sufficient evidence found."
