export type WidgetCategory =
  | "data"
  | "scenarios"
  | "valuation"
  | "forensic"
  | "qualitative";

export interface GridDimensions {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface WorkstationWidgetDefinition {
  id: string; // Unique widget type identifier
  name: string; // Human-readable title
  description: string; // Summary description
  category: WidgetCategory;
  defaultDimensions: GridDimensions;
  icon: string; // Lucide icon identifier
  defaultProps?: Record<string, any>;
  tags: string[];
}

export const WIDGET_CATEGORIES: { id: WidgetCategory; label: string; description: string }[] = [
  {
    id: "data",
    label: "Data & Statements",
    description: "Historical multi-year financial statements, ratios, common-size, and peer matrices",
  },
  {
    id: "scenarios",
    label: "Scenarios & Projections",
    description: "Reactive simulation models, trajectory curves, margin bridges, and driver controls",
  },
  {
    id: "valuation",
    label: "Valuation Models",
    description: "DCF, Relative multiples, Reverse DCF, SOTP, Banking, and Excess Return models",
  },
  {
    id: "forensic",
    label: "Forensics & Governance",
    description: "Altman Z-Score, Beneish M-Score, Piotroski 9-point F-Score, and forensic red flags",
  },
  {
    id: "qualitative",
    label: "Qualitative & Research",
    description: "Dedicated investment thesis notes and centralized document attachment repository",
  },
];

export const WIDGET_CATALOG: WorkstationWidgetDefinition[] = [
  // ───────────────────────────────────────────────
  // 1. DATA & STATEMENTS (6 widgets)
  // ───────────────────────────────────────────────
  {
    id: "financial-statements-workstation",
    name: "Financial Statements Grid",
    description: "Multi-year historical P&L, Balance Sheet, and Cash Flow in INR Crores with interactive statutory citation drawer.",
    category: "data",
    defaultDimensions: { w: 12, h: 8, minW: 6, minH: 4 },
    icon: "Table",
    tags: ["financials", "p&l", "balance sheet", "cash flow", "inr crores", "citations"],
  },
  {
    id: "kpi-cards",
    name: "Executive KPI Overview",
    description: "High-level equity metrics: P/E, EV/EBITDA, ROE, ROCE, FCF Yield, and Debt-to-Equity ratios.",
    category: "data",
    defaultDimensions: { w: 12, h: 3, minW: 6, minH: 2 },
    icon: "BarChart3",
    tags: ["kpi", "overview", "multiples", "returns", "summary"],
  },
  {
    id: "financial-charts",
    name: "10-Year Financial Trends",
    description: "Historical multi-year graphical curves for Revenue, Operating EBITDA, and PAT progression.",
    category: "data",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "LineChart",
    tags: ["charts", "historical", "revenue", "ebitda", "pat", "trends"],
  },
  {
    id: "ratio-analysis",
    name: "Financial Ratio Analysis",
    description: "Multi-period DuPont decomposition (3-stage & 5-stage), liquidity, asset turnover, and solvency ratios.",
    category: "data",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "PieChart",
    tags: ["dupont", "ratios", "liquidity", "solvency", "efficiency"],
  },
  {
    id: "common-size",
    name: "Common-Size Statements",
    description: "Vertical percentage analysis normalizing income statement by Net Revenue and balance sheet by Total Assets.",
    category: "data",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "Percent",
    tags: ["common-size", "percentages", "margins", "vertical analysis"],
  },
  {
    id: "peer-comparison",
    name: "Peer Comparison Matrix",
    description: "Sector-wide peer benchmark benchmarking operating margins, multiples, growth, and leverage.",
    category: "data",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "Users",
    tags: ["peers", "benchmarks", "competitors", "industry", "comps"],
  },

  // ───────────────────────────────────────────────
  // 2. SCENARIOS & PROJECTIONS (6 widgets)
  // ───────────────────────────────────────────────
  {
    id: "scenario-workstation",
    name: "Scenario Workstation",
    description: "Full reactive 3-case scenario model (Base, Bull, Bear) with dynamic 5-year statement projections.",
    category: "scenarios",
    defaultDimensions: { w: 12, h: 8, minW: 6, minH: 4 },
    icon: "SlidersHorizontal",
    tags: ["scenarios", "base", "bull", "bear", "projections", "forecast"],
  },
  {
    id: "scenario-controls",
    name: "Scenario Controls & Drivers",
    description: "Scenario case toggles, baseline revenue adjustments, and comparative case mode switch.",
    category: "scenarios",
    defaultDimensions: { w: 12, h: 3, minW: 6, minH: 2 },
    icon: "Sliders",
    tags: ["controls", "assumptions", "case switcher", "drivers"],
  },
  {
    id: "segment-projections",
    name: "Segment Projections Table",
    description: "Granular revenue, realization, and EBITDA margin projections broken down by operating business division.",
    category: "scenarios",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "Layers",
    tags: ["segments", "volume", "realization", "divisions"],
  },
  {
    id: "driver-inputs",
    name: "Valuation Driver Controls",
    description: "Interactive parameter sliders for Revenue CAGR, EBITDA Margins, Tax Rate, and Capex intensity.",
    category: "scenarios",
    defaultDimensions: { w: 6, h: 6, minW: 4, minH: 4 },
    icon: "TrendingUp",
    tags: ["sliders", "cagr", "capex", "margins", "drivers"],
  },
  {
    id: "trajectory-chart",
    name: "Trajectory Area Bands",
    description: "Dynamic revenue projection trajectory with confidence bands and historical actuals.",
    category: "scenarios",
    defaultDimensions: { w: 6, h: 5, minW: 4, minH: 4 },
    icon: "Activity",
    tags: ["trajectory", "confidence bands", "recharts", "chart"],
  },
  {
    id: "margin-bridge",
    name: "Margin Bridge Waterfall",
    description: "Operating margin expansion/contraction waterfall bridge and FCFF cash conversion breakdown.",
    category: "scenarios",
    defaultDimensions: { w: 6, h: 5, minW: 4, minH: 4 },
    icon: "Workflow",
    tags: ["margin bridge", "waterfall", "fcff", "conversion"],
  },

  // ───────────────────────────────────────────────
  // 3. VALUATION MODELS (6 widgets)
  // ───────────────────────────────────────────────
  {
    id: "dcf-valuation",
    name: "DCF Valuation Engine",
    description: "Unlevered FCFF discount model with explicit WACC inputs and 2-dimensional terminal sensitivity matrix.",
    category: "valuation",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "Calculator",
    tags: ["dcf", "wacc", "fcff", "intrinsic", "sensitivity"],
  },
  {
    id: "relative-valuation",
    name: "Relative Comps & Multiples",
    description: "Trading multiples comparison (P/E, EV/EBITDA, P/B) with implied valuation football-field ranges.",
    category: "valuation",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "Target",
    tags: ["relative", "multiples", "ev/ebitda", "pe", "football field"],
  },
  {
    id: "reverse-dcf",
    name: "Reverse DCF Calculator",
    description: "Back-calculates market-implied growth expectations from current share price to determine margin of safety.",
    category: "valuation",
    defaultDimensions: { w: 6, h: 5, minW: 4, minH: 4 },
    icon: "RotateCw",
    tags: ["reverse dcf", "implied growth", "expectations", "market price"],
  },
  {
    id: "sotp-valuation",
    name: "SOTP Valuation",
    description: "Sum-of-the-parts conglomerate valuation with holding company discounts and divisional EBITDA multiples.",
    category: "valuation",
    defaultDimensions: { w: 6, h: 6, minW: 4, minH: 4 },
    icon: "Boxes",
    tags: ["sotp", "conglomerate", "holding discount", "parts"],
  },
  {
    id: "banking-valuation",
    name: "Banking P/B-ROE Model",
    description: "Financial institution valuation via Gordon Growth P/B-ROE regression and Excess Return residual income.",
    category: "valuation",
    defaultDimensions: { w: 6, h: 6, minW: 4, minH: 4 },
    icon: "Building2",
    tags: ["banking", "pb-roe", "residual income", "financials"],
  },
  {
    id: "excess-return-valuation",
    name: "Excess Return / EVA Model",
    description: "Economic Value Added (EVA) and residual income capitalization evaluating true economic profit creation.",
    category: "valuation",
    defaultDimensions: { w: 6, h: 6, minW: 4, minH: 4 },
    icon: "Coins",
    tags: ["eva", "excess return", "economic value", "roce-wacc"],
  },

  // ───────────────────────────────────────────────
  // 4. FORENSICS & GOVERNANCE (4 widgets)
  // ───────────────────────────────────────────────
  {
    id: "altman-z-score",
    name: "Altman Z-Score Forensics",
    description: "Multi-factor balance sheet solvency index categorizing firm into Safe, Grey, or Distress zones.",
    category: "forensic",
    defaultDimensions: { w: 6, h: 5, minW: 4, minH: 4 },
    icon: "ShieldAlert",
    tags: ["altman", "z-score", "bankruptcy", "distress", "solvency"],
  },
  {
    id: "beneish-m-score",
    name: "Beneish M-Score Forensics",
    description: "8-variable forensic model assessing probability of earnings manipulation and aggressive revenue recognition.",
    category: "forensic",
    defaultDimensions: { w: 6, h: 5, minW: 4, minH: 4 },
    icon: "FileSearch",
    tags: ["beneish", "m-score", "manipulation", "forensics", "accounting"],
  },
  {
    id: "piotroski-f-score",
    name: "Piotroski F-Score Forensics",
    description: "9-point fundamental health index across profitability, operational efficiency, and financial leverage.",
    category: "forensic",
    defaultDimensions: { w: 6, h: 5, minW: 4, minH: 4 },
    icon: "ShieldCheck",
    tags: ["piotroski", "f-score", "financial health", "scorecard"],
  },
  {
    id: "forensic-flags",
    name: "Forensic Red Flags",
    description: "Automated forensic audit checking auditor turnover, related party transactions, and tax vs P&L anomalies.",
    category: "forensic",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "AlertTriangle",
    tags: ["red flags", "auditor", "governance", "related party", "tax gap"],
  },

  // ───────────────────────────────────────────────
  // 5. QUALITATIVE & RESEARCH (2 widgets)
  // ───────────────────────────────────────────────
  {
    id: "standalone-notes",
    name: "Qualitative Thesis & Notes",
    description: "Full-height dedicated qualitative investment thesis notepad with tags, conviction stance, and persistence.",
    category: "qualitative",
    defaultDimensions: { w: 6, h: 6, minW: 4, minH: 4 },
    icon: "FileText",
    tags: ["notes", "thesis", "qualitative", "stance", "conviction"],
  },
  {
    id: "attachment-hub",
    name: "Document & Attachment Hub",
    description: "Centralized evidence hub containing investor presentations, annual reports, transcripts, and model sheets.",
    category: "qualitative",
    defaultDimensions: { w: 12, h: 6, minW: 6, minH: 4 },
    icon: "Paperclip",
    tags: ["attachments", "documents", "evidence", "pdf", "excel", "filings"],
  },
];

export function getWidgetDefinition(type: string): WorkstationWidgetDefinition | undefined {
  return WIDGET_CATALOG.find((w) => w.id === type);
}

export function getWidgetsByCategory(category: WidgetCategory): WorkstationWidgetDefinition[] {
  return WIDGET_CATALOG.filter((w) => w.category === category);
}
