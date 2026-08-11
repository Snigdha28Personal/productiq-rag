import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.config import settings
from backend.ingestion.parsers import parse_document, DocumentParsingError
from backend.ingestion.chunker import process_and_chunk_document
from backend.ingestion.models import DocumentMetadata
from backend.vectorstore.chroma_store import ChromaStore
from backend.rag.retriever import ResearchRetriever
from backend.rag.pipeline import RAGPipeline
from backend.insights.extractor import extract_corpus_insights
from backend.analytics.events import analytics_logger

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Evidence-backed RAG Copilot for Product Research & Customer Insights"
)

# Configure CORS for Next.js frontend (Supports both HTTP and HTTPS origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State / Stores
vector_store = ChromaStore()
documents_registry: Dict[str, DocumentMetadata] = {}

class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = None
    similarity_threshold: Optional[float] = None

class EventLogRequest(BaseModel):
    event_type: str
    details: Optional[Dict[str, Any]] = None

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": "Turn customer research into product decisions.",
        "embedding_mode": settings.active_embedding_mode,
        "docs_count": len(documents_registry),
        "vector_chunks": vector_store.count()
    }

@app.get("/api/status")
def get_system_status():
    return {
        "embedding_mode": settings.active_embedding_mode,
        "is_openai_available": settings.is_openai_available,
        "active_model": settings.OPENAI_MODEL if settings.is_openai_available else "Deterministic TF-IDF Local Vector Model",
        "embedding_model": settings.EMBEDDING_MODEL if settings.is_openai_available else "Local 128D Cosine Vectorizer",
        "active_similarity_threshold": settings.active_threshold,
        "top_k_default": settings.TOP_K,
        "chunk_size": settings.CHUNK_SIZE,
        "chunk_overlap": settings.CHUNK_OVERLAP,
        "indexed_documents_count": len(documents_registry),
        "total_chunks_count": vector_store.count()
    }

@app.get("/api/documents")
def list_documents():
    return list(documents_registry.values())

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename or "file.txt"
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt", "md", "markdown"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format .{ext}. Supported formats: PDF, DOCX, TXT, MD."
        )

    content = await file.read()
    file_size = len(content)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if file_size > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds maximum allowed size of 15MB.")

    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    upload_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

    try:
        parsed_pages = parse_document(filename, content)
        chunks = process_and_chunk_document(
            document_id=doc_id,
            filename=filename,
            document_type=ext.upper(),
            upload_date=upload_date,
            parsed_pages=parsed_pages
        )

        vector_store.add_documents(chunks)

        doc_meta = DocumentMetadata(
            document_id=doc_id,
            filename=filename,
            document_type=ext.upper(),
            upload_date=upload_date,
            file_size_bytes=file_size,
            processing_status="indexed",
            chunk_count=len(chunks)
        )
        documents_registry[doc_id] = doc_meta
        analytics_logger.log_event("document_uploaded", {"filename": filename, "chunks": len(chunks)})
        analytics_logger.log_event("document_processed", {"filename": filename, "doc_id": doc_id})

        return {
            "message": "Document processed and indexed successfully.",
            "document": doc_meta
        }
    except DocumentParsingError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal ingestion error: {str(e)}")

@app.post("/api/demo/load")
def load_demo_research():
    demo_files = [
        "customer_interviews.pdf",
        "support_tickets.md",
        "user_survey.txt",
        "product_feedback.docx",
        "enterprise_interviews.md"
    ]

    indexed_summary = []
    
    for filename in demo_files:
        file_path = settings.SAMPLE_DATA_DIR / filename
        if not file_path.exists():
            continue

        with open(file_path, "rb") as f:
            content = f.read()

        ext = filename.split(".")[-1].lower()
        doc_id = f"demo_{filename.replace('.', '_')}"
        upload_date = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

        try:
            parsed_pages = parse_document(filename, content)
            chunks = process_and_chunk_document(
                document_id=doc_id,
                filename=filename,
                document_type=ext.upper(),
                upload_date=upload_date,
                parsed_pages=parsed_pages
            )
            vector_store.add_documents(chunks)

            doc_meta = DocumentMetadata(
                document_id=doc_id,
                filename=filename,
                document_type=ext.upper(),
                upload_date=upload_date,
                file_size_bytes=len(content),
                processing_status="indexed",
                chunk_count=len(chunks)
            )
            documents_registry[doc_id] = doc_meta
            indexed_summary.append(doc_meta)
        except Exception as e:
            print(f"Error loading demo file {filename}: {e}")

    analytics_logger.log_event("demo_data_loaded", {"total_documents": len(indexed_summary)})

    return {
        "message": f"Successfully loaded {len(indexed_summary)} synthetic demo research documents into ChromaDB.",
        "documents": indexed_summary,
        "total_chunks_indexed": vector_store.count()
    }

@app.post("/api/query")
def execute_rag_query(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    analytics_logger.log_event("question_asked", {"query": req.query})

    retriever = ResearchRetriever(vector_store=vector_store)
    pipeline = RAGPipeline(retriever=retriever)
    result = pipeline.run(
        query=req.query,
        top_k=req.top_k,
        custom_threshold=req.similarity_threshold
    )

    analytics_logger.log_event("answer_generated", {
        "query": req.query,
        "is_insufficient_evidence": result.is_insufficient_evidence,
        "citations_count": len(result.citations),
        "highest_similarity_score": result.debug_info.get("highest_similarity_score") if result.debug_info else 0.0
    })

    return result

@app.get("/api/insights")
def get_insights():
    analytics_logger.log_event("insight_viewed")
    return extract_corpus_insights(vector_store)

@app.get("/api/analytics")
def get_analytics():
    return analytics_logger.get_summary()

@app.post("/api/analytics/event")
def log_event(req: EventLogRequest):
    analytics_logger.log_event(req.event_type, req.details)
    return {"status": "logged"}

@app.delete("/api/documents/{document_id}")
def delete_document(document_id: str):
    if document_id in documents_registry:
        del documents_registry[document_id]
    vector_store.delete_document(document_id)
    return {"message": f"Document {document_id} removed successfully."}

@app.delete("/api/clear")
def clear_all():
    documents_registry.clear()
    vector_store.clear()
    return {"message": "All documents and vector indexes cleared."}
