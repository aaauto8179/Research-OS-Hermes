# Ratio Analysis Tool Specification (Company Page UI)

**Tool Name:** Ratio Analysis (UI)  
**Category:** Analysis  
**Sheet:** Company Page → Analysis  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Comprehensive ratio analysis dashboard across 6 categories (25+ ratios) with multi-year trends, peer benchmarking, and percentile ranking. Consumes Ratio Analysis Engine for calculations.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Analysis |
| Tool | Ratio Analysis |
| Description | Ratios calculated using financial statement data and formulas |
| Data Source | Financial statements + Formula |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Ratio Analysis - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [5Y ▼]  [Annual ▼]  [Peer Compare: ON ▼]              │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ PROFITABILITY│ LEVERAGE     │ LIQUIDITY  │ EFFICIENCY          │
│ ROE: 22.5%   │ D/E: 0.45    │ Current: 1.8│ Asset T/O: 1.2     │
│ ROCE: 28.1%  │ D/EBITDA: 1.2│ Quick: 1.2  │ Inv T/O: 6.5       │
│ Margin: 15.2%│ Int Cov: 8.5 │ Cash: 0.8   │ Rec T/O: 4.2       │
├──────────────┼──────────────┼────────────┼─────────────────────┤
│ VALUATION    │ GROWTH (5Y)  │ PEER RANK  │ TREND CHART        │
│ P/E: 28.5    │ Rev: 15.2%   │ ROE: 75th % │ [Sparkline 5Y]    │
│ EV/EBITDA: 18│ EBITDA: 18.5%│ ROCE: 82nd %│                    │
│ P/B: 4.2     │ PAT: 22.1%   │ D/E: 35th % │                    │
└──────────────┴──────────────┴────────────┴─────────────────────┘
```

### 3.2 Peer Benchmarking
- Percentile rank for each ratio within sector
- Color coding: Green (top quartile), Yellow (middle), Red (bottom quartile)
- Sector median and best-in-class reference lines on trend charts

---

## 4. Engine Integration
- **Backend:** `RatioAnalysisEngine` in `math-engine/src/math_engine/analysis/ratio_analysis.py`
- **API:** `POST /api/math-engine/ratio-analysis` (embedded in analysis endpoint)
- **Inputs:** Symbol, period, peer_compare flag
- **Output:** 25+ ratios with trends, peer percentiles, sector medians

---

## 6. Implementation Plan
- **Component:** `RatioAnalysis.tsx` in `src/components/company/analysis/`
- **WidgetRegistry:** `"ratio-analysis"`
- **Features:** Period selector, peer compare toggle, export CSV, sparkline trends

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*