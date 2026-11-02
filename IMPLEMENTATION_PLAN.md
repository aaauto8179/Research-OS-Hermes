# Research OS — Master Implementation Plan (Post-Audit)

**Version:** 2.0.0  
**Date:** 2026-11-02  
**Based On:** Antigravity Multidisciplinary Audit (9 categories, 128 specs)  
**Approach:** Sequential, quality-first implementation with full test coverage

---

## 📊 Implementation Priority Matrix

| Phase | Category | Specs | Criticality | Est. Duration |
|-------|----------|-------|-------------|---------------|
| **1** | **Core Engines** (Mathematical Foundation) | 18 | **P0 — Critical** | 3-4 weeks |
| **2** | **Company Page — Overview & Management** | 13 | **P0 — Critical** | 2-3 weeks |
| **3** | **Company Page — Valuation & Financials** | 15 | **P0 — Critical** | 2-3 weeks |
| **4** | **Company Page — Risk, SME, Downsides** | 21 | **P0-P1** | 2-3 weeks |
| **5** | **Portfolio Management** | 16 | **P1 — High** | 2 weeks |
| **6** | **Industry Page** | 11 | **P1 — High** | 1-2 weeks |
| **7** | **Document AI & Ingestion** | 5 | **P1 — High** | 2 weeks |
| **8** | **Weigh Decisions** | 6 | **P1 — High** | 1-2 weeks |
| **9** | **Macro, Watchlist, Generate Ideas, Tasks** | 8 | **P2 — Polish** | 1-2 weeks |
| **10** | **Additional Tools (UI Primitives)** | 4 | **P2 — Polish** | 1 week |

**Total:** 128 specs | **Est. Total: 18-25 weeks** (sequential, quality-first)

---

## 🎯 Phase 1: Core Computational Engines (18 Specs) — P0 CRITICAL

*All downstream tools depend on mathematical correctness. Zero tolerance for formula errors.*

### 1.1 Engine Audit Summary (Critical Defects)

| Engine | Critical Defect | Fix Required |
|--------|----------------|--------------|
| `dcf-engine.md` | No mid-year discounting, WACC≤g explosion, invalid EBITDA reverse-calc, missing Ind AS 116 lease debt bridge | Mid-year discounting, WACC-g guard, proper EBITDA projection, Ind AS 116 Net Debt |
| `banking-engine.md` | ROE percentage/decimal mismatch (64x price error), raw BVPS without Net NPA deduction | Decimal normalization, Adjusted BVPS (ABVPS) with Net NPA deduction |
| `beneish-engine.md` | LVGI formula wrong (tracks asset growth, not leverage) | Correct LVGI = Leverage_t / Leverage_{t-1} |
| `relative-engine.md` | EV→Equity bridge missing (overstates by debt amount), loss-making peer distortion | EV→Equity bridge with Net Debt/Lease/Minority, exclude negative peers |
| `revenue-projection.md` | FCF double-counts D&A tax shield | Correct FCFF = EBITDA×(1-t) + D&A×t - Capex - ΔNWC |
| `corporate-actions.md` | Integer truncation violates SEBI fractional rules | SEBI-compliant fractional handling with cash-in-lieu |
| `sotp-engine.md` | EV/Equity mixing, missing ownership %, no holdco discount | Valuation level per segment, effective_stake_pct, holdco discount sensitivity |
| `portfolio-engine.md` | XIRR Newton divergence, sub-1yr annualization, wrong RFR | Brent-Dekker solver, absolute return <1yr, daily RFR |
| `ratio-analysis.md` | Negative equity ROE inversion, banking metrics missing | NM for negative equity, banking/NBFC branch |
| `screening-engine.md` | FCF Yield uses CFO not FCF, factor inversion missing, loss-makers sort wrong | FCF = CFO-Capex, invert "lower better", flag LOSS_MAKING |
| `risk-score.md` | No transfer functions, missing SEBI calibrations | Transfer functions, SEBI pledge/RPT/auditor weights |
| `altman-engine.md` | X4 uses Market Cap not BV Equity, missing Z'' intercept | Correct X4 per model, Z'' intercept +3.25 |
| `piotroski.md` | LEVER uses D/E not LT Debt/Assets, bonus/split not normalized | Correct LEVER, normalize shares for corp actions |
| `excess-return.md` | 2× undocumented multiplier, Clean Surplus violation (OCI) | Resolve per-share vs aggregate, Comprehensive Income ROE |
| `hedging.md` | Collar payoff sign inversion, dividend yield dimensional error | Correct collar payoff, F = S₀×[1+(r-q)T/365] |
| `turnaround.md` | ROE threshold 5 vs 0.05, IBC dilution not checked | Normalize to decimal, check dilution <10% |
| `hedging.md` | (duplicate entry) | See above |
| `common-size.md` | Zero revenue division, negative equity handling | Fallback base, enforce sum=100% |

### 1.2 Implementation Order (Dependency-Aware)

```
Week 1-2: Foundation Engines (no dependencies)
  1. ratio-analysis-engine.md     ← Core ratios used everywhere
  2. common-size-engine.md        ← Statement normalization
  3. screening-engine.md          ← Uses ratios

Week 2-3: Valuation Engines (depend on ratios)
  4. dcf-engine.md                ← Uses WACC, ratios
  5. relative-engine.md           ← Uses peer ratios
  6. excess-return-engine.md      ← Uses DCF outputs
  7. banking-engine.md            ← Specialized branch
  8. sotp-engine.md               ← Aggregates above

Week 3-4: Forensic & Specialized Engines
  9. beneish-engine.md            ← Uses ratios
  10. altman-engine.md            ← Uses ratios
  11. piotroski-engine.md         ← Uses ratios
  12. corporate-actions-engine.md ← Standalone
  13. revenue-projection-engine.md ← Uses ratios
  14. portfolio-engine.md         ← Uses XIRR, ratios
  15. risk-score-engine.md        ← Aggregates all
  16. turnaround-engine.md        ← Uses ratios + forensic
  17. hedging-engine.md           ← Standalone
  18. concall-consistency-engine.md ← NLP + ratios
```

### 1.3 Testing Requirements Per Engine

| Test Type | Coverage |
|-----------|----------|
| **Golden Vector Tests** | 36 vectors per engine (existing) + 12 edge cases |
| **Property-Based Tests** | QuickCheck-style: commutativity, idempotency, bounds |
| **Regulatory Compliance** | SEBI/RBI/Ind AS test cases per engine |
| **Edge Case Coverage** | Zero/negative denominators, negative equity, zero interest, WACC≤g |
| **Precision Tests** | Float64 vs Decimal parity, floating-point drift < 1e-10 |
| **Performance** | <1.5ms for 9x9 sensitivity, <10ms for full DCF |

---

## 🎯 Phase 2: Company Page — Overview & Management (13 Specs)

### 2.1 Overview Tab (7 Specs) — P0

| Spec | Key Fixes |
|------|-----------|
| `about-company.md` | CIN/DIN validation, subsidiary ownership tree with beneficial ownership, AMFI 4-tier taxonomy |
| `decision-terminal.md` | Hard Governance Veto Gate, conviction→sizing mapping, audit trail with rationaleHash |
| `entry-rationale.md` | Reward/Risk 3:1 convention, Half-Kelly sizing, ADTV liquidity guardrail (10-day rule) |
| `exit-rationale.md` | Finance Act 2024 LTCG/STCG, XIRR vs Benchmark Alpha, post-mortem thesis evaluation |
| `latest-changes.md` | SEBI LODR Reg 30 materiality taxonomy, thesis breach banner |
| `thesis-snapshot.md` | Standard MoS (FairValue base), Probability-Weighted EV/IRR, Kill Criteria binding |
| `tracking-table.md` | Formula engine syntax, auto-sync from XBRL, cyclical vs structural KPI tags |

### 2.2 Management Tab (6 Specs) — P0

| Spec | Key Fixes |
|------|-----------|
| `capital-allocation.md` | ROIIC denominator flip fix (ΔInvestedCapital ≤ 0 handling), Ind AS 116 lease inclusion, FCF conversion dual standard |
| `concall-consistency.md` | Structured guidance extraction (quant ranges), numeric vs tonal divergence score, credibility impact score |
| `management-background.md` | MCA DIN validation, Sec 164 disqualification, Sec 165/17A caps, Section 197 11% profit cap |
| `red-flags.md` | CARO 2020 taxonomy, forensic severity weights, veto banner integration |
| `shareholding-pattern.md` | SAST Reg 31 NDUs, SBO beneficial ownership, MPS 25% rule, PIT ₹10L threshold |
| `track-record.md` | Capex-to-revenue efficiency, guidance delivery history timeline |

---

## 🎯 Phase 3: Company Page — Valuation & Financials (15 Specs)

### 3.1 Valuation Tab (8 Specs)

| Spec | Key Fixes |
|------|-----------|
| `dcf-valuation.md` | Mid-year discounting, WACC>g+50bps, Ind AS 116 lease debt bridge, FCFF bridge |
| `relative-valuation.md` | EV→Equity bridge, loss-maker exclusion, harmonic mean for P/E |
| `sotp-valuation.md` | valuation_level per segment, effective_stake_pct, holdco discount sensitivity |
| `banking-valuation.md` | ABVPS with Net NPA deduction, decimal ROE, residual income TV |
| `excess-return-valuation.md` | Per-share vs aggregate resolution, Comprehensive Income ROE, Ohlson persistence |
| `valuation-philosophy.md` | Reverse DCF implied growth, valuation anchor tracking |
| `margin-of-safety.md` | Standard MoS formula, probability-weighted EV/IRR |
| `comparable-multiples.md` | Cyclical EV/EBITDA normalizer (peak/trough) |

### 3.2 Financials Tab (4 Specs)

| Spec | Key Fixes |
|------|-----------|
| `financial-statements.md` | Division II vs III toggle, ROU asset, lease liability, OCI, cash reconciliation |
| `common-size-statement.md` | Zero-base fallback, negative equity handling, dual CF base toggles |
| `revenue-projection.md` | Volume×realization, utilization cap, segment bridge, eliminations |
| `segment-breakup.md` | Ind AS 108 eliminations, capital employed per segment |

### 3.3 Story Tab (4 Specs) — Enhancements

| Spec | Key Fixes |
|------|-----------|
| `business-model.md` | Unit economics, working capital drag breakdown |
| `economic-moat.md` | ROIC-WACC quantitative hurdle, pricing power proof |
| `current-growth-drivers.md` | Volume vs realization decomposition, PLI/export tags |
| `future-growth-drivers.md` | CWIP schedule, environmental clearance, probability weighting |

---

## 🎯 Phase 4: Company Page — Risk, SME, Downsides (21 Specs)

### 4.1 Risk Tab (9 Specs) — P0/P1

| Spec | Key Fixes |
|------|-----------|
| `business-risk.md` | Risk correlation matrix, customer concentration, operating leverage |
| `financial-risk.md` | Debt maturity schedule, Ind AS 116 lease liability, unhedged FX |
| `governance-risk.md` | SEBI Reg 23 RPT thresholds, CARO 2020 audit remarks |
| `industry-red-flags.md` | Cyclical peak indicators, pass-through lag, capacity overhang |
| `key-fragility.md` | Single-plant dependency, power/water supply risk |
| `legal-checks.md` | Tax dispute classification, CARO 143(3) mapping |
| `macro-risk.md` | RBI rate sensitivity (ΔPBT/Δ100bps), FX delta |
| `risk-score.md` | Non-linear penalty for governance vetoes, dynamic weight renormalization |
| `valuation-risk.md` | Historical cycle z-score, growth-adjusted PEG |

### 4.2 SME Tab (12 Specs) — P0/P1

| Spec | Key Fixes |
|------|-----------|
| `assess-auditor.md` | ICAI Peer Review, CARO 2020 resignation circular |
| `board-structure.md` | Sec 149/152 compliance, executive family nexus |
| `company-info.md` | SME IPO lot size, Market Maker 3yr obligation, anchor lock-in |
| `cost-breakup.md` | Raw material concentration, CIF vs domestic, power cost/unit |
| `customer-concentration.md` | Related-party customer cross-check, credit terms/overdue |
| `financial-health.md` | CFO/EBITDA divergence, tax paid vs P&L tax expense |
| `investment-checklist.md` | BSE SME/NSE Emerge migration criteria |
| `mgmt-compensation.md` | Section 197 11% cap, related-party perquisites |
| `on-ground-research.md` | Channel check verification score, supplier cross-ref |
| `other-forensics.md` | Section 186 loan check, CWIP aging, contingent/NW ratio |
| `promoter-forensics.md` | Ultimate beneficial ownership (SBO), cross-pledged guarantees |
| `wc-breakup.md` | MSMED 45-day rule (Sec 43B(h)), debtor aging, Drawing Power |

### 4.3 Downsides Tab (3 Specs) — P0/P1

| Spec | Key Fixes |
|------|-----------|
| `forensic-analysis.md` | Industry-appropriate models (not Altman for services), Ind AS 7 accruals adjustment |
| `hedging-mechanism.md` | NSE equity derivatives: beta hedge ratio, lot sizes, rollover cost |
| `key-events.md` | SEBI Reg 30 webhooks, automated event triggers, downside impact scoring |

---

## 🎯 Phase 5: Portfolio Management (16 Specs) — P1

### 5.1 Critical Tax/Regulatory Fixes (Finance Act 2024)

| Spec | Key Fixes |
|------|-----------|
| `capital-gains-import.md` | STCG 20% / LTCG 12.5% (₹1.25L exempt), bifurcation pre/post July 23 2024, Sec 55 FMV grandfathering, Section 48 STT non-deduction |
| `trade-history.md` | ₹1.25L annual LTCG exemption (not per-trade), intraday→Speculative Business Income, F&O→Non-Speculative Business Income |
| `statement-reconciliation.md` | NSDL/CDSL CAS three-way reconciliation (Broker↔Demat↔Bank) |
| `corporate-actions-handler.md` | SEBI fractional cash-in-lieu, Section 49 demerger cost allocation, Section 55 bonus NIL cost |

### 5.2 Analytics & Risk

| Spec | Key Fixes |
|------|-----------|
| `performance-metrics.md` | Nifty 50 TRI benchmark, sub-1yr absolute return, daily RFR |
| `risk-metrics.md` | VaR/CVaR with fat-tail, Nifty TRI beta |
| `construction-diversification.md` | Sector caps (SEBI MF 25%), factor exposure |
| `valuation-metrics.md` | Cyclical normalizers, loss-maker handling |
| `fundamentals-quality.md` | Negative equity NM, banking branch |
| `current-holdings.md` | ADTV liquidity, pledge %, SBO cross-check |
| `event-risk-monitor.md` | SEBI Reg 30 webhook, earnings calendar, bulk/block deals |
| `liquidity-risk.md` | 10% ADTV participation, days-to-liquidate |
| `portfolio-risk.md` | Factor model with Nifty TRI, stress test with 2008/2020/2022 |
| `valuation-risk.md` | Historical percentile z-scores, growth-adjusted |

---

## 🎯 Phase 6: Industry Page (11 Specs) — P1

| Spec | Key Fixes |
|------|-----------|
| `industry-aggregate.md` | Revenue-weighting bug fix (not P&L line item multiplication), insolvent equity handling |
| `demand.md` | Decouple drivers from supply, volume×price decomposition |
| `supply.md` | Effective capacity (derating for maintenance/regulatory), LARR clearance |
| `risk.md` | Non-linear severity, KE link to valuation |
| `regulations.md` | PLI/DGTR duty ingestion, earnings model integration |
| `demand-drivers.md` | Log-log OLS elasticity, zero-division guard |
| `cost-drivers.md` | Pass-through logic (not deflation inversion), Ind AS mapping |
| `cost-comparison.md` | Captive mining cash costs, realization spreads |
| `companies-table.md` | Harmonic mean P/E, standalone/consolidated toggle, loss-maker NM |
| `supply-chain-mapper.md` | SDRI (Supply Disruption Risk Index), temporal migration |

---

## 🎯 Phase 7: Document AI & Ingestion (5 Specs) — P1

| Spec | Key Fixes |
|------|-----------|
| `document-ai.md` | 8 doc types (Reg 30, Ltd Review, Credit Rating, Scheme, Secretarial), bilingual Hindi/English, scanned PDF OCR |
| `ai-assistant.md` | Citation bounding boxes [x1,y1,x2,y2], NLI verification, XBRL cross-reconciliation |
| `smart-summarizer.md` | Speaker diarization (Exec vs Analyst), evasion detection, guidance scorecard |
| `key-data-extractor.md` | Ind AS Schedule III table extraction, footnote parsing, PIT timestamps |
| `SPEC_INGESTION_PIPELINE.md` | Classification→Extraction→PIT→Chunk→Embed→Vector→RAG with citation coordinates |

---

## 🎯 Phase 8: Weigh Decisions (6 Specs) — P1

| Spec | Key Fixes |
|------|-----------|
| `weigh-decisions.md` | Hard forensic veto gate, Bayesian conviction updating, IC memo template |
| `conviction-sizing.md` | Kelly with fat-tail, SEBI concentration ceilings, NSE lot constraints |
| `decision-journal.md` | Bayes sequential updating, behavioral bias flags (disposition, anchoring) |
| `portfolio-fit-check.md` | Multi-pillar with forensic veto, conglomerate lookthrough |
| `reverse-dcf.md` | Working capital outpace guard, Monte Carlo implied growth |
| `scenario-analysis.md` | Positive-definite correlation (Cholesky+jitter), fat-tail Monte Carlo |

---

## 🎯 Phase 9: Macro, Watchlist, Generate Ideas, Tasks (8 Specs) — P2

| Spec | Key Fixes |
|------|-----------|
| `macro-dashboard.md` | Asymmetric LAF corridor (SDF/Repo/MSF), Net systemic liquidity, RBI rate sensitivity |
| `market-metrics.md` | FII/DII daily only (not 15-min), circuit states, breadth math |
| `watchlist.md` | Bulk/block deals, 52W proximity, delivery volume spikes, circuit limits |
| `generate-ideas.md` | Consolidated vs Standalone, TTM vs FY, banking metric exclusion |
| `idea-generation.md` | Peer normalization (NIM/GNPA for banks, RevPAR for hotels) |
| `tasks-time-tracker.md` | SEBI Reg 29/33 earnings calendar, BSE/NSE corporate announcement ingestion, SAST/PIT filing tracker |

---

## 🎯 Phase 10: Additional Tools — UI Primitives (4 Specs) — P2

| Spec | Key Fixes |
|------|-----------|
| `ui-primitives.md` | Financial charting (splits/bonuses/rights adjusted), Volume Profile (POC/VA), delivery % overlay |
| `filtered-table.md` | Excel financial model export, consolidated/standalone/TTM/FY scopes |
| `multi-text-box.md` | Structured schema with cell types (checkbox, select, date, number) |
| `simple-text-box.md` | Rich text with markdown, audit trail |

---

## 🧪 Cross-Cutting Testing Standards

### Unit Testing (Per Tool)
- **Golden Vector Tests**: 36+ per engine, 12+ edge cases
- **Property-Based Tests**: fast-check/quickcheck style (1000+ iterations)
- **Contract Tests**: API schema validation (Zod), TypeScript strict mode

### Integration Testing
- **API Contract Tests**: All endpoints with valid/invalid payloads
- **Data Pipeline Tests**: Classification→Extraction→PIT→RAG with real Indian filings
- **UI State Tests**: All lifecycle states (loading, empty, error, zero-revenue, loss-making, pre-IPO)

### Regression Testing
- **Golden Master**: Snapshot testing for all calculations
- **Regulatory Compliance**: SEBI/Ind AS/RBI test suites run on every PR
- **Performance Budgets**: <1.5ms sensitivity, <10ms DCF, <100ms RAG

### User Acceptance Testing
- **Institutional Workflow**: IC memo generation <5 min, conviction→sizing audit trail
- **Analyst Workflow**: Thesis→Entry→Tracking→Exit with immutable post-mortem
- **Compliance Workflow**: CAS reconciliation, SAST/SAST/Reg 30 automated feeds

---

## 📁 File Organization Standards

```
research-os/
├── specs/                          # Master Specifications (READ-ONLY after audit)
│   ├── _TEMPLATE.md
│   ├── SPEC_INDEX.md               # Updated with audit status
│   ├── TOOL_TRACKER.md             # Updated with implementation status
│   ├── company-page/
│   ├── engines/
│   ├── portfolio-management/
│   ├── industry-page/
│   ├── document-ai/
│   ├── weigh-decisions/
│   ├── macro-page/
│   ├── watchlist/
│   ├── generate-ideas/
│   ├── tasks-time/
│   ├── additional-tools/
│   └── shared/
│
├── apps/web/                       # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/                    # App Router (App Router)
│   │   │   ├── (dashboard)/
│   │   │   ├── company/[symbol]/
│   │   │   │   ├── layout.tsx      # Persistent layout with tabs
│   │   │   │   └── page.tsx        # Tab switcher via ?tab=
│   │   │   ├── portfolio/
│   │   │   │   ├── import/
│   │   │   │   └── reconcile/
│   │   │   ├── screening/
│   │   │   ├── macro/
│   │   │   └── industry/
│   │   ├── components/
│   │   │   ├── primitives/         # DynamicTable, MatrixGrid, CanvasFlow
│   │   │   └── widgets/            # 22 widgets (single source of truth)
│   │   ├── lib/
│   │   │   ├── stores/             # Zustand + Immer
│   │   │   ├── engines/            # Client-side engine facades
│   │   │   └── validators/         # Zod schemas
│   │   └── hooks/
│   ├── next.config.ts              # API rewrites (replaces 10 proxy files)
│   └── package.json
│
├── services/
│   ├── finance-engine/             # Python FastAPI (deterministic math)
│   │   ├── src/finance_engine/
│   │   │   ├── valuation/
│   │   │   ├── forensics/
│   │   │   └── portfolio/
│   │   ├── tests/
│   │   └── pyproject.toml
│   │
│   └── data-ingestion/             # Python FastAPI + Celery (Document AI)
│       ├── src/data_ingestion/
│       │   ├── scrapers/
│       │   ├── extractors/
│       │   └── rag/
│       ├── tests/
│       └── pyproject.toml
│
├── infra/
│   ├── postgres/                   # PostgreSQL 16 + pgvector migrations
│   └── docker-compose.yml          # Postgres, Qdrant, Ollama, Backend services
│
├── .github/workflows/              # CI/CD
└── package.json                    # Root workspace
```

---

## 📋 Documentation Standards (Per Tool)

Each implemented tool must include:

1. **README.md** — Purpose, architecture, API contracts, quick start
2. **API.md** — All endpoints with request/response schemas (Zod)
3. **TESTING.md** — Test coverage matrix, how to run, golden vectors
4. **MATH.md** — Mathematical formulas with LaTeX, edge cases, proofs
5. **COMPLIANCE.md** — SEBI/Ind AS/RBI mapping per calculation
6. **UI_STATES.md** — All lifecycle states with screenshots/descriptions
7. **MIGRATION.md** — Breaking changes, upgrade path

---

## ✅ Definition of Done (Per Tool)

- [ ] Spec updated per audit recommendations
- [ ] Backend engine implemented with 36+ golden vectors passing
- [ ] Frontend widget integrated in WidgetRegistry
- [ ] Company page tab integrated (persistent layout)
- [ ] All lifecycle states implemented (loading, empty, error, zero-revenue, loss-making, pre-IPO)
- [ ] API contracts validated (Zod schemas)
- [ ] Unit tests: >90% coverage, property-based tests passing
- [ ] Integration tests: API + UI workflows
- [ ] Regulatory compliance tests: SEBI/Ind AS/RBI passing
- [ ] Performance budgets met
- [ ] Documentation complete (7 docs per tool)
- [ ] Code review approved
- [ ] Deployed to staging, UAT passed

---

## 🚀 Next Immediate Action

**Start Phase 1.1: Update `specs/engines/ratio-analysis-engine.md`** — Foundation for all downstream engines.

This is the logical starting point because:
1. It's the mathematical foundation used by all valuation/forensic engines
2. Fixes critical negative equity/denominator guardrails
3. Adds mandatory banking/NBFC branch
4. No dependencies on other engines

---

*This plan is living — update TOOL_TRACKER.md and SPEC_INDEX.md as each phase completes.*