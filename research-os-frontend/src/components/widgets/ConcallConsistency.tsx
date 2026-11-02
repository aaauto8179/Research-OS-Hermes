"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ConcallConsistencyProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  guidance_items: [
    { type: "revenue", lower: 950000, upper: 980000, actual: 974819, period: 1 },
    { type: "margin", lower: 17, upper: 19, actual: 17.2, period: 2 },
    { type: "capex", lower: 50000, upper: 55000, actual: 52000, period: 3 },
    { type: "qualitative", lower: 0, upper: 1, actual: 1, period: 4 },
  ],
  lambda_decay: 0.85,
};

const STATUS_COLOR: Record<string, string> = {
  BEAT: "text-green-500 bg-green-500/10 border-green-500/30",
  MET: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  MISS: "text-red-500 bg-red-500/10 border-red-500/30",
};

export default function ConcallConsistency({ symbol = "RELIANCE" }: ConcallConsistencyProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConcall() {
      try {
        const res = await fetch("/api/math-engine/concall-consistency", {
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
    fetchConcall();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Concall Consistency</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Concall Consistency</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const items = data.item_scores || [];
  const weightedScore = data.weighted_score || 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Concall Consistency — {data.symbol}</CardTitle>
        <Badge variant="outline">
          Score: {(weightedScore * 100).toFixed(0)}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-green-500 font-bold">{data.beat_count}</span>
            <span className="text-muted-foreground">Beat</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-500 font-bold">{data.met_count}</span>
            <span className="text-muted-foreground">Met</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-500 font-bold">{data.miss_count}</span>
            <span className="text-muted-foreground">Miss</span>
          </div>
        </div>

        {/* Item Scores */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Guidance vs Actual</h4>
          <div className="space-y-2">
            {items.map((item: any, i: number) => (
              <div key={i} className="p-2 rounded border bg-muted/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium capitalize">{item.type}</span>
                  <Badge variant="outline" className={`text-xs ${STATUS_COLOR[item.status] || ""}`}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Guidance: {item.lower}–{item.upper}</span>
                  <span>Actual: {item.actual}</span>
                  <span>Weight: {(item.weight * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weighted Score Bar */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Weighted Consistency Score</h4>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                weightedScore >= 0.7 ? "bg-green-500" :
                weightedScore >= 0.4 ? "bg-amber-500" :
                "bg-red-500"
              }`}
              style={{ width: `${weightedScore * 100}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Time-decay weighted (λ=0.85). Weights: Revenue/Volume 30%, Margins 35%, Capex 20%, Qualitative 15%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}