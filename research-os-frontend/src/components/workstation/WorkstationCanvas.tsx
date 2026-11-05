"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ResponsiveGridLayout, useContainerWidth, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  useWorkstationStore,
  WidgetLayoutItem,
} from "@/lib/workstation-store";
import {
  getWidgetDefinition,
  WorkstationWidgetDefinition,
} from "./workstation-widget-catalog";
import { WorkbenchCard } from "./WorkbenchCard";
import { WorkstationWidgetRenderer } from "./widgets/WorkstationWidgetRenderer";
import {
  Plus,
  Layers,
} from "lucide-react";

interface WorkstationCanvasProps {
  symbol: string;
  onAddWidgetClick?: () => void;
}

function renderWidgetContent(item: WidgetLayoutItem, symbol: string) {
  return <WorkstationWidgetRenderer item={item} symbol={symbol} />;
}

function WorkstationCanvasInner({ symbol, onAddWidgetClick }: WorkstationCanvasProps) {
  const activeTabId = useWorkstationStore((s) => s.activeTabId);
  const activeTab = useWorkstationStore((s) => s.tabs.find((t) => t.id === activeTabId));
  const layouts = useWorkstationStore((s) => s.layouts);
  const updateLayout = useWorkstationStore((s) => s.updateLayout);
  const removeWidget = useWorkstationStore((s) => s.removeWidget);

  const { width, containerRef } = useContainerWidth({ initialWidth: 1200 });

  const currentTabLayout = useMemo(() => {
    return layouts[activeTabId] || [];
  }, [layouts, activeTabId]);

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      if (!Array.isArray(newLayout)) return;

      const updatedItems: WidgetLayoutItem[] = newLayout.map((item) => {
        const existing = currentTabLayout.find((e) => e.i === item.i);
        return {
          i: item.i,
          type: existing?.type || item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          minW: item.minW || existing?.minW,
          minH: item.minH || existing?.minH,
          maxW: item.maxW || existing?.maxW,
          maxH: item.maxH || existing?.maxH,
          props: existing?.props || {},
        };
      });

      updateLayout(activeTabId, updatedItems);
    },
    [activeTabId, currentTabLayout, updateLayout]
  );

  // If active tab has no widgets, show inviting empty canvas state
  if (currentTabLayout.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[460px] border border-dashed border-border rounded-xl p-8 text-center bg-card/40 my-2"
        data-testid="workstation-empty-tab"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-3 shadow-inner">
          <Layers className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {activeTab?.label || "This tab"} is empty
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">
          Add fundamental research widgets, financial statements, valuation models, or custom notes to populate your layout.
        </p>
        {onAddWidgetClick && (
          <button
            type="button"
            onClick={onAddWidgetClick}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            data-testid="empty-state-add-widget-btn"
          >
            <Plus className="h-4 w-4" />
            <span>Open Widget Catalog</span>
          </button>
        )}
      </div>
    );
  }

  // Format layouts for react-grid-layout
  const rglLayout = currentTabLayout.map((item) => ({
    i: item.i,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
    minW: item.minW || 4,
    minH: item.minH || 3,
    maxW: item.maxW,
    maxH: item.maxH,
  }));

  return (
    <div ref={containerRef} className="w-full min-h-[600px] pb-8" data-testid="workstation-canvas-grid">
      <ResponsiveGridLayout
        width={width || 1200}
        layouts={{ lg: rglLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={64}
        dragConfig={{ handle: ".card-drag-handle" }}
        onLayoutChange={handleLayoutChange}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {currentTabLayout.map((item) => {
          const widgetDef = getWidgetDefinition(item.type);
          const title = widgetDef?.name || item.type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
          return (
            <div key={item.i} data-grid={item}>
              <WorkbenchCard
                cardId={item.i}
                symbol={symbol}
                title={title}
                description={widgetDef?.description}
                category={widgetDef?.category}
                onRemove={() => removeWidget(activeTabId, item.i)}
              >
                {renderWidgetContent(item, symbol)}
              </WorkbenchCard>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}

function WorkstationCanvasSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse p-2">
      <div className="h-80 rounded-xl bg-muted/40 border border-border" />
      <div className="h-80 rounded-xl bg-muted/40 border border-border" />
    </div>
  );
}

export function WorkstationCanvas(props: WorkstationCanvasProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <WorkstationCanvasSkeleton />;
  }

  return <WorkstationCanvasInner {...props} />;
}
