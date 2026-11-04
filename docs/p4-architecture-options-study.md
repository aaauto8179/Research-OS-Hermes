# Research OS — Architecture & Open-Source Options Deep Study

**Phase:** Phase 4 (Architecture & Tech Stack Decision Matrix)  
**Date:** November 2026  
**Audience:** Technical Leads, No-Code/Vibe-Coding Architects, Product Owners  
**Target:** ROS Hermes Investment Research Platform

---

## 1. Executive Summary & Evaluation Framework

To transform ROS Hermes from a collection of isolated mock widgets into an institutional-grade reactive research platform, we evaluate 3–4 open-source and modern options across each architectural layer.

### The 5 Evaluation Criteria:
1. **Pros & Capabilities:** Analytical and institutional power.
2. **Cons & Limitations:** Edge-case failures, dependencies, or maintenance overhead.
3. **Costing:** Free Open-Source (OSS), Cloud Free-Tier, or Commercial API pricing.
4. **Vibe Codability for a No-Coder:** How seamlessly an AI assistant (Antigravity, Cursor, Claude) can generate, edit, and maintain the code without arcane boilerplate or cryptic bugs.
5. **Project Compatibility & Ease:** Fit with Next.js 15, FastAPI, and PostgreSQL.

---

## 2. Layer 1: Document Parsing & Table Extraction (Fact Lake Ingestion)

| Dimension | Option A: IBM Docling | Option B: LlamaParse (LlamaIndex) | Option C: Marker / Surya | Option D: PyMuPDF + Gemini Flash Vision |
|:---|:---|:---|:---|:---|
| **Core Nature** | Open-Source local document parser | Hosted AI document parsing cloud API | Open-Source OCR & Markdown converter | Lightweight text extractor + Multimodal LLM |
| **Pros** | Layout-aware table extraction directly to Pandas DataFrames; cell coordinates for citations; 100% on-premise | Exceptional accuracy on multi-page nested tables; Markdown output; zero server setup | Fast; handles two-column text and formulas; generates clean Markdown | Fast; zero complex ML dependencies; Gemini 1.5 Flash parses complex tables via image |
| **Cons** | Requires CPU/GPU resources; initial setup downloads ~1.5 GB model weights | Hosted cloud service; data leaves local environment; rate-limits | Setup on Windows can have environment friction; less granular cell coordinates | Requires hybrid routing logic (text vs image crop) |
| **Costing** | **100% Free** (MIT License) | **Freemium:** 1,000 pages/mo free, then $0.003/page | **100% Free** (GPL-3.0 License) | **Negligible:** PyMuPDF free + Gemini Flash ($0.075 / 1M tokens) |
| **Vibe Codability** | **9 / 10** (Clean 5-line Python script, AI generates it easily) | **10 / 10** (Single API call, perfect for AI prompt agents) | **7 / 10** (CLI is easy, but Python API is evolving) | **10 / 10** (Extremely simple Python, zero build headaches) |
| **Project Compatibility** | **10 / 10** (Plugs directly into `data-ingestion`) | **9 / 10** (Requires API key and network access) | **8 / 10** (GPL license has copyleft considerations) | **10 / 10** (Seamless with Python FastAPI) |
| **Ease of Use** | **High** (`pip install docling`) | **Very High** (Zero infrastructure) | **Moderate** (CUDA / Torch config) | **High** (Standard Python libraries) |

**Recommendation:** **Option A (Docling)** for local offline processing; **Option D (PyMuPDF + Gemini Flash)** as the primary agile fallback.

---

## 3. Layer 2: Market & Fundamental Data Ingestion

| Dimension | Option A: jugaad-data + nsepython | Option B: OpenBB Platform | Option C: Financial Modeling Prep (FMP) / EODHD | Option D: Screener.in Community Scraper |
|:---|:---|:---|:---|:---|
| **Core Nature** | Open-source Indian stock exchange scrapers | Institutional modular Python data platform | Commercial financial data API | Community Python web scrapers |
| **Pros** | Direct from NSE India & RBI; historical bhavcopies, live quotes, lot sizes, corporate actions | Standardized Pydantic schemas; 100+ global data sources; institutional support | Cleaned, standardized 10-30 year financial statements; global & Indian NSE tickers (`RELIANCE.NS`) | Pre-cleaned 10-year Indian balance sheets, quarterly results, and promoter holdings |
| **Cons** | Can break if NSE changes web headers; requires session headers management | Heavily US/global-centric; Indian data requires custom provider extensions | Paid for historical depth; external API dependency | Scraping risk; subject to IP rate-limiting |
| **Costing** | **100% Free** (MIT) | **100% Free** (AGPL / Permissive core) | **Freemium:** Free tier (250 req/day), then $19–$49/mo | **100% Free** (Community OSS) |
| **Vibe Codability** | **9 / 10** (`jugaad_data.nse.stock_df(...)` is very simple) | **8 / 10** (Modular plugin structure requires multiple imports) | **10 / 10** (1 standard REST fetch returns complete JSON) | **8 / 10** (HTML parsing can require minor maintenance) |
| **Project Compatibility** | **10 / 10** (Essential for Indian exchange focus) | **8 / 10** (Large package footprint) | **10 / 10** (Fast JSON payloads) | **9 / 10** (Pulls exact Screener data format) |
| **Ease of Use** | **High** | **Moderate** | **Very High** | **Moderate** |

**Recommendation:** **Hybrid Approach:** Use **jugaad-data** for live NSE quotes/bhavcopies and **Screener Scraper / FMP API** for historical 10-year financial statements.

---

## 4. Layer 3: Database & Hybrid Storage (Fact Lake & State)

| Dimension | Option A: Supabase (Managed Postgres + pgvector + Auth) | Option B: Self-Hosted PostgreSQL 16 (Docker / Railway) | Option C: Neon Serverless Postgres + Qdrant Cloud | Option D: SQLite / DuckDB (Local-First Embedded) |
|:---|:---|:---|:---|:---|
| **Core Nature** | Managed cloud backend-as-a-service | Self-hosted relational DB with vector extension | Serverless autoscaling Postgres + dedicated vector DB | Embedded in-process analytical databases |
| **Pros** | All-in-one: Postgres, pgvector, auto-generated REST/Realtime APIs, Auth, S3 storage for PDFs; already in `src/lib/supabase.ts` | Complete data control; zero vendor lock-in; matches `postgres/init/01_schema.sql` exactly | Auto-scales to zero; branchable databases for testing; high-speed vector search | Zero network latency; zero hosting cost; single-file storage; DuckDB executes OLAP queries in ms |
| **Cons** | Cloud vendor dependency (though open-source engine) | Must manage connection pooling, backups, SSL, and auth | Dual-database management overhead | Not suited for multi-user web concurrency |
| **Costing** | **Free Tier:** 500MB DB, 1GB storage, 50k MAU; then $25/mo | **~$5–$10/mo** on Railway/Render; Free locally | **Free Tiers** available on both platforms | **100% Free** |
| **Vibe Codability** | **10 / 10** (AI assistants generate `@supabase/supabase-js` and `supabase-py` flawlessly) | **8 / 10** (Requires managing SQL migrations and connection pools) | **8 / 10** (Requires two separate client SDKs) | **9 / 10** (Standard SQL queries, zero cloud setup) |
| **Project Compatibility** | **10 / 10** (Client already scaffolded in frontend) | **10 / 10** (Docker Compose file already exists) | **9 / 10** (Compatible with standard Postgres drivers) | **8 / 10** (Requires bridging to Next.js API routes) |
| **Ease of Use** | **Very High** (Web dashboard + instantaneous setup) | **Moderate** (Docker container management) | **High** | **High** (Local file) |

**Recommendation:** **Option A (Supabase)** for production and development speed, with local Docker Postgres as the offline fallback.

---

## 5. Layer 4: Computational DAG & Inter-Tool Reactive Engine

*Solving the core problem: Revenue Projection $\rightarrow$ FCF Margins $\rightarrow$ DCF $\rightarrow$ Weigh Decisions.*

| Dimension | Option A: Apache Hamilton (DAGWorks) | Option B: Zustand / TanStack Store (Client-Side) | Option C: HyperFormula (Handsontable TS) | Option D: Dagster / Prefect |
|:---|:---|:---|:---|:---|
| **Core Nature** | Python micro-framework for declarative function DAGs | Client-side reactive TypeScript state store | Headless browser/Node spreadsheet calculation DAG | Python macro-orchestration workflow engine |
| **Pros** | **Automatic DAG building:** parameter names define dependencies; pure Python functions; audit lineage; what-if scenario overrides built-in | Zero backend latency; runs entirely in browser; instantly updates UI sliders; easy state management | Parses 400+ Excel formulas; handles circular dependency checks; blazing fast recalculation | Enterprise workflow scheduling; distributed cluster execution; rich monitoring UI |
| **Cons** | Recalculation requires a fast local Python API call (~50ms) | Complex financial math (NumPy/SciPy) must be ported to TypeScript | Excel A1/B2 coordinate paradigm is unnatural for multi-segment financial models | Overkill for in-memory model calculations; high setup overhead |
| **Costing** | **100% Free** (BSD-3 License) | **100% Free** (MIT License) | **Free OSS** (GPLv3 / Commercial) | **Free OSS** (Apache 2.0) |
| **Vibe Codability** | **10 / 10** (AI just writes: `def dcf(projected_fcf: list): ...`. Hamilton connects the nodes automatically) | **9 / 10** (Modern AI agents write Zustand stores with zero errors) | **7 / 10** (Requires translating models into spreadsheet formulas) | **6 / 10** (Heavy boilerplate: decorators, assets, ops, resources) |
| **Project Compatibility** | **10 / 10** (Fits directly into `math-engine`) | **10 / 10** (Standard for Next.js 15 apps) | **9 / 10** (Runs in Next.js frontend) | **7 / 10** (Too heavy for interactive UI requests) |
| **Ease of Use** | **Very High** (Zero infrastructure, just plain Python) | **Very High** (`npm install zustand`) | **Moderate** | **Low-Moderate** |

**Recommendation:** **Hybrid Architecture:**
- **Backend:** **Apache Hamilton** orchestrates the canonical computational graph and multi-scenario runs (Base, Bull, Bear).
- **Frontend:** **Zustand** acts as the client-side reactive coordinator, passing slider inputs to Hamilton and storing tool outputs.

---

## 6. Layer 5: Valuation, Forensics & Quantitative Analytics

| Dimension | Option A: Existing Custom 18 ROS Engines | Option B: FinanceToolkit (JerBouma) | Option C: Riskfolio-Lib (CVXPY) | Option D: PyPortfolioOpt |
|:---|:---|:---|:---|:---|
| **Core Nature** | Deterministic Python engines in `math-engine` | Comprehensive financial ratio & modeling library | Institutional portfolio risk & optimization library | Lightweight mean-variance portfolio optimizer |
| **Pros** | Custom-built for Indian regulations (Ind AS 116, Sec 49(2C) demergers, Altman Z emerging); 36 tests pass | 500+ institutional formulas; complete transparency; balance sheet & cash flow normalizer | **10+ advanced risk measures** (CVaR, CDaR, Drawdown); replaces `Math.random()` with real portfolio risk | Clean scikit-learn API; Black-Litterman models; Ledoit-Wolf covariance shrinkage |
| **Cons** | Needs typed graph interfaces; maintained internally | Global standard statements; requires mapping Indian schedule III items | Heavy C++ solver dependencies (CVXPY); complex quantitative theory | Primarily limited to normal variance/covariance models |
| **Costing** | **100% Free** (Already built in repo) | **100% Free** (MIT License) | **100% Free** (BSD-3 License) | **100% Free** (MIT License) |
| **Vibe Codability** | **9 / 10** (Clean dataclasses, already written) | **10 / 10** (1-line collection: `toolkit.ratios.collect_all()`) | **8 / 10** (Clean API, but requires understanding risk metrics) | **9 / 10** (Standard Python quantitative workflow) |
| **Project Compatibility** | **10 / 10** (Already in repository) | **10 / 10** (Standard Python library) | **10 / 10** (Plugs into `math-engine/portfolio`) | **10 / 10** (Plugs into `math-engine/portfolio`) |
| **Ease of Use** | **High** | **Very High** | **Moderate** | **High** |

**Recommendation:** **Keep & Wrap Option A (Existing 18 Engines)** for valuation & forensics, and add **Option C (Riskfolio-Lib)** to power the Weigh Decisions & Portfolio Fit algorithms.

---

## 7. Layer 6: Financial UI, Spreadsheets & Data Grids

| Dimension | Option A: AG Grid (Community Edition) | Option B: Univer (`dream-num/univer`) | Option C: TanStack Table v8 + Tailwind | Option D: Handsontable |
|:---|:---|:---|:---|:---|
| **Core Nature** | Enterprise financial data grid | Open-source web-based spreadsheet suite | Headless React table utility | Interactive JavaScript spreadsheet grid |
| **Pros** | **The industry standard for finance.** Virtualized scrolling; column pinning; sorting; high performance on 10,000+ rows | Full Excel-like spreadsheet experience in canvas; native AI agent skills; formula bar | 100% customizable; zero styling lock-in; matches Shadcn UI perfectly | Traditional spreadsheet look and feel; inline cell editing |
| **Cons** | Enterprise features (pivoting, export) require paid license; Community covers 95% | Large bundle size; newer ecosystem; requires canvas event understanding | Must code pinning and virtual scrolling manually | Restrictive commercial license ($1,290+/yr) |
| **Costing** | **100% Free** (Community is MIT) | **100% Free** (Apache 2.0) | **100% Free** (MIT License) | **Paid for Commercial** ($1,290+/dev) |
| **Vibe Codability** | **9 / 10** (Declarative `columnDefs`, AI generates it cleanly) | **7 / 10** (Plugin architecture has learning curve for no-coders) | **9 / 10** (Modern React standard, AI writes it effortlessly) | **8 / 10** (Straightforward component props) |
| **Project Compatibility** | **10 / 10** (React component ready) | **9 / 10** (Next.js client component) | **10 / 10** (Already used in Shadcn UI) | **9 / 10** (React wrapper available) |
| **Ease of Use** | **Very High** | **Moderate** | **High** | **High** |

**Recommendation:** **Option A (AG Grid Community)** for financial statements and screening tables; **Option C (TanStack Table)** for customized summary cards and widgets.

---

## 8. Layer 7: AI Intelligence & Agentic RAG

| Dimension | Option A: Gemini 1.5 Flash / Pro (Google Cloud) | Option B: Local Ollama + Qdrant (Llama 3.3 / Qwen) | Option C: LangChain / LlamaIndex Agent Framework | Option D: Direct Structured Outputs (OpenAI / Claude) |
|:---|:---|:---|:---|:---|
| **Core Nature** | 1M–2M token multimodal foundation model | Local air-gapped LLM & vector search | Complex agentic framework with chains and routers | API with JSON Schema enforcement |
| **Pros** | **2,000,000 token context window:** ingests an entire 300-page Annual Report + Concall in one prompt; eliminates chunking loss; ultra-cheap | 100% private and air-gapped; zero external API fees; matches `docker-compose.yml` | Large library of third-party connectors and pre-built document loaders | Guaranteed valid JSON matching Pydantic schemas; high reasoning accuracy |
| **Cons** | Cloud API; requires network and API token | Requires high-end GPU hardware (16GB+ VRAM) for acceptable speed | "Spaghetti framework": frequent breaking changes; difficult for no-coders to debug | Smaller context windows require aggressive document chunking |
| **Costing** | **Extremely Low:** $0.075 / 1M tokens (Flash) | **Free Software**, local hardware cost | **Free OSS**, underlying API fees apply | **Moderate:** $2.50 to $15.00 / 1M tokens |
| **Vibe Codability** | **10 / 10** (Simple direct SDK: `model.generate_content(...)`) | **8 / 10** (Requires managing local Docker containers) | **5 / 10** (High debugging friction, abstract classes) | **10 / 10** (Standard Pydantic models) |
| **Project Compatibility** | **10 / 10** (First-class integration) | **10 / 10** (Docker compose already prepared) | **7 / 10** (Heavy dependency footprint) | **10 / 10** (Standard HTTP REST) |
| **Ease of Use** | **Very High** | **Moderate** | **Low-Moderate** | **High** |

**Recommendation:** **Option A (Gemini 1.5 Flash)** for ingesting large Indian annual reports with zero chunking loss, backed by **Option B (Local Ollama)** when working offline.

---

## 9. The "Golden Vibe-Coder Stack" (Optimal Architecture)

For an autonomous agent or non-coder to build and maintain this system effortlessly, this is the winning combination:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          THE WINNING STACK                             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Extraction:    Docling (IBM) + PyMuPDF                              │
│ 2. Market Data:   jugaad-data (NSE quotes) + Screener/FMP API          │
│ 3. Database:      Supabase (PostgreSQL + pgvector + Auth + Storage)    │
│ 4. Graph Engine:  Apache Hamilton (Python DAG) + Zustand (Frontend)    │
│ 5. Calculations:  Existing 18 ROS Engines + Riskfolio-Lib (Risk)       │
│ 6. Presentation:  AG Grid Community + Shadcn UI + Lightweight Charts   │
│ 7. AI Analysis:   Gemini 1.5 Flash (1M+ Token Context Window)          │
└────────────────────────────────────────────────────────────────────────┘
```

### Why this stack wins for a No-Coder / Vibe-Coder:
1. **Zero Glue Boilerplate:** Apache Hamilton connects functions purely by matching parameter names. An AI agent never has to write brittle graph-wiring plumbing.
2. **Infinite Context AI:** Gemini 1.5 Flash reads entire 200-page annual reports at once, eliminating complex multi-stage vector search errors.
3. **Institutional UI with 10 Lines of Code:** AG Grid renders virtualized, pinned, sorted financial statements with a single declarative array.
4. **Zero Throwaway Work:** All 18 existing math engines and 86 widgets remain intact—they simply get plugged into the Hamilton DAG and Zustand store.
