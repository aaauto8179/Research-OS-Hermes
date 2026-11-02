# Concall Consistency Tracker Tool Specification

**Tool Name:** Concall Consistency Tracker  
**Category:** Management & Execution  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Tracks management guidance vs actual delivery across quarters. Scores management credibility with consistency percentage and average score. Links to Concall Consistency Engine for automated signal detection.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Management & Execution |
| Tool | Concall Consistency |
| Description | Tracks growth guidance promised vs delivered for multiple quarters |
| Data Source | Documents Upload, Document AI |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Concall Consistency Tracker - [SYMBOL]                          │
├─────────────────────────────────────────────────────────────────┤
│ OVERALL: 92% Consistency  │  Avg Score: 4.8/5                 │
├─────────────────────────────────────────────────────────────────┤
│ HISTORY                                                      │
│ ┌──────┬──────────────┬──────────────┬────────┬────┬─────────┐ │
│ │ Qtr  │ Guidance     │ Actual       │ Var    │Scr │Reason   │ │
│ ├──────┼──────────────┼──────────────┼────────┼────┼─────────┤ │
│ │ Q4FY24│ O2C $12-14B │ $13.2B       │ Met    │ 5  │Crack    │ │
│ │ Q3FY24│ Jio ARPU₹180+│ ₹182         │ Met    │ 5  │Tariff   │ │
│ │ Q2FY24│ Retail 200/q│ 220          │ Beat   │ 5  │Format   │ │
│ │ Q1FY24│ NetDebt Zero│ Achieved     │ Met    │ 5  │Assets   │ │
│ └──────┴──────────────┴──────────────┴────────┴────┴─────────┘ │
│ TRENDS                                                       │
│ • 4 quarters: 100% met/beat                                  │
│ • Average score improving: 4.5 → 4.8                         │
│ • No misses in 2 years                                       │
│ [Add Quarter] [Import from Doc AI] [Export CSV]              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline
- **Manual Entry:** Analyst adds quarter rows
- **Doc AI:** Extract guidance from concall transcripts (ConcallParser engine)
- **Engine:** Concall Consistency Engine computes consistency % and trends

---

## 5. Engine Integration
- **Backend:** `ConcallConsistencyEngine` in `math-engine/src/math_engine/analysis/concall_consistency.py`
- **API:** `POST /api/math-engine/concall-consistency`
- **Inputs:** Quarter history array → Outputs consistency %, avg score, trends

---

## 6. Implementation Plan
- **Component:** `ConcallConsistencyTracker.tsx` in `src/components/company/management/`
- **WidgetRegistry:** `"concall-consistency"`
- **Features:** Add/edit/delete quarters, Doc AI import button, CSV export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*