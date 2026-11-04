'use client';

import React, { useState } from 'react';
import { useScenarioStore } from '@/lib/scenario-store';
import { formatINRCrores } from '@/lib/formatters';
import {
  Plus,
  Trash2,
  Layers,
  TrendingUp,
} from 'lucide-react';

export const SegmentProjectionsTable: React.FC = () => {
  const {
    activeScenario,
    segmentDrivers,
    scenarios,
    outputs,
    updateSegmentDriver,
    setDriver,
    addSegment,
    removeSegment,
  } = useScenarioStore();

  const segments = segmentDrivers[activeScenario];
  const params = scenarios[activeScenario];
  const projectedYears = outputs[activeScenario].projectedYears;

  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSegName, setNewSegName] = useState('');
  const [newSegBaseRev, setNewSegBaseRev] = useState('20000');
  const [newSegVolGrowth, setNewSegVolGrowth] = useState('8');
  const [newSegPriceReal, setNewSegPriceReal] = useState('2');
  const [newSegMargin, setNewSegMargin] = useState('15');

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegName.trim()) return;

    addSegment(activeScenario, {
      name: newSegName.trim(),
      baseRevenue: parseFloat(newSegBaseRev) || 0,
      volumeGrowthPct: parseFloat(newSegVolGrowth) || 0,
      priceRealizationPct: parseFloat(newSegPriceReal) || 0,
      projectedEbitdaMarginPct: parseFloat(newSegMargin) || 0,
    });

    setNewSegName('');
    setIsAddingSegment(false);
  };

  // Compute segment totals for FY24 base and 5 projected years
  const totalBaseSegmentRev = segments.reduce((sum, s) => sum + s.baseRevenue, 0);
  const netBaseRev = Math.max(0, totalBaseSegmentRev - params.intersegmentElimination);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Segment Revenue & Operating Margin Breakdown</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Granular driver inputs per operating segment (Oil2Chemicals, Retail, Digital Services). Edits propagate directly into total revenue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingSegment(!isAddingSegment)}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Segment</span>
        </button>
      </div>

      {/* Add New Segment Inline Form */}
      {isAddingSegment && (
        <form onSubmit={handleCreateSegment} className="p-4 rounded-lg bg-secondary/30 border border-primary/20 space-y-3">
          <div className="text-xs font-semibold text-primary flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Configure New Operating Segment</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Segment Name</label>
              <input
                type="text"
                placeholder="e.g. Green Hydrogen"
                value={newSegName}
                onChange={(e) => setNewSegName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Base Revenue (₹ Cr)</label>
              <input
                type="number"
                value={newSegBaseRev}
                onChange={(e) => setNewSegBaseRev(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Volume Growth (%)</label>
              <input
                type="number"
                step="0.5"
                value={newSegVolGrowth}
                onChange={(e) => setNewSegVolGrowth(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Price Realization (%)</label>
              <input
                type="number"
                step="0.25"
                value={newSegPriceReal}
                onChange={(e) => setNewSegPriceReal(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">EBITDA Margin (%)</label>
              <input
                type="number"
                step="0.5"
                value={newSegMargin}
                onChange={(e) => setNewSegMargin(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded bg-background border border-border font-mono"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingSegment(false)}
              className="px-3 py-1 text-xs rounded border border-border hover:bg-secondary text-muted-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Segment
            </button>
          </div>
        </form>
      )}

      {/* Segment Breakdown Table */}
      <div className="overflow-x-auto border border-border/80 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
              <th className="py-2.5 px-3 min-w-[200px]">Segment Name</th>
              <th className="py-2.5 px-3 text-right">FY24 Base (₹ Cr)</th>
              <th className="py-2.5 px-2 text-right">Vol Grw (%)</th>
              <th className="py-2.5 px-2 text-right">Price Real (%)</th>
              <th className="py-2.5 px-2 text-right">Proj Grw (%)</th>
              <th className="py-2.5 px-2 text-right">EBITDA Mgn (%)</th>
              {projectedYears.map((yr) => (
                <th key={yr.year} className="py-2.5 px-3 text-right font-mono text-foreground font-semibold">
                  {yr.year} (₹ Cr)
                </th>
              ))}
              <th className="py-2.5 px-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {segments.map((seg) => {
              // Calculate 5 years for this segment
              let prevRev = seg.baseRevenue;
              const segProjections: number[] = [];
              const growthRate = (1 + seg.volumeGrowthPct / 100) * (1 + seg.priceRealizationPct / 100) - 1;

              for (let i = 0; i < 5; i++) {
                prevRev = prevRev * (1 + growthRate);
                segProjections.push(Math.round(prevRev));
              }

              return (
                <tr key={seg.id} className="hover:bg-secondary/20 transition-colors">
                  {/* Segment Name */}
                  <td className="py-2 px-3 font-medium text-foreground">
                    <input
                      type="text"
                      value={seg.name}
                      onChange={(e) => updateSegmentDriver(activeScenario, seg.id, { name: e.target.value })}
                      className="w-full bg-transparent border-0 focus:ring-1 focus:ring-primary rounded px-1 py-0.5 text-xs font-semibold text-foreground"
                    />
                  </td>

                  {/* FY24 Base Revenue */}
                  <td className="py-2 px-3 text-right font-mono font-medium text-foreground">
                    <input
                      type="number"
                      value={seg.baseRevenue}
                      onChange={(e) =>
                        updateSegmentDriver(activeScenario, seg.id, { baseRevenue: parseFloat(e.target.value) || 0 })
                      }
                      className="w-24 text-right bg-background border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono font-semibold"
                    />
                  </td>

                  {/* Volume Growth Input */}
                  <td className="py-2 px-2 text-right font-mono">
                    <input
                      type="number"
                      step="0.5"
                      value={seg.volumeGrowthPct}
                      onChange={(e) =>
                        updateSegmentDriver(activeScenario, seg.id, {
                          volumeGrowthPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 text-right bg-background border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono"
                    />
                  </td>

                  {/* Price Realization Input */}
                  <td className="py-2 px-2 text-right font-mono">
                    <input
                      type="number"
                      step="0.25"
                      value={seg.priceRealizationPct}
                      onChange={(e) =>
                        updateSegmentDriver(activeScenario, seg.id, {
                          priceRealizationPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 text-right bg-background border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono"
                    />
                  </td>

                  {/* Proj Growth Display */}
                  <td className="py-2 px-2 text-right font-mono font-semibold text-primary">
                    {seg.projectedGrowthPct > 0 ? `+${seg.projectedGrowthPct}%` : `${seg.projectedGrowthPct}%`}
                  </td>

                  {/* EBITDA Margin Input */}
                  <td className="py-2 px-2 text-right font-mono">
                    <input
                      type="number"
                      step="0.5"
                      value={seg.projectedEbitdaMarginPct}
                      onChange={(e) =>
                        updateSegmentDriver(activeScenario, seg.id, {
                          projectedEbitdaMarginPct: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-16 text-right bg-background border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono text-emerald-500 font-semibold"
                    />
                  </td>

                  {/* 5-Year Projected Segment Revenues */}
                  {segProjections.map((val, idx) => (
                    <td key={idx} className="py-2 px-3 text-right font-mono font-semibold text-foreground/90">
                      {formatINRCrores(val, { includeUnit: false, includeSymbol: true })}
                    </td>
                  ))}

                  {/* Delete Button */}
                  <td className="py-2 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeSegment(activeScenario, seg.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      title="Remove segment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}

            {/* Intersegment Eliminations Row */}
            <tr className="bg-muted/30 font-medium text-muted-foreground italic">
              <td className="py-2 px-3">Less: Intersegment Eliminations</td>
              <td className="py-2 px-3 text-right font-mono">
                <input
                  type="number"
                  value={params.intersegmentElimination}
                  onChange={(e) =>
                    setDriver(activeScenario, 'intersegmentElimination', parseFloat(e.target.value) || 0)
                  }
                  className="w-24 text-right bg-background border border-border/60 rounded px-1.5 py-0.5 text-xs font-mono text-rose-500 font-semibold"
                />
              </td>
              <td colSpan={4} className="py-2 px-2 text-right text-[11px] text-muted-foreground">
                Eliminations net across all forecast periods
              </td>
              {projectedYears.map((_, idx) => (
                <td key={idx} className="py-2 px-3 text-right font-mono text-rose-500 font-medium">
                  -{formatINRCrores(params.intersegmentElimination, { includeUnit: false, includeSymbol: true })}
                </td>
              ))}
              <td></td>
            </tr>

            {/* Consolidated Total Row */}
            <tr className="bg-primary/5 border-t-2 border-primary/30 font-bold text-foreground">
              <td className="py-2.5 px-3 flex items-center space-x-1.5 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span>Consolidated Net Revenue</span>
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-primary font-bold">
                {formatINRCrores(netBaseRev, { includeUnit: true, includeSymbol: true })}
              </td>
              <td colSpan={4} className="py-2.5 px-2 text-right text-xs font-semibold text-muted-foreground">
                Sum of Segments Net of Eliminations:
              </td>
              {projectedYears.map((yr) => (
                <td key={yr.year} className="py-2.5 px-3 text-right font-mono text-primary font-bold text-xs">
                  {formatINRCrores(yr.revenue, { includeUnit: false, includeSymbol: true })}
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
