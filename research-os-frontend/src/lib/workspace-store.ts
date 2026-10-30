import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  props: Record<string, any>;
  gridProps: {
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
  };
}

export interface TabConfig {
  id: string;
  label: string;
  widgetIds: string[];
  isCustom: boolean;
  order: number;
}

export interface WorkspaceState {
  // Industry Dashboard
  industryWidgets: Record<string, WidgetConfig[]>; // keyed by industryCode
  industryLayout: Record<string, ReturnType<typeof import('react-grid-layout').default>>; // keyed by industryCode
  
  // Company Deep Dive
  companyTabs: Record<string, TabConfig[]>; // keyed by symbol
  companyWidgets: Record<string, WidgetConfig[]>; // keyed by symbol
  
  // Global
  availableWidgetTypes: WidgetType[];
  
  // Actions
  addWidget: (context: 'industry' | 'company', contextKey: string, widget: Omit<WidgetConfig, 'id'>) => void;
  removeWidget: (context: 'industry' | 'company', contextKey: string, widgetId: string) => void;
  updateWidget: (context: 'industry' | 'company', contextKey: string, widgetId: string, updates: Partial<WidgetConfig>) => void;
  moveWidget: (context: 'industry' | 'company', contextKey: string, widgetId: string, newPosition: { x: number; y: number }) => void;
  resizeWidget: (context: 'industry' | 'company', contextKey: string, widgetId: string, newSize: { w: number; h: number }) => void;
  
  // Tab actions
  addTab: (symbol: string, tab: Omit<TabConfig, 'id' | 'order'>) => void;
  removeTab: (symbol: string, tabId: string) => void;
  renameTab: (symbol: string, tabId: string, newLabel: string) => void;
  reorderTabs: (symbol: string, tabIds: string[]) => void;
  setActiveTab: (symbol: string, tabId: string) => void;
  
  // Layout persistence
  saveLayout: (context: 'industry' | 'company', contextKey: string, layout: any) => void;
  loadLayout: (context: 'industry' | 'company', contextKey: string) => any;
  
  // Reset
  resetWorkspace: (context: 'industry' | 'company', contextKey: string) => void;
}

export interface WidgetType {
  type: string;
  label: string;
  description: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultSize: { w: number; h: number; minW?: number; minH?: number };
  category: 'data' | 'chart' | 'analysis' | 'utility';
  contexts: ('industry' | 'company')[];
}

// Default widget types
export const DEFAULT_WIDGET_TYPES: WidgetType[] = [
  // Industry widgets
  {
    type: 'industry-overview',
    label: 'Industry Overview',
    description: 'Key metrics snapshot for the industry',
    icon: 'LayoutDashboard',
    defaultProps: {},
    defaultSize: { w: 12, h: 4 },
    category: 'data',
    contexts: ['industry'],
  },
  {
    type: 'sector-heatmap',
    label: 'Sector Heatmap',
    description: 'Visual heatmap of company metrics across the sector',
    icon: 'BarChart2',
    defaultProps: { metric: 'revenue_growth' },
    defaultSize: { w: 12, h: 6 },
    category: 'chart',
    contexts: ['industry'],
  },
  {
    type: 'peer-comparison-table',
    label: 'Peer Comparison Table',
    description: 'Sortable table comparing all companies in the sector',
    icon: 'Table',
    defaultProps: { metrics: ['revenue_growth', 'ebitda_margin', 'roe'] },
    defaultSize: { w: 12, h: 8 },
    category: 'data',
    contexts: ['industry'],
  },
  {
    type: 'value-chain-mapper',
    label: 'Value Chain Mapper',
    description: 'Interactive value chain visualization with margin pools',
    icon: 'GitBranch',
    defaultProps: {},
    defaultSize: { w: 12, h: 8 },
    category: 'analysis',
    contexts: ['industry'],
  },
  {
    type: 'margin-bridge',
    label: 'Margin Bridge',
    description: 'Waterfall chart showing margin drivers',
    icon: 'BarChart2',
    defaultProps: {},
    defaultSize: { w: 6, h: 6 },
    category: 'chart',
    contexts: ['industry'],
  },
  {
    type: 'demand-drivers',
    label: 'Demand Drivers',
    description: 'Key demand drivers with impact percentages',
    icon: 'TrendingUp',
    defaultProps: {},
    defaultSize: { w: 6, h: 6 },
    category: 'analysis',
    contexts: ['industry'],
  },
  {
    type: 'news-feed',
    label: 'Industry News Feed',
    description: 'Latest news and announcements for the sector',
    icon: 'Newspaper',
    defaultProps: { limit: 10 },
    defaultSize: { w: 6, h: 8 },
    category: 'utility',
    contexts: ['industry'],
  },
  
  // Company widgets
  {
    type: 'kpi-cards',
    label: 'KPI Cards',
    description: 'Key performance indicators at a glance',
    icon: 'Target',
    defaultProps: { metrics: ['pe', 'ev_ebitda', 'roe', 'roce', 'fcf_yield', 'debt_equity'] },
    defaultSize: { w: 12, h: 3 },
    category: 'data',
    contexts: ['company'],
  },
  {
    type: 'financial-charts',
    label: 'Financial Charts',
    description: 'Revenue, EBITDA, PAT trends over time',
    icon: 'LineChart',
    defaultProps: { period: 'annual', years: 10 },
    defaultSize: { w: 12, h: 6 },
    category: 'chart',
    contexts: ['company'],
  },
  {
    type: 'valuation-summary',
    label: 'Valuation Summary',
    description: 'DCF, Relative, SOTP, Excess Return models summary',
    icon: 'Calculator',
    defaultProps: { models: ['dcf', 'relative', 'sotp', 'banking', 'excess_return'] },
    defaultSize: { w: 12, h: 5 },
    category: 'analysis',
    contexts: ['company'],
  },
  {
    type: 'risk-assessment',
    label: 'Risk Assessment',
    description: 'Forensic scores (Beneish, Altman, Piotroski) and risk matrix',
    icon: 'AlertTriangle',
    defaultProps: {},
    defaultSize: { w: 6, h: 6 },
    category: 'analysis',
    contexts: ['company'],
  },
  {
    type: 'ownership-analysis',
    label: 'Ownership Analysis',
    description: 'Promoter, FII, DII, retail holdings with trends',
    icon: 'Users',
    defaultProps: { quarters: 8 },
    defaultSize: { w: 6, h: 6 },
    category: 'data',
    contexts: ['company'],
  },
  {
    type: 'catalyst-tracker',
    label: 'Catalyst Tracker',
    description: 'Upcoming events, earnings, dividends, corporate actions',
    icon: 'Calendar',
    defaultProps: { horizon: 90 },
    defaultSize: { w: 6, h: 5 },
    category: 'utility',
    contexts: ['company'],
  },
  {
    type: 'document-viewer',
    label: 'Document Viewer',
    description: 'Annual reports, concall transcripts, presentations',
    icon: 'FileText',
    defaultProps: { docTypes: ['annual', 'concall', 'presentation'] },
    defaultSize: { w: 12, h: 8 },
    category: 'utility',
    contexts: ['company'],
  },
  {
    type: 'peer-comparison',
    label: 'Peer Comparison',
    description: 'Side-by-side comparison with selected peers',
    icon: 'GitCompare',
    defaultProps: { peers: [], metrics: ['pe', 'ev_ebitda', 'roe', 'fcf_yield'] },
    defaultSize: { w: 12, h: 6 },
    category: 'analysis',
    contexts: ['company'],
  },
  {
    type: 'technical-analysis',
    label: 'Technical Analysis',
    description: 'Price charts, moving averages, RSI, MACD',
    icon: 'LineChart',
    defaultProps: { indicators: ['sma_50', 'sma_200', 'rsi', 'macd'] },
    defaultSize: { w: 12, h: 6 },
    category: 'chart',
    contexts: ['company'],
  },
  {
    type: 'checklist',
    label: 'Investment Checklist',
    description: 'Behavioral audit and investment decision checklist',
    icon: 'CheckSquare',
    defaultProps: { template: 'behavioral_audit' },
    defaultSize: { w: 6, h: 8 },
    category: 'analysis',
    contexts: ['company'],
  },
  {
    type: 'custom-text',
    label: 'Custom Notes',
    description: 'Free-form text notes and annotations',
    icon: 'Edit3',
    defaultProps: { content: '' },
    defaultSize: { w: 6, h: 4 },
    category: 'utility',
    contexts: ['company', 'industry'],
  },
];

// Default company tab templates
export const DEFAULT_COMPANY_TABS: Omit<TabConfig, 'id' | 'order'>[] = [
  { label: 'Overview & Decision', widgetIds: [], isCustom: false },
  { label: 'Story & Moats', widgetIds: [], isCustom: false },
  { label: 'Management & Concall', widgetIds: [], isCustom: false },
  { label: 'Governance & Forensics', widgetIds: [], isCustom: false },
  { label: 'Financial Statements', widgetIds: [], isCustom: false },
  { label: 'Valuation Suite', widgetIds: [], isCustom: false },
  { label: 'Risk Scoring', widgetIds: [], isCustom: false },
  { label: 'SME Forensics', widgetIds: [], isCustom: false },
  { label: 'Working Capital & Concentration', widgetIds: [], isCustom: false },
  { label: 'Downsides & Exit Triggers', widgetIds: [], isCustom: false },
];

// Default industry dashboard layout
export const DEFAULT_INDUSTRY_LAYOUT = [
  { id: 'industry-overview-1', type: 'industry-overview', title: 'Overview', x: 0, y: 0, w: 12, h: 4 },
  { id: 'sector-heatmap-1', type: 'sector-heatmap', title: 'Sector Heatmap', x: 0, y: 4, w: 12, h: 6 },
  { id: 'peer-comparison-table-1', type: 'peer-comparison-table', title: 'Peer Comparison', x: 0, y: 10, w: 12, h: 8 },
];

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set, get) => ({
      industryWidgets: {},
      industryLayout: {},
      companyTabs: {},
      companyWidgets: {},
      availableWidgetTypes: DEFAULT_WIDGET_TYPES,
      
      addWidget: (context, contextKey, widget) => {
        const id = `${widget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newWidget: WidgetConfig = {
          ...widget,
          id,
          gridProps: {
            x: widget.gridProps?.x ?? 0,
            y: widget.gridProps?.y ?? 0,
            w: widget.gridProps?.w ?? 6,
            h: widget.gridProps?.h ?? 4,
            minW: widget.gridProps?.minW ?? 2,
            minH: widget.gridProps?.minH ?? 2,
            maxW: widget.gridProps?.maxW ?? 12,
            maxH: widget.gridProps?.maxH ?? 20,
          },
        };
        
        if (context === 'industry') {
          set((state) => {
            if (!state.industryWidgets[contextKey]) state.industryWidgets[contextKey] = [];
            state.industryWidgets[contextKey].push(newWidget);
          });
        } else {
          set((state) => {
            if (!state.companyWidgets[contextKey]) state.companyWidgets[contextKey] = [];
            state.companyWidgets[contextKey].push(newWidget);
          });
        }
      },
      
      removeWidget: (context, contextKey, widgetId) => {
        if (context === 'industry') {
          set((state) => {
            if (state.industryWidgets[contextKey]) {
              state.industryWidgets[contextKey] = state.industryWidgets[contextKey].filter(w => w.id !== widgetId);
            }
          });
        } else {
          set((state) => {
            if (state.companyWidgets[contextKey]) {
              state.companyWidgets[contextKey] = state.companyWidgets[contextKey].filter(w => w.id !== widgetId);
            }
          });
        }
      },
      
      updateWidget: (context, contextKey, widgetId, updates) => {
        const widgets = context === 'industry' 
          ? get().industryWidgets[contextKey] 
          : get().companyWidgets[contextKey];
        
        if (widgets) {
          const widget = widgets.find(w => w.id === widgetId);
          if (widget) {
            Object.assign(widget, updates);
          }
        }
      },
      
      moveWidget: (context, contextKey, widgetId, newPosition) => {
        const widgets = context === 'industry' 
          ? get().industryWidgets[contextKey] 
          : get().companyWidgets[contextKey];
        
        if (widgets) {
          const widget = widgets.find(w => w.id === widgetId);
          if (widget) {
            widget.gridProps.x = newPosition.x;
            widget.gridProps.y = newPosition.y;
          }
        }
      },
      
      resizeWidget: (context, contextKey, widgetId, newSize) => {
        const widgets = context === 'industry' 
          ? get().industryWidgets[contextKey] 
          : get().companyWidgets[contextKey];
        
        if (widgets) {
          const widget = widgets.find(w => w.id === widgetId);
          if (widget) {
            widget.gridProps.w = newSize.w;
            widget.gridProps.h = newSize.h;
          }
        }
      },
      
      addTab: (symbol, tab) => {
        const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const order = (get().companyTabs[symbol]?.length ?? 0);
        
        set((state) => {
          if (!state.companyTabs[symbol]) state.companyTabs[symbol] = [];
          state.companyTabs[symbol].push({ ...tab, id, order, isCustom: true });
        });
      },
      
      removeTab: (symbol, tabId) => {
        set((state) => {
          if (state.companyTabs[symbol]) {
            state.companyTabs[symbol] = state.companyTabs[symbol].filter(t => t.id !== tabId);
          }
        });
      },
      
      renameTab: (symbol, tabId, newLabel) => {
        const tabs = get().companyTabs[symbol];
        if (tabs) {
          const tab = tabs.find(t => t.id === tabId);
          if (tab) tab.label = newLabel;
        }
      },
      
      reorderTabs: (symbol, tabIds) => {
        set((state) => {
          if (state.companyTabs[symbol]) {
            const tabMap = new Map(state.companyTabs[symbol].map(t => [t.id, t]));
            state.companyTabs[symbol] = tabIds.map((id, index) => ({
              ...tabMap.get(id)!,
              order: index,
            }));
          }
        });
      },
      
      setActiveTab: (symbol, tabId) => {
        // Handled by local component state
      },
      
      saveLayout: (context, contextKey, layout) => {
        if (context === 'industry') {
          set((state) => {
            state.industryLayout[contextKey] = layout;
          });
        }
      },
      
      loadLayout: (context, contextKey) => {
        if (context === 'industry') {
          return get().industryLayout[contextKey];
        }
        return null;
      },
      
      resetWorkspace: (context, contextKey) => {
        set((state) => {
          if (context === 'industry') {
            delete state.industryWidgets[contextKey];
            delete state.industryLayout[contextKey];
          } else {
            delete state.companyWidgets[contextKey];
            delete state.companyTabs[contextKey];
          }
        });
      },
    })),
    {
      name: 'research-os-workspace',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        industryWidgets: state.industryWidgets,
        industryLayout: state.industryLayout,
        companyTabs: state.companyTabs,
        companyWidgets: state.companyWidgets,
      }),
    }
  )
);

// Selector hooks
export const useIndustryWidgets = (industryCode: string) => 
  useWorkspaceStore((state) => state.industryWidgets[industryCode] ?? []);

export const useCompanyWidgets = (symbol: string) => 
  useWorkspaceStore((state) => state.companyWidgets[symbol] ?? []);

export const useCompanyTabs = (symbol: string) => 
  useWorkspaceStore((state) => state.companyTabs[symbol] ?? []);

export const useIndustryLayout = (industryCode: string) => 
  useWorkspaceStore((state) => state.industryLayout[industryCode] ?? []);

export const useAvailableWidgetTypes = (context: 'industry' | 'company') => 
  useWorkspaceStore((state) => state.availableWidgetTypes.filter(w => w.contexts.includes(context)));