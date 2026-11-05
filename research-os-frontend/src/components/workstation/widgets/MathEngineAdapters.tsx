"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { DupontAnalysis } from "./DupontAnalysis";

// Direct dynamic imports from repository widgets
const DCFValuation = dynamic(() => import("@/components/widgets/DCFValuation"), {
  loading: () => <MathWidgetSkeleton title="DCF Valuation" />,
});
const AltmanZScore = dynamic(() => import("@/components/widgets/AltmanZScore"), {
  loading: () => <MathWidgetSkeleton title="Altman Z-Score" />,
});
const PiotroskiFScore = dynamic(() => import("@/components/widgets/PiotroskiFScore"), {
  loading: () => <MathWidgetSkeleton title="Piotroski F-Score" />,
});
const SOTPValuation = dynamic(() => import("@/components/widgets/SOTPValuation"), {
  loading: () => <MathWidgetSkeleton title="SOTP Valuation" />,
});
const RelativeValuation = dynamic(() => import("@/components/widgets/RelativeValuation"), {
  loading: () => <MathWidgetSkeleton title="Relative Valuation" />,
});
const ReverseDCF = dynamic(() => import("@/components/widgets/ReverseDCF"), {
  loading: () => <MathWidgetSkeleton title="Reverse DCF" />,
});
const BeneishMScore = dynamic(() => import("@/components/widgets/BeneishMScore"), {
  loading: () => <MathWidgetSkeleton title="Beneish M-Score" />,
});
const ForensicFlags = dynamic(() => import("@/components/widgets/ForensicFlags"), {
  loading: () => <MathWidgetSkeleton title="Forensic Flags" />,
});
const BankingValuation = dynamic(() => import("@/components/widgets/BankingValuation"), {
  loading: () => <MathWidgetSkeleton title="Banking Valuation" />,
});
const ExcessReturnValuation = dynamic(() => import("@/components/widgets/ExcessReturnValuation"), {
  loading: () => <MathWidgetSkeleton title="Excess Return Valuation" />,
});
const KPICard = dynamic(() => import("@/components/widgets/KPICard"), {
  loading: () => <MathWidgetSkeleton title="Executive KPIs" />,
});
const FinancialCharts = dynamic(() => import("@/components/widgets/FinancialCharts"), {
  loading: () => <MathWidgetSkeleton title="Financial Charts" />,
});
const RatioAnalysis = dynamic(() => import("@/components/widgets/RatioAnalysis"), {
  loading: () => <MathWidgetSkeleton title="Ratio Analysis" />,
});
const CommonSize = dynamic(() => import("@/components/widgets/CommonSize"), {
  loading: () => <MathWidgetSkeleton title="Common Size" />,
});
const PeerComparison = dynamic(() => import("@/components/widgets/PeerComparison"), {
  loading: () => <MathWidgetSkeleton title="Peer Comparison" />,
});

function MathWidgetSkeleton({ title }: { title: string }) {
  return (
    <div className="p-4 space-y-3 h-full w-full">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export interface MathEngineAdapterProps {
  symbol?: string;
  [key: string]: any;
}

export function DCFValuationAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="dcf-valuation-widget">
      <DCFValuation symbol={symbol} {...rest} />
    </div>
  );
}

export function DupontAnalysisAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="dupont-analysis-widget">
      <DupontAnalysis symbol={symbol} {...rest} />
    </div>
  );
}

export function AltmanZScoreAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="altman-z-score-widget">
      <AltmanZScore symbol={symbol} {...rest} />
    </div>
  );
}

export function PiotroskiFScoreAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="piotroski-f-score-widget">
      <PiotroskiFScore symbol={symbol} {...rest} />
    </div>
  );
}

export function SOTPValuationAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="sotp-valuation-widget">
      <SOTPValuation symbol={symbol} {...rest} />
    </div>
  );
}

export function RelativeValuationAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="relative-valuation-widget">
      <RelativeValuation symbol={symbol} {...rest} />
    </div>
  );
}

export function ReverseDCFAdapter({ ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="reverse-dcf-widget">
      <ReverseDCF />
    </div>
  );
}

export function BeneishMScoreAdapter({ symbol, ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="beneish-m-score-widget">
      <BeneishMScore symbol={symbol} {...rest} />
    </div>
  );
}

export function ForensicFlagsAdapter({ symbol, ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="forensic-flags-widget">
      <ForensicFlags symbol={symbol} {...rest} />
    </div>
  );
}

export function BankingValuationAdapter({ symbol, ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="banking-valuation-widget">
      <BankingValuation symbol={symbol} {...rest} />
    </div>
  );
}

export function ExcessReturnAdapter({ symbol, ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="excess-return-widget">
      <ExcessReturnValuation symbol={symbol} {...rest} />
    </div>
  );
}

export function KPICardsAdapter({ metrics, ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="kpi-cards-widget">
      <KPICard metrics={metrics} />
    </div>
  );
}

export function FinancialChartsAdapter({ ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="financial-charts-widget">
      <FinancialCharts />
    </div>
  );
}

export function RatioAnalysisAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="ratio-analysis-widget">
      <RatioAnalysis symbol={symbol} {...rest} />
    </div>
  );
}

export function CommonSizeAdapter({ symbol = "RELIANCE", ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="common-size-widget">
      <CommonSize symbol={symbol} {...rest} />
    </div>
  );
}

export function PeerComparisonAdapter({ ...rest }: MathEngineAdapterProps) {
  return (
    <div className="h-full w-full overflow-auto p-2" data-testid="peer-comparison-widget">
      <PeerComparison />
    </div>
  );
}
