"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RelativeValuationProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  target_pe: 28.5,
  target_pb: 2.8,
  target_ev_ebitda: 18.2,
  target_ev_sales: 2.5,
  target_fcf_yield: 0.032,
  peer_pes: [22.0, 25.5, 18.0, 30.0, 24.0],
  peer_pbs: [2.1, 2.5, 1.8, 3.2, 2.3],
  peer_ev_ebitdas: [14.0, 16.5, 12.0, 20.0, 15.0],
  peer_ev_saless: [1.8, 2.2, 1.5, 2.8, 2.0],
  peer_fcf_yields: [0.04, 0.035, 0.05, 0.025, 0.045],
  target_net_debt: 380000,
  target_lease_liabilities: 25000,
  target_minority_interest: 0,
  target_liquid_assets: 180000,
  target_shares_outstanding: 676.5,
  target_ebitda: 168000,
  target_revenue: 974819,
  target_pat: 79020,
};

export default function RelativeValuation({ symbol = "RELIANCE" }: RelativeValuationProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRelative() {
      try {
        const res = await fetch("/api/math-engine/relative", {
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
    fetchRelative();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Relative Valuation</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Relative Valuation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const impliedValues = [
    { label: "P/E", multiple: "P/E", target: data.implied_pe, peer: data.peer_median_pe, method: "Harmonic Mean" },
    { label: "P/B", multiple: "P/B", target: data.implied_pb, peer: data.peer_median_pb, method: "Median" },
    { label: "EV/EBITDA", multiple: "EV/EBITDA", target: data.implied_ev_ebitda, peer: data.peer_median_ev_ebitda, method: "Median" },
    { label: "EV/Sales", multiple: "EV/Sales", target: data.implied_ev_sales, peer: data.peer_median_ev_sales, method: "Median" },
    { label: "FCF Yield", multiple: "FCF Yield", target: data.implied_fcf_yield, peer: data.peer_median_fcf_yield, method: "Median" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relative Valuation — {data.symbol}</CardTitle>
        <Badge variant="outline">EV→Equity Bridge</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Implied Values Table */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Implied Values per Share</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border text-left bg-muted">Multiple</th>
                  <th className="p-2 border text-center bg-muted">Peer Median</th>
                  <th className="p-2 border text-center bg-muted">Implied Price</th>
                  <th className="p-2 border text-center bg-muted">Method</th>
                </tr>
              </thead>
              <tbody>
                {impliedValues.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2 border font-medium">{item.label}</td>
                    <td className="p-2 border text-center">{item.peer?.toFixed(2) || "N/A"}</td>
                    <td className="p-2 border text-center font-medium">
                      {item.target ? "₹" + item.target.toFixed(0) : "N/A"}
                    </td>
                    <td className="p-2 border text-center text-muted-foreground">{item.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EV Bridge Details */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">EV → Equity Value Bridge</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Implied EV (from EV/EBITDA)</span>
              <span>{data.implied_ev ? "₹" + (data.implied_ev / 100).toFixed(0) + " Cr" : "N/A"}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Net Debt</span>
              <span className="text-red-500">-₹{(MOCK_INPUT.target_net_debt / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Lease Liabilities</span>
              <span className="text-red-500">-₹{(MOCK_INPUT.target_lease_liabilities / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Minority Interest</span>
              <span className="text-red-500">-₹{(MOCK_INPUT.target_minority_interest / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Plus: Liquid Assets</span>
              <span className="text-green-500">+₹{(MOCK_INPUT.target_liquid_assets / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-semibold">
              <span>Implied Equity Value</span>
              <span>{data.implied_equity_value ? "₹" + (data.implied_equity_value / 100).toFixed(0) + " Cr" : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Loss-Maker Handling */}
        <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Loss-Maker Handling</div>
          <div>• Peers with negative PAT excluded from P/E harmonic mean</div>
          <div>• Peers with negative EBITDA excluded from EV/EBITDA median</div>
          <div>• Loss-making targets flagged as LOSS_MAKING for valuation multiples</div>
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