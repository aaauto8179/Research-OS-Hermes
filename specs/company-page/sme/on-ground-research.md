# On-Ground Research Tool Specification

**Tool Name:** On-Ground Research  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Date-wise structured notes from on-ground research: channel checks, dealer visits, factory visits, competitor store visits, expert interviews. Each entry has date, type, location, participants, key findings, confidence, and follow-up actions. Date-wise timeline with filters.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ On-Ground Research - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────────┤
│ [Add Entry]  [Filter: All ▼] [Factory] [Dealer] [Channel] [Expert] │
├─────────────────────────────────────────────────────────────────┤
│ RESEARCH TIMELINE                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [2024-11-15]  Factory Visit  🏭  Gujarat                     │ │
│ │ Visited Plant A (2MT capacity). Capacity utilization 85%.   │ │
│ │ New line commissioning Q2 FY25. Capex on track.             │ │
│ │ Participants: Analyst, Plant Head.  Confidence: High        │ │
│ │ Follow-up: Track Q2 FY25 commissioning.                     │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [2024-10-20]  Dealer Visit  🚗  Mumbai                       │ │
│ │ Visited 5 dealers. Inventory 45 days (vs 60 norm).         │ │
│ │ Demand strong for premium segment. Discounts stable.       │ │
│ │ Participants: Analyst.  Confidence: High                    │ │
│ │ Follow-up: Monitor inventory days.                          │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [2024-10-10]  Expert Interview  👨‍💼  Delhi                   │ │
│ │ Interviewed Industry Expert X (20 yr exp).                  │ │
│ │ View: Structural demand shift to premium. Margin tailwind. │ │
│ │ Confidence: Medium (single expert).                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Entry] [Filter] [Export Timeline] [Link to Company Info]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| entries | ResearchEntry[] | Manual |

### 3.2 Entry Schema
```typescript
interface ResearchEntry {
  id: string;
  date: string;
  type: 'Factory' | 'Dealer' | 'Channel' | 'Competitor' | 'Expert' | 'Other';
  location: string;
  title: string;
  description: string;
  participants: string[];
  keyFindings: string[];
  confidence: 'High' | 'Medium' | 'Low';
  followUpActions: string[];
  tags: string[];
  createdAt: string;
  createdBy: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Info (SME tab):** Events calendar sync
- **Tasks & Time:** Follow-up actions create tasks
- **Document AI:** Auto-extract from visit reports
- **Concall Tracker:** Cross-reference management commentary

---

## 4. API Contract

```typescript
interface OnGroundResearchData {
  symbol: string;
  entries: ResearchEntry[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Timeline list with type icons, confidence badges | Week 1 |
| 2 | Entry CRUD, filter by type/date/confidence | Week 1 |
| 2 | Follow-up actions → Tasks & Time integration | Week 2 |
| 3 | Doc AI import (visit reports), timeline export | Week 2 |

---

## 6. Testing
- Timeline date sorting
- Type filter accuracy
- Confidence badge rendering
- Task creation from follow-ups
- Timeline export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*