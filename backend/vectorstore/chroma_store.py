import os
import json
import math
from typing import List, Dict, Any, Optional
from backend.config import settings
from backend.ingestion.models import DocumentChunk
from backend.vectorstore.embeddings import get_embedding_provider, BaseEmbeddingProvider

def cosine_similarity_pure_python(vec1: List[float], vec2: List[float]) -> float:
    """Pure Python cosine similarity calculation."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 > 1e-6 and norm2 > 1e-6:
        return dot / (norm1 * norm2)
    return 0.0

class ChromaStore:
    def __init__(self, collection_name: str = "productiq_research"):
        self.collection_name = collection_name
        self.embedding_provider: BaseEmbeddingProvider = get_embedding_provider()
        self._use_native_chroma = False
        self.client = None
        self.collection = None
        
        # In-memory / local vector store
        self._fallback_db: List[Dict[str, Any]] = []

        self._init_store()

    def _init_store(self):
        try:
            import chromadb
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self.client = chromadb.PersistentClient(
                path=str(settings.CHROMA_PERSIST_DIR)
            )
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            self._use_native_chroma = True
        except Exception:
            self._use_native_chroma = False

    def add_documents(self, chunks: List[DocumentChunk]) -> int:
        if not chunks:
            return 0

        texts = [c.text for c in chunks]
        doc_ids = [c.chunk_id for c in chunks]
        embeddings = self.embedding_provider.embed_documents(texts)
        metadatas = [c.metadata for c in chunks]

        if self._use_native_chroma:
            try:
                self.collection.upsert(
                    ids=doc_ids,
                    embeddings=embeddings,
                    documents=texts,
                    metadatas=metadatas
                )
            except Exception:
                self._use_native_chroma = False

        if not self._use_native_chroma:
            for i, chunk in enumerate(chunks):
                self._fallback_db = [c for c in self._fallback_db if c["chunk_id"] != chunk.chunk_id]
                self._fallback_db.append({
                    "chunk_id": chunk.chunk_id,
                    "document_id": chunk.document_id,
                    "filename": chunk.filename,
                    "document_type": chunk.document_type,
                    "upload_date": chunk.upload_date,
                    "page_number": chunk.page_number,
                    "text": chunk.text,
                    "source": chunk.source,
                    "metadata": chunk.metadata,
                    "embedding": embeddings[i]
                })

        return len(chunks)

    def search(
        self, 
        query: str, 
        top_k: int = None, 
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        if top_k is None:
            top_k = settings.TOP_K

        query_embedding = self.embedding_provider.embed_query(query)

        if self._use_native_chroma and self.count() > 0:
            try:
                where_clause = filter_metadata if filter_metadata else None
                results = self.collection.query(
                    query_embeddings=[query_embedding],
                    n_results=min(top_k, self.count()),
                    where=where_clause
                )
                
                matched_chunks = []
                if results and results.get("ids") and results["ids"][0]:
                    for i in range(len(results["ids"][0])):
                        chunk_id = results["ids"][0][i]
                        text = results["documents"][0][i]
                        metadata = results["metadatas"][0][i]
                        distance = results["distances"][0][i] if results.get("distances") else 0.0
                        similarity_score = max(0.0, 1.0 - float(distance))
                        
                        matched_chunks.append({
                            "chunk_id": chunk_id,
                            "document_id": metadata.get("document_id", ""),
                            "filename": metadata.get("filename", ""),
                            "document_type": metadata.get("document_type", ""),
                            "upload_date": metadata.get("upload_date", ""),
                            "page_number": metadata.get("page_number", 1),
                            "text": text,
                            "source": metadata.get("source", ""),
                            "metadata": metadata,
                            "similarity_score": round(similarity_score, 4)
                        })
                return matched_chunks
            except Exception:
                pass

        # Fallback pure-Python cosine distance search
        if not self._fallback_db:
            return []

        scored_items = []
        for item in self._fallback_db:
            if filter_metadata:
                match = all(item["metadata"].get(k) == v for k, v in filter_metadata.items())
                if not match:
                    continue
            
            similarity = cosine_similarity_pure_python(query_embedding, item["embedding"])

            scored_items.append({
                "chunk_id": item["chunk_id"],
                "document_id": item["document_id"],
                "filename": item["filename"],
                "document_type": item["document_type"],
                "upload_date": item["upload_date"],
                "page_number": item["page_number"],
                "text": item["text"],
                "source": item["source"],
                "metadata": item["metadata"],
                "similarity_score": round(max(0.0, float(similarity)), 4)
            })

        scored_items.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_items[:top_k]

    def delete_document(self, document_id: str) -> bool:
        if self._use_native_chroma:
            try:
                self.collection.delete(where={"document_id": document_id})
            except Exception:
                pass
        self._fallback_db = [c for c in self._fallback_db if c["document_id"] != document_id]
        return True

    def clear(self):
        if self._use_native_chroma:
            try:
                self.client.delete_collection(self.collection_name)
                self.collection = self.client.create_collection(
                    name=self.collection_name,
                    metadata={"hnsw:space": "cosine"}
                )
            except Exception:
                pass
        self._fallback_db = []

    def count(self) -> int:
        if self._use_native_chroma:
            try:
                return self.collection.count()
            except Exception:
                return len(self._fallback_db)
        return len(self._fallback_db)

    def get_all_chunks(self) -> List[Dict[str, Any]]:
        if self._use_native_chroma:
            try:
                data = self.collection.get()
                chunks = []
                if data and data.get("ids"):
                    for i in range(len(data["ids"])):
                        chunks.append({
                            "chunk_id": data["ids"][i],
                            "text": data["documents"][i],
                            "metadata": data["metadatas"][i]
                        })
                return chunks
            except Exception:
                pass
        return self._fallback_db
