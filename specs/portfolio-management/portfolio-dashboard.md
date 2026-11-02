# Portfolio Management Tool Specification

**Tool Name:** Portfolio Management  
**Sheet:** Portfolio management Page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Comprehensive portfolio management: holdings tracking, performance analytics, risk metrics, transaction logging, import/reconciliation from broker statements, corporate actions handling, and tax reporting.

---

## 3. UI/UX Specification

### 3.1 Layout (Main Dashboard)
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Dashboard - [Portfolio Name]                          │
├─────────────────────────────────────────────────────────────────┤
│ PERFORMANCE METRICS                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ XIRR        │ │ Total P&L   │ │ Sharpe      │ │ Max DD      │ │
│ │ 18.5%       │ │ ₹2.4L       │ │ 1.42        │ │ -8.2%       │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS TABLE                                                  │
│ ┌────┬────────┬─────┬───────┬───────┬───────┬─────┬──────┐    │
│ │ #  │ Symbol │ Qty  │ Avg   │ LTP   │ P&L%  │ 52W │ Act  │    │
│ ├────┼────────┼─────┼───────┼───────┼───────┼─────┼──────┤    │
│ │ 1  │ RELIANCE│ 10  │ 2500  │ 2950  │+18% │ -8% │ 🟢   │    │
│ │ 2  │ INFY    │ 25  │ 1400  │ 1520  │+8.6%│ -5% │ 🟢   │    │
│ │ 3  │ TCS     │ 15  │ 3200  │ 3650  │+14% │ -3% │ 🟢   │    │
│ └────┴────────┴─────┴───────┴───────┴───────┴─────┴──────┘    │
│ [Add Holding] [Import] [Reconcile] [Export]                    │
├─────────────────────────────────────────────────────────────────┤
│ TABS: [Holdings] [Performance] [Risk] [Transactions] [Import] [Reconcile] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Sub-Tabs
| Tab | Purpose |
|-----|---------|
| Holdings | Current positions with P&L |
| Performance | XIRR, TWR, attribution, benchmark comparison |
| Risk | VaR, concentration, sector exposure, beta |
| Transactions | Buy/sell history with realized P&L |
| Import | Broker statement upload (Zerodha, Groww, Upstox, ICICI, Angel) |
| Reconcile | Holding vs broker statement comparison |

---

## 4. Data Pipeline

### 3.1 Input Data
| Source | Format | Frequency |
|--------|--------|-----------|
| Broker Statements | Excel/CSV/PDF | On-demand |
| Manual Entry | Form | Real-time |
| Market Data | NSE/BSE API | Real-time |
| Corporate Actions | Company Announcements | Event-driven |

### 3.2 Import Pipeline
```
Broker File → Parser (Zerodha/Groww/ICICI/Angel) → Normalizer → Validator → Portfolio DB
```

### 3.3 Reconciliation Engine
```
1. Load Portfolio Holdings
2. Load Broker Holding Statement
3. Match by Symbol + Qty + Avg Price (fuzzy)
4. Flag Mismatches (Qty, Avg Price, Missing)
5. Generate Reconciliation Report
6. User Resolution → Update Portfolio
```

---

## 4. Engine Integration

### 4.1 Engines Used
| Engine | Purpose |
|--------|---------|
| PortfolioAnalyticsEngine | XIRR, TWR, Sharpe, Sortino, Attribution |
| CorporateActionsEngine | Splits, bonus, rights, mergers, dividends |
| RatioAnalysisEngine | Peer comparison metrics |

---

## 4. API Contract

```typescript
interface PortfolioData {
  portfolioId: string;
  name: string;
  holdings: Holding[];
  transactions: Transaction[];
  performance: PerformanceMetrics;
  risk: RiskMetrics;
  lastUpdated: string;
}

interface Holding {
  symbol: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
  sector: string;
  marketCap: string;
}

interface PerformanceMetrics {
  xirr: number;
  twr: number;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  benchmarkReturn: number;
  excessReturn: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Holdings table, manual add/edit, P&L calc | Week 1 |
| 2 | Broker import parsers (5 brokers), validation | Week 1-2 |
| 2 | Reconciliation engine, mismatch resolution UI | Week 2 |
| 3 | Performance tab (XIRR, TWR, charts), Risk tab | Week 2-3 |
| 3 | Corporate actions handling, tax reports | Week 3 |
| 4 | Transaction tab, export, tax reports | Week 3 |

---

## 6. Testing
- Import parser accuracy (5 broker formats)
- Reconciliation accuracy (Qty, Avg Price matching)
- XIRR/TWR calculation accuracy (golden vectors)
- Corporate action adjustments
- Tax report generation (STCG/LTCG)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*