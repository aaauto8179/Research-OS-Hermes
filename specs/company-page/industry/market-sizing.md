# Market Sizing Tool Specification

**Tool Name:** Market Sizing  
**Category:** Industry Analysis  
**Sheet:** Company Page → Industry  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Interactive market sizing tool with assumption builder: TAM/SAM/SOM breakdown, bottom-up and top-down methodologies, assumption logging, CAGR projections, and sensitivity analysis. Entry box opens blank canvas for assumption building.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Industry |
| Tool | Market sizing |
| Description | For this we need an entry box for the ui but when we click it there should be open blank space where we can add our assumptions and how we came up with the value |
| Data Source | Documents Upload, Document AI |
| Sample Link | https://drive.google.com/file/d/1faCNpgpQE-MnIrV9XY2WlSmX3wFPCxU2/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Market Sizing - [SYMBOL]                                        │
├─────────────────────────────────────────────────────────────────┤
│ METHODOLOGY: [Bottom-Up ▼] [Top-Down ▼] [Hybrid ▼]             │
├─────────────────────────────────────────────────────────────────┤
│ TAM / SAM / SOM BREAKDOWN                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │ │
│ │ │     TAM     │  │     SAM     │  │     SOM     │           │ │
│ │ │  ₹5,00,000Cr│  │  ₹1,50,000Cr│  │  ₹  15,000Cr│           │ │
│ │ │ Total market│  │ Serviceable │  │ Obtainable  │           │ │
│ │ └─────────────┘  └─────────────┘  └─────────────┘           │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ASSUMPTION BUILDER (Click to expand)                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────────────────────────────────────────────────┐  │ │
│ │ │ ASSUMPTION 1: Total addressable households in India     │  │ │
│ │ │ Value: 25 Cr  │ Unit: Households  │ Source: Census 2021 │  │ │
│ │ │ Confidence: High  │ Notes: Urban 35%, Rural 65%         │  │ │
│ │ ├─────────────────────────────────────────────────────────┤  │ │
│ │ │ ASSUMPTION 2: Penetration rate of product category      │  │ │
│ │ │ Value: 12%  │ Unit: %  │ Source: Industry report 2023   │  │ │
│ │ │ Confidence: Medium  │ Notes: Urban 25%, Rural 5%        │  │ │
│ │ ├─────────────────────────────────────────────────────────┤  │ │
│ │ │ ASSUMPTION 3: Average revenue per user (ARPU)           │  │ │
│ │ │ Value: ₹2,500  │ Unit: ₹/year  │ Source: Industry avg    │  │ │
│ │ │ Confidence: High  │ Notes: Premium segment ₹5,000       │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ │ [Add Assumption] [Remove] [Duplicate]                        │  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CALCULATION ENGINE                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TAM = Σ(Assumptions) = ₹5,00,000 Cr                         │ │
│ │ SAM = TAM × Geographic Filter × Segment Filter = ₹1,50,000 Cr│ │
│ │ SOM = SAM × Market Share Target = ₹15,000 Cr                │ │
│ │ CAGR (5Y): 18.5%  │  Sensitivity: ±10% ARPU = ±₹50,000Cr  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SENSITIVITY ANALYSIS                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Assumption        │ -20%    │ -10%    │ Base    │ +10%    │ +20%│ │
│ ├───────────────────┼─────────┼─────────┼─────────┼─────────┼─────┤ │
│ │ Penetration Rate  │ 3.2L Cr │ 4.1L Cr │ 5.0L Cr │ 5.9L Cr │ 6.8L│ │
│ │ ARPU              │ 4.0L Cr │ 4.5L Cr │ 5.0L Cr │ 5.5L Cr │ 6.0L│ │
│ │ Households        │ 4.5L Cr │ 4.7L Cr │ 5.0L Cr │ 5.3L Cr │ 5.5L│ │
│ └───────────────────┴─────────┴─────────┴─────────┴─────────┴─────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Save Assumptions] [Run Monte Carlo] [Export Model] [Link to Valuation] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| methodology | Enum | Manual |
| assumptions | Assumption[] | Manual / Doc AI |
| tam_sam_som | object | Auto-calculated |
| sensitivity | SensitivityCase[] | Auto-generated |

### 3.2 Assumption Schema
```typescript
interface Assumption {
  id: string;
  description: string;
  value: number;
  unit: string;
  source: string;
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
  isEditable: boolean;
}
```

### 3.3 Calculation Engine
```python
# Bottom-Up
TAM = Σ(Assumption_values)  # or product of assumptions
SAM = TAM × Geographic_Filter × Segment_Filter
SOM = SAM × Target_Market_Share

# Top-Down
TAM = Industry_Report_Value
SAM = TAM × Serviceable_%
SOM = SAM × Obtainable_%
```

---

## 4. Engine Integration

### 4.1 Links
- **Valuation Philosophy:** Market size feeds into Bull/Base/Bear cases
- **Revenue Projection:** SOM feeds into long-term revenue ceiling
- **GRWTH Pipeline:** Market size validates project economics

---

## 4. API Contract

```typescript
interface MarketSizingData {
  symbol: string;
  methodology: 'Bottom-Up' | 'Top-Down' | 'Hybrid';
  assumptions: Assumption[];
  tam: number;
  sam: number;
  som: number;
  cagr: number;
  sensitivity: SensitivityCase[];
  monteCarlo?: MonteCarloResult;
  lastUpdated: string;
}

interface SensitivityCase {
  assumptionId: string;
  assumptionName: string;
  variations: { pct: number; tam: number; sam: number; som: number }[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | TAM/SAM/SOM cards, methodology selector | Week 1 |
| 2 | Assumption builder (canvas-style), auto-calc | Week 2 |
| 2 | Sensitivity table, Monte Carlo (optional) | Week 2 |
| 3 | Valuation link, Monte Carlo, PDF export | Week 3 |

---

## 6. Testing
- TAM/SAM/SOM calculation accuracy
- Assumption dependency tracking
- Sensitivity table accuracy
- Monte Carlo convergence (if implemented)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*