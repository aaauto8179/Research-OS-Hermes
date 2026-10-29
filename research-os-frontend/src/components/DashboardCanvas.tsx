'use client';

import { useState, useCallback, useMemo } from 'react';
import { GridLayout, Responsive } from 'react-grid-layout';
import WidthProvider from 'react-grid-layout';
import { useWorkspaceStore, WidgetConfig, WidgetType, DEFAULT_WIDGET_TYPES } from '@/lib/workspace-store';
import { Plus, Trash2, GripVertical, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface WidgetRendererProps {
  widget: WidgetConfig;
  onRemove: () => void;
  onSettings: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
  onMinimize: () => void;
}

function WidgetRenderer({ widget, onRemove, onSettings, onMaximize, isMaximized, onMinimize }: WidgetRendererProps) {
  const widgetType = DEFAULT_WIDGET_TYPES.find(w => w.type === widget.type);
  
  return (
    <div className={cn(
      'bg-card border rounded-lg overflow-hidden transition-all duration-200',
      isMaximized && 'fixed inset-0 z-50 w-full h-full'
    )}>
      {/* Widget Header */}
      <div className={cn(
        'flex items-center justify-between p-3 border-b bg-muted/50',
        isMaximized && 'border-b-2 border-primary'
      )}>
        <div className="flex items-center gap-2">
          <GripVertical className="text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
          <h3 className="font-medium text-sm">{widget.title}</h3>
          {widgetType && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
              {widgetType.category}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSettings}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          {isMaximized ? (
            <button
              onClick={onMinimize}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onMaximize}
              className="p-1 rounded hover:bg-muted transition-colors"
              title="Maximize"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Widget Content */}
      <div className={cn(
        'p-4 h-[calc(100%-44px)] overflow-auto',
        isMaximized && 'h-[calc(100vh-60px)]'
      )}>
        <WidgetContent widget={widget} isMaximized={isMaximized} />
      </div>
    </div>
  );
}

function WidgetContent({ widget, isMaximized }: { widget: WidgetConfig; isMaximized: boolean }) {
  const widgetType = DEFAULT_WIDGET_TYPES.find(w => w.type === widget.type);
  
  // This is where the actual widget components would be rendered
  // For now, we show a placeholder with the widget type info
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-3">
          <div className="text-4xl">{widgetType?.icon || '📦'}</div>
          <h4 className="font-medium">{widget.title}</h4>
          <p className="text-sm max-w-md">{widgetType?.description || 'Widget content goes here'}</p>
          <div className="text-xs space-y-1">
            <p>Type: {widget.type}</p>
            <p>Category: {widgetType?.category || 'unknown'}</p>
            <p>Contexts: {widgetType?.contexts.join(', ') || 'none'}</p>
          </div>
          <div className="mt-4 p-3 bg-muted rounded text-xs text-left max-w-md">
            <p className="font-medium mb-2">Props:</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify(widget.props, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCanvasProps {
  context: 'industry' | 'company';
  contextKey: string;
  className?: string;
}

export function DashboardCanvas({ context, contextKey, className }: DashboardCanvasProps) {
  const widgets = context === 'industry' 
    ? useWorkspaceStore((state) => state.industryWidgets[contextKey] ?? [])
    : useWorkspaceStore((state) => state.companyWidgets[contextKey] ?? []);
  
  const layout = context === 'industry'
    ? useWorkspaceStore((state) => state.industryLayout[contextKey] ?? [])
    : [];
  
  const availableTypes = useWorkspaceStore((state) => 
    state.availableWidgetTypes.filter(w => w.contexts.includes(context))
  );
  
  const addWidget = useWorkspaceStore((state) => state.addWidget);
  const removeWidget = useWorkspaceStore((state) => state.removeWidget);
  const updateWidget = useWorkspaceStore((state) => state.updateWidget);
  const moveWidget = useWorkspaceStore((state) => state.moveWidget);
  const resizeWidget = useWorkspaceStore((state) => state.resizeWidget);
  const saveLayout = useWorkspaceStore((state) => state.saveLayout);
  
  const [maximizedWidget, setMaximizedWidget] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  
  // Convert widgets to react-grid-layout format
  const rglLayout = useMemo(() => 
    widgets.map(w => ({
      i: w.id,
      x: w.gridProps.x,
      y: w.gridProps.y,
      w: w.gridProps.w,
      h: w.gridProps.h,
      minW: w.gridProps.minW,
      minH: w.gridProps.minH,
      maxW: w.gridProps.maxW,
      maxH: w.gridProps.maxH,
      static: false,
    }))
  , [widgets]);
  
  const handleLayoutChange = useCallback((newLayout: any[]) => {
    if (context === 'industry') {
      saveLayout(contextKey, newLayout);
    }
    
    // Update widget positions in store
    newLayout.forEach(item => {
      const widget = widgets.find(w => w.id === item.i);
      if (widget && (widget.gridProps.x !== item.x || widget.gridProps.y !== item.y)) {
        moveWidget(context, contextKey, item.i, { x: item.x, y: item.y });
      }
    });
  }, [context, contextKey, widgets, saveLayout, moveWidget]);
  
  const handleResize = useCallback((layout: any[], oldItem: any, newItem: any) => {
    resizeWidget(context, contextKey, newItem.i, { w: newItem.w, h: newItem.h });
  }, [context, contextKey, resizeWidget]);
  
  const handleAddWidget = useCallback((type: string) => {
    const widgetType = DEFAULT_WIDGET_TYPES.find(w => w.type === type);
    if (!widgetType) return;
    
    // Find next available position
    const maxY = Math.max(...rglLayout.map(item => item.y + item.h), 0);
    
    addWidget(context, contextKey, {
      type: widgetType.type,
      title: widgetType.label,
      props: { ...widgetType.defaultProps },
      gridProps: {
        x: 0,
        y: maxY,
        w: widgetType.defaultSize.w,
        h: widgetType.defaultSize.h,
        minW: widgetType.defaultSize.minW,
        minH: widgetType.defaultSize.minH,
      },
    });
    setShowAddWidget(false);
  }, [context, contextKey, addWidget, rglLayout]);
  
  if (context === 'industry' && widgets.length === 0) {
    // Show empty state with add widget prompt
    return (
      <div className={cn('h-full flex flex-col', className)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Industry Dashboard</h2>
          <button
            onClick={() => setShowAddWidget(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Widget
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground space-y-4">
            <div className="text-6xl">📊</div>
            <h3 className="text-xl font-medium">No widgets yet</h3>
            <p>Add widgets to build your industry dashboard</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" /> Add First Widget
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn('h-full flex flex-col', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold capitalize">{context} Dashboard</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddWidget(true)}
            className="btn-secondary"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Widget
          </button>
        </div>
      </div>
      
      <ResponsiveGridLayout
        className="layout flex-1"
        layouts={{ lg: rglLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        compactType="vertical"
        onLayoutChange={handleLayoutChange}
        onResizeStop={handleResize}
        draggableHandle=".widget-header"
        preventCollision={false}
        useCSSTransforms={true}
      >
        {widgets.map(widget => (
          <div key={widget.id} data-grid={rglLayout.find(l => l.i === widget.id)}>
            <WidgetRenderer
              widget={widget}
              onRemove={() => removeWidget(context, contextKey, widget.id)}
              onSettings={() => alert('Settings for ' + widget.title)}
              onMaximize={() => setMaximizedWidget(widget.id)}
              isMaximized={maximizedWidget === widget.id}
              onMinimize={() => setMaximizedWidget(null)}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddWidget(false)}>
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Widget</h3>
              <button onClick={() => setShowAddWidget(false)} className="text-muted-foreground hover:text-foreground">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
              {availableTypes.map(widgetType => (
                <button
                  key={widgetType.type}
                  onClick={() => handleAddWidget(widgetType.type)}
                  className="p-4 border rounded-lg hover:border-primary hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{widgetType.icon}</div>
                    <div>
                      <h4 className="font-medium">{widgetType.label}</h4>
                      <p className="text-sm text-muted-foreground">{widgetType.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 rounded bg-muted">{widgetType.category}</span>
                    <span className="px-2 py-0.5 rounded bg-muted">{widgetType.defaultSize.w}×{widgetType.defaultSize.h}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Maximized Widget Modal */}
      {maximizedWidget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setMaximizedWidget(null)}>
          <div className="w-full h-full max-w-6xl max-h-[90vh] bg-background rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            {widgets.filter(w => w.id === maximizedWidget).map(widget => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                onRemove={() => { removeWidget(context, contextKey, widget.id); setMaximizedWidget(null); }}
                onSettings={() => alert('Settings for ' + widget.title)}
                onMaximize={() => {}}
                isMaximized={true}
                onMinimize={() => setMaximizedWidget(null)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

