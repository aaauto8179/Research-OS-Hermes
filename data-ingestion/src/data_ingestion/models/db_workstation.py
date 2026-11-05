"""
PostgreSQL persistence helper for workstation layouts, card notes, and attachments.
Executes atomic upsert/select/delete queries against PostgreSQL when available,
with graceful handling when PostgreSQL is offline.
"""
import json
import logging
import uuid
from datetime import datetime
from typing import Any, Optional

from .db import DATABASE_URL, _to_uuid, is_postgres_available

logger = logging.getLogger(__name__)


def _format_datetime(val: Any) -> Optional[str]:
    if isinstance(val, datetime):
        return val.isoformat()
    return str(val) if val is not None else None


def persist_layout_to_postgres(layout_data: dict[str, Any]) -> Optional[dict[str, Any]]:
    """
    Persists workstation layout to PostgreSQL with ON CONFLICT (user_id, symbol) DO UPDATE.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        logger.warning("psycopg is not installed; PostgreSQL persistence disabled.")
        return None

    user_id = str(layout_data.get("user_id") or "default_user")
    symbol = str(layout_data.get("symbol") or "UNKNOWN").upper()
    active_tab_id = str(layout_data.get("active_tab_id") or "overview")
    tabs_json = json.dumps(layout_data.get("tabs") or [])
    layouts_json = json.dumps(layout_data.get("layouts") or {})
    metadata_json = json.dumps(layout_data.get("metadata") or {})

    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO user_workstation_layouts (user_id, symbol, active_tab_id, tabs, layouts, metadata, updated_at)
                VALUES (%s, %s, %s, %s::jsonb, %s::jsonb, %s::jsonb, NOW())
                ON CONFLICT (user_id, symbol)
                DO UPDATE SET
                    active_tab_id = EXCLUDED.active_tab_id,
                    tabs = EXCLUDED.tabs,
                    layouts = EXCLUDED.layouts,
                    metadata = EXCLUDED.metadata,
                    updated_at = NOW()
                RETURNING id, user_id, symbol, active_tab_id, tabs, layouts, metadata, created_at, updated_at;
                """,
                (user_id, symbol, active_tab_id, tabs_json, layouts_json, metadata_json),
            )
            row = cur.fetchone()
            conn.commit()
            if row:
                return {
                    "id": str(row[0]),
                    "user_id": row[1],
                    "symbol": row[2],
                    "active_tab_id": row[3],
                    "tabs": row[4],
                    "layouts": row[5],
                    "metadata": row[6],
                    "created_at": _format_datetime(row[7]),
                    "updated_at": _format_datetime(row[8]),
                }
    except Exception as e:
        logger.warning("Failed to persist workstation layout to PostgreSQL: %s", e)
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()
    return None


def get_layout_from_postgres(symbol: str, user_id: str = "default_user") -> Optional[dict[str, Any]]:
    """
    Retrieves workstation layout for symbol and user_id from PostgreSQL.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        return None

    symbol = symbol.upper()
    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, user_id, symbol, active_tab_id, tabs, layouts, metadata, created_at, updated_at
                FROM user_workstation_layouts
                WHERE symbol = %s AND user_id = %s;
                """,
                (symbol, user_id),
            )
            row = cur.fetchone()
            if row:
                return {
                    "id": str(row[0]),
                    "user_id": row[1],
                    "symbol": row[2],
                    "active_tab_id": row[3],
                    "tabs": row[4],
                    "layouts": row[5],
                    "metadata": row[6],
                    "created_at": _format_datetime(row[7]),
                    "updated_at": _format_datetime(row[8]),
                }
    except Exception as e:
        logger.warning("Failed to get workstation layout from PostgreSQL: %s", e)
        return None
    finally:
        if conn:
            conn.close()
    return None


def get_notes_from_postgres(
    symbol: str, card_id: Optional[str] = None, user_id: Optional[str] = None
) -> Optional[list[dict[str, Any]]]:
    """
    Retrieves card notes from PostgreSQL filtered by symbol, card_id, and user_id.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        return None

    symbol = symbol.upper()
    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            query = """
                SELECT id, symbol, card_id, user_id, title, content, tags, metadata, created_at, updated_at
                FROM card_notes
                WHERE symbol = %s
            """
            params: list[Any] = [symbol]
            if card_id:
                query += " AND card_id = %s"
                params.append(card_id)
            if user_id:
                query += " AND user_id = %s"
                params.append(user_id)
            query += " ORDER BY updated_at DESC;"

            cur.execute(query, params)
            rows = cur.fetchall()
            notes: list[dict[str, Any]] = []
            for row in rows:
                notes.append({
                    "id": str(row[0]),
                    "symbol": row[1],
                    "card_id": row[2],
                    "user_id": row[3],
                    "title": row[4],
                    "content": row[5],
                    "tags": row[6] or [],
                    "metadata": row[7] or {},
                    "created_at": _format_datetime(row[8]),
                    "updated_at": _format_datetime(row[9]),
                })
            return notes
    except Exception as e:
        logger.warning("Failed to get card notes from PostgreSQL: %s", e)
        return None
    finally:
        if conn:
            conn.close()


def persist_note_to_postgres(note_data: dict[str, Any]) -> Optional[dict[str, Any]]:
    """
    Persists card note to PostgreSQL.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        return None

    note_id = _to_uuid(note_data.get("id")) if note_data.get("id") else str(uuid.uuid4())
    symbol = str(note_data.get("symbol") or "UNKNOWN").upper()
    card_id = str(note_data.get("card_id") or "")
    user_id = str(note_data.get("user_id") or "default_user")
    title = str(note_data.get("title") or "")
    content = str(note_data.get("content") or "")
    tags = list(note_data.get("tags") or [])
    metadata_json = json.dumps(note_data.get("metadata") or {})

    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO card_notes (id, symbol, card_id, user_id, title, content, tags, metadata, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW(), NOW())
                ON CONFLICT (id)
                DO UPDATE SET
                    symbol = EXCLUDED.symbol,
                    card_id = EXCLUDED.card_id,
                    user_id = EXCLUDED.user_id,
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    tags = EXCLUDED.tags,
                    metadata = EXCLUDED.metadata,
                    updated_at = NOW()
                RETURNING id, symbol, card_id, user_id, title, content, tags, metadata, created_at, updated_at;
                """,
                (note_id, symbol, card_id, user_id, title, content, tags, metadata_json),
            )
            row = cur.fetchone()
            conn.commit()
            if row:
                return {
                    "id": str(row[0]),
                    "symbol": row[1],
                    "card_id": row[2],
                    "user_id": row[3],
                    "title": row[4],
                    "content": row[5],
                    "tags": row[6] or [],
                    "metadata": row[7] or {},
                    "created_at": _format_datetime(row[8]),
                    "updated_at": _format_datetime(row[9]),
                }
    except Exception as e:
        logger.warning("Failed to persist card note to PostgreSQL: %s", e)
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()
    return None


def delete_note_from_postgres(note_id: str) -> bool:
    """
    Deletes card note by id from PostgreSQL.
    """
    if not is_postgres_available():
        return False

    try:
        import psycopg
    except ImportError:
        return False

    note_uuid = _to_uuid(note_id)
    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute("DELETE FROM card_notes WHERE id = %s RETURNING id;", (note_uuid,))
            row = cur.fetchone()
            conn.commit()
            return row is not None
    except Exception as e:
        logger.warning("Failed to delete card note from PostgreSQL: %s", e)
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()


def get_attachments_from_postgres(
    symbol: str, card_id: Optional[str] = None, user_id: Optional[str] = None
) -> Optional[list[dict[str, Any]]]:
    """
    Retrieves attachment metadata list (excluding file_data) from PostgreSQL.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        return None

    symbol = symbol.upper()
    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            query = """
                SELECT id, symbol, card_id, user_id, file_name, file_size, mime_type, file_url, storage_path, metadata, created_at
                FROM card_attachments
                WHERE symbol = %s
            """
            params: list[Any] = [symbol]
            if card_id:
                query += " AND card_id = %s"
                params.append(card_id)
            if user_id:
                query += " AND user_id = %s"
                params.append(user_id)
            query += " ORDER BY created_at DESC;"

            cur.execute(query, params)
            rows = cur.fetchall()
            attachments: list[dict[str, Any]] = []
            for row in rows:
                attachments.append({
                    "id": str(row[0]),
                    "symbol": row[1],
                    "card_id": row[2],
                    "user_id": row[3],
                    "file_name": row[4],
                    "file_size": row[5],
                    "mime_type": row[6],
                    "file_url": row[7],
                    "storage_path": row[8],
                    "metadata": row[9] or {},
                    "created_at": _format_datetime(row[10]),
                })
            return attachments
    except Exception as e:
        logger.warning("Failed to get attachments from PostgreSQL: %s", e)
        return None
    finally:
        if conn:
            conn.close()


def persist_attachment_to_postgres(
    att_data: dict[str, Any], file_bytes: bytes
) -> Optional[dict[str, Any]]:
    """
    Persists file attachment metadata and binary content (BYTEA) to PostgreSQL.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        return None

    att_id = _to_uuid(att_data.get("id")) if att_data.get("id") else str(uuid.uuid4())
    symbol = str(att_data.get("symbol") or "UNKNOWN").upper()
    card_id = str(att_data.get("card_id") or "")
    user_id = str(att_data.get("user_id") or "default_user")
    file_name = str(att_data.get("file_name") or "attachment.bin")
    file_size = int(att_data.get("file_size") or len(file_bytes))
    mime_type = str(att_data.get("mime_type") or "application/octet-stream")
    file_url = att_data.get("file_url") or f"/api/workstation/attachments/{att_id}/download"
    storage_path = att_data.get("storage_path") or ""
    metadata_json = json.dumps(att_data.get("metadata") or {})

    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO card_attachments (
                    id, symbol, card_id, user_id, file_name, file_size, mime_type, file_url,
                    file_data, storage_path, metadata, created_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    file_name = EXCLUDED.file_name,
                    file_size = EXCLUDED.file_size,
                    mime_type = EXCLUDED.mime_type,
                    file_url = EXCLUDED.file_url,
                    file_data = EXCLUDED.file_data,
                    storage_path = EXCLUDED.storage_path,
                    metadata = EXCLUDED.metadata
                RETURNING id, symbol, card_id, user_id, file_name, file_size, mime_type, file_url, storage_path, metadata, created_at;
                """,
                (
                    att_id,
                    symbol,
                    card_id,
                    user_id,
                    file_name,
                    file_size,
                    mime_type,
                    file_url,
                    file_bytes,
                    storage_path,
                    metadata_json,
                ),
            )
            row = cur.fetchone()
            conn.commit()
            if row:
                return {
                    "id": str(row[0]),
                    "symbol": row[1],
                    "card_id": row[2],
                    "user_id": row[3],
                    "file_name": row[4],
                    "file_size": row[5],
                    "mime_type": row[6],
                    "file_url": row[7],
                    "storage_path": row[8],
                    "metadata": row[9] or {},
                    "created_at": _format_datetime(row[10]),
                }
    except Exception as e:
        logger.warning("Failed to persist attachment to PostgreSQL: %s", e)
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()
    return None


def get_attachment_data_from_postgres(att_id: str) -> Optional[tuple[dict[str, Any], bytes]]:
    """
    Retrieves attachment metadata and binary file content (BYTEA) from PostgreSQL.
    """
    if not is_postgres_available():
        return None

    try:
        import psycopg
    except ImportError:
        return None

    att_uuid = _to_uuid(att_id)
    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, symbol, card_id, user_id, file_name, file_size, mime_type, file_url, file_data, storage_path, metadata, created_at
                FROM card_attachments
                WHERE id = %s;
                """,
                (att_uuid,),
            )
            row = cur.fetchone()
            if row:
                meta = {
                    "id": str(row[0]),
                    "symbol": row[1],
                    "card_id": row[2],
                    "user_id": row[3],
                    "file_name": row[4],
                    "file_size": row[5],
                    "mime_type": row[6],
                    "file_url": row[7],
                    "storage_path": row[9],
                    "metadata": row[10] or {},
                    "created_at": _format_datetime(row[11]),
                }
                raw_bytes = bytes(row[8]) if row[8] is not None else b""
                return meta, raw_bytes
    except Exception as e:
        logger.warning("Failed to get attachment data from PostgreSQL: %s", e)
        return None
    finally:
        if conn:
            conn.close()
    return None


def delete_attachment_from_postgres(att_id: str) -> bool:
    """
    Deletes attachment by id from PostgreSQL.
    """
    if not is_postgres_available():
        return False

    try:
        import psycopg
    except ImportError:
        return False

    att_uuid = _to_uuid(att_id)
    conn = None
    try:
        conn = psycopg.connect(DATABASE_URL, connect_timeout=3)
        with conn.cursor() as cur:
            cur.execute("DELETE FROM card_attachments WHERE id = %s RETURNING id;", (att_uuid,))
            row = cur.fetchone()
            conn.commit()
            return row is not None
    except Exception as e:
        logger.warning("Failed to delete attachment from PostgreSQL: %s", e)
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()
