import { create } from "zustand";
import { getWidgetDefinition } from "@/components/workstation/workstation-widget-catalog";

export interface TabConfig {
  id: string;
  label: string;
  isCustom?: boolean;
  order: number;
  widgetIds: string[];
  description?: string;
}

export interface WidgetLayoutItem {
  i: string; // widget instance ID
  type: string; // widget catalog type ID
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  props?: Record<string, any>;
}

export interface WorkstationState {
  symbol: string;
  activeTabId: string;
  tabs: TabConfig[];
  layouts: Record<string, WidgetLayoutItem[]>;
  isSaving: boolean;
  lastSaved: string | null;
  isLoaded: boolean;

  // Actions
  setSymbol: (symbol: string) => void;
  setTab: (id: string) => void;
  addTab: (label: string) => string;
  renameTab: (id: string, label: string) => void;
  removeTab: (id: string) => void;
  reorderTabs: (tabsOrIds: TabConfig[] | string[]) => void;
  addWidget: (tabId: string, widgetType: string, props?: Record<string, any>) => string;
  removeWidget: (tabId: string, instanceId: string) => void;
  updateLayout: (tabId: string, layoutItems: WidgetLayoutItem[]) => void;
  resetLayout: (tabId?: string) => void;
  loadLayout: (symbol?: string) => Promise<void>;
  saveLayout: () => Promise<void>;
}

export const DEFAULT_WORKSTATION_TABS: TabConfig[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Multi-year historical statements, KPI breakdown, and scenario overview",
    order: 0,
    isCustom: false,
    widgetIds: ["fs-overview", "kpi-overview", "sc-overview"],
  },
  {
    id: "financials",
    label: "Financial Statements",
    description: "Multi-year P&L, Balance Sheet, and Cash Flow in INR Crores with statutory citation audit drawer",
    order: 1,
    isCustom: false,
    widgetIds: ["fs-grid", "ratio-analysis", "common-size"],
  },
  {
    id: "scenarios",
    label: "Scenario Models",
    description: "Reactive 5-year simulation with dynamic trajectory curves and margin waterfall",
    order: 2,
    isCustom: false,
    widgetIds: ["sc-main", "trajectory-chart", "margin-bridge"],
  },
  {
    id: "valuation",
    label: "Valuation & Forensic",
    description: "DCF valuation, relative multiples, Altman Z, Beneish M, and Piotroski F scores",
    order: 3,
    isCustom: false,
    widgetIds: ["dcf-val", "rel-val", "altman-z", "piotroski-f"],
  },
];

export const DEFAULT_WORKSTATION_LAYOUTS: Record<string, WidgetLayoutItem[]> = {
  overview: [
    {
      i: "fs-overview",
      type: "financial-statements-workstation",
      x: 0,
      y: 0,
      w: 12,
      h: 8,
      minW: 6,
      minH: 4,
    },
    {
      i: "kpi-overview",
      type: "kpi-cards",
      x: 0,
      y: 8,
      w: 12,
      h: 3,
      minW: 6,
      minH: 2,
    },
    {
      i: "sc-overview",
      type: "scenario-workstation",
      x: 0,
      y: 11,
      w: 12,
      h: 8,
      minW: 6,
      minH: 4,
    },
  ],
  financials: [
    {
      i: "fs-grid",
      type: "financial-statements-workstation",
      x: 0,
      y: 0,
      w: 12,
      h: 8,
      minW: 6,
      minH: 4,
    },
    {
      i: "ratio-analysis",
      type: "ratio-analysis",
      x: 0,
      y: 8,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    },
    {
      i: "common-size",
      type: "common-size",
      x: 6,
      y: 8,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    },
  ],
  scenarios: [
    {
      i: "sc-main",
      type: "scenario-workstation",
      x: 0,
      y: 0,
      w: 12,
      h: 7,
      minW: 6,
      minH: 5,
    },
    {
      i: "trajectory-chart",
      type: "trajectory-chart",
      x: 0,
      y: 7,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
    },
    {
      i: "margin-bridge",
      type: "margin-bridge",
      x: 6,
      y: 7,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
    },
  ],
  valuation: [
    {
      i: "dcf-val",
      type: "dcf-valuation",
      x: 0,
      y: 0,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    },
    {
      i: "rel-val",
      type: "relative-valuation",
      x: 6,
      y: 0,
      w: 6,
      h: 6,
      minW: 4,
      minH: 4,
    },
    {
      i: "altman-z",
      type: "altman-z-score",
      x: 0,
      y: 6,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
    },
    {
      i: "piotroski-f",
      type: "piotroski-f-score",
      x: 6,
      y: 6,
      w: 6,
      h: 5,
      minW: 4,
      minH: 4,
    },
  ],
};

function cloneDefaults() {
  return {
    tabs: JSON.parse(JSON.stringify(DEFAULT_WORKSTATION_TABS)) as TabConfig[],
    layouts: JSON.parse(JSON.stringify(DEFAULT_WORKSTATION_LAYOUTS)) as Record<string, WidgetLayoutItem[]>,
  };
}

// Module-level debounce timer for persistence
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function notifySaveStatus(status: "saving" | "saved" | "local") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("antigravity:save-status", {
        detail: { status },
      })
    );
  }
}

function getCacheKey(symbol: string) {
  return `antigravity_workstation_layout_${symbol.toUpperCase()}`;
}

function writeToLocalStorage(symbol: string, data: { activeTabId: string; tabs: TabConfig[]; layouts: Record<string, WidgetLayoutItem[]> }) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getCacheKey(symbol), JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }
}

function readFromLocalStorage(symbol: string): { activeTabId?: string; tabs?: TabConfig[]; layouts?: Record<string, WidgetLayoutItem[]> } | null {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(getCacheKey(symbol));
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      return null;
    }
  }
  return null;
}

export const useWorkstationStore = create<WorkstationState>((set, get) => {
  const initial = cloneDefaults();

  const scheduleDebouncedSave = () => {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }

    notifySaveStatus("saving");
    set({ isSaving: true });

    saveDebounceTimer = setTimeout(() => {
      get().saveLayout();
    }, 500);
  };

  return {
    symbol: "RELIANCE",
    activeTabId: "overview",
    tabs: initial.tabs,
    layouts: initial.layouts,
    isSaving: false,
    lastSaved: null,
    isLoaded: false,

    setSymbol: (symbol: string) => {
      const clean = (symbol || "RELIANCE").toUpperCase();
      if (clean !== get().symbol) {
        set({ symbol: clean });
        get().loadLayout(clean);
      }
    },

    setTab: (id: string) => {
      const exists = get().tabs.some((t) => t.id === id);
      if (exists && id !== get().activeTabId) {
        set({ activeTabId: id });
        writeToLocalStorage(get().symbol, {
          activeTabId: id,
          tabs: get().tabs,
          layouts: get().layouts,
        });
        scheduleDebouncedSave();
      }
    },

    addTab: (label: string) => {
      const cleanLabel = (label || "").trim() || "Custom Thesis";
      const id = `custom-tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newOrder = get().tabs.length;

      const newTab: TabConfig = {
        id,
        label: cleanLabel,
        isCustom: true,
        order: newOrder,
        widgetIds: [],
        description: "Custom analyst research tab with configurable widgets and workbench notes",
      };

      const updatedTabs = [...get().tabs, newTab];
      const updatedLayouts = {
        ...get().layouts,
        [id]: [],
      };

      set({
        tabs: updatedTabs,
        layouts: updatedLayouts,
        activeTabId: id,
      });

      writeToLocalStorage(get().symbol, {
        activeTabId: id,
        tabs: updatedTabs,
        layouts: updatedLayouts,
      });

      scheduleDebouncedSave();
      return id;
    },

    renameTab: (id: string, label: string) => {
      const cleanLabel = (label || "").trim();
      if (!cleanLabel) return;

      const updatedTabs = get().tabs.map((tab) =>
        tab.id === id ? { ...tab, label: cleanLabel } : tab
      );

      set({ tabs: updatedTabs });

      writeToLocalStorage(get().symbol, {
        activeTabId: get().activeTabId,
        tabs: updatedTabs,
        layouts: get().layouts,
      });

      scheduleDebouncedSave();
    },

    removeTab: (id: string) => {
      const currentTabs = get().tabs;
      if (currentTabs.length <= 1) return; // Prevent deleting the last remaining tab

      const updatedTabs = currentTabs
        .filter((t) => t.id !== id)
        .map((t, idx) => ({ ...t, order: idx }));

      const updatedLayouts = { ...get().layouts };
      delete updatedLayouts[id];

      let newActiveTabId = get().activeTabId;
      if (newActiveTabId === id) {
        newActiveTabId = updatedTabs[0]?.id || "overview";
      }

      set({
        tabs: updatedTabs,
        layouts: updatedLayouts,
        activeTabId: newActiveTabId,
      });

      writeToLocalStorage(get().symbol, {
        activeTabId: newActiveTabId,
        tabs: updatedTabs,
        layouts: updatedLayouts,
      });

      scheduleDebouncedSave();
    },

    reorderTabs: (tabsOrIds: TabConfig[] | string[]) => {
      let reordered: TabConfig[];

      if (tabsOrIds.length > 0 && typeof tabsOrIds[0] === "string") {
        const idList = tabsOrIds as string[];
        const tabMap = new Map(get().tabs.map((t) => [t.id, t]));
        reordered = idList
          .map((id, idx) => {
            const tab = tabMap.get(id);
            return tab ? { ...tab, order: idx } : null;
          })
          .filter(Boolean) as TabConfig[];
      } else {
        reordered = (tabsOrIds as TabConfig[]).map((t, idx) => ({
          ...t,
          order: idx,
        }));
      }

      set({ tabs: reordered });

      writeToLocalStorage(get().symbol, {
        activeTabId: get().activeTabId,
        tabs: reordered,
        layouts: get().layouts,
      });

      scheduleDebouncedSave();
    },

    addWidget: (tabId: string, widgetType: string, props?: Record<string, any>) => {
      const def = getWidgetDefinition(widgetType);
      const dims = def?.defaultDimensions || { w: 6, h: 6, minW: 4, minH: 4 };

      const currentLayout = get().layouts[tabId] || [];
      const maxY = currentLayout.length > 0
        ? Math.max(...currentLayout.map((item) => (item.y || 0) + (item.h || 6)))
        : 0;

      const instanceId = `${widgetType}-${Date.now()}`;
      const newItem: WidgetLayoutItem = {
        i: instanceId,
        type: widgetType,
        x: 0,
        y: maxY,
        w: dims.w,
        h: dims.h,
        minW: dims.minW || 4,
        minH: dims.minH || 4,
        maxW: dims.maxW,
        maxH: dims.maxH,
        props: props || {},
      };

      const updatedLayout = [...currentLayout, newItem];
      const updatedLayouts = {
        ...get().layouts,
        [tabId]: updatedLayout,
      };

      const updatedTabs = get().tabs.map((tab) => {
        if (tab.id === tabId) {
          const wIds = tab.widgetIds || [];
          return {
            ...tab,
            widgetIds: wIds.includes(instanceId) ? wIds : [...wIds, instanceId],
          };
        }
        return tab;
      });

      set({
        layouts: updatedLayouts,
        tabs: updatedTabs,
      });

      writeToLocalStorage(get().symbol, {
        activeTabId: get().activeTabId,
        tabs: updatedTabs,
        layouts: updatedLayouts,
      });

      scheduleDebouncedSave();
      return instanceId;
    },

    removeWidget: (tabId: string, instanceId: string) => {
      const currentLayout = get().layouts[tabId] || [];
      const updatedLayout = currentLayout.filter((item) => item.i !== instanceId);

      const updatedLayouts = {
        ...get().layouts,
        [tabId]: updatedLayout,
      };

      const updatedTabs = get().tabs.map((tab) => {
        if (tab.id === tabId) {
          return {
            ...tab,
            widgetIds: (tab.widgetIds || []).filter((id) => id !== instanceId),
          };
        }
        return tab;
      });

      set({
        layouts: updatedLayouts,
        tabs: updatedTabs,
      });

      writeToLocalStorage(get().symbol, {
        activeTabId: get().activeTabId,
        tabs: updatedTabs,
        layouts: updatedLayouts,
      });

      scheduleDebouncedSave();
    },

    updateLayout: (tabId: string, layoutItems: WidgetLayoutItem[]) => {
      const currentLayout = get().layouts[tabId] || [];

      // Preserve existing type and props when react-grid-layout reports updated x/y/w/h
      const updatedLayout = layoutItems.map((item) => {
        const existing = currentLayout.find((e) => e.i === item.i);
        return {
          ...item,
          type: item.type || existing?.type || item.i,
          props: item.props || existing?.props || {},
          minW: item.minW || existing?.minW,
          minH: item.minH || existing?.minH,
        };
      });

      const updatedLayouts = {
        ...get().layouts,
        [tabId]: updatedLayout,
      };

      set({ layouts: updatedLayouts });

      writeToLocalStorage(get().symbol, {
        activeTabId: get().activeTabId,
        tabs: get().tabs,
        layouts: updatedLayouts,
      });

      scheduleDebouncedSave();
    },

    resetLayout: (tabId?: string) => {
      const defaults = cloneDefaults();

      if (tabId && defaults.layouts[tabId]) {
        // Reset specific tab
        const updatedLayouts = {
          ...get().layouts,
          [tabId]: defaults.layouts[tabId],
        };
        set({ layouts: updatedLayouts });
        writeToLocalStorage(get().symbol, {
          activeTabId: get().activeTabId,
          tabs: get().tabs,
          layouts: updatedLayouts,
        });
      } else {
        // Full workstation reset
        set({
          tabs: defaults.tabs,
          layouts: defaults.layouts,
          activeTabId: "overview",
        });
        writeToLocalStorage(get().symbol, {
          activeTabId: "overview",
          tabs: defaults.tabs,
          layouts: defaults.layouts,
        });
      }

      scheduleDebouncedSave();
    },

    loadLayout: async (targetSymbol?: string) => {
      const sym = (targetSymbol || get().symbol || "RELIANCE").toUpperCase();

      // 1. Immediately apply cached layout from localStorage if present
      const cached = readFromLocalStorage(sym);
      if (cached?.tabs && cached?.layouts) {
        set({
          symbol: sym,
          tabs: cached.tabs,
          layouts: cached.layouts,
          activeTabId: cached.activeTabId || "overview",
          isLoaded: true,
        });
      }

      // 2. Fetch latest persisted layout from BFF API
      try {
        const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
        const response = await fetch(`${baseUrl}/api/workstation/layout/${sym}?user_id=default_user`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (response.ok) {
          const json = await response.json();
          const remoteData = json.data;

          if (remoteData && remoteData.tabs && Array.isArray(remoteData.tabs) && remoteData.tabs.length > 0) {
            set({
              symbol: sym,
              activeTabId: remoteData.active_tab_id || get().activeTabId || "overview",
              tabs: remoteData.tabs,
              layouts: remoteData.layouts || get().layouts,
              isLoaded: true,
              lastSaved: remoteData.updated_at || new Date().toISOString(),
            });

            writeToLocalStorage(sym, {
              activeTabId: remoteData.active_tab_id || "overview",
              tabs: remoteData.tabs,
              layouts: remoteData.layouts || {},
            });

            notifySaveStatus("saved");
            return;
          }
        }
      } catch (err) {
        // Gracefully use local cache when offline or API is unavailable
        console.warn(`[useWorkstationStore] Offline or layout fetch error for ${sym}:`, err);
      }

      set({ isLoaded: true });
      notifySaveStatus("local");
    },

    saveLayout: async () => {
      const state = get();
      const sym = state.symbol.toUpperCase();

      try {
        const payload = {
          symbol: sym,
          active_tab_id: state.activeTabId,
          tabs: state.tabs,
          layouts: state.layouts,
          user_id: "default_user",
        };

        const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
        const res = await fetch(`${baseUrl}/api/workstation/layout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const now = new Date().toISOString();
          set({ isSaving: false, lastSaved: now });
          notifySaveStatus("saved");
        } else {
          set({ isSaving: false });
          notifySaveStatus("local");
        }
      } catch (err) {
        console.warn("[useWorkstationStore] Save to backend failed, cached in localStorage:", err);
        set({ isSaving: false });
        notifySaveStatus("local");
      }
    },
  };
});
