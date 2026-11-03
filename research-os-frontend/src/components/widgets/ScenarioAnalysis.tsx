"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Brain, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Scale, Zap, BarChart3, PieChart } from "lucide-react";

const MOCK_SCENARIOS = [
  { name: "Bear Case", probability: 20, revenueGrowth: -5, marginCompression: 200, multiple: 12, targetPrice: 2100, irr: -8 },
  { name: "Base Case", probability: 50, revenueGrowth: 12, marginCompression: 0, multiple: 18, targetPrice: 2950, irr: 18 },
  { name: "Bull Case", probability: 30, revenueGrowth: 25, marginCompression: -100, multiple: 24, targetPrice: 3625, irr: 45 },
];

export default function ScenarioAnalysis() {
  const [scenarios, setScenarios] = useState(MOCK_SCENARIOS);
  const [currentPrice, setCurrentPrice] = useState(2500);
  const [timeHorizon, setTimeHorizon] = useState(3);

  const expectedReturn = scenarios.reduce((sum, s) => sum + (s.probability / 100) * s.irr, 0);
  const expectedTarget = scenarios.reduce((sum, s) => sum + (s.probability / 100) * s.targetPrice, 0);
  const downside = scenarios.reduce((sum, s) => Math.min(sum, s.irr), 0);
  const upside = scenarios.reduce((sum, s) => Math.max(sum, s.irr), 0);
  const expectedMOS = ((expectedTarget - currentPrice) / currentPrice) * 100;

  const updateScenario = (idx: number, field: string, value: number) => {
    setScenarios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Scenario Analysis</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">CMP: ₹{currentPrice}</Badge>
          <Badge variant="secondary" className="text-xs">Horizon: {timeHorizon}Y</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Key Metrics */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
          <div><span className="text-xs text-muted-foreground">Expected Return</span><div className={`font-bold ${expectedReturn > 0 ? "text-green-600" : "text-red-600"}`}>{expectedReturn.toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Expected Target</span><div className="font-bold">₹{expectedTarget.toFixed(0)}</div></div>
          <div><span className="text-xs text-muted-foreground">Expected MOS</span><div className={`font-bold ${expectedMOS > 0 ? "text-green-600" : "text-red-600"}`}>{expectedMOS.toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Risk/Reward</span><div className="font-bold">{Math.abs(upside / downside).toFixed(1)}x</div></div>
        </div>

        {/* Scenario Table */}
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead className="text-center">Probability</TableHead>
                <TableHead className="text-right">Rev Growth</TableHead>
                <TableHead className="text-right">Margin Δ</TableHead>
                <TableHead className="text-right">Multiple</TableHead>
                <TableHead className="text-right">Target Price</TableHead>
                <TableHead className="text-right">IRR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((s, idx) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-center">
                    <Input type="number" value={s.probability} onChange={e => updateScenario(idx, "probability", Number(e.target.value))} className="w-16 h-7 text-center" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={s.revenueGrowth} onChange={e => updateScenario(idx, "revenueGrowth", Number(e.target.value))} className="w-16 h-7 text-right" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={s.marginCompression} onChange={e => updateScenario(idx, "marginCompression", Number(e.target.value))} className="w-16 h-7 text-right" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input type="number" value={s.multiple} onChange={e => updateScenario(idx, "multiple", Number(e.target.value))} className="w-16 h-7 text-right" />
                  </TableCell>
                  <TableCell className="text-right font-bold">₹{s.targetPrice}</TableCell>
                  <TableCell className={`text-right font-bold ${s.irr > 0 ? "text-green-600" : "text-red-600"}`}>{s.irr}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Probability Check */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Probability</span>
            <Badge variant={scenarios.reduce((s, c) => s + c.probability, 0) === 100 ? "default" : "destructive"}>
              {scenarios.reduce((s, c) => s + c.probability, 0)}%
            </Badge>
          </div>
        </div>

        {/* Sensitivity Matrix */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Sensitivity: IRR by Multiple × Growth</h3>
          <div className="grid grid-cols-5 gap-1">
            <div className="text-xs text-muted-foreground"></div>
            {[12, 15, 18, 21, 24].map(m => <div key={m} className="text-xs text-center font-medium">{m}x</div>)}
            {[5, 10, 15, 20, 25].map(g => (
              <div key={`row-${g}`} className="contents">
                <div key={`g${g}`} className="text-xs text-right font-medium">{g}%</div>
                {[12, 15, 18, 21, 24].map(m => {
                  const irr = ((m * g * 0.01 + 0.5) - 1) * 100 / timeHorizon;
                  return <div key={`${g}-${m}`} className={`text-xs text-center p-1 rounded ${irr > 15 ? "bg-green-100 text-green-700" : irr > 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{irr.toFixed(0)}%</div>;
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}