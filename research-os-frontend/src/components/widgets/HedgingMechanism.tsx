"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface HedgingProps {
  symbol?: string;
}

const MOCK_INPUT = {
  spot_price: 2890,
  call_strike: 3000,
  put_strike: 2700,
  call_premium: 45,
  put_premium: 38,
  risk_free_rate: 0.07,
  dividend_yield: 0.012,
  time_to_expiry_days: 30,
  portfolio_value: 1000000,
  futures_value: 289000,
  hedge_ratio: 0.8,
  nse_lot_size: 25,
};

export default function HedgingMechanism({ symbol = "RELIANCE" }: HedgingProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHedging() {
      try {
        const res = await fetch("/api/math-engine/hedging", {
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
    fetchHedging();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Hedging Mechanism</CardTitle></CardHeader>
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
        <CardHeader><CardTitle>Hedging Mechanism</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hedging Mechanism — {symbol}</CardTitle>
        <Badge variant="outline">NSE F&O</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Collar Strategy */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Collar Strategy Payoff</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded bg-green-500/10 border border-green-500/30">
              <div className="text-xs text-muted-foreground">Max Gain</div>
              <div className="text-lg font-bold text-green-500">
                ₹{data.collar_max_gain?.toFixed(2)}
              </div>
            </div>
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30">
              <div className="text-xs text-muted-foreground">Max Loss</div>
              <div className="text-lg font-bold text-red-500">
                ₹{data.collar_max_loss?.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Futures Pricing */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Futures Cost of Carry</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Fair Future Price</div>
              <div className="text-sm font-medium">₹{data.fair_future_price?.toFixed(2)}</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Basis Risk</div>
              <div className="text-sm font-medium">{(data.basis_risk * 100)?.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        {/* Hedge Sizing */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Hedge Sizing (NSE Lots)</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">Hedge Lots</div>
              <div className="text-sm font-medium">{data.hedge_lots} lots</div>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <div className="text-xs text-muted-foreground">STT Cost Drag</div>
              <div className="text-sm font-medium">₹{data.stt_cost_drag?.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Strategy Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Collar: Buy Put (₹{MOCK_INPUT.put_strike}) + Sell Call (₹{MOCK_INPUT.call_strike})</div>
          <div>• Premium net: ₹{(MOCK_INPUT.put_premium - MOCK_INPUT.call_premium).toFixed(2)} (Put paid - Call received)</div>
          <div>• NSE Lot Size: {MOCK_INPUT.nse_lot_size} shares</div>
          <div>• Expiry: {MOCK_INPUT.time_to_expiry_days} days</div>
        </div>
      </CardContent>
    </Card>
  );
}