# Segment Breakup Tool Specification

**Tool Name:** Segment Breakup  
**Category:** Financial Statements  
**Sheet:** Company Page → Financials (Step 2)  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Breakup of different revenue streams by segment: historical revenue, EBITDA, margins, growth rates, and contribution %. Interactive table with YoY/QoQ growth, sparklines, and segment-level valuation links.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Segment Breakup - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [FY24 ▼]  [Annual ▼]  [Quarterly ▼]  [Compare YoY ▼]   │
├─────────────────────────────────────────────────────────────────┤
│ SEGMENT REVENUE & PROFITABILITY                                 │
│ ┌────────────┬────────┬────────┬────────┬────────┬────────┐    │
│ │ Segment    │ Revenue│ YoY%   │ EBITDA │ Margin% │ Contrib% │ │
│ ├────────────┼────────┼────────┼────────┼────────┼────────┤    │
│ │ O2C        │ 5,500  │ +15%   │ 1,200  │ 21.8%   │ 60%    │ │
│ │ Retail     │ 2,100  │ +22%   │  400   │ 19.0%   │ 23%    │ │
│ │ Jio        │ 1,400  │ +18%   │  350   │ 25.0%   │ 15%    │ │
│ │ Others     │  200   │ +10%   │   20   │ 10.0%   │  2%    │ │
│ └────────────┴────────┴────────┴────────┴────────┴────────┘    │
├─────────────────────────────────────────────────────────────────┤
│ SEGMENT TRENDS (5Y Sparklines)                                  │
│ ┌────────────┬────────────────────────────────────────────────┐ │
│ │ O2C        │ ▁▂▃▅▆▇ (Revenue)    ▁▂▃▅▇ (EBITDA)             │ │
│ │ Retail     │ ▁▂▃▅▆▇▇▇ (Revenue) ▁▂▃▅▆▇ (EBITDA)             │ │
│ │ Jio        │ ▁▂▃▅▆▇▇▇▇ (Revenue) ▁▂▃▅▆▇▇▇ (EBITDA)          │ │
│ └────────────┴────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Export CSV] [Link to Revenue Projection] [Link to Valuation]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| segments | SegmentData[] | Financial Statements / Doc AI |

### 3.2 Segment Schema
```typescript
interface SegmentData {
  name: string;
  revenue: number;
  revenue_yoy: number;
  ebitda: number;
  ebitda_margin: number;
  contribution_pct: number;
  historical_revenue: number[];
  historical_ebitda: number[];
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Revenue Projection:** Feeds into projections
- **Valuation Suite:** Segment-level valuation in SOTP
- **Document AI:** Extracts segment data from annual reports

---

## 4. API Contract

```typescript
interface SegmentBreakupData {
  symbol: string;
  period: string;
  segments: SegmentData[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Segment table with YoY%, sparklines | Week 1 |
| 2 | Quarterly/Annual toggle, YoY comparison | Week 1 |
| 2 | Doc AI import (segment reporting) | Week 2 |
| 3 | CSV export, Revenue Projection link | Week 2 |

---

## 5. Testing
- YoY% calculation accuracy
- Sparkline rendering
- Contribution % sum = 100%
- Cross-tab links

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*