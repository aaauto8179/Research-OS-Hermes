# Risk Score Calculator Tool Specification

**Tool Name:** Risk Score Calculator  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Composite risk score aggregator: aggregates Business, Financial, Valuation, Governance, Macro, Industry risks into single 0-100 score with grade. Weighted framework with drill-down to each category.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Risk Score Calculator - [SYMBOL]                                │
├─────────────────────────────────────────────────────────────────┤
│ TOTAL RISK SCORE: 42/100  │  Grade: MODERATE  │  Trend: ▼      │
├─────────────────────────────────────────────────────────────────┤
│ CATEGORY BREAKDOWN                                              │
│ ┌────────────────────────┬────────┬────────┬──────────────────┐ │
│ │ Category               │ Weight │ Score  │ Contribution     │ │
│ ├────────────────────────┼────────┼────────┼──────────────────┤ │
│ │ Business Risk          │ 25%    │ 35     │ 8.75             │ │
│ │ Financial Risk         │ 25%    │ 48     │ 12.00            │ │
│ │ Valuation Risk         │ 20%    │ 55     │ 11.00            │ │
│ │ Governance Risk        │ 15%    │ 32     │ 4.80             │ │
│ │ Macro/Industry Risk    │ 15%    │ 40     │ 6.00             │ │
│ ├────────────────────────┼────────┼────────┼──────────────────┤ │
│ │ WEIGHTED TOTAL         │ 100%   │        │ 42.55            │ │
│ └────────────────────────┴────────┴────────┴──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SCORE HISTORY (12M)                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 50 ┤     ●                                                  │ │
│ │ 45 ┤   ●                                                    │ │
│ │ 40 ┤ ●                                                      │ │
│ │ 35 ┤                                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ GRADE THRESHOLDS                                                │
│ ┌────────────┬──────────┬────────────────────────────────────┐ │
│ │ Grade      │ Range    │ Meaning                            │ │
│ ├────────────┼──────────┼────────────────────────────────────┤ │
│ │ LOW RISK   │ 0-30     │ Minimal concerns                   │ │
│ │ MODERATE   │ 31-60    │ Some concerns, manageable          │ │
│ │ HIGH RISK  │ 61-100   │ Significant concerns, monitor      │ │
│ └────────────┴──────────┴────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Recalculate] [Adjust Weights] [Export Report] [Link to Categories] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| category_scores | object | Auto from risk engines |
| weights | object | Configurable (default shown) |

### 3.2 Score Calculation
```python
# Weighted average
total_score = Σ(category_score × weight)

# Grade thresholds
if score <= 30: grade = 'LOW'
elif score <= 60: grade = 'MODERATE'
else: grade = 'HIGH'
```

### 3.3 Category Score Sources
| Category | Source Engine |
|----------|---------------|
| Business Risk | Business Risk tool |
| Financial Risk | Financial Risk tool (Ratio Engine) |
| Valuation Risk | Valuation Risk tool (Valuation Suite) |
| Governance Risk | Governance Risk tool (Management tab) |
| Macro/Industry Risk | Macro Risk + Industry Red Flags |

---

## 4. Engine Integration

### 4.1 Links
- **All Risk Category Tools:** Auto-feeds scores
- **Weights Config:** User-adjustable with defaults
- **History:** Auto-snapshots on recalculate

---

## 4. API Contract

```typescript
interface RiskScoreData {
  symbol: string;
  totalScore: number;
  grade: 'LOW' | 'MODERATE' | 'HIGH';
  trend: 'Improving' | 'Stable' | 'Deteriorating';
  categories: {
    businessRisk: { weight: number; score: number; contribution: number };
    financialRisk: { weight: number; score: number; contribution: number };
    valuationRisk: { weight: number; score: number; contribution: number };
    governanceRisk: { weight: number; score: number; contribution: number };
    macroIndustryRisk: { weight: number; score: number; contribution: number };
  };
  history: { date: string; score: number }[];
  weights: {
    business: number; financial: number; valuation: number;
    governance: number; macroIndustry: number;
  };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Weighted score calculator, category cards | Week 1 |
| 2 | Score history chart (12M), grade badges | Week 1 |
| 2 | Weight adjuster (with presets), auto-recalc | Week 2 |
| 3 | Auto-refresh from source engines, export | Week 2 |

---

## 6. Testing
- Weighted calculation accuracy
- Grade threshold boundaries
- Weight adjuster validation (sum = 100%)
- Auto-refresh from source engines
- History snapshot accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*