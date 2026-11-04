import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { TabBar } from "./TabBar";

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

// Static header - can be server-rendered
function CompanyHeader({ symbol }: { symbol: string }) {
  return (
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
  );
}

// Main layout - server component by default
// Next.js 15 passes params as Promise; layouts don't receive searchParams
export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}) {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol || "RELIANCE";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Static header - server rendered */}
      <CompanyHeader symbol={symbol} />

      {/* Client-side tab bar - reads activeTab from URL via useSearchParams internally */}
      <Suspense fallback={<div className="border-b px-4 py-1 bg-muted/30">Loading tabs...</div>}>
        <TabBar symbol={symbol} />
      </Suspense>

      {/* Tab Content - children rendered here, parent stays mounted */}
      <main className="flex-1 overflow-auto p-4">
        {children}
      </main>
    </div>
  );
}
