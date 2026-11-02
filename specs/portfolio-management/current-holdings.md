# Current Holdings Tool Specification

**Tool Name:** Current Holdings  
**Category:** Portfolio Management  
**Sheet:** Portfolio management Page → Current Portfolio  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Current portfolio holdings table with real-time data: symbol, quantity, average price, current price, market value, P&L (absolute and %), 52-week high/low distance, action buttons. Real-time price updates via WebSocket.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Current Holdings - [Portfolio Name]                             │
├─────────────────────────────────────────────────────────────────┤
│ SUMMARY: Total Value: ₹1.25Cr  │ Day P&L: +₹1.2L (+1.1%)  │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS TABLE                                                  │
│ ┌────┬────────┬─────┬────────┬────────┬───────┬───────┬──────┐ │
│ │ ☐  │ Symbol │ Qty  │ Avg    │ LTP    │ Mkt Val│ P&L   │ Act │ │
│ ├────┼────────┼─────┼────────┼────────┼───────┼───────┼──────┤ │
│ │ ☐  │ RELIANCE│ 10   │ 2,500  │ 2,950  │ 29,500│ +18% │ 🟢  │ │
│ │ ☐  │ TCS     │ 25   │ 1,400  │ 3,650  │ 91,250│ +14% │ 🟢  │ │
│ │ ☐  │ HDFC    │ 50   │ 1,600  │ 1,680  │ 84,000│ +5%  │ 🟢  │ │
│ └────┴────────┴─────┴────────┴────────┴───────┴───────┴──────┘ │
│ [Select All] [Add Holding] [Export CSV] [Rebalance]            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Row Actions (on hover/click)
| Action | Icon | Description |
|--------|------|-------------|
| View Details | 🔍 | Opens holding detail modal |
| Edit | ✏️ | Edit qty, avg price, add notes |
| Add to Watchlist | ⭐ | Add to watchlist |
| Set Alert | 🔔 | Price/volume/P&L alert |
| Sell | 📉 | Pre-fill sell order |
| Remove | 🗑️ | Remove from portfolio |

---

## 4. Engine Integration

### 4.1 Real-time Price Updates
```typescript
// WebSocket subscription
ws.subscribe(['RELIANCE', 'TCS', 'HDFC'], (update) => {
  holdings.update(symbol => ({
    ltp: update.ltp,
    change: update.change,
    changePct: update.changePct,
    dayHigh: update.high,
    dayLow: update.low,
    volume: update.volume
  }));
});

// Fallback: SSE polling every 15s
```

### 3.2 Holding Schema
```typescript
interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPct: number;
  dayChange: number;
  dayChangePct: number;
  high52w: number;
  low52w: number;
  distFromHigh: number;  // %
  distFromLow: number;   // %
  sector: string;
  marketCap: string;
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Analytics:** P&L feeds into performance
- **Watchlist:** Add/remove from watchlist
- **Alerts:** Price/P&L alerts
- **Transactions:** Link to trade history

---

## 4. API Contract

```typescript
interface HoldingsResponse {
  portfolioId: string;
  summary: {
    totalValue: number;
    dayPnL: number;
    dayPnLPct: number;
    totalPnL: number;
    totalPnLPct: number;
  };
  holdings: Holding[];
  lastUpdated: string;
}

interface RealTimeUpdate {
  symbol: string;
  ltp: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  timestamp: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Holdings table with real-time updates (WebSocket/SSE) | Week 1 |
| 2 | Row actions (detail modal, edit, alerts) | Week 1 |
| 2 | P&L calculation, day change, 52w high/low | Week 1 |
| 3 | Export CSV, column customization | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Real-time updates | LTP updates within 15s |
| P&L calculation | (LTP - Avg) * Qty |
| Day change % | (LTP - PrevClose) / PrevClose |
| 52w distance | (LTP - High52) / High52 |
| Sorting/filtering | Works on all columns |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*