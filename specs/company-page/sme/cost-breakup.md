# Cost Breakup Tool Specification

**Tool Name:** Cost Breakup  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Cost structure analysis: detailed cost breakdown by category (Raw Materials, Energy, Logistics, Labor, Finance, Regulatory). Trend analysis, company vs industry comparison, pass-through ability tracking. Links to Common Size Statement engine.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Cost Breakup - [SYMBOL]                                         │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [FY24]  VIEW: [Share % ▼] [Inflation ▼] [Trend ▼]      │
├─────────────────────────────────────────────────────────────────┤
│ COST STRUCTURE (Industry Avg)           │ COMPANY COMPARISON   │
│ ┌──────────────┬──────┬──────┬────────┐ │ ┌────────────────┐  │
│ │ Category     │ Share│ YoY% │ Trend │ │ │ Company │ Cost% │  │
│ ├──────────────┼──────┼──────┼────────┤ │ ├────────────────┤  │
│ │ Raw Material │ 55%  │ +12% │ ████▲  │ │ │ TATAMOTORS│ 52% │  │
│ │ Steel        │ 28%  │ +15% │ ████▲  │ │ │ M&M       │ 58% │  │
│ │ Aluminum     │ 12%  │ +8%  │ ██▲    │ │ │ BAJAJ     │ 48% │  │
│ │ Chemicals    │ 15%  │ +10% │ ███▲   │ │ │ Industry  │ 55% │  │
│ │ Energy       │ 18%  │ +5%  │ ██▲    │ │ └────────────────┘  │
│ │ Power        │ 10%  │ +3%  │ █▲     │ │ PASS-THROUGH         │
│ │ Fuel         │ 8%   │ +8%  │ ██▲    │ │ Steel: 85%           │
│ │ Logistics    │ 12%  │ +6%  │ ██▲    │ │ Aluminum: 70%       │
│ │ Labor        │ 8%   │ +7%  │ ██▲    │ │ Chemicals: 60%      │
│ │ Finance      │ 5%   │ -2%  │ █▼     │ │ Energy: 40%         │
│ │ Other        │ 2%   │ +3%  │ █▲     │ └────────────────────┘  │
│ └──────────────┴──────┴──────┴────────┘ │ COST ADVANTAGE       │
│ [Input Price Indices] [Substitution Tracker] │ TATA vs Ind: -3% │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| period | string | Manual |
| industry_costs | CostCategory[] | Industry Reports / Doc AI |
| company_costs | CompanyCost[] | Financial Statements / Doc AI |

### 3.2 Schema
```typescript
interface CostCategory {
  category: string;
  subCategories: SubCategory[];
  share: number;
  yoyChange: number;
  trend: 'Up' | 'Down' | 'Stable';
}

interface SubCategory {
  name: string;
  share: number;
  yoyChange: number;
  trend: 'Up' | 'Down' | 'Stable';
  priceIndex?: string;  // e.g., 'LME Steel', 'MCX Crude'
}

interface CompanyCost {
  company: string;
  costCategories: { [category: string]: number };  // % of COGS
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Common Size Statement Engine:** Cost % of revenue
- **Industry Page (Cost Drivers):** Industry cost drivers
- **Revenue Projection:** Cost assumptions feed into projections

---

## 4. API Contract

```typescript
interface CostBreakupData {
  symbol: string;
  period: string;
  industryCosts: CostCategory[];
  companyComparison: CompanyCost[];
  passThrough: PassThrough[];
  costAdvantage: CostAdvantage[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Industry cost structure table with share/YoY/trend | Week 1 |
| 2 | Company comparison table, pass-through, cost advantage | Week 1 |
| 2 | Input price indices, substitution tracker | Week 2 |
| 3 | Common Size engine link, CSV export | Week 2 |

---

## 6. Testing
- Share % sum = 100% validation
- YoY% calculation accuracy
- Company comparison data binding
- Pass-through calculation accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*