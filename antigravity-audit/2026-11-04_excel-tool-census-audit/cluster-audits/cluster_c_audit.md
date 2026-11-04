# Comprehensive Codebase Audit: Cluster C Tools
**Research OS (Hermes) Platform Audit**

**Document Path:** `.agents/teamwork/explorer_audit_cluster_c/cluster_c_audit.md`  
**Auditor Archetype:** Explorer 3 (`explorer_audit_cluster_c`)  
**Audit Date:** 2026-11-04  
**Parent Orchestrator ID:** `374d5ac0-b7d9-4376-bd64-de7eda21aa53`  
**Scope:** Exhaustive audit of all 11 assigned functional categories in Cluster C across frontend (`research-os-frontend`), math engine (`math-engine`), data ingestion (`data-ingestion`), and database schemas (`postgres/init/01_schema.sql`).

---

## 1. Executive Summary & Audit Census

### 1.1 Scope Census & Implementation Status Summary
Cluster C comprises 11 functional categories encompassing 31 distinct platform tools, widgets, and calculation engines. Every assigned tool was audited through direct static source inspection, line-by-line verification, and empirical test execution.

| Category # | Functional Category | Total Tools Audited | Built | Partial/Stub | Pending | Implementation Readiness |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| **1** | **Pipeline & Idea Generation** | 2 | 0 | 2 | 0 | Incomplete UI & Mock State |
| **2** | **Industry (Company Page Tab 4)** | 3 | 0 | 2 | 1 | Stubs / Tab Omitted from Defaults |
| **3** | **Macro / Market** | 2 | 0 | 2 | 0 | Missing API Proxy, Falls back to Mock |
| **4** | **Portfolio Dashboard** | 2 | 0 | 2 | 0 | Frontend Mock / Backend Engine Disconnected |
| **5** | **Import & Reconciliation & Metrics** | 3 sub-areas (9 components) | 2 | 4 | 3 | Backend Engine Built / Ingestion & UI Stubs |
| **6** | **Current Portfolio & Trade History** | 2 | 0 | 2 | 0 | Interactive UI / In-Memory Mock State |
| **7** | **Portfolio Risk** | 4 | 0 | 2 | 2 | Partial Stubs / Missing Aggregation Engine |
| **8** | **Watchlist** | 1 | 0 | 1 | 0 | UI Shell Built / Column Customization Disabled |
| **9** | **Industry Deep Dive (Standalone Page)** | 11 | 0 | 4 | 7 | High Gaps / Missing Specialized Tables |
| **10** | **AI Tools** | 2 | 0 | 2 | 0 | Mock Keyword / Regex Simulators |
| **11** | **Productivity / Execution** | 2 | 0 | 2 | 0 | Rich Local State / No DB Persistence |
| **TOTAL** | **Entire Cluster C Catalog** | **31** | **2** | **19** | **10** | **6.5% Built, 61.3% Partial, 32.2% Pending** |

---

## 2. Test Execution & Empirical Verification Results

Automated test suites and compilation builds were executed across all three sub-repositories:

1. **Math Engine (`math-engine`)**:
   - Command: `.venv\Scripts\pytest.exe`
   - Test Results: **36 passed in 1.63s** (100% pass rate).
   - Covered Tests: DCF, Relative Valuation, SOTP, Banking P/B-ROE, Excess Return, Beneish M-Score, Altman Z-Score, Piotroski F-Score, Portfolio Analytics (`TestPortfolioAnalyticsEngine` in `tests/test_math_engine.py:704-783`), Screening.
   - Note: `math-engine/src/math_engine/portfolio/corporate_actions.py` does not have dedicated unit tests in `test_math_engine.py`.

2. **Data Ingestion (`data-ingestion`)**:
   - Command: `.venv\Scripts\pytest.exe`
   - Test Results: **13 passed in 1.02s** (100% pass rate).
   - Covered Tests: Chunkers, Classifiers, Embeddings, Ingestion, PIT Transformation, RAG.

3. **Frontend Application (`research-os-frontend`)**:
   - Command: `npm run build` (`next build`)
   - Build Status: **FAILED (Webpack Compilation Errors)**
   - Terminal Error Trace:
     - `Module not found: Can't resolve 'react-is'` required by `recharts` (affecting `TechnicalAnalysis.tsx`, `WidgetRegistry.tsx`, and `generate-ideas/page.tsx`).
     - `Module not found: Can't resolve 'next-auth/react'` in `src/app/auth/signin/page.tsx`.
     - `Module not found: Can't resolve 'next-auth'` and `'next-auth/providers/credentials'` in `src/lib/auth.ts`.
   - Test Script: `package.json` contains no `"test"` runner script.

---

## 3. Detailed Audit by Tool

---

### Category 1: Pipeline & Idea Generation (2 tools)

#### 1. Idea generation table
- **Excel Category:** Generate Ideas / Pipeline & Idea Generation
- **Excel Description:** A table to collect new stock pick ideas with information such as idea source, notes on financial statements, guidance etc. An option should be available to customise the columns based on preset templates for the different idea sources.
- **Data Source:** Manual entry
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/generate-ideas/page.tsx:1-68` (Page container rendering Idea Pipeline and Screening tabs)
  - `research-os-frontend/src/components/widgets/IdeaGeneration.tsx:1-206` (Core table widget)
  - `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:60, 131` (Widget registration)
  - `postgres/init/01_schema.sql:87-107` (`CREATE TABLE research_ideas`)
- **Production Readiness Notes:**
  - *Data Wiring:* All state resides in local React `useState(MOCK_IDEAS)` (`IdeaGeneration.tsx:28`). When a new idea is added via the modal form (`IdeaGeneration.tsx:47-62`), it is prepended to local component memory only.
  - *Column Customization:* The Excel specification explicitly mandates: *"An option should be available to customise the columns based on preset templates for the different idea sources."* The implementation in `IdeaGeneration.tsx:186-202` has hardcoded table headers (`Score`, `Title`, `Source`, `Status`, `Tags`, `Created`, `Actions`). No column picker, column visibility toggle, or template selector exists.
  - *Data Fields:* Fields for financial statement notes and management guidance are missing from the row model and entry modal.
  - *Build Regression:* `generate-ideas/page.tsx` fails compilation under `next build` due to the transitive `recharts` -> `react-is` webpack dependency failure.
- **Feasibility & Architectural Prerequisites:**
  - DB schema is already defined in `01_schema.sql:87-107`.
  - Next.js API route `/api/ideas` with CRUD handlers (GET, POST, PATCH, DELETE) backed by Supabase/Prisma/pg is required.
  - Needs a client-side column configuration state using `@tanstack/react-table` column visibility with source-based presets (`ScreeningPreset`, `ConcallPreset`, `FSPreset`).

#### 2. Grwth pipeline tracker
- **Excel Category:** GRWTH / Pipeline Tracker
- **Excel Description:** A kanban board tracking the progress of various companies through the GRWTH (Generate ideas, Research & review, Weigh decisions, Track, Harvest) research cycle. The stages of GRWTH will be displayed horizontally at the top, with the companies within them displyed vertically under them. Filters must be provided to filter the companies based on various tags assigned.
- **Data Source:** Company page
- **Status:** `Partial/Stub` (Semantic Misalignment)
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/grwth/page.tsx:1-416` (GRWTH Pipeline page)
  - `research-os-frontend/src/components/widgets/KanbanBoard.tsx:1-154` (Generic Kanban widget)
  - `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:59, 130`
  - `postgres/init/01_schema.sql:109-140` (`grwth_stages`, `idea_stage_history`)
  - `specs/grwth/grwth-pipeline.md`
- **Production Readiness Notes:**
  - *Semantic Discrepancy:* The Excel requirement specifies the GRWTH research stages: **G**enerate ideas, **R**esearch & review, **W**eigh decisions, **T**rack, **H**arvest. The database schema (`01_schema.sql:122-127`) correctly seeded these 5 stages (`GENERATE`, `RESEARCH`, `WEIGH`, `TRACK`, `HARVEST`). However, `grwth/page.tsx:28-35` implemented an entirely different concept: a **Capex Project Milestone Tracker** with stages `ANNOUNCED`, `ENV_CLEARANCE`, `CONSTRUCTION`, `TRIAL_RUNS`, `COMMERCIAL`, `REVENUE` for projects like "New Energy Solar Giga Factory" and "Jio 5G Rollout".
  - *KanbanBoard Widget Discrepancy:* `KanbanBoard.tsx:16-24` defined columns as standard generic task statuses: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BLOCKED`, even though the mock data objects (`KanbanBoard.tsx:27-31`) had `stage: "RESEARCH"`, `stage: "WEIGH"`, `stage: "TRACK"`, `stage: "GENERATE"`.
  - *Data Wiring:* In `grwth/page.tsx`, all data is local mock `MOCK_GRWTH_ITEMS` (lines 37-46). Drag-and-drop state updates only component state (`moveItem` lines 96-100).
- **Feasibility & Architectural Prerequisites:**
  - Realign `grwth/page.tsx` stages to match the GRWTH stages defined in `01_schema.sql` (`GENERATE`, `RESEARCH`, `WEIGH`, `TRACK`, `HARVEST`).
  - Wire drag-and-drop actions to POST to `/api/ideas/:id/stage` and record entries in `idea_stage_history`.
  - Provide tag filtering based on `research_ideas.tags`.

---

### Category 2: Industry (3 tools — Company Page Tab 4)

#### 3. Market sizing (Company Page)
- **Excel Category:** Industry Analysis / Company Page
- **Excel Description:** For this we need an entry box for the ui but when we click it there should be open blank space where we can add our assumptions and how we came up with the value.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `specs/company-page/industry/market-sizing.md:1-181` (Detailed spec exists)
  - `postgres/init/01_schema.sql:191` (`company_industry.market_sizing JSONB`)
  - `research-os-frontend/src/lib/workspace-store.ts:262-274` (`DEFAULT_COMPANY_TABS`)
- **Production Readiness Notes:**
  - The tool is completely unbuilt in `research-os-frontend`.
  - In `workspace-store.ts:262-274`, the default 10 company tabs omit Tab 4 "Industry Analysis" altogether.
  - There is no component `MarketSizing.tsx` in `src/components/widgets/` or registered in `WidgetRegistry.tsx`.
- **Feasibility & Architectural Prerequisites:**
  - Needs a new React component `MarketSizingWidget.tsx` featuring an expandable assumption builder (TAM/SAM/SOM, penetration rates, ARPUs) as specified in `specs/company-page/industry/market-sizing.md:30-85`.
  - Must connect to `company_industry.market_sizing` JSONB column via `/api/company/:symbol/industry`.

#### 4. Competitors (Company Page)
- **Excel Category:** Industry Analysis / Company Page
- **Excel Description:** This can be directly sourced though companies data, a list can be created with coloumns which are customisable based upon what we want to see.
- **Data Source:** Data Sourced through Companies page
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/PeerComparison.tsx:1-41`
  - `research-os-frontend/src/components/widgets/PeerComparisonTable.tsx:1-41`
  - `postgres/init/01_schema.sql:192` (`company_industry.competitors JSONB`)
  - `specs/company-page/industry/competitors-table.md`
- **Production Readiness Notes:**
  - `PeerComparison.tsx` and `PeerComparisonTable.tsx` are 41-line static stubs rendering 3 hardcoded peer rows (RELIANCE, INFY, TCS).
  - No column customizability (columns are static: `Company, P/E, EV/EBITDA, ROE, FCF Yield` and `Company, Revenue, EBITDA, ROE, P/E`).
  - No dynamic link to the active company's sector peers.
- **Feasibility & Architectural Prerequisites:**
  - Connect to `/api/companies?sector=:sector` to query peer fundamentals dynamically.
  - Implement dynamic column selector supporting metrics from the Data Dictionary.

#### 5. Industry value chain (Company Page)
- **Excel Category:** Industry Analysis / Company Page
- **Excel Description:** This is an canvas where in we can draw arrows and stuff to create a diagram for industry value chain which should be customisable.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/ValueChainMapper.tsx:1-29`
  - `postgres/init/01_schema.sql:193` (`company_industry.value_chain JSONB`)
  - `specs/company-page/industry/value-chain-canvas.md`
- **Production Readiness Notes:**
  - `ValueChainMapper.tsx` is a 29-line static HTML display rendering 5 static cards in a row (`Raw Materials 5%` -> `Manufacturing 12%` -> `Distribution 8%` -> `Retail 15%` -> `After-Sales 25%`).
  - There is no interactive canvas, no drag-and-drop nodes, no drawing arrows, and no customization.
- **Feasibility & Architectural Prerequisites:**
  - Integrate an institutional diagramming canvas library (such as `@xyflow/react` / React Flow) to allow interactive node and edge creation.
  - Persist canvas node/edge JSON to `company_industry.value_chain`.

---

### Category 3: Macro / Market (2 tools)

#### 6. Economic indicators
- **Excel Category:** Macro / Market
- **Excel Description:** A widget containing major economic indicators of choice like GDP growth, repo rate etc.
- **Data Source:** Website/API
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/MacroDashboard.tsx:1-215`
  - `research-os-frontend/src/app/macro/page.tsx:1-403`
  - `postgres/init/01_schema.sql:428-441` (`macro_indicators` table)
  - `specs/macro-page/macro-dashboard.md`
- **Production Readiness Notes:**
  - *UI Implementation:* Institutional-grade dashboard displaying Real GDP Growth (7.8%), RBI Repo Rate (6.5%), CPI Inflation (5.1%), 10Y G-Sec Yield (7.05%), USD/INR (83.12), Brent Crude Oil ($84.5) with historical percentiles, trend badges, and sparkline SVGs.
  - *Data Wiring:* The widget attempts `fetch("/api/data-ingestion/macro-dashboard")` (`MacroDashboard.tsx:65`). This API route does not exist in Next.js or the backend.
  - The request always fails and silently falls back to `MOCK_INDICATORS` (lines 70-76).
  - No background crawler or feed ingestor is configured in `data-ingestion` for MOSPI or RBI.
- **Feasibility & Architectural Prerequisites:**
  - Implement a scheduled worker in `data-ingestion` to poll RBI DBIE and MOSPI RSS/APIs and write to `macro_indicators`.
  - Create the API route `/api/macro/indicators` in the frontend API proxy.

#### 7. Market metrics
- **Excel Category:** Macro / Market
- **Excel Description:** A widget containing metrics of Indian Stock market like NIFTY 50, sensex etc.
- **Data Source:** Website/API
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/MarketMetrics.tsx:1-131`
  - `math-engine/api/main.py:218-237` (`/prices`, `/ws/prices`)
  - `postgres/init/01_schema.sql:443-456` (`market_metrics` table)
  - `specs/macro-page/market-metrics.md`
- **Production Readiness Notes:**
  - *UI Implementation:* Displays NIFTY 50 (24,850), NIFTY Next 50 (58,200), NIFTY Midcap 150 (18,500), NIFTY Smallcap 250 (12,800), SENSEX (81,500), NIFTY P/E (22.8), NIFTY P/B (3.8), Buffett Indicator (1.12).
  - *Data Wiring:* Attempts `fetch("/api/data-ingestion/market-metrics")` (`MarketMetrics.tsx:36`), which does not exist, triggering fallback to `MOCK_MARKET_METRICS`.
  - *Backend Simulation:* In `math-engine/api/main.py:218-237`, the `/prices` and `/ws/prices` endpoints return pseudo-random numbers (`random.uniform(100, 5000)`), not real market indices.
- **Feasibility & Architectural Prerequisites:**
  - Integrate a real-time or EOD feed for NSE/BSE indices (e.g. via NSE unofficial API, Yahoo Finance, or commercial vendor).
  - Populate `market_metrics` table in Postgres and expose via `/api/market-metrics`.

---

### Category 4: Portfolio Dashboard (2 tools)

#### 8. Key portfolio stats
- **Excel Category:** Portfolio Dashboard
- **Excel Description:** A dashboard containing important statistcs of the portfolio such as P/E, sector exposures, allocation etc in small widgets.
- **Data Source:** Taken from company page + internal calculation
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/page.tsx:164-174, 204-246`
  - `research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx:88-94`
  - `postgres/init/01_schema.sql:400-410` (`portfolio_metrics` table)
  - `specs/portfolio-management/portfolio-dashboard.md`
- **Production Readiness Notes:**
  - *UI Implementation:* `portfolio/page.tsx` renders 8 KPI metric cards: Total Value, Total Cost, Unrealized P&L, P&L %, XIRR, Sharpe, Max DD, Beta (lines 164-174), alongside horizontal progress bars for Sector Allocation and Market Cap Exposure (lines 204-237).
  - *Calculation Correctness:* All calculations are computed client-side using hardcoded `MOCK_HOLDINGS` (lines 37-45).
  - *Mathematical Flaw:* P/E is only calculated in `PortfolioFitCheck.tsx:45` using an arithmetic weighted mean (`holdings.reduce((sum, h) => sum + h.weight * h.pe, 0)`), which violates the SEBI and institutional standard **Weighted Harmonic Mean**.
  - *Data Wiring:* Completely disconnected from Postgres `portfolios` and `holdings` tables.
- **Feasibility & Architectural Prerequisites:**
  - Implement Weighted Harmonic Mean for portfolio P/E in `PortfolioAnalyticsEngine`.
  - Persist calculated metrics to `portfolio_metrics` table.

#### 9. Portfolio returns
- **Excel Category:** Portfolio Dashboard
- **Excel Description:** A widget that displays retunrs of the portfolio. First column contains the time frame and the second column containts returns.
- **Data Source:** Uploaded statements + internal calculation
- **Status:** `Built` (Backend Math Engine) / `Partial/Stub` (Frontend UI)
- **Verifying File Paths & Line References:**
  - `math-engine/src/math_engine/__init__.py:1124-1158` (`PortfolioAnalyticsEngine.calculate`)
  - `math-engine/api/main.py:135-142` (`@app.post("/portfolio")`)
  - `research-os-frontend/src/components/widgets/PortfolioAnalytics.tsx:136-168`
  - `research-os-frontend/src/components/widgets/PortfolioPerformance.tsx:1-19`
- **Production Readiness Notes:**
  - *Backend Math Engine:* **BUILT AND TESTED.** `PortfolioAnalyticsEngine` accurately calculates TWR, Brent/Newton-Raphson XIRR, Annualized Return, Excess Return, MTD, YTD, 1Y, 3Y, 5Y, and Inception return. Unit tested in `test_math_engine.py:704-783`.
  - *Frontend Implementation:* `PortfolioAnalytics.tsx:136-168` provides a period returns table matching the Excel specification (Period vs Return: MTD, YTD, 1Y, 3Y, 5Y, Inception).
  - *Data Wiring Gap:* `PortfolioAnalytics.tsx:27` invokes `fetch("/api/math-engine/portfolio")` which returns a 404 error because Next.js has no API route handler for `/api/math-engine/portfolio`.

---

### Category 5: Import & Reconciliation & Portfolio Metrics (3 Sub-areas)

#### Sub-area 5.1: Import (4 Types)

##### 10. Capital Gains Import
- **Excel Category:** Import
- **Excel Description:** 1) Capital Gains statement ingestion
- **Data Source:** Uploaded statements
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/import/page.tsx:1-65`
  - `postgres/init/01_schema.sql:362-376` (`import_batches.import_type = 'CAPITAL_GAINS'`)
  - `specs/portfolio-management/capital-gains-import.md`
- **Production Readiness Notes:**
  - File upload form exists in `portfolio/import/page.tsx:26-28`, but clicking "Import" does not parse the uploaded file; it simply sets `imported=true` and displays 3 mock holdings.
  - No parsing engine exists for broker capital gains schedules (Zerodha, Groww, ICICI Direct).
  - Fails to reflect the **July 23, 2024 Union Budget tax overhaul** (STCG increased to 20% under Section 111A, LTCG increased to 12.5% under Section 112A with ₹1.25 Lakh exemption, and Section 55(2)(ac) grandfathering).
- **Feasibility & Architectural Prerequisites:**
  - Build a multi-broker Excel/PDF parser in `data-ingestion` to extract tax lots, ISIN, buy/sell dates, buy/sell values, and grandfathered FMV as of January 31, 2018.

##### 11. Ledger (Normal & MTF) Import
- **Excel Category:** Import
- **Excel Description:** 2) Ledger - a) Normal ledger b) MTF Ledger
- **Data Source:** Uploaded statements
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:365` (`import_type IN ('LEDGER_NORMAL', 'LEDGER_MTF')`)
  - `specs/portfolio-management/capital-gains-import.md:16`
- **Production Readiness Notes:**
  - No parser, backend handler, or specialized UI exists for Normal or MTF ledger statements.
  - MTF interest accruals, margin calls, and margin pledge debits/credits are unhandled.
- **Feasibility & Architectural Prerequisites:**
  - In `data-ingestion`, implement ledger transaction parsers mapping vouchers to internal cash/collateral balances.

##### 12. Holding Statements Import
- **Excel Category:** Import
- **Excel Description:** 3) Holding Statements
- **Data Source:** Uploaded statements
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/import/page.tsx:21-62`
  - `postgres/init/01_schema.sql:365` (`import_type = 'HOLDINGS'`)
- **Production Readiness Notes:**
  - Shared with `portfolio/import/page.tsx` file picker, rendering static mock holdings.
  - No NSDL/CDSL CAS parser or e-CAS password-protected PDF unlock mechanism.
- **Feasibility & Architectural Prerequisites:**
  - Implement a CAMS/KFintech/CDSL/NSDL e-CAS PDF extractor with PyMuPDF / pdfplumber in `data-ingestion`.

##### 13. Transaction Statements Import
- **Excel Category:** Import
- **Excel Description:** 4) Transaction Statements (Trade books, Contract notes)
- **Data Source:** Uploaded statements
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:365` (`import_type = 'TRANSACTIONS'`)
  - `specs/portfolio-management/capital-gains-import.md`
- **Production Readiness Notes:**
  - No trade book parser exists in the repository.
- **Feasibility & Architectural Prerequisites:**
  - Implement trade confirmation contract note parsers validating statutory levies (STT, GST, Stamp Duty, SEBI turnover fees).

---

#### Sub-area 5.2: Reconciliation (3 Types)

##### 14. Statement Reconciliation
- **Excel Category:** Reconciliation
- **Excel Description:** Holding Statement vs Transaction Records / Capital Gains Reconciliation
- **Data Source:** Internal calc vs Broker statements
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/reconcile/page.tsx:1-45`
  - `postgres/init/01_schema.sql:372` (`import_batches.reconciliation_result JSONB`)
  - `specs/portfolio-management/statement-reconciliation.md`
- **Production Readiness Notes:**
  - `portfolio/reconcile/page.tsx` renders 3 hardcoded reconciliation items (RELIANCE Qty match, INFY Avg Price mismatch, TCS Qty mismatch).
  - The "Resolve" button is a non-functional UI element.
  - No automated engine compares transactions to holdings or identifies corporate action breaks.
- **Feasibility & Architectural Prerequisites:**
  - Build an automated 3-way reconciliation engine in `math-engine` (Broker Contract Note $\leftrightarrow$ Demat Holding CAS $\leftrightarrow$ Bank Ledger).

##### 15. Automatic Data Quality & Balance Checks
- **Excel Category:** Automatic Data Quality & Balance Checks
- **Excel Description:** Automated quality checks for negative balances, duplicate transactions, corporate action gaps.
- **Data Source:** Internal calculation
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `specs/portfolio-management/auto-quality-checks.md:1-171`
- **Production Readiness Notes:**
  - No component or execution runner exists in frontend or backend code.
- **Feasibility & Architectural Prerequisites:**
  - Implement the 11 validation checks specified in `specs/portfolio-management/auto-quality-checks.md:29-44` (negative quantity check, unexplained cash deficit, duplicate transaction hash check).

##### 16. Corporate Actions & Special Transaction Handling
- **Excel Category:** Corporate Actions & Special Transaction Handling
- **Excel Description:** The system should identify, classify, and correctly process: Transfer In, Transfer Out, MTF, Intraday Adjustment, Stock Splits, Bonus Issues, Rights Issues, Mergers, Demergers, Dividends.
- **Data Source:** Broker statements, Corporate announcements
- **Status:** `Built` (Backend Math Engine) / `Pending` (Frontend UI)
- **Verifying File Paths & Line References:**
  - `math-engine/src/math_engine/portfolio/corporate_actions.py:1-95` (`CorporateActionsEngine`)
  - `math-engine/api/main.py:144-152` (`@app.post("/corporate-actions")`)
  - `postgres/init/01_schema.sql:379-398` (`corporate_actions` table)
  - `specs/portfolio-management/corporate-actions-handler.md`
- **Production Readiness Notes:**
  - *Backend Math Engine:* **BUILT.** `CorporateActionsEngine` implements:
    1. Stock splits and bonus issues with fractional shares handling and cash-in-lieu calculation (`fractional_cash = round(fractional_shares * market_price, 2)` per SEBI rules).
    2. Demerger Section 49(2C) net book value cost apportionment (`parent_cost = avg_price * (1 - alpha)`, `spinoff_cost = (avg_price * alpha) / swap_ratio`).
    3. Section 55(2)(aa) bonus shares zero cost basis (`adjust_for_bonus_nil_cost`).
    4. Dividend tracking per holding.
  - *Frontend Implementation:* **PENDING.** No UI component exists in `research-os-frontend` to trigger corporate actions, review pending corporate actions, or approve adjustments.
  - *Test Coverage:* `corporate_actions.py` is not tested in `math-engine/tests/test_math_engine.py`.

---

#### Sub-area 5.3: Portfolio Metrics (5 Metric Clusters)

##### 17. Performance Metrics
- **Granular Metrics Audited:** Portfolio Value, Invested Value, Total P&L, Total Return %, XIRR, CAGR, Daily P&L, Monthly Return, YTD Return, Benchmark Return, Excess Return.
- **Status:** `Built` (Backend Math Engine) / `Partial/Stub` (Frontend UI)
- **Verifying File Paths & Line References:**
  - `math-engine/src/math_engine/__init__.py:1050-1158` (`PortfolioAnalyticsEngine`)
  - `math-engine/api/main.py:135-142` (`@app.post("/portfolio")`)
  - `research-os-frontend/src/app/portfolio/page.tsx:96-138, 164-174`
  - `research-os-frontend/src/components/widgets/PortfolioAnalytics.tsx:80-103, 136-168`
- **Production Readiness Notes:**
  - Backend implements deterministic calculations for TWR, Newton-Raphson XIRR, Annualized Return (CAGR), Benchmark Return, Excess Return, MTD, YTD, 1Y, 3Y, 5Y, and Inception return.
  - Frontend `portfolio/page.tsx` calculates Total Value, Invested Cost, Total P&L, and Total Return % on mock arrays.
  - Frontend `PortfolioAnalytics.tsx` period returns table displays MTD, YTD, 1Y, 3Y, 5Y, Inception, but fails to reach the backend due to missing Next.js API proxy route.

##### 18. Risk Metrics
- **Granular Metrics Audited:** Std Dev (Annualized Volatility), Portfolio Beta, Sharpe Ratio, Sortino Ratio.
- **Status:** `Built` (Backend Math Engine) / `Partial/Stub` (Frontend UI)
- **Verifying File Paths & Line References:**
  - `math-engine/src/math_engine/__init__.py:1076-1120`
  - `research-os-frontend/src/components/widgets/PortfolioRisk.tsx:1-32`
  - `research-os-frontend/src/components/widgets/PortfolioAnalytics.tsx:106-134`
  - `specs/portfolio-management/risk-metrics.md`
- **Production Readiness Notes:**
  - Backend accurately implements Annualized Volatility (`np.std(port_returns, ddof=1) * np.sqrt(252)`), Beta (`np.cov/np.var`), Sharpe Ratio (`(ann_ret - rf)/vol`), and Sortino Ratio (downside deviation measured against daily MAR $r_f / 252$).
  - Frontend displays static mock risk numbers in `PortfolioRisk.tsx` and `portfolio/page.tsx:121-137`.

##### 19. Construction & Diversification
- **Granular Metrics Audited:** No. of Holdings, Top 5/10 Concentration, Largest Position Weight, Sector Exposure, Market Cap Exposure, Cash Allocation.
- **Status:** `Partial/Stub` (Frontend) / `Pending` (Backend Engine)
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/page.tsx:105-120, 204-237`
  - `research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx:47-53`
  - `specs/portfolio-management/construction-diversification.md`
- **Production Readiness Notes:**
  - `portfolio/page.tsx:105-120` computes Sector Exposure and Market Cap Exposure from `MOCK_HOLDINGS`.
  - `PortfolioFitCheck.tsx:47-53` computes HHI and max sector weight.
  - Top 5/10 concentration, largest position weight, and cash allocation are missing from `PortfolioAnalyticsEngine` in `math-engine`.

##### 20. Valuation Metrics
- **Granular Metrics Audited:** Weighted Avg P/E, P/B, EV/EBITDA, Earnings Yield, PEG, EV/Sales.
- **Status:** `Partial/Stub` (Frontend) / `Pending` (Backend Engine)
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx:45`
  - `specs/portfolio-management/valuation-metrics.md`
- **Production Readiness Notes:**
  - `PortfolioFitCheck.tsx:45` computes weighted P/E using arithmetic weighting (`holdings.reduce((sum, h) => sum + h.weight * h.pe, 0)`), which violates financial standards. It must use the **Weighted Harmonic Mean**.
  - P/B, EV/EBITDA, Earnings Yield, PEG, and EV/Sales are not aggregated at the portfolio level in `math-engine`.

##### 21. Portfolio Fundamentals & Quality
- **Granular Metrics Audited:** ROE, ROCE, Revenue Growth, EPS Growth, EBITDA Growth, Net Profit Margin, Debt-to-Equity.
- **Status:** `Partial/Stub` (Frontend) / `Pending` (Backend Engine)
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx:46`
  - `specs/portfolio-management/fundamentals-quality.md`
- **Production Readiness Notes:**
  - Weighted ROE is computed arithmetically in `PortfolioFitCheck.tsx:46`.
  - ROCE, Revenue Growth, EPS Growth, EBITDA Growth, Net Profit Margin, and Net Debt-to-Equity are not aggregated in `math-engine`.

---

### Category 6: Current Portfolio & Trade History (2 tools)

#### 22. Current portfolio
- **Excel Category:** Current Portfolio
- **Excel Description:** A table containing details about the holdings such as asset class, quantity, average price, current value etc.
- **Data Source:** Taken from company page + submitted documents + calculations
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/page.tsx:249-305`
  - `research-os-frontend/src/components/widgets/PortfolioHoldings.tsx:1-41`
  - `postgres/init/01_schema.sql:313-334` (`holdings` table)
  - `specs/portfolio-management/current-holdings.md`
- **Production Readiness Notes:**
  - `portfolio/page.tsx:254-304` renders an holdings table with Symbol, Name, Sector, Qty, Avg Cost, Current Price, Current Value, P&L, P&L%, Portfolio Weight, and Entry Date.
  - Adding/editing holdings modal operates in local React state (`portfolio/page.tsx:381-407`).
  - Data is 100% mock (`MOCK_HOLDINGS` lines 37-45). No database persistence to Postgres `holdings` table.
  - Refresh Prices button has no live WebSocket or REST ticker attachment.

#### 23. Trade history
- **Excel Category:** Trade History
- **Excel Description:** A table containing details about the transactions like entry exit dates, realised gain/loss, entry/exit rationale.
- **Data Source:** taken from uploaded statements
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/portfolio/page.tsx:308-350`
  - `research-os-frontend/src/components/widgets/TransactionLog.tsx:1-41`
  - `postgres/init/01_schema.sql:337-360` (`transactions` table)
  - `specs/portfolio-management/trade-history.md`
- **Production Readiness Notes:**
  - `portfolio/page.tsx:308-350` renders a transaction table with Date, Symbol, Type, Qty, Price, Value, Charges, Net Value, and Rationale.
  - *Gaps:* Realized P&L column is missing from the table view; FIFO tax-lot matching is not implemented; data is static mock `MOCK_TRANSACTIONS` (lines 47-54); `TransactionLog.tsx` is an isolated 41-line stub.

---

### Category 7: Portfolio Risk (4 tools)

#### 24. Risk of portfolio
- **Excel Category:** Portfolio Risk
- **Excel Description:** A group of widgets containing aggregated risk data of portfolio stocks taken from company page. The risk should be displayed in a bar with 100% risk showing the bar as full.
- **Data Source:** Company page + calculations
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/PortfolioRisk.tsx:1-32`
  - `postgres/init/01_schema.sql:413-423` (`portfolio_risk` table)
  - `specs/portfolio-management/portfolio-risk.md`
- **Production Readiness Notes:**
  - `PortfolioRisk.tsx` renders 4 hardcoded items: Concentration (Top 3), Sector Exposure, Beta, VaR (95%).
  - Does NOT display the Excel-specified horizontal progress bar where 100% risk shows the bar full.
  - Does not aggregate holding-level risk scores from Company Page Risk tabs (business, financial, valuation, governance, macro).

#### 25. Event risk moniter
- **Excel Category:** Portfolio Risk
- **Excel Description:** A tab that records event risk in tables.
- **Data Source:** Manual entry
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/CatalystTracker.tsx:1-29`
  - `specs/portfolio-management/event-risk-monitor.md`
- **Production Readiness Notes:**
  - `CatalystTracker.tsx` is a 29-line static widget with 4 hardcoded events.
  - No tab exists in `portfolio/page.tsx` recording event risks in tables.
  - No form for manual event risk entry.

#### 26. Liquity Risk of the Portfolio
- **Excel Category:** Portfolio Risk
- **Excel Description:** Liquidity Risk assessment of portfolio holdings (T+1/T+2 liquidity, redemption capacity, ADV market impact).
- **Data Source:** Holdings + Market volume data
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `specs/portfolio-management/liquidity-risk.md:1-171`
- **Production Readiness Notes:**
  - No implementation exists across frontend or backend.
- **Feasibility & Architectural Prerequisites:**
  - Requires fetching 30-day Average Daily Volume (ADV) for constituent holdings from market data feeds.
  - Compute liquidation days at 10% ADV participation rate and market impact costs per Kyle's lambda.

#### 27. Valuation risk of the portfolio
- **Excel Category:** Portfolio Risk
- **Excel Description:** Valuation risk of portfolio (Weighted multiples vs historical percentiles, Margin of Safety, DCF upside/downside aggregation).
- **Data Source:** Holdings + Company page valuation models
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `specs/portfolio-management/valuation-risk.md:1-144`
- **Production Readiness Notes:**
  - No implementation exists across frontend or backend.
- **Feasibility & Architectural Prerequisites:**
  - Aggregate Company Page valuation models (DCF base/bear/bull fair values, P/E percentiles) across holdings weighted by portfolio allocation to determine aggregate Margin of Safety.

---

### Category 8: Watchlist (1 tool)

#### 28. Watchlist
- **Excel Category:** Watchlist
- **Excel Description:** A tool to create new company groups with customisable columns to choose the parameters displayed with the company. Once the parameters are decided, it should be saved for that particular watchlist until changed.
- **Data Source:** Company page
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/watchlist/page.tsx:1-416`
  - `research-os-frontend/src/components/widgets/WatchlistManager.tsx:1-278`
  - `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:56, 127`
  - `postgres/init/01_schema.sql:484-493` (`watchlists` table)
  - `specs/watchlist/watchlist.md`
- **Production Readiness Notes:**
  - *UI Implementation:* `WatchlistManager.tsx` provides an interactive table displaying Price, Change%, P/E, EV/EBITDA, ROE%, ROCE%, D/E, FCF Yield%, 52W Dist%, Sector, and Forensic Alerts.
  - *Column Customization Omission:* The Excel requirement demands: *"customisable columns to choose the parameters displayed with the company. Once the parameters are decided, it should be saved for that particular watchlist until changed."* The column list `COLUMNS` (lines 40-54) is hardcoded. There is no column visibility modal, column reordering, or saved column preference.
  - *Broken UI Actions:* The "Add Symbols" modal is disabled in code (`false && ...`, line 274).
  - *Persistence:* Uses local `MOCK_WATCHLISTS` (lines 17-22) and `MOCK_COMPANIES` (lines 24-38). No API connection to Postgres `watchlists` table (`01_schema.sql:484-493`).

---

### Category 9: Industry Deep Dive (11 tools — Standalone Page)

#### 29. Demand (Industry Deep Dive)
- **Excel Description:** A table to list down top 3 drivers of demand and their % of impact in a table format along with options to add additional rows and columns.
- **Data Source:** Uploaded reports + documents
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/DemandDrivers.tsx:1-30`
  - `postgres/init/01_schema.sql:464` (`industries.demand_drivers JSONB`)
  - `specs/industry-page/demand.md`
- **Production Readiness Notes:**
  - `DemandDrivers.tsx` renders 4 hardcoded items as progress bars.
  - It is NOT a table format, has NO options to add rows or columns, and has NO integration with uploaded reports or Document AI.

#### 30. Supply (Industry Deep Dive)
- **Excel Description:** Customizable table with option to add multiple headers and text rows under it.
- **Data Source:** uploaded reports + manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:465` (`industries.supply_dynamics JSONB`)
  - `specs/industry-page/supply.md`
- **Production Readiness Notes:**
  - Unimplemented in `research-os-frontend`. No nested table with expandable section headers (Capacity, Capex, Raw Material, Logistics).

#### 31. Risk (Industry Deep Dive)
- **Excel Description:** A table style widget to enter key risk factors of the industry with columns to enter values.
- **Data Source:** uploaded reports + manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:466` (`industries.risk_factors JSONB`)
  - `specs/industry-page/risk.md`
- **Production Readiness Notes:**
  - Unimplemented in `research-os-frontend`. No industry risk table widget exists.

#### 32. Regulations (Industry Deep Dive)
- **Excel Description:** A widget to enter key regulatory changes of the industry with columns to record potential impacts.
- **Data Source:** uploaded reports + manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:467` (`industries.regulations JSONB`)
  - `specs/industry-page/regulations.md`
- **Production Readiness Notes:**
  - Unimplemented in `research-os-frontend`.

#### 33. Demand Drivers (Industry Deep Dive)
- **Excel Description:** A widget to record important demand drivers of the industry with columns to record potential impacts.
- **Data Source:** Manual entry / Document AI
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/DemandDrivers.tsx:1-30`
  - `postgres/init/01_schema.sql:468` (`industries.demand_drivers_detail JSONB`)
  - `specs/industry-page/demand-drivers.md`
- **Production Readiness Notes:**
  - Same static bar chart widget as Tool 29. No recording or data entry capabilities.

#### 34. Cost drivers (Industry Deep Dive)
- **Excel Description:** A widget to record important cost drivers of the industry with columns to record potential impacts.
- **Data Source:** uploaded reports + manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:469` (`industries.cost_drivers JSONB`)
  - `specs/industry-page/cost-drivers.md`
- **Production Readiness Notes:**
  - Unimplemented in `research-os-frontend`.

#### 35. Cost Comparison (Industry Deep Dive)
- **Excel Description:** Cost comparison table across industry players.
- **Data Source:** Financial statements / manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:470` (`industries.cost_comparison JSONB`)
  - `specs/industry-page/cost-comparison.md`
- **Production Readiness Notes:**
  - Unimplemented in `research-os-frontend`.

#### 36. Companies table (Industry Deep Dive)
- **Excel Description:** A summary table of all the companies in the industry with filters to select columns.
- **Data Source:** company page
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/PeerComparisonTable.tsx:1-41`
  - `research-os-frontend/src/app/industry/page.tsx:179-208` (`IndustryCompareTable`)
  - `postgres/init/01_schema.sql:473` (`industries.company_symbols TEXT[]`)
  - `specs/industry-page/companies-table.md`
- **Production Readiness Notes:**
  - `PeerComparisonTable.tsx` contains 3 static rows.
  - `IndustryCompareTable` compares industry aggregates, not constituent companies of a selected industry.
  - Missing column selection filters.

#### 37. Industry aggregate (Industry Deep Dive)
- **Excel Description:** A table which summarises key paramters of the industry by adding the individual values of the companies in that industry. Including Revenue, balance sheet, profits and freecashflows.
- **Data Source:** company page + Manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:474` (`industries.aggregate_financials JSONB`)
  - `specs/industry-page/industry-aggregate.md`
- **Production Readiness Notes:**
  - Unimplemented in `research-os-frontend`. No aggregated Balance Sheet, P&L, or Free Cash Flow table aggregating constituent companies.

#### 38. Supply chain mapper (Industry Deep Dive)
- **Excel Description:** A tool that provides boxes and arrows to build a free flowing flow chart on a canvas.
- **Data Source:** Manual entry
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/ValueChainMapper.tsx:1-29`
  - `postgres/init/01_schema.sql:471` (`industries.supply_chain_map JSONB`)
  - `specs/industry-page/supply-chain-mapper.md`
- **Production Readiness Notes:**
  - Static 5-card row. No interactive canvas, no drag-and-drop boxes, and no arrow connections.

#### 39. Market sizing (Industry Deep Dive)
- **Excel Description:** A table to record market size on an yearly basis, with a column at the end that gives CAGR.
- **Data Source:** Uploaded documents + manual entry
- **Status:** `Pending`
- **Verifying File Paths & Line References:**
  - `postgres/init/01_schema.sql:472` (`industries.market_sizing JSONB`)
  - `specs/industry-page/industry-analysis.md`
- **Production Readiness Notes:**
  - Unimplemented. No yearly market size table with automated CAGR formula.

---

### Category 10: AI Tools (2 tools)

#### 40. Document ai
- **Excel Category:** AI Tools
- **Excel Description:** A tool that when inserted in a particular page will access the documents of that page. The tool must have option to write a question, filter the type of data to be used.
- **Data Source:** All internal data
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/documents/page.tsx:1-392`
  - `research-os-frontend/src/components/widgets/DocumentViewer.tsx:1-55`
  - `research-os-frontend/src/components/widgets/KeyDataExtractor.tsx:1-218`
  - `data-ingestion/api/main.py:66-115` (`/ingest`, `/chunk`, `/classify`, `/search`, `/embed`)
  - `postgres/init/01_schema.sql:31-81, 540-551` (`documents`, `document_chunks`, `rag_queries`)
  - `specs/document-ai/document-ai.md`
- **Production Readiness Notes:**
  - *UI Implementation:* `documents/page.tsx` features an institutional split-screen layout with document filtering, PDF viewer placeholder, and AI Extraction Console with confidence scores and citations.
  - *Data Wiring:* Upload is simulated client-side using `setTimeout` (lines 95-98) and does not persist to disk or object storage.
  - *Backend Gap:* In `data-ingestion/api/main.py:112-114`, the `/embed` endpoint returns pseudo-random floating-point vectors (`random.random() for _ in range(1024)`) instead of invoking a real embedding model (BGE-M3).

#### 41. AI assistant
- **Excel Category:** AI Tools
- **Excel Description:** Generates key insights upon automatically selecting a document.
- **Data Source:** All internal data
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/AIAssistant.tsx:1-196`
  - `research-os-frontend/src/components/widgets/SmartSummarizer.tsx:1-190`
  - `data-ingestion/api/main.py:96-104` (`@app.post("/search")`)
  - `specs/document-ai/ai-assistant.md`
- **Production Readiness Notes:**
  - `AIAssistant.tsx` provides a chat interface with suggestion pills and citation accordions.
  - *Mock Implementation:* `AIAssistant.tsx:74-106` uses simple client-side keyword matching (`query.toLowerCase().includes("revenue")`) against a hardcoded dictionary `MOCK_RESPONSES` (lines 25-46) with a 1-second simulated delay (`setTimeout`).
  - It does NOT call an LLM API or backend vector RAG pipeline.

---

### Category 11: Productivity / Execution (2 tools)

#### 42. To - Do Tracker
- **Excel Category:** Productivity / Execution
- **Excel Description:** A tool to assign and track tasks of multiple people through kanban boards.
- **Data Source:** manual entry
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/app/tasks/page.tsx:1-544`
  - `research-os-frontend/src/components/widgets/TodoTracker.tsx:1-223`
  - `research-os-frontend/src/components/widgets/KanbanBoard.tsx:1-154`
  - `postgres/init/01_schema.sql:499-522` (`tasks` table)
  - `specs/tasks-time/todo-tracker.md`
- **Production Readiness Notes:**
  - Full Kanban and list views with multi-assignee tracking ("Analyst 1", "Analyst 2", "Analyst 3"), priority badges (P1/P2/P3), due dates, and tags.
  - All task modifications operate on in-memory state (`MOCK_TASKS` in `tasks/page.tsx:37-46`). Refreshing the browser resets all edits.
  - No API endpoint connects the UI to PostgreSQL `tasks` table (`01_schema.sql:499-522`).

#### 43. Time tracker
- **Excel Category:** Productivity / Execution
- **Excel Description:** A tool to track time utilised by employees on various categories of tasks.
- **Data Source:** manual entry
- **Status:** `Partial/Stub`
- **Verifying File Paths & Line References:**
  - `research-os-frontend/src/components/widgets/TimeTracker.tsx:1-284`
  - `research-os-frontend/src/app/tasks/page.tsx:96-120`
  - `postgres/init/01_schema.sql:524-535` (`time_entries` table)
  - `specs/tasks-time/time-tracker.md`
- **Production Readiness Notes:**
  - Real-time active stopwatch timer with start/pause/stop and manual logging across 11 institutional research categories (`TIME_CATEGORIES` lines 18-29).
  - Time logging operates solely in React component state `useState(MOCK_ENTRIES)`.
  - No connection to PostgreSQL `time_entries` table.

---

## 4. Multidisciplinary Evaluation Across the 6 Institutional Lenses

### Lens 1: Financial Knowledge & Indian Regulatory Accounting
- **Union Budget 2024 Non-Compliance:** The Capital Gains import (`capital-gains-import.md`) and trade history modules are calibrated to pre-July 2024 rules (15% STCG / 10% LTCG with ₹1 Lakh exemption). They lack the mandated bifurcation for the July 23, 2024 budget amendment (Section 111A STCG 20%, Section 112A LTCG 12.5% with ₹1.25 Lakh exemption, and Section 55(2)(ac) grandfathering).
- **Corporate Action Statutory Adherence:** `CorporateActionsEngine` (`corporate_actions.py:66-78`) implements Section 49(2C) net book value cost allocation for demergers and Section 55(2)(aa) nil-cost bonus allocation. However, frontend exposure and contract note DP charge reconciliation are absent.

### Lens 2: Economic & Macro Indicators
- **Monetary Policy Realities:** `MacroDashboard.tsx` hardcodes the RBI Repo Rate at 6.5%, but lacks the post-April 2022 Standing Deposit Facility (SDF, 6.25%) floor and Marginal Standing Facility (MSF, 6.75%) ceiling corridor.
- **Data Ingestion Gaps:** Economic indicators are not wired to automated data scrapers or CCIL/MOSPI APIs.

### Lens 3: Fundamental Investor Logic & Decision Friction
- **GRWTH Workflow Divergence:** The platform’s core research philosophy (Generate $\to$ Research $\to$ Weigh $\to$ Track $\to$ Harvest) was diverted in `src/app/grwth/page.tsx` into a capex milestone schedule, preventing buy-side analysts from tracking investment ideas through the research pipeline.
- **Column Customizability Failure:** The Excel specification required customizable columns with source templates in both Idea Generation and Watchlist. Hardcoding these columns increases friction for institutional analysts.

### Lens 4: UI/UX Ergonomics & Interaction States
- **Information Density:** High-density institutional table layouts and dark/light mode themes are well-designed with Lucide icons and Badges.
- **Broken Modals:** In `WatchlistManager.tsx:274`, the "Add Symbols" modal was left disabled (`false && ... null`), making it impossible to add stocks to a watchlist via the UI.
- **Missing Loading/Error Recovery:** When API calls fail (e.g. `/api/data-ingestion/macro-dashboard`), widgets silently fall back to mock data rather than showing actionable error diagnostics.

### Lens 5: Mathematical & Forensic Rigor
- **Portfolio Multiples:** `PortfolioFitCheck.tsx:45` computes weighted P/E using an arithmetic mean rather than the required **Weighted Harmonic Mean**:
  $$\text{Weighted Harmonic P/E} = \frac{1}{\sum_{i=1}^N \frac{w_i}{P/E_i}}$$
  This creates upward distortion for portfolios containing high-multiple growth stocks.
- **Analytics Engine Rigor:** `PortfolioAnalyticsEngine` in `math-engine` implements Brent/Newton-Raphson XIRR, Daily returns linking, Sortino ratio measured against daily MAR, and drawdown duration tracking.

### Lens 6: Data Plumbing, Docker Builds & Pipeline Integrity
- **Build Failure:** The frontend fails `npm run build` due to missing `react-is` (recharts) and `next-auth` packages.
- **API Proxy Omission:** Next.js lacks backend proxy handlers for `/api/math-engine/*` and `/api/data-ingestion/*`, leaving frontend widgets isolated from functional FastAPI services.
- **Database Schema Completeness:** `postgres/init/01_schema.sql` is well-architected (26KB, 581 lines) and covers all 11 categories with pgvector embeddings, triggers, and indices.

---

## 5. Architectural Gap Remediation Roadmap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CLUSTER C ARCHITECTURAL REMEDIATION ROADMAP                     │
├──────┬─────────────────────────┬───────────────────────────────────────────────────────┤
│ Tier │ Target Area             │ Action Items                                          │
├──────┼─────────────────────────┼───────────────────────────────────────────────────────┤
│  P0  │ Frontend Build Repair   │ Install `react-is` and configure NextAuth credentials │
│  P0  │ API Proxy Routes        │ Add Next.js route handlers forwarding to FastAPIs     │
│  P0  │ GRWTH Pipeline Align    │ Realign `grwth/page.tsx` to 5 GRWTH research stages   │
│  P1  │ DB Persistence Wiring   │ Wire IdeaGeneration, Watchlist, Tasks, Time to Postgres│
│  P1  │ Corporate Actions UI    │ Build frontend UI for `CorporateActionsEngine`        │
│  P1  │ Harmonic Portfolio P/E  │ Replace arithmetic P/E with Weighted Harmonic Mean    │
│  P2  │ Missing Industry Tables │ Implement nested Supply, Cost, Regulations widgets    │
│  P2  │ Vector RAG Integration  │ Replace mock embeddings with BGE-M3 in Data Ingestion │
└──────┴─────────────────────────┴───────────────────────────────────────────────────────┘
```
