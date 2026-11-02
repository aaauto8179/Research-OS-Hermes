"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DCFValuationProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  revenue: 974819,
  ebit: 142000,
  depreciation: 26000,
  capex: 55000,
  change_nwc: 12000,
  tax_rate: 0.2517,
  total_debt: 380000,
  cash: 180000,
  minority_interest: 0,
  diluted_shares: 676.5,
  revenue_growth_years: [0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 0.05, 0.04, 0.04],
  ebit_margin: 0.146,
  capex_pct_revenue: 0.056,
  nwc_pct_revenue: 0.012,
  risk_free_rate: 0.072,
  equity_risk_premium: 0.065,
  beta: 1.05,
  cost_of_debt: 0.08,
  debt_to_value: 0.25,
  terminal_growth_rate: 0.04,
  exit_multiple: 12.0,
  forecast_years: 10,
  lease_liabilities: 25000,
  ebitda_margin: 0.172,
  mid_year_discounting: true,
};

interface SensitivityCell {
  value: number | null;
  isBase: boolean;
  isInvalid: boolean;
}

export default function DCFValuation({ symbol = "RELIANCE" }: DCFValuationProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputs, setInputs] = useState(MOCK_INPUT);
  const [recalcKey, setRecalcKey] = useState(0);

  const fetchDCF = async (inputData: typeof MOCK_INPUT) => {
    try {
      const res = await fetch("/api/math-engine/dcf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e: any) {
      throw e;
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadDCF() {
      setLoading(true);
      setError(null);
      try {
        const json = await fetchDCF(inputs);
        if (mounted) setData(json);
      } catch (e: any) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDCF();
    return () => { mounted = false; };
  }, [inputs, recalcKey]);

  const handleInputChange = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleRecalculate = () => {
    setRecalcKey(k => k + 1);
  };

  const sensitivityMatrix = useMemo(() => {
    if (!data) return null;
    const matrix = data.sensitivity_matrix_gordon || [];
    const waccRange = data.sensitivity_wacc || [];
    const growthRange = data.sensitivity_growth || [];
    const baseWacc = data.wacc;
    const baseGrowth = inputs.terminal_growth_rate;

    return {
      matrix: matrix.map((row: number[], i: number) =>
        row.map((val: number, j: number) => ({
          value: isNaN(val) ? null : val,
          isBase: Math.abs(waccRange[j] - baseWacc) < 0.0001 && Math.abs(growthRange[i] - baseGrowth) < 0.0001,
          isInvalid: isNaN(val),
        }))
      ),
      waccRange,
      growthRange,
    };
  }, [data, inputs.terminal_growth_rate]);

  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "N/A";
    return "₹" + (val / 100).toFixed(0) + " Cr";
  };

  const formatPerShare = (val: number | null) => {
    if (val === null || val === undefined) return "N/A";
    return "₹" + val.toFixed(0);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>DCF Valuation</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>DCF Valuation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
          <Button size="sm" onClick={handleRecalculate} className="mt-2">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const gordonFV = data.fair_value_per_share_gordon;
  const multipleFV = data.fair_value_per_share_multiple;
  const evGordon = data.ev_gordon;
  const evMultiple = data.ev_multiple;
  const equityGordon = data.equity_value_gordon;
  const equityMultiple = data.equity_value_multiple;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>DCF Valuation — {symbol}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Mid-Year: {inputs.mid_year_discounting ? "ON" : "OFF"}</Badge>
          <Badge variant="outline">Ind AS 116</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-auto">

        {/* Inputs Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/30 rounded">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Valuation Inputs</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">WACC (%)</Label>
                <Input
                  type="number"
                  step="0.005"
                  min="0.05"
                  max="0.30"
                  value={(data.wacc * 100).toFixed(2)}
                  readOnly
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Cost of Equity (%)</Label>
                <Input
                  type="number"
                  step="0.005"
                  value={(data.cost_of_equity * 100).toFixed(2)}
                  readOnly
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Assumptions</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-muted-foreground">Terminal Growth:</span> {(inputs.terminal_growth_rate * 100).toFixed(1)}%</div>
              <div><span className="text-muted-foreground">Exit Multiple:</span> {inputs.exit_multiple}x</div>
              <div><span className="text-muted-foreground">Forecast Years:</span> {inputs.forecast_years}</div>
              <div><span className="text-muted-foreground">Beta:</span> {inputs.beta}</div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded border bg-primary/5">
            <div className="text-xs text-muted-foreground">Gordon Growth</div>
            <div className="text-lg font-bold">{formatPerShare(gordonFV)}</div>
            <div className="text-xs text-muted-foreground">EV: {formatCurrency(evGordon)} | Equity: {formatCurrency(equityGordon)}</div>
          </div>
          <div className="p-3 rounded border bg-primary/5">
            <div className="text-xs text-muted-foreground">Exit Multiple</div>
            <div className="text-lg font-bold">{formatPerShare(multipleFV)}</div>
            <div className="text-xs text-muted-foreground">EV: {formatCurrency(evMultiple)} | Equity: {formatCurrency(equityMultiple)}</div>
          </div>
        </div>

        {/* Sensitivity Matrix */}
        {sensitivityMatrix && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
              Sensitivity: Fair Value (Gordon) — WACC vs Terminal Growth
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-1 border text-center bg-muted">g\\WACC</th>
                    {sensitivityMatrix.waccRange.map((w: number) => (
                      <th key={w} className="p-1 border text-center bg-muted">
                        {(w * 100).toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensitivityMatrix.matrix.map((row: SensitivityCell[], i: number) => (
                    <tr key={i}>
                      <td className="p-1 border text-center bg-muted font-medium">
                        {(sensitivityMatrix.growthRange[i] * 100).toFixed(1)}%
                      </td>
                      {row.map((cell: SensitivityCell, j: number) => (
                        <td
                          key={j}
                          className={`p-1 border text-center ${
                            cell.isInvalid ? "bg-red-500/20" :
                            cell.isBase ? "bg-primary/20 font-bold" :
                            ""
                          }`}
                        >
                          {cell.value === null ? "N/A" : "₹" + (cell.value).toFixed(0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Green = Base case (WACC: {(data.wacc * 100).toFixed(1)}%, g: {(inputs.terminal_growth_rate * 100).toFixed(1)}%) | Red = Invalid (WACC ≤ g + 50bps)
            </p>
          </div>
        )}

        {/* Recalculate Button */}
        <div className="flex justify-end pt-2 border-t">
          <Button size="sm" onClick={handleRecalculate} variant="outline">
            Recalculate
          </Button>
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