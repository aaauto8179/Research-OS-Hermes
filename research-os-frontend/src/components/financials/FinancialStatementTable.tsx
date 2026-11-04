"use client";

import React, { useMemo, useState } from "react";
import {
  useLegacyTable,
  getCoreRowModel,
  getFilteredRowModel,
  LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";
import {
  StatementLineItem,
  StatementCellData,
} from "@/data/sample-statements";
import { formatINRCrores, formatPercent, formatPerShare } from "@/lib/formatters";
import { SelectedCellInfo } from "./SourceOfTruthDrawer";
import { ShieldCheck, Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FinancialStatementTableProps {
  lineItems: StatementLineItem[];
  fiscalYears: string[];
  selectedCell: SelectedCellInfo | null;
  onCellSelect: (cellInfo: SelectedCellInfo) => void;
  filterQuery?: string;
}

export function FinancialStatementTable({
  lineItems,
  fiscalYears,
  selectedCell,
  onCellSelect,
  filterQuery = "",
}: FinancialStatementTableProps) {
  const [localSearch, setLocalSearch] = useState("");
  const activeSearch = filterQuery || localSearch;

  // Filter line items based on search
  const filteredData = useMemo(() => {
    if (!activeSearch.trim()) return lineItems;
    const query = activeSearch.toLowerCase();
    return lineItems.filter(
      (item) =>
        item.displayName.toLowerCase().includes(query) ||
        item.metricKey.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [lineItems, activeSearch]);

  // Define TanStack Table columns
  const columns = useMemo<LegacyColumnDef<StatementLineItem>[]>(() => {
    // 1. Sticky line item row header
    const cols: LegacyColumnDef<StatementLineItem>[] = [
      {
        id: "lineItem",
        header: () => (
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Line Item</span>
            <span className="text-[10px] text-muted-foreground font-normal">(₹ in Cr)</span>
          </div>
        ),
        accessorFn: (row) => row.displayName,
        cell: ({ row }) => {
          const item = row.original;
          const indentClass =
            item.indentationLevel === 0
              ? "pl-3 font-semibold"
              : item.indentationLevel === 1
              ? "pl-6 text-muted-foreground"
              : "pl-9 text-xs text-muted-foreground";

          return (
            <div className={`flex items-center gap-2 py-1 pr-3 text-sm ${indentClass}`}>
              <span className={item.isSummary ? "font-bold text-foreground" : "text-foreground"}>
                {item.displayName}
              </span>
              {item.isSummary && item.indentationLevel === 0 && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 uppercase">
                  Total
                </Badge>
              )}
            </div>
          );
        },
      },
    ];

    // 2. Fiscal year columns
    fiscalYears.forEach((year) => {
      cols.push({
        id: year,
        header: () => (
          <div className="text-right font-mono text-xs font-semibold text-foreground">
            {year}
          </div>
        ),
        accessorFn: (row) => row.periods[year]?.value ?? null,
        cell: ({ row }) => {
          const item = row.original;
          const cellData: StatementCellData = item.periods[year] || {
            value: null,
            unit: "INR_CRORE",
          };

          const isSelected =
            selectedCell?.metricKey === item.metricKey && selectedCell?.period === year;

          const formattedValue = (() => {
            if (cellData.value === null || cellData.value === undefined) return "—";
            if (cellData.unit === "PERCENT") return formatPercent(cellData.value);
            if (cellData.unit === "PER_SHARE") return formatPerShare(cellData.value);
            return formatINRCrores(cellData.value, {
              decimals: 0,
              useParenthesesForNegative: true,
              includeSymbol: false,
              includeUnit: false,
            });
          })();

          const hasCitation = Boolean(cellData.citation);
          const isNegative = typeof cellData.value === "number" && cellData.value < 0;

          return (
            <div
              data-testid={`cell-${item.metricKey}-${year}`}
              onClick={() =>
                onCellSelect({
                  metricKey: item.metricKey,
                  displayName: item.displayName,
                  category: item.category,
                  period: year,
                  cellData,
                })
              }
              className={`relative flex items-center justify-end px-3 py-1.5 font-mono text-xs cursor-pointer select-none rounded transition-all group ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/15 font-bold text-primary shadow-sm"
                  : "hover:bg-primary/10 hover:text-primary"
              } ${item.isSummary ? "font-semibold text-foreground" : "text-muted-foreground"} ${
                isNegative ? "text-rose-600 dark:text-rose-400" : ""
              }`}
            >
              <span>{formattedValue}</span>

              {/* Citation Source Indicator */}
              {hasCitation && (
                <span
                  title="Source-of-Truth filing citation attached. Click to view."
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30 animate-pulse" />
                </span>
              )}
            </div>
          );
        },
      });
    });

    return cols;
  }, [fiscalYears, selectedCell, onCellSelect]);

  const table = useLegacyTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      {!filterQuery && (
        <div className="flex items-center justify-between pb-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter line items..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Statutory Citation Available
            </span>
            <span>•</span>
            <span>Click any cell to open Source of Truth</span>
          </div>
        </div>
      )}

      {/* Grid Container with Sticky Row and Sticky Column Headers */}
      <div className="relative rounded-md border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin">
          <table className="w-full border-collapse text-left text-sm" data-testid="statement-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/80 backdrop-blur">
                  {headerGroup.headers.map((header, index) => {
                    const isFirstCol = index === 0;
                    return (
                      <th
                        key={header.id}
                        className={`py-2.5 px-3 text-xs font-semibold border-b border-border ${
                          isFirstCol
                            ? "sticky top-0 left-0 z-30 bg-muted/95 backdrop-blur min-w-[240px] max-w-[280px] border-r border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                            : "sticky top-0 z-20 bg-muted/80 backdrop-blur min-w-[100px] text-right"
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const item = row.original;
                  const rowBg = item.isSummary
                    ? "bg-muted/40 font-semibold"
                    : "hover:bg-muted/20 transition-colors";

                  return (
                    <tr key={row.id} className={`border-b border-border/60 last:border-0 ${rowBg}`}>
                      {row.getVisibleCells().map((cell, index) => {
                        const isFirstCol = index === 0;
                        return (
                          <td
                            key={cell.id}
                            className={`py-1.5 px-2 ${
                              isFirstCol
                                ? "sticky left-0 z-10 bg-background/95 backdrop-blur border-r border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                                : "text-right"
                            }`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No financial line items matched your filter query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
