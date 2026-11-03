"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Brain, Target, TrendingUp, Scale, Zap, BarChart3, PieChart, Shield, AlertTriangle } from "lucide-react";

const MOCK_POSITIONS = [
  { symbol: "RELIANCE", name: "Reliance Industries", conviction: 8.5, sector: "Oil & Gas", currentWeight: 5.2, maxWeight: 8, beta: 1.1, liquidity: "High" },
  { symbol: "TCS", name: "Tata Consultancy Services", conviction: 7.2, sector: "IT Services", currentWeight: 3.5, maxWeight: 6, beta: 0.8, liquidity: "High" },
  { symbol: "HDFCBANK", name: "HDFC Bank", conviction: 8.2, sector: "Banking", currentWeight: 4.8, maxWeight: 7, beta: 1.0, liquidity: "High" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", conviction: 8.0, sector: "Financial Services", currentWeight: 3.8, maxWeight: 6, beta: 1.3, liquidity: "High" },
  { symbol: "TRENT", name: "Trent Ltd", conviction: 5.5, sector: "Consumer", currentWeight: 0, maxWeight: 4, beta: 1.2, liquidity: "Medium" },
];

export default function ConvictionSizing() {
  const [positions, setPositions] = useState(MOCK_POSITIONS);
  const [portfolioSize, setPortfolioSize] = useState(500000000); // ₹500 Cr
  const [maxSectorWeight, setMaxSectorWeight] = useState(25);
  const [maxSingleStock, setMaxSingleStock] = useState(8);

  const calculateSizing = (pos: typeof MOCK_POSITIONS[0]) => {
    const convictionMultiplier = pos.conviction / 10;
    const liquidityDiscount = pos.liquidity === "High" ? 1.0 : pos.liquidity === "Medium" ? 0.8 : 0.6;
    const betaAdjustment = pos.beta > 1.2 ? 0.9 : pos.beta < 0.9 ? 1.1 : 1.0;
    const recommendedWeight = Math.min(pos.maxWeight, pos.conviction * 0.8 * liquidityDiscount * betaAdjustment);
    const recommendedAmount = (portfolioSize * recommendedWeight) / 100;
    const action = recommendedWeight > pos.currentWeight + 0.5 ? "INCREASE" : recommendedWeight < pos.currentWeight - 0.5 ? "DECREASE" : "HOLD";
    return { recommendedWeight: recommendedWeight.toFixed(1), recommendedAmount, action };
  };

  const totalRecommended = positions.reduce((sum, p) => sum + parseFloat(calculateSizing(p).recommendedWeight), 0);
  const totalCurrent = positions.reduce((sum, p) => sum + p.currentWeight, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conviction Sizing</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Portfolio: ₹{(portfolioSize / 10000000).toFixed(0)} Cr</Badge>
          <Badge variant="secondary" className="text-xs">Total: {totalRecommended.toFixed(1)}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Controls */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
          <div>
            <label className="text-xs text-muted-foreground">Portfolio Size (Cr)</label>
            <Input type="number" value={portfolioSize / 10000000} onChange={e => setPortfolioSize(Number(e.target.value) * 10000000)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Max Single Stock %</label>
            <Input type="number" value={maxSingleStock} onChange={e => setMaxSingleStock(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Max Sector %</label>
            <Input type="number" value={maxSectorWeight} onChange={e => setMaxSectorWeight(Number(e.target.value))} className="mt-1" />
          </div>
        </div>

        {/* Position Sizing Table */}
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Conviction</TableHead>
                <TableHead className="text-right">Current %</TableHead>
                <TableHead className="text-right">Recommended %</TableHead>
                <TableHead className="text-right">Amount (Cr)</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map(pos => {
                const sizing = calculateSizing(pos);
                const actionColor = sizing.action === "INCREASE" ? "text-green-600" : sizing.action === "DECREASE" ? "text-red-600" : "text-blue-600";
                return (
                  <TableRow key={pos.symbol}>
                    <TableCell className="font-mono font-medium">{pos.symbol}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pos.conviction * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold">{pos.conviction}/10</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{pos.currentWeight}%</TableCell>
                    <TableCell className="text-right font-mono font-bold">{sizing.recommendedWeight}%</TableCell>
                    <TableCell className="text-right font-mono">₹{(sizing.recommendedAmount / 10000000).toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={sizing.action === "INCREASE" ? "default" : sizing.action === "DECREASE" ? "destructive" : "secondary"} className="text-xs">
                        {sizing.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                      {pos.conviction >= 8 ? "High conviction, increase allocation" : pos.conviction >= 7 ? "Moderate conviction" : "Low conviction, reduce"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
          <div><span className="text-xs text-muted-foreground">Total Current</span><div className="font-bold">{totalCurrent.toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Total Recommended</span><div className="font-bold">{totalRecommended.toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Cash Available</span><div className="font-bold">{(100 - totalRecommended).toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Positions</span><div className="font-bold">{positions.length}</div></div>
        </div>

        {/* Conviction Distribution */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Conviction Distribution</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "High (8-10)", count: positions.filter(p => p.conviction >= 8).length, color: "bg-green-500" },
              { label: "Medium (6-8)", count: positions.filter(p => p.conviction >= 6 && p.conviction < 8).length, color: "bg-amber-500" },
              { label: "Low (4-6)", count: positions.filter(p => p.conviction >= 4 && p.conviction < 6).length, color: "bg-orange-500" },
              { label: "Very Low (<4)", count: positions.filter(p => p.conviction < 4).length, color: "bg-red-500" },
            ].map(c => (
              <div key={c.label} className="p-2 bg-muted/30 rounded text-center">
                <div className={`w-full h-2 rounded-full mb-1 ${c.color}`} style={{ width: `${(c.count / positions.length) * 100}%` }} />
                <div className="text-xs font-medium">{c.label}</div>
                <div className="text-lg font-bold">{c.count}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}