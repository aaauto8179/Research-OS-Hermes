# Business Model Tool Specification

**Tool Name:** Business Model  
**Category:** Story  
**Sheet:** Company Page → Story  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured description of how the company makes money: revenue streams, cost structure, key resources, customer segments, and value proposition. Canvas-style layout with editable sections.

---

## 3. UI/UX Specification

### 3.1 Layout (Business Model Canvas Style)
```
┌─────────────────────────────────────────────────────────────────┐
│ Business Model - [SYMBOL]                                       │
├──────────────────┬──────────────────┬──────────────────────────┤
│ KEY PARTNERS     │ KEY ACTIVITIES   │ VALUE PROPOSITION        │
│ • Suppliers      │ • Manufacturing  │ • Market leader in X     │
│ • Distributors   │ • R&D            │ • Cost leadership        │
│ • JV Partners    │ • Marketing      │ • Technology edge        │
├──────────────────┼──────────────────┼──────────────────────────┤
│ KEY RESOURCES    │ CUSTOMER REL.    │ CHANNELS                 │
│ • Plants         │ • Direct sales   │ • Direct                 │
│ • IP/Patents     │ • Service net.   │ • Distributors           │
│ • Brand          │ • Digital        │ • E-commerce             │
├──────────────────┼──────────────────┼──────────────────────────┤
│ COST STRUCTURE   │ REVENUE STREAMS  │ CUSTOMER SEGMENTS        │
│ • Raw material 60%│ • Product A 55%  │ • Industrial 40%        │
│ • Labor 15%      │ • Product B 30%  │ • Consumer 35%          │
│ • Energy 10%     │ • Services 15%   │ • Export 25%            │
└──────────────────┴──────────────────┴──────────────────────────┘
```

### 3.2 Sections (Editable Cards)
| Section | Type | Fields |
|---------|------|--------|
| Key Partners | TextArea | Bullet list |
| Key Activities | TextArea | Bullet list |
| Key Resources | TextArea | Bullet list |
| Value Proposition | TextArea | 2-3 sentences |
| Customer Relationships | Select + Text | Type + description |
| Channels | Multi-select | Direct, Distributor, E-com, etc. |
| Customer Segments | Table | Segment, %, Description |
| Revenue Streams | Table | Stream, %, Description |
| Cost Structure | Table | Cost item, %, Description |

---

## 6. Implementation Plan
- **Component:** `BusinessModel.tsx` in `src/components/company/story/`
- **WidgetRegistry:** `"business-model"`
- **Features:** Drag-drop canvas sections, export to PDF, version history

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*