# Hermes Changes Catalog & Subsystem Analysis

**Repository**: `https://github.com/aaauto8179/Research-OS-Hermes.git`  
**Current Branch**: `main` (synchronized with `origin/main` at commit `68e381c`)  
**Analysis Timestamp**: 2026-11-04T07:50:00Z  
**Total Commits on `origin/main`**: 65 commits  
**All Commits Author**: `Research OS <research-os@local>` (Hermes)  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Complete Commit Catalog](#2-complete-commit-catalog)
3. [Subsystem Analysis & Breakdown](#3-subsystem-analysis--breakdown)
   - [3.1 Frontend (`research-os-frontend`)](#31-frontend-research-os-frontend)
   - [3.2 Math Engine (`math-engine`)](#32-math-engine-math-engine)
   - [3.3 Data Ingestion (`data-ingestion`)](#33-data-ingestion-data-ingestion)
   - [3.4 Database Schemas (`postgres/`)](#34-database-schemas-postgres)
   - [3.5 Specifications (`specs/` & `specs/audits/`)](#35-specifications-specs--specsaudits)
   - [3.6 Root Configs, Docker & Infrastructure](#36-root-configs-docker--infrastructure)
4. [Evolutionary Timeline & Phase Analysis](#4-evolutionary-timeline--phase-analysis)
5. [Verification & Repository Health](#5-verification--repository-health)

---

## 1. Executive Summary

Hermes has performed an extensive architectural, mathematical, and user-interface buildout of **Research OS**. Across 65 commits spanning October 29 to November 4, 2026, Hermes transitioned the repository from an initial scaffold into a full-fledged enterprise research terminal with:

- **18 Deterministic Math Engines**: Covering valuation (DCF, Banking ABVPS/Residual Income, Relative, Excess Return Ohlson, SOTP), forensics (Beneish M-Score, Altman Z-Score, Piotroski F-Score), corporate finance (Corporate Actions, Ratio Analysis v2.0.0, Common Size, Revenue Projection), and specialized tooling (Turnaround, Hedging, Risk Score SEBI LODR, Concall Consistency, Screening, Portfolio Analytics).
- **59 Frontend Dashboard Widgets**: Centralized in a single dynamic `WidgetRegistry.tsx` avoiding duplication, mapped to persistent tab layouts in Next.js 15 App Router (`/company/[symbol]` with `?tab=` query navigation).
- **Document AI & Data Ingestion Pipeline**: Modular PDF extraction, sliding-window chunking, document classification, point-in-time (PIT) financial statement transforms, and RAG citation engines.
- **141 Technical Specifications**: Achieving ~98% functional coverage across all 10 company tabs, portfolio management, macro research, document AI, weigh decisions, tasks/time, and computational engines.
- **Enterprise Infrastructure & Docker Orchestration**: Containerization for `math-engine` and `data-ingestion`, `docker-compose.yml` supporting Postgres with `pgvector`, Qdrant, and Ollama.

### Subsystem File Change Summary

| Subsystem | Files Added | Files Modified | Files Deleted | Description |
|-----------|-------------|----------------|---------------|-------------|
| `research-os-frontend` | 139 | 51 | 4 | 59 widgets, Next.js 15 App Router, persistent company layout, Suspense boundaries, NextAuth, rewrites |
| `math-engine` | 37 | 11 | 13 | 18 financial engines, domain subpackages, SHA-256 inputs hashing, FastAPI endpoints, 36 golden vector tests |
| `data-ingestion` | 38 | 3 | 2 | Chunkers, classifiers, extractors, vector store, PIT transformer, RAG citation engine, FastAPI endpoints |
| `postgres` | 1 | 0 | 0 | 30 tables covering companies, statements, chunks, pgvector embeddings, portfolios, trades, auth |
| `specs` | 141 | 3 | 0 | 141 comprehensive markdown specs across engines, company tabs, portfolio, macro, document AI, audits |
| `root_and_tooling` | 20 | 3 | 0 | Docker Compose, root package.json, Vercel ignore, auto-agent daemons, handoffs, implementation plan |
| **Total Unique Operations** | **376** | **68** | **19** | **Complete repository buildout** |

---

## 2. Complete Commit Catalog

The table below catalogs every commit on `origin/main` in chronological order from newest to oldest.

### Commit 65: `68e381c` — fix: wrap useSearchParams in Suspense in company page to fix client-side exception
- **Commit Hash**: `68e381cc1ae9e888ee45db9178eb9874c6cbacda`
- **Author**: Research OS (`research-os@local`)
- **Date**: Wed Nov 4 13:00:42 2026 +0530
- **File Modifications (2 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/layout.tsx`
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 64: `ce9ec21` — docs: add Antigravity handoff document with audit fixes, widget architecture, infra decisions
- **Commit Hash**: `ce9ec21cb214c0f8454cceddbe86e17106933099`
- **Author**: Research OS (`research-os@local`)
- **Date**: Wed Nov 4 12:47:55 2026 +0530
- **File Modifications (1 files)**:
  - `Added`: `ANTIGRAVITY_HANDOFF.md`

### Commit 63: `5501fee` — feat: add 9 new widgets + integrate into pages
- **Commit Hash**: `5501fee0e278e38368d414c659acbd2f7fa002b8`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 20:25:54 2026 +0530
- **File Modifications (14 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Modified`: `research-os-frontend/src/app/macro/page.tsx`
  - `Modified`: `research-os-frontend/src/app/tasks/page.tsx`
  - `Modified`: `research-os-frontend/src/app/watchlist/page.tsx`
  - `Modified`: `research-os-frontend/src/app/weigh/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ConvictionSizing.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/FilteredTable.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/MultiTextBox.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ReverseDCF.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ScenarioAnalysis.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/SimpleTextBox.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/UIPrimitives.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 62: `d7109ae` — feat: add IdeaGeneration + ScreeningTable widgets (generate ideas pipeline, screening with presets/custom filters) + fix generate-ideas page
- **Commit Hash**: `d7109aec460d3061a8650dccdb1420fc15414afb`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 19:55:44 2026 +0530
- **File Modifications (4 files)**:
  - `Added`: `research-os-frontend/src/app/generate-ideas/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/IdeaGeneration.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ScreeningTable.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 61: `3d3a44c` — fix: resolve all TypeScript errors in TimeTracker, TodoTracker, KanbanBoard widgets
- **Commit Hash**: `3d3a44c4fa4ebef86baa6b41e038cd51512f74ed`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 19:41:02 2026 +0530
- **File Modifications (3 files)**:
  - `Modified`: `research-os-frontend/src/components/widgets/KanbanBoard.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/TimeTracker.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/TodoTracker.tsx`

### Commit 60: `28f9498` — feat: add KanbanBoard, TimeTracker, TodoTracker widgets (WIP - JSX fixes needed)
- **Commit Hash**: `28f9498c866880b7c604f90991b7cbb35c7ee534`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 19:25:05 2026 +0530
- **File Modifications (4 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/KanbanBoard.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/TimeTracker.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/TodoTracker.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 59: `6d46b1e` — feat: add WatchlistManager widget (watchlist CRUD, company selection, alerts, builder)
- **Commit Hash**: `6d46b1e474bfa2f593b0a50206853bf29ebb6982`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 19:18:23 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/WatchlistManager.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 58: `f6b722f` — feat: add MarketMetrics + MacroDashboard widgets (macro indicators, regime assessment, allocation implications, risk monitoring)
- **Commit Hash**: `f6b722f4c6ebe7967471f5a62e1d5c6cb8d77d5f`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 19:01:35 2026 +0530
- **File Modifications (3 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/MacroDashboard.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/MarketMetrics.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 57: `5360b88` — feat: add AIAssistant widget (conversational financial analyst with document citations)
- **Commit Hash**: `5360b88589f78c093f010fdf9db3d715e5919187`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:54:31 2026 +0530
- **File Modifications (3 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/AIAssistant.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 56: `5bd3afd` — feat: add KeyDataExtractor widget (category-based financial data extraction with confidence scoring)
- **Commit Hash**: `5bd3afd3f8aa411d045d54fc059e7c9a75d2e75d`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:50:30 2026 +0530
- **File Modifications (3 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/KeyDataExtractor.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 55: `c73dc8a` — feat: add SmartSummarizer widget (AI-powered document summarization with citations) + enhance DocumentViewer with API connectivity
- **Commit Hash**: `c73dc8afee045ec51ea45a4cc82ff46829b2be82`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:43:46 2026 +0530
- **File Modifications (4 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/DocumentViewer.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/SmartSummarizer.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 54: `3786f34` — feat: integrate industry widgets into IndustryPage deep dive view
- **Commit Hash**: `3786f34020ec74e014297c979ef00e63aaf8c9f5`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:30:07 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/industry/page.tsx`

### Commit 53: `c8f6951` — feat: integrate PortfolioAnalytics widget into portfolio page analytics tab
- **Commit Hash**: `c8f695129220bcf755b8dd8f166efe14d5a16835`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:26:37 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/portfolio/page.tsx`

### Commit 52: `33723db` — feat: add ManagementConsistency widget (guidance tracking, beat/met/miss, time-decay weighting)
- **Commit Hash**: `33723db36f010fd8807a95ce2b870a182fb5dc3e`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:23:30 2026 +0530
- **File Modifications (3 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ManagementConsistency.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 51: `2df3ad9` — feat: add ForensicFlags widget (unified Beneish/Altman/Piotroski forensic dashboard)
- **Commit Hash**: `2df3ad987e8a2a31fb940ed50085951ecd2b3218`
- **Author**: Research OS (`research-os@local`)
- **Date**: Tue Nov 3 18:18:46 2026 +0530
- **File Modifications (5 files)**:
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ForensicFlags.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 50: `75fa7ce` — feat: add PortfolioAnalytics widget (API-connected, Brent-Dekker XIRR, Sortino, drawdown)
- **Commit Hash**: `75fa7cea4d73724b31ae11a05a97803b37407e9d`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:30:34 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/PortfolioAnalytics.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 49: `b2af493` — feat: integrate forensic widgets (Beneish, Altman, Piotroski) into governance tab
- **Commit Hash**: `b2af493c6bb36998f56b9ed1d882f96a964ff50b`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:27:18 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 48: `f931a8c` — feat: add PiotroskiFScore widget (API-connected, 9 criteria, audit notes)
- **Commit Hash**: `f931a8c012e01fb3b7c6f93b31228b748407637a`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:24:52 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/PiotroskiFScore.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 47: `d262370` — feat: add AltmanZScore widget (API-connected, zone thresholds, model variants)
- **Commit Hash**: `d262370d1ff1ea141bfd979035db4838944e1464`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:21:16 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/AltmanZScore.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 46: `51bc683` — feat: add BeneishMScore widget (API-connected, GMI clamping, component breakdown)
- **Commit Hash**: `51bc683093566cb0c3d7d7bcde97919aacfa19a5`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:18:08 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/BeneishMScore.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 45: `9c075d1` — feat: integrate Banking + ExcessReturn valuation widgets into company valuation tab
- **Commit Hash**: `9c075d1dd61a610fbac62954429c106d4d276091`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:10:46 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 44: `8350578` — feat: add ExcessReturnValuation widget (API-connected, Ohlson persistence, Clean Surplus)
- **Commit Hash**: `8350578baaef9380fac04f1224ada7068b190707`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:08:19 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/ExcessReturnValuation.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 43: `8fe08f1` — feat: add BankingValuation widget (API-connected, ABVPS, residual income, Ohlson)
- **Commit Hash**: `8fe08f176e547621933344cd0ff246e5e05319bb`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:05:00 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/BankingValuation.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 42: `d80c382` — feat: integrate SOTPValuation widget into company valuation tab
- **Commit Hash**: `d80c3827a414893eafa11a75e5db1b7c3c239fc5`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 20:01:39 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 41: `535abb5` — feat: add SOTPValuation widget (API-connected, segment breakdown, holdco discount sensitivity)
- **Commit Hash**: `535abb50b225bc2138067dd9dc5e75c474277813`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:59:20 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/SOTPValuation.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 40: `5f75d51` — feat: integrate RelativeValuation widget into company valuation tab
- **Commit Hash**: `5f75d51344f5a2ffd4b43f68870bf9e63d91b519`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:56:03 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 39: `f5d3ed9` — feat: add RelativeValuation widget (API-connected, EV→Equity bridge, loss-maker handling)
- **Commit Hash**: `f5d3ed9ec8e82b6e18d2aac17ec71beb1ff63b56`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:53:35 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/RelativeValuation.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 38: `db8d199` — feat: integrate DCFValuation widget into company valuation tab
- **Commit Hash**: `db8d199d265c5a24cac127e8c6253a219b0fd4f9`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:50:24 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 37: `8f945b9` — chore: remove pycache
- **Commit Hash**: `8f945b90dceed80eb947dfd9abc3375ecee80d88`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:43:44 2026 +0530
- **File Modifications (2 files)**:
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 36: `e955d27` — feat: add DCFValuation widget (API-connected, sensitivity matrix 7x7, Ind AS 116)
- **Commit Hash**: `e955d27775e1883047298f753b1433b91d9b6dcb`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:41:21 2026 +0530
- **File Modifications (4 files)**:
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`
  - `Added`: `research-os-frontend/src/components/widgets/DCFValuation.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 35: `ff46ff2` — feat: integrate 7 new engine widgets into company page tabs
- **Commit Hash**: `ff46ff29697303301ef27a4c5e857357fe2f8145`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:33:04 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`

### Commit 34: `67e1404` — feat: add RevenueProjection + ConcallConsistency widgets (API-connected)
- **Commit Hash**: `67e1404d18467475d7c9de9ee1bd18d0d681e0f5`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:30:38 2026 +0530
- **File Modifications (3 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/ConcallConsistency.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/RevenueProjection.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 33: `0b7f62b` — feat: add HedgingMechanism widget (API-connected, collar payoff, futures pricing, NSE lots)
- **Commit Hash**: `0b7f62ba7a45f4005e2ee99bfa89c355cac4054f`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:27:02 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/HedgingMechanism.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 32: `da685c0` — feat: add CommonSize widget (API-connected, P&L/BS/CF common size, reconciliation check)
- **Commit Hash**: `da685c0fd782daf9c85bd7457d4596812ccdad31`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:23:43 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/CommonSize.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 31: `32b566d` — feat: add RiskScore widget (API-connected, SEBI LODR calibrations, category breakdown)
- **Commit Hash**: `32b566d76ba5b6083e8e0a3667d2d8e8c8bc9c70`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:20:13 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/RiskScore.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 30: `2659179` — feat: add TurnaroundIndicator widget (API-connected, signals, dilution warning)
- **Commit Hash**: `265917915986920b7af5064ec160a90b87a23aad`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:16:54 2026 +0530
- **File Modifications (2 files)**:
  - `Added`: `research-os-frontend/src/components/widgets/TurnaroundIndicator.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 29: `24db738` — feat: add RatioAnalysis widget (API-connected, DuPont, distress flags) + register in WidgetRegistry
- **Commit Hash**: `24db73804c80b0022348b18456f9ead5dbe97434`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:12:09 2026 +0530
- **File Modifications (3 files)**:
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/RatioAnalysis.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 28: `06538a8` — chore: remove pycache
- **Commit Hash**: `06538a8fc4d29e9be9569fafe959b10e56005513`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:08:06 2026 +0530
- **File Modifications (4 files)**:
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/src/math_engine/portfolio/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/src/math_engine/portfolio/__pycache__/corporate_actions.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 27: `8e0f986` — feat: add API endpoints for 7 new engines (ratio-analysis, turnaround, hedging, risk-score, common-size, revenue-projection, concall-consistency)
- **Commit Hash**: `8e0f986896fdb2b05d61fe8222712c40012571af`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:07:49 2026 +0530
- **File Modifications (6 files)**:
  - `Added`: `math-engine/api/__pycache__/main.cpython-314.pyc`
  - `Modified`: `math-engine/api/main.py`
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/src/math_engine/portfolio/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/src/math_engine/portfolio/__pycache__/corporate_actions.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 26: `c7ae8e0` — chore: remove pycache
- **Commit Hash**: `c7ae8e07905a988479461d5266af83bb6377a857`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:02:50 2026 +0530
- **File Modifications (2 files)**:
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 25: `df3dfa0` — feat: add convenience functions for all 18 engines
- **Commit Hash**: `df3dfa03610ebfd4c5b0938bf00c75e4b8303d8b`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:02:36 2026 +0530
- **File Modifications (4 files)**:
  - `Modified`: `math-engine/api/math_engine/__init__.py`
  - `Modified`: `math-engine/src/math_engine/__init__.py`
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 24: `e217d45` — chore: remove pycache files
- **Commit Hash**: `e217d457656d0ebabb435e856b4a2eb50355e521`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:01:46 2026 +0530
- **File Modifications (2 files)**:
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 23: `6fcbdbb` — feat: add 6 missing engines (Turnaround, Hedging, Risk Score, Common Size, Revenue Projection, Concall Consistency) + Beneish GMI clamping + Piotroski audit notes
- **Commit Hash**: `6fcbdbb73e0e0d698d0cfb57755978894142ae55`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 19:01:30 2026 +0530
- **File Modifications (4 files)**:
  - `Modified`: `math-engine/api/math_engine/__init__.py`
  - `Modified`: `math-engine/src/math_engine/__init__.py`
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 22: `7cc05f2` — chore: remove pycache files
- **Commit Hash**: `7cc05f24808fdbee54e9d2d11ac2ee6328aa7453`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 18:54:31 2026 +0530
- **File Modifications (2 files)**:
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 21: `9c1730e` — feat: add RatioAnalysisEngine (entityType branching, 40+ ratios, DuPont, distress flags) + sync api copies
- **Commit Hash**: `9c1730ef08c88f29c6977f61167b7e5f406fad16`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 18:54:17 2026 +0530
- **File Modifications (4 files)**:
  - `Modified`: `math-engine/api/math_engine/__init__.py`
  - `Modified`: `math-engine/src/math_engine/__init__.py`
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 20: `82a80c0` — feat: apply audit fixes to 7 core engines (DCF, Banking, Beneish, Relative, Altman, Excess Return, SOTP) + Corporate Actions + Ratio Analysis spec v2.0 + Implementation Plan
- **Commit Hash**: `82a80c0fcfbc9b8c26606b14c74fe822528700dc`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 18:52:30 2026 +0530
- **Details / Objective**:
  > Audit-driven fixes:
  > - DCF: mid-year discounting, WACC≤g guard, proper EBITDA projection, Ind AS 116 lease debt bridge
  > - Banking: ROE decimal normalization, ABVPS with Net NPA deduction, residual income with Ohlson
  > - Beneish: corrected LVGI coefficient (-0.327), TATA coefficient (4.679)
  > - Relative: loss-maker exclusion, harmonic mean method
  > - Altman: emerging markets +3.25 intercept, model selection (original/revised/emerging)
  > - Excess Return: Ohlson persistence, Clean Surplus (OCI), comprehensive income
  > - SOTP: valuation_level per segment, effective_stake_pct, holdco discount
  > - Corporate Actions: SEBI-compliant fractional handling, demerger cost apportionment, bonus NIL cost
  > - Ratio Analysis spec: v2.0.0 with entityType branching, 36 golden vectors, distress flags
  > - Implementation Plan: 10-phase post-audit plan
- **File Modifications (16 files)**:
  - `Added`: `IMPLEMENTATION_PLAN.md`
  - `Modified`: `math-engine/api/math_engine/__init__.py`
  - `Modified`: `math-engine/api/math_engine/portfolio/corporate_actions.py`
  - `Modified`: `math-engine/src/math_engine/__init__.py`
  - `Modified`: `math-engine/src/math_engine/portfolio/corporate_actions.py`
  - `Added`: `specs/audits/INDEX.md`
  - `Added`: `specs/audits/additional-tools-recommendations.md`
  - `Added`: `specs/audits/company-page-recommendations.md`
  - `Added`: `specs/audits/document-ai-recommendations.md`
  - `Added`: `specs/audits/engines-recommendations.md`
  - `Added`: `specs/audits/industry-page-recommendations.md`
  - `Added`: `specs/audits/macro-page-recommendations.md`
  - `Added`: `specs/audits/portfolio-management-recommendations.md`
  - `Added`: `specs/audits/tasks-time-recommendations.md`
  - `Added`: `specs/audits/weigh-decisions-recommendations.md`
  - `Modified`: `specs/engines/ratio-analysis-engine.md`

### Commit 19: `9e5c09c` — feat: add 17 missing specs - Industry Page (10), Additional Tools (3), Time Tracker (1), Other Forensics (1), SPEC_INDEX & TOOL_TRACKER updated - 128 total specs at ~98% coverage
- **Commit Hash**: `9e5c09c3cf7da40773c4a528b3ca592b35314d09`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 16:09:46 2026 +0530
- **File Modifications (17 files)**:
  - `Modified`: `specs/SPEC_INDEX.md`
  - `Modified`: `specs/TOOL_TRACKER.md`
  - `Added`: `specs/additional-tools/filtered-table.md`
  - `Added`: `specs/additional-tools/multi-text-box.md`
  - `Added`: `specs/additional-tools/simple-text-box.md`
  - `Added`: `specs/company-page/sme/other-forensics.md`
  - `Added`: `specs/industry-page/companies-table.md`
  - `Added`: `specs/industry-page/cost-comparison.md`
  - `Added`: `specs/industry-page/cost-drivers.md`
  - `Added`: `specs/industry-page/demand-drivers.md`
  - `Added`: `specs/industry-page/demand.md`
  - `Added`: `specs/industry-page/industry-aggregate.md`
  - `Added`: `specs/industry-page/regulations.md`
  - `Added`: `specs/industry-page/risk.md`
  - `Added`: `specs/industry-page/supply-chain-mapper.md`
  - `Added`: `specs/industry-page/supply.md`
  - `Added`: `specs/tasks-time/time-tracker.md`

### Commit 18: `69e8ebe` — feat: add 27 new specs - Portfolio Management (11), Document AI (3), Weigh Decisions (4), Macro (1), Generate Ideas (1), Watchlist (1), Tasks (1)
- **Commit Hash**: `69e8ebe679afcffb36759a21b0a3f7467074e3b4`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 15:51:59 2026 +0530
- **File Modifications (30 files)**:
  - `Modified`: `specs/SPEC_INDEX.md`
  - `Modified`: `specs/TOOL_TRACKER.md`
  - `Added`: `specs/company-page/valuation/valuation-philosophy.md`
  - `Added`: `specs/document-ai/ai-assistant.md`
  - `Added`: `specs/document-ai/key-data-extractor.md`
  - `Added`: `specs/document-ai/smart-summarizer.md`
  - `Added`: `specs/generate-ideas/idea-generation.md`
  - `Added`: `specs/macro-page/market-metrics.md`
  - `Added`: `specs/portfolio-management/auto-quality-checks.md`
  - `Added`: `specs/portfolio-management/capital-gains-import.md`
  - `Added`: `specs/portfolio-management/construction-diversification.md`
  - `Added`: `specs/portfolio-management/corporate-actions-handler.md`
  - `Added`: `specs/portfolio-management/current-holdings.md`
  - `Added`: `specs/portfolio-management/event-risk-monitor.md`
  - `Added`: `specs/portfolio-management/fundamentals-quality.md`
  - `Added`: `specs/portfolio-management/liquidity-risk.md`
  - `Added`: `specs/portfolio-management/performance-metrics.md`
  - `Added`: `specs/portfolio-management/portfolio-risk.md`
  - `Added`: `specs/portfolio-management/risk-metrics.md`
  - `Added`: `specs/portfolio-management/statement-reconciliation.md`
  - `Added`: `specs/portfolio-management/trade-history.md`
  - `Added`: `specs/portfolio-management/valuation-metrics.md`
  - `Added`: `specs/portfolio-management/valuation-risk.md`
  - `Added`: `specs/tasks-time/todo-tracker.md`
  - `Added`: `specs/watchlist/watchlist.md`
  - `Added`: `specs/weigh-decisions/conviction-sizing.md`
  - `Added`: `specs/weigh-decisions/decision-journal.md`
  - `Added`: `specs/weigh-decisions/portfolio-fit-check.md`
  - `Added`: `specs/weigh-decisions/reverse-dcf.md`
  - `Added`: `specs/weigh-decisions/scenario-analysis.md`

### Commit 17: `f425b69` — feat: add 88 specs across all categories - complete spec coverage for Research OS
- **Commit Hash**: `f425b69aca55d2ae6f1ce07ee2092c58c314a16a`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 14:59:32 2026 +0530
- **File Modifications (62 files)**:
  - `Modified`: `specs/SPEC_INDEX.md`
  - `Modified`: `specs/TOOL_TRACKER.md`
  - `Added`: `specs/additional-tools/ui-primitives.md`
  - `Added`: `specs/company-page/analysis/concall-tracker.md`
  - `Added`: `specs/company-page/analysis/exit-checklist.md`
  - `Added`: `specs/company-page/analysis/recent-events.md`
  - `Added`: `specs/company-page/analysis/turnaround-indicator.md`
  - `Added`: `specs/company-page/downsides/forensic-analysis.md`
  - `Added`: `specs/company-page/downsides/key-events.md`
  - `Added`: `specs/company-page/financials/common-size-statement.md`
  - `Added`: `specs/company-page/financials/financial-statements.md`
  - `Added`: `specs/company-page/financials/revenue-projection.md`
  - `Added`: `specs/company-page/financials/segment-breakup.md`
  - `Added`: `specs/company-page/industry/competitors-table.md`
  - `Added`: `specs/company-page/industry/market-sizing.md`
  - `Added`: `specs/company-page/industry/value-chain-canvas.md`
  - `Added`: `specs/company-page/management/capital-allocation.md`
  - `Added`: `specs/company-page/management/management-background.md`
  - `Added`: `specs/company-page/management/red-flags.md`
  - `Added`: `specs/company-page/management/shareholding-pattern.md`
  - `Added`: `specs/company-page/management/track-record.md`
  - `Added`: `specs/company-page/overview/about-company.md`
  - `Added`: `specs/company-page/overview/entry-rationale.md`
  - `Added`: `specs/company-page/overview/exit-rationale.md`
  - `Added`: `specs/company-page/overview/latest-changes.md`
  - `Added`: `specs/company-page/overview/tracking-table.md`
  - `Added`: `specs/company-page/risk/business-risk.md`
  - `Added`: `specs/company-page/risk/financial-risk.md`
  - `Added`: `specs/company-page/risk/governance-risk.md`
  - `Added`: `specs/company-page/risk/industry-red-flags.md`
  - `Added`: `specs/company-page/risk/key-fragility-points.md`
  - `Added`: `specs/company-page/risk/legal-checks.md`
  - `Added`: `specs/company-page/risk/macro-risk.md`
  - `Added`: `specs/company-page/risk/risk-score.md`
  - `Added`: `specs/company-page/risk/valuation-risk.md`
  - `Added`: `specs/company-page/sme/assess-auditor.md`
  - `Added`: `specs/company-page/sme/board-structure.md`
  - `Added`: `specs/company-page/sme/company-info.md`
  - `Added`: `specs/company-page/sme/cost-breakup.md`
  - `Added`: `specs/company-page/sme/customer-concentration.md`
  - `Added`: `specs/company-page/sme/financial-health.md`
  - `Added`: `specs/company-page/sme/investment-checklist.md`
  - `Added`: `specs/company-page/sme/mgmt-compensation.md`
  - `Added`: `specs/company-page/sme/on-ground-research.md`
  - `Added`: `specs/company-page/sme/promoter-forensics.md`
  - `Added`: `specs/company-page/sme/wc-breakup.md`
  - `Added`: `specs/company-page/story/current-growth-drivers.md`
  - `Added`: `specs/company-page/story/economic-moat.md`
  - `Added`: `specs/company-page/story/future-growth-drivers.md`
  - `Added`: `specs/company-page/valuation/banking-valuation.md`
  - `Added`: `specs/company-page/valuation/excess-return-valuation.md`
  - `Added`: `specs/company-page/valuation/relative-valuation.md`
  - `Added`: `specs/company-page/valuation/sotp-valuation.md`
  - `Added`: `specs/document-ai/document-ai.md`
  - `Added`: `specs/generate-ideas/screening.md`
  - `Added`: `specs/grwth/grwth-pipeline.md`
  - `Added`: `specs/industry-page/industry-analysis.md`
  - `Added`: `specs/macro-page/macro-dashboard.md`
  - `Added`: `specs/portfolio-management/portfolio-dashboard.md`
  - `Added`: `specs/tasks-time/tasks-time-tracker.md`
  - `Added`: `specs/watchlist/watchlist-manager.md`
  - `Added`: `specs/weigh-decisions/weigh-decisions.md`

### Commit 16: `b4e122c` — docs: add 24 specs (18 engines + 6 company page), update SPEC_INDEX & TOOL_TRACKER
- **Commit Hash**: `b4e122cbc0663d2356344ba478113b5c304e97a3`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 13:57:46 2026 +0530
- **File Modifications (28 files)**:
  - `Added`: `specs/SPEC_INDEX.md`
  - `Added`: `specs/TOOL_TRACKER.md`
  - `Added`: `specs/_TEMPLATE.md`
  - `Added`: `specs/company-page/analysis/ratio-analysis.md`
  - `Added`: `specs/company-page/downsides/hedging-mechanism.md`
  - `Added`: `specs/company-page/management/concall-consistency.md`
  - `Added`: `specs/company-page/overview/decision-terminal.md`
  - `Added`: `specs/company-page/overview/thesis-snapshot.md`
  - `Added`: `specs/company-page/story/business-model.md`
  - `Added`: `specs/company-page/valuation/dcf-valuation.md`
  - `Added`: `specs/engines/altman-engine.md`
  - `Added`: `specs/engines/banking-engine.md`
  - `Added`: `specs/engines/beneish-engine.md`
  - `Added`: `specs/engines/common-size-engine.md`
  - `Added`: `specs/engines/concall-consistency-engine.md`
  - `Added`: `specs/engines/corporate-actions-engine.md`
  - `Added`: `specs/engines/dcf-engine.md`
  - `Added`: `specs/engines/excess-return-engine.md`
  - `Added`: `specs/engines/hedging-engine.md`
  - `Added`: `specs/engines/piotroski-engine.md`
  - `Added`: `specs/engines/portfolio-engine.md`
  - `Added`: `specs/engines/ratio-analysis-engine.md`
  - `Added`: `specs/engines/relative-engine.md`
  - `Added`: `specs/engines/revenue-projection-engine.md`
  - `Added`: `specs/engines/risk-score-engine.md`
  - `Added`: `specs/engines/screening-engine.md`
  - `Added`: `specs/engines/sotp-engine.md`
  - `Added`: `specs/engines/turnaround-engine.md`

### Commit 15: `2ef44c5` — chore: remove pycache files
- **Commit Hash**: `2ef44c533f0a75cbe19471270cc9daded39d545f`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 12:52:16 2026 +0530
- **File Modifications (4 files)**:
  - `Deleted`: `data-ingestion/src/data_ingestion/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `data-ingestion/tests/__pycache__/test_data_ingestion.cpython-314-pytest-9.1.1.pyc`
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`

### Commit 14: `1d7d9f1` — docs: add 7 missing tool specs (Ratio Analysis, Common Size, Turnaround, Hedging, Valuation Philosophy, Industry Regulations, Industry Cost Drivers) per Excel audit
- **Commit Hash**: `1d7d9f1a03946ce7f3cc13e5b1db0868902bae46`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 12:51:54 2026 +0530
- **File Modifications (5 files)**:
  - `Added`: `data-ingestion/src/data_ingestion/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `data-ingestion/tests/__pycache__/test_data_ingestion.cpython-314-pytest-9.1.1.pyc`
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`
  - `Modified`: `research-os-frontend/SPEC_INDIVIDUAL_TOOLS.md`

### Commit 13: `4cea03c` — fix: docker-compose PYTHONPATH alignment with Dockerfiles
- **Commit Hash**: `4cea03c47c066aa43e256e0437ecbc1975d02981`
- **Author**: Research OS (`research-os@local`)
- **Date**: Mon Nov 2 12:42:01 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `docker-compose.yml`

### Commit 12: `275c319` — fix: address Antigravity audit - Dockerfile, triplication, duplicate route, NextAuth secret, SWR polling
- **Commit Hash**: `275c319a6dded1ff63ba57881b47cc7738c69801`
- **Author**: Research OS (`research-os@local`)
- **Date**: Sat Oct 31 11:35:49 2026 +0530
- **File Modifications (20 files)**:
  - `Modified`: `data-ingestion/Dockerfile`
  - `Modified`: `data-ingestion/api/main.py`
  - `Modified`: `math-engine/Dockerfile`
  - `Modified`: `math-engine/api/main.py`
  - `Deleted`: `math-engine/main.py`
  - `Deleted`: `math-engine/math_engine/__init__.py`
  - `Deleted`: `math-engine/math_engine/forensics/__init__.py`
  - `Deleted`: `math-engine/math_engine/grwth/__init__.py`
  - `Deleted`: `math-engine/math_engine/portfolio/__init__.py`
  - `Deleted`: `math-engine/math_engine/portfolio/corporate_actions.py`
  - `Deleted`: `math-engine/math_engine/screening/__init__.py`
  - `Deleted`: `math-engine/math_engine/valuation/__init__.py`
  - `Added`: `math-engine/requirements.txt`
  - `Modified`: `research-os-frontend/package-lock.json`
  - `Modified`: `research-os-frontend/package.json`
  - `Modified`: `research-os-frontend/src/app/api/auth/[...nextauth]/route.ts`
  - `Added`: `research-os-frontend/src/hooks/usePrices.ts`
  - `Deleted`: `research-os-frontend/src/hooks/useRealtimePrices.ts`
  - `Added`: `research-os-frontend/src/lib/auth.ts`
  - `Modified`: `research-os-frontend/src/middleware.ts`

### Commit 11: `b9d45fe` — feat: complete all remaining items - 22 widgets, data ingestion API, corporate actions, auth, WebSocket, Docker, Cloud Run prep
- **Commit Hash**: `b9d45fee6200b169e6d2bd533072c20eb434d2ca`
- **Author**: Research OS (`research-os@local`)
- **Date**: Sat Oct 31 10:47:16 2026 +0530
- **File Modifications (36 files)**:
  - `Added`: `data-ingestion/Dockerfile`
  - `Modified`: `data-ingestion/api/main.py`
  - `Modified`: `docker-compose.yml`
  - `Added`: `math-engine/Dockerfile`
  - `Modified`: `math-engine/api/main.py`
  - `Modified`: `math-engine/main.py`
  - `Added`: `research-os-frontend/Dockerfile`
  - `Modified`: `research-os-frontend/package-lock.json`
  - `Modified`: `research-os-frontend/package.json`
  - `Added`: `research-os-frontend/src/app/api/auth/[...nextauth]/route.ts`
  - `Added`: `research-os-frontend/src/app/auth/signin/page.tsx`
  - `Added`: `research-os-frontend/src/components/ui/checkbox.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/CatalystTracker.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/Checklist.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/CustomText.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/DemandDrivers.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/DocumentViewer.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/FinancialCharts.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/IndustryOverview.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/KPICard.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/MarginBridge.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/NewsFeed.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/OwnershipAnalysis.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/PeerComparison.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/PeerComparisonTable.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/PortfolioHoldings.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/PortfolioPerformance.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/PortfolioRisk.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/RiskAssessment.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/SectorHeatmap.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/TechnicalAnalysis.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/TransactionLog.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/ValuationSummary.tsx`
  - `Modified`: `research-os-frontend/src/components/widgets/ValueChainMapper.tsx`
  - `Added`: `research-os-frontend/src/hooks/useRealtimePrices.ts`
  - `Added`: `research-os-frontend/src/middleware.ts`

### Commit 10: `fdb6956` — feat: apply Antigravity architecture fixes - rewrites, widget centralization, persistent layout, domain split, data ingestion pipeline, portfolio reconcile UI
- **Commit Hash**: `fdb69565bdfcb45a5b022ab520400a365fea1372`
- **Author**: Research OS (`research-os@local`)
- **Date**: Sat Oct 31 09:56:33 2026 +0530
- **File Modifications (79 files)**:
  - `Added`: `data-ingestion/api/data_ingestion/chunkers/__init__.py`
  - `Added`: `data-ingestion/api/data_ingestion/chunkers/sliding_window.py`
  - `Added`: `data-ingestion/api/data_ingestion/classifiers/__init__.py`
  - `Added`: `data-ingestion/api/data_ingestion/classifiers/document_classifier.py`
  - `Added`: `data-ingestion/api/data_ingestion/embeddings/__init__.py`
  - `Added`: `data-ingestion/api/data_ingestion/embeddings/vector_store.py`
  - `Added`: `data-ingestion/api/data_ingestion/extractors/__init__.py`
  - `Added`: `data-ingestion/api/data_ingestion/extractors/pdf.py`
  - `Added`: `data-ingestion/api/data_ingestion/pit/__init__.py`
  - `Added`: `data-ingestion/api/data_ingestion/pit/transformer.py`
  - `Added`: `data-ingestion/api/data_ingestion/rag/__init__.py`
  - `Added`: `data-ingestion/api/data_ingestion/rag/citation_engine.py`
  - `Deleted`: `data-ingestion/src/data_ingestion/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `data-ingestion/src/data_ingestion/chunkers/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/chunkers/sliding_window.py`
  - `Added`: `data-ingestion/src/data_ingestion/classifiers/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/classifiers/document_classifier.py`
  - `Added`: `data-ingestion/src/data_ingestion/embeddings/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/embeddings/vector_store.py`
  - `Added`: `data-ingestion/src/data_ingestion/extractors/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/extractors/pdf.py`
  - `Added`: `data-ingestion/src/data_ingestion/pit/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/pit/transformer.py`
  - `Added`: `data-ingestion/src/data_ingestion/rag/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/rag/citation_engine.py`
  - `Deleted`: `data-ingestion/tests/__pycache__/test_data_ingestion.cpython-314-pytest-9.1.1.pyc`
  - `Modified`: `math-engine/api/main.py`
  - `Added`: `math-engine/api/math_engine/__init__.py`
  - `Added`: `math-engine/api/math_engine/forensics/__init__.py`
  - `Added`: `math-engine/api/math_engine/grwth/__init__.py`
  - `Added`: `math-engine/api/math_engine/portfolio/__init__.py`
  - `Added`: `math-engine/api/math_engine/portfolio/corporate_actions.py`
  - `Added`: `math-engine/api/math_engine/screening/__init__.py`
  - `Added`: `math-engine/api/math_engine/valuation/__init__.py`
  - `Modified`: `math-engine/main.py`
  - `Added`: `math-engine/math_engine/forensics/__init__.py`
  - `Added`: `math-engine/math_engine/grwth/__init__.py`
  - `Added`: `math-engine/math_engine/portfolio/__init__.py`
  - `Added`: `math-engine/math_engine/portfolio/corporate_actions.py`
  - `Added`: `math-engine/math_engine/screening/__init__.py`
  - `Added`: `math-engine/math_engine/valuation/__init__.py`
  - `Added`: `math-engine/src/math_engine/forensics/__init__.py`
  - `Added`: `math-engine/src/math_engine/grwth/__init__.py`
  - `Added`: `math-engine/src/math_engine/portfolio/__init__.py`
  - `Added`: `math-engine/src/math_engine/portfolio/corporate_actions.py`
  - `Added`: `math-engine/src/math_engine/screening/__init__.py`
  - `Added`: `math-engine/src/math_engine/valuation/__init__.py`
  - `Modified`: `research-os-frontend/next.config.ts`
  - `Deleted`: `research-os-frontend/src/app/api/data-ingestion/route.ts`
  - `Deleted`: `research-os-frontend/src/app/api/math-engine/dcf/route.ts`
  - `Deleted`: `research-os-frontend/src/app/api/math-engine/screening/route.ts`
  - `Added`: `research-os-frontend/src/app/company/[symbol]/layout.tsx`
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/app/portfolio/import/page.tsx`
  - `Added`: `research-os-frontend/src/app/portfolio/reconcile/page.tsx`
  - `Added`: `research-os-frontend/src/components/ui/skeleton.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/CatalystTracker.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/Checklist.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/CustomText.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/DemandDrivers.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/DocumentViewer.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/FinancialCharts.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/IndustryOverview.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/KPICard.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/MarginBridge.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/NewsFeed.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/OwnershipAnalysis.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/PeerComparison.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/PeerComparisonTable.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/PortfolioHoldings.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/PortfolioPerformance.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/PortfolioRisk.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/RiskAssessment.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/SectorHeatmap.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/TechnicalAnalysis.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/TransactionLog.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ValuationSummary.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/ValueChainMapper.tsx`
  - `Added`: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx`

### Commit 9: `d6f8197` — fix: Vercel Python services deploy, FastAPI entrypoint, dependencies
- **Commit Hash**: `d6f81972a8dd900a4ccd3b5c494506a89cf5b5e5`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 17:49:36 2026 +0530
- **File Modifications (11 files)**:
  - `Added`: `data-ingestion/api/data_ingestion/__init__.py`
  - `Modified`: `data-ingestion/api/main.py`
  - `Modified`: `data-ingestion/pyproject.toml`
  - `Modified`: `math-engine/api/main.py`
  - `Added`: `math-engine/main.py`
  - `Added`: `math-engine/math_engine/__init__.py`
  - `Modified`: `math-engine/pyproject.toml`
  - `Deleted`: `math-engine/requirements.txt`
  - `Modified`: `research-os-frontend/package-lock.json`
  - `Modified`: `research-os-frontend/package.json`
  - `Added`: `research-os-frontend/vercel.json`

### Commit 8: `257154e` — fix: TypeScript errors, company page, tabs alignment, portable auto-agent
- **Commit Hash**: `257154e7adef743cd6c2859cc1da649908b135fb`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 16:27:54 2026 +0530
- **File Modifications (3 files)**:
  - `Deleted`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Deleted`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`
  - `Added`: `work-report-20261030-163000.md`

### Commit 7: `54b2d9e` — fix: auto-agent fixes - build errors, runtime errors, math engine tests
- **Commit Hash**: `54b2d9e17d7edf00e336b3b24b888c8c620d0cfb`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 16:26:07 2026 +0530
- **File Modifications (20 files)**:
  - `Modified`: `auto-agent.sh`
  - `Modified`: `math-engine/src/math_engine/__init__.py`
  - `Modified`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Modified`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`
  - `Modified`: `math-engine/tests/test_math_engine.py`
  - `Modified`: `research-os-frontend/postcss.config.js`
  - `Modified`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/app/company/page.tsx`
  - `Modified`: `research-os-frontend/src/app/documents/page.tsx`
  - `Modified`: `research-os-frontend/src/app/industry/page.tsx`
  - `Modified`: `research-os-frontend/src/app/macro/page.tsx`
  - `Modified`: `research-os-frontend/src/app/screening/page.tsx`
  - `Modified`: `research-os-frontend/src/app/tasks/page.tsx`
  - `Modified`: `research-os-frontend/src/app/valuation/page.tsx`
  - `Modified`: `research-os-frontend/src/app/watchlist/page.tsx`
  - `Modified`: `research-os-frontend/src/components/CompanyTabs.tsx`
  - `Modified`: `research-os-frontend/src/components/DashboardCanvas.tsx`
  - `Modified`: `research-os-frontend/src/lib/mock-data.ts`
  - `Modified`: `research-os-frontend/src/lib/types.ts`
  - `Modified`: `research-os-frontend/src/lib/workspace-store.ts`

### Commit 6: `96d282d` — fix: Add minimal root package.json without workspaces for Vercel
- **Commit Hash**: `96d282d216b3760806afaba28460758d2c11e842`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 14:58:45 2026 +0530
- **File Modifications (1 files)**:
  - `Added`: `package.json`

### Commit 5: `2899aa9` — fix: Add .vercelignore to allow root package.json for Vercel build
- **Commit Hash**: `2899aa921be9fd9461484e4cc1b983a76f79ce88`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 14:54:51 2026 +0530
- **File Modifications (1 files)**:
  - `Added`: `.vercelignore`

### Commit 4: `f9bbedd` — fix: Update @eslint/js to ^9.0.0 for eslint@9 compatibility
- **Commit Hash**: `f9bbedd49aacd938a148c425ae7cb588a32feb22`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 14:47:03 2026 +0530
- **File Modifications (3 files)**:
  - `Added`: `.gitignore`
  - `Added`: `.vercelignore.bak`
  - `Modified`: `research-os-frontend/package.json`

### Commit 3: `df21821` — fix: Add entrypoint and buildCommand for Python services
- **Commit Hash**: `df21821963cb2ddb0a07ab2312fdde5cb1b967f1`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 13:42:36 2026 +0530
- **File Modifications (1 files)**:
  - `Modified`: `vercel.json`

### Commit 2: `c127e3b` — feat: Add Vercel services config with math-engine, data-ingestion, and frontend
- **Commit Hash**: `c127e3bb9caaac909b7efb98ddf26c87e534b4dd`
- **Author**: Research OS (`research-os@local`)
- **Date**: Fri Oct 30 13:21:15 2026 +0530
- **Details / Objective**:
  > - Add vercel.json with 3 services: math-engine, data-ingestion, research-os-frontend
  > - Add bindings for frontend to call math-engine and data-ingestion services
  > - Add public rewrites for /api/math-engine/* and /api/data-ingestion/*
  > - Update Next.js API routes to proxy to math-engine service
  > - Add data-ingestion proxy route
  > - Add Vercel Python entry points for math-engine and data-ingestion services
  > - Add requirements.txt for both Python services
- **File Modifications (8 files)**:
  - `Added`: `data-ingestion/api/main.py`
  - `Added`: `data-ingestion/requirements.txt`
  - `Added`: `math-engine/api/main.py`
  - `Added`: `math-engine/requirements.txt`
  - `Added`: `research-os-frontend/src/app/api/data-ingestion/route.ts`
  - `Modified`: `research-os-frontend/src/app/api/math-engine/dcf/route.ts`
  - `Modified`: `research-os-frontend/src/app/api/math-engine/screening/route.ts`
  - `Added`: `vercel.json`

### Commit 1: `bc74d2b` — Research OS - Ready for Vercel deploy
- **Commit Hash**: `bc74d2bc2dd92581773d6de28ce792930ddef6c7`
- **Author**: Research OS (`research-os@local`)
- **Date**: Thu Oct 29 17:02:07 2026 +0530
- **File Modifications (96 files)**:
  - `Added`: `.hermes/cron/research-os-auto-agent.yaml`
  - `Added`: `ResearchOS-AutoAgent.xml`
  - `Added`: `auto-agent.bat`
  - `Added`: `auto-agent.sh`
  - `Added`: `cron-auto-agent`
  - `Added`: `cronjob_payload.json`
  - `Added`: `data-ingestion/pyproject.toml`
  - `Added`: `data-ingestion/src/data_ingestion/__init__.py`
  - `Added`: `data-ingestion/src/data_ingestion/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `data-ingestion/src/fros_data_ingestion.egg-info/PKG-INFO`
  - `Added`: `data-ingestion/src/fros_data_ingestion.egg-info/SOURCES.txt`
  - `Added`: `data-ingestion/src/fros_data_ingestion.egg-info/dependency_links.txt`
  - `Added`: `data-ingestion/src/fros_data_ingestion.egg-info/requires.txt`
  - `Added`: `data-ingestion/src/fros_data_ingestion.egg-info/top_level.txt`
  - `Added`: `data-ingestion/tests/__pycache__/test_data_ingestion.cpython-314-pytest-9.1.1.pyc`
  - `Added`: `data-ingestion/tests/test_data_ingestion.py`
  - `Added`: `docker-compose.yml`
  - `Added`: `docs/samples/HDFC_Bank_Concall_Q4_FY24.pdf`
  - `Added`: `docs/samples/HDFC_Bank_Presentation_Q4_FY24.pdf`
  - `Added`: `docs/samples/RIL_Annual_Report_2023-24.pdf`
  - `Added`: `math-engine/pyproject.toml`
  - `Added`: `math-engine/src/fros_math_engine.egg-info/PKG-INFO`
  - `Added`: `math-engine/src/fros_math_engine.egg-info/SOURCES.txt`
  - `Added`: `math-engine/src/fros_math_engine.egg-info/dependency_links.txt`
  - `Added`: `math-engine/src/fros_math_engine.egg-info/requires.txt`
  - `Added`: `math-engine/src/fros_math_engine.egg-info/top_level.txt`
  - `Added`: `math-engine/src/math_engine/__init__.py`
  - `Added`: `math-engine/src/math_engine/__pycache__/__init__.cpython-314.pyc`
  - `Added`: `math-engine/tests/__pycache__/test_math_engine.cpython-314-pytest-9.1.1.pyc`
  - `Added`: `math-engine/tests/test_math_engine.py`
  - `Added`: `postgres/init/01_schema.sql`
  - `Added`: `research-os-autoagent.service`
  - `Added`: `research-os-autoagent.timer`
  - `Added`: `research-os-frontend/.gitignore`
  - `Added`: `research-os-frontend/AGENTS.md`
  - `Added`: `research-os-frontend/README.md`
  - `Added`: `research-os-frontend/SPEC_GRWTH_PIPELINE.md`
  - `Added`: `research-os-frontend/SPEC_INDEX.md`
  - `Added`: `research-os-frontend/SPEC_INDIVIDUAL_TOOLS.md`
  - `Added`: `research-os-frontend/SPEC_INGESTION_PIPELINE.md`
  - `Added`: `research-os-frontend/SPEC_MATH_ENGINE.md`
  - `Added`: `research-os-frontend/SPEC_PRODUCT.md`
  - `Added`: `research-os-frontend/SPEC_TASKS_TIME_TRACKER.md`
  - `Added`: `research-os-frontend/SPEC_WIDGET_TAB_FRAMEWORK.md`
  - `Added`: `research-os-frontend/dev.log`
  - `Added`: `research-os-frontend/eslint.config.mjs`
  - `Added`: `research-os-frontend/next.config.ts`
  - `Added`: `research-os-frontend/next.config.ts.backup`
  - `Added`: `research-os-frontend/package-lock.json`
  - `Added`: `research-os-frontend/package.json`
  - `Added`: `research-os-frontend/postcss.config.js`
  - `Added`: `research-os-frontend/public/file.svg`
  - `Added`: `research-os-frontend/public/globe.svg`
  - `Added`: `research-os-frontend/public/next.svg`
  - `Added`: `research-os-frontend/public/vercel.svg`
  - `Added`: `research-os-frontend/public/window.svg`
  - `Added`: `research-os-frontend/src/app/api/math-engine/dcf/route.ts`
  - `Added`: `research-os-frontend/src/app/api/math-engine/screening/route.ts`
  - `Added`: `research-os-frontend/src/app/company/[symbol]/page.tsx`
  - `Added`: `research-os-frontend/src/app/documents/page.tsx`
  - `Added`: `research-os-frontend/src/app/favicon.ico`
  - `Added`: `research-os-frontend/src/app/globals.css`
  - `Added`: `research-os-frontend/src/app/grwth/page.tsx`
  - `Added`: `research-os-frontend/src/app/industry/page.tsx`
  - `Added`: `research-os-frontend/src/app/layout.tsx`
  - `Added`: `research-os-frontend/src/app/macro/page.tsx`
  - `Added`: `research-os-frontend/src/app/page.tsx`
  - `Added`: `research-os-frontend/src/app/portfolio/page.tsx`
  - `Added`: `research-os-frontend/src/app/screening/page.tsx`
  - `Added`: `research-os-frontend/src/app/tasks/page.tsx`
  - `Added`: `research-os-frontend/src/app/test/page.tsx`
  - `Added`: `research-os-frontend/src/app/valuation/page.tsx`
  - `Added`: `research-os-frontend/src/app/watchlist/page.tsx`
  - `Added`: `research-os-frontend/src/app/weigh/page.tsx`
  - `Added`: `research-os-frontend/src/components/CompanyTabs.tsx`
  - `Added`: `research-os-frontend/src/components/DashboardCanvas.tsx`
  - `Added`: `research-os-frontend/src/components/Navigation.tsx`
  - `Added`: `research-os-frontend/src/components/ui/badge.tsx`
  - `Added`: `research-os-frontend/src/components/ui/button.tsx`
  - `Added`: `research-os-frontend/src/components/ui/card.tsx`
  - `Added`: `research-os-frontend/src/components/ui/input.tsx`
  - `Added`: `research-os-frontend/src/components/ui/label.tsx`
  - `Added`: `research-os-frontend/src/components/ui/metric-card.tsx`
  - `Added`: `research-os-frontend/src/components/ui/scroll-area.tsx`
  - `Added`: `research-os-frontend/src/components/ui/select.tsx`
  - `Added`: `research-os-frontend/src/components/ui/separator.tsx`
  - `Added`: `research-os-frontend/src/components/ui/table.tsx`
  - `Added`: `research-os-frontend/src/components/ui/tabs.tsx`
  - `Added`: `research-os-frontend/src/components/ui/textarea.tsx`
  - `Added`: `research-os-frontend/src/lib/mock-data.ts`
  - `Added`: `research-os-frontend/src/lib/supabase.ts`
  - `Added`: `research-os-frontend/src/lib/types.ts`
  - `Added`: `research-os-frontend/src/lib/utils.ts`
  - `Added`: `research-os-frontend/src/lib/workspace-store.ts`
  - `Added`: `research-os-frontend/tailwind.config.ts`
  - `Added`: `research-os-frontend/tsconfig.json`

---

## 3. Subsystem Analysis & Breakdown

### 3.1 Frontend (`research-os-frontend`)

Hermes conducted a complete architectural overhaul of the frontend application:

#### A. Widget Architecture & Centralization
- **Widget Registry (`WidgetRegistry.tsx`)**: Centralized catalog of all 59 widgets using Next.js `dynamic()` lazy-loading. Eliminated component duplication (such as 10 duplicate KPICard implementations) across the app.
- **Widget Renderer (`WidgetRenderer.tsx`)**: Reusable wrapper managing widget loading states, error boundaries, parameter injection, and container styling.
- **59 Cataloged Widgets**:
  1. **Valuation Suite (5)**: `DCFValuation`, `RelativeValuation`, `SOTPValuation`, `BankingValuation`, `ExcessReturnValuation`
  2. **Forensics & Governance Suite (5)**: `BeneishMScore`, `AltmanZScore`, `PiotroskiFScore`, `ForensicFlags` (unified triple-model dashboard), `ManagementConsistency` (guidance tracking, beat/met/miss)
  3. **Computational Engines Suite (7)**: `RatioAnalysis` (DuPont 3/5-step, 40+ ratios), `TurnaroundIndicator`, `RiskScore`, `CommonSize`, `HedgingMechanism`, `RevenueProjection`, `ConcallConsistency`
  4. **Portfolio Management Suite (1)**: `PortfolioAnalytics` (Brent-Dekker XIRR, Sortino MAR=0, drawdown)
  5. **Document AI Suite (4)**: `DocumentViewer`, `SmartSummarizer`, `KeyDataExtractor`, `AIAssistant` (conversational analyst with document citations)
  6. **Macroeconomic Suite (2)**: `MarketMetrics`, `MacroDashboard` (regime assessment, allocation implications)
  7. **Idea Generation & Screening (3)**: `IdeaGeneration`, `ScreeningTable`, `FilteredTable`
  8. **Watchlist & Task Management (4)**: `WatchlistManager`, `KanbanBoard`, `TimeTracker`, `TodoTracker`
  9. **Weigh Decisions Suite (4)**: `PortfolioFitCheck`, `ScenarioAnalysis`, `ConvictionSizing`, `ReverseDCF`
  10. **UI Primitives & Utility (3)**: `MultiTextBox`, `SimpleTextBox`, `UIPrimitives` (design system showcase)
  11. **Core Existing Display Widgets (21)**: Financial tables, ownership structure, peer comps, concall tabs, etc.

#### B. Routing, Layout & Performance
- **Persistent Company Layout (`src/app/company/[symbol]/layout.tsx`)**: Transformed company analysis from destructive full-page tab reloads into a persistent layout that preserves dashboard state while switching tabs via query params (`?tab=overview`, `?tab=valuation`, `?tab=forensics`, etc.).
- **React Suspense Encapsulation**: Fixed Next.js 15 client-side de-opt exceptions by wrapping `useSearchParams()` calls in `<Suspense fallback={...}>` in `page.tsx` and `layout.tsx` (Commit `68e381c`).
- **New Feature Pages**:
  - `/company`: Symbol selector, recently viewed companies, index heatmaps.
  - `/generate-ideas`: Idea generation funnel, screening presets, custom financial filters.
  - `/auth/signin`: Dedicated sign-in route supporting credential login.
  - `/industry`: Interactive industry deep-dive view with comparative cost/demand drivers.
  - `/tasks`, `/watchlist`, `/macro`, `/weigh`: Integrated full-page dashboards connecting to their respective widgets.

#### C. API Proxy Elimination & Rewrites
- **Deleted Bloated Proxy Routes**: Removed `src/app/api/data-ingestion/route.ts`, `src/app/api/math-engine/dcf/route.ts`, and `src/app/api/math-engine/screening/route.ts`.
- **Declarative Rewrites in `next.config.ts`**: Implemented server-level rewrites proxying `/api/math-engine/:path*` directly to `process.env.MATH_ENGINE_URL || 'http://localhost:8000'` and `/api/data-ingestion/:path*` to `process.env.DATA_INGESTION_URL || 'http://localhost:8001'`.

---

### 3.2 Math Engine (`math-engine`)

Hermes undertook a comprehensive mathematical remediation of the computation engines, addressing critical flaws flagged during earlier audits:

#### A. Domain Subpackage Modularization
Refactored monolithic code into clean domain subpackages in both `src/math_engine/` and `api/math_engine/`:
- `valuation/`: DCF, Banking, Excess Return, Relative, SOTP
- `forensics/`: Beneish M-Score, Altman Z-Score, Piotroski F-Score
- `portfolio/`: Portfolio Analytics, Corporate Actions Engine
- `screening/`: Screening Engine
- `grwth/`: GRWTH Pipeline Engine

#### B. Mathematical Correctness Bug Fixes (7 Core Engines)
1. **DCF Engine**:
   - Introduced mid-year discounting convention (`t - 0.5`) enabled by default.
   - Guarded against `WACC <= g` Gordon Growth explosion with strict error throwing.
   - Integrated Ind AS 116 operating lease liabilities directly into the Enterprise Value to Equity Value debt bridge.
   - Enforced EBITDA margin stability for terminal value calculation.
2. **Banking Valuation Engine**:
   - Automatic normalization of ROE inputs: converts percentage inputs (>1.0 e.g. 18.5) to decimal fractions (0.185), eliminating a 64x equity valuation error.
   - Adjusted Book Value Per Share (ABVPS): Explicit deduction of Net Non-Performing Assets (Net NPA) from Net Worth.
   - Residual Income Model with Ohlson persistence factor.
3. **Beneish M-Score Engine**:
   - Fixed critical formula sign error: LVGI coefficient updated from `+0.0327` to `-0.327` per Beneish (1999).
   - Corrected TATA coefficient from `4.037` to `4.679`.
   - Clamped Gross Margin Index (GMI) to `[0.1, 5.0]` to prevent single-quarter revenue shocks from blowing out the score.
4. **Relative Valuation Engine**:
   - Explicitly excludes loss-making peers (negative EPS / negative EBITDA) from peer aggregation.
   - Implemented Harmonic Mean for peer P/E aggregation to eliminate high-multiple outlier skew.
   - Enforced fully diluted share counts.
5. **Altman Z-Score Engine**:
   - Multi-model selection: Original (manufacturing), Revised (non-manufacturing), and Emerging Market Z'' with `+3.25` intercept.
   - Zero-liabilities defensive guard avoiding divide-by-zero crashes.
6. **Excess Return Valuation Engine**:
   - Implemented Ohlson (1995) autoregressive persistence parameter $\omega \in [0, 1)$.
   - Enforced Clean Surplus Accounting compliance with Other Comprehensive Income (OCI) adjustment (`comprehensive_income_adj`).
7. **SOTP (Sum-Of-The-Parts) Engine**:
   - Configurable per-segment `valuation_level` (Enterprise Value vs Equity Value).
   - Applied `effective_stake_pct` for joint ventures and minority holdings.
   - Added HoldCo (holding company) discount sensitivity table (10% to 50%).

#### C. Corporate Actions Engine (Rewritten)
- Built dedicated SEBI-compliant corporate actions engine (`portfolio/corporate_actions.py`):
  - **Bonus Shares**: Book cost of bonus shares assigned NIL value as mandated under **Section 55(2)(aa)** of the Income Tax Act, adjusting average holding cost across total enlarged holdings.
  - **Demergers**: Cost of acquisition apportioned strictly according to **Section 49(2C)** based on net book value of assets transferred.
  - **Fractional Shares**: Fractional entitlements rounded down with cash-in-lieu payout tracking per SEBI regulations.
  - **Rights Issues**: Subscription price, entitlement ratio, and renunciation tracking.

#### D. 7 Newly Added Computational Engines
1. **Ratio Analysis Engine (v2.0.0)**: Entity-type branching (Commercial vs Bank/NBFC vs Insurance), 40+ financial ratios, DuPont 3-stage and 5-stage decomposition, financial distress flags, peer percentile ranking.
2. **Turnaround Indicator Engine**: Multi-metric turnaround signal detector (operating profit rebound, debt reduction threshold, IBC dilution check).
3. **Hedging Mechanism Engine**: Zero-cost collar payoff calculations with corrected signs, futures cost-of-carry pricing with Indian dividend yield conventions, and NSE lot size rounding.
4. **Risk Score Engine**: Integrated SEBI LODR corporate governance calibrations, auditor qualification weighting, promoter pledge threshold alerts, dynamic category weights.
5. **Common Size Engine**: Standardized P&L, Balance Sheet, and Cash Flow common sizing, Ind AS 116 lease normalization, zero-revenue fallback base, sum-to-100% reconciliation checks.
6. **Revenue Projection Engine**: Segmental S-curve adoption modeling, intercompany eliminations, depreciation tax shield modeling.
7. **Concall Consistency Engine**: Management earnings call consistency analyzer, time-decay guidance weighting, guidance range parsing, beat/met/miss history.

#### E. Cross-Cutting Engineering & API Layer
- **Cryptographic Auditability**: Every engine output dataclass includes `inputs_hash` (SHA-256 hash of serialized inputs) and UTC `calculation_timestamp`.
- **Registry & Convenience API**: `MathEngineRegistry` registering all 18 engines with top-level helper functions (`run_dcf`, `run_banking`, etc.).
- **FastAPI REST Endpoints**: 18 POST endpoints exposed in `math-engine/api/main.py`.
- **Test Suite**: `math-engine/tests/test_math_engine.py` maintaining 36 golden vector tests covering standard and edge cases.

---

### 3.3 Data Ingestion (`data-ingestion`)

Hermes implemented a production-grade financial document ingestion and RAG pipeline:
- **PDF Extraction (`extractors/pdf.py`)**: Structured text and tabular extraction specialized for Indian corporate filings (Annual Reports, Concall Transcripts, Investor Presentations).
- **Document Classifier (`classifiers/document_classifier.py`)**: Automatic document categorization into Annual Report, Concall Transcript, Investor Presentation, Quarterly Result, or Board Disclosure.
- **Sliding Window Chunker (`chunkers/sliding_window.py`)**: Overlapping chunking preserving semantic paragraph boundaries and table headers.
- **Vector Store (`embeddings/vector_store.py`)**: Abstraction supporting Qdrant vector database storage and local vector index fallback.
- **Point-in-Time (PIT) Transformer (`pit/transformer.py`)**: Crucial for financial forensic integrity; preserves as-originally-reported financial statements alongside subsequent accounting restatements.
- **RAG Citation Engine (`rag/citation_engine.py`)**: Connects LLM-generated summaries and responses to exact source document pages, paragraphs, and financial table cells.
- **FastAPI Service (`api/main.py`)**: Document upload, status polling, semantic search, and citation verification.
- **Test Suite (`tests/test_data_ingestion.py`)**: 13 automated tests verifying ingestion and parsing pipelines.

---

### 3.4 Database Schemas (`postgres/`)

- **Master Database Schema (`postgres/init/01_schema.sql`)**: 30 comprehensive relational tables:
  - Core Entities: `companies`, `company_identifiers`, `exchanges`, `sectors`, `industries`
  - Financial Data: `financial_statements`, `financial_line_items`, `ratio_snapshots`, `corporate_actions`
  - Document & Vector Store: `documents`, `document_chunks`, `embeddings` (enabled with `pgvector` extension for cosine/dot product similarity searches)
  - Portfolio Management: `portfolios`, `portfolio_holdings`, `transactions`, `corporate_actions_log`
  - Decision & Research Tools: `watchlists`, `watchlist_items`, `decision_journals`, `scenario_models`
  - Task & Time Tracker: `tasks`, `todos`, `time_entries`
  - Authentication & Users: `users`, `accounts`, `sessions`, `verification_tokens` (NextAuth schema compliant)

---

### 3.5 Specifications (`specs/` & `specs/audits/`)

Hermes created an exhaustive documentation base totaling **141 specification files** (~98% coverage of the target research platform):
- **`specs/engines/` (18 files)**: Full mathematical specifications, formulas, edge cases, and test vectors for all 18 computational engines.
- **`specs/company-page/` (59 files)**: Micro-specs for every widget across 10 company tabs:
  - `overview/` (7 specs), `management/` (6 specs), `financials/` (8 specs), `valuation/` (6 specs), `peer/` (4 specs), `forensics/` (6 specs), `risk/` (5 specs), `sme/` (6 specs), `story/` (4 specs), `concall/` (7 specs)
- **`specs/industry-page/` (11 files)**: Specifications for industry analysis, cost drivers, demand mapping, supply chain graph.
- **`specs/portfolio-management/` (16 files)**: Holdings, corporate actions, statement reconciliation, capital gains tax, risk metrics.
- **`specs/document-ai/` (4 files)**: Document AI assistant, smart summarizer, key data extractor, document viewer.
- **`specs/weigh-decisions/` (6 files)**: Conviction sizing, scenario analysis, portfolio fit check, reverse DCF, decision journal.
- **`specs/macro-page/` (2 files)**: Macro dashboard and market metrics.
- **`specs/generate-ideas/` (2 files)**: Idea generation pipeline and stock screening.
- **`specs/watchlist/` (2 files)**: Watchlist and watchlist manager.
- **`specs/tasks-time/` (3 files)**: Tasks, time tracker, and todo tracker.
- **`specs/grwth/` (1 file)**: GRWTH framework pipeline.
- **Audit Specifications & Master Indices**: `specs/SPEC_INDEX.md`, `specs/TOOL_TRACKER.md`, `specs/_TEMPLATE.md`, `specs/audits/INDEX.md`.

---

### 3.6 Root Configs, Docker & Infrastructure

- **`docker-compose.yml`**: Defines complete multi-container development environment:
  - `postgres`: PostgreSQL 16 with `pgvector/pgvector:pg16`
  - `qdrant`: Qdrant vector database (`qdrant/qdrant:latest`)
  - `ollama`: Ollama local LLM runtime (`ollama/ollama:latest`)
  - `math-engine`: Python FastAPI container (Port 8000)
  - `data-ingestion`: Python FastAPI container (Port 8001)
- **Service Dockerfiles**: `math-engine/Dockerfile`, `data-ingestion/Dockerfile`, `research-os-frontend/Dockerfile`.
- **Vercel & Root Configuration**: `package.json`, `.vercelignore`, `.vercelignore.bak`, `vercel.json` configuring Vercel serverless functions.
- **Documentation & Planning**: `ANTIGRAVITY_HANDOFF.md` (comprehensive audit response), `IMPLEMENTATION_PLAN.md` (10-phase master roadmap).
- **Auto-Agent Scripts**: `auto-agent.sh`, `auto-agent.bat`, `cron-auto-agent`, and systemd service descriptors.

---

## 4. Evolutionary Timeline & Phase Analysis

Hermes executed the repository evolution across 4 distinct phases:

1. **Phase 1: Vercel Deploy & Environment Preparation (Oct 29 – Oct 31, Commits `bc74d2b` to `d6f8197`)**
   - Created initial monorepo structure, Docker configs, initial FastAPI apps, Vercel deployment configs, ESLint compatibility.
2. **Phase 2: Antigravity Audit Response & Architecture Fixes (Oct 31 – Nov 2, Commits `fdb6956` to `82a80c0`)**
   - Fixed Dockerfile PYTHONPATH issues, eliminated proxy route bloat, centralized widget registry, fixed 7 core math engines (Beneish GMI/LVGI, Banking ABVPS, DCF mid-year/Ind AS 116, Relative P/E harmonic mean, Altman Z'', Excess Return Clean Surplus, SOTP holdco discount).
   - Rebuilt Corporate Actions Engine for SEBI Sec 49(2C) and 55(2)(aa) compliance.
3. **Phase 3: Massive Specification & New Engine Expansion (Nov 2 – Nov 3, Commits `b4e122c` to `ff46ff2`)**
   - Authored 141 detailed technical specs covering ~98% of the platform.
   - Built and integrated 7 new engines: Ratio Analysis v2.0.0, Turnaround, Hedging, Risk Score, Common Size, Revenue Projection, Concall Consistency.
4. **Phase 4: Widget Integration & Frontend Hardening (Nov 3 – Nov 4, Commits `e955d27` to `68e381c`)**
   - Implemented and wired 59 dynamic widgets into company tabs, portfolio, macro, documents, and tasks pages.
   - Resolved TypeScript issues, wrapped `useSearchParams` in Suspense, authored `ANTIGRAVITY_HANDOFF.md`.

---

## 5. Verification & Repository Health

- **Git Remote Status**: `origin` verified pointing to `https://github.com/aaauto8179/Research-OS-Hermes.git`.
- **Working Tree Status**: Clean. Local branch `main` fast-forwarded to `68e381c` matching `origin/main`.
- **Source Code Preservation**: No source files modified or untracked. Read-only mandate preserved.
- **Automated Tests Preparedness**: Math Engine test suite (`math-engine/tests/test_math_engine.py`) and Data Ingestion test suite (`data-ingestion/tests/test_data_ingestion.py`) are fully synchronized and ready for M2 testing.

*(Report generated automatically by worker_m1 for Milestone M1)*