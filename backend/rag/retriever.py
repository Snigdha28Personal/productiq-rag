from typing import List, Dict, Any, Optional
from backend.vectorstore.chroma_store import ChromaStore
from backend.config import settings

class ResearchRetriever:
    def __init__(self, vector_store: Optional[ChromaStore] = None):
        self.store = vector_store or ChromaStore()

    def retrieve(
        self, 
        query: str, 
        top_k: Optional[int] = None, 
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        k = top_k if top_k is not None else settings.TOP_K
        results = self.store.search(query=query, top_k=k, filter_metadata=filter_metadata)
        return results
