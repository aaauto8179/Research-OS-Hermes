"""Sliding window chunker for document text."""
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class Chunk:
    text: str
    start_idx: int
    end_idx: int
    metadata: Dict[str, Any] = None

class SlidingWindowChunker:
    """Splits text into overlapping chunks for embedding."""
    
    def __init__(self, chunk_size: int = 512, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Chunk]:
        words = text.split()
        chunks = []
        start = 0
        while start < len(words):
            end = min(start + self.chunk_size, len(words))
            chunk_text = " ".join(words[start:end])
            chunks.append(Chunk(
                text=chunk_text,
                start_idx=start,
                end_idx=end,
                metadata=metadata or {},
            ))
            if end >= len(words):
                break
            start = end - self.overlap
        return chunks

__all__ = ["Chunk", "SlidingWindowChunker"]