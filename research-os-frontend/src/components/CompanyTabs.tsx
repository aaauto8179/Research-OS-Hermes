'use client';

import { useState, useCallback, useMemo } from 'react';
import { useWorkspaceStore, TabConfig, WidgetConfig, DEFAULT_COMPANY_TABS, DEFAULT_WIDGET_TYPES } from '@/lib/workspace-store';
import { Plus, Trash2, Edit2, GripVertical, X, ChevronDown, Settings, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardCanvas } from '@/components/DashboardCanvas';

interface CompanyTabsProps {
  symbol: string;
  onTabChange?: (tabId: string) => void;
}

export function CompanyTabs({ symbol, onTabChange }: CompanyTabsProps) {
  const tabs = useWorkspaceStore((state) => state.companyTabs[symbol] ?? []);
  const widgets = useWorkspaceStore((state) => state.companyWidgets[symbol] ?? []);
  const availableTypes = useWorkspaceStore((state) => 
    state.availableWidgetTypes.filter(w => w.contexts.includes('company'))
  );
  
  const addTab = useWorkspaceStore((state) => state.addTab);
  const removeTab = useWorkspaceStore((state) => state.removeTab);
  const renameTab = useWorkspaceStore((state) => state.renameTab);
  const reorderTabs = useWorkspaceStore((state) => state.reorderTabs);
  const addWidget = useWorkspaceStore((state) => state.addWidget);
  const removeWidget = useWorkspaceStore((state) => state.removeWidget);
  
  const [activeTabId, setActiveTabId] = useState<string>(() => {
    // Initialize from localStorage or first tab
    const saved = localStorage.getItem(`company-${symbol}-active-tab`);
    if (saved) return saved;
    return tabs[0]?.id || '';
  });
  
  const [showAddTab, setShowAddTab] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [widgetToAdd, setWidgetToAdd] = useState<string>('');
  
  // Initialize tabs if empty
  useMemo(() => {
    if (tabs.length === 0) {
      // Initialize with default tabs
      DEFAULT_COMPANY_TABS.forEach((tab, index) => {
        const id = `tab-${tab.label.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // We can't call addTab here due to React rules, so we'll handle initialization differently
      });
    }
  }, [tabs.length]);
  
  // Initialize default tabs if none exist
  const initializedTabs = useMemo(() => {
    if (tabs.length === 0) {
      return DEFAULT_COMPANY_TABS.map((tab, index) => ({
        ...tab,
        id: `tab-${tab.label.toLowerCase()}-${symbol}`,
        order: index,
      }));
    }
    return tabs;
  }, [tabs, symbol]);
  
  const activeTab = useMemo(() => 
    initializedTabs.find(t => t.id === activeTabId) || initializedTabs[0]
  , [initializedTabs, activeTabId]);
  
  const tabWidgets = useMemo(() => 
    widgets.filter(w => activeTab?.widgetIds.includes(w.id))
  , [widgets, activeTab]);
  
  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    localStorage.setItem(`company-${symbol}-active-tab`, tabId);
    onTabChange?.(tabId);
  };
  
  const handleAddTab = () => {
    setShowAddTab(true);
  };
  
  const handleConfirmAddTab = (label: string) => {
    addTab(symbol, { label, widgetIds: [], isCustom: true });
    setShowAddTab(false);
  };
  
  const handleRenameTab = (tabId: string) => {
    const tab = initializedTabs.find(t => t.id === tabId);
    if (tab) {
      setEditingTabId(tabId);
      setEditLabel(tab.label);
    }
  };
  
  const handleSaveRename = (tabId: string) => {
    if (editLabel.trim()) {
      renameTab(symbol, tabId, editLabel.trim());
      setEditingTabId(null);
      setEditLabel('');
    }
  };
  
  const handleDeleteTab = (tabId: string) => {
    if (initializedTabs.length <= 1) {
      alert('Cannot delete the last tab');
      return;
    }
    if (confirm('Delete this tab and all its widgets?')) {
      removeTab(symbol, tabId);
      // Switch to first tab
      const remainingTabs = initializedTabs.filter(t => t.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
      }
    }
  };
  
  const handleReorderTabs = (newTabIds: string[]) => {
    reorderTabs(symbol, newTabIds);
  };
  
  const handleAddWidgetToTab = (type: string) => {
    const widgetType = DEFAULT_WIDGET_TYPES.find(w => w.type === widgetToAdd);
    if (!widgetType) return;
    
    addWidget('company', symbol, {
      type: widgetType.type,
      title: widgetType.label,
      props: { ...widgetType.defaultProps },
      gridProps: { x: 0, y: 0, w: widgetType.defaultSize.w, h: widgetType.defaultSize.h },
    });
    
    // Add widget to active tab
    const activeTabIndex = initializedTabs.findIndex(t => t.id === activeTabId);
    if (activeTabIndex >= 0) {
      // We need to update the tab's widgetIds - this would need a new action in the store
    }
    setWidgetToAdd('');
    setShowAddWidget(false);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b px-3 py-2 bg-muted/30">
        {/* Tab List with Drag & Drop */}
        <div className="flex items-center gap-1 flex-1 overflow-x-auto pb-1">
          {initializedTabs.map((tab, index) => (
            <TabItem
              key={tab.id}
              tab={tab}
              index={index}
              isActive={tab.id === activeTabId}
              isEditing={editingTabId === tab.id}
              editLabel={editLabel}
              onClick={() => handleTabClick(tab.id)}
              onEditClick={() => handleRenameTab(tab.id)}
              onSaveEdit={() => handleSaveRename(tab.id)}
              onCancelEdit={() => { setEditingTabId(null); setEditLabel(''); }}
              onDeleteClick={() => handleDeleteTab(tab.id)}
              onDragStart={(e) => e.dataTransfer.setData('tabId', tab.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('tabId');
                if (draggedId && draggedId !== tab.id) {
                  const newOrder = initializedTabs.map(t => t.id);
                  const fromIndex = newOrder.indexOf(draggedId);
                  const toIndex = newOrder.indexOf(tab.id);
                  if (fromIndex !== -1 && toIndex !== -1) {
                    const newOrder2 = [...newOrder];
                    newOrder2.splice(fromIndex, 1);
                    newOrder2.splice(toIndex, 0, draggedId);
                    reorderTabs(symbol, newOrder2);
                  }
                }
                }}
            />
          ))}
          
          {/* Add Tab Button */}
          <button
            onClick={handleAddTab}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Add new tab"
          >
            <Plus className="h-4 w-4" />
            <span>New Tab</span>
          </button>
        </div>
        
        {/* Tab Actions */}
        <div className="flex items-center gap-1 ml-2">
          <button
            className="p-2 rounded hover:bg-muted transition-colors"
            title="Save workspace"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            className="p-2 rounded hover:bg-muted transition-colors"
            title="Reset to defaults"
            onClick={() => {
              if (confirm('Reset all tabs and widgets to defaults?')) {
                localStorage.removeItem(`company-${symbol}-active-tab`);
                // Would need a reset action in store
              }
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab && (
          <DashboardCanvas 
            context="company" 
            contextKey={symbol} 
            className="h-full"
          />
        )}
        {!activeTab && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <div className="text-6xl">📁</div>
              <h3 className="text-xl font-medium">No tabs yet</h3>
              <p>Add tabs to organize your company analysis</p>
              <button onClick={handleAddTab} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" /> Add First Tab
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Tab Modal */}
      {showAddTab && (
        <AddTabModal
          isOpen={showAddTab}
          onClose={() => setShowAddTab(false)}
          onConfirm={handleConfirmAddTab}
        />
      )}
    </div>
  );
}

function TabItem({
  tab,
  index,
  isActive,
  isEditing,
  editLabel,
  onClick,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  onDeleteClick,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  tab: any;
  index: number;
  isActive: boolean;
  isEditing: boolean;
  editLabel: string;
  onClick: () => void;
  onEditClick: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const [localEditLabel, setLocalEditLabel] = useState(editLabel);
  
  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1">
        <input
          type="text"
          value={localEditLabel}
          onChange={(e) => setLocalEditLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit();
            if (e.key === 'Escape') onCancelEdit();
          }}
          onBlur={onCancelEdit}
          autoFocus
          className="px-2 py-1 text-sm border rounded bg-background focus:outline-none focus:ring-2 focus:ring-primary w-32"
        />
        <button onClick={onSaveEdit} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Save">
          ✓
        </button>
        <button onClick={onCancelEdit} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Cancel">
          ×
        </button>
      </div>
    );
  }
  
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all',
        'cursor-pointer select-none',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        'relative'
      )}
      style={{ 
        minWidth: '100px',
        maxWidth: '200px',
        userSelect: 'none'
      }}
    >
      <span className="truncate flex-1">{tab.label}</span>
      {!tab.isCustom && <span className="text-xs opacity-60">●</span>}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEditClick(); }}
          className="p-1 rounded hover:bg-muted/50 transition-colors"
          title="Rename"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        {tab.isCustom && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function AddTabModal({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: (label: string) => void }) {
  const [label, setLabel] = useState('');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Add New Tab</h3>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Tab name (e.g., My Custom View)"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && label.trim()) {
              onConfirm(label.trim());
              setLabel('');
            }
            if (e.key === 'Escape') onClose();
          }}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={() => { if (label.trim()) { onConfirm(label.trim()); onClose(); setLabel(''); }} }
            className="btn-primary"
            disabled={!label.trim()}
          >
            Add Tab
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompanyDeepDive({ symbol }: { symbol: string }) {
  return (
    <div className="h-full flex flex-col">
      <CompanyTabs symbol={symbol} />
    </div>
  );
}