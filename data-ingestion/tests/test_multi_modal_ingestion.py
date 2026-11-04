"""
Comprehensive automated tests for Multi-Modal Ingestion Pipeline (Milestone 2).
Tests cover:
- Algorithmic bug fix for SlidingWindowChunker (overlap >= chunk_size)
- Excel & CSV parsing with Screener.in and BSE format normalization
- Real PDF extraction on docs/samples/ files
- Image/Scan preprocessing and table detection
- Link & HTML exchange announcement parsing
- Unstructured text and concall speaker diarization
- FastAPI endpoints (/ingest/upload, /statements/{symbol}, citations)
"""
import os

import pytest
from fastapi.testclient import TestClient

from api.main import app
from data_ingestion.chunkers import SlidingWindowChunker
from data_ingestion.extractors import (
    ExcelCSVExtractor,
    ImageExtractor,
    LinkExtractor,
    PDFExtractor,
    UnstructuredExtractor,
)
from data_ingestion.models import canonicalize_line_item

client = TestClient(app)

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")
DOCS_SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs", "samples"))


# ---------------------------------------------------------------------
# 1. Chunker Bug Fix & Robustness Tests
# ---------------------------------------------------------------------

def test_sliding_window_overlap_greater_than_or_equal_to_chunk_size():
    """Verify no infinite loop when overlap >= chunk_size."""
    text = "The quick brown fox jumps over the lazy dog repeatedly across multiple sentences in financial documents."
    # Case 1: overlap equals chunk_size
    chunker = SlidingWindowChunker(chunk_size=5, overlap=5)
    chunks = chunker.chunk(text)
    assert len(chunks) > 0
    assert chunks[0].text == "The quick brown fox jumps"

    # Case 2: overlap strictly exceeds chunk_size
    chunker_over = SlidingWindowChunker(chunk_size=4, overlap=10)
    chunks_over = chunker_over.chunk(text)
    assert len(chunks_over) > 0

    # Case 3: Empty or whitespace input
    assert chunker.chunk("") == []
    assert chunker.chunk("   ") == []


def test_sliding_window_invalid_params():
    """Verify validation on negative/zero parameters."""
    with pytest.raises(ValueError):
        SlidingWindowChunker(chunk_size=0, overlap=0)
    with pytest.raises(ValueError):
        SlidingWindowChunker(chunk_size=10, overlap=-1)


# ---------------------------------------------------------------------
# 2. Canonical Line Item Taxonomy Tests
# ---------------------------------------------------------------------

def test_canonicalize_line_item_mappings():
    """Verify canonical mapping of Indian accounting terminology."""
    code, name, stype, cat = canonicalize_line_item("Revenue from Operations")
    assert code == "REV_OPERATIONS"
    assert stype == "PL"

    code, name, stype, cat = canonicalize_line_item("Sales")
    assert code == "REV_OPERATIONS"

    code, name, stype, cat = canonicalize_line_item("Operating Profit (EBITDA)")
    assert code == "EBITDA"

    code, name, stype, cat = canonicalize_line_item("Net Profit for the Period (PAT)")
    assert code == "PAT"

    code, name, stype, cat = canonicalize_line_item("Tangible Fixed Assets")
    assert code == "FIXED_ASSETS"
    assert stype == "BS"

    code, name, stype, cat = canonicalize_line_item("Cash from Operating Activity")
    assert code == "OPERATING_CASH_FLOW"
    assert stype == "CF"


# ---------------------------------------------------------------------
# 3. Excel & CSV Ingestion Tests
# ---------------------------------------------------------------------

def test_screener_excel_extraction():
    """Verify Screener.in multi-year Excel export extraction."""
    excel_path = os.path.join(FIXTURES_DIR, "reliance_screener.xlsx")
    assert os.path.exists(excel_path), f"Fixture not found: {excel_path}"

    extractor = ExcelCSVExtractor()
    doc = extractor.extract(excel_path, company_symbol="RELIANCE")

    assert doc.company_symbol == "RELIANCE"
    assert doc.doc_type == "SCREENER_EXCEL"
    assert len(doc.chunks) > 0
    assert len(doc.line_items) > 0

    # Check P&L line items
    pl_rev = [item for item in doc.line_items if item.line_item_code == "REV_OPERATIONS"]
    assert len(pl_rev) >= 10
    # Mar 2024 Revenue should be 901064 Cr
    fy24_rev = next((item for item in pl_rev if item.period_end_date == "2024-03-31"), None)
    assert fy24_rev is not None
    assert fy24_rev.value == 901064.0
    assert fy24_rev.unit == "INR_CRORES"
    assert fy24_rev.sheet_name == "Data Sheet"
    assert fy24_rev.cell_range is not None
    assert fy24_rev.citation_chunk_id is not None

    # Check Balance sheet
    bs_assets = [item for item in doc.line_items if item.line_item_code == "TOTAL_ASSETS"]
    assert len(bs_assets) >= 10
    fy24_assets = next((item for item in bs_assets if item.period_end_date == "2024-03-31"), None)
    assert fy24_assets is not None
    assert fy24_assets.value == 1708404.0

    # Check Cash Flow
    cf_cfo = [item for item in doc.line_items if item.line_item_code == "OPERATING_CASH_FLOW"]
    assert len(cf_cfo) >= 10


def test_screener_csv_extraction():
    """Verify standard multi-year CSV statement parsing."""
    csv_path = os.path.join(FIXTURES_DIR, "reliance_pl.csv")
    assert os.path.exists(csv_path)

    extractor = ExcelCSVExtractor()
    doc = extractor.extract(csv_path, company_symbol="RELIANCE")

    assert len(doc.line_items) > 0
    pat_items = [item for item in doc.line_items if item.line_item_code == "PAT"]
    assert len(pat_items) >= 10
    fy24_pat = next((item for item in pat_items if item.period_end_date == "2024-03-31"), None)
    assert fy24_pat is not None
    assert fy24_pat.value == 69621.0


def test_bse_results_csv_unit_conversion():
    """Verify BSE financial results parsing and Lakhs to Crores normalization."""
    bse_path = os.path.join(FIXTURES_DIR, "bse_results.csv")
    assert os.path.exists(bse_path)

    extractor = ExcelCSVExtractor()
    doc = extractor.extract(bse_path, company_symbol="RELIANCE")

    assert doc.doc_type == "BSE_CSV"
    rev_item = next((item for item in doc.line_items if item.line_item_code == "REV_OPERATIONS"), None)
    assert rev_item is not None
    # 24,071,500.00 Lakhs / 100 = 240,715.00 Crores
    assert rev_item.value == 240715.0
    assert rev_item.period_end_date == "2024-03-31"


# ---------------------------------------------------------------------
# 4. Real PDF Extraction Tests
# ---------------------------------------------------------------------

def test_real_pdf_extraction_hdfc_bank_concall():
    """Verify real PDF extraction on HDFC Bank Q4 FY24 Concall Transcript."""
    pdf_path = os.path.join(DOCS_SAMPLES_DIR, "HDFC_Bank_Concall_Q4_FY24.pdf")
    if not os.path.exists(pdf_path):
        pytest.skip("docs/samples PDF not available in test environment")

    extractor = PDFExtractor(chunk_size=300, overlap=30)
    doc = extractor.extract(pdf_path, company_symbol="HDFCBANK", doc_type="CONCALL_TRANSCRIPT", max_pages=3)

    assert doc.page_count == 20
    assert len(doc.chunks) > 0
    # Verify chunks have bounding boxes and page numbers
    first_chunk = doc.chunks[0]
    assert first_chunk.page_number is not None
    assert first_chunk.bbox is not None
    assert "top" in first_chunk.bbox
    assert "bottom" in first_chunk.bbox


def test_real_pdf_table_extraction_hdfc_bank_presentation():
    """Verify table extraction with bounding coordinates on HDFC Bank Presentation."""
    pdf_path = os.path.join(DOCS_SAMPLES_DIR, "HDFC_Bank_Presentation_Q4_FY24.pdf")
    if not os.path.exists(pdf_path):
        pytest.skip("docs/samples PDF not available in test environment")

    extractor = PDFExtractor()
    doc = extractor.extract(pdf_path, company_symbol="HDFCBANK", doc_type="INVESTOR_PRESENTATION", max_pages=5)

    assert len(doc.chunks) > 0
    table_chunks = [c for c in doc.chunks if c.chunk_type == "TABLE"]
    assert len(table_chunks) > 0
    t = table_chunks[0]
    assert t.bbox is not None
    assert t.bbox["x0"] >= 0
    assert "|" in t.content  # Markdown table format


def test_real_pdf_extraction_ril_annual_report_fast():
    """Verify large 159-page Reliance Annual Report extracts first pages cleanly."""
    pdf_path = os.path.join(DOCS_SAMPLES_DIR, "RIL_Annual_Report_2023-24.pdf")
    if not os.path.exists(pdf_path):
        pytest.skip("docs/samples PDF not available in test environment")

    extractor = PDFExtractor()
    doc = extractor.extract(pdf_path, company_symbol="RELIANCE", doc_type="ANNUAL_REPORT", max_pages=2)

    assert doc.page_count == 159
    assert len(doc.chunks) > 0


# ---------------------------------------------------------------------
# 5. Image & Scan Extraction Tests
# ---------------------------------------------------------------------

def test_image_extraction_preprocessing_and_regions():
    """Verify PIL image preprocessing and visual table region bounding boxes."""
    img_path = os.path.join(FIXTURES_DIR, "sample_balance_sheet.png")
    assert os.path.exists(img_path)

    extractor = ImageExtractor()
    doc = extractor.extract(img_path, company_symbol="RELIANCE")

    assert doc.doc_type == "IMAGE_SCAN"
    assert len(doc.chunks) >= 3
    # Check region bounding boxes
    table_chunk = next((c for c in doc.chunks if c.chunk_type == "TABLE"), None)
    assert table_chunk is not None
    assert table_chunk.bbox is not None
    assert table_chunk.bbox["top"] > 0
    assert table_chunk.bbox["bottom"] > table_chunk.bbox["top"]


# ---------------------------------------------------------------------
# 6. Link & Announcement HTML Extraction Tests
# ---------------------------------------------------------------------

def test_link_html_extraction():
    """Verify HTML corporate announcement parsing and table extraction."""
    html_path = os.path.join(FIXTURES_DIR, "bse_announcement.html")
    assert os.path.exists(html_path)

    extractor = LinkExtractor()
    doc = extractor.extract_from_file(html_path, company_symbol="RELIANCE")

    assert len(doc.chunks) >= 2
    table_chunk = next((c for c in doc.chunks if c.chunk_type == "TABLE"), None)
    assert table_chunk is not None
    assert "Company Symbol" in table_chunk.content

    text_chunk = next((c for c in doc.chunks if c.chunk_type == "TEXT"), None)
    assert text_chunk is not None
    assert "INR 69,621 Crores" in text_chunk.content


# ---------------------------------------------------------------------
# 7. Unstructured Text & Speaker Diarization Tests
# ---------------------------------------------------------------------

def test_unstructured_concall_speaker_diarization():
    """Verify speaker turn parsing, roles, and section segmentation in earnings call."""
    txt_path = os.path.join(FIXTURES_DIR, "concall_transcript.txt")
    assert os.path.exists(txt_path)

    extractor = UnstructuredExtractor()
    doc = extractor.extract_from_file(txt_path, company_symbol="RELIANCE")

    assert doc.doc_type == "CONCALL_TRANSCRIPT"
    assert len(doc.chunks) >= 4

    roles = [c.meta.get("role") for c in doc.chunks if "role" in c.meta]
    assert "OPERATOR" in roles
    assert "MANAGEMENT" in roles
    assert "ANALYST" in roles

    # Check specific speaker content
    cfo_turn = next((c for c in doc.chunks if c.meta.get("speaker") and "Srikanth" in c.meta["speaker"]), None)
    assert cfo_turn is not None
    assert "178,677 Crores" in cfo_turn.content


# ---------------------------------------------------------------------
# 8. FastAPI Ingestion & Statement Grid Endpoints Tests
# ---------------------------------------------------------------------

def test_api_multipart_upload_excel():
    """Verify POST /ingest/upload accepts multipart Excel and populates statements."""
    excel_path = os.path.join(FIXTURES_DIR, "reliance_screener.xlsx")
    with open(excel_path, "rb") as f:
        response = client.post(
            "/ingest/upload",
            files={"file": ("reliance_screener.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"symbol": "RELIANCE", "doc_type": "SCREENER_EXCEL"}
        )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["company_symbol"] == "RELIANCE"
    assert res_data["chunks_created"] > 0
    assert res_data["statements_created"] > 0


def test_api_multipart_upload_transcript():
    """Verify POST /ingest/upload accepts concall transcript text file."""
    txt_path = os.path.join(FIXTURES_DIR, "concall_transcript.txt")
    with open(txt_path, "rb") as f:
        response = client.post(
            "/ingest/upload",
            files={"file": ("concall_transcript.txt", f, "text/plain")},
            data={"symbol": "RELIANCE", "doc_type": "CONCALL_TRANSCRIPT"}
        )
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "success"
    assert res_data["chunks_created"] > 0


def test_api_get_statements_pl_and_citations():
    """Verify GET /statements/{symbol} and GET /statements/{symbol}/citations/{chunk_id}."""
    # First query P&L statements
    resp = client.get("/statements/RELIANCE?statement_type=PL")
    assert resp.status_code == 200
    grid = resp.json()
    assert grid["company_symbol"] == "RELIANCE"
    assert grid["statement_type"] == "PL"
    assert len(grid["periods"]) >= 10
    assert len(grid["rows"]) > 0

    rev_row = next((r for r in grid["rows"] if r["line_item_code"] == "REV_OPERATIONS"), None)
    assert rev_row is not None
    assert "2024-03-31" in rev_row["values"]
    assert rev_row["values"]["2024-03-31"] == 901064.0

    # Retrieve citation chunk
    citation_chunk_id = rev_row["citations"].get("2024-03-31")
    assert citation_chunk_id is not None

    cite_resp = client.get(f"/statements/RELIANCE/citations/{citation_chunk_id}")
    assert cite_resp.status_code == 200
    citation = cite_resp.json()
    assert citation["chunk_id"] == citation_chunk_id
    assert "Revenue from Operations" in citation["content"]
    assert citation["sheet_name"] is not None
    assert citation["cell_range"] is not None


def test_api_get_statements_bs_and_cf():
    """Verify GET /statements/{symbol} for Balance Sheet and Cash Flow."""
    bs_resp = client.get("/statements/RELIANCE?statement_type=BS")
    assert bs_resp.status_code == 200
    bs_grid = bs_resp.json()
    assert bs_grid["statement_type"] == "BS"
    assert len(bs_grid["rows"]) > 0

    cf_resp = client.get("/statements/RELIANCE?statement_type=CF")
    assert cf_resp.status_code == 200
    cf_grid = cf_resp.json()
    assert cf_grid["statement_type"] == "CF"
    assert len(cf_grid["rows"]) > 0


def test_api_citation_not_found():
    """Verify 404 on nonexistent citation chunk."""
    resp = client.get("/statements/RELIANCE/citations/nonexistent-chunk-id-12345")
    assert resp.status_code == 404
