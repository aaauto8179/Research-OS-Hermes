# Decision Journal Tool Specification

**Tool Name:** Decision Journal  
**Category:** Decision Framework  
**Sheet:** Weigh decisions  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Records investment decisions with rationale, expected outcome, confidence, and timestamps. Tracks actual outcomes vs expectations for calibration. Enables review of decision quality over time. Integrates with Company Page Decision Terminal.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Decision Journal - [PORTFOLIO/COMPANY]                          │
├─────────────────────────────────────────────────────────────────┤
│ [+ New Decision]  [Filter: Symbol ▼] [Type ▼] [Outcome ▼]      │
├─────────────────────────────────────────────────────────────────┤
│ DECISIONS TABLE                                                 │
│ ┌────┬────────┬────────┬────────┬────────┬──────┬──────┬───────┐ │
│ │ #  │ Date   │ Symbol │ Type   │ Dir. │ Conf.│ Exp. │ Act.  │ │
│ ├────┼────────┼────────┼────────┼──────┼──────┼──────┼───────┤ │
│ │ 1  │ 2024-10│ RELIANCE│ BUY    │ Long │ 85%  │ +25% │ +18%  │ │
│ │ 2  │ 2024-09│ TCS     │ ADD    │ Long │ 75%  │ +15% │ +22%  │ │
│ │ 3  │ 2024-08│ INFY    │ SELL   │ Exit │ 70%  │ -5%  │ +12%  │ │
│ │ 4  │ 2024-07│ HDFC    │ HEDGE  │ Put  │ 60%  │ -8%  │ -3%   │ │
│ └────┴────────┴────────┴────────┴──────┴──────┴──────┴───────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DECISION DETAIL (on click)                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Decision: BUY RELIANCE @ ₹2,950  │ Date: 2024-10-15         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ THESIS: O2C recovery + Retail growth + Green energy option  │ │
│ │ Expected: +25% in 12M  │ Confidence: 85%  │ Size: 6%       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ KEY ASSUMPTIONS:                                          │ │
│ │ 1. Crude < $85/bbl (Prob: 70%)                            │ │
│ │ 2. Retail same-store growth >15% (Prob: 80%)              │ │
│ │ 3. Green hydrogen policy supportive (Prob: 60%)           │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ OUTCOME TRACKING:                                         │ │
│ │ Current: +18% (6M)  │ Assumption 1: ✅ Crude $78         │ │
│ │                     │ Assumption 2: ✅ SSG 18%            │ │
│ │                     │ Assumption 3: ⚠️ Policy delayed     │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ CALIBRATION: Brier Score: 0.18  │ Resolution: 0.72       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CALIBRATION CHARTS                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Reliability Diagram  │  Resolution Chart                    │ │
│ │ [Chart]              │  [Chart]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Export] [Link to Company Decision Terminal]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Decision Schema
```typescript
interface Decision {
  id: string;
  date: string;
  symbol: string;
  type: 'BUY' | 'SELL' | 'ADD' | 'REDUCE' | 'HEDGE' | 'PASS';
  direction: 'long' | 'short' | 'neutral';
  confidence: number;  // 0-1
  expectedReturn: number;  // % over horizon
  horizon: string;  // e.g., "12M"
  positionSize: number;  // % of portfolio
  thesis: string;
  assumptions: Assumption[];
  outcome: Outcome | null;
  calibration: CalibrationMetrics;
  linkedTo: {
    companyPage: boolean;
    fitCheck: string | null;
    sizing: string | null;
  };
}

interface Assumption {
  id: string;
  description: string;
  probability: number;
  status: 'pending' | 'met' | 'failed' | 'unknown';
  verifiedAt?: string;
}

interface Outcome {
  actualReturn: number;
  actualHorizon: string;
  assumptionsMet: number;
  assumptionsTotal: number;
  notes: string;
  closedAt: string;
}

interface CalibrationMetrics {
  brierScore: number;
  resolution: number;
  reliability: number;
  sharpness: number;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (Decision Terminal):** Auto-links decisions
- **Portfolio Fit Check:** Links sizing/fit decisions
- **Conviction Sizing:** Links sizing model used
- **Alerts:** Tracks assumption verification

---

## 4. API Contract

```typescript
interface DecisionJournalData {
  decisions: Decision[];
  calibration: {
    overallBrier: number;
    byConfidence: { confidence: number; brier: number; count: number }[];
    byType: { type: string; brier: number; count: number }[];
    byHorizon: { horizon: string; brier: number; count: number }[];
  };
  stats: {
    totalDecisions: number;
    closedDecisions: number;
    avgConfidence: number;
    hitRate: number;  // % where direction correct
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Decision schema, CRUD UI, assumption tracking | Week 1 |
| 2 | Outcome tracking, calibration metrics (Brier, resolution) | Week 1 |
| 2 | Calibration charts, reliability diagrams | Week 2 |
| 3 | Company Page integration, auto-link from Fit Check/Sizing | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Brier score | Correct formula: mean((conf - outcome)²) |
| Reliability diagram | Bins match confidence levels |
| Assumption tracking | Status updates work |
| Company Page link | Decisions appear in Decision Terminal |
| Calibration over time | Improves with more data |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*