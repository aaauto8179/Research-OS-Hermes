"""PDF layout-aware extractor using pdfplumber."""
import hashlib
import os
import uuid
from typing import Any

import pdfplumber

from ..chunkers.sliding_window import SlidingWindowChunker
from ..models.statements import ExtractedChunk, ExtractedDocument, ParsedLineItem


class PDFExtractor:
    """Extracts text, structured tables, and bounding boxes from PDF files."""

    def __init__(self, chunk_size: int = 400, overlap: int = 40):
        self.chunker = SlidingWindowChunker(chunk_size=chunk_size, overlap=overlap)

    def extract(
        self,
        file_path: str,
        company_symbol: str = "UNKNOWN",
        doc_type: str = "ANNUAL_REPORT",
        max_pages: int | None = None,
    ) -> ExtractedDocument:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_name = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        doc_id = str(uuid.uuid4())
        chunks: list[ExtractedChunk] = []
        line_items: list[ParsedLineItem] = []
        chunk_idx = 0

        with pdfplumber.open(file_path) as pdf:
            total_pages = len(pdf.pages)
            pages_to_process = pdf.pages[:max_pages] if max_pages else pdf.pages

            for page in pages_to_process:
                page_num = page.page_number
                p_width = float(page.width)
                p_height = float(page.height)

                # 1. Extract tables with visual bounding boxes
                tables = page.find_tables()
                table_bboxes = []
                for t in tables:
                    table_bbox = {
                        "x0": round(float(t.bbox[0]), 2),
                        "top": round(float(t.bbox[1]), 2),
                        "x1": round(float(t.bbox[2]), 2),
                        "bottom": round(float(t.bbox[3]), 2),
                        "page": page_num,
                        "page_width": p_width,
                        "page_height": p_height
                    }
                    table_bboxes.append(t.bbox)
                    table_data = t.extract()
                    if not table_data or len(table_data) < 2:
                        continue

                    # Serialize table as Markdown text
                    md_rows = []
                    header = [str(c or "").strip() for c in table_data[0]]
                    md_rows.append("| " + " | ".join(header) + " |")
                    md_rows.append("| " + " | ".join(["---"] * len(header)) + " |")
                    for row in table_data[1:]:
                        clean_row = [str(c or "").strip() for c in row]
                        md_rows.append("| " + " | ".join(clean_row) + " |")

                    table_text = "\n".join(md_rows)
                    chunk_id = str(uuid.uuid4())
                    t_chunk = ExtractedChunk(
                        chunk_id=chunk_id,
                        document_id=doc_id,
                        chunk_index=chunk_idx,
                        chunk_type="TABLE",
                        content=table_text,
                        page_number=page_num,
                        bbox=table_bbox,
                        meta={
                            "row_count": len(table_data),
                            "col_count": len(header),
                            "headers": header
                        }
                    )
                    chunks.append(t_chunk)
                    chunk_idx += 1

                # 2. Extract structured page text
                raw_text = page.extract_text() or ""
                if raw_text.strip():
                    page_chunks = self.chunker.chunk(
                        raw_text,
                        metadata={"page_number": page_num}
                    )
                    for pc in page_chunks:
                        chunk_id = str(uuid.uuid4())
                        # Estimate approximate bounding box across text band
                        est_bbox = {
                            "x0": 36.0,
                            "top": 36.0,
                            "x1": round(p_width - 36.0, 2),
                            "bottom": round(p_height - 36.0, 2),
                            "page": page_num,
                            "page_width": p_width,
                            "page_height": p_height
                        }
                        chunks.append(ExtractedChunk(
                            chunk_id=chunk_id,
                            document_id=doc_id,
                            chunk_index=chunk_idx,
                            chunk_type="TEXT",
                            content=pc.text,
                            page_number=page_num,
                            bbox=est_bbox,
                            meta={"words": len(pc.text.split())}
                        ))
                        chunk_idx += 1

        return ExtractedDocument(
            document_id=doc_id,
            company_symbol=company_symbol,
            doc_type=doc_type,
            title=f"{doc_type.replace('_', ' ').title()} - {company_symbol} ({file_name})",
            file_name=file_name,
            file_hash=file_hash,
            source="MANUAL_UPLOAD",
            page_count=total_pages,
            chunks=chunks,
            line_items=line_items,
            meta={"processed_pages": len(pages_to_process), "total_pages": total_pages}
        )

    # Backwards-compatible convenience methods
    def extract_tables(self, file_path: str) -> list[dict[str, Any]]:
        extracted = self.extract(file_path)
        tables = []
        for c in extracted.chunks:
            if c.chunk_type == "TABLE":
                tables.append({
                    "page": c.page_number,
                    "content": c.content,
                    "bbox": c.bbox,
                    "meta": c.meta
                })
        return tables

    def extract_text_by_page(self, file_path: str) -> list[dict[str, Any]]:
        extracted = self.extract(file_path)
        pages_dict: dict[int, list[str]] = {}
        for c in extracted.chunks:
            if c.page_number:
                pages_dict.setdefault(c.page_number, []).append(c.content)
        return [{"page": p, "text": "\n".join(texts)} for p, texts in sorted(pages_dict.items())]

__all__ = ["PDFExtractor"]
