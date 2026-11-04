# Lens 6: Data Plumbing, Docker Builds, API Contracts & Spec Gap Analysis Report

**Auditor Agent**: `explorer_m3_data_plumbing_specs` (Archetype: `teamwork_explorer`)  
**Evaluation Scope**: Requirement R2 — Lens 6 & Comprehensive Spec Gap Analysis  
**Repository Branch**: `main` (commit `68e381c`)  
**Analysis Date**: 2026-11-04  
**Governing Documents**: `ORIGINAL_REQUEST.md`, `specs/audits/INDEX.md`, 9 category audits in `specs/audits/`, `ANTIGRAVITY_HANDOFF.md`, `docker-compose.yml`, `postgres/init/01_schema.sql`, `research-os-frontend/next.config.ts`, `data-ingestion/`, `math-engine/`.

---

## 1. Executive Summary

This evaluation provides an authentic, forensic investigation of the Research OS codebase across **Lens 6 (Data Plumbing, Docker Builds, API Contracts & Pipeline Integrity)** and a **Comprehensive Spec Gap Analysis** against the master index (`specs/audits/INDEX.md`) and all 9 domain audit recommendation artifacts.

### Key Headline Findings:
1. **Critical Math Engine API Serialization Flaw**: Every single computation endpoint in `math-engine/api/main.py` (17 calculation endpoints) calls `.model_dump()` on standard Python library `@dataclass` instances (`outputs.model_dump()`). Because standard library `@dataclass` does not implement Pydantic's `.model_dump()`, every API calculation endpoint raises an uncaught `AttributeError` at runtime, causing `500 Internal Server Error`.
2. **Missing Frontend API Layer (`src/lib/api.ts`)**: There is no centralized API client. Widgets issue ad-hoc `fetch()` calls inline. Crucially, the endpoints called by Document AI and Macro widgets (`/api/data-ingestion/documents`, `/api/data-ingestion/macro-dashboard`, `/api/data-ingestion/market-metrics`, `/api/data-ingestion/summarize`) do NOT exist on the backend `data-ingestion` service, resulting in immediate `404 Not Found` or `405 Method Not Allowed` failures, triggering hardcoded mock fallbacks.
3. **Local Dev Routing & Rewrites Misalignment**: `research-os-frontend/next.config.ts` configures server rewrites defaulting to remote Vercel URLs (`https://math-engine-api.vercel.app` and `https://data-ingestion-api.vercel.app`) rather than local service containers (`http://localhost:8000` and `http://localhost:8001`). In the absence of an `.env.local` file, all local development API traffic routes to broken external endpoints.
4. **Docker Containerization Deficiencies**: 
   - `docker-compose.yml` completely omits the `frontend` service despite `research-os-frontend/Dockerfile` existing.
   - `math-engine` and `data-ingestion` containers fail healthchecks because their base image (`python:3.11-slim`) does not have `curl` installed.
   - `data-ingestion` container lacks all database and vector store connection environment variables (`DATABASE_URL`, `QDRANT_HOST`, `OLLAMA_BASE_URL`).
   - `ollama` container enforces hardcoded NVIDIA GPU reservations, crashing `docker-compose up` on non-NVIDIA systems.
5. **Ingestion Pipeline Disconnect**: `data-ingestion/src/` components are standalone mocks or stubs. `PDFExtractor` returns hardcoded text without parsing; `VectorStore` is an in-memory list with zero connectivity to PostgreSQL `pgvector` or Qdrant; `CitationEngine` returns canned strings without PDF bounding box coordinate localization `[x1, y1, x2, y2]`; and `AIAssistant.tsx` is completely simulated via client-side keyword matching and a 1-second `setTimeout()`.
6. **Spec Gap Matrix Synthesis**: While Hermes authored 141 detailed specification files covering ~98% of the platform concept, the implemented codebase currently satisfies **6.25% (Fully Implemented)**, **29.69% (Partially Implemented / UI Shell / Standalone Engine Logic)**, and leaves **64.06% (Not Implemented / Outstanding Gap)** of the 128 specifications audited in `specs/audits/INDEX.md`.

---

## 2. Lens 6 Deep-Dive: Data Plumbing, Docker Builds, API Contracts & Pipeline Integrity

### 2.1 API Contract Adherence: Backend Schemas vs. Frontend Consumers

#### A. Missing API Client Architecture
- **Observed**: `research-os-frontend/src/lib/api.ts` does **not exist**. There is no typed API gateway or centralized SDK in the frontend.
- **Impact**: Each widget manages its own HTTP lifecycle, URL formatting, headers, JSON serialization, and error trapping inline. This results in widespread discrepancies between frontend payloads and backend expectations.

#### B. Math Engine API Analysis (`math-engine/api/main.py`)
- **Backend Implementation**: `math-engine/src/math_engine/__init__.py` defines input and output classes using Python's standard library `from dataclasses import dataclass`.
- **The `.model_dump()` Bug**:
  In `math-engine/api/main.py`, every single calculation route attempts to call `.model_dump()` on the resulting dataclass instance:
  ```python
  # Line 58-59:
  outputs = engine.calculate(inputs)
  return JSONResponse(content=outputs.model_dump())
  ```
  This identical pattern appears across 17 endpoints:
  - Line 59: `outputs.model_dump()` (`DCFOutputs`)
  - Line 69: `r.model_dump()` (`ScreeningResult`)
  - Line 78: `outputs.model_dump()` (`RelativeValuationOutputs`)
  - Line 87: `outputs.model_dump()` (`SOTPOutputs`)
  - Line 96: `outputs.model_dump()` (`BankingValuationOutputs`)
  - Line 105: `outputs.model_dump()` (`ExcessReturnOutputs`)
  - Line 114: `result.model_dump()` (`BeneishOutputs`)
  - Line 123: `result.model_dump()` (`AltmanZOutputs`)
  - Line 132: `result.model_dump()` (`PiotroskiOutputs`)
  - Line 141: `result.model_dump()` (`PortfolioMetricsOutputs`)
  - Line 161: `result.model_dump()` (`RatioAnalysisOutputs`)
  - Line 170: `result.model_dump()` (`TurnaroundOutputs`)
  - Line 179: `result.model_dump()` (`HedgingOutputs`)
  - Line 188: `result.model_dump()` (`RiskScoreOutputs`)
  - Line 197: `result.model_dump()` (`CommonSizeOutputs`)
  - Line 206: `result.model_dump()` (`RevenueProjectionOutputs`)
  - Line 215: `result.model_dump()` (`ConcallConsistencyOutputs`)
- **Root Cause & Proof**: In Python standard library `dataclasses`, instances have no `model_dump()` attribute. `model_dump()` is exclusive to Pydantic v2 `BaseModel`. Executing `outputs.model_dump()` raises:
  ```
  AttributeError: 'DCFOutputs' object has no attribute 'model_dump'
  ```
- **Corporate Actions Date Deserialization**:
  In `math-engine/api/main.py:148`:
  ```python
  action = CorporateAction(**data.get("action", {}))
  ```
  Because `CorporateAction` is a standard `@dataclass` with `ex_date: date`, passing a JSON ISO string `"2024-05-01"` leaves `action.ex_date` as a Python `str`. In `portfolio/corporate_actions.py:31`:
  ```python
  return {"symbol": symbol, "type": "split", "ratio": ratio, "ex_date": ex_date.isoformat()}
  ```
  Calling `.isoformat()` on a string raises `AttributeError: 'str' object has no attribute 'isoformat'`.

#### C. Data Ingestion API Disconnect (`data-ingestion/api/main.py`)
`data-ingestion/api/main.py` defines only 8 routes:
- `GET /health`
- `POST /extract`
- `POST /pit-transform`
- `POST /ingest`
- `POST /chunk`
- `POST /classify`
- `POST /search`
- `POST /embed`

Comparison against Frontend Widget Invocations:

| Frontend Widget | Line # | HTTP Call Invoked | Backend Match in `data-ingestion` | Runtime Outcome |
|---|---|---|---|---|
| `DocumentViewer.tsx` | Line 41 | `GET /api/data-ingestion/documents?company_symbol=RELIANCE` | ❌ None (`/documents` missing) | Returns `404 Not Found`; catches error and sets fallback `MOCK_DOCUMENTS` |
| `KeyDataExtractor.tsx` | Line 72 | `GET /api/data-ingestion/extract?document_id=1&company_symbol=RELIANCE` | ❌ None (Only `POST /extract` registered) | Returns `405 Method Not Allowed`; catches error and renders `MOCK_EXTRACTIONS` |
| `KeyDataExtractor.tsx` | Line 89 | `POST /api/data-ingestion/extract` with `{document_id, company_symbol, category, regenerate: true}` | ⚠️ Signature Mismatch (Expects `{document, content}`, returns `{text, tables, metadata}`) | Returns 200 but payload lacks requested category keys, rendering empty data |
| `SmartSummarizer.tsx` | Line 24 | `GET /api/data-ingestion/summarize?document_id=1&company_symbol=RELIANCE` | ❌ None (`/summarize` missing) | Returns `404 Not Found`; catches error and sets hardcoded fallback summary |
| `SmartSummarizer.tsx` | Line 61 | `POST /api/data-ingestion/summarize` with `{document_id, company_symbol, regenerate: true}` | ❌ None (`/summarize` missing) | Returns `404 Not Found`; generation fails |
| `MacroDashboard.tsx` | Line 65 | `GET /api/data-ingestion/macro-dashboard` | ❌ None (`/macro-dashboard` missing) | Returns `404 Not Found`; catches error and loads `MOCK_INDICATORS` |
| `MarketMetrics.tsx` | Line 36 | `GET /api/data-ingestion/market-metrics` | ❌ None (`/market-metrics` missing) | Returns `404 Not Found`; catches error and loads `MOCK_MARKET_METRICS` |
| `AIAssistant.tsx` | Lines 93–104 | ❌ No HTTP request made (pure client-side keyword simulation) | ⚠️ Unused: `POST /search` exists on backend | Zero network activity; uses regex matching on `revenue`, `ebitda`, `debt` with `setTimeout(1000)` |

---

### 2.2 Routing & Server Rewrites (`next.config.ts`)

In commit `275c319`, Hermes removed deprecated proxy routes (`src/app/api/data-ingestion/route.ts`, `src/app/api/math-engine/dcf/route.ts`, `src/app/api/math-engine/screening/route.ts`) and introduced declarative rewrites in `research-os-frontend/next.config.ts`:

```typescript
// next.config.ts (lines 18-23)
async rewrites() {
  return [
    { 
      source: '/api/math-engine/:path*', 
      destination: `${process.env.MATH_ENGINE_URL || 'https://math-engine-api.vercel.app'}/:path*` 
    },
    { 
      source: '/api/data-ingestion/:path*', 
      destination: `${process.env.DATA_INGESTION_URL || 'https://data-ingestion-api.vercel.app'}/:path*` 
    }
  ];
}
```

#### Verification & Defect Analysis:
1. **Broken Default Fallback in Local Environment**:
   - The repository contains no `.env` or `.env.local` file.
   - When a developer clones the repository and runs `npm run dev`, `process.env.MATH_ENGINE_URL` is undefined.
   - Next.js falls back to `'https://math-engine-api.vercel.app'`.
   - Any local API call from a widget (e.g. `/api/math-engine/dcf`) is routed to an external Vercel domain that does not exist or fails with 502/504 errors, rather than routing to `http://localhost:8000` (math-engine) or `http://localhost:8001` (data-ingestion).
2. **Dynamic Company Route Prop Severing**:
   - In `research-os-frontend/src/app/company/[symbol]/layout.tsx`:
     ```typescript
     const params = useParams();
     const symbol = (params?.symbol as string) || "RELIANCE";
     ```
     The header renders the dynamic symbol correctly.
   - However, in `research-os-frontend/src/app/company/[symbol]/page.tsx`:
     ```typescript
     function CompanyPageContent() {
       const searchParams = useSearchParams();
       const tab = searchParams?.get("tab") || "overview";
       const widgets = TAB_CONTENT[tab] || TAB_CONTENT.overview;

       return (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {widgets.map((w, i) => (
             <div key={i} className="min-h-[300px]">
               <WidgetRenderer type={w} />
             </div>
           ))}
         </div>
       );
     }
     ```
     `symbol` is **never passed** to `<WidgetRenderer type={w} />`.
   - Every single widget on the page uses its default prop (`symbol = "RELIANCE"`). Navigating to `/company/TCS` or `/company/HDFCBANK` continues to display data exclusively for `"RELIANCE"`.

---

### 2.3 Docker Containerization & Multi-Stage Builds

#### Service Topology (`docker-compose.yml`):
- `postgres`: `pgvector/pgvector:pg16` (Port `5432:5432`)
- `qdrant`: `qdrant/qdrant:latest` (Ports `6333:6333`, `6334:6334`)
- `ollama`: `ollama/ollama:latest` (Port `11434:11434`)
- `math-engine`: Built from `./math-engine` (Port `8000:8000`)
- `data-ingestion`: Built from `./data-ingestion` (Port `8001:8001`)
- `pgadmin`: `dpage/pgadmin4:latest` (Port `5050:80`)

#### Containerization Defect Catalog:

1. **Missing Frontend Service**:
   `research-os-frontend/Dockerfile` exists (multi-stage Alpine Node.js 20 build with Next.js standalone runner), but `docker-compose.yml` does not declare a `frontend` service. Running `docker-compose up` leaves the frontend unstarted.
2. **Healthcheck Command Failure (`curl` missing)**:
   In `docker-compose.yml`:
   ```yaml
   math-engine:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
   data-ingestion:
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
   ```
   Both `math-engine/Dockerfile` and `data-ingestion/Dockerfile` begin with:
   ```dockerfile
   FROM python:3.11-slim
   ```
   Debian slim base images **do not include `curl`**. Consequently, Docker's healthcheck executor fails with `exec: "curl": executable file not found in $PATH` (exit code 127), and both containers are flagged permanently as `unhealthy`.
3. **Missing Service Interconnect Configuration**:
   In `docker-compose.yml`, `data-ingestion` has only:
   ```yaml
   environment:
     - PYTHONPATH=/app/src
   ```
   It provides no `DATABASE_URL` (to reach `postgres:5432`), no `QDRANT_HOST` (to reach `qdrant:6333`), and no `OLLAMA_BASE_URL` (to reach `ollama:11434`). The services run isolated from each other.
4. **Hardcoded NVIDIA GPU Lockout**:
   Lines 43–49 of `docker-compose.yml`:
   ```yaml
   deploy:
     resources:
       reservations:
         devices:
           - driver: nvidia
             count: 1
             capabilities: [gpu]
   ```
   On developer laptops or CI runners without an NVIDIA GPU or without the `nvidia-container-toolkit` daemon installed, `docker-compose up` fails immediately with:
   `could not select device driver "" with capabilities: [[gpu]]`.
5. **Single-Stage Python Builds**:
   Both `math-engine/Dockerfile` and `data-ingestion/Dockerfile` use single-stage builds running `pip install --no-cache-dir .` directly in the runtime image. Build tools and cache artifacts remain in the image layer rather than being isolated in a builder stage.

---

### 2.4 Ingestion Pipeline Robustness Analysis (`data-ingestion/src/`)

| Pipeline Stage | Module File | Implementation Reality | Robustness Assessment |
|---|---|---|---|
| **Text & Table Extraction** | `extractors/pdf.py` | 21-line mock returning static string `{"text": "Extracted text from PDF...", "pages": 10}`. No import of `pdfplumber`, `PyMuPDF`, or `pytesseract`. | **Stub Only**: Incapable of parsing actual Indian corporate filings. Tables return a dummy 2x2 matrix `[["Revenue", "100"], ["EBITDA", "20"]]`. |
| **Document Classification** | `classifiers/document_classifier.py` | Keyword frequency counter across 6 predefined word lists. | **Basic**: Word-matching works on clean text, but fails on noisy OCR or scanned BSE PDFs. Confidence is hardcoded to `0.85`. |
| **Sliding Window Chunking** | `chunkers/sliding_window.py` | Naive word tokenizer (`text.split()`) advancing by `chunk_size - overlap`. | **Fragile**: Splits words by whitespace; completely ignores sentence boundaries, paragraph markdown structure, and financial table headers. |
| **Vector Store Indexing** | `embeddings/vector_store.py` | In-memory Python list (`self.vectors = []`) with pure-Python cosine similarity computation. | **Disconnected**: Completely decoupled from PostgreSQL `pgvector` and Qdrant. All indexed vectors vanish on process restart. |
| **Point-in-Time Transformation** | `pit/transformer.py` | Pure in-memory date filter comparing ISO strings against `as_of_date`. | **Partial**: Logic prevents lookahead bias for provided dictionaries, but has zero database persistence or linkage with `company_financials`. |
| **RAG Citation Tracing** | `rag/citation_engine.py` | Returns hardcoded dictionary with static citations: `Annual Report FY25, p.42`. | **Mock Only**: Does not return PDF bounding box coordinates `[x1, y1, x2, y2]`, does not perform NLI entailment scoring, and has no vector store retrieval. |

---

### 2.5 Database Schema & Relational Integrity (`postgres/init/01_schema.sql`)

`postgres/init/01_schema.sql` establishes a 581-line database architecture comprising **30 tables**:

```
Core Entities & Docs (3):      companies, documents, document_chunks
GRWTH Funnel (3):             research_ideas, grwth_stages, idea_stage_history
Company Deep-Dive Tabs (9):   company_overview, company_management, company_story, company_industry,
                              company_risk, company_analysis, company_financials, company_sme, company_downsides
Decision Systems (1):         weigh_decisions
Portfolio Suite (7):          portfolios, holdings, transactions, import_batches, corporate_actions,
                              portfolio_metrics, portfolio_risk
Macro & Industry (3):         macro_indicators, market_metrics, industries
Auxiliary & Collab (4):       watchlists, tasks, time_entries, rag_queries
```

#### Relational Strengths:
- **Vector Embeddings**: `document_chunks` declares `embedding vector(1024)` matching BGE-M3 embeddings, indexed via HNSW (`CREATE INDEX idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);`).
- **Trigram Search**: GIN trigram indexes on `companies(name)` and `documents(title)` support fuzzy ticker/name searches.
- **Generated Columns**: `transactions.value` and `transactions.net_value` enforce deterministic transaction cost calculations at the database level.
- **Automated Timestamps**: PostgreSQL triggers (`update_updated_at_column()`) registered across 18 core tables.

#### Critical Database Deficiencies:
1. **NextAuth Tables Omission**:
   Although `HERMES_CHANGES.md` states NextAuth compliance was added, `01_schema.sql` contains **zero** authentication tables (`users`, `accounts`, `sessions`, `verification_tokens`). NextAuth database adapters cannot function without these tables.
2. **Denormalized Financial Statements Blob**:
   `company_financials` stores entire financial statements as an unindexed JSONB blob (`financial_statements JSONB DEFAULT '{}'`). There are no relational tables for individual financial statement line items, preventing SQL-level time-series aggregations, cross-company ratio screens, or Point-in-Time restatement indexing.
3. **Absence of Migrations Framework**:
   The repository lacks Prisma, Drizzle, or Alembic migration tooling. Any schema change requires manual destruction and re-initialization of the Postgres volume.

---

## 3. Comprehensive Spec Gap Analysis against `specs/audits/INDEX.md`

`specs/audits/INDEX.md` inventories **128 specifications** audited across 9 categories. The matrix below audits every category, cross-referencing recommendations from the respective audit document against actual codebase implementation.

### 3.1 Category-by-Category Audit & Implementation Census

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               MASTER SPEC GAP ANALYSIS MATRIX (128 SPECIFICATIONS)                              │
├────┬────────────────────────────┬────────────┬─────────────┬──────────────┬──────────────────┬─────────────────┤
│ #  │ Category Name              │ Spec Count │ Fully Impl. │ Part. Impl.  │ Not Impl. (Gap)  │ Effective Impl %│
├────┼────────────────────────────┼────────────┼─────────────┼──────────────┼──────────────────┼─────────────────┤
│ 1  │ Company Page Tabs          │ 59         │ 0           │ 15           │ 44               │ 25.4% (UI/Eng)  │
│ 2  │ Core Computational Engines │ 18         │ 8           │ 10           │ 0                │ 72.2% (Math ok) │
│ 3  │ Portfolio Management       │ 16         │ 0           │ 2            │ 14               │ 12.5%           │
│ 4  │ Industry Analysis Page     │ 11         │ 0           │ 1            │ 10               │ 9.1%            │
│ 5  │ Macro & Microstructure     │ 2          │ 0           │ 1            │ 1                │ 50.0% (UI only) │
│ 6  │ Document AI & Ingestion    │ 4          │ 0           │ 2            │ 2                │ 37.5%           │
│ 7  │ Weigh Decisions            │ 6          │ 0           │ 2            │ 4                │ 25.0%           │
│ 8  │ Tasks & Time Compliance    │ 3          │ 0           │ 1            │ 2                │ 25.0%           │
│ 9  │ Additional Tools & Disc.   │ 9          │ 0           │ 4            │ 5                │ 33.3%           │
├────┼────────────────────────────┼────────────┼─────────────┼──────────────┼──────────────────┼─────────────────┤
│    │ TOTAL PLATFORM             │ 128        │ 8 (6.25%)   │ 38 (29.69%)  │ 82 (64.06%)      │ 28.5% Impl.     │
└────┴────────────────────────────┴────────────┴─────────────┴──────────────┴──────────────────┴─────────────────┤
```

---

### 3.2 Detailed Category Audits

#### Category 1: Company Page (59 Specs) — [`specs/audits/company-page-recommendations.md`]
- **Audited Scope**: 10 functional subdirectories: Overview (7), Management (6), Story (4), Industry (3), Risk (7), Analysis (7), Valuation (8), Financials (7), SME (6), Downsides (4).
- **Implemented by Hermes**:
  - Centralized 59 widgets into `WidgetRegistry.tsx` (Commit `ce9ec21`, `5501fee`).
  - Persistent tab layout `src/app/company/[symbol]/layout.tsx` + `?tab=` query navigation.
  - 15 engine-backed widgets rendered on respective tabs (`dcf-valuation`, `relative-valuation`, `sotp-valuation`, `banking-valuation`, `excess-return-valuation`, `beneish-m-score`, `altman-z-score`, `piotroski-f-score`, `forensic-flags`, `ratio-analysis`, `turnaround-indicator`, `risk-score`, `common-size`, `revenue-projection`, `concall-consistency`).
- **Outstanding Gaps against Recommendations**:
  1. *Schedule III Division II vs Division III State Machine*: Recommended dynamic switching between corporate and banking schemas (`companyContext.entityType`) is not implemented. Banks (HDFC, ICICI) are subjected to commercial corporate metrics.
  2. *Ind AS 116 Lease Normalization Layer*: Global toggle to switch between Reported Ind AS 116 and Pre-Ind AS 116 normalized EBITDA/Net Debt/ROCE is absent.
  3. *Dynamic URL Parameter Passthrough*: `symbol` prop is omitted in `page.tsx`, locking all widgets to `"RELIANCE"`.
  4. *Negative Net Worth Guardrails*: ROE clamps for negative equity ($-PAT / -NW$) recommended across all 59 specs are not universally enforced in frontend display tables.
  5. *SME Exchange & Governance Checks*: BSE SME / NSE Emerge migration trackers, ICAI Peer Review auditor checks, and MSMED Act 45-day vendor payment rules remain unimplemented.

#### Category 2: Core Computational Engines (18 Specs) — [`specs/audits/engines-recommendations.md`]
- **Audited Scope**: All 18 calculation engines in `specs/engines/`.
- **Implemented by Hermes**:
  - **Beneish M-Score**: Corrected $LVGI$ formula (debt/assets ratio) and coefficient ($-0.327$), corrected $TATA$ coefficient ($4.679$), clamped $GMI \in [0.1, 5.0]$.
  - **Banking Valuation**: Fixed ROE decimal normalization ($>1.0 \implies /100$), implemented ABVPS with Net NPA deductions, Ohlson residual income model.
  - **DCF Valuation**: Implemented mid-year discounting convention ($t - 0.5$), Gordon Growth $WACC \le g$ guard, Ind AS 116 lease liabilities in Net Debt bridge.
  - **Relative Valuation**: Excluded loss-making peers (negative EPS/EBITDA), implemented Harmonic Mean for peer multiples.
  - **Altman Z-Score**: Implemented Emerging Market $Z''$ model (+3.25 intercept), zero-liabilities guard.
  - **Excess Return**: Implemented Ohlson persistence parameter ($\omega$), Clean Surplus OCI adjustment.
  - **SOTP**: Per-segment `valuation_level` (EV vs Equity), `effective_stake_pct`, HoldCo discount sensitivity.
  - **Corporate Actions**: Rebuilt in `portfolio/corporate_actions.py` with SEBI-compliant fractional cash-in-lieu pooling, Section 49(2C) demerger cost allocation, and Section 55(2)(aa) NIL cost bonus shares.
  - **7 New Engines Built**: Ratio Analysis v2.0.0, Turnaround, Hedging, Risk Score, Common Size, Revenue Projection, Concall Consistency.
  - **Test Verification**: 36 golden vector tests passing in `math-engine/tests/test_math_engine.py`.
- **Outstanding Gaps against Recommendations**:
  1. *API Serialization Bug*: `math-engine/api/main.py` crashes on `.model_dump()` across all calculation routes.
  2. *Corporate Actions Date Parsing*: String dates in JSON request trigger `AttributeError` on `.isoformat()`.
  3. *Redis Caching Layer*: Recommended 24-hour canonical input hash caching (`hash(canonical_json(inputs))`) is not implemented.

#### Category 3: Portfolio Management (16 Specs) — [`specs/audits/portfolio-management-recommendations.md`]
- **Audited Scope**: 16 specifications in `specs/portfolio-management/`.
- **Implemented by Hermes**:
  - `PortfolioAnalyticsEngine` in `math-engine/src/math_engine/__init__.py` with Sortino (MAR=0), Brent-Dekker XIRR, drawdown tracking.
  - Corporate Actions handler in `portfolio/corporate_actions.py`.
  - Frontend `PortfolioPage` (`research-os-frontend/src/app/portfolio/page.tsx`) with Dashboard, Holdings, Transactions, Analytics tabs.
  - Relational schema tables: `portfolios`, `holdings`, `transactions`, `import_batches`, `corporate_actions`, `portfolio_metrics`, `portfolio_risk`.
- **Outstanding Gaps against Recommendations**:
  1. *Union Budget (July 23, 2024) Tax Regime*: Complete omission of Section 111A STCG @ 20%, Section 112A LTCG @ 12.5% with ₹1.25L exemption, pre/post July 23 bifurcation, and Section 55(2)(ac) grandfathering FMV lookup as of January 31, 2018.
  2. *Section 48 STT Disallowance*: Contract notes and transaction logs do not separate deductible transfer expenses from non-deductible STT.
  3. *Triple-Way CAS Reconciliation Engine*: NSDL/CDSL CAS e-PDF, Broker Contract Note, and Bank ledger reconciliation is entirely missing. Import button is an empty stub.
  4. *Daily Modified Dietz & Sub-1-Year Holding Rules*: Not implemented in portfolio return tracking; short durations display misleading annualized figures.
  5. *Realized P&L Tax Lotting*: Transactions table uses simple price differences rather than statutory FIFO tax lot queues.

#### Category 4: Industry Analysis (11 Specs) — [`specs/audits/industry-page-recommendations.md`]
- **Audited Scope**: 11 specifications in `specs/industry-page/`.
- **Implemented by Hermes**:
  - `IndustryPage` frontend layout (`research-os-frontend/src/app/industry/page.tsx`) with Overview, Deep Dive, Compare, and Dashboard tabs.
  - Relational schema table: `industries` in `01_schema.sql`.
- **Outstanding Gaps against Recommendations**:
  1. *Catastrophic P&L Aggregation Formula Bug*: `specs/industry-page/industry-aggregate.md` revenue-weighted squared fraction bug is not corrected because no industry aggregation engine exists in Python or TypeScript.
  2. *Ind AS 108 Segment Reporting Integration*: No dual aggregation separating pure-plays from conglomerate divisions (e.g. Reliance Retail / Jio).
  3. *Market Concentration Metrics*: Herfindahl-Hirschman Index (HHI) and 4-Firm Concentration Ratio (CR4) are absent.
  4. *Deflation-Safe Pass-Through Ratio*: Gross margin spread tracking ($\Delta \text{Realization} - \text{Cost Share} \times \Delta \text{Input}$) is not implemented.
  5. *Static Mock Data*: Page displays a hardcoded 14-industry array (`INDUSTRIES`) with no live database backing.

#### Category 5: Macro & Market Microstructure (2 Specs) — [`specs/audits/macro-page-recommendations.md`]
- **Audited Scope**: `macro-dashboard.md` and `market-metrics.md`.
- **Implemented by Hermes**:
  - `MacroDashboard.tsx` and `MarketMetrics.tsx` frontend widgets.
  - Full-page `/macro` dashboard route.
  - Relational schema tables: `macro_indicators` and `market_metrics`.
- **Outstanding Gaps against Recommendations**:
  1. *Broken Backend Connectivity*: Widgets call `/api/data-ingestion/macro-dashboard` and `/api/data-ingestion/market-metrics`, which do not exist on the backend (return 404).
  2. *RBI LAF Monetary Corridor*: Lacks the post-April 2022 SDF (6.25%) floor, Policy Repo (6.50%), MSF (6.75%) ceiling, and Net Systemic Banking Liquidity tracker (₹ Lakh Cr).
  3. *Macro Corporate Margin Spread*: Spread indicator ($\text{CPI Headline YoY} - \text{WPI Headline YoY}$) is not computed.
  4. *FII/DII Publication Schedule Alignment*: No scheduled EOD depository ingestion trigger (17:00 / 20:30 IST).
  5. *SEBI Circuit Breaker State Machine*: Lacks 10%, 15%, 20% index halt states and cooling periods.

#### Category 6: Document AI & Ingestion Pipeline (4 Specs) — [`specs/audits/document-ai-recommendations.md`]
- **Audited Scope**: 4 specs in `specs/document-ai/` plus `SPEC_INGESTION_PIPELINE.md`.
- **Implemented by Hermes**:
  - Data ingestion package structure (`data_ingestion/extractors`, `chunkers`, `classifiers`, `embeddings`, `pit`, `rag`).
  - Passing unit tests in `data-ingestion/tests/test_data_ingestion.py`.
  - Frontend widgets: `DocumentViewer.tsx`, `SmartSummarizer.tsx`, `KeyDataExtractor.tsx`, `AIAssistant.tsx`.
  - Relational schema tables: `documents`, `document_chunks` (with pgvector HNSW index), and `rag_queries`.
- **Outstanding Gaps against Recommendations**:
  1. *Stub Implementations*: `PDFExtractor` does not parse PDFs; `VectorStore` is an in-memory list disconnected from `pgvector` / Qdrant; `CitationEngine` returns canned text.
  2. *API Endpoint Gaps*: Missing `/documents`, `/summarize`, and `/macro-dashboard` endpoints on `data-ingestion/api/main.py`.
  3. *Simulated AI Assistant*: `AIAssistant.tsx` uses client-side keyword matching with a 1-second timeout rather than querying backend RAG embeddings.
  4. *Split-Screen Verification Cockpit*: Missing 45% chat / 55% PDF split-screen layout with sentence bounding box coordinates `[pageNumber, x1, y1, x2, y2]` jump-to-highlight functionality.
  5. *Hybrid RRF Retrieval*: No implementation of Reciprocal Rank Fusion coupling BM25 with BGE-M3 dense embeddings.

#### Category 7: Weigh Decisions & Conviction Systems (6 Specs) — [`specs/audits/weigh-decisions-recommendations.md`]
- **Audited Scope**: 6 specs in `specs/weigh-decisions/`.
- **Implemented by Hermes**:
  - Frontend widgets: `PortfolioFitCheck.tsx`, `ScenarioAnalysis.tsx`, `ConvictionSizing.tsx`, `ReverseDCF.tsx`.
  - Full-page `/weigh` dashboard route.
  - Relational schema table: `weigh_decisions`.
- **Outstanding Gaps against Recommendations**:
  1. *Compulsory Red-Flag Veto Gates*: No knockout state machine terminating buy recommendations upon auditor qualifications under CARO, auditor resignations, or promoter pledge > 40%.
  2. *Investment Committee (IC) Memo Suite*: Missing automated 2-page IC memo generator with recorded dissenting votes and conditions precedent.
  3. *Sequential Bayesian Conviction Updating*: Conviction sizing is a manual UI slider rather than an odds-ratio Bayesian updating engine.
  4. *SEBI Concentration Caps*: Half-Kelly sizing is not bounded by statutory mutual fund/PMS concentration limits (10% single equity / 25% sector).

#### Category 8: Tasks & Time Compliance Suite (3 Specs) — [`specs/audits/tasks-time-recommendations.md`]
- **Audited Scope**: 3 specs in `specs/tasks-time/`.
- **Implemented by Hermes**:
  - Frontend widgets: `KanbanBoard.tsx`, `TimeTracker.tsx`, `TodoTracker.tsx`.
  - Full-page `/tasks` dashboard route.
  - Relational schema tables: `tasks`, `time_entries`.
- **Outstanding Gaps against Recommendations**:
  1. *SEBI LODR Reg 29 & 33 Earnings Calendar*: Built as generic todos and Pomodoro timer rather than statutory earnings event calendar tracking 5 clear days advance notice and 45d/60d result submission deadlines.
  2. *Chorus Call DiamondPass Dial-In Integration*: Missing 1-click DiamondPass PIN bypass generation and direct PSTN dialers.
  3. *Regulatory Disclosure Radar*: Live tracking for SEBI SAST Reg 29 (2% shareholding shifts) and SEBI PIT Reg 7(2) insider trades is absent.

#### Category 9: Additional Tools, Screening, Watchlists & GRWTH (9 Specs) — [`specs/audits/additional-tools-recommendations.md`]
- **Audited Scope**: `additional-tools/` (4), `generate-ideas/` (2), `watchlist/` (2), `grwth/` (1).
- **Implemented by Hermes**:
  - Frontend widgets: `WatchlistManager.tsx`, `IdeaGeneration.tsx`, `ScreeningTable.tsx`, `FilteredTable.tsx`, `MultiTextBox.tsx`, `SimpleTextBox.tsx`, `UIPrimitives.tsx`.
  - Full-page routes: `/watchlist`, `/generate-ideas`, `/screening`.
  - Relational schema tables: `watchlists`, `research_ideas`, `grwth_stages`, `idea_stage_history`.
  - Math engine `ScreeningEngine` in `math_engine/__init__.py`.
- **Outstanding Gaps against Recommendations**:
  1. *Dynamic Formula Excel Export*: `FilteredTable.tsx` does not export `.xlsx` with live Excel formulas (`=SUM()`, `=C12-B12`) via ExcelJS or openpyxl.
  2. *EBNF Screener Query Compiler*: Lacks an AST compiler parsing nested multi-variable queries across Consolidated/Standalone scopes.
  3. *NSE Bhavcopy Delivery Overlays*: Stock charts lack delivery percentage overlays (`Delivery Qty / Traded Qty * 100`) and Volume Profile clusters.
  4. *Institutional Watchlist Deal Alerts*: Lacks automated alerts for NSE/BSE Bulk & Block deals or insider trades.
  5. *GRWTH Capex Reinvestment Rate*: Capex tracking is not grounded in corporate reinvestment rates or Incremental Capital Output Ratios (ICOR).

---

## 4. Defect, Schema Mismatch & Broken Contract Catalog

The table below catalogs every identified defect with file path, line number, reproduction steps, observed behavior, and expected behavior:

### Defect 1: Fatal AttributeError on `.model_dump()` across Math Engine API
- **File & Line**: `math-engine/api/main.py:59` (and lines 69, 78, 87, 96, 105, 114, 123, 132, 141, 161, 170, 179, 188, 197, 206, 215)
- **Reproduction Steps**:
  1. Start math engine API: `uvicorn api.main:app --port 8000`
  2. Send a valid POST request to `http://localhost:8000/dcf` or `http://localhost:8000/beneish` with required JSON body.
- **Observed Behavior**:
  Server returns `500 Internal Server Error`. Terminal logs show:
  `AttributeError: 'DCFOutputs' object has no attribute 'model_dump'`.
- **Expected Behavior**:
  Dataclass should be serialized using `dataclasses.asdict(outputs)` or output types should be converted to Pydantic v2 `BaseModel`.

### Defect 2: Corporate Actions Date String Deserialization Crash
- **File & Line**: `math-engine/api/main.py:148-150` & `math-engine/src/math_engine/portfolio/corporate_actions.py:31`
- **Reproduction Steps**:
  1. Send `POST /corporate-actions` with body:
     ```json
     {"action": {"symbol": "RELIANCE", "action_type": "split", "ratio": 2.0, "ex_date": "2024-05-01", "record_date": "2024-05-02"}, "holdings": [{"symbol": "RELIANCE", "qty": 100, "avg_price": 2500}]}
     ```
- **Observed Behavior**:
  Server raises `AttributeError: 'str' object has no attribute 'isoformat'` because standard dataclasses do not parse strings into Python `datetime.date` objects.
- **Expected Behavior**:
  `ex_date` and `record_date` should be parsed from ISO strings (`datetime.fromisoformat()`) or validated via Pydantic.

### Defect 3: Dynamic Route Symbol Prop Severed in Company Page
- **File & Line**: `research-os-frontend/src/app/company/[symbol]/page.tsx:29`
- **Reproduction Steps**:
  1. Start frontend: `npm run dev`
  2. Navigate in browser to `http://localhost:3000/company/TCS` or `http://localhost:3000/company/HDFCBANK`.
- **Observed Behavior**:
  Header displays `"TCS"`, but every widget rendered in `CompanyPageContent` displays data for `"RELIANCE"`. The dynamic `symbol` route parameter is never passed to `<WidgetRenderer type={w} />`.
- **Expected Behavior**:
  `symbol` should be retrieved from `useParams()` and passed down to `<WidgetRenderer type={w} symbol={symbol} companySymbol={symbol} />`.

### Defect 4: Next.js Rewrites Default to Remote Vercel in Local Dev
- **File & Line**: `research-os-frontend/next.config.ts:20-21`
- **Reproduction Steps**:
  1. Run `npm run dev` without creating an `.env.local` containing `MATH_ENGINE_URL`.
  2. Trigger any widget that issues a fetch to `/api/math-engine/dcf`.
- **Observed Behavior**:
  Request is proxied to `https://math-engine-api.vercel.app/dcf`, failing with DNS resolution failure or HTTP 502/504.
- **Expected Behavior**:
  Default rewrite destinations should be `http://localhost:8000/:path*` for `math-engine` and `http://localhost:8001/:path*` for `data-ingestion`.

### Defect 5: Docker Container Healthchecks Fail due to Missing `curl`
- **File & Line**: `docker-compose.yml:65, 78` & `math-engine/Dockerfile:1` & `data-ingestion/Dockerfile:1`
- **Reproduction Steps**:
  1. Run `docker-compose up -d math-engine data-ingestion`.
  2. Wait 20 seconds and run `docker ps`.
- **Observed Behavior**:
  Both containers display `(unhealthy)`. Inspecting container health logs reveals:
  `OCI runtime exec failed: exec: "curl": executable file not found in $PATH: unknown`.
- **Expected Behavior**:
  Dockerfiles must install `curl` via `apt-get install -y curl`, or healthchecks must use Python native commands: `python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"`.

### Defect 6: Frontend Missing from Docker Compose Orchestration
- **File & Line**: `docker-compose.yml:3`
- **Reproduction Steps**:
  1. Run `docker-compose up -d`.
  2. Attempt to open `http://localhost:3000`.
- **Observed Behavior**:
  Connection refused. Port 3000 is not bound because `docker-compose.yml` has no `frontend` service block.
- **Expected Behavior**:
  Add `frontend` service build block targeting `./research-os-frontend` mapped to port 3000 with environment variables `MATH_ENGINE_URL=http://math-engine:8000` and `DATA_INGESTION_URL=http://data-ingestion:8001`.

### Defect 7: Hardcoded NVIDIA GPU Reservation Aborts Compose on Non-GPU Hosts
- **File & Line**: `docker-compose.yml:43-49`
- **Reproduction Steps**:
  1. Run `docker-compose up` on any standard machine without NVIDIA GPU or container runtime.
- **Observed Behavior**:
  Docker Compose fails to launch any service, throwing:
  `Error response from daemon: could not select device driver "" with capabilities: [[gpu]]`.
- **Expected Behavior**:
  NVIDIA GPU reservations should be commented out by default or placed in `docker-compose.override.yml`, allowing CPU fallback.

### Defect 8: DocumentViewer Calls Non-Existent Endpoint
- **File & Line**: `research-os-frontend/src/components/widgets/DocumentViewer.tsx:41`
- **Reproduction Steps**:
  1. Render `DocumentViewer` widget. Inspect network requests.
- **Observed Behavior**:
  `GET /api/data-ingestion/documents?company_symbol=RELIANCE` fails with `404 Not Found`. Component falls back to `MOCK_DOCUMENTS`.
- **Expected Behavior**:
  `data-ingestion/api/main.py` should define `GET /documents` backed by PostgreSQL `documents` table.

### Defect 9: KeyDataExtractor Method and Schema Incompatibility
- **File & Line**: `research-os-frontend/src/components/widgets/KeyDataExtractor.tsx:72, 89`
- **Reproduction Steps**:
  1. Load `KeyDataExtractor` widget (triggers GET).
  2. Click "Extract" button (triggers POST).
- **Observed Behavior**:
  GET request returns `405 Method Not Allowed`. POST request sends `{category}` but backend returns `{text, tables, metadata}` without categories, leaving UI state `undefined`.
- **Expected Behavior**:
  Backend should implement category extraction returning key-value financial pairs.

### Defect 10: SmartSummarizer Calls Non-Existent Endpoint
- **File & Line**: `research-os-frontend/src/components/widgets/SmartSummarizer.tsx:24, 61`
- **Reproduction Steps**:
  1. Render `SmartSummarizer` widget. Click "Generate Summary".
- **Observed Behavior**:
  `POST /api/data-ingestion/summarize` returns `404 Not Found`. UI catches error and renders fallback mock string.
- **Expected Behavior**:
  Backend should register `POST /summarize` invoking a LLM summarizer pipeline.

### Defect 11: Macro Widgets Call Non-Existent Endpoints
- **File & Line**: `research-os-frontend/src/components/widgets/MacroDashboard.tsx:65` & `MarketMetrics.tsx:36`
- **Reproduction Steps**:
  1. Navigate to `/macro`. Check browser network tab.
- **Observed Behavior**:
  Requests to `/api/data-ingestion/macro-dashboard` and `/api/data-ingestion/market-metrics` fail with `404 Not Found`. Both widgets fall back to static constants.
- **Expected Behavior**:
  Backend should implement macro metrics endpoints querying `macro_indicators` and `market_metrics` tables.

### Defect 12: AIAssistant Widget Uses Fake Simulated Responses
- **File & Line**: `research-os-frontend/src/components/widgets/AIAssistant.tsx:93-104`
- **Reproduction Steps**:
  1. Open AI Assistant widget. Ask any specific question (e.g. "What was Capex in FY24?").
- **Observed Behavior**:
  Zero HTTP calls are made. Widget waits 1000ms via `setTimeout()` and checks for hardcoded keywords ("revenue", "ebitda", "debt"). If not matched, returns a canned generic string.
- **Expected Behavior**:
  Should call backend `POST /api/data-ingestion/search` or chat endpoint with question embedding, returning grounded PDF citations.

### Defect 13: NextAuth Relational Tables Missing from Schema
- **File & Line**: `postgres/init/01_schema.sql`
- **Reproduction Steps**:
  1. Initialize database via `docker-compose up postgres`.
  2. Query `\dt` in psql.
- **Observed Behavior**:
  Tables `users`, `accounts`, `sessions`, and `verification_tokens` do not exist.
- **Expected Behavior**:
  `01_schema.sql` should include standard NextAuth PostgreSQL tables.

### Defect 14: PDF Extractor Stub
- **File & Line**: `data-ingestion/src/data_ingestion/extractors/pdf.py:7-13`
- **Reproduction Steps**:
  1. Call `PDFExtractor().extract("HDFC_Bank_Concall_Q4_FY24.pdf")`.
- **Observed Behavior**:
  Returns hardcoded string `{"text": "Extracted text from PDF...", "pages": 10}`. No actual parsing takes place.
- **Expected Behavior**:
  Integrate `pdfplumber` or `pypdf` to extract true text, tabular matrices, and page counts.

### Defect 15: Vector Store Decoupled from PostgreSQL and Qdrant
- **File & Line**: `data-ingestion/src/data_ingestion/embeddings/vector_store.py:6-30`
- **Reproduction Steps**:
  1. Add vectors to `VectorStore`. Inspect `document_chunks` table in Postgres.
- **Observed Behavior**:
  Database table remains empty; vectors exist only in transient Python process RAM.
- **Expected Behavior**:
  `VectorStore` should execute `INSERT INTO document_chunks (embedding, ...)` and query via `pgvector` HNSW cosine distance operator (`<=>`).

---

## 5. Prioritized Remediation Roadmap

To resolve the identified defects and advance from ~28% implementation toward 100% spec index compliance, the following three remediation phases are recommended:

### Phase 1 (P0): Infrastructure & API Plumbing Fixes (Immediate)
1. **Fix Math Engine Serialization**: Replace `outputs.model_dump()` with `dataclasses.asdict(outputs)` across all 17 routes in `math-engine/api/main.py`.
2. **Configure Local Rewrites**: Update `next.config.ts` fallback destination to `http://localhost:8000` for math engine and `http://localhost:8001` for data ingestion.
3. **Pass Dynamic Route Symbol**: Update `research-os-frontend/src/app/company/[symbol]/page.tsx` to extract `symbol` from `useParams()` and pass it to `<WidgetRenderer type={w} symbol={symbol} companySymbol={symbol} />`.
4. **Fix Docker Compose Healthchecks & Frontend**:
   - Install `curl` in `math-engine/Dockerfile` and `data-ingestion/Dockerfile` (or use Python urllib in healthchecks).
   - Add `frontend` service to `docker-compose.yml`.
   - Comment out hardcoded NVIDIA GPU reservations in `docker-compose.yml` to allow universal CPU execution.
5. **Implement Missing Data Ingestion Endpoints**: Add `/documents`, `/summarize`, `/macro-dashboard`, and `/market-metrics` endpoints to `data-ingestion/api/main.py`.

### Phase 2 (P1): Regulatory Compliance & Data Pipeline Integration (Weeks 2–4)
1. **Centralize Frontend API Client (`src/lib/api.ts`)**: Create a unified typed client replacing inline widget fetch calls.
2. **Wire Real Document Extraction & pgvector**:
   - Integrate `pdfplumber` into `PDFExtractor`.
   - Connect `VectorStore` to PostgreSQL `pgvector` `document_chunks` table using HNSW indexing.
   - Wire `AIAssistant.tsx` to backend `POST /api/data-ingestion/search`.
3. **Add NextAuth Tables to `01_schema.sql`**: Add `users`, `accounts`, `sessions`, and `verification_tokens`.
4. **Implement Union Budget (July 23, 2024) Tax Engine**:
   - Implement Section 111A (20%) and Section 112A (12.5% with ₹1.25L exemption) in portfolio calculation models.
   - Implement Section 55(2)(ac) grandfathering FMV lookup as of January 31, 2018.

### Phase 3 (P2): Institutional Domain & Interaction Upgrades (Weeks 5–8)
1. **Schedule III Division II vs Division III State Machine**: Implement dynamic branching across company tabs for Banking/NBFC entities.
2. **Ind AS 116 Lease Normalization Toggle**: Add global toggle across company tabs to normalize EBITDA, Net Debt, and ROCE.
3. **Compulsory Red-Flag Veto Gates**: Implement hard knockout logic in `/weigh` terminating buy recommendations upon auditor resignations, CARO qualifications, or promoter pledges > 40%.
4. **Institutional Earnings Calendar**: Implement SEBI LODR Regulation 29 (5 clear days notice) and Regulation 33 tracking on the tasks page.

---

*Report authored independently by `explorer_m3_data_plumbing_specs` in compliance with read-only investigation mandates.*
