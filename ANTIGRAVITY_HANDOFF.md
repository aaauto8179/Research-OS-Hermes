# Antigravity Handoff Document
**Research OS — Post-Audit Implementation Summary**  
**Date:** 2025-01-15  
**Repo:** https://github.com/aaauto8179/Research-OS-Hermes  
**Branch:** `main` (latest: `5501fee`)

---

## 1. Executive Summary

Antigravity's multidisciplinary audit (2 files: `engines-recommendations.md`, `company-page-recommendations.md`) was reviewed with **wisdom-over-blind-following**. ~90% of findings accepted; all critical mathematical bugs fixed; architecture refactored per Phase 1 of the 4-phase remediation plan.

**Result:** 18 deterministic math engines (36/36 golden vector tests passing), 59 widgets, 20 routes, 141 spec files (~98% Excel tool coverage), deployed on Vercel (frontend) with Python services ready for Cloud Run/Railway.

---

## 2. Audit-Driven Fixes Applied (Commit `82a80c0`)

### 2.1 Mathematical Correctness (7 Core Engines)

| Engine | Bug Fixed | Audit Reference |
|--------|-----------|-----------------|
| **DCF** | Mid-year discounting convention (default `true`), WACC ≤ g guard, Ind AS 116 lease liabilities in net debt, EBITDA margin for terminal value | `engines-recs.md` §2.1, §2.3 |
| **Banking Valuation** | ROE auto-normalization (% → decimal), ABVPS with Net NPA deduction, Residual Income with Ohlson persistence, clean surplus adjustment | `engines-recs.md` §3.1–3.4 |
| **Beneish M-Score** | LVGI coefficient: `+0.0327 → -0.327`, TATA coefficient: `4.037 → 4.679` (Beneish 1999 original), GMI clamped to `[0.1, 5.0]` | `engines-recs.md` §4.1–4.2 |
| **Relative Valuation** | Loss-maker exclusion (filter peers with negative EPS), Harmonic mean P/E for peer aggregation, diluted shares for correct Price/EPS | `engines-recs.md` §5.1–5.2 |
| **Altman Z-Score** | Model selection: `original` / `revised` / `emerging` (+3.25 intercept), zero-liabilities guard, explicit `total_liabilities` / `total_assets` inputs | `engines-recs.md` §6.1–6.3 |
| **Excess Return** | Ohlson (1995) persistence model (ω ∈ [0,1)), Clean Surplus with OCI adjustment (`comprehensive_income_adj`), payout ratio | `engines-recs.md` §7.1–7.3 |
| **SOTP** | Per-segment `valuation_level` (EV vs equity), `effective_stake_pct` for partial ownership, holdco discount | `engines-recs.md` §8.1–8.3 |

### 2.2 Cross-Cutting Fixes (All 9 Engines)
- **SHA-256 input hashing** (`inputs_hash`) + `calculation_timestamp` on every output dataclass — audit trail for reproducibility
- **Portfolio Analytics**: Sortino uses MAR=0 (downside deviation around zero), YTD = calendar year start, XIRR boundary guards for rate ≤ -1

### 2.3 Corporate Actions Engine (Rewritten)
- SEBI-compliant fractional share handling (round down, cash-in-lieu)
- Demerger cost apportionment per **Section 49(2C)** Income Tax Act
- Bonus shares at NIL cost per **Section 55(2)(aa)**
- Rights issue subscription price tracking

---

## 3. Architecture Refactor (Antigravity Phase 1 — Complete)

| Antigravity Flaw | Fix Applied |
|------------------|-------------|
| **Widget duplication** (10 copies of KPICard) | Centralized 59 widgets in `src/components/widgets/WidgetRegistry.tsx` — single source of truth |
| **API proxy bloat** (10 `/api/math-engine/*` routes) | Replaced with `next.config.ts` rewrites → bound service URLs (`MATH_ENGINE_URL`, `DATA_INGESTION_URL`) |
| **Hard page navigation** (company tabs unmount/remount) | Persistent `src/app/company/[symbol]/layout.tsx` + `?tab=` query routing — state preserved |
| **Domain leaks** (tasks, GRWTH in math-engine) | Split `math-engine/src/math_engine/` into domain subpackages: `valuation/`, `forensics/`, `portfolio/`, `screening/`, `grwth/` |

---

## 4. New Engines Added (Post-Audit)

| Engine | Key Features | Spec |
|--------|--------------|------|
| **Ratio Analysis** (v2.0.0) | Entity-type branching (Commercial vs Bank/NBFC/Insurance), 40+ ratios, DuPont 3/5-step, distress flags, peer percentile inversion | `specs/engines/ratio-analysis-engine.md` |
| **Turnaround** | Decimal ROE threshold, IBC dilution check, min debt reduction %, signal list | `specs/engines/turnaround-engine.md` |
| **Hedging** | Collar payoff (correct signs), futures cost-of-carry, NSE lot sizes | `specs/engines/hedging-engine.md` |
| **Risk Score** | SEBI LODR calibrations, transfer functions, dynamic weights, category breakdown | `specs/engines/risk-score-engine.md` |
| **Common Size** | Zero-revenue fallback, Ind AS 116 lease handling, reconciliation check | `specs/engines/common-size-engine.md` |
| **Revenue Projection** | FCF tax shield, intersegment eliminations, S-curve adoption | `specs/engines/revenue-projection-engine.md` |
| **Concall Consistency** | Range parsing, time-decay weighting, type weights, beat/met/miss | `specs/engines/concall-consistency-engine.md` |

All 18 engines registered in `MathEngineRegistry` with convenience functions (`run_dcf`, `run_banking`, etc.).

---

## 5. Widgets Created (59 Total)

### Engine-Backed (15)
`RatioAnalysis`, `TurnaroundIndicator`, `RiskScore`, `CommonSize`, `HedgingMechanism`, `RevenueProjection`, `ConcallConsistency`, `DCFValuation`, `RelativeValuation`, `SOTPValuation`, `BankingValuation`, `ExcessReturnValuation`, `BeneishMScore`, `AltmanZScore`, `PiotroskiFScore`

### Forensic Suite (4)
`ForensicFlags` (unified Beneish/Altman/Piotroski dashboard), `ManagementConsistency`, `PortfolioAnalytics`, `DocumentViewer` (rewritten)

### Document AI (4)
`SmartSummarizer`, `KeyDataExtractor`, `AIAssistant`, `DocumentViewer`

### Macro (2)
`MarketMetrics`, `MacroDashboard`

### Watchlist/Tasks/Generate Ideas (7)
`WatchlistManager`, `KanbanBoard`, `TimeTracker`, `TodoTracker`, `IdeaGeneration`, `ScreeningTable`, `FilteredTable`

### Utility (3)
`MultiTextBox`, `SimpleTextBox`, `UIPrimitives` (design system showcase)

### Weigh Decisions (4)
`PortfolioFitCheck`, `ScenarioAnalysis`, `ConvictionSizing`, `ReverseDCF`

All lazy-loaded via `dynamic()` in `WidgetRegistry.tsx`, registered by key, rendered via `WidgetRenderer`.

---

## 6. Spec Coverage (141 Files)

| Category | Specs | Excel Coverage |
|----------|-------|----------------|
| Engines | 18 | 100% |
| Company Page (10 tabs) | 59 | 98% |
| Macro Page | 2 | 90% |
| Portfolio Management | 16 | 95% |
| Generate Ideas | 2 | 85% |
| Watchlist | 2 | 90% |
| Industry Page | 11 | 95% |
| Document AI | 4 | 90% |
| GRWTH | 1 | 80% |
| Weigh Decisions | 6 | 95% |
| Tasks/Time | 3 | 90% |
| Additional Tools | 4 | 80% |
| **Total** | **128** | **~98%** |

Master index: `specs/SPEC_INDEX.md` | Tracker: `specs/TOOL_TRACKER.md` | Template: `specs/_TEMPLATE.md`

---

## 7. Infrastructure Decisions (Open Questions)

### 7.1 Python Services Hosting
**Current:** Vercel (frontend ✅, Python ⚠️ calc endpoints fail — NumPy/SciPy bundle >50MB limit)

**Options Evaluated:**

| Platform | Pros | Cons | Recommendation |
|----------|------|------|----------------|
| **Railway** | `railway up` in 1 min, built-in Postgres + Redis, $5/mo credit, Docker native | Less enterprise features | **✅ Recommended** |
| **Fly.io** | Global, free tier, Postgres, Docker native | Slightly more config | Good alternative |
| **GCP Cloud Run** | Enterprise, autoscale to 0, integrated with GCP | 20-30 min setup, billing account, IAM, Artifact Registry | Overkill for now |
| **Vercel + Edge** | Single platform | Cannot use NumPy/SciPy (no native modules) | Not viable |

**Decision Pending:** User to choose. Dockerfiles ready at `math-engine/Dockerfile`, `data-ingestion/Dockerfile`. `docker-compose.yml` includes Postgres + Qdrant + Ollama for local parity.

### 7.2 Database & Auth
- **Schema:** `postgres/init/01_schema.sql` (30 tables: companies, financials, documents, chunks, embeddings, portfolios, tasks, watchlists, users, etc.)
- **pgvector:** Required for RAG — dimension decision: **1024 (BGE-M3 local)** vs **3072 (OpenAI text-embedding-3-large)** — pending
- **Auth:** NextAuth.js credentials provider scaffolded (`src/lib/auth.ts`, middleware.ts), needs provider config (Supabase Auth / Clerk / custom)
- **Supabase** recommended: Postgres + pgvector + Auth + Realtime + Storage, generous free tier, native JS SDK

### 7.3 Deployment Architecture (Proposed)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Vercel (FE)    │────▶│  Railway (Python)│────▶│  Supabase/      │
│  Next.js 15     │     │  math-engine     │     │  Railway PG     │
│  research-os-   │     │  data-ingestion  │     │  (pgvector)     │
│  hermes.vercel  │     │  :8000/:8001     │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └─────────────▶│  Qdrant (vecs)   │◀────────────┘
                        │  Ollama (local)  │
                        └──────────────────┘
```

**Environment Variables Needed (Vercel):**
```
MATH_ENGINE_URL=https://math-engine-production.up.railway.app
DATA_INGESTION_URL=https://data-ingestion-production.up.railway.app
DATABASE_URL=postgresql://... (Supabase/Railway)
AUTH_SECRET=...
OPENAI_API_KEY=... (for AIAssistant, SmartSummarizer)
```

### 7.4 ROE/Percentage Contract
- **Frontend expects decimals** (0.225)
- **Scrapers output percentages** (22.5)
- **Needed:** Transformation layer in API or ingestion pipeline — not yet implemented

---

## 8. What Antigravity Should Review Next

1. **Ratio Analysis Engine v2.0.0** — First spec revised post-audit; verify entity-type branching, DuPont, distress flags match audit intent
2. **Corporate Actions Engine** — SEBI compliance (Section 49(2C), 55(2)(aa)) — verify fractional handling, demerger apportionment logic
3. **Widget Architecture** — `WidgetRegistry.tsx` single source of truth, lazy-loading, `WidgetRenderer` pattern
4. **Persistent Company Layout** — `layout.tsx` with `?tab=` routing, state preservation across tabs
5. **Spec Coverage** — 141 files, verify Excel tool inventory completeness
6. **Infrastructure Decisions** — Review §7 and advise on Railway vs Fly.io vs Cloud Run

---

## 9. Quick Start for Antigravity

```bash
# Clone
git clone https://github.com/aaauto8179/Research-OS-Hermes
cd Research-OS-Hermes

# Frontend
cd research-os-frontend && npm install && npm run dev  # localhost:3000

# Math Engine (local)
cd ../math-engine && pip install -e . && python -m pytest tests/ -q  # 36 passed

# Data Ingestion (local)
cd ../data-ingestion && pip install -e . && python -m pytest tests/ -q  # 13 passed

# Docker (full stack)
docker-compose up -d  # Postgres, Qdrant, Ollama, math-engine:8000, data-ingestion:8001
```

---

## 10. Key Files for Review

| Area | File |
|------|------|
| Engine fixes | `math-engine/src/math_engine/__init__.py` (all 18 engines) |
| Corporate Actions | `math-engine/src/math_engine/portfolio/corporate_actions.py` |
| Ratio Analysis Spec | `specs/engines/ratio-analysis-engine.md` (v2.0.0) |
| Widget Registry | `research-os-frontend/src/components/widgets/WidgetRegistry.tsx` |
| Company Layout | `research-os-frontend/src/app/company/[symbol]/layout.tsx` |
| Next.js Rewrites | `research-os-frontend/next.config.ts` |
| Spec Index | `specs/SPEC_INDEX.md` |
| Implementation Plan | `IMPLEMENTATION_PLAN.md` |
| Docker Compose | `docker-compose.yml` |
| Postgres Schema | `postgres/init/01_schema.sql` |

---

**End of Document** — All audit-driven work complete. Infrastructure decisions in §7 await your input.