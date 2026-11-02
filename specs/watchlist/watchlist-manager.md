# Watchlist Tool Specification

**Tool Name:** Watchlist Manager  
**Sheet:** Watchlist  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Watchlist management: create custom company groups with customizable columns, saved column configurations per watchlist, real-time price updates, alerts, and export to screening/portfolio.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Watchlist Manager                                               │
├─────────────────────────────────────────────────────────────────┤
│ WATCHLISTS: [My Watchlist ▼] [Create New] [Rename] [Delete]    │
├─────────────────────────────────────────────────────────────────┤
│ COLUMNS: [☑ Symbol] [☑ Name] [☑ LTP] [☑ Change] [☑ P/E] [☑ EV/EBITDA] │
│ [☑ ROE] [☑ ROCE] [☑ D/E] [☑ 52W High] [☑ 52W Low] [☑ Volume]  │
│ [Add Custom] [Save Config] [Load Config]                        │
├─────────────────────────────────────────────────────────────────┤
│ WATCHLIST TABLE                                                 │
│ ┌────┬────────┬──────────────┬──────┬───────┬─────┬──────┐    │
│ │ ☐  │ Symbol │ Name         │ LTP  │ Change│ P/E │ ...  │    │
│ ├────┼────────┼──────────────┼──────┼───────┼─────┼──────┤    │
│ │ ☐  │ RELIANCE│ Reliance Ind │ 2950 │ +2.3% │ 28.5│ ...  │    │
│ │ ☐  │ TCS     │ Tata Consul  │ 3650 │ +1.2% │ 26.8│ ...  │    │
│ │ ☐  │ INFY    │ Infosys      │ 1520 │ -0.5% │ 24.1│ ...  │    │
│ └────┴────────┴──────────────┴──────┴───────┴─────┴──────┘    │
│ [Select All] [Remove Selected] [Add to Portfolio] [Export CSV] │
├─────────────────────────────────────────────────────────────────┤
│ ALERTS                                                          │
│ ⚠️ RELIANCE: Price > ₹3000 (Target Alert)                       │
│ ⚠️ TCS: P/E > 30 (Valuation Alert)                             │
│ [Manage Alerts] [Set Alert]                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| watchlists | Watchlist[] | Manual |
| columns | ColumnConfig[] | Manual (saved per watchlist) |
| alerts | Alert[] | Manual / Engine |

### 3.2 Data Schema
```typescript
interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  columnConfig: ColumnConfig[];
  alerts: Alert[];
  createdAt: string;
  updatedAt: string;
}

interface ColumnConfig {
  field: string;
  label: string;
  visible: boolean;
  width: number;
  formatter?: string;
}

interface Alert {
  id: string;
  symbol: string;
  condition: 'price_above' | 'price_below' | 'pe_above' | 'pe_below' | 'change_pct';
  threshold: number;
  enabled: boolean;
  createdAt: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Screening Engine:** Export screened companies to watchlist
- **Portfolio Management:** Add watchlist symbols to portfolio
- **Real-time Prices:** WebSocket/SSE for LTP updates
- **Alerts Engine:** Background monitoring

---

## 4. API Contract

```typescript
interface WatchlistData {
  watchlists: Watchlist[];
  activeWatchlistId: string;
  realtimePrices: { [symbol: string]: PriceData };
  alerts: Alert[];
}

interface PriceData {
  symbol: string;
  ltp: number;
  change: number;
  changePct: number;
  high52w: number;
  low52w: number;
  volume: number;
  timestamp: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Watchlist CRUD, column selector, table | Week 1 |
| 2 | Real-time price updates (WebSocket/SSE) | Week 1 |
| 2 | Alert system (condition builder, notifications) | Week 2 |
| 3 | Export to Portfolio/Screening, CSV export | Week 2 |

---

## 6. Testing
- Real-time price updates
- Alert triggering accuracy
- Column config persistence
- Watchlist CRUD operations
- Export/import

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*