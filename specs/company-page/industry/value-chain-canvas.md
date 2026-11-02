# Value Chain Canvas Tool Specification

**Tool Name:** Value Chain Canvas  
**Category:** Industry Analysis  
**Sheet:** Company Page → Industry  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Interactive canvas for drawing industry value chain: boxes and arrows to create flow diagram with margin pools at each stage. Customizable nodes, edges, labels, colors. Exports to image/PDF for reports.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Value Chain Canvas - [INDUSTRY]                                 │
├─────────────────────────────────────────────────────────────────┤
│ TOOLBAR: [Select] [Box] [Arrow] [Text] [Delete] [Undo] [Redo]  │
├─────────────────────────────────────────────────────────────────┤
│ CANVAS (Infinite pan/zoom)                                      │
│                                                                 │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│   │ Raw     │────▶│ Manufac-│────▶│ Distri- │────▶│ Retail  │  │
│   │ Material│     │ turing  │     │ bution  │     │         │  │
│   │ Margin  │     │ Margin  │     │ Margin  │     │ Margin  │  │
│   │  5%     │     │  12%    │     │  8%     │     │  15%    │  │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
│         │             │             │             │             │
│         ▼             ▼             ▼             ▼             │
│      ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│      │ Logistics│ │Energy   │ │Labor    │ │Overhead │           │
│      │  3%      │ │  5%     │ │  8%     │ │  4%     │           │
│      └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ NODE PROPERTIES (on select)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Label: [Raw Material]  │ Type: [Stage ▼]  │ Margin: [5%]   │ │
│ │ Color: [#3B82F6 ▼]     │ Font: [14px]     │ Show Margin: ☑ │ │
│ │ Position: (x: 100, y: 200)  │ Size: (w: 150, h: 80)        │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ EDGE PROPERTIES (on select)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Label: [Flow]  │ Style: [Solid ▼]  │ Color: [#64748B]      │ │
│ │ Width: [2px]   │ Arrow: [End ▼]    │ Curve: [0]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Export PNG] [Export SVG] [Export PDF] [Save Canvas] [Load]    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Node Types
| Type | Icon | Default Fields |
|------|------|----------------|
| Stage | 🏭 | Label, Margin %, Description |
| Cost Pool | 💰 | Label, % of Revenue, Description |
| Company | 🏢 | Label, Market Share, Margin |
| External | 🌍 | Label, Type (Supplier/Customer/Regulator) |

### 3.3 Edge Types
| Type | Style | Use Case |
|------|-------|----------|
| Material Flow | Solid | Physical goods movement |
| Value Flow | Dashed | Revenue/profit flow |
| Dependency | Dotted | Regulatory, contractual |
| Feedback | Curved | Recycling, returns |

---

## 4. Data Pipeline

### 3.1 Canvas State
```typescript
interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  grid: { size: number; visible: boolean };
}

interface CanvasNode {
  id: string;
  type: 'Stage' | 'CostPool' | 'Company' | 'External';
  label: string;
  x: number; y: number;
  width: number; height: number;
  margin?: number;
  color: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface CanvasEdge {
  id: string;
  source: string;  // node id
  target: string;  // node id
  label?: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
  width: number;
  arrowEnd: 'none' | 'arrow' | 'circle';
  curve: number;  // 0 = straight, >0 = curved
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Margin Bridge Widget:** Node margins feed into Margin Bridge
- **Industry Overview:** Canvas data feeds into Industry Overview widget

---

## 4. API Contract

```typescript
interface ValueChainCanvasData {
  industry: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Canvas with react-flow or custom SVG, toolbar | Week 1-2 |
| 2 | Node/Edge property panels, drag-drop | Week 2 |
| 2 | Pan/zoom, grid, snap-to-grid | Week 2 |
| 3 | Export (PNG/SVG/PDF), save/load canvas | Week 3 |

---

## 5. Testing
- Node/edge CRUD operations
- Pan/zoom performance (100+ nodes)
- Edge routing (avoid node overlap)
- Export quality (PNG/SVG/PDF)
- Save/load round-trip

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*