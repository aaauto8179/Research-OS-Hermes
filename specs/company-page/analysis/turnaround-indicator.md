# Turnaround Indicator Tool Specification (Analysis Tab UI)

**Tool Name:** Turnaround Indicator (UI)  
**Category:** Analysis  
**Sheet:** Company Page → Analysis  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
UI for Turnaround Indicator engine: visualizes 5-pillar score, signal detection, timeline, and alert rules. Consumes Turnaround Indicator Engine for calculations.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Turnaround Indicator - [SYMBOL]                                 │
├─────────────────────────────────────────────────────────────────┤
│ SCORE: 72/100  │  Status: 🟡 EARLY STAGE TURNAROUND            │
├─────────────────────────────────────────────────────────────────┤
│ PILLAR BREAKDOWN                  │ KEY SIGNALS                │
│ ┌────────────────────────────────┐│ ┌────────────────────────┐ │
│ │ Financial Inflection: 28/35  ██││ ✅ ROE +620bps YoY       │ │
│ │ Balance Sheet Repair: 18/25 ███││ ✅ Debt -22% YoY         │ │
│ │ Operational Catalysts: 15/20 ██││ ✅ FCF Turned +ve        │ │
│ │ Management Quality: 8/10   ████││ ✅ Promoter Buying       │ │
│ │ Valuation Support: 3/10    ███ ││ ⚠️ P/B > 1.0             │ │
│ └────────────────────────────────┘│ ⚠️ EV/EBITDA High        │ │
│ WEIGHTED TOTAL: 72/100            └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TIMELINE                                                         │
│ Q4FY23 ──●──●──●──●──●── Q4FY24                                 │
│          Debt  FCF  ROE  Margin  Promoter                       │
│          Red   Red  Red  Red     Red                            │
│                             Green  Green                        │
│ [Deep Dive] [Add to Watchlist] [Set Alert]                      │
├─────────────────────────────────────────────────────────────────┤
│ ALERT RULES                                                      │
│ Score > 70 + 2+ green signals → "Turnaround Watch"             │
│ Score > 80 + FCF positive → "High Conviction Turnaround"       │
│ Score drops > 15 points → "Turnaround Risk" alert              │
├─────────────────────────────────────────────────────────────────┤
│ [Run Analysis] [Set Alert] [Add to Watchlist] [Export Report]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 4.1 Engine
- **TurnaroundIndicatorEngine** in `math-engine/src/math_engine/analysis/turnaround.py`
- **API:** Embedded in analysis endpoint

### 4.2 Inputs
| Field | Type | Source |
|-------|------|--------|
| roe_improvement | boolean | Ratio Engine |
| margin_expansion | boolean | Ratio Engine |
| debt_reduction | boolean | Ratio Engine |
| fcf_turn_positive | boolean | Cash Flow Engine |
| promoter_buying | boolean | Shareholding Pattern |
| capex_completion | boolean | Track Record / CapEx data |

---

## 4. API Contract

```typescript
interface TurnaroundIndicatorData {
  symbol: string;
  score: number;
  status: 'Early Stage' | 'Progressing' | 'Advanced' | 'Completed' | 'Failed';
  pillars: {
    financialInflection: number;
    balanceSheetRepair: number;
    operationalCatalysts: number;
    managementQuality: number;
    valuationSupport: number;
  };
  signals: {
    roe_improvement: boolean;
    margin_expansion: boolean;
    debt_reduction: boolean;
    fcf_turn_positive: boolean;
    promoter_buying: boolean;
    capex_completion: boolean;
  };
  timeline: TimelinePoint[];
  alertRules: AlertRule[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Score display, pillar breakdown bars | Week 1 |
| 2 | Signal cards with green/red badges | Week 1 |
| 2 | Timeline visualization | Week 2 |
| 2 | Alert rules display, alert setting | Week 2 |

---

## 6. Testing
- Score calculation accuracy (matches engine)
- Pillar score ranges (0-35, 0-25, etc.)
- Signal detection accuracy
- Timeline rendering
- Alert rule logic

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*