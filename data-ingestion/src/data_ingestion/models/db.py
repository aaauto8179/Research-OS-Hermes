"""PostgreSQL persistence helper for fundamental financial statements."""
import contextlib
import logging
import os
import uuid
from typing import Any

from .statements import ExtractedDocument, ParsedLineItem

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://research:research@localhost:5432/research_os")


def _to_uuid(val: Any) -> str:
    """Ensure value is a valid UUID string."""
    try:
        return str(uuid.UUID(str(val)))
    except (ValueError, AttributeError, TypeError):
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(val) if val else str(uuid.uuid4())))


_PG_AVAILABLE: bool | None = None
_LAST_CHECK_TIME: float = 0.0


def is_postgres_available() -> bool:
    global _PG_AVAILABLE, _LAST_CHECK_TIME
    import socket
    import time
    from urllib.parse import urlparse

    now = time.time()
    if _PG_AVAILABLE is False and (now - _LAST_CHECK_TIME) < 30.0:
        return False

    try:
        parsed = urlparse(DATABASE_URL)
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432
        with socket.create_connection((host, port), timeout=0.2):
            _PG_AVAILABLE = True
            _LAST_CHECK_TIME = now
            return True
    except (TimeoutError, OSError):
        _PG_AVAILABLE = False
        _LAST_CHECK_TIME = now
        return False


def persist_document_to_postgres(doc: ExtractedDocument) -> bool:
    """
    Persists an extracted document, its citation chunks, financial statements,
    and granular line items to PostgreSQL using INSERT ... ON CONFLICT upsert queries.

    Falls back gracefully with a warning if PostgreSQL is unreachable or offline.
    """
    if not is_postgres_available():
        return False

    try:
        import psycopg
    except ImportError:
        logger.warning("psycopg is not installed; PostgreSQL persistence disabled.")
        return False

    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            # 1. Upsert company record
            company_symbol = (doc.company_symbol or "UNKNOWN").upper()
            company_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"company:{company_symbol}"))
            cur.execute(
                """
                INSERT INTO companies (id, symbol, name)
                VALUES (%s, %s, %s)
                ON CONFLICT (symbol) DO NOTHING;
                """,
                (company_uuid, company_symbol, f"{company_symbol} Ltd")
            )

            # Retrieve company ID
            cur.execute("SELECT id FROM companies WHERE symbol = %s;", (company_symbol,))
            row = cur.fetchone()
            actual_company_id = row[0] if row else company_uuid

            # 2. Upsert document record
            doc_uuid = _to_uuid(doc.document_id)
            doc_hash = doc.file_hash or f"hash_{doc_uuid}"
            cur.execute(
                """
                INSERT INTO documents (id, company_id, doc_type, title, file_name, file_hash, source, page_count)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (file_hash) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
                RETURNING id;
                """,
                (
                    doc_uuid,
                    actual_company_id,
                    doc.doc_type or "OTHER",
                    doc.title or doc.file_name or "Document",
                    doc.file_name or "unknown",
                    doc_hash,
                    doc.source or "UPLOAD",
                    doc.page_count or 1
                )
            )
            ret_doc = cur.fetchone()
            actual_doc_id = ret_doc[0] if ret_doc else doc_uuid

            # 3. Upsert document chunks
            for chunk in doc.chunks:
                chunk_uuid = _to_uuid(chunk.chunk_id)
                cur.execute(
                    """
                    INSERT INTO document_chunks (
                        id, document_id, chunk_index, chunk_type, content,
                        page_number, sheet_name, cell_range
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
                    """,
                    (
                        chunk_uuid,
                        actual_doc_id,
                        chunk.chunk_index,
                        chunk.chunk_type,
                        chunk.content,
                        chunk.page_number,
                        chunk.sheet_name,
                        chunk.cell_range
                    )
                )

            # 4. Group line items by statement header:
            # (statement_type, period_type, fiscal_year, fiscal_quarter, is_consolidated, restatement_version)
            stmt_groups: dict[tuple, list[ParsedLineItem]] = {}
            for item in doc.line_items:
                stmt_type = item.statement_type.upper() if item.statement_type in ("PL", "BS", "CF") else "PL"
                period_type = item.period_type.upper() if item.period_type in ("ANNUAL", "QUARTERLY", "TTM") else "ANNUAL"
                fq = item.fiscal_quarter.upper() if item.fiscal_quarter in ("FY", "Q1", "Q2", "Q3", "Q4", "TTM") else "FY"
                key = (
                    stmt_type,
                    period_type,
                    item.fiscal_year,
                    fq,
                    True,  # is_consolidated
                    0      # restatement_version
                )
                stmt_groups.setdefault(key, []).append(item)

            for key, items in stmt_groups.items():
                stmt_type, period_type, fy, fq, is_cons, restatement_ver = key
                stmt_uuid = str(uuid.uuid5(
                    uuid.NAMESPACE_DNS,
                    f"stmt:{actual_company_id}:{stmt_type}:{period_type}:{fy}:{fq}:{is_cons}:{restatement_ver}"
                ))
                period_end = items[0].period_end_date or f"{fy}-03-31"

                cur.execute(
                    """
                    INSERT INTO financial_statements (
                        id, company_id, statement_type, period_type, fiscal_year, fiscal_quarter,
                        period_end_date, currency, unit, is_consolidated, restatement_version,
                        source_document_id
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s,
                        %s, 'INR', 'INR_CRORES', %s, %s,
                        %s
                    )
                    ON CONFLICT (company_id, statement_type, period_type, fiscal_year, fiscal_quarter, is_consolidated, restatement_version)
                    DO UPDATE SET period_end_date = EXCLUDED.period_end_date, updated_at = NOW()
                    RETURNING id;
                    """,
                    (
                        stmt_uuid,
                        actual_company_id,
                        stmt_type,
                        period_type,
                        fy,
                        fq,
                        period_end,
                        is_cons,
                        restatement_ver,
                        actual_doc_id
                    )
                )
                stmt_row = cur.fetchone()
                actual_stmt_id = stmt_row[0] if stmt_row else stmt_uuid

                # Upsert line items for this statement
                for item in items:
                    line_uuid = _to_uuid(item.id or uuid.uuid4())
                    citation_uuid = _to_uuid(item.citation_chunk_id) if item.citation_chunk_id else None
                    cur.execute(
                        """
                        INSERT INTO financial_line_items (
                            id, statement_id, line_item_code, line_item_name,
                            category, value, unit, cell_range, citation_chunk_id
                        ) VALUES (
                            %s, %s, %s, %s,
                            %s, %s, %s, %s, %s
                        )
                        ON CONFLICT (statement_id, line_item_code)
                        DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
                        """,
                        (
                            line_uuid,
                            actual_stmt_id,
                            item.line_item_code,
                            item.line_item_name,
                            item.category or "OTHER",
                            float(item.value),
                            item.unit or "INR_CRORES",
                            item.cell_range,
                            citation_uuid
                        )
                    )

            conn.commit()
            logger.info("Successfully persisted document %s and %d line items to PostgreSQL", doc.document_id, len(doc.line_items))
            return True
    except Exception as e:
        logger.warning("PostgreSQL persistence unavailable (%s), falling back to in-memory store.", e)
        return False
    finally:
        if conn is not None:
            with contextlib.suppress(Exception):
                conn.close()
