# Industry Aggregate Tool Specification

**Tool Name:** Industry Aggregate  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Auto-calculated industry-level financials aggregated from all constituent companies: consolidated P&L, Balance Sheet, Cash Flow, key ratios. Updates automatically when company data changes.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Aggregate Financials - [INDUSTRY]                      │
├─────────────────────────────────────────────────────────────────┤
│ CONSOLIDATED INCOME STATEMENT                                   │
│ ┌──────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Line Item        │ FY22   │ FY23   │ FY24   │ YoY%           │ │
│ ├──────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ Revenue          │ 25.2L  │ 27.8L  │ 28.5L  │ +2.5%          │ │
│ │ Raw Material     │ 14.1L  │ 15.3L  │ 15.1L  │ -1.3%          │ │
│ │ Employee Cost    │ 2.8L   │ 3.1L   │ 3.3L   │ +6.5%          │ │
│ │ Other Expenses   │ 4.2L   │ 4.5L   │ 4.8L   │ +6.7%          │ │
│ │ EBITDA           │ 4.1L   │ 4.9L   │ 5.3L   │ +8.2%          │ │
│ │ EBITDA %         │ 16.3%  │ 17.6%  │ 18.6%  │ +100bps        │ │
│ │ Depreciation     │ 1.2L   │ 1.3L   │ 1.4L   │ +7.7%          │ │
│ │ Interest         │ 0.8L   │ 0.7L   │ 0.6L   │ -14.3%         │ │
│ │ PBT              │ 2.1L   │ 2.9L   │ 3.3L   │ +13.8%         │ │
│ │ Tax              │ 0.5L   │ 0.7L   │ 0.8L   │ +14.3%         │ │
│ │ PAT              │ 1.6L   │ 2.2L   │ 2.5L   │ +13.6%         │ │
│ └──────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ KEY RATIOS (Weighted)                                           │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Ratio           │ FY22   │ FY23   │ FY24   │ Trend          │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ EBITDA Margin   │ 16.3%  │ 17.6%  │ 18.6%  │ ▲              │ │
│ │ Net Margin      │ 6.3%   │ 7.9%   │ 8.8%   │ ▲              │ │
│ │ ROE             │ 12.1%  │ 14.8%  │ 16.2%  │ ▲              │ │
│ │ ROCE            │ 14.5%  │ 16.2%  │ 17.8%  │ ▲              │ │
│ │ Debt/Equity     │ 0.85   │ 0.72   │ 0.65   │ ▼              │ │
│ │ Interest Cover  │ 2.6x   │ 4.1x   │ 5.5x   │ ▲              │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [View by Segment] [Export] [Link to Companies Table]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Aggregation Engine
```python
def compute_industry_aggregate(companies):
    """Weighted by revenue for P&L, by equity for BS ratios"""
    # P&L: Revenue-weighted
    total_rev = sum(c.revenue for c in companies)
    agg = {}
    for line in INCOME_STATEMENT_LINES:
        agg[line] = sum(getattr(c, line) * c.revenue / total_rev for c in companies)
    
    # Balance Sheet: Sum
    for line in BALANCE_SHEET_LINES:
        agg[line] = sum(getattr(c, line) for c in companies)
    
    # Ratios: Weighted appropriately
    agg['roe'] = sum(c.roe * c.equity for c in companies) / sum(c.equity for c in companies)
    agg['roce'] = sum(c.roce * c.capital_employed for c in companies) / sum(c.capital_employed for c in companies)
    agg['debt_equity'] = sum(c.debt for c in companies) / sum(c.equity for c in companies)
    
    return agg
```

---

## 4. Engine Integration

### 4.1 Links
- **Companies Table:** Source data
- **Industry Page (Overview):** Summary widgets
- **Screening Engine:** Industry benchmarks
- **Valuation Suite:** Industry multiples for Relative
- **Portfolio Management:** Sector benchmarks

---

## 4. API Contract

```typescript
interface IndustryAggregateData {
  industry: string;
  incomeStatement: AggregateLine[];
  balanceSheet: AggregateLine[];
  cashFlow: AggregateLine[];
  ratios: AggregateRatio[];
  bySegment: SegmentAggregate[];
  lastUpdated: string;
  companyCount: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Aggregation engine (weighted P&L, sum BS) | Week 1 |
| 2 | Ratio calculations, segment breakdown | Week 1 |
| 2 | Auto-refresh on company data change | Week 2 |
| 3 | Historical trends, export, cross-links | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Revenue-weighted P&L | Sum = industry total |
| BS sums | Assets = Liab + Equity |
| Weighted ROE | Σ(ROE×Equity)/ΣEquity |
| Auto-refresh | Triggers on company update |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*