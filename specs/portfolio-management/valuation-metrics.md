# Valuation Metrics Tool Specification

**Tool Name:** Valuation Metrics  
**Category:** Portfolio Management → Portfolio Metrics  
**Sheet:** Portfolio management Page → 3) Portfolio Metrics → 4. Valuation Metrics  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Portfolio-level valuation analytics: weighted average P/E, P/B, EV/EBITDA, earnings yield, PEG, EV/Sales. Compares portfolio valuation vs benchmark and historical percentiles.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Valuation Metrics - [Portfolio Name]                            │
├─────────────────────────────────────────────────────────────────┤
│ PORTFOLIO VALUATION vs BENCHMARK                                │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Metric          │ Port.  │ Bench. │ Pctl   │ Status         │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ Weighted P/E    │ 24.5   │ 22.1   │ 68th   │ ⚠️ Premium     │ │
│ │ Weighted P/B    │ 3.8    │ 3.1    │ 72nd   │ ⚠️ Premium     │ │
│ │ EV/EBITDA       │ 16.2   │ 14.8   │ 65th   │ ⚠️ Premium     │ │
│ │ EV/Sales        │ 3.2    │ 2.8    │ 60th   │ ⚠️ Premium     │ │
│ │ Earnings Yield  │ 4.1%   │ 4.5%   │ 45th   │ ✅ Fair        │ │
│ │ Dividend Yield  │ 1.2%   │ 1.4%   │ 35th   │ ⚠️ Low         │ │
│ │ PEG Ratio       │ 1.8    │ 1.5    │ 70th   │ ⚠️ Premium     │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HISTORICAL PERCENTILES (5Y)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ P/E:  [████████░░░░░░░░░░░░] 68th percentile                 │ │
│ │ P/B:  [████████████░░░░░░░░░░] 72nd percentile                 │ │
│ │ EV/EBITDA: [████████░░░░░░░░░░] 65th percentile              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS VALUATION BREAKDOWN                                    │
│ ┌────┬────────┬──────┬──────┬──────┬──────┬──────┬──────┐     │
│ │ #  │ Symbol │ Wt%  │ P/E  │ P/B  │ EV/EB│ EV/S │ Div% │     │
│ ├────┼────────┼──────┼──────┼──────┼──────┼──────┼──────┤     │
│ │ 1  │ RELIANCE│ 15%  │ 28.5 │ 2.1  │ 18.2 │ 3.2  │ 0.5% │     │
│ │ 2  │ TCS     │ 12%  │ 26.8 │ 12.5 │ 19.8 │ 5.1  │ 1.2% │     │
│ │ 3  │ HDFC    │ 10%  │ 18.5 │ 2.8  │ N/A  │ 4.2  │ 1.0% │     │
│ └────┴────────┴──────┴──────┴──────┴──────┴──────┴──────┘     │
├─────────────────────────────────────────────────────────────────┤
│ [Export CSV] [Refresh Valuations] [Link to Valuation Suite]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Calculations
```python
# Weighted Average (by market value)
weighted_pe = sum(w_i * pe_i for w_i, pe_i in zip(weights, pes))

# Portfolio EV/EBITDA
portfolio_ev = sum(w_i * (mcap_i + net_debt_i) for w_i, mcap_i, net_debt_i)
portfolio_ebitda = sum(w_i * ebitda_i for w_i, ebitda_i)
portfolio_ev_ebitda = portfolio_ev / portfolio_ebitda

# Weighted P/B
weighted_pb = sum(w_i * pb_i for w_i, pb_i in zip(weights, pbs))

# Earnings Yield
earnings_yield = 1 / weighted_pe

# Dividend Yield
div_yield = sum(w_i * div_yield_i for w_i, div_yield_i in zip(weights, div_yields))

# PEG Ratio
peg = weighted_pe / (weighted_earnings_growth * 100)
```

### 3.2 Percentile Calculation
```python
# Rolling 5Y percentile
def percentile_rank(current, history):
    return (sum(1 for h in history if h <= current) / len(history)) * 100
```

---

## 4. Engine Integration

### 4.1 Links
- **Valuation Suite:** Consumes DCF, Relative, SOTP outputs
- **Screening Engine:** Peer valuation data
- **Holdings:** Real-time prices for market cap

### 3.2 API Contract
```typescript
interface ValuationMetricsData {
  portfolioId: string;
  metrics: {
    weightedPE: number;
    weightedPB: number;
    evEbitda: number;
    evSales: number;
    earningsYield: number;
    dividendYield: number;
    pegRatio: number;
  };
  vsBenchmark: {
    metric: string;
    portfolio: number;
    benchmark: number;
    percentile: number;
    status: 'Premium' | 'Fair' | 'Discount';
  }[];
  history: { date: string; pe: number; pb: number; evEbitda: number }[];
  holdings: HoldingValuation[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Valuation metrics calculation, benchmark comparison | Week 1 |
| 2 | Historical percentile charts, holdings breakdown | Week 1 |
| 2 | Valuation Suite link, export CSV | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Weighted P/E | Sum(w_i * pe_i) |
| Portfolio EV/EBITDA | Σw(mcap+debt)/Σw(ebitda) |
| Percentile rank | Correct vs 5Y history |
| Holdings breakdown | Sum of weights = 100% |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*