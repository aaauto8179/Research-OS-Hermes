# Generate Ideas Tool Specification

**Tool Name:** Generate Ideas (Screening)  
**Sheet:** Generate ideas  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Multi-factor screening engine UI: 10 standard factors with configurable weights, hard filters, percentile ranking, and ranked results. Save/load screens, export to watchlist.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Generate Ideas - Multi-Factor Screening                         │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS                  │ RESULTS                              │
│ ┌─────────────────────┐  │ ┌────────────────────────────────┐ │
│ │ P/E: [ ] - [25]    │  │ │ Rank │ Symbol │ Score │ P/E  │ │
│ │ EV/EBITDA: [ ]-[15]│  │ ├──────┼────────┼───────┼──────┤ │
│ │ FCF Yield: [3%] -  │  │ │ 1    │ RELIANCE│ 87.2 │ 22.1 │ │
│ │ ROE: [15%] -       │  │ │ 2    │ TCS     │ 84.5 │ 28.4 │ │
│ │ ROCE: [12%] -      │  │ │ 3    │ HDFCBANK│ 82.1 │ 18.2 │ │
│ │ D/E: [ ] - [1.0]   │  │ │ ...  │ ...     │ ...  │ ...  │ │
│ │ F-Score: [6] -     │  │ │ 50   │ SBIN    │ 45.2 │ 12.5 │ │
│ │ Mkt Cap: [1000]-[ ]│  │ └────────────────────────────────┘ │
│ │ Category: [All ▼]  │  │ [Export CSV] [Add to Watchlist]    │
│ └─────────────────────┘  │ [Save Screen] [Load Template]      │
│ [Run Screening]          │                                     │
├─────────────────────────────────────────────────────────────────┤
│ FACTOR WEIGHTS (Customizable)                                   │
│ P/E: 15% | EV/EBITDA: 15% | FCF Yield: 10% | ROE: 15% | ROCE: 10% │
│ Debt/Equity: 10% | F-Score: 10% | Beneish: 5% | Altman: 5% | Mom: 5% │
│ [Reset to Default] [Save Weights]                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Engine
- **ScreeningEngine** in `math-engine/src/math_engine/screening/engine.py`
- **API:** `POST /api/math-engine/screening`

### 3.2 Factors (10 Standard)
| Factor | Formula | Direction | Weight |
|--------|---------|-----------|--------|
| P/E | Market Cap / PAT | Lower Better | 15% |
| EV/EBITDA | (MC+Debt-Cash)/EBITDA | Lower Better | 15% |
| FCF Yield | CFO / Market Cap | Higher Better | 10% |
| ROE | PAT / Equity | Higher Better | 15% |
| ROCE | EBIT / (TA-CL) | Higher Better | 10% |
| Debt/Equity | Debt / Equity | Lower Better | 10% |
| F-Score | Piotroski | Higher Better | 10% |
| Beneish M | M-Score | Lower Better | 5% |
| Altman Z | Z-Score | Higher Better | 5% |
| Momentum 6M | Price Change | Higher Better | 5% |

### 3.3 Screening Process
```python
1. Apply hard filters (criteria)
2. For each factor: calculate percentile rank in universe
3. Score = Σ(percentile × weight)
4. Rank by total score (descending)
```

---

## 4. API Contract

```typescript
interface ScreeningRequest {
  criteria: {
    min_roe?: number;
    max_pe?: number;
    max_ev_ebitda?: number;
    min_fcf_yield?: number;
    min_roce?: number;
    max_debt_equity?: number;
    min_f_score?: number;
    max_beneish?: number;
    min_altman_z?: number;
    min_momentum_6m?: number;
    min_market_cap?: number;
    max_market_cap?: number;
    sector?: string;
  };
  universe: CompanySnapshot[];  // or 'all'
  weights?: FactorWeights;
  max_results?: number;
}

interface ScreeningResponse {
  results: ScreeningResult[];
  universe_size: number;
  filters_applied: object;
}

interface ScreeningResult {
  symbol: string;
  name: string;
  score: number;
  rank: number;
  factors: { [factor: string]: { value: number; percentile: number } };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Filter panel, factor weight editor | Week 1 |
| 2 | Results table with sortable columns, percentile badges | Week 1 |
| 2 | Save/load screens, export to watchlist | Week 2 |
| 3 | Factor weight presets, custom formula builder | Week 2 |

---

## 5. Testing
- Hard filter application
- Percentile rank calculation
- Weighted scoring accuracy
- Screen save/load
- Export to watchlist

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*