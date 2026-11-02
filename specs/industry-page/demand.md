# Industry Demand Analysis Tool Specification

**Tool Name:** Demand  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
A table to list down top 3+ drivers of demand with their % of impact. Scalable to add additional rows and columns. Sources: Uploaded reports + documents (Document AI extraction).

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Demand Analysis - [INDUSTRY]                           │
├─────────────────────────────────────────────────────────────────┤
│ DEMAND DRIVERS TABLE                                            │
│ ┌────┬─────────────────────┬────────┬────────┬────────────────┐ │
│ │ #  │ Driver              │ Impact%│ Trend  │ Source/Notes   │ │
│ ├────┼─────────────────────┼────────┼────────┼────────────────┤ │
│ │ 1  │ Urbanization        │ 35%    │ ▲      │ Govt Census    │ │
│ │ 2  │ Income Growth       │ 28%    │ ▲      │ NSSO Survey    │ │
│ │ 3  │ Policy Push (PMAY)  │ 22%    │ ▬      │ Budget Docs    │ │
│ │ 4  │ [+ Add Row]         │        │        │                │ │
│ └────┴─────────────────────┴────────┴────────┴────────────────┘ │
│ [Auto-fill from Doc AI] [Export] [Save Template]                │
├─────────────────────────────────────────────────────────────────┤
│ DOCUMENT AI EXTRACTION                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [📄 Annual Report 2024] → Extracted: "Urban housing demand  │ │
│ │ driven by 35% urbanization, 28% income growth..."           │ │
│ │ [📄 Broker Report Q3] → Extracted: "Policy push contributes │ │
│ │ 22% to incremental demand..."                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Sources
| Source | Extraction Method | Frequency |
|--------|-------------------|-----------|
| Annual Reports | Document AI (Key Data Extractor) | Quarterly |
| Broker Reports | Document AI + Manual | As available |
| Govt Data (Census, NSSO) | API/Manual | Annual |
| Industry Reports | Document AI | Quarterly |

### 3.2 Data Model
```typescript
interface DemandDriver {
  id: string;
  industry: string;
  driver: string;
  impactPct: number;      // % contribution
  trend: 'up' | 'down' | 'stable';
  source: string;         // document ID or manual
  confidence: number;     // 0-1 (Doc AI confidence)
  notes: string;
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Document AI:** Auto-extraction from uploaded docs
- **Industry Page:** Feeds into Industry Aggregate
- **Company Page (Story tab):** Demand drivers per company
- **GRWTH:** Demand validation for capex projects

---

## 4. API Contract

```typescript
interface DemandData {
  industry: string;
  drivers: DemandDriver[];
  totalImpact: number;    // Should sum to ~100%
  lastUpdated: string;
  docAiExtractions: DocAiExtraction[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Editable table with add/remove rows, % validation | Week 1 |
| 2 | Document AI integration, confidence scoring | Week 1 |
| 2 | Trend indicators, source linking | Week 2 |
| 3 | Export, template save, cross-tab sync | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| % sum validation | Warns if ≠ 100% |
| Doc AI extraction | >80% accuracy on test docs |
| Row add/remove | Persists correctly |
| Cross-tab sync | Updates Industry Aggregate |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*