# Market Metrics Tool Specification

**Tool Name:** Market Metrics  
**Category:** Macro Dashboard  
**Sheet:** Macro Page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Real-time dashboard widget showing key Indian equity market metrics: NIFTY 50, SENSEX, VIX, advance/decline ratio, market breadth, sector rotation, FII/DII flows. Auto-refreshes every 15 minutes during market hours.

### 1.2 What this tool does NOT do
- Does not provide predictions or forecasts
- Does not replace terminal-level market data (Bloomberg/Refinitiv)
- Does not execute trades

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Macro Page |
| Category | Market Metrics |
| Tool | Market metrics |
| Description | A widget containing metrics of Indian Stock market like NIFTY 50, sensex etc. |
| Data Source | Website/API |
| Sample Link | https://drive.google.com/file/d/16K11CrrVsH0sF0f6dx4jQEpU02nbGplQ/view |

---

## 3. UI/UX Specification

### 3.1 Layout (Dashboard Widget)
```
┌─────────────────────────────────────────────────────────────────┐
│ Market Metrics                              [↻ Refresh] [⚙]    │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ NIFTY 50         │ │ SENSEX           │ │ VIX              │ │
│ │ 24,500           │ │ 81,000           │ │ 14.2             │ │
│ │ +0.8% (+195)     │ │ +0.7% (+567)     │ │ -5.2%            │ │
│ │ ████████░░ (1D)  │ │ ███████░░ (1D)   │ │ ████░░ (1D)      │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Adv/Dec          │ │ Market Breadth   │ │ FII/DII Net      │ │
│ │ 1,245 / 892      │ │ 58% Advancing    │ │ +₹2,450 Cr       │ │
│ │ 1.4:1 Ratio      │ │ 32% Declining    │ │ FII: +₹1,800 Cr  │ │
│ │                  │ │ 10% Unchanged    │ │ DII: +₹650 Cr    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ SECTOR ROTATION (1D)                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IT: +1.2%  │ Banking: +0.5%  │ Auto: +1.8%  │ Pharma: -0.2% │ │
│ │ FMCG: +0.3%│ Energy: +1.5%  │ Metal: +2.1% │ Realty: +0.8%  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Responsive Behavior
| Breakpoint | Layout |
|------------|--------|
| < 640px | Stack all cards vertically |
| 640-1024px | 2-column grid for indices, 3-column for sector rotation |
| > 1024px | 3-column for indices, single row sector rotation |

### 3.3 Real-time Indicators
| Indicator | Update Frequency | Visual Cue |
|-----------|------------------|------------|
| NIFTY/SENSEX | 15 sec (market hours) | Green/Red flash on change |
| VIX | 30 sec | Color-coded (Green <15, Yellow 15-25, Red >25) |
| Adv/Dec | 1 min | Ratio badge |
| FII/DII | 15 min (EOD final) | Net flow arrow |

---

## 4. Data Pipeline

### 4.1 Data Sources
| Widget | Source | Frequency | Fallback |
|--------|--------|-----------|----------|
| NIFTY 50 | NSE API / WebSocket | 15 sec | 15-min delayed |
| SENSEX | BSE API | 15 sec | 15-min delayed |
| VIX | NSE API | 30 sec | Previous close |
| Adv/Dec | NSE/BSE | 1 min | EOD |
| FII/DII | NSDL/CDSL / SEBI | 15 min (intraday) / EOD | T-1 data |
| Sector Indices | NSE | 15 sec | 15-min delayed |

### 4.2 Data Flow
```
External APIs → Ingestion Service (Node.js) → Redis Cache (TTL: 15s) 
    → Dashboard API (REST) → Frontend (SSE/WebSocket) → Widget
```

### 4.3 Data Models
```typescript
interface MarketMetricsData {
  indices: {
    nifty50: IndexData;
    sensex: IndexData;
    vix: VixData;
  };
  breadth: {
    advances: number;
    declines: number;
    unchanged: number;
    advDecRatio: number;
  };
  fiiDii: {
    fiiNet: number;
    diiNet: number;
    fiiMtd: number;
    diiMtd: number;
  };
  sectorRotation: SectorPerformance[];
  lastUpdated: string;
}

interface IndexData {
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  sparkline: number[];  // 1D intraday
  high52w: number;
  low52w: number;
  timestamp: string;
}

interface VixData {
  value: number;
  change: number;
  changePct: number;
  percentile: number;  // Historical percentile
}

interface SectorPerformance {
  sector: string;
  changePct: number;
  sparkline: number[];
  marketCapWeight: number;
}
```

---

## 5. Engine Integration

### 5.1 Data Sources
| Source | Protocol | Auth | Rate Limit |
|--------|----------|------|------------|
| NSE API | REST + WebSocket | API Key | 100 req/min |
| BSE API | REST | API Key | 60 req/min |
| NSDL/CDSL | REST | OAuth | 100 req/min |
| SEBI | REST | None | 30 req/min |

### 5.2 Caching Strategy
| Data Type | Cache TTL | Invalidation |
|-----------|-----------|--------------|
| Index values | 15 sec | WebSocket push |
| VIX | 30 sec | WebSocket push |
| Adv/Dec | 1 min | Polling |
| FII/DII | 15 min | Scheduled job |
| Sector indices | 15 sec | WebSocket push |

---

## 6. API Contract

```typescript
// GET /api/macro/market-metrics
interface MarketMetricsResponse {
  indices: {
    nifty50: IndexData;
    sensex: IndexData;
    vix: VixData;
  };
  breadth: BreadthData;
  fiiDii: FIIDIIData;
  sectors: SectorPerformance[];
  marketStatus: 'OPEN' | 'CLOSED' | 'PRE_OPEN' | 'POST_CLOSE';
  lastUpdated: string;
}
```

---

## 7. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Dashboard widget components (IndexCard, BreadthCard, SectorCard) | Week 1 |
| 2 | NSE/BSE WebSocket integration, Redis caching | Week 1-2 |
| 2 | SSE endpoint for real-time updates | Week 2 |
| 3 | Sector rotation heatmap, historical comparison | Week 2-3 |
| 3 | Widget settings (customize indices, refresh interval) | Week 3 |

---

## 8. Testing Requirements

### 8.1 Unit Tests
- Index value parsing and formatting
- Change percentage calculation
- Sparkline data normalization
- Cache hit/miss ratios

### 8.2 Integration Tests
- WebSocket connection handling (reconnect logic)
- Cache invalidation on market open/close
- Fallback to REST when WebSocket fails
- Rate limiting compliance

### 8.3 E2E Tests
- Market open: real-time updates visible
- Market close: shows final values, no updates
- Pre-market: shows pre-open indicators
- Widget resize: layout adapts correctly

---

## 9. Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| ws | ≥8.0.0 | WebSocket client |
| ioredis | ≥5.3.0 | Redis caching |
| socket.io-client | ≥4.7.0 | SSE fallback |
| recharts | ≥2.10.0 | Sparklines |
| date-fns | ≥2.30.0 | Time formatting |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| NSE API rate limiting | High | High | Redis caching, request batching, exponential backoff |
| WebSocket disconnection | Medium | High | Auto-reconnect with exponential backoff |
| Data staleness during volatility | Medium | High | 15-sec TTL, WebSocket push |
| API key rotation | Low | High | Automated key rotation, env vars |

---

## 10. Verification Checklist

- [ ] All Excel fields mapped to UI components
- [ ] UI layout documented with ASCII wireframes
- [ ] Data sources identified with priority and fallback
- [ ] API contract defined with TypeScript interfaces
- [ ] Test cases listed for unit/integration/E2E
- [ ] Implementation plan with phases
- [ ] Dependencies listed
- [ ] Risks identified with mitigations

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*