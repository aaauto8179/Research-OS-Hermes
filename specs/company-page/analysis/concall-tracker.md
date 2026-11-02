# Concall Tracker Tool Specification

**Tool Name:** Concall Tracker  
**Category:** Analysis  
**Sheet:** Company Page → Analysis  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Quarterly concall tracker with pre-made customizable template. Records guidance promised vs actual delivered, management commentary, Q&A highlights. Links to Concall Consistency engine for consistency scoring.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Concall Tracker - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ TEMPLATE: [Standard ▼] [Save Template] [Load Template]         │
├─────────────────────────────────────────────────────────────────┤
│ QUARTERLY TRACKER                                               │
│ ┌────┬────────┬────────────────┬────────────┬────────┬────┐   │
│ │ Qtr│ Guidance Promised    │ Actual     │ Var    │Scr │Notes│   │
│ ├────┼──────────────────────┼────────────┼────────┼────┼─────┤   │
│ │Q4FY24│ O2C revenue $12-14B│ $13.2B     │ Met    │ 5  │Crack│   │
│ │Q3FY24│ Jio ARPU ₹180+     │ ₹182       │ Met    │ 5  │Tariff│   │
│ │Q2FY24│ Retail 200 stores/q│ 220        │ Beat   │ 5  │Format│   │
│ │Q1FY24│ Net Debt Zero      │ Achieved   │ Met    │ 5  │Assets│   │
│ └────┴──────────────────────┴────────────┴────────┴────┴─────┘ │
│ [Add Quarter] [Import from Doc AI] [Export CSV]                 │
├─────────────────────────────────────────────────────────────────┤
│ MANAGEMENT COMMENTARY                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Quarter: Q4 FY24]                                          │ │
│ │ [Rich text: Key management statements, tone, emphasis...]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Q&A HIGHLIGHTS                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Q: "What's the outlook for O2C margins?"                    │ │
│ │ A: "Expect 100-150bps expansion from mix improvement..."    │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Q: "Capital allocation priority?"                           │ │
│ │ A: "Deleveraging first, then growth capex, then returns..." │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Q&A] [Link to Concall Consistency] [Export PDF]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| quarters | QuarterEntry[] | Manual / Doc AI |
| commentary | string | Manual |
| qa_highlights | QAEntry[] | Manual / Doc AI |

### 3.2 Schema
```typescript
interface QuarterEntry {
  id: string;
  quarter: string;  // e.g., "Q4 FY24"
  guidance: string;
  actual: string;
  variance: 'Met' | 'Beat' | 'Missed';
  score: number;  // 1-5
  notes: string;
  date: string;
}

interface QAEntry {
  id: string;
  question: string;
  answer: string;
  category: 'Guidance' | 'Strategy' | 'Operations' | 'Financial' | 'Other';
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Concall Consistency Engine:** Auto-computes consistency %, avg score
- **Management Tab:** Links to Concall Consistency tracker
- **Document AI:** ConcallsParser extracts guidance/Q&A from transcripts

---

## 4. API Contract

```typescript
interface ConcallTrackerData {
  symbol: string;
  quarters: QuarterEntry[];
  commentary: Record<string, string>;  // quarter -> HTML
  qaHighlights: QAEntry[];
  consistencyPct: number;
  avgScore: number;
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Quarter table with guidance/actual/variance | Week 1 |
| 2 | Commentary editor, Q&A highlights | Week 1 |
| 2 | Doc AI import (ConcallParser), consistency link | Week 2 |
| 3 | CSV/PDF export, template save/load | Week 2 |

---

## 6. Testing
- Quarter CRUD operations
- Variance enum validation (Met/Beat/Missed)
- Score validation (1-5)
- Doc AI extraction accuracy
- Cross-link to Concall Consistency engine

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*