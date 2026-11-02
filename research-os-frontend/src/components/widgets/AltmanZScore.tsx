"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AltmanZProps {
  symbol?: string;
}

const MOCK_INPUT = {
  x1: 0.15,
  x2: 0.25,
  x3: 0.08,
  x4: 0.5,
  x5: 1.2,
  model: "original",
  is_manufacturing: true,
  total_liabilities: 1000000,
  total_assets: 1850000,
};

export default function AltmanZScore({ symbol = "RELIANCE" }: AltmanZProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAltman() {
      try {
        const res = await fetch("/api/math-engine/altman", {
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
    fetchAltman();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Altman Z-Score</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Altman Z-Score</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const zScore = data.z_score || 0;
  const zone = data.zone || "GREY";
  const thresholds = data.thresholds || { distress: 1.81, grey_upper: 2.99 };

  const zoneColor =
    zone === "SAFE" ? "text-green-500" :
    zone === "GREY" ? "text-amber-500" :
    "text-red-500";

  const zoneBg =
    zone === "SAFE" ? "bg-green-500/10 border-green-500/30" :
    zone === "GREY" ? "bg-amber-500/10 border-amber-500/30" :
    "bg-red-500/10 border-red-500/30";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Altman Z-Score — {data.symbol}</CardTitle>
        <Badge variant="outline" className={`${zoneColor} ${zoneBg}`}>
          {zone}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Z-Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{zScore.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            Model: {MOCK_INPUT.model} | {zone === "SAFE" ? "Safe" : zone === "GREY" ? "Grey Zone" : "Distress"}
          </div>
        </div>

        {/* Threshold Zones */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Zone Thresholds</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded border text-center ${zScore < thresholds.distress ? "bg-red-500/10 border-red-500/30" : "bg-muted/30 border-border"}`}>
              <div className="font-semibold text-red-500">DISTRESS</div>
              <div className="text-muted-foreground">&lt; {thresholds.distress}</div>
            </div>
            <div className={`p-2 rounded border text-center ${zScore >= thresholds.distress && zScore <= thresholds.grey_upper ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/30 border-border"}`}>
              <div className="font-semibold text-amber-500">GREY</div>
              <div className="text-muted-foreground">{thresholds.distress} - {thresholds.grey_upper}</div>
            </div>
            <div className={`p-2 rounded border text-center ${zScore > thresholds.grey_upper ? "bg-green-500/10 border-green-500/30" : "bg-muted/30 border-border"}`}>
              <div className="font-semibold text-green-500">SAFE</div>
              <div className="text-muted-foreground">&gt; {thresholds.grey_upper}</div>
            </div>
          </div>
        </div>

        {/* X Components */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">X Components</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">X1 (Working Capital / TA)</span>
              <span>{MOCK_INPUT.x1.toFixed(3)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">X2 (Retained Earnings / TA)</span>
              <span>{MOCK_INPUT.x2.toFixed(3)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">X3 (EBIT / TA)</span>
              <span>{MOCK_INPUT.x3.toFixed(3)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">X4 (Equity / Total Liabilities)</span>
              <span>{MOCK_INPUT.x4.toFixed(3)}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">X5 (Sales / TA)</span>
              <span>{MOCK_INPUT.x5.toFixed(3)}</span>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Model Variants</div>
          <div>• Original (Manufacturing): Z = 1.2X1 + 1.4X2 + 3.3X3 + 0.6X4 + 1.0X5</div>
          <div>• Revised (Private): Z' = 0.717X1 + 0.847X2 + 3.107X3 + 0.420X4 + 0.998X5</div>
          <div>• Emerging Markets: Z'' = 6.56X1 + 3.26X2 + 6.72X3 + 1.05X4 + 3.25</div>
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