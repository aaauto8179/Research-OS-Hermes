"use client";

import React, { Suspense } from "react";
import { WidgetLayoutItem } from "@/lib/workstation-store";
import {
  FinancialStatementsWorkstationAdapter,
  IncomeStatementAdapter,
  BalanceSheetAdapter,
  CashFlowAdapter,
} from "./FinancialStatementsAdapter";
import {
  ScenarioWorkstationAdapter,
  TrajectoryChartAdapter,
  MarginBridgeChartAdapter,
  SegmentProjectionsAdapter,
  ScenarioControlsAdapter,
  DriverInputsAdapter,
} from "./ScenarioAdapters";
import {
  DCFValuationAdapter,
  DupontAnalysisAdapter,
  AltmanZScoreAdapter,
  PiotroskiFScoreAdapter,
  SOTPValuationAdapter,
  RelativeValuationAdapter,
  ReverseDCFAdapter,
  BeneishMScoreAdapter,
  ForensicFlagsAdapter,
  BankingValuationAdapter,
  ExcessReturnAdapter,
  KPICardsAdapter,
  FinancialChartsAdapter,
  RatioAnalysisAdapter,
  CommonSizeAdapter,
  PeerComparisonAdapter,
} from "./MathEngineAdapters";
import {
  StandaloneNotesAdapter,
  AttachmentHubAdapter,
} from "./QualitativeAdapters";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface WorkstationWidgetRendererProps {
  item?: WidgetLayoutItem;
  type?: string;
  symbol: string;
  cardId?: string;
  props?: Record<string, any>;
  [key: string]: any;
}

function DefaultWidgetFallback() {
  return (
    <div className="p-4 space-y-3 h-full w-full animate-pulse">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

/**
 * Central Workstation Widget Renderer Dispatcher
 * Maps layout widget items to their optimized adapters across Data, Scenarios, Valuation, and Qualitative categories.
 */
export function WorkstationWidgetRenderer({
  item,
  type,
  symbol,
  cardId,
  props,
  ...rest
}: WorkstationWidgetRendererProps) {
  const widgetType = (item?.type || type || "").toLowerCase().trim();
  const effectiveCardId = cardId || item?.i || widgetType;
  const combinedProps = {
    symbol,
    cardId: effectiveCardId,
    ...(item?.props || {}),
    ...(props || {}),
    ...rest,
  };

  return (
    <Suspense fallback={<DefaultWidgetFallback />}>
      <div className="h-full w-full overflow-hidden" data-widget-type={widgetType}>
        {renderWidgetByType(widgetType, combinedProps, symbol, effectiveCardId)}
      </div>
    </Suspense>
  );
}

function renderWidgetByType(
  widgetType: string,
  props: Record<string, any>,
  symbol: string,
  cardId: string
) {
  switch (widgetType) {
    // ───────────────────────────────────────────────
    // 1. DATA & FINANCIAL STATEMENTS
    // ───────────────────────────────────────────────
    case "financial-statements-workstation":
    case "financial-statements":
      return <FinancialStatementsWorkstationAdapter symbol={symbol} />;

    case "income-statement":
    case "income_statement":
    case "pl-statement":
    case "pl":
      return <IncomeStatementAdapter symbol={symbol} />;

    case "balance-sheet":
    case "balance_sheet":
    case "bs-statement":
    case "bs":
      return <BalanceSheetAdapter symbol={symbol} />;

    case "cash-flow":
    case "cash_flow":
    case "cashflow":
    case "cf":
      return <CashFlowAdapter symbol={symbol} />;

    case "kpi-cards":
      return <KPICardsAdapter symbol={symbol} {...props} />;

    case "financial-charts":
      return <FinancialChartsAdapter symbol={symbol} {...props} />;

    case "ratio-analysis":
      return <RatioAnalysisAdapter symbol={symbol} {...props} />;

    case "common-size":
      return <CommonSizeAdapter symbol={symbol} {...props} />;

    case "peer-comparison":
      return <PeerComparisonAdapter symbol={symbol} {...props} />;

    // ───────────────────────────────────────────────
    // 2. SCENARIOS & PROJECTIONS
    // ───────────────────────────────────────────────
    case "scenario-workstation":
      return <ScenarioWorkstationAdapter symbol={symbol} />;

    case "trajectory-chart":
      return <TrajectoryChartAdapter symbol={symbol} />;

    case "margin-bridge":
      return <MarginBridgeChartAdapter symbol={symbol} />;

    case "segment-projections":
      return <SegmentProjectionsAdapter symbol={symbol} />;

    case "scenario-controls":
      return <ScenarioControlsAdapter symbol={symbol} />;

    case "driver-inputs":
      return <DriverInputsAdapter symbol={symbol} />;

    // ───────────────────────────────────────────────
    // 3. VALUATION & FORENSIC MATH ENGINES
    // ───────────────────────────────────────────────
    case "dcf-valuation":
    case "dcf":
      return <DCFValuationAdapter symbol={symbol} {...props} />;

    case "dupont-analysis":
    case "dupont":
      return <DupontAnalysisAdapter symbol={symbol} {...props} />;

    case "altman-z-score":
    case "altman-z":
      return <AltmanZScoreAdapter symbol={symbol} {...props} />;

    case "piotroski-f-score":
    case "piotroski":
      return <PiotroskiFScoreAdapter symbol={symbol} {...props} />;

    case "sotp-valuation":
    case "sotp":
      return <SOTPValuationAdapter symbol={symbol} {...props} />;

    case "relative-valuation":
    case "relative-comps":
      return <RelativeValuationAdapter symbol={symbol} {...props} />;

    case "reverse-dcf":
      return <ReverseDCFAdapter symbol={symbol} {...props} />;

    case "beneish-m-score":
    case "beneish":
      return <BeneishMScoreAdapter symbol={symbol} {...props} />;

    case "forensic-flags":
      return <ForensicFlagsAdapter symbol={symbol} {...props} />;

    case "banking-valuation":
      return <BankingValuationAdapter symbol={symbol} {...props} />;

    case "excess-return-valuation":
    case "excess-return":
      return <ExcessReturnAdapter symbol={symbol} {...props} />;

    // ───────────────────────────────────────────────
    // 4. QUALITATIVE & WORKBENCH HUB
    // ───────────────────────────────────────────────
    case "standalone-notes":
    case "notes":
      return <StandaloneNotesAdapter symbol={symbol} cardId={cardId} />;

    case "attachment-hub":
    case "attachments":
      return <AttachmentHubAdapter symbol={symbol} cardId={cardId} />;

    // ───────────────────────────────────────────────
    // 5. REGISTRY FALLBACK
    // ───────────────────────────────────────────────
    default:
      return (
        <div className="h-full w-full overflow-auto p-2">
          <WidgetRenderer type={widgetType} props={props} />
        </div>
      );
  }
}

export default WorkstationWidgetRenderer;
