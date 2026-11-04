"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";

const TAB_CONTENT: Record<string, string[]> = {
  overview: ["kpi-cards", "financial-charts", "valuation-summary", "risk-assessment", "company-info", "decision-terminal", "tracking-table", "latest-changes"],
  story: ["financial-charts", "valuation-summary", "peer-comparison", "custom-text", "custom-text", "custom-text", "custom-text"],
  management: ["ownership-analysis", "catalyst-tracker", "concall-consistency", "management-consistency", "document-viewer", "smart-summarizer", "ai-assistant", "track-record", "capital-allocation", "management-compensation", "board-structure", "assess-auditor", "concall-tracker"],
  governance: ["risk-assessment", "checklist", "risk-score", "beneish-m-score", "altman-z-score", "piotroski-f-score", "forensic-flags", "legal-checks", "key-fragility-points", "customer-concentration"],
  financials: ["financial-charts", "kpi-cards", "ratio-analysis", "common-size", "revenue-projection", "key-data-extractor", "segment-breakup", "cost-breakup", "wc-breakup"],
  valuation: ["valuation-summary", "revenue-projection", "dcf-valuation", "relative-valuation", "sotp-valuation", "banking-valuation", "excess-return-valuation", "valuation-philosophy", "exit-tool"],
  risk: ["risk-assessment", "technical-analysis", "risk-score", "hedging-mechanism", "key-fragility-points"],
  sme: ["ownership-analysis", "custom-text", "turnaround-indicator", "on-ground-research"],
  "working-capital": ["financial-charts", "kpi-cards", "common-size", "wc-breakup", "cost-breakup"],
  downsides: ["risk-assessment", "checklist", "hedging-mechanism", "forensic-flags", "exit-tool", "key-events", "recent-events"],
};

function CompanyPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") || "overview";
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
