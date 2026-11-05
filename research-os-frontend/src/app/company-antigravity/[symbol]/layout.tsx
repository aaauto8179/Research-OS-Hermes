"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  CheckCircle2,
  RotateCcw,
  Plus,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ symbol: string }>;
}

export default function AntigravityWorkstationLayout({
  children,
  params,
}: LayoutProps) {
  const unwrappedParams = use(params);
  const routeParams = useParams();
  const rawSymbol = unwrappedParams?.symbol || (routeParams?.symbol as string) || "RELIANCE";
  const symbol = rawSymbol.toUpperCase();

  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "local">("saved");

  useEffect(() => {
    const handleStatus = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.status) {
        setSaveStatus(detail.status);
      }
    };
    window.addEventListener("antigravity:save-status", handleStatus);
    return () => window.removeEventListener("antigravity:save-status", handleStatus);
  }, []);

  const handleAddWidget = () => {
    window.dispatchEvent(new CustomEvent("antigravity:add-widget"));
  };

  const handleResetLayout = () => {
    if (confirm("Reset workstation layout to default arrangement?")) {
      window.dispatchEvent(new CustomEvent("antigravity:reset-layout"));
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Workstation Top Navigation Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-30">
        {/* Left Section: Branding & Company Context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight">Antigravity Workstation</span>
                <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary border border-primary/20">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Fundamental Equity Research System
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-border/80 mx-1 hidden sm:block" />

          {/* Company Symbol Badge & Meta */}
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight font-mono text-foreground px-2 py-0.5 bg-muted rounded-md border border-border">
              {symbol}
            </span>
            <span className="text-xs text-muted-foreground font-mono hidden md:inline">
              NSE:{symbol}
            </span>

            {/* Live Sync Indicator */}
            <div className="flex items-center gap-1.5 pl-1" title="Real-time PostgreSQL write-through & telemetry sync">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hidden lg:inline">
                PostgreSQL Sync Active
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Workstation Action Controls & Legacy Link */}
        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          <div
            className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground transition-all"
            title="Layout changes automatically sync to database"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium hidden sm:inline">
              {saveStatus === "saving" ? "Saving..." : saveStatus === "local" ? "Offline Cache" : "Saved to DB"}
            </span>
          </div>

          {/* Add Widget Button */}
          <button
            type="button"
            onClick={handleAddWidget}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            data-testid="workstation-add-widget-btn"
            title="Add widget to active tab"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Widget</span>
          </button>

          {/* Reset Layout Button */}
          <button
            type="button"
            onClick={handleResetLayout}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition hover:bg-secondary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            data-testid="workstation-reset-layout-btn"
            title="Reset active tab grid to default layout"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Reset Layout</span>
          </button>

          {/* Link to Legacy Route */}
          <Link
            href={`/company/${symbol}`}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            data-testid="workstation-legacy-link"
            title="Switch back to classic read-only view"
          >
            <span>Legacy View</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Children Content Area */}
      <main className="flex-1 overflow-auto bg-muted/10">
        {children}
      </main>
    </div>
  );
}
