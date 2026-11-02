# Industry Cost Drivers Tool Specification

**Tool Name:** Cost Drivers  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Analysis of cost structure drivers: raw materials, energy, labour, logistics, overhead. Tracks % of COGS, trends, pass-through ability, and hedging strategies. Sources: Uploaded reports + manual entry.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Cost Drivers - [INDUSTRY]                              │
├─────────────────────────────────────────────────────────────────┤
│ COST STRUCTURE BREAKDOWN                                        │
│ ┌────┬──────────────┬────────┬────────┬────────┬────────┬──────┐ │
│ │ #  │ Cost Item    │ % COGS │ Trend  │ Pass-  │ Hedge  │ Src │ │
│ │    │              │        │        │ Through│        │     │ │
│ ├────┼──────────────┼────────┼────────┼────────┼────────┼──────┤ │
│ │ 1  │ Raw Material │ 55%    │ ▲ 12%  │ 85%    │ Futures│ AR  │ │
│ │ 2  │ Energy       │ 18%    │ ▼ 5%   │ 60%    │ PPA    │ AR  │ │
│ │ 3  │ Labour       │ 12%    │ ▲ 8%   │ 40%    │ -      │ AR  │ │
│ │ 4  │ Logistics    │ 8%     │ ▬      │ 70%    │ Contract│ AR │ │
│ │ 5  │ Overhead     │ 7%     │ ▲ 3%   │ 30%    │ -      │ AR  │ │
│ └────┴──────────────┴────────┴────────┴────────┴────────┴──────┘ │
│ [Chart: Cost Mix Pie] [Trend: Cost % YoY] [Pass-through Waterfall]│
├─────────────────────────────────────────────────────────────────┤
│ COMPANY COST COMPARISON                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Company  │ Raw Mat% │ Energy% │ Labour% │ Total Cost/t │    │
│ ├──────────┼──────────┼─────────┼─────────┼──────────────┤    │
│ │ Co A     │ 52%      │ 16%     │ 14%     │ ₹4,200       │    │
│ │ Co B     │ 58%      │ 20%     │ 10%     │ ₹4,800       │    │
│ │ Industry │ 55%      │ 18%     │ 12%     │ ₹4,500       │    │
│ └──────────┴──────────┴─────────┴─────────┴──────────────┘    │
│ [Link to Company Cost Breakup] [Export]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Pass-through Calculation
```python
def pass_through_ability(cost_change, price_change):
    """% of cost change passed to price"""
    if cost_change == 0:
        return None
    return price_change / cost_change
```

### 3.2 Data Model
```typescript
interface CostDriver {
  item: string;
  cogsPct: number;
  trendYoY: number;
  passThrough: number;      // 0-1
  hedgeStrategy: string;    // Futures, PPA, Contract, None
  source: string;
  companyComparison: CompanyCost[];
}

interface CompanyCost {
  symbol: string;
  cogsPct: number;
  costPerUnit: number;
  efficiency: number;       // vs industry avg
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (SME → Cost Breakup):** Company-level detail
- **Valuation Suite:** Cost assumptions for DCF
- **GRWTH:** Cost assumptions for capex projects
- **Document AI:** Extract cost breakdown from reports

---

## 4. API Contract

```typescript
interface CostDriversData {
  industry: string;
  drivers: CostDriver[];
  costMix: { item: string; pct: number }[];
  passThroughAvg: number;
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Cost breakdown table, pass-through calc, charts | Week 1 |
| 2 | Company comparison table, efficiency scoring | Week 1 |
| 2 | Doc AI extraction for cost items | Week 2 |
| 3 | Cross-tab links, export | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| COGS % sum | = 100% |
| Pass-through | 0-1 range |
| Company comparison | Correct per-unit calc |
| Charts render | All types work |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*