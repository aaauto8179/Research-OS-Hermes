"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  Plus, Eye, Download, Settings, AlertTriangle,
  TrendingUp, TrendingDown, Target, Zap,
  Building2, Briefcase, BarChart2, FileText,
  Layers, ClipboardList, Calculator, Lightbulb,
  CheckCircle, XCircle, HelpCircle, Pencil,
  Save, Undo2, Redo2, Loader2,
  Calendar, Flag, Truck, Factory, Zap as ZapIcon,
  DollarSign, TrendingUp as TrendingUpIcon,
  PieChart, RefreshCw, ArrowUpRight, ArrowDownRight,
  Star, Bell, Minus, LineChart, Activity, Gauge,
  Users, Globe, Link, BarChart3, PieChart as PieChartIcon,
  ArrowLeft, Shield, Scale, Brain, Heart, AlertCircle
} from "lucide-react";
import { MOCK_COMPANIES } from "@/lib/mock-data";

const BIASES = [
  { id: 1, name: "Confirmation Bias", question: "Did I actively seek out the strongest bear case from credible short-sellers or skeptical analysts?", evidence: "Provide at least 2 substantiated counter-arguments and explain why the market may be wrong." },
  { id: 2, name: "Anchoring Bias", question: "Am I anchoring on the 52-week high, historical peak valuation, or my original purchase price?", evidence: "Evaluate the business strictly at today's fundamentals and forward cash flows, ignoring sunk cost." },
  { id: 3, name: "Sunk Cost Fallacy", question: "If I held zero shares today, would I initiate a fresh position at current market prices?", evidence: "Explicit Yes/No confirmation with capital re-allocation justification." },
  { id: 4, name: "Recency Bias", question: "Am I extrapolating the last 2 quarters of abnormal performance into perpetuity?", evidence: "Benchmark margins against full 10-year normalized economic cycle." },
  { id: 5, name: "Narrative / Story Trap", question: "Is my thesis overly reliant on a compelling management story rather than audited cash flows?", evidence: "Compare management narrative against Concall Consistency score and reported Free Cash Flow." },
  { id: 6, name: "Overconfidence Bias", question: "Have I assigned realistic probabilities to the Bear Case, or assumed everything goes right?", evidence: "Ensure Bear Case scenario models at least a 25% revenue/margin contraction." },
  { id: 7, name: "FOMO / Herd Mentality", question: "Am I buying because the stock is moving fast and peers are discussing it on social channels?", evidence: "Verify that the stock meets all predetermined screener and quality checklist thresholds." },
  { id: 8, name: "Authority / Halo Effect", question: "Am I deferring diligence because a marquee fund manager or superstar investor holds the stock?", evidence: "Verify independent thesis based on raw SEC/ROC filings without reference to institutional pedigree." },
];

const MOCK_WEIGH_DECISIONS = [
  { id: "1", symbol: "RELIANCE", company: "Reliance Industries", status: "INVEST", conviction: 8.5, date: "2024-01-15", size: "5.2%", rationale: "O2C integration + Retail + Digital optionality at fair valuation" },
  { id: "2", symbol: "TCS", company: "Tata Consultancy Services", status: "MONITOR", conviction: 7.2, date: "2023-11-10", size: "3.5%", rationale: "Consistent compounder but rich valuation, wait for pullback" },
  { id: "3", symbol: "HDFCBANK", company: "HDFC Bank", status: "INVEST", conviction: 8.2, date: "2023-12-05", size: "4.8%", rationale: "Merger synergies, clean asset quality, reasonable P/B" },
  { id: "4", symbol: "TRENT", company: "Trent Ltd", status: "PASS", conviction: 5.5, date: "2024-02-01", size: "0%", rationale: "Great business but 95x P/E, no margin of safety" },
  { id: "5", symbol: "BAJFINANCE", company: "Bajaj Finance", status: "INVEST", conviction: 8.0, date: "2024-01-20", size: "3.8%", rationale: "Retail lending franchise, digital transformation at fair value" },
];

export default function WeighDecisionsPage() {
  const [activeTab, setActiveTab] = useState("decisions");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showNewDecision, setShowNewDecision] = useState(false);

  const portfolioValue = 500000000; // ₹500 Cr
  const portfolioHoldings = [
    { symbol: "RELIANCE", weight: 5.2, sector: "Oil & Gas" },
    { symbol: "TCS", weight: 3.5, sector: "IT Services" },
    { symbol: "HDFCBANK", weight: 4.8, sector: "Banking" },
    { symbol: "BAJFINANCE", weight: 3.8, sector: "Financial Services" },
  ];

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Weigh Decisions</h1>
          <p className="text-sm text-muted-foreground">Portfolio construction, risk correlation, and behavioral audit</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowNewDecision(true)}><Plus className="mr-2 h-4 w-4" /> New Decision</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Memo</Button>
        </div>
      </div>

      {/* Portfolio Context */}
      <Card className="mb-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Portfolio Context</CardTitle>
          <Badge variant="secondary">Total: ₹500 Cr</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Value" value="₹500 Cr" />
            <MetricCard label="Equity Weight" value="92%" />
            <MetricCard label="Cash" value="8%" />
            <MetricCard label="Top 5 Weight" value="42%" />
            <MetricCard label="Sector Concentration" value="Banking 22%, IT 18%" />
            <MetricCard label="Promoter Overlap" value="Low" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holding</TableHead>
                  <TableHead className="text-right">Weight %</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Current Price</TableHead>
                  <TableHead className="text-right">Target Price</TableHead>
                  <TableHead className="text-right">Upside %</TableHead>
                  <TableHead>Conviction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioHoldings.map(h => (
                  <TableRow key={h.symbol}>
                    <TableCell className="font-mono font-medium">{h.symbol}</TableCell>
                    <TableCell className="text-right font-bold">{h.weight}%</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{h.sector}</Badge></TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{(Math.random()*3000+1000).toFixed(0)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{(Math.random()*3000+1500).toFixed(0)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">+{(Math.random()*30+10).toFixed(1)}%</TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">{(Math.random()*3+7).toFixed(1)}/10</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="decisions"><Target className="mr-2 h-4 w-4" /> Decisions</TabsTrigger>
          <TabsTrigger value="fit"><Users className="mr-2 h-4 w-4" /> Portfolio Fit</TabsTrigger>
          <TabsTrigger value="correlation"><Link className="mr-2 h-4 w-4" /> Correlation</TabsTrigger>
          <TabsTrigger value="allocation"><DollarSign className="mr-2 h-4 w-4" /> Allocation</TabsTrigger>
          <TabsTrigger value="behavioral"><Brain className="mr-2 h-4 w-4" /> Behavioral Audit</TabsTrigger>
        </TabsList>

        {/* Decisions Tab */}
        <TabsContent value="decisions" className="flex-1 mt-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Investment Decisions</h2>
            <Button onClick={() => setShowNewDecision(true)}><Plus className="mr-2 h-4 w-4" /> New Decision</Button>
          </div>
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead className="text-center">Conviction</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Rationale</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_WEIGH_DECISIONS.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-medium">{d.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "INVEST" ? "default" : d.status === "MONITOR" ? "secondary" : "destructive"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={d.conviction >= 8 ? "default" : d.conviction >= 7 ? "secondary" : "outline"}>
                        {d.conviction}/10
                      </Badge>
                    </TableCell>
                    <TableCell>{d.date}</TableCell>
                    <TableCell className="font-bold">{d.size}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{d.rationale}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          
          
          
          
          
          
        
          </TabsContent>

        {/* Portfolio Fit Tab */}
        <TabsContent value="fit" className="flex-1 mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Sector Concentration Check</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Current %</TableHead>
                      <TableHead className="text-right">Post-Trade %</TableHead>
                      <TableHead className="text-right">Limit %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { sector: "Banking", current: 22, post: 25, limit: 30 },
                      { sector: "IT Services", current: 18, post: 18, limit: 25 },
                      { sector: "Oil & Gas", current: 15, post: 15, limit: 20 },
                      { sector: "Consumer", current: 8, post: 8, limit: 15 },
                      { sector: "Financial Services", current: 12, post: 15, limit: 20 },
                    ].map(s => (
                      <TableRow key={s.sector}>
                        <TableCell>{s.sector}</TableCell>
                        <TableCell className="text-right">{s.current}%</TableCell>
                        <TableCell className="text-right font-bold">{s.post}%</TableCell>
                        <TableCell className="text-right">{s.limit}%</TableCell>
                        <TableCell>
                          <Badge variant={s.post <= s.limit ? "default" : "destructive"}>
                            {s.post <= s.limit ? "OK" : "BREACH"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Promoter Overlap Check</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Check for common promoter groups across holdings</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Promoter Group</TableHead>
                      <TableHead className="text-right">Holdings</TableHead>
                      <TableHead className="text-right">Combined Weight</TableHead>
                      <TableHead>Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { group: "Tata Group", holdings: "TCS, TATAMOTORS, TATAPOWER", weight: 8.5, risk: "Medium" },
                      { group: "Ambani Group", holdings: "RELIANCE", weight: 5.2, risk: "Low" },
                      { group: "Bajaj Group", holdings: "BAJFINANCE, BAJAJ-AUTO", weight: 7.1, risk: "Medium" },
                    ].map(g => (
                      <TableRow key={g.group}>
                        <TableCell>{g.group}</TableCell>
                        <TableCell className="text-sm">{g.holdings}</TableCell>
                        <TableCell className="text-right font-bold">{g.weight}%</TableCell>
                        <TableCell><Badge variant={g.risk === "Low" ? "default" : "secondary"}>{g.risk}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Market Cap Allocation</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { cat: "Large Cap", current: 65, target: 60, limit: 80 },
                    { cat: "Mid Cap", current: 25, target: 30, limit: 30 },
                    { cat: "Small Cap", current: 10, target: 10, limit: 15 },
                  ].map(c => (
                    <div key={c.cat} className="flex items-center gap-4 p-3 bg-muted/50 rounded">
                      <span className="w-24 font-medium">{c.cat}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${c.current}%` }} />
                      </div>
                      <span className="w-12 text-right font-mono">{c.current}%</span>
                      <span className="w-12 text-right text-xs text-muted-foreground">Target: {c.target}%</span>
                      <span className="w-12 text-right text-xs text-muted-foreground">Limit: {c.limit}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Liquidity Profile</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Avg Daily Volume (Cr)</p><p className="font-bold text-xl">₹45 Cr</p></div>
                <div className="p-3 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Days to Liquidate 1%</p><p className="font-bold text-xl">2.3 days</p></div>
                <div className="p-3 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Impact Cost (bps)</p><p className="font-bold text-xl">12 bps</p></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Correlation Tab */}
        <TabsContent value="correlation" className="flex-1 mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle>Cross-Asset Risk Correlation Matrix</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Risk Bucket</TableHead>
                      {["Business", "Financial", "Valuation", "Governance", "Macro", "Industry", "Portfolio"].map(r => <TableHead key={r} className="text-center text-sm">{r}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {["Business", "Financial", "Valuation", "Governance", "Macro", "Industry"].map((r1, i) => (
                      <TableRow key={r1}>
                        <TableCell className="font-medium">{r1}</TableCell>
                        {["Business", "Financial", "Valuation", "Governance", "Macro", "Industry", "Portfolio"].map((r2, j) => (
                          <TableCell key={r2} className="text-center">
                            {i === j ? (
                              <Badge variant="default">1.00</Badge>
                            ) : (
                              <span className={`${Math.random() > 0.5 ? "text-red-600" : "text-green-600"} font-mono`}>
                                {(Math.random() * 0.6 + 0.2).toFixed(2)}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>New Idea Correlation Impact</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Simulate adding a new position and see correlation impact</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><Label>New Symbol</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {MOCK_COMPANIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.symbol}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Proposed Weight %</Label><Input type="number" step="0.1" placeholder="3.0" /></div>
                  <div className="md:col-span-2"><Label>Risk Bucket Contribution</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Business", "Financial", "Valuation", "Governance", "Macro", "Industry"].map(r => (
                        <div key={r} className="p-2 bg-muted/50 rounded text-center">
                          <p className="text-xs text-muted-foreground">{r}</p>
                          <p className="font-bold text-red-600">+{(Math.random()*0.5+0.1).toFixed(2)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-medium text-red-700">⚠️ Warning: Adding this position would increase Portfolio Financial Risk by 0.42% (breaches 5% threshold)</p>
                  <p className="text-sm text-red-600 mt-1">Consider reducing exposure to BAJFINANCE or HDFCBANK to accommodate</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="flex-1 mt-4 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Valuation & Allocation Discipline</CardTitle>
              <Badge variant="secondary">New Idea: RELIANCE</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardHeader><CardTitle>Bear Case</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Expected Return</span><span className="font-bold text-red-600">-12%</span></div>
                    <div className="flex justify-between"><span>Target Price</span><span className="font-bold">₹2,100</span></div>
                    <div className="flex justify-between"><span>Downside %</span><span className="font-bold text-red-600">-16%</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Base Case</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Expected Return</span><span className="font-bold text-green-600">+18%</span></div>
                    <div className="flex justify-between"><span>Target Price</span><span className="font-bold">₹2,950</span></div>
                    <div className="flex justify-between"><span>Upside %</span><span className="font-bold text-green-600">+18%</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Bull Case</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Expected Return</span><span className="font-bold text-green-600">+45%</span></div>
                    <div className="flex justify-between"><span>Target Price</span><span className="font-bold">₹3,625</span></div>
                    <div className="flex justify-between"><span>Upside %</span><span className="font-bold text-green-600">+45%</span></div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Margin of Safety</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between"><span>CMP</span><span className="font-bold">₹2,500</span></div>
                    <div className="flex justify-between"><span>Base Case FV</span><span className="font-bold">₹2,950</span></div>
                    <div className="flex justify-between border-t pt-2"><span className="font-medium">MOS</span><span className="font-bold text-green-600">+18%</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Position Sizing</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between"><span>Starter (2-3%)</span><span>₹10-15 Cr</span></div>
                    <div className="flex justify-between"><span>Core (5-7%)</span><span>₹25-35 Cr</span></div>
                    <div className="flex justify-between border-t pt-2"><span className="font-medium">Recommended</span><span className="font-bold">5.2% (Starter→Core)</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Review Triggers</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2"><Badge variant="outline">Price &gt; ₹2,900</Badge><span className="text-sm">Trim 25%</span></div>
                    <div className="flex items-center gap-2"><Badge variant="outline">Price &lt; ₹2,200</Badge><span className="text-sm">Add 25%</span></div>
                    <div className="flex items-center gap-2"><Badge variant="outline">O2C spreads &lt; $8/bbl</Badge><span className="text-sm">Review thesis</span></div>
                    <div className="flex items-center gap-2"><Badge variant="outline">Jio ARPU &lt; ₹170</Badge><span className="text-sm">Reassess digital</span></div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Audit Tab */}
        <TabsContent value="behavioral" className="flex-1 mt-4 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Behavioral Audit Checklist</CardTitle>
              <Badge variant="secondary">Mandatory for all INVEST decisions</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {BIASES.map((bias, i) => (
                <div key={bias.id} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{bias.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{bias.question}</p>
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        <span className="font-medium text-muted-foreground">Required Evidence: </span>
                        <span>{bias.evidence}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">✓ Passed</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">✗ Failed</Button>
                    </div>
                  </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Decision Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-green-50 rounded"><p className="text-xs text-green-700">Biases Passed</p><p className="text-3xl font-bold text-green-700">8/8</p></div>
                <div className="p-3 bg-blue-50 rounded"><p className="text-xs text-blue-700">Decision</p><p className="text-3xl font-bold text-blue-700">INVEST</p></div>
                <div className="p-3 bg-green-50 rounded"><p className="text-xs text-green-700">Sizing</p><p className="text-3xl font-bold text-green-700">5.2%</p></div>
                <div className="p-3 bg-yellow-50 rounded"><p className="text-xs text-yellow-700">Review Date</p><p className="text-3xl font-bold text-yellow-700">2024-07-15</p></div>
              </div>
              <div className="p-4 bg-muted/30 rounded">
                <h4 className="font-medium mb-2">Final Summary</h4>
                <p className="text-sm whitespace-pre-wrap">RELIANCE offers a unique conglomerate at fair value with three growth engines (O2C, Retail, Digital) plus optionality in New Energy. Base case 18% upside with 18% MOS. Bear case -16% protected by asset base. Sizing at 5.2% starter→core reflects high conviction balanced by conglomerate complexity. Review triggers: O2C spreads &lt;$8/bbl, Jio ARPU &lt;₹170, Retail SSG &lt;15%. All 8 behavioral biases passed with documented evidence.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Memo</Button>
                <Button onClick={() => setShowNewDecision(true)}><Plus className="mr-2 h-4 w-4" /> New Decision</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon: Icon }: { label: string; value: string; change?: string; trend?: "up" | "down"; icon?: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />} {change}
              </p>
            )}
          </div>
          {Icon && <div className="p-2 bg-muted rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
        </div>
      </CardContent>
    </Card>
  );
}

