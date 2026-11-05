"use client";

import React, { useState, useMemo } from "react";
import {
  StatementType,
  getSampleStatementData,
  StatementLineItem,
} from "@/data/sample-statements";
import { FinancialStatementsWorkstation } from "@/components/financials/FinancialStatementsWorkstation";
import { FinancialStatementTable } from "@/components/financials/FinancialStatementTable";
import {
  SourceOfTruthDrawer,
  SelectedCellInfo,
} from "@/components/financials/SourceOfTruthDrawer";
import { Search, Download, Table, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FinancialStatementsAdapterProps {
  symbol: string;
}

/**
 * Adapter for the full Milestone 1 FinancialStatementsWorkstation
 * Displays multi-year P&L, Balance Sheet, Cash Flow in INR Crores with SourceOfTruthDrawer.
 */
export function FinancialStatementsWorkstationAdapter({
  symbol,
}: FinancialStatementsAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="financial-statements-workstation-widget">
      <FinancialStatementsWorkstation initialSymbol={symbol} />
    </div>
  );
}

export interface AtomicStatementWidgetProps {
  symbol: string;
  statementType: StatementType;
  title: string;
}

/**
 * Atomic Financial Statement Widget for individual statements:
 * - Income Statement (P&L)
 * - Balance Sheet (BS)
 * - Cash Flow Statement (CF)
 * 
 * Features:
 * - INR Crores numeric formatting
 * - Sticky headers with fiscal years (FY15 - FY24)
 * - Search filter across metrics
 * - SourceOfTruthDrawer citation trigger on cell click
 * - CSV export
 */
export function AtomicStatementWidget({
  symbol,
  statementType,
  title,
}: AtomicStatementWidgetProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [selectedCell, setSelectedCell] = useState<SelectedCellInfo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const companyData = useMemo(() => {
    return getSampleStatementData(symbol);
  }, [symbol]);

  const lineItems: StatementLineItem[] = useMemo(() => {
    return companyData.statements[statementType] || [];
  }, [companyData, statementType]);

  const handleCellSelect = (cellInfo: SelectedCellInfo) => {
    setSelectedCell(cellInfo);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ["Line Item", "Taxonomy Code", "Category", ...companyData.fiscalYears];
    const rows = lineItems.map((item) => {
      const yearValues = companyData.fiscalYears.map((yr) => {
        const val = item.periods[yr]?.value;
        return val !== null && val !== undefined ? val : "";
      });
      return [
        `"${item.displayName}"`,
        `"${item.metricKey}"`,
        `"${item.category}"`,
        ...yearValues,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${companyData.symbol}_${statementType}_Statement_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden bg-card"
      data-testid={`atomic-statement-${statementType.toLowerCase()}`}
    >
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Table className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">{title}</span>
          <Badge variant="outline" className="text-[10px] font-mono py-0 h-5">
            {companyData.symbol}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            (₹ in Cr • 10-Year Series)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Filter metrics..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-background"
              data-testid={`search-${statementType.toLowerCase()}`}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs gap-1"
            title="Export CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* Financial Statement Table */}
      <div className="flex-1 overflow-auto p-2">
        <FinancialStatementTable
          lineItems={lineItems}
          fiscalYears={companyData.fiscalYears}
          selectedCell={selectedCell}
          onCellSelect={handleCellSelect}
          filterQuery={filterQuery}
        />
      </div>

      {/* Source of Truth Drawer */}
      <SourceOfTruthDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedCell={selectedCell}
        companySymbol={companyData.symbol}
        companyName={companyData.companyName}
      />
    </div>
  );
}

export function IncomeStatementAdapter({ symbol }: FinancialStatementsAdapterProps) {
  return (
    <AtomicStatementWidget
      symbol={symbol}
      statementType="PL"
      title="Profit & Loss Statement"
    />
  );
}

export function BalanceSheetAdapter({ symbol }: FinancialStatementsAdapterProps) {
  return (
    <AtomicStatementWidget
      symbol={symbol}
      statementType="BS"
      title="Balance Sheet"
    />
  );
}

export function CashFlowAdapter({ symbol }: FinancialStatementsAdapterProps) {
  return (
    <AtomicStatementWidget
      symbol={symbol}
      statementType="CF"
      title="Cash Flow Statement"
    />
  );
}
