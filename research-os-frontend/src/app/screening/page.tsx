 "use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  Plus, Eye, Download, Settings, AlertTriangle,
  TrendingUp, TrendingDown, Target, Zap
} from "lucide-react";
import { CompanySnapshot, ScreeningCriteria, ScreeningResult } from "@/lib/types";
import { MOCK_COMPANIES, DEFAULT_SCREENING_CRITERIA } from "@/lib/mock-data";

export default function ScreeningPage() {
  const [companies, setCompanies] = useState<CompanySnapshot[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanySnapshot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({key: 'market_cap', direction: 'desc'});
  const [filters, setFilters] = useState<ScreeningCriteria>(DEFAULT_SCREENING_CRITERIA);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [screeningResults, setScreeningResults] = useState<ScreeningResult[]>([]);
  const [isScreening, setIsScreening] = useState(false);

  // Load mock data on mount
  useEffect(() => {
    setCompanies(MOCK_COMPANIES);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...companies];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.symbol.toLowerCase().includes(q) || 
        c.name.toLowerCase().includes(q) ||
        c.sector?.toLowerCase().includes(q)
      );
    }

    // Screening filters
    if (filters.pe_max) {
      result = result.filter(c => c.pe !== undefined && c.pe <= filters.pe_max!);
    }
    if (filters.ev_ebitda_max) {
      result = result.filter(c => c.ev_ebitda !== undefined && c.ev_ebitda <= filters.ev_ebitda_max!);
    }
    if (filters.fcf_yield_min) {
      result = result.filter(c => c.fcf_yield !== undefined && c.fcf_yield >= filters.fcf_yield_min!);
    }
    if (filters.roe_min) {
      result = result.filter(c => c.roe !== undefined && c.roe >= filters.roe_min!);
    }
    if (filters.roce_min) {
      result = result.filter(c => c.roce !== undefined && c.roce >= filters.roce_min!);
    }
    if (filters.debt_ebitda_max) {
      result = result.filter(c => c.debt_equity !== undefined && c.debt_equity <= filters.debt_ebitda_max!);
    }
    if (filters.market_cap_min) {
      result = result.filter(c => c.market_cap >= filters.market_cap_min!);
    }
    if (filters.market_cap_category?.length) {
      result = result.filter(c => c.market_cap_category && filters.market_cap_category!.includes(c.market_cap_category));
    }

    // Sorting
    result.sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCompanies(result);
  }, [companies, searchQuery, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowSelect = (symbol: string) => {
    setSelectedRows(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredCompanies.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredCompanies.map(c => c.symbol));
    }
  };

  const runScreening = async () => {
    setIsScreening(true);
    // Simulate screening engine call
    await new Promise(r => setTimeout(r, 500));
    
    const results = filteredCompanies.map((c, idx) => ({
      symbol: c.symbol,
      name: c.name,
      score: Math.max(0, 100 - (c.pe || 30) * 2 + (c.roe || 0) * 100 - (c.debt_equity || 1) * 20),
      passed_filters: {
        pe: filters.pe_max ? (c.pe ?? 999) <= filters.pe_max : true,
        ev_ebitda: filters.ev_ebitda_max ? (c.ev_ebitda ?? 999) <= filters.ev_ebitda_max : true,
        fcf_yield: filters.fcf_yield_min ? (c.fcf_yield ?? 0) >= filters.fcf_yield_min : true,
        roe: filters.roe_min ? (c.roe ?? 0) >= filters.roe_min : true,
        roce: filters.roce_min ? (c.roce ?? 0) >= filters.roce_min : true,
        debt_ebitda: filters.debt_ebitda_max ? (c.debt_equity ?? 999) <= filters.debt_ebitda_max : true,
      },
      metrics: {
        pe: c.pe || 0,
        ev_ebitda: c.ev_ebitda || 0,
        fcf_yield: c.fcf_yield || 0,
        roe: c.roe || 0,
        roce: c.roce || 0,
        debt_ebitda: c.debt_equity || 0,
      },
      rank: idx + 1,
    }));
    
    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => r.rank = i + 1);
    
    setScreeningResults(results);
    setIsScreening(false);
  };

  const promoteToWatchlist = () => {
    const symbols = selectedRows.length > 0 ? selectedRows : filteredCompanies.map(c => c.symbol);
    // TODO: Call API to add to watchlist
    alert(`Promoted ${symbols.length} companies to watchlist: ${symbols.join(', ')}`);
  };

  const exportResults = () => {
    if (screeningResults.length > 0) {
      const csv = [
        ['Rank', 'Symbol', 'Name', 'Price', 'Market Cap', 'P/E', 'EV/EBITDA', 'ROE', 'ROCE', 'Debt/Equity', 'FCF Yield', 'Sector'],
        ...screeningResults.map((c) => [
          c.rank,
          c.symbol,
          c.name,
          c.metrics.pe || '',
          c.metrics.ev_ebitda || '',
          c.metrics.roe ? (c.metrics.roe * 100).toFixed(1) + '%' : '',
          c.metrics.roce ? (c.metrics.roce * 100).toFixed(1) + '%' : '',
          c.metrics.debt_ebitda || '',
          c.metrics.fcf_yield ? (c.metrics.fcf_yield * 100).toFixed(1) + '%' : '',
          '',
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screening_results_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const csv = [
        ['Rank', 'Symbol', 'Name', 'Price', 'Market Cap', 'P/E', 'EV/EBITDA', 'ROE', 'ROCE', 'Debt/Equity', 'FCF Yield', 'Sector'],
        ...filteredCompanies.map((c, i) => [
          i + 1,
          c.symbol,
          c.name,
          c.current_price,
          c.market_cap,
          c.pe || '',
          c.ev_ebitda || '',
          c.roe ? (c.roe * 100).toFixed(1) + '%' : '',
          c.roce ? (c.roce * 100).toFixed(1) + '%' : '',
          c.debt_equity || '',
          c.fcf_yield ? (c.fcf_yield * 100).toFixed(1) + '%' : '',
          c.sector || '',
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screening_results_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([_, v]) => {
      if (v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)) count++;
    });
    return count;
  }, [filters]);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Generate Ideas / Screening</h1>
          <Badge variant="secondary" className="text-sm">
            {filteredCompanies.length} / {companies.length} companies
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search symbol, name, sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters {activeFilterCount > 0 && <Badge variant="destructive" className="ml-1">{activeFilterCount}</Badge>}
          </Button>
          
          <Button variant="outline" onClick={exportResults} disabled={filteredCompanies.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
          <Button onClick={runScreening} disabled={isScreening}>
            <Zap className="mr-2 h-4 w-4" />
            {isScreening ? 'Running...' : 'Run Screening'}
          </Button>
          
          <Button variant="outline" onClick={promoteToWatchlist} disabled={selectedRows.length === 0 && filteredCompanies.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Promote to Watchlist
          </Button>
        </div>
      </div>

      {/* Collapsible Filters Panel */}
      {showFilters && (
        <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">P/E Max:</label>
              <Input type="number" step="0.1" min="0" placeholder="30" 
                value={filters.pe_max || ''} 
                onChange={(e) => setFilters({...filters, pe_max: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">EV/EBITDA Max:</label>
              <Input type="number" step="0.1" min="0" placeholder="20" 
                value={filters.ev_ebitda_max || ''} 
                onChange={(e) => setFilters({...filters, ev_ebitda_max: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">FCF Yield Min (%):</label>
              <Input type="number" step="0.1" min="0" placeholder="2" 
                value={filters.fcf_yield_min ? (filters.fcf_yield_min * 100).toFixed(1) : ''} 
                onChange={(e) => setFilters({...filters, fcf_yield_min: e.target.value ? parseFloat(e.target.value) / 100 : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">ROE Min (%):</label>
              <Input type="number" step="0.1" min="0" placeholder="12" 
                value={filters.roe_min ? (filters.roe_min * 100).toFixed(1) : ''} 
                onChange={(e) => setFilters({...filters, roe_min: e.target.value ? parseFloat(e.target.value) / 100 : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">ROCE Min (%):</label>
              <Input type="number" step="0.1" min="0" placeholder="14" 
                value={filters.roce_min ? (filters.roce_min * 100).toFixed(1) : ''} 
                onChange={(e) => setFilters({...filters, roce_min: e.target.value ? parseFloat(e.target.value) / 100 : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Debt/Equity Max:</label>
              <Input type="number" step="0.1" min="0" placeholder="3" 
                value={filters.debt_ebitda_max || ''} 
                onChange={(e) => setFilters({...filters, debt_ebitda_max: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Market Cap Min (Cr):</label>
              <Input type="number" step="100" min="0" placeholder="1000" 
                value={filters.market_cap_min || ''} 
                onChange={(e) => setFilters({...filters, market_cap_min: e.target.value ? parseFloat(e.target.value) : undefined})}
                className="w-24" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Category:</label>
              <Select value={filters.market_cap_category?.join(',') || 'all'} onValueChange={(v) => {
                if (v === 'all') setFilters({...filters, market_cap_category: undefined});
                else setFilters({...filters, market_cap_category: v.split(',')});
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="LARGE,MID,SMALL">Large + Mid + Small</SelectItem>
                  <SelectItem value="LARGE,MID">Large + Mid</SelectItem>
                  <SelectItem value="MID,SMALL">Mid + Small</SelectItem>
                  <SelectItem value="LARGE">Large Cap Only</SelectItem>
                  <SelectItem value="MID">Mid Cap Only</SelectItem>
                  <SelectItem value="SMALL">Small Cap Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setFilters({
              pe_max: 30, ev_ebitda_max: 20, fcf_yield_min: 0.02,
              roe_min: 0.12, roce_min: 0.14, debt_ebitda_max: 3,
              market_cap_min: 1000, market_cap_category: ['LARGE', 'MID', 'SMALL']
            })}>
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="flex-1 overflow-hidden border rounded-lg">
        <Table>
          <TableCaption className="p-3 bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <span>{screeningResults.length > 0 ? 'Screening Results (Ranked)' : 'Filtered Companies'}</span>
              <div className="flex items-center gap-2">
                <input type="checkbox" 
                  checked={selectedRows.length === filteredCompanies.length && filteredCompanies.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-input" />
                <label className="text-sm text-muted-foreground">Select All</label>
              </div>
            </div>
          </TableCaption>
          
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" 
                  checked={selectedRows.length === filteredCompanies.length && filteredCompanies.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-input" />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('symbol')}>
                Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Company {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('current_price')}>
                Price {sortConfig.key === 'current_price' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('market_cap')}>
                Mkt Cap (Cr) {sortConfig.key === 'market_cap' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('pe')}>
                P/E {sortConfig.key === 'pe' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('ev_ebitda')}>
                EV/EBITDA {sortConfig.key === 'ev_ebitda' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('roe')}>
                ROE {sortConfig.key === 'roe' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('roce')}>
                ROCE {sortConfig.key === 'roce' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('debt_equity')}>
                D/E {sortConfig.key === 'debt_equity' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead className="cursor-pointer text-right" onClick={() => handleSort('fcf_yield')}>
                FCF Yield {sortConfig.key === 'fcf_yield' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                  No companies match your filters. Try adjusting criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company, idx) => {
                const screeningResult = screeningResults.find(r => r.symbol === company.symbol);
                const rank = screeningResult?.rank || idx + 1;
                const score = screeningResult?.score;
                const isSelected = selectedRows.includes(company.symbol);
                
                return (
                  <TableRow key={company.symbol} className={isSelected ? 'bg-primary/5' : ''}>
                    <TableCell>
                      <input type="checkbox" checked={isSelected} onChange={() => handleRowSelect(company.symbol)} className="rounded border-input" />
                    </TableCell>
                    <TableCell className="font-mono font-medium">{rank}. {company.symbol}</TableCell>
                    <TableCell className="max-w-xs truncate">{company.name}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{company.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">₹{(company.market_cap / 100).toFixed(0)}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{company.pe ? company.pe.toFixed(1) : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{company.ev_ebitda ? company.ev_ebitda.toFixed(1) : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{company.roe ? (company.roe * 100).toFixed(1) + '%' : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{company.roce ? (company.roce * 100).toFixed(1) + '%' : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{company.debt_equity ? company.debt_equity.toFixed(2) : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{company.fcf_yield ? (company.fcf_yield * 100).toFixed(1) + '%' : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{company.sector || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { /* TODO: navigate to company page */ }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {score !== undefined && (
                          <Badge variant={score >= 70 ? 'default' : score >= 40 ? 'secondary' : 'destructive'} className="text-xs">
                            Score: {score.toFixed(0)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Screening Results Summary */}
      {screeningResults.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <h3 className="font-semibold mb-3">Top Screening Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {screeningResults.slice(0, 12).map((result) => (
              <div key={result.symbol} className="p-3 border rounded bg-background">
                <div className="font-mono font-bold text-lg">{result.rank}. {result.symbol}</div>
                <div className="text-sm text-muted-foreground truncate">{result.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={result.score >= 70 ? 'default' : result.score >= 40 ? 'secondary' : 'destructive'}>
                    {result.score.toFixed(0)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    PE: {result.metrics.pe.toFixed(1)} | ROE: {(result.metrics.roe * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
