# Current Growth Drivers Tool Specification

**Tool Name:** Current Growth Drivers  
**Category:** Story  
**Sheet:** Company Page → Story  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Text box for documenting current growth drivers with market size columns. Each driver has description, % contribution to growth, market size, and confidence level. Links to Revenue Projection engine for quantitative modeling.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Story |
| Tool | Current growth drivers |
| Description | This will be a text box where we can add the growth drivers of the company, there will 2 other coloumns as well which will contain market size |
| Data Source | Documents Upload, Document AI |
| Sample Link | https://drive.google.com/file/d/1AFA9TLJ-1oAzFjOhwlCRJsKIEx4xWsCV/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Current Growth Drivers - [SYMBOL]                               │
├─────────────────────────────────────────────────────────────────┤
│ DRIVERS TABLE                                                   │
│ ┌────┬──────────────────────┬─────────┬──────────┬──────────┬───────┐ │
│ │ #  │ Driver               │ % Contrib│ Market  │ Confidence│ Notes │ │
│ │    │                      │ to Growth│ Size    │ (H/M/L)  │       │ │
│ ├────┼──────────────────────┼─────────┼──────────┼──────────┼───────┤ │
│ │ 1  │ Volume growth O2C    │ 35%      │ ₹50,000Cr│ High     │ CapEx │ │
│ │ 2  │ Price hike chemicals │ 25%      │ ₹20,000Cr│ Medium   │ Cycle │ │
│ │ 3  │ Retail expansion     │ 20%      │ ₹15,000Cr│ High     │ 200 stores│ │
│ │ 4  │ Jio 5G rollout       │ 15%      │ ₹8,000Cr │ High     │ Capex │ │
│ │ 5  │ New product launch   │ 5%       │ ₹5,000Cr │ Low      │ R&D   │ │
│ └────┴──────────────────────┴─────────┴──────────┴──────────┴───────┘ │
│ [Add Driver] [Import from Doc AI] [Link to Revenue Projection]     │
├─────────────────────────────────────────────────────────────────┤
│ TOTAL CONTRIBUTION: 100%  │  MARKET SIZE TOTAL: ₹98,000Cr      │
│ [Validate Sum = 100%]     │  [Auto-calc from Revenue Projection]│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Driver Fields
| Field | Type | Validation |
|-------|------|------------|
| Description | String | Required |
| % Contribution | Number | 0-100, Sum = 100% |
| Market Size | Number (₹Cr) | > 0 |
| Confidence | Enum | High / Medium / Low |
| Notes | Text | Optional |

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| drivers | Driver[] | Manual / Doc AI |
| total_contribution | number | Auto-calculated (must = 100%) |

### 3.2 Doc AI Extraction
- **Source:** Annual reports (MD&A, growth strategy section), investor presentations
- **Extractor:** `GrowthDriverExtractor`
- **Output:** Structured drivers with descriptions, market size estimates

---

## 4. Engine Integration

### 4.1 Links to Revenue Projection Engine
- Drivers feed into `RevenueProjectionEngine` as `growth_drivers` input
- Market sizes feed into `market_size` assumptions
- Contribution % feeds into segment weightings

---

## 5. API Contract

```typescript
interface CurrentGrowthDriversData {
  symbol: string;
  drivers: Driver[];
  totalContribution: number;  // must = 100
  totalMarketSize: number;  // ₹Cr
  lastUpdated: string;
}

interface Driver {
  id: string;
  description: string;
  contributionPct: number;  // 0-100
  marketSizeCr: number;  // ₹ Crores
  confidence: 'High' | 'Medium' | 'Low';
  notes: string;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

---

## 6. Validation Rules

| Rule | Error Message |
|------|---------------|
| Sum of contributions ≠ 100% | "Total contribution must equal 100%" |
| Any contribution < 0 or > 100 | "Contribution must be 0-100%" |
| Market size ≤ 0 | "Market size must be positive" |

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Driver table with inline validation (sum = 100%) | Week 1 |
| 2 | Market size auto-sum, confidence badges | Week 1 |
| 2 | Doc AI import, Revenue Projection link | Week 2 |
| 3 | Validation warnings, CSV export | Week 2 |

---

## 7. Testing
- Contribution sum validation (real-time)
- Market size auto-calculation
- Doc AI extraction accuracy
- Revenue Projection engine data flow

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*