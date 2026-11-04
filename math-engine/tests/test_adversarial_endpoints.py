"""
Adversarial Stress Test Suite for Math Engine FastAPI Endpoints.
Covers all 17 calculation endpoints across:
1. Normal baseline payloads (happy path)
2. Boundary / edge case payloads (zero values, negative values, empty collections, extreme numbers)
3. NaN / Infinity resilience checks (verifying _clean_nans sanitizes floats to valid JSON nulls)
4. Static AST / source inspection confirming zero occurrences of model_dump()
5. Verification that zero endpoints raise AttributeError (HTTP 500) or crash during JSON serialization.
"""

import asyncio
import dataclasses
import json
import math
import os
import sys
import pytest
from starlette.requests import Request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import api.main as api_main
from api.main import (
    app,
    dcf,
    screening,
    relative,
    sotp,
    banking,
    excess_return,
    beneish,
    altman,
    piotroski,
    portfolio,
    corporate_actions,
    ratio_analysis,
    turnaround,
    hedging,
    risk_score,
    common_size,
    revenue_projection,
    concall_consistency,
)


async def _invoke_asgi(endpoint_path: str, payload: dict):
    """Invoke the full FastAPI application via ASGI interface to test full pipeline."""
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
# 1. AST & SOURCE CODE VERIFICATION: ZERO model_dump() CALLS
# ============================================================

def test_source_no_model_dump_invocations():
    """Verify statically that no endpoint or helper in api/main.py calls .model_dump()."""
    source_path = os.path.join(os.path.dirname(__file__), '..', 'api', 'main.py')
    with open(source_path, 'r', encoding='utf-8') as f:
        content = f.read()

    assert "model_dump" not in content, "Forbidden .model_dump() found in math-engine/api/main.py"
    assert "dataclasses.asdict" in content, "Missing dataclasses.asdict() serialization in math-engine/api/main.py"


# ============================================================
# 2. ENDPOINT ADVERSARIAL & BOUNDARY TESTS (ALL 17 ENDPOINTS)
# ============================================================

# --- 1. /dcf ---
@pytest.mark.asyncio
async def test_adversarial_dcf_normal():
    payload = {
        "revenue": 10000.0,
        "ebit": 1500.0,
        "depreciation": 500.0,
        "capex": 800.0,
        "change_nwc": 200.0,
        "tax_rate": 0.25,
        "total_debt": 3000.0,
        "cash": 1000.0,
        "minority_interest": 100.0,
        "diluted_shares": 100.0,
        "revenue_growth_years": [0.10] * 10,
        "ebit_margin": 0.18,
        "capex_pct_revenue": 0.06,
        "nwc_pct_revenue": 0.02,
        "risk_free_rate": 0.065,
        "equity_risk_premium": 0.055,
        "beta": 1.15,
        "cost_of_debt": 0.08,
        "debt_to_value": 0.30,
        "terminal_growth_rate": 0.025,
        "exit_multiple": 8.5,
        "forecast_years": 10,
    }
    status, data = await _invoke_asgi("/dcf", payload)
    assert status == 200
    assert "fair_value_per_share_gordon" in data
    assert "fair_value_per_share_multiple" in data
    assert isinstance(data["years"], list)

@pytest.mark.asyncio
async def test_adversarial_dcf_boundary_zero_and_negative_nwc():
    """DCF boundary: zero cash, zero debt, negative change in NWC."""
    payload = {
        "revenue": 5000.0,
        "ebit": 500.0,
        "depreciation": 200.0,
        "capex": 100.0,
        "change_nwc": -150.0,
        "tax_rate": 0.20,
        "total_debt": 0.0,
        "cash": 0.0,
        "minority_interest": 0.0,
        "diluted_shares": 10.0,
        "revenue_growth_years": [0.05] * 5,
        "ebit_margin": 0.10,
        "capex_pct_revenue": 0.02,
        "nwc_pct_revenue": -0.01,
        "risk_free_rate": 0.05,
        "equity_risk_premium": 0.05,
        "beta": 1.0,
        "cost_of_debt": 0.05,
        "debt_to_value": 0.0,
        "terminal_growth_rate": 0.02,
        "exit_multiple": 6.0,
        "forecast_years": 5,
    }
    status, data = await _invoke_asgi("/dcf", payload)
    assert status == 200
    assert data["fair_value_per_share_gordon"] > 0


# --- 2. /altman ---
@pytest.mark.asyncio
async def test_adversarial_altman_normal_and_extreme_distress():
    # Normal safe
    status, data = await _invoke_asgi("/altman", {
        "x1": 0.4, "x2": 0.6, "x3": 0.3, "x4": 2.5, "x5": 1.5,
        "is_manufacturing": True, "model": "original"
    })
    assert status == 200
    assert data["zone"] == "SAFE"

    # Extreme negative ratios (distress zone)
    status2, data2 = await _invoke_asgi("/altman", {
        "x1": -2.5, "x2": -5.0, "x3": -1.2, "x4": 0.05, "x5": 0.1,
        "is_manufacturing": False, "model": "double_prime"
    })
    assert status2 == 200
    assert data2["zone"] == "DISTRESS"
    assert "z_score" in data2


# --- 3. /beneish ---
@pytest.mark.asyncio
async def test_adversarial_beneish_manipulator_and_boundary():
    # Enron-like manipulator
    payload_manipulator = {
        "dsri": 2.5, "gmi": 1.8, "aqi": 2.0, "sgi": 1.6,
        "depi": 1.2, "sgai": 1.4, "lvgi": 2.1, "tata": -0.15
    }
    status, data = await _invoke_asgi("/beneish", payload_manipulator)
    assert status == 200
    assert data["signal"] in ["MANIPULATION_LIKELY", "POSSIBLE_MANIPULATION"]
    assert data["m_score"] > -1.78

    # All ones boundary
    payload_neutral = {
        "dsri": 1.0, "gmi": 1.0, "aqi": 1.0, "sgi": 1.0,
        "depi": 1.0, "sgai": 1.0, "lvgi": 1.0, "tata": 0.0
    }
    status2, data2 = await _invoke_asgi("/beneish", payload_neutral)
    assert status2 == 200
    assert data2["signal"] in ["NON_MANIPULATOR", "MANIPULATION_UNLIKELY"]


# ============================================================
# 2.1 NAN & INFINITY SERIALIZATION RESILIENCE
# ============================================================

def test_clean_nans_direct_nested_resilience():
    """Verify _clean_nans recursively sanitizes nested nan, inf, and preserves valid datatypes."""
    from api.main import _clean_nans
    dirty_structure = {
        "a": float("nan"),
        "b": float("inf"),
        "c": float("-inf"),
        "d": [1.0, float("nan"), {"nested": float("inf")}],
        "e": "valid_string",
        "f": 42,
    }
    cleaned = _clean_nans(dirty_structure)
    assert cleaned["a"] is None
    assert cleaned["b"] is None
    assert cleaned["c"] is None
    assert cleaned["d"] == [1.0, None, {"nested": None}]
    assert cleaned["e"] == "valid_string"
    assert cleaned["f"] == 42
    # Verify standard JSON serializer can serialize without allow_nan=True
    encoded = json.dumps(cleaned, allow_nan=False)
    assert "NaN" not in encoded
    assert "Infinity" not in encoded


# --- 4. /piotroski ---
@pytest.mark.asyncio
async def test_adversarial_piotroski_extremes():
    # Score 9 (all true)
    payload_perfect = {
        "roa_positive": True, "cfo_positive": True, "roa_improving": True,
        "accruals_quality": True, "leverage_decreasing": True, "liquidity_improving": True,
        "no_dilution": True, "margin_improving": True, "turnover_improving": True
    }
    status, data = await _invoke_asgi("/piotroski", payload_perfect)
    assert status == 200
    assert data["f_score"] == 9
    assert "interpretation" in data

    # Score 0 (all false)
    payload_zero = {
        "roa_positive": False, "cfo_positive": False, "roa_improving": False,
        "accruals_quality": False, "leverage_decreasing": False, "liquidity_improving": False,
        "no_dilution": False, "margin_improving": False, "turnover_improving": False
    }
    status2, data2 = await _invoke_asgi("/piotroski", payload_zero)
    assert status2 == 200
    assert data2["f_score"] == 0
    assert "interpretation" in data


# --- 5. /relative ---
@pytest.mark.asyncio
async def test_adversarial_relative_nan_handling_and_missing_txns():
    """Test RelativeValuation where football field DCF placeholders contain np.nan."""
    payload = {
        "target_market_cap": 80000.0,
        "target_net_debt": 4000.0,
        "target_minority_interest": 200.0,
        "target_preferred": 0.0,
        "target_ebitda": 10000.0,
        "target_eps": 30.0,
        "target_sales": 60000.0,
        "target_eps_cagr_3y": 0.12,
        "diluted_shares": 1000.0,
        "peer_symbols": ["COMP_A", "COMP_B", "COMP_C"],
        "peer_market_caps": [75000.0, 90000.0, 60000.0],
        "peer_net_debts": [3000.0, 5000.0, 2000.0],
        "peer_ebitdas": [9500.0, 11000.0, 7000.0],
        "peer_eps": [28.0, 35.0, 22.0],
        "peer_sales": [55000.0, 70000.0, 45000.0],
        "peer_eps_cagr_3y": [0.10, 0.14, 0.08],
        "peer_diluted_shares": [1000.0, 1000.0, 1000.0],
    }
    status, data = await _invoke_asgi("/relative", payload)
    assert status == 200
    assert "football_field" in data
    assert isinstance(data["football_field"], dict)


# --- 6. /sotp ---
@pytest.mark.asyncio
async def test_adversarial_sotp_multiple_segments():
    payload = {
        "segments": [
            {
                "name": "Retail",
                "metric": 500.0,
                "multiple": 12.0,
                "method": "EV_EBITDA",
                "conglomerate_discount": 0.15,
                "valuation_level": "EV",
                "effective_stake_pct": 100.0,
                "holdco_discount": 0.0,
            },
            {
                "name": "Fintech",
                "metric": 200.0,
                "multiple": 5.0,
                "method": "EV_SALES",
                "conglomerate_discount": 0.10,
                "valuation_level": "EV",
                "effective_stake_pct": 80.0,
                "holdco_discount": 0.05,
            },
        ],
        "net_debt": 1500.0,
        "cash": 300.0,
        "minority_interest": 50.0,
        "diluted_shares": 250.0,
    }
    status, data = await _invoke_asgi("/sotp", payload)
    assert status == 200
    assert data["fair_value_per_share"] > 0
    assert "segment_values" in data
    assert len(data["segment_values"]) == 2


# --- 7. /banking ---
@pytest.mark.asyncio
async def test_adversarial_banking_roe_equals_cost_of_equity():
    """Banking valuation when ROE equals COE -> Justified P/B should equal 1.0."""
    payload = {
        "book_value": 400.0,
        "roe": 0.12,
        "cost_of_equity": 0.12,
        "growth_rate": 0.04,
        "peer_roes": [0.12, 0.14, 0.15],
        "peer_pbs": [1.0, 1.4, 1.7],
        "market_cap": 100000.0,
    }
    status, data = await _invoke_asgi("/banking", payload)
    assert status == 200
    assert abs(data["justified_pb"] - 1.0) < 1e-4
    assert abs(data["implied_price_justified_pb"] - 400.0) < 1e-4


# --- 8. /excess-return ---
@pytest.mark.asyncio
async def test_adversarial_excess_return_zero_and_negative_excess():
    payload = {
        "book_value": 2000.0,
        "net_income_forecast": [100.0, 110.0, 120.0, 130.0],
        "cost_of_equity": 0.15,
        "growth_rate": 0.03,
        "forecast_years": 4,
        "diluted_shares": 100.0,
    }
    status, data = await _invoke_asgi("/excess-return", payload)
    assert status == 200
    assert "residual_incomes" in data
    assert len(data["residual_incomes"]) == 4


# --- 9. /portfolio ---
@pytest.mark.asyncio
async def test_adversarial_portfolio_flat_and_volatile():
    # Flat portfolio (zero volatility)
    status_flat, data_flat = await _invoke_asgi("/portfolio", {
        "portfolio_values": [100.0, 100.0, 100.0, 100.0, 100.0],
        "benchmark_values": [100.0, 101.0, 102.0, 103.0, 104.0],
        "cash_flows": [],
        "risk_free_rate": 0.05,
    })
    assert status_flat == 200
    assert data_flat["volatility"] == 0.0

    # Volatile portfolio
    status_vol, data_vol = await _invoke_asgi("/portfolio", {
        "portfolio_values": [100.0, 120.0, 90.0, 135.0, 110.0],
        "benchmark_values": [100.0, 102.0, 101.0, 105.0, 104.0],
        "cash_flows": [],
        "risk_free_rate": 0.05,
    })
    assert status_vol == 200
    assert data_vol["volatility"] > 0


# --- 10. /ratio-analysis ---
@pytest.mark.asyncio
async def test_adversarial_ratio_analysis_prerevenue_and_loss():
    # Pre-revenue firm (revenue = 0)
    payload_pre_rev = {
        "symbol": "STARTUP",
        "entity_type": "COMMERCIAL_CORPORATE",
        "revenue": 0.0,
        "pat": -50.0,
        "total_assets": 500.0,
    }
    status, data = await _invoke_asgi("/ratio-analysis", payload_pre_rev)
    assert status == 200
    assert data["symbol"] == "STARTUP"
    assert "ratios" in data


# --- 11. /turnaround ---
@pytest.mark.asyncio
async def test_adversarial_turnaround_both_negative_and_positive():
    # Continued distress (both negative)
    status_distress, data_distress = await _invoke_asgi("/turnaround", {
        "symbol": "DISTRESSED_CO",
        "roe_t": -15.0,
        "roe_t_1": -25.0,
    })
    assert status_distress == 200
    assert data_distress["symbol"] == "DISTRESSED_CO"
    assert "turnaround_score" in data_distress

    # Successful turnaround
    status_turn, data_turn = await _invoke_asgi("/turnaround", {
        "symbol": "RECOVERED_CO",
        "roe_t": 18.0,
        "roe_t_1": -8.0,
    })
    assert status_turn == 200
    assert data_turn["turnaround_score"] > 0


# --- 12. /hedging ---
@pytest.mark.asyncio
async def test_adversarial_hedging_boundary_strikes():
    payload = {
        "spot_price": 1000.0,
        "call_strike": 1050.0,
        "put_strike": 950.0,
        "call_premium": 25.0,
        "put_premium": 25.0,
    }
    status, data = await _invoke_asgi("/hedging", payload)
    assert status == 200
    assert "collar_max_gain" in data
    assert "collar_max_loss" in data
    assert "fair_future_price" in data


# --- 13. /risk-score ---
@pytest.mark.asyncio
async def test_adversarial_risk_score_non_big4_and_red_flags():
    payload = {
        "symbol": "RISKY_CORP",
        "auditor_type": "QUALIFIED",
        "promoter_pledge_pct": 75.0,
        "rpt_pct_of_turnover": 30.0,
    }
    status, data = await _invoke_asgi("/risk-score", payload)
    assert status == 200
    assert data["symbol"] == "RISKY_CORP"
    assert "composite_score" in data
    assert "risk_level" in data


# --- 14. /common-size ---
@pytest.mark.asyncio
async def test_adversarial_common_size_zero_revenue_fallback():
    """Common size when revenue is zero should fallback to total_operating_expenses."""
    payload = {
        "symbol": "BIOTECH",
        "revenue": 0.0,
        "total_operating_expenses": 300.0,
        "cogs": 0.0,
        "employee_expenses": 150.0,
        "total_assets": 1000.0,
        "total_liabilities": 200.0,
        "total_equity": 800.0,
        "cfo": -100.0,
        "cfi": -50.0,
        "cff": 200.0,
    }
    status, data = await _invoke_asgi("/common-size", payload)
    assert status == 200
    assert data["base_used"] == "TOTAL_OPEX"
    assert data["reconciliation_check"] is True
    assert "pnl_common_size" in data


# --- 15. /revenue-projection ---
@pytest.mark.asyncio
async def test_adversarial_revenue_projection_scurve_and_eliminations():
    payload = {
        "symbol": "PLATFORM",
        "segments": [
            {"name": "Hardware", "revenue": 1000.0, "growth_rate": 0.05},
            {"name": "SaaS", "revenue": 500.0, "growth_rate": 0.40},
        ],
        "intersegment_eliminations": 100.0,
        "ebitda_margin": 0.25,
        "depreciation_pct": 0.05,
        "tax_rate": 0.25,
        "capex_pct": 0.08,
        "nwc_change_pct": 0.03,
        "s_curve_params": {"L": 2000.0, "k": 0.3, "t0": 3.0, "t": 2.0, "TAM": 3000.0},
    }
    status, data = await _invoke_asgi("/revenue-projection", payload)
    assert status == 200
    assert data["consolidated_revenue"] == (1000.0 * 1.05 + 500.0 * 1.40) - 100.0
    assert data["s_curve_adoption"] is not None
    assert data["fcf"] is not None


# --- 16. /concall-consistency ---
@pytest.mark.asyncio
async def test_adversarial_concall_consistency_empty_and_multiple():
    # Empty guidance items
    status_empty, data_empty = await _invoke_asgi("/concall-consistency", {
        "symbol": "NOGUIDANCE",
        "guidance_items": [],
    })
    assert status_empty == 200
    assert data_empty["weighted_score"] == 0.0
    assert data_empty["beat_count"] == 0

    # Mixed beats, misses, meets
    status_mixed, data_mixed = await _invoke_asgi("/concall-consistency", {
        "symbol": "MIXED",
        "guidance_items": [
            {"type": "revenue", "lower": 100.0, "upper": 110.0, "actual": 115.0, "period": 1},  # BEAT
            {"type": "margin", "lower": 0.20, "upper": 0.22, "actual": 0.18, "period": 2},     # MISS
            {"type": "capex", "lower": 40.0, "upper": 50.0, "actual": 45.0, "period": 3},        # MET
        ],
    })
    assert status_mixed == 200
    assert data_mixed["beat_count"] == 1
    assert data_mixed["miss_count"] == 1
    assert data_mixed["met_count"] == 1
    assert data_mixed["weighted_score"] > 0


# --- 17. /screening ---
@pytest.mark.asyncio
async def test_adversarial_screening_empty_universe_and_no_matches():
    # Empty universe
    status_empty, data_empty = await _invoke_asgi("/screening", {
        "criteria": {"roe_min": 20.0},
        "companies": [],
    })
    assert status_empty == 200
    assert data_empty["results"] == []

    # Non-matching companies
    status_no_match, data_no_match = await _invoke_asgi("/screening", {
        "criteria": {"roe_min": 50.0},
        "companies": [
            {
                "symbol": "LOW_ROE",
                "name": "Low ROE Corp",
                "roe": 5.0,
                "debt_equity": 0.5,
                "market_cap": 1000.0,
                "pe": 15.0,
                "ev_ebitda": 10.0,
                "pb": 1.2,
                "debt_ebitda": 1.0,
                "beneish_m_score": -2.5,
                "altman_z_score": 3.0,
                "piotroski_f_score": 6,
                "sales_growth_3y": 5.0,
                "profit_growth_3y": 4.0,
                "cfo_pat_ratio": 1.0,
                "fcf_positive": True,
                "dist_from_52w_high": 10.0,
            }
        ],
    })
    assert status_no_match == 200
    assert len(data_no_match["results"]) == 1
    assert "passed_filters" in data_no_match["results"][0]


# ============================================================
# 3. DIRECT RUNNER
# ============================================================

if __name__ == "__main__":
    pytest.main(["-v", __file__])
