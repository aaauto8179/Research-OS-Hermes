"""
Comprehensive automated tests for Analyst Workstation Persistence (Milestone 1).
Verifies:
- User workstation layout persistence, default layout fallback, and upsert idempotency (R3, R5)
- Qualitative card notes CRUD, card_id filtering, and full lifecycle (R4, R5)
- Multi-modal card attachments upload, binary streaming download, and deletion (R4, R5)
- Error handling, 404 responses, and WorkstationStore resilience (R6)
"""
import io
import os
import sys
import uuid

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from api.main import app
from data_ingestion.models.store_workstation import WorkstationStore, get_default_layout

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_store():
    """Ensure in-memory workstation store is clean for each test."""
    store = WorkstationStore.get_instance()
    store.reset()
    yield
    store.reset()


# ---------------------------------------------------------------------
# 1. Workstation Layout Persistence Tests (R3, R5)
# ---------------------------------------------------------------------

def test_get_layout_default_unconfigured_symbol():
    """Verify unconfigured symbol returns default tab layout with is_default=True."""
    response = client.get("/api/workstation/layout/UNCONFIGURED_SYM_XYZ")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["is_default"] is True

    layout = data["data"]
    assert layout["symbol"] == "UNCONFIGURED_SYM_XYZ"
    assert layout["active_tab_id"] == "overview"
    assert len(layout["tabs"]) >= 3
    tab_ids = [t["id"] for t in layout["tabs"]]
    assert "overview" in tab_ids
    assert "financials" in tab_ids
    assert "scenarios" in tab_ids
    assert "overview" in layout["layouts"]
    assert len(layout["layouts"]["overview"]) > 0


def test_save_and_retrieve_custom_workstation_layout():
    """Verify saving custom tabs and grid positions, then retrieving exact match."""
    payload = {
        "user_id": "analyst_alpha",
        "symbol": "TCS",
        "active_tab_id": "custom_valuation",
        "tabs": [
            {
                "id": "custom_valuation",
                "label": "Valuation & Forensics",
                "widgetIds": ["dcf_engine", "dupont_analysis"],
                "isCustom": True,
                "order": 0,
            },
            {
                "id": "financials",
                "label": "Financial Statements",
                "widgetIds": ["financial-statements-grid"],
                "isCustom": False,
                "order": 1,
            },
        ],
        "layouts": {
            "custom_valuation": [
                {"i": "dcf_engine", "x": 0, "y": 0, "w": 6, "h": 8, "minW": 4, "minH": 4},
                {"i": "dupont_analysis", "x": 6, "y": 0, "w": 6, "h": 8, "minW": 4, "minH": 4},
            ]
        },
        "metadata": {"theme": "dark", "gridColumns": 12},
    }

    save_resp = client.post("/api/workstation/layout", json=payload)
    assert save_resp.status_code == 200
    save_data = save_resp.json()
    assert save_data["status"] == "success"
    assert save_data["data"]["symbol"] == "TCS"
    assert save_data["data"]["active_tab_id"] == "custom_valuation"

    # Retrieve saved layout
    get_resp = client.get("/api/workstation/layout/TCS?user_id=analyst_alpha")
    assert get_resp.status_code == 200
    retrieved = get_resp.json()
    assert retrieved["status"] == "success"
    assert retrieved["is_default"] is False

    retrieved_layout = retrieved["data"]
    assert retrieved_layout["symbol"] == "TCS"
    assert retrieved_layout["user_id"] == "analyst_alpha"
    assert retrieved_layout["active_tab_id"] == "custom_valuation"
    assert len(retrieved_layout["tabs"]) == 2
    assert retrieved_layout["tabs"][0]["label"] == "Valuation & Forensics"
    assert "custom_valuation" in retrieved_layout["layouts"]
    assert len(retrieved_layout["layouts"]["custom_valuation"]) == 2


def test_layout_upsert_idempotency():
    """Verify repeated POST updates existing layout without creating duplicates."""
    payload_v1 = {
        "user_id": "analyst_beta",
        "symbol": "INFY",
        "active_tab_id": "overview",
        "tabs": [{"id": "overview", "label": "Overview", "widgetIds": ["w1"], "order": 0}],
        "layouts": {"overview": [{"i": "w1", "x": 0, "y": 0, "w": 12, "h": 6}]},
    }
    client.post("/api/workstation/layout", json=payload_v1)

    payload_v2 = {
        "user_id": "analyst_beta",
        "symbol": "INFY",
        "active_tab_id": "scenarios",
        "tabs": [
            {"id": "overview", "label": "Overview", "widgetIds": ["w1"], "order": 0},
            {"id": "scenarios", "label": "Projections", "widgetIds": ["w2"], "order": 1},
        ],
        "layouts": {
            "overview": [{"i": "w1", "x": 0, "y": 0, "w": 6, "h": 6}],
            "scenarios": [{"i": "w2", "x": 6, "y": 0, "w": 6, "h": 6}],
        },
    }
    client.post("/api/workstation/layout", json=payload_v2)

    get_resp = client.get("/api/workstation/layout/INFY?user_id=analyst_beta")
    assert get_resp.status_code == 200
    res = get_resp.json()["data"]
    assert res["active_tab_id"] == "scenarios"
    assert len(res["tabs"]) == 2
    assert "scenarios" in res["layouts"]


# ---------------------------------------------------------------------
# 2. Universal Card Workbench Notes CRUD Tests (R4, R5)
# ---------------------------------------------------------------------

def test_create_and_query_card_notes():
    """Verify creating card notes and querying by symbol and card_id."""
    note_1 = {
        "symbol": "RELIANCE",
        "card_id": "financial-statements-grid",
        "user_id": "analyst_1",
        "title": "Gross Margin Realization",
        "content": "Gross margin expanded 45bps YoY driven by retail volume realization.",
        "tags": ["Margin", "Retail", "FY24"],
    }
    note_2 = {
        "symbol": "RELIANCE",
        "card_id": "scenario-projections",
        "user_id": "analyst_1",
        "title": "Bull Case Capex Shift",
        "content": "Assuming 5G monetization accelerates in H2.",
        "tags": ["Telecom", "Capex"],
    }

    resp1 = client.post("/api/workstation/notes", json=note_1)
    assert resp1.status_code == 200
    data1 = resp1.json()["data"]
    assert data1["id"] is not None
    assert data1["title"] == "Gross Margin Realization"

    resp2 = client.post("/api/workstation/notes", json=note_2)
    assert resp2.status_code == 200

    # Query all notes for RELIANCE
    all_notes_resp = client.get("/api/workstation/notes/RELIANCE")
    assert all_notes_resp.status_code == 200
    all_notes = all_notes_resp.json()["data"]
    assert len(all_notes) == 2

    # Query filtered by card_id
    filtered_resp = client.get("/api/workstation/notes/RELIANCE?card_id=financial-statements-grid")
    assert filtered_resp.status_code == 200
    filtered = filtered_resp.json()["data"]
    assert len(filtered) == 1
    assert filtered[0]["title"] == "Gross Margin Realization"
    assert "Retail" in filtered[0]["tags"]


def test_update_card_note():
    """Verify updating existing card note content and tags."""
    create_payload = {
        "symbol": "HDFCBANK",
        "card_id": "kpi-cards",
        "title": "NIM Compression",
        "content": "Initial note on NIM.",
        "tags": ["NIM"],
    }
    create_resp = client.post("/api/workstation/notes", json=create_payload)
    note_id = create_resp.json()["data"]["id"]

    update_payload = {
        "id": note_id,
        "symbol": "HDFCBANK",
        "card_id": "kpi-cards",
        "title": "NIM Compression Revised",
        "content": "NIM compressed by 14bps QoQ due to liquidity absorption.",
        "tags": ["NIM", "Liquidity", "Revised"],
    }
    update_resp = client.post("/api/workstation/notes", json=update_payload)
    assert update_resp.status_code == 200
    updated_data = update_resp.json()["data"]
    assert updated_data["id"] == note_id
    assert updated_data["title"] == "NIM Compression Revised"
    assert "Liquidity" in updated_data["tags"]

    # Verify updated content retrieved via GET
    get_resp = client.get("/api/workstation/notes/HDFCBANK?card_id=kpi-cards")
    assert get_resp.status_code == 200
    notes = get_resp.json()["data"]
    assert len(notes) == 1
    assert notes[0]["content"] == "NIM compressed by 14bps QoQ due to liquidity absorption."


def test_delete_card_note():
    """Verify deleting card note by ID and 404 for non-existent notes."""
    create_payload = {
        "symbol": "WIPRO",
        "card_id": "notes-widget",
        "content": "Temporary observation.",
    }
    create_resp = client.post("/api/workstation/notes", json=create_payload)
    note_id = create_resp.json()["data"]["id"]

    del_resp = client.delete(f"/api/workstation/notes/{note_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"
    assert del_resp.json()["id"] == note_id

    # Verify not in list
    list_resp = client.get("/api/workstation/notes/WIPRO")
    assert len(list_resp.json()["data"]) == 0

    # 404 on deleting non-existent note
    not_found_resp = client.delete(f"/api/workstation/notes/{uuid.uuid4()}")
    assert not_found_resp.status_code == 404


def test_card_notes_user_filter():
    """Verify filtering notes by user_id."""
    client.post("/api/workstation/notes", json={
        "symbol": "SBIN",
        "card_id": "c1",
        "user_id": "analyst_1",
        "content": "Analyst 1 thoughts",
    })
    client.post("/api/workstation/notes", json={
        "symbol": "SBIN",
        "card_id": "c1",
        "user_id": "analyst_2",
        "content": "Analyst 2 thoughts",
    })

    resp = client.get("/api/workstation/notes/SBIN?user_id=analyst_1")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert len(data) == 1
    assert data[0]["content"] == "Analyst 1 thoughts"


# ---------------------------------------------------------------------
# 3. Universal Card Workbench Attachments Tests (R4, R5)
# ---------------------------------------------------------------------

def test_upload_download_and_delete_attachment():
    """Verify multipart upload, binary streaming download, and deletion."""
    test_content = b"%PDF-1.5 Mock PDF filing snippet for Reliance Industries"
    files = {
        "file": ("q4_investor_presentation.pdf", io.BytesIO(test_content), "application/pdf")
    }
    data = {
        "symbol": "RELIANCE",
        "card_id": "financial-statements-grid",
        "user_id": "analyst_senior",
    }

    upload_resp = client.post("/api/workstation/attachments", files=files, data=data)
    assert upload_resp.status_code == 200
    att = upload_resp.json()["data"]
    att_id = att["id"]
    assert att["file_name"] == "q4_investor_presentation.pdf"
    assert att["file_size"] == len(test_content)
    assert att["mime_type"] == "application/pdf"
    assert att["file_url"] == f"/api/workstation/attachments/{att_id}/download"

    # Verify listing attachments for symbol
    list_resp = client.get("/api/workstation/attachments/RELIANCE")
    assert list_resp.status_code == 200
    items = list_resp.json()["data"]
    assert len(items) == 1
    assert items[0]["id"] == att_id

    # Verify downloading attachment binary content
    download_resp = client.get(f"/api/workstation/attachments/{att_id}/download")
    assert download_resp.status_code == 200
    assert download_resp.content == test_content
    assert "application/pdf" in download_resp.headers["content-type"]
    assert "q4_investor_presentation.pdf" in download_resp.headers["content-disposition"]

    # Delete attachment
    del_resp = client.delete(f"/api/workstation/attachments/{att_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "success"

    # Verify download returns 404 after deletion
    after_dl = client.get(f"/api/workstation/attachments/{att_id}/download")
    assert after_dl.status_code == 404

    # 404 on deleting non-existent attachment
    bad_del = client.delete(f"/api/workstation/attachments/{uuid.uuid4()}")
    assert bad_del.status_code == 404


def test_attachment_card_id_filter():
    """Verify filtering attachments by card_id."""
    files1 = {"file": ("sheet1.xlsx", io.BytesIO(b"excel_data"), "application/vnd.ms-excel")}
    files2 = {"file": ("chart.png", io.BytesIO(b"png_data"), "image/png")}

    client.post("/api/workstation/attachments", files=files1, data={"symbol": "ITC", "card_id": "card_a"})
    client.post("/api/workstation/attachments", files=files2, data={"symbol": "ITC", "card_id": "card_b"})

    resp_a = client.get("/api/workstation/attachments/ITC?card_id=card_a")
    assert resp_a.status_code == 200
    data_a = resp_a.json()["data"]
    assert len(data_a) == 1
    assert data_a[0]["file_name"] == "sheet1.xlsx"

    resp_b = client.get("/api/workstation/attachments/ITC?card_id=card_b")
    assert resp_b.status_code == 200
    data_b = resp_b.json()["data"]
    assert len(data_b) == 1
    assert data_b[0]["file_name"] == "chart.png"


# ---------------------------------------------------------------------
# 4. Store Default Layout Structure Validation
# ---------------------------------------------------------------------

def test_default_layout_structure():
    """Verify get_default_layout returns well-formed layout specification."""
    layout = get_default_layout("BHARTIARTL")
    assert layout["symbol"] == "BHARTIARTL"
    assert layout["active_tab_id"] == "overview"
    assert isinstance(layout["tabs"], list)
    assert len(layout["tabs"]) == 3
    assert isinstance(layout["layouts"], dict)
    assert "overview" in layout["layouts"]
    assert "financials" in layout["layouts"]
    assert "scenarios" in layout["layouts"]
