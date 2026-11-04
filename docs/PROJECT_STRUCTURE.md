# Research OS - Project Structure

> Complete project structure documentation for Research OS.

## 📁 Root Directory

```
research-os/
├── .github/                          # GitHub workflows (CI/CD)
│   └── workflows/
│       └── deploy.yml                # Deployment pipeline
├── .hermes/                          # Hermes agent configuration
│   └── cron/
│       └── research-os-auto-agent.yaml
├── .vscode/                          # VS Code settings
│   ├── extensions.json               # Recommended extensions
│   └── settings.json                 # Editor settings
├── agents/                           # Auto-agent scripts
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # Technical architecture
│   ├── DEVELOPMENT.md                # Development guide
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── API.md                        # API documentation
│   ├── WIDGET_DEVELOPMENT.md         # Widget development guide
│   ├── PROJECT_STRUCTURE.md          # This file
│   ├── comprehensive-testing-and-gap-analysis.md
│   ├── hermes-audit-review.md
│   └── tool-audit.md
├── agents/                           # Agent scripts
├── data-ingestion/                   # Python data ingestion service
├── math-engine/                      # Python math engine service
├── research-os-frontend/             # Next.js 15 frontend
├── math-engine/                      # Python math engine (Vercel duplicate)
├── data-ingestion/                   # Python data ingestion (Vercel duplicate)
├── specs/                            # 141 specification files
├── specs/audits/                     # Antigravity audit reports
├── docs/samples/                     # Sample PDFs for testing
├── postgres/init/                    # Database schema
├── ANTIGRAVITY_HANDOFF.md            # Handoff document
├── IMPLEMENTATION_PLAN.md            # 10-phase implementation plan
├── EXCEL_COVERAGE_REPORT.md          # Excel tool coverage (100%)
├── SPEC_INDEX.md                     # Master spec index
├── TOOL_TRACKER.md                   # Implementation tracker
├── SPEC_PRODUCT.md                   # Product specification
├── SPEC_WIDGET_TAB_FRAMEWORK.md      # Widget/tab framework spec
├── SPEC_INGESTION_PIPELINE.md        # Ingestion pipeline spec
├── SPEC_MATH_ENGINE.md               # Math engine spec
├── SPEC_GRWTH_PIPELINE.md            # GRWTH pipeline spec
├── SPEC_TASKS_TIME_TRACKER.md        # Tasks/time tracker spec
├── SPEC_INDIVIDUAL_TOOLS.md          # Individual tools spec
├── SPEC_INDEX.md                     # Master spec index
├── TOOL_TRACKER.md                   # Implementation tracker
├── docker-compose.yml                # Local development stack
├── vercel.json                       # Vercel deployment config
├── package.json                      # Root package.json
├── .gitignore                        # Git ignore rules
├── README.md                         # Project overview
├── ANTIGRAVITY_HANDOFF.md            # Handoff document
├── IMPLEMENTATION_PLAN.md            # 10-phase implementation plan
├── EXCEL_COVERAGE_REPORT.md          # Excel tool coverage (100%)
├── cronjob_payload.json              # Cron job payload
├── cron-auto-agent                   # Cron entry
├── research-os-autoagent.service     # Systemd service
├── research-os-autoagent.timer       # Systemd timer
├── ResearchOS-AutoAgent.xml          # Windows Task Scheduler
├── auto-agent.sh                     # Auto-agent script (Linux/Mac)
├── auto-agent.bat                    # Auto-agent script (Windows)
└── .gitignore                        # Git ignore rules
```

---

## 📁 Detailed Directory Breakdown

### `/data-ingestion` - Python Data Ingestion Service

```
data-ingestion/
├── api/                              # FastAPI endpoints
│   ├── data_ingestion/               # API module
│   │   ├── chunkers/                 # Text chunking
│   │   │   ├── __init__.py
│   │   │   └── sliding_window.py     # Sliding window chunker
│   │   ├── classifiers/              # Document classification
│   │   │   ├── __init__.py
│   │   │   └── document_classifier.py # 8 document types
│   │   ├── embeddings/               # Vector embeddings
│   │   │   ├── __init__.py
│   │   │   └── vector_store.py       # Qdrant/pgvector integration
│   │   ├── extractors/               # Content extraction
│   │   │   ├── __init__.py
│   │   │   ├── legal.py              # Legal document extractor
│   │   │   └── pdf.py                # PDF extractor (PyMuPDF)
│   │   ├── parsers/                  # Parsers (empty, reserved)
│   │   ├── pit/                      # Point-in-Time compliance
│   │   │   ├── __init__.py
│   │   │   └── transformer.py        # PIT transformer
│   │   ├── rag/                      # Retrieval-Augmented Generation
│   │   │   ├── __init__.py
│   │   │   └── citation_engine.py    # Hybrid retrieval + NLI
│   │   ├── scrapers/                 # Web scrapers (reserved)
│   │   ├── sources/                  # Data sources (reserved)
│   │   ├── transformers/             # Transformers (reserved)
│   │   ├── __init__.py
│   │   └── main.py                   # FastAPI app entry
│   ├── main.py                       # Entry point
│   ├── src/                          # Source code (same as api/)
│   │   └── data_ingestion/           # (duplicate structure)
│   ├── tests/                        # Test suite
│   │   ├── test_data_ingestion.py    # 13 tests
│   │   └── test_legal_extraction.py  # Legal extraction tests
│   ├── pyproject.toml                # Python project config
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Docker image
│   └── pyproject.toml                # Project config
```

### `/math-engine` - Python Math Engine Service

```
math-engine/
├── api/                              # FastAPI endpoints
│   ├── math_engine/                  # Engine modules (for Vercel)
│   │   ├── forensics/                # Forensic engines
│   │   ├── grwth/                    # GRWTH engines
│   │   ├── portfolio/                # Portfolio engines
│   │   ├── screening/                # Screening engine
│   │   ├── utils/                    # Utilities
│   │   └── valuation/                # Valuation engines
│   └── main.py                       # FastAPI app + 18 endpoints
├── src/                              # Source code
│   └── math_engine/                  # Core engine logic
│       ├── __init__.py               # All exports + registry
│       ├── valuation/                # 5 valuation engines
│       │   ├── __init__.py
│       │   ├── dcf.py                # DCF engine
│       │   ├── relative.py           # Relative valuation
│       │   ├── sotp.py               # SOTP engine
│       │   ├── banking.py            # Banking valuation
│       │   └── excess_return.py      # Excess return engine
│       ├── forensics/                # 3 forensic engines
│       │   ├── __init__.py
│       │   ├── beneish.py            # Beneish M-Score
│       │   ├── altman.py             # Altman Z-Score
│       │   └── piotroski.py          # Piotroski F-Score
│       ├── portfolio/                # Portfolio engines
│       │   ├── __init__.py
│       │   ├── analytics.py          # Portfolio analytics
│       │   └── corporate_actions.py  # Corporate actions
│       ├── screening/                # Screening engine
│       │   └── screening.py
│       ├── projection/               # Projection engines
│       │   └── revenue.py            # Revenue projection
│       ├── grwth/                    # GRWTH pipeline
│       │   └── pipeline.py
│       └── utils/                    # Shared utilities
├── tests/                            # Test suite
│   └── test_math_engine.py           # 36 golden vector tests
├── pyproject.toml                    # Python project config
├── requirements.txt                  # Dependencies
└── Dockerfile                        # Docker image
```

### `/research-os-frontend` - Next.js 15 Frontend

```
research-os-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes (proxies)
│   │   ├── companies/                # Company list page
│   │   ├── company/                  # Company pages
│   │   │   ├── [symbol]/             # Dynamic company routes
│   │   │   │   ├── tabs/             # Tab components
│   │   │   │   ├── layout.tsx        # Company layout
│   │   │   │   ├── page.tsx          # Company page wrapper
│   │   │   │   └── TabBar.tsx        # Tab navigation
│   │   │   └── page.tsx              # Company list
│   │   ├── documents/                # Document AI hub
│   │   ├── generate-ideas/           # Idea generation
│   │   ├── grwth/                    # GRWTH pipeline
│   │   ├── industry/                 # Industry analysis
│   │   ├── macro/                    # Macro dashboard
│   │   ├── portfolio/                # Portfolio management
│   │   │   ├── import/               # Import page
│   │   │   └── reconcile/            # Reconciliation page
│   │   ├── screening/                # Stock screening
│   │   ├── tasks/                    # Tasks & time tracking
│   │   ├── test/                     # Test page
│   │   ├── valuation/                # Valuation page
│   │   ├── watchlist/                # Watchlist page
│   │   ├── weigh/                    # Decision weighing
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── middleware.ts             # Middleware (auth disabled)
│   │
│   ├── components/
│   │   ├── ui/                       # Radix UI primitives (15)
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── metric-card.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   ├── widgets/                  # 86 registered widgets
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── AltmanZScore.tsx
│   │   │   ├── AssessAuditor.tsx
│   │   │   ├── BankingValuation.tsx
│   │   │   ├── BeneishMScore.tsx
│   │   │   ├── BoardStructure.tsx
│   │   │   ├── CapitalAllocation.tsx
│   │   │   ├── CatalystTracker.tsx
│   │   │   ├── Checklist.tsx
│   │   │   ├── CommonSize.tsx
│   │   │   ├── CompanyInfo.tsx
│   │   │   ├── ConcallConsistency.tsx
│   │   │   ├── ConcallTracker.tsx
│   │   │   ├── ConvictionSizing.tsx
│   │   │   ├── CostBreakup.tsx
│   │   │   ├── CostComparison.tsx
│   │   │   ├── CostDrivers.tsx
│   │   │   ├── CustomTableWidget.tsx
│   │   │   ├── CustomText.tsx
│   │   │   ├── CustomerConcentration.tsx
│   │   │   ├── DCFValuation.tsx
│   │   │   ├── DecisionTerminal.tsx
│   │   │   ├── DemandDrivers.tsx
│   │   │   ├── DemandTable.tsx
│   │   │   ├── DocumentViewer.tsx
│   │   │   ├── ExcessReturnValuation.tsx
│   │   │   ├── ExitTool.tsx
│   │   │   ├── FilteredTable.tsx
│   │   │   ├── FinancialCharts.tsx
│   │   │   ├── ForensicFlags.tsx
│   │   │   ├── GenericWidget.tsx
│   │   │   ├── HedgingMechanism.tsx
│   │   │   ├── IdeaGeneration.tsx
│   │   │   ├── IndustryAggregate.tsx
│   │   │   ├── IndustryOverview.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KeyDataExtractor.tsx
│   │   │   ├── KeyEvents.tsx
│   │   │   ├── KeyFragilityPoints.tsx
│   │   │   ├── KPICard.tsx
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KeyDataExtractor.tsx
│   │   │   ├── LatestChanges.tsx
│   │   │   ├── LegalChecks.tsx
│   │   │   ├── MacroDashboard.tsx
│   │   │   ├── ManagementCompensation.tsx
│   │   │   ├── ManagementConsistency.tsx
│   │   │   ├── MarketMetrics.tsx
│   │   │   ├── MarginBridge.tsx
│   │   │   ├── MultiTextBox.tsx
│   │   │   ├── NewsFeed.tsx
│   │   │   ├── OnGroundResearch.tsx
│   │   │   ├── OwnershipAnalysis.tsx
│   │   │   ├── PeerComparison.tsx
│   │   │   ├── PeerComparisonTable.tsx
│   │   │   ├── PiotroskiFScore.tsx
│   │   │   ├── PortfolioAnalytics.tsx
│   │   │   ├── PortfolioFitCheck.tsx
│   │   │   ├── PortfolioHoldings.tsx
│   │   │   ├── PortfolioPerformance.tsx
│   │   │   ├── PortfolioRisk.tsx
│   │   │   ├── RatioAnalysis.tsx
│   │   │   ├── RecentEvents.tsx
│   │   │   ├── RegulationsWidget.tsx
│   │   │   ├── RelativeValuation.tsx
│   │   │   ├── RevenueProjection.tsx
│   │   │   ├── ReverseDCF.tsx
│   │   │   ├── RiskAssessment.tsx
│   │   │   ├── RiskScore.tsx
│   │   │   ├── ScenarioAnalysis.tsx
│   │   │   ├── ScreeningTable.tsx
│   │   │   ├── SectorHeatmap.tsx
│   │   │   ├── SegmentBreakup.tsx
│   │   │   ├── SimpleTextBox.tsx
│   │   │   ├── SmartSummarizer.tsx
│   │   │   ├── SOTPValuation.tsx
│   │   │   ├── SupplyTable.tsx
│   │   │   ├── TechnicalAnalysis.tsx
│   │   │   ├── TimeTracker.tsx
│   │   │   ├── TodoTracker.tsx
│   │   │   ├── TrackRecord.tsx
│   │   │   ├── TrackingTable.tsx
│   │   │   ├── TransactionLog.tsx
│   │   │   ├── TurnaroundIndicator.tsx
│   │   │   ├── UIPrimitives.tsx
│   │   │   ├── ValuationPhilosophy.tsx
│   │   │   ├── ValuationSummary.tsx
│   │   │   ├── ValueChainMapper.tsx
│   │   │   ├── WatchlistManager.tsx
│   │   │   ├── WCBreakup.tsx
│   │   │   ├── WidgetRegistry.tsx
│   │   │   └── ... (86 total)
│   │   ├── CompanyTabs.tsx           # Tab system
│   │   ├── DashboardCanvas.tsx       # Drag-drop grid
│   │   └── Navigation.tsx            # Sidebar navigation
│   │
│   ├── hooks/
│   │   └── usePrices.ts              # SWR price polling
│   │
│   ├── lib/
│   │   ├── workspace-store.ts        # Zustand store (Immer + persist)
│   │   ├── supabase.ts               # Supabase client
│   │   ├── types.ts                  # Shared TypeScript types
│   │   ├── utils.ts                  # Utility functions
│   │   ├── mock-data.ts              # Mock data for development
│   │   └── workspace-store.ts        # Zustand store
│   │
│   ├── hooks/
│   │   └── usePrices.ts              # SWR price polling
│   │
│   ├── middleware.ts                 # Next.js middleware (auth disabled)
│   ├── smoke.test.ts                 # Smoke test
│   ├── vitest.config.ts              # Vitest config
│   └── vitest.setup.ts               # Test setup
│
├── public/                           # Static assets
├── package.json                      # Dependencies + scripts
├── package-lock.json
├── next.config.ts                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── vercel.json                       # Vercel deployment config
├── Dockerfile                        # Docker image
├── vitest.config.ts                  # Vitest config
├── vitest.setup.ts                   # Test setup
├── smoke.test.ts                     # Smoke test
├── eslint.config.mjs                 # ESLint config
├── next.config.ts.backup             # Backup config
└── README.md                         # Frontend README
```

### `/specs` - 141 Specification Files

```
specs/
├── SPEC_INDEX.md                     # Master spec index
├── TOOL_TRACKER.md                   # Implementation tracker
├── _TEMPLATE.md                      # Spec template
├── audits/                           # Antigravity audit reports
│   ├── INDEX.md                      # Audit index
│   ├── engines-recommendations.md    # Engine audit
│   ├── company-page-recommendations.md
│   ├── document-ai-recommendations.md
│   ├── industry-page-recommendations.md
│   ├── macro-page-recommendations.md
│   ├── portfolio-management-recommendations.md
│   ├── tasks-time-recommendations.md
│   ├── weigh-decisions-recommendations.md
│   └── additional-tools-recommendations.md
├── engines/                          # 18 engine specs
├── company-page/                     # 59 company page specs
│   ├── overview/                     # 7 specs
│   ├── story/                        # 4 specs
│   ├── management/                   # 6 specs
│   ├── governance/                   # 10 specs
│   ├── financials/                   # 4 specs
│   ├── valuation/                    # 8 specs
│   ├── risk/                         # 7 specs
│   ├── sme/                          # 6 specs
│   ├── downsides/                    # 4 specs
│   ├── analysis/                     # 5 specs
│   └── financials/                   # 4 specs
├── portfolio-management/             # 16 specs
├── industry-page/                    # 11 specs
├── macro-page/                       # 2 specs
├── document-ai/                      # 4 specs
├── weigh-decisions/                  # 6 specs
├── tasks-time/                       # 3 specs
├── additional-tools/                 # 4 specs
├── generate-ideas/                   # 2 specs
├── watchlist/                        # 2 specs
├── grwth/                            # 1 spec
├── shared/                           # Shared types
├── portfolio-management/             # 16 specs
└── weigh-decisions/                  # 6 specs
```

### `/postgres/init` - Database Schema

```
postgres/
└── init/
    └── 01_schema.sql                 # Complete schema (30 tables)
```

---

## 📄 Key Configuration Files

### Root Level
| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `package.json` | Root package.json |
| `vercel.json` | Vercel deployment config |
| `docker-compose.yml` | Local development stack |
| `.gitignore` | Git ignore rules |
| `.gitignore` | Git ignore rules |
| `ANTIGRAVITY_HANDOFF.md` | Handoff document |
| `IMPLEMENTATION_PLAN.md` | 10-phase implementation plan |
| `EXCEL_COVERAGE_REPORT.md` | Excel tool coverage (100%) |
| `SPEC_INDEX.md` | Master spec index |
| `TOOL_TRACKER.md` | Implementation tracker |

### Frontend Config
| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Tailwind CSS config |
| `postcss.config.js` | PostCSS config |
| `vitest.config.ts` | Vitest config |
| `vitest.setup.ts` | Test setup |
| `eslint.config.mjs` | ESLint config |
| `vercel.json` | Vercel deployment config |
| `next-env.d.ts` | Next.js TypeScript declarations |

### Backend Config
| File | Purpose |
|------|---------|
| `math-engine/pyproject.toml` | Python project config |
| `math-engine/requirements.txt` | Python dependencies |
| `data-ingestion/pyproject.toml` | Python project config |
| `data-ingestion/requirements.txt` | Python dependencies |

---

## 🔍 File Type Summary

| Extension | Count | Description |
|-----------|-------|-------------|
| `.tsx` | ~150 | React components |
| `.ts` | ~80 | TypeScript modules |
| `.py` | ~60 | Python modules |
| `.md` | ~40 | Documentation |
| `.json` | ~15 | Configuration |
| `.sql` | 1 | Database schema |
| `.yml`/`.yaml` | 5 | Docker/CI config |
| `.toml` | 3 | Python config |
| `.cfg`/`.ini` | 2 | Config files |
| `.sh`/`.bat` | 4 | Scripts |
| `.xml` | 1 | Windows Task Scheduler |

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Files | ~400 |
| TypeScript Files | ~230 |
| Python Files | ~60 |
| React Components | ~150 |
| Widgets | 86 |
| Math Engines | 18 |
| API Endpoints | 36 |
| Specifications | 141 |
| Tests | 58 |
| Documentation Files | 25 |

---

## 🔗 Quick Navigation

### Most Important Files
1. `README.md` - Project overview
2. `docs/ARCHITECTURE.md` - Technical architecture
3. `docs/DEVELOPMENT.md` - Development guide
4. `docs/DEPLOYMENT.md` - Deployment guide
5. `docs/API.md` - API documentation
5. `docs/WIDGET_DEVELOPMENT.md` - Widget development
6. `IMPLEMENTATION_PLAN.md` - 10-phase plan
7. `EXCEL_COVERAGE_REPORT.md` - Coverage report
8. `ANTIGRAVITY_HANDOFF.md` - Handoff doc

### Key Directories
- `research-os-frontend/src/app/` - All pages
- `research-os-frontend/src/components/widgets/` - 86 widgets
- `math-engine/src/math_engine/` - 18 engines
- `data-ingestion/src/data_ingestion/` - Ingestion pipeline
- `specs/` - 141 specifications
- `docs/` - All documentation
- `postgres/init/` - Database schema

---

*Last Updated: 2026-11-04*
*Version: 1.0.0*