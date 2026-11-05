"use client";

import React, { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  WIDGET_CATALOG,
  WIDGET_CATEGORIES,
  WidgetCategory,
  WorkstationWidgetDefinition,
} from "./workstation-widget-catalog";
import { useWorkstationStore } from "@/lib/workstation-store";
import {
  Search,
  X,
  Plus,
  Table,
  BarChart3,
  LineChart,
  PieChart,
  Percent,
  Users,
  SlidersHorizontal,
  Sliders,
  Layers,
  TrendingUp,
  Activity,
  Workflow,
  Calculator,
  Target,
  RotateCw,
  Boxes,
  Building2,
  Coins,
  ShieldAlert,
  FileSearch,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Paperclip,
  Check,
} from "lucide-react";

// Icon mapping helper
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Table,
  BarChart3,
  LineChart,
  PieChart,
  Percent,
  Users,
  SlidersHorizontal,
  Sliders,
  Layers,
  TrendingUp,
  Activity,
  Workflow,
  Calculator,
  Target,
  RotateCw,
  Boxes,
  Building2,
  Coins,
  ShieldAlert,
  FileSearch,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Paperclip,
};

interface WidgetCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabId: string;
  tabLabel: string;
}

export function WidgetCatalogModal({
  isOpen,
  onClose,
  tabId,
  tabLabel,
}: WidgetCatalogModalProps) {
  const addWidget = useWorkstationStore((s) => s.addWidget);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const filteredWidgets = useMemo(() => {
    return WIDGET_CATALOG.filter((widget) => {
      // Category filter
      if (selectedCategory !== "all" && widget.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = widget.name.toLowerCase().includes(query);
        const matchesDesc = widget.description.toLowerCase().includes(query);
        const matchesTags = widget.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesCategory = widget.category.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesTags || matchesCategory;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleAddWidget = (widget: WorkstationWidgetDefinition) => {
    addWidget(tabId, widget.id);
    setRecentlyAddedId(widget.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
      onClose();
    }, 400);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 flex max-h-[88vh] w-[92vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] flex-col rounded-xl border border-border bg-background shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden"
          data-testid="widget-catalog-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
            <div>
              <Dialog.Title className="text-base font-bold text-foreground">
                Workstation Widget Catalog
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                Add analytical models, financial statements, and research tools to{" "}
                <strong className="text-primary font-semibold">{tabLabel}</strong>.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close dialog"
                data-testid="widget-catalog-close-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col gap-3 border-b border-border/70 px-6 py-3.5 bg-muted/20">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search widgets by name, category, metric, or model (e.g. DCF, Altman, P&L, DuPont)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="widget-catalog-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-3 py-1 font-medium transition-colors whitespace-nowrap text-[11px] ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All Widgets ({WIDGET_CATALOG.length})
              </button>
              {WIDGET_CATEGORIES.map((cat) => {
                const count = WIDGET_CATALOG.filter((w) => w.category === cat.id).length;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-3 py-1 font-medium transition-colors whitespace-nowrap text-[11px] ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Widget Grid Catalog List */}
          <div
            className="flex-1 overflow-y-auto p-6 max-h-[56vh] grid grid-cols-1 md:grid-cols-2 gap-3.5"
            data-testid="widget-catalog-grid"
          >
            {filteredWidgets.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm font-medium">No matching widgets found</p>
                <p className="text-xs mt-1 text-muted-foreground/80">
                  Try adjusting your search query or switching categories.
                </p>
              </div>
            ) : (
              filteredWidgets.map((widget) => {
                const IconComponent = ICON_MAP[widget.icon] || BarChart3;
                const dims = widget.defaultDimensions;
                const isRecentlyAdded = recentlyAddedId === widget.id;

                return (
                  <div
                    key={widget.id}
                    className="flex flex-col justify-between rounded-lg border border-border/80 bg-card p-4 shadow-sm hover:border-primary/50 transition-all hover:shadow"
                    data-testid={`widget-catalog-item-${widget.id}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground">
                              {widget.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground capitalize">
                                {widget.category}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {dims.w}x{dims.h} cols
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {widget.description}
                      </p>
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1 overflow-hidden max-w-[200px]">
                        {widget.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] text-muted-foreground/70 bg-muted/40 rounded px-1 py-0.2 truncate"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddWidget(widget)}
                        disabled={isRecentlyAdded}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm transition-all ${
                          isRecentlyAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                        data-testid={`add-widget-btn-${widget.id}`}
                      >
                        {isRecentlyAdded ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Add to Tab</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border/70 px-6 py-3 bg-muted/15 text-xs text-muted-foreground">
            <span>Showing {filteredWidgets.length} of {WIDGET_CATALOG.length} institutional widgets</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
