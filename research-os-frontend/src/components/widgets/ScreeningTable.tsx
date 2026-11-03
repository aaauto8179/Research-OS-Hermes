"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Clock, Zap, Search, Filter, TrendingUp, ArrowUpRight, Funnel, SlidersHorizontal } from "lucide-react";

interface ScreeningTableProps {
  onAddToWatchlist?: (symbol: string) => void;
  onAddToIdeas?: (company: any) => void;
}

const MOCK_COMPANIES = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas", current_price: 2500, change: 1.2, pe: 24.5, ev_ebitda: 12.8, roe: 0.15, roce: 0.18, debt_equity: 0.4, fcf_yield: 0.05, market_cap: 1680000, sales_growth: 0.12, profit_growth: 0.15, promoter_holding: 0.50, pledged_holding: 0.05, score: 85 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", current_price: 3800, change: 0.8, pe: 28.2, ev_ebitda: 18.5, roe: 0.42, roce: 0.48, debt_equity: 0.05, fcf_yield: 0.03, market_cap: 1380000, sales_growth: 0.10, profit_growth: 0.12, promoter_holding: 0.72, pledged_holding: 0.00, score: 92 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", current_price: 1650, change: -0.5, pe: 18.2, ev_ebitda: 0, roe: 0.17, roce: 0, debt_equity: 0, fcf_yield: 0.04, market_cap: 940000, sales_growth: 0.18, profit_growth: 0.20, promoter_holding: 0.26, pledged_holding: 0.00, score: 88 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financial Services", current_price: 7200, change: 1.5, pe: 32.8, ev_ebitda: 0, roe: 0.22, roce: 0, debt_equity: 3.2, fcf_yield: 0.02, market_cap: 450000, sales_growth: 0.25, profit_growth: 0.28, promoter_holding: 0.52, pledged_holding: 0.08, score: 78 },
  { symbol: "TRENT", name: "Trent Ltd", sector: "Consumer", current_price: 4200, change: 2.1, pe: 95.2, ev_ebitda: 45.8, roe: 0.28, roce: 0.32, debt_equity: 0.3, fcf_yield: 0.01, market_cap: 150000, sales_growth: 0.35, profit_growth: 0.42, promoter_holding: 0.37, pledged_holding: 0.00, score: 82 },
  { symbol: "PERSISTENT", name: "Persistent Systems", sector: "IT Services", current_price: 5800, change: 1.8, pe: 35.4, ev_ebitda: 22.1, roe: 0.25, roce: 0.30, debt_equity: 0.1, fcf_yield: 0.025, market_cap: 88000, sales_growth: 0.22, profit_growth: 0.25, promoter_holding: 0.31, pledged_holding: 0.00, score: 85 },
  { symbol: "COFORGE", name: "Coforge Ltd", sector: "IT Services", current_price: 4500, change: 0.9, pe: 28.6, ev_ebitda: 18.2, roe: 0.24, roce: 0.29, debt_equity: 0.15, fcf_yield: 0.028, market_cap: 65000, sales_growth: 0.18, profit_growth: 0.20, promoter_holding: 0.29, pledged_holding: 0.00, score: 80 },
  { symbol: "DMART", name: "Avenue Supermarts", sector: "Consumer", current_price: 3800, change: -0.3, pe: 85.4, ev_ebitda: 42.1, roe: 0.18, roce: 0.22, debt_equity: 0.2, fcf_yield: 0.015, market_cap: 240000, sales_growth: 0.20, profit_growth: 0.25, promoter_holding: 0.65, pledged_holding: 0.00, score: 75 },
];

const SCREENING_PRESETS = [
  { id: "all", name: "All Companies", filters: {} },
  { id: "value", name: "Value (P/E < 20)", filters: { pe_max: 20 } },
  { id: "growth", name: "Growth (Sales > 20%)", filters: { sales_growth_min: 0.20 } },
  { id: "quality", name: "Quality (ROE > 20%, Low Debt)", filters: { roe_min: 0.20, debt_equity_max: 1 } },
  { id: "fcf", name: "FCF Yield > 3%", filters: { fcf_yield_min: 0.03 } },
  { id: "smallcap", name: "Small Cap (< ₹5K Cr)", filters: { market_cap_max: 50000 } },
];

export default function ScreeningTable({ onAddToWatchlist, onAddToIdeas }: ScreeningTableProps) {
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [filteredCompanies, setFilteredCompanies] = useState(MOCK_COMPANIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [presetFilter, setPresetFilter] = useState("all");
  const [customFilters, setCustomFilters] = useState({
    pe_max: "",
    pe_min: "",
    ev_ebitda_max: "",
    roe_min: "",
    roce_min: "",
    debt_equity_max: "",
    fcf_yield_min: "",
    sales_growth_min: "",
    profit_growth_min: "",
    market_cap_min: "",
    market_cap_max: "",
    promoter_holding_min: "",
    pledged_holding_max: "",
  });

  useEffect(() => {
    let result = [...companies];
    
    // Apply preset
    const preset = SCREENING_PRESETS.find(p => p.id === presetFilter);
    if (preset && preset.filters) {
      Object.entries(preset.filters).forEach(([key, value]) => {
        result = result.filter(c => c[key as keyof typeof c] <= value);
      });
    }
    
    // Apply custom filters
        Object.entries(customFilters).forEach(([key, value]) => {
          if (value === "") return;
          const numValue = parseFloat(value);
          if (isNaN(numValue)) return;
          if (key.endsWith("_min")) {
            const field = key.replace("_min", "");
            result = result.filter(c => (c[field as keyof typeof c] as number) >= numValue);
          } else if (key.endsWith("_max")) {
            const field = key.replace("_max", "");
            result = result.filter(c => (c[field as keyof typeof c] as number) <= numValue);
          }
        });
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.symbol.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q)
      );
    }
    
    setFilteredCompanies(result);
  }, [companies, presetFilter, customFilters, searchQuery]);

  const handleFilterChange = (key: string, value: string) => {
    setCustomFilters(prev => ({ ...prev, [key]: value }));
    if (presetFilter !== "all") setPresetFilter("all");
  };

  const clearFilters = () => {
    setCustomFilters({
      pe_max: "", pe_min: "", ev_ebitda_max: "", roe_min: "", roce_min: "",
      debt_equity_max: "", fcf_yield_min: "", sales_growth_min: "", profit_growth_min: "",
      market_cap_min: "", market_cap_max: "", promoter_holding_min: "", pledged_holding_max: "",
    });
    setPresetFilter("all");
  };

  const formatPct = (val: number) => (val * 100).toFixed(1) + "%";

  // Screening table content
  const screeningTableContent = filteredCompanies.length === 0 ? (
    <TableRow>
      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
        No companies match the current filters.
      </TableCell>
    </TableRow>
  ) : (
    filteredCompanies.map(company => (
      <TableRow key={company.symbol}>
        <TableCell className="font-bold text-right">
          <Badge variant={company.score >= 85 ? "default" : company.score >= 75 ? "secondary" : "outline"}>{company.score}</Badge>
        </TableCell>
        <TableCell className="font-mono font-medium">{company.symbol}</TableCell>
        <TableCell className="max-w-xs truncate">{company.name}</TableCell>
        <TableCell><Badge variant="secondary" className="text-xs">{company.sector}</Badge></TableCell>
        <TableCell className="text-right font-mono tabular-nums">₹{company.current_price.toLocaleString()}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{company.pe ? company.pe.toFixed(1) : "—"}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{company.ev_ebitda ? company.ev_ebitda.toFixed(1) : "—"}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{formatPct(company.roe)}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{company.debt_equity ? company.debt_equity.toFixed(2) : "—"}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">{formatPct(company.fcf_yield)}</TableCell>
        <TableCell className="text-right font-mono tabular-nums">₹{(company.market_cap/100).toFixed(0)}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {onAddToWatchlist && <Button variant="ghost" size="icon" onClick={() => onAddToWatchlist(company.symbol)} title="Add to Watchlist"><Plus className="h-4 w-4" /></Button>}
            {onAddToIdeas && <Button variant="ghost" size="icon" onClick={() => onAddToIdeas(company)} title="Add to Ideas"><ArrowUpRight className="h-4 w-4" /></Button>}
            <Button variant="ghost" size="icon" title="Open in Company Page"><ArrowUpRight className="h-4 w-4" /></Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Screening Table</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{filteredCompanies.length} results</Badge>
          <Button variant="outline" size="sm" onClick={clearFilters}><Funnel className="mr-1 h-3 w-3" /> Clear</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Presets */}
        <div className="mb-3 flex flex-wrap gap-2">
          {SCREENING_PRESETS.map(p => (
            <Button 
              key={p.id} 
              variant={presetFilter === p.id ? "default" : "outline"} 
              size="sm" 
              onClick={() => setPresetFilter(p.id)}
            >
              {p.name}
            </Button>
          ))}
        </div>

        {/* Custom Filters */}
        <div className="mb-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Custom Filters</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}><SlidersHorizontal className="mr-1 h-3 w-3" /> Reset</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">P/E Max</label>
              <Input type="number" step="0.1" value={customFilters.pe_max} onChange={e => handleFilterChange("pe_max", e.target.value)} placeholder="e.g., 20" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">EV/EBITDA Max</label>
              <Input type="number" step="0.1" value={customFilters.ev_ebitda_max} onChange={e => handleFilterChange("ev_ebitda_max", e.target.value)} placeholder="e.g., 15" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">ROE Min %</label>
              <Input type="number" step="0.01" value={customFilters.roe_min} onChange={e => handleFilterChange("roe_min", e.target.value)} placeholder="e.g., 0.20" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">D/E Max</label>
              <Input type="number" step="0.1" value={customFilters.debt_equity_max} onChange={e => handleFilterChange("debt_equity_max", e.target.value)} placeholder="e.g., 1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">FCF Yield Min %</label>
              <Input type="number" step="0.001" value={customFilters.fcf_yield_min} onChange={e => handleFilterChange("fcf_yield_min", e.target.value)} placeholder="e.g., 0.03" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sales Growth Min %</label>
              <Input type="number" step="0.01" value={customFilters.sales_growth_min} onChange={e => handleFilterChange("sales_growth_min", e.target.value)} placeholder="e.g., 0.20" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search symbol, name, sector..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-hidden border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Score</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">P/E</TableHead>
                <TableHead className="text-right">EV/EBITDA</TableHead>
                <TableHead className="text-right">ROE</TableHead>
                <TableHead className="text-right">D/E</TableHead>
                <TableHead className="text-right">FCF Yield</TableHead>
                <TableHead className="text-right">MCap (Cr)</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {screeningTableContent}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}