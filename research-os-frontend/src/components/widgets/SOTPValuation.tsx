"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface SOTPValuationProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  segments: [
    { name: "O2C", value: 450000, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 1.0, holdco_discount: 0.0 },
    { name: "Retail", value: 350000, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 0.67, holdco_discount: 0.30 },
    { name: "Digital/Jio", value: 500000, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 0.67, holdco_discount: 0.30 },
    { name: "Upstream", value: 80000, valuation_level: "EQUITY_VALUE", effective_stake_pct: 1.0, holdco_discount: 0.0 },
  ],
  consolidated_net_debt: 380000,
  parent_standalone_debt: 50000,
  minority_interest: 0,
  liquid_assets: 180000,
  diluted_shares: 676.5,
  holdco_discount_range: [0.20, 0.30, 0.40, 0.50, 0.60],
};

export default function SOTPValuation({ symbol = "RELIANCE" }: SOTPValuationProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSOTP() {
      try {
        const res = await fetch("/api/math-engine/sotp", {
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
    fetchSOTP();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>SOTP Valuation</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>SOTP Valuation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const segmentValues = data.segment_values || [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>SOTP Valuation — {data.symbol}</CardTitle>
        <Badge variant="outline">Holdco Discount</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segment Breakdown */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Segment Values</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border text-left bg-muted">Segment</th>
                  <th className="p-2 border text-center bg-muted">Level</th>
                  <th className="p-2 border text-center bg-muted">Stake %</th>
                  <th className="p-2 border text-center bg-muted">Contributed Value</th>
                </tr>
              </thead>
              <tbody>
                {segmentValues.map((seg: any, i: number) => (
                  <tr key={i}>
                    <td className="p-2 border font-medium">{seg.name}</td>
                    <td className="p-2 border text-center">
                      <Badge variant="outline" className="text-xs">
                        {seg.valuation_level === "ENTERPRISE_VALUE" ? "EV" : "Equity"}
                      </Badge>
                    </td>
                    <td className="p-2 border text-center">{(seg.effective_stake_pct * 100).toFixed(0)}%</td>
                    <td className="p-2 border text-center font-medium">
                      ₹{(seg.contributed_value / 100).toFixed(0)} Cr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Value Bridge */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Value Bridge</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Total Segment Value</span>
              <span>₹{(data.total_segment_value / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Consolidated Net Debt</span>
              <span className="text-red-500">-₹{(MOCK_INPUT.consolidated_net_debt / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Minority Interest</span>
              <span className="text-red-500">-₹{(MOCK_INPUT.minority_interest / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Plus: Liquid Assets</span>
              <span className="text-green-500">+₹{(MOCK_INPUT.liquid_assets / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Holdco Discount</span>
              <span className="text-red-500">-₹{(data.holdco_discount_amount / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-semibold">
              <span>SOTP Equity Value</span>
              <span>₹{(data.equity_value / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-bold">
              <span>Fair Value per Share</span>
              <span>₹{data.fair_value_per_share?.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Holdco Discount Sensitivity */}
        {data.holdco_sensitivity && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Holdco Discount Sensitivity</h4>
            <div className="flex gap-2 flex-wrap">
              {MOCK_INPUT.holdco_discount_range.map((disc, i) => (
                <div key={i} className="p-2 rounded bg-muted/30 text-center">
                  <div className="text-xs text-muted-foreground">{(disc * 100).toFixed(0)}%</div>
                  <div className="text-sm font-medium">
                    ₹{data.holdco_sensitivity[i]?.fair_value_per_share?.toFixed(0) || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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