# Banking Valuation Tool Specification (Valuation Tab UI)

**Tool Name:** Banking Valuation (UI)  
**Category:** Valuation  
**Sheet:** Company Page → Valuation  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Banking Valuation - [SYMBOL]                                    │
├─────────────────────────────────────────────────────────────────┤
│ INPUTS                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Target ROE (%): [16.2]     │ Target BV/Share: [580]         │ │
│ │ Cost of Equity (%): [13.5] │ Terminal Growth (%): [5.0]     │ │
│ │ Projection Years: [5]      │ Regression: [Original ▼]       │ │
│ │ [Recalculate]                                                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ REGRESSION & RESULTS                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ P/B = 0.8 + 8.5 × ROE                                       │ │
│ │ R² = 0.72                                                   │ │
│ │ Predicted P/B: 2.15                                         │ │
│ │ Implied Price: ₹1,245                                        │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ RESIDUAL INCOME                                             │ │
│ │ RI Value: ₹1,180                                            │ │
│ │ PV RI: 420  |  PV Terminal: 380  |  Book Value: 380        │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ PEER REGRESSION TABLE                                           │
│ ┌────────────┬──────┬─────┬───────┬──────────┐                 │
│ │ Peer       │ ROE  │ P/B │ Pred. │ Residual │                 │
│ ├────────────┼──────┼─────┼───────┼──────────┤                 │
│ │ HDFCBANK   │ 16.2%│ 2.3 │ 2.17  │ +0.13    │                 │
│ │ ICICIBANK  │ 14.8%│ 2.1 │ 2.05  │ +0.05    │                 │
│ │ SBIN       │ 12.5%│ 1.4 │ 1.86  │ -0.46    │                 │
│ └────────────┴──────┴─────┴───────┴──────────┘                 │
├─────────────────────────────────────────────────────────────────┤
│ [Recalculate] [Export CSV] [Link to Valuation Philosophy]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| target_roe | number | Manual / Ratio Engine |
| target_bvps | number | Manual / Financial Statements |
| coe | number | Manual |
| terminal_growth | number | Manual |
| projection_years | integer | Manual |
| regression_model | enum | Manual (Original/Revised/Emerging) |

---

## 4. Engine Integration

### 4.1 Engine
- **BankingValuationEngine** in `math-engine/src/math_engine/valuation/banking.py`
- **API:** `POST /api/math-engine/banking`

---

## 4. API Contract

```typescript
interface BankingValuationRequest {
  target_roe: number;
  target_bvps: number;
  cost_of_equity: number;
  terminal_growth: number;
  projection_years: number;
  regression_model: 'original' | 'revised' | 'emerging';
}

interface BankingValuationResponse {
  calculation_id: string;
  predicted_pb: number;
  implied_price: number;
  ri_value: number;
  pv_ri: number;
  pv_terminal: number;
  book_value: number;
  peer_regression: PeerRegressionRow[];
  regression_stats: { alpha: number; beta: number; r2: number };
  audit: AuditTrail;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Input form, regression display, implied price | Week 1 |
| 2 | Residual income cross-check table | Week 1 |
| 2 | Peer regression table with residuals | Week 2 |
| 3 | Doc AI import (peer data), Valuation Philosophy link | Week 2 |

---

## 6. Testing
- P/B-ROE regression accuracy
- Residual income cross-check
- Peer regression table rendering
- Regression model switching

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*