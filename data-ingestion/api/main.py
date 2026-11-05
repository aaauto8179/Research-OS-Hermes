"""
Vercel Python entry point for Data Ingestion Service.
Handles multi-modal document extraction, classification, statements persistence, and citations.
"""
import contextlib
import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from fastapi import FastAPI, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from data_ingestion.chunkers import SlidingWindowChunker
from data_ingestion.classifiers import DocumentClassifier
from data_ingestion.extractors import (
    ExcelCSVExtractor,
    ImageExtractor,
    LinkExtractor,
    PDFExtractor,
    UnstructuredExtractor,
)
from data_ingestion.models import (
    StatementStore,
)
from data_ingestion.rag import CitationEngine

app = FastAPI(title="Research OS Data Ingestion", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from api.workstation_router import router as workstation_router
except ImportError:
    from workstation_router import router as workstation_router

app.include_router(workstation_router)

# Seed realistic fixtures if available
def seed_default_fixtures():
    store = StatementStore.get_instance()
    possible_fixture_dirs = [
        os.path.join(os.path.dirname(__file__), "..", "fixtures"),
        os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures"),
        os.path.abspath("data-ingestion/fixtures"),
        os.path.abspath("fixtures"),
    ]
    fixture_dir = None
    for d in possible_fixture_dirs:
        if os.path.exists(d):
            fixture_dir = d
            break

    if fixture_dir:
        excel_path = os.path.join(fixture_dir, "reliance_screener.xlsx")
        concall_path = os.path.join(fixture_dir, "concall_transcript.txt")
        if os.path.exists(excel_path):
            try:
                extractor = ExcelCSVExtractor()
                doc = extractor.extract(excel_path, company_symbol="RELIANCE")
                store.save_document(doc)
            except Exception:
                pass
        if os.path.exists(concall_path):
            try:
                u_extractor = UnstructuredExtractor()
                u_doc = u_extractor.extract_from_file(concall_path, company_symbol="RELIANCE")
                store.save_document(u_doc)
            except Exception:
                pass

seed_default_fixtures()


# Request DTOs
class LinkIngestDTO(BaseModel):
    url: str
    symbol: str
    title: str | None = None
    doc_type: str | None = "EXCHANGE_ANNOUNCEMENT"

class TextIngestDTO(BaseModel):
    text: str
    symbol: str
    title: str | None = "Transcript / Notes"
    doc_type: str | None = "CONCALL_TRANSCRIPT"

class FilePathIngestDTO(BaseModel):
    file_path: str
    symbol: str
    doc_type: str | None = None


# -------------------------------------------------------------
# Existing Base Endpoints (Maintained for Backwards Compatibility)
# -------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "data-ingestion"}


@app.post("/extract")
async def extract(request: Request):
    data = await request.json()
    _ = data.get('document', {})
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
    _ = data.get('document', {})

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
    engine = CitationEngine()
    result = engine.answer(query, top_k=top_k)
    return JSONResponse(content=result)


@app.post("/embed")
async def embed(request: Request):
    data = await request.json()
    texts = data.get('texts', [])
    import random
    embeddings = [[random.random() for _ in range(1024)] for _ in texts]
    return JSONResponse(content={"embeddings": embeddings, "dimension": 1024})


# -------------------------------------------------------------
# Milestone 2: Multi-Modal Ingestion Endpoints
# -------------------------------------------------------------

@app.post("/ingest/upload")
async def ingest_upload(
    file: UploadFile = File(...),
    symbol: str = Form(...),
    doc_type: str | None = Form(None)
):
    """
    Unified multi-modal ingestion endpoint accepting multipart/form-data.
    Auto-detects file type by extension and delegates to appropriate extractor.
    """
    if not symbol or not symbol.strip():
        raise HTTPException(status_code=400, detail="Company symbol is required")

    symbol = symbol.strip().upper()
    orig_name = file.filename or "unknown_file"
    ext = os.path.splitext(orig_name)[1].lower()

    # Save uploaded file to temp directory
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        store = StatementStore.get_instance()
        try:
            if ext in (".xlsx", ".xls", ".xlsm", ".csv"):
                extractor = ExcelCSVExtractor()
                doc = extractor.extract(tmp_path, company_symbol=symbol)
                if doc_type:
                    doc.doc_type = doc_type
                doc.file_name = orig_name
            elif ext == ".pdf":
                extractor = PDFExtractor()
                doc = extractor.extract(tmp_path, company_symbol=symbol, doc_type=doc_type or "ANNUAL_REPORT")
                doc.file_name = orig_name
            elif ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp"):
                extractor = ImageExtractor()
                doc = extractor.extract(tmp_path, company_symbol=symbol, doc_type=doc_type or "IMAGE_SCAN")
                doc.file_name = orig_name
            elif ext in (".html", ".htm"):
                extractor = LinkExtractor()
                doc = extractor.extract_from_file(tmp_path, company_symbol=symbol, doc_type=doc_type or "EXCHANGE_ANNOUNCEMENT")
                doc.file_name = orig_name
            elif ext in (".txt", ".md", ".json"):
                extractor = UnstructuredExtractor()
                doc = extractor.extract_from_file(tmp_path, company_symbol=symbol, doc_type=doc_type or "CONCALL_TRANSCRIPT")
                doc.file_name = orig_name
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}") from e

        store.save_document(doc)
        return {
            "status": "success",
            "document_id": doc.document_id,
            "doc_type": doc.doc_type,
            "company_symbol": symbol,
            "file_name": orig_name,
            "chunks_created": len(doc.chunks),
            "statements_created": len(doc.line_items),
            "message": "Document processed and indexed successfully"
        }
    finally:
        if os.path.exists(tmp_path):
            with contextlib.suppress(Exception):
                os.remove(tmp_path)


@app.post("/ingest/excel")
async def ingest_excel(
    file: UploadFile | None = File(None),
    symbol: str | None = Form(None),
    payload: FilePathIngestDTO | None = None
):
    """Dedicated Excel & CSV ingestion endpoint (supports multipart or JSON payload)."""
    store = StatementStore.get_instance()
    extractor = ExcelCSVExtractor()

    if file:
        sym = (symbol or "UNKNOWN").strip().upper()
        ext = os.path.splitext(file.filename or "")[1].lower() or ".xlsx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        try:
            doc = extractor.extract(tmp_path, company_symbol=sym)
            doc.file_name = file.filename
            store.save_document(doc)
            return {
                "status": "success",
                "document_id": doc.document_id,
                "chunks_created": len(doc.chunks),
                "statements_created": len(doc.line_items)
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    elif payload:
        if not os.path.exists(payload.file_path):
            raise HTTPException(status_code=404, detail="File path not found")
        doc = extractor.extract(payload.file_path, company_symbol=payload.symbol.upper())
        store.save_document(doc)
        return {
            "status": "success",
            "document_id": doc.document_id,
            "chunks_created": len(doc.chunks),
            "statements_created": len(doc.line_items)
        }
    else:
        raise HTTPException(status_code=400, detail="Must provide either file or file_path payload")


@app.post("/ingest/pdf")
async def ingest_pdf(
    file: UploadFile | None = File(None),
    symbol: str | None = Form(None),
    doc_type: str | None = Form("ANNUAL_REPORT"),
    payload: FilePathIngestDTO | None = None
):
    """Dedicated PDF ingestion endpoint."""
    store = StatementStore.get_instance()
    extractor = PDFExtractor()

    if file:
        sym = (symbol or "UNKNOWN").strip().upper()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        try:
            doc = extractor.extract(tmp_path, company_symbol=sym, doc_type=doc_type or "ANNUAL_REPORT")
            doc.file_name = file.filename
            store.save_document(doc)
            return {
                "status": "success",
                "document_id": doc.document_id,
                "chunks_created": len(doc.chunks),
                "pages": doc.page_count
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    elif payload:
        if not os.path.exists(payload.file_path):
            raise HTTPException(status_code=404, detail="File path not found")
        doc = extractor.extract(payload.file_path, company_symbol=payload.symbol.upper(), doc_type=payload.doc_type or "ANNUAL_REPORT")
        store.save_document(doc)
        return {
            "status": "success",
            "document_id": doc.document_id,
            "chunks_created": len(doc.chunks),
            "pages": doc.page_count
        }
    else:
        raise HTTPException(status_code=400, detail="Must provide either file or file_path payload")


@app.post("/ingest/image")
async def ingest_image(
    file: UploadFile | None = File(None),
    symbol: str | None = Form(None),
    payload: FilePathIngestDTO | None = None
):
    """Dedicated Image / Scan ingestion endpoint."""
    store = StatementStore.get_instance()
    extractor = ImageExtractor()

    if file:
        sym = (symbol or "UNKNOWN").strip().upper()
        ext = os.path.splitext(file.filename or "")[1].lower() or ".png"
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        try:
            doc = extractor.extract(tmp_path, company_symbol=sym)
            doc.file_name = file.filename
            store.save_document(doc)
            return {
                "status": "success",
                "document_id": doc.document_id,
                "chunks_created": len(doc.chunks)
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
    elif payload:
        if not os.path.exists(payload.file_path):
            raise HTTPException(status_code=404, detail="File path not found")
        doc = extractor.extract(payload.file_path, company_symbol=payload.symbol.upper())
        store.save_document(doc)
        return {
            "status": "success",
            "document_id": doc.document_id,
            "chunks_created": len(doc.chunks)
        }
    else:
        raise HTTPException(status_code=400, detail="Must provide either file or file_path payload")


@app.post("/ingest/link")
async def ingest_link(payload: LinkIngestDTO):
    """Dedicated URL link fetch and HTML ingestion endpoint."""
    store = StatementStore.get_instance()
    extractor = LinkExtractor()
    sym = payload.symbol.strip().upper()

    if payload.url.startswith("http://") or payload.url.startswith("https://"):
        doc = await extractor.extract_from_url(payload.url, company_symbol=sym, doc_type=payload.doc_type or "EXCHANGE_ANNOUNCEMENT")
    elif os.path.exists(payload.url):
        doc = extractor.extract_from_file(payload.url, company_symbol=sym, doc_type=payload.doc_type or "EXCHANGE_ANNOUNCEMENT")
    else:
        # Treat url string as direct HTML payload
        doc = extractor.parse_html(payload.url, source_url="direct_html", company_symbol=sym, doc_type=payload.doc_type or "EXCHANGE_ANNOUNCEMENT")

    if payload.title:
        doc.title = payload.title
    store.save_document(doc)
    return {
        "status": "success",
        "document_id": doc.document_id,
        "title": doc.title,
        "chunks_created": len(doc.chunks)
    }


@app.post("/ingest/text")
async def ingest_text(payload: TextIngestDTO):
    """Dedicated unstructured text and concall transcript ingestion endpoint."""
    store = StatementStore.get_instance()
    extractor = UnstructuredExtractor()
    sym = payload.symbol.strip().upper()
    doc = extractor.extract_text(
        text_content=payload.text,
        company_symbol=sym,
        title=payload.title or "Qualitative Transcript / Commentary",
        doc_type=payload.doc_type or "CONCALL_TRANSCRIPT"
    )
    store.save_document(doc)
    return {
        "status": "success",
        "document_id": doc.document_id,
        "chunks_created": len(doc.chunks),
        "speakers_detected": doc.meta.get("speakers_detected", [])
    }


# -------------------------------------------------------------
# Statement Viewer & Citation Drawer API Endpoints
# -------------------------------------------------------------

@app.get("/statements/{symbol}")
async def get_statements(
    symbol: str,
    statement_type: str = Query("PL", description="Statement type: PL, BS, or CF")
):
    """
    Returns multi-year historical statements grouped by line items
    with direct citation chunk references for the interactive frontend grid.
    """
    store = StatementStore.get_instance()
    grid = store.get_statement_grid(symbol=symbol.upper(), statement_type=statement_type.upper())
    return grid.model_dump()


@app.get("/statements/{symbol}/citations/{chunk_id}")
async def get_citation_detail(symbol: str, chunk_id: str):
    """
    Returns the citation snippet, visual bounding box, and document context
    for the frontend source-of-truth drawer.
    """
    store = StatementStore.get_instance()
    citation = store.get_citation(symbol=symbol.upper(), chunk_id=chunk_id)
    if not citation:
        raise HTTPException(
            status_code=404,
            detail=f"Citation chunk '{chunk_id}' for company '{symbol}' was not found"
        )
    return citation.model_dump()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
