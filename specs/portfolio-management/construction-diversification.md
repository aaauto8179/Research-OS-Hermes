# Construction & Diversification Tool Specification

**Tool Name:** Portfolio Construction & Diversification  
**Category:** Portfolio Management → Portfolio Metrics  
**Sheet:** Portfolio management Page → 3) Portfolio Metrics → 3. Portfolio Construction & Diversification  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Portfolio construction analytics: number of holdings, top 5/10 concentration, sector exposure, market cap exposure, cash allocation. Herfindahl-Hirschman Index (HHI), effective number of holdings, diversification ratio.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Construction & Diversification - [Portfolio Name]     │
├─────────────────────────────────────────────────────────────────┤
│ CONCENTRATION METRICS                                           │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│ │ Holdings Count  │ │ Top 5 Conc.     │ │ Top 10 Conc.    │     │
│ │ 25              │ │ 65%             │ │ 82%             │     │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│ │ HHI             │ │ Effective N     │ │ Diversification │     │
│ │ 0.12            │ │ 8.3             │ │ Ratio: 0.68     │     │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│ SECTOR EXPOSURE                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sector          │ Weight │ Benchmark │ Active │ Limit │     │
│ ├─────────────────┼────────┼───────────┼────────┼───────┤     │
│ │ Financials      │ 32%    │ 28%       │ +4%    │ 35%   │     │
│ │ IT              │ 22%    │ 18%       │ +4%    │ 25%   │     │
│ │ Consumer        │ 15%    │ 12%       │ +3%    │ 20%   │     │
│ │ Energy          │ 12%    │ 10%       │ +2%    │ 15%   │     │
│ │ Healthcare      │ 8%     │ 8%        │ 0%     │ 10%   │     │
│ │ Others          │ 11%    │ 16%       │ -5%    │ -     │     │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MARKET CAP EXPOSURE                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐     │
│ │ Large Cap       │ │ Mid Cap         │ │ Small Cap       │     │
│ │ 68%             │ │ 22%             │ │ 10%             │     │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│ CASH & LIQUIDITY                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Cash: 3.2%  │ Liquid Funds: 1.8%  │ Total Liquid: 5.0%     │ │
│ │ T+1 Liquidity: 95%  │ T+2 Liquidity: 99%                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS TABLE                                                  │
│ ┌────┬────────┬──────┬──────┬──────┬──────┬──────┬──────┬────┐ │
│ │ #  │ Symbol │ Wt%  │ Sector│ MCap  │ Ret% │ Ctrb%│ Act │    │
│ ├────┼────────┼──────┼───────┼───────┼──────┼──────┼──────┤    │
│ │ 1  │ RELIANCE│ 15.2%│ Energy│ Large │ +22% │ +3.4%│ 🟢  │    │
│ │ 2  │ TCS     │ 12.5%│ IT    │ Large │ +15% │ +1.9%│ 🟢  │    │
│ │ 3  │ HDFC    │ 10.1%│ Fin   │ Large │ +8%  │ +0.8%│ 🟢  │    │
│ └────┴────────┴──────┴───────┴───────┴──────┴──────┴──────┘     │
│ [Export CSV] [Rebalance Suggestions] [Export to Excel]          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Calculations
```python
# Herfindahl-Hirschman Index
hhi = sum(w_i**2 for w_i in weights)

# Effective Number of Holdings
effective_n = 1 / hhi

# Diversification Ratio
div_ratio = sum(w_i * sigma_i) / portfolio_sigma

# Concentration Ratios
top_5 = sum(sorted(weights, reverse=True)[:5])
top_10 = sum(sorted(weights, reverse=True)[:10])

# Sector Active Weight
active_weight = portfolio_weight - benchmark_weight

# Market Cap Exposure
large_cap = sum(w for w in weights if mcap > 20000)
mid_cap = sum(w for w in weights if 5000 < mcap <= 20000)
small_cap = sum(w for w in weights if mcap <= 5000)
```

---

## 4. API Contract

```typescript
interface ConstructionDiversificationData {
  portfolioId: string;
  concentration: {
    holdingsCount: number;
    top5: number;
    top10: number;
    hhi: number;
    effectiveN: number;
    diversificationRatio: number;
  };
  sectorExposure: SectorExposure[];
  marketCapExposure: {
    largeCap: number;
    midCap: number;
    smallCap: number;
  };
  cashLiquidity: {
    cash: number;
    liquidFunds: number;
    totalLiquid: number;
    t1Liquidity: number;
    t2Liquidity: number;
  };
  holdings: HoldingDetail[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Concentration metrics, HHI, effective N | Week 1 |
| 2 | Sector/Market cap exposure tables | Week 1 |
| 2 | Cash/liquidity analysis | Week 1 |
| 3 | Holdings table with contribution, rebalance suggestions | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| HHI calculation | Sum of squared weights |
| Effective N | 1/HHI |
| Sector weights sum | = 100% |
| Market cap exposure | Sum = 100% |
| Cash + liquid = total liquid | Sum matches |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*