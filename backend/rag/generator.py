import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.config import settings
from backend.rag.citations import Citation, build_citations

class StructuredRAGAnswer(BaseModel):
    key_finding: str
    evidence: List[str]
    interpretation: str
    citations: List[Citation]
    is_insufficient_evidence: bool = False
    debug_info: Optional[Dict[str, Any]] = None

SYSTEM_PROMPT = """You are ProductIQ, an expert AI Product Research Copilot for Product Managers.
Your role is to analyze customer research and provide clear, evidence-backed answers grounded STRICTLY in the provided context documents.

CRITICAL GROUNDING RULES:
1. Answer ONLY using information explicitly provided in the Context Chunks below.
2. DO NOT use outside knowledge, invent facts, or make ungrounded claims.
3. Use inline bracket citations like [1], [2] whenever referencing statements supported by Context Chunk [1] or [2].
4. Structure your response into:
   - Key Finding: A concise 1-2 sentence core insight.
   - Evidence: Bullet points summarizing exact quotes/facts from research with inline citation tags [1], [2].
   - Interpretation: What this means for PM decision-making (distinguish evidence from interpretation).
5. If the provided context does not contain sufficient evidence to answer the question, state:
   "I couldn't find enough evidence in your uploaded research to answer this confidently."
"""

def generate_openai_rag_response(
    query: str, 
    retrieved_chunks: List[Dict[str, Any]], 
    citations: List[Citation]
) -> StructuredRAGAnswer:
    import openai
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    context_str = ""
    for c in citations:
        context_str += f"\n--- CONTEXT CHUNK [{c.citation_id}] ({c.filename}, Page {c.page_number or 1}) ---\n{c.text}\n"

    user_prompt = f"User Question: {query}\n\nContext Chunks:\n{context_str}\n\nPlease generate a grounded, structured answer with inline citations [1], [2] referencing the context chunks above."

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )
        raw_text = response.choices[0].message.content or ""
        return parse_raw_llm_response(raw_text, citations)
    except Exception as e:
        return generate_local_rag_response(query, retrieved_chunks, citations)

def generate_local_rag_response(
    query: str, 
    retrieved_chunks: List[Dict[str, Any]], 
    citations: List[Citation]
) -> StructuredRAGAnswer:
    """
    Deterministic Local RAG response generator for keyless demo mode.
    Extracts grounded passages directly from top matching chunks with inline citations.
    """
    if not citations:
        return StructuredRAGAnswer(
            key_finding="I couldn't find enough evidence in your uploaded research to answer this confidently.",
            evidence=[],
            interpretation="Insufficient research data uploaded to address this topic.",
            citations=[],
            is_insufficient_evidence=True
        )

    evidence_bullets = []
    for c in citations:
        snippet = c.text.strip()
        evidence_bullets.append(f"{snippet} [{c.citation_id}]")

    top_chunk = citations[0]
    key_finding = f"Based on customer research from {top_chunk.filename}, relevant evidence shows: {top_chunk.text[:220]}... [{top_chunk.citation_id}]"
    
    interpretation = f"The evidence across {len(citations)} retrieved source passage(s) highlights actionable friction points. Product Managers should prioritize validating these findings with affected customer segments."

    return StructuredRAGAnswer(
        key_finding=key_finding,
        evidence=evidence_bullets,
        interpretation=interpretation,
        citations=citations,
        is_insufficient_evidence=False
    )

def parse_raw_llm_response(raw_text: str, citations: List[Citation]) -> StructuredRAGAnswer:
    lines = raw_text.split('\n')
    key_finding = ""
    evidence = []
    interpretation = ""
    current_section = None

    for line in lines:
        l_lower = line.lower().strip()
        if "key finding" in l_lower:
            current_section = "key_finding"
            continue
        elif "evidence" in l_lower and not key_finding:
            current_section = "evidence"
            continue
        elif "interpretation" in l_lower:
            current_section = "interpretation"
            continue

        if current_section == "key_finding" and line.strip():
            key_finding += line.strip() + " "
        elif current_section == "evidence" and line.strip():
            if line.strip().startswith(('-', '*', '•')):
                evidence.append(line.strip().lstrip('-*• ').strip())
            elif evidence:
                evidence[-1] += " " + line.strip()
            else:
                evidence.append(line.strip())
        elif current_section == "interpretation" and line.strip():
            interpretation += line.strip() + " "

    if not key_finding:
        key_finding = raw_text.split('\n\n')[0] if '\n\n' in raw_text else raw_text[:200]
    if not interpretation:
        interpretation = "Grounded evidence synthesized from retrieved research passages."

    return StructuredRAGAnswer(
        key_finding=key_finding.strip(),
        evidence=evidence if evidence else ["Retrieved evidence cited in sources below."],
        interpretation=interpretation.strip(),
        citations=citations,
        is_insufficient_evidence=False
    )

def generate_rag_answer(
    query: str,
    retrieved_chunks: List[Dict[str, Any]]
) -> StructuredRAGAnswer:
    citations = build_citations(retrieved_chunks)
    if settings.is_openai_available:
        return generate_openai_rag_response(query, retrieved_chunks, citations)
    return generate_local_rag_response(query, retrieved_chunks, citations)
