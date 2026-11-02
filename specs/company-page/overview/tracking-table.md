# Tracking Table Tool Specification

**Tool Name:** Tracking Table  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Customizable table for tracking key investment factors that determine buy/hold/sell decisions. Fully flexible rows/columns with support for formulas, conditional formatting, data source tagging, and auto-refresh from linked engines.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Overview |
| Tool | Tracking |
| Description | A customisable table that tracks key factors of the company that determines whether to invest or not. The table will be flexible to choose what goes in rows and columns |
| Data Source | Manual/Documents Upload, Document AI |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Tracking Table - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ TEMPLATE: [Default ▼] [Save as Template] [Import Template]     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ▼ Metric              │ FY22 │ FY23 │ FY24 │ FY25E │ FY26E │ │
│ ├───────────────────────┼──────┼──────┼──────┼───────┼───────┤ │
│ │ Revenue (₹Cr)         │ 5000 │ 5500 │ 6200 │  7100 │  8000 │ │
│ │ EBITDA Margin (%)     │ 18.2 │ 19.1 │ 20.5 │  21.2 │  22.0 │ │
│ │ PAT (₹Cr)             │  450 │  520 │  610 │  720  │  850  │ │
│ │ ROE (%)               │ 15.2 │ 16.8 │ 18.5 │  19.2 │  20.1 │ │
│ │ Debt/Equity           │ 0.45 │ 0.38 │ 0.32 │  0.28 │  0.25 │ │
│ │ FCF (₹Cr)             │  380 │  420 │  510 │  600  │  700  │ │
│ │ ────────────────────  │ ──── │ ──── │ ──── │  ──── │  ──── │ │
│ │ [Custom Row]          │ [  ] │ [  ] │ [  ] │  [  ] │  [  ] │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ COLUMNS: [Add Year] [Add Quarter] [Remove]  ROWS: [Add Metric] │
│ DATA SOURCE: [Manual ▼] [Auto: Revenue Projection] [Doc AI]    │
│ FORMAT: [Number ▼] [%] [₹Cr] [x] [Custom Formula]              │
│ CONDITIONAL: [Green if >] [Red if <] [Formula]                 │
├─────────────────────────────────────────────────────────────────┤
│ [Save Template] [Export CSV] [Import CSV] [Reset]              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Features
| Feature | Description |
|---------|-------------|
| **Flexible Grid** | Add/remove rows & columns, drag to reorder |
| **Cell Types** | Number, %, Currency, Formula, Text, Link |
| **Data Sources** | Manual, Auto (engine), Doc AI, Formula |
| **Conditional Formatting** | Green/Red thresholds, custom formulas |
| **Templates** | Save/load/share tracking templates |
| **Auto-refresh** | Engine-linked cells update on recalc |
| **Versioning** | Snapshot history per quarter |

### 3.3 Column Configuration
| Property | Options |
|----------|---------|
| Period | FY20-FY30, Q1-Q4, Custom |
| Data Source | Manual, Revenue Projection, Ratio Analysis, Doc AI, Formula |
| Format | Number (0-4 decimals), %, ₹Cr, ₹, Multiple, Date, Text |
| Formula | JS expression referencing other cells: `={Revenue}*{EBITDA%}/100` |

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Description |
|-------|------|-------------|
| template_id | string | User-defined template |
| grid | Cell[][] | 2D array of cell configs |
| version | integer | Incremental version |

### 4.2 Cell Config
```typescript
interface CellConfig {
  value: string | number | Formula;
  dataSource: 'manual' | 'revenue_projection' | 'ratio_analysis' | 'doc_ai' | 'formula';
  format: 'number' | 'percent' | 'currency' | 'multiple' | 'date' | 'text';
  formula?: string;  // e.g., "={Revenue}*{EBITDA_Margin}/100"
  conditionalFormat?: {
    greenIf: string;  // formula returning boolean
    redIf: string;
  };
  autoRefresh: boolean;
  confidence?: number;  // 0-1 for Doc AI
}
```

### 4.3 Engine Integration
- **Revenue Projection Engine** → Auto-fills projected years
- **Ratio Analysis Engine** → Auto-fills ratio rows
- **Doc AI** → Extracts historical actuals from annual reports

---

## 5. API Contract

```typescript
interface TrackingTableData {
  symbol: string;
  templateId: string;
  templateName: string;
  grid: CellConfig[][];
  columnConfig: ColumnConfig[];
  rowConfig: RowConfig[];
  version: number;
  lastUpdated: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  period: string;  // 'FY24', 'Q3FY24', etc.
  width: number;
}

interface RowConfig {
  id: string;
  label: string;
  isCustom: boolean;
  engineLink?: string;  // e.g., 'revenue_projection.revenue'
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Grid component with react-data-grid or TanStack Table | Week 1-2 |
| 2 | Cell editor (formula, format, source dropdown) | Week 2 |
| 3 | Engine auto-fill integration | Week 2-3 |
| 3 | Template save/load, conditional formatting | Week 3 |
| 4 | CSV import/export, version history | Week 3-4 |

---

## 7. Testing
- Grid CRUD (add/remove rows/cols, reorder)
- Formula evaluation (cross-cell references)
- Auto-fill from engines
- Conditional formatting
- Template save/load
- CSV round-trip

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*