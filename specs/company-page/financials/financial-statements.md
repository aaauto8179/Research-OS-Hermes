# Financial Statements Viewer Tool Specification

**Tool Name:** Financial Statements Viewer  
**Category:** Financial Statements  
**Sheet:** Company Page → Financials (Step 1)  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Displays P&L, Balance Sheet, Cash Flow statements with 5-10 year history. P&L: Revenue, COGS, Gross Profit, EBITDA, EBIT, PBT, PAT, EPS. BS: Assets, Liabilities, Equity. CF: Operating, Investing, Financing. Notes to accounts. Export to Excel/PDF.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Financial Statements - [SYMBOL]                                 │
├─────────────────────────────────────────────────────────────────┤
│ STATEMENT: [P&L ▼]  PERIOD: [Annual ▼]  YEARS: [10 ▼]  UNIT: [₹Cr ▼] │
├─────────────────────────────────────────────────────────────────┤
│ P&L STATEMENT                                                   │
│ ┌────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┐ │
│ │                    │ FY20 │ FY21 │ FY22 │ FY23 │ FY24 │ TTM  │ │
│ ├────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤ │
│ │ Revenue            │ 5000 │ 5500 │ 6200 │ 7100 │ 8000 │ 8200 │ │
│ │ COGS               │ 3200 │ 3400 │ 3800 │ 4200 │ 4700 │ 4800 │ │
│ │ Gross Profit       │ 1800 │ 2100 │ 2400 │ 2900 │ 3300 │ 3400 │ │
│ │ Gross Margin %     │ 36%  │ 38%  │ 39%  │ 41%  │ 41%  │ 41%  │ │
│ │ EBITDA             │  900 │ 1050 │ 1200 │ 1450 │ 1700 │ 1750 │ │
│ │ EBITDA Margin %    │ 18%  │ 19%  │ 19%  │ 20%  │ 21%  │ 21%  │ │
│ │ Depreciation       │  200 │  220 │  250 │  280 │  300 │  310 │ │
│ │ EBIT               │  700 │  830 │  950 │ 1170 │ 1400 │ 1440 │ │
│ │ Interest           │  100 │  120 │  110 │  100 │  100 │  100 │ │
│ │ PBT                │  600 │  710 │  840 │ 1070 │ 1300 │ 1340 │ │
│ │ Tax                │  150 │  180 │  210 │  270 │  325 │  335 │ │
│ │ PAT                │  450 │  530 │  630 │  800 │  975 │ 1005 │ │
│ │ EPS (₹)            │  45  │  53  │  63  │  80  │  97  │ 100  │ │
│ └────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [P&L] [Balance Sheet] [Cash Flow] [Notes]  [Export Excel] [Export PDF] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Statement Tabs
| Tab | Key Line Items |
|-----|----------------|
| P&L | Revenue, COGS, GP, EBITDA, EBIT, PBT, PAT, EPS |
| Balance Sheet | Assets (Current, Non-current), Liabilities, Equity |
| Cash Flow | Operating, Investing, Financing, Net Change |
| Notes | Contingent liabilities, Related party, Segment, Accounting policies |

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| statements | FinancialStatement[] | Doc AI / Manual |
| period | Enum | User selection |
| unit | Enum | ₹Cr, ₹, Million, Billion |

### 3.2 Doc AI Extraction
- **Source:** Annual reports (P&L, BS, CF, Notes)
- **Extractor:** `FinancialStatementExtractor`
- **Output:** Structured tables with line items, values, periods

---

## 4. Engine Integration

### 4.1 Links
- **Ratio Analysis Engine:** Consumes financial statement line items
- **Common Size Statement:** Auto-generates vertical analysis
- **Revenue Projection:** Historical base
- **Valuation Suite:** Feeds into DCF, Relative, SOTP

---

## 4. API Contract

```typescript
interface FinancialStatementsData {
  symbol: string;
  period: 'Annual' | 'Quarterly';
  years: number;
  unit: 'Cr' | 'Lakh' | 'Million' | 'Billion';
  pl: PLStatement;
  bs: BSStatement;
  cf: CFStatement;
  notes: Note[];
  lastUpdated: string;
}

interface PLStatement {
  revenue: number[];
  cogs: number[];
  grossProfit: number[];
  ebitda: number[];
  ebit: number[];
  interest: number[];
  pbt: number[];
  tax: number[];
  pat: number[];
  eps: number[];
  margins: {
    gross: number[];
    ebitda: number[];
    net: number[];
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Tabbed layout (P&L, BS, CF, Notes), data table | Week 1 |
| 2 | Unit/period/years selectors, unit conversion | Week 1 |
| 2 | Doc AI import (P&L, BS, CF, Notes) | Week 2 |
| 3 | Excel/PDF export, Ratio Analysis link | Week 2 |

---

## 6. Testing
- Unit conversion (Cr ↔ Lakh ↔ Million)
- Period/year filtering
- Cross-statement consistency (BS balances, CF reconciles)
- Doc AI extraction accuracy
- Export formatting

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*