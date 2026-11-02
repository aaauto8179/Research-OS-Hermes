# Key Events Tool Specification

**Tool Name:** Key Events  
**Category:** Downsides & Exit Triggers  
**Sheet:** Company Page → Downsides  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Tracks key events that require close monitoring for exit decisions: M&A, spinoffs, management changes, regulatory actions, capacity additions, product launches, litigation outcomes. Each event has date, type, description, impact assessment, and source link. Auto-sorts by date.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Key Events - [SYMBOL]                                           │
├─────────────────────────────────────────────────────────────────┤
│ [Add Event]  [Filter: All ▼] [M&A] [Spinoff] [Mgmt] [Reg] [CapEx] │
├─────────────────────────────────────────────────────────────────┤
│ EVENT TIMELINE                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [2024-11-15]  M&A  📈                                       │ │
│ │ Announced acquisition of XYZ Ltd for ₹500 Cr.               │ │
│ │ Strategic fit: Expands into EV components.                  │ │
│ │ Expected close: Q1 FY26. Synergies: ₹50 Cr/yr.              │ │
│ │ Source: [Exchange Filing 🔗]  Impact: 🟢 Positive          │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [2024-10-20]  Mgmt Change  ➡️                              │ │
│ │ New CFO appointed: Mr. X from competitor.                   │ │
│ │ 20 years experience in chemicals.                           │ │
│ │ Source: [Press Release 🔗]  Impact: ➡️ Neutral             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [2024-09-10]  CapEx  📈                                     │ │
│ │ New 2MT green hydrogen plant announced. ₹2,000 Cr capex.    │ │
│ │ Location: Gujarat. Commissioning: FY27.                     │ │
│ │ Source: [Exchange Filing 🔗]  Impact: 🟢 Positive          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Event] [Filter] [Export Timeline] [Sync with Recent Events] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| events | Event[] | Manual / Doc AI / Sync |

### 3.2 Event Schema
```typescript
interface KeyEvent {
  id: string;
  date: string;
  type: 'M&A' | 'Spinoff' | 'Management' | 'Regulatory' | 'CapEx' | 'Product' | 'Litigation' | 'Other';
  title: string;
  description: string;
  impact: 'Positive' | 'Neutral' | 'Negative';
  sourceUrl?: string;
  tags: string[];
  syncedFromRecentEvents: boolean;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Recent Events (Analysis tab):** Auto-syncs key events
- **Downsides Tab:** Hedging Mechanism, Forensic Analysis
- **Exit Checklist:** Trigger monitoring
- **Document AI:** Auto-extract from exchange filings, press releases

---

## 4. API Contract

```typescript
interface KeyEventsData {
  symbol: string;
  events: KeyEvent[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Timeline list with color-coded impact badges | Week 1 |
| 2 | Event CRUD, filter by type/date, sync with Recent Events | Week 1 |
| 2 | Doc AI auto-extract from filings/press releases | Week 2 |
| 3 | Exit Checklist trigger sync, export | Week 2 |

---

## 6. Testing
- Date sorting (newest first)
- Impact badge color coding
- Type filter accuracy
- Sync with Recent Events (Analysis tab)
- Doc AI extraction accuracy
- Timeline export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*