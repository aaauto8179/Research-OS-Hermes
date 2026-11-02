# Portfolio Performance Metrics Tool Specification

**Tool Name:** Performance Metrics  
**Category:** Portfolio Management → Portfolio Metrics  
**Sheet:** Portfolio management Page → 3) Portfolio Metrics → 1. Performance Metrics  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Comprehensive portfolio performance analytics: TWR, XIRR, Sharpe, Sortino, Max Drawdown, Beta, attribution analysis (Brinson), benchmark comparison. Real-time calculation from transactions and holdings.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Performance - [Portfolio Name]                        │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [1M ▼] [3M] [6M] [1Y] [3Y] [5Y] [Since Inception]      │
├─────────────────────────────────────────────────────────────────┤
│ KEY METRICS                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ TWR         │ │ XIRR        │ │ Sharpe      │ │ Sortino     │ │
│ │ 18.2%       │ │ 21.4%       │ │ 1.42        │ │ 1.89        │ │
│ │ vs Bench: +2.1%│ │ vs Bench: +3.2%│ │ vs Bench: +0.3│ │ vs Bench: +0.4│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Max DD      │ │ Beta        │ │ Alpha       │ │ Info Ratio  │ │
│ │ -8.2%       │ │ 0.92        │ │ +2.1%       │ │ 0.85        │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ATTRIBUTION (Brinson)                                           │
│ ┌────────────┬────────────┬────────────┬──────────────────┐    │
│ │ Effect     │ Allocation │ Selection │ Interaction       │    │
│ ├────────────┼────────────┼──────────┼──────────────────┤    │
│ │ Value      │ +1.2%      │ +0.8%     │ +0.3%             │    │
│ └────────────┴────────────┴──────────┴──────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│ EQUITY CURVE (vs Benchmark)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 35% ┤     ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲ │ │
│ │ 30% ┤    ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲ │ │
│ │ 25% ┤   ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲ │ │
│ │ 20% ┤  ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱ │ │
│ │ 15% ┤ ╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲ │ │
│ │ 10% ┤╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲╱╲ │ │
│ │  5% ┤─────────────────────────────────────────────────────  │ │
│ │  0% ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼──  │ │
│ │ -5% │    Portfolio (Blue) vs NIFTY 50 (Gray)                │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS CONTRIBUTION                                           │
│ ┌────┬────────┬──────┬──────┬──────┬──────┬──────┬──────┐      │
│ │ #  │ Symbol │ Wt%  │ Ret% │ Ctrb%│ Bmk% │ Excess│      │
│ ├────┼────────┼──────┼──────┼──────┼──────┼──────┼──────┤      │
│ │ 1  │ RELIANCE│ 15.2%│ +22% │ +3.4%│ +18% │ +4%   │      │
│ │ 2  │ TCS     │ 12.5%│ +15% │ +1.9%│ +12% │ +3%   │      │
│ │ 3  │ HDFC    │ 10.1%│ +8%  │ +0.8%│ +10% │ -2%   │      │
│ └────┴────────┴──────┴──────┴──────┴──────┴──────┴──────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Engine
- **PortfolioAnalyticsEngine** in `math-engine/src/math_engine/portfolio/analytics.py`
- **API:** `POST /api/math-engine/portfolio`

### 3.2 Metrics Calculations
```python
# TWR (Time-Weighted Return)
twr = np.prod([1 + r_i for r_i in subperiod_returns]) - 1

# XIRR (Money-Weighted Return)
# Solve: Σ CF_t / (1+r)^((d_t-d_0)/365) = 0 for r via Newton

# Sharpe Ratio
sharpe = (portfolio_return - risk_free) / portfolio_std * sqrt(252)

# Sortino Ratio
sortino = (portfolio_return - risk_free) / downside_deviation * sqrt(252)

# Max Drawdown
max_dd = max((peak - trough) / peak)

# Brinson Attribution
allocation_effect = sum((w_p - w_b) * (r_b - r_total_b))
selection_effect = sum(w_b * (r_p - r_b))
interaction_effect = sum((w_p - w_b) * (r_p - r_b))
```

---

## 4. API Contract

```typescript
interface PortfolioPerformanceRequest {
  portfolioId: string;
  period: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ITD';
  benchmark: string;  // e.g., 'NIFTY50'
  riskFreeRate: number;  // annualized
}

interface PortfolioPerformanceResponse {
  performance: {
    twr: number;
    xirr: number;
    sharpe: number;
    sortino: number;
    maxDrawdown: number;
    beta: number;
    alpha: number;
    informationRatio: number;
    calmarRatio: number;
  };
  attribution: {
    allocation: number;
    selection: number;
    interaction: number;
    total: number;
  };
  equityCurve: { date: string; portfolio: number; benchmark: number }[];
  holdingsContribution: HoldingContribution[];
  riskMetrics: {
    var95: number;
    cvar95: number;
    volatility: number;
    skewness: number;
    kurtosis: number;
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | TWR/XIRR calculation, equity curve | Week 1 |
| 2 | Risk metrics (Sharpe, Sortino, MaxDD, Beta) | Week 1 |
| 2 | Brinson attribution, holdings contribution | Week 2 |
| 3 | Equity curve chart (Recharts), benchmark overlay | Week 2 |
| 3 | Period selector, benchmark selector, export | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| TWR vs known values | Golden vector test |
| XIRR convergence | Newton method converges in <50 iterations |
| Sharpe/Sortino | Matches golden vectors |
| MaxDD | Correct peak-to-trough |
| Attribution sum | Allocation + Selection + Interaction = Total Excess |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*