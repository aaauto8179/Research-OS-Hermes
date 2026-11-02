# Risk Metrics Tool Specification

**Tool Name:** Risk Metrics  
**Category:** Portfolio Management → Portfolio Metrics  
**Sheet:** Portfolio management Page → 3) Portfolio Metrics → 2. Risk Metrics  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Comprehensive portfolio risk analytics: VaR, CVaR, volatility, drawdown analysis, stress testing, factor exposures, tail risk. Real-time calculation from holdings and historical returns.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Risk - [Portfolio Name]                               │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [1Y ▼] [3Y] [5Y]  CONFIDENCE: [95% ▼] [99%]           │
├─────────────────────────────────────────────────────────────────┤
│ VALUE AT RISK                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ VaR 95% (1D): -₹2.3L  │ VaR 95% (10D): -₹7.2L              │ │
│ │ CVaR 95% (1D): -₹3.1L │ CVaR 95% (10D): -₹9.8L             │ │
│ │ VaR 99% (1D): -₹3.8L  │ VaR 99% (10D): -₹12.1L             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DRAWDOWN ANALYSIS                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Max DD: -12.4%  │ Current DD: -4.2%  │ Recovery: 45 days   │ │
│ │ ┌─────────────────────────────────────────────────────────┐  │ │
│ │ │ Drawdown chart (5Y) with peak/trough markers           │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FACTOR EXPOSURES (Barra-style)                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Market Beta: 0.92  │ Size: -0.15  │ Value: +0.23            │ │
│ │ Momentum: +0.08    │ Quality: +0.31 │ Volatility: -0.12     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STRESS TESTING                                                  │
│ ┌─────────────────────┬────────────┬────────────┬────────────┐ │
│ │ Scenario            │ Portfolio  │ Benchmark  │ Diff       │ │
│ ├─────────────────────┼────────────┼────────────┼────────────┤ │
│ │ 2008 Crisis         │ -38%       │ -52%       │ +14%       │ │
│ │ 2020 COVID          │ -28%       │ -35%       │ +7%        │ │
│ │ Rate Hike +200bps   │ -8%        │ -12%       │ +4%        │ │
│ │ Oil Shock +50%      │ -15%       │ -8%        │ -7%        │ │
│ │ Rupee Depreciation  │ +5%        │ -2%        │ +7%        │ │
│ └─────────────────────┴────────────┴────────────┴────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TAIL RISK                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Skewness: -0.45  │ Kurtosis: 4.2  │ Tail Index: 3.2       │ │
│ │ Expected Shortfall (99%): -₹4.2L                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Engine
- **PortfolioAnalyticsEngine** in `math-engine/src/math_engine/portfolio/analytics.py`
- **API:** `POST /api/math-engine/portfolio` with `metrics: ['risk']`

### 3.2 Calculations
```python
# VaR (Historical Simulation)
def var_historical(returns, confidence=0.95, horizon=1):
    scaled_returns = returns * sqrt(horizon)
    return -np.percentile(scaled_returns, (1-confidence)*100)

# CVaR (Expected Shortfall)
def cvar_historical(returns, confidence=0.95, horizon=1):
    var = var_historical(returns, confidence, horizon)
    tail = returns[returns <= -var]
    return -tail.mean() * sqrt(horizon)

# Monte Carlo VaR
def var_monte_carlo(returns, n_sims=10000, confidence=0.95):
    mu, sigma = returns.mean(), returns.std()
    sims = np.random.normal(mu, sigma, n_sims)
    return -np.percentile(sims, (1-confidence)*100)

# Factor Model (PCA/ICA)
def factor_exposures(returns, factor_returns):
    # OLS regression: r = α + β*f + ε
    beta = np.linalg.lstsq(factor_returns, returns)[0]
    return beta

# Stress Testing
def stress_test(portfolio_returns, scenarios):
    results = {}
    for name, shock in scenarios.items():
        shocked = portfolio_returns * (1 + shock)
        results[name] = shocked.mean() * 252  # Annualized
    return results
```

---

## 4. API Contract

```typescript
interface RiskMetricsRequest {
  portfolioId: string;
  period: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y';
  confidence: 0.95 | 0.99;
  horizon: 1 | 10 | 20;  // days
  method: 'historical' | 'monte_carlo' | 'parametric';
  benchmark: string;
}

interface RiskMetricsResponse {
  var: { '1d': number; '10d': number };
  cvar: { '1d': number; '10d': number };
  drawdown: {
    max: number;
    current: number;
    duration: number;
    recoveryDays: number;
  };
  factorExposures: FactorExposure[];
  stressTest: StressTestResult[];
  tailRisk: {
    skewness: number;
    kurtosis: number;
    tailIndex: number;
    es99: number;
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | VaR/CVaR engine (historical, MC, parametric) | Week 1 |
| 2 | Drawdown engine, factor model (PCA/ICA) | Week 1 |
| 2 | Stress testing framework, tail risk metrics | Week 2 |
| 3 | Risk charts (VaR distribution, DD chart, factor heatmap) | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| VaR 95% 1D | Matches historical simulation |
| CVaR ≥ VaR | Always true |
| Max DD | Correct peak-to-trough |
| Factor betas | Sum to portfolio beta |
| Stress scenarios | Directionally correct |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*