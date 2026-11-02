# Additional Tools (UI Primitives) Specification

**Tool Name:** Additional Tools - UI Primitives  
**Sheet:** Additional tools  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Reusable UI primitive components used across all tools: Simple Text Box, Multi Text Box, Filterable Table. These are the building blocks for custom dashboards and customizable tools.

---

## 2. Component Specifications

### 2.1 Simple Text Box
```
┌─────────────────────────────────────────────────────────────────┐
│ Simple Text Box                                                 │
├─────────────────────────────────────────────────────────────────┤
│ HEADER (optional)                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Title: [Header Text]                                        │ │
│ │ Description: [Optional description text]                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CONTENT AREA                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Rich text editor: Bold, Italic, Underline, Lists, Links]   │ │
│ │                                                               │ │
│ │ [Auto-save on blur] [Character count] [Word count]          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER (optional)                                               │
│ [Last edited: 2024-11-15 14:30] [Character count: 1,234]       │
└─────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface SimpleTextBoxProps {
  header?: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  autoSave?: boolean;
  autoSaveDebounce?: number;  // ms
  showStats?: boolean;  // char/word count
}
```

---

### 2.2 Multi Text Box
```
┌─────────────────────────────────────────────────────────────────┐
│ Multi Text Box (Table-like)                                     │
├─────────────────────────────────────────────────────────────────┤
│ TOOLBAR                                                         │
│ [Add Row] [Add Column] [Delete Row] [Delete Column] [Import CSV]│
├─────────────────────────────────────────────────────────────────┤
│ GRID (Editable cells)                                           │
│ ┌──────────┬────────────┬────────────┬────────────┬───────────┐ │
│ │          │ Col 1      │ Col 2      │ Col 3      │ Col 4     │ │
│ ├──────────┼────────────┼────────────┼────────────┼───────────┤ │
│ │ Row 1    │ [Cell]     │ [Cell]     │ [Cell]     │ [Cell]    │ │
│ │ Row 2    │ [Cell]     │ [Cell]     │ [Cell]     │ [Cell]    │ │
│ │ Row 3    │ [Cell]     │ [Cell]     │ [Cell]     │ [Cell]    │ │
│ └──────────┴────────────┴────────────┴────────────┴───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ COLUMN SETTINGS                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Column 1: Header [____] Width [150] Align [Left ▼]         │ │
│ │ Column 2: Header [____] Width [150] Align [Center ▼]       │ │
│ │ Column 3: Header [____] Width [150] Align [Right ▼]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface MultiTextBoxProps {
  columns: ColumnConfig[];
  rows: RowData[];
  onChange: (columns: ColumnConfig[], rows: RowData[]) => void;
  editable?: boolean;
  showToolbar?: boolean;
  showColumnSettings?: boolean;
  exportCSV?: boolean;
}

interface ColumnConfig {
  id: string;
  header: string;
  width: number;
  align: 'left' | 'center' | 'right';
  editable: boolean;
}

type RowData = Record<string, string>;
```

---

### 2.3 Filterable Table
```
┌─────────────────────────────────────────────────────────────────┐
│ Filterable Table                                                │
├─────────────────────────────────────────────────────────────────┤
│ UNIVERSE SELECTOR                                               │
│ Universe: [All Companies ▼]  [Add Custom Universe]             │
├─────────────────────────────────────────────────────────────────┤
│ PARAMETER UNIVERSE                                              │
│ [Choose parameters to filter on...]                             │
│ [Parameter ▼] [Operator ▼] [Value]  [+ Add Filter] [Clear All] │
│   P/E                    <         25        [×]                 │
│   ROE                    >         15%       [×]                 │
│   Market Cap             >         1000 Cr   [×]                 │
│   [Apply Filters] [Clear All] [Save Filter] [Load Filter]       │
├─────────────────────────────────────────────────────────────────┤
│ RESULTS TABLE                                                   │
│ ┌────┬────────┬──────────────┬─────┬────────┬─────┬─────┐     │
│ │ ☐  │ Symbol │ Name         │ P/E │ EV/EBIT│ ROE │ ... │     │
│ ├────┼────────┼──────────────┼─────┼────────┼─────┼─────┤     │
│ │ ☐  │ RELIANCE│ Reliance    │ 28.5│ 18.2  │ 22.5│ ... │     │
│ │ ☐  │ TCS    │ Tata Consul  │ 26.8│ 17.1  │ 42.3│ ... │     │
│ └────┴────────┴──────────────┴─────┴────────┴─────┴─────┘     │
│ [Select All] [Export CSV] [Add to Watchlist] [Save Filter]     │
└─────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface FilterableTableProps {
  universe: CompanySnapshot[];
  availableParameters: ParameterConfig[];
  initialFilters?: Filter[];
  onFilterChange: (filters: Filter[]) => void;
  onSelectionChange: (selectedSymbols: string[]) => void;
  onExportCSV: () => void;
  customColumns?: ColumnConfig[];
}
```

---

## 3. Data Pipeline

### 3.1 Shared State
- All primitives read from/write to `workspaceStore` (Zustand)
- Auto-save to localStorage (dev) / backend (prod)
- Version control for collaborative editing

---

## 4. Implementation Plan

| Component | Phase | Duration |
|-----------|-------|----------|
| Simple Text Box | 1 | Week 1 |
| Multi Text Box | 1-2 | Week 1-2 |
| Filterable Table | 2 | Week 2-3 |
| Integration with DashboardCanvas | 2-3 | Week 2-3 |

---

## 4. Testing
- Text box auto-save debouncing
- Multi text box CSV import/export
- Filterable table filter logic
- Column resizing/reordering
- Cross-component state sync

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*