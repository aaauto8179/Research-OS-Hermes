# GRWTH Pipeline Tool Specification

**Tool Name:** GRWTH Pipeline  
**Sheet:** GRWTH  
**Spec Version:** 1.0.0  
**Status:** 🔄 Design Phase  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Capital expenditure pipeline tracker with 11 stages: Announced → Feasibility → Approval → Land Acquisition → Groundbreaking → Construction → Commissioning → Ramp-up → Commercial → Stabilization → Harvest. Kanban/Gantt/Table/Calendar views. Revenue accretion modeling, IRR calculation, risk scoring.

---

## 3. UI/UX Specification

### 3.1 Layout (Kanban View)
```
┌─────────────────────────────────────────────────────────────────┐
│ GRWTH Pipeline - [PORTFOLIO/COMPANY]                            │
├─────────────────────────────────────────────────────────────────┤
│ VIEW: [Kanban ▼] [Gantt] [Table] [Calendar]  [Add Project]     │
├─────────────────────────────────────────────────────────────────┤
│ STAGE COLUMNS (Drag-drop between stages)                       │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│ │ Announced   │ │ Feasibility │ │ Approval    │ │ Land Acq.  │ │
│ │ (3)         │ │ (2)         │ │ (1)         │ │ (2)        │ │
│ │ ─────────── │ │ ─────────── │ │ ─────────── │ │ ────────── │ │
│ │ 🟢 Green H2 │ │ 🔵 Solar Pk │ │ 🟣 Wind Farm│ │ 🟠 Gas Pwr │ │
│ │ ₹2,000 Cr   │ │ ₹1,500 Cr  │ │ ₹3,000 Cr  │ │ ₹800 Cr   │ │
│ │ FY25 Q2     │ │ FY25 Q3     │ │ FY25 Q4     │ │ FY26 Q1   │ │
│ │ ─────────── │ │ ─────────── │ │ ─────────── │ │ ────────── │ │
│ │ 🟢 Green H2 │ │ 🔵 Solar Pk │ │ 🟣 Wind Farm│ │ 🟠 Gas Pwr │ │
│ │ ₹2,000 Cr   │ │ ₹1,500 Cr  │ │ ₹3,000 Cr  │ │ ₹800 Cr   │ │
│ │ FY25 Q2     │ │ FY25 Q3     │ │ FY25 Q4     │ │ FY26 Q1   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│ │ Groundbreak │ │ Construct   │ │ Commission  │ │ Ramp-up    │ │
│ │ (1)         │ │ (2)         │ │ (1)         │ │ (1)        │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│ │ Commercial  │ │ Stabilize   │ │ Harvest     │                │
│ │ (1)         │ │ (0)         │ │ (0)         │                │
│ └─────────────┘ └─────────────┘ └─────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│ PROJECT CARD (on click)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Project: Green Hydrogen Plant (2MT)                         │ │
│ │ Stage: Approval  │ Capex: ₹2,000 Cr  │ IRR: 18.5%           │ │
│ │ Location: Gujarat  │ Timeline: FY25 Q4 - FY27 Q2           │ │
│ │ Revenue Ramp: S-curve (FY27: 30%, FY28: 70%, FY29: 100%)   │ │
│ │ Risk Score: 32/100 │ Key Risks: Land, Water, Policy        │ │
│ │ [Edit] [Documents] [Risk] [Financials] [Timeline] [Delete]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Project Schema
```typescript
interface GRWTHProject {
  id: string;
  name: string;
  stage: Stage;  // 11 stages
  capex: number;  // ₹ Cr
  irr: number;
  location: string;
  timeline: { start: string; end: string };
  revenueRamp: RampPoint[];
  riskScore: number;
  risks: Risk[];
  documents: Document[];
  financials: FinancialModel;
  lastUpdated: string;
}

type Stage = 'Announced' | 'Feasibility' | 'Approval' | 'LandAcquisition' | 
  'Groundbreaking' | 'Construction' | 'Commissioning' | 'RampUp' | 
  'Commercial' | 'Stabilization' | 'Harvest';
```

---

## 4. Engine Integration

### 4.1 Engines
| Engine | Purpose |
|--------|---------|
| Revenue Accretion | S-curve ramp modeling |
| IRR Calculator | Project-level IRR |
| Risk Scorer | 5-factor risk model |

### 4.2 Links
- **Company Page (SME tab):** CapEx projects
- **Valuation Suite:** SOTP segment valuation
- **Document AI:** Project documents
- **Valuation Philosophy:** Project as growth driver

---

## 4. API Contract

```typescript
interface GRWTHProjectResponse {
  id: string;
  name: string;
  stage: Stage;
  capex: number;
  irr: number;
  location: string;
  timeline: { start: string; end: string };
  revenueRamp: { year: number; pctComplete: number; revenue: number }[];
  riskScore: number;
  risks: Risk[];
  financials: {
    npv: number;
    paybackPeriod: number;
    sensitivity: { variable: string; impact: number }[];
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Kanban board with 11 columns, drag-drop (react-beautiful-dnd) | Week 1-2 |
| 2 | Project card modal, Gantt view (visx), Table view | Week 2-3 |
| 2 | Revenue accretion S-curve, IRR calculator | Week 2 |
| 3 | Risk scoring (5 factors), Gantt chart, Calendar view | Week 3-4 |
| 4 | Document attachment, Financial model, Calendar sync | Week 4 |

---

## 6. Testing
- Drag-drop between stages
- S-curve revenue ramp accuracy
- IRR calculation accuracy
- Risk score calculation
- Gantt chart rendering
- Cross-tab links (Company SME, Valuation)

---

*Spec Version: 1.0.0 | Status: 🔄 Design Phase*