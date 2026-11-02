# Key Fragility Points Tool Specification

**Tool Name:** Key Fragility Points  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Identifies specific "fragility points" - single points of failure that could materially impact the business: single customer >20% revenue, single supplier >30% input, key person risk, single plant/location, regulatory license dependency, technology lock-in. Each point has impact assessment and mitigation status.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Key Fragility Points - [SYMBOL]                                 │
├─────────────────────────────────────────────────────────────────┤
│ FRAGILITY POINTS                                                │
│ ┌────┬────────────────────────┬────────┬────────┬────────────┐ │
│ │ #  │ Fragility Point        │ Type   │ Impact │ Mitigation │ │
│ ├────┼────────────────────────┼────────┼────────┼────────────┤ │
│ │ 1  │ Customer A: 35% rev    │ Conc.  │ 🔴 High│ Diversify  │ │
│ │ 2  │ Supplier X: 40% input  │ Supply │ 🔴 High│ Dual-source│ │
│ │ 3  │ Plant A: 80% capacity  │ Loc.   │ 🟡 Med │ Backup plan│ │
│ │ 4  │ Key Engineer: R&D lead │ Person │ 🟡 Med │ Succession │ │
│ │ 5  │ License L1: Expires 2025│ Reg.   │ 🟡 Med │ Renewal    │ │
│ └────┴────────────────────────┴────────┴────────┴────────────┘ │
│ [Add Point] [Import from Doc AI] [Export CSV]                   │
├─────────────────────────────────────────────────────────────────┤
│ POINT DETAIL (on click)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Point: Customer A: 35% revenue                              │ │
│ │ Type: Customer Concentration                                │ │
│ │ Details: Customer A (Auto OEM) contributes 35% of revenue. │ │
│ │ Contract: 3-year, expires Mar 2026. Renewal in negotiation. │ │
│ │ Risk: Loss would reduce revenue 35%, EBITDA 45%.           │ │
│ │ Mitigation: Targeting 2 new OEMs, target <20% each by FY27 │ │
│ │ Status: In progress (1 LOI signed)                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Point] [Import from Doc AI] [Export CSV] [Link to Red Flags] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| fragility_points | FragilityPoint[] | Manual / Doc AI |

### 3.2 Fragility Point Schema
```typescript
interface FragilityPoint {
  id: string;
  title: string;
  type: 'Concentration' | 'Supply' | 'Location' | 'Person' | 'Regulatory' | 'Technology' | 'Other';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
  status: 'Open' | 'Mitigating' | 'Mitigated' | 'Accepted';
  owner: string;
  targetDate?: string;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Red Flags:** Cross-references concentration flags
- **Shareholding Pattern:** Customer concentration data
- **Supplier Analysis:** Supply chain data
- **Risk Score Engine:** Feeds Business Risk category

---

## 4. API Contract

```typescript
interface KeyFragilityData {
  symbol: string;
  points: FragilityPoint[];
  summary: {
    high: number;
    medium: number;
    low: number;
    mitigated: number;
  };
  lastUpdated: string;
}

interface FragilityPoint {
  id: string;
  title: string;
  type: 'Concentration' | 'Supply' | 'Location' | 'Person' | 'Regulatory' | 'Technology' | 'Other';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
  status: 'Open' | 'Mitigating' | 'Mitigated' | 'Accepted';
  owner: string;
  targetDate?: string;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Table with type badges, impact severity | Week 1 |
| 2 | Detail modal with mitigation tracking | Week 1 |
| 2 | Doc AI import (customer/supplier contracts) | Week 2 |
| 3 | Status workflow, CSV export, Red Flags link | Week 2 |

---

## 6. Testing
- Impact badge rendering
- Status workflow (Open → Mitigating → Mitigated)
- Cross-link to Red Flags
- CSV export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*