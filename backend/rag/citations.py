from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Citation(BaseModel):
    citation_id: int
    document_id: str
    filename: str
    page_number: Optional[int] = None
    chunk_id: str
    text: str
    similarity_score: float
    source: str

def build_citations(chunks: List[Dict[str, Any]]) -> List[Citation]:
    citations = []
    for idx, c in enumerate(chunks, start=1):
        citations.append(
            Citation(
                citation_id=idx,
                document_id=c.get("document_id", ""),
                filename=c.get("filename", ""),
                page_number=c.get("page_number"),
                chunk_id=c.get("chunk_id", ""),
                text=c.get("text", ""),
                similarity_score=c.get("similarity_score", 0.0),
                source=c.get("source", c.get("filename", ""))
            )
        )
    return citations
