# Industry Demand Drivers Tool Specification

**Tool Name:** Demand Drivers  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Deep-dive table for demand drivers with time-series data: historical trends, forecasts, elasticity estimates. Links to Company Page for company-specific driver exposure.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Demand Drivers - [INDUSTRY]                            │
├─────────────────────────────────────────────────────────────────┤
│ DRIVERS TABLE WITH TIME SERIES                                  │
│ ┌────┬──────────────┬────────┬────────┬────────┬────────┬──────┐ │
│ │ #  │ Driver       │ FY22   │ FY23   │ FY24   │ FY25E  │ Elast│ │
│ ├────┼──────────────┼────────┼────────┼────────┼────────┼──────┤ │
│ │ 1  │ Urbanization │ 32%    │ 34%    │ 35%    │ 36%    │ 1.2  │ │
│ │ 2  │ Income Growth│ 25%    │ 27%    │ 28%    │ 30%    │ 1.5  │ │
│ │ 3  │ Policy (PMAY)│ 18%    │ 20%    │ 22%    │ 22%    │ 0.8  │ │
│ └────┴──────────────┴────────┴────────┴────────┴────────┴──────┘ │
│ [Chart: Driver Trends] [Elasticity Heatmap] [Export]            │
├─────────────────────────────────────────────────────────────────┤
│ COMPANY EXPOSURE TO DRIVERS                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Company    │ Urbanization │ Income │ Policy │ Composite    │ │
│ ├────────────┼──────────────┼────────┼────────┼──────────────┤ │
│ │ Company A  │ High (40%)   │ Med    │ High   │ 0.85         │ │
│ │ Company B  │ Low (20%)    │ High   │ Low    │ 0.65         │ │
│ └────────────┴──────────────┴────────┴────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Elasticity Calculation
```python
def calculate_elasticity(demand_growth, driver_growth):
    """Elasticity = %ΔDemand / %ΔDriver"""
    if driver_growth == 0:
        return None
    return demand_growth / driver_growth
```

### 3.2 Data Model
```typescript
interface DemandDriverDetail {
  driver: string;
  historical: { year: string; contributionPct: number }[];
  forecast: { year: string; contributionPct: number }[];
  elasticity: number;           // %ΔDemand / %ΔDriver
  correlation: number;          // With industry demand
  companyExposure: { symbol: string; exposure: number }[];
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Industry Demand Table:** Feeds from Demand tool
- **Company Page (Story/Valuation):** Company-specific exposure
- **Valuation Suite:** Driver-based revenue projections
- **GRWTH:** Demand validation for projects

---

## 4. API Contract

```typescript
interface DemandDriversData {
  industry: string;
  drivers: DemandDriverDetail[];
  elasticityMatrix: { driver: string; elasticity: number; confidence: number }[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Time-series table, chart, elasticity calc | Week 1 |
| 2 | Company exposure mapping, composite score | Week 1 |
| 2 | Forecast models (linear, exponential) | Week 2 |
| 3 | Cross-tab links, export | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Elasticity calc | Correct formula |
| Time-series chart | Renders all years |
| Exposure mapping | Sums correctly |
| Composite score | Weighted average |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*