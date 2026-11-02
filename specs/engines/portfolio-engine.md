# Portfolio Analytics Engine Specification

**Tool Name:** Portfolio Analytics Engine  
**Category:** Portfolio Engines  
**Sheet:** Portfolio management Page  
**Spec Version:** 1.0.0  
**Status:** ✅ Complete  
**Owner:** Quant Team  
**Last Updated:** 2025-10-31

---

## 3. Calculations & Logic

### 3.1 Performance Metrics
```python
# TWR (Time-Weighted Return)
twr = Π(1 + r_i) - 1  # r_i = sub-period returns between cash flows

# XIRR (Money-Weighted)
# Σ CF_t / (1+r)^((d_t-d_0)/365) = 0  → solve for r via Newton

# Sharpe Ratio
sharpe = (μ - r_f) / σ × √252

# Sortino Ratio
sortino = (μ - r_f) / σ_downside × √252  # MAR = 0

# Max Drawdown
max_dd = max((peak - trough) / peak)

# VaR 95%
var_95 = percentile(returns, 5)  # 5th percentile

# Beta
beta = Cov(portfolio, benchmark) / Var(benchmark)
```

### 3.2 Attribution (Brinson)
```python
allocation_effect = Σ(w_p - w_b) × (r_b - r_total_benchmark)
selection_effect = Σ(w_b) × (r_p - r_b)
interaction_effect = Σ(w_p - w_b) × (r_p - r_b)
```

### 3.3 Output
```json
{
  "performance": {
    "twr": 0.182, "xirr": 0.214, "sharpe": 1.42,
    "sortino": 1.89, "max_dd": -0.124, "beta": 0.92
  },
  "attribution": {
    "allocation": 0.012, "selection": 0.008, "interaction": 0.003
  },
  "risk": { "var_95": -0.032, "cvar_95": -0.048, "max_dd": -0.124 }
}
```

---

## 4. Golden Vector Tests (4 vectors)

| Test Case | Metric | Expected | Tolerance |
|-----------|--------|----------|-----------|
| Simple Portfolio | XIRR | 0.214 | 1e-6 |
| Multi-cashflow | TWR | 0.182 | 1e-6 |
| Benchmark Attribution | Allocation Effect | 0.012 | 1e-6 |
| Risk Metrics | VaR 95% | -0.032 | 1e-6 |

---

## 6. Implementation Status

- **Backend:** ✅ `math-engine/src/math_engine/portfolio/analytics.py`
- **API:** ✅ `POST /portfolio`
- **Tests:** ✅ 4 golden vectors
- **Frontend:** ⏳ `src/components/portfolio/PortfolioPerformance.tsx`

---

*Spec Version: 1.0.0 | Implementation: ✅ Backend Complete*