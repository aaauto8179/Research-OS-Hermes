"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CommonSizeProps {
  symbol?: string;
}

const MOCK_INPUT = {
  symbol: "RELIANCE",
  revenue: 974819,
  total_operating_expenses: 806819,
  cogs: 745000,
  employee_expenses: 12000,
  subcontracting: 5000,
  ebitda: 168000,
  depreciation: 26000,
  ebit: 142000,
  interest: 8500,
  pbt: 133500,
  tax: 22000,
  pat: 79020,
  total_assets: 1850000,
  current_assets: 320000,
  fixed_assets: 950000,
  total_liabilities: 1000000,
  current_liabilities: 280000,
  total_equity: 850000,
  lease_liabilities: 25000,
  cfo: 145000,
  cfi: -55000,
  cff: -40000,
  base_type: "REVENUE",
  cash_flow_base: "REVENUE",
};

export default function CommonSize({ symbol = "RELIANCE" }: CommonSizeProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommonSize() {
      try {
        const res = await fetch("/api/math-engine/common-size", {
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
    fetchCommonSize();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Common Size Statement</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Common Size Statement</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const pnl = data.pnl_common_size || {};
  const bs = data.balance_sheet_common_size || {};
  const cf = data.cash_flow_common_size || {};

  const pnlItems = [
    { label: "COGS", key: "cogs_pct" },
    { label: "Employee Expenses", key: "employee_expenses_pct" },
    { label: "EBITDA", key: "ebitda_pct" },
    { label: "Depreciation", key: "depreciation_pct" },
    { label: "EBIT", key: "ebit_pct" },
    { label: "Interest", key: "interest_pct" },
    { label: "PBT", key: "pbt_pct" },
    { label: "Tax", key: "tax_pct" },
    { label: "PAT", key: "pat_pct" },
  ];

  const bsItems = [
    { label: "Current Assets", key: "current_assets_pct" },
    { label: "Fixed Assets", key: "fixed_assets_pct" },
    { label: "Total Liabilities", key: "total_liabilities_pct" },
    { label: "Current Liabilities", key: "current_liabilities_pct" },
    { label: "Lease Liabilities", key: "lease_liabilities_pct" },
    { label: "Total Equity", key: "total_equity_pct" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Common Size Statement — {data.symbol}</CardTitle>
        <Badge variant="outline">Base: {data.base_used}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reconciliation Check */}
        <div className={`text-xs p-2 rounded border ${data.reconciliation_check ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"}`}>
          {data.reconciliation_check ? "✅ Balance Sheet reconciles (Assets = Liabilities + Equity)" : "⚠️ Balance Sheet does NOT reconcile"}
        </div>

        {/* P&L Common Size */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">P&L (% of Revenue)</h4>
          <div className="space-y-1">
            {pnlItems.map((item) => {
              const val = pnl[item.key];
              if (val === undefined) return null;
              return (
                <div key={item.key} className="flex justify-between items-center p-1.5 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{val.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Balance Sheet Common Size */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Balance Sheet (% of Total Assets)</h4>
          <div className="space-y-1">
            {bsItems.map((item) => {
              const val = bs[item.key];
              if (val === undefined) return null;
              return (
                <div key={item.key} className="flex justify-between items-center p-1.5 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{val.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash Flow Common Size */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Cash Flow (% of Base)</h4>
          <div className="space-y-1">
            {[
              { label: "CFO", key: "cfo_pct" },
              { label: "CFI", key: "cfi_pct" },
              { label: "CFF", key: "cff_pct" },
            ].map((item) => {
              const val = cf[item.key];
              if (val === undefined) return null;
              return (
                <div key={item.key} className="flex justify-between items-center p-1.5 rounded bg-muted/30">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{val.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}