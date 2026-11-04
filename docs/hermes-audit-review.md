# Research OS (Hermes) — Joint Audit & Quality Assurance Review

**Target Agent:** Hermes (Lead Autonomous Development Agent)  
**Date:** November 4, 2026  
**Auditors:** Multidisciplinary Testing Team & Catalog Audit Team  
**Synchronized Commit:** `origin/main` @ `68e381c`  
**Deliverables in Repository:**
1. [Excel Master Tool Census & Implementation Audit (`docs/tool-audit.md`)](file:///c:/Users/aaaut/OneDrive/Desktop/Antigravity/ROS%20Hermes/docs/tool-audit.md)
2. [Multidisciplinary 6-Lens Testing & Empirical Gap Analysis (`docs/comprehensive-testing-and-gap-analysis.md`)](file:///c:/Users/aaaut/OneDrive/Desktop/Antigravity/ROS%20Hermes/docs/comprehensive-testing-and-gap-analysis.md)

---

## 1. Executive Summary & Purpose

Over the recent commits, Hermes made massive architectural strides:
- Built **18 deterministic computational engines** in Python (`math-engine`) with SHA-256 calculation hashing.
- Centralized **59 investment widgets** in `research-os-frontend` registered via `WidgetRegistry.tsx` and routed via `/company/[symbol]` with `?tab=` query navigation.
- Established **141 markdown specifications** in `specs/` and a comprehensive 30-table PostgreSQL schema in `postgres/init/01_schema.sql`.

Two complementary autonomous audits were executed against the latest commit to verify readiness and completeness:
1. **Multidisciplinary 6-Lens Empirical Testing Audit** (`docs/comprehensive-testing-and-gap-analysis.md`): Evaluated runtime execution, empirical edge cases (45 stress tests), API gateways, compilation builds, and specification alignment across 6 lenses (Financial, Economic, Investor, UI/UX, Math/Forensic, and Data Plumbing).
2. **Excel Master Tool Census & Implementation Audit** (`docs/tool-audit.md`): Evaluated all 106 tools across all 26 functional categories defined in the master Excel product catalog, classifying each as Built, Partial/Stub, or Pending with exact source code citations.

This review document synthesizes both audits into a clear, prioritized action plan for Hermes to review and execute.

---

## 2. Platform Implementation Census (106 Tools)

Across all 26 functional categories in the master Excel catalog:

| Status Category | Count | Percentage | Architectural & Implementation State |
|:---|:---:|:---:|:---|
| **Built** | **4** | **3.8%** | Fully functional calculation logic or standalone UI primitives (`SimpleTextBox.tsx`, `FilteredTable.tsx`, `PortfolioAnalyticsEngine`, `CorporateActionsEngine`). *Note: 0 tools meet the full-stack standard with live database persistence.* |
| **Partial / Stub** | **54** | **50.9%** | Functional UI components or FastAPI math engines operating in isolation on static `MOCK_INPUT`, in-memory non-persistent React state, unlinked Next.js API proxy routes, or pseudorandom simulations (`Math.random()`). |
| **Pending** | **48** | **45.3%** | Specifications exist in `specs/` and relational tables exist in `01_schema.sql`, but dedicated frontend widgets, backend API routes, or ingestion pipelines are unbuilt. |
| **TOTAL** | **106** | **100.0%** | **Full census across all 26 functional categories** |

---

## 3. High-Level Subsystem Status Scorecard

| Subsystem | Test Suite Status | Build Status | Primary Findings & Blockers |
|:---|:---:|:---:|:---|
| `math-engine` | **36/36 PASS** (pytest) | Python Service | Standalone logic verified for 10 Phase 1 engines. **Critical: API gateway crashes on all 17 routes due to `.model_dump()`.** 8 Phase 2 engines lack automated tests. |
| `data-ingestion` | **13/13 PASS** (pytest) | Python Service | Standalone PIT and classifier verified. PDF parsing and vector embeddings are currently simulated stubs. |
| `research-os-frontend` | **FAIL (No Script)** | **FAIL (Webpack Errors)** | Missing packages `react-is` and `next-auth`. WidgetRenderer omits `symbol` prop (locks all widgets to RELIANCE). Supabase client is never queried. |
| `postgres` | N/A (DDL Schema) | N/A | 30 tables + pgvector in `01_schema.sql` are well-structured, but client queries are absent. |
| Infrastructure | N/A | Docker Compose | Docker Compose defines backend services, but frontend is omitted and container healthchecks fail due to missing `curl`. |

---

## 4. Prioritized Remediation Roadmap for Hermes

### Priority 0: Critical Runtime & Build Unblockers (Must Fix First)

1. **Fix Math Engine API Gateway Crash (`math-engine/api/main.py`)**:
   - **Issue:** All 17 FastAPI POST endpoints invoke `.model_dump()` on standard Python `@dataclass` engine outputs (e.g., `result.model_dump()`). Python dataclasses do not have a `.model_dump()` method, resulting in an unhandled `AttributeError` (HTTP 500) on every API request.
   - **Fix:** Replace `.model_dump()` with `dataclasses.asdict(result)` or wrap dataclasses with Pydantic V2 `TypeAdapter(OutputClass).dump_python(result, mode='json')`.
2. **Fix Frontend Webpack Compilation (`research-os-frontend`)**:
   - **Issue:** `npm run build` fails with 3 Webpack module resolution errors:
     - `Can't resolve 'react-is'` (required by `recharts`).
     - `Can't resolve 'next-auth'` and `'next-auth/providers/credentials'` in `src/lib/auth.ts`.
     - `Can't resolve 'next-auth/react'` in `src/app/auth/signin/page.tsx`.
   - **Fix:** Run `npm install react-is next-auth` in `research-os-frontend`, or configure proper peer dependencies.
3. **Add Automated Frontend Test Script**:
   - **Issue:** `npm test` fails with `Missing script: "test"`.
   - **Fix:** Add a Vitest or Jest test runner to `package.json` with basic component sanity checks.
4. **Fix Symbol Parameter Decoupling (`src/app/company/[symbol]/page.tsx:28`)**:
   - **Issue:** `<WidgetRenderer type={w} />` does not pass `symbol={params.symbol}`. As a result, all 59 widgets default to their internal fallback symbol (`"RELIANCE"`).
   - **Fix:** Pass `symbol={params.symbol}` to `<WidgetRenderer />` and propagate down to all widget components.

---

### Priority 1: Mathematical & Forensic Integrity Fixes

1. **Altman Z'' Emerging Market Intercept & Cutoff Alignment (`src/math_engine/forensic/altman_z.py`)**:
   - **Issue:** In the emerging market model, an intercept of `+3.25` was added without adjusting the cutoff zones (`1.1` and `2.6`), causing bankrupt firms with zero assets/equity to be rated `"SAFE"`. Furthermore, IEEE 754 `NaN` comparisons fall through to `"SAFE"`.
   - **Fix:** Either shift cutoffs to `4.15` (distress) and `5.85` (safe), or remove the +3.25 intercept to align with standard Altman (1995) cutoffs. Add explicit zero/NaN guards.
2. **Beneish M-Score NaN Fallthrough (`src/math_engine/forensic/beneish_m.py`)**:
   - **Issue:** When financial statements contain `NaN` or `None`, M-Score comparison `m_score > -1.78` evaluates to `False`, erroneously flagging the company as `"MANIPULATION_UNLIKELY"`.
   - **Fix:** Add explicit pre-validation guards for `NaN` and missing statement items, raising a `CalculationError` or returning `"INDETERMINATE"`.
3. **Banking Valuation ROE & NIM Normalization (`src/math_engine/valuation/banking.py`)**:
   - **Issue:** Negative ROE entered as a percentage (e.g., `-12.0`) is not normalized to decimal (`-0.12`), distorting residual income calculations by 75x. In NIM calculation, interest expense is incorrectly divided by total interest income instead of total earning assets.
   - **Fix:** Auto-normalize all ROE inputs and ensure NIM uses standard RBI asset-denominator formulas.
4. **Portfolio P/E Harmonic Mean (`src/components/widgets/PortfolioFitCheck.tsx:45`)**:
   - **Issue:** Portfolio weighted P/E uses an arithmetic weighted average, violating institutional financial standards.
   - **Fix:** Use the Weighted Harmonic Mean:
     $$\text{Weighted Harmonic P/E} = \frac{1}{\sum_{i=1}^N \frac{w_i}{P/E_i}}$$
5. **Reverse DCF Search Convergence (`src/components/widgets/ReverseDCF.tsx:50-70`)**:
   - **Issue:** Numerical bisection search loop fails to converge, defaulting to `0.0%` implied growth for all stocks.
   - **Fix:** Expand search bounds to `[-50%, +100%]` and increase iteration tolerance to `1e-4`.

---

### Priority 2: Database & API Plumbing (Eliminating Mock Data Isolation)

1. **Wire Supabase Client to Frontend**:
   - **Issue:** `research-os-frontend/src/lib/supabase.ts` instantiates the Supabase client, but it is **never called anywhere in the frontend codebase**. Over 60 widgets rely on static `MOCK_INPUT` constants.
   - **Fix:** Connect the company tab layouts and widgets to fetch and mutate real records from `postgres/init/01_schema.sql` tables (`company_overview`, `company_management`, `holdings`, `transactions`, `weigh_decisions`).
2. **Configure Local Next.js API Proxy Rewrites**:
   - **Issue:** In local offline development, API calls to `/api/math-engine/:path*` fail (pointing to external Vercel URLs) and silently fall back to static mock data in catch blocks.
   - **Fix:** Support `NEXT_PUBLIC_LOCAL_DEV=true` in `next.config.ts` rewriting to `http://localhost:8000` (math-engine) and `http://localhost:8001` (data-ingestion).

---

### Priority 3: UI & Workflow Realignment

1. **Realign GRWTH Research Pipeline (`src/app/grwth/page.tsx`)**:
   - **Issue:** The UI currently displays Capex Project Milestones (`ANNOUNCED`, `ENV_CLEARANCE`, `CONSTRUCTION`, `TRIAL_RUNS`, `COMMERCIAL`, `REVENUE`), diverging from the Excel specification and database schema (`01_schema.sql:122-127`), which define the institutional research cycle:
     $$\text{Generate ideas} \longrightarrow \text{Research \& review} \longrightarrow \text{Weigh decisions} \longrightarrow \text{Track} \longrightarrow \text{Harvest}$$
   - **Fix:** Realign Kanban columns to the canonical GRWTH research stages.
2. **Unlock Tab Navigation in PortfolioFitCheck (`src/components/widgets/PortfolioFitCheck.tsx:281-283`)**:
   - **Issue:** Mock `TabsTrigger` buttons omit `onClick` handlers, locking the component to its initial tab.
   - **Fix:** Add `onClick={() => setActiveTab(tab.value)}`.
3. **Replace `Math.random()` in Weigh Decisions (`src/app/weigh/page.tsx:327, 359`)**:
   - **Issue:** Cross-asset correlations and risk contributions are simulated via `Math.random()`.
   - **Fix:** Wire calculations to `math-engine` portfolio risk endpoints.

---

### Priority 4: Implementation of 48 Pending Tools

Refer to [docs/tool-audit.md](file:///c:/Users/aaaut/OneDrive/Desktop/Antigravity/ROS%20Hermes/docs/tool-audit.md) for the detailed specification and code citation for each pending tool:
1. **Overview Tab (7 Pending)**: Build dedicated widgets for About the Company, Entry/Exit Rationales, Thesis Snapshot, 3-Factor Decision Terminal, Factor Tracking Table, and Latest Changes with Sentiment Impact tags.
2. **Story Tab (4 Pending)**: Implement dedicated text & structured containers for Business Model, Economic Moat, Current Growth Drivers, and Future Growth Drivers.
3. **Management Tab (4 Pending)**: Build Management Background table, Track Record milestones, Capital Allocation matrix, and Qualitative Related Party Transaction (RPT) Red Flags.
4. **SME Tab (5 Pending)**: Build SME Company Info, Promoter Forensics, Statement Health, Other Forensics, and On-Ground Channel Checks.
5. **Industry Deep Dive (7 Pending)**: Build canvas Supply Chain Mapper, Market Sizing CAGR table, and structured tables for Demand Drivers, Cost Drivers, Regulations, Competitors, and Industry Aggregates.

---

## 5. Summary of Verification Files in Repository

| File Path | Description | Lines / Size |
|:---|:---|:---:|
| [`docs/hermes-audit-review.md`](file:///c:/Users/aaaut/OneDrive/Desktop/Antigravity/ROS%20Hermes/docs/hermes-audit-review.md) | Master Synthesis & Prioritized Action Guide for Hermes | ~250 lines |
| [`docs/tool-audit.md`](file:///c:/Users/aaaut/OneDrive/Desktop/Antigravity/ROS%20Hermes/docs/tool-audit.md) | 106-Tool Census & Implementation Matrix (26 Categories) | 1,446 lines / 140 KB |
| [`docs/comprehensive-testing-and-gap-analysis.md`](file:///c:/Users/aaaut/OneDrive/Desktop/Antigravity/ROS%20Hermes/docs/comprehensive-testing-and-gap-analysis.md) | Multidisciplinary 6-Lens Empirical Testing & Stress Audit | 322 lines / 37 KB |
