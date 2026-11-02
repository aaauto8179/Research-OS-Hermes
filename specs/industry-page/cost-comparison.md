# Industry Cost Comparison Tool Specification

**Tool Name:** Cost Comparison  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Side-by-side cost comparison across industry companies: per-unit costs, efficiency ratios, technology vintage, scale advantages. Identifies cost leaders and laggards.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Cost Comparison - [INDUSTRY]                           │
├─────────────────────────────────────────────────────────────────┤
│ COMPARISON TABLE                                                │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Co.    │ Cap.   │ Cost/t │ Raw M  │ Energy │ Labour │   │
│ │    │        │ (MTPA) │        │ %      │ %      │ %      │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ 1  │ Co A   │ 10     │ ₹3,800 │ 50%    │ 15%    │ 12%    │   │
│ │ 2  │ Co B   │ 8      │ ₹4,200 │ 55%    │ 18%    │ 10%    │   │
│ │ 3  │ Co C   │ 5      │ ₹4,800 │ 58%    │ 20%    │ 11%    │   │
│ │ 4  │ Co D   │ 3      │ ₹5,500 │ 60%    │ 22%    │ 13%    │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
│ [Chart: Cost Curve] [Efficiency Frontier] [Scale vs Cost]      │
├─────────────────────────────────────────────────────────────────┤
│ EFFICIENCY METRICS                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Best Practice Cost: ₹3,500/t  (Co A)                        │ │
│ │ Industry Median: ₹4,500/t                                   │ │
│ │ Gap to Best: ₹1,000/t (22%)                                 │ │
│ │ Scale Advantage: 0.85 elasticity (10% scale → 8.5% cost↓)  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Export] [Link to Company Cost Breakup]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Cost Curve
```python
def cost_curve(companies):
    """Sort by cost per unit, plot cumulative capacity"""
    sorted_co = sorted(companies, key=lambda c: c.cost_per_unit)
    cum_cap = 0
    curve = []
    for c in sorted_co:
        cum_cap += c.capacity
        curve.append({'cum_capacity': cum_cap, 'cost': c.cost_per_unit})
    return curve
```

### 3.2 Data Model
```typescript
interface CostComparison {
  companies: CompanyCost[];
  costCurve: { cumCapacity: number; cost: number }[];
  bestPractice: number;
  median: number;
  scaleElasticity: number;
}

interface CompanyCost {
  symbol: string;
  capacity: number;
  costPerUnit: number;
  rawMatPct: number;
  energyPct: number;
  labourPct: number;
  technology: string;    // e.g., "BF-BOF", "EAF", "DRI-EAF"
  vintage: number;       // Plant age
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (SME → Cost Breakup):** Source data
- **Cost Drivers Tool:** Industry averages
- **Valuation Suite:** Cost assumptions
- **GRWTH:** Benchmark for new projects

---

## 4. API Contract

```typescript
interface CostComparisonData {
  industry: string;
  comparison: CostComparison;
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Comparison table, cost curve chart | Week 1 |
| 2 | Efficiency frontier, scale elasticity | Week 1 |
| 2 | Technology vintage mapping | Week 2 |
| 3 | Export, cross-tab links | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Cost curve | Monotonic non-decreasing |
| Best practice | Minimum cost |
| Scale elasticity | Negative (scale ↑ → cost ↓) |
| Technology groups | Correct clustering |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*