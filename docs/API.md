# Research OS - API Documentation

> Complete API reference for Research OS services.

## 🌐 Service Overview

| Service | Base URL | Description |
|---------|----------|-------------|
| Frontend | `http://localhost:3000` | Next.js 15 App |
| Math Engine | `http://localhost:8000` | 18 Calculation Engines |
| Data Ingestion | `http://localhost:8001` | Document Processing Pipeline |

---

## 🧮 Math Engine API (Port 8000)

**Base URL**: `http://localhost:8000`  
**Content-Type**: `application/json`  
**Serialization**: `dataclasses.asdict()` (not Pydantic `model_dump()`)

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "math-engine"
}
```

---

## 📊 Calculation Endpoints

### 1. DCF Valuation
```http
POST /dcf
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "revenue": 974819,
  "ebit": 142000,
  "depreciation": 26000,
  "capex": 35000,
  "change_nwc": 12000,
  "tax_rate": 0.25,
  "total_debt": 280000,
  "cash": 180000,
  "minority_interest": 0,
  "diluted_shares": 676.5,
  "revenue_growth_years": [0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.045, 0.04, 0.035, 0.03],
  "ebit_margin": 0.18,
  "capex_pct_revenue": 0.06,
  "nwc_pct_revenue": 0.03,
  "risk_free_rate": 0.07,
  "equity_risk_premium": 0.06,
  "beta": 1.1,
  "cost_of_debt": 0.08,
  "debt_to_value": 0.3,
  "terminal_growth_rate": 0.03,
  "exit_multiple": 8.5,
  "forecast_years": 10,
  "lease_liabilities": 50000,
  "ebitda_margin": 0.22,
  "mid_year_discounting": true
}
```

**Response:** `DCFOutputs` - Includes 10-year projections, WACC, sensitivity matrix (7×7), fair value per share (Gordon + Multiple)

---

### 2. Relative Valuation
```http
POST /relative
Content-Type: application/json

{
  "target_market_cap": 50000,
  "target_net_debt": 5000,
  "target_minority_interest": 500,
  "target_preferred": 0,
  "target_ebitda": 8000,
  "target_eps": 25,
  "target_sales": 40000,
  "target_eps_cagr_3y": 0.15,
  "diluted_shares": 2000,
  "peer_symbols": ["PEER1", "PEER2", "PEER3", "PEER4", "PEER5"],
  "peer_market_caps": [60000, 45000, 80000, 35000, 55000],
  "peer_net_debts": [3000, 2000, 8000, 1000, 4000],
  "peer_ebitdas": [9000, 7000, 12000, 5000, 8500],
  "peer_eps": [30, 20, 40, 15, 28],
  "peer_sales": [50000, 35000, 90000, 28000, 48000],
  "peer_eps_cagr_3y": [0.12, 0.18, 0.10, 0.20, 0.14],
  "peer_diluted_shares": [2000, 1500, 2500, 1000, 1800]
}
```

**Response:** `RelativeValuationOutputs` - Peer medians, implied values, football field, harmonic mean P/E

---

### 3. SOTP Valuation
```http
POST /sotp
Content-Type: application/json

{
  "segments": [
    {
      "name": "O2C",
      "metric": 450000,
      "multiple": 1.0,
      "method": "EV_EBITDA",
      "conglomerate_discount": 0,
      "valuation_level": "ENTERPRISE_VALUE",
      "effective_stake_pct": 100,
      "holdco_discount": 0
    },
    {
      "name": "Retail",
      "metric": 350000,
      "multiple": 1.0,
      "method": "EV_EBITDA",
      "conglomerate_discount": 0.15,
      "valuation_level": "ENTERPRISE_VALUE",
      "effective_stake_pct": 67,
      "holdco_discount": 0.30
    }
  ],
  "net_debt": 380000,
  "cash": 180000,
  "minority_interest": 0,
  "diluted_shares": 676.5,
  "parent_standalone_debt": 50000,
  "holdco_discount": 0.30
}
```

**Response:** `SOTPOutputs` - Segment contributions, holdco sensitivity table (20%-60%)

---

### 4. Banking Valuation
```http
POST /banking
Content-Type: application/json

{
  "book_value": 200,
  "roe": 18,
  "cost_of_equity": 14,
  "growth_rate": 5,
  "peer_roes": [15, 12, 20, 16, 14],
  "peer_pbs": [1.8, 1.2, 2.5, 2.0, 1.6],
  "market_cap": 400,
  "net_npa_per_share": 5,
  "net_dta_per_share": 2,
  "payout_ratio": 0.3,
  "forecast_years": 5
}
```

**Response:** `BankingValuationOutputs` - ABVPS, justified P/B, residual income, regression

---

### 5. Excess Return Valuation
```http
POST /excess-return
Content-Type: application/json

{
  "book_value": 1000,
  "net_income_forecast": [150, 165, 182, 200, 220],
  "cost_of_equity": 12,
  "growth_rate": 3,
  "forecast_years": 5,
  "diluted_shares": 50,
  "comprehensive_income_adj": 10,
  "omega": 0.6,
  "payout_ratio": 0.3
}
```

**Response:** `ExcessReturnOutputs` - Ohlson persistence, Clean Surplus, OCI adjustment

---

### 6. Beneish M-Score
```http
POST /beneish
Content-Type: application/json

{
  "dsri": 1.20,
  "gmi": 1.15,
  "aqi": 1.25,
  "sgi": 1.30,
  "depi": 1.10,
  "sgai": 1.05,
  "lvgi": 1.15,
  "tata": 0.08
}
```

**Response:** `BeneishOutputs` - M-Score, components, signal (MANIPULATION_LIKELY/UNLIKELY)

---

### 7. Altman Z-Score
```http
POST /altman
Content-Type: application/json

{
  "x1": 0.30,
  "x2": 0.25,
  "x3": 0.15,
  "x4": 2.50,
  "x5": 1.80,
  "is_manufacturing": true,
  "model": "original",
  "total_liabilities": 5000,
  "total_assets": 20000
}
```

**Response:** `AltmanZOutputs` - Z-score, zone (SAFE/GREY/DISTRESS), thresholds

---

### 8. Piotroski F-Score
```http
POST /piotroski
Content-Type: application/json

{
  "roa_positive": true,
  "cfo_positive": true,
  "roa_improving": true,
  "accruals_quality": true,
  "leverage_decreasing": true,
  "liquidity_improving": true,
  "no_dilution": true,
  "margin_improving": true,
  "turnover_improving": true
}
```

**Response:** `PiotroskiOutputs` - F-Score (0-9), components, interpretation

---

### 9. Portfolio Analytics
```http
POST /portfolio
Content-Type: application/json

{
  "portfolio_values": [100000, 101000, 102500, ...],
  "benchmark_values": [100000, 100800, 102000, ...],
  "cash_flows": [
    ["2023-01-01", -100000],
    ["2023-12-31", 110000]
  ],
  "risk_free_rate": 0.07
}
```

**Response:** `PortfolioMetricsOutputs` - TWR, XIRR (Brent-Dekker), Sharpe, Sortino (MAR=0), drawdown, attribution

---

### 10. Screening
```http
POST /screening
Content-Type: application/json

{
  "universe": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance Industries",
      "pe": 15,
      "ev_ebitda": 10,
      "fcf_yield": 0.06,
      "roe": 0.20,
      "roce": 0.22,
      "debt_ebitda": 1.5,
      "dist_from_52w_high": 0.05,
      "beneish_m_score": -2.5,
      "piotroski_f_score": 8,
      "market_cap": 50000,
      "market_cap_category": "LARGE"
    }
  ],
  "criteria": {
    "pe_max": 25,
    "ev_ebitda_max": 15,
    "fcf_yield_min": 0.03,
    "roe_min": 0.12,
    "roce_min": 0.14,
    "debt_ebitda_max": 3.0,
    "dist_from_52w_high_max": 0.20,
    "beneish_max": -1.78,
    "piotroski_min": 5,
    "market_cap_min": 20000,
    "market_cap_category": ["MID", "LARGE"]
  }
}
```

**Response:** `ScreeningResult[]` - Ranked, scored, filtered companies

---

### 11. Ratio Analysis
```http
POST /ratio-analysis
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "entity_type": "COMMERCIAL_CORPORATE",
  "revenue": 974819,
  "cogs": 600000,
  "ebitda": 200000,
  "ebit": 142000,
  "pat": 80000,
  "interest_expense": 15000,
  "tax_expense": 25000,
  "total_assets": 1500000,
  "current_assets": 500000,
  "cash_investments": 180000,
  "inventory": 80000,
  "receivables": 120000,
  "total_equity": 600000,
  "total_debt": 300000,
  "lease_liabilities": 50000,
  "current_liabilities": 200000,
  "payables": 80000,
  "market_cap": 1800000,
  "cmp": 2650,
  "shares_outstanding": 676.5,
  "avg_total_assets": 1400000,
  "avg_equity": 550000,
  "avg_inventory": 75000,
  "avg_receivables": 110000,
  "avg_payables": 75000,
  "revenue_prev": 850000,
  "ebitda_prev": 180000,
  "pat_prev": 70000
}
```

**Response:** `RatioAnalysisOutputs` - 40+ ratios (profitability, leverage, liquidity, efficiency, valuation, growth) + distress flags

---

### 12. Turnaround Indicator
```http
POST /turnaround
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "roe_t": 0.18,
  "roe_t_1": 0.12,
  "debt_t": 300000,
  "debt_t_1": 400000,
  "cfo_positive": true,
  "operating_margin_t": 0.18,
  "operating_margin_t_1": 0.15,
  "ebitda_t": 200000,
  "ebitda_t_1": 150000,
  "interest_coverage_t": 4.0,
  "interest_coverage_t_1": 3.0,
  "asset_turnover_t": 1.2,
  "asset_turnover_t_1": 1.0,
  "share_count_t": 676.5,
  "share_count_t_1": 676.5,
  "split_factor": 1.0,
  "min_debt_reduction": 25
}
```

**Response:** `TurnaroundOutputs` - 7 signals, score (0-100), dilution warning

---

### 13. Hedging Mechanism
```http
POST /hedging
Content-Type: application/json

{
  "spot_price": 2500,
  "call_strike": 2600,
  "put_strike": 2400,
  "call_premium": 50,
  "put_premium": 40,
  "risk_free_rate": 0.07,
  "dividend_yield": 0.01,
  "time_to_expiry_days": 30,
  "portfolio_value": 10000000,
  "futures_value": 250000,
  "hedge_ratio": 1.0,
  "nse_lot_size": 250
}
```

**Response:** `HedgingOutputs` - Collar max gain/loss, fair future price, hedge lots, basis risk, STT cost

---

### 14. Risk Score
```http
POST /risk-score
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "promoter_pledge_pct": 5,
  "rpt_pct_of_turnover": 8,
  "auditor_type": "BIG4",
  "debt_ebitda": 1.5,
  "interest_coverage": 4.0,
  "current_ratio": 1.8,
  "promoter_holding_pct": 50,
  "pledged_shares_pct": 5,
  "available_factors": ["promoter_pledge", "related_party_transactions", "auditor_quality", "leverage", "liquidity"]
}
```

**Response:** `RiskScoreOutputs` - Category scores, composite (0-100), risk level (LOW/MODERATE/HIGH/SEVERE)

---

### 15. Common Size Statement
```http
POST /common-size
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "revenue": 974819,
  "total_operating_expenses": 800000,
  "cogs": 600000,
  "employee_expenses": 50000,
  "subcontracting": 30000,
  "ebitda": 200000,
  "depreciation": 26000,
  "ebit": 174000,
  "interest": 15000,
  "interest_on_borrowings": 12000,
  "interest_on_lease_liabilities": 3000,
  "pbt": 159000,
  "tax": 40000,
  "pat": 119000,
  "total_assets": 1500000,
  "current_assets": 500000,
  "fixed_assets": 800000,
  "total_liabilities": 800000,
  "current_liabilities": 200000,
  "total_equity": 700000,
  "lease_liabilities": 50000,
  "cfo": 200000,
  "cfi": -50000,
  "cff": -80000,
  "base_type": "REVENUE",
  "cash_flow_base": "REVENUE"
}
```

**Response:** `CommonSizeOutputs` - P&L/BS/CF common size %, reconciliation check, base used

---

### 16. Revenue Projection
```http
POST /revenue-projection
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "segments": [
    { "name": "O2C", "revenue": 600000, "growth_rate": 0.05 },
    { "name": "Retail", "revenue": 300000, "growth_rate": 0.15 }
  ],
  "intersegment_eliminations": 50000,
  "ebitda_margin": 0.20,
  "depreciation_pct": 0.03,
  "tax_rate": 0.25,
  "capex_pct": 0.06,
  "nwc_change_pct": 0.02,
  "s_curve_params": { "L": 1.5, "k": 0.5, "t0": 3, "t": 1 }
}
```

**Response:** `RevenueProjectionOutputs` - Consolidated revenue, segment revenues, FCF, EBITDA, S-curve

---

### 17. Concall Consistency
```http
POST /concall-consistency
Content-Type: application/json

{
  "symbol": "RELIANCE",
  "guidance_items": [
    { "type": "revenue", "lower": 900000, "upper": 1000000, "actual": 974819, "period": 1 },
    { "type": "margin", "lower": 0.18, "upper": 0.20, "actual": 0.22, "period": 1 },
    { "type": "capex", "lower": 30000, "upper": 40000, "actual": 35000, "period": 1 }
  ],
  "lambda_decay": 0.85
}
```

**Response:** `ConcallConsistencyOutputs` - Item scores, weighted score, beat/met/miss counts

---

### 18. Corporate Actions
```http
POST /corporate-actions
Content-Type: application/json

{
  "action": {
    "symbol": "RELIANCE",
    "action_type": "bonus",
    "ex_date": "2024-01-15",
    "record_date": "2024-01-16",
    "ratio": 1.0,
    "description": "1:1 Bonus Issue"
  },
  "holdings": [
    { "symbol": "RELIANCE", "qty": 1000, "avg_price": 2000 }
  ],
  "market_price": 2650
}
```

**Response:** Adjusted holdings with fractional cash, SEBI-compliant

---

## 📄 Data Ingestion API (Port 8001)

**Base URL**: `http://localhost:8001`

### Health Check
```http
GET /health
```
**Response:**
```json
{ "status": "healthy", "service": "data-ingestion" }
```

---

### 1. Extract Text from PDF
```http
POST /extract
Content-Type: application/json

{
  "document": {
    "content": "base64_encoded_pdf"
  }
}
```

**Response:**
```json
{
  "text": "Extracted text content...",
  "tables": [
    { "rows": [["Header1", "Header2"], ["Row1Col1", "Row1Col2"]] }
  ],
  "metadata": {
    "pages": 10,
    "word_count": 5000
  }
}
```

---

### 2. Chunk Text
```http
POST /chunk
Content-Type: application/json

{
  "text": "Long document text...",
  "chunk_size": 512,
  "overlap": 50
}
```

**Response:**
```json
{
  "chunks": [
    {
      "text": "Chunk 1 text...",
      "start_idx": 0,
      "end_idx": 512,
      "metadata": { "source": "document", "chunk_index": 0 }
    }
  ]
}
```

---

### 3. Classify Document
```http
POST /classify
Content-Type: application/json

{
  "text": "Annual Report 2023-24..."
}
```

**Response:**
```json
{
  "doc_type": "ANNUAL_REPORT",
  "confidence": 0.95,
  "metadata": {
    "fiscal_year": 2024,
    "company": "RELIANCE"
  }
}
```

---

### 4. Search (Hybrid RAG)
```http
POST /search
Content-Type: application/json

{
  "query": "What is FY25 capex guidance?",
  "top_k": 5,
  "filters": {
    "symbol": "RELIANCE",
    "doc_type": "ANNUAL_REPORT"
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "chunk_id": "chunk_123",
      "text": "FY25 capex guidance is ₹1.5 lakh crore...",
      "score": 0.92,
      "citation": {
        "document_id": "doc_456",
        "page_number": 45,
        "bbox": { "x1": 0.1, "y1": 0.3, "x2": 0.9, "y2": 0.5 }
      }
    }
  ]
}
```

---

### 5. Ingest Document
```http
POST /ingest
Content-Type: multipart/form-data

file: <PDF file>
metadata: {
  "symbol": "RELIANCE",
  "doc_type": "ANNUAL_REPORT",
  "fiscal_year": 2024
}
```

**Response:**
```json
{
  "document_id": "doc_789",
  "status": "ingested",
  "chunks": 45,
  "message": "Document processed successfully"
}
```

---

### 6. PIT Transform
```http
POST /pit-transform
Content-Type: application/json

{
  "records": [
    { "symbol": "RELIANCE", "date": "2024-01-15", "revenue": 974819 },
    { "symbol": "RELIANCE", "date": "2024-04-15", "revenue": 1000000 }
  ]
}
```

**Response:**
```json
{
  "records": [
    {
      "symbol": "RELIANCE",
      "date": "2024-01-15",
      "revenue": 974819,
      "pit_timestamp": "2024-01-15T00:00:00Z",
      "filing_date": "2024-01-15"
    }
  ]
}
```

---

### 7. Embed Texts
```http
POST /embed
Content-Type: application/json

{
  "texts": ["Text 1", "Text 2", "Text 3"]
}
```

**Response:**
```json
{
  "embeddings": [
    [0.1, 0.2, ...],  // 1024 dimensions
    [0.3, 0.4, ...],
    [0.5, 0.6, ...]
  ],
  "dimension": 1024
}
```

---

## 🔐 Error Responses

All endpoints follow consistent error format:

```json
{
  "error": "Validation Error",
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 422 | Unprocessable Entity (validation) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 📝 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Calculation endpoints | 100 req/min |
| Document ingestion | 10 req/min |
| Search | 50 req/min |
| Health checks | Unlimited |

---

## 📝 Versioning

- **Current**: v1 (all endpoints under root)
- **Future**: `/api/v2/` for breaking changes
- **Deprecation**: 6 months notice

---

## 🔧 SDKs / Client Libraries

### TypeScript (Frontend)
```typescript
// lib/api.ts
const MATH_ENGINE_URL = process.env.NEXT_PUBLIC_MATH_ENGINE_URL!;

export async function calculateDCF(inputs: DCFInputs): Promise<DCFOutputs> {
  const res = await fetch(`${MATH_ENGINE_URL}/dcf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### Python (Backend/Scripting)
```python
import httpx
import dataclasses
from math_engine import DCFInputs, run_dcf

# Using convenience function
inputs = DCFInputs(...)
outputs = run_dcf(inputs)

# Or direct HTTP
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8000/dcf",
        json=dataclasses.asdict(inputs),
        timeout=30.0
    )
    data = response.json()
```

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-11-04 | Initial API with 18 calculation endpoints |
| 1.1.0 | TBD | WebSocket streaming for long calculations |
| 1.2.0 | TBD | Batch calculation endpoints |

---

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: This file + [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Internal**: @co-founder (Hermes agent)