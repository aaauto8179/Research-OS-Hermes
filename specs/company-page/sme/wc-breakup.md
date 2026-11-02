# WC Breakup Tool Specification

**Tool Name:** WC Breakup  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Working capital breakup: inventory days, receivables days, payables days, cash conversion cycle. Trend analysis, peer comparison, component-level drivers (inventory: raw/WIP/FG, receivables: domestic/export, payables: trade/expense). Links to Revenue Projection and Cash Flow engines.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ WC Breakup - [SYMBOL]                                           │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [FY24]  [Annual ▼] [Quarterly ▼]  [Compare YoY ▼]      │
├─────────────────────────────────────────────────────────────────┤
│ CASH CONVERSION CYCLE                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CCC: 45 days  │ Trend: ▼ Improving  │ Peer Avg: 52 days    │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Inventory Days: 55  │ Receivables Days: 35  │ Payables Days: 45│ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ INVENTORY BREAKDOWN                                             │
│ ┌─────────────────┬───────┬───────┬───────┬────────┬────────┐  │
│ │ Component       │ Days  │ Value │ % Inv │ YoY%   │ Trend  │ │
│ ├─────────────────┼───────┼───────┼───────┼────────┼────────┤ │
│ │ Raw Material    │ 20    │ 500   │ 35%   │ -5%    │ ▼      │ │
│ │ WIP             │ 10    │ 150   │ 10%   │ +2%    │ ▲      │ │
│ │ Finished Goods  │ 25    │ 600   │ 55%   │ +3%    │ ▲      │ │
│ └─────────────────┴───────┴───────┴───────┴────────┴────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ RECEIVABLES BREAKDOWN                                           │
│ ┌─────────────────┬───────┬───────┬───────┬────────┬────────┐  │
│ │ Type            │ Days  │ Value │ % Rec │ YoY%   │ Trend  │ │
│ ├─────────────────┼───────┼───────┼───────┼────────┼────────┤  │
│ │ Domestic        │ 30    │ 800   │ 70%   │ +5%    │ ▲      │ │
│ │ Export          │ 45    │ 350   │ 30%   │ -2%    │ ▼      │ │
│ └─────────────────┴───────┴───────┴───────┴────────┴────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ PAYABLES BREAKDOWN                                              │
│ ┌─────────────────┬───────┬───────┬───────┬────────┬────────┐  │
│ │ Type            │ Days  │ Value │ % Pay │ YoY%   │ Trend  │ │
│ ├─────────────────┼───────┼───────┼───────┼────────┼────────┤  │
│ │ Trade Payables  │ 40    │ 900   │ 80%   │ +5%    │ ▲      │ │
│ │ Expense Payables│ 50    │ 225   │ 20%   │ -2%    │ ▼      │ │
│ └─────────────────┴───────┴───────┴───────┴────────┴────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ TREND (5Y)                                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ CCC: 65 ──●──●──●──●──●── 45 (Improving)                    │ │
│ │ Inv:  70 ──●──●──●──●──●── 55                                │ │
│ │ Rec:  40 ──●──●──●──●──●── 35                                │ │
│ │ Pay:  45 ──●──●──●──●──●── 45                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Export CSV] [Link to Revenue Projection] [Link to Cash Flow]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| wc_components | WCComponent[] | Financial Statements / Doc AI |

### 3.2 Schema
```typescript
interface WCComponent {
  category: 'Inventory' | 'Receivables' | 'Payables';
  subComponents: SubComponent[];
  days: number;
  value: number;
  yoyChange: number;
}

interface SubComponent {
  name: string;
  days: number;
  value: number;
  pctOfCategory: number;
  yoyChange: number;
  trend: 'Up' | 'Down' | 'Stable';
}
```

### 3.3 Calculations
```python
# CCC = Inventory Days + Receivables Days - Payables Days
ccc = inv_days + rec_days - pay_days

# Inventory Days = (Avg Inventory / COGS) * 365
inv_days = (avg_inventory / cogs) * 365

# Receivables Days = (Avg Receivables / Revenue) * 365
rec_days = (avg_receivables / revenue) * 365

# Payables Days = (Avg Payables / COGS) * 365
pay_days = (avg_payables / cogs) * 365
```

---

## 4. Engine Integration

### 4.1 Links
- **Revenue Projection:** WC assumptions feed into projections
- **Cash Flow Engine:** WC changes drive operating cash flow
- **Financial Statements:** Base data from BS/P&L

---

## 4. API Contract

```typescript
interface WCBreakupData {
  symbol: string;
  period: string;
  ccc: number;
  cccTrend: 'Improving' | 'Stable' | 'Deteriorating';
  inventory: WCSubComponent[];
  receivables: WCSubComponent[];
  payables: WCSubComponent[];
  trend5Y: {
    ccc: number[];
    inventory: number[];
    receivables: number[];
    payables: number[];
  };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | CCC cards, component breakdown tables | Week 1 |
| 2 | 5Y trend charts, peer comparison | Week 1 |
| 2 | Doc AI import (WC notes from annual report) | Week 2 |
| 3 | Revenue Projection link, Cash Flow link, CSV export | Week 2 |

---

## 6. Testing
- CCC calculation accuracy (Inv + Rec - Pay)
- Component day calculations
- 5Y trend rendering
- Cross-tab links (Revenue Projection, Cash Flow)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*