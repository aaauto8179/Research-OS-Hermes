# Weigh Decisions Tool Specification

**Tool Name:** Weigh Decisions  
**Sheet:** Weigh decisions  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Decision weighing framework: Portfolio Fit Check, Risk Correlation Assessment, Valuation & Allocation Discipline, Behavioural Audit, Final Decision Summary. Structured decision-making workflow with auto-generated outputs.

---

## 3. UI/UX Specification

### 3.1 Layout (5 Steps)
```
┌─────────────────────────────────────────────────────────────────┐
│ Weigh Decisions - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ STEP INDICATOR: [1] Portfolio Fit → [2] Risk Correlation → [3] Valuation │
│ [4] Behavioural → [5] Summary                                    │
├─────────────────────────────────────────────────────────────────┤
│ STEP 1: PORTFOLIO FIT CHECK                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sector Concentration: [Auto-calc from Portfolio]           │ │
│ │ Promoter Overlap: [Auto-calc]                               │ │
│ │ Style Fit: [Value/Growth] [Match: 85%]                     │ │
│ │ Liquidity Impact: [Days to liquidate: 3]                   │ │
│ │ [Auto-calculate] [Save]                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STEP 2: RISK CORRELATION ASSESSMENT                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Risk Buckets (from Company Page Risk tab):                 │ │
│ │ ┌─────────────┬──────────┬──────────┬────────────────────┐  │ │
│ │ │ Risk        │ Current  │ New Port │ Contribution     │  │ │
│ │ ├─────────────┼──────────┼──────────┼────────────────────┤  │ │
│ │ │ Business    │ 35       │ 38       │ +3%              │  │ │
│ │ │ Financial   │ 48       │ 45       │ -3%              │  │ │
│ │ │ Valuation   │ 55       │ 52       │ -3%              │  │ │
│ │ │ Governance  │ 32       │ 30       │ -2%              │  │ │
│ │ │ Macro       │ 40       │ 42       │ +2%              │  │ │
│ │ └─────────────┴──────────┴──────────┴────────────────────┘  │ │
│ │ Correlation Matrix: [Grid view]                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STEP 3: VALUATION & ALLOCATION DISCIPLINE                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Valuation Cases:                                            │ │
│ │ ┌────────┬──────────┬──────────┬────────────────────────┐   │ │
│ │ │ Case   │ FV/Share │ Prob.    │ Key Deltas             │   │ │
│ │ ├────────┼──────────┼──────────┼────────────────────────┤   │ │
│ │ │ Bear   │ ₹850     │ 25%      │ Rev -40%, Margin -4%   │   │ │
│ │ │ Base   │ ₹1,250   │ 50%      │ As guided              │   │ │
│ │ │ Bull   │ ₹1,850   │ 25%      │ Rev +30%, Margin +3%   │   │   │
│ │ └────────┴──────────┴──────────┴────────────────────────┘   │ │
│ │ Expected Value: ₹1,238 | MOS vs CMP: +38%                   │ │
│ │ Allocation Rules:                                           │ │
│ │   Conviction High (>80): 5-8%  │ Med (50-80): 2-5%         │ │
│ │   Conviction Low (<50): 0-2%  │                             │ │
│ │ [Calculate Allocation]                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STEP 4: BEHAVIOURAL AUDIT                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☐ Confirmation Bias: "Am I only seeing confirming data?"    │ │
│ │ ☐ Anchoring Bias: "Am I anchored to purchase price?"        │ │
│ │ ☐ Overconfidence: "Am I overestimating my edge?"            │ │
│ │ ☐ Herding Bias: "Am I following the crowd?"                 │ │
│ │ ☐ Loss Aversion: "Am I holding losers too long?"            │ │
│ │ ☐ Recency Bias: "Am I overweighting recent news?"           │ │
│ │ ☐ Endowment Effect: "Do I overvalue what I own?"            │ │
│ │ [Justification boxes for each]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STEP 5: FINAL DECISION SUMMARY                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DECISION: [BUY ▼]  [ADD / REDUCE / HOLD / SELL / AVOID]    │ │
│ │ Recommended Allocation: [3.5%]  │ Conviction: [HIGH ▼]      │ │
│ │ Entry Range: ₹920-₹960  │ Stop Loss: ₹800                   │ │
│ │ Review Triggers:                                            │ │
│ │   ☐ Valuation > Base + 20%    ☐ Thesis Broken               │ │
│ │   ☐ Risk Score > 70          ☐ Better Opportunity          │ │
│ │                                                             │ │
│ │ AUTO-GENERATED SUMMARY:                                     │ │
│ │ "High conviction BUY. Strong turnaround signals (FCF +ve,  │ │
│ │ debt reducing). Valuation at 38% MOS. Portfolio fit good.  │ │
│ │ Behavioural audit passed. Allocate 3.5%."                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Save Decision] [Export Report] [Add to Portfolio] [Schedule Review] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Steps & Engines
| Step | Engine | Data Source |
|------|--------|-------------|
| 1. Portfolio Fit | PortfolioAnalyticsEngine | Portfolio holdings |
| 2. Risk Correlation | RiskScoreEngine + PortfolioAnalytics | Company Risk + Portfolio |
| 3. Valuation | Valuation Suite (DCF, Relative, SOTP) | Valuation Suite |
| 4. Behavioural | Manual (checklist) | User input |
| 5. Summary | Auto-generated | All above |

---

## 4. API Contract

```typescript
interface WeighDecisionData {
  symbol: string;
  step1_portfolioFit: PortfolioFitResult;
  step2_riskCorrelation: RiskCorrelationResult;
  step3_valuation: ValuationAllocationResult;
  step4_behavioural: BehaviouralAuditResult;
  step5_summary: DecisionSummary;
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Step 1-2: Portfolio Fit, Risk Correlation (auto-calc) | Week 1 |
| 2 | Step 3: Valuation cases, allocation rules | Week 1 |
| 2 | Step 4: Behavioural checklist | Week 2 |
| 3 | Step 5: Auto-summary, decision logging | Week 2 |
| 3 | Cross-links, export report | Week 2 |

---

## 6. Testing
- Portfolio fit auto-calculation accuracy
- Risk correlation matrix accuracy
- Valuation case probability weights
- Behavioural checklist completeness
- Auto-summary generation accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*