"use client";

import { Suspense, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";
import { FinancialStatementsWorkstation } from "@/components/financials/FinancialStatementsWorkstation";
import { ScenarioWorkstation } from "@/components/scenarios/ScenarioWorkstation";

const TAB_CONTENT: Record<string, string[]> = {
  overview: ["kpi-cards", "financial-charts", "valuation-summary", "risk-assessment", "company-info", "decision-terminal", "tracking-table", "latest-changes"],
  story: ["financial-charts", "valuation-summary", "peer-comparison", "custom-text", "custom-text", "custom-text", "custom-text"],
  management: ["ownership-analysis", "catalyst-tracker", "concall-consistency", "management-consistency", "document-viewer", "smart-summarizer", "ai-assistant", "track-record", "capital-allocation", "management-compensation", "board-structure", "assess-auditor", "concall-tracker"],
  governance: ["risk-assessment", "checklist", "risk-score", "beneish-m-score", "altman-z-score", "piotroski-f-score", "forensic-flags", "legal-checks", "key-fragility-points", "customer-concentration"],
  financials: ["financial-charts", "kpi-cards", "ratio-analysis", "common-size", "revenue-projection", "key-data-extractor", "segment-breakup", "cost-breakup", "wc-breakup"],
  projections: ["revenue-projection", "dcf-valuation", "relative-valuation"],
  valuation: ["valuation-summary", "revenue-projection", "dcf-valuation", "relative-valuation", "sotp-valuation", "banking-valuation", "excess-return-valuation", "valuation-philosophy", "exit-tool"],
  risk: ["risk-assessment", "technical-analysis", "risk-score", "hedging-mechanism", "key-fragility-points"],
  sme: ["ownership-analysis", "custom-text", "turnaround-indicator", "on-ground-research"],
  "working-capital": ["financial-charts", "kpi-cards", "common-size", "wc-breakup", "cost-breakup"],
  downsides: ["risk-assessment", "checklist", "hedging-mechanism", "forensic-flags", "exit-tool", "key-events", "recent-events"],
};

function CompanyPageContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const symbol = (params?.symbol as string) || "RELIANCE";
  const tab = searchParams?.get("tab") || "overview";
  const subview = searchParams?.get("subview");
  const [financialsMode, setFinancialsMode] = useState<"statements" | "projections">("statements");

  if (tab === "projections" || tab === "scenarios") {
    return (
      <div className="w-full pb-8">
        <ScenarioWorkstation symbol={symbol} />
      </div>
    );
  }

  if (tab === "financials") {
    const activeMode = subview === "projections" ? "projections" : financialsMode;
    return (
      <div className="w-full pb-8 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFinancialsMode("statements")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeMode === "statements"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Historical Statements
            </button>
            <button
              onClick={() => setFinancialsMode("projections")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeMode === "projections"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              5Y Projections & Scenarios
            </button>
          </div>
        </div>
        {activeMode === "statements" ? (
          <FinancialStatementsWorkstation initialSymbol={symbol} />
        ) : (
          <ScenarioWorkstation symbol={symbol} />
        )}
      </div>
    );
  }

  const widgets = TAB_CONTENT[tab] || TAB_CONTENT.overview;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {widgets.map((w, i) => (
        <div key={i} className="min-h-[300px]">
          <WidgetRenderer type={w} />
        </div>
      ))}
    </div>
  );
}

export default function CompanyPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <CompanyPageContent />
    </Suspense>
  );
}
