# Competitors Table Tool Specification

**Tool Name:** Competitors Table  
**Category:** Industry Analysis  
**Sheet:** Company Page → Industry  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Customizable table of all companies in the industry with filters to select columns. Auto-populates from company database, allows custom metrics, peer group management, and export to Valuation Suite for relative valuation.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Competitors Table - [INDUSTRY]                                  │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS: [Sector ▼] [Market Cap ▼] [Geography ▼] [Search...]   │
├─────────────────────────────────────────────────────────────────┤
│ COLUMN SELECTOR: [☑ Symbol] [☑ Name] [☑ Price] [☑ P/E] [☑ EV/EBITDA] │
│ [☑ ROE] [☑ ROCE] [☑ Debt/Equity] [☑ FCF Yield] [☑ Market Cap]  │
│ [☑ Revenue] [☑ EBITDA] [☑ PAT] [☑ Promoter %] [☑ Pledge %]      │
│ [Add Custom Metric] [Save Preset] [Load Preset]                 │
├─────────────────────────────────────────────────────────────────┤
│ COMPETITORS TABLE                                               │
│ ┌────┬────────┬──────────────┬─────┬────────┬───────┬──────┐   │
│ │ ☐  │ Symbol │ Name         │ P/E │ EV/EBIT│ ROE   │ ...  │   │
│ ├────┼────────┼──────────────┼─────┼────────┼───────┼──────┤   │
│ │ ☐  │ RELIANCE│ Reliance Ind │ 28.5│ 18.2  │ 22.5% │ ...  │   │
│ │ ☐  │ TCS     │ Tata Consul  │ 26.8│ 17.1  │ 42.3% │ ...  │   │
│ │ ☐  │ INFY    │ Infosys      │ 24.1│ 15.3  │ 30.1% │ ...  │   │
│ │ ☐  │ HDFCBANK│ HDFC Bank    │ 18.5│  N/A  │ 17.0% │ ...  │   │
│ └────┴────────┴──────────────┴─────┴────────┴───────┴──────┘   │
│ [Select All] [Add to Peer Group] [Export CSV] [Export to Valuation] │
├─────────────────────────────────────────────────────────────────┤
│ PEER GROUP MANAGEMENT                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Peer Group: [Default ▼]  [Create New] [Rename] [Delete]     │ │
│ │ Selected: 5 companies  │  Auto-refresh: ON                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| companies | Company[] | Company Database / Screener |
| peer_groups | PeerGroup[] | Manual |
| custom_metrics | Metric[] | Manual |

### 3.2 Company Schema
```typescript
interface CompetitorCompany {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCapCr: number;
  price: number;
  pe: number;
  evEbitda: number;
  roe: number;
  roce: number;
  debtEquity: number;
  fcfYield: number;
  revenueCr: number;
  ebitdaCr: number;
  patCr: number;
  promoterPct: number;
  pledgePct: number;
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Relative Valuation Engine:** Peer group feeds into `RelativeValuationEngine`
- **Screening Engine:** Filters apply screening criteria
- **Valuation Philosophy:** Peer group feeds into Relative Valuation case

---

## 4. API Contract

```typescript
interface CompetitorsTableData {
  industry: string;
  companies: CompetitorCompany[];
  peerGroups: PeerGroup[];
  customMetrics: CustomMetric[];
  lastUpdated: string;
}

interface PeerGroup {
  id: string;
  name: string;
  symbols: string[];
  autoRefresh: boolean;
  createdAt: string;
}

interface CustomMetric {
  id: string;
  name: string;
  formula: string;  // e.g., "EBITDA/Revenue"
  format: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Table with column selector, filters, sorting | Week 1 |
| 2 | Checkbox selection, peer group management | Week 1 |
| 2 | Custom metric builder (formula parser) | Week 2 |
| 3 | Export to Valuation Suite, CSV export | Week 2 |

---

## 5. Testing
- Column selector persistence
- Filter accuracy
- Peer group auto-refresh
- Custom formula evaluation
- Export to Valuation Suite

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*