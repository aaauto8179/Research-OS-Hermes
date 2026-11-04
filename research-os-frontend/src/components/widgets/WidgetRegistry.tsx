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
const RatioAnalysis = dynamic(() => import("./RatioAnalysis"), { loading: () => <WidgetSkeleton /> });
const TurnaroundIndicator = dynamic(() => import("./TurnaroundIndicator"), { loading: () => <WidgetSkeleton /> });
const RiskScore = dynamic(() => import("./RiskScore"), { loading: () => <WidgetSkeleton /> });
const CommonSize = dynamic(() => import("./CommonSize"), { loading: () => <WidgetSkeleton /> });
const HedgingMechanism = dynamic(() => import("./HedgingMechanism"), { loading: () => <WidgetSkeleton /> });
const RevenueProjection = dynamic(() => import("./RevenueProjection"), { loading: () => <WidgetSkeleton /> });
const ConcallConsistency = dynamic(() => import("./ConcallConsistency"), { loading: () => <WidgetSkeleton /> });
const DCFValuation = dynamic(() => import("./DCFValuation"), { loading: () => <WidgetSkeleton /> });
const RelativeValuation = dynamic(() => import("./RelativeValuation"), { loading: () => <WidgetSkeleton /> });
const SOTPValuation = dynamic(() => import("./SOTPValuation"), { loading: () => <WidgetSkeleton /> });
const BankingValuation = dynamic(() => import("./BankingValuation"), { loading: () => <WidgetSkeleton /> });
const ExcessReturnValuation = dynamic(() => import("./ExcessReturnValuation"), { loading: () => <WidgetSkeleton /> });
const BeneishMScore = dynamic(() => import("./BeneishMScore"), { loading: () => <WidgetSkeleton /> });
const AltmanZScore = dynamic(() => import("./AltmanZScore"), { loading: () => <WidgetSkeleton /> });
const PiotroskiFScore = dynamic(() => import("./PiotroskiFScore"), { loading: () => <WidgetSkeleton /> });
const PortfolioAnalytics = dynamic(() => import("./PortfolioAnalytics"), { loading: () => <WidgetSkeleton /> });
const ForensicFlags = dynamic(() => import("./ForensicFlags"), { loading: () => <WidgetSkeleton /> });
const ManagementConsistency = dynamic(() => import("./ManagementConsistency"), { loading: () => <WidgetSkeleton /> });
const SmartSummarizer = dynamic(() => import("./SmartSummarizer"), { loading: () => <WidgetSkeleton /> });
const KeyDataExtractor = dynamic(() => import("./KeyDataExtractor"), { loading: () => <WidgetSkeleton /> });
const AIAssistant = dynamic(() => import("./AIAssistant"), { loading: () => <WidgetSkeleton /> });
const MarketMetrics = dynamic(() => import("./MarketMetrics"), { loading: () => <WidgetSkeleton /> });
const MacroDashboard = dynamic(() => import("./MacroDashboard"), { loading: () => <WidgetSkeleton /> });
const WatchlistManager = dynamic(() => import("./WatchlistManager"), { loading: () => <WidgetSkeleton /> });
const TodoTracker = dynamic(() => import("./TodoTracker"), { loading: () => <WidgetSkeleton /> });
const TimeTracker = dynamic(() => import("./TimeTracker"), { loading: () => <WidgetSkeleton /> });
const KanbanBoard = dynamic(() => import("./KanbanBoard"), { loading: () => <WidgetSkeleton /> });
const IdeaGeneration = dynamic(() => import("./IdeaGeneration"), { loading: () => <WidgetSkeleton /> });
const ScreeningTable = dynamic(() => import("./ScreeningTable"), { loading: () => <WidgetSkeleton /> });
const PortfolioFitCheck = dynamic(() => import("./PortfolioFitCheck"), { loading: () => <WidgetSkeleton /> });
const ScenarioAnalysis = dynamic(() => import("./ScenarioAnalysis"), { loading: () => <WidgetSkeleton /> });
const ConvictionSizing = dynamic(() => import("./ConvictionSizing"), { loading: () => <WidgetSkeleton /> });
const ReverseDCF = dynamic(() => import("./ReverseDCF"), { loading: () => <WidgetSkeleton /> });
const FilteredTable = dynamic(() => import("./FilteredTable"), { loading: () => <WidgetSkeleton /> });
const MultiTextBox = dynamic(() => import("./MultiTextBox"), { loading: () => <WidgetSkeleton /> });
const SimpleTextBox = dynamic(() => import("./SimpleTextBox"), { loading: () => <WidgetSkeleton /> });
const UIPrimitives = dynamic(() => import("./UIPrimitives"), { loading: () => <WidgetSkeleton /> });
const DecisionTerminal = dynamic(() => import("./DecisionTerminal"), { loading: () => <WidgetSkeleton /> });
const TrackingTable = dynamic(() => import("./TrackingTable"), { loading: () => <WidgetSkeleton /> });
const LatestChanges = dynamic(() => import("./LatestChanges"), { loading: () => <WidgetSkeleton /> });
const TrackRecord = dynamic(() => import("./TrackRecord"), { loading: () => <WidgetSkeleton /> });
const CapitalAllocation = dynamic(() => import("./CapitalAllocation"), { loading: () => <WidgetSkeleton /> });
const KeyFragilityPoints = dynamic(() => import("./KeyFragilityPoints"), { loading: () => <WidgetSkeleton /> });
const LegalChecks = dynamic(() => import("./LegalChecks"), { loading: () => <WidgetSkeleton /> });
const ConcallTracker = dynamic(() => import("./ConcallTracker"), { loading: () => <WidgetSkeleton /> });
const RecentEvents = dynamic(() => import("./RecentEvents"), { loading: () => <WidgetSkeleton /> });
const ExitTool = dynamic(() => import("./ExitTool"), { loading: () => <WidgetSkeleton /> });
const ValuationPhilosophy = dynamic(() => import("./ValuationPhilosophy"), { loading: () => <WidgetSkeleton /> });
const SegmentBreakup = dynamic(() => import("./SegmentBreakup"), { loading: () => <WidgetSkeleton /> });
const CompanyInfo = dynamic(() => import("./CompanyInfo"), { loading: () => <WidgetSkeleton /> });
const OnGroundResearch = dynamic(() => import("./OnGroundResearch"), { loading: () => <WidgetSkeleton /> });
const ManagementCompensation = dynamic(() => import("./ManagementCompensation"), { loading: () => <WidgetSkeleton /> });
const BoardStructure = dynamic(() => import("./BoardStructure"), { loading: () => <WidgetSkeleton /> });
const AssessAuditor = dynamic(() => import("./AssessAuditor"), { loading: () => <WidgetSkeleton /> });
const CustomerConcentration = dynamic(() => import("./CustomerConcentration"), { loading: () => <WidgetSkeleton /> });
const CostBreakup = dynamic(() => import("./CostBreakup"), { loading: () => <WidgetSkeleton /> });
const WCBreakup = dynamic(() => import("./WCBreakup"), { loading: () => <WidgetSkeleton /> });
const KeyEvents = dynamic(() => import("./KeyEvents"), { loading: () => <WidgetSkeleton /> });
const DemandTable = dynamic(() => import("./DemandTable"), { loading: () => <WidgetSkeleton /> });
const SupplyTable = dynamic(() => import("./SupplyTable"), { loading: () => <WidgetSkeleton /> });
const RegulationsWidget = dynamic(() => import("./RegulationsWidget"), { loading: () => <WidgetSkeleton /> });
const CostDrivers = dynamic(() => import("./CostDrivers"), { loading: () => <WidgetSkeleton /> });
const CostComparison = dynamic(() => import("./CostComparison"), { loading: () => <WidgetSkeleton /> });
const IndustryAggregate = dynamic(() => import("./IndustryAggregate"), { loading: () => <WidgetSkeleton /> });

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
  "ratio-analysis": RatioAnalysis,
  "turnaround-indicator": TurnaroundIndicator,
  "risk-score": RiskScore,
  "common-size": CommonSize,
  "hedging-mechanism": HedgingMechanism,
  "revenue-projection": RevenueProjection,
  "concall-consistency": ConcallConsistency,
  "dcf-valuation": DCFValuation,
  "relative-valuation": RelativeValuation,
  "sotp-valuation": SOTPValuation,
  "banking-valuation": BankingValuation,
  "excess-return-valuation": ExcessReturnValuation,
  "beneish-m-score": BeneishMScore,
  "altman-z-score": AltmanZScore,
  "piotroski-f-score": PiotroskiFScore,
  "portfolio-analytics": PortfolioAnalytics,
  "forensic-flags": ForensicFlags,
  "management-consistency": ManagementConsistency,
  "smart-summarizer": SmartSummarizer,
  "key-data-extractor": KeyDataExtractor,
  "ai-assistant": AIAssistant,
  "market-metrics": MarketMetrics,
  "macro-dashboard": MacroDashboard,
  "watchlist-manager": WatchlistManager,
  "todo-tracker": TodoTracker,
  "time-tracker": TimeTracker,
  "kanban-board": KanbanBoard,
  "idea-generation": IdeaGeneration,
  "screening-table": ScreeningTable,
  "portfolio-fit-check": PortfolioFitCheck,
  "scenario-analysis": ScenarioAnalysis,
  "conviction-sizing": ConvictionSizing,
  "reverse-dcf": ReverseDCF,
  "filtered-table": FilteredTable,
  "multi-text-box": MultiTextBox,
  "simple-text-box": SimpleTextBox,
  "ui-primitives": UIPrimitives,
  "decision-terminal": DecisionTerminal,
  "tracking-table": TrackingTable,
  "latest-changes": LatestChanges,
  "track-record": TrackRecord,
  "capital-allocation": CapitalAllocation,
  "key-fragility-points": KeyFragilityPoints,
  "legal-checks": LegalChecks,
  "concall-tracker": ConcallTracker,
  "recent-events": RecentEvents,
  "exit-tool": ExitTool,
  "valuation-philosophy": ValuationPhilosophy,
  "segment-breakup": SegmentBreakup,
  "company-info": CompanyInfo,
  "on-ground-research": OnGroundResearch,
  "management-compensation": ManagementCompensation,
  "board-structure": BoardStructure,
  "assess-auditor": AssessAuditor,
  "customer-concentration": CustomerConcentration,
  "cost-breakup": CostBreakup,
  "wc-breakup": WCBreakup,
  "key-events": KeyEvents,
  "demand-table": DemandTable,
  "supply-table": SupplyTable,
  "regulations-widget": RegulationsWidget,
  "cost-drivers": CostDrivers,
  "cost-comparison": CostComparison,
  "industry-aggregate": IndustryAggregate,
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