# Scenario Analysis Tool Specification

**Tool Name:** Scenario Analysis  
**Category:** Decision Framework  
**Sheet:** Weigh decisions  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Multi-scenario portfolio stress testing: bear/base/bull cases with probability weights. Monte Carlo simulation for return distributions. Tail risk analysis (VaR, CVaR). Outputs scenario-weighted expected return, probability of loss, and optimal hedges.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Scenario Analysis - [PORTFOLIO/IDEA]                            │
├─────────────────────────────────────────────────────────────────┤
│ SCENARIOS                                                       │
│ ┌─────────────────┬────────┬────────┬────────┬────────┬────────┐ │
│ │ Scenario        │ Prob.  │ Return │ Max DD │ VaR 95%│ Action │ │
│ ├─────────────────┼────────┼────────┼────────┼────────┼────────┤ │
│ │ Bear Case       │ 25%    │ -15%   │ -28%   │ -22%   │ Hedge  │ │
│ │ Base Case       │ 50%    │ +18%   │ -8%    │ -10%   │ Hold   │ │
│ │ Bull Case       │ 25%    │ +45%   │ -5%    │ -6%    │ Add    │ │
│ ├─────────────────┼────────┼────────┼────────┼────────┼────────┤ │
│ │ WEIGHTED        │ 100%   │ +15.8% │ -12.3% │ -11.8% │        │ │
│ └─────────────────┴────────┴────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MONTE CARLO (10,000 runs)                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Return Distribution:                                        │ │
│ │ [Histogram: -30% to +60%, peak at +15%]                    │ │
│ │ Mean: +16.2%  │ Median: +15.8%  │ Std: 18.5%               │ │
│ │ P(Loss): 28%  │ P(>20%): 35%  │ P(>50%): 8%               │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Tail Risk:                                                  │ │
│ │ VaR 95%: -11.8%  │ CVaR 95%: -18.2%  │ Max Loss: -42%     │ │
│ │ Skewness: +0.3  │ Kurtosis: 3.8  │ Sharpe: 0.87           │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ KEY DRIVERS (Sensitivity)                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Variable          │ Base → Bear  │ Base → Bull  │ Elasticity│ │
│ ├───────────────────┼──────────────┼──────────────┼──────────┤ │
│ │ Crude Oil         │ $75 → $95    │ $75 → $60    │ -0.45    │ │
│ │ INR/USD           │ 83 → 87      │ 83 → 80      │ -0.32    │ │
│ │ GDP Growth        │ 6.5% → 5%    │ 6.5% → 7.5%  │ +0.68    │ │
│ │ Interest Rates    │ 6.5% → 7.5%  │ 6.5% → 5.5%  │ -0.55    │ │
│ └───────────────────┴──────────────┴──────────────┴──────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ OPTIMAL HEDGE                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Recommended: Nifty Put Dec 2024 24,000 (2% notional)       │ │
│ │ Cost: 1.2%  │ Reduces VaR 95%: -11.8% → -8.5%              │ │
│ │ Reduces Max DD: -12.3% → -9.1%                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Run Monte Carlo] [Adjust Probabilities] [Export] [Save]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Monte Carlo Engine
```python
def monte_carlo_portfolio(returns, n_sims=10000, horizon=252):
    """Geometric Brownian Motion with correlation"""
    mu = returns.mean() * 252
    sigma = returns.std() * sqrt(252)
    corr_matrix = returns.corr()
    
    # Cholesky decomposition for correlated random walks
    L = np.linalg.cholesky(corr_matrix)
    
    results = []
    for _ in range(n_sims):
        z = np.random.normal(0, 1, (horizon, len(returns)))
        correlated_z = z @ L.T
        daily_returns = mu/252 + sigma * correlated_z / sqrt(252)
        path_return = np.prod(1 + daily_returns) - 1
        results.append(path_return)
    
    return np.array(results)

def scenario_analysis(portfolio, scenarios):
    """Weighted scenario analysis"""
    weighted_return = sum(s.prob * s.return for s in scenarios)
    weighted_dd = sum(s.prob * s.max_dd for s in scenarios)
    weighted_var = sum(s.prob * s.var_95 for s in scenarios)
    
    return {
        'weighted_return': weighted_return,
        'weighted_max_dd': weighted_dd,
        'weighted_var_95': weighted_var,
        'scenarios': scenarios
    }
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Risk:** VaR, CVaR, factor models
- **Conviction Sizing:** Scenario-weighted sizing
- **Valuation Suite:** DCF scenarios (bear/base/bull)
- **Risk Engine:** Tail risk metrics

---

## 4. API Contract

```typescript
interface ScenarioAnalysisRequest {
  portfolioId: string;
  scenarios: Scenario[];
  monteCarlo: boolean;
  nSims: number;
}

interface Scenario {
  name: string;
  probability: number;
  assumptions: Record<string, number>;
  expectedReturn: number;
  maxDrawdown: number;
  var95: number;
}

interface ScenarioAnalysisResponse {
  weighted: {
    expectedReturn: number;
    maxDrawdown: number;
    var95: number;
    cvar95: number;
  };
  monteCarlo: {
    mean: number;
    median: number;
    std: number;
    lossProbability: number;
    tailRisk: { var95: number; cvar95: number; maxLoss: number };
    distribution: number[];  // histogram bins
  };
  sensitivity: SensitivityItem[];
  optimalHedge: HedgeRecommendation;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Scenario engine, weighted calculations | Week 1 |
| 2 | Monte Carlo engine (correlated GBM), histogram | Week 1 |
| 2 | Sensitivity analysis, tail risk metrics | Week 2 |
| 3 | Optimal hedge recommendation, UI charts | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Weighted return | Σ prob × return |
| Monte Carlo mean | Converges with n_sims |
| VaR/CVaR | Correct percentile |
| Sensitivity | Elasticity = %ΔReturn / %ΔVar |
| Hedge optimization | Reduces VaR within cost constraint |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*