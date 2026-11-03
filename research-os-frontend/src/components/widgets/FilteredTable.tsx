"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, Filter, ChevronUp, ChevronDown, Plus, Trash2, Download, Eye, Settings, RefreshCw } from "lucide-react";

interface Column {
  key: string;
  label: string;
  type: "text" | "number" | "badge" | "date";
  sortable?: boolean;
  filterable?: boolean;
}

interface FilteredTableProps {
  title?: string;
  columns?: Column[];
  data?: Record<string, any>[];
}

const DEFAULT_COLUMNS: Column[] = [
  { key: "symbol", label: "Symbol", type: "text", sortable: true, filterable: true },
  { key: "name", label: "Company", type: "text", sortable: true, filterable: true },
  { key: "sector", label: "Sector", type: "badge", sortable: true, filterable: true },
  { key: "price", label: "Price", type: "number", sortable: true },
  { key: "pe", label: "P/E", type: "number", sortable: true },
  { key: "roe", label: "ROE %", type: "number", sortable: true },
  { key: "change", label: "Change %", type: "number", sortable: true },
];

const DEFAULT_DATA = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Oil & Gas", price: 2500, pe: 24.5, roe: 15.2, change: 2.3 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", price: 3800, pe: 28.2, roe: 42.1, change: -0.5 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", price: 1650, pe: 18.2, roe: 17.3, change: 1.2 },
  { symbol: "INFY", name: "Infosys", sector: "IT Services", price: 1450, pe: 22.5, roe: 28.4, change: -1.8 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", price: 980, pe: 12.8, roe: 14.2, change: 3.5 },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", sector: "Financial Services", price: 7200, pe: 32.8, roe: 22.1, change: 0.8 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", price: 450, pe: 25.1, roe: 26.3, change: -0.2 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", price: 780, pe: 9.5, roe: 15.8, change: 2.1 },
];

export default function FilteredTable({ title = "Filtered Data Table", columns = DEFAULT_COLUMNS, data = DEFAULT_DATA }: FilteredTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (search) {
      result = result.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
      );
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value) result = result.filter(row => String(row[key]).toLowerCase().includes(value.toLowerCase()));
    });
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp = typeof aVal === "number" ? aVal - bVal : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, filters, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{filteredData.length} / {data.length}</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-1 h-3 w-3" /> Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search across all columns..." className="pl-9" />
          </div>
        </div>

        {showFilters && (
          <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg">
            {columns.filter(c => c.filterable).map(col => (
              <div key={col.key}>
                <label className="text-xs text-muted-foreground">{col.label}</label>
                <Input value={filters[col.key] || ""} onChange={e => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))} placeholder={`Filter ${col.label}...`} className="mt-1 h-8 text-sm" />
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key} className={col.sortable ? "cursor-pointer hover:bg-muted/50" : ""} onClick={() => col.sortable && handleSort(col.key)}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map(col => (
                    <TableCell key={col.key} className={col.type === "number" ? "text-right font-mono" : ""}>
                      {col.type === "badge" ? <Badge variant="secondary" className="text-xs">{row[col.key]}</Badge> : 
                       col.type === "number" ? (typeof row[col.key] === "number" ? row[col.key].toLocaleString() : row[col.key]) :
                       row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}