"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SegmentInput {
  name: string;
  method: string;
  metric: number;
  multiple: number;
  valuation_level: "ENTERPRISE_VALUE" | "EQUITY_VALUE";
  effective_stake_pct: number;
  holdco_discount: number;
  conglomerate_discount: number;
}

interface SOTPValuationProps {
  symbol?: string;
  initialSegments?: SegmentInput[];
}

interface SegmentValue {
  name: string;
  method: string;
  metric: number;
  multiple: number;
  discount: number;
  valuation_level: string;
  effective_stake_pct: number;
  holdco_discount: number;
  ev: number;
  contributed_value: number;
}

interface HoldcoSensitivityPoint {
  holdco_discount: number;
  equity_value: number;
  fair_value_per_share: number;
}

interface SOTPResponse {
  symbol: string;
  segment_values: SegmentValue[];
  total_ev: number;
  equity_value: number;
  fair_value_per_share: number;
  segment_contributions: Record<string, number>;
  holdco_sensitivity: HoldcoSensitivityPoint[];
  inputs_hash: string;
  calculation_timestamp: string;
}

const DEFAULT_SEGMENTS: SegmentInput[] = [
  { name: "O2C", method: "EV_EBITDA", metric: 450000, multiple: 1.0, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 100, holdco_discount: 0.0, conglomerate_discount: 0.0 },
  { name: "Retail", method: "EV_EBITDA", metric: 350000, multiple: 1.0, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 67, holdco_discount: 0.30, conglomerate_discount: 0.0 },
  { name: "Digital/Jio", method: "EV_EBITDA", metric: 500000, multiple: 1.0, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 67, holdco_discount: 0.30, conglomerate_discount: 0.0 },
  { name: "Upstream", method: "EV_EBITDA", metric: 80000, multiple: 1.0, valuation_level: "EQUITY_VALUE", effective_stake_pct: 100, holdco_discount: 0.0, conglomerate_discount: 0.0 },
];

const METHODS = ["EV_EBITDA", "EV_SALES", "EV_REVENUE", "P_E", "P_B", "DCF", "BOOK_VALUE"];
const VALUATION_LEVELS = ["ENTERPRISE_VALUE", "EQUITY_VALUE"];

export default function SOTPValuation({ symbol = "RELIANCE", initialSegments = DEFAULT_SEGMENTS }: SOTPValuationProps) {
  const [data, setData] = useState<SOTPResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segments, setSegments] = useState<SegmentInput[]>(initialSegments);
  const [consolidatedNetDebt, setConsolidatedNetDebt] = useState(380000);
  const [parentStandaloneDebt, setParentStandaloneDebt] = useState(50000);
  const [minorityInterest, setMinorityInterest] = useState(0);
  const [cash, setCash] = useState(180000);
  const [dilutedShares, setDilutedShares] = useState(676.5);
  const [holdcoDiscount, setHoldcoDiscount] = useState(0.30);

  const fetchSOTP = async () => {
    try {
      const res = await fetch("/api/math-engine/sotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          segments: segments.map(s => ({
            name: s.name,
            method: s.method,
            metric: s.metric,
            multiple: s.multiple,
            valuation_level: s.valuation_level,
            effective_stake_pct: s.effective_stake_pct,
            holdco_discount: s.holdco_discount,
            conglomerate_discount: s.conglomerate_discount,
          })),
          net_debt: consolidatedNetDebt,
          cash: cash,
          minority_interest: minorityInterest,
          diluted_shares: dilutedShares,
          parent_standalone_debt: parentStandaloneDebt,
          holdco_discount: holdcoDiscount,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOTP();
  }, [symbol, segments, consolidatedNetDebt, parentStandaloneDebt, minorityInterest, cash, dilutedShares, holdcoDiscount]);

  const updateSegment = (index: number, field: keyof SegmentInput, value: any) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const addSegment = () => {
    if (segments.length >= 10) return;
    setSegments([...segments, { name: `Segment ${segments.length + 1}`, method: "EV_EBITDA", metric: 0, multiple: 0, valuation_level: "ENTERPRISE_VALUE", effective_stake_pct: 100, holdco_discount: holdcoDiscount, conglomerate_discount: 0 }]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 1) return;
    setSegments(segments.filter((_, i) => i !== index));
  };

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
        <CardTitle>SOTP Valuation — {data.symbol || symbol}</CardTitle>
        <Badge variant="outline">Holdco Discount</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Segment Table with Inline Editing */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Segment Values</h4>
            <Button variant="outline" size="sm" onClick={addSegment} disabled={segments.length >= 10}>
              Add Segment
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border text-left bg-muted">Segment</th>
                  <th className="p-2 border text-center bg-muted">Method</th>
                  <th className="p-2 border text-center bg-muted">Metric</th>
                  <th className="p-2 border text-center bg-muted">Multiple</th>
                  <th className="p-2 border text-center bg-muted">Level</th>
                  <th className="p-2 border text-center bg-muted">Stake %</th>
                  <th className="p-2 border text-center bg-muted">Conglomerate Disc</th>
                  <th className="p-2 border text-center bg-muted">Holdco Disc</th>
                  <th className="p-2 border text-center bg-muted">Contributed Value</th>
                  <th className="p-2 border text-center bg-muted">Action</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((seg, i) => (
                  <tr key={i}>
                    <td className="p-2 border">
                      <Input value={seg.name} onChange={(e) => updateSegment(i, "name", e.target.value)} className="w-full" />
                    </td>
                    <td className="p-2 border text-center">
                      <Select value={seg.method} onValueChange={(v) => updateSegment(i, "method", v)}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 border text-center">
                      <Input type="number" step="1000" value={seg.metric} onChange={(e) => updateSegment(i, "metric", parseFloat(e.target.value) || 0)} className="w-[80px] text-center" />
                    </td>
                    <td className="p-2 border text-center">
                      <Input type="number" step="0.1" value={seg.multiple} onChange={(e) => updateSegment(i, "multiple", parseFloat(e.target.value) || 0)} className="w-[70px] text-center" />
                    </td>
                    <td className="p-2 border text-center">
                      <Select value={seg.valuation_level} onValueChange={(v) => updateSegment(i, "valuation_level", v as "ENTERPRISE_VALUE" | "EQUITY_VALUE")}>
                        <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {VALUATION_LEVELS.map(v => <SelectItem key={v} value={v}>{v === "ENTERPRISE_VALUE" ? "EV" : "Equity"}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 border text-center">
                      <Input type="number" step="1" min="0" max="100" value={seg.effective_stake_pct} onChange={(e) => updateSegment(i, "effective_stake_pct", Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-[70px] text-center" />
                    </td>
                    <td className="p-2 border text-center">
                      <Input type="number" step="0.01" min="0" max="1" value={seg.conglomerate_discount} onChange={(e) => updateSegment(i, "conglomerate_discount", Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-[80px] text-center" />
                    </td>
                    <td className="p-2 border text-center">
                      <Input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="5" 
                        value={seg.holdco_discount * 100} 
                        onChange={(e) => updateSegment(i, "holdco_discount", parseFloat(e.target.value) / 100)} 
                        className="w-[100px]" 
                      />
                      <span className="text-xs ml-1">{(seg.holdco_discount * 100).toFixed(0)}%</span>
                    </td>
                    <td className="p-2 border text-center font-medium">
                      {segmentValues[i] ? `₹${(segmentValues[i].contributed_value / 100).toFixed(0)} Cr` : "₹0 Cr"}
                    </td>
                    <td className="p-2 border text-center">
                      <Button variant="ghost" size="icon" onClick={() => removeSegment(i)} disabled={segments.length <= 1}>
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded">
          <div>
            <Label className="text-xs">Consolidated Net Debt (₹Cr)</Label>
            <Input type="number" step="1000" value={consolidatedNetDebt} onChange={(e) => setConsolidatedNetDebt(parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <Label className="text-xs">Parent Standalone Debt (₹Cr)</Label>
            <Input type="number" step="1000" value={parentStandaloneDebt} onChange={(e) => setParentStandaloneDebt(parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <Label className="text-xs">Minority Interest (₹Cr)</Label>
            <Input type="number" step="1000" value={minorityInterest} onChange={(e) => setMinorityInterest(parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <Label className="text-xs">Cash (₹Cr)</Label>
            <Input type="number" step="1000" value={cash} onChange={(e) => setCash(parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <Label className="text-xs">Diluted Shares (Cr)</Label>
            <Input type="number" step="0.1" value={dilutedShares} onChange={(e) => setDilutedShares(parseFloat(e.target.value) || 0)} className="w-full" />
          </div>
          <div>
            <Label className="text-xs">Global Holdco Discount</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                value={holdcoDiscount * 100} 
                onChange={(e) => setHoldcoDiscount(parseFloat(e.target.value) / 100)} 
                className="flex-1" 
              />
              <span className="text-xs w-16 text-right">{(holdcoDiscount * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Value Bridge */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Value Bridge</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Total EV Segments Value</span>
              <span>₹{(data.total_ev / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Total Equity Segments Value</span>
              <span>₹{(segmentValues.filter(s => s.valuation_level === "EQUITY_VALUE").reduce((sum, s) => sum + s.contributed_value, 0) / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Consolidated Net Debt</span>
              <span className="text-red-500">-₹{(consolidatedNetDebt / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Minority Interest</span>
              <span className="text-red-500">-₹{(minorityInterest / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Plus: Cash</span>
              <span className="text-green-500">+₹{(cash / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-muted/30">
              <span className="text-muted-foreground">Less: Parent Standalone Debt (Equity segs)</span>
              <span className="text-red-500">-₹{(parentStandaloneDebt / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-semibold">
              <span>SOTP Equity Value</span>
              <span>₹{(data.equity_value / 100).toFixed(0)} Cr</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-primary/10 font-bold">
              <span>Fair Value per Share</span>
              <span>₹{data.fair_value_per_share?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Holdco Discount Sensitivity Chart */}
        {data.holdco_sensitivity && data.holdco_sensitivity.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Holdco Discount Sensitivity (20%-60%)</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.holdco_sensitivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="holdco_discount" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                  <YAxis />
                  <Tooltip
                                      formatter={(value) => (typeof value === 'number' && value !== undefined) ? [`₹${value.toFixed(2)}`, "Fair Value/Share"] : ["", ""]}
                                      labelFormatter={(v) => (typeof v === 'number' && v !== undefined) ? `${(v * 100).toFixed(0)}% Holdco Discount` : ""}
                                    />
                  <Bar dataKey="fair_value_per_share" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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