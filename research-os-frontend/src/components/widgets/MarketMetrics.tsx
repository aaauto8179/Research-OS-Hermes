"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, DollarSign, LineChart, Gauge, Activity } from "lucide-react";

interface MarketMetricsProps {
  forceRefresh?: boolean;
}

const MOCK_MARKET_METRICS = [
  { code: "NIFTY50", name: "NIFTY 50", value: 24850, change: 1.2, changePct: 0.49, trend: "up", sparkline: [24200, 24350, 24500, 24650, 24700, 24800, 24820, 24850] },
  { code: "NIFTY_NEXT50", name: "NIFTY Next 50", value: 58200, change: 0.8, changePct: 0.38, trend: "up", sparkline: [57200, 57500, 57800, 58000, 58100, 58150, 58180, 58200] },
  { code: "NIFTY_MIDCAP150", name: "NIFTY Midcap 150", value: 18500, change: 1.5, changePct: 0.82, trend: "up", sparkline: [17800, 18000, 18200, 18300, 18400, 18450, 18480, 18500] },
  { code: "NIFTY_SMALLCAP250", name: "NIFTY Smallcap 250", value: 12800, change: 2.1, changePct: 1.67, trend: "up", sparkline: [12200, 12350, 12500, 12600, 12680, 12720, 12760, 12800] },
  { code: "SENSEX", name: "S&P BSE Sensex", value: 81500, change: 1.1, changePct: 0.36, trend: "up", sparkline: [79800, 80200, 80800, 81100, 81300, 81400, 81450, 81500] },
  { code: "NIFTY_PE", name: "NIFTY P/E", value: 22.8, change: -0.2, changePct: -0.87, trend: "down", sparkline: [23.2, 23.0, 22.9, 22.8, 22.7, 22.8, 22.8, 22.8] },
  { code: "NIFTY_PB", name: "NIFTY P/B", value: 3.8, change: 0.0, changePct: 0.0, trend: "neutral", sparkline: [3.7, 3.75, 3.78, 3.8, 3.8, 3.8, 3.8, 3.8] },
  { code: "BUFFETT_INDIA", name: "MCap/GDP (Buffett)", value: 1.12, change: 0.02, changePct: 1.8, trend: "up", sparkline: [1.05, 1.07, 1.08, 1.10, 1.11, 1.115, 1.118, 1.12] },
];

const trendColors = { up: "text-green-600 bg-green-500/10", down: "text-red-600 bg-red-500/10", neutral: "text-gray-600 bg-gray-500/10" };
const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };

export default function MarketMetrics({ forceRefresh = false }: MarketMetricsProps) {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch("/api/data-ingestion/market-metrics");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setMetrics(json.metrics || MOCK_MARKET_METRICS);
      } catch (e: any) {
        setError(e.message);
        setMetrics(MOCK_MARKET_METRICS);
      } finally {
        setLoading(false);
        setLastUpdated(new Date());
      }
    }
    fetchMetrics();
  }, [forceRefresh]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Market Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && metrics.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Market Metrics</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Market Metrics</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "Loading..."}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => {
            const TrendIcon = trendIcons[m.trend as keyof typeof trendIcons] || Minus;
            const colorClass = trendColors[m.trend as keyof typeof trendColors] || trendColors.neutral;
            return (
              <div key={m.code} className="p-3 rounded-lg bg-muted/30 border-l-4" style={{ borderLeftColor: m.trend === "up" ? "green" : m.trend === "down" ? "red" : "gray" }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm truncate">{m.name}</h4>
                  <Badge variant={m.trend === "up" ? "default" : m.trend === "down" ? "destructive" : "secondary"} className="text-xs">
                    <TrendIcon className="inline h-3 w-3 mr-1" />
                    {m.changePct >= 0 ? "+" : ""}{m.changePct.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xl font-bold tabular-nums">{typeof m.value === "number" && m.value > 1000 ? m.value.toLocaleString() : m.value}</span>
                </div>
                <div className="h-10 w-full">
                  <Sparkline data={m.sparkline} color={m.trend === "up" ? "green" : m.trend === "down" ? "red" : "gray"} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100 / (data.length - 1);

  return (
    <svg viewBox="0 0 100 16" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={data.map((d, i) => `${i * width},${16 - ((d - min) / range) * 14}`).join(" ")}
      />
      <circle cx={95} cy={16 - ((data[data.length - 1] - min) / range) * 14} r="2" fill={color} />
    </svg>
  );
}