import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  useWorkstationStore,
  DEFAULT_WORKSTATION_TABS,
  DEFAULT_WORKSTATION_LAYOUTS,
} from "../src/lib/workstation-store";
import {
  WIDGET_CATALOG,
  WIDGET_CATEGORIES,
  getWidgetDefinition,
  getWidgetsByCategory,
} from "../src/components/workstation/workstation-widget-catalog";

describe("Antigravity Workstation — Layout & Store Architecture (M3)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    useWorkstationStore.getState().resetLayout();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("1. Workstation Widget Catalog", () => {
    it("contains exactly 24 institutional research widgets", () => {
      expect(WIDGET_CATALOG).toHaveLength(24);
    });

    it("covers all 5 distinct research categories", () => {
      const categories = WIDGET_CATEGORIES.map((c) => c.id);
      expect(categories).toEqual(["data", "scenarios", "valuation", "forensic", "qualitative"]);

      const dataWidgets = getWidgetsByCategory("data");
      const scenarioWidgets = getWidgetsByCategory("scenarios");
      const valuationWidgets = getWidgetsByCategory("valuation");
      const forensicWidgets = getWidgetsByCategory("forensic");
      const qualitativeWidgets = getWidgetsByCategory("qualitative");

      expect(dataWidgets).toHaveLength(6);
      expect(scenarioWidgets).toHaveLength(6);
      expect(valuationWidgets).toHaveLength(6);
      expect(forensicWidgets).toHaveLength(4);
      expect(qualitativeWidgets).toHaveLength(2);
      expect(
        dataWidgets.length +
        scenarioWidgets.length +
        valuationWidgets.length +
        forensicWidgets.length +
        qualitativeWidgets.length
      ).toBe(24);
    });

    it("verifies every widget has complete metadata and valid grid dimensions", () => {
      WIDGET_CATALOG.forEach((widget) => {
        expect(widget.id).toBeTruthy();
        expect(widget.name).toBeTruthy();
        expect(widget.description).toBeTruthy();
        expect(widget.icon).toBeTruthy();
        expect(widget.tags.length).toBeGreaterThan(0);
        expect(widget.defaultDimensions.w).toBeGreaterThan(0);
        expect(widget.defaultDimensions.h).toBeGreaterThan(0);
        expect(widget.defaultDimensions.minW).toBeGreaterThan(0);
        expect(widget.defaultDimensions.minH).toBeGreaterThan(0);
        expect(widget.defaultDimensions.w).toBeLessThanOrEqual(12);
      });
    });

    it("verifies getWidgetDefinition lookup helper", () => {
      const fsWidget = getWidgetDefinition("financial-statements-workstation");
      expect(fsWidget).toBeDefined();
      expect(fsWidget?.name).toBe("Financial Statements Grid");
      expect(fsWidget?.defaultDimensions.w).toBe(12);
      expect(fsWidget?.defaultDimensions.h).toBe(8);

      const dcfWidget = getWidgetDefinition("dcf-valuation");
      expect(dcfWidget).toBeDefined();
      expect(dcfWidget?.category).toBe("valuation");

      const unknown = getWidgetDefinition("non-existent-widget");
      expect(unknown).toBeUndefined();
    });
  });

  describe("2. Workstation Store Initial State", () => {
    it("initializes with 4 default tabs in correct order", () => {
      const state = useWorkstationStore.getState();
      expect(state.tabs).toHaveLength(4);
      expect(state.tabs.map((t) => t.id)).toEqual([
        "overview",
        "financials",
        "scenarios",
        "valuation",
      ]);
      expect(state.activeTabId).toBe("overview");
      expect(state.tabs[0].order).toBe(0);
      expect(state.tabs[1].order).toBe(1);
    });

    it("initializes default layouts for all 4 tabs", () => {
      const state = useWorkstationStore.getState();
      expect(state.layouts.overview).toBeDefined();
      expect(state.layouts.financials).toBeDefined();
      expect(state.layouts.scenarios).toBeDefined();
      expect(state.layouts.valuation).toBeDefined();

      expect(state.layouts.overview.length).toBeGreaterThan(0);
      expect(state.layouts.financials.length).toBeGreaterThan(0);
    });
  });

  describe("3. Tab Operations", () => {
    it("switches active tab via setTab", () => {
      const store = useWorkstationStore.getState();
      store.setTab("financials");
      expect(useWorkstationStore.getState().activeTabId).toBe("financials");

      store.setTab("scenarios");
      expect(useWorkstationStore.getState().activeTabId).toBe("scenarios");

      // Invalid tab ID should be ignored
      store.setTab("non-existent-tab");
      expect(useWorkstationStore.getState().activeTabId).toBe("scenarios");
    });

    it("adds a new custom research tab via addTab and switches to it", () => {
      const store = useWorkstationStore.getState();
      const initialCount = store.tabs.length;

      const newId = store.addTab("Q3 Earnings Analysis");
      const updated = useWorkstationStore.getState();

      expect(updated.tabs).toHaveLength(initialCount + 1);
      const addedTab = updated.tabs.find((t) => t.id === newId);
      expect(addedTab).toBeDefined();
      expect(addedTab?.label).toBe("Q3 Earnings Analysis");
      expect(addedTab?.isCustom).toBe(true);
      expect(addedTab?.order).toBe(initialCount);
      expect(updated.activeTabId).toBe(newId);
      expect(updated.layouts[newId]).toEqual([]);
    });

    it("renames an existing tab via renameTab", () => {
      const store = useWorkstationStore.getState();
      store.renameTab("overview", "Executive Overview & P&L");

      const tab = useWorkstationStore.getState().tabs.find((t) => t.id === "overview");
      expect(tab?.label).toBe("Executive Overview & P&L");

      // Empty names should be ignored
      store.renameTab("overview", "   ");
      const tabAfterEmpty = useWorkstationStore.getState().tabs.find((t) => t.id === "overview");
      expect(tabAfterEmpty?.label).toBe("Executive Overview & P&L");
    });

    it("removes a tab and handles activeTab fallback", () => {
      const store = useWorkstationStore.getState();
      const newTabId = store.addTab("Temporary Tab");
      expect(useWorkstationStore.getState().activeTabId).toBe(newTabId);

      // Remove the currently active tab
      store.removeTab(newTabId);
      const updated = useWorkstationStore.getState();

      expect(updated.tabs.some((t) => t.id === newTabId)).toBe(false);
      expect(updated.layouts[newTabId]).toBeUndefined();
      // Should fallback to first available tab
      expect(updated.activeTabId).toBe("overview");
    });

    it("prevents removing the last remaining tab", () => {
      const store = useWorkstationStore.getState();
      store.removeTab("valuation");
      store.removeTab("scenarios");
      store.removeTab("financials");

      expect(useWorkstationStore.getState().tabs).toHaveLength(1);
      // Attempt to remove the final tab
      store.removeTab("overview");
      expect(useWorkstationStore.getState().tabs).toHaveLength(1);
    });

    it("reorders tabs via reorderTabs with updated order index", () => {
      const store = useWorkstationStore.getState();
      const newOrderIds = ["scenarios", "overview", "valuation", "financials"];

      store.reorderTabs(newOrderIds);
      const updated = useWorkstationStore.getState();

      expect(updated.tabs.map((t) => t.id)).toEqual(newOrderIds);
      expect(updated.tabs[0].order).toBe(0);
      expect(updated.tabs[1].order).toBe(1);
      expect(updated.tabs[2].order).toBe(2);
      expect(updated.tabs[3].order).toBe(3);
    });
  });

  describe("4. Widget Operations", () => {
    it("adds a widget to a tab layout with default dimensions from catalog", () => {
      const store = useWorkstationStore.getState();
      const initialWidgets = store.layouts.overview?.length || 0;

      const instanceId = store.addWidget("overview", "altman-z-score");
      const updated = useWorkstationStore.getState();

      const overviewLayout = updated.layouts.overview;
      expect(overviewLayout).toHaveLength(initialWidgets + 1);

      const added = overviewLayout.find((item) => item.i === instanceId);
      expect(added).toBeDefined();
      expect(added?.type).toBe("altman-z-score");
      expect(added?.w).toBe(6);
      expect(added?.h).toBe(5);

      const overviewTab = updated.tabs.find((t) => t.id === "overview");
      expect(overviewTab?.widgetIds).toContain(instanceId);
    });

    it("removes a widget from tab layout and tab widgetIds", () => {
      const store = useWorkstationStore.getState();
      const instanceId = store.addWidget("financials", "reverse-dcf");
      expect(useWorkstationStore.getState().layouts.financials.some((i) => i.i === instanceId)).toBe(true);

      store.removeWidget("financials", instanceId);
      const updated = useWorkstationStore.getState();

      expect(updated.layouts.financials.some((i) => i.i === instanceId)).toBe(false);
      const finTab = updated.tabs.find((t) => t.id === "financials");
      expect(finTab?.widgetIds.includes(instanceId)).toBe(false);
    });

    it("updates layout item positions while preserving type and props", () => {
      const store = useWorkstationStore.getState();
      const currentOverview = store.layouts.overview;
      const targetItem = currentOverview[0];

      const modifiedLayout = currentOverview.map((item) =>
        item.i === targetItem.i ? { ...item, x: 2, y: 15, w: 10, h: 9 } : item
      );

      store.updateLayout("overview", modifiedLayout);
      const updatedOverview = useWorkstationStore.getState().layouts.overview;
      const updatedItem = updatedOverview.find((i) => i.i === targetItem.i);

      expect(updatedItem?.x).toBe(2);
      expect(updatedItem?.y).toBe(15);
      expect(updatedItem?.w).toBe(10);
      expect(updatedItem?.h).toBe(9);
      expect(updatedItem?.type).toBe(targetItem.type);
    });

    it("resets tab layout to default arrangement", () => {
      const store = useWorkstationStore.getState();
      store.addWidget("financials", "banking-valuation");
      expect(useWorkstationStore.getState().layouts.financials.length).toBeGreaterThan(
        DEFAULT_WORKSTATION_LAYOUTS.financials.length
      );

      store.resetLayout("financials");
      expect(useWorkstationStore.getState().layouts.financials).toEqual(
        DEFAULT_WORKSTATION_LAYOUTS.financials
      );
    });

    it("resets entire workstation to default tabs and layouts", () => {
      const store = useWorkstationStore.getState();
      store.addTab("Custom Tab A");
      store.addTab("Custom Tab B");
      expect(useWorkstationStore.getState().tabs.length).toBe(6);

      store.resetLayout();
      const reset = useWorkstationStore.getState();
      expect(reset.tabs).toHaveLength(4);
      expect(reset.activeTabId).toBe("overview");
      expect(reset.layouts.overview).toEqual(DEFAULT_WORKSTATION_LAYOUTS.overview);
    });
  });

  describe("5. Backend Persistence & Offline Fallback", () => {
    it("successfully persists layout changes via saveLayout", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: "success",
          data: { symbol: "TCS", updated_at: "2026-11-05T08:30:00Z" },
        }),
      });
      globalThis.fetch = mockFetch;

      const store = useWorkstationStore.getState();
      store.setSymbol("TCS");
      await store.saveLayout();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/workstation/layout"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Content-Type": "application/json" }),
          body: expect.stringContaining('"symbol":"TCS"'),
        })
      );

      const state = useWorkstationStore.getState();
      expect(state.isSaving).toBe(false);
      expect(state.lastSaved).toBeTruthy();
    });

    it("handles backend save errors gracefully without crashing store state", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network Error"));
      globalThis.fetch = mockFetch;

      const store = useWorkstationStore.getState();
      await store.saveLayout();

      const state = useWorkstationStore.getState();
      expect(state.isSaving).toBe(false);
    });

    it("loads remote layout and updates store state via loadLayout", async () => {
      const remoteTabs = [
        { id: "custom-1", label: "Remote Tab", order: 0, widgetIds: ["w-1"], isCustom: true },
      ];
      const remoteLayouts = {
        "custom-1": [{ i: "w-1", type: "dcf-valuation", x: 0, y: 0, w: 12, h: 6 }],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: "success",
          data: {
            active_tab_id: "custom-1",
            tabs: remoteTabs,
            layouts: remoteLayouts,
            updated_at: "2026-11-05T08:35:00Z",
          },
        }),
      });
      globalThis.fetch = mockFetch;

      const store = useWorkstationStore.getState();
      await store.loadLayout("INFY");

      const state = useWorkstationStore.getState();
      expect(state.symbol).toBe("INFY");
      expect(state.activeTabId).toBe("custom-1");
      expect(state.tabs).toEqual(remoteTabs);
      expect(state.layouts["custom-1"]).toEqual(remoteLayouts["custom-1"]);
      expect(state.isLoaded).toBe(true);
    });

    it("handles tab reordering using full TabConfig objects", () => {
      const store = useWorkstationStore.getState();
      const reversedTabs = [...store.tabs].reverse();

      store.reorderTabs(reversedTabs);
      const state = useWorkstationStore.getState();

      expect(state.tabs[0].id).toBe(reversedTabs[0].id);
      expect(state.tabs[0].order).toBe(0);
      expect(state.tabs[1].order).toBe(1);
    });

    it("stacks sequential widgets vertically calculating maxY correctly", () => {
      const store = useWorkstationStore.getState();
      const tabId = store.addTab("Stack Test Tab");

      const w1 = store.addWidget(tabId, "financial-statements-workstation"); // h: 8
      const w2 = store.addWidget(tabId, "scenario-workstation"); // h: 8

      const layout = useWorkstationStore.getState().layouts[tabId];
      const item1 = layout.find((i) => i.i === w1);
      const item2 = layout.find((i) => i.i === w2);

      expect(item1?.y).toBe(0);
      expect(item2?.y).toBe(8); // Placed at maxY (0 + 8)
    });

    it("normalizes symbol casing to uppercase in setSymbol", () => {
      const store = useWorkstationStore.getState();
      store.setSymbol("hdbank");
      expect(useWorkstationStore.getState().symbol).toBe("HDBANK");
    });

    it("retains active tab when a non-active tab is removed", () => {
      const store = useWorkstationStore.getState();
      store.setTab("financials");
      expect(useWorkstationStore.getState().activeTabId).toBe("financials");

      store.removeTab("valuation");
      expect(useWorkstationStore.getState().activeTabId).toBe("financials");
    });
  });
});
