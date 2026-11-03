"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Gauge, Activity, Star, Bell } from "lucide-react";

interface MacroDashboardProps {
  forceRefresh?: boolean;
}

const MOCK_INDICATORS = [
  { code: "GDP_GROWTH", name: "Real GDP Growth (YoY%)", value: 7.8, unit: "%", frequency: "QUARTERLY", source: "MOSPI", trend: "up", percentile: 65, sparkline: [6.2, 6.8, 7.1, 7.5, 7.2, 7.8, 7.6, 7.8] },
  { code: "REPO_RATE", name: "RBI Repo Rate", value: 6.5, unit: "%", frequency: "DAILY", source: "RBI", trend: "neutral", percentile: 62, sparkline: [4.0, 4.4, 4.9, 5.4, 5.9, 6.25, 6.5, 6.5] },
  { code: "CPI_INFLATION", name: "CPI Inflation", value: 5.1, unit: "%", frequency: "MONTHLY", source: "MOSPI", trend: "down", percentile: 45, sparkline: [7.4, 7.0, 6.7, 6.2, 5.7, 5.1, 4.8, 5.1] },
  { code: "GS10_YIELD", name: "10Y G-Sec Yield", value: 7.05, unit: "%", frequency: "DAILY", source: "RBI", trend: "up", percentile: 58, sparkline: [7.3, 7.2, 7.1, 7.0, 7.05, 7.1, 7.08, 7.05] },
  { code: "USD_INR", name: "USD/INR", value: 83.12, unit: "₹", frequency: "DAILY", source: "RBI", trend: "down", percentile: 72, sparkline: [82.8, 83.1, 83.2, 83.0, 82.9, 83.1, 83.05, 83.12] },
  { code: "BRENT_CRUDE", name: "Brent Crude Oil", value: 84.5, unit: "$/bbl", frequency: "DAILY", source: "TRADING_ECONOMICS", trend: "up", percentile: 55, sparkline: [78, 80, 82, 81, 83, 84, 84.2, 84.5] },
];

const MOCK_REGIMES = [
  { title: "Growth Regime", value: "Above Trend", description: "GDP growth above potential, credit growth healthy", color: "green" },
  { title: "Inflation Regime", value: "Moderate", description: "CPI within RBI target band, core inflation easing", color: "green" },
  { title: "Monetary Regime", value: "Restrictive", description: "Repo rate at 6.5%, real rates positive", color: "yellow" },
  { title: "Valuation Regime", value: "Fair to Rich", description: "NIFTY P/E near 10Y median, mid/small rich", color: "yellow" },
  { title: "External Regime", value: "Stable", description: "CAD manageable, reserves adequate, INR stable", color: "green" },
  { title: "Corporate Earnings", value: "Strong", description: "NIFTY earnings growth 15%+ YoY, broad-based", color: "green" },
];

const MOCK_ALLOCATIONS = [
  { asset: "Equity (Large Cap)", stance: "Overweight", rationale: "Earnings momentum, reasonable valuations", color: "green" },
  { asset: "Equity (Mid/Small)", stance: "Neutral", rationale: "Rich valuations, selective opportunities", color: "yellow" },
  { asset: "Equity (Banking)", stance: "Overweight", rationale: "Credit growth, asset quality improvement", color: "green" },
  { asset: "Debt (Short Duration)", stance: "Overweight", rationale: "Attractive carry, rate cut optionality", color: "green" },
  { asset: "Gold", stance: "Neutral", rationale: "Hedge against external shocks", color: "yellow" },
  { asset: "Cash", stance: "Underweight", rationale: "Deploy on corrections", color: "red" },
];

const MOCK_RISKS = [
  { risk: "Monsoon failure", impact: "High", probability: "Medium", desc: "Rural demand, food inflation" },
  { risk: "Global recession", impact: "High", probability: "Low", desc: "Export demand, risk-off flows" },
  { risk: "Geopolitical escalation", impact: "Medium", probability: "Medium", desc: "Oil prices, supply chains" },
  { risk: "Fiscal slippage", impact: "Medium", probability: "Low", desc: "Bond yields, crowding out" },
  { risk: "Regulatory uncertainty", impact: "Medium", probability: "Medium", desc: "Sector-specific (fintech, gaming, crypto)" },
];

const trendColors = { up: "text-green-600", down: "text-red-600", neutral: "text-gray-600" };
const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };

const colors = {
  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "default" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", badge: "secondary" },
  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "destructive" },
};

export default function MacroDashboard({ forceRefresh = false }: MacroDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/data-ingestion/macro-dashboard");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message);
        setData({
          indicators: MOCK_INDICATORS,
          regimes: MOCK_REGIMES,
          allocations: MOCK_ALLOCATIONS,
          risks: MOCK_RISKS,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [forceRefresh]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Macro Dashboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Macro Dashboard</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const { indicators, regimes, allocations, risks } = data || {};

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Macro Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Indicators Grid */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Gauge className="h-4 w-4" /> Key Indicators
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {indicators?.map((ind: any) => (
                <div key={ind.code} className="p-3 rounded-lg bg-muted/30 border-l-4" style={{ borderLeftColor: ind.trend === "up" ? "green" : ind.trend === "down" ? "red" : "gray" }}>
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-xs truncate">{ind.name}</h5>
                    <Badge variant="outline" className="text-[10px]">{ind.frequency}</Badge>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-lg font-bold tabular-nums">{ind.value}</span>
                    <span className="text-sm text-muted-foreground">{ind.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={trendColors[ind.trend as keyof typeof trendColors] || trendColors.neutral}>
                      {(trendIcons[ind.trend as keyof typeof trendIcons] || Minus) as any}
                      {ind.trend === "up" ? "Rising" : ind.trend === "down" ? "Falling" : "Stable"}
                    </span>
                    <span className="text-muted-foreground">{ind.percentile}th %ile</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regime Assessment */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Regime Assessment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {regimes?.map((r: any) => {
                const c = colors[r.color as keyof typeof colors] || colors.yellow;
                return (
                  <div key={r.title} className={`p-3 rounded-lg border ${c.bg} ${c.border}`}>
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm">{r.title}</h5>
                      <Badge variant={c.badge as "default" | "secondary" | "destructive" | "outline"} className="text-xs">{r.value}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Asset Allocation */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" /> Allocation Implications
            </h4>
            <div className="space-y-2">
              {allocations?.map((a: any) => {
                const c = colors[a.color as keyof typeof colors] || colors.yellow;
                return (
                  <div key={a.asset} className={`p-3 rounded-lg border ${c.bg} ${c.border} flex items-center justify-between`}>
                    <div>
                      <p className="font-medium text-sm">{a.asset}</p>
                      <p className="text-xs text-muted-foreground">{a.rationale}</p>
                    </div>
                    <Badge variant={c.badge as "default" | "secondary" | "destructive" | "outline"}>{a.stance}</Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Risks */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" /> Key Risks
            </h4>
            <div className="space-y-2">
              {risks?.map((r: any) => {
                const impactColors = { High: "text-red-600", Medium: "text-yellow-600", Low: "text-green-600" };
                const probColors = { High: "text-red-600", Medium: "text-yellow-600", Low: "text-green-600" };
                return (
                  <div key={r.risk} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{r.risk}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">Impact: <span className={impactColors[r.impact as keyof typeof impactColors]} font-medium>{r.impact}</span></p>
                      <p className="text-xs">Probability: <span className={probColors[r.probability as keyof typeof probColors]} font-medium>{r.probability}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}