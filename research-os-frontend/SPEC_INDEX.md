# Research OS - Master Specification Index

## Complete Specification Library

This directory contains all detailed specifications for Research OS. Each SPEC.md is a standalone, implementation-ready document.

---

## 📁 Specification Files

| File | Domain | Status | Lines |
|------|--------|--------|-------|
| `SPEC_PRODUCT.md` | **Product Overview** - Complete workflow, architecture, roadmap | ✅ Complete | 500+ |
| `SPEC_WIDGET_TAB_FRAMEWORK.md` | **UI Framework** - Customizable widget/tab system | ✅ Complete | 250+ |
| `SPEC_INGESTION_PIPELINE.md` | **Document AI** - Classification, extraction, PIT, embeddings, RAG | ✅ Complete | 600+ |
| `SPEC_MATH_ENGINE.md` | **Financial Math** - 5 valuation models, forensics, portfolio, screening | ✅ Complete | 800+ |
| `SPEC_GRWTH_PIPELINE.md` | **Capex Tracker** - Milestone tracking, revenue accretion, IRR | ✅ Complete | 350+ |
| `SPEC_TASKS_TIME_TRACKER.md` | **Research Ops** - Task management, time tracking, analytics | ✅ Complete | 450+ |

---

## 🎯 Quick Reference: Module → Spec Mapping

| Module | Primary Spec | Supporting Specs |
|--------|--------------|------------------|
| **Screening** | `SPEC_PRODUCT.md` §1 | `SPEC_MATH_ENGINE.md` (screening engine) |
| **Company Deep Dive** | `SPEC_PRODUCT.md` §2 | `SPEC_WIDGET_TAB_FRAMEWORK.md` (CompanyTabs), `SPEC_MATH_ENGINE.md` (valuation) |
| **Weigh Decisions** | `SPEC_PRODUCT.md` §3 | `SPEC_MATH_ENGINE.md` (position sizing, behavioral audit) |
| **Portfolio Management** | `SPEC_PRODUCT.md` §4 | `SPEC_MATH_ENGINE.md` (portfolio analytics) |
| **Documents** | `SPEC_PRODUCT.md` §5 | `SPEC_INGESTION_PIPELINE.md` (full pipeline) |
| **Macro Dashboard** | `SPEC_PRODUCT.md` §6 | `SPEC_MATH_ENGINE.md` (macro indicators) |
| **Industry Analysis** | `SPEC_PRODUCT.md` §7 | `SPEC_WIDGET_TAB_FRAMEWORK.md` (dashboard), `SPEC_GRWTH_PIPELINE.md` (capex) |
| **GRWTH Pipeline** | `SPEC_GRWTH_PIPELINE.md` | `SPEC_PRODUCT.md` §8 |
| **Tasks & Time** | `SPEC_TASKS_TIME_TRACKER.md` | `SPEC_PRODUCT.md` §9 |
| **Valuation Suite** | `SPEC_MATH_ENGINE.md` | `SPEC_PRODUCT.md` §2.6 |

---

## 🔗 Cross-Module Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌────────────┐
│  SCREENING  │────▶│  DEEP DIVE   │────▶│    WEIGH    │────▶│  PORTFOLIO │
│  (Generate) │     │  (10 Tabs)   │     │ (Conviction)│     │  (Track)   │
└──────┬──────┘     └──────┬───────┘     └──────┬──────┘     └─────┬──────┘
       │                   │                    │                   │
       ▼                   ▼                    ▼                   ▼
  Factors &           5 Models +           Conviction +         TWR/XIRR,
  Ranking             Forensics            Position Sizing      Attribution
       │                   │                    │                   │
       └───────────────────┼────────────────────┼───────────────────┘
                           ▼                    ▼
                    ┌──────────────┐     ┌──────────────┐
                    │  DOCUMENTS   │     │    GRWTH     │
                    │  (RAG + AI)  │     │  (Capex →    │
                    │              │     │   Revenue)   │
                    └──────────────┘     └──────────────┘
```

---

## 📊 Data Contracts (Shared Types)

All modules use shared TypeScript definitions in `src/lib/types.ts`:

```typescript
// Core entities
CompanySnapshot       // Screening, Deep Dive, Portfolio
FinancialStatement    // Valuation, Forensics, Portfolio
ValuationInputs       // All 5 models + SOTP
DocumentMetadata      // Ingestion, RAG, Deep Dive
CapexProject          // GRWTH, SOTP, Portfolio
ResearchTask          // Tasks, Time tracking, Analytics
```

---

## 🏗️ Implementation Status

### ✅ Completed (Phase 1)
- [x] Next.js 15 frontend with 15 routes
- [x] Math engine with 36 golden vector tests
- [x] Widget/Tab framework (Zustand + react-grid-layout)
- [x] Company Deep Dive (10 tabs, customizable)
- [x] Industry Dashboard (custom widgets)
- [x] GRWTH Pipeline (Kanban/Gantt/Table)
- [x] Tasks & Time Tracker (Kanban/List/Analytics)
- [x] All SPEC.md documents

### 🚧 In Progress (Phase 2)
- [ ] PostgreSQL + pgvector deployment
- [ ] Document ingestion pipeline (Screener.in, BSE/NSE)
- [ ] RAG query interface with citations
- [ ] Real-time price feeds

### 📅 Planned (Phase 3-4)
- [ ] User authentication & multi-user workspaces
- [ ] AI-assisted research (thesis generation)
- [ ] Mobile PWA
- [ ] Workspace templates marketplace

---

## 🧪 Testing Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Math Engine | pytest + golden vectors | 100% (36 vectors) |
| Frontend | Vitest + React Testing Library | 80% components |
| Integration | Playwright | Critical paths |
| Ingestion | pytest + golden PDFs | 90% extraction accuracy |

---

## 📦 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKER COMPOSE                           │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  Frontend   │    API      │ Ingestion   │    Postgres +       │
│  (Next.js)  │  (FastAPI)  │  (Python)   │    pgvector         │
│  :3000      │   :8000     │  (Workers)  │    :5432            │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │     Redis       │
                     │  (Queue/Cache)  │
                     └─────────────────┘
```

---

## 📚 Quick Start for Developers

### 1. Understand the Product
```bash
cat SPEC_PRODUCT.md
```

### 2. Build a New Widget
```bash
# 1. Add to DEFAULT_WIDGET_TYPES in workspace-store.ts
# 2. Create component in components/widgets/MyWidget.tsx
# 3. Add render case in DashboardCanvas.tsx WidgetContent
```

### 3. Add a Valuation Model
```bash
# 1. Create model in math-engine/src/math_engine/valuation/
# 2. Add golden vector test in tests/golden_vectors/
# 3. Add API route in research-os-frontend/src/app/api/math-engine/
# 4. Add UI in valuation/page.tsx
```

### 4. Extend Ingestion Pipeline
```bash
# 1. Add source adapter in data-ingestion/src/data_ingestion/sources/
# 2. Add classifier rules in classifiers/rule_based.py
# 3. Add extractor in extractors/ (if new doc type)
# 4. Update PIT storage schema if needed
```

---

## 📝 Specification Maintenance

### When to Update SPECs
- **Before** implementing new feature → update relevant SPEC
- **After** architectural change → update SPEC_PRODUCT.md + affected SPECs
- **During** code review → verify implementation matches SPEC
- **Quarterly** → review all SPECs for accuracy

### SPEC Format Rules
1. **Self-contained**: Each SPEC readable independently
2. **Implementation-ready**: Code snippets copy-pastable
3. **Versioned**: Include `__version__` in code, date in SPEC
4. **Testable**: Include golden vectors / test cases
4. **Cross-referenced**: Link to related SPECs

---

## 🔗 Related Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview, quick start |
| `AGENTS.md` | Agent instructions for AI-assisted development |
| `CLAUDE.md` | Claude-specific guidance |
| `docker-compose.yml` | Local development stack |
| `math-engine/pyproject.toml` | Python dependencies |
| `research-os-frontend/package.json` | Node dependencies |

---

## 🎯 Next Steps

1. **Review all SPECs** for completeness
2. **Prioritize Phase 2** (Postgres, ingestion, RAG)
3. **Assign ownership** for each module
4. **Set up CI/CD** with spec validation
5. **Schedule weekly spec reviews**

---

*Generated as part of Research OS specification-driven development. Each SPEC.md is a contract between product, engineering, and QA.*