# Watchlist Tool Specification

**Tool Name:** Watchlist  
**Sheet:** Watchlist  
**Spec Version:** 1.0.0  
**Status:** ✅ Partially Implemented (Frontend 70%, Backend 60%)  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Multi-list watchlist with real-time prices, alerts, quick actions. Lists: Core, Ideas, High Conviction, Sector-specific, Custom. Real-time price updates via WebSocket. Alerts: Price, Volume, P&L %, News, Corporate Actions. Quick actions: Add to Portfolio, Run Screening, Open Company Page, Run Valuation.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Watchlist                                    [+ New List]       │
├─────────────────────────────────────────────────────────────────┤
│ LISTS: [Core Portfolio ▼] [High Conviction] [Ideas] [Energy]   │
├─────────────────────────────────────────────────────────────────┤
│ WATCHLIST TABLE (Core Portfolio)                                │
│ ┌────┬────────┬────────┬──────┬──────┬──────┬──────┬──────┐    │
│ │ ☐  │ Symbol │ LTP    │ Chg% │ Day% │ 52W% │ Alert│ Act  │    │
│ ├────┼────────┼────────┼──────┼──────┼──────┼──────┼──────┤    │
│ │ ☐  │ RELIANCE│ 2,950 │ +1.2%│ +0.8%│ -8%  │ 🔔   │ ➕   │    │
│ │ ☐  │ TCS     │ 3,650 │ +0.5%│ -0.2%│ +15% │ 🔔   │ ➕   │    │
│ │ ☐  │ HDFC    │ 1,680 │ -0.3%│ +1.1%│ -5%  │      │ ➕   │    │
│ │ ☐  │ INFY    │ 1,580 │ +0.8%│ +0.5%│ +12% │ 🔔   │ ➕   │    │
│ │ ☐  │ TATAMOTORS│ 845 │ -1.2%│ -2.1%│ -18% │      │ ➕   │    │
│ └────┴────────┴────────┴──────┴──────┴──────┴──────┴──────┘    │
│ [Select All] [Add Symbol] [Export] [Bulk Alert]                │
├─────────────────────────────────────────────────────────────────┤
│ ALERT SETTINGS (per symbol)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ RELIANCE Alerts:                                            │ │
│ │ ☑ Price ≥ ₹3,000      ☑ Price ≤ ₹2,800                      │ │
│ │ ☑ Volume > 2x Avg     ☑ P&L ≥ +20%                          │ │
│ │ ☑ News (High impact)  ☑ Corporate Actions                   │ │
│ │ Delivery: [Push ▼] [Email ▼] [In-app ▼]                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS (on row hover)                                    │
│ [📊 Valuation] [📈 Screening] [🏢 Company Page] [📋 Add to Portfolio]│
│ [🔔 Alert] [📝 Note] [📤 Share] [🗑 Remove]                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Watchlist Schema
```typescript
interface Watchlist {
  id: string;
  name: string;
  symbols: WatchlistSymbol[];
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

interface WatchlistSymbol {
  symbol: string;
  addedAt: string;
  addedPrice: number;
  notes: string;
  alerts: Alert[];
  tags: string[];
}

interface Alert {
  id: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'pnl_pct' | 'news' | 'corporate_action';
  condition: number;  // threshold
  enabled: boolean;
  channels: ('push' | 'email' | 'in_app')[];
  triggeredAt?: string;
  lastChecked: string;
}
```

### 3.2 Real-time Price Updates
```typescript
// WebSocket subscription per watchlist
ws.subscribe(watchlist.symbols.map(s => s.symbol), (update) => {
  watchlist.update(symbol => ({
    ltp: update.ltp,
    change: update.change,
    changePct: update.changePct,
    dayHigh: update.high,
    dayLow: update.low,
    volume: update.volume,
    high52w: update.high52w,
    low52w: update.low52w,
    // Check alerts
    alerts: checkAlerts(symbol, update)
  }));
});
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page:** Quick action opens deep dive
- **Valuation Suite:** Quick action runs DCF/Relative
- **Screening Engine:** Quick action runs screen
- **Portfolio Management:** Add to portfolio
- **Event Risk Monitor:** Corporate action alerts
- **Document AI:** News alerts

---

## 4. API Contract

```typescript
interface WatchlistData {
  lists: Watchlist[];
  activeListId: string;
  realTimeUpdates: RealTimePrice[];
  alerts: TriggeredAlert[];
}

interface RealTimePrice {
  symbol: string;
  ltp: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
  high52w: number;
  low52w: number;
  timestamp: string;
}

interface TriggeredAlert {
  alertId: string;
  symbol: string;
  type: string;
  message: string;
  triggeredAt: string;
  acknowledged: boolean;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Watchlist CRUD, multi-list UI, drag-drop reorder | Week 1 |
| 2 | Real-time price updates (WebSocket), alert engine | Week 1 |
| 2 | Alert settings UI, notification channels | Week 2 |
| 3 | Quick actions, Company Page/Valuation links | Week 2 |
| 3 | Bulk operations, export, sharing | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Real-time updates | <15s latency |
| Alert triggering | Accurate threshold check |
| Multi-list switching | Instant, preserves state |
| Quick actions | Correct deep links |
| Price/52W% calc | (LTP - High52)/High52 |

---

*Spec Version: 1.0.0 | Status: ✅ Partially Implemented | Priority: HIGH*