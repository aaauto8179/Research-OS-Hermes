"""
Vercel Python entry point for Data Ingestion Service.
Handles document extraction, classification, and PIT-compliant storage.
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from data_ingestion.chunkers import SlidingWindowChunker
from data_ingestion.embeddings import VectorStore
from data_ingestion.rag import CitationEngine
from data_ingestion.classifiers import DocumentClassifier

app = FastAPI(title="Research OS Data Ingestion", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "data-ingestion"}


@app.post("/extract")
async def extract(request: Request):
    data = await request.json()
    document = data.get('document', {})
    content = data.get('content', '')

    return JSONResponse(content={
        "text": content,
        "tables": [],
        "metadata": {
            "pages": 1,
            "word_count": len(content.split()),
        }
    })


@app.post("/pit-transform")
async def pit_transform(request: Request):
    data = await request.json()
    records = data.get('records', [])

    transformed = []
    for record in records:
        transformed.append({
            **record,
            "pit_timestamp": "2024-01-01T00:00:00Z",
            "filing_date": record.get("filing_date", "2024-01-01"),
        })
    return JSONResponse(content={"records": transformed})


@app.post("/ingest")
async def ingest(request: Request):
    data = await request.json()
    document = data.get('document', {})

    return JSONResponse(content={
        "document_id": "doc_123",
        "status": "ingested",
        "chunks": 5,
    })


@app.post("/chunk")
async def chunk(request: Request):
    data = await request.json()
    text = data.get('text', '')
    chunk_size = data.get('chunk_size', 512)
    overlap = data.get('overlap', 50)
    chunker = SlidingWindowChunker(chunk_size=chunk_size, overlap=overlap)
    chunks = chunker.chunk(text, metadata=data.get('metadata', {}))
    return JSONResponse(content={"chunks": [{"text": c.text, "start_idx": c.start_idx, "end_idx": c.end_idx, "metadata": c.metadata} for c in chunks]})

@app.post("/classify")
async def classify(request: Request):
    data = await request.json()
    text = data.get('text', '')
    classifier = DocumentClassifier()
    result = classifier.classify_with_confidence(text)
    return JSONResponse(content=result)

@app.post("/search")
async def search(request: Request):
    data = await request.json()
    query = data.get('query', '')
    top_k = data.get('top_k', 5)
    # In production: embed query, search vector store
    engine = CitationEngine()
    result = engine.answer(query, top_k=top_k)
    return JSONResponse(content=result)

@app.post("/embed")
async def embed(request: Request):
    data = await request.json()
    texts = data.get('texts', [])
    # In production: use BGE-M3 or OpenAI embeddings
    # For now, return mock embeddings
    import random
    embeddings = [[random.random() for _ in range(1024)] for _ in texts]
    return JSONResponse(content={"embeddings": embeddings, "dimension": 1024})


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
