# Relative Valuation Tool Specification (Valuation Tab UI)

**Tool Name:** Relative Valuation (UI)  
**Category:** Valuation  
**Sheet:** Company Page → Valuation  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Peer group comparison UI with multiple multiples (P/E, EV/EBITDA, P/B, EV/Sales). Football field chart, implied valuation range, peer table with customizable metrics. Consumes Relative Valuation Engine.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Relative Valuation - [SYMBOL]                                   │
├─────────────────────────────────────────────────────────────────┤
│ PEER SELECTION                    │ FOOTBALL FIELD              │
│ ┌────────────────────────────────┐ │                             │
│ │ Mode: [Auto ▼]                 │ │                    ┌─────┐ │
│ │ Sector: [Auto ▼]               │ │ Current Price ────►│  █  │ │
│ │ Market Cap: [1000-100000] Cr   │ │                             │ │
│ │ Max Peers: [10]                │ │ P/E Implied    ────►│ ████████████ │ │
│ │ Multiples: [P/E] [EV/EBITDA]   │ │                             │ │
│ │ [P/B] [EV/Sales]               │ │ EV/EBITDA      ────►│ ████████████████ │ │
│ │ Aggregation: [Median ▼]        │ │                             │ │
│ │ Weighting: [Equal ▼]           │ │ P/B Implied    ────►│ ████████████ │ │
│ │ [Search Peers]                 │ │                             │ │
│ └────────────────────────────────┘ │ SOTP Implied   ────►│ ████████████████ │ │
│ PEER TABLE                         │                             │ │
│ ┌────────────────────────────────┐ │ DCF Range      ────►│ ████████████████████ │ │
│ │ Peer    │ P/E  │ EV/EBITDA │     │                             │ │
│ ├─────────┼──────┼───────────┼─────┤                             │ │
│ │ RELIANCE│ 28.5 │ 18.2      │     │     ₹800    ₹1000    ₹1200   ₹1400 │ │
│ │ TCS     │ 26.8 │ 17.1      │     │                             │ │
│ │ INFY    │ 24.1 │ 15.3      │     │                             │ │
│ └─────────┴──────┴───────────┴─────┘                             │
│ IMPLIED VALUES                                                  │
│ P/E: ₹1,245  |  EV/EBITDA: ₹1,312  |  P/B: ₹1,156  |  Weighted: ₹1,212 │
│ [Recalculate] [Export CSV] [Add to Valuation Philosophy]        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| target_symbol | string | Company Page |
| peer_universe | enum | Auto / Custom |
| sector_filter | string | Optional |
| market_cap_range | tuple | Optional |
| max_peers | integer | 5-20 |
| multiples | array | P/E, EV/EBITDA, P/B, EV/Sales |
| aggregation | enum | Median, Harmonic Mean, Weighted |
| weighting | enum | Equal, Market Cap, Inverse Distance |

---

## 4. Engine Integration

### 4.1 Engine
- **RelativeValuationEngine** in `math-engine/src/math_engine/valuation/relative.py`
- **API:** `POST /api/math-engine/relative`

### 4.2 Inputs
```typescript
interface RelativeValuationInputs {
  target_symbol: string;
  peer_universe: 'auto' | 'custom';
  sector_filter?: string;
  market_cap_range?: [number, number];
  max_peers: number;
  multiples: ('pe' | 'ev_ebitda' | 'pb' | 'ev_sales')[];
  aggregation: 'median' | 'harmonic_mean' | 'weighted';
  weighting_scheme: 'equal' | 'market_cap' | 'inverse_distance';
  target_metrics: {
    pat: number; ebitda: number; book_value: number; revenue: number;
    net_debt: number; market_cap: number;
  };
}
```

---

## 4. API Contract

```typescript
interface RelativeResponse {
  calculation_id: string;
  implied_valuations: {
    pe: number;
    ev_ebitda: number;
    pb: number;
    ev_sales: number;
    weighted_average: number;
  };
  football_field: FootballFieldData;
  peer_table: PeerRow[];
  peer_selection: PeerSelectionLog;
  audit: AuditTrail;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Peer selection panel, football field chart (Recharts) | Week 1-2 |
| 2 | Peer table with sortable columns | Week 2 |
| 2 | Auto-peer selection logic, custom metric support | Week 2 |
| 3 | Export to Valuation Philosophy, CSV export | Week 2 |

---

## 6. Testing
- Peer selection logic (sector, mcap filters)
- Football field rendering accuracy
- Implied valuation calculation
- Peer table sorting/filtering
- CSV export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*