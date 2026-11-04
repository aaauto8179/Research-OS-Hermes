"""
Adversarial Verification Suite for Data Ingestion Classification & Route Integrity.
Verifies:
1. Exactly one /classify route is defined and registered (zero route conflicts).
2. Accurate classification across all 6 core document categories.
3. Edge-case resilience (empty strings, missing keys, non-matching text, mixed keywords, huge payloads).
4. Valid JSON serialization and HTTP 200 responses.
"""

import asyncio
import json
import os
import sys
import pytest
from starlette.requests import Request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from api.main import app, classify


async def _invoke_asgi(endpoint_path: str, payload: dict):
    """Invoke the data-ingestion FastAPI app via standard ASGI interface."""
    body = json.dumps(payload).encode("utf-8")
    resp_body = []
    status = None
    headers = []

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    async def send(msg):
        nonlocal status, resp_body, headers
        if msg["type"] == "http.response.start":
            status = msg["status"]
            headers = msg.get("headers", [])
        elif msg["type"] == "http.response.body":
            resp_body.append(msg.get("body", b""))

    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "path": endpoint_path,
        "raw_path": endpoint_path.encode("utf-8"),
        "query_string": b"",
        "headers": [(b"content-type", b"application/json"), (b"host", b"testserver")],
        "client": ("127.0.0.1", 50000),
        "server": ("127.0.0.1", 80),
        "scheme": "http",
    }
    await app(scope, receive, send)
    raw = b"".join(resp_body)
    parsed = json.loads(raw.decode("utf-8")) if raw else None
    return status, parsed


# ============================================================
# 1. ROUTE DEDUPLICATION & INTEGRITY CHECKS
# ============================================================

def test_classify_route_deduplication():
    """Verify that exactly one /classify route handler is registered on the FastAPI app."""
    classify_routes = [
        r for r in app.routes
        if hasattr(r, 'path') and r.path == "/classify"
    ]
    assert len(classify_routes) == 1, f"Expected exactly 1 /classify route, found {len(classify_routes)}"
    route = classify_routes[0]
    assert "POST" in route.methods, f"Expected POST method for /classify, got {route.methods}"


def test_no_duplicate_routes_in_data_ingestion():
    """Verify there are zero conflicting routes (duplicate path + method) in data-ingestion."""
    seen_routes = set()
    for route in app.routes:
        if hasattr(route, "path") and hasattr(route, "methods"):
            for method in route.methods:
                pair = (route.path, method)
                assert pair not in seen_routes, f"Duplicate route definition detected: {pair}"
                seen_routes.add(pair)


def test_classify_source_has_single_decorator():
    """Verify that data-ingestion/api/main.py contains exactly one @app.post('/classify') decorator."""
    source_path = os.path.join(os.path.dirname(__file__), '..', 'api', 'main.py')
    with open(source_path, 'r', encoding='utf-8') as f:
        content = f.read()

    decorator_count = content.count('@app.post("/classify")') + content.count("@app.post('/classify')")
    assert decorator_count == 1, f"Expected exactly 1 @app.post('/classify') decorator in source, found {decorator_count}"


# ============================================================
# 2. CLASSIFICATION ACCURACY ACROSS ALL TYPES
# ============================================================

@pytest.mark.asyncio
async def test_classify_annual_report():
    text = "The annual report of Tata Motors includes the board of directors report and auditor's report on financial statements."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "annual_report"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_concall_transcript():
    text = "Operator: Good day and welcome to Q3 earnings conference call and Q&A session with management."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "concall_transcript"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_investor_presentation():
    text = "Company investor presentation and roadshow investor deck detailing long term growth strategies."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "investor_presentation"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_quarterly_result():
    text = "Statement of unaudited quarterly results for Q2 ending September 30."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "quarterly_result"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_exchange_filing():
    text = "Disclosure under regulation 30 of SEBI LODR submitted as an exchange filing to BSE and NSE."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "exchange_filing"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_research_report():
    text = "Equity research report by lead analyst issuing a BUY recommendation with a 12-month target price of 3500."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "research_report"
    assert data["confidence"] == 0.85


# ============================================================
# 3. ADVERSARIAL EDGE CASES & BOUNDARY TESTING
# ============================================================

@pytest.mark.asyncio
async def test_classify_empty_string():
    status, data = await _invoke_asgi("/classify", {"text": ""})
    assert status == 200
    assert data["type"] == "other"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_missing_text_key():
    status, data = await _invoke_asgi("/classify", {})
    assert status == 200
    assert data["type"] == "other"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_unrelated_text():
    status, data = await _invoke_asgi("/classify", {"text": "A quick brown fox jumps over the lazy dog in the rain."})
    assert status == 200
    assert data["type"] == "other"
    assert data["confidence"] == 0.85


@pytest.mark.asyncio
async def test_classify_mixed_keywords():
    """Text contains 3 annual report keywords and 1 concall keyword. Annual report should win."""
    text = "This annual report contains financial statements from the board of directors. A brief conference call was held."
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "annual_report"


@pytest.mark.asyncio
async def test_classify_huge_payload():
    """100,000 characters payload with embedded target keyword."""
    filler = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 1500
    text = filler + " official exchange filing with BSE and NSE " + filler
    status, data = await _invoke_asgi("/classify", {"text": text})
    assert status == 200
    assert data["type"] == "exchange_filing"


if __name__ == "__main__":
    pytest.main(["-v", __file__])
