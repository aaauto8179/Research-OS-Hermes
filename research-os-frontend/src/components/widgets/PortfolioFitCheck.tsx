"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Clock, Zap, Search, Filter, TrendingUp, ArrowUpRight, Scale, Target, Brain, RefreshCw } from "lucide-react";

interface PortfolioFitCheckProps {
  portfolioId?: string;
}

const MOCK_HOLDINGS = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas", weight: 0.18, pe: 24.5, roe: 0.15, beta: 1.1 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", weight: 0.15, pe: 28.2, roe: 0.42, beta: 0.8 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", weight: 0.12, pe: 18.2, roe: 0.17, beta: 1.0 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financial Services", weight: 0.10, pe: 32.8, roe: 0.22, beta: 1.3 },
  { symbol: "TRENT", name: "Trent Ltd", sector: "Consumer", weight: 0.08, pe: 95.2, roe: 0.28, beta: 1.2 },
  { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT Services", weight: 0.07, pe: 35.4, roe: 0.25, beta: 1.1 },
  { symbol: "COFORGE", name: "Coforge Ltd", sector: "IT Services", weight: 0.06, pe: 28.6, roe: 0.24, beta: 1.0 },
  { symbol: "DMART", name: "Avenue Supermarts", sector: "Consumer", weight: 0.05, pe: 85.4, roe: 0.18, beta: 0.9 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", weight: 0.05, pe: 16.8, roe: 0.16, beta: 1.0 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", weight: 0.04, pe: 19.2, roe: 0.14, beta: 0.95 },
];

const MOCK_CANDIDATES = [
  { symbol: "ZOMATO", name: "Zomato Ltd", sector: "Consumer Tech", pe: 45.2, roe: 0.08, beta: 1.5, market_cap: 120000, reason: "Food delivery duopoly, Blinkit scaling" },
  { symbol: "PAYTM", name: "One97 Communications", sector: "Fintech", pe: 0, roe: -0.12, beta: 1.8, market_cap: 45000, reason: "Payments leadership, lending scale-up" },
  { symbol: "NYKAA", name: "FSN E-Commerce", sector: "Consumer", pe: 1200, roe: 0.03, beta: 1.6, market_cap: 55000, reason: "Beauty platform, loyalty moat" },
  { symbol: "POLICYBZR", name: "PB Fintech", sector: "InsurTech", pe: 85, roe: 0.02, beta: 1.4, market_cap: 35000, reason: "Insurance distribution, renewal revenue" },
  { symbol: "DELHIVERY", name: "Delhivery Ltd", sector: "Logistics", pe: 65, roe: 0.05, beta: 1.3, market_cap: 40000, reason: "E-commerce logistics, network effects" },
];

export default function PortfolioFitCheck({ portfolioId = "1" }: PortfolioFitCheckProps) {
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [holdings] = useState(MOCK_HOLDINGS);
  const [activeTab, setActiveTab] = useState("analyze");
  const [newCandidate, setNewCandidate] = useState({ symbol: "", name: "", sector: "", reason: "" });

  // Portfolio metrics
  const portfolioBeta = holdings.reduce((sum, h) => sum + h.weight * h.beta, 0);
  const portfolioPE = holdings.reduce((sum, h) => sum + h.weight * h.pe, 0);
  const portfolioROE = holdings.reduce((sum, h) => sum + h.weight * h.roe, 0);
  const sectorConcentration = holdings.reduce((acc, h) => {
    acc[h.sector] = (acc[h.sector] || 0) + h.weight;
    return acc;
  }, {} as Record<string, number>);
  const maxSectorWeight = Math.max(...Object.values(sectorConcentration));
  const hhi = holdings.reduce((sum, h) => sum + h.weight * h.weight, 0);

  const evaluateFit = (candidate: typeof MOCK_CANDIDATES[0]) => {
    const newBeta = portfolioBeta + 0.05 * (candidate.beta - portfolioBeta);
    const newPE = portfolioPE + 0.05 * (candidate.pe || portfolioPE - portfolioPE);
    const newROE = portfolioROE + 0.05 * (candidate.roe - portfolioROE);
    const sectorOverlap = sectorConcentration[candidate.sector] || 0;
    
    let score = 50;
    if (Math.abs(newBeta - 1.0) < Math.abs(portfolioBeta - 1.0)) score += 15;
    if (candidate.roe > portfolioROE) score += 15;
    if (sectorOverlap < 0.2) score += 10;
    if (candidate.pe && candidate.pe < portfolioPE) score += 10;
    
    return {
      score: Math.min(100, Math.max(0, score)),
      newBeta: newBeta.toFixed(2),
      newPE: newPE.toFixed(1),
      newROE: (newROE * 100).toFixed(1) + "%",
      sectorOverlap: (sectorOverlap * 100).toFixed(1) + "%",
      recommendation: score >= 75 ? "STRONG_FIT" : score >= 55 ? "MODERATE_FIT" : "WEAK_FIT",
    };
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Portfolio Fit Check</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">HHI: {hhi.toFixed(3)}</Badge>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("candidates")}>
            <Plus className="mr-1 h-3 w-3" /> Add Candidate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Portfolio Snapshot */}
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
          <div><span className="text-xs text-muted-foreground">Portfolio Beta</span><div className="font-bold">{portfolioBeta.toFixed(2)}</div></div>
          <div><span className="text-xs text-muted-foreground">Weighted P/E</span><div className="font-bold">{portfolioPE.toFixed(1)}</div></div>
          <div><span className="text-xs text-muted-foreground">Weighted ROE</span><div className="font-bold">{(portfolioROE*100).toFixed(1)}%</div></div>
          <div><span className="text-xs text-muted-foreground">Max Sector</span><div className="font-bold">{maxSectorWeight.toFixed(0)}%</div></div>
        </div>

        {/* Tabs */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analyze"><Brain className="mr-2 h-4 w-4" /> Analyze Fit</TabsTrigger>
              <TabsTrigger value="candidates"><Target className="mr-2 h-4 w-4" /> Candidates</TabsTrigger>
              <TabsTrigger value="sector"><Scale className="mr-2 h-4 w-4" /> Sector Analysis</TabsTrigger>
            </TabsList>

            {/* Analyze Fit Tab */}
            <TabsContent value="analyze" className="flex-1 mt-4 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="h-full">
                  <CardHeader><CardTitle>Candidate Evaluation</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {MOCK_CANDIDATES.map(candidate => {
                      const fit = evaluateFit(candidate);
                      const recColor = fit.recommendation === "STRONG_FIT" ? "text-green-600" : fit.recommendation === "MODERATE_FIT" ? "text-amber-600" : "text-red-600";
                      const recBg = fit.recommendation === "STRONG_FIT" ? "bg-green-500/10" : fit.recommendation === "MODERATE_FIT" ? "bg-amber-500/10" : "bg-red-500/10";
                      return (
                        <div key={candidate.symbol} className="p-3 border rounded-lg hover:bg-muted/50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{candidate.symbol} - {candidate.name}</h4>
                              <p className="text-xs text-muted-foreground">{candidate.reason}</p>
                            </div>
                            <Badge variant={fit.recommendation === "STRONG_FIT" ? "default" : fit.recommendation === "MODERATE_FIT" ? "secondary" : "destructive"} className="text-xs">{fit.recommendation}</Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            <div><span className="text-muted-foreground">Score</span><div className="font-bold">{fit.score}/100</div></div>
                            <div><span className="text-muted-foreground">New β</span><div className="font-bold">{fit.newBeta}</div></div>
                            <div><span className="text-muted-foreground">New P/E</span><div className="font-bold">{fit.newPE}</div></div>
                            <div><span className="text-muted-foreground">Sector Overlap</span><div className="font-bold">{fit.sectorOverlap}</div></div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
                <Card className="h-full">
                  <CardHeader><CardTitle>Portfolio Impact Simulation (5% allocation)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded">
                      <div><span className="text-xs text-muted-foreground">Current β</span><div className="font-bold">{portfolioBeta.toFixed(2)}</div></div>
                      <div><span className="text-xs text-muted-foreground">Current P/E</span><div className="font-bold">{portfolioPE.toFixed(1)}</div></div>
                      <div><span className="text-xs text-muted-foreground">Current ROE</span><div className="font-bold">{(portfolioROE*100).toFixed(1)}%</div></div>
                      <div><span className="text-xs text-muted-foreground">HHI</span><div className="font-bold">{hhi.toFixed(3)}</div></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Assumes 5% portfolio allocation to each candidate. Metrics show blended portfolio impact.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Candidates Tab */}
            <TabsContent value="candidates" className="flex-1 mt-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Candidate Universe</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("analyze")}><ArrowUpRight className="mr-1 h-3 w-3" /> Analyze All</Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Sector</TableHead>
                          <TableHead className="text-right">P/E</TableHead>
                          <TableHead className="text-right">ROE</TableHead>
                          <TableHead className="text-right">Beta</TableHead>
                          <TableHead className="text-right">MCap (Cr)</TableHead>
                          <TableHead>Thesis</TableHead>
                          <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {MOCK_CANDIDATES.map(c => (
                          <TableRow key={c.symbol}>
                            <TableCell className="font-mono font-medium">{c.symbol}</TableCell>
                            <TableCell className="max-w-xs truncate">{c.name}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs">{c.sector}</Badge></TableCell>
                            <TableCell className="text-right font-mono">{c.pe ? c.pe.toFixed(1) : "—"}</TableCell>
                            <TableCell className="text-right font-mono">{(c.roe*100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right font-mono">{c.beta.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-mono">₹{(c.market_cap/100).toFixed(0)}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{c.reason}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" title="Add to Analysis"><Plus className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Add Custom Candidate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="md:col-span-2"><Input value={newCandidate.symbol} onChange={e => setNewCandidate({...newCandidate, symbol: e.target.value})} placeholder="Symbol (e.g., ZOMATO)" /></div>
                      <div className="md:col-span-2"><Input value={newCandidate.name} onChange={e => setNewCandidate({...newCandidate, name: e.target.value})} placeholder="Company Name" /></div>
                      <div><Input value={newCandidate.sector} onChange={e => setNewCandidate({...newCandidate, sector: e.target.value})} placeholder="Sector" /></div>
                      <div className="md:col-span-3"><Input value={newCandidate.reason} onChange={e => setNewCandidate({...newCandidate, reason: e.target.value})} placeholder="Investment Thesis" /></div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button onClick={() => { setCandidates(prev => [...prev, { ...newCandidate, pe: 0, roe: 0, beta: 1, market_cap: 0 }]); setNewCandidate({ symbol: "", name: "", sector: "", reason: "" }); }}>Add Candidate</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sector Analysis Tab */}
            <TabsContent value="sector" className="flex-1 mt-4 space-y-4">
              <Card>
                <CardHeader><CardTitle>Sector Concentration Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(sectorConcentration).map(([sector, weight]) => (
                      <div key={sector} className="p-3 border rounded-lg">
                        <div className="font-medium">{sector}</div>
                        <div className="text-2xl font-bold">{(weight*100).toFixed(1)}%</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${weight*100}%` }} />
                        </div>
                        {weight > 0.3 && <div className="text-xs text-red-600 mt-1">⚠ High concentration</div>}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium mb-2">Portfolio HHI: {hhi.toFixed(3)}</div>
                    <p className="text-sm text-muted-foreground">{hhi > 0.25 ? "High concentration - consider diversification" : hhi > 0.15 ? "Moderate concentration" : "Well diversified"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Candidate Sector Impact</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sector</TableHead>
                        <TableHead>Current Weight</TableHead>
                        <TableHead>Candidates</TableHead>
                        <TableHead>Impact if Added (5% each)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(sectorConcentration).map(sector => {
                        const candidatesInSector = MOCK_CANDIDATES.filter(c => c.sector === sector);
                        const addedWeight = candidatesInSector.length * 0.05;
                        return (
                          <TableRow key={sector}>
                            <TableCell className="font-medium">{sector}</TableCell>
                            <TableCell className="font-mono">{(sectorConcentration[sector]*100).toFixed(1)}%</TableCell>
                            <TableCell>{candidatesInSector.length}</TableCell>
                            <TableCell className="font-mono">{((sectorConcentration[sector] + addedWeight) * 100).toFixed(1)}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

function Tabs({ value, onValueChange, children, className }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className || "grid w-full grid-cols-3 mb-4"}>{children}</div>;
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <button className={className || "px-3 py-2 text-sm font-medium"}>{children}</button>;
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}