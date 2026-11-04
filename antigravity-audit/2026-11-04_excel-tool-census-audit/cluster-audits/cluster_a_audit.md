# Comprehensive Codebase Audit Report: Cluster A Tools
**Milestone:** Research OS Comprehensive Audit — Cluster A (36 Tools)  
**Auditor Archetype:** Explorer 1 (`explorer_audit_cluster_a`)  
**Timestamp:** 2026-11-04T08:15:00Z  
**Parent Orchestrator ID:** `374d5ac0-b7d9-4376-bd64-de7eda21aa53`  
**Audit Scope:** 36 Tools across 9 Categories: Overview (7), Management & Execution (6), Story (4), Analysis (5), Valuation (6), Financials (4), Cost (1), Working Capital (1), Downsides (2).  
**Repository State:** origin/main at `c:\Users\aaaut\OneDrive\Desktop\Antigravity\ROS Hermes`

---

## 1. Executive Summary & Audit Statistics

### 1.1 Cluster A Implementation Summary

| Category | Total Tools | Built (End-to-End) | Partial / Stub | Pending | % Functionally Wired |
|---|:---:|:---:|:---:|:---:|:---:|
| **1. Overview** | 7 | 0 | 0 | 7 | 0% |
| **2. Management & Execution** | 6 | 0 | 2 | 4 | 33% |
| **3. Story** | 4 | 0 | 0 | 4 | 0% |
| **4. Analysis** | 5 | 0 | 3 | 2 | 60% |
| **5. Valuation** | 6 | 0 | 5 | 1 | 83% |
| **6. Financials** | 4 | 0 | 3 | 1 | 75% |
| **7. Cost** | 1 | 0 | 1 | 0 | 100% (via CommonSize) |
| **8. Working Capital** | 1 | 0 | 1 | 0 | 100% (via Ratio/CommonSize) |
| **9. Downsides** | 2 | 0 | 1 | 1 | 50% |
| **TOTAL** | **36** | **0** | **16** | **20** | **44.4%** |

*Note on Status Definition:*
- **Built (0)**: Requires fully verified functional calculation logic AND active live data wiring (DB or document ingestion) with no hardcoded fallback stubs. No tool in Cluster A currently meets the strict zero-mock data criteria because all frontend widgets are seeded with static `MOCK_INPUT` constants.
- **Partial / Stub (16)**: Tools with real calculation engines, FastAPI endpoints, and/or interactive React widgets, but relying on hardcoded mock input data (`MOCK_INPUT`), lacking database persistence, or lacking golden vector unit tests.
- **Pending (20)**: Tools where specifications exist in `specs/` and table schemas exist in `postgres/init/01_schema.sql`, but no dedicated React component, calculation engine, or API endpoint has been implemented.

---

## 2. Empirical Test Execution & Build Verification

### 2.1 Math Engine Automated Test Suite (`pytest`)
- **Command:** `cd math-engine ; .venv\Scripts\pytest.exe tests/test_math_engine.py`
- **Result:** **36 PASSED in 1.51s (100% pass rate)**
- **Coverage Summary:**
  - `TestDCFEngine`: 4 passed (standard DCF, deterministic check, validation errors, terminal growth guard).
  - `TestRelativeValuationEngine`: 4 passed (multiples, harmonic mean, deterministic check).
  - `TestSOTPEngine`: 3 passed (segment values, holdco discount, deterministic check).
  - `TestBankingValuationEngine`: 3 passed (ABVPS, residual income, deterministic check).
  - `TestExcessReturnEngine`: 3 passed (clean surplus, Ohlson persistence, deterministic check).
  - `TestBeneishEngine`: 3 passed (M-Score, Enron vector, deterministic check).
  - `TestAltmanZEngine`: 5 passed (distress, grey, safe zones, non-mfg, deterministic check).
  - `TestPiotroskiEngine`: 4 passed (high, moderate, low quality, deterministic check).
  - `TestPortfolioAnalyticsEngine`: 3 passed (upward trend, flat portfolio, deterministic check).
  - `TestScreeningEngine`: 2 passed (multi-factor filter, deterministic check).
  - `TestMathEngineRegistry`: 3 passed (list, get, invalid engine).
  - `TestConvenienceFunctions`: 3 passed (run_dcf, run_beneish, run_screening).
- **Critical Audit Finding:** The 36 pytest tests only cover the initial 10 Phase 1 engines. **Zero automated unit tests** exist in `tests/test_math_engine.py` for the newer engines implemented in `src/math_engine/__init__.py`:
  - `ConcallConsistencyEngine` (no tests)
  - `RatioAnalysisEngine` (no tests)
  - `TurnaroundEngine` (no tests)
  - `HedgingEngine` (no tests)
  - `RiskScoreEngine` (no tests)
  - `CommonSizeEngine` (no tests)
  - `RevenueProjectionEngine` (no tests)

### 2.2 Data Ingestion Automated Test Suite (`pytest`)
- **Command:** `cd data-ingestion ; .venv\Scripts\pytest.exe tests/test_data_ingestion.py`
- **Result:** **13 PASSED in 0.93s (100% pass rate)**
- **Coverage Summary:**
  - `TestMockDataSandbox`: 6 passed (RELIANCE, TCS, HDFCBANK snapshots, unknown company, all companies).
  - `TestDocumentMetadata`: 2 passed (metadata creation, hash generation).
  - `TestPITTransformer`: 2 passed (PIT point-in-time timestamp tagging, revision handling).
  - `TestDataSourceIntegration`: 3 passed (ScreenerSource, BSENSESource mock fetchers).

### 2.3 Frontend Production Build (`npm run build`)
- **Command:** `cd research-os-frontend ; npm run build`
- **Result:** **FAILED (Compilation / Webpack Errors)**
- **Verbatim Error Output:**
  ```text
  Failed to compile.
  ./node_modules/recharts/es6/util/ReactUtils.js
  Module not found: Can't resolve 'react-is'
  Import trace for requested module:
  ./node_modules/recharts/es6/cartesian/Bar.js
  ./src/components/widgets/FinancialCharts.tsx
  ./src/components/widgets/WidgetRegistry.tsx
  ./src/app/generate-ideas/page.tsx

  ./src/app/auth/signin/page.tsx
  Module not found: Can't resolve 'next-auth/react'

  ./src/lib/auth.ts
  Module not found: Can't resolve 'next-auth'
  Import trace for requested module:
  ./src/app/api/auth/[...nextauth]/route.ts

  ./src/lib/auth.ts
  Module not found: Can't resolve 'next-auth/providers/credentials'
  ```
- **Root Cause Analysis:**
  1. `react-is` is missing from `dependencies` in `package.json`, causing `recharts` to break during Next.js production bundling.
  2. `next-auth` is installed at version `^5.0.0-beta.32` but dependencies or exports are misconfigured for Next.js App Router API routes.
  3. No `npm test` script is configured in `package.json`.

---

## 3. Subsystem Architecture & Plumbing Audit

### 3.1 PostgreSQL Database Schemas (`postgres/init/01_schema.sql`)
The PostgreSQL schema is surprisingly thorough, well-indexed, and includes designated tables with JSONB fields for every single Company Page tab:
- `company_overview` (lines 147–159): `about_company`, `entry_rationale`, `exit_rationale`, `thesis_snapshot`, `decision_terminal`, `tracking_table`, `latest_changes`.
- `company_management` (lines 162–173): `background`, `shareholding_pattern`, `track_record`, `concall_consistency`, `capital_allocation`, `red_flags`.
- `company_story` (lines 176–185): `business_model`, `economic_moat`, `current_growth_drivers`, `future_growth_drivers`.
- `company_analysis` (lines 216–232): `concall_tracker`, `ratio_analysis`, `recent_events`, `turnaround_indicators`, `exit_checklist`, `valuation_philosophy`, `dcf_model`, `relative_model`, `sotp_model`, `banking_model`, `excess_return_model`.
- `company_financials` (lines 235–246): `financial_statements`, `segment_breakup`, `revenue_projections`, `common_size`, `cost_breakup`, `wc_breakup`.
- `company_downsides` (lines 265–273): `key_events`, `hedging_mechanism`, `forensic_analysis`.

**Plumbing Disconnect:** Despite these tables existing in PostgreSQL, **there are zero Next.js API routes or Supabase clients** querying or updating these tables from the frontend. The file `src/lib/supabase.ts` instantiates a Supabase client, but grep reveals that `supabase.` is never called in any frontend component or page.

### 3.2 Vercel Gateway & Service Routing (`vercel.json`)
The monorepo connects frontend to microservices via Vercel rewrites:
- `/api/data-ingestion/(.*)` -> `data-ingestion` service (`api/main.py`)
- `/api/math-engine/(.*)` -> `math-engine` service (`api/main.py`)
Both services expose standard CORS middleware and FastAPI endpoints. However, in local offline mode without Docker or Vercel CLI running, `/api/math-engine/*` calls from the browser fail unless proxied.

### 3.3 Company Page Dynamic Tab Architecture (`src/app/company/[symbol]/`)
- `layout.tsx:8-18`: Defines 10 navigation tabs: `overview`, `story`, `management`, `governance`, `financials`, `valuation`, `risk`, `sme`, `working-capital`, `downsides`.
- `layout.tsx:36-39`: Renders a static hardcoded conviction badge: `<span className="text-sm font-semibold text-amber-500">High</span>`.
- `page.tsx:7-18`: Defines `TAB_CONTENT` widget mappings. Many tabs mount generic placeholders instead of category-specific tools:
  - `overview` mounts `["kpi-cards", "financial-charts", "valuation-summary", "risk-assessment"]` (omits all 7 Overview tools).
  - `story` mounts `["financial-charts", "valuation-summary", "peer-comparison"]` (omits all 4 Story tools).
  - `working-capital` mounts `["financial-charts", "kpi-cards", "common-size"]` (omits dedicated WC breakup table).

---

## 4. Granular Audit of All 36 Cluster A Tools

### Category 1: Overview (7 Tools)

#### 1. About the company
- **Excel Category:** Overview
- **Excel Description:** Basis breakdown of the company
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/about-company.md:1-261`
  - DB Schema: `postgres/init/01_schema.sql:150` (`company_overview.about_company TEXT`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:95` (`about_company?: string` in `CompanyOverview`)
  - Page Wiring: `research-os-frontend/src/app/company/[symbol]/page.tsx:8` (omitted from `overview` tab)
  - UI Component: Missing. (`src/components/company/overview/AboutCompany.tsx` does not exist).
- **Production Readiness Notes:**
  - Completely un-implemented at UI and API layers.
  - Document AI service has chunking (`POST /chunk`) and classification (`POST /classify`) in `data-ingestion/api/main.py:79-95`, but no dedicated business description extractor for annual reports.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - Backend: Add extraction route in `data-ingestion/api/main.py` targeting company overview sections in annual reports/presentations.
  - API Contract: `GET /api/company/:symbol/overview` returning `{ about_company: string, sector: string, industry: string }`.
  - Frontend: Build `AboutCompany.tsx` with rich text view/edit mode and wire into `TAB_CONTENT.overview`.

#### 2. Entry rationale
- **Excel Category:** Overview
- **Excel Description:** This will be a text box
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/entry-rationale.md:1-220`
  - DB Schema: `postgres/init/01_schema.sql:151` (`company_overview.entry_rationale TEXT`), `holdings.entry_rationale TEXT:327`, `transactions.entry_rationale TEXT:349`
  - TS Interface: `research-os-frontend/src/lib/types.ts:96` (`entry_rationale?: string`)
  - Frontend: Generic unlinked widgets `SimpleTextBox.tsx:1-59` and `CustomText.tsx:1-14` exist, but no `EntryRationale.tsx` exists and neither is mounted on `overview`.
- **Production Readiness Notes:**
  - No connection to user notes, no auto-save debounce, no persistence to `company_overview`.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - API Contract: `PATCH /api/company/:symbol/overview` `{ entry_rationale: string }`.
  - Frontend: Create `EntryRationale.tsx` text area with markdown support and auto-save.

#### 3. Exit rationale
- **Excel Category:** Overview
- **Excel Description:** This will be a text box
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/exit-rationale.md:1-210`
  - DB Schema: `postgres/init/01_schema.sql:152` (`company_overview.exit_rationale TEXT`), `transactions.exit_rationale TEXT:350`
  - TS Interface: `research-os-frontend/src/lib/types.ts:97` (`exit_rationale?: string`)
  - Frontend: No dedicated component. Omitted from `overview` tab.
- **Production Readiness Notes:**
  - Completely un-implemented.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - Prerequisites: Pair with `ExitChecklist` so triggering an exit condition automatically prompts for exit rationale.

#### 4. Thesis snapshot
- **Excel Category:** Overview
- **Excel Description:** [Empty in original sheet]
- **Data Source:** Manual / Document AI
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/thesis-snapshot.md:1-160`
  - DB Schema: `postgres/init/01_schema.sql:153` (`company_overview.thesis_snapshot TEXT`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:98` (`thesis_snapshot?: string`)
  - Frontend: `research-os-frontend/src/components/widgets/MultiTextBox.tsx:22` includes a mock note `"RELIANCE Thesis"`, but `MultiTextBox` is not mounted on the `overview` tab and is not persistent.
- **Production Readiness Notes:**
  - No structured 3-part thesis card (Core Pillars, Asymmetric Upside, Key Risks) exists on the Company Overview.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - Frontend: Create `ThesisSnapshot.tsx` featuring Bull/Base/Bear scenarios and catalyst milestones.

#### 5. Decision terminal
- **Excel Category:** Overview
- **Excel Description:** This will be a dropdown box where you can tag your conviction in the company based upon 3 parameters
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/decision-terminal.md:1-62`
  - DB Schema: `postgres/init/01_schema.sql:154` (`company_overview.decision_terminal JSONB DEFAULT '{}'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:99` (`decision_terminal?: Record<string, any>`)
  - Layout Stub: `research-os-frontend/src/app/company/[symbol]/layout.tsx:36-39` renders static `<span className="text-sm font-semibold text-amber-500">High</span>`.
  - Frontend: `ConvictionSizing.tsx:1-141` implements a portfolio-level position sizing table, but not the 3-parameter conviction tagger.
- **Production Readiness Notes:**
  - The 3 parameters defined in `decision-terminal.md` (Business Quality [40%], Valuation Comfort [35%], Portfolio Fit [25%]) and composite calculation `(BQ*0.4 + VC*0.35 + PF*0.25)` are completely missing.
  - The static text in the layout header provides no interactivity or persistence.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - Frontend: Build `DecisionTerminal.tsx` with 3 dropdown selectors and composite conviction badge, and mount in the persistent company header.

#### 6. Tracking
- **Excel Category:** Overview
- **Excel Description:** A customisable table that tracks key factors of the company that determines whether to invest or not. The table will be flexible to choose what goes in rows and coloumns
- **Data Source:** Manual / Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/tracking-table.md:1-180`
  - DB Schema: `postgres/init/01_schema.sql:155` (`company_overview.tracking_table JSONB DEFAULT '{}'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:100` (`tracking_table?: Record<string, any>`)
  - Frontend: `FilteredTable.tsx:1-142` exists but is a multi-company peer screener, not a customisable single-company tracking matrix.
- **Production Readiness Notes:**
  - No user-configurable rows/columns factor matrix exists.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: Medium.
  - Frontend: Implement dynamic editable grid using `@tanstack/react-table` stored in `company_overview.tracking_table`.

#### 7. Latest changes
- **Excel Category:** Overview
- **Excel Description:** A text box with a second box to select the imapct of the event (neutral, negative, positive)
- **Data Source:** Manual / Document AI / Filings
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/overview/latest-changes.md:1-137`
  - DB Schema: `postgres/init/01_schema.sql:156` (`company_overview.latest_changes JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:101` (`latest_changes?: any[]`)
  - Frontend: `CatalystTracker.tsx:1-31` displays 4 hardcoded upcoming dates, but lacks the event impact selector (neutral, negative, positive) and text entry.
- **Production Readiness Notes:**
  - No component currently provides an event description box paired with a sentiment/impact dropdown.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - Frontend: Build `LatestChanges.tsx` with timeline feed, impact tags (🟢 Positive, 🟡 Neutral, 🔴 Negative), and source URL attachment.

---

### Category 2: Management & Execution (6 Tools)

#### 8. management Background
- **Excel Category:** Management & Execution
- **Excel Description:** A table containing key details about the management of the company.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/management/management-background.md:1-150`
  - DB Schema: `postgres/init/01_schema.sql:165` (`company_management.background JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:108` (`background?: any[]`)
  - Frontend: Missing component. Omitted from `management` tab.
- **Production Readiness Notes:**
  - No executive background table exists in the frontend.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - Data Ingestion: Add table extractor in `data-ingestion/src/data_ingestion/extractors/` for Board of Directors and KMP profiles from Corporate Governance disclosures.

#### 9. Shareholding pattern of the companies
- **Excel Category:** Management & Execution
- **Excel Description:** Shareholding pattern of the companies can take it from documents and should have an option to add our comment after every entity
- **Data Source:** Documents Upload, Document Ai + Manual entry for notes
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/management/shareholding-pattern.md:1-180`
  - Component: `research-os-frontend/src/components/widgets/OwnershipAnalysis.tsx:1-35`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:10` (mounted on `management` tab) and `page.tsx:15` (`sme` tab)
  - DB Schema: `postgres/init/01_schema.sql:166` (`company_management.shareholding_pattern JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:109` (`shareholding_pattern?: any[]`)
- **Production Readiness Notes:**
  - `OwnershipAnalysis.tsx:3-8` hardcodes static values (`Promoter: 52.3%`, `FII: 18.2%`, `DII: 12.1%`, `Retail: 17.4%`).
  - Gaps against spec: Lacks entity-level comment fields ("option to add our comment after every entity"), lacks promoter pledge / encumbrance breakdown (SEBI SAST Reg 31), and has zero backend data wiring.

#### 10. Track record
- **Excel Category:** Management & Execution
- **Excel Description:** A table containing historical milestones and performance of the company.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/management/track-record.md:1-140`
  - DB Schema: `postgres/init/01_schema.sql:167` (`company_management.track_record JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:110` (`track_record?: any[]`)
  - Frontend: Missing component.
- **Production Readiness Notes:**
  - Historical milestones and performance table is completely absent.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 11. Concall consistency
- **Excel Category:** Management & Execution
- **Excel Description:** Tracks the growth guidance promised vs delivered for multiple quarters to track man
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/management/concall-consistency.md:1-160` and `specs/engines/concall-consistency-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:2405-2500` (`ConcallConsistencyEngine`)
  - API Endpoint: `math-engine/api/main.py:209-215` (`POST /concall-consistency`)
  - Frontend Widget 1: `research-os-frontend/src/components/widgets/ConcallConsistency.tsx:1-150`
  - Frontend Widget 2: `research-os-frontend/src/components/widgets/ManagementConsistency.tsx:1-351`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:10` (mounted on `management` tab)
  - DB Schema: `postgres/init/01_schema.sql:168` (`company_management.concall_consistency JSONB DEFAULT '[]'`)
- **Production Readiness Notes:**
  - Backend math logic is complete: range parsing (Beat/Met/Miss), type weighting (revenue 30%, margin 35%, capex 20%, qualitative 15%), time decay ($\lambda = 0.85$), and input hashing.
  - Frontend widgets render rich visual scorecards.
  - Gaps: Frontend widget seeds data from hardcoded `MOCK_INPUT` (`RELIANCE`). There is no live parsing of concall transcripts to populate guidance items. No automated unit tests in `math-engine/tests/test_math_engine.py`.

#### 12. Capital allocation
- **Excel Category:** Management & Execution
- **Excel Description:** [Empty in original sheet]
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/management/capital-allocation.md:1-160`
  - DB Schema: `postgres/init/01_schema.sql:169` (`company_management.capital_allocation JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:112` (`capital_allocation?: any[]`)
  - Frontend: Missing component.
- **Production Readiness Notes:**
  - No capital allocation matrix (Capex vs M&A vs Dividends vs Buybacks) or ROIIC calculation.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High. Can be derived automatically from Cash Flow Statement and Balance Sheet.

#### 13. Red flags
- **Excel Category:** Management & Execution
- **Excel Description:** A text table that tracks key factors like related party transactions, auditor changes, etc
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/management/red-flags.md:1-136`
  - DB Schema: `postgres/init/01_schema.sql:170` (`company_management.red_flags JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:113` (`red_flags?: any[]`)
  - Distinct Widget: `ForensicFlags.tsx:1-347` exists on `governance` tab, but it calculates quantitative scores (Beneish, Altman, Piotroski), not the qualitative governance red flags table.
- **Production Readiness Notes:**
  - No text table component exists for qualitative governance red flags (RPTs, auditor changes, CARO qualifications).
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

---

### Category 3: Story (4 Tools)

#### 14. Business model
- **Excel Category:** Story
- **Excel Description:** This will be a text box
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/story/business-model.md:1-110`
  - DB Schema: `postgres/init/01_schema.sql:179` (`company_story.business_model TEXT`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:120` (`business_model?: string`)
  - Tab Mapping: `research-os-frontend/src/app/company/[symbol]/page.tsx:9` mounts `["financial-charts", "valuation-summary", "peer-comparison"]`, completely omitting business model tools.
- **Production Readiness Notes:**
  - Completely un-implemented in UI.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 15. Economic moat
- **Excel Category:** Story
- **Excel Description:** This will be a text box and data should be pulled from statements
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/story/economic-moat.md:1-150`
  - DB Schema: `postgres/init/01_schema.sql:180` (`company_story.economic_moat TEXT`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:121` (`economic_moat?: string`)
  - Frontend: Missing component.
- **Production Readiness Notes:**
  - Un-implemented.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 16. Current growth drivers
- **Excel Category:** Story
- **Excel Description:** This will be a text box where we can add the growth drivers of the company, there will 2 other coloumns as well which will contain market size.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/story/current-growth-drivers.md:1-140`
  - DB Schema: `postgres/init/01_schema.sql:181` (`company_story.current_growth_drivers JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:122` (`current_growth_drivers?: any[]`)
  - Generic Widget: `DemandDrivers.tsx:1-30` exists, but is an industry macro widget, not a company-level 3-column table.
- **Production Readiness Notes:**
  - 3-column growth driver table is missing.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.
  - UI Component: Build `GrowthDriversTable.tsx` with columns: [Growth Driver, Market Size, Market Size Source].

#### 17. Future growth drivers
- **Excel Category:** Story
- **Excel Description:** Same as above
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/story/future-growth-drivers.md:1-140`
  - DB Schema: `postgres/init/01_schema.sql:182` (`company_story.future_growth_drivers JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:123` (`future_growth_drivers?: any[]`)
  - Frontend: Missing component.
- **Production Readiness Notes:**
  - Un-implemented.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

---

### Category 4: Analysis (5 Tools)

#### 18. Concall tracker
- **Excel Category:** Analysis
- **Excel Description:** Usually companies have quarterly conference calls, we will provide a premade template that should be customisable and then we can add the relvant data quarter wise
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/analysis/concall-tracker.md:1-138`
  - DB Schema: `postgres/init/01_schema.sql:219` (`company_analysis.concall_tracker JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:154` (`concall_tracker?: any[]`)
  - Frontend: Missing component.
- **Production Readiness Notes:**
  - Does not have a quarterly customizable template editor for manual note entry.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 19. Exit tool
- **Excel Category:** Analysis
- **Excel Description:** a checklist tool with pre customizable defined parameters which when triggered will indicate exitng the investment.
- **Data Source:** Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/analysis/exit-checklist.md:1-140`
  - Component: `research-os-frontend/src/components/widgets/Checklist.tsx:1-30`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:11` (`governance`) and `page.tsx:17` (`downsides`)
  - DB Schema: `postgres/init/01_schema.sql:223` (`company_analysis.exit_checklist JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:158` (`exit_checklist?: any[]`)
- **Production Readiness Notes:**
  - `Checklist.tsx` is a generic checklist of 6 hardcoded static items.
  - Lacks customizable exit parameters, threshold trigger indicators, and thesis breach actions.

#### 20. Ratio Analysis
- **Excel Category:** Analysis
- **Excel Description:** These are ratios that will be calculated by using data from financial statements, we will have to use some formulas over the data which we have in statements.
- **Data Source:** Financial statements + Formula
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/analysis/ratio-analysis.md:1-150` and `specs/engines/ratio-analysis-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:1559-1750` (`RatioAnalysisEngine`)
  - API Endpoint: `math-engine/api/main.py:155-161` (`POST /ratio-analysis`)
  - Frontend Component: `research-os-frontend/src/components/widgets/RatioAnalysis.tsx:1-213`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:12` (mounted on `financials` tab)
  - DB Schema: `postgres/init/01_schema.sql:220` (`company_analysis.ratio_analysis JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - Math engine is comprehensive and handles corporate vs banking entity branching, safe division with "NM" handling, distress flags, and full financial ratio suites.
  - Gaps: Frontend widget calls API with hardcoded `MOCK_INPUT` (`RELIANCE`). Not connected to `company_financials.financial_statements`. Zero unit tests in `math-engine/tests/test_math_engine.py`.

#### 21. Recent events
- **Excel Category:** Analysis
- **Excel Description:** A tool to track latest events such as M&A, spinoffs etc in a text table.
- **Data Source:** Manual entry + uploaded reports
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/analysis/recent-events.md:1-130`
  - DB Schema: `postgres/init/01_schema.sql:221` (`company_analysis.recent_events JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:156` (`recent_events?: any[]`)
  - Frontend: Missing component.
- **Production Readiness Notes:**
  - Un-implemented text table for M&A, spinoffs, and demergers.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 22. Turnaround Indicator
- **Excel Category:** Analysis
- **Excel Description:** A tool to track certain parameters of companies that are critical to track turnaround companies
- **Data Source:** Financial statement
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/analysis/turnaround-indicator.md:1-140` and `specs/engines/turnaround-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:1901-2000` (`TurnaroundEngine`)
  - API Endpoint: `math-engine/api/main.py:164-170` (`POST /turnaround`)
  - Frontend Component: `research-os-frontend/src/components/widgets/TurnaroundIndicator.tsx:1-184`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:15` (mounted on `sme` tab)
  - DB Schema: `postgres/init/01_schema.sql:222` (`company_analysis.turnaround_indicators JSONB DEFAULT '[]'`)
- **Production Readiness Notes:**
  - Math Engine is complete: computes 7 inflection signals (ROE inflection, debt reduction, positive CFO, margin expansion, EBITDA growth, interest coverage, asset turnover) with dilution penalty and conviction score.
  - Gaps: Frontend uses hardcoded `MOCK_INPUT` (`TATAMOTORS`). No golden vector tests in `math-engine/tests/test_math_engine.py`.

---

### Category 5: Valuation (6 Tools)

#### 23. Valuation Philosophy
- **Excel Category:** Valuation
- **Excel Description:** This will be a text box
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/valuation/valuation-philosophy.md:1-250`
  - DB Schema: `postgres/init/01_schema.sql:224` (`company_analysis.valuation_philosophy TEXT`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:159` (`valuation_philosophy?: string`)
  - Frontend: Missing component. Omitted from `valuation` tab.
- **Production Readiness Notes:**
  - Un-implemented.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 24. Step 4, DCF
- **Excel Category:** Valuation
- **Excel Description:** This is a valuation technique where we will provide predefined template and it should be customizable
- **Data Source:** Source Data From Documents + Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/valuation/dcf-valuation.md:1-160` and `specs/engines/dcf-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:388-550` (`DCFEngine`)
  - API Endpoint: `math-engine/api/main.py:53-59` (`POST /dcf`)
  - Frontend Component: `research-os-frontend/src/components/widgets/DCFValuation.tsx:1-299`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:13` (mounted on `valuation` tab)
  - Golden Vector Tests: `math-engine/tests/test_math_engine.py:40-190` (4 passing tests)
  - DB Schema: `postgres/init/01_schema.sql:225` (`company_analysis.dcf_model JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - High quality implementation: FCFF projections, mid-year discounting, WACC singularity guard, Gordon Growth, Exit Multiple, net debt bridge, and 7x7 sensitivity matrix.
  - Frontend provides interactive sliders and input fields with live recalculation.
  - Gaps: Base inputs in `DCFValuation.tsx:16-43` are hardcoded in `MOCK_INPUT` (`RELIANCE`). Model state and user changes are not persisted to `company_analysis.dcf_model`.

#### 25. Relative company model
- **Excel Category:** Valuation
- **Excel Description:** This is a valuation technique where we will provide predifined template and it should be customizable
- **Data Source:** Source Data From Documents + Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/valuation/relative-valuation.md:1-170` and `specs/engines/relative-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:557-695` (`RelativeValuationEngine`)
  - API Endpoint: `math-engine/api/main.py:72-78` (`POST /relative`)
  - Frontend Component: `research-os-frontend/src/components/widgets/RelativeValuation.tsx:1-181`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:13` (mounted on `valuation` tab)
  - Golden Vector Tests: `math-engine/tests/test_math_engine.py:192-310` (4 passing tests)
  - DB Schema: `postgres/init/01_schema.sql:226` (`company_analysis.relative_model JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - Robust backend calculation: harmonic mean P/E, median/p25/p75 peer multiples, EV-to-Equity bridges with lease liabilities and minority interest.
  - Gaps: Frontend uses hardcoded `MOCK_INPUT` (`RELIANCE`). No dynamic peer selection. No persistence to `company_analysis.relative_model`.

#### 26. SOTP
- **Excel Category:** Valuation
- **Excel Description:** This is a valuation technique where we will provide predefined template and it should be customizable
- Data Source: Source Data From Documents + Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/valuation/sotp-valuation.md:1-180` and `specs/engines/sotp-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:700-780` (`SOTPEngine`)
  - API Endpoint: `math-engine/api/main.py:81-87` (`POST /sotp`)
  - Frontend Component: `research-os-frontend/src/components/widgets/SOTPValuation.tsx:1-186`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:13` (mounted on `valuation` tab)
  - Golden Vector Tests: `math-engine/tests/test_math_engine.py:312-400` (3 passing tests)
  - DB Schema: `postgres/init/01_schema.sql:227` (`company_analysis.sotp_model JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - Engine supports Enterprise Value vs Equity Value segments, effective stakes, holdco discounts (20%-60%), and corporate debt bridges.
  - Gaps: Frontend uses hardcoded `MOCK_INPUT` (`RELIANCE: O2C, Retail, Digital/Jio, Upstream`). Does not permit adding/removing segments in the UI. No persistence to `company_analysis.sotp_model`.

#### 27. Banking (P/B, ROE)
- **Excel Category:** Valuation
- **Excel Description:** This is a valuation technique where we will provide predefined template and it should be customizable
- **Data Source:** Source Data From Documents + Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/valuation/banking-valuation.md:1-160` and `specs/engines/banking-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:850-950` (`BankingValuationEngine`)
  - API Endpoint: `math-engine/api/main.py:90-96` (`POST /banking`)
  - Frontend Component: `research-os-frontend/src/components/widgets/BankingValuation.tsx:1-185`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:13` (mounted on `valuation` tab)
  - Golden Vector Tests: `math-engine/tests/test_math_engine.py:402-480` (3 passing tests)
  - DB Schema: `postgres/init/01_schema.sql:228` (`company_analysis.banking_model JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - Engine accurately computes ABVPS (deducting Net NPA and Net DTA), Gordon Growth P/B, and multi-stage Residual Income.
  - Gaps: Hardcoded `MOCK_INPUT` (`HDFCBANK`). Lacks input override controls in the UI. No persistence to DB.

#### 28. Excess Return Model
- **Excel Category:** Valuation
- **Excel Description:** This is a valuation technique where we will provide predefined template and it should be customizable
- **Data Source:** Source Data From Documents + Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/valuation/excess-return-valuation.md:1-170` and `specs/engines/excess-return-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:960-1050` (`ExcessReturnEngine`)
  - API Endpoint: `math-engine/api/main.py:100-106` (`POST /excess-return`)
  - Frontend Component: `research-os-frontend/src/components/widgets/ExcessReturnValuation.tsx:1-155`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:13` (mounted on `valuation` tab)
  - Golden Vector Tests: `math-engine/tests/test_math_engine.py:482-560` (3 passing tests)
  - DB Schema: `postgres/init/01_schema.sql:229` (`company_analysis.excess_return_model JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - Engine correctly implements Clean Surplus Relation (CSR) accounting with Ind AS OCI adjustments and Ohlson residual income persistence decay $\omega$.
  - Gaps: Hardcoded `MOCK_INPUT` (`RELIANCE`). No dynamic input manipulation. No persistence to DB.

---

### Category 6: Financials (4 Tools)

#### 29. Step 3, Revenue projection
- **Excel Category:** Financials
- **Excel Description:** For this we can have a premade template, it tells about company's revenue and how to project it.
- **Data Source:** Document Upload + Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/financials/revenue-projection.md:1-180` and `specs/engines/revenue-projection-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:2280-2380` (`RevenueProjectionEngine`)
  - API Endpoint: `math-engine/api/main.py:200-206` (`POST /revenue-projection`)
  - Frontend Component: `research-os-frontend/src/components/widgets/RevenueProjection.tsx:1-146`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:12` (`financials`) and `page.tsx:13` (`valuation`)
  - DB Schema: `postgres/init/01_schema.sql:240` (`company_financials.revenue_projections JSONB DEFAULT '[]'`)
- **Production Readiness Notes:**
  - Backend engine is fully implemented: computes segment revenue projections, intersegment eliminations, consolidated revenue, EBITDA, NOPAT, CapEx, NWC changes, and projected FCFF.
  - Gaps: Frontend uses hardcoded `MOCK_INPUT` (`RELIANCE: O2C, Retail, Digital`). Lacks UI to modify segment drivers or volume x realization parameters. No unit tests in `math-engine/tests/test_math_engine.py`. No persistence to DB.

#### 30. Step 2, Segment breakup
- **Excel Category:** Financials
- **Excel Description:** Breakup of different revenue streams of the company
- **Data Source:** Document Upload + Manual
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/financials/segment-breakup.md:1-150`
  - DB Schema: `postgres/init/01_schema.sql:239` (`company_financials.segment_breakup JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:172` (`segment_breakup?: any[]`)
  - Related Widgets: `KeyDataExtractor.tsx:39-44` extracts segment highlights and `RevenueProjection.tsx` projects future segment revenue, but no dedicated historical segment breakup table exists.
- **Production Readiness Notes:**
  - Standalone multi-period segment financial table (Revenue, Segment EBIT, Capital Employed, ROCE per Ind AS 108) is missing.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 31. Step 1, Financial statements
- **Excel Category:** Financials
- **Excel Description:** This contains P&l, balance sheet and cashflow and notes to account for all these. Data will be pulled though the documets which will be uploaded
- **Data Source:** Document Upload
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/financials/financial-statements.md:1-210`
  - DB Schema: `postgres/init/01_schema.sql:238` (`company_financials.financial_statements JSONB DEFAULT '{}'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:171` (`financial_statements?: Record<string, any>`)
  - Frontend Widgets: `research-os-frontend/src/components/widgets/FinancialCharts.tsx:1-33` (5-year bar chart), `KPICard.tsx:1-36` (summary metrics), `KeyDataExtractor.tsx:1-218` (document metric extraction)
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:12` (mounted on `financials` tab)
- **Production Readiness Notes:**
  - High-level charts and extracted metric cards exist.
  - Gaps: The full interactive multi-year Financial Statement grid (P&L, Balance Sheet, Cash Flow, and Notes to Accounts conforming to Ind AS Schedule III Div II / Div III) is completely missing.
  - No interactive table or period selector (Annual / Quarterly / TTM).

#### 32. Common size statement
- **Excel Category:** Financials
- **Excel Description:** This tool requires applying percentage calculation to financial statements
- **Data Source:** Company page + internal calculation
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/financials/common-size-statement.md:1-160` and `specs/engines/common-size-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:2180-2270` (`CommonSizeEngine`)
  - API Endpoint: `math-engine/api/main.py:192-198` (`POST /common-size`)
  - Frontend Component: `research-os-frontend/src/components/widgets/CommonSize.tsx:1-185`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:12` (`financials`) and `page.tsx:16` (`working-capital`)
  - DB Schema: `postgres/init/01_schema.sql:241` (`company_financials.common_size JSONB DEFAULT '{}'`)
- **Production Readiness Notes:**
  - Backend engine is fully implemented: vertical percentage calculations for P&L (% of revenue), Balance Sheet (% of Total Assets), and Cash Flow statement (% of revenue or CFO), with zero/negative revenue guardrails.
  - Frontend widget displays common size percentages for all three statements.
  - Gaps: Frontend calls API using hardcoded `MOCK_INPUT` (`RELIANCE`). No live connection to financial statements database. No unit tests in `math-engine/tests/test_math_engine.py`.

---

### Category 7: Cost (1 Tool)

#### 33. Cost Breakup of company
- **Excel Category:** Cost
- **Excel Description:** Can be taken through commonsize statement
- **Data Source:** Financial statements / Common Size
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/sme/cost-breakup.md:1-130`
  - Python Engine: `math-engine/src/math_engine/__init__.py:2200-2220` (`CommonSizeEngine` computes `cogs_pct`, `employee_expenses_pct`, `subcontracting_pct`, `total_operating_expenses_pct`)
  - Frontend Component: `research-os-frontend/src/components/widgets/CommonSize.tsx:96-100` (renders cost % breakdown)
  - DB Schema: `postgres/init/01_schema.sql:242` (`company_financials.cost_breakup JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:175` (`cost_breakup?: any[]`)
- **Production Readiness Notes:**
  - High-level cost percentages (% of revenue) are computed by `CommonSizeEngine` and displayed in `CommonSize.tsx`.
  - Gaps: A dedicated detailed cost breakup table (splitting Raw Materials by commodity: steel, aluminum, chemicals; energy/power costs; logistics; pass-through elasticity vs industry average) as specified in `sme/cost-breakup.md` does not exist as an independent component.

---

### Category 8: Working Capital (1 Tool)

#### 34. WC breakup
- **Excel Category:** Working Capital
- **Excel Description:** [Empty in original sheet]
- **Data Source:** Financial statements / Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/sme/wc-breakup.md:1-170`
  - Python Engine 1: `math-engine/src/math_engine/__init__.py:1680-1720` (`RatioAnalysisEngine` calculates Debtor Days, Inventory Days, Payable Days, and Cash Conversion Cycle)
  - Python Engine 2: `CommonSizeEngine` calculates Current Assets and Current Liabilities breakdown
  - Frontend Widgets: `RatioAnalysis.tsx` and `CommonSize.tsx`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:16` mounts `"working-capital": ["financial-charts", "kpi-cards", "common-size"]`
  - DB Schema: `postgres/init/01_schema.sql:243` (`company_financials.wc_breakup JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:176` (`wc_breakup?: any[]`)
- **Production Readiness Notes:**
  - CCC cycle days are calculated in `RatioAnalysisEngine`, and balance sheet working capital shares are rendered in `CommonSize.tsx`.
  - Gaps: Dedicated component `WCBreakup.tsx` is missing: no sub-breakup of inventory (Raw / WIP / Finished Goods), receivables (domestic / export aging, MSME debtor days), or payables (trade vs expense, MSMED Act 45-day overdue tracking).

---

### Category 9: Downsides (2 Tools)

#### 35. Key Events
- **Excel Category:** Downsides
- **Excel Description:** These are some events that we have to be very keen on to decide when to exit this firm
- **Data Source:** Manual / Exchange Filings
- **Status:** `Pending`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/downsides/key-events.md:1-121`
  - DB Schema: `postgres/init/01_schema.sql:268` (`company_downsides.key_events JSONB DEFAULT '[]'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:197` (`key_events?: any[]`)
  - Frontend: `CatalystTracker.tsx:1-31` displays basic upcoming dates, but lacks the exit trigger conditions, action thresholds, and impact tags. Omitted from `downsides` tab.
- **Production Readiness Notes:**
  - Missing dedicated `KeyEvents.tsx` component.
- **Feasibility & Architectural Prerequisites (Pending):**
  - Feasibility: High.

#### 36. Hedging Mechanism
- **Excel Category:** Downsides
- **Excel Description:** Can create a mechanism for hedging
- **Data Source:** NSE F&O / Manual
- **Status:** `Partial/Stub`
- **Verifying File Paths & Code Locations:**
  - Spec: `specs/company-page/downsides/hedging-mechanism.md:1-150` and `specs/engines/hedging-engine.md`
  - Python Engine: `math-engine/src/math_engine/__init__.py:2010-2053` (`HedgingEngine`)
  - API Endpoint: `math-engine/api/main.py:173-179` (`POST /hedging`)
  - Frontend Component: `research-os-frontend/src/components/widgets/HedgingMechanism.tsx:1-144`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:17` (`downsides`) and `page.tsx:14` (`risk`)
  - DB Schema: `postgres/init/01_schema.sql:269` (`company_downsides.hedging_mechanism JSONB DEFAULT '{}'`)
  - TS Interface: `research-os-frontend/src/lib/types.ts:198` (`hedging_mechanism?: Record<string, any>`)
- **Production Readiness Notes:**
  - Backend engine is fully implemented: computes collar max gain $(K_{call} - S_0) + (C - P)$, collar max loss $(S_0 - K_{put}) + (P - C)$, futures cost of carry $F = S_0 \cdot [1 + (r - q)T]$, hedge lots rounded to integer NSE lot sizes, basis risk, and STT cost drag.
  - Frontend widget displays collar payoff, fair futures price, and hedge lot counts.
  - Gaps: Input in `HedgingMechanism.tsx:12-25` is hardcoded mock data (`MOCK_INPUT`). No integration with live NSE F&O option chain API or portfolio position sizing. Zero unit tests in `math-engine/tests/test_math_engine.py`.

---

## 5. Master Remediation Roadmap for Cluster A

1. **Fix Frontend Production Build Blocker:**
   - Add `react-is` to `research-os-frontend/package.json` dependencies.
   - Resolve `next-auth` route handling or provider imports in `src/lib/auth.ts` and `src/app/auth/signin/page.tsx`.
   - Add `"test": "vitest run"` or Jest to `package.json` scripts.
2. **Implement Missing Unit Tests in Math Engine:**
   - Add golden test vectors for the 7 un-tested engines in `math-engine/tests/test_math_engine.py`: `ConcallConsistencyEngine`, `RatioAnalysisEngine`, `TurnaroundEngine`, `HedgingEngine`, `RiskScoreEngine`, `CommonSizeEngine`, and `RevenueProjectionEngine`.
3. **Connect Frontend Widgets to Database / Ingestion API:**
   - Replace `MOCK_INPUT` constants across all 16 Partial/Stub widgets (`DCFValuation`, `RelativeValuation`, `SOTPValuation`, `BankingValuation`, `ExcessReturnValuation`, `RatioAnalysis`, `TurnaroundIndicator`, `HedgingMechanism`, `CommonSize`, `RevenueProjection`) with dynamic API fetchers reading from `company_overview`, `company_financials`, `company_analysis`, and `company_management`.
4. **Build Core Pending UI Components:**
   - Implement `AboutCompany.tsx`, `DecisionTerminal.tsx`, and `LatestChanges.tsx` for Overview.
   - Implement `FinancialStatementsTable.tsx` for multi-year Schedule III Div II / Div III balance sheet, P&L, and cash flows.
   - Implement `CostBreakup.tsx` and `WCBreakup.tsx` for detailed operational forensic views.
