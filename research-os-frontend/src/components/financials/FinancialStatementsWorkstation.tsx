"use client";

import React, { useState, useMemo } from "react";
import {
  StatementType,
  CompanyStatementData,
  getSampleStatementData,
  StatementLineItem,
} from "@/data/sample-statements";
import { FinancialStatementTable } from "./FinancialStatementTable";
import { SourceOfTruthDrawer, SelectedCellInfo } from "./SourceOfTruthDrawer";
import { MultiModalUploader } from "./MultiModalUploader";
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  ChevronDown,
  Layers,
  TrendingUp,
  BarChart3,
  Calendar,
  Building,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINRCrores, formatPercent } from "@/lib/formatters";

interface FinancialStatementsWorkstationProps {
  initialSymbol?: string;
}

export function FinancialStatementsWorkstation({
  initialSymbol = "RELIANCE",
}: FinancialStatementsWorkstationProps) {
  // Current active company dataset
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol.toUpperCase());
  const [activeTab, setActiveTab] = useState<StatementType>("PL");
  const [selectedCell, setSelectedCell] = useState<SelectedCellInfo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  // Retrieve company data from sample store
  const companyData: CompanyStatementData = useMemo(() => {
    return getSampleStatementData(activeSymbol);
  }, [activeSymbol]);

  const currentLineItems: StatementLineItem[] = useMemo(() => {
    return companyData.statements[activeTab] || [];
  }, [companyData, activeTab]);

  const handleCellSelect = (cellInfo: SelectedCellInfo) => {
    setSelectedCell(cellInfo);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleLoadSample = (symbol: string) => {
    setActiveSymbol(symbol.toUpperCase());
    setSelectedCell(null);
    setIsDrawerOpen(false);
  };

  // Quick summary metrics for the active company (FY24)
  const quickKPIs = useMemo(() => {
    const pl = companyData.statements.PL;
    const bs = companyData.statements.BS;
    const cf = companyData.statements.CF;

    const revCell = pl.find((i) => i.metricKey === "REV_OPERATIONS")?.periods["FY24"]?.value ?? null;
    const ebitdaCell = pl.find((i) => i.metricKey === "EBITDA")?.periods["FY24"]?.value ?? null;
    const patCell = pl.find((i) => i.metricKey === "PAT")?.periods["FY24"]?.value ?? null;
    const fcfCell = cf.find((i) => i.metricKey === "FREE_CASH_FLOW")?.periods["FY24"]?.value ?? null;

    const margin = revCell && ebitdaCell ? (ebitdaCell / revCell) * 100 : null;

    return {
      revenue: revCell,
      ebitda: ebitdaCell,
      margin,
      pat: patCell,
      fcf: fcfCell,
    };
  }, [companyData]);

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = ["Line Item", "Taxonomy Code", "Category", ...companyData.fiscalYears];
    const rows = currentLineItems.map((item) => {
      const yearValues = companyData.fiscalYears.map((yr) => {
        const val = item.periods[yr]?.value;
        return val !== null && val !== undefined ? val : "";
      });
      return [
        `"${item.displayName}"`,
        item.metricKey,
        item.category,
        ...yearValues,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${companyData.symbol}_${activeTab}_Statements_FY15_FY24.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4" data-testid="financial-workstation">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {companyData.companyName}
            </h2>
            <Badge variant="outline" className="font-mono text-xs font-semibold">
              {companyData.symbol}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {companyData.industry}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>Standardized 10-Year Historical Financial Statements</span>
            <span>•</span>
            <span className="font-medium text-foreground">Unit: ₹ in Crores</span>
            <span>•</span>
            <span>Ind AS Consolidated</span>
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => setShowUploader(!showUploader)}
            data-testid="toggle-uploader-btn"
          >
            <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
            {showUploader ? "Hide Ingest Panel" : "Multi-Modal Ingest / Samples"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={handleExportCSV}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">FY24 Revenue</span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">
            {formatINRCrores(quickKPIs.revenue)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">FY24 Operating Margin</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatPercent(quickKPIs.margin)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">FY24 Net Profit (PAT)</span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">
            {formatINRCrores(quickKPIs.pat)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">FY24 Free Cash Flow</span>
          <div className="text-lg font-bold font-mono text-foreground mt-0.5">
            {formatINRCrores(quickKPIs.fcf)}
          </div>
        </div>
      </div>

      {/* Collapsible Multi-Modal Uploader & Fast Loaders Panel */}
      {showUploader && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <MultiModalUploader
            onLoadSample={handleLoadSample}
            activeSymbol={activeSymbol}
            onUploadSuccess={(name) => {
              // Stay on current dataset or update
            }}
          />
        </div>
      )}

      {/* Primary Statement Tabs & Grid */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          setActiveTab(val as StatementType);
          setSelectedCell(null);
        }}
        className="w-full space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="PL" className="text-xs" data-testid="tab-pl">
              Profit & Loss (P&L)
            </TabsTrigger>
            <TabsTrigger value="BS" className="text-xs" data-testid="tab-bs">
              Balance Sheet (BS)
            </TabsTrigger>
            <TabsTrigger value="CF" className="text-xs" data-testid="tab-cf">
              Cash Flow (CF)
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] font-mono">
              10-Yr Historical: FY15 to FY24
            </Badge>
          </div>
        </div>

        {/* Tab 1: Profit & Loss */}
        <TabsContent value="PL" className="mt-0 focus-visible:outline-none">
          <FinancialStatementTable
            lineItems={companyData.statements.PL}
            fiscalYears={companyData.fiscalYears}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />
        </TabsContent>

        {/* Tab 2: Balance Sheet */}
        <TabsContent value="BS" className="mt-0 focus-visible:outline-none">
          <FinancialStatementTable
            lineItems={companyData.statements.BS}
            fiscalYears={companyData.fiscalYears}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />
        </TabsContent>

        {/* Tab 3: Cash Flow */}
        <TabsContent value="CF" className="mt-0 focus-visible:outline-none">
          <FinancialStatementTable
            lineItems={companyData.statements.CF}
            fiscalYears={companyData.fiscalYears}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />
        </TabsContent>
      </Tabs>

      {/* Source of Truth Slide-Over Drawer */}
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
