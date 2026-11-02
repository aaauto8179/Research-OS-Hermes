# Excess Return Valuation Tool Specification (Valuation Tab UI)

**Tool Name:** Excess Return Valuation (UI)  
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
│ Excess Return Valuation - [SYMBOL]                              │
├─────────────────────────────────────────────────────────────────┤
│ INPUTS                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Current BV/Share: [380]     │ ROE Forecast: [18,17.5,17,16.5,16] │ │
│ │ Payout Ratio (%): [30]      │ Cost of Equity (%): [13.5]          │ │
│ │ Terminal ROE (%): [14.0]    │ Terminal Growth (%): [5.0]          │ │
│ │ Projection Years: [5]       │ Shares Outstanding: [100]           │ │
│ │ [Recalculate]                                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ PROJECTION TABLE                                                │
│ ┌──────┬──────────┬────────┬────────┬──────────┐               │
│ │ Year │ B_t      │ ROE_t  │ RI_t     │ PV(RI_t) │             │
│ ├──────┼──────────┼────────┼──────────┼──────────┤               │
│ │ 0    │ 380.0    │ -      │ -        │ -        │               │
│ │ 1    │ 418.0    │ 18.0%  │ 45.6     │ 40.2     │               │
│ │ 2    │ 458.2    │ 17.5%  │ 42.8     │ 34.1     │               │
│ │ 3    │ 499.0    │ 17.0%  │ 39.5     │ 28.2     │               │
│ │ 4    │ 539.9    │ 16.5%  │ 35.8     │ 22.8     │               │
│ │ 5    │ 580.3    │ 16.0%  │ 31.8     │ 18.1     │               │
│ │ TV   │ -        │ 14.0%  │ 245.6    │ 112.4    │               │
│ └──────┴──────────┴────────┴──────────┴──────────┘               │
├─────────────────────────────────────────────────────────────────┤
│ RESULTS                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Book Value: ₹380 Cr  │ PV of RI: ₹143.4 Cr  │ PV Terminal: ₹112.4 Cr │ │
│ │ Equity Value: ₹635.8 Cr  │ FV/Share: ₹1,271.6                │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Recalculate] [Export CSV] [Link to Valuation Philosophy]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| bvps_0 | number | Manual / Financial Statements |
| roe_forecast | number[] | Manual (5 years) |
| payout_ratio | number | Manual |
| coe | number | Manual |
| terminal_roe | number | Manual |
| terminal_growth | number | Manual |
| projection_years | integer | Manual |
| shares_outstanding | number | Company Page |

---

## 4. Engine Integration

### 4.1 Engine
- **ExcessReturnEngine** in `math-engine/src/math_engine/valuation/excess_return.py`
- **API:** `POST /api/math-engine/excess-return`

---

## 4. API Contract

```typescript
interface ExcessReturnRequest {
  bvps_0: number;
  roe_forecast: number[];
  payout_ratio: number;
  coe: number;
  terminal_roe: number;
  terminal_growth: number;
  projection_years: number;
  shares_outstanding: number;
}

interface ExcessReturnResponse {
  calculation_id: string;
  projection: ProjectionRow[];
  book_value_0: number;
  pv_ri: number;
  pv_terminal_ri: number;
  equity_value: number;
  fair_value_per_share: number;
  audit: AuditTrail;
}

interface ProjectionRow {
  year: number;
  b_t: number;
  roe_t: number;
  ri_t: number;
  pv_ri_t: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Input form, projection table rendering | Week 1 |
| 2 | Results display with BV, PV RI, PV Terminal, Equity Value | Week 1 |
| 2 | ROE forecast array input (comma-separated or table) | Week 2 |
| 3 | Valuation Philosophy link, CSV export | Week 2 |

---

## 6. Testing
- Projection table calculations (B_t, RI_t, PV)
- Terminal RI calculation
- Equity value = B_0 + ΣPV(RI) + PV(TV)
- FV/Share = Equity Value / Shares Outstanding

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*