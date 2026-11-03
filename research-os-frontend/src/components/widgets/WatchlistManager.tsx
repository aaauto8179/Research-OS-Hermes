"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Star, Plus, Trash2, Eye, Bell, ArrowUpRight, Search, Filter } from "lucide-react";

interface WatchlistManagerProps {
  watchlistId?: string;
}

const MOCK_WATCHLISTS = [
  { id: "1", name: "Core Watchlist", description: "High conviction ideas", companies: ["RELIANCE", "TCS", "HDFCBANK", "BAJFINANCE"], isDefault: true, created: "2024-01-15" },
  { id: "2", name: "Mid/Small Cap Ideas", description: "Growth candidates", companies: ["TRENT", "PERSISTENT", "COFORGE", "DMART"], isDefault: false, created: "2024-03-20" },
  { id: "3", name: "Banking & Financials", description: "BFSI focused", companies: ["HDFCBANK", "ICICIBANK", "BAJFINANCE", "KOTAKBANK"], isDefault: false, created: "2024-05-10" },
  { id: "4", name: "Turnaround Candidates", description: "Distressed/special situations", companies: ["SAIL", "BHEL", "IDBI"], isDefault: false, created: "2024-06-15" },
];

const MOCK_COMPANIES = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas", current_price: 2500, change: 1.2, pe: 24.5, ev_ebitda: 12.8, roe: 0.15, roce: 0.18, debt_equity: 0.4, fcf_yield: 0.05, dist_from_52w_high: 0.08, pledged_holding: 0.05 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", current_price: 3800, change: 0.8, pe: 28.2, ev_ebitda: 18.5, roe: 0.42, roce: 0.48, debt_equity: 0.05, fcf_yield: 0.03, dist_from_52w_high: 0.12, pledged_holding: 0 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", current_price: 1650, change: -0.5, pe: 18.2, ev_ebitda: 0, roe: 0.17, roce: 0, debt_equity: 0, fcf_yield: 0.04, dist_from_52w_high: 0.15, pledged_holding: 0 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financial Services", current_price: 7200, change: 1.5, pe: 32.8, ev_ebitda: 0, roe: 0.22, roce: 0, debt_equity: 3.2, fcf_yield: 0.02, dist_from_52w_high: 0.22, pledged_holding: 0.08 },
  { symbol: "TRENT", name: "Trent Ltd", sector: "Consumer", current_price: 4200, change: 2.1, pe: 95.2, ev_ebitda: 45.8, roe: 0.28, roce: 0.32, debt_equity: 0.3, fcf_yield: 0.01, dist_from_52w_high: 0.05, pledged_holding: 0 },
  { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT Services", current_price: 5800, change: 1.8, pe: 35.4, ev_ebitda: 22.1, roe: 0.25, roce: 0.30, debt_equity: 0.1, fcf_yield: 0.025, dist_from_52w_high: 0.10, pledged_holding: 0 },
  { symbol: "COFORGE", name: "Coforge Ltd", sector: "IT Services", current_price: 4500, change: 0.9, pe: 28.6, ev_ebitda: 18.2, roe: 0.24, roce: 0.29, debt_equity: 0.15, fcf_yield: 0.028, dist_from_52w_high: 0.14, pledged_holding: 0 },
  { symbol: "DMART", name: "Avenue Supermarts", sector: "Consumer", current_price: 3800, change: -0.3, pe: 85.4, ev_ebitda: 42.1, roe: 0.18, roce: 0.22, debt_equity: 0.2, fcf_yield: 0.015, dist_from_52w_high: 0.18, pledged_holding: 0 },
  { symbol: "ICICIBANK", name: "ICICI Bank", sector: "Banking", current_price: 1100, change: 0.5, pe: 16.8, ev_ebitda: 0, roe: 0.16, roce: 0, debt_equity: 0, fcf_yield: 0.045, dist_from_52w_high: 0.10, pledged_holding: 0 },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", sector: "Banking", current_price: 1800, change: -0.2, pe: 19.2, ev_ebitda: 0, roe: 0.14, roce: 0, debt_equity: 0, fcf_yield: 0.035, dist_from_52w_high: 0.12, pledged_holding: 0 },
  { symbol: "SAIL", name: "Steel Authority of India", sector: "Metals", current_price: 85, change: 3.2, pe: 8.5, ev_ebitda: 5.2, roe: 0.05, roce: 0.08, debt_equity: 1.8, fcf_yield: 0.08, dist_from_52w_high: 0.35, pledged_holding: 0.12 },
  { symbol: "BHEL", name: "Bharat Heavy Electricals", sector: "Capital Goods", current_price: 125, change: 2.8, pe: 12.4, ev_ebitda: 6.8, roe: 0.03, roce: 0.05, debt_equity: 2.1, fcf_yield: 0.06, dist_from_52w_high: 0.40, pledged_holding: 0.15 },
  { symbol: "IDBI", name: "IDBI Bank", sector: "Banking", current_price: 65, change: 1.5, pe: 10.2, ev_ebitda: 0, roe: 0.04, roce: 0, debt_equity: 0, fcf_yield: 0.05, dist_from_52w_high: 0.30, pledged_holding: 0.20 },
];

const COLUMNS = [
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

export default function WatchlistManager({ watchlistId = "1" }: WatchlistManagerProps) {
  const [watchlists, setWatchlists] = useState(MOCK_WATCHLISTS);
  const [activeWatchlistId, setActiveWatchlistId] = useState(watchlistId);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
    const [showAddSymbols, setShowAddSymbols] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
  const [newWatchlistDesc, setNewWatchlistDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeWatchlist = watchlists.find(w => w.id === activeWatchlistId);
  const watchlistCompanies = MOCK_COMPANIES.filter(c => activeWatchlist?.companies.includes(c.symbol));

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

  const handleCreateWatchlist = () => {
    if (!newWatchlistName.trim()) return;
    const newId = String(Date.now());
    setWatchlists(prev => [...prev, { 
      id: newId, 
      name: newWatchlistName, 
      description: newWatchlistDesc, 
      companies: [], 
      isDefault: false, 
      created: new Date().toISOString().split("T")[0] 
    }]);
    setActiveWatchlistId(newId);
    setShowCreate(false);
    setNewWatchlistName("");
    setNewWatchlistDesc("");
  };

  const handleAddSymbols = (symbols: string[]) => {
    setWatchlists(prev => prev.map(w => 
      w.id === activeWatchlistId 
        ? { ...w, companies: [...new Set([...w.companies, ...symbols])] }
        : w
    ));
    setSelectedSymbols([]);
  };

  const handleRemoveSymbols = () => {
    if (selectedSymbols.length === 0) return;
    setWatchlists(prev => prev.map(w => 
      w.id === activeWatchlistId 
        ? { ...w, companies: w.companies.filter(s => !selectedSymbols.includes(s)) }
        : w
    ));
    setSelectedSymbols([]);
  };

  const filteredCompanies = MOCK_COMPANIES.filter(c => 
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const computeAlerts = (c: any) => {
    const alerts = [];
    if (c.pe && c.pe > 30) alerts.push("High P/E");
    if (c.roe && c.roe < 0.1) alerts.push("Low ROE");
    if (c.debt_equity && c.debt_equity > 2) alerts.push("High D/E");
    if (c.pledged_holding && c.pledged_holding > 0.1) alerts.push("Pledged >10%");
    return alerts;
  };

  // Compute watchlist rows
  const watchlistRows = watchlistCompanies.map(company => {
    const isSelected = selectedSymbols.includes(company.symbol);
    const alerts = computeAlerts(company);
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
            <Button variant="ghost" size="icon" title="View"><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" title="Set Alert"><Bell className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" title="Promote to Portfolio"><ArrowUpRight className="h-4 w-4" /></Button>
          </div>
        </TableCell>
      </TableRow>
    );
  });


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Watchlist Manager</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{watchlistCompanies.length} companies</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-3 w-3" /> New
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Watchlist Selector */}
        <div className="flex items-center justify-between mb-3">
          <Select value={activeWatchlistId} onValueChange={setActiveWatchlistId}>
            <SelectTrigger><SelectValue placeholder="Select Watchlist" /></SelectTrigger>
            <SelectContent>
              {watchlists.map(w => <SelectItem key={w.id} value={w.id}>{w.name} {w.isDefault && <span className="ml-2 text-xs text-muted-foreground">(Default)</span>}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddSymbols(true)} disabled={!activeWatchlist}>
              <Plus className="mr-1 h-3 w-3" /> Add
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveSymbols} disabled={selectedSymbols.length === 0}>
              <Trash2 className="mr-1 h-3 w-3" /> Remove
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search companies..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="pl-9"
          />
        </div>

        {/* Company Table */}
        <div className="flex-1 overflow-hidden border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" checked={selectedSymbols.length === watchlistCompanies.length && watchlistCompanies.length > 0} onChange={handleSelectAll} className="rounded border-input" />
                </TableHead>
                {COLUMNS.map(col => (
                  <TableHead key={col.key} className={col.type === "number" ? "text-right" : ""} style={{ width: col.key === "name" ? "180px" : col.key === "alerts" ? "100px" : undefined }}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlistCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 2} className="text-center py-8 text-muted-foreground">
                    No companies in this watchlist. Click "Add" to add companies.
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {watchlistRows}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create Watchlist Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-background rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-4">Create New Watchlist</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={newWatchlistName} onChange={e => setNewWatchlistName(e.target.value)} placeholder="e.g., My Core Holdings" className="mt-1" autoFocus />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input value={newWatchlistDesc} onChange={e => setNewWatchlistDesc(e.target.value)} placeholder="e.g., High conviction long-term ideas" className="mt-1" />
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button onClick={handleCreateWatchlist} disabled={!newWatchlistName.trim()}>Create</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Symbols Modal */}
        {false && (/* State for this would be added */ null)}
      </CardContent>
    </Card>
  );
}