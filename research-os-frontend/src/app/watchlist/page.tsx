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
  Star, Bell, Minus
} from "lucide-react";
import { MOCK_COMPANIES } from "@/lib/mock-data";

const MOCK_WATCHLISTS = [
  { id: "1", name: "Core Watchlist", description: "High conviction ideas", companies: ["RELIANCE", "TCS", "HDFCBANK", "BAJFINANCE"], isDefault: true },
  { id: "2", name: "Mid/Small Cap Ideas", description: "Growth candidates", companies: ["TRENT", "PERSISTENT", "COFORGE", "DMART"], isDefault: false },
  { id: "3", name: "Banking & Financials", description: "BFSI focused", companies: ["HDFCBANK", "ICICIBANK", "BAJFINANCE", "KOTAKBANK"], isDefault: false },
  { id: "3", name: "Turnaround Candidates", description: "Distressed/special situations", companies: ["SAIL", "BHEL", "IDBI"], isDefault: false },
];

const WATCHLIST_COLUMNS = [
  { key: "symbol", label: "Symbol" },
  { key: "name", label: "Company" },
  { key: "price", label: "Price", type: "number" },
  { key: "change", label: "Change %", type: "number" },
  { key: "pe", label: "P/E", type: "number" },
  { key: "ev_ebitda", label: "EV/EBITDA", type: "number" },
  { key: "roe", label: "ROE %", type: "number" },
  { key: "roce", label: "ROCE %", type: "number" },
  { key: "debt_equity", label: "D/E", type: "number" },
  { key: "fcf_yield", label: "FCF Yield %", type: "number" },
  { key: "dist_52w", label: "52W Dist %", type: "number" },
  { key: "sector", label: "Sector" },
  { key: "alerts", label: "Alerts" },
];

export default function WatchlistPage() {
  const [activeWatchlistId, setActiveWatchlistId] = useState("1");
  const [activeTab, setActiveTab] = useState("watchlist");
  const [watchlists, setWatchlists] = useState(MOCK_WATCHLISTS);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [showCreateWatchlist, setShowCreateWatchlist] = useState(false);
  const [showAddSymbols, setShowAddSymbols] = useState(false);

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  const watchlistCompanies = useMemo(() => 
    MOCK_COMPANIES.filter(c => activeWatchlist?.companies.includes(c.symbol)), 
    [activeWatchlist]
  );

  const handleToggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  };

  const handleSelectAll = () => {
    if (selectedSymbols.length === watchlistCompanies.length) {
      setSelectedSymbols([]);
    } else {
      setSelectedSymbols(watchlistCompanies.map(c => c.symbol));
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Watchlist Manager</h1>
          <p className="text-sm text-muted-foreground">Track candidates, set alerts, and monitor triggers</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activeWatchlistId} onValueChange={setActiveWatchlistId}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Select Watchlist" /></SelectTrigger>
            <SelectContent>
              {watchlists.map(w => <SelectItem key={w.id} value={w.id}>{w.name} {w.isDefault && <span className="ml-2 text-xs text-muted-foreground">(Default)</span>}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowCreateWatchlist(true)}><Plus className="mr-2 h-4 w-4" /> New Watchlist</Button>
          <Button variant="outline" onClick={() => setShowAddSymbols(true)} disabled={!activeWatchlist}><Plus className="mr-2 h-4 w-4" /> Add Companies</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      {/* Watchlist Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Companies" value={watchlistCompanies.length} icon={Building2} />
        <MetricCard label="Avg P/E" value={watchlistCompanies.length ? (watchlistCompanies.reduce((s,c) => s + (c.pe || 0), 0) / watchlistCompanies.length).toFixed(1) : "—"} icon={Calculator} />
        <MetricCard label="Avg ROE" value={watchlistCompanies.length ? (watchlistCompanies.reduce((s,c) => s + (c.roe || 0)*100, 0) / watchlistCompanies.length).toFixed(1) + "%" : "—"} icon={TrendingUp} />
        <MetricCard label="Avg ROCE" value={watchlistCompanies.length ? (watchlistCompanies.reduce((s,c) => s + (c.roce || 0)*100, 0) / watchlistCompanies.length).toFixed(1) + "%" : "—"} icon={TrendingUpIcon} />
        <MetricCard label="Alerts Triggered" value="3" change="2 today" trend="up" icon={Bell} />
        <MetricCard label="Near 52W Low" value={watchlistCompanies.filter(c => (c.dist_from_52w_high || 1) > 0.3).length} icon={TrendingDown} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="watchlist"><Star className="mr-2 h-4 w-4" /> Watchlist</TabsTrigger>
          <TabsTrigger value="alerts"><Bell className="mr-2 h-4 w-4" /> Alerts</TabsTrigger>
          <TabsTrigger value="builder"><Plus className="mr-2 h-4 w-4" /> Builder</TabsTrigger>
        </TabsList>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="flex-1 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{activeWatchlist?.name} ({watchlistCompanies.length} companies)</h2>
            <div className="flex items-center gap-2">
              <Select value={selectedSymbols.length > 0 ? "selected" : "all"} onValueChange={() => {}}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowAddSymbols(true)}><Plus className="mr-2 h-4 w-4" /> Add Companies</Button>
              <Button variant="outline"><Minus className="mr-2 h-4 w-4" /> Remove Selected</Button>
            </div>
          </div>

            <div className="overflow-hidden border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input type="checkbox" checked={selectedSymbols.length === watchlistCompanies.length && watchlistCompanies.length > 0} onChange={handleSelectAll} className="rounded border-input" />
                    </TableHead>
                    {WATCHLIST_COLUMNS.map(col => (
                      <TableHead key={col.key} className={col.type === "number" ? "text-right" : ""} style={{ width: col.key === "name" ? "200px" : col.key === "alerts" ? "120px" : undefined }}>
                        {col.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchlistCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={WATCHLIST_COLUMNS.length + 2} className="text-center py-8 text-muted-foreground">
                        No companies in this watchlist. Add companies to start tracking.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {watchlistCompanies.map(company => {
                      const isSelected = selectedSymbols.includes(company.symbol);
                      const alerts = [];
                      if (company.pe && company.pe > 30) alerts.push("High P/E");
                      if (company.roe && company.roe < 0.1) alerts.push("Low ROE");
                      if (company.debt_equity && company.debt_equity > 2) alerts.push("High D/E");
                      if (company.pledged_holding && company.pledged_holding > 0.1) alerts.push("Pledged >10%");
                      
                      return (
                        <TableRow key={company.symbol} className={isSelected ? 'bg-primary/5' : ''}>
                          <TableCell>
                            <input type="checkbox" checked={isSelected} onChange={() => handleToggleSymbol(company.symbol)} className="rounded border-input" />
                          </TableCell>
                          <TableCell className="font-mono font-medium">{company.symbol}</TableCell>
                          <TableCell className="max-w-xs truncate">{company.name}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">₹{company.current_price.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums" style={{color: (company.change || 0) >= 0 ? 'green' : 'red'}}>
                            {(company.change || 0) >= 0 ? '+' : ''}{(company.change || 0).toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.pe ? company.pe.toFixed(1) : "—"}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.ev_ebitda ? company.ev_ebitda.toFixed(1) : "—"}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.roe ? (company.roe * 100).toFixed(1) : "—"}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.roce ? (company.roce * 100).toFixed(1) : "—"}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.debt_equity ? company.debt_equity.toFixed(2) : "—"}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.fcf_yield ? (company.fcf_yield * 100).toFixed(1) : "—"}</TableCell>
                          <TableCell className="text-right font-mono tabular-nums">{company.dist_from_52w_high ? (company.dist_from_52w_high * 100).toFixed(1) : "—"}</TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{company.sector}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {alerts.map(a => <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>)}
                              {alerts.length === 0 && <Badge variant="secondary" className="text-xs">OK</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { /* View */ }}><Eye className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { /* Set alert */ }}><Bell className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { /* Promote to portfolio */ }}><ArrowUpRight className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    </>
                  )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="flex-1 mt-4 space-y-4">
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>Price & Fundamental Alerts</CardTitle>
                  <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Create Alert</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alert</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Triggered</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 1, alert: "Price below ₹2,400", company: "RELIANCE", condition: "Price < 2400", current: "₹2,500", triggered: false, created: "2024-01-15" },
                        { id: 2, alert: "P/E > 30", company: "TRENT", condition: "P/E > 30", current: "95x", triggered: true, created: "2024-02-01" },
                        { id: 3, alert: "ROE < 15%", company: "HDFCBANK", condition: "ROE < 15%", current: "17%", triggered: false, created: "2024-03-10" },
                        { id: 4, alert: "Promoter pledge > 10%", company: "SAIL", condition: "Pledge > 10%", current: "12%", triggered: true, created: "2024-03-20" },
                      ].map(a => (
                        <TableRow key={a.id} className={a.triggered ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{a.alert}</TableCell>
                          <TableCell className="font-mono font-medium">{a.company}</TableCell>
                          <TableCell>{a.condition}</TableCell>
                          <TableCell className="font-mono tabular-nums">{a.current}</TableCell>
                          <TableCell>
                            {a.triggered ? (
                              <Badge variant="destructive">TRIGGERED</Badge>
                            ) : (
                              <Badge variant="default">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>{a.created}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => { /* Edit */ }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { /* Delete */ }}><XCircle className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Filing & Event Alerts</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { event: "Q4 FY24 Results", company: "RELIANCE", date: "2024-07-15", status: "UPCOMING" },
                      { event: "Annual Report FY24", company: "TCS", date: "2024-06-10", status: "AVAILABLE" },
                      { event: "Concall Transcript", company: "HDFCBANK", date: "2024-07-20", status: "UPCOMING" },
                      { event: "Board Meeting - Dividend", company: "BAJFINANCE", date: "2024-07-25", status: "UPCOMING" },
                    ].map(e => (
                      <div key={e.event} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                        <div>
                          <p className="font-medium">{e.event}</p>
                          <p className="text-sm text-muted-foreground">{e.company} • {e.date}</p>
                        </div>
                        <Badge variant={e.status === "AVAILABLE" ? "default" : "secondary"}>{e.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Builder Tab */}
            <TabsContent value="builder" className="flex-1 mt-4 space-y-4">
              <Card>
                <CardHeader><CardTitle>Watchlist Builder</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <h3 className="font-medium mb-3">Available Companies</h3>
                      <div className="border rounded-lg max-h-96 overflow-y-auto">
                        <div className="p-3 border-b flex items-center gap-2 bg-muted/30">
                          <input type="checkbox" className="rounded border-input" />
                          <span className="text-sm font-medium">Select All</span>
                        </div>
                        {MOCK_COMPANIES.map(c => (
                          <div key={c.symbol} className="p-3 border-b hover:bg-muted/50 flex items-center gap-3">
                            <input type="checkbox" className="rounded border-input" />
                            <span className="font-mono font-medium w-24">{c.symbol}</span>
                            <span className="flex-1 truncate text-sm">{c.name}</span>
                            <Badge variant="secondary" className="text-xs">{c.sector}</Badge>
                            <span className="text-right font-mono text-sm ml-auto">P/E: {c.pe?.toFixed(1) || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">Current Watchlist: {activeWatchlist?.name}</h3>
                      <div className="border rounded-lg max-h-96 overflow-y-auto">
                        {activeWatchlist?.companies.map(symbol => {
                          const c = MOCK_COMPANIES.find(c => c.symbol === symbol);
                          return (
                            <div key={symbol} className="p-3 border-b hover:bg-muted/50 flex items-center gap-3">
                              <span className="font-mono font-medium w-24">{c?.symbol}</span>
                              <span className="flex-1 truncate text-sm">{c?.name}</span>
                              <Badge variant="outline" className="text-xs">{c?.sector}</Badge>
                              <Button variant="ghost" size="icon" className="ml-auto"><XCircle className="h-4 w-4 text-red-600" /></Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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

function handleToggleSymbol(symbol: string) {}
function handleSelectAll() {}
