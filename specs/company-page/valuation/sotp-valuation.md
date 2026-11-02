# SOTP Valuation Tool Specification (Valuation Tab UI)

**Tool Name:** SOTP Valuation (UI)  
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
│ SOTP Valuation - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ SEGMENTS                                                        │
│ ┌────────┬──────────┬─────────┬──────────┬────────┬──────────┐ │
│ │ Name   │ Method   │ Gross   │ Discount │ Net    │ % of EV  │ │
│ ├────────┼──────────┼─────────┼──────────┼────────┼──────────┤ │
│ │ O2C    │ DCF      │ 8,50,000│ 0%       │ 8,50,000│ 52%     │ │
│ │ Retail │ Relative │ 4,20,000│ 10%      │ 3,78,000│ 23%     │ │
│ │ Jio    │ DCF      │ 5,80,000│ 15%      │ 4,93,000│ 25%     │ │
│ │ NewE   │ Cost     │ 75,000  │ 20%      │ 60,000  │ 3%      │ │
│ └────────┴──────────┴─────────┴──────────┴────────┴──────────┘ │
│ [Add Segment] [Import from Doc AI]                              │
├─────────────────────────────────────────────────────────────────┤
│ TOTALS                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TOTAL EV: ₹17,81,000 Cr  │  Net Debt: ₹80,000 Cr            │ │
│ │ Equity Value: ₹17,01,000 Cr  │  FV/Share: ₹2,850            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SEGMENT DETAIL (on click)                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Segment: O2C  │ Method: DCF                                 │ │
│ │ DCF Inputs: FCF₀=50,000, g=12%, tg=4%, WACC=11%             │ │
│ │ Gross: ₹8,50,000 Cr  │ Discount: 0%  │ Net: ₹8,50,000 Cr    │ │
│ │ % of EV: 52%                                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Segment] [Import from Doc AI] [Export CSV] [Link to Valuation Philosophy] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| segments | SegmentInput[] | Manual / Doc AI |
| net_debt | number | Company Page |
| shares_outstanding | number | Company Page |

### 3.2 Segment Schema
```typescript
interface SegmentInput {
  id: string;
  name: string;
  method: 'dcf' | 'relative' | 'multiple' | 'book_value';
  dcfInputs?: DCFInputs;
  relativeInputs?: RelativeValuationInputs;
  multiple?: { metric: string; value: number };
  bookValue?: number;
  holdingDiscount: number;  // 0-50%
}
```

---

## 4. Engine Integration

### 4.1 Engine
- **SOTPEngine** in `math-engine/src/math_engine/valuation/sotp.py`
- **API:** `POST /api/math-engine/sotp`

---

## 4. API Contract

```typescript
interface SOTPRequest {
  segments: SegmentInput[];
  netDebt: number;
  sharesOutstanding: number;
}

interface SOTPResponse {
  calculation_id: string;
  segments: SegmentOutput[];
  totalEV: number;
  equityValue: number;
  fairValuePerShare: number;
  audit: AuditTrail;
}

interface SegmentOutput {
  name: string;
  method: string;
  grossValue: number;
  discount: number;
  netValue: number;
  pctOfEV: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Segment table with method selector, discount input | Week 1 |
| 2 | DCF/Relative sub-forms per segment | Week 1 |
| 2 | Totals row with EV, Equity, FV/Share | Week 2 |
| 3 | Doc AI import, Valuation Philosophy link | Week 2 |

---

## 6. Testing
- Segment method switching
- Discount application (0-50%)
- Gross → Net calculation
- EV/Equity/FV totals
- Cross-link to Valuation Philosophy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*