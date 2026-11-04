"""
Integration test suite for Math Engine FastAPI calculation endpoints.
Verifies all 17 calculation endpoints return valid JSON responses without
AttributeError (HTTP 500) or NaN serialization errors via direct endpoint invocation.
"""

import asyncio
import json
import os
import sys
import pytest
from starlette.requests import Request

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from api.main import (
    app,
    health,
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
    prices,
)


def _build_request(payload: dict) -> Request:
    """Constructs a mock HTTP request with the provided JSON payload."""
    raw_body = json.dumps(payload).encode("utf-8")

    async def receive():
        return {"type": "http.request", "body": raw_body, "more_body": False}

    scope = {
        "type": "http",
        "method": "POST",
        "path": "/",
        "headers": [(b"content-type", b"application/json")],
    }
    return Request(scope, receive)


# ============================================================
# ENDPOINT TESTS
# ============================================================

@pytest.mark.asyncio
async def test_endpoint_health():
    resp = await health()
    assert resp == {"status": "healthy", "service": "math-engine"}


@pytest.mark.asyncio
async def test_endpoint_dcf():
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
        "revenue_growth_years": [0.12, 0.10, 0.08, 0.06, 0.05, 0.04, 0.035, 0.03, 0.025, 0.02],
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
    req = _build_request(payload)
    resp = await dcf(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "fair_value_per_share_gordon" in data
    assert "fair_value_per_share_multiple" in data
    assert "wacc" in data
    assert isinstance(data["years"], list)


@pytest.mark.asyncio
async def test_endpoint_screening():
    payload = {
        "criteria": {"roe_min": 15.0},
        "companies": [
            {
                "symbol": "TCS",
                "name": "Tata Consultancy Services",
                "roe": 35.0,
                "debt_equity": 0.1,
                "market_cap": 1200000.0,
                "pe": 28.0,
                "ev_ebitda": 20.0,
                "pb": 10.0,
                "debt_ebitda": 0.2,
                "beneish_m_score": -2.8,
                "altman_z_score": 8.5,
                "piotroski_f_score": 8,
                "sales_growth_3y": 12.0,
                "profit_growth_3y": 14.0,
                "cfo_pat_ratio": 1.1,
                "fcf_positive": True,
                "dist_from_52w_high": 5.0,
            }
        ],
    }
    req = _build_request(payload)
    resp = await screening(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "results" in data
    assert len(data["results"]) == 1
    assert data["results"][0]["symbol"] == "TCS"
    assert "score" in data["results"][0]


@pytest.mark.asyncio
async def test_endpoint_relative():
    payload = {
        "target_market_cap": 50000.0,
        "target_net_debt": 5000.0,
        "target_minority_interest": 500.0,
        "target_preferred": 0.0,
        "target_ebitda": 8000.0,
        "target_eps": 25.0,
        "target_sales": 40000.0,
        "target_eps_cagr_3y": 0.15,
        "diluted_shares": 2000.0,
        "peer_symbols": ["PEER1", "PEER2"],
        "peer_market_caps": [60000.0, 45000.0],
        "peer_net_debts": [3000.0, 2000.0],
        "peer_ebitdas": [9000.0, 7000.0],
        "peer_eps": [30.0, 20.0],
        "peer_sales": [50000.0, 35000.0],
        "peer_eps_cagr_3y": [0.12, 0.18],
        "peer_diluted_shares": [2000.0, 1500.0],
    }
    req = _build_request(payload)
    resp = await relative(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "peer_ev_ebitda_median" in data
    assert "football_field" in data
    assert isinstance(data["football_field"], dict)


@pytest.mark.asyncio
async def test_endpoint_sotp():
    payload = {
        "segments": [
            {
                "name": "Core",
                "metric": 1000.0,
                "multiple": 8.0,
                "method": "EV_EBITDA",
                "conglomerate_discount": 0.10,
                "valuation_level": "EV",
                "effective_stake_pct": 100.0,
                "holdco_discount": 0.0,
            }
        ],
        "net_debt": 1000.0,
        "cash": 200.0,
        "minority_interest": 0.0,
        "diluted_shares": 100.0,
    }
    req = _build_request(payload)
    resp = await sotp(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "fair_value_per_share" in data
    assert "total_ev" in data


@pytest.mark.asyncio
async def test_endpoint_banking():
    payload = {
        "book_value": 500.0,
        "roe": 0.16,
        "cost_of_equity": 0.12,
        "growth_rate": 0.05,
        "peer_roes": [0.14, 0.15, 0.18],
        "peer_pbs": [1.8, 2.0, 2.5],
        "market_cap": 250000.0,
    }
    req = _build_request(payload)
    resp = await banking(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "justified_pb" in data
    assert "implied_price_justified_pb" in data


@pytest.mark.asyncio
async def test_endpoint_excess_return():
    payload = {
        "book_value": 1000.0,
        "net_income_forecast": [150.0, 170.0, 190.0, 210.0, 230.0],
        "cost_of_equity": 0.12,
        "growth_rate": 0.04,
        "forecast_years": 5,
        "diluted_shares": 50.0,
    }
    req = _build_request(payload)
    resp = await excess_return(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "residual_incomes" in data
    assert "fair_value_per_share" in data


@pytest.mark.asyncio
async def test_endpoint_beneish():
    payload = {
        "dsri": 1.0,
        "gmi": 1.0,
        "aqi": 1.0,
        "sgi": 1.0,
        "depi": 1.0,
        "sgai": 1.0,
        "lvgi": 1.0,
        "tata": 0.05,
    }
    req = _build_request(payload)
    resp = await beneish(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "m_score" in data
    assert "signal" in data


@pytest.mark.asyncio
async def test_endpoint_altman():
    payload = {
        "x1": 0.2,
        "x2": 0.3,
        "x3": 0.15,
        "x4": 1.5,
        "x5": 1.0,
        "is_manufacturing": True,
        "model": "original",
    }
    req = _build_request(payload)
    resp = await altman(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "z_score" in data
    assert "zone" in data


@pytest.mark.asyncio
async def test_endpoint_piotroski():
    payload = {
        "roa_positive": True,
        "cfo_positive": True,
        "roa_improving": True,
        "accruals_quality": True,
        "leverage_decreasing": True,
        "liquidity_improving": True,
        "no_dilution": True,
        "margin_improving": True,
        "turnover_improving": True,
    }
    req = _build_request(payload)
    resp = await piotroski(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "f_score" in data
    assert data["f_score"] == 9


@pytest.mark.asyncio
async def test_endpoint_portfolio():
    payload = {
        "portfolio_values": [100.0, 102.0, 101.0, 105.0],
        "benchmark_values": [100.0, 101.0, 100.5, 103.0],
        "cash_flows": [],
        "risk_free_rate": 0.07,
    }
    req = _build_request(payload)
    resp = await portfolio(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "annualized_return" in data
    assert "volatility" in data
    assert "sharpe_ratio" in data


@pytest.mark.asyncio
async def test_endpoint_corporate_actions():
    payload = {
        "action": {
            "symbol": "INFY",
            "action_type": "split",
            "ratio": 2.0,
            "ex_date": "2024-01-01",
            "record_date": "2024-01-02",
        },
        "holdings": [{"symbol": "INFY", "qty": 100.0, "avg_price": 1500.0}],
    }
    req = _build_request(payload)
    resp = await corporate_actions(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "adjusted_holdings" in data


@pytest.mark.asyncio
async def test_endpoint_ratio_analysis():
    payload = {
        "symbol": "INFY",
        "entity_type": "COMMERCIAL_CORPORATE",
        "revenue": 1000.0,
        "pat": 150.0,
    }
    req = _build_request(payload)
    resp = await ratio_analysis(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert data["symbol"] == "INFY"
    assert "ratios" in data
    assert "profitability" in data["ratios"]


@pytest.mark.asyncio
async def test_endpoint_turnaround():
    payload = {"symbol": "TATAMOTORS", "roe_t": 12.0, "roe_t_1": -5.0}
    req = _build_request(payload)
    resp = await turnaround(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert data["symbol"] == "TATAMOTORS"
    assert "turnaround_score" in data


@pytest.mark.asyncio
async def test_endpoint_hedging():
    payload = {
        "spot_price": 2500.0,
        "call_strike": 2600.0,
        "put_strike": 2400.0,
        "call_premium": 50.0,
        "put_premium": 40.0,
    }
    req = _build_request(payload)
    resp = await hedging(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "collar_max_gain" in data
    assert "collar_max_loss" in data


@pytest.mark.asyncio
async def test_endpoint_risk_score():
    payload = {"symbol": "RELIANCE", "auditor_type": "BIG4"}
    req = _build_request(payload)
    resp = await risk_score(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert data["symbol"] == "RELIANCE"
    assert "composite_score" in data


@pytest.mark.asyncio
async def test_endpoint_common_size():
    payload = {
        "symbol": "HDFC",
        "revenue": 5000.0,
        "cogs": 2000.0,
        "total_assets": 10000.0,
    }
    req = _build_request(payload)
    resp = await common_size(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert data["symbol"] == "HDFC"
    assert "pnl_common_size" in data


@pytest.mark.asyncio
async def test_endpoint_revenue_projection():
    payload = {
        "symbol": "WIPRO",
        "segments": [{"name": "IT", "revenue": 1000.0, "growth_rate": 0.1}],
    }
    req = _build_request(payload)
    resp = await revenue_projection(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert data["symbol"] == "WIPRO"
    assert "consolidated_revenue" in data


@pytest.mark.asyncio
async def test_endpoint_concall_consistency():
    payload = {
        "symbol": "ITC",
        "guidance_items": [
            {"type": "revenue", "lower": 100.0, "upper": 120.0, "actual": 110.0, "period": 1}
        ],
    }
    req = _build_request(payload)
    resp = await concall_consistency(req)
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert data["symbol"] == "ITC"
    assert "weighted_score" in data


@pytest.mark.asyncio
async def test_endpoint_prices():
    resp = await prices(symbols="TCS,INFY")
    assert resp.status_code == 200
    data = json.loads(resp.body.decode("utf-8"))
    assert "prices" in data
    assert "TCS" in data["prices"]
    assert "INFY" in data["prices"]


# Direct script execution runner
if __name__ == "__main__":
    tests = [
        ("health", test_endpoint_health),
        ("dcf", test_endpoint_dcf),
        ("screening", test_endpoint_screening),
        ("relative", test_endpoint_relative),
        ("sotp", test_endpoint_sotp),
        ("banking", test_endpoint_banking),
        ("excess-return", test_endpoint_excess_return),
        ("beneish", test_endpoint_beneish),
        ("altman", test_endpoint_altman),
        ("piotroski", test_endpoint_piotroski),
        ("portfolio", test_endpoint_portfolio),
        ("corporate-actions", test_endpoint_corporate_actions),
        ("ratio-analysis", test_endpoint_ratio_analysis),
        ("turnaround", test_endpoint_turnaround),
        ("hedging", test_endpoint_hedging),
        ("risk-score", test_endpoint_risk_score),
        ("common-size", test_endpoint_common_size),
        ("revenue-projection", test_endpoint_revenue_projection),
        ("concall-consistency", test_endpoint_concall_consistency),
        ("prices", test_endpoint_prices),
    ]

    async def _main():
        print("Running Math Engine API endpoint verification suite...")
        for name, test_fn in tests:
            await test_fn()
            print(f"  [PASS] {name}")
        print("\nAll endpoints verified successfully with valid JSON responses!")

    asyncio.run(_main())
