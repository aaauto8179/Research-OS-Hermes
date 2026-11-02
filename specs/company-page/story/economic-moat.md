# Economic Moat Tool Specification

**Tool Name:** Economic Moat  
**Category:** Story  
**Sheet:** Company Page → Story  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured assessment of the company's competitive advantages (moats): switching costs, network effects, intangible assets, cost advantages, efficient scale. Scored framework with evidence from financials, industry analysis, and management commentary.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Economic Moat Assessment - [SYMBOL]                             │
├─────────────────────────────────────────────────────────────────┤
│ MOAT SCORE: 78/100  │  Rating: WIDE  │  Trend: ▲ Improving    │
├─────────────────────────────────────────────────────────────────┤
│ MOAT SOURCES                                                    │
│ ┌────────────────────┬────────┬────────────────────────────────┐ │
│ │ Source             │ Score  │ Evidence                       │ │
│ ├────────────────────┼────────┼────────────────────────────────┤ │
│ │ Switching Costs    │  18/20 │ ERP integration, 3-yr contracts│ │
│ │ Network Effects    │  12/20 │ Limited (B2B focus)            │ │
│ │ Intangible Assets  │  16/20 │ Brand, 47 patents, regulatory  │ │
│ │ Cost Advantage     │  15/20 │ Scale, vertical integration    │ │
│ │ Efficient Scale    │  17/20 │ Niche market, high entry barrier│ │
│ ├────────────────────┼────────┼────────────────────────────────┤ │
│ │ TOTAL              │  78/100│                                │ │
│ └────────────────────┴────────┴────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ EVIDENCE & ANALYSIS (per source)                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ SWITCHING COSTS (18/20)                                      │ │
│ │ • ERP deeply embedded in customer operations (3-5 yr contracts)│ │
│ │ • Migration cost estimated at 15-20% of annual IT spend      │ │
│ │ • 95% customer retention rate over 5 years                   │ │
│ │ • Evidence: Customer surveys, contract terms, churn data     │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ INTANGIBLE ASSETS (16/20)                                    │ │
│ │ • Brand: #1 market share for 15+ years                       │ │
│ │ • IP: 47 patents, 12 pending, key process patents            │ │
│ │ • Regulatory: 3 key licenses with 10+ year barriers          │ │
│ │ • Evidence: Patent filings, market share reports, license docs│ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ COMPETITIVE POSITIONING                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ vs Peer 1: Moat wider (switching costs + scale)             │ │
│ │ vs Peer 2: Similar (both have cost advantages)              │ │
│ │ vs Peer 3: Narrower (less vertical integration)             │ │
│ │ Industry Avg Moat Score: 52  │  Company: 78  │  Percentile: 89th│ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Evidence] [Import from Doc AI] [Export Moat Report]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| moat_sources | MoatSource[] | Manual / Doc AI |
| competitive_positioning | object | Manual + Industry Page |

### 3.2 Moat Source Schema
```typescript
interface MoatSource {
  name: 'Switching Costs' | 'Network Effects' | 'Intangible Assets' | 'Cost Advantage' | 'Efficient Scale';
  score: number;  // 0-20
  evidence: string[];
  confidence: number;
}
```

---

## 4. Scoring Framework

### 4.1 Scoring Guidelines (0-20 each)
| Score | Switching Costs | Network Effects | Intangible Assets | Cost Advantage | Efficient Scale |
|-------|-----------------|-----------------|-------------------|----------------|-----------------|
| 18-20 | Lock-in >5yr, >20% migration cost | Dominant platform, >50% market share | Iconic brand, patent fortress, regulatory moat | >30% cost lead vs peers | Natural monopoly, niche |
| 15-17 | 3-5yr contracts, 10-20% cost | Strong 2-sided network | Strong brand, patent portfolio | 15-30% cost lead | Niche, high entry barrier |
| 10-14 | 1-3yr contracts, 5-10% cost | Emerging network | Recognized brand, some IP | 5-15% cost lead | Regional dominance |
| 5-9 | <1yr contracts, <5% cost | Weak network | Commodity brand, minimal IP | <5% cost lead | Competitive market |
| 0-4 | No switching costs | No network effects | No brand/IP advantage | Cost disadvantage | Fragmented market |

---

## 5. API Contract

```typescript
interface EconomicMoatData {
  symbol: string;
  totalScore: number;  // 0-100
  rating: 'Wide' | 'Narrow' | 'None';
  trend: 'Improving' | 'Stable' | 'Deteriorating';
  sources: MoatSource[];
  competitivePositioning: {
    vsPeers: PeerComparison[];
    industryAvg: number;
    percentile: number;
  };
  lastUpdated: string;
}

interface MoatSource {
  name: string;
  score: number;
  evidence: string[];
  confidence: number;
}

interface PeerComparison {
  peer: string;
  moatScore: number;
  comparison: 'Wider' | 'Similar' | 'Narrower';
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Scorecard with 5 sources, evidence textareas | Week 1 |
| 2 | Scoring guidelines tooltip, competitive positioning | Week 1 |
| 2 | Doc AI import (patent data, contract terms) | Week 2 |
| 3 | Peer comparison from Industry Page, PDF export | Week 2 |

---

## 6. Testing
- Scoring guidelines accuracy
- Evidence linking to sources
- Peer comparison data flow
- PDF report generation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*