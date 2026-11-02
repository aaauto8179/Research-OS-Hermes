# Financial Statement Health Tool Specification

**Tool Name:** Financial Statement Health  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Pre-made templates with customization for financial health analysis: quality of earnings, balance sheet strength, cash flow quality, working capital efficiency, red flag detection. Customizable metrics selection and threshold alerts.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Financial Statement Health - [SYMBOL]                           │
├─────────────────────────────────────────────────────────────────┤
│ TEMPLATE: [Quality of Earnings ▼] [Balance Sheet] [Cash Flow]   │
│ [Custom] [Save Template] [Load Template]                        │
├─────────────────────────────────────────────────────────────────┤
│ QUALITY OF EARNINGS TEMPLATE                                    │
│ ┌────────────────────────┬────────┬────────┬────────┬────────┐ │
│ │ Metric                 │ Value  │ Thresh │ Status │ Trend  │ │
│ ├────────────────────────┼────────┼────────┼────────┼────────┤ │
│ │ Accruals Ratio         │ 0.08   │ <0.1   │ ✅     │ ▼      │ │
│ │ Cash Conversion Cycle  │ 45 days│ <60    │ ✅     │ ▼      │ │
│ │ Adj. EBITDA / EBITDA   │ 98%    │ >95%   │ ✅     │ →      │ │
│ │ Revenue Recognition    │ Clean  │ -      │ ✅     │ →      │ │
│ │ Provision Coverage     │ 1.2x   │ >1.0x  │ ✅     │ ▲      │ │
│ │ One-time Items % PAT   │ 3%     │ <5%    │ ✅     │ ▼      │ │
│ └────────────────────────┴────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ BALANCE SHEET STRENGTH                                          │
│ ┌────────────────────────┬────────┬────────┬────────┬────────┐ │
│ │ Metric                 │ Value  │ Thresh │ Status │ Trend  │ │
│ ├────────────────────────┼────────┼────────┼────────┼────────┤ │
│ │ Current Ratio          │ 1.8x   │ >1.5x  │ ✅     │ ▼      │ │
│ │ Quick Ratio            │ 1.2x   │ >1.0x  │ ✅     │ ▼      │ │
│ │ Debt/Equity            │ 0.45   │ <1.0   │ ✅     │ ▼      │ │
│ │ Net Debt/EBITDA        │ 1.2x   │ <3.0x  │ ✅     │ ▼      │ │
│ │ Interest Coverage      │ 8.5x   │ >4.0x  │ ✅     │ ▲      │ │
│ │ Asset Coverage         │ 2.5x   │ >2.0x  │ ✅     │ →      │ │
│ └────────────────────────┴────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CASH FLOW QUALITY                                             │
│ ┌────────────────────────┬────────┬────────┬────────┬────────┐ │
│ │ Metric                 │ Value  │ Thresh │ Status │ Trend  │ │
│ ├────────────────────────┼────────┼────────┼────────┼────────┤ │
│ │ CFO / PAT              │ 1.15x  │ >1.0x  │ ✅     │ ▲      │ │
│ │ FCF / CFO              │ 0.75   │ >0.6   │ ✅     │ →      │ │
│ │ Capex / Depreciation   │ 1.3x   │ >1.0x  │ ✅     │ ▲      │ │
│ │ WC Investment / Rev    │ 2%     │ <5%    │ ✅     │ ▼      │ │
│ └────────────────────────┴────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RED FLAG DETECTION                                              │
│ ┌────────────────────────┬────────┬────────┬────────┬────────┐ │
│ │ Flag                   │ Value  │ Thresh │ Status │ Action │ │
│ ├────────────────────────┼────────┼────────┼────────┼────────┤ │
│ │ Rising DSO             │ 65 days│ <60    │ ⚠️     │ Review │ │
│ │ Inventory Buildup      │ 1.8x   │ <1.5x  │ ⚠️     │ Monitor│ │
│ │ Related Party Rev ↑    │ 12%    │ <10%   │ ⚠️     │ Review │ │
│ └────────────────────────┴────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Customize Metrics] [Set Thresholds] [Export Report] [Link to Forensic Analysis] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| template_id | string | User |
| metrics | MetricConfig[] | User + Auto from engines |

### 3.2 Metric Config
```typescript
interface MetricConfig {
  id: string;
  name: string;
  formula: string;  // e.g., "Current_Assets / Current_Liabilities"
  dataSource: 'financials' | 'ratio_engine' | 'manual';
  threshold: { operator: '>' | '<' | '>=' | '<='; value: number };
  category: 'earnings' | 'balance_sheet' | 'cash_flow' | 'red_flag';
  weight: number;  // for aggregate score
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Ratio Analysis Engine:** Auto-fetches ratio values
- **Financial Statements:** Base data
- **Red Flags (Risk tab):** Cross-references red flags
- **Forensic Engines:** Beneish, Altman, Piotroski scores

---

## 4. API Contract

```typescript
interface FinancialHealthData {
  symbol: string;
  templateId: string;
  templateName: string;
  categories: HealthCategory[];
  redFlags: RedFlag[];
  aggregateScore: number;
  lastUpdated: string;
}

interface HealthCategory {
  name: string;
  metrics: HealthMetric[];
  categoryScore: number;
}

interface HealthMetric {
  id: string;
  name: string;
  value: number | string;
  threshold: { operator: string; value: number };
  status: 'Pass' | 'Fail' | 'Warning';
  trend: 'Improving' | 'Stable' | 'Deteriorating';
  source: 'auto' | 'manual';
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Template selector, metric table with status badges | Week 1 |
| 2 | Threshold editor, custom formula builder | Week 1 |
| 2 | Red flag auto-detection from engines | Week 2 |
| 3 | Aggregate score, export report, cross-links | Week 2 |

---

## 6. Testing
- Formula evaluation accuracy
- Threshold comparison logic
- Template save/load
- Red flag auto-detection accuracy
- Cross-tab links

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*