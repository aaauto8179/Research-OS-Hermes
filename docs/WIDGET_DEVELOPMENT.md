# Research OS - Widget Development Guide

> Complete guide for creating, registering, and integrating widgets in Research OS.

## 🎯 Widget System Overview

Research OS uses a **registry-based widget system** with lazy-loaded components. Each widget is an independent, reusable component that can be placed in any tab, resized, and repositioned.

### Widget Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      WIDGET SYSTEM                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  WidgetRegistry │    │  WidgetRenderer │                │
│  │  (Registry)     │───►│  (Renderer)     │                │
│  └────────┬────────┘    └────────┬────────┘                │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  WIDGET COMPONENTS                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │ DCF     │ │ Ratio   │ │ Beneish │ │ ...     │    │   │
│  │  │ Valuation│ │ Analysis│ │ M-Score │ │ (86)    │    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Creating a New Widget

### 1. Basic Widget Structure

```tsx
// src/components/widgets/MyWidget.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MyWidgetProps {
  symbol?: string;           // Company symbol (passed by CompanyTabs)
  // Add custom props here
  customParam?: string;
}

export default function MyWidget({ symbol, customParam }: MyWidgetProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Widget content */}
        <div className="space-y-4">
          <p>Symbol: {symbol || "N/A"}</p>
          <p>Custom Param: {customParam || "default"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Widget with Data Fetching

```tsx
// src/components/widgets/MyDataWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MyDataWidgetProps {
  symbol?: string;
}

interface ApiResponse {
  data: any;
  error?: string;
}

export default function MyDataWidget({ symbol }: MyDataWidgetProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_MATH_ENGINE_URL}/dcf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, ...defaultInputs })
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-destructive/50">
        <CardHeader className="text-destructive">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-3 w-3 mr-1" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>My Data Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {data && (
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Widget with Lifecycle States

```tsx
// src/components/widgets/AdvancedWidget.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type WidgetState = "loading" | "empty" | "error" | "zero-revenue" | "loss-making" | "pre-ipo" | "ready";

interface AdvancedWidgetProps {
  symbol?: string;
}

export default function AdvancedWidget({ symbol }: AdvancedWidgetProps) {
  const [state, setState] = useState<WidgetState>("loading");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!symbol) {
      setState("empty");
      return;
    }

    setState("loading");
    
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 500));
      const mockData = { revenue: 0, pe: null }; // Simulate zero revenue
      
      if (mockData.revenue === 0) {
        setState("zero-revenue");
      } else if (mockData.pe === null || mockData.pe < 0) {
        setState("loss-making");
      } else {
        setData(mockData);
        setState("ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState("error");
    }
  };

  useEffect(() => {
    fetchData();
  }, [symbol]);

  // Render based on state
  switch (state) {
    case "loading":
      return (
        <Card className="h-full">
          <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      );
    
    case "empty":
      return (
        <Card className="h-full">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <p className="text-center">No data available</p>
            <p className="text-xs text-center">Enter a symbol to load data</p>
          </CardContent>
        </Card>
      );
    
    case "error":
      return (
        <Card className="h-full border-destructive/50">
          <CardContent className="text-center text-destructive p-4">
            Error: {error}
          </CardContent>
        </Card>
      );
    
    case "zero-revenue":
      return (
        <Card className="h-full border-amber-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Pre-Revenue
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Company has zero revenue. Showing alternative metrics.
            </p>
          </CardContent>
        </Card>
      );
    
    case "loss-making":
      return (
        <Card className="h-full border-red-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive">Loss Making</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Negative P/E. Displaying EV/Sales instead.
            </p>
          </CardContent>
        </Card>
      );
    
    case "ready":
    default:
      return (
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Data Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
  }
}
```

---

## 📝 Registering a Widget

### 1. Add to WidgetRegistry

```tsx
// src/components/widgets/WidgetRegistry.tsx

// 1. Add lazy import
const MyWidget = dynamic(() => import("./MyWidget"), { 
  loading: () => <WidgetSkeleton /> 
});

// 2. Register in WIDGET_REGISTRY
export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
  // ... existing widgets
  "my-widget": MyWidget,
  "my-data-widget": MyDataWidget,
  "advanced-widget": AdvancedWidget,
};

// 3. Available widget types (for UI selectors)
export const AVAILABLE_WIDGET_TYPES = Object.keys(WIDGET_REGISTRY);
```

### 2. Widget Configuration Schema

```typescript
// src/lib/types.ts

export interface WidgetConfig {
  // Unique identifier (matches registry key)
  id: string;
  
  // Display name
  label: string;
  
  // Category for UI grouping
  category: "valuation" | "forensics" | "financials" | "management" | 
            "governance" | "risk" | "portfolio" | "macro" | 
            "industry" | "documents" | "tasks" | "ideas" | "utility";
  
  // Default props
  defaultProps?: Record<string, any>;
  
  // Minimum grid size
  minWidth?: number;
  minHeight?: number;
  
  // Default grid size
  defaultWidth?: number;
  defaultHeight?: number;
  
  // Whether widget accepts symbol prop
  acceptsSymbol?: boolean;
  
  // Whether widget needs auth (future)
  requiresAuth?: boolean;
  
  // Description for widget picker
  description?: string;
}

// Default widget configs
export const WIDGET_CONFIGS: Record<string, WidgetConfig> = {
  "dcf-valuation": {
    id: "dcf-valuation",
    label: "DCF Valuation",
    category: "valuation",
    acceptsSymbol: true,
    defaultWidth: 6,
    defaultHeight: 8,
    description: "DCF valuation with sensitivity matrix"
  },
  // ... more configs
};
```

---

## 🔌 Integrating with Company Page

### Company Page Structure

```tsx
// src/app/company/[symbol]/page.tsx
"use client";

import { Suspense } from "react";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";

const TAB_CONTENT: Record<string, string[]> = {
  overview: ["kpi-cards", "financial-charts", "valuation-summary", "risk-assessment"],
  story: ["financial-charts", "valuation-summary", "peer-comparison"],
  management: ["ownership-analysis", "catalyst-tracker", "concall-consistency"],
  // ... more tabs
};

function CompanyPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "overview";
  const widgets = TAB_CONTENT[tab] || TAB_CONTENT.overview;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {widgets.map((w, i) => (
        <div key={i} className="min-h-[300px]">
          <WidgetRenderer type={w} symbol={symbol} />
        </div>
      ))}
    </div>
  );
}
```

### Adding Widget to Tab

```typescript
// src/app/company/[symbol]/page.tsx

const TAB_CONTENT: Record<string, string[]> = {
  overview: [
    "kpi-cards", 
    "financial-charts", 
    "valuation-summary", 
    "risk-assessment",
    "company-info",      // Add new widget
    "my-custom-widget"   // Add custom widget
  ],
  valuation: [
    "valuation-summary",
    "dcf-valuation",
    "relative-valuation",
    "sotp-valuation",
    "banking-valuation",
    "excess-return-valuation",
    "valuation-philosophy",
    "exit-tool",
    "my-custom-widget"   // Also in valuation tab
  ],
  // ...
};
```

---

## 🎨 Widget Styling Guidelines

### Standard Card Layout

```tsx
<Card className="h-full flex flex-col">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm">Widget Title</CardTitle>
  </CardHeader>
  <CardContent className="flex-1 flex flex-col">
    {/* Content */}
  </CardContent>
</Card>
```

### Responsive Grid Sizes

```tsx
// Default sizes per widget type
const WIDGET_SIZES = {
  // Full width
  "dcf-valuation": { w: 12, h: 10 },
  "sotp-valuation": { w: 12, h: 10 },
  
  // Half width
  "dcf-valuation": { w: 6, h: 8 },
  "relative-valuation": { w: 6, h: 8 },
  "ratio-analysis": { w: 6, h: 8 },
  
  // Quarter width
  "kpi-cards": { w: 3, h: 4 },
  "risk-score": { w: 3, h: 4 },
}
```

### Tailwind Best Practices

```tsx
// Use CSS variables for theming
<div className="bg-card text-card-foreground border border-border">

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Proper spacing
<div className="space-y-4">
  <div className="p-4 bg-muted/50 rounded-lg">
  
// Typography
<h3 className="text-sm font-semibold text-muted-foreground">Label</h3>
<p className="text-lg font-bold tabular-nums">₹1,234.56</p>
<p className="text-xs text-green-600">+12.5%</p>
```

---

## 🔄 State Management

### Using Workspace Store

```typescript
// src/lib/workspace-store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  // Company context
  currentSymbol: string;
  
  // Dashboard layouts
  companyLayouts: Record<string, WidgetLayout[]>;
  industryLayouts: Record<string, WidgetLayout[]>;
  
  // Company tabs
  companyTabs: Record<string, TabConfig[]>;
  
  // Actions
  setSymbol: (symbol: string) => void;
  updateLayout: (context: string, key: string, layout: WidgetLayout[]) => void;
  addTab: (symbol: string, tab: TabConfig) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set) => ({
      currentSymbol: "RELIANCE",
      companyLayouts: {},
      industryLayouts: {},
      companyTabs: {},
      
      setSymbol: (symbol) => set((state) => {
        state.currentSymbol = symbol;
      }),
      
      updateLayout: (context, key, layout) => set((state) => {
        if (context === "company") {
          state.companyLayouts[key] = layout;
        } else {
          state.industryLayouts[key] = layout;
        }
      }),
    })),
    {
      name: "research-os-workspace",
      partialize: (state) => ({
        companyLayouts: state.companyLayouts,
        industryLayouts: state.industryLayouts,
        companyTabs: state.companyTabs,
      })
    }
  )
);
```

### Using Store in Widgets

```tsx
// In a widget component
import { useWorkspaceStore } from "@/lib/workspace-store";

export default function MyWidget({ symbol }: MyWidgetProps) {
  const { currentSymbol, updateLayout } = useWorkspaceStore();
  
  const effectiveSymbol = symbol || currentSymbol;
  
  // Save layout changes
  const handleLayoutChange = (layout: WidgetLayout[]) => {
    updateLayout("company", effectiveSymbol, layout);
  };
  
  return (
    <DashboardCanvas
      context="company"
      contextKey={effectiveSymbol}
      onLayoutChange={handleLayoutChange}
    />
  );
}
```

---

## 🧪 Testing Widgets

### Unit Test Example

```tsx
// src/components/widgets/__tests__/MyWidget.test.tsx
import { render, screen } from "@testing-library/react";
import { MyWidget } from "@/components/widgets/MyWidget";

describe("MyWidget", () => {
  it("renders with symbol", () => {
    render(<MyWidget symbol="RELIANCE" />);
    expect(screen.getByText("Symbol: RELIANCE")).toBeInTheDocument();
  });

  it("shows N/A when no symbol", () => {
    render(<MyWidget />);
    expect(screen.getByText("Symbol: N/A")).toBeInTheDocument();
  });
});
```

### Integration Test

```tsx
// src/components/widgets/__tests__/MyDataWidget.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { MyDataWidget } from "@/components/widgets/MyDataWidget";

jest.mock("@/lib/workspace-store", () => ({
  useWorkspaceStore: () => ({
    currentSymbol: "RELIANCE",
  }),
});

describe("MyDataWidget", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ revenue: 1000, pe: 15 }),
    });
  });

  it("fetches and displays data", async () => {
    render(<MyDataWidget symbol="RELIANCE" />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Revenue: 1000")).toBeInTheDocument();
    });
  });
});
```

---

## 📦 Best Practices

### Do's ✅

1. **Use TypeScript** - Strict typing for all props and state
2. **Lazy load widgets** - Use `dynamic()` import for code splitting
3. **Handle all states** - loading, empty, error, zero-revenue, loss-making
3. **Accept symbol prop** - For company context
4. **Use Card layout** - Consistent Card/CardHeader/CardContent structure
4. **TypeScript strict** - No `any`, explicit types
5. **Dataclasses for API** - Match Python engine schemas
6. **Handle errors gracefully** - Show retry button
7. **Accessibility** - ARIA labels, semantic HTML
8. **Responsive** - Mobile-first, grid layouts

### Don'ts ❌

1. **Don't use `any`** - Use proper types
2. **Don't hardcode symbols** - Always use `symbol` prop or store
3. **Don't skip loading states** - Always show skeleton
4. **Don't use inline styles** - Use Tailwind classes
5. **Don't mutate state directly** - Use Immer/Zustand setters
6. **Don't forget error boundaries** - Wrap in Suspense
7. **Don't hardcode API URLs** - Use env variables
8. **Don't skip tests** - Write tests for new widgets

---

## 📦 Widget Checklist

Before submitting a new widget:

- [ ] Component created in `src/components/widgets/`
- [ ] Registered in `WidgetRegistry.tsx`
- [ ] Added to `AVAILABLE_WIDGET_TYPES`
- [ ] Added to relevant tab in `src/app/company/[symbol]/page.tsx`
- [ ] Handles all 6 lifecycle states
- [ ] Accepts `symbol` prop
- [ ] Uses `Card` layout
- [ ] Handles loading/error/empty states
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Build passes (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Added to relevant tab in industry/page if applicable
- [ ] Documentation updated

---

## 📚 Examples

### Reference Widgets

| Widget | Location | Patterns |
|--------|----------|----------|
| `DCFValuation.tsx` | Data fetching, charts, sensitivity matrix |
| `RatioAnalysis.tsx` | Complex tables, DuPont, distress flags |
| `BeneishMScore.tsx` | Forensic components, gauges |
| `PortfolioAnalytics.tsx` | Charts, metrics, XIRR |
| `DocumentViewer.tsx` | File handling, status badges |
| `SmartSummarizer.tsx` | AI integration, citations |

---

## 📚 Resources

- [Radix UI](https://www.radix-ui.com/)
- [TanStack Table](https://tanstack.com/table)
- [Recharts](https://recharts.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [SWR](https://swr.vercel.app/)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Vitest](https://vitest.dev/)