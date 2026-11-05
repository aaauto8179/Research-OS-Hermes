"use client";

import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FileText, Paperclip, Shield, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardNotesEditor } from "@/components/workstation/CardNotesEditor";
import { CardAttachmentDropzone } from "@/components/workstation/CardAttachmentDropzone";
import { cn } from "@/lib/utils";

export interface WorkbenchSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  symbol: string;
  cardTitle: string;
  category?: string;
  initialTab?: "notes" | "attachments";
  portal?: boolean;
  modal?: boolean;
}

export function WorkbenchSlideOver({
  isOpen,
  onClose,
  cardId,
  symbol,
  cardTitle,
  category,
  initialTab = "notes",
  portal = true,
  modal,
}: WorkbenchSlideOverProps) {
  const [activeTab, setActiveTab] = useState<"notes" | "attachments">(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const effectiveModal = modal !== undefined ? modal : portal;

  const dialogContent = (
    <>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />
      <Dialog.Content
        data-testid="workbench-slide-over"
        className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl transition-transform animate-in slide-in-from-right duration-300 sm:max-w-lg focus:outline-none"
      >
        {/* Header */}
        <div className="flex flex-col border-b border-border bg-muted/20 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <Dialog.Title className="text-base font-semibold text-foreground tracking-tight line-clamp-1">
                  {cardTitle}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                  Workbench • {symbol.toUpperCase()}
                </Dialog.Description>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {category && (
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                  {category}
                </Badge>
              )}
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* Segmented Control inside Slide-Over */}
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-muted border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
                activeTab === "notes"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Qualitative Notes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("attachments")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all",
                activeTab === "attachments"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Paperclip className="h-3.5 w-3.5 text-primary" />
              <span>Supporting Files</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeTab === "notes" ? (
            <CardNotesEditor
              cardId={cardId}
              symbol={symbol}
              showHeader={false}
              className="h-full p-0 bg-transparent"
            />
          ) : (
            <CardAttachmentDropzone
              cardId={cardId}
              symbol={symbol}
              className="h-full p-0 bg-transparent"
            />
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border px-5 py-3 bg-muted/10 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            Persists to PostgreSQL across sessions
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </Dialog.Content>
    </>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()} modal={effectiveModal}>
      {portal ? <Dialog.Portal>{dialogContent}</Dialog.Portal> : dialogContent}
    </Dialog.Root>
  );
}
