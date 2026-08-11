from abc import ABC, abstractmethod
from typing import List
import math
from backend.config import settings

STOP_WORDS = {"what", "is", "our", "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by", "who", "where", "how", "why", "are", "do", "does"}

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        pass

    @property
    @abstractmethod
    def mode_name(self) -> str:
        pass

class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str = None, model: str = None):
        import openai
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.EMBEDDING_MODEL
        self.client = openai.OpenAI(api_key=self.api_key)

    @property
    def mode_name(self) -> str:
        return "OpenAI"

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        response = self.client.embeddings.create(
            input=texts,
            model=self.model
        )
        return [item.embedding for item in response.data]

    def embed_query(self, text: str) -> List[float]:
        response = self.client.embeddings.create(
            input=[text],
            model=self.model
        )
        return response.data[0].embedding

class LocalEmbeddingProvider(BaseEmbeddingProvider):
    """
    Deterministic Local Embedding Provider using stop-word filtered character/word n-gram 
    hashing to generate L2-normalized dense 128-dimensional vectors using pure Python math.
    Enables fully functional local demo mode without requiring paid API keys.
    """
    def __init__(self, dim: int = 128):
        self.dim = dim

    @property
    def mode_name(self) -> str:
        return "Local Demo"

    def _text_to_vector(self, text: str) -> List[float]:
        words = [w.lower().strip() for w in text.split() if w.lower().strip() not in STOP_WORDS]
        if not words:
            words = text.lower().split()

        vec = [0.0] * self.dim
        for w in words:
            h = sum(ord(c) * (i + 1) for i, c in enumerate(w))
            idx = h % self.dim
            val = 1.0 + (len(w) % 3) * 0.5
            vec[idx] += val
            
        filtered_text = " ".join(words)
        for i in range(len(filtered_text) - 1):
            bigram = filtered_text[i:i+2].lower()
            idx = (ord(bigram[0]) * 31 + ord(bigram[1])) % self.dim
            vec[idx] += 0.3

        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 1e-6:
            vec = [v / norm for v in vec]
        return vec

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self._text_to_vector(t) for t in texts]

    def embed_query(self, text: str) -> List[float]:
        return self._text_to_vector(text)

def get_embedding_provider() -> BaseEmbeddingProvider:
    if settings.is_openai_available:
        try:
            return OpenAIEmbeddingProvider()
        except Exception:
            return LocalEmbeddingProvider()
    return LocalEmbeddingProvider()
