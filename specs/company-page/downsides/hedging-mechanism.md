# Hedging Mechanism Tool Specification (Company Page UI)

**Tool Name:** Hedging Mechanism (UI)  
**Category:** Downsides  
**Sheet:** Company Page → Downsides  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Hedging Mechanism - [SYMBOL / PORTFOLIO]                        │
├─────────────────────────────────────────────────────────────────┤
│ HEDGE TYPE: [Protective Put ▼]  PORTFOLIO BETA: 1.15           │
├─────────────────────────────────────────────────────────────────┤
│ SINGLE STOCK HEDGE              │ PORTFOLIO HEDGE              │
│ ┌─────────────────────────────┐ │ ┌─────────────────────┐      │
│ │ Current Price: ₹2,950       │ │ Portfolio Value: ₹2.4Cr│      │
│ │ Put Strike: ₹2,800 (95%)   │ │ Nifty Hedge Ratio: 1.15 │      │
│ │ Premium: ₹45 (1.5%)        │ │ Contracts: 12 lots      │      │
│ │ Cost: ₹6,750                │ │ Cost: ₹18,000         │      │
│ │ Max Loss: ₹150 (5.1%)      │ │ Max Portfolio DD: -8%  │      │
│ │ Breakeven: ₹2,845          │ │ Hedge Effectiveness: 85%│      │
│ └─────────────────────────────┘ │ ┌─────────────────────┐      │
│ PAYOFF CHART                    │ │ SCENARIO ANALYSIS   │      │
│ ┌─────────────────────────────┐ │ │ Nifty -10%: +₹2.1L  │      │
│ │ P&L                         │ │ │ Nifty -5%:  +₹0.9L  │      │
│ │     ▲                       │ │ │ Flat:     -₹0.2L   │      │
│ │    / \                      │ │ │ Nifty +5%: -₹1.1L  │      │
│ │   /   \                     │ │ │ Nifty +10%: -₹2.3L │      │
│ │  /     \_______             │ │ └─────────────────────┘      │
│ └─────────────────────────────┘ └──────────────────────────────┘ │
│ [Execute Hedge] [Monitor] [Adjust Strikes]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration
- **Backend:** `HedgingEngine` in `math-engine/src/math_engine/risk/hedging.py`
- **API:** Embedded in risk endpoint
- **Inputs:** Hedge type, strikes, portfolio positions
- **Output:** Max loss/gain, breakeven, payoff chart data, scenario analysis

---

## 6. Implementation Plan
- **Component:** `HedgingMechanism.tsx` in `src/components/company/downsides/`
- **WidgetRegistry:** `"hedging-mechanism"`
- **Features:** Strategy selector, strike adjuster, payoff chart (Recharts), scenario table

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*