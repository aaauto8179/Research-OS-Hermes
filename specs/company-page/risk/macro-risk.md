# Macro Risk Tool Specification

**Tool Name:** Macro Risk  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Macro/industry risk assessment: commodity price sensitivity, interest rate sensitivity, FX sensitivity, regulatory cycle position, industry cycle position, GDP growth correlation. Links to Macro Page and Industry Page.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Macro Risk - [SYMBOL]                                           │
├─────────────────────────────────────────────────────────────────┤
│ SENSITIVITY ANALYSIS                                            │
│ ┌────────────────────┬──────────┬──────────┬──────────────────┐ │
│ │ Factor             │ Beta     │ Impact   │ Scenario Impact  │ │
│ ├────────────────────┼──────────┼──────────┼──────────────────┤ │
│ │ Crude Oil (₹/bbl)  │ +0.35    │ High     │ +10% oil = -3% EBITDA│ │
│ │ USD/INR            │ -0.22    │ Medium   │ +5% USD = +1.1% EBITDA│ │
│ │ Interest Rate      │ -0.18    │ Medium   │ +100bps = -2% PAT │ │
│ │ GDP Growth         │ +0.85    │ High     │ +1% GDP = +0.85% Rev│ │
│ │ Steel Price        │ +0.42    │ High     │ +10% steel = -4% EBITDA│ │
│ └────────────────────┴──────────┴──────────┴──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CYCLE POSITIONING                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Industry Cycle: [Expansion ▼]  │ Position: Mid-Expansion   │ │
│ │ Commodity Cycle: [Peak ▼]      │ Position: Near Peak       │ │
│ │ Credit Cycle: [Expansion ▼]    │ Position: Early Expansion │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ REGULATORY ENVIRONMENT                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Pending: Carbon tax proposal (Parliament)                   │ │
│ │ Pending: PLI scheme 2.0 (Cabinet approval)                 │ │
│ │ Recent: Emission norms BS7 (Implemented Apr 2024)          │ │
│ │ Risk: High if carbon tax passes, Medium if PLI delayed     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Link to Macro Page] [Link to Industry Page] [Link to Regulations Tracker] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| sensitivities | SensitivityFactor[] | Manual / Regression |
| cycle_positions | CyclePosition[] | Macro Page / Industry Page |
| regulatory_items | RegulatoryItem[] | Regulations Tracker (Industry Page) |

### 3.2 Sensitivity Schema
```typescript
interface SensitivityFactor {
  name: string;
  beta: number;  // regression coefficient
  impact: 'High' | 'Medium' | 'Low';
  scenario: string;  // e.g., "+10% oil = -3% EBITDA"
  confidence: number;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Macro Page:** Economic indicators, sensitivities
- **Industry Page:** Regulations Tracker, cycle position
- **Risk Score Engine:** Feeds Macro Risk category

---

## 4. API Contract

```typescript
interface MacroRiskData {
  symbol: string;
  sensitivities: SensitivityFactor[];
  cyclePositions: CyclePosition[];
  regulatoryItems: RegulatoryItem[];
  lastUpdated: string;
}

interface CyclePosition {
  cycle: 'Industry' | 'Commodity' | 'Credit';
  phase: 'Expansion' | 'Peak' | 'Contraction' | 'Trough';
  position: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Sensitivity table with beta coefficients | Week 1 |
| 2 | Cycle position cards, regulatory tracker link | Week 1 |
| 2 | Macro/Industry page data integration | Week 2 |
| 3 | Regression model for beta calc (optional) | Week 2 |

---

## 6. Testing
- Beta coefficient calculation accuracy
- Cycle phase classification
- Cross-page data sync
- Sensitivity scenario calculations

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*