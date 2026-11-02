# Reverse DCF Tool Specification

**Tool Name:** Reverse DCF  
**Category:** Decision Framework  
**Sheet:** Weigh decisions  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Reverse engineers the market-implied growth rate from current stock price. Given current price, solves for the growth rate that justifies it. Outputs implied growth vs consensus, margin of safety, and price targets at different growth scenarios.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Reverse DCF - [SYMBOL: RELIANCE]                                │
├─────────────────────────────────────────────────────────────────┤
│ CURRENT MARKET DATA                                             │
│ ┌─────────────────┬─────────────────┬─────────────────┐         │
│ │ Current Price   │ Market Cap      │ Implied EV      │         │
│ │ ₹2,950          │ ₹20.1L Cr       │ ₹22.3L Cr       │         │
│ ├─────────────────┼─────────────────┼─────────────────┤         │
│ │ EBITDA (TTM)    │ Net Debt        │ Shares Outstanding│       │
│ │ ₹1.8L Cr        │ ₹2.1L Cr        │ 676 Cr          │         │
│ └─────────────────┴─────────────────┴─────────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│ REVERSE DCF OUTPUT                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IMPLIED GROWTH RATE: 14.2% (5Y)                            │ │
│ │ Consensus Growth: 12.5%  │ Spread: +1.7%                   │ │
│ │ Margin of Safety: 12% (at consensus growth)                │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ PRICE TARGETS AT DIFFERENT GROWTH                          │ │
│ │ ┌──────────┬────────┬────────┬────────┬────────────────┐   │ │
│ │ │ Growth   │ DCF Val │ vs CMP │ Upside │ Implied EV/EBITDA│  │ │
│ │ ├──────────┼────────┼────────┼────────┼────────────────┤   │ │
│ │ │ 10% (Bear)│ ₹2,450 │ -17%   │ -17%   │ 11.2x           │   │ │
│ │ │ 12.5% (Cons)│ ₹2,950│ 0%     │ 0%     │ 13.8x           │   │ │
│ │ │ 14.2% (Impl)│ ₹3,300│ +12%   │ +12%   │ 15.5x           │   │ │
│ │ │ 16% (Bull) │ ₹3,850│ +31%   │ +31%   │ 17.8x           │   │ │
│ │ └──────────┴────────┴────────┴────────┴────────────────┘   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ASSUMPTIONS                                                │ │
│ │ WACC: 11.5%  │ Terminal Growth: 5%  │ Tax: 25%            │ │
│ │ Capex/Sales: 8%  │ WC/Sales: 12%  │ High Growth: 10Y      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SENSITIVITY TABLE                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ WACC \ Growth │ 10%    │ 12.5%  │ 14.2%  │ 16%             │ │
│ ├───────────────┼────────┼────────┼────────┼────────┤         │ │
│ │ 10.5%         │ ₹2,850 │ ₹3,450 │ ₹3,850 │ ₹4,400           │ │
│ │ 11.0%         │ ₹2,650 │ ₹3,200 │ ₹3,550 │ ₹4,050           │ │
│ │ 11.5%         │ ₹2,450 │ ₹2,950 │ ₹3,300 │ ₹3,850           │ │
│ │ 12.0%         │ ₹2,300 │ ₹2,750 │ ₹3,050 │ ₹3,550           │ │
│ │ 12.5%         │ ₹2,150 │ ₹2,550 │ ₹2,850 │ ₹3,300           │ │
│ └───────────────┴────────┴────────┴────────┴────────┘         │ │
│ [Recalculate] [Link to DCF Valuation] [Export]                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Reverse DCF Engine
```python
def reverse_dcf(current_price, ebitda, net_debt, shares, wacc, terminal_growth, 
                high_growth_years=10, tax_rate=0.25, capex_sales=0.08, wc_sales=0.12):
    """Solve for growth rate g that makes DCF value = current_price"""
    
    target_ev = current_price * shares + net_debt
    
    def dcf_value(g):
        # High growth phase
        fcff = ebitda * (1 - tax_rate) * (1 - capex_sales - wc_sales * g)
        pv_fcff = sum(fcff * (1+g)**t / (1+wacc)**t for t in range(1, high_growth_years+1))
        
        # Terminal value
        terminal_fcff = fcff * (1+g)**high_growth_years * (1 + terminal_growth)
        terminal_value = terminal_fcff / (wacc - terminal_growth)
        pv_terminal = terminal_value / (1+wacc)**high_growth_years
        
        return pv_fcff + pv_terminal
    
    # Binary search for growth rate
    low, high = 0, 0.5
    for _ in range(50):
        mid = (low + high) / 2
        if dcf_value(mid) > target_ev:
            high = mid
        else:
            low = mid
    return (low + high) / 2
```

---

## 4. Engine Integration

### 4.1 Links
- **DCF Valuation Engine:** Shares assumptions, forward/reverse consistency
- **Valuation Suite:** Implied growth feeds valuation philosophy
- **Screening Engine:** Reverse DCF as screening factor
- **Company Page Valuation Tab:** Reverse DCF widget

---

## 4. API Contract

```typescript
interface ReverseDCFRequest {
  symbol: string;
  currentPrice: number;
  ebitda: number;
  netDebt: number;
  shares: number;
  wacc: number;
  terminalGrowth: number;
  highGrowthYears?: number;
  taxRate?: number;
  capexSales?: number;
  wcSales?: number;
}

interface ReverseDCFResponse {
  impliedGrowth: number;
  consensusGrowth: number;
  spread: number;
  marginOfSafety: number;
  priceTargets: {
    growth: number;
    dcfValue: number;
    vsCMP: number;
    upside: number;
    impliedEVEbitda: number;
  }[];
  assumptions: {
    wacc: number;
    terminalGrowth: number;
    taxRate: number;
    capexSales: number;
    wcSales: number;
    highGrowthYears: number;
  };
  sensitivity: { wacc: number; growth: number; value: number }[][];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Reverse DCF solver (binary search), price targets | Week 1 |
| 2 | Sensitivity table, assumptions panel | Week 1 |
| 2 | Consensus growth integration, margin of safety | Week 2 |
| 3 | DCF Valuation integration, Company Page widget | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Reverse DCF solver | Converges in <50 iterations |
| Forward/Reverse consistency | Reverse(Forward(g)) ≈ g |
| Sensitivity table | All cells calculated |
| Margin of safety | (DCF_consensus - CMP) / CMP |
| Price targets | Monotonic in growth |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*