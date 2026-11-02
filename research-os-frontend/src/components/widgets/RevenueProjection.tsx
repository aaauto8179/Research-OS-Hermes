"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface RevenueProjectionProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  segments: [
    { name: "O2C", revenue: 600000, growth_rate: 0.05 },
    { name: "Retail", revenue: 300000, growth_rate: 0.15 },
    { name: "Digital", revenue: 150000, growth_rate: 0.25 },
  ],
  intersegment_eliminations: 20000,
  ebitda_margin: 0.18,
  depreciation_pct: 0.04,
  tax_rate: 0.25,
  capex_pct: 0.06,
  nwc_change_pct: 0.02,
};

export default function RevenueProjection({ symbol = "RELIANCE" }: RevenueProjectionProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRevenueProjection() {
      try {
        const res = await fetch("/api/math-engine/revenue-projection", {
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
    fetchRevenueProjection();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Revenue Projection</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Revenue Projection</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const segmentRevenues = data.segment_revenues || {};

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Revenue Projection — {data.symbol}</CardTitle>
        <Badge variant="outline">FCFF Model</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segment Revenues */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Segment Revenue (Projected)</h4>
          <div className="space-y-1">
            {Object.entries(segmentRevenues).map(([name, rev]: [string, any]) => (
              <div key={name} className="flex justify-between items-center p-2 rounded bg-muted/30">
                <span className="text-xs text-muted-foreground">{name}</span>
                <span className="text-sm font-medium">₹{(rev / 100).toFixed(0)} Cr</span>
              </div>
            ))}
            <div className="flex justify-between items-center p-2 rounded bg-primary/10 font-semibold">
              <span className="text-xs">Consolidated Revenue</span>
              <span className="text-sm">₹{(data.consolidated_revenue / 100).toFixed(0)} Cr</span>
            </div>
          </div>
        </div>

        {/* FCF Bridge */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">FCF Bridge</h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span className="text-xs text-muted-foreground">EBITDA</span>
              <span className="text-sm font-medium">₹{(data.ebitda / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span className="text-xs text-muted-foreground">EBIT (EBITDA - D&A)</span>
              <span className="text-sm font-medium">₹{(data.ebit / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-muted/30">
              <span className="text-xs text-muted-foreground">Tax Shield (D&A × t)</span>
              <span className="text-sm font-medium text-green-500">+₹{(data.tax_shield / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-primary/10 font-semibold">
              <span className="text-xs">Free Cash Flow (FCFF)</span>
              <span className="text-sm">₹{(data.fcf / 100).toFixed(0)} Cr</span>
            </div>
          </div>
        </div>

        {/* S-Curve Adoption */}
        {data.s_curve_adoption !== null && data.s_curve_adoption !== undefined && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">S-Curve Adoption</h4>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Adoption Rate</div>
              <div className="text-sm font-medium">{(data.s_curve_adoption * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>• FCFF = (EBITDA - D&A) × (1-t) + D&A - Capex - ΔNWC</div>
          <div>• Intersegment eliminations subtracted from consolidated revenue</div>
          <div>• S-curve: L ≤ TAM, k ∈ [0.05, 2.0]</div>
        </div>
      </CardContent>
    </Card>
  );
}