"use client";

import React, { useState, useMemo } from "react";
import { getSampleStatementData } from "@/data/sample-statements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatINRCrores } from "@/lib/formatters";
import { PieChart, TrendingUp, Info, HelpCircle } from "lucide-react";

export interface DupontAnalysisProps {
  symbol?: string;
}

interface YearDuPontData {
  year: string;
  revenue: number;
  ebit: number;
  pbt: number;
  pat: number;
  totalAssets: number;
  totalEquity: number;
  // 3-Stage Metrics
  netMargin: number; // PAT / Revenue
  assetTurnover: number; // Revenue / Total Assets
  financialLeverage: number; // Total Assets / Total Equity
  roe3Stage: number;
  // 5-Stage Additional Metrics
  taxBurden: number; // PAT / PBT
  interestBurden: number; // PBT / EBIT
  operatingMargin: number; // EBIT / Revenue
  roe5Stage: number;
}

export function DupontAnalysis({ symbol = "RELIANCE" }: DupontAnalysisProps) {
  const [modelType, setModelType] = useState<"3-stage" | "5-stage">("3-stage");
  const [selectedYear, setSelectedYear] = useState<string>("FY24");

  const companyData = useMemo(() => {
    return getSampleStatementData(symbol);
  }, [symbol]);

  // Compute DuPont metrics across all available fiscal years
  const dupontSeries: YearDuPontData[] = useMemo(() => {
    const pl = companyData.statements.PL;
    const bs = companyData.statements.BS;

    const revItem = pl.find((i) => i.metricKey === "REV_OPERATIONS");
    const ebitItem = pl.find((i) => i.metricKey === "EBIT") || pl.find((i) => i.metricKey === "EBITDA");
    const pbtItem = pl.find((i) => i.metricKey === "PBT") || pl.find((i) => i.metricKey === "EBT");
    const patItem = pl.find((i) => i.metricKey === "PAT");

    const assetsItem = bs.find((i) => i.metricKey === "TOTAL_ASSETS");
    const equityItem = bs.find((i) => i.metricKey === "TOTAL_EQUITY") || bs.find((i) => i.metricKey === "SHAREHOLDERS_FUNDS");

    return companyData.fiscalYears.map((yr) => {
      const revenue = revItem?.periods[yr]?.value ?? 100000;
      const ebit = ebitItem?.periods[yr]?.value ?? revenue * 0.15;
      const pbt = pbtItem?.periods[yr]?.value ?? ebit * 0.85;
      const pat = patItem?.periods[yr]?.value ?? pbt * 0.75;

      const totalAssets = assetsItem?.periods[yr]?.value ?? revenue * 1.8;
      const totalEquity = equityItem?.periods[yr]?.value ?? totalAssets * 0.55;

      // 3-Stage Metrics
      const netMargin = revenue > 0 ? pat / revenue : 0;
      const assetTurnover = totalAssets > 0 ? revenue / totalAssets : 0;
      const financialLeverage = totalEquity > 0 ? totalAssets / totalEquity : 1;
      const roe3Stage = netMargin * assetTurnover * financialLeverage;

      // 5-Stage Metrics
      const taxBurden = pbt > 0 ? pat / pbt : 0.75;
      const interestBurden = ebit > 0 ? pbt / ebit : 0.85;
      const operatingMargin = revenue > 0 ? ebit / revenue : 0.15;
      const roe5Stage = taxBurden * interestBurden * operatingMargin * assetTurnover * financialLeverage;

      return {
        year: yr,
        revenue,
        ebit,
        pbt,
        pat,
        totalAssets,
        totalEquity,
        netMargin,
        assetTurnover,
        financialLeverage,
        roe3Stage,
        taxBurden,
        interestBurden,
        operatingMargin,
        roe5Stage,
      };
    });
  }, [companyData]);

  const activeYearData = useMemo(() => {
    return dupontSeries.find((d) => d.year === selectedYear) || dupontSeries[dupontSeries.length - 1];
  }, [dupontSeries, selectedYear]);

  return (
    <div className="flex flex-col h-full w-full overflow-auto p-4 space-y-4" data-testid="dupont-analysis-widget">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              DuPont Analysis — {companyData.companyName}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Return on Equity (ROE) decomposition into operational efficiency and leverage drivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Type Selector */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setModelType("3-stage")}
              data-testid="dupont-3stage-btn"
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                modelType === "3-stage"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              3-Stage DuPont
            </button>
            <button
              type="button"
              onClick={() => setModelType("5-stage")}
              data-testid="dupont-5stage-btn"
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                modelType === "5-stage"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              5-Stage Extended
            </button>
          </div>

          {/* Fiscal Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-mono font-medium"
            data-testid="dupont-year-select"
          >
            {dupontSeries.map((d) => (
              <option key={d.year} value={d.year}>
                {d.year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main ROE Result Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="sm:col-span-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-border/60 pb-3 sm:pb-0 sm:pr-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Return on Equity ({activeYearData.year})
          </span>
          <div className="text-2xl font-black font-mono text-primary mt-1" data-testid="dupont-roe-value">
            {formatPercent((modelType === "3-stage" ? activeYearData.roe3Stage : activeYearData.roe5Stage) * 100)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {modelType === "3-stage" ? "3-Factor ROE Multiplier" : "5-Factor Extended ROE Multiplier"}
          </span>
        </div>

        {modelType === "3-stage" ? (
          <div className="sm:col-span-3 grid grid-cols-3 gap-3">
            {/* Factor 1: Net Margin */}
            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                Net Profit Margin
              </span>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatPercent(activeYearData.netMargin * 100)}
              </div>
              <span className="text-[9px] text-muted-foreground">PAT ÷ Revenue</span>
            </div>

            {/* Factor 2: Asset Turnover */}
            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                Asset Turnover
              </span>
              <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {activeYearData.assetTurnover.toFixed(2)}x
              </div>
              <span className="text-[9px] text-muted-foreground">Revenue ÷ Assets</span>
            </div>

            {/* Factor 3: Financial Leverage */}
            <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[10px] text-muted-foreground block font-medium uppercase">
                Financial Leverage
              </span>
              <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {activeYearData.financialLeverage.toFixed(2)}x
              </div>
              <span className="text-[9px] text-muted-foreground">Assets ÷ Equity</span>
            </div>
          </div>
        ) : (
          <div className="sm:col-span-3 grid grid-cols-5 gap-2">
            {/* Tax Burden */}
            <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[9px] text-muted-foreground block font-medium uppercase">Tax Burden</span>
              <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                {(activeYearData.taxBurden * 100).toFixed(1)}%
              </div>
              <span className="text-[8px] text-muted-foreground">PAT ÷ PBT</span>
            </div>

            {/* Interest Burden */}
            <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[9px] text-muted-foreground block font-medium uppercase">Interest Burden</span>
              <div className="text-sm font-bold font-mono text-foreground mt-0.5">
                {(activeYearData.interestBurden * 100).toFixed(1)}%
              </div>
              <span className="text-[8px] text-muted-foreground">PBT ÷ EBIT</span>
            </div>

            {/* Operating Margin */}
            <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[9px] text-muted-foreground block font-medium uppercase">EBIT Margin</span>
              <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatPercent(activeYearData.operatingMargin * 100)}
              </div>
              <span className="text-[8px] text-muted-foreground">EBIT ÷ Rev</span>
            </div>

            {/* Asset Turnover */}
            <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[9px] text-muted-foreground block font-medium uppercase">Asset Turnover</span>
              <div className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                {activeYearData.assetTurnover.toFixed(2)}x
              </div>
              <span className="text-[8px] text-muted-foreground">Rev ÷ Assets</span>
            </div>

            {/* Financial Leverage */}
            <div className="p-2 rounded-lg bg-muted/20 border border-border/40">
              <span className="text-[9px] text-muted-foreground block font-medium uppercase">Leverage</span>
              <div className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {activeYearData.financialLeverage.toFixed(2)}x
              </div>
              <span className="text-[8px] text-muted-foreground">Assets ÷ Eq</span>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Year Progression Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Multi-Year Historical DuPont Progression
          </span>
          <span className="text-[10px] text-muted-foreground">
            Click any row to inspect historical year
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="dupont-progression-table">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="px-3 py-2">Fiscal Year</th>
                <th className="px-3 py-2 text-right">Net Margin</th>
                <th className="px-3 py-2 text-right">Asset Turnover</th>
                <th className="px-3 py-2 text-right">Equity Multiplier</th>
                <th className="px-3 py-2 text-right font-bold text-primary">ROE (3-Stage)</th>
                {modelType === "5-stage" && (
                  <>
                    <th className="px-3 py-2 text-right">Tax Burden</th>
                    <th className="px-3 py-2 text-right">Interest Burden</th>
                    <th className="px-3 py-2 text-right">EBIT Margin</th>
                    <th className="px-3 py-2 text-right font-bold text-primary">ROE (5-Stage)</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {dupontSeries.map((row) => {
                const isSelected = row.year === selectedYear;
                return (
                  <tr
                    key={row.year}
                    onClick={() => setSelectedYear(row.year)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 font-medium"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-3 py-2 font-mono font-semibold text-foreground">
                      {row.year}
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-emerald-600 dark:text-emerald-400">
                      {formatPercent(row.netMargin * 100)}
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-blue-600 dark:text-blue-400">
                      {row.assetTurnover.toFixed(2)}x
                    </td>
                    <td className="px-3 py-2 font-mono text-right text-amber-600 dark:text-amber-400">
                      {row.financialLeverage.toFixed(2)}x
                    </td>
                    <td className="px-3 py-2 font-mono text-right font-bold text-primary">
                      {formatPercent(row.roe3Stage * 100)}
                    </td>
                    {modelType === "5-stage" && (
                      <>
                        <td className="px-3 py-2 font-mono text-right">
                          {(row.taxBurden * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 font-mono text-right">
                          {(row.interestBurden * 100).toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 font-mono text-right">
                          {formatPercent(row.operatingMargin * 100)}
                        </td>
                        <td className="px-3 py-2 font-mono text-right font-bold text-primary">
                          {formatPercent(row.roe5Stage * 100)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default DupontAnalysis;
