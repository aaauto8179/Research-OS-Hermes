"use client";

import React, { use, useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useWorkstationStore } from "@/lib/workstation-store";
import { WorkstationTabNav } from "@/components/workstation/WorkstationTabNav";
import { WorkstationCanvas } from "@/components/workstation/WorkstationCanvas";
import { WidgetCatalogModal } from "@/components/workstation/WidgetCatalogModal";

interface PageProps {
  params: Promise<{ symbol: string }>;
}

function AntigravityWorkstationContent({
  symbol,
}: {
  symbol: string;
}) {
  const searchParams = useSearchParams();
  const urlTab = searchParams?.get("tab");

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  const activeTabId = useWorkstationStore((s) => s.activeTabId);
  const tabs = useWorkstationStore((s) => s.tabs);
  const setSymbol = useWorkstationStore((s) => s.setSymbol);
  const setTab = useWorkstationStore((s) => s.setTab);
  const resetLayout = useWorkstationStore((s) => s.resetLayout);
  const loadLayout = useWorkstationStore((s) => s.loadLayout);

  // Initialize and load layout for current company symbol
  useEffect(() => {
    setSymbol(symbol);
    loadLayout(symbol);
  }, [symbol, setSymbol, loadLayout]);

  // Synchronize active tab from URL query param if specified
  useEffect(() => {
    if (urlTab && tabs.some((t) => t.id === urlTab) && urlTab !== activeTabId) {
      setTab(urlTab);
    }
  }, [urlTab, tabs, activeTabId, setTab]);

  // Listen for global header action events dispatched by layout.tsx
  useEffect(() => {
    const handleAddWidgetEvent = () => {
      setIsCatalogOpen(true);
    };

    const handleResetLayoutEvent = () => {
      resetLayout();
    };

    window.addEventListener("antigravity:add-widget", handleAddWidgetEvent);
    window.addEventListener("antigravity:reset-layout", handleResetLayoutEvent);

    return () => {
      window.removeEventListener("antigravity:add-widget", handleAddWidgetEvent);
      window.removeEventListener("antigravity:reset-layout", handleResetLayoutEvent);
    };
  }, [resetLayout]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div
      className="antigravity-workstation-container flex flex-col h-full min-h-[calc(100vh-3.5rem)] space-y-3 p-4 md:p-6"
      data-testid="antigravity-workstation-container"
      id="antigravity-workstation"
    >
      {/* 1. Dynamic Tab Navigation with Drag-and-Drop Reordering */}
      <WorkstationTabNav onAddWidgetClick={() => setIsCatalogOpen(true)} />

      {/* 2. Responsive 12-Column Canvas with react-grid-layout */}
      <div
        className="workstation-canvas-container flex-1 w-full"
        data-testid="workstation-canvas-container"
        id="antigravity-workstation-canvas"
      >
        <WorkstationCanvas
          symbol={symbol}
          onAddWidgetClick={() => setIsCatalogOpen(true)}
        />
      </div>

      {/* 3. Radix Dialog Widget Catalog Modal */}
      <WidgetCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        tabId={activeTab?.id || "overview"}
        tabLabel={activeTab?.label || "Active Tab"}
      />
    </div>
  );
}

export default function AntigravityWorkstationPage({
  params,
}: PageProps) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const rawSymbol = unwrappedParams?.symbol || (routeParams?.symbol as string) || "RELIANCE";
  const symbol = rawSymbol.toUpperCase();

  return (
    <Suspense
      fallback={
        <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground animate-pulse">
          Loading Antigravity Workstation for {symbol}...
        </div>
      }
    >
      <AntigravityWorkstationContent symbol={symbol} />
    </Suspense>
  );
}
