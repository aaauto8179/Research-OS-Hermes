# Research OS - Master Specification Index

**Version:** 1.0.0  
**Last Updated:** 2025-10-31  
**Source:** Internal Portal tools-3.xlsx (12 sheets, 100+ tools)  
**Status:** 128 specs created across all categories

---

## 📁 Specification Hierarchy

```
specs/
├── company-page/                    # Company Deep-Dive (10 tabs)
│   ├── overview/                    # Tab 1: Overview & Decision
│   ├── management/                  # Tab 2: Management & Execution
│   ├── story/                       # Tab 3: Story & Moats
│   ├── industry/                    # Tab 4: Industry Analysis
│   ├── risk/                        # Tab 5: Risk Scoring
│   ├── analysis/                    # Tab 6: Analysis & Concall
│   ├── valuation/                   # Tab 7: Valuation Suite
│   ├── financials/                  # Tab 8: Financial Statements
│   ├── sme/                         # Tab 9: SME Forensics
│   └── downsides/                   # Tab 10: Downsides & Exit Triggers
├── macro-page/                      # Macro Dashboard
├── portfolio-management/            # Portfolio Management
├── generate-ideas/                  # Idea Generation
├── watchlist/                       # Watchlist Management
├── industry-page/                   # Industry Analysis
├── document-ai/                     # Document Intelligence
├── grwth/                           # GRWTH Pipeline
├── weigh-decisions/                 # Decision Weighing
├── tasks-time/                      # Tasks & Time Tracker
├── additional-tools/                # UI Primitives
├── engines/                         # Core Calculation Engines
├── shared/                          # Shared Types & Utilities
├── _TEMPLATE.md                     # Spec template
├── SPEC_INDEX.md                    # This file
└── TOOL_TRACKER.md                  # Implementation tracker
```

---

## 🎯 Tool Coverage Summary

| Section | Sheets | Categories | Tools | Specs Created | % Complete |
|---------|--------|------------|-------|---------------|------------|
| Company Page | 1 | 18 | 60+ | **59** | ~98% |
| Macro Page | 1 | 1 | 2 | 2 | 100% |
| Portfolio Management | 1 | 8 | 22+ | **16** | ~73% |
| Generate Ideas | 1 | 1 | 1 | 2 | 200% |
| Watchlist | 1 | 1 | 1 | 2 | 200% |
| Industry Page | 1 | 3 | 11 | **11** | 100% |
| Document AI | 1 | 1 | 3 | **4** | 133% |
| GRWTH | 1 | 0 | 1 | 1 | 100% (design) |
| Weigh Decisions | 1 | 1 | 5 | **6** | 120% |
| Tasks & Time | 1 | 1 | 2 | **3** | 150% |
| Additional Tools | 1 | 1 | 3 | **4** | 133% |
| **Core Engines** | - | - | **18** | **18** | **100%** |
| **Total** | **12** | **37** | **~130** | **128** | **~98%** |

---

## 📋 Company Page — 10 Tabs (59 Specs)

### Tab 1: Overview & Decision (7 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| About the Company | `overview/about-company.md` | ✅ |
| Entry Rationale | `overview/entry-rationale.md` | ✅ |
| Exit Rationale | `overview/exit-rationale.md` | ✅ |
| Thesis Snapshot | `overview/thesis-snapshot.md` | ✅ |
| Decision Terminal | `overview/decision-terminal.md` | ✅ |
| Tracking Table | `overview/tracking-table.md` | ✅ |
| Latest Changes | `overview/latest-changes.md` | ✅ |

### Tab 2: Management & Execution (6 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Management Background | `management/management-background.md` | ✅ |
| Shareholding Pattern | `management/shareholding-pattern.md` | ✅ |
| Track Record | `management/track-record.md` | ✅ |
| Concall Consistency | `management/concall-consistency.md` | ✅ |
| Capital Allocation | `management/capital-allocation.md` | ✅ |
| Red Flags | `management/red-flags.md` | ✅ |

### Tab 3: Story & Moats (4 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Business Model | `story/business-model.md` | ✅ |
| Economic Moat | `story/economic-moat.md` | ✅ |
| Current Growth Drivers | `story/current-growth-drivers.md` | ✅ |
| Future Growth Drivers | `story/future-growth-drivers.md` | ✅ |

### Tab 4: Industry Analysis (3 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Market Sizing | `industry/market-sizing.md` | ✅ |
| Competitors Table | `industry/competitors-table.md` | ✅ |
| Value Chain Canvas | `industry/value-chain-canvas.md` | ✅ |

### Tab 5: Risk Scoring (9 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Business Risk | `risk/business-risk.md` | ✅ |
| Financial Risk | `risk/financial-risk.md` | ✅ |
| Valuation Risk | `risk/valuation-risk.md` | ✅ |
| Governance Risk | `risk/governance-risk.md` | ✅ |
| Macro Risk | `risk/macro-risk.md` | ✅ |
| Industry Red Flags | `risk/industry-red-flags.md` | ✅ |
| Risk Score Calculator | `risk/risk-score.md` | ✅ |
| Key Fragility Points | `risk/key-fragility-points.md` | ✅ |
| Legal Checks | `risk/legal-checks.md` | ✅ |

### Tab 6: Analysis & Concall (5 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Concall Tracker | `analysis/concall-tracker.md` | ✅ |
| Exit Checklist | `analysis/exit-checklist.md` | ✅ |
| Ratio Analysis | `analysis/ratio-analysis.md` | ✅ |
| Recent Events | `analysis/recent-events.md` | ✅ |
| Turnaround Indicator | `analysis/turnaround-indicator.md` | ✅ |

### Tab 7: Valuation Suite (6 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| DCF Valuation | `valuation/dcf-valuation.md` | ✅ |
| Relative Valuation | `valuation/relative-valuation.md` | ✅ |
| SOTP Valuation | `valuation/sotp-valuation.md` | ✅ |
| Banking Valuation | `valuation/banking-valuation.md` | ✅ |
| Excess Return Valuation | `valuation/excess-return-valuation.md` | ✅ |
| Valuation Philosophy | `valuation/valuation-philosophy.md` | ✅ |

### Tab 8: Financial Statements (4 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Revenue Projection | `financials/revenue-projection.md` | ✅ |
| Segment Breakup | `financials/segment-breakup.md` | ✅ |
| Financial Statements | `financials/financial-statements.md` | ✅ |
| Common Size Statement | `financials/common-size-statement.md` | ✅ |

### Tab 9: SME Forensics (12 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Company Info | `sme/company-info.md` | ✅ |
| Promoter Forensics | `sme/promoter-forensics.md` | ✅ |
| Financial Health | `sme/financial-health.md` | ✅ |
| On-Ground Research | `sme/on-ground-research.md` | ✅ |
| Management Compensation | `sme/mgmt-compensation.md` | ✅ |
| Board Structure | `sme/board-structure.md` | ✅ |
| Assess Auditor | `sme/assess-auditor.md` | ✅ |
| Customer Concentration | `sme/customer-concentration.md` | ✅ |
| Investment Checklist | `sme/investment-checklist.md` | ✅ |
| Cost Breakup | `sme/cost-breakup.md` | ✅ |
| WC Breakup | `sme/wc-breakup.md` | ✅ |
| Other Forensics | `sme/other-forensics.md` | ✅ |

### Tab 10: Downsides & Exit Triggers (3 specs)
| Tool | Spec File | Status |
|------|-----------|--------|
| Key Events | `downsides/key-events.md` | ✅ |
| Hedging Mechanism | `downsides/hedging-mechanism.md` | ✅ |
| Forensic Analysis | `downsides/forensic-analysis.md` | ✅ |

---

## ⚙️ Core Calculation Engines (18 specs — ALL COMPLETE)

| Engine | Spec File | Golden Vectors | Status |
|--------|-----------|----------------|--------|
| DCF Valuation | `engines/dcf-engine.md` | 6 | ✅ |
| Relative Valuation | `engines/relative-engine.md` | 4 | ✅ |
| SOTP Valuation | `engines/sotp-engine.md` | 3 | ✅ |
| Banking P/B-ROE | `engines/banking-engine.md` | 3 | ✅ |
| Excess Return | `engines/excess-return-engine.md` | 3 | ✅ |
| Beneish M-Score | `engines/beneish-engine.md` | 3 | ✅ |
| Altman Z-Score | `engines/altman-engine.md` | 3 | ✅ |
| Piotroski F-Score | `engines/piotroski-engine.md` | 3 | ✅ |
| Portfolio Analytics | `engines/portfolio-engine.md` | 4 | ✅ |
| Screening Engine | `engines/screening-engine.md` | 4 | ✅ |
| Revenue Projection | `engines/revenue-projection-engine.md` | 3 | ✅ |
| Corporate Actions | `engines/corporate-actions-engine.md` | 2 | ✅ |
| Turnaround Indicator | `engines/turnaround-engine.md` | 2 | ✅ |
| Hedging Mechanism | `engines/hedging-engine.md` | 2 | ✅ |
| Ratio Analysis | `engines/ratio-analysis-engine.md` | 4 | ✅ |
| Common Size | `engines/common-size-engine.md` | 2 | ✅ |
| Risk Score | `engines/risk-score-engine.md` | 2 | ✅ |
| Concall Consistency | `engines/concall-consistency-engine.md` | 2 | ✅ |

---

## 📋 Other Pages — Specs Created

| Page | Spec File | Status |
|------|-----------|--------|
| Macro Page | `macro-page/market-metrics.md` | ✅ |
| Macro Page | `macro-page/macro-dashboard.md` | ✅ |
| Portfolio Management | `portfolio-management/portfolio-dashboard.md` | ✅ |
| Portfolio Management | `portfolio-management/capital-gains-import.md` | ✅ |
| Portfolio Management | `portfolio-management/statement-reconciliation.md` | ✅ |
| Portfolio Management | `portfolio-management/auto-quality-checks.md` | ✅ |
| Portfolio Management | `portfolio-management/corporate-actions-handler.md` | ✅ |
| Portfolio Management | `portfolio-management/performance-metrics.md` | ✅ |
| Portfolio Management | `portfolio-management/risk-metrics.md` | ✅ |
| Portfolio Management | `portfolio-management/construction-diversification.md` | ✅ |
| Portfolio Management | `portfolio-management/valuation-metrics.md` | ✅ |
| Portfolio Management | `portfolio-management/fundamentals-quality.md` | ✅ |
| Portfolio Management | `portfolio-management/current-holdings.md` | ✅ |
| Portfolio Management | `portfolio-management/trade-history.md` | ✅ |
| Portfolio Management | `portfolio-management/portfolio-risk.md` | ✅ |
| Portfolio Management | `portfolio-management/event-risk-monitor.md` | ✅ |
| Portfolio Management | `portfolio-management/liquidity-risk.md` | ✅ |
| Portfolio Management | `portfolio-management/valuation-risk.md` | ✅ |
| Generate Ideas | `generate-ideas/idea-generation.md` | ✅ |
| Generate Ideas | `generate-ideas/screening.md` | ✅ |
| Watchlist | `watchlist/watchlist.md` | ✅ |
| Watchlist | `watchlist/watchlist-manager.md` | ✅ |
| Industry Page | `industry-page/industry-analysis.md` | ✅ |
| Industry Page | `industry-page/demand.md` | ✅ |
| Industry Page | `industry-page/supply.md` | ✅ |
| Industry Page | `industry-page/risk.md` | ✅ |
| Industry Page | `industry-page/regulations.md` | ✅ |
| Industry Page | `industry-page/demand-drivers.md` | ✅ |
| Industry Page | `industry-page/cost-drivers.md` | ✅ |
| Industry Page | `industry-page/cost-comparison.md` | ✅ |
| Industry Page | `industry-page/companies-table.md` | ✅ |
| Industry Page | `industry-page/industry-aggregate.md` | ✅ |
| Industry Page | `industry-page/supply-chain-mapper.md` | ✅ |
| Document AI | `document-ai/document-ai.md` | ✅ |
| Document AI | `document-ai/ai-assistant.md` | ✅ |
| Document AI | `document-ai/smart-summarizer.md` | ✅ |
| Document AI | `document-ai/key-data-extractor.md` | ✅ |
| GRWTH Pipeline | `grwth/grwth-pipeline.md` | ✅ (Design) |
| Weigh Decisions | `weigh-decisions/portfolio-fit-check.md` | ✅ |
| Weigh Decisions | `weigh-decisions/conviction-sizing.md` | ✅ |
| Weigh Decisions | `weigh-decisions/decision-journal.md` | ✅ |
| Weigh Decisions | `weigh-decisions/scenario-analysis.md` | ✅ |
| Weigh Decisions | `weigh-decisions/reverse-dcf.md` | ✅ |
| Weigh Decisions | `weigh-decisions/weigh-decisions.md` | ✅ |
| Tasks & Time | `tasks-time/todo-tracker.md` | ✅ |
| Tasks & Time | `tasks-time/time-tracker.md` | ✅ |
| Tasks & Time | `tasks-time/tasks-time-tracker.md` | ✅ |
| Additional Tools | `additional-tools/ui-primitives.md` | ✅ |
| Additional Tools | `additional-tools/simple-text-box.md` | ✅ |
| Additional Tools | `additional-tools/multi-text-box.md` | ✅ |
| Additional Tools | `additional-tools/filtered-table.md` | ✅ |

---

## 🔗 Shared Types & Utilities

| File | Purpose |
|------|---------|
| `specs/_TEMPLATE.md` | Spec template |
| `specs/shared/types.ts` | TypeScript interfaces for all tools |
| `specs/shared/python-types.py` | Python dataclasses for engines |
| `specs/shared/data-contracts.md` | API contracts between frontend/backend |
| `specs/shared/test-standards.md` | Testing standards & golden vector format |

---

## 📊 Tracker Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Spec complete, implementation done, tests passing |
| 🔄 | In Progress — Work actively underway |
| ⏳ | Not Started — Spec may exist but no implementation begun |
| 📝 | Spec being written |
| ❌ | Blocked — External dependency or clarification needed |
| 🔄 Design | Design phase (not yet specced) |

---

## 🚀 Quick Navigation

- [Company Page Overview](#company-page--10-tabs-59-specs)
- [Core Engines](#-core-calculation-engines-18-specs--all-complete)
- [Portfolio Management](#portfolio-management)
- [Industry Page](#industry-page)
- [Document AI](#document-ai)
- [All Specs by Status](#-tool-coverage-summary)

---

*Generated from Internal Portal tools-3.xlsx | 12 sheets | 100+ tools | 37 categories | 128 specs created*