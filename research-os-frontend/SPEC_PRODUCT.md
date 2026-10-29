# Research OS - Product Specification

## Vision
**Research OS** - The operating system for fundamental equity research. From idea generation to portfolio harvest, a unified workspace that replaces fragmented tools (Excel, Bloomberg, Screener.in, PDF readers, note apps) with a single, customizable, auditable platform.

## Target Users
- **Primary**: Fundamental equity analysts (retail, family office, institutional)
- **Secondary**: Portfolio managers, research associates, investment committees
- **Geography**: India-first (NSE/BSE), extensible to global

## Core Workflows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RESEARCH OS WORKFLOW LOOP                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐ │
│  │   GENERATE   │───▶│   DEEP DIVE  │───▶│    WEIGH     │───▶│ TRACK &  │ │
│  │   IDEAS      │    │   ANALYSIS   │    │  DECISIONS   │    │ HARVEST  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘ │
│        │                   │                   │                   │       │
│  Screening           Company Deep         Conviction          Portfolio     │
│  Universe            Dive (10 tabs)       Framework           Management    │
│  Custom Filters      Financials,          Position            Performance   │
│  Export CSV          Valuation,           Sizing,             Attribution   │
│  Watchlist           Risk, Mgmt,          Behavioral          Rebalancing   │
│  Promote to          Forensics,           Audit               Tax/Legal     │
│  Portfolio           Docs, ESG            Trail               Compliance    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Module Specifications

### 1. GENERATE - Idea Generation & Screening
**File**: `src/app/screening/page.tsx`

**Features**:
- Multi-factor screening (P/E, EV/EBITDA, FCF Yield, ROE, ROCE, D/E, Market Cap, Category)
- Real-time filtering, sorting, column customization
- Save/load screening templates
- Export to CSV/Excel
- Promote to Watchlist / Portfolio
- **Custom Dashboard**: User-configurable widget grid

**Data Sources**: Screener.in, BSE/NSE RSS, manual universe

**Tech Stack**: TanStack Table, react-grid-layout, Zustand persistence

### 2. DEEP DIVE - Company Analysis
**File**: `src/app/company/[symbol]/page.tsx` + `src/components/CompanyTabs.tsx`

**10 Standard Tabs** (all customizable):
1. **Overview & Decision** - Thesis, entry/exit rationale, decision terminal
2. **Story & Moats** - Business model, economic moat, growth drivers
3. **Management & Concall** - Background, shareholding, track record, consistency
4. **Governance & Forensics** - Compensation, board, auditor, Beneish/Altman/Piotroski
5. **Financial Statements** - P&L, BS, CF, segments, ratios, projections
6. **Valuation Suite** - 5 models (DCF, Relative, SOTP, Banking, Excess Return)
7. **Risk Scoring** - 5-category risk matrix, fragility points, legal checks
8. **SME Forensics** - On-ground research, promoter checks, screening list
9. **Working Capital & Concentration** - WC cycle, customer concentration
10. **Downsides & Exit Triggers** - Key events, hedging, forensic scores, exit checklist

**Customization**:
- Drag-drop tab reordering
- Add custom tabs (rename, choose widgets)
- Per-tab widget layout (DashboardCanvas)
- Persist per-symbol workspace

### 3. WEIGH - Decision Framework
**File**: `src/app/weigh/page.tsx`

**Components**:
- **Conviction Framework** - 8/10 threshold, sizing rules, review triggers
- **Position Sizing** - Kelly, volatility-targeted, risk-parity, max position limits
- **Portfolio Fit** - Correlation matrix, sector/cap/style overlap, factor exposure
- **Behavioral Audit** - 8-bias checklist (mandatory for INVEST decisions)
- **Decision Memo** - Auto-generated from inputs, export PDF

**Position Sizing Models**:
```python
# Kelly Criterion
f* = (bp - q) / b  where b = odds, p = win prob, q = 1-p

# Volatility Targeted
position = target_vol / asset_vol * portfolio_value

# Risk Parity
weight_i = (1/σ_i) / Σ(1/σ_j)
```

### 4. TRACK - Portfolio Management
**File**: `src/app/portfolio/page.tsx`

**Features**:
- Multi-portfolio support (core, satellite, model)
- Holdings with cost basis, current value, P&L (realized/unrealized)
- Performance: TWR, XIRR, Sharpe, Sortino, Max DD, Calmar
- Attribution: Brinson (allocation/selection/interaction)
- Risk: VaR/CVaR, factor exposure, correlation matrix
- Rebalancing: Target weights, drift alerts, tax-aware
- Transactions: Buy/sell/dividend/split, audit trail
- Benchmark: NIFTY50, NIFTY500, custom

### 5. DOCUMENTS - Document Intelligence Hub
**File**: `src/app/documents/page.tsx`

**Pipeline**: Upload → Classify → Extract → Store → Search → Cite

**Document Types**:
- Annual Reports (PDF, 200-500 pages)
- Concall Transcripts (PDF/HTML, 20-50 pages)
- Investor Presentations (PDF/PPT, 20-40 pages)
- SEBI Filings (XML/PDF)
- News/Research Reports (PDF/HTML)

**Extraction**:
- Tables → CSV (financial statements, segments, ratios)
- Text → Chunks (512 tokens, 50 overlap) + embeddings
- Key Metrics → Standardized KPIs
- Citations → Page/paragraph references

**Search**: Hybrid (BM25 + vector), filters by type/date/company
**RAG**: Query → Context → Answer with inline citations

### 6. MACRO - Macro Dashboard
**File**: `src/app/macro/page.tsx`

**Tabs**:
- Indicators (GDP, CPI, IIP, PMI, Rates, FX, Flows)
- Valuation History (NIFTY P/E, P/B, MCap/GDP percentiles)
- Regime Analysis (Growth/Inflation/Monetary/Valuation/External)
- Asset Allocation Implications

### 7. INDUSTRY - Sector Analysis
**File**: `src/app/industry/page.tsx`

**Tabs**:
- Overview (14 industries, key metrics, heatmap)
- Deep Dive (7 sub-tabs: Demand, Supply, Regulations, Costs, Competitors, Sizing, Value Chain)
- Compare (multi-industry table)
- Custom Dashboard (widget grid)

### 8. GRWTH - Capex Pipeline Tracker
**File**: `src/app/grwth/page.tsx`

**Views**: Kanban / Gantt / Table
**Stages**: Announced → Env Clearance → Land → Ground Break → Commissioning → Ramp-up → Commercial
**Data**: Capex (₹Cr), capacity, timeline, progress %, milestones, risks
**Output**: Revenue accretion model, IRR by project

### 9. TASKS - Research Operations
**File**: `src/app/tasks/page.tsx`

**Views**: Kanban / List / Analytics
**Stages**: TODO → In Progress → Review → Done / Blocked
**Features**: Time tracking, pomodoro, analytics (category allocation, assignee workload)

## Technical Architecture

### Frontend (Next.js 15 + React 19 + TypeScript)
```
src/
├── app/                    # Next.js App Router pages
│   ├── screening/
│   ├── company/[symbol]/
│   ├── weigh/
│   ├── portfolio/
│   ├── documents/
│   ├── macro/
│   ├── industry/
│   ├── grwth/
│   ├── tasks/
│   ├── valuation/
│   ├── watchlist/
│   ├── layout.tsx          # Root layout with Navigation
│   └── globals.css         # Tailwind v3
├── components/
│   ├── ui/                 # Radix + Tailwind primitives
│   ├── DashboardCanvas.tsx # Grid widget system
│   ├── CompanyTabs.tsx     # Customizable tab system
│   └── Navigation.tsx      # Sidebar navigation
├── lib/
│   ├── workspace-store.ts  # Zustand + persist (widgets/tabs)
│   ├── types.ts            # TypeScript definitions
│   ├── mock-data.ts        # 10 Indian companies
│   ├── utils.ts            # cn(), formatters
│   └── supabase.ts         # Supabase client (future)
├── components/ui/          # 13 Radix primitives
└── hooks/                  # Custom hooks
```

### Backend (Python)
```
math-engine/              # Deterministic financial math
├── src/math_engine/
│   ├── valuation/        # DCF, Relative, SOTP, Banking, Excess Return
│   ├── forensics/        # Beneish, Altman, Piotroski
│   ├── portfolio/        # TWR, XIRR, Sharpe, Attribution
│   ├── screening/        # Multi-factor screening engine
│   ├── forensics/        # Beneish, Altman, Piotroski
│   └── utils/            # Interpolation, stats, dates, audit
├── tests/                # 36 golden vector tests
└── pyproject.toml

data-ingestion/           # Document ingestion pipeline
├── src/data_ingestion/
│   ├── sources/          # Screener.in, BSE/NSE RSS, Manual
│   ├── classifiers/      # Rule-based + ML
│   ├── extractors/       # PDF tables, text, metrics
│   ├── storage/          # PIT PostgreSQL + pgvector
│   ├── pipeline/         # Orchestrator, queue, scheduler
│   ├── validators/       # Financial consistency, quality
│   └── embeddings/       # OpenAI + pgvector
├── tests/
└── pyproject.toml
```

### Database (PostgreSQL + pgvector)
```sql
-- Core tables
companies (symbol, name, sector, market_cap, ...)
financial_statements (symbol, period_end, frequency, ...)
documents (id, company_symbol, doc_type, source, status, ...)
document_chunks (document_id, text, embedding vector(3072), ...)
user_workspaces (user_id, workspace_type, context_key, tabs, widgets, layout)
portfolios (id, user_id, name, benchmark, ...)
holdings (portfolio_id, symbol, quantity, cost_basis, ...)
transactions (holding_id, type, date, quantity, price, ...)
```

### API Routes (Next.js)
```
/api/math-engine/dcf          # POST → DCFResult
/api/math-engine/screening    # POST → ScreeningResult
/api/math-engine/relative     # POST → RelativeResult
/api/math-engine/banking      # POST → BankingResult
/api/math-engine/excess-return# POST → ExcessReturnResult
/api/math-engine/forensics    # POST → ForensicsResult
/api/math-engine/portfolio    # POST → PortfolioMetrics
/api/documents/upload         # POST → DocumentMetadata
/api/documents/search         # POST → SearchResults
/api/documents/rag            # POST → RAGResponse
```

## Data Flow

### Screening → Company Deep Dive
```
User applies filters → Screening engine ranks → User selects → Promote to Watchlist
Watchlist → Click symbol → Company Deep Dive loads → Auto-fetches all 10 tabs data
```

### Deep Dive → Weigh Decision
```
User completes analysis → Clicks "Weigh Decision" → Pre-fills conviction framework
User sets position size → Checks portfolio fit → Runs behavioral audit
Generates decision memo → Promotes to Portfolio
```

### Document Ingestion → RAG
```
Upload PDF → Queue → Classify → Extract tables/text → PIT Store → Embed → pgvector
User queries → Embed query → Vector search → Context → GPT-4o → Answer + Citations
```

## Customization System

### Widget Registry (22 types)
| Category | Widgets |
|----------|---------|
| Data | KPI Cards, Peer Table, Industry Overview, Ownership, News Feed, Demand Drivers |
| Chart | Financial Charts, Sector Heatmap, Margin Bridge, Technical Analysis, Market Sizing |
| Analysis | Valuation Summary, Risk Assessment, Value Chain, Peer Comparison, Demand Drivers, Checklist |
| Utility | Documents, Catalyst Tracker, Custom Notes, Regulatory Tracker, Cost Structure |

### User Workspace State
```typescript
interface WorkspaceState {
  // Industry
  industryWidgets: Record<string, WidgetConfig[]>;      // per industryCode
  industryLayout: Record<string, GridLayout[]>;         // per industryCode
  
  // Company
  companyTabs: Record<string, TabConfig[]>;             // per symbol
  companyWidgets: Record<string, WidgetConfig[]>;       // per symbol
  activeTab: Record<string, string>;                    // per symbol
}
```
**Persistence**: localStorage (dev) → PostgreSQL (prod) with user_id

## Security & Compliance

### Data Protection
- PDFs encrypted at rest (S3 SSE-KMS)
- PII: No personal data stored except user preferences
- Audit logs for all financial calculations
- SEBI/IndAS compliant financial models

### Access Control
- Role-based: Analyst, PM, Compliance, Admin
- Workspace isolation per user
- Audit trail for all valuation calculations
- Document access logging

## Deployment

### Development
```bash
# Frontend
cd research-os-frontend && npm run dev

# Math Engine
cd math-engine && pip install -e . && pytest

# Data Ingestion
cd data-ingestion && pip install -e . && python -m data_ingestion.pipeline
```

### Production (Docker)
```yaml
services:
  frontend:
    build: ./research-os-frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
  
  api:
    build: ./math-engine
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
  
  ingestion:
    build: ./data-ingestion
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
  
  postgres:
    image: pgvector/pgvector:pg16
    volumes: [pgdata:/var/lib/postgresql/data]
  
  redis:
    image: redis:7-alpine
```

### CI/CD
```yaml
# .github/workflows/ci.yml
- lint (eslint, black, ruff)
- typecheck (tsc, mypy)
- test (pytest, jest)
- build (docker)
- deploy (staging → production)
```

## Roadmap

### Phase 1 (Weeks 1-4) ✅
- [x] Next.js 15 frontend with 15 pages
- [x] Math engine with 5 valuation models + forensics + portfolio
- [x] Screening engine with 10 factors
- [x] Widget/Tab framework (Zustand + react-grid-layout)
- [x] Company Deep Dive with 10 tabs
- [x] Custom Industry/Company dashboards
- [x] Document ingestion pipeline spec

### Phase 2 (Weeks 5-8)
- [ ] Real data ingestion (Screener.in, BSE/NSE RSS)
- [ ] PostgreSQL + pgvector deployment
- [ ] Document AI pipeline (classify → extract → embed)
- [ ] RAG query interface with citations
- [ ] Real-time data feeds (WebSocket)

### Phase 3 (Weeks 9-12)
- [ ] User authentication (Clerk/NextAuth)
- [ ] Multi-user workspaces with sharing
- [ ] Portfolio management with live P&L
- [ ] Advanced widgets (value chain canvas, margin bridge)
- [ ] AI-assisted research (thesis generation, risk flags)

### Phase 4 (Weeks 13-16)
- [ ] Mobile responsive
- [ ] Offline mode (PWA)
- [ ] Workspace templates marketplace
- [ ] API for external integrations
- [ ] White-label for institutions

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to first insight | < 5 min |
| Screening to deep dive | < 2 clicks |
| Valuation model run time | < 500ms |
| Document processing | < 2 min/page |
| RAG answer latency | < 3s |
| Uptime | 99.9% |
| User retention (30d) | > 60% |

## Open Questions

1. **Real-time data**: WebSocket vs polling for live prices?
2. **Collaboration**: Real-time co-editing of workspaces?
3. **Export formats**: Excel, PDF, PowerPoint, Notion?
4. **Global expansion**: US/Global data providers?
5. **Pricing**: Freemium, per-seat, usage-based?

## Appendix: File Inventory

```
research-os/
├── SPEC_PRODUCT.md                    # This file
├── SPEC_WIDGET_TAB_FRAMEWORK.md       # Customizable UI system
├── SPEC_INGESTION_PIPELINE.md         # Document AI pipeline
├── SPEC_MATH_ENGINE.md                # Financial math engine
├── math-engine/                       # Python financial engine
│   ├── src/math_engine/
│   └── tests/ (36 golden vectors)
├── data-ingestion/                    # Python ingestion pipeline
│   ├── src/data_ingestion/
│   └── tests/
├── research-os-frontend/              # Next.js 15 app
│   ├── src/app/ (15 pages)
│   ├── src/components/ (DashboardCanvas, CompanyTabs, ui/)
│   ├── src/lib/ (workspace-store, types, mock-data)
│   └── SPEC_*.md (this folder)
└── docker-compose.yml
```