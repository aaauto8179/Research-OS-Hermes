# Macro Page Tool Specification

**Tool Name:** Macro Page  
**Sheet:** Macro Page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Macro dashboard with economic indicators, market metrics, and sector performance. Widgets for GDP, inflation, interest rates, currency, commodity prices, and equity market breadth. Customizable widget layout via DashboardCanvas.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Macro Dashboard                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Add Widget] [Save Layout] [Reset] [Export PDF]                │
├─────────────────────────────────────────────────────────────────┤
│ ECONOMIC INDICATORS                                             │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ GDP Growth       │ │ Inflation (CPI)  │ │ Repo Rate        │ │
│ │ 7.2% YoY         │ │ 5.4% YoY         │ │ 6.50%            │ │
│ │ Trend: ▲         │ │ Trend: ▼         │ │ Trend: →         │ │
│ │ [Chart: 5Y]      │ │ [Chart: 5Y]      │ │ [Chart: 5Y]      │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MARKET METRICS                                                  │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ NIFTY 50         │ │ SENSEX           │ │ VIX              │ │
│ │ 24,500 (+0.8%)   │ │ 81,000 (+0.7%)   │ │ 14.2 (-5%)       │ │
│ │ [Chart: 1Y]      │ │ [Chart: 1Y]      │ │ [Chart: 1Y]      │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SECTOR PERFORMANCE                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sector          │ 1D    │ 1W    │ 1M    │ 3M    │ YTD     │ │
│ ├─────────────────┼───────┼───────┼───────┼───────┼─────────┤ │
│ │ IT              │ +1.2% │ +3.5% │ +8.2% │ +15%  │ +22%    │ │
│ │ Banking         │ +0.5% │ +2.1% │ +5.5% │ +12%  │ +18%    │ │
│ │ Auto            │ +1.8% │ +4.2% │ +12%  │ +25%  │ +35%    │ │
│ │ Pharma          │ -0.2% │ +1.2% │ +3.5% │ +8%   │ +15%    │ │
│ │ FMCG            │ +0.3% │ +0.8% │ +2.1% │ +5%   │ +8%     │ │
│ │ Energy          │ +1.5% │ +3.2% │ +8.5% │ +15%  │ +22%    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ COMMODITY & CURRENCY                                            │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Crude Oil (₹/bbl)│ │ USD/INR          │ │ 10Y G-Sec Yield  │ │
│ │ 6,200 (+1.2%)    │ │ 83.25 (-0.15%)   │ │ 7.15% (+5bps)    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Data Sources
| Widget | Source | Frequency |
|--------|--------|-----------|
| GDP/Inflation/Repo | RBI / MOSPI | Monthly/Quarterly |
| NIFTY/SENSEX/VIX | NSE/BSE | Real-time (15min delay) |
| Sector Performance | NSE Indices | Real-time |
| Commodity/Currency | MCX / RBI | Real-time |
| G-Sec Yield | CCIL | Real-time |

### 3.2 Data Pipeline
```
External APIs → Data Ingestion Service → Redis Cache → Dashboard API → Frontend
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (Macro Risk):** Sensitivities to macro factors
- **Industry Page:** Sector performance, regulations
- **Portfolio Management:** Benchmark returns, beta calculation

---

## 4. API Contract

```typescript
interface MacroDashboardData {
  economicIndicators: EconomicIndicator[];
  marketMetrics: MarketMetric[];
  sectorPerformance: SectorPerformance[];
  commodities: CommodityPrice[];
  currencies: CurrencyRate[];
  gsecYields: GsecYield[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | DashboardCanvas with macro widgets | Week 1 |
| 2 | Data ingestion pipelines (RBI, NSE, MCX APIs) | Week 1-2 |
| 2 | Real-time updates via WebSocket/SSE | Week 2 |
| 3 | Widget customization, layout persistence | Week 2 |

---

## 6. Testing
- Data freshness indicators
- Widget resize/drag-drop
- Layout persistence
- API rate limiting handling
- Fallback to cached data

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*