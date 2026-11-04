# Research OS - Equity Research Operating System

> A comprehensive institutional-grade equity research platform for fundamental analysis, valuation, portfolio management, and decision-making.

## 🎯 Overview

Research OS is a full-stack equity research platform designed for institutional investors (retail, family office, institutional). It provides:

- **Company Deep Dive** - 10-tab comprehensive analysis (Overview, Story, Management, Governance, Financials, Valuation, Risk, SME, Working Capital, Downsides)
- **Valuation Suite** - 5 models (DCF, Relative, SOTP, Banking, Excess Return) + Forensics (Beneish, Altman, Piotroski)
- **Portfolio Management** - Holdings, Performance, Risk, Tax, Reconciliation
- **Document AI** - Document ingestion, RAG, summarization, extraction
- **Macro & Industry** - Macro dashboard, industry analysis, sector heatmaps
- **Idea Generation** - Screening, idea pipeline, conviction tracking
- **Decision Weighing** - Scenario analysis, conviction sizing, portfolio fit
- **Tasks & Time** - Kanban, Pomodoro, time tracking

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Research OS Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15 + React 19 + TypeScript)                 │
│  ├── Pages (App Router)                                         │
│  ├── Components (Radix UI + Tailwind)                          │
│  ├── Widgets (86 registered, lazy-loaded)                      │
│  ├── State (Zustand + Immer + SWR)                             │
│  └── Hooks (usePrices, useWorkspace)                           │
├─────────────────────────────────────────────────────────────────┤
│  Math Engine (Python 3.11+ / FastAPI)                          │
│  ├── 18 Deterministic Engines                                   │
│  │   ├── Valuation (DCF, Relative, SOTP, Banking, Excess Return)│
│  │   ├── Forensics (Beneish, Altman, Piotroski, Risk Score)   │
│  │   ├── Portfolio (Analytics, Corporate Actions)              │
│  │   └── Screening, Revenue Projection, Hedging, Turnaround    │
│  ├── 36 Golden Vector Tests                                     │
│  └── FastAPI Endpoints (18 calculation endpoints)              │
├─────────────────────────────────────────────────────────────────┤
│  Data Ingestion (Python / FastAPI)                             │
│  ├── Extractors (PDF, Legal, CSV/Excel)                        │
│  ├── Chunkers (Sliding Window)                                 │
│  ├── Classifiers (8 Document Types)                            │
│  ├── Embeddings (Vector Store + BM25)                          │
│  ├── RAG (Citation Engine + Hybrid Retrieval)                  │
│  └── PIT Compliance (Point-in-Time Transformer)                │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                 │
│  ├── PostgreSQL + pgvector (Primary DB)                        │
│  ├── Qdrant (Vector Search)                                    │
│  ├── Local File Storage (MinIO/S3 ready)                       │
│  ├── Docker Compose (Local Dev)                                │
│  └── Vercel Deployment (Frontend + Python Services)            │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
research-os/
├── .github/                          # GitHub workflows (CI/CD)
├── .hermes/                          # Hermes agent config
├── agents/                           # Auto-agent scripts
├── data-ingestion/                   # Python data ingestion service
│   ├── api/                          # FastAPI endpoints
│   ├── src/data_ingestion/           # Core ingestion logic
│   ├── tests/                        # 13 tests (13 passing)
│   ├── pyproject.toml                # Python deps
│   └── Dockerfile
├── math-engine/                      # Python math engine service
│   ├── api/                          # FastAPI endpoints (18 endpoints)
│   ├── src/math_engine/              # 18 engines + utils
│   ├── tests/                        # 36 golden vector tests
│   ├── pyproject.toml
│   └── Dockerfile
├── research-os-frontend/             # Next.js 15 frontend
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   ├── components/               # React components
│   │   │   ├── ui/                   # Radix UI primitives
│   │   │   └── widgets/              # 86 registered widgets
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities, stores, types
│   │   └── middleware.ts             # Middleware (auth disabled)
│   ├── package.json
│   ├── vitest.config.ts              # Test config
│   └── Dockerfile
├── math-engine/                      # Python math engine (duplicate for Vercel)
├── data-ingestion/                   # Python data ingestion (duplicate for Vercel)
├── specs/                            # 141 specification files
│   ├── engines/                      # 18 engine specs
│   ├── company-page/                 # 59 company page specs
│   ├── portfolio-management/         # 16 specs
│   ├── industry-page/                # 11 specs
│   ├── macro-page/                   # 2 specs
│   ├── document-ai/                  # 4 specs
│   ├── weigh-decisions/              # 6 specs
│   ├── tasks-time/                   # 3 specs
│   ├── additional-tools/             # 4 specs
│   ├── generate-ideas/               # 2 specs
│   ├── watchlist/                    # 2 specs
│   ├── grwth/                        # 1 spec
│   └── shared/                       # Shared types
├── specs/audits/                     # Antigravity audit reports
├── docs/                             # Documentation
├── postgres/init/                    # Database schema
├── ANTIGRAVITY_HANDOFF.md            # Handoff document
├── IMPLEMENTATION_PLAN.md            # 10-phase implementation plan
├── EXCEL_COVERAGE_REPORT.md          # Excel tool coverage (100%)
├── SPEC_INDEX.md                     # Master spec index
├── TOOL_TRACKER.md                   # Implementation tracker
├── docker-compose.yml                # Local development stack
├── vercel.json                       # Vercel deployment config
└── package.json                      # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ with pgvector
- Docker (optional, for docker-compose)

### Local Development

```bash
# 1. Install frontend dependencies
cd research-os-frontend
npm install

# 2. Install Python dependencies
cd ../math-engine
pip install -e .

cd ../data-ingestion
pip install -e .

# 3. Start database (using docker-compose)
cd ..
docker-compose up -d postgres qdrant

# 4. Run migrations
psql -h localhost -U postgres -d research_os -f postgres/init/01_schema.sql

# 5. Start services (3 terminals)
# Terminal 1: Frontend
cd research-os-frontend && npm run dev

# Terminal 2: Math Engine
cd math-engine && uvicorn api.main:app --reload --port 8000

# Terminal 3: Data Ingestion
cd data-ingestion && uvicorn api.main:app --reload --port 8001

# 6. Open http://localhost:3000
```

### Using Docker Compose (All Services)

```bash
docker-compose up --build
```

## 🧪 Testing

```bash
# Frontend tests
cd research-os-frontend
npm test                    # Vitest (2 smoke tests)
npm run typecheck           # TypeScript check

# Math Engine tests
cd ../math-engine
python -m pytest tests/ -v  # 36 tests

# Data Ingestion tests
cd ../data-ingestion
python -m pytest tests/ -v  # 13 tests
```

## 📊 Key Features

### 18 Math Engines (All 36 Golden Vector Tests Passing)
| Category | Engines |
|----------|---------|
| **Valuation** | DCF, Relative, SOTP, Banking, Excess Return |
| **Forensics** | Beneish M-Score, Altman Z-Score, Piotroski F-Score |
| **Portfolio** | Analytics (XIRR, Sortino, Drawdown), Corporate Actions |
| **Screening** | Multi-factor with harmonic mean, loss-maker exclusion |
| **Projections** | Revenue Projection (S-curve, FCF tax shield) |
| **Forensics** | Risk Score (SEBI LODR), Turnaround, Hedging |
| **Analysis** | Common Size, Concall Consistency, Ratio Analysis |

### 86 Registered Widgets
| Category | Count | Examples |
|----------|-------|----------|
| **Valuation** | 7 | DCF, Relative, SOTP, Banking, Excess Return, Summary, Philosophy |
| **Forensics** | 5 | Beneish, Altman, Piotroski, Forensic Flags, Risk Score |
| **Financials** | 5 | Ratio Analysis, Common Size, Revenue Projection, Segment, Cost/WC |
| **Management** | 7 | Ownership, Catalyst, Concall, Document AI, AI Assistant |
| **Governance** | 10 | Checklist, Risk Score, Forensics, Legal, Compensation, Board |
| **Portfolio** | 5 | Holdings, Performance, Risk, Transactions, Analytics |
| **Decision** | 5 | Fit Check, Scenario, Conviction, Reverse DCF, Philosophy |
| **Macro** | 2 | Market Metrics, Macro Dashboard |
| **Industry** | 7 | Overview, Heatmap, Peers, Value Chain, Margin Bridge, Demand |
| **Documents** | 4 | Viewer, Summarizer, Extractor, AI Assistant |
| **Tasks** | 3 | Kanban, Time Tracker, Todo |
| **Ideas** | 2 | Idea Generation, Screening Table |
| **Watchlist** | 1 | Watchlist Manager |
| **Utility** | 4 | Tables, Text Boxes, UI Primitives |

### 10 Company Page Tabs (Matches Excel 1:1)
1. **Overview** - KPIs, Decision Terminal, Tracking, Latest Changes, Company Info
2. **Story** - Business Model, Moat, Growth Drivers (Current/Future)
3. **Management** - Ownership, Catalyst, Concall, Track Record, Capital Allocation, Compensation, Board, Auditor
4. **Governance** - Risk, Checklist, Forensics, Legal, Fragility, Customer Concentration
5. **Financials** - Statements, Ratio Analysis, Common Size, Revenue Projection, Segment, Cost/WC
6. **Valuation** - DCF, Relative, SOTP, Banking, Excess Return, Philosophy, Exit Tool
7. **Risk** - Assessment, Technical, Risk Score, Hedging, Fragility Points
8. **SME** - Ownership, Custom Text, Turnaround, On-Ground Research
9. **Working Capital** - Statements, Common Size, WC Breakup, Cost Breakup
10. **Downsides** - Risk, Checklist, Hedging, Forensics, Exit, Key Events, Recent Events

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [SPEC_INDEX.md](./SPEC_INDEX.md) | Master specification index (141 specs) |
| [TOOL_TRACKER.md](./TOOL_TRACKER.md) | Implementation status tracker |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | 10-phase implementation roadmap |
| [EXCEL_COVERAGE_REPORT.md](./EXCEL_COVERAGE_REPORT.md) | 100% Excel tool coverage verification |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Technical architecture deep-dive |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Development setup & guidelines |
| [API.md](./docs/API.md) | API endpoint documentation |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide (Vercel, Docker) |
| [WIDGET_DEVELOPMENT.md](./docs/WIDGET_DEVELOPMENT.md) | Widget creation guide |

## 🔧 Configuration

### Environment Variables

```bash
# research-os-frontend/.env.local
NEXT_PUBLIC_MATH_ENGINE_URL=http://localhost:8000
NEXT_PUBLIC_DATA_INGESTION_URL=http://localhost:8001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_SECRET=your_secret

# math-engine/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/research_os
QDRANT_URL=http://localhost:6333

# data-ingestion/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/research_os
QDRANT_URL=http://localhost:6333
```

## 🚢 Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add 3 services:
   - `research-os-frontend` (Next.js, Root Directory: `research-os-frontend`)
   - `math-engine-api` (Python, Framework: FastAPI, Root: `math-engine`)
   - `data-ingestion-api` (Python, Framework: FastAPI, Root: `data-ingestion`)
3. Add environment variables
4. Deploy

### Docker
```bash
docker-compose up --build -d
```

## 📝 Contributing

1. Create feature branch from `main`
2. Follow existing code patterns
3. Write tests for new engines/widgets
4. Run all tests: `npm test && python -m pytest`
5. Submit PR with description

## 📄 License

Proprietary - Research OS Internal Use Only

---

**Research OS** - Built for institutional equity research excellence.