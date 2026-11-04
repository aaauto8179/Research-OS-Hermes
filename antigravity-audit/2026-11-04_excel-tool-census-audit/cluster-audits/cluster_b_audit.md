# Research OS — Cluster B Comprehensive Codebase Audit Report

**Auditor:** Explorer 2 (Cluster B Audit Specialist)  
**Date:** 2026-11-04  
**Scope:** Cluster B Subsystems (Risk, SME, Corporate Governance, Others, Weigh Decisions, UI Primitives — 27 Tools Total)  
**Assigned Subsystems:**
- `research-os-frontend` (`src/components/`, `src/components/widgets/`, `src/components/ui/`, `src/app/`, `src/lib/`, `src/stores/`, `src/types/`)
- `math-engine` (`api/main.py`, `src/math_engine/`, `tests/`)
- `data-ingestion` (`api/main.py`, `src/data_ingestion/`, `tests/`)
- `postgres` schemas and migrations (`postgres/init/01_schema.sql`)

---

## 1. Executive Summary & Audit Matrix

This audit evaluated all 27 tools assigned to Cluster B across the repository codebase. Every single tool was verified through direct code inspection of the actual implementation rather than file names or component names alone.

### Summary Metrics
| Category | Total Tools | Built | Partial/Stub | Pending |
| :--- | :---: | :---: | :---: | :---: |
| **1. Risk** | 9 | 0 | 2 | 7 |
| **2. SME** | 5 | 0 | 0 | 5 |
| **3. Corporate Governance** | 3 | 0 | 1 | 2 |
| **4. Others** | 2 | 0 | 1 | 1 |
| **5. Decision / Weigh Decisions** | 5 | 0 | 5 | 0 |
| **6. UI Primitives** | 3 | 2 | 1 | 0 |
| **TOTAL** | **27** | **2 (7.4%)** | **10 (37.0%)** | **15 (55.6%)** |

### Key Systemic Findings
1. **Severe Specification Divergence in Risk Score:** The Excel specification calls for a subjective risk scoring tool scored out of 10 for each qualitative risk based on impact level, duration, and SME status. The implemented `RiskScoreEngine` in `math-engine` (`math-engine/src/math_engine/__init__.py:2080-2170`) instead calculates a quantitative financial governance score based on SEBI ratios (promoter pledge, related party transactions, auditor type, leverage, and liquidity).
2. **Broken Tab Navigation in Portfolio Fit Check:** `PortfolioFitCheck.tsx` defines mock local `TabsList` and `TabsTrigger` components (`research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx:273-287`) where `TabsTrigger` lacks an `onClick` event listener. As a result, users cannot switch tabs ("Analyze Fit", "Candidates", "Sector Analysis") inside the widget.
3. **Synthetic / Mock-Driven Decision Suite:** The entire Weigh Decisions tab in `research-os-frontend/src/app/weigh/page.tsx` relies on hardcoded static data or client-side pseudorandom generators (`Math.random()` at lines 327 and 359 for correlation and risk contributions). Behavioral audit buttons lack `onClick` event handlers and textboxes for justifications.
4. **Specification Misinterpretation in Multi Text Box:** Excel explicitly demands "A text box with option for multiple rows and columns of text, with adjustable column width." The codebase implemented a multi-note manager with a sidebar list and title/tags (`research-os-frontend/src/components/widgets/MultiTextBox.tsx`) rather than a resizable text grid.
5. **Decoupled Database Layer:** Although PostgreSQL schemas (`postgres/init/01_schema.sql:198-294`) define `company_risk`, `company_sme`, and `weigh_decisions` tables, and TypeScript types exist (`research-os-frontend/src/lib/types.ts:136-218`), the Supabase client (`research-os-frontend/src/lib/supabase.ts`) is never queried by any component in the frontend.

---

## 2. Category 1: Risk (9 Tools)

### Tool 1: Business risk
- **Excel Name:** Business risk
- **Excel Category:** Risk
- **Excel Description:** A text box to record key sources of the particular risk with an option to go into a secondary page to record our assumptions for the points mentioned.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/business-risk.md:1-117`
  - DB Schema: `postgres/init/01_schema.sql:202` (`business_risk JSONB DEFAULT '[]' -- [{risk, assumptions, score, impact, duration}]`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:139` (`business_risk?: any[]`)
  - Route Loading: `research-os-frontend/src/app/company/[symbol]/page.tsx:14` (Risk tab loads `["risk-assessment", "technical-analysis", "risk-score", "hedging-mechanism"]`; no business risk widget exists)
- **Production Readiness Notes:**
  - Component is unbuilt. No UI exists for logging key risk sources or opening a secondary assumption drawer.
  - No Document AI pipeline exists in `data-ingestion/src/data_ingestion/` to extract business risk disclosures from annual report Section "Risk and Concerns" (CARO/MDA).
- **Feasibility & Architectural Prerequisites:**
  - Create `BusinessRisk.tsx` with risk card list and slide-over assumption modal.
  - Implement RAG extraction prompt in `data-ingestion` targeting the MDA section of annual reports.
  - Expose CRUD endpoint `/api/company/:symbol/risk/business` connected to `company_risk.business_risk`.

---

### Tool 2: Financial risk
- **Excel Name:** Financial risk
- **Excel Category:** Risk
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/financial-risk.md:1-142`
  - DB Schema: `postgres/init/01_schema.sql:203` (`financial_risk JSONB DEFAULT '[]'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:140` (`financial_risk?: any[]`)
- **Production Readiness Notes:**
  - Although `RatioAnalysis.tsx` and `RiskScore.tsx` compute isolated financial metrics (e.g. debt/equity, interest coverage), the dedicated Financial Risk tool specified in `financial-risk.md` (debt maturity schedule table FY25-FY28+, liquidity ratios, cash flow volatility, covenant compliance status) has no dedicated component or API route.
- **Feasibility & Architectural Prerequisites:**
  - Create `FinancialRisk.tsx` component with leverage ratios and a debt maturity repayment schedule.
  - Build parser in `data-ingestion` for Schedule III Long-Term Borrowings notes (repayment terms, interest rates).
  - DB schema supports `company_risk.financial_risk`.

---

### Tool 3: Valuation risk
- **Excel Name:** Valuation risk
- **Excel Category:** Risk
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/valuation-risk.md:1-141`
  - DB Schema: `postgres/init/01_schema.sql:204` (`valuation_risk JSONB DEFAULT '[]'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:141` (`valuation_risk?: any[]`)
- **Production Readiness Notes:**
  - Component is unbuilt. `ValuationSummary.tsx` exists on the overview tab, but valuation risk analysis (P/E vs 5-year history percentiles, peer valuation spread, margin of safety distribution, Monte Carlo probability of >15% loss) is not implemented.
- **Feasibility & Architectural Prerequisites:**
  - Implement historical valuation multiple percentile calculations in `math-engine`.
  - Build `ValuationRisk.tsx` widget displaying historical percentile bands and margin of safety sensitivity.

---

### Tool 4: Governance risk
- **Excel Name:** Governance risk
- **Excel Category:** Risk
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/governance-risk.md:1-127`
  - Math Engine Scoring: `math-engine/src/math_engine/__init__.py:2083-2109` (`_promoter_pledge_score`, `_rpt_score`, `_auditor_score`)
  - Backend API: `math-engine/api/main.py:182-189` (`@app.post("/risk-score")`)
  - Frontend Display: `research-os-frontend/src/components/widgets/RiskScore.tsx:22-36, 133-162` (renders promoter pledge, related party txns, auditor quality bars)
  - DB Schema: `postgres/init/01_schema.sql:205` (`governance_risk JSONB DEFAULT '[]'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:142` (`governance_risk?: any[]`)
- **Production Readiness Notes:**
  - Governance scoring logic is partially implemented inside `RiskScoreEngine` in Python and visualised in `RiskScore.tsx`.
  - However, the comprehensive Governance Risk scorecard detailed in `governance-risk.md` (evaluating board independence %, whistleblower mechanism status, shareholder rights, and detailed related party transaction lists) is not built.
  * `RiskScore.tsx` sends hardcoded mock values (`MOCK_INPUT`) to `/api/math-engine/risk-score`.
- **Feasibility & Architectural Prerequisites:**
  - Extract SEBI SAST Reg 31 encumbrance filings and MCA21 director disclosures.
  - Implement standalone `GovernanceRisk.tsx` component or expand `RiskScore.tsx`.

---

### Tool 5: Macro risk
- **Excel Name:** Macro risk
- **Excel Category:** Risk
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/macro-risk.md:1-129`
  - DB Schema: `postgres/init/01_schema.sql:206` (`macro_risk JSONB DEFAULT '[]'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:143` (`macro_risk?: any[]`)
  - Standalone Macro: `research-os-frontend/src/components/widgets/MacroDashboard.tsx:1-250` exists for the `/macro` page.
- **Production Readiness Notes:**
  - No company-specific Macro Risk sensitivity tool exists. While global macro metrics exist at the system level, the company-specific factor beta (crude oil sensitivity, USD/INR impact, interest rate change $\Delta PBT / \Delta 100\text{bps}$) and economic cycle positioning specified in `macro-risk.md` are unbuilt.
- **Feasibility & Architectural Prerequisites:**
  - Build linear regression sensitivity engine in `math-engine` (company EBITDA sensitivity vs commodity/macro indices).
  - Create `CompanyMacroRisk.tsx` widget on the company risk tab.

---

### Tool 6: Industry Red Flags
- **Excel Name:** Industry Red Flags
- **Excel Category:** Risk
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/industry-red-flags.md:1-119`
  - DB Schema: `postgres/init/01_schema.sql:207` (`industry_red_flags JSONB DEFAULT '[]'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:144` (`industry_red_flags?: any[]`)
  - Sector Table Schema: `postgres/init/01_schema.sql:466` (`industries.risk_factors JSONB DEFAULT '[]'`)
- **Production Readiness Notes:**
  - Unbuilt. No component exists for displaying industry structural headwinds, regulatory overhangs, or cyclical peak indicators on the company page.
- **Feasibility & Architectural Prerequisites:**
  - Create `IndustryRedFlags.tsx` component linking the company's sector code to `industries.risk_factors`.

---

### Tool 7: Risk score
- **Excel Name:** Risk score
- **Excel Category:** Risk
- **Excel Description:** Each risk will have an option to add a score out of 10 to measure risk based on subjective criterias like impact level, SME/ non SME, duration etc
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/risk-score.md:1-150`
  - Math Engine Logic: `math-engine/src/math_engine/__init__.py:2058-2170` (`RiskScoreInputs`, `RiskScoreOutputs`, `RiskScoreEngine`)
  - Engine Registry: `math-engine/src/math_engine/__init__.py:2512` (`'risk_score': RiskScoreEngine()`)
  - Backend API: `math-engine/api/main.py:182-189` (`@app.post("/risk-score")`)
  - Frontend Component: `research-os-frontend/src/components/widgets/RiskScore.tsx:1-185`
  - Widget Registry: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:35, 106`
  - Tab Mounting: `research-os-frontend/src/app/company/[symbol]/page.tsx:14`
  - DB Schema: `postgres/init/01_schema.sql:208` (`risk_scores JSONB DEFAULT '{}'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:145` (`risk_scores?: Record<string, number>`)
- **Production Readiness Notes:**
  - Significant Architectural Discrepancy: The Excel requirement explicitly mandates an interface where individual risk categories are scored out of 10 based on subjective criteria (impact level, SME/non-SME, duration). The codebase instead implemented an algorithmic quantitative scoring engine in Python based on financial leverage and SEBI ratios.
  - Hardcoded Mock Data: `RiskScore.tsx` lines 12-20 submit hardcoded `MOCK_INPUT` (`debt_ebitda: 1.8`, `rpt_pct_of_turnover: 3.2`, `auditor_type: "BIG4"`) on every load.
  - Zero Automated Tests: `math-engine/tests/test_math_engine.py` contains 36 tests covering DCF, Altman, Beneish, etc., but contains zero test cases for `RiskScoreEngine`.
- **Feasibility & Architectural Prerequisites:**
  - Reconcile specification: either support dual mode (qualitative 1-10 slider inputs for business/macro risks combined with quantitative forensic ratios) or update specifications to document the shift to SEBI LODR ratio transfer functions.
  - Wire component to database instead of static `MOCK_INPUT`.

---

### Tool 8: Key Fragility Points
- **Excel Name:** Key Fragility Points
- **Excel Category:** Risk
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/key-fragility-points.md:1-143`
  - DB Schema: `postgres/init/01_schema.sql:209` (`key_fragility_points JSONB DEFAULT '[]'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:146` (`key_fragility_points?: any[]`)
- **Production Readiness Notes:**
  - Unbuilt. Single-point-of-failure analysis (single customer >20%, single supplier >30%, single plant capacity >80%, key person dependency) is entirely unimplemented in frontend components and backend services.
- **Feasibility & Architectural Prerequisites:**
  - Build `KeyFragilityPoints.tsx` widget with fragility type tags (Customer, Supplier, Plant, Key Person, Regulatory License).
  - Ingestion pipeline from concall transcripts and annual reports.

---

### Tool 9: Legal Checks and Contingent Liability
- **Excel Name:** Legal Checks and Contingent Liability
- **Excel Category:** Risk
- **Excel Description:** Should Be able to pull relevant data from statements
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/risk/legal-checks.md:1-152`
  - DB Schema: `postgres/init/01_schema.sql:210` (`legal_checks JSONB DEFAULT '[]' -- [{issue, status, contingency, source_doc_id}]`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:147` (`legal_checks?: any[]`)
- **Production Readiness Notes:**
  - Unbuilt. No component exists for displaying legal disputes, contingent tax demands, or CARO 2020 clause (vii) disputed statutory dues.
  - Data Ingestion lacks parsers targeting Contingent Liabilities (Ind AS 37) notes.
- **Feasibility & Architectural Prerequisites:**
  - Implement extraction regex/LLM prompt in `data-ingestion/src/data_ingestion/extractors/` targeting Note 37/38 of annual reports.
  - Build `LegalChecks.tsx` widget calculating total exposure vs provided amounts.

---

## 3. Category 2: SME (5 Tools)

### Tool 10: Company Info
- **Excel Name:** Company Info
- **Excel Category:** SME
- **Excel Description:** IR company, expos in which this company takes part will come here
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/company-info.md:1-149`
  - DB Schema: `postgres/init/01_schema.sql:252` (`company_info JSONB DEFAULT '{}' -- IR contacts, expos, etc.`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:183` (`company_info?: Record<string, any>`)
  - SME Tab Content: `research-os-frontend/src/app/company/[symbol]/page.tsx:15` (loads `["ownership-analysis", "custom-text", "turnaround-indicator"]`; Company Info is missing)
- **Production Readiness Notes:**
  - Unbuilt. No component exists for displaying SME-specific IR contacts, investor presentation expos, credit rating histories, or market maker information.
- **Feasibility & Architectural Prerequisites:**
  - Create `SMECompanyInfo.tsx` widget.
  - Ingest exchange announcements on investor conference meets.

---

### Tool 11: Promoter & governance forensics
- **Excel Name:** Promoter & governance forensics
- **Excel Category:** SME
- **Excel Description:** A tool with options listed such as board structure, compensation etc in a table format
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/promoter-forensics.md:1-153`
  - DB Schema: `postgres/init/01_schema.sql:253` (`promoter_forensics JSONB DEFAULT '{}' -- board structure, compensation, etc.`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:184` (`promoter_forensics?: Record<string, any>`)
- **Production Readiness Notes:**
  - Unbuilt. Tabular promoter forensics covering holding company structures, subsidiary cross-holdings, corporate guarantees, and succession planning has no frontend component.
- **Feasibility & Architectural Prerequisites:**
  - Create `PromoterForensics.tsx` component with promoter entity hierarchy and cross-holding table.

---

### Tool 12: Financial statement health
- **Excel Name:** Financial statement health
- **Excel Category:** SME
- **Excel Description:** Pre made templates with customization option to choose the metrics needed for the analysis.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/financial-health.md:1-164`
  - DB Schema: `postgres/init/01_schema.sql:254` (`fs_health JSONB DEFAULT '{}' -- template-based metrics`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:185` (`fs_health?: Record<string, any>`)
- **Production Readiness Notes:**
  - Unbuilt. While general ratio tools exist (`RatioAnalysis.tsx`, `CommonSize.tsx`), the customizable template system specified in `financial-health.md` (Quality of Earnings template, Balance Sheet Strength template, Cash Flow Quality template with custom metric toggles) does not exist.
- **Feasibility & Architectural Prerequisites:**
  - Build `FinancialStatementHealth.tsx` component with template selector dropdown and user-customizable metric row toggles.

---

### Tool 13: Other forensics
- **Excel Name:** Other forensics
- **Excel Category:** SME
- **Excel Description:** [Empty in Excel]
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/other-forensics.md:1-177`
  - DB Schema: `postgres/init/01_schema.sql:255` (`other_forensics JSONB DEFAULT '{}'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:186` (`other_forensics?: Record<string, any>`)
  - Related Widget: `research-os-frontend/src/components/widgets/ForensicFlags.tsx:1-347` (aggregates Beneish, Altman, Piotroski, but does not implement the SME forensic checklist items)
- **Production Readiness Notes:**
  - The 10-item forensic checklist specified in `other-forensics.md` (off-balance sheet items, related party transaction deep dive, Section 186 loans, CWIP aging schedule, insider trading patterns) is completely unbuilt.
- **Feasibility & Architectural Prerequisites:**
  - Build `OtherForensics.tsx` checklist widget with drilldown drawers for related party and CWIP disclosures.

---

### Tool 14: Possible on ground research
- **Excel Name:** Possible on ground research
- **Excel Category:** SME
- **Excel Description:** Date wise proper notes interation with different people
- **Data Source:** Manual
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/on-ground-research.md:1-125`
  - DB Schema: `postgres/init/01_schema.sql:256` (`on_ground_research JSONB DEFAULT '[]' -- [{date, person, interaction, notes}]`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:187` (`on_ground_research?: any[]`)
- **Production Readiness Notes:**
  - Unbuilt. `CustomText.tsx` is mounted on the SME tab as a generic note placeholder, but lacks date-wise entries, participant tagging, and interaction categories (channel check, dealer, factory, expert).
- **Feasibility & Architectural Prerequisites:**
  - Create `OnGroundResearch.tsx` timeline widget with date picker, category dropdown (Factory Visit, Dealer Check, Competitor Visit, Expert Interview), participant list, and findings textarea.
  - Wire CRUD actions to `company_sme.on_ground_research`.

---

## 4. Category 3: Corporate Governance (3 Tools)

### Tool 15: Management compensation & benefits
- **Excel Name:** Management compensation & benefits
- **Excel Category:** Corporate Governance
- **Excel Description:** A table with management names. The other columns will be compensation and number of times greater than median salary.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/mgmt-compensation.md:1-131`
  - DB Schema: `postgres/init/01_schema.sql:257` (`corporate_governance JSONB DEFAULT '{}' -- compensation, board structure, auditor`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:188` (`corporate_governance?: Record<string, any>`)
- **Production Readiness Notes:**
  - Unbuilt. No table exists displaying executive remuneration, fixed/variable breakdown, or the statutory Section 197 multiple of median employee salary.
- **Feasibility & Architectural Prerequisites:**
  - Parse Section 197 / Remuneration Report disclosures from annual reports.
  - Build `ManagementCompensation.tsx` table widget comparing executive remuneration to median salary and industry averages.

---

### Tool 16: Board structure
- **Excel Name:** Board structure
- **Excel Category:** Corporate Governance
- **Excel Description:** A tool with factors such as age, gender, educational qualifications etc listed down in rows, with dropdown next to them to select options - low diversified, medium, high
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/board-structure.md:1-164`
  - DB Schema: `postgres/init/01_schema.sql:257` (under `corporate_governance JSONB`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:188`
- **Production Readiness Notes:**
  - Unbuilt. The specific UI requested in Excel (factors like age, gender, educational qualifications in rows with diversification dropdown: low, medium, high) is not implemented in any component.
- **Feasibility & Architectural Prerequisites:**
  - Ingest Corporate Governance Report tables from annual reports.
  - Build `BoardStructure.tsx` widget with director rows, committee memberships, and diversification dropdowns.

---

### Tool 17: Assess Auditor
- **Excel Name:** Assess Auditor
- **Excel Category:** Corporate Governance
- **Excel Description:** [Empty in Excel]
- **Data Source:** [Empty in Excel]
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/assess-auditor.md:1-147`
  - Math Engine Scoring: `math-engine/src/math_engine/__init__.py:2101-2109` (`_auditor_score(auditor_type: str) -> float`)
  - DB Schema: `postgres/init/01_schema.sql:257` (under `corporate_governance JSONB`)
  - Frontend Representation: `research-os-frontend/src/components/widgets/RiskScore.tsx:25, 33` ("Auditor Quality" sub-bar)
- **Production Readiness Notes:**
  - Only the numerical scoring mapping (BIG4=0, TIER2=25, EMPHASIS=50, QUALIFIED=80, RESIGNED=100) exists in `math-engine`.
  - No dedicated auditor profile UI exists (auditor firm, partner tenure, rotation due date, audit vs non-audit fee ratio, ICAI peer review status, CARO qualifications).
- **Feasibility & Architectural Prerequisites:**
  - Parse Independent Auditor's Report notes from annual reports.
  - Create `AssessAuditor.tsx` widget showing fee structure trends, rotation schedules, and independence ratings.

---

## 5. Category 4: Others (2 Tools)

### Tool 18: Customer concentration
- **Excel Name:** Customer concentration
- **Excel Category:** Others
- **Excel Description:** A table type widget to record customer concentration with a dropdown to choose: top X customers and a column to enter %.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Pending`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/customer-concentration.md:1-145`
  - DB Schema: `postgres/init/01_schema.sql:258` (`customer_concentration JSONB DEFAULT '[]' -- [{customer, pct, top_x}]`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:189` (`customer_concentration?: any[]`)
- **Production Readiness Notes:**
  - Unbuilt. No customer concentration widget exists in the repository.
- **Feasibility & Architectural Prerequisites:**
  - Extract Ind AS 108 Operating Segments customer concentration disclosures (>10% revenue).
  - Build `CustomerConcentration.tsx` widget with Top 5 / Top 10 / Top 20 dropdown and Herfindahl-Hirschman Index (HHI) concentration calculation.

---

### Tool 19: Checklist
- **Excel Name:** Checklist
- **Excel Category:** Others
- **Excel Description:** A customisable tool with option to add any line items in rows with a tick box next to them. This will be used for initial screening.
- **Data Source:** Documents Upload, Document Ai
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/company-page/sme/investment-checklist.md:1-153`
  - Frontend Component: `research-os-frontend/src/components/widgets/Checklist.tsx:1-30`
  - Widget Registry: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:20, 98`
  - Store Definition: `research-os-frontend/src/lib/workspace-store.ts:241-249`
  - DB Schema: `postgres/init/01_schema.sql:259` (`screening_checklist JSONB DEFAULT '[]' -- [{item, checked, notes}]`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:190` (`screening_checklist?: any[]`)
- **Production Readiness Notes:**
  - Extreme Stub Implementation: `Checklist.tsx` hardcodes 6 static items (lines 4-11).
  - Non-functional UI: Checkboxes are read-only (`<Checkbox checked={item.checked} />` without `onChange` or state mutation).
  - Direct Specification Violation: The component provides no customization options — users cannot add rows, delete rows, or edit item labels, violating the explicit Excel requirement ("A customisable tool with option to add any line items in rows with a tick box next to them").
  - Zero persistence to database or localStorage.
- **Feasibility & Architectural Prerequisites:**
  - Refactor `Checklist.tsx` to maintain interactive state (`items`, `addItem`, `toggleItem`, `deleteItem`).
  - Connect to `company_sme.screening_checklist` via API or Supabase client.

---

## 6. Category 5: Decision / Weigh Decisions (5 Tools)

### Tool 20: Portfolio Fit check
- **Excel Name:** Portfolio Fit check
- **Excel Category:** Decision / Weigh Decisions
- **Excel Description:** Table that shows sector concentration auto-calculated using current portfolio weights, promoter overlap, etc in customisable format like table, small widgets etc
- **Data Source:** internal calculation
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/weigh-decisions/portfolio-fit-check.md:1-161`
  - Frontend Component: `research-os-frontend/src/components/widgets/PortfolioFitCheck.tsx:1-287`
  - Weigh Page Integration: `research-os-frontend/src/app/weigh/page.tsx:195-302` (renders `<PortfolioFitCheck />` and inline sector/promoter tables)
  - Widget Registry: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:62, 133`
  - DB Schema: `postgres/init/01_schema.sql:282` (`portfolio_fit JSONB DEFAULT '{}'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:206` (`portfolio_fit?: Record<string, any>`)
- **Production Readiness Notes:**
  - Broken Tab Navigation: Lines 273-287 define local mock `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` where `TabsTrigger` is a simple `<button>` with no `onClick` or `onValueChange` callback:
    ```tsx
    function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
      return <button className={className || "px-3 py-2 text-sm font-medium"}>{children}</button>;
    }
    ```
    Clicking "Analyze Fit", "Candidates", or "Sector Analysis" does nothing; the widget is locked to whatever tab was loaded.
  - Hardcoded Mock Data: Uses static `MOCK_HOLDINGS` (lines 16-27) and `MOCK_CANDIDATES` (lines 29-35).
  - Crude Client-Side Simulation: `evaluateFit` (lines 54-74) uses heuristic score bonuses (+15 if newBeta closer to 1, +15 if roe > portfolioROE) rather than institutional risk factor models.
  - Hardcoded Sector Limits & Promoter Overlap: In `weigh/page.tsx:237-266`, promoter groups (Tata Group, Ambani Group, Bajaj Group) are statically hardcoded.
- **Feasibility & Architectural Prerequisites:**
  - Replace mock tab implementations with Radix UI `@/components/ui/tabs`.
  - Fetch real holdings and weights from PostgreSQL `holdings` table.
  - Implement promoter group aggregation engine in `math-engine`.

---

### Tool 21: Risk correlation assessment
- **Excel Name:** Risk correlation assessment
- **Excel Category:** Decision / Weigh Decisions
- **Excel Description:** Change in portfolio risk from addition of the stock into portfolio. Calculated using risk buckets which is entered in company page. The widget will show contribution from each risk in a grid format with each cell representing a risk and tis percentage. Another table shows correlations between
- **Data Source:** Company page
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/weigh-decisions/weigh-decisions.md` (and `specs/portfolio-management/portfolio-risk.md`)
  - Frontend UI: `research-os-frontend/src/app/weigh/page.tsx:304-371` (Correlation tab)
  - DB Schema: `postgres/init/01_schema.sql:283` (`risk_correlation JSONB DEFAULT '{}'`), and lines 413-422 (`portfolio_risk` table)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:207` (`risk_correlation?: Record<string, any>`)
- **Production Readiness Notes:**
  - Complete Simulation with `Math.random()`:
    - Line 327: Cross-Asset Correlation Matrix values are generated using `(Math.random() * 0.6 + 0.2).toFixed(2)` on every render!
    - Line 359: Risk Bucket Contribution values are generated using `+{(Math.random()*0.5+0.1).toFixed(2)}%`!
  - Static Hardcoded Warning: Line 366 displays: "Warning: Adding this position would increase Portfolio Financial Risk by 0.42% (breaches 5% threshold)" regardless of what symbol or weight is selected in the UI.
  - Completely detached from company page risk buckets or math-engine analytics.
- **Feasibility & Architectural Prerequisites:**
  - Build risk bucket covariance matrix calculation in `math-engine`.
  - Fetch risk bucket scores from `company_risk` table and compute actual marginal risk contribution $\Delta \sigma_p$.

---

### Tool 22: Valuation and allocation discipline
- **Excel Name:** Valuation and allocation discipline
- **Excel Category:** Decision / Weigh Decisions
- **Excel Description:** Different valuation cases (bear, bull, base), margin of safety, assessment, liquidity assessment. Allocation rules predecided based on criteria
- **Data Source:** company page + manual entry + additional sourcing
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specifications: `specs/weigh-decisions/scenario-analysis.md:1-120`, `reverse-dcf.md:1-153`, `conviction-sizing.md:1-141`
  - Frontend Widgets:
    - `research-os-frontend/src/components/widgets/ScenarioAnalysis.tsx:1-120`
    - `research-os-frontend/src/components/widgets/ReverseDCF.tsx:1-153`
    - `research-os-frontend/src/components/widgets/ConvictionSizing.tsx:1-141`
  - Weigh Page Integration: `research-os-frontend/src/app/weigh/page.tsx:373-444` (Allocation tab mounts all 3 widgets plus Bear/Base/Bull case cards)
  - DB Schema: `postgres/init/01_schema.sql:284` (`valuation_allocation JSONB DEFAULT '{}'`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:208` (`valuation_allocation?: Record<string, any>`)
- **Production Readiness Notes:**
  - Functional client-side math is implemented across three dedicated components (`ScenarioAnalysis` calculates expected return and MOS; `ReverseDCF` numerically solves for implied growth; `ConvictionSizing` applies conviction, liquidity, and beta discounts).
  - However, all three components operate in isolated local component state initialized with hardcoded values for RELIANCE.
  - None of the valuation models from the Company Valuation Suite (DCF, Relative, SOTP) feed into these widgets.
  - Values entered in these widgets are not saved to `weigh_decisions.valuation_allocation`.
- **Feasibility & Architectural Prerequisites:**
  - Bind inputs to company valuation outputs via shared state or database query.
  - Save allocation decisions to `weigh_decisions`.

---

### Tool 23: Behavioural audit
- **Excel Name:** Behavioural audit
- **Excel Category:** Decision / Weigh Decisions
- **Excel Description:** A checkbox tool to verify checks on various behavioural baises. The tool will also contain text boxes to provide justification.
- **Data Source:** Manual entry
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/weigh-decisions/weigh-decisions.md` (Behavioral Audit Section)
  - Frontend UI: `research-os-frontend/src/app/weigh/page.tsx:36-45, 446-476` (Behavioral Audit tab)
  - DB Schema: `postgres/init/01_schema.sql:285` (`behavioural_audit JSONB DEFAULT '[]' -- [{bias, check, justification, passed}]`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:209` (`behavioural_audit?: any[]`)
- **Production Readiness Notes:**
  - Well-designed bias catalog (8 institutional biases: Confirmation, Anchoring, Sunk Cost, Recency, Narrative Trap, Overconfidence, FOMO, Authority Effect with specific questions and required evidence).
  - Dead UI: The "Passed" and "Failed" buttons (lines 469-470) have zero `onClick` handlers or state bindings.
  - Direct Specification Violation: Excel specifically mandates "The tool will also contain text boxes to provide justification." There are NO textboxes rendered in the UI.
  - Summary card hardcodes "Biases Passed: 8/8" statically (line 482).
  - Zero database persistence.
- **Feasibility & Architectural Prerequisites:**
  - Add controlled `<Textarea>` for justification under each bias.
  - Implement state machine tracking passed/failed/pending with justification validation.
  - Persist to `weigh_decisions.behavioural_audit`.

---

### Tool 24: Final decision summary
- **Excel Name:** Final decision summary
- **Excel Category:** Decision / Weigh Decisions
- **Excel Description:** This tool auto generates output such as recommended allocation range, correlations, review triggers, etc
- **Data Source:** auto calculated
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/weigh-decisions/weigh-decisions.md`
  - Frontend UI: `research-os-frontend/src/app/weigh/page.tsx:478-496` (Decision Summary card)
  - DB Schema: `postgres/init/01_schema.sql:286-289` (`final_summary JSONB DEFAULT '{}'`, `decision VARCHAR(20)`, `decided_at TIMESTAMPTZ`, `decided_by VARCHAR(100)`)
  - TypeScript Interface: `research-os-frontend/src/lib/types.ts:210-213`
- **Production Readiness Notes:**
  - Completely static: The entire summary card hardcodes static numbers (Biases: 8/8, Decision: INVEST, Sizing: 5.2%, Review Date: 2024-07-15) and a hardcoded narrative memo for RELIANCE (line 489).
  - No auto-calculation or automated synthesis engine exists.
  - "Export Memo" button has no handler.
- **Feasibility & Architectural Prerequisites:**
  - Implement an auto-generation engine (or LLM synthesis pipeline in `data-ingestion/src/data_ingestion/rag/`) combining conviction score, scenario upside/downside, behavioral audit checklist status, and review triggers into a structured memo.
  - Implement PDF export.

---

## 7. Category 6: UI Primitives (3 Tools)

### Tool 25: Simple text box
- **Excel Name:** Simple text box
- **Excel Category:** UI Primitives
- **Excel Description:** A text box with a header and description
- **Status:** `Built`
- **Verifying File Citations:**
  - Specification: `specs/additional-tools/simple-text-box.md:1-114`
  - Frontend Component: `research-os-frontend/src/components/widgets/SimpleTextBox.tsx:1-59`
  - Helper Component: `research-os-frontend/src/components/widgets/CustomText.tsx:1-21`
  - Atomic Primitive: `research-os-frontend/src/components/ui/textarea.tsx:1-22`
  - Widget Registry: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:68, 139`
- **Production Readiness Notes:**
  - Working interactive component with edit/view mode toggling, editable title input, textarea, word count badge, and last saved timestamp.
  - Reusability Gap: `SimpleTextBox.tsx` accepts no props (`title`, `content`, `onChange`, `onSave`), storing everything in local component state initialized to `"Quick Notes"`.
  - No backend persistence.
- **Feasibility & Architectural Prerequisites:**
  - Refactor to accept typed props: `interface SimpleTextBoxProps { header?: string; content?: string; onChange?: (val: string) => void; readOnly?: boolean; }`.

---

### Tool 26: Multi text box
- **Excel Name:** Multi text box
- **Excel Category:** UI Primitives
- **Excel Description:** A text box with option for multiple rows and columns of text, with adjustable column width.
- **Status:** `Partial/Stub`
- **Verifying File Citations:**
  - Specification: `specs/additional-tools/multi-text-box.md:1-154`
  - Frontend Component: `research-os-frontend/src/components/widgets/MultiTextBox.tsx:1-137`
  - Widget Registry: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:67, 138`
- **Production Readiness Notes:**
  - Fundamental Specification Mismatch: The component built in `MultiTextBox.tsx` is a multi-note manager (sidebar with note list, note editor, tags, author, timestamps).
  - It does NOT provide multiple rows and columns of text with adjustable column widths, as explicitly required by Excel ("A text box with option for multiple rows and columns of text, with adjustable column width") and `multi-text-box.md` (which specifies resizable columns, draggable rows, and +Row/+Col toolbar).
- **Feasibility & Architectural Prerequisites:**
  - Implement a true multi-row, multi-column text grid component with CSS grid, cell editors, and resizable column drag handles.

---

### Tool 27: Table
- **Excel Name:** Table
- **Excel Category:** UI Primitives
- **Excel Description:** A table with a main header, header row, filter option. The filter option will first enable to choose a universe of paramteres based on which filter can later be applied.
- **Status:** `Built`
- **Verifying File Citations:**
  - Specification: `specs/additional-tools/filtered-table.md:1-151`
  - Frontend Component: `research-os-frontend/src/components/widgets/FilteredTable.tsx:1-142`
  - Atomic UI Table: `research-os-frontend/src/components/ui/table.tsx:1-118`
  - Widget Registry: `research-os-frontend/src/components/widgets/WidgetRegistry.tsx:66, 137`
- **Production Readiness Notes:**
  - Fully functional client-side table with global search, column sorting (toggle asc/desc), filter inputs per column, badge counts, and typed cell formatting (badge, number, text).
  - Prop-driven: accepts `title`, `columns`, and `data` with fallbacks.
  - Minor gap against Excel description: Excel mentions a 2-stage universe picker ("choose a universe of parameters based on which filter can later be applied"); current implementation exposes inputs for all filterable columns.
  - No pagination or CSV export implemented.
- **Feasibility & Architectural Prerequisites:**
  - Add pagination and CSV export controls.
  - Implement column visibility picker modal.

---

## 8. Cross-Cutting Subsystem Analysis

### 8.1 Frontend Subsystem (`research-os-frontend`)
1. **Build & Test State:**
   - `package.json` contains scripts for `"dev"`, `"build"`, `"start"`, and `"lint"`. It lacks an automated test script (`"test"`).
   - In `next.config.ts`, `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` are enabled, bypassing compiler type checks.
2. **Component Architecture & Mock Coupling:**
   - While the UI widget ecosystem (`src/components/widgets/`) contains 60 widget files, nearly all Cluster B components rely entirely on local mock objects (`MOCK_INPUTS`, `MOCK_HOLDINGS`, `MOCK_SCENARIOS`).
   - The Supabase client in `src/lib/supabase.ts` is never queried by any component in `src/components` or `src/app`.
3. **Route Rewrites:**
   - `next.config.ts` sets up rewrites proxying `/api/math-engine/:path*` to `MATH_ENGINE_URL` (defaulting to `https://math-engine-api.vercel.app`) and `/api/data-ingestion/:path*` to `DATA_INGESTION_URL`.
   - The frontend `/src/app/api/` contains only NextAuth routes (`auth/[...nextauth]/route.ts`).

### 8.2 Math Engine Subsystem (`math-engine`)
1. **Test Coverage:**
   - Automated pytest executed successfully: **36 passed in 1.49s**.
   - However, all 36 tests cover core valuation (DCF, Relative, SOTP, Banking, Excess Return, Beneish, Altman, Piotroski, Portfolio Analytics, Screening).
   - `RiskScoreEngine` is registered in `MathEngineRegistry` and exposed at `@app.post("/risk-score")`, but has **zero unit tests** in `test_math_engine.py`.
2. **Deterministic Architecture:**
   - `RiskScoreEngine` inherits from `DeterministicCalculator`, with SEBI-calibrated discrete transfer functions (`_promoter_pledge_score`, `_rpt_score`, `_auditor_score`, `_leverage_score`, `_liquidity_score`).
   - Dynamically renormalizes weights when input factors are unavailable.

### 8.3 Data Ingestion Subsystem (`data-ingestion`)
1. **Test Coverage:**
   - Automated pytest executed successfully: **13 passed in 0.93s**.
   - Covers `SlidingWindowChunker`, `VectorStore`, `DocumentClassifier`, `CitationEngine`.
2. **Gaps Against Cluster B Requirements:**
   - Data Ingestion currently lacks specific extraction schemas for contingent liabilities (Ind AS 37), executive remuneration (Companies Act Sec 197), and board composition tables.

### 8.4 Database Subsystem (`postgres`)
1. **Schema Readiness:**
   - `postgres/init/01_schema.sql` defines complete table structures for Cluster B:
     - `company_risk` (lines 198-213) with `business_risk`, `financial_risk`, `valuation_risk`, `governance_risk`, `macro_risk`, `industry_red_flags`, `risk_scores`, `key_fragility_points`, `legal_checks`.
     - `company_sme` (lines 248-263) with `company_info`, `promoter_forensics`, `fs_health`, `other_forensics`, `on_ground_research`, `corporate_governance`, `customer_concentration`, `screening_checklist`.
     - `weigh_decisions` (lines 276-294) with `portfolio_fit`, `risk_correlation`, `valuation_allocation`, `behavioural_audit`, `final_summary`, `decision`.
2. **Wiring Gap:**
   - No database migration or ORM layer connects the frontend or math engine directly to PostgreSQL. The frontend types in `src/lib/types.ts` accurately mirror the schema, but no data flows to or from the database.

---

## 9. Comprehensive Gap Analysis & Production Roadmap

```
                                  CLUSTER B STATUS
                                 Total: 27 Tools
      ┌──────────────────────────────┬──────────────────────────────┐
      │  Built: 2 (7.4%)             │  Pending: 15 (55.6%)         │
      │  - Filtered Table            │  - Business Risk             │
      │  - Simple Text Box           │  - Financial Risk            │
      ├──────────────────────────────┤  - Valuation Risk            │
      │  Partial/Stub: 10 (37.0%)    │  - Macro Risk                │
      │  - Governance Risk           │  - Industry Red Flags        │
      │  - Risk Score                │  - Key Fragility Points      │
      │  - Assess Auditor            │  - Legal Checks              │
      │  - Checklist                 │  - SME Company Info          │
      │  - Portfolio Fit Check       │  - Promoter Forensics        │
      │  - Risk Correlation          │  - Financial Health          │
      │  - Valuation & Allocation    │  - Other Forensics           │
      │  - Behavioural Audit         │  - On-Ground Research        │
      │  - Final Decision Summary    │  - Mgmt Compensation         │
      │  - Multi Text Box            │  - Board Structure           │
      │                              │  - Customer Concentration    │
      └──────────────────────────────┴──────────────────────────────┘
```

### Critical Priorities for Production Readiness:
1. **Fix Broken Navigation:** Repair `TabsTrigger` in `PortfolioFitCheck.tsx` using Radix UI tabs.
2. **Replace Pseudorandom Generators in Weigh Decisions:** Replace `Math.random()` in `research-os-frontend/src/app/weigh/page.tsx:327, 359` with real matrix calculations.
3. **Build Behavioral Audit Justification Textboxes:** Add textboxes for each bias in `weigh/page.tsx` and wire the "Passed"/"Failed" buttons.
4. **Align Multi Text Box with Specification:** Replace or augment the multi-note component with a resizable multi-row/column text grid.
5. **Add Automated Unit Tests for Risk Score Engine:** Add test vectors for `RiskScoreEngine` in `math-engine/tests/test_math_engine.py`.
6. **Implement Supabase / REST Data Layer:** Wire `company_risk`, `company_sme`, and `weigh_decisions` PostgreSQL tables to frontend widgets.
