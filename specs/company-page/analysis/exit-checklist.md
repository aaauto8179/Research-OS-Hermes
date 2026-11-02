# Exit Checklist Tool Specification

**Tool Name:** Exit Checklist  
**Category:** Analysis  
**Sheet:** Company Page → Analysis  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Pre-customizable checklist with defined parameters that trigger exit signals. Each item has condition, threshold, current value, status, and alert. Links to Exit Rationale (Overview) and Downsides tab.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Exit Checklist - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ TEMPLATE: [Conservative ▼] [Aggressive ▼] [Custom ▼] [Save]    │
├─────────────────────────────────────────────────────────────────┤
│ CHECKLIST ITEMS                                                 │
│ ┌────┬────────────────────────┬──────────┬──────────┬────────┐ │
│ │ #  │ Condition              │ Threshold│ Current  │ Status │ │
│ ├────┼────────────────────────┼──────────┼──────────┼────────┤ │
│ │ 1  │ P/E > 5Y avg + 2σ      │ >32.5    │ 28.5     │ ✅ OK  │ │
│ │ 2  │ EV/EBITDA > 5Y max     │ >22.0    │ 18.2     │ ✅ OK  │ │
│ │ 3  │ ROE < 15% for 2Q       │ <15%     │ 22.5%    │ ✅ OK  │ │
│ │ 4  │ Debt/Equity > 1.0      │ >1.0     │ 0.45     │ ✅ OK  │ │
│ │ 5  │ Promoter pledge > 20%  │ >20%     │ 8.2%     │ ✅ OK  │ │
│ │ 6  │ F-score < 5            │ <5       │ 7        │ ✅ OK  │ │
│ │ 7  │ Beneish M > -1.78      │ >-1.78   │ -2.45    │ ✅ OK  │ │
│ │ 8  │ Price < 200 DMA        │ <DMA    │ ₹950     │ ✅ OK  │ │
│ └────┴────────────────────────┴──────────┴──────────┴────────┘ │
│ [Add Item] [Import Template] [Export CSV]                       │
├─────────────────────────────────────────────────────────────────┤
│ ALERTS                                                          │
│ ⚠️ No active alerts - All conditions OK                         │
├─────────────────────────────────────────────────────────────────┤
│ [Add Item] [Import Template] [Export CSV] [Link to Exit Rationale] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| items | ChecklistItem[] | Manual / Template |
| thresholds | object | Auto from engines |

### 3.2 Item Schema
```typescript
interface ChecklistItem {
  id: string;
  condition: string;
  threshold: string;  // e.g., ">32.5", "<15%"
  currentValue: string | number;
  metricSource: string;  // e.g., "RatioAnalysisEngine.PE"
  status: 'OK' | 'Warning' | 'Triggered' | 'Error';
  lastChecked: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Ratio Analysis Engine:** Auto-fetches current values for thresholds
- **Valuation Suite:** P/E, EV/EBITDA from Relative Valuation
- **Forensic Engines:** F-score, Beneish, Piotroski
- **Technical Analysis:** 200 DMA from Technical Analysis engine
- **Exit Rationale (Overview):** Links to exit rationale
- **Downsides Tab:** Links to Key Events, Hedging

---

## 4. API Contract

```typescript
interface ExitChecklistData {
  symbol: string;
  templateId: string;
  items: ChecklistItem[];
  alerts: Alert[];
  lastChecked: string;
  lastUpdated: string;
}

interface ChecklistItem {
  id: string;
  condition: string;
  threshold: string;
  currentValue: string | number;
  metricSource: string;
  status: 'OK' | 'Warning' | 'Triggered' | 'Error';
  lastChecked: string;
}

interface Alert {
  itemId: string;
  message: string;
  severity: 'Warning' | 'Critical';
  timestamp: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Checklist table with status badges, threshold parser | Week 1 |
| 2 | Auto-fetch from engines, threshold parser | Week 1 |
| 2 | Alert system (Warning/Critical), template save/load | Week 2 |
| 3 | Cross-links to Exit Rationale, Downsides | Week 2 |

---

## 6. Testing
- Threshold parsing (>, <, >=, <=, ==)
- Auto-fetch accuracy from engines
- Alert triggering logic
- Template save/load
- Cross-link navigation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*