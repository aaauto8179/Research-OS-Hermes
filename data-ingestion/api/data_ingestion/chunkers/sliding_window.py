"""Sliding window chunker for document text."""
from dataclasses import dataclass
from typing import Any


@dataclass
class Chunk:
    text: str
    start_idx: int
    end_idx: int
    metadata: dict[str, Any] = None


class SlidingWindowChunker:
    """Splits text into overlapping chunks for embedding."""

    def __init__(self, chunk_size: int = 512, overlap: int = 50):
        if chunk_size <= 0:
            raise ValueError(f"chunk_size must be positive, got {chunk_size}")
        if overlap < 0:
            raise ValueError(f"overlap must be non-negative, got {overlap}")
        self.chunk_size = chunk_size
        self.overlap = min(overlap, max(0, chunk_size - 1))

    def chunk(self, text: str, metadata: dict[str, Any] = None) -> list[Chunk]:
        if not text or not text.strip():
            return []
        words = text.split()
        if not words:
            return []
        chunks = []
        start = 0
        step = max(1, self.chunk_size - self.overlap)
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
            start += step
        return chunks


__all__ = ["Chunk", "SlidingWindowChunker"]
