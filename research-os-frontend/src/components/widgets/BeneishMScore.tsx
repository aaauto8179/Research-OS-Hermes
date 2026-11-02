"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface BeneishProps {
  symbol?: string;
}

const MOCK_INPUT = {
  dsri: 1.05,
  gmi: 1.02,
  aqi: 1.01,
  sgi: 1.12,
  depi: 0.98,
  sgai: 1.03,
  tata: 0.04,
  lvgi: 1.05,
};

export default function BeneishMScore({ symbol = "RELIANCE" }: BeneishProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBeneish() {
      try {
        const res = await fetch("/api/math-engine/beneish", {
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
    fetchBeneish();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Beneish M-Score</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Beneish M-Score</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const mScore = data.m_score || 0;
  const isManipulation = mScore > -1.78;
  const components = data.components || {};

  const componentLabels: Record<string, string> = {
    dsri: "DSRI (Days Sales Receivables)",
    gmi: "GMI (Gross Margin Index)",
    aqi: "AQI (Asset Quality Index)",
    sgi: "SGI (Sales Growth Index)",
    depi: "DEPI (Depreciation Index)",
    sgai: "SGAI (SG&A Index)",
    tata: "TATA (Total Accruals)",
    lvgi: "LVGI (Leverage Index)",
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Beneish M-Score — {data.symbol}</CardTitle>
        <Badge variant="outline" className={isManipulation ? "text-red-500 bg-red-500/10 border-red-500/30" : "text-green-500 bg-green-500/10 border-green-500/30"}>
          {isManipulation ? "MANIPULATION LIKELY" : "MANIPULATION UNLIKELY"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* M-Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{mScore.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            Threshold: -1.78 | {isManipulation ? "Above threshold" : "Below threshold"}
          </div>
        </div>

        {/* Component Breakdown */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Component Breakdown</h4>
          <div className="space-y-1">
            {Object.entries(components).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between items-center p-1.5 rounded bg-muted/30">
                <span className="text-xs text-muted-foreground">{componentLabels[key] || key}</span>
                <span className="text-sm font-medium">{value?.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formula */}
        <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Beneish (1999) Formula</div>
          <div>M = -4.84 + 0.920×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI + 0.115×DEPI - 0.172×SGAI + 4.679×TATA - 0.327×LVGI</div>
          <div className="mt-1">GMI clamped to [0.1, 5.0] | LVGI = Leverage_t / Leverage_prev</div>
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