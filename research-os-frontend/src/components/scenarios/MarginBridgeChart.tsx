'use client';

import React, { useState } from 'react';
import {
  useScenarioStore,
  ProjectedYearMetrics,
} from '@/lib/scenario-store';
import { formatINRCrores } from '@/lib/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';

export const MarginBridgeChart: React.FC = () => {
  const {
    activeScenario,
    outputs,
  } = useScenarioStore();

  const [viewMode, setViewMode] = useState<'margins' | 'waterfall'>('margins');
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0); // 0 = FY25E

  const currentOutputs = outputs[activeScenario];
  const projectedYears = currentOutputs.projectedYears;
  const activeYearData = projectedYears[selectedYearIndex] || projectedYears[0];

  // 1. Data for Margin Trajectories (FY25E - FY29E)
  const marginData = projectedYears.map((yr: ProjectedYearMetrics) => ({
    period: yr.year,
    ebitdaMargin: yr.ebitdaMarginPct,
    patMargin: yr.patMarginPct,
    fcfMargin: yr.fcfMarginPct,
  }));

  // 2. Data for FCFF Cash Flow Waterfall Bridge (Selected Year)
  const waterfallData = activeYearData
    ? [
        { name: 'Revenue', value: activeYearData.revenue, color: '#3b82f6', isSummary: true },
        { name: 'Gross Profit', value: activeYearData.grossProfit, color: '#06b6d4', isSummary: false },
        { name: 'EBITDA', value: activeYearData.ebitda, color: '#10b981', isSummary: true },
        { name: 'EBIT', value: activeYearData.ebit, color: '#14b8a6', isSummary: false },
        { name: '(-) Tax', value: activeYearData.tax, color: '#f43f5e', isSummary: false },
        { name: 'PAT', value: activeYearData.pat, color: '#8b5cf6', isSummary: true },
        { name: '(-) Capex', value: activeYearData.capex, color: '#f97316', isSummary: false },
        { name: 'FCF to Firm', value: activeYearData.fcf, color: '#10b981', isSummary: true },
      ]
    : [];

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>
              {viewMode === 'margins'
                ? 'Operating & Free Cash Flow Margin Trajectories'
                : `Cash Flow Value Bridge (${activeYearData?.year || 'FY25E'})`}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {viewMode === 'margins'
              ? 'Annual EBITDA, PAT (Net Profit), and FCF margin trajectory under active scenario.'
              : 'Institutional waterfall bridge from Consolidated Revenue down to Free Cash Flow.'}
          </p>
        </div>

        {/* View Mode & Year Selector */}
        <div className="flex items-center space-x-2">
          {viewMode === 'waterfall' && (
            <select
              value={selectedYearIndex}
              onChange={(e) => setSelectedYearIndex(parseInt(e.target.value, 10))}
              className="text-xs px-2 py-1 bg-background border border-border rounded font-mono"
            >
              {projectedYears.map((yr, idx) => (
                <option key={yr.year} value={idx}>
                  {yr.year}
                </option>
              ))}
            </select>
          )}

          <div className="flex rounded-lg border border-border bg-secondary/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('margins')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                viewMode === 'margins'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Margins (%)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('waterfall')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                viewMode === 'waterfall'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cash Flow Bridge
            </button>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'margins' ? (
            <BarChart data={marginData} margin={{ top: 15, right: 25, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
              <XAxis dataKey="period" stroke="currentColor" className="text-[11px] text-muted-foreground font-mono" tickLine={false} />
              <YAxis
                stroke="currentColor"
                className="text-[11px] text-muted-foreground font-mono"
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(val: unknown, name: unknown) => [
                  `${Number(val).toFixed(2)}%`,
                  String(name) === 'ebitdaMargin'
                    ? 'EBITDA Margin'
                    : String(name) === 'patMargin'
                    ? 'PAT Margin'
                    : 'FCF Margin',
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(var(--popover), 0.95)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  border: '1px solid var(--border)',
                }}
              />
              <Legend
                formatter={(val) =>
                  val === 'ebitdaMargin' ? 'EBITDA Margin' : val === 'patMargin' ? 'PAT Margin' : 'FCF Margin'
                }
                wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }}
              />
              <Bar dataKey="ebitdaMargin" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="patMargin" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="fcfMargin" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          ) : (
            <BarChart data={waterfallData} margin={{ top: 15, right: 25, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
              <XAxis dataKey="name" stroke="currentColor" className="text-[11px] text-muted-foreground font-mono" tickLine={false} />
              <YAxis
                stroke="currentColor"
                className="text-[11px] text-muted-foreground font-mono"
                tickLine={false}
                tickFormatter={(v) => `₹${Math.round(v / 1000)}k Cr`}
              />
              <Tooltip
                formatter={(val: unknown) => [formatINRCrores(Number(val)), 'Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(var(--popover), 0.95)',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  border: '1px solid var(--border)',
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={45}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
