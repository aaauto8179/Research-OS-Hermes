"use client";

import { useSearchParams } from "next/navigation";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";

const TAB_CONTENT: Record<string, string[]> = {
  overview: ["kpi-cards", "financial-charts", "valuation-summary", "risk-assessment"],
  story: ["financial-charts", "valuation-summary", "peer-comparison"],
  management: ["ownership-analysis", "catalyst-tracker"],
  governance: ["risk-assessment", "checklist"],
  financials: ["financial-charts", "kpi-cards"],
  valuation: ["valuation-summary"],
  risk: ["risk-assessment", "technical-analysis"],
  sme: ["ownership-analysis", "custom-text"],
  "working-capital": ["financial-charts", "kpi-cards"],
  downsides: ["risk-assessment", "checklist"],
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
