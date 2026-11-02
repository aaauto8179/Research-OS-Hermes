"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ExcessReturnProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  book_value_per_share: 420,
  roe: 0.17,
  cost_of_equity: 0.12,
  growth_rate: 0.12,
  payout_ratio: 0.35,
  comprehensive_income_adj: 5000,
  omega: 0.6,
  forecast_years: 5,
};

export default function ExcessReturnValuation({ symbol = "RELIANCE" }: ExcessReturnProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExcessReturn() {
      try {
        const res = await fetch("/api/math-engine/excess-return", {
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
    fetchExcessReturn();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Excess Return (Residual Income)</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Excess Return (Residual Income)</CardTitle></CardHeader>
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
        <CardTitle>Excess Return Valuation — {data.symbol}</CardTitle>
        <Badge variant="outline">Ohlson Persistence</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Result */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded border bg-primary/5">
            <div className="text-xs text-muted-foreground">Fair Value per Share</div>
            <div className="text-lg font-bold">₹{data.fair_value_per_share?.toFixed(0)}</div>
          </div>
          <div className="p-3 rounded border bg-primary/5">
            <div className="text-xs text-muted-foreground">PV of Residual Income</div>
            <div className="text-lg font-bold">₹{data.pv_residual_income?.toFixed(0)}</div>
          </div>
        </div>

        {/* Clean Surplus Adjustment */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Clean Surplus (Ind AS)</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Book Value per Share</span>
              <span>₹{MOCK_INPUT.book_value_per_share}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">OCI Adjustment (Ind AS 19/109)</span>
              <span className="text-green-500">+₹{MOCK_INPUT.comprehensive_income_adj}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Comprehensive Income ROE</span>
              <span>{(MOCK_INPUT.roe * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Residual Income Details */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Residual Income Components</h4>
          <div className="space-y-1 text-xs">
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
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Ohlson Persistence (ω)</span>
              <span>{MOCK_INPUT.omega}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Terminal RI (ω-based)</span>
              <span>₹{data.terminal_ri?.toFixed(0) || "N/A"}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-bold">
              <span>Fair Value per Share</span>
              <span>₹{data.fair_value_per_share?.toFixed(0)}</span>
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