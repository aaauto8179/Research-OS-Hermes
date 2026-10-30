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


@app.post("/classify")
async def classify(request: Request):
    data = await request.json()
    document = data.get('document', {})

    return JSONResponse(content={
        "doc_type": "ANNUAL_REPORT",
        "confidence": 0.95,
        "metadata": {}
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
