# Conviction Sizing Tool Specification

**Tool Name:** Conviction Sizing  
**Category:** Decision Framework  
**Sheet:** Weigh decisions  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Position sizing based on conviction level, risk-adjusted return, and portfolio constraints. Implements Kelly Criterion, Risk Parity, and Conviction-based sizing. Outputs recommended position size with confidence intervals.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Conviction Sizing - [SYMBOL: RELIANCE]                          │
├─────────────────────────────────────────────────────────────────┤
│ INPUTS                                                          │
│ ┌─────────────────┬─────────────────┬─────────────────┐         │
│ │ Conviction      │ Expected Return │ Risk (σ)        │         │
│ │ High (0.8)      │ +25% (1Y)       │ 22%             │         │
│ ├─────────────────┼─────────────────┼─────────────────┤         │
│ │ Portfolio σ     │ Correlation     │ Max Position    │         │
│ │ 15%             │ 0.65            │ 10%             │         │
│ └─────────────────┴─────────────────┴─────────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│ SIZING MODELS                                                   │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Model           │ Size   │ Kelly% │ Risk Adj│ Details        │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ Kelly Criterion │ 11.4%  │ 100%   │ 11.4%  │ f = (bp-q)/b   │ │
│ │ Half-Kelly      │ 5.7%   │ 50%    │ 5.7%   │ Conservative   │ │
│ │ Risk Parity     │ 4.2%   │ N/A    │ 4.2%   │ Equal risk     │ │
│ │ Conviction-Based│ 8.0%   │ N/A    │ 8.0%   │ High=10%, Med=6%│ │
│ │ Max Constraint  │ 10.0%  │ N/A    │ 10.0%  │ Hard limit     │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RECOMMENDED: 6.5% (Half-Kelly with Conviction overlay)          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Confidence Interval: 4.5% - 8.5%                            │ │
│ │ Kelly Fraction: 0.5 (Half-Kelly)                            │ │
│ │ Conviction Multiplier: 0.8 (High)                           │ │
│ │ Portfolio Impact: σ 15% → 15.3%, MaxDD -12.4% → -12.8%     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Apply to Portfolio] [Save Model] [Export] [Link to Fit Check] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Sizing Models
```python
def kelly_criterion(win_prob, win_loss_ratio):
    """f* = (bp - q) / b"""
    return (win_prob * win_loss_ratio - (1 - win_prob)) / win_loss_ratio

def conviction_sizing(conviction, base_size=0.10):
    """High=1.0x, Medium=0.6x, Low=0.3x"""
    multipliers = {'high': 1.0, 'medium': 0.6, 'low': 0.3}
    return base_size * multipliers.get(conviction, 0.6)

def risk_parity_size(asset_vol, portfolio_vol, target_risk_contrib):
    """Size = target_risk / (asset_vol * correlation)"""
    return target_risk_contrib / (asset_vol * correlation)

def recommended_size(models, constraints):
    """Weighted combination with constraints"""
    weights = {'kelly': 0.3, 'half_kelly': 0.3, 'risk_parity': 0.2, 'conviction': 0.2}
    raw = sum(models[m] * weights[m] for m in weights)
    return min(raw, constraints.max_position, constraints.sector_limit)
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Fit Check:** Uses fit score as input
- **Risk Engine:** Portfolio σ, correlation, VaR
- **Valuation Suite:** Expected return from DCF/Relative
- **Screening Engine:** Win probability from backtest

---

## 4. API Contract

```typescript
interface ConvictionSizingRequest {
  symbol: string;
  conviction: 'high' | 'medium' | 'low';
  expectedReturn: number;  // annualized %
  volatility: number;      // annualized %
  portfolioVol: number;
  correlation: number;
  maxPosition: number;     // %
  sectorLimit: number;     // %
}

interface ConvictionSizingResponse {
  models: {
    kelly: number;
    halfKelly: number;
    riskParity: number;
    convictionBased: number;
    maxConstraint: number;
  };
  recommended: number;
  confidenceInterval: [number, number];
  portfolioImpact: {
    newVol: number;
    newMaxDD: number;
    newSectorWeight: number;
  };
  kellyFraction: number;
  convictionMultiplier: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Sizing models (Kelly, Risk Parity, Conviction) | Week 1 |
| 2 | Combined recommendation engine, confidence intervals | Week 1 |
| 2 | Portfolio impact simulation, UI with sliders | Week 2 |
| 3 | Integration with Fit Check, save/apply to portfolio | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Kelly formula | Matches standard formula |
| Half-Kelly | = Kelly * 0.5 |
| Conviction multipliers | High=1.0, Med=0.6, Low=0.3 |
| Constraints respected | Size ≤ max, sector ≤ limit |
| Portfolio impact | Correct volatility calc |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*