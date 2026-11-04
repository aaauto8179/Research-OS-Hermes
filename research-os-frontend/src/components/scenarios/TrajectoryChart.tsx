'use client';

import React from 'react';
import {
  useScenarioStore,
  HistoricalYear,
} from '@/lib/scenario-store';
import { formatINRCrores } from '@/lib/formatters';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ChartPoint {
  period: string;
  isHistorical: boolean;
  actualRevenue?: number;
  baseRevenue?: number;
  bullRevenue?: number;
  bearRevenue?: number;
  confidenceRange?: [number, number]; // [bear, bull]
}

export const TrajectoryChart: React.FC = () => {
  const {
    symbol,
    activeScenario,
    outputs,
    historical,
  } = useScenarioStore();

  const baseYears = outputs.base.projectedYears;
  const bullYears = outputs.bull.projectedYears;
  const bearYears = outputs.bear.projectedYears;

  // Combine historical actuals + projections into unified chart series
  const data: ChartPoint[] = [];

  // 1. Historical Actuals (FY20 to FY24)
  historical.forEach((h: HistoricalYear) => {
    data.push({
      period: h.year,
      isHistorical: true,
      actualRevenue: h.revenue,
      baseRevenue: h.revenue, // Anchor trajectory curves at actual FY24
      bullRevenue: h.revenue,
      bearRevenue: h.revenue,
      confidenceRange: [h.revenue, h.revenue],
    });
  });

  // 2. Projected FY25E to FY29E
  baseYears.forEach((by, idx) => {
    const bull = bullYears[idx]?.revenue ?? by.revenue;
    const bear = bearYears[idx]?.revenue ?? by.revenue;
    data.push({
      period: by.year,
      isHistorical: false,
      baseRevenue: by.revenue,
      bullRevenue: bull,
      bearRevenue: bear,
      confidenceRange: [bear, bull],
    });
  });

  // Custom Institutional Tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartPoint }>;
    label?: string;
  }) => {
    if (!active || !payload || !payload.length) return null;

    const point = payload[0]?.payload;
    if (!point) return null;

    return (
      <div className="bg-popover/95 backdrop-blur border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-border/60 pb-1 font-semibold text-foreground">
          <span>{symbol} — {label}</span>
          <span className="text-[10px] text-muted-foreground uppercase">
            {point.isHistorical ? 'Actual Filing' : 'Projection'}
          </span>
        </div>

        {point.isHistorical ? (
          <div className="flex justify-between items-center text-blue-500 font-mono">
            <span>Historical Revenue:</span>
            <span className="font-bold">{formatINRCrores(point.actualRevenue)}</span>
          </div>
        ) : (
          <div className="space-y-1 pt-0.5 font-mono">
            <div className={`flex justify-between items-center ${activeScenario === 'bull' ? 'font-bold text-emerald-500' : 'text-emerald-400'}`}>
              <span>Bull Case:</span>
              <span>{formatINRCrores(point.bullRevenue)}</span>
            </div>
            <div className={`flex justify-between items-center ${activeScenario === 'base' ? 'font-bold text-blue-500' : 'text-blue-400'}`}>
              <span>Base Case:</span>
              <span>{formatINRCrores(point.baseRevenue)}</span>
            </div>
            <div className={`flex justify-between items-center ${activeScenario === 'bear' ? 'font-bold text-rose-500' : 'text-rose-400'}`}>
              <span>Bear Case:</span>
              <span>{formatINRCrores(point.bearRevenue)}</span>
            </div>
            {point.bullRevenue && point.bearRevenue && (
              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                <span>Scenario Spread:</span>
                <span>{formatINRCrores(point.bullRevenue - point.bearRevenue)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>5-Year Revenue Trajectory & Confidence Bands</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Historical reported actuals (FY20-FY24) with Base, Bull, and Bear projected trajectories. Shaded zone illustrates scenario dispersion.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-blue-500/80 inline-block" />
            <span className="text-muted-foreground">Actuals</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
            <span className="text-muted-foreground">Bull</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-blue-500 inline-block" />
            <span className="text-muted-foreground">Base</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-rose-500 inline-block" />
            <span className="text-muted-foreground">Bear</span>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 25, left: 20, bottom: 5 }}>
            <defs>
              {/* Confidence Band Gradient between Bear and Bull */}
              <linearGradient id="confidenceBandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />

            <XAxis
              dataKey="period"
              stroke="currentColor"
              className="text-[11px] text-muted-foreground font-mono"
              tickLine={false}
            />

            <YAxis
              stroke="currentColor"
              className="text-[11px] text-muted-foreground font-mono"
              tickLine={false}
              tickFormatter={(v) => `₹${Math.round(v / 1000)}k Cr`}
              domain={['auto', 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Historical Actuals as Columns */}
            <Bar
              dataKey="actualRevenue"
              name="Historical Actual"
              fill="#3b82f6"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />

            {/* Confidence Band Area between Bear and Bull */}
            <Area
              dataKey="confidenceRange"
              stroke="none"
              fill="url(#confidenceBandGradient)"
              name="Confidence Range"
            />

            {/* Bull Case Projected Trajectory */}
            <Line
              type="monotone"
              dataKey="bullRevenue"
              name="Bull Case"
              stroke="#10b981"
              strokeWidth={activeScenario === 'bull' ? 3.5 : 2}
              strokeDasharray={activeScenario === 'bull' ? undefined : '4 4'}
              dot={{ r: activeScenario === 'bull' ? 4 : 2, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />

            {/* Base Case Projected Trajectory */}
            <Line
              type="monotone"
              dataKey="baseRevenue"
              name="Base Case"
              stroke="#3b82f6"
              strokeWidth={activeScenario === 'base' ? 3.5 : 2}
              strokeDasharray={activeScenario === 'base' ? undefined : '4 4'}
              dot={{ r: activeScenario === 'base' ? 4 : 2, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
            />

            {/* Bear Case Projected Trajectory */}
            <Line
              type="monotone"
              dataKey="bearRevenue"
              name="Bear Case"
              stroke="#f43f5e"
              strokeWidth={activeScenario === 'bear' ? 3.5 : 2}
              strokeDasharray={activeScenario === 'bear' ? undefined : '4 4'}
              dot={{ r: activeScenario === 'bear' ? 4 : 2, fill: '#f43f5e' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
