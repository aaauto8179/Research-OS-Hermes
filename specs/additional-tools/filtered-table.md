# Filtered Table Tool Specification

**Tool Name:** Filtered Table  
**Category:** UI Components  
**Sheet:** Additional tools  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
A data table component with built-in filtering, sorting, pagination, column visibility, and export. Designed for displaying structured data from APIs (companies, holdings, transactions, screen results). More feature-rich than Multi Text Box for tabular data.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Filtered Table - [Title]                               [Cols ▼] │
├─────────────────────────────────────────────────────────────────┤
│ TOOLBAR                                                         │
│ [🔍 Search] [📊 Filter] [⬆⬇ Sort] [📄 Page: 1/10] [📥 Export] │
├─────────────────────────────────────────────────────────────────┤
│ TABLE                                                           │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ ☐  │ Symbol │ Revenue│ EBITDA │ Margin │ ROE    │ P/E    │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ ☐  │ REL    │ 9.5L   │ 1.8L   │ 19%    │ 14%    │ 12x    │   │
│ │ ☐  │ TCS    │ 2.4L   │ 65K    │ 27%    │ 42%    │ 28x    │   │
│ │ ☐  │ HDFC   │ 1.8L   │ 42K    │ 23%    │ 17%    │ 18x    │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ FILTER PANEL (slide-in)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Revenue: [Min: 0] [Max: 10L]  [Slider]                     │ │
│ │ ROE:     [> 15%] [Dropdown: >10%, >15%, >20%, Custom]      │ │
│ │ Sector:  [☑ Energy] [☑ IT] [☐ Financials] [☐ Auto]         │ │
│ │ [Apply] [Clear All] [Save as Preset]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Features
| Feature | Implementation |
|---------|----------------|
| **Sorting** | Multi-column, client + server-side |
| **Filtering** | Text, number range, date range, select, multi-select |
| **Pagination** | Client (default) / Server-side (large datasets) |
| **Column Visibility** | Toggle columns, save presets |
| **Row Selection** | Checkbox, shift-click range, select all |
| **Export** | CSV, Excel, JSON, PDF |
| **Virtual Scrolling** | For 1000+ rows |

### 3.2 Data Model
```typescript
interface FilteredTableColumn {
  id: string;
  header: string;
  accessor: string;           // Data key
  type: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'pct';
  sortable: boolean;
  filterable: boolean;
  width?: number;
  render?: (value: any, row: any) => React.ReactNode;
}

interface FilteredTableFilter {
  columnId: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'in' | 'between';
  value: any;
}

interface FilteredTableProps {
  columns: FilteredTableColumn[];
  data: any[];
  serverSide?: boolean;
  fetchData?: (params: FetchParams) => Promise<{ data: any[]; total: number }>;
  onRowClick?: (row: any) => void;
  selection?: 'none' | 'single' | 'multiple';
  pageSize?: number;
  exportFilename?: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **DashboardCanvas:** As a widget
- **Screening Results:** Primary display
- **Portfolio Holdings:** Current holdings table
- **Trade History:** Transaction table
- **Watchlist:** Watchlist table
- **Company Peer Table:** Peer comparison

---

## 4. API Contract

```typescript
// Component only - data passed as props
// Server-side fetch example:
interface FetchParams {
  page: number;
  pageSize: number;
  sorts: { column: string; direction: 'asc' | 'desc' }[];
  filters: FilteredTableFilter[];
  search?: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | TanStack Table v8 setup, basic table with sort/paginate | Week 1 |
| 2 | Filter panel (slide-in), all filter types | Week 1 |
| 2 | Column visibility, row selection, virtual scrolling | Week 2 |
| 3 | Export (CSV/Excel/PDF), saved presets, server-side mode | Week 2 |
| 3 | Storybook, accessibility, performance tests | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Sort | Multi-column, correct order |
| Filter | All operators work |
| Pagination | Correct page counts |
| Export | All formats valid |
| Virtual scroll | 10k+ rows smooth |
| Server mode | Correct params sent |
| Accessibility | Keyboard nav, ARIA |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: MEDIUM*