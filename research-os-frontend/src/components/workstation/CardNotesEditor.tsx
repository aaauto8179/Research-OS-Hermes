"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCardWorkbench, CardNote } from "@/hooks/useCardWorkbench";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Tag,
  Plus,
  X,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardNotesEditorProps {
  cardId: string;
  symbol: string;
  className?: string;
  showHeader?: boolean;
  onClose?: () => void;
}

const PRESET_TAGS = [
  "Bull Thesis",
  "Bear Thesis",
  "Accounting Risk",
  "Guidance",
  "Valuation",
  "Catalyst",
];

export function CardNotesEditor({
  cardId,
  symbol,
  className,
  showHeader = true,
  onClose,
}: CardNotesEditorProps) {
  const {
    activeNote,
    isSaving,
    lastSaved,
    saveNote,
    isLoading,
  } = useCardWorkbench(cardId, symbol);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [showTagInput, setShowTagInput] = useState<boolean>(false);

  // Sync internal state with activeNote from hook
  const activeNoteIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (activeNote) {
      // Only overwrite local state if the active note ID changed or on initial load
      if (activeNote.id !== activeNoteIdRef.current) {
        setTitle(activeNote.title || "");
        setContent(activeNote.content || "");
        setTags(activeNote.tags || []);
        activeNoteIdRef.current = activeNote.id;
      }
    } else {
      activeNoteIdRef.current = undefined;
    }
  }, [activeNote]);

  // Handle changes and trigger debounced auto-save
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveNote(content, newTitle, tags);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    saveNote(newContent, title, tags);
  };

  const handleToggleTag = (tag: string) => {
    let nextTags: string[];
    if (tags.includes(tag)) {
      nextTags = tags.filter((t) => t !== tag);
    } else {
      nextTags = [...tags, tag];
    }
    setTags(nextTags);
    saveNote(content, title, nextTags);
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const nextTags = [...tags, trimmed];
      setTags(nextTags);
      saveNote(content, title, nextTags);
      setCustomTagInput("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    saveNote(content, title, nextTags);
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div
      data-testid="card-notes-editor"
      className={cn("flex flex-col h-full bg-background/50 rounded-md p-3 space-y-3", className)}
    >
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>Research Notes • {symbol}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto-save Status Indicator */}
            <div className="flex items-center text-xs">
              {isSaving ? (
                <span className="flex items-center text-amber-500 font-medium animate-pulse">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Saving to DB...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Saved to DB ({formatLastSaved(lastSaved)})
                </span>
              ) : (
                <span className="flex items-center text-muted-foreground text-[11px]">
                  <Clock className="h-3 w-3 mr-1" />
                  Ready
                </span>
              )}
            </div>

            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={onClose}
                title="Close Notes"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Note Title Input */}
      <div>
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title (e.g. Q3 Margin Drivers, Accounting Risk Assessment)..."
          className="h-8 text-sm font-semibold border-input/60 focus-visible:ring-1"
          aria-label="Note Title"
        />
      </div>

      {/* Tags Chips Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>Thesis & Risk Tags:</span>
          </div>
          {!showTagInput && (
            <button
              type="button"
              onClick={() => setShowTagInput(true)}
              className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
            >
              <Plus className="h-3 w-3" /> Add Custom
            </button>
          )}
        </div>

        {/* Selected / Preset Tag Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_TAGS.map((preset) => {
            const isSelected = tags.includes(preset);
            return (
              <Badge
                key={preset}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-[11px] transition-colors select-none py-0.5 px-2",
                  isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:border-foreground/50"
                )}
                onClick={() => handleToggleTag(preset)}
              >
                {preset}
                {isSelected && (
                  <X
                    className="ml-1 h-2.5 w-2.5 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(preset);
                    }}
                  />
                )}
              </Badge>
            );
          })}

          {/* Any custom tags not in presets */}
          {tags
            .filter((t) => !PRESET_TAGS.includes(t))
            .map((customTag) => (
              <Badge
                key={customTag}
                variant="secondary"
                className="text-[11px] py-0.5 px-2 bg-secondary/80 text-secondary-foreground"
              >
                {customTag}
                <X
                  className="ml-1 h-2.5 w-2.5 cursor-pointer hover:text-red-500"
                  onClick={() => handleRemoveTag(customTag)}
                />
              </Badge>
            ))}
        </div>

        {/* Custom Tag Input Popover / inline */}
        {showTagInput && (
          <div className="flex items-center gap-1.5 pt-1">
            <Input
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomTag();
                } else if (e.key === "Escape") {
                  setShowTagInput(false);
                }
              }}
              placeholder="Type tag and press Enter..."
              className="h-7 text-xs flex-1"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 px-2 text-xs"
              onClick={handleAddCustomTag}
            >
              Add
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={() => setShowTagInput(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Textarea for Notes Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Document key qualitative observations, management guidance notes, red flags, or thesis catalysts for this card..."
          className="flex-1 min-h-[140px] text-xs resize-none border-input/60 focus-visible:ring-1 leading-relaxed"
          aria-label="Notes Content"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-1.5">
        <div className="flex items-center gap-2">
          <span>{content.length} characters</span>
          <span>•</span>
          <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <Sparkles className="h-3 w-3 text-muted-foreground" />
          <span>Auto-syncs 500ms</span>
        </div>
      </div>
    </div>
  );
}
