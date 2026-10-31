"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const discrepancies = [
  { symbol: "RELIANCE", field: "Quantity", portfolio: 10, broker: 10, status: "match" },
  { symbol: "INFY", field: "Avg Price", portfolio: 1400, broker: 1420, status: "mismatch" },
  { symbol: "TCS", field: "Quantity", portfolio: 15, broker: 12, status: "mismatch" },
];

export default function PortfolioReconcilePage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Broker Reconciliation</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Comparing portfolio holdings against broker statements. Auto-matching enabled.
          </p>
          <div className="space-y-2">
            {discrepancies.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-muted/50">
                <div>
                  <p className="font-medium">{d.symbol} — {d.field}</p>
                  <p className="text-xs text-muted-foreground">
                    Portfolio: {d.portfolio} | Broker: {d.broker}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === "match" ? "default" : "destructive"}>
                    {d.status === "match" ? "Matched" : "Mismatch"}
                  </Badge>
                  {d.status === "mismatch" && <Button size="sm" variant="outline">Resolve</Button>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
