"use client";

import React, { useEffect } from "react";
import { useScenarioStore, ScenarioCase } from "@/lib/scenario-store";
import { ScenarioWorkstation } from "@/components/scenarios/ScenarioWorkstation";
import { TrajectoryChart } from "@/components/scenarios/TrajectoryChart";
import { MarginBridgeChart } from "@/components/scenarios/MarginBridgeChart";
import { SegmentProjectionsTable } from "@/components/scenarios/SegmentProjectionsTable";
import { ScenarioControls } from "@/components/scenarios/ScenarioControls";
import { DriverInputs } from "@/components/scenarios/DriverInputs";
import { Activity, Workflow, Layers, Sliders, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ScenarioAdapterProps {
  symbol: string;
}

/**
 * Syncs the scenario store with the provided symbol when needed.
 */
function useSyncScenarioSymbol(symbol: string) {
  const currentSymbol = useScenarioStore((s) => s.symbol);
  const setSymbol = useScenarioStore((s) => s.setSymbol);

  useEffect(() => {
    if (symbol && symbol.toUpperCase() !== currentSymbol?.toUpperCase()) {
      setSymbol(symbol.toUpperCase());
    }
  }, [symbol, currentSymbol, setSymbol]);
}

/**
 * Case switcher bar for atomic scenario widgets (Base, Bull, Bear)
 */
function ScenarioCaseSwitcher() {
  const activeScenario = useScenarioStore((s) => s.activeScenario);
  const setActiveScenario = useScenarioStore((s) => s.setActiveScenario);

  return (
    <div className="flex items-center gap-1" data-testid="scenario-case-switcher">
      {(["base", "bull", "bear"] as ScenarioCase[]).map((c) => {
        const isActive = activeScenario === c;
        const colorStyles =
          c === "bull"
            ? isActive
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 font-bold"
              : "hover:bg-emerald-500/10 text-muted-foreground"
            : c === "bear"
            ? isActive
              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 font-bold"
              : "hover:bg-rose-500/10 text-muted-foreground"
            : isActive
            ? "bg-primary/20 text-primary border border-primary/40 font-bold"
            : "hover:bg-primary/10 text-muted-foreground";

        return (
          <button
            key={c}
            type="button"
            onClick={() => setActiveScenario(c)}
            data-testid={`case-button-${c}`}
            className={`px-2 py-0.5 text-[10px] rounded uppercase transition-all tracking-wider font-semibold ${colorStyles}`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Scenario Workstation full model adapter
 */
export function ScenarioWorkstationAdapter({ symbol }: ScenarioAdapterProps) {
  useSyncScenarioSymbol(symbol);
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="scenario-workstation-widget">
      <ScenarioWorkstation symbol={symbol} />
    </div>
  );
}

/**
 * Atomic Trajectory Area Bands Chart Adapter
 */
export function TrajectoryChartAdapter({ symbol }: ScenarioAdapterProps) {
  useSyncScenarioSymbol(symbol);
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" data-testid="trajectory-chart-widget">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Revenue Trajectory Bands</span>
          <Badge variant="outline" className="text-[10px] py-0 h-4 font-mono">
            {symbol}
          </Badge>
        </div>
        <ScenarioCaseSwitcher />
      </div>
      <div className="flex-1 overflow-auto p-2">
        <TrajectoryChart />
      </div>
    </div>
  );
}

/**
 * Atomic Margin Bridge Waterfall Chart Adapter
 */
export function MarginBridgeChartAdapter({ symbol }: ScenarioAdapterProps) {
  useSyncScenarioSymbol(symbol);
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" data-testid="margin-bridge-widget">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Margin Bridge Waterfall</span>
          <Badge variant="outline" className="text-[10px] py-0 h-4 font-mono">
            {symbol}
          </Badge>
        </div>
        <ScenarioCaseSwitcher />
      </div>
      <div className="flex-1 overflow-auto p-2">
        <MarginBridgeChart />
      </div>
    </div>
  );
}

/**
 * Atomic Segment Projections Table Adapter
 */
export function SegmentProjectionsAdapter({ symbol }: ScenarioAdapterProps) {
  useSyncScenarioSymbol(symbol);
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" data-testid="segment-projections-widget">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Segment Projections Table</span>
          <Badge variant="outline" className="text-[10px] py-0 h-4 font-mono">
            {symbol}
          </Badge>
        </div>
        <ScenarioCaseSwitcher />
      </div>
      <div className="flex-1 overflow-auto p-2">
        <SegmentProjectionsTable />
      </div>
    </div>
  );
}

/**
 * Atomic Scenario Controls Adapter
 */
export function ScenarioControlsAdapter({ symbol }: ScenarioAdapterProps) {
  useSyncScenarioSymbol(symbol);
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" data-testid="scenario-controls-widget">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Scenario Controls</span>
        </div>
        <ScenarioCaseSwitcher />
      </div>
      <div className="flex-1 overflow-auto p-2">
        <ScenarioControls />
      </div>
    </div>
  );
}

/**
 * Atomic Driver Inputs Sliders Adapter
 */
export function DriverInputsAdapter({ symbol }: ScenarioAdapterProps) {
  useSyncScenarioSymbol(symbol);
  return (
    <div className="flex flex-col h-full w-full overflow-hidden" data-testid="driver-inputs-widget">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Valuation Driver Controls</span>
        </div>
        <ScenarioCaseSwitcher />
      </div>
      <div className="flex-1 overflow-auto p-2">
        <DriverInputs />
      </div>
    </div>
  );
}
