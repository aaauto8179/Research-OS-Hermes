# Industry Supply Chain Mapper Tool Specification

**Tool Name:** Supply Chain Mapper  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Interactive canvas to map the industry value chain: raw material suppliers → manufacturers → distributors → end users. Shows margin pools at each stage, concentration, and key players. Integrates with Company Page Value Chain Canvas.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Supply Chain Mapper - [INDUSTRY]                       │
├─────────────────────────────────────────────────────────────────┤
│ TOOLBAR: [Box] [Arrow] [Text] [Margin Pool] [Color] [Export]   │
├─────────────────────────────────────────────────────────────────┤
│ CANVAS (Interactive, Zoom/Pan)                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                             │ │
│ │  [RAW MATERIALS]        [MANUFACTURING]      [DISTRIBUTION] │ │
│ │  ┌─────────────┐       ┌─────────────┐       ┌─────────┐   │ │
│ │  │ Iron Ore    │ ────► │ Steel Plant │ ────► │ Dealers │   │ │
│ │  │ Miners      │ 15%   │ (Blast Fur.)│ 8%    │ Network │   │ │
│ │  │ Conc: High  │       │ Conc: Med   │       │ Conc:Low│   │ │
│ │  └─────────────┘       └─────────────┘       └─────────┘   │ │
│ │       │                      │                      │       │ │
│ │       ▼                      ▼                      ▼       │ │
│ │  [SCRAP]               [PROCESSING]              [END USER] │ │
│ │  Recyclers  ─────────►  Re-rollers  ────────────►  Auto/Con │ │
│ │  Conc: Low             Conc: High                 Conc: Low  │ │
│ │                                                             │ │
│ │  MARGIN POOLS: [████ 25%] [████████ 40%] [████ 20%] [██ 15%]│ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STAGE DETAIL (on click node)                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Stage: Steel Manufacturing                                  │ │
│ │ Companies: SAIL, Tata, JSW, JSPL, AMNS                     │ │
│ │ Total Capacity: 150 MTPA  │ Utilization: 82%               │ │
│ │ Margin Pool: 40% of Industry Value                         │ │
│ │ Key Inputs: Iron Ore (60%), Coal (25%), Scrap (15%)       │ │
│ │ [Link to Company Value Chain] [Export Sub-graph]           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Data Model
```typescript
interface SupplyChainNode {
  id: string;
  stage: 'raw_material' | 'manufacturing' | 'processing' | 'distribution' | 'end_user';
  name: string;
  companies: string[];        // Symbols
  totalCapacity: number;
  utilization: number;
  marginPoolPct: number;      // % of total industry value
  concentration: 'High' | 'Medium' | 'Low';
  inputs: { material: string; pct: number; sources: string[] }[];
  position: { x: number; y: number };  // Canvas coordinates
}

interface SupplyChainEdge {
  from: string;   // node id
  to: string;     // node id
  material: string;
  volumePct: number;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (Industry → Value Chain Canvas):** Per-company view
- **Value Chain Canvas (Company Page):** Same canvas, filtered
- **GRWTH:** Supply chain risks for projects
- **Document AI:** Extract supply chain from reports

---

## 4. API Contract

```typescript
interface SupplyChainData {
  industry: string;
  nodes: SupplyChainNode[];
  edges: SupplyChainEdge[];
  marginPools: { stage: string; pct: number; value: number }[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Canvas (react-flow), node/edge components | Week 1 |
| 2 | Margin pool visualization, stage detail modal | Week 1 |
| 2 | Company linking, auto-layout | Week 2 |
| 3 | Export (PNG/SVG), sync with Company Page | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Canvas interaction | Drag, zoom, pan smooth |
| Margin pools | Sum = 100% |
| Company links | Open Company Page |
| Auto-layout | No overlaps |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*