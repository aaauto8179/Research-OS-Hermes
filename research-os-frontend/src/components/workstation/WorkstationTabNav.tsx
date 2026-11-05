"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useWorkstationStore,
  TabConfig,
} from "@/lib/workstation-store";
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  Info,
} from "lucide-react";

interface SortableTabItemProps {
  tab: TabConfig;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

function SortableTabItem({
  tab,
  isActive,
  canDelete,
  onSelect,
  onRename,
  onDelete,
}: SortableTabItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tab.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(tab.label);
  }, [tab.label]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== tab.label) {
      onRename(trimmed);
    } else {
      setEditValue(tab.label);
    }
    setIsEditing(false);
  };

  const cancelRename = () => {
    setEditValue(tab.label);
    setIsEditing(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap select-none border ${
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground hover:border-border"
      }`}
      data-testid={`workstation-tab-${tab.id}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing p-0.5 -ml-1 rounded opacity-40 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 ${
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        }`}
        title="Drag to reorder tab"
        data-testid={`tab-drag-handle-${tab.id}`}
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Tab Label or Inline Editor */}
      {isEditing ? (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") cancelRename();
            }}
            onBlur={commitRename}
            className="w-28 px-1.5 py-0.5 text-xs bg-background text-foreground border border-primary rounded outline-none shadow-inner"
            data-testid={`tab-rename-input-${tab.id}`}
          />
          <button
            type="button"
            onClick={commitRename}
            className="p-0.5 rounded hover:bg-black/20 text-emerald-400"
            title="Save title"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={cancelRename}
            className="p-0.5 rounded hover:bg-black/20 text-rose-400"
            title="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={onSelect}
          onDoubleClick={() => setIsEditing(true)}
          title="Click to switch, double-click to rename"
        >
          <span>{tab.label}</span>
          {tab.isCustom && (
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded ${
                isActive ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              Custom
            </span>
          )}
        </div>
      )}

      {/* Action Buttons: Rename & Delete */}
      {!isEditing && (
        <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Rename tab"
            data-testid={`tab-rename-btn-${tab.id}`}
          >
            <Edit2 className="w-2.5 h-2.5" />
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete tab "${tab.label}" and all its widget arrangements?`)) {
                  onDelete();
                }
              }}
              className={`p-0.5 rounded hover:bg-rose-500 hover:text-white ${
                isActive ? "text-primary-foreground" : "text-muted-foreground"
              }`}
              title="Delete tab"
              data-testid={`tab-delete-btn-${tab.id}`}
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface WorkstationTabNavProps {
  onAddWidgetClick?: () => void;
}

export function WorkstationTabNav({ onAddWidgetClick }: WorkstationTabNavProps) {
  const tabs = useWorkstationStore((s) => s.tabs);
  const activeTabId = useWorkstationStore((s) => s.activeTabId);
  const setTab = useWorkstationStore((s) => s.setTab);
  const addTab = useWorkstationStore((s) => s.addTab);
  const renameTab = useWorkstationStore((s) => s.renameTab);
  const removeTab = useWorkstationStore((s) => s.removeTab);
  const reorderTabs = useWorkstationStore((s) => s.reorderTabs);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex((t) => t.id === active.id);
      const newIndex = tabs.findIndex((t) => t.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(tabs, oldIndex, newIndex).map((t, idx) => ({
          ...t,
          order: idx,
        }));
        reorderTabs(reordered);
      }
    }
  };

  const handleCreateNewTab = () => {
    const defaultTitle = `Custom Thesis ${tabs.filter((t) => t.isCustom).length + 1}`;
    const newId = addTab(defaultTitle);
    setTab(newId);
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  return (
    <div
      className="flex items-center justify-between border-b border-border/70 pb-2.5 gap-3 overflow-x-auto"
      data-testid="workstation-tab-nav"
    >
      <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map((t) => t.id)}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => (
              <SortableTabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                canDelete={tabs.length > 1}
                onSelect={() => setTab(tab.id)}
                onRename={(newName) => renameTab(tab.id, newName)}
                onDelete={() => removeTab(tab.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add Tab Action */}
        <button
          type="button"
          onClick={handleCreateNewTab}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/60 transition-colors whitespace-nowrap bg-muted/20 hover:bg-muted/40"
          data-testid="workstation-add-tab-btn"
          title="Create a new custom research tab"
        >
          <Plus className="w-3 h-3" />
          <span>New Tab</span>
        </button>
      </div>

      {/* Active Tab Context & Quick Add Widget Trigger */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        {activeTab?.description && (
          <div className="flex items-center gap-1.5 max-w-[460px] truncate">
            <Info className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
            <span className="truncate">{activeTab.description}</span>
          </div>
        )}

        {onAddWidgetClick && (
          <button
            type="button"
            onClick={onAddWidgetClick}
            className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold transition-colors"
            title="Browse and add widgets to this tab"
          >
            <Plus className="w-3 h-3" />
            <span>Add Widget</span>
          </button>
        )}
      </div>
    </div>
  );
}
