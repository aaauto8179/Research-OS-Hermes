"""
FastAPI router for Analyst Workstation Persistence (R3, R4, R5).
Handles layout configuration, qualitative card notes, and multi-modal file attachments.
"""
import urllib.parse
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, Response, UploadFile
from pydantic import BaseModel, Field

from data_ingestion.models.store_workstation import WorkstationStore

router = APIRouter(prefix="/api/workstation", tags=["Workstation"])


class WorkstationLayoutRequest(BaseModel):
    symbol: str
    active_tab_id: Optional[str] = "overview"
    tabs: Optional[list[dict[str, Any]]] = Field(default_factory=list)
    layouts: Optional[dict[str, Any]] = Field(default_factory=dict)
    user_id: Optional[str] = "default_user"
    metadata: Optional[dict[str, Any]] = Field(default_factory=dict)


class CardNoteRequest(BaseModel):
    id: Optional[str] = None
    symbol: str
    card_id: str
    title: Optional[str] = ""
    content: str
    tags: Optional[list[str]] = Field(default_factory=list)
    user_id: Optional[str] = "default_user"
    metadata: Optional[dict[str, Any]] = Field(default_factory=dict)


# -------------------------------------------------------------
# 1. Workstation Layout Endpoints
# -------------------------------------------------------------

@router.get("/layout/{symbol}")
async def get_layout(
    symbol: str,
    user_id: Optional[str] = Query("default_user", description="Analyst / User ID")
):
    """
    Returns the saved tab and widget layout for a company symbol and user.
    Falls back to the default workstation layout if not yet customized.
    """
    store = WorkstationStore.get_instance()
    layout_data, is_default = store.get_layout(symbol=symbol, user_id=user_id or "default_user")
    return {
        "status": "success",
        "is_default": is_default,
        "data": layout_data,
    }


@router.post("/layout")
async def save_layout(payload: WorkstationLayoutRequest):
    """
    Saves or upserts the analyst's custom tabs and responsive widget grid layout.
    """
    store = WorkstationStore.get_instance()
    saved = store.save_layout(payload.model_dump())
    return {
        "status": "success",
        "message": "Layout saved successfully",
        "data": saved,
    }


# -------------------------------------------------------------
# 2. Universal Card Workbench Notes Endpoints
# -------------------------------------------------------------

@router.get("/notes/{symbol}")
async def get_card_notes(
    symbol: str,
    card_id: Optional[str] = Query(None, description="Optional card ID filter"),
    user_id: Optional[str] = Query(None, description="Optional user ID filter")
):
    """
    Retrieves qualitative notes for a company symbol, optionally filtered by card_id.
    """
    store = WorkstationStore.get_instance()
    notes = store.get_notes(symbol=symbol, card_id=card_id, user_id=user_id)
    return {
        "status": "success",
        "symbol": symbol.upper(),
        "count": len(notes),
        "data": notes,
    }


@router.post("/notes")
async def save_card_note(payload: CardNoteRequest):
    """
    Creates a new qualitative card note or updates an existing note if id is provided.
    """
    store = WorkstationStore.get_instance()
    saved = store.save_note(payload.model_dump())
    return {
        "status": "success",
        "message": "Card note persisted successfully",
        "data": saved,
    }


@router.delete("/notes/{id}")
async def delete_card_note(id: str):
    """
    Deletes a qualitative card note by ID.
    """
    store = WorkstationStore.get_instance()
    deleted = store.delete_note(id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Card note '{id}' not found")
    return {
        "status": "success",
        "message": "Card note deleted successfully",
        "id": id,
    }


# -------------------------------------------------------------
# 3. Universal Card Workbench Attachments Endpoints
# -------------------------------------------------------------

@router.get("/attachments/{symbol}")
async def get_card_attachments(
    symbol: str,
    card_id: Optional[str] = Query(None, description="Optional card ID filter"),
    user_id: Optional[str] = Query(None, description="Optional user ID filter")
):
    """
    Retrieves attachment metadata list for a symbol, optionally filtered by card_id.
    """
    store = WorkstationStore.get_instance()
    attachments = store.get_attachments(symbol=symbol, card_id=card_id, user_id=user_id)
    return {
        "status": "success",
        "symbol": symbol.upper(),
        "count": len(attachments),
        "data": attachments,
    }


@router.post("/attachments")
async def upload_card_attachment(
    file: UploadFile = File(...),
    symbol: str = Form(...),
    card_id: str = Form(...),
    user_id: Optional[str] = Form("default_user")
):
    """
    Uploads a multi-modal file attachment for a specific card and symbol.
    """
    file_bytes = await file.read()
    att_data = {
        "symbol": symbol,
        "card_id": card_id,
        "user_id": user_id or "default_user",
        "file_name": file.filename or "attachment.bin",
        "mime_type": file.content_type or "application/octet-stream",
        "file_size": len(file_bytes),
    }

    store = WorkstationStore.get_instance()
    saved = store.save_attachment(att_data=att_data, file_bytes=file_bytes)
    return {
        "status": "success",
        "message": "Attachment uploaded and associated successfully",
        "data": saved,
    }


@router.get("/attachments/{id}/download")
async def download_card_attachment(id: str):
    """
    Streams file attachment binary content with appropriate Content-Disposition header.
    """
    store = WorkstationStore.get_instance()
    content_data = store.get_attachment_content(id)
    if not content_data:
        raise HTTPException(status_code=404, detail=f"Attachment '{id}' not found")

    meta, raw_bytes = content_data
    file_name = meta.get("file_name") or "attachment"
    mime_type = meta.get("mime_type") or "application/octet-stream"

    # RFC 5987 / RFC 6266 standard filename encoding for non-ASCII safety
    safe_ascii_filename = file_name.replace('"', "").encode("ascii", "ignore").decode("ascii").strip() or "attachment"
    encoded_filename = urllib.parse.quote(file_name)

    return Response(
        content=raw_bytes,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{safe_ascii_filename}"; filename*=UTF-8\'\'{encoded_filename}',
            "Content-Length": str(len(raw_bytes)),
        },
    )


@router.delete("/attachments/{id}")
async def delete_card_attachment(id: str):
    """
    Deletes attachment metadata and binary content by ID.
    """
    store = WorkstationStore.get_instance()
    deleted = store.delete_attachment(id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Attachment '{id}' not found")
    return {
        "status": "success",
        "message": "Attachment deleted successfully",
        "id": id,
    }
