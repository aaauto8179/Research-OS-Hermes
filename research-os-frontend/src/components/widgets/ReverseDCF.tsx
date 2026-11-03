"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Brain, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Scale, Zap, BarChart3, PieChart, RefreshCw } from "lucide-react";

export default function ReverseDCF() {
  const [currentPrice, setCurrentPrice] = useState(2500);
  const [revenue, setRevenue] = useState(80000); // Cr
  const [ebitdaMargin, setEbitdaMargin] = useState(18); // %
  const [taxRate, setTaxRate] = useState(25); // %
  const [wacc, setWacc] = useState(12); // %
  const [terminalGrowth, setTerminalGrowth] = useState(5); // %
  const [netDebt, setNetDebt] = useState(5000); // Cr
  const [shares, setShares] = useState(1000); // Cr shares

  // Reverse DCF: solve for implied growth rate
  const impliedEV = currentPrice * shares + netDebt;
  const fcf = revenue * (ebitdaMargin / 100) * (1 - taxRate / 100);
  const terminalValue = fcf * (1 + terminalGrowth / 100) / ((wacc / 100) - (terminalGrowth / 100));
  
  // Solve for implied growth: EV = FCF * (1+g)/(WACC-g) + PV of intermediate
  // Simplified: implied g = (EV * (WACC - g) / (1+g) - ... ) 
  // Use numerical approximation
  let impliedGrowth = 0;
  for (let g = -10; g <= 30; g += 0.1) {
    const pv = fcf * (1 + g / 100) / ((wacc / 100) - (g / 100));
    if (Math.abs(pv - impliedEV) < 100) {
      impliedGrowth = g;
      break;
    }
  }

  const impliedFCF = fcf * (1 + impliedGrowth / 100);
  const impliedMultiple = impliedEV / fcf;
  const marketExpectation = impliedGrowth > 15 ? "AGGRESSIVE" : impliedGrowth > 8 ? "MODERATE" : impliedGrowth > 0 ? "CONSERVATIVE" : "PESSIMISTIC";

  // Sensitivity: what price would be fair at different growth rates
  const sensitivity = [-5, 0, 5, 10, 15, 20].map(g => {
    const pv = fcf * (1 + g / 100) / ((wacc / 100) - (g / 100));
    const fairPrice = (pv - netDebt) / shares;
    return { growth: g, fairPrice: fairPrice.toFixed(0), upside: ((fairPrice - currentPrice) / currentPrice * 100).toFixed(1) };
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reverse DCF</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Implied Growth: {impliedGrowth.toFixed(1)}%</Badge>
          <Badge variant={marketExpectation === "AGGRESSIVE" ? "destructive" : marketExpectation === "MODERATE" ? "secondary" : "default"} className="text-xs">
            {marketExpectation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Key Metrics */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
          <div><span className="text-xs text-muted-foreground">Implied Growth</span><div className={`font-bold ${impliedGrowth > 15 ? "text-red-600" : impliedGrowth > 8 ? "text-amber-600" : "text-green-600"}`}>{impliedGrowth.toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Implied EV/FCF</span><div className="font-bold">{impliedMultiple.toFixed(1)}x</div></div>
          <div><span className="text-xs text-muted-foreground">Current EV</span><div className="font-bold">₹{(impliedEV / 100).toFixed(0)} Cr</div></div>
          <div><span className="text-xs text-muted-foreground">Base FCF</span><div className="font-bold">₹{fcf.toFixed(0)} Cr</div></div>
        </div>

        {/* Inputs */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Current Price (₹)</label>
            <Input type="number" value={currentPrice} onChange={e => setCurrentPrice(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Revenue (Cr)</label>
            <Input type="number" value={revenue} onChange={e => setRevenue(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">EBITDA Margin (%)</label>
            <Input type="number" value={ebitdaMargin} onChange={e => setEbitdaMargin(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Tax Rate (%)</label>
            <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">WACC (%)</label>
            <Input type="number" value={wacc} onChange={e => setWacc(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Terminal Growth (%)</label>
            <Input type="number" value={terminalGrowth} onChange={e => setTerminalGrowth(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Net Debt (Cr)</label>
            <Input type="number" value={netDebt} onChange={e => setNetDebt(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Shares (Cr)</label>
            <Input type="number" value={shares} onChange={e => setShares(Number(e.target.value))} className="mt-1" />
          </div>
        </div>

        {/* Sensitivity Table */}
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Fair Value at Different Growth Rates</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Growth Rate</TableHead>
                <TableHead className="text-right">Fair Price</TableHead>
                <TableHead className="text-right">Upside/Downside</TableHead>
                <TableHead>Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensitivity.map(s => (
                <TableRow key={s.growth}>
                  <TableCell className="font-mono">{s.growth}%</TableCell>
                  <TableCell className="text-right font-bold">₹{s.fairPrice}</TableCell>
                  <TableCell className={`text-right font-bold ${Number(s.upside) > 0 ? "text-green-600" : "text-red-600"}`}>{s.upside}%</TableCell>
                  <TableCell>
                    <Badge variant={Number(s.upside) > 20 ? "default" : Number(s.upside) > 0 ? "secondary" : "destructive"} className="text-xs">
                      {Number(s.upside) > 20 ? "Undervalued" : Number(s.upside) > 0 ? "Fair" : "Overvalued"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Market Expectation Assessment */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Market Expectation</span>
            <Badge variant={marketExpectation === "AGGRESSIVE" ? "destructive" : marketExpectation === "MODERATE" ? "secondary" : "default"}>
              {marketExpectation}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            The market is pricing in {impliedGrowth.toFixed(1)}% long-term growth. 
            {marketExpectation === "AGGRESSIVE" ? " This is aggressive - requires sustained outperformance." : 
             marketExpectation === "MODERATE" ? " This is reasonable for a quality business." :
             marketExpectation === "CONSERVATIVE" ? " This is conservative - potential upside if growth exceeds expectations." :
             " This is pessimistic - significant downside risk priced in."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}