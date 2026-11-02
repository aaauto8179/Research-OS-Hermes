# Industry Page Tool Specification

**Tool Name:** Industry Page  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Industry analysis dashboard with 4 tabs: Overview, Deep Dive, Value Chain, Custom Dashboard. Customizable widgets for demand/supply analysis, competitor comparison, value chain mapping, and regulatory tracking.

---

## 3. UI/UX Specification

### 3.1 Layout (4 Tabs)
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Analysis - [INDUSTRY]                                  │
├─────────────────────────────────────────────────────────────────┤
│ TABS: [Overview] [Deep Dive] [Value Chain] [Custom Dashboard]  │
├─────────────────────────────────────────────────────────────────┤
│ TAB: OVERVIEW                                                   │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│ │ Market Size      │ │ Growth Rate      │ │ Companies        │ │
│ │ ₹4.2L Cr         │ │ 12.3% YoY        │ │ 45               │ │
│ │ Trend: ▲         │ │ Trend: ▲         │ │ Trend: ▲         │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sector Heatmap                                                │ │
│ │ [Interactive heatmap: Companies × Metrics]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Peer Comparison Table                                       │ │
│ │ [Sortable table: Company, Revenue, EBITDA, ROE, P/E]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TAB: DEEP DIVE                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DEMAND DRIVERS        │ SUPPLY ANALYSIS      │ RISK/REGULATION│ │
│ │ [Driver table]        │ [Capacity table]     │ [Reg tracker]  │ │
│ ├───────────────────────┼──────────────────────┼───────────────┤ │
│ │ COST DRIVERS          │ COST COMPARISON      │ MARKET SIZING  │ │
│ │ [Driver table]        │ [Company compare]    │ [TAM/SAM/SOM]  │ │
│ ├───────────────────────┼──────────────────────┼───────────────┤ │
│ │ COMPANIES TABLE       │ INDUSTRY AGGREGATE   │ SUPPLY CHAIN   │ │
│ │ [Company table]       │ [Agg financials]     │ [Canvas mapper]│ │
│ └───────────────────────┴──────────────────────┴───────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TAB: VALUE CHAIN                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Interactive Canvas: Boxes & Arrows, Margin Pools]          │ │
│ │ [Toolbar: Box, Arrow, Text, Color, Export]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TAB: CUSTOM DASHBOARD                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [DashboardCanvas: Drag-drop widgets, custom layout]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Tab | Data Source |
|-----|-------------|
| Overview | Company database, Industry aggregate engine |
| Deep Dive | Company database, Industry aggregate, Regulations tracker, Doc AI |
| Value Chain | Manual canvas, Industry aggregate |
| Custom Dashboard | DashboardCanvas widgets |

### 3.2 Industry Aggregate Engine
```python
def compute_industry_aggregate(companies):
    return {
        'total_revenue': sum(c.revenue for c in companies),
        'total_ebitda': sum(c.ebitda for c in companies),
        'total_pat': sum(c.pat for c in companies),
        'weighted_roe': sum(c.roe * c.equity for c in companies) / sum(c.equity),
        'weighted_ebitda_margin': sum(c.ebitda for c in companies) / sum(c.revenue for c in companies),
    }
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page:** Industry selector navigates here
- **Screening Engine:** Industry filter
- **Portfolio Management:** Sector exposure
- **Document AI:** Industry report extraction
- **Regulations Tracker:** Regulatory items per industry

---

## 4. API Contract

```typescript
interface IndustryPageData {
  industry: string;
  overview: IndustryOverview;
  deepDive: IndustryDeepDive;
  valueChain: CanvasState;
  customDashboard: DashboardLayout;
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Tabbed layout, Overview widgets | Week 1 |
| 2 | Deep Dive tables (Demand/Supply/Risk/Reg/Cost/Comp) | Week 2 |
| 2 | Value Chain Canvas (react-flow) | Week 2-3 |
| 3 | Custom Dashboard (DashboardCanvas), Industry Aggregate engine | Week 3 |

---

## 6. Testing
- Tab navigation
- Table sorting/filtering
- Canvas interaction (drag, zoom, export)
- Industry aggregate calculations
- Cross-page navigation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*