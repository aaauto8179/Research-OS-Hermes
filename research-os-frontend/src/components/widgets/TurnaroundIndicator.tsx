"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface TurnaroundProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "TATAMOTORS",
  roe_t: 0.082,
  roe_t_1: 0.020,
  debt_t: 45000,
  debt_t_1: 58000,
  cfo_positive: true,
  operating_margin_t: 0.095,
  operating_margin_t_1: 0.060,
  ebitda_t: 18500,
  ebitda_t_1: 14200,
  interest_coverage_t: 2.3,
  interest_coverage_t_1: 1.4,
  asset_turnover_t: 1.15,
  asset_turnover_t_1: 1.05,
  share_count_t: 368.0,
  share_count_t_1: 368.0,
  split_factor: 1.0,
};

const SIGNAL_LABELS: Record<string, string> = {
  roe_inflection: "ROE Inflection (>500bps)",
  debt_reduction: "Debt Reduction (>20%)",
  cfo_positive: "CFO Turned Positive",
  margin_improvement: "Margin Expansion (>200bps)",
  ebitda_growth: "EBITDA Growth (>10%)",
  interest_coverage_improvement: "Interest Coverage Up",
  asset_turnover_improvement: "Asset Turnover Up",
};

export default function TurnaroundIndicator({ symbol = "TATAMOTORS" }: TurnaroundProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTurnaround() {
      try {
        const res = await fetch("/api/math-engine/turnaround", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...MOCK_INPUT, symbol }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTurnaround();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Turnaround Indicator</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Turnaround Indicator</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const score = data.turnaround_score || 0;
  const signalCount = data.signal_count || 0;
  const signals = data.signals || {};
  const dilutionWarning = data.dilution_warning || false;

  const statusLabel =
    score >= 80 ? "HIGH CONVICTION" :
    score >= 70 ? "TURNAROUND WATCH" :
    score >= 50 ? "EARLY STAGE" :
    score >= 30 ? "PROGRESSING" :
    "NOT DETECTED";

  const statusColor =
    score >= 80 ? "text-green-500" :
    score >= 70 ? "text-amber-500" :
    score >= 50 ? "text-yellow-500" :
    "text-red-500";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Turnaround Indicator — {data.symbol}</CardTitle>
        <Badge variant="outline" className={statusColor}>{statusLabel}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{score}/100</div>
          <div className="text-sm text-muted-foreground">
            {signalCount} of {Object.keys(signals).length} signals detected
          </div>
        </div>

        {/* Score Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              score >= 80 ? "bg-green-500" :
              score >= 70 ? "bg-amber-500" :
              score >= 50 ? "bg-yellow-500" :
              "bg-red-500"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Dilution Warning */}
        {dilutionWarning && (
          <div className="text-xs p-2 rounded border bg-red-500/10 border-red-500/30 text-red-500">
            ⚠️ IBC/NCLT Dilution Warning: Share count increased &gt;10% — turnaround may not benefit equity holders
          </div>
        )}

        {/* Signal Cards */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Signal Detection</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(signals).map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center gap-2 p-2 rounded border text-xs ${
                  value
                    ? "bg-green-500/10 border-green-500/30 text-green-500"
                    : "bg-muted/30 border-border text-muted-foreground"
                }`}
              >
                <span>{value ? "✅" : "⬜"}</span>
                <span>{SIGNAL_LABELS[key] || key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Rules */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Alert Rules</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div>• Score &gt; 70 + 2+ green signals → "Turnaround Watch"</div>
            <div>• Score &gt; 80 + FCF positive → "High Conviction Turnaround"</div>
            <div>• Score drops &gt; 15 points → "Turnaround Risk" alert</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline">Set Alert</Button>
          <Button size="sm" variant="outline">Add to Watchlist</Button>
        </div>
      </CardContent>
    </Card>
  );
}