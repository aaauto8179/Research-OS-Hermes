"""Vector store for document embeddings."""
from typing import List, Dict, Any, Optional
import hashlib
import json

class VectorStore:
    """In-memory vector store (pgvector in production)."""
    
    def __init__(self, dimension: int = 1024):
        self.dimension = dimension
        self.vectors: List[Dict[str, Any]] = []
    
    def add(self, text: str, embedding: List[float], metadata: Dict[str, Any] = None):
        self.vectors.append({
            "id": hashlib.sha256(text.encode()).hexdigest()[:16],
            "text": text,
            "embedding": embedding,
            "metadata": metadata or {},
        })
    
    def search(self, query_embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        # Cosine similarity (simplified)
        results = []
        for v in self.vectors:
            sim = sum(a * b for a, b in zip(query_embedding, v["embedding"])) / (
                (sum(a**2 for a in query_embedding) ** 0.5) * (sum(b**2 for b in v["embedding"]) ** 0.5) + 1e-8
            )
            results.append({"text": v["text"], "similarity": sim, "metadata": v["metadata"]})
        results.sort(key=lambda x: x["similarity"], reverse=True)
        return results[:top_k]
    
    def count(self) -> int:
        return len(self.vectors)

__all__ = ["VectorStore"]