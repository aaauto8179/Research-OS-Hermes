"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
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

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const symbol = (params?.symbol as string) || "RELIANCE";
  const activeTab = searchParams?.get("tab") || "overview";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Persistent Company Header — never unmounts on tab switch */}
      <header className="flex items-center justify-between border-b px-4 py-2 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">{symbol}</h1>
          <span className="text-sm text-muted-foreground">NSE: {symbol}</span>
          <span className="text-sm font-medium text-green-500">+2.3%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Conviction:</span>
          <span className="text-sm font-semibold text-amber-500">High</span>
        </div>
      </header>

      {/* Persistent Tab Bar — updates ?tab= only, no route transition */}
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

      {/* Tab Content — children rendered here, parent stays mounted */}
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
}
