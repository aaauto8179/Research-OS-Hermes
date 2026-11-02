"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioAnalyticsProps {
  symbol?: string;
}

const MOCK_INPUT = {
  portfolio_values: [100, 102, 101, 105, 108, 110, 107, 112, 115, 118],
  benchmark_values: [100, 101, 100, 103, 105, 107, 106, 109, 111, 113],
  cash_flows: [] as [string, number][],
  risk_free_rate: 0.07,
};

export default function PortfolioAnalytics({ symbol = "PORTFOLIO" }: PortfolioAnalyticsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res = await fetch("/api/math-engine/portfolio", {
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
    fetchPortfolio();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Portfolio Analytics</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Portfolio Analytics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const formatPct = (val: number) => (val * 100).toFixed(2) + "%";
  const formatNum = (val: number) => val.toFixed(4);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Portfolio Analytics — {symbol}</CardTitle>
        <Badge variant="outline">Brent-Dekker XIRR</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Returns */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Returns</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">TWR</div>
              <div className="text-sm font-medium">{formatPct(data.twr)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">XIRR</div>
              <div className="text-sm font-medium">{formatPct(data.xirr)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Annualized</div>
              <div className="text-sm font-medium">{formatPct(data.annualized_return)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Excess Return</div>
              <div className={`text-sm font-medium ${data.excess_return >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatPct(data.excess_return)}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Risk Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Volatility (Ann.)</div>
              <div className="text-sm font-medium">{formatPct(data.volatility)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Beta</div>
              <div className="text-sm font-medium">{formatNum(data.beta)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
              <div className="text-sm font-medium">{formatNum(data.sharpe_ratio)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Sortino Ratio</div>
              <div className="text-sm font-medium">{formatNum(data.sortino_ratio)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Max Drawdown</div>
              <div className="text-sm font-medium text-red-500">{formatPct(data.max_drawdown)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Max DD Duration</div>
              <div className="text-sm font-medium">{data.max_drawdown_duration} days</div>
            </div>
          </div>
        </div>

        {/* Period Returns */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Period Returns</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">MTD</div>
              <div className="text-sm font-medium">{formatPct(data.mtd)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">YTD</div>
              <div className="text-sm font-medium">{formatPct(data.ytd)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">1Y</div>
              <div className="text-sm font-medium">{formatPct(data.one_year)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">3Y</div>
              <div className="text-sm font-medium">{formatPct(data.three_year)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">5Y</div>
              <div className="text-sm font-medium">{formatPct(data.five_year)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30 text-center">
              <div className="text-xs text-muted-foreground">Since Inception</div>
              <div className="text-sm font-medium">{formatPct(data.since_inception)}</div>
            </div>
          </div>
        </div>

        {/* Audit Info */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Audit Trail</summary>
          <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
            {JSON.stringify({
              inputs_hash: data.inputs_hash,
              calculation_timestamp: data.calculation_timestamp,
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}