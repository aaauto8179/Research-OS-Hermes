# Research OS - Master Specification Index

**Version:** 1.0.0  
**Last Updated:** 2025-10-31  
**Source:** Internal Portal tools-3.xlsx (12 sheets, 100+ tools)  
**Status:** 24 specs created (18 engines + 6 company page), 76 remaining

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
└── shared/                          # Shared Types & Utilities
```

---

## 🎯 Tool Coverage Summary

| Section | Sheets | Categories | Tools | Specs Created |
|---------|--------|------------|-------|---------------|
| Company Page | 1 | 18 | 60+ | **6** |
| Macro Page | 1 | 1 | 2 | 0 |
| Portfolio Management | 1 | 8 | 15+ | 0 |
| Generate Ideas | 1 | 1 | 1 | 0 |
| Watchlist | 1 | 1 | 1 | 0 |
| Industry Page | 1 | 3 | 11 | 0 |
| Document AI | 1 | 1 | 2 | 0 |
| GRWTH | 1 | 0 | 0 | 0 (to design) |
| Weigh Decisions | 1 | 1 | 5 | 0 |
| Tasks & Time | 1 | 1 | 2 | 0 |
| Additional Tools | 1 | 1 | 3 | 0 |
| **Core Engines** | - | - | 18 | **18** |
| **Total** | **12** | **37** | **~100** | **24** |

---

## 📋 Company Page — 10 Tabs (60+ Tools)

### Tab 1: Overview & Decision (`specs/company-page/overview/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Overview | About the Company | — | ⏳ |
| Overview | Entry Rationale | — | ⏳ |
| Overview | Exit Rationale | — | ⏳ |
| Thesis Snapshot | Thesis Snapshot | `thesis-snapshot.md` | ✅ |
| Decision Terminal | Decision Terminal | `decision-terminal.md` | ✅ |
| Tracking | Tracking Table | — | ⏳ |
| Latest Changes | Latest Changes | — | ⏳ |

### Tab 2: Management & Execution (`specs/company-page/management/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Management Background | Management Background | — | ⏳ |
| Shareholding Pattern | Shareholding Pattern | — | ⏳ |
| Track Record | Track Record | — | ⏳ |
| Concall Consistency | Concall Consistency Tracker | `concall-consistency.md` | ✅ |
| Capital Allocation | Capital Allocation | — | ⏳ |
| Red Flags | Red Flags | — | ⏳ |

### Tab 3: Story & Moats (`specs/company-page/story/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Business Model | Business Model | `business-model.md` | ✅ |
| Economic Moat | Economic Moat | — | ⏳ |
| Current Growth Drivers | Current Growth Drivers | — | ⏳ |
| Future Growth Drivers | Future Growth Drivers | — | ⏳ |

### Tab 4: Industry Analysis (`specs/company-page/industry/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Market Sizing | Market Sizing | — | ⏳ |
| Competitors | Competitors Table | — | ⏳ |
| Industry Value Chain | Value Chain Canvas | — | ⏳ |

### Tab 5: Risk Scoring (`specs/company-page/risk/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Business Risk | Business Risk | — | ⏳ |
| Financial Risk | Financial Risk | — | ⏳ |
| Valuation Risk | Valuation Risk | — | ⏳ |
| Governance Risk | Governance Risk | — | ⏳ |
| Macro Risk | Macro Risk | — | ⏳ |
| Industry Red Flags | Industry Red Flags | — | ⏳ |
| Risk Score | Risk Score Calculator | — | ⏳ |
| Key Fragility Points | Key Fragility Points | — | ⏳ |
| Legal Checks | Legal Checks & Contingent Liability | — | ⏳ |

### Tab 6: Analysis & Concall (`specs/company-page/analysis/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Concall Tracker | Concall Tracker | — | ⏳ |
| Exit Tool | Exit Checklist | — | ⏳ |
| Ratio Analysis | Ratio Analysis (UI) | `ratio-analysis.md` | ✅ |
| Recent Events | Recent Events Tracker | — | ⏳ |
| Turnaround Indicator | Turnaround Indicator (UI) | — | ⏳ |

### Tab 7: Valuation Suite (`specs/company-page/valuation/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Valuation Philosophy | Valuation Philosophy | — | ⏳ |
| DCF | DCF Valuation (UI) | `dcf-valuation.md` | ✅ |
| Relative Company Model | Relative Valuation (UI) | — | ⏳ |
| SOTP | SOTP Valuation (UI) | — | ⏳ |
| Banking (P/B, ROE) | Banking Valuation (UI) | — | ⏳ |
| Excess Return Model | Excess Return (UI) | — | ⏳ |

### Tab 8: Financial Statements (`specs/company-page/financials/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Revenue Projection | Revenue Projection (UI) | — | ⏳ |
| Segment Breakup | Segment Breakup | — | ⏳ |
| Financial Statements | Financial Statements Viewer | — | ⏳ |
| Common Size Statement | Common Size Statement (UI) | — | ⏳ |

### Tab 9: SME Forensics (`specs/company-page/sme/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Company Info | Company Info | — | ⏳ |
| Promoter & Governance Forensics | Promoter Forensics | — | ⏳ |
| Financial Statement Health | Financial Health Templates | — | ⏳ |
| Other Forensics | Other Forensics | — | ⏳ |
| Possible On-Ground Research | On-Ground Research | — | ⏳ |
| Corporate Governance | Management Compensation | — | ⏳ |
| Corporate Governance | Board Structure | — | ⏳ |
| Assess Auditor | Assess Auditor | — | ⏳ |
| Customer Concentration | Customer Concentration | — | ⏳ |
| Checklist | Investment Checklist | — | ⏳ |
| Cost Breakup | Cost Breakup (via Common Size) | — | ⏳ |
| WC Breakup | WC Breakup | — | ⏳ |

### Tab 10: Downsides & Exit Triggers (`specs/company-page/downsides/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Key Events | Key Events Tracker | — | ⏳ |
| Hedging Mechanism | Hedging Mechanism (UI) | `hedging-mechanism.md` | ✅ |
| Forensic Analysis | Forensic Analysis | — | ⏳ |

---

## 📋 Other Pages — Remaining Sheets

### Macro Page (`specs/macro-page/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| Economic Indicators | — | ⏳ |
| Market Metrics | — | ⏳ |

### Portfolio Management (`specs/portfolio-management/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Portfolio Dashboard | Key Portfolio Stats | — | ⏳ |
| Portfolio Dashboard | Portfolio Returns | — | ⏳ |
| Import | Capital Gains Import | — | ⏳ |
| Import | Normal Ledger Import | — | ⏳ |
| Import | MTF Ledger Import | — | ⏳ |
| Import | Holding Statements Import | — | ⏳ |
| Import | Transaction Statements Import | — | ⏳ |
| Reconciliation | Statement Reconciliation | — | ⏳ |
| Reconciliation | Capital Gains Reconciliation | — | ⏳ |
| Data Quality | Auto Quality Checks (11 checks) | — | ⏳ |
| Corporate Actions | Corporate Actions Handler | — | ⏳ |
| Portfolio Metrics | Performance Metrics | — | ⏳ |
| Portfolio Metrics | Risk Metrics | — | ⏳ |
| Portfolio Metrics | Construction & Diversification | — | ⏳ |
| Portfolio Metrics | Valuation Metrics | — | ⏳ |
| Portfolio Metrics | Fundamentals & Quality | — | ⏳ |
| Current Portfolio | Current Holdings Table | — | ⏳ |
| Trade History | Trade History Table | — | ⏳ |
| Risk | Portfolio Risk Aggregation | — | ⏳ |
| Risk | Event Risk Monitor | — | ⏳ |
| Risk | Liquidity Risk | — | ⏳ |
| Risk | Valuation Risk | — | ⏳ |

### Generate Ideas (`specs/generate-ideas/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| Idea Generation Table | — | ⏳ |

### Watchlist (`specs/watchlist/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| Watchlist Manager | — | ⏳ |

### Industry Page (`specs/industry-page/`)
| Category | Tool | Spec File | Status |
|----------|------|-----------|--------|
| Demand/Supply/Risk/Regs | Demand | — | ⏳ |
| Demand/Supply/Risk/Regs | Supply | — | ⏳ |
| Demand/Supply/Risk/Regs | Risk | — | ⏳ |
| Demand/Supply/Risk/Regs | Regulations | — | ⏳ |
| Drivers/Comparison | Demand Drivers | — | ⏳ |
| Drivers/Comparison | Cost Drivers | — | ⏳ |
| Drivers/Comparison | Cost Comparison | — | ⏳ |
| Aggregate/Mapping | Companies Table | — | ⏳ |
| Aggregate/Mapping | Industry Aggregate | — | ⏳ |
| Aggregate/Mapping | Supply Chain Mapper | — | ⏳ |
| Aggregate/Mapping | Market Sizing | — | ⏳ |

### Document AI (`specs/document-ai/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| Document AI | — | ⏳ |
| AI Assistant | — | ⏳ |

### GRWTH (`specs/grwth/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| *(Empty sheet - needs design)* | `grwth-pipeline.md` | 🔄 Design Phase |

### Weigh Decisions (`specs/weigh-decisions/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| Portfolio Fit Check | — | ⏳ |
| Risk Correlation Assessment | — | ⏳ |
| Valuation & Allocation Discipline | — | ⏳ |
| Behavioural Audit | — | ⏳ |
| Final Decision Summary | — | ⏳ |

### Tasks & Time (`specs/tasks-time/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| To-Do Tracker (Kanban) | — | ⏳ |
| Time Tracker | — | ⏳ |

### Additional Tools (`specs/additional-tools/`)
| Tool | Spec File | Status |
|------|-----------|--------|
| Simple Text Box | — | ⏳ |
| Multi Text Box | — | ⏳ |
| Table with Filters | — | ⏳ |

---

## ⚙️ Core Calculation Engines (`specs/engines/`)

| Engine | Spec File | Status | Golden Vectors |
|--------|-----------|--------|----------------|
| DCF Valuation | `dcf-engine.md` | ✅ | 6 vectors |
| Relative Valuation | `relative-engine.md` | ✅ | 4 vectors |
| SOTP Valuation | `sotp-engine.md` | ✅ | 3 vectors |
| Banking P/B-ROE | `banking-engine.md` | ✅ | 3 vectors |
| Excess Return | `excess-return-engine.md` | ✅ | 3 vectors |
| Beneish M-Score | `beneish-engine.md` | ✅ | 3 vectors |
| Altman Z-Score | `altman-engine.md` | ✅ | 3 vectors |
| Piotroski F-Score | `piotroski-engine.md` | ✅ | 3 vectors |
| Portfolio Analytics | `portfolio-engine.md` | ✅ | 4 vectors |
| Screening Engine | `screening-engine.md` | ✅ | 4 vectors |
| Revenue Projection | `revenue-projection-engine.md` | ✅ | 3 vectors |
| Corporate Actions | `corporate-actions-engine.md` | ✅ | 2 vectors |
| Turnaround Indicator | `turnaround-engine.md` | ✅ | 2 vectors |
| Hedging Mechanism | `hedging-engine.md` | ✅ | 2 vectors |
| Ratio Analysis | `ratio-analysis-engine.md` | ✅ | 4 vectors |
| Common Size | `common-size-engine.md` | ✅ | 2 vectors |
| Risk Score | `risk-score-engine.md` | ✅ | 2 vectors |
| Concall Consistency | `concall-consistency-engine.md` | ✅ | 2 vectors |
| **Total** | **18 engines** | **✅** | **~56 vectors** |

---

## 🔗 Shared Types & Utilities (`specs/shared/`)

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces for all tools |
| `python-types.py` | Python dataclasses for engines |
| `data-contracts.md` | API contracts between frontend/backend |
| `test-standards.md` | Testing standards & golden vector format |

---

## 📊 Tracker Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Spec complete, implementation done, tests passing |
| 🔄 | Spec complete, implementation in progress |
| ⏳ | Spec drafted, implementation not started |
| 📝 | Spec being written |
| ❌ | Blocked / Needs clarification |
| 🔄 Design | Design phase (not yet specced) |

---

## 🚀 Quick Navigation

- [Company Page Overview](#tab-1-overview--decision-specscompany-pageoverview)
- [Core Engines](#-core-calculation-engines-specsengines)
- [Portfolio Management](#portfolio-management-specsportfolio-management)
- [Industry Page](#industry-page-specsindustry-page)
- [All Specs by Status](#-tool-coverage-summary)

---

*Generated from Internal Portal tools-3.xlsx | 12 sheets | 100+ tools | 37 categories*