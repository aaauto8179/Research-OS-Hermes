# Relative Valuation Engine Specification

**Tool Name:** Relative Valuation Engine  
**Category:** Valuation Engines  
**Sheet:** Tools (Master)  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Peer group comparison with multiple multiples (P/E, EV/EBITDA, P/B, EV/Sales). Automatic peer selection, football field chart, and implied valuation range with percentile ranking.

### 1.2 What this tool does NOT do
- Does not fetch peer financials (consumes pre-fetched universe)
- Does not adjust for accounting differences across peers
- Does not run DCF (separate engine)

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Tools |
| Category | Valuation |
| Tool Name | Relative Valuation |
| Description | Peer group comparison with P/E, EV/EBITDA, P/B, EV/Sales, football field chart |
| Data Source | Company financials + peer universe |
| Sample Link | (from Excel) |

---

## 3. Calculations & Logic

### 3.1 Core Formulas

#### Multiple Calculations
```python
# P/E = Market Cap / PAT
pe = market_cap / pat

# EV/EBITDA = (Market Cap + Net Debt) / EBITDA
ev_ebitda = (market_cap + net_debt) / ebitda

# P/B = Market Cap / Book Value
pb = market_cap / book_value

# EV/Sales = (Market Cap + Net Debt) / Revenue
ev_sales = (market_cap + net_debt) / revenue
```

#### Peer Selection Logic
```python
def select_peers(target_symbol, universe, criteria):
    # 1. Filter by sector (if specified)
    # 2. Filter by market cap range (if specified)
    # 3. Exclude target company
    # 4. Sort by: Market Cap similarity → Revenue similarity → Geographic proximity
    # 5. Take top N peers (default 10, max 20)
```

#### Implied Valuation
```python
for each multiple:
    peer_median = median(peer_multiples)
    implied_value = peer_median × target_metric

weighted_average = Σ(implied_value_i × weight_i)
# Weights: Equal / Market Cap / Inverse Distance
```

### 3.2 Football Field Chart Data
```json
{
  "current_price": 2950,
  "ranges": {
    "P/E": {"low": 2800, "high": 3200, "median": 3000},
    "EV/EBITDA": {"low": 2600, "high": 3100, "median": 2850},
    "P/B": {"low": 2400, "high": 2900, "median": 2650},
    "EV/Sales": {"low": 2500, "high": 3000, "median": 2750},
    "DCF": {"low": 2700, "high": 3300, "median": 3000}
  }
}
```

### 3.3 Peer Table Output
| Peer | P/E | EV/EBITDA | P/B | EV/Sales | Weight |
|------|-----|-----------|-----|----------|--------|
| RELIANCE | 22.5 | 14.2 | 2.8 | 3.1 | 15% |
| TCS | 28.4 | 19.8 | 12.5 | 6.2 | 12% |
| ... | ... | ... | ... | ... | ... |

---

## 4. API Contract

```typescript
// POST /api/math-engine/relative
interface RelativeRequest {
  target_symbol: string;
  peer_universe: "auto" | "custom";
  sector_filter?: string;
  market_cap_range?: [number, number];
  max_peers: number;  // 5-20
  multiples: ("pe" | "ev_ebitda" | "pb" | "ev_sales")[];
  aggregation: "median" | "harmonic_mean" | "weighted";
  weighting_scheme: "equal" | "market_cap" | "inverse_distance";
  target_metrics: {
    pat: number;
    ebitda: number;
    book_value: number;
    revenue: number;
    net_debt: number;
    market_cap: number;
  };
}

interface RelativeResponse {
  calculation_id: string;
  implied_valuations: {
    pe: number;
    ev_ebitda: number;
    pb: number;
    ev_sales: number;
    weighted_average: number;
  };
  football_field: FootballFieldData;
  peer_table: PeerRow[];
  peer_selection: PeerSelectionLog;
  audit: AuditTrail;
}
```

---

## 5. Golden Vector Tests (4 vectors)

| Test Case | Target | Peers | Expected Implied (₹) | Tolerance |
|-----------|--------|-------|---------------------|-----------|
| Base Auto | RELIANCE | 10 auto | 2950 (P/E), 3100 (EV/EBITDA) | 1e-6 |
| Custom Peers | TCS | 5 manual | 3650 (P/E) | 1e-6 |
| Sector Filter | HDFCBANK | Banking only | 1650 (P/B) | 1e-6 |
| Weighted Avg | INFY | 10 auto | 1520 (weighted) | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/valuation/relative.py`
- **API:** ✅ `POST /relative` in `math-engine/api/main.py`
- **Tests:** ✅ 4 golden vectors in `test_relative.py`
- **Frontend:** ⏳ `src/components/company/valuation/RelativeValuation.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*