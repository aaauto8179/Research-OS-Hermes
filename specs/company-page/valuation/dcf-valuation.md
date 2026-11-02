# DCF Valuation Tool Specification (Company Page UI)

**Tool Name:** DCF Valuation (UI)  
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
│ DCF Valuation - [SYMBOL]                                        │
├──────────────────────────┬──────────────────────────────────────┤
│ INPUTS                   │ RESULTS                              │
│ ┌──────────────────────┐ │ ┌─────────────┐ ┌─────────────┐     │
│ │ FCF₀ (₹Cr): [ 1000 ] │ │ │ Enterprise  │ │ Equity Val  │     │
│ │ Growth Rate (%): [15]│ │ │ Value:      │ │ ue:         │     │
│ │ Terminal Growth: [4] │ │ │ 1,85,000 Cr │ │ 1,70,000 Cr │     │
│ │ WACC (%): [12]       │ │ └─────────────┘ └─────────────┘     │
│ │ Terminal Method: [G] │ │ ┌─────────────────────────────────┐ │
│ │ Exit Multiple: [12]  │ │ │ SENSITIVITY MATRIX              │ │
│ │ Net Debt (₹Cr): [500]│ │ │ WACC↓/g→  2.0%  2.5%  3.0% 3.5%│ │
│ │ Shares Out (Cr): [100]│ │ │ 10.0%   1450  1520  1600 1690 │ │
│ └──────────────────────┘ │ │ 11.0%   1320  1380  1450 1520 │ │
│ [Recalculate] [Reset]    │ │ 12.0%   1210  1260  1320 1380 │ │
│                          │ │ 13.0%   1110  1150  1200 1250 │ │
│                          │ │ 14.0%   1020  1060  1090 1130 │ │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## 4. Engine Integration
- **Backend:** `DCFEngine` in `math-engine/src/math_engine/valuation/dcf.py`
- **API:** `POST /api/math-engine/dcf`
- **Inputs:** All fields above + optional tax_rate, projection_years
- **Output:** Enterprise value, Equity value, FV/share, PV FCFF, PV TV, Sensitivity matrix (9×9)

---

## 5. Features
- Real-time recalculation on input change (debounced 300ms)
- Sensitivity matrix: WACC ±2% (0.5% steps) × Terminal Growth ±1% (0.25% steps)
- Base case cell highlighted, invalid cells (WACC ≤ g) red with "N/A"
- Audit trail button → opens modal with calculation steps
- Export CSV of inputs + outputs + matrix

---

## 6. Implementation Plan
- **Component:** `DCFValuation.tsx` in `src/components/company/valuation/`
- **WidgetRegistry:** `"dcf-valuation"`
- **Hook:** `useDCFValuation(symbol)` with SWR for auto-fetch

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*