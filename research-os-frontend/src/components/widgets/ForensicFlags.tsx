"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface ForensicFlagsProps {
  symbol?: string;
}

const MOCK_INPUTS = {
  symbol: "RELIANCE",
  // Beneish inputs
  dsri: 0.85,
  gmi: 1.02,
  aqi: 1.15,
  sgi: 1.10,
  depi: 0.95,
  sgai: 1.08,
  tata: 0.02,
  lvgi: 0.98,
  // Altman inputs
  x1: 0.15,
  x2: 0.25,
  x3: 0.18,
  x4: 1.8,
  x5: 1.5,
  total_assets: 100000,
  total_liabilities: 60000,
  market_cap: 80000,
  model: "original",
  // Piotroski inputs
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

export default function ForensicFlags({ symbol = "RELIANCE" }: ForensicFlagsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForensics() {
      try {
        // Fetch all three forensic engines in parallel
        const [beneishRes, altmanRes, piotroskiRes] = await Promise.all([
          fetch("/api/math-engine/beneish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...MOCK_INPUTS, symbol }),
          }),
          fetch("/api/math-engine/altman", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...MOCK_INPUTS, symbol }),
          }),
          fetch("/api/math-engine/piotroski", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...MOCK_INPUTS, symbol }),
          }),
        ]);

        if (!beneishRes.ok || !altmanRes.ok || !piotroskiRes.ok) {
          throw new Error(`HTTP error: ${beneishRes.status}/${altmanRes.status}/${piotroskiRes.status}`);
        }

        const [beneish, altman, piotroski] = await Promise.all([
          beneishRes.json(),
          altmanRes.json(),
          piotroskiRes.json(),
        ]);

        // Compute unified forensic assessment
        const mScore = beneish.m_score || 0;
        const mScoreFlag = mScore > -2.22;
        const zScore = altman.z_score || 0;
        const zScoreZone = altman.zone || "DISTRESS";
        const fScore = piotroski.f_score || 0;
        const piotroskiInterp = piotroski.interpretation || "MODERATE_QUALITY";

        // Composite risk score (0-100, higher = riskier)
        let riskScore = 0;
        riskScore += mScoreFlag ? 40 : 0;           // Beneish manipulation flag
        riskScore += zScoreZone === "DISTRESS" ? 35 : zScoreZone === "GREY" ? 15 : 0;
        riskScore += fScore <= 3 ? 25 : fScore <= 5 ? 10 : 0;
        riskScore = Math.min(100, riskScore);

        const riskLevel = riskScore >= 70 ? "HIGH" : riskScore >= 40 ? "MODERATE" : "LOW";

        setData({
          symbol,
          beneish,
          altman,
          piotroski,
          composite: {
            risk_score: riskScore,
            risk_level: riskLevel,
            m_score_flag: mScoreFlag,
            z_score_zone: zScoreZone,
            f_score: fScore,
            piotroski_interpretation: piotroskiInterp,
            flags: {
              earnings_manipulation: mScoreFlag,
              financial_distress: zScoreZone === "DISTRESS",
              weak_fundamentals: fScore <= 3,
              declining_quality: piotroskiInterp === "LOW_QUALITY",
            },
          },
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchForensics();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Forensic Flags</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Forensic Flags</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { beneish, altman, piotroski, composite } = data;
  const mScore = beneish.m_score || 0;
  const zScore = altman.z_score || 0;
  const fScore = piotroski.f_score || 0;

  const riskColor = composite.risk_level === "HIGH" ? "text-red-500" : composite.risk_level === "MODERATE" ? "text-amber-500" : "text-green-500";
  const riskBg = composite.risk_level === "HIGH" ? "bg-red-500/10 border-red-500/30" : composite.risk_level === "MODERATE" ? "bg-amber-500/10 border-amber-500/30" : "bg-green-500/10 border-green-500/30";

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Forensic Flags — {symbol}</CardTitle>
        <Badge variant="outline" className={`${riskColor} ${riskBg}`}>
          {composite.risk_level} RISK ({composite.risk_score}/100)
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Composite Risk Meter */}
        <div className="p-3 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Composite Forensic Risk</span>
            <span className={`text-lg font-bold ${riskColor}`}>{composite.risk_score}/100</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full ${composite.risk_level === "HIGH" ? "bg-red-500" : composite.risk_level === "MODERATE" ? "bg-amber-500" : "bg-green-500"}`}
              style={{ width: `${composite.risk_score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>LOW</span>
            <span>MODERATE</span>
            <span>HIGH</span>
          </div>
        </div>

        {/* Quick Flags Grid */}
        <div className="grid grid-cols-2 gap-2">
          <FlagCard
            label="Earnings Manipulation"
            flagged={composite.flags.earnings_manipulation}
            icon={AlertTriangle}
            detail={`M-Score: ${mScore.toFixed(2)} (threshold -2.22)`}
            tooltip="Beneish M-Score > -2.22 suggests earnings manipulation"
          />
          <FlagCard
            label="Financial Distress"
            flagged={composite.flags.financial_distress}
            icon={AlertCircle}
            detail={`Z-Score: ${zScore.toFixed(2)} (${composite.z_score_zone})`}
            tooltip="Altman Z-Score in Distress zone (< 1.81 original)"
          />
          <FlagCard
            label="Weak Fundamentals"
            flagged={composite.flags.weak_fundamentals}
            icon={TrendingDown}
            detail={`F-Score: ${fScore}/9`}
            tooltip="Piotroski F-Score ≤ 3 indicates weak fundamentals"
          />
          <FlagCard
            label="Declining Quality"
            flagged={composite.flags.declining_quality}
            icon={XCircle}
            detail={composite.piotroski_interpretation.replace(/_/g, " ")}
            tooltip="Piotroski interpretation: LOW_QUALITY"
          />
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          {/* Beneish */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-2 rounded bg-muted/30">
              <div className="flex items-center gap-2">
                <span className={mScore > -2.22 ? "text-red-500" : "text-green-500"}>
                  {mScore > -2.22 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </span>
                <span className="font-medium">Beneish M-Score</span>
              </div>
              <Badge variant={mScore > -2.22 ? "destructive" : "default"}>
                {mScore.toFixed(2)}
              </Badge>
            </summary>
            <div className="p-3 border-t text-sm space-y-1">
              <div className="grid grid-cols-4 gap-2 text-xs">
                {Object.entries(beneish.components || {}).map(([k, v]) => (
                  <div key={k} className="p-1 bg-muted/30 rounded">
                    <div className="text-muted-foreground">{k.toUpperCase()}</div>
                    <div className="font-mono">{(v as number).toFixed(3)}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Threshold: -2.22 | GMI clamped [0.1, 5.0] | LVGI coeff: -0.327 (Beneish 1999)
              </div>
            </div>
          </details>

          {/* Altman */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-2 rounded bg-muted/30">
              <div className="flex items-center gap-2">
                <span className={zScore < 1.81 ? "text-red-500" : zScore < 2.99 ? "text-amber-500" : "text-green-500"}>
                  {zScore < 1.81 ? <AlertCircle className="h-4 w-4" /> : zScore < 2.99 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </span>
                <span className="font-medium">Altman Z-Score ({altman.model || "original"})</span>
              </div>
              <Badge variant={
                zScore < 1.81 ? "destructive" : zScore < 2.99 ? "secondary" : "default"
              }>
                {zScore.toFixed(2)}
              </Badge>
            </summary>
            <div className="p-3 border-t text-sm space-y-1">
              <div className="grid grid-cols-5 gap-2 text-xs">
                {Object.entries(altman.components || {}).map(([k, v]) => (
                  <div key={k} className="p-1 bg-muted/30 rounded">
                    <div className="text-muted-foreground">{k}</div>
                    <div className="font-mono">{(v as number).toFixed(3)}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Zones: Distress &lt; 1.81 | Grey 1.81-2.99 | Safe &gt; 2.99 | Emerging: +3.25 intercept
              </div>
            </div>
          </details>

          {/* Piotroski */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer p-2 rounded bg-muted/30">
              <div className="flex items-center gap-2">
                <span className={fScore <= 3 ? "text-red-500" : fScore <= 5 ? "text-amber-500" : "text-green-500"}>
                  {fScore <= 3 ? <XCircle className="h-4 w-4" /> : fScore <= 5 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                </span>
                <span className="font-medium">Piotroski F-Score</span>
              </div>
              <Badge variant={fScore <= 3 ? "destructive" : fScore <= 5 ? "secondary" : "default"}>
                {fScore}/9
              </Badge>
            </summary>
            <div className="p-3 border-t text-sm space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.entries(piotroski.components || {}).map(([k, v]) => (
                  <div key={k} className={`p-1 rounded ${v ? "bg-green-500/10" : "bg-red-500/10"}`}>
                    <div className="text-muted-foreground">{k.replace(/_/g, " ")}</div>
                    <div className={`font-mono ${v ? "text-green-500" : "text-red-500"}`}>
                      {v ? "✓" : "✗"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                LEVER uses LT Debt / Avg Total Assets | Share count normalized for bonus/split
              </div>
            </div>
          </details>
        </div>

        {/* Audit Trail */}
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer p-2 rounded bg-muted/30">Audit Trail</summary>
          <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
            {JSON.stringify({
              beneish: { inputs_hash: beneish.inputs_hash, timestamp: beneish.calculation_timestamp },
              altman: { inputs_hash: altman.inputs_hash, timestamp: altman.calculation_timestamp },
              piotroski: { inputs_hash: piotroski.inputs_hash, timestamp: piotroski.calculation_timestamp },
            }, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}

function FlagCard({ label, flagged, icon: Icon, detail, tooltip }: {
  label: string;
  flagged: boolean;
  icon: React.ComponentType<any>;
  detail: string;
  tooltip: string;
}) {
  return (
    <div className={`p-3 rounded-lg border ${flagged ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${flagged ? "text-red-500" : "text-green-500"}`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-xs text-muted-foreground">{detail}</div>
      <div className="text-[10px] text-muted-foreground/70 mt-1">{tooltip}</div>
    </div>
  );
}