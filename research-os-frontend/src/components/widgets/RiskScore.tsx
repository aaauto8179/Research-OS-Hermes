"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RiskScoreProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  promoter_pledge_pct: 0.5,
  rpt_pct_of_turnover: 3.2,
  auditor_type: "BIG4",
  debt_ebitda: 1.8,
  interest_coverage: 8.5,
  current_ratio: 1.4,
};

const CATEGORY_LABELS: Record<string, string> = {
  promoter_pledge: "Promoter Pledge",
  related_party_transactions: "Related Party Txns",
  auditor_quality: "Auditor Quality",
  leverage: "Leverage",
  liquidity: "Liquidity",
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  promoter_pledge: 0.25,
  related_party_transactions: 0.20,
  auditor_quality: 0.20,
  leverage: 0.20,
  liquidity: 0.15,
};

export default function RiskScore({ symbol = "RELIANCE" }: RiskScoreProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRiskScore() {
      try {
        const res = await fetch("/api/math-engine/risk-score", {
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
    fetchRiskScore();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Risk Score</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Risk Score</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const score = data.composite_score || 0;
  const riskLevel = data.risk_level || "MODERATE";
  const categoryScores = data.category_scores || {};

  const riskColor =
    riskLevel === "LOW" ? "text-green-500" :
    riskLevel === "MODERATE" ? "text-amber-500" :
    riskLevel === "HIGH" ? "text-orange-500" :
    "text-red-500";

  const riskBg =
    riskLevel === "LOW" ? "bg-green-500/10 border-green-500/30" :
    riskLevel === "MODERATE" ? "bg-amber-500/10 border-amber-500/30" :
    riskLevel === "HIGH" ? "bg-orange-500/10 border-orange-500/30" :
    "bg-red-500/10 border-red-500/30";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Risk Score — {data.symbol}</CardTitle>
        <Badge variant="outline" className={`${riskColor} ${riskBg}`}>
          {riskLevel} RISK
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Score */}
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold">{score}/100</div>
          <div className="flex-1">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  score <= 30 ? "bg-green-500" :
                  score <= 60 ? "bg-amber-500" :
                  score <= 75 ? "bg-orange-500" :
                  "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Category Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const catScore = categoryScores[key] || 0;
              const weight = CATEGORY_WEIGHTS[key] || 0;
              const contribution = (catScore * weight).toFixed(1);
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-xs w-36 text-muted-foreground">{label}</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        catScore <= 25 ? "bg-green-500" :
                        catScore <= 50 ? "bg-amber-500" :
                        catScore <= 75 ? "bg-orange-500" :
                        "bg-red-500"
                      }`}
                      style={{ width: `${catScore}%` }}
                    />
                  </div>
                  <span className="text-xs w-8 text-right">{catScore.toFixed(0)}</span>
                  <span className="text-xs w-12 text-right text-muted-foreground">
                    ×{(weight * 100).toFixed(0)}% = {contribution}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Thresholds */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Grade Thresholds</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2 rounded border text-center ${score <= 30 ? "bg-green-500/10 border-green-500/30" : "bg-muted/30 border-border"}`}>
              <div className="font-semibold text-green-500">LOW</div>
              <div className="text-muted-foreground">0-30</div>
            </div>
            <div className={`p-2 rounded border text-center ${score > 30 && score <= 60 ? "bg-amber-500/10 border-amber-500/30" : "bg-muted/30 border-border"}`}>
              <div className="font-semibold text-amber-500">MODERATE</div>
              <div className="text-muted-foreground">31-60</div>
            </div>
            <div className={`p-2 rounded border text-center ${score > 60 ? "bg-red-500/10 border-red-500/30" : "bg-muted/30 border-border"}`}>
              <div className="font-semibold text-red-500">HIGH</div>
              <div className="text-muted-foreground">61-100</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}