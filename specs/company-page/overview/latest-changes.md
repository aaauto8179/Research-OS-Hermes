# Latest Changes Tool Specification

**Tool Name:** Latest Changes  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Text box with impact selector for recording latest material events, news, or changes affecting the company. Each entry has timestamp, event description, impact classification (Positive/Negative/Neutral), and optional link to source. Auto-sorts by date.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Overview |
| Tool | Latest Changes |
| Description | A text box with a second box to select the impact of the event (neutral, negative, positive) |
| Data Source | — |
| Sample Link | https://drive.google.com/file/d/1LFkIA-2hTrK60kcqGJlwOAIqbqzm03ov/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Latest Changes - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ [Add Change]                                                    │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [2024-11-15]  POSITIVE  📈                                    │ │
│ │ Q2 FY25 Results: Revenue +15% YoY, EBITDA margin expands    │ │
│ │ 200bps. Management guides 20% growth for FY26.              │ │
│ │ Source: [Exchange Filing 🔗]                                 │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [2024-10-20]  NEUTRAL  ➡️                                    │ │
│ │ New CFO appointed: Mr. X joins from competitor.             │ │
│ │ Transition period 3 months.                                  │ │
│ │ Source: [Press Release 🔗]                                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ [2024-09-10]  NEGATIVE  📉                                    │ │
│ │ Raw material cost increase 8% QoQ due to supply chain.      │ │
│ │ Management expects pass-through in Q3.                       │ │
│ │ Source: [Concall Transcript 🔗]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Change]  [Filter: All ▼] [Export Timeline]                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Entry Fields
| Field | Type | Options |
|-------|------|---------|
| Date | Date picker | Default: today |
| Impact | Select | Positive / Neutral / Negative |
| Description | Textarea | Rich text, max 2000 chars |
| Source | Text + URL | Optional link |
| Tags | Multi-select | Custom + predefined |

### 3.3 Features
- Auto-sort by date (newest first)
- Color-coded badges: Positive (green), Neutral (gray), Negative (red)
- Expand/collapse long descriptions
- Filter by impact, date range, tags
- Timeline export (PDF/CSV)

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| date | Date | Manual |
| impact | Enum | Manual |
| description | String (HTML) | Manual |
| source_url | URL | Manual |
| tags | String[] | Manual |

### 4.2 Future: Doc AI Integration
- Auto-extract events from concall transcripts, exchange filings
- Suggest impact classification (LLM-based)
- Pre-fill description from document chunks

---

## 5. API Contract

```typescript
interface LatestChange {
  id: string;
  symbol: string;
  date: string;  // ISO date
  impact: 'Positive' | 'Neutral' | 'Negative';
  description: string;  // HTML
  sourceUrl?: string;
  tags: string[];
  createdAt: string;
  createdBy: string;
}

interface LatestChangesData {
  symbol: string;
  changes: LatestChange[];
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Component with timeline list, add/edit/delete | Week 1 |
| 2 | Rich text editor, tags, filtering | Week 1 |
| 2 | PDF/CSV export | Week 2 |

---

## 6. Testing
- CRUD operations
- Date sorting (newest first)
- Impact color coding
- Export formats

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*