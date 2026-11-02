"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PiotroskiProps {
  symbol?: string;
}

const MOCK_INPUT = {
  roa_positive: true,
  cfo_positive: true,
  roa_improving: true,
  accruals_quality: true,
  leverage_decreasing: true,
  liquidity_improving: false,
  no_dilution: true,
  margin_improving: true,
  turnover_improving: false,
};

const COMPONENT_LABELS: Record<string, string> = {
  roa_positive: "ROA Positive",
  cfo_positive: "CFO Positive",
  roa_improving: "ROA Improving",
  accruals_quality: "Accruals Quality (CFO > ROA)",
  leverage_decreasing: "Leverage Decreasing",
  liquidity_improving: "Liquidity Improving",
  no_dilution: "No Dilution",
  margin_improving: "Margin Improving",
  turnover_improving: "Turnover Improving",
};

export default function PiotroskiFScore({ symbol = "RELIANCE" }: PiotroskiProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPiotroski() {
      try {
        const res = await fetch("/api/math-engine/piotroski", {
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
    fetchPiotroski();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Piotroski F-Score</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Piotroski F-Score</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const fScore = data.f_score || 0;
  const interpretation = data.interpretation || "MODERATE_QUALITY";
  const components = data.components || {};

  const interpColor =
    interpretation === "HIGH_QUALITY" ? "text-green-500" :
    interpretation === "MODERATE_QUALITY" ? "text-amber-500" :
    "text-red-500";

  const interpBg =
    interpretation === "HIGH_QUALITY" ? "bg-green-500/10 border-green-500/30" :
    interpretation === "MODERATE_QUALITY" ? "bg-amber-500/10 border-amber-500/30" :
    "bg-red-500/10 border-red-500/30";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Piotroski F-Score — {data.symbol}</CardTitle>
        <Badge variant="outline" className={`${interpColor} ${interpBg}`}>
          {interpretation.replace(/_/g, " ")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* F-Score Display */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{fScore}/9</div>
          <div className="flex-1">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  fScore >= 7 ? "bg-green-500" :
                  fScore >= 4 ? "bg-amber-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${(fScore / 9) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 9 Criteria */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">9 Criteria (0/1 each)</h4>
          <div className="grid grid-cols-1 gap-1">
            {Object.entries(COMPONENT_LABELS).map(([key, label]) => {
              const value = components[key] || 0;
              return (
                <div key={key} className={`flex justify-between items-center p-1.5 rounded ${value ? "bg-green-500/10" : "bg-muted/30"}`}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className={`text-sm font-medium ${value ? "text-green-500" : "text-muted-foreground"}`}>
                    {value ? "✓" : "✗"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Notes */}
        <div className="text-xs text-muted-foreground p-2 rounded bg-muted/30">
          <div className="font-semibold mb-1">Piotroski (2000) Notes</div>
          <div>• LEVER uses LT Debt / Avg Total Assets (not D/E) to avoid negative equity distortion</div>
          <div>• Share count normalized for bonus/split corporate actions</div>
          <div>• IT/Services: Gross Profit = Revenue - Employee Exp - Subcontracting</div>
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