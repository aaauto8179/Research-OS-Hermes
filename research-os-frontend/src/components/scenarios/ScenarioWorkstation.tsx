'use client';

import React, { useState } from 'react';
import { useScenarioStore } from '@/lib/scenario-store';
import { formatINRCrores } from '@/lib/formatters';
import { ScenarioControls } from './ScenarioControls';
import { DriverInputs } from './DriverInputs';
import { SegmentProjectionsTable } from './SegmentProjectionsTable';
import { TrajectoryChart } from './TrajectoryChart';
import { MarginBridgeChart } from './MarginBridgeChart';
import {
  TrendingUp,
  Sliders,
  Layers,
  Table,
  Columns,
} from 'lucide-react';

export interface ScenarioWorkstationProps {
  symbol?: string;
}

export const ScenarioWorkstation: React.FC<ScenarioWorkstationProps> = ({ symbol: initialSymbol }) => {
  const {
    symbol,
    setSymbol,
    baseYear,
    baseRevenue,
    activeScenario,
    comparisonMode,
    scenarios,
    outputs,
  } = useScenarioStore();

  React.useEffect(() => {
    if (initialSymbol && initialSymbol !== symbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol, symbol, setSymbol]);

  const [activeTab, setActiveTab] = useState<'drivers' | 'segments' | 'statements' | 'comparison'>('drivers');

  const currentOutputs = outputs[activeScenario];
  const projectedYears = currentOutputs.projectedYears;
  const fy25 = projectedYears[0];

  // Calculate FY25 YoY Growth
  const fy25Growth = baseRevenue > 0 && fy25 ? ((fy25.revenue - baseRevenue) / baseRevenue) * 100 : 0;

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Bar with Symbol, Case Badge, & Quick Switcher */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-bold tracking-tight text-foreground">{symbol}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-primary/10 text-primary border border-primary/20">
                FY{String(baseYear).slice(-2)} Baseline ₹{Math.round(baseRevenue / 1000)}k Cr
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                  activeScenario === 'bull'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : activeScenario === 'bear'
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                }`}
              >
                {activeScenario} Case Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reactive Scenario Simulator & Multi-Year Financial Projections (FY25E - FY29E)
            </p>
          </div>
        </div>

        {/* 2. Top KPI Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-5">
          {/* Card 1: FY25E Revenue */}
          <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              FY25E Revenue
            </span>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatINRCrores(fy25?.revenue)}
            </div>
            <div className="text-[11px] font-mono font-medium text-emerald-500 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{fy25Growth.toFixed(1)}% YoY</span>
            </div>
          </div>

          {/* Card 2: FY25E EBITDA */}
          <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              FY25E EBITDA
            </span>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatINRCrores(fy25?.ebitda)}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              {fy25?.ebitdaMarginPct.toFixed(1)}% margin
            </div>
          </div>

          {/* Card 3: FY25E PAT (Net Profit) */}
          <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              FY25E PAT (Net Profit)
            </span>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatINRCrores(fy25?.pat)}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              {fy25?.patMarginPct.toFixed(1)}% net margin
            </div>
          </div>

          {/* Card 4: 5Y Revenue CAGR */}
          <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              5-Year Revenue CAGR
            </span>
            <div className="text-lg font-bold font-mono text-primary">
              {currentOutputs.cagr5Y.toFixed(1)}%
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              FY24 $\to$ FY29E
            </div>
          </div>

          {/* Card 5: Cumulative 5Y FCF */}
          <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/70 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Cumulative 5Y FCF
            </span>
            <div className="text-lg font-bold font-mono text-foreground">
              {formatINRCrores(currentOutputs.cumulativeFcf5Y)}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground" title="Indicated Enterprise Value">
              Indicated EV: ₹{Math.round(currentOutputs.enterpriseValueIndication / 1000)}k Cr
            </div>
          </div>
        </div>
      </div>

      {/* 3. Scenario Controls (Tabs, Status, File I/O) */}
      <ScenarioControls />

      {/* 4. Side-by-Side Dynamic Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrajectoryChart />
        <MarginBridgeChart />
      </div>

      {/* 5. Workstation Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'drivers'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Valuation Drivers & Sliders</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('segments')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'segments'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Segment Breakdown Projections</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('statements')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'statements'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>5-Year Projections Table</span>
          </button>

          {comparisonMode && (
            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
                activeTab === 'comparison'
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Multi-Case Comparison</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. Active Tab Content */}
      <div className="pt-1">
        {activeTab === 'drivers' && <DriverInputs />}

        {activeTab === 'segments' && <SegmentProjectionsTable />}

        {activeTab === 'statements' && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <Table className="w-4 h-4 text-primary" />
                <span>5-Year Forward Projected Income Statement & Cash Flows (₹ Crores)</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Consolidated model outputs under {activeScenario.toUpperCase()} Case. Recalculated reactively on driver modifications.
              </p>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                    <th className="py-2.5 px-4 min-w-[220px]">Line Item (INR Crores)</th>
                    {projectedYears.map((yr) => (
                      <th key={yr.year} className="py-2.5 px-3 text-right font-mono text-foreground font-semibold">
                        {yr.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {/* Revenue */}
                  <tr className="hover:bg-secondary/20 font-bold bg-primary/5">
                    <td className="py-2.5 px-4 font-sans font-bold text-foreground">Revenue from Operations</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2.5 px-3 text-right text-primary font-bold">
                        {formatINRCrores(yr.revenue, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* Gross Profit */}
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans text-muted-foreground pl-6">Gross Profit</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-foreground">
                        {formatINRCrores(yr.grossProfit, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* EBITDA */}
                  <tr className="hover:bg-secondary/20 font-semibold bg-muted/20">
                    <td className="py-2 px-4 font-sans text-foreground">Operating Profit (EBITDA)</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-emerald-500 font-semibold">
                        {formatINRCrores(yr.ebitda, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* Depreciation */}
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans text-muted-foreground pl-6">(-) Depreciation & Amortization</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-rose-500/80">
                        -{formatINRCrores(yr.depreciation, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* EBIT */}
                  <tr className="hover:bg-secondary/20 font-medium">
                    <td className="py-2 px-4 font-sans text-foreground">Operating Profit (EBIT)</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-foreground">
                        {formatINRCrores(yr.ebit, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* Tax */}
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans text-muted-foreground pl-6">(-) Tax Expense</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-rose-500/80">
                        -{formatINRCrores(yr.tax, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* PAT */}
                  <tr className="hover:bg-secondary/20 font-bold bg-muted/20">
                    <td className="py-2 px-4 font-sans text-foreground">Profit After Tax (PAT)</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-purple-500 font-bold">
                        {formatINRCrores(yr.pat, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* Capex */}
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans text-muted-foreground pl-6">(-) Capital Expenditures (Capex)</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-orange-500">
                        -{formatINRCrores(yr.capex, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* NWC Change */}
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans text-muted-foreground pl-6">(-) Working Capital Change (ΔNWC)</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2 px-3 text-right text-muted-foreground">
                        -{formatINRCrores(yr.nwcChange, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* Free Cash Flow */}
                  <tr className="hover:bg-secondary/20 font-bold bg-emerald-500/10">
                    <td className="py-2.5 px-4 font-sans text-emerald-600 dark:text-emerald-400 font-bold">
                      Free Cash Flow to Firm (FCFF)
                    </td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatINRCrores(yr.fcf, { includeUnit: false, includeSymbol: true })}
                      </td>
                    ))}
                  </tr>

                  {/* Margins */}
                  <tr className="hover:bg-secondary/20 text-muted-foreground text-[11px] border-t border-border">
                    <td className="py-1.5 px-4 font-sans">EBITDA Margin %</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-1.5 px-3 text-right font-mono">
                        {yr.ebitdaMarginPct.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-secondary/20 text-muted-foreground text-[11px]">
                    <td className="py-1.5 px-4 font-sans">PAT Margin %</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-1.5 px-3 text-right font-mono">
                        {yr.patMarginPct.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-secondary/20 text-muted-foreground text-[11px]">
                    <td className="py-1.5 px-4 font-sans">FCF Margin %</td>
                    {projectedYears.map((yr) => (
                      <td key={yr.year} className="py-1.5 px-3 text-right font-mono">
                        {yr.fcfMarginPct.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <Columns className="w-4 h-4 text-primary" />
                <span>Side-by-Side Multi-Case Comparison</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Cross-case sensitivity comparison across Base Case, Bull Case, and Bear Case.
              </p>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <th className="py-2.5 px-4">Metric / Dimension</th>
                    <th className="py-2.5 px-3 text-right font-mono text-rose-500 font-bold">Bear Case</th>
                    <th className="py-2.5 px-3 text-right font-mono text-blue-500 font-bold">Base Case</th>
                    <th className="py-2.5 px-3 text-right font-mono text-emerald-500 font-bold">Bull Case</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans font-medium text-foreground">Revenue CAGR Assumption</td>
                    <td className="py-2 px-3 text-right">{scenarios.bear.revenueCagrPct}%</td>
                    <td className="py-2 px-3 text-right font-semibold">{scenarios.base.revenueCagrPct}%</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-semibold">{scenarios.bull.revenueCagrPct}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans font-medium text-foreground">Target EBITDA Margin</td>
                    <td className="py-2 px-3 text-right">{scenarios.bear.ebitdaMarginPct}%</td>
                    <td className="py-2 px-3 text-right font-semibold">{scenarios.base.ebitdaMarginPct}%</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-semibold">{scenarios.bull.ebitdaMarginPct}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans font-medium text-foreground">FY25E Projected Revenue</td>
                    <td className="py-2 px-3 text-right">{formatINRCrores(outputs.bear.projectedYears[0]?.revenue)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatINRCrores(outputs.base.projectedYears[0]?.revenue)}</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-semibold">{formatINRCrores(outputs.bull.projectedYears[0]?.revenue)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans font-medium text-foreground">FY29E Terminal Year Revenue</td>
                    <td className="py-2 px-3 text-right">{formatINRCrores(outputs.bear.projectedYears[4]?.revenue)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatINRCrores(outputs.base.projectedYears[4]?.revenue)}</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-semibold">{formatINRCrores(outputs.bull.projectedYears[4]?.revenue)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 font-bold bg-primary/5">
                    <td className="py-2 px-4 font-sans text-primary">5-Year Revenue CAGR</td>
                    <td className="py-2 px-3 text-right text-rose-500">{outputs.bear.cagr5Y.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right text-blue-500">{outputs.base.cagr5Y.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right text-emerald-500">{outputs.bull.cagr5Y.toFixed(1)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans font-medium text-foreground">5-Year Cumulative FCF</td>
                    <td className="py-2 px-3 text-right">{formatINRCrores(outputs.bear.cumulativeFcf5Y)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatINRCrores(outputs.base.cumulativeFcf5Y)}</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-semibold">{formatINRCrores(outputs.bull.cumulativeFcf5Y)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2 px-4 font-sans font-medium text-foreground">Implied Terminal Value</td>
                    <td className="py-2 px-3 text-right">{formatINRCrores(outputs.bear.terminalValue)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{formatINRCrores(outputs.base.terminalValue)}</td>
                    <td className="py-2 px-3 text-right text-emerald-500 font-semibold">{formatINRCrores(outputs.bull.terminalValue)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 font-bold bg-emerald-500/10">
                    <td className="py-2 px-4 font-sans text-emerald-600 dark:text-emerald-400">Indicated Enterprise Value</td>
                    <td className="py-2 px-3 text-right text-rose-500">{formatINRCrores(outputs.bear.enterpriseValueIndication)}</td>
                    <td className="py-2 px-3 text-right font-bold text-foreground">{formatINRCrores(outputs.base.enterpriseValueIndication)}</td>
                    <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatINRCrores(outputs.bull.enterpriseValueIndication)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
