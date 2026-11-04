"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<string, string> = {
  overview: "Overview & Decision",
  story: "Story & Moats",
  management: "Management & Concall",
  governance: "Governance & Forensics",
  financials: "Financial Statements",
  valuation: "Valuation Suite",
  risk: "Risk Scoring",
  sme: "SME Forensics",
  "working-capital": "Working Capital & Concentration",
  downsides: "Downsides & Exit Triggers",
};

interface TabBarProps {
  symbol: string;
}

export function TabBar({ symbol }: TabBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") || "overview";

  return (
    <nav className="flex items-center gap-1 border-b px-4 py-1 overflow-x-auto bg-muted/30">
      {Object.entries(TAB_LABELS).map(([key, label]) => (
        <button
          key={key}
          onClick={() => router.replace(`/company/${symbol}?tab=${key}`)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
            activeTab === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}