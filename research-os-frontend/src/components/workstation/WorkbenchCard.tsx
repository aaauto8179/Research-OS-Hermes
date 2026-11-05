"use client";

import React, { useState } from "react";
import { GripVertical, X, FileEdit, PanelRightClose, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCardWorkbench } from "@/hooks/useCardWorkbench";
import { CardNotesEditor } from "@/components/workstation/CardNotesEditor";
import { CardAttachmentDropzone } from "@/components/workstation/CardAttachmentDropzone";
import { WorkbenchSlideOver } from "@/components/workstation/WorkbenchSlideOver";
import { cn } from "@/lib/utils";

export interface WorkbenchCardProps {
  cardId: string;
  symbol: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  category?: string;
  onRemove?: () => void;
  className?: string;
}

export function WorkbenchCard({
  cardId,
  symbol,
  title,
  description,
  children,
  category,
  onRemove,
  className,
}: WorkbenchCardProps) {
  const [view, setView] = useState<"widget" | "notes" | "attachments">("widget");
  const [isSlideOverOpen, setIsSlideOverOpen] = useState<boolean>(false);

  // Hook to track qualitative notes & attachment count for badges
  const { activeNote, notes, attachments } = useCardWorkbench(cardId, symbol);

  const hasNoteContent = Boolean(
    (activeNote?.content && activeNote.content.trim().length > 0) ||
      notes.some((n) => n.content && n.content.trim().length > 0)
  );
  const attachmentCount = attachments.length;

  return (
    <div
      data-testid="workbench-card"
      data-card-id={cardId}
      className={cn(
        "flex flex-col h-full border border-border rounded-lg bg-card text-card-foreground shadow-sm overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Universal Header */}
      <div className="flex items-center justify-between border-b border-border/80 px-2.5 py-1.5 bg-muted/30 gap-2 select-none shrink-0">
        {/* Left side: Drag Handle & Title */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Drag handle for react-grid-layout / dnd-kit */}
          <div
            className="card-drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/60 transition-colors shrink-0"
            title="Drag to rearrange widget"
            aria-label="Drag handle"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className="font-semibold text-xs text-foreground truncate"
              title={description ? `${title} — ${description}` : title}
            >
              {title}
            </h3>

            {category && (
              <Badge
                variant="outline"
                className="text-[9px] uppercase px-1.5 py-0 font-mono tracking-wider text-muted-foreground shrink-0 hidden sm:inline-flex"
              >
                {category}
              </Badge>
            )}

            {description && (
              <span
                className="text-muted-foreground/60 hover:text-muted-foreground cursor-help shrink-0"
                title={description}
              >
                <HelpCircle className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>

        {/* Center: In-Card View Switcher */}
        <div
          className="flex items-center bg-muted/80 p-0.5 rounded-md border border-border/50 shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setView("widget")}
            className={cn(
              "px-2 py-0.5 text-[11px] font-medium rounded transition-colors",
              view === "widget"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Show primary widget"
          >
            Widget
          </button>

          <button
            type="button"
            onClick={() => setView("notes")}
            className={cn(
              "px-2 py-0.5 text-[11px] font-medium rounded transition-colors flex items-center gap-1",
              view === "notes"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Show qualitative notes"
          >
            <span>Notes</span>
            {hasNoteContent && (
              <span
                data-testid="notes-indicator-dot"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                title="Notes exist for this card"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setView("attachments")}
            className={cn(
              "px-2 py-0.5 text-[11px] font-medium rounded transition-colors flex items-center gap-1",
              view === "attachments"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Show card attachments"
          >
            <span>Files</span>
            {attachmentCount > 0 && (
              <span
                data-testid="attachments-count-badge"
                className="inline-flex items-center justify-center px-1 py-0 text-[9px] font-bold rounded-full bg-primary/20 text-primary"
              >
                {attachmentCount}
              </span>
            )}
          </button>
        </div>

        {/* Right side: Action icons */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Slide-Over Drawer Trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-primary rounded"
            onClick={() => setIsSlideOverOpen(true)}
            title="Open side-by-side workbench drawer (Radix Dialog)"
            aria-label="Open slide-over drawer"
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </Button>

          {/* Remove Widget */}
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive rounded"
              onClick={onRemove}
              title="Remove widget from layout"
              aria-label="Remove widget"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 min-h-0 overflow-auto">
        {view === "widget" && <div className="h-full w-full">{children}</div>}
        {view === "notes" && (
          <CardNotesEditor
            cardId={cardId}
            symbol={symbol}
            className="h-full border-none rounded-none"
          />
        )}
        {view === "attachments" && (
          <CardAttachmentDropzone
            cardId={cardId}
            symbol={symbol}
            className="h-full border-none rounded-none"
          />
        )}
      </div>

      {/* Concurrent Slide-Over Drawer for Side-by-Side Analysis */}
      <WorkbenchSlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        cardId={cardId}
        symbol={symbol}
        cardTitle={title}
        category={category}
        initialTab={view === "attachments" ? "attachments" : "notes"}
      />
    </div>
  );
}
