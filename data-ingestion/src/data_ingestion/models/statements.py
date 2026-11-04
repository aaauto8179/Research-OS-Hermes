"""Statement, chunk, and document data models for data-ingestion pipeline."""
from typing import Any

from pydantic import BaseModel, Field


class ExtractedChunk(BaseModel):
    chunk_id: str
    document_id: str
    chunk_index: int
    chunk_type: str = "TEXT"  # TEXT, TABLE, STATEMENT_ROW, IMAGE, CONCALL_TURN, NOTE_TO_ACCOUNTS
    content: str
    page_number: int | None = None
    bbox: dict[str, Any] | None = None  # {"x0": float, "top": float, "x1": float, "bottom": float}
    sheet_name: str | None = None
    cell_range: str | None = None
    meta: dict[str, Any] = Field(default_factory=dict)

class ParsedLineItem(BaseModel):
    id: str | None = None
    statement_id: str | None = None
    company_symbol: str
    statement_type: str  # PL, BS, CF
    period_type: str = "ANNUAL"  # ANNUAL, QUARTERLY, TTM
    fiscal_year: int
    fiscal_quarter: str = "FY"  # Q1, Q2, Q3, Q4, FY
    period_end_date: str  # YYYY-MM-DD
    line_item_code: str
    line_item_name: str
    category: str
    value: float  # Normalized value in INR Crores
    unit: str = "INR_CRORES"
    is_consolidated: bool = True
    sheet_name: str | None = None
    cell_range: str | None = None
    citation_chunk_id: str | None = None
    citation_meta: dict[str, Any] = Field(default_factory=dict)

class ExtractedDocument(BaseModel):
    document_id: str
    company_symbol: str
    doc_type: str
    title: str
    file_name: str | None = None
    file_hash: str | None = None
    source: str = "MANUAL_UPLOAD"
    source_url: str | None = None
    page_count: int = 1
    chunks: list[ExtractedChunk] = Field(default_factory=list)
    line_items: list[ParsedLineItem] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)

class StatementGridResponse(BaseModel):
    company_symbol: str
    statement_type: str
    periods: list[str]  # Ordered sorted list of period_end_dates e.g. ["2015-03-31", ...]
    fiscal_years: list[int]
    rows: list[dict[str, Any]]  # [{line_item_code, line_item_name, category, values: { "2024-03-31": 901064.0 }, citations: {...}}]

class CitationDetailResponse(BaseModel):
    chunk_id: str
    document_id: str
    document_title: str
    doc_type: str
    chunk_type: str
    page_number: int | None = None
    bbox: dict[str, Any] | None = None
    sheet_name: str | None = None
    cell_range: str | None = None
    content: str
    meta: dict[str, Any] = Field(default_factory=dict)
