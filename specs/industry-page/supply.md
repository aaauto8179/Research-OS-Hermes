# Industry Supply Analysis Tool Specification

**Tool Name:** Supply  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Customizable table with option to add multiple headers and text rows. Example: Under header "Capacity", rows for capacity growth, capex pipeline, current capex. Scalable nested structure. Sources: Uploaded reports + manual entry.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Supply Analysis - [INDUSTRY]                           │
├─────────────────────────────────────────────────────────────────┤
│ SUPPLY STRUCTURE (Nested Table)                                 │
│ ┌────┬─────────────────────┬────────┬────────┬────────────────┐ │
│ │ ▼  │ CAPACITY            │        │        │                │ │
│ ├────┼─────────────────────┼────────┼────────┼────────────────┤ │
│ │    │ Capacity Growth     │ 8% YoY │ ▲      │ Annual Report  │ │
│ │    │ Capex Pipeline      │ ₹500Cr │ ▬      │ Investor Pres  │ │
│ │    │ Current Capex       │ ₹120Cr │ ▼      │ Concall        │ │
│ ├────┼─────────────────────┼────────┼────────┼────────────────┤ │
│ │ ▼  │ RAW MATERIAL        │        │        │                │ │
│ ├────┼─────────────────────┼────────┼────────┼────────────────┤ │
│ │    │ Coal Availability   │ 92%    │ ▲      │ Ministry Data  │ │
│ │    │ Import Dependency   │ 18%    │ ▼      │ Trade Data     │ │
│ ├────┼─────────────────────┼────────┼────────┼────────────────┤ │
│ │ ▼  │ LOGISTICS           │        │        │                │ │
│ ├────┼─────────────────────┼────────┼────────┼────────────────┤ │
│ │    │ Rail Capacity       │ 75%    │ ▬      │ Railway Board  │ │
│ │    │ Port Throughput     │ 85%    │ ▲      │ IPA Data       │ │
│ └────┴─────────────────────┴────────┴────────┴────────────────┘ │
│ [+ Add Header] [+ Add Row] [Collapse All] [Export]              │
├─────────────────────────────────────────────────────────────────┤
│ SUPPLY-DEMAND BALANCE                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Chart: Supply vs Demand Gap, 5Y forecast]                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Data Model
```typescript
interface SupplySection {
  id: string;
  header: string;           // e.g., "CAPACITY"
  collapsed: boolean;
  rows: SupplyRow[];
}

interface SupplyRow {
  id: string;
  metric: string;           // e.g., "Capacity Growth"
  value: string;            // Can be %, ₹, absolute
  trend: 'up' | 'down' | 'stable';
  source: string;
  unit: string;
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Document AI:** Extract supply metrics from reports
- **Industry Page:** Feeds Industry Aggregate
- **GRWTH:** Supply constraints for capex projects
- **Company Page (Story tab):** Company-specific supply position

---

## 4. API Contract

```typescript
interface SupplyData {
  industry: string;
  sections: SupplySection[];
  supplyDemandGap: { year: number; supply: number; demand: number; gap: number }[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Nested table component (expand/collapse, drag reorder) | Week 1 |
| 2 | Multi-header support, custom units | Week 1 |
| 2 | Doc AI extraction for supply metrics | Week 2 |
| 3 | Supply-demand gap chart, export | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Nested expand/collapse | State persists |
| Drag reorder rows/headers | Order saves |
| Custom units | %, ₹, absolute all work |
| Gap chart | Calculates correctly |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*