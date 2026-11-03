"use client";

import { useSearchParams } from "next/navigation";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";

const TAB_CONTENT: Record<string, string[]> = {
  overview: ["kpi-cards", "financial-charts", "valuation-summary", "risk-assessment"],
  story: ["financial-charts", "valuation-summary", "peer-comparison"],
  management: ["ownership-analysis", "catalyst-tracker", "concall-consistency", "management-consistency"],
  governance: ["risk-assessment", "checklist", "risk-score", "beneish-m-score", "altman-z-score", "piotroski-f-score", "forensic-flags"],
  financials: ["financial-charts", "kpi-cards", "ratio-analysis", "common-size", "revenue-projection"],
  valuation: ["valuation-summary", "revenue-projection", "dcf-valuation", "relative-valuation", "sotp-valuation", "banking-valuation", "excess-return-valuation"],
  risk: ["risk-assessment", "technical-analysis", "risk-score", "hedging-mechanism"],
  sme: ["ownership-analysis", "custom-text", "turnaround-indicator"],
  "working-capital": ["financial-charts", "kpi-cards", "common-size"],
  downsides: ["risk-assessment", "checklist", "hedging-mechanism", "forensic-flags"],
};

export default function CompanyPage() {
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
