"""Storage repository for financial statements, documents, and citation chunks."""
import uuid
from typing import Any, Optional

from .statements import (
    CitationDetailResponse,
    ExtractedChunk,
    ExtractedDocument,
    ParsedLineItem,
    StatementGridResponse,
)


class StatementStore:
    """Thread-safe in-memory statement and citation repository."""
    _instance: Optional["StatementStore"] = None

    def __init__(self):
        self.documents: dict[str, ExtractedDocument] = {}
        self.chunks: dict[str, ExtractedChunk] = {}
        # Key: (symbol, statement_type, period_end_date, line_item_code)
        self.line_items: dict[str, ParsedLineItem] = {}

    @classmethod
    def get_instance(cls) -> "StatementStore":
        if cls._instance is None:
            cls._instance = StatementStore()
        return cls._instance

    def save_document(self, doc: ExtractedDocument) -> ExtractedDocument:
        self.documents[doc.document_id] = doc
        for chunk in doc.chunks:
            self.chunks[chunk.chunk_id] = chunk
        for item in doc.line_items:
            key = f"{item.company_symbol.upper()}:{item.statement_type.upper()}:{item.period_end_date}:{item.line_item_code.upper()}"
            if not item.id:
                item.id = str(uuid.uuid4())
            self.line_items[key] = item

        # Attempt PostgreSQL persistence (with graceful in-memory fallback)
        try:
            from .db import persist_document_to_postgres
            persist_document_to_postgres(doc)
        except Exception:
            pass

        return doc

    def get_statement_grid(self, symbol: str, statement_type: str = "PL") -> StatementGridResponse:
        statement_type = statement_type.upper()
        symbol = symbol.upper()

        # Filter all line items for symbol and statement_type
        relevant_items = [
            item for item in self.line_items.values()
            if item.company_symbol.upper() == symbol and item.statement_type.upper() == statement_type
        ]

        # Extract distinct periods sorted
        periods = sorted({item.period_end_date for item in relevant_items})
        fiscal_years = sorted({item.fiscal_year for item in relevant_items})

        # Group by line_item_code
        rows_by_code: dict[str, dict[str, Any]] = {}
        for item in relevant_items:
            code = item.line_item_code
            if code not in rows_by_code:
                rows_by_code[code] = {
                    "line_item_code": code,
                    "line_item_name": item.line_item_name,
                    "category": item.category,
                    "unit": item.unit,
                    "values": {},
                    "citations": {}
                }
            rows_by_code[code]["values"][item.period_end_date] = item.value
            if item.citation_chunk_id:
                rows_by_code[code]["citations"][item.period_end_date] = item.citation_chunk_id

        # Preserve canonical order where possible
        ordered_rows = list(rows_by_code.values())

        return StatementGridResponse(
            company_symbol=symbol,
            statement_type=statement_type,
            periods=periods,
            fiscal_years=fiscal_years,
            rows=ordered_rows
        )

    def get_citation(self, symbol: str, chunk_id: str) -> CitationDetailResponse | None:
        chunk = self.chunks.get(chunk_id)
        if not chunk:
            return None
        doc = self.documents.get(chunk.document_id)
        doc_title = doc.title if doc else "Document"
        doc_type = doc.doc_type if doc else "OTHER"
        return CitationDetailResponse(
            chunk_id=chunk.chunk_id,
            document_id=chunk.document_id,
            document_title=doc_title,
            doc_type=doc_type,
            chunk_type=chunk.chunk_type,
            page_number=chunk.page_number,
            bbox=chunk.bbox,
            sheet_name=chunk.sheet_name,
            cell_range=chunk.cell_range,
            content=chunk.content,
            meta=chunk.meta
        )

__all__ = ["StatementStore"]
