# Portfolio Fit Check Tool Specification

**Tool Name:** Portfolio Fit Check  
**Category:** Decision Framework  
**Sheet:** Weigh decisions  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Evaluates how a new idea/investment fits into the existing portfolio: sector overlap, factor correlation, concentration risk, liquidity impact, conviction alignment. Outputs a "Fit Score" with breakdown and recommendations (size, hedge, pass).

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Fit Check - [NEW IDEA: RELIANCE]                      │
├─────────────────────────────────────────────────────────────────┤
│ INPUT: Symbol: RELIANCE  │ Proposed Size: 8%  │ Conviction: High│
├─────────────────────────────────────────────────────────────────┤
│ FIT SCORE: 72/100  │ RECOMMENDATION: ✅ ADD (Size: 6-8%)       │
├─────────────────────────────────────────────────────────────────┤
│ FACTOR BREAKDOWN                                               │
│ ┌─────────────────────────┬────────┬────────┬────────────────┐ │
│ │ Factor                  │ Score  │ Weight │ Detail         │ │
│ ├─────────────────────────┼────────┼────────┼────────────────┤ │
│ │ Sector Overlap          │ 45/100 │ 25%    │ Energy 32%→40% │ │
│ │ Factor Correlation      │ 78/100 │ 20%    │ Beta 0.92→0.95 │ │
│ │ Concentration Risk      │ 65/100 │ 20%    │ Top 5: 65%→73% │ │
│ │ Liquidity Impact        │ 90/100 │ 15%    │ T+1: 95%→93%   │ │
│ │ Conviction Alignment    │ 85/100 │ 20%    │ Matches thesis │ │
│ └─────────────────────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ WHAT-IF SCENARIOS                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scenario          │ Port. Value │ Max DD  │ Sector Conc.   │ │
│ ├───────────────────┼─────────────┼─────────┼────────────────┤ │
│ │ Current           │ ₹1.25Cr     │ -12.4%  │ Energy 32%     │ │
│ │ +5% RELIANCE      │ ₹1.31Cr     │ -13.1%  │ Energy 37%     │ │
│ │ +8% RELIANCE      │ ₹1.35Cr     │ -13.8%  │ Energy 40%     │ │
│ │ +8% + Hedge       │ ₹1.35Cr     │ -11.2%  │ Energy 40%     │ │
│ └───────────────────┴─────────────┴─────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RECOMMENDATIONS                                                 │
│ • Sector overlap high: Consider reducing other Energy holdings  │
│ • Add Nifty Energy Put (Dec 2024) for hedge                    │
│ • Size at 6% instead of 8% to stay within sector limit 35%     │
│ • Conviction alignment strong: Core thesis matches portfolio   │
│ [Run Full Analysis] [Save Scenario] [Export Report]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Fit Score Calculation
```python
def calculate_fit_score(new_holding, portfolio, params):
    # 1. Sector Overlap (25%)
    current_sector_wt = portfolio.sector_weights.get(new_holding.sector, 0)
    new_sector_wt = current_sector_wt + params.proposed_size
    sector_score = max(0, 100 - (new_sector_wt / params.sector_limit) * 100)
    
    # 2. Factor Correlation (20%)
    new_beta = portfolio.beta * (1 - params.proposed_size) + new_holding.beta * params.proposed_size
    correlation_score = 100 - abs(new_beta - portfolio.beta) * 50
    
    # 3. Concentration Risk (20%)
    new_top5 = portfolio.top5_weight + params.proposed_size if new_holding in portfolio.top5 else portfolio.top5_weight
    concentration_score = max(0, 100 - (new_top5 / 0.7) * 100)
    
    # 4. Liquidity Impact (15%)
    new_liquidity = portfolio.t1_liquidity * (1 - params.proposed_size) + new_holding.liquidity * params.proposed_size
    liquidity_score = new_liquidity * 100
    
    # 5. Conviction Alignment (20%)
    conviction_score = params.conviction * 100  # High=1.0, Med=0.7, Low=0.4
    
    weights = [0.25, 0.20, 0.20, 0.15, 0.20]
    scores = [sector_score, correlation_score, concentration_score, liquidity_score, conviction_score]
    fit_score = sum(s * w for s, w in zip(scores, weights))
    
    return {
        'fit_score': round(fit_score),
        'breakdown': dict(zip(['sector', 'correlation', 'concentration', 'liquidity', 'conviction'], scores)),
        'recommendation': get_recommendation(fit_score)
    }
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Management:** Current holdings, risk metrics
- **Screening Engine:** New idea fundamental data
- **Risk Engine:** Correlation, VaR, sector limits
- **Valuation Suite:** New idea valuation

---

## 4. API Contract

```typescript
interface FitCheckRequest {
  symbol: string;
  proposedSize: number;  // % of portfolio
  conviction: 'high' | 'medium' | 'low';
  portfolioId: string;
}

interface FitCheckResponse {
  fitScore: number;
  recommendation: 'ADD' | 'ADD_WITH_HEDGE' | 'REDUCE_SIZE' | 'PASS';
  breakdown: {
    sectorOverlap: { score: number; detail: string };
    factorCorrelation: { score: number; detail: string };
    concentrationRisk: { score: number; detail: string };
    liquidityImpact: { score: number; detail: string };
    convictionAlignment: { score: number; detail: string };
  };
  whatIfScenarios: WhatIfScenario[];
  recommendations: string[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Fit score engine, factor breakdown | Week 1 |
| 2 | What-if scenario engine, recommendation logic | Week 1 |
| 2 | UI with interactive sliders, real-time recalc | Week 2 |
| 3 | Portfolio integration, save scenarios | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Fit score range | 0-100 |
| Recommendation logic | Consistent with scores |
| What-if scenarios | Directionally correct |
| Sector overlap calc | Matches portfolio data |
| Conviction mapping | High=100, Med=70, Low=40 |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*