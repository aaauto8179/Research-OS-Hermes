import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Ensure React is available globally for components imported without explicit React import
(globalThis as any).React = React;

// Mock Radix Dialog primitives so they render inline without DOM/document dependencies in Node
vi.mock("@radix-ui/react-dialog", async () => {
  return {
    Root: ({ children, open }: any) => (open ? React.createElement("div", { "data-testid": "dialog-root" }, children) : null),
    Portal: ({ children }: any) => React.createElement("div", { "data-testid": "dialog-portal-root" }, children),
    Overlay: ({ children, className }: any) => React.createElement("div", { className }, children),
    Content: ({ children, className, "data-testid": testId }: any) =>
      React.createElement("div", { className, "data-testid": testId || "dialog-content" }, children),
    Title: ({ children, className }: any) => React.createElement("h2", { className }, children),
    Description: ({ children, className }: any) => React.createElement("p", { className }, children),
    Close: ({ children }: any) => children,
  };
});

import { WorkbenchCard } from "@/components/workstation/WorkbenchCard";
import {
  FinancialStatementsWorkstationAdapter,
  IncomeStatementAdapter,
  BalanceSheetAdapter,
  CashFlowAdapter,
} from "@/components/workstation/widgets/FinancialStatementsAdapter";
import {
  ScenarioWorkstationAdapter,
  TrajectoryChartAdapter,
  MarginBridgeChartAdapter,
  SegmentProjectionsAdapter,
  ScenarioControlsAdapter,
  DriverInputsAdapter,
} from "@/components/workstation/widgets/ScenarioAdapters";
import {
  DupontAnalysis,
} from "@/components/workstation/widgets/DupontAnalysis";
import {
  DCFValuationAdapter,
  DupontAnalysisAdapter,
  AltmanZScoreAdapter,
  PiotroskiFScoreAdapter,
  SOTPValuationAdapter,
  RelativeValuationAdapter,
  ReverseDCFAdapter,
  PeerComparisonAdapter,
} from "@/components/workstation/widgets/MathEngineAdapters";
import {
  StandaloneNotesAdapter,
  AttachmentHubAdapter,
} from "@/components/workstation/widgets/QualitativeAdapters";
import { WorkstationWidgetRenderer } from "@/components/workstation/widgets/WorkstationWidgetRenderer";
import { SourceOfTruthDrawer, SelectedCellInfo } from "@/components/financials/SourceOfTruthDrawer";
import { useScenarioStore } from "@/lib/scenario-store";
import { getSampleStatementData } from "@/data/sample-statements";

// Mock localStorage for Vitest Node environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

describe("Ground-Up Data Integration (Milestone 5) Test Suite", () => {
  let mockStorage: LocalStorageMock;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = new LocalStorageMock();
    (globalThis as any).localStorage = mockStorage;
    (globalThis as any).React = React;
    if (typeof window === "undefined") {
      (globalThis as any).window = { localStorage: mockStorage, React };
    } else {
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
      });
      (window as any).React = React;
    }

    // Default mock fetch for notes, attachments, or math engine endpoints
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ status: "success", data: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    // Reset Scenario store to default base state
    useScenarioStore.getState().resetToDefaults();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ─────────────────────────────────────────────────────────────
  // 1. FINANCIAL STATEMENTS & SOURCE-OF-TRUTH DRAWER
  // ─────────────────────────────────────────────────────────────
  describe("1. Financial Statements Workstation & INR Crores Integration (R2.1)", () => {
    it("renders FinancialStatementsWorkstation inside WorkbenchCard with INR Crores format", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          { cardId: "card-fs-1", symbol: "RELIANCE", title: "Financial Statements Grid", category: "data" },
          React.createElement(FinancialStatementsWorkstationAdapter, { symbol: "RELIANCE" })
        )
      );

      // Verify Card container structure
      expect(html).toContain("Financial Statements Grid");
      expect(html).toContain("RELIANCE");
      expect(html).toContain('data-card-id="card-fs-1"');

      // Verify INR Crores header and line item display
      expect(html).toContain("₹ in Cr");
      expect(html).toContain("Revenue from Operations");
      expect(html).toContain("EBITDA");
      expect(html).toContain("Net Profit (PAT)");
      expect(html).toContain('data-testid="financial-statements-workstation-widget"');
    });

    it("renders atomic statement widgets (P&L, Balance Sheet, Cash Flow) with sticky headers and search", () => {
      const plHtml = renderToStaticMarkup(React.createElement(IncomeStatementAdapter, { symbol: "RELIANCE" }));
      expect(plHtml).toContain('data-testid="atomic-statement-pl"');
      expect(plHtml).toContain("Profit &amp; Loss Statement");
      expect(plHtml).toContain("Revenue from Operations");
      expect(plHtml).toContain('data-testid="search-pl"');

      const bsHtml = renderToStaticMarkup(React.createElement(BalanceSheetAdapter, { symbol: "RELIANCE" }));
      expect(bsHtml).toContain('data-testid="atomic-statement-bs"');
      expect(bsHtml).toContain("Balance Sheet");
      expect(bsHtml).toContain("Equity Share Capital");
      expect(bsHtml).toContain("Total Shareholders Equity (Net Worth)");

      const cfHtml = renderToStaticMarkup(React.createElement(CashFlowAdapter, { symbol: "RELIANCE" }));
      expect(cfHtml).toContain('data-testid="atomic-statement-cf"');
      expect(cfHtml).toContain("Cash Flow Statement");
      expect(cfHtml).toContain("Cash Flow from Operating Activities (CFO)");
    });

    it("renders Source-of-Truth citation indicators for verified metrics", () => {
      const companyData = getSampleStatementData("RELIANCE");
      const plItemWithCitation = companyData.statements.PL.find((i) => i.periods["FY24"]?.citation);
      expect(plItemWithCitation).toBeDefined();

      const html = renderToStaticMarkup(React.createElement(IncomeStatementAdapter, { symbol: "RELIANCE" }));
      // Should contain citation tooltip text
      expect(html).toContain("Source-of-Truth filing citation attached. Click to view.");
    });

    it("renders interactive SourceOfTruthDrawer with statutory filing citation details upon cell selection", () => {
      const sampleCell: SelectedCellInfo = {
        metricKey: "REV_OPERATIONS",
        displayName: "Revenue from Operations",
        category: "Income",
        period: "FY24",
        cellData: {
          value: 901064,
          unit: "INR_CRORE",
          citation: {
            citationId: "cit-rel-1",
            documentId: "doc-rel-1",
            documentTitle: "Integrated Annual Report 2023-24",
            docType: "ANNUAL_REPORT",
            source: "BSE",
            filingDate: "2024-08-07",
            fiscalPeriod: "FY2024",
            pageNumber: 342,
            noteReference: "Note 28: Revenue from Operations",
            extractedSnippet: {
              textPassage: "Revenue from operations for the year ended March 31, 2024 stood at ₹9,01,064 crore.",
            },
            confidence: 0.99,
            verifiedStatus: "VERIFIED",
          },
        },
      };

      const html = renderToStaticMarkup(
        React.createElement(SourceOfTruthDrawer, {
          isOpen: true,
          onClose: () => {},
          selectedCell: sampleCell,
          companySymbol: "RELIANCE",
          companyName: "Reliance Industries Limited",
        })
      );

      // Verify drawer contents
      expect(html).toContain("Source of Truth Citation");
      expect(html).toContain("Ground-truth audit trail for RELIANCE • FY24");
      expect(html).toContain("Integrated Annual Report 2023-24");
      expect(html).toContain("Note 28: Revenue from Operations");
      expect(html).toContain("Page 342");
      expect(html).toContain("Revenue from operations for the year ended March 31, 2024 stood at ₹9,01,064 crore.");
      expect(html).toContain("99% match");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SCENARIO PROJECTIONS & DYNAMIC VISUALIZATIONS
  // ─────────────────────────────────────────────────────────────
  describe("2. Reactive Scenario Projections & Visualizations (R2.2)", () => {
    it("renders ScenarioWorkstation inside WorkbenchCard with reactive scenario indicators", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          { cardId: "card-sc-1", symbol: "RELIANCE", title: "Scenario Workstation", category: "scenarios" },
          React.createElement(ScenarioWorkstationAdapter, { symbol: "RELIANCE" })
        )
      );

      expect(html).toContain("Scenario Workstation");
      expect(html).toContain("base Case Active");
      expect(html).toContain("FY25E Revenue");
      expect(html).toContain("FY25E EBITDA");
      expect(html).toContain('data-testid="scenario-workstation-widget"');
    });

    it("synchronizes scenario parameters and projection outputs reactively when case changes", () => {
      const store = useScenarioStore.getState();
      expect(store.activeScenario).toBe("base");
      const baseRevFY25 = store.outputs.base.projectedYears[0].revenue;

      // Switch to bull scenario
      store.setActiveScenario("bull");
      expect(useScenarioStore.getState().activeScenario).toBe("bull");
      const bullRevFY25 = useScenarioStore.getState().outputs.bull.projectedYears[0].revenue;

      // Bull case growth (15%) produces higher revenue than base case (10%)
      expect(bullRevFY25).toBeGreaterThan(baseRevFY25);

      // Switch to bear scenario
      store.setActiveScenario("bear");
      expect(useScenarioStore.getState().activeScenario).toBe("bear");
      const bearRevFY25 = useScenarioStore.getState().outputs.bear.projectedYears[0].revenue;

      // Bear case produces lower revenue than base case
      expect(bearRevFY25).toBeLessThan(baseRevFY25);
    });

    it("renders atomic TrajectoryChartAdapter with case switcher and chart container", () => {
      const html = renderToStaticMarkup(React.createElement(TrajectoryChartAdapter, { symbol: "RELIANCE" }));

      expect(html).toContain('data-testid="trajectory-chart-widget"');
      expect(html).toContain("Revenue Trajectory Bands");
      expect(html).toContain('data-testid="scenario-case-switcher"');
      expect(html).toContain('data-testid="case-button-base"');
      expect(html).toContain('data-testid="case-button-bull"');
      expect(html).toContain('data-testid="case-button-bear"');
    });

    it("renders atomic MarginBridgeChartAdapter with waterfall container", () => {
      const html = renderToStaticMarkup(React.createElement(MarginBridgeChartAdapter, { symbol: "RELIANCE" }));

      expect(html).toContain('data-testid="margin-bridge-widget"');
      expect(html).toContain("Margin Bridge Waterfall");
      expect(html).toContain('data-testid="scenario-case-switcher"');
      expect(html).toContain("Operating &amp; Free Cash Flow Margin Trajectories");
      expect(html).toContain("Margins (%)");
      expect(html).toContain("Cash Flow Bridge");
    });

    it("renders atomic SegmentProjectionsAdapter with division-level projection inputs", () => {
      const html = renderToStaticMarkup(React.createElement(SegmentProjectionsAdapter, { symbol: "RELIANCE" }));

      expect(html).toContain('data-testid="segment-projections-widget"');
      expect(html).toContain("Segment Projections Table");
      expect(html).toContain("Oil to Chemicals (O2C)");
      expect(html).toContain("Consumer Retail (Reliance Retail)");
      expect(html).toContain("Digital Services (Jio Infocomm)");
    });

    it("renders atomic ScenarioControls and DriverInputs adapters", () => {
      const controlsHtml = renderToStaticMarkup(React.createElement(ScenarioControlsAdapter, { symbol: "RELIANCE" }));
      expect(controlsHtml).toContain('data-testid="scenario-controls-widget"');
      expect(controlsHtml).toContain("Base Case");
      expect(controlsHtml).toContain("Bull Case");
      expect(controlsHtml).toContain("Bear Case");
      expect(controlsHtml).toContain("Segment Driven");

      const driversHtml = renderToStaticMarkup(React.createElement(DriverInputsAdapter, { symbol: "RELIANCE" }));
      expect(driversHtml).toContain('data-testid="driver-inputs-widget"');
      expect(driversHtml).toContain("Revenue CAGR");
      expect(driversHtml).toContain("Volume Growth");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. MATH ENGINES & VALUATION ADAPTERS
  // ─────────────────────────────────────────────────────────────
  describe("3. Math Engines & Valuation Model Adapters (R2.3)", () => {
    it("renders DCF Valuation adapter inside WorkbenchCard", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          { cardId: "card-dcf-1", symbol: "RELIANCE", title: "DCF Valuation", category: "valuation" },
          React.createElement(DCFValuationAdapter, { symbol: "RELIANCE" })
        )
      );

      expect(html).toContain("DCF Valuation");
      expect(html).toContain('data-testid="dcf-valuation-widget"');
    });

    it("renders institutional DupontAnalysis with 3-stage and 5-stage models and multi-year progression", () => {
      const html = renderToStaticMarkup(React.createElement(DupontAnalysis, { symbol: "RELIANCE" }));

      expect(html).toContain('data-testid="dupont-analysis-widget"');
      expect(html).toContain("DuPont Analysis — Reliance Industries Limited");
      expect(html).toContain('data-testid="dupont-3stage-btn"');
      expect(html).toContain('data-testid="dupont-5stage-btn"');
      expect(html).toContain("Net Profit Margin");
      expect(html).toContain("Asset Turnover");
      expect(html).toContain("Financial Leverage");
      expect(html).toContain('data-testid="dupont-roe-value"');
      expect(html).toContain("Multi-Year Historical DuPont Progression");
      expect(html).toContain('data-testid="dupont-progression-table"');
    });

    it("renders Altman Z-Score and Piotroski F-Score forensic adapters", () => {
      const altmanHtml = renderToStaticMarkup(React.createElement(AltmanZScoreAdapter, { symbol: "RELIANCE" }));
      expect(altmanHtml).toContain('data-testid="altman-z-score-widget"');

      const piotroskiHtml = renderToStaticMarkup(React.createElement(PiotroskiFScoreAdapter, { symbol: "RELIANCE" }));
      expect(piotroskiHtml).toContain('data-testid="piotroski-f-score-widget"');
    });

    it("renders SOTP, Relative Comps, Reverse DCF, and Peer Comparison adapters", () => {
      const sotpHtml = renderToStaticMarkup(React.createElement(SOTPValuationAdapter, { symbol: "RELIANCE" }));
      expect(sotpHtml).toContain('data-testid="sotp-valuation-widget"');

      const relativeHtml = renderToStaticMarkup(React.createElement(RelativeValuationAdapter, { symbol: "RELIANCE" }));
      expect(relativeHtml).toContain('data-testid="relative-valuation-widget"');

      const reverseHtml = renderToStaticMarkup(React.createElement(ReverseDCFAdapter, { symbol: "RELIANCE" }));
      expect(reverseHtml).toContain('data-testid="reverse-dcf-widget"');

      const peerHtml = renderToStaticMarkup(React.createElement(PeerComparisonAdapter, { symbol: "RELIANCE" }));
      expect(peerHtml).toContain('data-testid="peer-comparison-widget"');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. DEDICATED QUALITATIVE RESEARCH & ATTACHMENT HUBS
  // ─────────────────────────────────────────────────────────────
  describe("4. Dedicated Qualitative Notes & Attachment Hub Adapters (R4)", () => {
    it("renders StandaloneNotesAdapter with full-height qualitative editor and preset tags", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          { cardId: "notes-card-1", symbol: "RELIANCE", title: "Investment Thesis Notes", category: "qualitative" },
          React.createElement(StandaloneNotesAdapter, { symbol: "RELIANCE", cardId: "notes-card-1" })
        )
      );

      expect(html).toContain('data-testid="standalone-notes-widget"');
      expect(html).toContain('data-testid="card-notes-editor"');
      expect(html).toContain("Document key qualitative observations");
      expect(html).toContain("Bull Thesis");
      expect(html).toContain("Bear Thesis");
      expect(html).toContain("Accounting Risk");
      expect(html).toContain("Catalyst");
    });

    it("renders AttachmentHubAdapter with file dropzone and multi-modal support", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          { cardId: "hub-card-1", symbol: "RELIANCE", title: "Document Repository", category: "qualitative" },
          React.createElement(AttachmentHubAdapter, { symbol: "RELIANCE", cardId: "hub-card-1" })
        )
      );

      expect(html).toContain('data-testid="attachment-hub-widget"');
      expect(html).toContain("Drag &amp; drop files or click to browse");
      expect(html).toContain("Attached Documents (0)");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. WORKSTATION WIDGET RENDERER DISPATCHER
  // ─────────────────────────────────────────────────────────────
  describe("5. WorkstationWidgetRenderer Central Dispatcher", () => {
    it("correctly dispatches catalog widget types to their specialized adapters", () => {
      const testCases = [
        { type: "financial-statements-workstation", expectedAttr: "financial-statements-workstation" },
        { type: "income-statement", expectedAttr: "income-statement" },
        { type: "balance-sheet", expectedAttr: "balance-sheet" },
        { type: "cash-flow", expectedAttr: "cash-flow" },
        { type: "kpi-cards", expectedAttr: "kpi-cards" },
        { type: "scenario-workstation", expectedAttr: "scenario-workstation" },
        { type: "trajectory-chart", expectedAttr: "trajectory-chart" },
        { type: "margin-bridge", expectedAttr: "margin-bridge" },
        { type: "segment-projections", expectedAttr: "segment-projections" },
        { type: "dcf-valuation", expectedAttr: "dcf-valuation" },
        { type: "dupont-analysis", expectedAttr: "dupont-analysis" },
        { type: "altman-z-score", expectedAttr: "altman-z-score" },
        { type: "piotroski-f-score", expectedAttr: "piotroski-f-score" },
        { type: "standalone-notes", expectedAttr: "standalone-notes" },
        { type: "attachment-hub", expectedAttr: "attachment-hub" },
      ];

      testCases.forEach(({ type, expectedAttr }) => {
        const html = renderToStaticMarkup(
          React.createElement(WorkstationWidgetRenderer, {
            type,
            symbol: "RELIANCE",
            cardId: `card-${type}`,
          })
        );
        expect(html).toContain(`data-widget-type="${expectedAttr}"`);
      });
    });

    it("ensures Universal Card Workbench controls are present on every rendered card", () => {
      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          { cardId: "test-card-universal", symbol: "TCS", title: "TCS Valuation Model", category: "valuation" },
          React.createElement(WorkstationWidgetRenderer, {
            type: "dcf-valuation",
            symbol: "TCS",
            cardId: "test-card-universal",
          })
        )
      );

      // Card Header Controls
      expect(html).toContain("card-drag-handle");
      expect(html).toContain("TCS Valuation Model");
      expect(html).toContain("valuation");

      // In-Card Segmented Switcher Controls
      expect(html).toContain('title="Show primary widget"');
      expect(html).toContain('title="Show qualitative notes"');
      expect(html).toContain('title="Show card attachments"');

      // Slide-Over Drawer Action Button
      expect(html).toContain('aria-label="Open slide-over drawer"');
    });
  });
});
