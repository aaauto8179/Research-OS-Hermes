# Shareholding Pattern Tool Specification

**Tool Name:** Shareholding Pattern  
**Category:** Management & Execution  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Interactive shareholding pattern table with quarterly history, category breakdown (Promoter, FII, DII, Retail, Others), pledge tracking, and analyst comments per entity. Auto-calculates trends and flags significant changes.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Management & Execution |
| Tool | Shareholding pattern of the companies |
| Description | Shareholding pattern of the companies can take it from documents and should have an option to add our comment after every entity |
| Data Source | Documents Upload, Document AI + Manual entry for notes |
| Sample Link | — |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Shareholding Pattern - [SYMBOL]                                 │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [Latest Quarter ▼]  [History: 8Q ▼]  [Compare QoQ ▼]   │
├─────────────────────────────────────────────────────────────────┤
│ SUMMARY CARDS                                                   │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│ │ Promoter    │ │ FII         │ │ DII         │ │ Retail     │ │
│ │ 52.3% ▲0.5% │ │ 18.2% ▼1.2% │ │ 12.1% ▲0.8% │ │ 17.4% ▲0.1%│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DETAILED BREAKDOWN                                              │
│ ┌────┬──────────────────┬────────┬────────┬────────┬────────┐  │
│ │ #  │ Entity           │ Category│ % Held │ Change │ Pledge%│ │
│ ├────┼──────────────────┼────────┼────────┼────────┼────────┤  │
│ │ 1  │ Promoter Group   │ Promoter│ 52.3%  │ +0.5%  │  2.1%  │ │
│ │ 2  │ LIC              │ DII     │  4.2%  │ -0.3%  │   -    │ │
│ │ 3  │ SBI MF           │ DII     │  3.1%  │ +0.5%  │   -    │ │
│ │ 4  │ Govt Pension     │ DII     │  2.8%  │  0.0%  │   -    │ │
│ │ 5  │ Vanguard         │ FII     │  3.5%  │ -0.8%  │   -    │ │
│ │ 6  │ BlackRock        │ FII     │  2.9%  │ -0.4%  │   -    │ │
│ │ ...│ Retail           │ Retail  │ 17.4%  │ +0.1%  │   -    │ │
│ └────┴──────────────────┴────────┴────────┴────────┴────────┘  │
│ [Add Entity] [Import from Doc AI] [Export CSV] [Compare QoQ]    │
├─────────────────────────────────────────────────────────────────┤
│ PLEDGE TRACKING                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Entity          │ Shares Pledged │ % of Holding │ % of Total│ │
│ ├─────────────────┼────────────────┼──────────────┼───────────┤ │
│ │ Promoter Group  │ 2.1 Cr         │ 2.1%         │ 1.1%      │ │
│ └─────────────────┴────────────────┴──────────────┴───────────┘ │
│ ⚠️ Alert: Total promoter pledge > 2%                           │
├─────────────────────────────────────────────────────────────────┤
│ ANALYST COMMENTS                                                │
│ ┌────┬──────────────────┬────────────────────────────────────┐ │
│ │ #  │ Entity           │ Comment                             │ │
│ ├────┼──────────────────┼────────────────────────────────────┤ │
│ │ 1  │ Vanguard         │ Reduced stake 15% QoQ, monitor     │ │
│ └────┴──────────────────┴────────────────────────────────────┘ │
│ [Add Comment] [Import from Doc AI] [Export CSV]                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Features
| Feature | Description |
|---------|-------------|
| **Category Summary** | 4 cards with % and QoQ change |
| **Entity Table** | Expandable rows, sortable, filterable |
| **Pledge Tracking** | Separate section with alerts |
| **QoQ Comparison** | Side-by-side or delta view |
| **Analyst Comments** | Per-entity notes, timestamped |
| **Doc AI Import** | Extracts from shareholding pattern PDFs |

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| quarter | String | Manual / Doc AI |
| entities | Entity[] | Doc AI + Manual |
| comments | Comment[] | Manual |

### 4.2 Entity Schema
```typescript
interface ShareholdingEntity {
  id: string;
  name: string;
  category: 'Promoter' | 'FII' | 'DII' | 'Retail' | 'Other';
  pctHeld: number;
  qoqChange: number;
  pledgedPct?: number;
  pledgedShares?: number;
  analystComment?: string;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

### 4.3 Doc AI Extraction
- **Source:** Shareholding pattern PDFs (quarterly filings)
- **Extractor:** `ShareholdingExtractor`
- **Output:** Structured table with entity names, categories, percentages, pledge data

---

## 5. API Contract

```typescript
interface ShareholdingData {
  symbol: string;
  quarter: string;
  summary: {
    promoter: { pct: number; qoq: number };
    fii: { pct: number; qoq: number };
    dii: { pct: number; qoq: number };
    retail: { pct: number; qoq: number };
  };
  entities: ShareholdingEntity[];
  pledgeAlert: boolean;
  comments: EntityComment[];
  lastUpdated: string;
}

interface EntityComment {
  entityId: string;
  comment: string;
  createdAt: string;
  createdBy: string;
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Summary cards + entity table with sorting/filtering | Week 1 |
| 2 | Pledge tracking section, QoQ comparison toggle | Week 1 |
| 2 | Analyst comments per entity, Doc AI import | Week 2 |
| 3 | Alert system (pledge > threshold), CSV export | Week 2 |

---

## 6. Testing
- Summary card calculations
- Entity table sorting/filtering
- QoQ comparison accuracy
- Pledge alert threshold
- Doc AI extraction accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*