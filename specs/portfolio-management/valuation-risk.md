# Valuation Risk Tool Specification

**Tool Name:** Valuation Risk  
**Category:** Portfolio Management → Risk  
**Sheet:** Portfolio management Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Portfolio-level valuation risk: weighted average P/E vs history, P/B vs peers, EV/EBITDA vs sector, price vs DCF fair value, margin of safety, downside scenarios. Aggregates individual holding valuations from Company Page Valuation tab.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Valuation Risk - [Portfolio Name]                               │
├─────────────────────────────────────────────────────────────────┤
│ PORTFOLIO VALUATION vs HISTORY                                  │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Metric          │ Current│ 5Y Avg │ 5Y Min │ Status         │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ Weighted P/E    │ 24.5   │ 22.1   │ 18.5   │ ⚠️ Above Avg   │ │
│ │ Weighted P/B    │ 3.8    │ 3.2    │ 2.7    │ ⚠️ Above Avg   │ │
│ │ Weighted EV/EBITDA│ 16.2 │ 14.8   │ 12.1   │ ⚠️ Above Avg   │ │
│ │ Weighted EV/Sales │ 3.2  │ 2.7    │ 2.3    │ ⚠️ Above Avg   │ │
│ │ Dividend Yield  │ 1.2%   │ 1.5%   │ 1.1%   │ ✅ Below Avg   │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ PEER COMPARISON                                                 │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Metric          │ Port.  │ Peer Avg│ Sector │ Status         │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ P/E             │ 24.5   │ 22.8   │ 21.5   │ ⚠️ Premium     │ │
│ │ EV/EBITDA       │ 16.2   │ 15.1   │ 14.2   │ ⚠️ Premium     │ │
│ │ P/B             │ 3.8    │ 3.2    │ 2.9    │ ⚠️ Premium     │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MARGIN OF SAFETY                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DCF Base Case:     ₹1,250  │ Current Price: ₹950            │ │
│ │ MOS (Base):        +31.6%  │ Target MOS: >25%              │ │
│ │ MOS (Bear):        -10.5%  │ Required MOS: >15%            │ │
│ │ Probability >15% loss: 18% (per Monte Carlo)               │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DOWNSIDE SCENARIOS                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scenario    │ Probability │ Price Target │ Downside from CMP│ │
│ ├─────────────┼─────────────┼──────────────┼──────────────────┤ │
│ │ Bear Case   │ 25%         │ ₹850        │ -10.5%           │ │
│ │ Base Case   │ 50%         │ ₹1,250      │ +31.6%           │ │
│ │ Bull Case   │ 25%         │ ₹1,850      │ +94.7%           │ │
│ └─────────────┴─────────────┴────────────┴────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Link to Valuation Suite] [Link to Valuation Philosophy]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| historical_multiples | MultipleHistory[] | Auto from financials |
| peer_multiples | PeerMultiple[] | Screening Engine |
| dcf_scenarios | DCFScenario[] | Valuation Suite |

### 3.2 Auto-Calculated
All metrics auto-calculated from Valuation Suite and Screening Engine.

---

## 4. Engine Integration

### 4.1 Links
- **Valuation Suite (DCF, Relative, SOTP):** Auto-feeds scenarios
- **Screening Engine:** Peer comparison data
- **Risk Score Engine:** Feeds Valuation Risk category

---

## 4. API Contract

```typescript
interface ValuationRiskData {
  portfolioId: string;
  historicalMultiples: MultipleHistory[];
  peerComparison: PeerComparison[];
  marginOfSafety: {
    baseCase: number;
    bearCase: number;
    requiredMOS: number;
    probLossGt15Pct: number;
  };
  downsideScenarios: Scenario[];
  lastUpdated: string;
}

interface MultipleHistory {
  date: string;
  pe: number;
  evEbitda: number;
  pb: number;
  evSales: number;
  divYield: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Historical multiples table with 5Y trends | Week 1 |
| 2 | Peer comparison table, MOS calculator | Week 1 |
| 2 | Downside scenario table, Monte Carlo link | Week 2 |
| 3 | Valuation Suite integration, alerts | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Historical percentile | Correct vs 5Y history |
| Peer comparison | Fresh peer data |
| MOS calculation | DCF base - CMP / CMP |
| Downside scenarios | Probabilities sum to 100% |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*