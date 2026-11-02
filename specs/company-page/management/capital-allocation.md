# Capital Allocation Tool Specification

**Tool Name:** Capital Allocation  
**Category:** Management & Execution  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Framework for assessing management's capital allocation decisions: CapEx vs acquisitions vs dividends vs buybacks vs debt repayment. Tracks allocation history, ROIC trends, and alignment with stated strategy. Links to Track Record and Concall Consistency.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Capital Allocation - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────────┤
│ ALLOCATION HISTORY (5Y)                                         │
│ ┌────────┬────────┬────────┬────────┬────────┬────────┬────────┐ │
│ │ Year   │ Op CF  │ CapEx  │ Acq    │ Dividend│ Buyback│ Debt  │ │
│ ├────────┼────────┼────────┼────────┼────────┼────────┼────────┤ │
│ │ FY24   │ 1200   │ 400    │ 200    │ 150     │ 100    │ 200   │ │
│ │ FY23   │ 1000   │ 350    │ 100    │ 120     │ 50     │ 180   │ │
│ │ FY22   │  850   │ 300    │  50    │ 100     │  0     │ 150   │ │
│ │ FY21   │  700   │ 250    │  0     │  80     │  0     │ 120   │ │
│ │ FY20   │  600   │ 200    │  0     │  60     │  0     │ 100   │ │
│ └────────┴────────┴────────┴────────┴────────┴────────┴────────┘ │
│ [Import from Doc AI] [Link to Track Record]                     │
├─────────────────────────────────────────────────────────────────┤
│ ROIC & RETURNS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ROIC Trend: 12% → 14% → 16% → 18% → 19%                    │ │
│ │ WACC: 12.5%  │  ROIC-WACC Spread: +6.5% (FY24)             │ │
│ │ Incremental ROIC (3Y): 22%  │  Payback Period: 2.8 yrs     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ALLOCATION QUALITY SCORECARD                                    │
│ ┌────────────────────────┬────────┬────────────────────────────┐ │
│ │ Metric                 │ Score  │ Assessment                 │ │
│ ├────────────────────────┼────────┼────────────────────────────┤ │
│ │ ROIC > WACC            │ ✅ 9/10 │ Consistently above        │ │
│ │ Incremental ROIC > 15% │ ✅ 8/10 │ Strong on new projects    │ │
│ │ FCF Conversion > 80%   │ ⚠️ 6/10 │ Improving but volatile    │ │
│ │ Debt Repayment Priority│ ✅ 9/10 │ Consistent deleveraging   │ │
│ │ Shareholder Returns    │ ⚠️ 7/10 │ Dividend growing, buyback│ │
│ └────────────────────────┴────────┴────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MANAGEMENT COMMENTARY                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Text area: Management's stated allocation framework,       │ │
│ │  priority ranking, return hurdles, flexibility]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Import from Doc AI] [Link to Track Record] [Link to Concall Consistency] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| allocation_history | AllocationYear[] | Manual / Doc AI |
| roic_trend | number[] | Auto from financials |
| wacc | number | Analyst input |
| commentary | string | Manual |

### 3.2 Allocation Schema
```typescript
interface AllocationYear {
  year: string;
  operatingCashFlow: number;
  capex: number;
  acquisitions: number;
  dividends: number;
  buybacks: number;
  debtRepayment: number;
  other: number;
}
```

---

## 4. API Contract

```typescript
interface CapitalAllocationData {
  symbol: string;
  history: AllocationYear[];
  roicTrend: number[];
  wacc: number;
  incrementalROIC: number;
  paybackPeriod: number;
  scorecard: ScorecardItem[];
  commentary: string;
  lastUpdated: string;
}

interface ScorecardItem {
  metric: string;
  score: number;  // 1-10
  assessment: string;
  status: 'pass' | 'caution' | 'fail';
}
```

---

## 5. Calculations

### 5.1 ROIC
```python
ROIC = NOPAT / (Total Assets - Current Liabilities - Excess Cash)
NOPAT = EBIT × (1 - Tax Rate)
```

### 5.2 Incremental ROIC (3Y)
```python
Inc_ROIC = (NOPAT_t - NOPAT_{t-3}) / (Invested_Capital_t - Invested_Capital_{t-3})
```

### 5.3 FCF Conversion
```python
FCF_Conversion = FCF / NOPAT
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Allocation history table + stacked bar chart | Week 1 |
| 2 | ROIC trend + incremental ROIC calc | Week 1 |
| 2 | Scorecard with auto-scoring logic | Week 2 |
| 3 | Doc AI import, cross-links | Week 2 |

---

## 6. Testing
- Allocation table data binding
- ROIC calculation accuracy
- Incremental ROIC formula
- Scorecard auto-scoring
- Cross-tab navigation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*