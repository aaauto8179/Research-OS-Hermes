# Research OS - Widget/Tab Framework Specification

## Overview
A universal, customizable widget/tab system for Research OS that allows users to create personalized dashboards for Industry Analysis and Company Deep Dives. Built on React Grid Layout with Zustand persistence.

## Architecture

### Core Components

```
src/
├── lib/
│   └── workspace-store.ts          # Zustand store with persistence
├── components/
│   ├── DashboardCanvas.tsx         # Grid-based widget canvas (industry)
│   ├── CompanyTabs.tsx             # Customizable tab system (company)
│   └── DashboardCanvas.tsx         # Shared widget renderer
├── app/
│   ├── industry/page.tsx           # Industry page with custom dashboard tab
│   └── company/[symbol]/page.tsx   # Company page using CompanyTabs
└── lib/
    ├── workspace-store.ts          # Central state management
    └── types.ts                    # TypeScript definitions
```

### State Management (Zustand + Immer + Persist)

```typescript
interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  props: Record<string, any>;
  gridProps: {
    x: number; y: number; w: number; h: number;
    minW?: number; minH?: number; maxW?: number; maxH?: number;
  };
}

interface TabConfig {
  id: string;
  label: string;
  widgetIds: string[];
  isCustom: boolean;
  order: number;
}
```

### Widget Registry

22 widget types across 4 categories:
- **Data** (6): KPI Cards, Peer Table, Industry Overview, Ownership, News Feed, Demand Drivers
- **Chart** (5): Financial Charts, Sector Heatmap, Margin Bridge, Technical Analysis, Market Sizing
- **Analysis** (6): Valuation Summary, Risk Assessment, Value Chain, Peer Comparison, Demand Drivers, Checklist
- **Utility** (5): Documents, Catalyst Tracker, Custom Notes, Regulatory Tracker, Cost Structure

Each widget has:
- Type identifier, label, description, icon
- Default props (Zod-validated)
- Default grid size (w, h, minW, minH, maxW, maxH)
- Category and applicable contexts (industry/company/both)

## Industry Dashboard Features

### Tabs
1. **Overview** - Grid of industry cards with key metrics
2. **Deep Dive** - 7-tab detailed analysis per industry
3. **Compare** - Side-by-side industry comparison table
4. **Custom Dashboard** - Drag-drop widget canvas

### Deep Dive Sub-tabs (7)
- Demand Drivers
- Supply & Capacity
- Regulations
- Cost Structure
- Competitors
- Market Sizing
- Value Chain

### Persistence
- Per-industry layout saved to localStorage
- Syncs to Postgres on login (future)

## Company Deep Dive Features

### Customizable Tab System
- **Default tabs** (8): Financials, Valuation, Risk, Ownership, Catalysts, Documents, Technicals, Checklist
- **User can**: Add, remove, rename, reorder tabs
- **Tab state**: Persisted per symbol
- **Widget assignment**: Each tab has its own widget layout

### Widget-to-Tab Mapping
- Each widget belongs to a specific tab via `widgetIds` array in TabConfig
- DashboardCanvas filters widgets by active tab's `widgetIds`
- Add widget modal assigns to current active tab

### Persistence
- Per-symbol: tabs, widgets, active tab, layouts
- Saved to localStorage keyed by `company-{symbol}-workspace`
- Future: Postgres sync with user account

## Widget Implementation Guide

### Creating a New Widget

```typescript
// 1. Add to DEFAULT_WIDGET_TYPES in workspace-store.ts
{
  type: 'my-widget',
  label: 'My Widget',
  description: 'Description',
  icon: 'IconName',
  defaultProps: { /* Zod schema */ },
  defaultSize: { w: 6, h: 4, minW: 4, minH: 3 },
  category: 'analysis',
  contexts: ['company', 'industry'],
}

// 2. Add render case in WidgetContent.tsx
function WidgetContent({ widget, isMaximized }) {
  switch (widget.type) {
    case 'my-widget':
      return <MyWidgetComponent {...widget.props} />;
  }
}

// 3. Create component in components/widgets/MyWidget.tsx
export function MyWidgetComponent({ prop1, prop2 }) {
  // Fetch data, render UI
}
```

### Widget Data Fetching
- Widgets receive props from config
- Use SWR/React Query for server data
- Props can include: symbol, industryCode, dateRange, metrics[]
- Widgets should be self-contained and reusable

## API Integration Points

### Industry Widgets
- `/api/industry/[code]/demand-drivers`
- `/api/industry/[code]/supply-dynamics`
- `/api/industry/[code]/regulations`
- `/api/industry/[code]/competitors`
- `/api/industry/[code]/value-chain`

### Company Widgets
- `/api/company/[symbol]/financials`
- `/api/company/[symbol]/valuation`
- `/api/company/[symbol]/risk`
- `/api/company/[symbol]/ownership`
- `/api/company/[symbol]/documents`
- `/api/company/[symbol]/technicals`

## UI/UX Specifications

### Grid System
- 12-column responsive grid (lg:12, md:10, sm:6, xs:4, xxs:2)
- Row height: 60px
- Compact type: vertical
- Drag handle: `.widget-header`
- Resize handles: all edges

### Widget States
- **Normal**: In grid, draggable, resizable
- **Maximized**: Full-screen modal, close to restore
- **Settings**: Gear icon → opens config panel
- **Loading**: Skeleton placeholder
- **Error**: Red border, retry button

### Empty States
- Industry dashboard: "No widgets yet" + Add Widget CTA
- Company tabs: "No tabs yet" + Add Tab CTA
- Widget content: "Configure widget" + Settings CTA

### Accessibility
- Keyboard navigation for grid
- ARIA labels on all interactive elements
- Focus visible outlines
- Screen reader announcements for drag operations

## Persistence Strategy

### LocalStorage (Dev)
- Key: `research-os-workspace`
- Auto-save on every change (debounced 500ms)
- Schema versioning for migrations

### Postgres (Prod)
```sql
CREATE TABLE user_workspaces (
  user_id UUID REFERENCES users(id),
  workspace_type VARCHAR(20), -- 'industry' | 'company'
  context_key VARCHAR(100),   -- industry code or symbol
  tabs JSONB,
  widgets JSONB,
  layout JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, workspace_type, context_key)
);
```

### Sync Strategy
- Optimistic UI updates
- Background sync every 30s
- Conflict resolution: last-write-wins with user notification
- Offline queue for mutations

## Testing Requirements

### Unit Tests
- Widget registry operations
- Store actions (add/remove/move/resize)
- Tab operations (add/remove/rename/reorder)
- Persistence round-trip

### Integration Tests
- Drag-drop widget placement
- Tab add/remove/rename/reorder
- Maximize/minimize widget
- Add widget to tab

### E2E Tests
- Full industry dashboard workflow
- Full company deep dive workflow
- Persistence across reloads
- Multi-tab company workflow

## Performance Budgets

- Initial load: < 2s
- Widget mount: < 100ms
- Drag start: < 16ms
- Layout recalc: < 50ms
- Store update: < 5ms

## Migration Path

### Phase 1 (Current)
- localStorage persistence
- All widgets as placeholders
- Industry/Company pages integrated

### Phase 2
- Real widget implementations
- API endpoints for each widget
- SWR data fetching

### Phase 3
- Postgres persistence
- Multi-user support
- Workspace sharing/export

### Phase 4
- Advanced widgets (charts, value chain canvas)
- AI-assisted widget suggestions
- Workspace templates

## File Inventory

```
src/lib/workspace-store.ts          # 15KB - Store + types + widget registry
src/components/DashboardCanvas.tsx  # 25KB - Grid canvas + widget renderer
src/components/CompanyTabs.tsx      # 14KB - Tab system + add widget modal
src/app/industry/page.tsx           # 8KB - Industry page with dashboard tab
src/app/company/[symbol]/page.tsx   # 0.4KB - Company page wrapper
src/components/CompanyTabs.tsx      # 14KB - Tab system (needs import fixes)
```

## Known Issues to Fix
1. CompanyTabs.tsx has duplicate imports at end of file
2. MetricCard import needs fixing (from ui/card)
3. IndustryDetail needs full implementation
4. WidgetContent needs real component implementations
5. Add widget to tab mapping in store