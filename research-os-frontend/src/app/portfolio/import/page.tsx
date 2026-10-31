"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockHoldings = [
  { symbol: "RELIANCE", qty: 10, avgPrice: 2500, broker: "Zerodha" },
  { symbol: "INFY", qty: 25, avgPrice: 1400, broker: "Zerodha" },
  { symbol: "TCS", qty: 15, avgPrice: 3200, broker: "Groww" },
];

export default function PortfolioImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imported, setImported] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Import Broker Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input type="file" accept=".xlsx,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={() => setImported(true)} disabled={!file}>Import</Button>
          </div>
          <p className="text-xs text-muted-foreground">Supported: Zerodha, Groww, Upstox, ICICI Direct, Angel One</p>
        </CardContent>
      </Card>

      {imported && (
        <Card>
          <CardHeader><CardTitle>Imported Holdings — Reconciliation</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Broker</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHoldings.map((h) => (
                  <TableRow key={h.symbol}>
                    <TableCell className="font-medium">{h.symbol}</TableCell>
                    <TableCell>{h.qty}</TableCell>
                    <TableCell>₹{h.avgPrice}</TableCell>
                    <TableCell>{h.broker}</TableCell>
                    <TableCell><Badge variant="default">Matched</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
