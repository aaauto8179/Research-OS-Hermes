# Industry Companies Table Tool Specification

**Tool Name:** Companies Table  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Master table of all companies in the industry with key metrics: revenue, EBITDA, margins, ROE, market cap, valuation multiples. Sortable, filterable, exportable. Links to Company Page deep-dive.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Companies - [INDUSTRY]                    [+ Add Co]   │
├─────────────────────────────────────────────────────────────────┤
│ COMPANIES TABLE                                                 │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ ☐  │ Symbol │ Revenue│ EBITDA │ EBITDA%│ ROE    │ P/E    │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ ☐  │ REL    │ 9.5L Cr│ 1.8L Cr│ 19%    │ 14%    │ 12x    │   │
│ │ ☐  │ IOCL   │ 8.2L Cr│ 1.2L Cr│ 15%    │ 18%    │ 8x     │   │
│ │ ☐  │ BPCL   │ 5.1L Cr│ 85K Cr │ 17%    │ 22%    │ 6x     │   │
│ │ ☐  │ HPCL   │ 4.8L Cr│ 72K Cr │ 15%    │ 16%    │ 7x     │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
│ [Columns ▼] [Filter ▼] [Sort] [Export CSV] [Bulk Add to WL]    │
├─────────────────────────────────────────────────────────────────┤
│ PEER COMPARISON CHART                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Scatter: ROE vs P/E, sized by Market Cap]                 │ │
│ │ [Quadrants: High ROE/Low PE = Value, High ROE/High PE = Quality]│ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ INDUSTRY AGGREGATE (Auto-calculated)                            │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Metric          │ Weighted│ Median │ Top 3  │ Industry Rank │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ Revenue         │ 28L Cr  │ -      │ 22L Cr │ -             │ │
│ │ EBITDA Margin   │ 18.5%   │ 17%    │ 20%    │ -             │ │
│ │ ROE             │ 16.2%   │ 17%    │ 21%    │ -             │ │
│ │ P/E             │ 10.5x   │ 8x     │ 12x    │ -             │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Industry Aggregate Calculation
```python
def industry_aggregate(companies):
    total_rev = sum(c.revenue for c in companies)
    total_ebitda = sum(c.ebitda for c in companies)
    weighted_ebitda_margin = total_ebitda / total_rev
    weighted_roe = sum(c.roe * c.equity for c in companies) / sum(c.equity for c in companies)
    weighted_pe = sum(c.pe * c.mcap for c in companies) / sum(c.mcap for c in companies)
    return {
        'total_revenue': total_rev,
        'weighted_ebitda_margin': weighted_ebitda_margin,
        'weighted_roe': weighted_roe,
        'weighted_pe': weighted_pe,
    }
```

### 3.2 Data Model
```typescript
interface IndustryCompany {
  symbol: string;
  name: string;
  revenue: number;
  ebitda: number;
  ebitdaMargin: number;
  roe: number;
  pe: number;
  pb: number;
  mcap: number;
  marketCapRank: number;
  segment: string;      // e.g., "Upstream", "Downstream", "Integrated"
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Screening Engine:** Source of company list
- **Company Page:** Click → Deep dive
- **Watchlist:** Bulk add
- **Valuation Suite:** Peer set for Relative
- **Portfolio Management:** Sector exposure

---

## 4. API Contract

```typescript
interface CompaniesTableData {
  industry: string;
  companies: IndustryCompany[];
  aggregate: IndustryAggregate;
  peerChart: { symbol: string; roe: number; pe: number; mcap: number }[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Sortable/filterable table, column picker | Week 1 |
| 2 | Peer scatter chart (ROE vs P/E), quadrants | Week 1 |
| 2 | Industry aggregate calculations | Week 1 |
| 3 | Bulk actions, export, Company Page links | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Weighted aggregates | Match manual calc |
| Peer chart | Correct quadrants |
| Sort/filter | All columns work |
| Bulk add to watchlist | Adds selected |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*