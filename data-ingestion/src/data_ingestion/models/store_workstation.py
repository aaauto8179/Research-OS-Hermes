"""
Storage repository for workstation layouts, card notes, and attachments.
Provides a thread-safe in-memory cache with write-through to PostgreSQL when available.
"""
import copy
import logging
import threading
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from .db_workstation import (
    delete_attachment_from_postgres,
    delete_note_from_postgres,
    get_attachment_data_from_postgres,
    get_attachments_from_postgres,
    get_layout_from_postgres,
    get_notes_from_postgres,
    persist_attachment_to_postgres,
    persist_layout_to_postgres,
    persist_note_to_postgres,
)

logger = logging.getLogger(__name__)


def get_default_layout(symbol: str, user_id: str = "default_user") -> dict[str, Any]:
    """
    Returns standard initial workstation layout for a company symbol.
    """
    sym = symbol.upper()
    return {
        "id": None,
        "user_id": user_id,
        "symbol": sym,
        "active_tab_id": "overview",
        "tabs": [
            {
                "id": "overview",
                "label": "Overview",
                "widgetIds": ["financial-statements-grid", "scenario-projections"],
                "isCustom": False,
                "order": 0,
            },
            {
                "id": "financials",
                "label": "Financial Statements",
                "widgetIds": ["financial-statements-grid"],
                "isCustom": False,
                "order": 1,
            },
            {
                "id": "scenarios",
                "label": "Projections & Scenarios",
                "widgetIds": ["scenario-projections", "trajectory-chart", "margin-bridge"],
                "isCustom": False,
                "order": 2,
            },
        ],
        "layouts": {
            "overview": [
                {"i": "financial-statements-grid", "x": 0, "y": 0, "w": 12, "h": 8, "minW": 6, "minH": 4},
                {"i": "scenario-projections", "x": 0, "y": 8, "w": 12, "h": 6, "minW": 6, "minH": 4},
            ],
            "financials": [
                {"i": "financial-statements-grid", "x": 0, "y": 0, "w": 12, "h": 10, "minW": 6, "minH": 4},
            ],
            "scenarios": [
                {"i": "scenario-projections", "x": 0, "y": 0, "w": 4, "h": 10, "minW": 3, "minH": 6},
                {"i": "trajectory-chart", "x": 4, "y": 0, "w": 8, "h": 5, "minW": 4, "minH": 4},
                {"i": "margin-bridge", "x": 4, "y": 5, "w": 8, "h": 5, "minW": 4, "minH": 4},
            ],
        },
        "metadata": {},
        "created_at": None,
        "updated_at": None,
    }


class WorkstationStore:
    """
    Thread-safe repository for analyst workstation layouts, qualitative card notes,
    and multi-modal card attachments.
    """
    _instance: Optional["WorkstationStore"] = None
    _lock = threading.RLock()

    def __init__(self):
        # Key: (user_id, symbol.upper())
        self.layouts: dict[tuple[str, str], dict[str, Any]] = {}
        # Key: note_id (str)
        self.notes: dict[str, dict[str, Any]] = {}
        # Key: attachment_id (str)
        self.attachments: dict[str, dict[str, Any]] = {}
        # Key: attachment_id (str) -> bytes
        self.attachment_bytes: dict[str, bytes] = {}

    @classmethod
    def get_instance(cls) -> "WorkstationStore":
        with cls._lock:
            if cls._instance is None:
                cls._instance = WorkstationStore()
            return cls._instance

    def reset(self) -> None:
        """Resets all in-memory caches. Intended primarily for unit test isolation."""
        with self._lock:
            self.layouts.clear()
            self.notes.clear()
            self.attachments.clear()
            self.attachment_bytes.clear()

    # -------------------------------------------------------------
    # Layout Persistence
    # -------------------------------------------------------------

    def get_layout(self, symbol: str, user_id: str = "default_user") -> tuple[dict[str, Any], bool]:
        """
        Retrieves workstation layout for symbol and user_id.
        Returns (layout_dict, is_default).
        """
        sym = symbol.upper()
        cache_key = (user_id, sym)

        # 1. Attempt PostgreSQL retrieval if available
        pg_layout = get_layout_from_postgres(symbol=sym, user_id=user_id)
        if pg_layout is not None:
            with self._lock:
                self.layouts[cache_key] = copy.deepcopy(pg_layout)
            return copy.deepcopy(pg_layout), False

        # 2. Check in-memory store
        with self._lock:
            if cache_key in self.layouts:
                return copy.deepcopy(self.layouts[cache_key]), False

        # 3. Fallback to default workstation layout
        return get_default_layout(sym, user_id=user_id), True

    def save_layout(self, layout_data: dict[str, Any]) -> dict[str, Any]:
        """
        Saves or updates workstation layout in memory and executes write-through to PostgreSQL.
        """
        user_id = str(layout_data.get("user_id") or "default_user")
        sym = str(layout_data.get("symbol") or "UNKNOWN").upper()
        cache_key = (user_id, sym)

        now_iso = datetime.now(timezone.utc).isoformat()
        clean_layout = {
            "id": layout_data.get("id") or str(uuid.uuid4()),
            "user_id": user_id,
            "symbol": sym,
            "active_tab_id": str(layout_data.get("active_tab_id") or "overview"),
            "tabs": list(layout_data.get("tabs") or []),
            "layouts": dict(layout_data.get("layouts") or {}),
            "metadata": dict(layout_data.get("metadata") or {}),
            "created_at": layout_data.get("created_at") or now_iso,
            "updated_at": now_iso,
        }

        with self._lock:
            self.layouts[cache_key] = copy.deepcopy(clean_layout)

        # Attempt PostgreSQL write-through
        try:
            pg_res = persist_layout_to_postgres(clean_layout)
            if pg_res:
                with self._lock:
                    self.layouts[cache_key] = copy.deepcopy(pg_res)
                return copy.deepcopy(pg_res)
        except Exception as e:
            logger.warning("WorkstationStore PostgreSQL write-through failed for layout: %s", e)

        return copy.deepcopy(clean_layout)

    # -------------------------------------------------------------
    # Card Notes CRUD
    # -------------------------------------------------------------

    def get_notes(
        self, symbol: str, card_id: Optional[str] = None, user_id: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """
        Retrieves card notes filtered by symbol and optional card_id / user_id.
        """
        sym = symbol.upper()

        # 1. Attempt PostgreSQL retrieval if available
        pg_notes = get_notes_from_postgres(symbol=sym, card_id=card_id, user_id=user_id)
        if pg_notes is not None:
            with self._lock:
                for n in pg_notes:
                    self.notes[n["id"]] = copy.deepcopy(n)
            return copy.deepcopy(pg_notes)

        # 2. In-memory filter
        with self._lock:
            matched: list[dict[str, Any]] = []
            for note in self.notes.values():
                if note["symbol"].upper() != sym:
                    continue
                if card_id and note.get("card_id") != card_id:
                    continue
                if user_id and note.get("user_id") != user_id:
                    continue
                matched.append(copy.deepcopy(note))

            # Sort by updated_at descending
            matched.sort(key=lambda n: n.get("updated_at") or "", reverse=True)
            return matched

    def save_note(self, note_data: dict[str, Any]) -> dict[str, Any]:
        """
        Creates or updates a card note in memory and writes through to PostgreSQL.
        """
        note_id = str(note_data.get("id") or uuid.uuid4())
        sym = str(note_data.get("symbol") or "UNKNOWN").upper()
        card_id = str(note_data.get("card_id") or "")
        user_id = str(note_data.get("user_id") or "default_user")
        title = str(note_data.get("title") or "")
        content = str(note_data.get("content") or "")
        tags = list(note_data.get("tags") or [])
        metadata = dict(note_data.get("metadata") or {})
        now_iso = datetime.now(timezone.utc).isoformat()

        with self._lock:
            existing = self.notes.get(note_id)
            created_at = existing.get("created_at") if existing else (note_data.get("created_at") or now_iso)
            clean_note = {
                "id": note_id,
                "symbol": sym,
                "card_id": card_id,
                "user_id": user_id,
                "title": title,
                "content": content,
                "tags": tags,
                "metadata": metadata,
                "created_at": created_at,
                "updated_at": now_iso,
            }
            self.notes[note_id] = copy.deepcopy(clean_note)

        # PostgreSQL write-through
        try:
            pg_res = persist_note_to_postgres(clean_note)
            if pg_res:
                with self._lock:
                    self.notes[note_id] = copy.deepcopy(pg_res)
                return copy.deepcopy(pg_res)
        except Exception as e:
            logger.warning("WorkstationStore PostgreSQL write-through failed for note: %s", e)

        return copy.deepcopy(clean_note)

    def delete_note(self, note_id: str) -> bool:
        """
        Deletes a note by id from in-memory cache and PostgreSQL.
        Returns True if deleted, False if not found.
        """
        was_in_memory = False
        with self._lock:
            if note_id in self.notes:
                del self.notes[note_id]
                was_in_memory = True

        # Delete from PostgreSQL
        pg_deleted = False
        try:
            pg_deleted = delete_note_from_postgres(note_id)
        except Exception as e:
            logger.warning("WorkstationStore PostgreSQL delete failed for note: %s", e)

        return was_in_memory or pg_deleted

    # -------------------------------------------------------------
    # Card Attachments
    # -------------------------------------------------------------

    def get_attachments(
        self, symbol: str, card_id: Optional[str] = None, user_id: Optional[str] = None
    ) -> list[dict[str, Any]]:
        """
        Retrieves attachment metadata list filtered by symbol and optional card_id / user_id.
        """
        sym = symbol.upper()

        # 1. Attempt PostgreSQL retrieval if available
        pg_attachments = get_attachments_from_postgres(symbol=sym, card_id=card_id, user_id=user_id)
        if pg_attachments is not None:
            with self._lock:
                for att in pg_attachments:
                    self.attachments[att["id"]] = copy.deepcopy(att)
            return copy.deepcopy(pg_attachments)

        # 2. In-memory filter
        with self._lock:
            matched: list[dict[str, Any]] = []
            for att in self.attachments.values():
                if att["symbol"].upper() != sym:
                    continue
                if card_id and att.get("card_id") != card_id:
                    continue
                if user_id and att.get("user_id") != user_id:
                    continue
                matched.append(copy.deepcopy(att))

            # Sort by created_at descending
            matched.sort(key=lambda a: a.get("created_at") or "", reverse=True)
            return matched

    def save_attachment(self, att_data: dict[str, Any], file_bytes: bytes) -> dict[str, Any]:
        """
        Saves attachment metadata and binary content in memory and writes through to PostgreSQL.
        """
        att_id = str(att_data.get("id") or uuid.uuid4())
        sym = str(att_data.get("symbol") or "UNKNOWN").upper()
        card_id = str(att_data.get("card_id") or "")
        user_id = str(att_data.get("user_id") or "default_user")
        file_name = str(att_data.get("file_name") or "attachment.bin")
        mime_type = str(att_data.get("mime_type") or "application/octet-stream")
        storage_path = str(att_data.get("storage_path") or "")
        metadata = dict(att_data.get("metadata") or {})
        now_iso = datetime.now(timezone.utc).isoformat()
        file_size = len(file_bytes)
        file_url = f"/api/workstation/attachments/{att_id}/download"

        clean_att = {
            "id": att_id,
            "symbol": sym,
            "card_id": card_id,
            "user_id": user_id,
            "file_name": file_name,
            "file_size": file_size,
            "mime_type": mime_type,
            "file_url": file_url,
            "storage_path": storage_path,
            "metadata": metadata,
            "created_at": now_iso,
        }

        with self._lock:
            self.attachments[att_id] = copy.deepcopy(clean_att)
            self.attachment_bytes[att_id] = file_bytes

        # PostgreSQL write-through
        try:
            pg_res = persist_attachment_to_postgres(clean_att, file_bytes)
            if pg_res:
                with self._lock:
                    self.attachments[att_id] = copy.deepcopy(pg_res)
                return copy.deepcopy(pg_res)
        except Exception as e:
            logger.warning("WorkstationStore PostgreSQL write-through failed for attachment: %s", e)

        return copy.deepcopy(clean_att)

    def get_attachment_content(self, att_id: str) -> Optional[tuple[dict[str, Any], bytes]]:
        """
        Retrieves attachment metadata and binary bytes for streaming download.
        """
        with self._lock:
            if att_id in self.attachments and att_id in self.attachment_bytes:
                return copy.deepcopy(self.attachments[att_id]), self.attachment_bytes[att_id]

        # Check PostgreSQL
        try:
            pg_data = get_attachment_data_from_postgres(att_id)
            if pg_data:
                meta, raw_bytes = pg_data
                with self._lock:
                    self.attachments[att_id] = copy.deepcopy(meta)
                    self.attachment_bytes[att_id] = raw_bytes
                return copy.deepcopy(meta), raw_bytes
        except Exception as e:
            logger.warning("WorkstationStore PostgreSQL get_attachment_data failed: %s", e)

        return None

    def delete_attachment(self, att_id: str) -> bool:
        """
        Deletes attachment metadata and binary bytes from memory and PostgreSQL.
        Returns True if deleted, False if not found.
        """
        was_in_memory = False
        with self._lock:
            if att_id in self.attachments:
                del self.attachments[att_id]
                was_in_memory = True
            if att_id in self.attachment_bytes:
                del self.attachment_bytes[att_id]
                was_in_memory = True

        # PostgreSQL delete
        pg_deleted = False
        try:
            pg_deleted = delete_attachment_from_postgres(att_id)
        except Exception as e:
            logger.warning("WorkstationStore PostgreSQL delete attachment failed: %s", e)

        return was_in_memory or pg_deleted
