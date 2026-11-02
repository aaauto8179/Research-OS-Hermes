# Valuation Risk Tool Specification

**Tool Name:** Valuation Risk  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Assesses risk of over/under-valuation: P/E vs history, P/E vs peers, EV/EBITDA vs history, price vs DCF, margin of safety, downside scenarios. Auto-calculated from Valuation Suite.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Valuation Risk - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ VALUATION METRICS VS HISTORY                                    │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Metric          │ Current│ 5Y Avg │ 5Y Min │ Status         │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ P/E             │ 28.5   │ 24.2   │ 18.5   │ ⚠️ Above Avg   │ │
│ │ EV/EBITDA       │ 18.2   │ 15.8   │ 12.1   │ ⚠️ Above Avg   │ │
│ │ P/B             │ 4.2    │ 3.5    │ 2.8    │ ⚠️ Above Avg   │ │
│ │ EV/Sales        │ 3.1    │ 2.6    │ 2.1    │ ⚠️ Above Avg   │ │
│ │ Dividend Yield  │ 1.2%   │ 1.5%   │ 0.8%   │ ✅ Below Avg   │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ PEER COMPARISON                                                 │
│ ┌─────────────────┬────────┬────────┬────────┬────────────────┐ │
│ │ Metric          │ Company│ Peer Avg│ Sector │ Status         │ │
│ ├─────────────────┼────────┼────────┼────────┼────────────────┤ │
│ │ P/E             │ 28.5   │ 25.1    │ 22.3   │ ⚠️ Premium     │ │
│ │ EV/EBITDA       │ 18.2   │ 16.5    │ 14.8   │ ⚠️ Premium     │ │
│ │ P/B             │ 4.2    │ 3.1     │ 2.7    │ ⚠️ Premium     │ │
│ └─────────────────┴────────┴────────┴────────┴────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MARGIN OF SAFETY                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DCF Base Case:     ₹1,250  │ Current Price: ₹950            │ │
│ │ MOS (Base):        +31.6%  │ Target MOS: >25%              │ │
│ │ MOS (Bear):        -10.5%  │ Required MOS: >15%            │ │
│ │ Probability of >15% loss: 18% (per Monte Carlo)            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DOWNSIDE SCENARIOS                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Scenario    │ Probability │ Price Target │ Downside from CMP│ │
│ ├─────────────┼─────────────┼──────────────┼──────────────────┤ │
│ │ Bear Case   │ 25%         │ ₹850        │ -10.5%           │ │
│ │ Base Case   │ 50%         │ ₹1,250      │ +31.6%           │ │
│ │ Bull Case   │ 25%         │ ₹1,850      │ +94.7%           │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Link to Valuation Suite] [Link to Valuation Philosophy]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

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
- **Risk Score Engine:** Feeds into Valuation Risk category

---

## 4. API Contract

```typescript
interface ValuationRiskData {
  symbol: string;
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
- Historical percentile calculation accuracy
- Peer comparison data freshness
- MOS calculation accuracy
- Downside scenario probability weights

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*