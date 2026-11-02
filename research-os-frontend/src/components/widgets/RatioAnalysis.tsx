"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RatioItem {
  name: string;
  value: number | string;
  unit: string;
}

interface RatioAnalysisProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  entity_type: "COMMERCIAL_CORPORATE",
  revenue: 974819,
  cogs: 745000,
  ebitda: 168000,
  ebit: 142000,
  pat: 79020,
  interest_expense: 8500,
  tax_expense: 22000,
  total_assets: 1850000,
  current_assets: 320000,
  cash_investments: 180000,
  inventory: 45000,
  receivables: 95000,
  total_equity: 850000,
  total_debt: 380000,
  lease_liabilities: 25000,
  current_liabilities: 280000,
  payables: 65000,
  market_cap: 19500000,
  cmp: 2890,
  shares_outstanding: 676.5,
  cfo: 145000,
  capex: 55000,
  avg_total_assets: 1750000,
  avg_equity: 820000,
  avg_inventory: 42000,
  avg_receivables: 90000,
  avg_payables: 60000,
  avg_net_fixed_assets: 950000,
  revenue_prev: 890000,
  ebitda_prev: 155000,
  pat_prev: 72000,
  eps_prev: 106.4,
  eps: 116.8,
  growth_years: 1,
  dividend_per_share: 10.0,
};

function valueColor(value: number | string): string {
  if (typeof value === "string") {
    if (value === "NM") return "text-red-500";
    if (value === "NET_CASH") return "text-green-500";
    if (value === "INFINITY") return "text-green-500";
    return "text-muted-foreground";
  }
  return "text-foreground";
}

function formatValue(value: number | string, unit: string): string {
  if (typeof value === "string") return value;
  if (unit === "pct") return (value * 100).toFixed(1) + "%";
  if (unit === "times") return value.toFixed(2) + "x";
  return value.toFixed(2);
}

export default function RatioAnalysis({ symbol = "RELIANCE" }: RatioAnalysisProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRatios() {
      try {
        const res = await fetch("/api/math-engine/ratio-analysis", {
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
    fetchRatios();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Ratio Analysis</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Ratio Analysis</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const ratios = data.ratios || {};
  const dupont = data.dupont || {};
  const distressFlags = data.distress_flags || [];

  const categoryLabels: Record<string, string> = {
    profitability: "Profitability",
    leverage: "Leverage",
    liquidity: "Liquidity",
    efficiency: "Efficiency",
    valuation: "Valuation",
    growth: "Growth",
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ratio Analysis — {data.symbol}</CardTitle>
        <Badge variant="outline">{data.entity_type}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Distress Flags */}
        {distressFlags.length > 0 && (
          <div className="space-y-1">
            {distressFlags.map((flag: any, i: number) => (
              <div
                key={i}
                className={`text-xs p-2 rounded border ${
                  flag.severity === "CRITICAL"
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : flag.severity === "HIGH"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                }`}
              >
                <span className="font-semibold">{flag.type}:</span> {flag.message}
              </div>
            ))}
          </div>
        )}

        {/* Ratio Categories */}
        {Object.entries(categoryLabels).map(([key, label]) => {
          const items = ratios[key] || [];
          if (items.length === 0) return null;
          return (
            <div key={key}>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">{label}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {items.map((item: RatioItem, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded bg-muted/30">
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className={`text-sm font-medium ${valueColor(item.value)}`}>
                      {formatValue(item.value, item.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* DuPont Decomposition */}
        {dupont.status === "COMPUTED" && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">DuPont Decomposition</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground">Net Margin</div>
                <div className="text-sm font-medium">{(dupont.netMargin * 100).toFixed(1)}%</div>
              </div>
              <div className="p-2 rounded bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground">Asset Turnover</div>
                <div className="text-sm font-medium">{dupont.assetTurnover.toFixed(2)}x</div>
              </div>
              <div className="p-2 rounded bg-muted/30 text-center">
                <div className="text-xs text-muted-foreground">Fin. Leverage</div>
                <div className="text-sm font-medium">{dupont.financialLeverage.toFixed(2)}x</div>
              </div>
            </div>
            <div className="mt-2 text-center text-sm font-bold">
              ROE = {(dupont.roe * 100).toFixed(1)}%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}