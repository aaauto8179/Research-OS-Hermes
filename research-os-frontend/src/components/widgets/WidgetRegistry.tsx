// Widget Registry - Single source of truth for all widget components
// Every widget type in workspace-store.ts maps to exactly one component here.
// DashboardCanvas, CompanyTabs, IndustryPage, and ValuationPage all import from this file.

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Lazy-loaded widget components (code-split for performance) ───
const KPICard = dynamic(() => import("./KPICard"), { loading: () => <WidgetSkeleton /> });
const FinancialCharts = dynamic(() => import("./FinancialCharts"), { loading: () => <WidgetSkeleton /> });
const ValuationSummary = dynamic(() => import("./ValuationSummary"), { loading: () => <WidgetSkeleton /> });
const RiskAssessment = dynamic(() => import("./RiskAssessment"), { loading: () => <WidgetSkeleton /> });
const OwnershipAnalysis = dynamic(() => import("./OwnershipAnalysis"), { loading: () => <WidgetSkeleton /> });
const CatalystTracker = dynamic(() => import("./CatalystTracker"), { loading: () => <WidgetSkeleton /> });
const DocumentViewer = dynamic(() => import("./DocumentViewer"), { loading: () => <WidgetSkeleton /> });
const PeerComparison = dynamic(() => import("./PeerComparison"), { loading: () => <WidgetSkeleton /> });
const TechnicalAnalysis = dynamic(() => import("./TechnicalAnalysis"), { loading: () => <WidgetSkeleton /> });
const Checklist = dynamic(() => import("./Checklist"), { loading: () => <WidgetSkeleton /> });
const CustomText = dynamic(() => import("./CustomText"), { loading: () => <WidgetSkeleton /> });
const IndustryOverview = dynamic(() => import("./IndustryOverview"), { loading: () => <WidgetSkeleton /> });
const SectorHeatmap = dynamic(() => import("./SectorHeatmap"), { loading: () => <WidgetSkeleton /> });
const PeerComparisonTable = dynamic(() => import("./PeerComparisonTable"), { loading: () => <WidgetSkeleton /> });
const ValueChainMapper = dynamic(() => import("./ValueChainMapper"), { loading: () => <WidgetSkeleton /> });
const MarginBridge = dynamic(() => import("./MarginBridge"), { loading: () => <WidgetSkeleton /> });
const DemandDrivers = dynamic(() => import("./DemandDrivers"), { loading: () => <WidgetSkeleton /> });
const NewsFeed = dynamic(() => import("./NewsFeed"), { loading: () => <WidgetSkeleton /> });
const PortfolioHoldings = dynamic(() => import("./PortfolioHoldings"), { loading: () => <WidgetSkeleton /> });
const PortfolioPerformance = dynamic(() => import("./PortfolioPerformance"), { loading: () => <WidgetSkeleton /> });
const PortfolioRisk = dynamic(() => import("./PortfolioRisk"), { loading: () => <WidgetSkeleton /> });
const TransactionLog = dynamic(() => import("./TransactionLog"), { loading: () => <WidgetSkeleton /> });

function WidgetSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader><Skeleton className="h-4 w-32" /></CardHeader>
      <CardContent><Skeleton className="h-24 w-full" /></CardContent>
    </Card>
  );
}

// ─── Widget Registry Map ───
export const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
  "industry-overview": IndustryOverview,
  "sector-heatmap": SectorHeatmap,
  "peer-comparison-table": PeerComparisonTable,
  "value-chain-mapper": ValueChainMapper,
  "margin-bridge": MarginBridge,
  "demand-drivers": DemandDrivers,
  "news-feed": NewsFeed,
  "kpi-cards": KPICard,
  "financial-charts": FinancialCharts,
  "valuation-summary": ValuationSummary,
  "risk-assessment": RiskAssessment,
  "ownership-analysis": OwnershipAnalysis,
  "catalyst-tracker": CatalystTracker,
  "document-viewer": DocumentViewer,
  "peer-comparison": PeerComparison,
  "technical-analysis": TechnicalAnalysis,
  "checklist": Checklist,
  "custom-text": CustomText,
  "portfolio-holdings": PortfolioHoldings,
  "portfolio-performance": PortfolioPerformance,
  "portfolio-risk": PortfolioRisk,
  "transaction-log": TransactionLog,
};

export function WidgetRenderer({ type, props, ...rest }: { type: string; props?: any; [key: string]: any }) {
  const Component = WIDGET_REGISTRY[type];
  if (!Component) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          Unknown widget type: {type}
        </CardContent>
      </Card>
    );
  }
  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <Component {...props} {...rest} />
    </Suspense>
  );
}

export const AVAILABLE_WIDGET_TYPES = Object.keys(WIDGET_REGISTRY);