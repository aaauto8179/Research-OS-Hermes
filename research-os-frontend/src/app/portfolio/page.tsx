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
  Upload
} from "lucide-react";
import { Portfolio, Holding, Transaction } from "@/lib/types";
import { MOCK_COMPANIES } from "@/lib/mock-data";

const MOCK_PORTFOLIOS = [
  { id: "1", name: "Core Portfolio", benchmark: "NIFTY50", currency: "INR", active: true },
  { id: "2", name: "Satellite Portfolio", benchmark: "NIFTY500", currency: "INR", active: true },
];

const MOCK_HOLDINGS = [
  { id: "1", portfolio_id: "1", symbol: "RELIANCE", name: "Reliance Industries", quantity: 5000, avg_cost: 2200, current_price: 2500, sector: "Oil & Gas", market_cap: "LARGE", entry_date: "2023-06-15", entry_rationale: "O2C integration + Retail + Digital optionality" },
  { id: "2", portfolio_id: "1", symbol: "TCS", name: "Tata Consultancy Services", quantity: 2000, avg_cost: 3200, current_price: 3800, sector: "IT Services", market_cap: "LARGE", entry_date: "2022-11-10", entry_rationale: "Consistent compounder, strong FCF" },
  { id: "3", portfolio_id: "1", symbol: "HDFCBANK", name: "HDFC Bank", quantity: 8000, avg_cost: 1450, current_price: 1650, sector: "Banking", market_cap: "LARGE", entry_date: "2023-03-20", entry_rationale: "Merger synergies, clean asset quality" },
  { id: "4", portfolio_id: "1", symbol: "BAJFINANCE", name: "Bajaj Finance", quantity: 1500, avg_cost: 6200, current_price: 7200, sector: "Financial Services", market_cap: "LARGE", entry_date: "2023-08-01", entry_rationale: "Retail lending franchise, digital transformation" },
  { id: "5", portfolio_id: "1", symbol: "TRENT", name: "Trent Ltd", quantity: 3000, avg_cost: 2800, current_price: 4200, sector: "Consumer", market_cap: "MID", entry_date: "2023-05-15", entry_rationale: "Westside expansion, strong SSG" },
  { id: "6", portfolio_id: "2", symbol: "PERSISTENT", name: "Persistent Systems", quantity: 2000, avg_cost: 4800, current_price: 5800, sector: "IT Services", market_cap: "MID", entry_date: "2023-09-01", entry_rationale: "Cloud migration tailwinds" },
  { id: "7", portfolio_id: "2", symbol: "COFORGE", name: "Coforge Ltd", quantity: 2500, avg_cost: 3800, current_price: 4500, sector: "IT Services", market_cap: "MID", entry_date: "2023-10-15", entry_rationale: "BFSI vertical strength, Europe expansion" },
];

const MOCK_TRANSACTIONS = [
  { id: "1", portfolio_id: "1", symbol: "RELIANCE", type: "BUY", date: "2023-06-15", quantity: 5000, price: 2200, charges: 500, value: 11000000, net_value: 11000500, rationale: "Initial position" },
  { id: "2", portfolio_id: "1", symbol: "TCS", type: "BUY", date: "2022-11-10", quantity: 2000, price: 3200, charges: 300, value: 6400000, net_value: 6400300, rationale: "Initial position" },
  { id: "3", portfolio_id: "1", symbol: "HDFCBANK", type: "BUY", date: "2023-03-20", quantity: 8000, price: 1450, charges: 800, value: 11600000, net_value: 11600800, rationale: "Post-merger opportunity" },
  { id: "4", portfolio_id: "1", symbol: "RELIANCE", type: "BUY", date: "2023-10-05", quantity: 1000, price: 2400, charges: 200, value: 2400000, net_value: 2400200, rationale: "Add on dip" },
  { id: "5", portfolio_id: "1", symbol: "BAJFINANCE", type: "BUY", date: "2023-08-01", quantity: 1500, price: 6200, charges: 400, value: 9300000, net_value: 9300400, rationale: "Initial position" },
  { id: "6", portfolio_id: "1", symbol: "TRENT", type: "BUY", date: "2023-05-15", quantity: 3000, price: 2800, charges: 300, value: 8400000, net_value: 8400300, rationale: "Westside expansion story" },
];

const BENCHMARK_DATA = [
  { date: "2023-01-01", portfolio: 10000000, benchmark: 10000000 },
  { date: "2023-02-01", portfolio: 10200000, benchmark: 10100000 },
  { date: "2023-03-01", portfolio: 10500000, benchmark: 10300000 },
  { date: "2023-04-01", portfolio: 10300000, benchmark: 10200000 },
  { date: "2023-05-01", portfolio: 10800000, benchmark: 10400000 },
  { date: "2023-06-01", portfolio: 11200000, benchmark: 10600000 },
  { date: "2023-07-01", portfolio: 11500000, benchmark: 10800000 },
  { date: "2023-08-01", portfolio: 11800000, benchmark: 11000000 },
  { date: "2023-09-01", portfolio: 12200000, benchmark: 11200000 },
  { date: "2023-10-01", portfolio: 12500000, benchmark: 11400000 },
  { date: "2023-11-01", portfolio: 13000000, benchmark: 11600000 },
  { date: "2023-12-01", portfolio: 13500000, benchmark: 11800000 },
  { date: "2024-01-01", portfolio: 13800000, benchmark: 12000000 },
  { date: "2024-02-01", portfolio: 14200000, benchmark: 12200000 },
  { date: "2024-03-01", portfolio: 14500000, benchmark: 12300000 },
  { date: "2024-04-01", portfolio: 14800000, benchmark: 12400000 },
  { date: "2024-05-01", portfolio: 15200000, benchmark: 12500000 },
  { date: "2024-06-01", portfolio: 15500000, benchmark: 12600000 },
  { date: "2024-07-01", portfolio: 15800000, benchmark: 12700000 },
  { date: "2024-08-01", portfolio: 16200000, benchmark: 12800000 },
  { date: "2024-09-01", portfolio: 16500000, benchmark: 12900000 },
  { date: "2024-10-01", portfolio: 16800000, benchmark: 13000000 },
];

export default function PortfolioPage() {
  const [activePortfolioId, setActivePortfolioId] = useState("1");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [holdings, setHoldings] = useState(MOCK_HOLDINGS);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [editingHolding, setEditingHolding] = useState<any>(null);

  const portfolioHoldings = useMemo(() => 
    holdings.filter(h => h.portfolio_id === activePortfolioId), [holdings, activePortfolioId]);
  
  const portfolioTransactions = useMemo(() => 
    transactions.filter(t => t.portfolio_id === activePortfolioId), [transactions, activePortfolioId]);

  const totalValue = useMemo(() => 
    portfolioHoldings.reduce((sum, h) => sum + (h.current_price || 0) * h.quantity, 0), [portfolioHoldings]);
  
  const totalCost = useMemo(() => 
    portfolioHoldings.reduce((sum, h) => sum + h.avg_cost * h.quantity, 0), [portfolioHoldings]);
  
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const sectorAllocation = useMemo(() => {
    const alloc: Record<string, number> = {};
    portfolioHoldings.forEach(h => {
      alloc[h.sector] = (alloc[h.sector] || 0) + (h.current_price || 0) * h.quantity;
    });
    return Object.entries(alloc).map(([sector, value]) => ({ sector, value, pct: (value / totalValue) * 100 }));
  }, [portfolioHoldings, totalValue]);

  const marketCapAllocation = useMemo(() => {
    const alloc: Record<string, number> = {};
    portfolioHoldings.forEach(h => {
      alloc[h.market_cap] = (alloc[h.market_cap] || 0) + (h.current_price || 0) * h.quantity;
    });
    return Object.entries(alloc).map(([cat, value]) => ({ category: cat, value, pct: (value / totalValue) * 100 }));
  }, [portfolioHoldings, totalValue]);

  const calculateMetrics = () => {
    const portValues = BENCHMARK_DATA.map(d => d.portfolio);
    const benchValues = BENCHMARK_DATA.map(d => d.benchmark);
    // Simplified metrics
    return {
      twr: 0.68,
      xirr: 0.72,
      annualized: 0.24,
      volatility: 0.15,
      beta: 1.05,
      sharpe: 1.2,
      sortino: 1.6,
      maxDD: -0.08,
      maxDDDuration: 45,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Portfolio Management</h1>
            <Badge variant="secondary">{MOCK_PORTFOLIOS.find(p => p.id === activePortfolioId)?.name || "Portfolio"}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activePortfolioId} onValueChange={setActivePortfolioId}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MOCK_PORTFOLIOS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowAddHolding(true)}><Plus className="mr-2 h-4 w-4" /> Add Holding</Button>
          <Button variant="outline" onClick={() => setShowAddTransaction(true)}><Download className="mr-2 h-4 w-4" /> Record Transaction</Button>
          <Button variant="outline" onClick={() => { /* Import */ }}><Upload className="mr-2 h-4 w-4" /> Import</Button>
          <Button><RefreshCw className="mr-2 h-4 w-4" /> Refresh Prices</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MetricCard label="Total Value" value={`₹${(totalValue/100).toFixed(0)} Cr`} />
        <MetricCard label="Total Cost" value={`₹${(totalCost/100).toFixed(0)} Cr`} />
        <MetricCard label="Unrealized P&L" value={`₹${(totalPnL/100).toFixed(0)} Cr`} change={totalPnLPct.toFixed(2)} trend={totalPnL >= 0 ? "up" : "down"} />
        <MetricCard label="P&L %" value={`${totalPnLPct.toFixed(2)}%`} change={totalPnLPct.toFixed(2)} trend={totalPnL >= 0 ? "up" : "down"} />
        <MetricCard label="XIRR" value={`${(metrics.xirr*100).toFixed(1)}%`} icon={TrendingUp} />
        <MetricCard label="Sharpe" value={metrics.sharpe.toFixed(2)} icon={BarChart2} />
        <MetricCard label="Max DD" value={`${(metrics.maxDD*100).toFixed(1)}%`} change={metrics.maxDDDuration.toString()} trend="down" icon={TrendingDown} />
        <MetricCard label="Beta" value={metrics.beta.toFixed(2)} icon={PieChart} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard"><PieChart className="mr-2 h-4 w-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="holdings"><Briefcase className="mr-2 h-4 w-4" /> Holdings</TabsTrigger>
          <TabsTrigger value="transactions"><RefreshCw className="mr-2 h-4 w-4" /> Transactions</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart2 className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="flex-1 mt-4 space-y-4">
          {/* Performance Chart */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Portfolio vs Benchmark</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-around px-4">
                {BENCHMARK_DATA.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-green-500 rounded-t" style={{ height: `${(d.portfolio / 16800000) * 100}%` }} />
                    <div className="w-full bg-blue-500 rounded-t mt-2" style={{ height: `${(d.benchmark / 13000000) * 100}%` }} />
                    <span className="text-xs text-center mt-1">{d.date.split("-")[1]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Sector Allocation</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sectorAllocation.map(s => (
                    <div key={s.sector} className="flex items-center gap-3">
                      <div className="w-32 text-sm">{s.sector}</div>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${s.pct}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{s.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Market Cap Allocation</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketCapAllocation.map(m => (
                    <div key={m.category} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-20">{m.category}</Badge>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full" style={{ width: `${m.pct}%` }} />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{m.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard label="Volatility (Ann.)" value={`${(metrics.volatility*100).toFixed(1)}%`} icon={TrendingUp} />
            <MetricCard label="Sortino" value={metrics.sortino.toFixed(2)} icon={TrendingUp} />
            <MetricCard label="Max DD Duration" value={`${metrics.maxDDDuration} days`} icon={Calendar} />
            <MetricCard label="Holdings" value={`${portfolioHoldings.length}`} icon={Briefcase} />
          </div>
        </TabsContent>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="flex-1 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Holdings ({portfolioHoldings.length})</h2>
            <Button onClick={() => setShowAddHolding(true)}><Plus className="mr-2 h-4 w-4" /> Add Holding</Button>
          </div>
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Avg Cost</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                  <TableHead className="text-right">P&L %</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Entry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioHoldings.map(holding => {
                  const currentValue = (holding.current_price || 0) * holding.quantity;
                  const costValue = holding.avg_cost * holding.quantity;
                  const pnl = currentValue - costValue;
                  const pnlPct = costValue > 0 ? (pnl / costValue) * 100 : 0;
                  const weight = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
                  return (
                    <TableRow key={holding.id} onClick={() => setEditingHolding(holding)}>
                      <TableCell className="font-mono font-medium">{holding.symbol}</TableCell>
                      <TableCell className="max-w-xs truncate">{holding.name}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{holding.sector}</Badge></TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{holding.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">₹{holding.avg_cost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">₹{(holding.current_price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">₹{(currentValue/100).toFixed(0)}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums" style={{color: pnl >= 0 ? 'green' : 'red'}}>
                        {pnl >= 0 ? '+' : ''}₹{(pnl/100).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums" style={{color: pnl >= 0 ? 'green' : 'red'}}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{weight.toFixed(2)}%</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{holding.entry_date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingHolding(holding); }}><Pencil className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="flex-1 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Transaction History</h2>
            <Button onClick={() => setShowAddTransaction(true)}><Plus className="mr-2 h-4 w-4" /> Record Transaction</Button>
          </div>
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Charges</TableHead>
                  <TableHead className="text-right">Net Value</TableHead>
                  <TableHead>Rationale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioTransactions.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell className="font-mono font-medium">{txn.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={txn.type === "BUY" ? "default" : "destructive"}>
                        {txn.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{txn.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{txn.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{(txn.value/100).toFixed(0)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{txn.charges.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{(txn.net_value/100).toFixed(0)}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{txn.rationale || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="flex-1 mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Risk Metrics</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <MetricCard label="Annualized Volatility" value={`${(metrics.volatility*100).toFixed(1)}%`} />
                <MetricCard label="Beta vs NIFTY50" value={metrics.beta.toFixed(2)} />
                <MetricCard label="Sharpe Ratio" value={metrics.sharpe.toFixed(2)} />
                <MetricCard label="Sortino Ratio" value={metrics.sortino.toFixed(2)} />
                <MetricCard label="Max Drawdown" value={`${(metrics.maxDD*100).toFixed(1)}%`} />
                <MetricCard label="Max DD Duration" value={`${metrics.maxDDDuration} days`} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Return Attribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>Portfolio Return (TWR)</span><span className="font-bold text-green-600">68.0%</span></div>
                  <div className="flex justify-between"><span>Benchmark Return</span><span className="font-bold">30.0%</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-medium">Alpha</span><span className="font-bold text-green-600">38.0%</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Holding Modal */}
      {(showAddHolding || editingHolding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowAddHolding(false); setEditingHolding(null); }}>
          <div className="bg-background rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">{editingHolding ? "Edit Holding" : "Add Holding"}</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowAddHolding(false); setEditingHolding(null); }}><XCircle className="h-5 w-5" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <div><Label>Symbol</Label>
                <Select value={editingHolding?.symbol || "RELIANCE"} onValueChange={(v) => { /* update */ }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MOCK_COMPANIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.symbol}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quantity</Label><Input type="number" placeholder="100" /></div>
                <div><Label>Avg Cost</Label><Input type="number" step="0.01" placeholder="2500" /></div>
              </div>
              <div><Label>Entry Rationale</Label><Textarea placeholder="Why this position?" rows={2} /></div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => { setShowAddHolding(false); setEditingHolding(null); }}>Cancel</Button>
                <Button onClick={() => { setShowAddHolding(false); setEditingHolding(null); }}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon: Icon }: { label: string; value: string | number; change?: string; trend?: "up" | "down"; icon?: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
                          <p className={`text-xs mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                            {trend === "up" ? <ArrowUpRight className="inline h-3 w-3 mr-1" /> : <ArrowDownRight className="inline h-3 w-3 mr-1" />} {change}%
                          </p>
                        )}
          </div>
          {Icon && <div className="p-2 bg-muted rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
        </div>
      </CardContent>
    </Card>
  );
}

