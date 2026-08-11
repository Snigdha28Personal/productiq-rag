from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    filename: str
    document_type: str
    upload_date: str
    page_number: Optional[int] = None
    chunk_index: int
    text: str
    source: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentMetadata(BaseModel):
    document_id: str
    filename: str
    document_type: str
    upload_date: str
    file_size_bytes: int
    processing_status: str  # "indexed", "processing", "error"
    chunk_count: int
    error_message: Optional[str] = None

class ParsedPage(BaseModel):
    page_number: Optional[int] = None
    text: str
