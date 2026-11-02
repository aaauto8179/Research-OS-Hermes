# Multi Text Box Tool Specification

**Tool Name:** Multi Text Box  
**Category:** UI Components  
**Sheet:** Additional tools  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
A grid-based text component with multiple rows and columns, adjustable column widths. Used for structured notes, comparison tables, checklists with descriptions, or any tabular text data. More flexible than a DataTable for free-form content.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Multi Text Box                                                  │
├─────────────────────────────────────────────────────────────────┤
│ TOOLBAR: [+ Row] [+ Col] [🗑 Clear] [⚙ Settings] [↕ Drag]     │
├─────────────────────────────────────────────────────────────────┤
│ GRID (Resizable columns, draggable rows)                       │
│ ┌─────────┬──────────────┬──────────────┬────────────────────┐ │
│ │ Header 1│ Header 2     │ Header 3     │ Header 4           │ │
│ ├─────────┼──────────────┼──────────────┼────────────────────┤ │
│ │ Row 1   │ Cell content │ Cell content │ Long text wraps... │ │
│ ├─────────┼──────────────┼──────────────┼────────────────────┤ │
│ │ Row 2   │ ✓ Done       │ In Progress  │ Notes here         │ │
│ ├─────────┼──────────────┼──────────────┼────────────────────┤ │
│ │ Row 3   │              │              │                    │ │
│ └─────────┴──────────────┴──────────────┴────────────────────┘ │
│ [Row handles: drag to reorder] [Col handles: drag to resize]   │
├─────────────────────────────────────────────────────────────────┤
│ CELL TYPES (per column)                                         │
│ • Text (default)                                                │
│ • Rich Text (TipTap)                                            │
│ • Checkbox                                                      │
│ • Select (dropdown)                                             │
│ • Date                                                          │
│ • Number                                                        │
│ • Tag (multi-select chips)                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Data Model
```typescript
interface MultiTextBoxColumn {
  id: string;
  header: string;
  type: 'text' | 'richtext' | 'checkbox' | 'select' | 'date' | 'number' | 'tag';
  width: number;        // pixels or %
  options?: string[];   // for select/tag
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

interface MultiTextBoxRow {
  id: string;
  cells: { columnId: string; value: any }[];
  order: number;
}

interface MultiTextBoxData {
  columns: MultiTextBoxColumn[];
  rows: MultiTextBoxRow[];
  settings: {
    showRowNumbers: boolean;
    allowRowReorder: boolean;
    allowColResize: boolean;
    stripeRows: boolean;
  };
}
```

---

## 4. Engine Integration

### 3.1 Component API
```typescript
interface MultiTextBoxProps {
  data: MultiTextBoxData;
  onChange: (data: MultiTextBoxData) => void;
  readOnly?: boolean;
  className?: string;
}
```

### 3.2 Persistence
- **Widget State:** Saved in DashboardCanvas layout
- **Postgres:** `widget_data` JSONB column

---

## 4. Engine Integration

### 4.1 Links
- **DashboardCanvas:** As a widget
- **Company Page (SME → Checklist/Notes):** Structured notes
- **Research Workspace:** Comparison tables
- **Decision Journal:** Criteria tables

---

## 4. API Contract

```typescript
// No backend API - pure frontend component
export const MultiTextBox: React.FC<MultiTextBoxProps>;
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Grid component (react-grid-layout or TanStack Table), resizable cols | Week 1 |
| 2 | Cell types (text, richtext, checkbox, select, date, number, tag) | Week 1 |
| 2 | Row reorder (drag), add/remove rows/cols | Week 2 |
| 3 | Validation, export (CSV/JSON), settings panel | Week 2 |
| 3 | Storybook, accessibility, tests | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Column resize | Width persists |
| Row drag reorder | Order saves |
| Cell types | All render/edit correctly |
| Validation | Shows errors inline |
| Export | CSV/JSON valid |
| Large grids | Virtual scrolling works |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: MEDIUM*