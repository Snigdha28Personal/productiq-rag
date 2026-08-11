import hashlib
import re
from typing import List
from backend.ingestion.models import ParsedPage, DocumentChunk
from backend.config import settings

def estimate_tokens(text: str) -> int:
    """Rough estimation: ~4 chars per token in English text."""
    return max(1, len(text) // 4)

def chunk_text_by_words(
    text: str,
    chunk_size_tokens: int = 600,
    chunk_overlap_tokens: int = 80
) -> List[str]:
    """
    Sliding window chunking based on word boundaries.
    ~1 word = 1.3 tokens.
    """
    words = text.split()
    if not words:
        return []
        
    target_words = int(chunk_size_tokens * 0.75)
    overlap_words = int(chunk_overlap_tokens * 0.75)
    
    if len(words) <= target_words:
        return [text]
        
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + target_words, len(words))
        chunk_words = words[start:end]
        chunks.append(" ".join(chunk_words))
        
        if end >= len(words):
            break
        start += (target_words - overlap_words)
        
    return chunks

def generate_chunk_id(doc_id: str, index: int, content: str) -> str:
    """Generates a stable deterministic chunk ID."""
    content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()[:8]
    return f"{doc_id}_c{index}_{content_hash}"

def process_and_chunk_document(
    document_id: str,
    filename: str,
    document_type: str,
    upload_date: str,
    parsed_pages: List[ParsedPage],
    chunk_size: int = None,
    chunk_overlap: int = None
) -> List[DocumentChunk]:
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE
    if chunk_overlap is None:
        chunk_overlap = settings.CHUNK_OVERLAP

    chunks: List[DocumentChunk] = []
    global_chunk_index = 0

    for page in parsed_pages:
        page_chunks = chunk_text_by_words(
            page.text,
            chunk_size_tokens=chunk_size,
            chunk_overlap_tokens=chunk_overlap
        )
        
        for c_text in page_chunks:
            if not c_text.strip():
                continue
            
            chunk_id = generate_chunk_id(document_id, global_chunk_index, c_text)
            source_label = f"{filename}" + (f" (Page {page.page_number})" if page.page_number else "")
            
            doc_chunk = DocumentChunk(
                chunk_id=chunk_id,
                document_id=document_id,
                filename=filename,
                document_type=document_type,
                upload_date=upload_date,
                page_number=page.page_number,
                chunk_index=global_chunk_index,
                text=c_text,
                source=source_label,
                metadata={
                    "document_id": document_id,
                    "filename": filename,
                    "document_type": document_type,
                    "upload_date": upload_date,
                    "page_number": page.page_number or 1,
                    "chunk_index": global_chunk_index,
                    "source": source_label,
                    "chunk_id": chunk_id
                }
            )
            chunks.append(doc_chunk)
            global_chunk_index += 1

    return chunks
