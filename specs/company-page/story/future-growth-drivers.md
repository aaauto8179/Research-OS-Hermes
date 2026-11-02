# Future Growth Drivers Tool Specification

**Tool Name:** Future Growth Drivers  
**Category:** Story  
**Sheet:** Company Page → Story  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Similar to Current Growth Drivers but focused on future/potential growth drivers: pipeline projects, R&D initiatives, market expansion plans, regulatory tailwinds, technology disruptions. Includes probability-weighted scenarios and timeline.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Story |
| Tool | Future growth drivers |
| Description | Same as above |
| Data Source | Documents Upload, Document AI |
| Sample Link | https://drive.google.com/file/d/1AFA9TLJ-1oAzFjOhwlCRJsKIEx4xWsCV/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Future Growth Drivers - [SYMBOL]                                │
├─────────────────────────────────────────────────────────────────┤
│ FUTURE DRIVERS TABLE                                            │
│ ┌────┬──────────────────────┬──────────┬──────────┬────────┬────┐ │
│ │ #  │ Driver               │ Timeline │ Probability│ Market │Imp │ │
│ │    │                      │ (Yr)     │ (H/M/L)   │ Size   │act │ │
│ ├────┼──────────────────────┼──────────┼──────────┼────────┼────┤ │
│ │ 1  │ Green hydrogen plant │ 2026-28  │ High      │₹20,000Cr│H │ │
│ │ 2  │ EV battery JV        │ 2025-27  │ Medium    │₹15,000Cr│M │ │
│ │ 3  │ SE Asia expansion    │ 2025-30  │ Medium    │₹25,000Cr│M │ │
│ │ 4  │ Carbon capture tech  │ 2028+    │ Low       │₹10,000Cr│L │ │
│ └────┴──────────────────────┴──────────┴──────────┴────────┴────┘ │
│ [Add Driver] [Import from Doc AI] [Link to Revenue Projection]    │
├─────────────────────────────────────────────────────────────────┤
│ SCENARIO WEIGHTING                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Base Case: 60% probability  │ Revenue +₹45,000Cr by FY30   │ │
│ │ Bull Case: 25% probability   │ Revenue +₹65,000Cr by FY30   │ │
│ │ Bear Case: 15% probability   │ Revenue +₹25,000Cr by FY30   │ │
│ │ Expected Value: +₹44,500Cr by FY30                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Driver] [Link to Revenue Projection] [Link to GRWTH Pipeline] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Driver Fields
| Field | Type | Validation |
|-------|------|------------|
| Description | String | Required |
| Timeline | String (e.g., "2025-28") | Required |
| Probability | Enum | High / Medium / Low |
| Market Size | Number (₹Cr) | > 0 |
| Impact | Enum | High / Medium / Low |

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| drivers | FutureDriver[] | Manual / Doc AI |
| scenarios | Scenario[] | Manual |

### 3.2 Doc AI Extraction
- **Source:** Investor presentations, capex announcements, R&D disclosures, management interviews
- **Extractor:** `FutureGrowthExtractor`
- **Output:** Structured pipeline projects with timelines, probabilities

---

## 4. Engine Integration

### 4.1 Links
- **Revenue Projection Engine:** Future drivers feed into long-term projections (FY25-FY30)
- **GRWTH Pipeline:** Capital projects tracked in GRWTH Pipeline tab
- **Valuation Philosophy:** Future drivers feed into Bull Case scenarios

---

## 5. API Contract

```typescript
interface FutureGrowthDriversData {
  symbol: string;
  drivers: FutureDriver[];
  scenarios: Scenario[];
  expectedValue: number;  // ₹Cr
  lastUpdated: string;
}

interface FutureDriver {
  id: string;
  description: string;
  timeline: string;  // e.g., "2025-28"
  probability: 'High' | 'Medium' | 'Low';
  marketSizeCr: number;
  impact: 'High' | 'Medium' | 'Low';
  source: 'manual' | 'doc_ai';
  confidence?: number;
}

interface Scenario {
  name: 'Base' | 'Bull' | 'Bear';
  probability: number;
  revenueUpsideCr: number;
  keyAssumptions: string[];
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Future driver table with timeline, probability dropdowns | Week 1 |
| 2 | Scenario weighting with expected value calculation | Week 1 |
| 2 | Doc AI import, GRWTH Pipeline link | Week 2 |
| 3 | Scenario export to Valuation Philosophy | Week 2 |

---

## 6. Testing
- Timeline parsing (e.g., "2025-28" → start=2025, end=2028)
- Probability-weighted expected value calculation
- GRWTH Pipeline data sync
- Valuation Philosophy data flow

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*