"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface BankingValuationProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "HDFCBANK",
  current_price: 1650,
  book_value_per_share: 420,
  roe: 0.17,
  cost_of_equity: 0.12,
  growth_rate: 0.12,
  terminal_growth: 0.04,
  net_npa_per_share: 12,
  net_dta_per_share: 8,
  payout_ratio: 0.25,
  forecast_years: 5,
};

export default function BankingValuation({ symbol = "HDFCBANK" }: BankingValuationProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBanking() {
      try {
        const res = await fetch("/api/math-engine/banking", {
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
    fetchBanking();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Banking Valuation (ABVPS)</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Banking Valuation (ABVPS)</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Banking Valuation — {data.symbol}</CardTitle>
        <Badge variant="outline">ABVPS + Residual Income</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded border bg-primary/5">
            <div className="text-xs text-muted-foreground">Adjusted BVPS (ABVPS)</div>
            <div className="text-lg font-bold">₹{data.abvps?.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">BVPS - Net NPA + Net DTA</div>
          </div>
          <div className="p-3 rounded border bg-primary/5">
            <div className="text-xs text-muted-foreground">Fair Value per Share</div>
            <div className="text-lg font-bold">₹{data.fair_value_per_share?.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">Residual Income Model</div>
          </div>
        </div>

        {/* Valuation Details */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Valuation Components</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Book Value per Share</span>
              <span>₹{MOCK_INPUT.book_value_per_share}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Net NPA per Share</span>
              <span className="text-red-500">-₹{MOCK_INPUT.net_npa_per_share}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Plus: Net DTA per Share</span>
              <span className="text-green-500">+₹{MOCK_INPUT.net_dta_per_share}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-semibold">
              <span>ABVPS</span>
              <span>₹{data.abvps?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">ROE</span>
              <span>{(MOCK_INPUT.roe * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Cost of Equity</span>
              <span>{(MOCK_INPUT.cost_of_equity * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Excess Return (ROE - CoE)</span>
              <span className={MOCK_INPUT.roe > MOCK_INPUT.cost_of_equity ? "text-green-500" : "text-red-500"}>
                {((MOCK_INPUT.roe - MOCK_INPUT.cost_of_equity) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Residual Income */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Residual Income Model</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Terminal Value (Ohlson)</span>
              <span>₹{data.terminal_value?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">PV of Residual Income</span>
              <span>₹{data.pv_residual_income?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-bold">
              <span>Fair Value per Share</span>
              <span>₹{data.fair_value_per_share?.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Premium/Discount */}
        <div className="p-2 rounded bg-muted/30 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Price</span>
            <span>₹{MOCK_INPUT.current_price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fair Value</span>
            <span>₹{data.fair_value_per_share?.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Premium/(Discount)</span>
            <span className={data.fair_value_per_share > MOCK_INPUT.current_price ? "text-green-500" : "text-red-500"}>
              {(((data.fair_value_per_share / MOCK_INPUT.current_price) - 1) * 100).toFixed(1)}%
            </span>
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