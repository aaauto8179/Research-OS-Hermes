# Liquidity Risk Tool Specification

**Tool Name:** Liquidity Risk  
**Category:** Portfolio Management → Risk  
**Sheet:** Portfolio management Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Portfolio liquidity risk assessment: T+1/T+2 liquidity, cash reserves, redemption capacity, market impact costs, funding liquidity. Stress testing for redemption scenarios.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Liquidity Risk - [Portfolio Name]                               │
├─────────────────────────────────────────────────────────────────┤
│ LIQUIDITY OVERVIEW                                              │
│ ┌─────────────────────┐ ┌─────────────────┐ ┌────────────────┐ │
│ │ Cash & Equivalents  │ │ T+1 Liquidity   │ │ T+2 Liquidity  │ │
│ │ 5.2% (₹6.5L)        │ │ 95% (₹1.19Cr)  │ │ 99% (₹1.24Cr) │ │
│ └─────────────────────┘ └─────────────────┘ └────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ REDEMPTION CAPACITY                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scenario          │ 1 Day  │ 3 Days │ 5 Days │ 10 Days     │ │
│ ├───────────────────┼────────┼────────┼────────┼─────────────┤ │
│ │ Normal Market     │ 95%    │ 99%    │ 100%   │ 100%        │ │
│ │ Stressed (-20%)   │ 85%    │ 92%    │ 98%    │ 100%        │ │
│ │ Crisis (-40%)     │ 65%    │ 80%    │ 88%    │ 95%         │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MARKET IMPACT COSTS                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Holding          │ Qty    │ ADV %   │ Impact Cost │ Cost ₹ │ │
│ ├───────────────────┼────────┼─────────┼─────────────┼────────┤ │
│ │ RELIANCE          │ 100    │ 0.02%   │ 0.15%       | ₹44K  │ │
│ │ SMALLCAP STOCK    │ 5000   │ 15%     │ 3.5%        | ₹1.2L │ │
│ │ MIDCAP STOCK      │ 2000   │ 3%      │ 1.2%        | ₹85K  │ │
│ └───────────────────┴────────┴─────────┴─────────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FUNDING LIQUIDITY                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Cash Reserves: ₹6.5L (5.2%)                                 │ │
│ │ Credit Lines: ₹50L (unused)                                 │ │
│ │ Margin Available: ₹15L                                      │ │
│ │ Loan Against Shares: ₹25L (available)                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ STRESS SCENARIOS                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scenario           │ Liquidity | Redemption | Cash Needed │ │
│ ├────────────────────┼───────────┼────────────┼──────────────┤ │
│ │ Normal             │ 95%       │ 5%         │ ₹0            │ │
│ │ 10% Redemption     │ 88%       │ 10%        │ ₹1.2L        │ │
│ │ 25% Redemption     │ 72%       │ 25%        │ ₹3.1L        │ │ |
│ │ 50% Redemption     │ 45%       │ 50%        │ ₹6.2L        │ │ |
│ └────────────────────┴───────────┴────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Calculations
```python
# Redemption Capacity
def redemption_capacity(holdings, scenario_pct):
    liquid_value = sum(h.value * h.liquidity_score for h in holdings)
    redeemable = liquid_value * (1 - scenario_pct)
    return redeemable

# Market Impact Cost (Almgren-Chriss)
def market_impact(qty, adv, volatility, sigma=0.5):
    # Almgren-Chriss model
    permanent_impact = sigma * volatility * sqrt(qty / adv)
    temporary_impact = eta * (qty / adv)
    return permanent_impact + temporary_impact

# Stress Testing
def stress_test_liquidity(holdings, scenarios):
    results = {}
    for name, shock in scenarios.items():
        # Apply shock to prices
        # Recalculate liquidity
        # Check if redemption needs met
        results[name] = calculate_liquidity(holdings, shock)
    return results
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Risk:** Feeds into portfolio VaR
- **Holdings:** Real-time prices for ADV calc
- **Corporate Actions:** Affects liquidity (lock-ins)

---

## 4. API Contract

```typescript
interface LiquidityRiskData {
  portfolioId: string;
  overview: {
    cashEquivalents: number;
    t1Liquidity: number;
    t2Liquidity: number;
    cashPct: number;
  };
  redemptionCapacity: {
    normal: number;
    stressed: number;
    crisis: number;
  };
  marketImpact: MarketImpact[];
  fundingLiquidity: {
    cashReserves: number;
    creditLines: number;
    marginAvailable: number;
    loanAgainstShares: number;
  };
  stressScenarios: StressScenario[];
}

interface MarketImpact {
  symbol: string;
  quantity: number;
  advPct: number;
  impactCost: number;
  costINR: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Liquidity metrics, redemption capacity calc | Week 1 |
| 2 | Market impact model (Almgren-Chriss) | Week 1 |
| 2 | Stress scenarios, funding liquidity | Week 2 |
| 3 | Charts (redemption waterfall, impact heatmap) | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| T+1/T+2 liquidity | Matches manual calc |
| Market impact | Almgren-Chriss formula correct |
| Stress scenarios | Directionally correct |
| Redemption waterfall | Sums to portfolio value |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*