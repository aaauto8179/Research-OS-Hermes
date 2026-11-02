# Track Record Tool Specification

**Tool Name:** Track Record  
**Category:** Management & Execution  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Timeline/table of historical milestones and performance achievements: capacity additions, acquisitions, new product launches, geographic expansions, financial milestones, awards/recognitions. Links to management credibility assessment.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Track Record - [SYMBOL]                                         │
├─────────────────────────────────────────────────────────────────┤
│ MILESTONES TIMELINE                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 2024  ──●────●────●────●────●────●────●────●────●────●────  │ │
│ │       CapEx  Acq   Prod  Exp   Fin   Awrd  CapEx  Prod  Div  │ │
│ │ 2023  ●────●────●────●────●────●────●────●────●────●────  │ │
│ │ 2022  ●────●────●────●────●────●────●────●────●────●────  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DETAILED MILESTONES                                             │
│ ┌────┬────────┬────────────────────┬──────────┬──────────────┐ │
│ │ #  │ Year   │ Milestone          │ Category │ Impact       │ │
│ ├────┼────────┼────────────────────┼──────────┼──────────────┤ │
│ │ 1  │ 2024   │ 2MT PA capacity    │ CapEx    │ High         │ │
│ │ 2  │ 2023   │ Acquired XYZ Ltd   │ M&A      │ High         │ │
│ │ 3  │ 2022   │ Launched Product X │ Product  │ Medium       │ │
│ │ 4  │ 2021   │ Entered US market  │ Geo      │ High         │ │
│ │ 5  │ 2020   │ ₹1000Cr revenue     │ Financial│ Milestone    │ │
│ └────┴────────┴────────────────────┴──────────┴──────────────┘ │
│ [Add Milestone] [Import from Doc AI] [Export Timeline]         │
├─────────────────────────────────────────────────────────────────┤
│ FINANCIAL TRACK RECORD (5Y)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Revenue CAGR: 15.2%  │ EBITDA CAGR: 18.5%  │ PAT CAGR: 22.1%│ │
│ │ ROE Trend: 15→17→19→21→22%  │ Debt/Equity: 0.6→0.5→0.4→0.3→0.35│ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Link to Concall Consistency] [Link to Capital Allocation]     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Milestone Categories
| Category | Icon | Examples |
|----------|------|----------|
| CapEx | 🏭 | New plant, expansion, modernization |
| M&A | 🤝 | Acquisition, merger, JV, stake sale |
| Product | 🚀 | New launch, variant, platform |
| Geographic | 🌍 | New country, market entry, export start |
| Financial | 💰 | Revenue/profit milestone, debt reduction |
| Award | 🏆 | Industry recognition, certification |

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| milestones | Milestone[] | Manual / Doc AI |
| financial_trend | object | Auto from financials |

### 4.2 Doc AI Extraction
- **Source:** Annual reports (MD&A, Directors' Report), press releases
- **Extractor:** `TrackRecordExtractor`
- **Output:** Structured milestones with dates, categories, descriptions

---

## 4. API Contract

```typescript
interface TrackRecordData {
  symbol: string;
  milestones: Milestone[];
  financialTrend: {
    revenueCAGR: number;
    ebitdaCAGR: number;
    patCAGR: number;
    roeTrend: number[];
    debtEquityTrend: number[];
  };
  lastUpdated: string;
}

interface Milestone {
  id: string;
  year: number;
  date?: string;  // optional exact date
  title: string;
  description: string;
  category: 'CapEx' | 'M&A' | 'Product' | 'Geographic' | 'Financial' | 'Award';
  impact: 'High' | 'Medium' | 'Low';
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Timeline visualization (visx or custom SVG) | Week 1 |
| 2 | Milestone table with CRUD, category filter | Week 1 |
| 2 | Financial trend auto-calc from financials | Week 2 |
| 3 | Doc AI import, CSV export | Week 2 |

---

## 5. Testing
- Timeline rendering accuracy
- Milestone CRUD operations
- Financial trend auto-calc accuracy
- Cross-tab links

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*