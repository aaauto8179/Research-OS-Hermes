# Common Size Statement Tool Specification (Financials Tab UI)

**Tool Name:** Common Size Statement (UI)  
**Category:** Financial Statements  
**Sheet:** Company Page → Financials  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Common Size Statements - [SYMBOL]                               │
├─────────────────────────────────────────────────────────────────┤
│ STATEMENT: [P&L ▼]  PERIOD: [5Y]  FORMAT: [% ▼] [₹Cr ▼]       │
├─────────────────────────────────────────────────────────────────┤
│ P&L COMMON SIZE (%)                                             │
│ ┌──────────────────┬──────┬──────┬──────┬──────┬──────┬────┐   │
│ │ Item             │ FY20 │ FY21 │ FY22 │ FY23 │ FY24 │ Δ%   │   │
│ ├──────────────────┼──────┼──────┼──────┼──────┼──────┼────┤   │
│ │ Revenue          │ 100% │ 100% │ 100% │ 100% │ 100% │ -    │   │
│ │ COGS             │ 65%  │ 63%  │ 61%  │ 59%  │ 58%  │ -7%  │   │
│ │ Gross Profit     │ 35%  │ 37%  │ 39%  │ 41%  │ 42%  │ +7%  │   │
│ │ EBITDA           │ 18%  │ 20%  │ 22%  │ 23%  │ 24%  │ +6%  │   │
│ │ EBIT             │ 14%  │ 16%  │ 18%  │ 19%  │ 20%  │ +6%  │   │
│ │ PAT              │  8%  │  9%  │ 10%  │ 11%  │ 12%  │ +4%  │   │
│ └──────────────────┴──────┴──────┴──────┴──────┴──────┴────┘   │
│ BALANCE SHEET COMMON SIZE (%)                                   │
│ ┌──────────────────┬──────┬──────┬──────┬──────┬──────┬────┐   │
│ │ Item             │ FY20 │ FY21 │ FY22 │ FY23 │ FY24 │ Δ%   │   │
│ ├──────────────────┼──────┼──────┼──────┼──────┼──────┼────┤   │
│ │ Current Assets   │ 45%  │ 48%  │ 50%  │ 52%  │ 53%  │ +8%  │   │
│ │ Net Fixed Assets │ 55%  │ 52%  │ 50%  │ 48%  │ 47%  │ -8%  │   │
│ │ Equity           │ 40%  │ 42%  │ 45%  │ 47%  │ 49%  │ +9%  │   │
│ │ Total Debt       │ 30%  │ 28%  │ 25%  │ 23%  │ 22%  │ -8%  │   │
│ └──────────────────┴──────┴──────┴──────┴──────┴──────┴────┘   │
│ [Export CSV] [YoY Change Toggle] [Peer Comparison Overlay]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 4.1 Engine
- **CommonSizeEngine** in `math-engine/src/math_engine/analysis/common_size.py`
- **API:** Embedded in analysis endpoint

---

## 4. API Contract

```typescript
interface CommonSizeData {
  symbol: string;
  pl: CommonSizePL[];
  bs: CommonSizeBS[];
  cf: CommonSizeCF[];
}

interface CommonSizePL {
  item: string;
  values: number[];  // percentages
  yoyChange: number[];
}

interface CommonSizeBS {
  item: string;
  values: number[];
  yoyChange: number[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | P&L common size table with % and YoY change | Week 1 |
| 2 | BS common size table, format toggle (%, ₹Cr) | Week 1 |
| 2 | YoY change toggle, peer comparison overlay | Week 2 |
| 3 | CSV export, Ratio Analysis link | Week 2 |

---

## 6. Testing
- Percentage calculation accuracy (Revenue = 100%)
- YoY change calculation
- BS totals = 100% (Assets = Liabilities + Equity)
- Format toggle (% ↔ ₹Cr)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*