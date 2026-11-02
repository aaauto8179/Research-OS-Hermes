# Portfolio Risk Aggregation Tool Specification

**Tool Name:** Portfolio Risk Aggregation  
**Category:** Portfolio Management → Risk  
**Sheet:** Portfolio management Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Aggregated portfolio risk dashboard: VaR, CVaR, factor exposures, sector/geographic concentration, correlation matrix, tail risk. Aggregates individual holding risks from Company Page Risk tab.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Risk - [Portfolio Name]                               │
├─────────────────────────────────────────────────────────────────┤
│ PORTFOLIO VaR/CVaR                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ VaR 95% (1D): -₹2.3L  │ VaR 95% (10D): -₹7.2L              │ │
│ │ CVaR 95% (1D): -₹3.1L │ CVaR 95% (10D): -₹9.8L             │ │
│ │ VaR 99% (1D): -₹3.8L  │ VaR 99% (10D): -₹12.1L             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FACTOR EXPOSURES                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Market Beta: 0.92  │ Size: -0.15  │ Value: +0.23            │ │
│ │ Momentum: +0.08    │ Quality: +0.31 │ Volatility: -0.12     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SECTOR & GEOGRAPHIC CONCENTRATION                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sector          │ Weight │ Benchmark │ Active │ Risk Budget │ │
│ ├─────────────────┼────────┼───────────┼────────┼────────────┤ │
│ │ Financials      │ 32%    │ 28%       │ +4%    │ 35%         │ │
│ │ IT              │ 22%    │ 18%       │ +4%    │ 25%         │ │
│ │ Energy          │ 12%    │ 10%       │ +2%    │ 15%         │ │
│ │ Consumer        │ 10%    │ 12%       │ -2%    │ 15%         │ │
│ │ Healthcare      │ 8%     │ 8%        │ 0%     │ 10%         │ │
│ └─────────────────┴────────┴───────────┴────────┴────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CORRELATION MATRIX                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │        │ REL  │ TCS  │ HDFC │ INFY │ BAJAJ │ M&M  │         │
│ ├────────┼──────┼──────┼──────┼──────┼───────┼──────┤         │
│ │ REL    │ 1.00 │ 0.45 │ 0.62 │ 0.41 │ 0.55  │ 0.48 │         │
│ │ TCS    │ 0.45 │ 1.00 │ 0.38 │ 0.68 │ 0.32  │ 0.41 │         │
│ │ HDFC   │ 0.62 │ 0.38 │ 1.00 │ 0.35 │ 0.44  │ 0.52 │         │
│ └────────┴──────┴──────┴──────┴──────┴───────┴──────┘         │
├─────────────────────────────────────────────────────────────────┤
│ TAIL RISK & STRESS TESTING                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scenario          │ Portfolio │ Benchmark │ Diff            │ │
│ ├───────────────────┼───────────┼───────────┼─────────────────┤ │
│ │ 2008 Crisis       │ -38%      │ -52%      │ +14%            │ │
│ │ 2020 COVID        │ -28%      │ -35%      │ +7%             │ │
│ │ Rate Hike +200bps │ -8%       │ -12%      │ +4%             │ │
│ │ Oil Shock +50%    │ -15%      │ -8%       │ -7%             │ │
│ │ Rupee Depreciation│ +5%       │ -2%       │ +7%             │ │
│ └───────────────────┴───────────┴───────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 4.1 Aggregation Engine
```python
def aggregate_portfolio_risk(holdings: List[Holding]):
    """Aggregate individual holding risks to portfolio level"""
    # Weighted VaR (assuming normal distribution)
    portfolio_var = sum(w_i * var_i for w_i, var_i in zip(weights, vars))
    
    # Correlation-adjusted VaR
    cov_matrix = get_correlation_matrix(symbols) * np.outer(stdevs, stdevs)
    portfolio_var = np.sqrt(weights.T @ cov_matrix @ weights)
    
    # Factor exposures (weighted average)
    factor_exposures = sum(w_i * exposure_i for w_i, exposure_i in zip(weights, exposures))
    
    # Sector concentration
    sector_weights = defaultdict(float)
    for h in holdings:
        sector_weights[h.sector] += h.weight
    
    return {
        'var_95_1d': portfolio_var_95_1d,
        'var_95_10d': portfolio_var_95_1d * sqrt(10),
        'cvar_95': cvar_95,
        'factor_exposures': factor_exposures,
        'sector_concentration': dict(sector_weights),
        'correlation_matrix': corr_matrix,
        'max_drawdown': max_drawdown,
        'tail_risk': tail_risk
    }
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page Risk Tab:** Individual holding risks
- **Portfolio Analytics:** Portfolio-level VaR
- **Risk Score Engine:** Feeds into risk scoring

---

## 4. API Contract

```typescript
interface PortfolioRiskData {
  portfolioId: string;
  var: { '1d': number; '10d': number; '95': number; '99': number };
  cvar: { '1d': number; '10d': number };
  factorExposures: { market: number; size: number; value: number; momentum: number; quality: number; volatility: number };
  sectorConcentration: { sector: string; weight: number; benchmark: number; active: number }[];
  correlationMatrix: { symbols: string[]; matrix: number[][] };
  stressTests: { scenario: string; portfolio: number; benchmark: number; diff: number }[];
  tailRisk: { skewness: number; kurtosis: number; es99: number };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | VaR/CVaR engine (historical, parametric, MC) | Week 1 |
| 2 | Factor model (PCA/ICA), correlation matrix | Week 1 |
| 2 | Sector concentration, stress testing | Week 2 |
| 3 | Correlation matrix heatmap, tail risk viz | Week 2 |

---

## 6. Testing

| Test | Expected |
|------|----------|
| VaR aggregation | Matches manual calc |
| Factor exposures | Sum to portfolio beta |
| Correlation matrix | Symmetric, diagonal=1 |
| Stress tests | Directionally correct |
| Sector weights | Sum to 100% |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*