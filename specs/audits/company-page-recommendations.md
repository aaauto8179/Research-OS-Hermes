# Multidisciplinary Spec Audit: Company Page (59 Specifications)
**Target Category:** `specs/company-page/`  
**Audit Artifact:** `specs/audits/company-page-recommendations.md`  
**Auditor Archetype:** `teamwork_worker` (Specialist: Financial Accounting, Equity Research, UI/UX, Quantitative Math, Data Engineering)  
**Applicable Standards:** Ind AS / Schedule III (Div II & Div III), SEBI LODR / SAST / PIT, RBI Regulatory Framework, BSE SME / NSE Emerge Norms, CARO 2020, MSMED Act 2006.

---

## 1. Executive Summary & Master Audit Architecture

### 1.1 Scope & Objective
This audit provides an exhaustive, multidisciplinary critique and actionable implementation blueprint for all 59 specification files comprising the 10 functional subdirectories of `specs/company-page/`. In accordance with institutional research workflows, none of the original specification files in `specs/company-page/` have been directly modified. Instead, every individual specification has been audited across 6 core institutional lenses:
1. **Financials & Regulatory Accounting**: Ind AS compliance (Ind AS 115 revenue contracts, Ind AS 116 lease capitalization, Ind AS 109 financial instruments, Schedule III Division II non-financial vs Division III NBFC/Banking), SEBI LODR (Reg 23 RPTs, Reg 31 shareholding, Reg 33 reporting, Reg 34 annual reports), SEBI SAST (Reg 31 encumbrance disclosures), and BSE/NSE market conventions.
2. **Economic Knowledge & Sector Drivers**: Macro factors (RBI MPC rate cycles, CPI/WPI, crude import parity, currency dynamics), input cost pass-through elasticity, capacity utilization cycles, and PLI/regulatory moats.
3. **Fundamental Investor Logic & Conviction Workflows**: Institutional buy-side friction points, Investment Committee (IC) memo generation speed, conviction hurdle governance, kill criteria triggers, and behavioral bias mitigations.
4. **UI/UX & Terminal Interaction Design**: Information density, visual hierarchy, Bloomberg/FactSet aesthetic rigor, and strict lifecycle states (`loading`, `empty`, `error`, `zero-revenue`, `loss-making`, `pre-IPO`).
5. **Mathematical Rigor & Forensic Formulas**: Precise formulations, continuous vs discrete metrics, boundary conditions, zero-division traps ($EBIT=0, \text{Debt}=0$), and negative-denominator guardrails (negative Net Worth in ROE, negative Capital Employed in ROCE, negative Invested Capital in ROIIC).
6. **Data Plumbing & Pipeline Contracts**: Strongly-typed TypeScript interfaces, Zod validation schemas, exchange ingestion triggers (XBRL, corporate announcements), and store synchronization contracts.

---

### 1.2 Master Specification Index & Audit Matrix

| Tab | Spec File (Disk Path) | Prompt Reference / Alias | Primary Deficiencies Identified | Priority |
|---|---|---|---|---|
| **Overview** | `overview/about-company.md` | `about.md` / `company-profile.md` | Missing CIN/DIN validation, subsidiary ownership tree lacks beneficial ownership | P1 |
| **Overview** | `overview/decision-terminal.md` | `company-profile.md` | Conflicting score formulas (4/5 vs 5/3/1), no governance veto gate, lacks IC sizing | P0 |
| **Overview** | `overview/entry-rationale.md` | `ownership.md` | Inverted reward/risk notation (1:3 vs 3:1), lacks Kelly criterion and ADTV liquidity check | P1 |
| **Overview** | `overview/exit-rationale.md` | `price-volume.md` | Lacks Section 111A/112A capital gains math, missing XIRR and alpha vs benchmark attribution | P1 |
| **Overview** | `overview/latest-changes.md` | `corporate-actions.md` | Materiality threshold missing under SEBI LODR Reg 30 (2% turnover / 5% net worth) | P1 |
| **Overview** | `overview/thesis-snapshot.md` | `key-metrics.md` | Asymmetric risk/reward formula missing, undefined MoS denominator standard, manual probability | P0 |
| **Overview** | `overview/tracking-table.md` | `chart.md` | Lacks formula engine syntax, cyclical baseline anchoring, and cross-tab auto-sync | P2 |
| **Management** | `management/capital-allocation.md` | `track-record.md` | ROIIC denominator flip trap ($\Delta \text{Invested Capital} < 0$), Ind AS 116 lease exclusion | P0 |
| **Management** | `management/concall-consistency.md` | `board-quality.md` | Unstructured guidance parsing, lacks numeric vs tonal divergence score | P1 |
| **Management** | `management/management-background.md`| `track-record.md` | Missing MCA MCA21 DIN director disqualification check (Sec 164), no past litigation schema | P1 |
| **Management** | `management/red-flags.md` | `governance.md` | Subjective severity scoring without weighted forensic engine linkage or CARO 2020 flags | P0 |
| **Management** | `management/shareholding-pattern.md` | `promoter-holding.md` / `insider-trading.md` | Lacks SEBI SAST Reg 31 NDU/encumbrance tracking, SBO rules, float float-adjusted MPS | P0 |
| **Management** | `management/track-record.md` | `remuneration.md` | Timeline lacks capex-to-revenue efficiency linkage and guidance delivery history | P2 |
| **Story** | `story/business-model.md` | `business-model.md` | Qualitative only; lacks unit economics decomposition and working capital drag breakdown | P1 |
| **Story** | `story/current-growth-drivers.md` | `growth-drivers.md` | Contribution % lacks volume vs realization decomposition; no PLI / export tailwind tags | P1 |
| **Story** | `story/economic-moat.md` | `operating-leverage.md` | Subjective moat score without quantitative $(ROIC - WACC)$ hurdle or pricing power proof | P0 |
| **Story** | `story/future-growth-drivers.md` | `capex-tracker.md` | Lacks CWIP capitalization schedule, environmental clearance, and probability weighting | P1 |
| **Industry** | `industry/competitors-table.md` | `peer-comparison.md` | Fixed metrics table; lacks EV/Capital Employed, median benchmarking, and capacity share | P1 |
| **Industry** | `industry/market-sizing.md` | `market-share.md` | Top-down TAM builder lacks unorganized-to-organized transition model and tariff sensitivity | P2 |
| **Industry** | `industry/value-chain-canvas.md` | `competitive-advantage.md` | Purely visual canvas; lacks gross profit pool distribution math and channel margin splits | P2 |
| **Risk** | `risk/business-risk.md` | `key-risks.md` | No risk correlation matrix; lacks customer concentration and operating leverage gearing | P1 |
| **Risk** | `risk/financial-risk.md` | `debt-profile.md` | Lacks debt maturity schedule, Ind AS 116 lease liability inclusion, unhedged FX exposure | P0 |
| **Risk** | `risk/governance-risk.md` | `pledged-shares.md` | Hardcoded scores; lacks SEBI LODR Reg 23 RPT thresholds, CARO 2020 audit remarks | P0 |
| **Risk** | `risk/industry-red-flags.md` | `industry-red-flags.md` | Missing cyclical peak indicators, input commodity price pass-through lag, capacity overhang | P1 |
| **Risk** | `risk/key-fragility-points.md`| `risk-scorecard.md` | Arbitrary 20%/30% thresholds; lacks single-plant dependency and power/water supply risk | P1 |
| **Risk** | `risk/legal-checks.md` | `related-party.md` | Contingent liabilities lack tax dispute classification and Section 143(3) CARO mapping | P0 |
| **Risk** | `risk/macro-risk.md` | `macro-risk.md` | Missing RBI rate sensitivity formula ($\Delta \text{PBT} / \Delta 100\text{bps}$) and FX delta | P1 |
| **Risk** | `risk/risk-score.md` | `forensic-checks.md` | Equal/uncalibrated pillar weights; lacks non-linear penalty for critical governance red flags | P0 |
| **Risk** | `risk/valuation-risk.md` | `regulatory-risk.md` | Multiples lack historical cycle z-score and growth-adjusted PEG/EV-to-EBITDA normalization | P1 |
| **Analysis** | `analysis/concall-tracker.md` | `cost-structure.md` | Freeform text entries; lacks promise vs delivery matrix and analyst questioning sentiment | P1 |
| **Analysis** | `analysis/exit-checklist.md` | `exit-checklist.md` | Static binary triggers; lacks gradual thesis deterioration scoring and trailing stop metrics | P1 |
| **Analysis** | `analysis/ratio-analysis.md` | `efficiency.md` / `dupont.md` | Zero formulas provided; negative denominator traps ($ROE < 0$ with $-PAT/-NW$), lacks DuPont | P0 |
| **Analysis** | `analysis/recent-events.md` | `recent-events.md` | Lacks event price-reaction overlay and SEBI Reg 30 disclosure classification tags | P2 |
| **Analysis** | `analysis/turnaround-indicator.md` | `cash-flow.md` | 5-pillar score lacks debt restructuring status, working capital release vs operational gain | P0 |
| **Valuation** | `valuation/banking-valuation.md` | `margin-of-safety.md` | Unadjusted P/BV used instead of P/ABV; lacks Net NPA deduction, PCR, and DuPont ROA tree | P0 |
| **Valuation** | `valuation/dcf-valuation.md` | `dcf-summary.md` | Flat FCF input without FCFF bridge; no mid-year discounting; singularity when $WACC \le g$ | P0 |
| **Valuation** | `valuation/excess-return-valuation.md` | `implied-expectations.md` | Constant capital charge assumption; lacks Ind AS lease capital adjustment and terminal decay | P0 |
| **Valuation** | `valuation/relative-valuation.md` | `comparable-multiples.md` | Multiples distorted by non-operating income; lacks cyclical peak/trough EV/EBITDA normalizer | P1 |
| **Valuation** | `valuation/sotp-valuation.md` | `target-price.md` | Lacks parent ownership % multiplier, Holdco discount convention, and corporate debt bridge | P0 |
| **Valuation** | `valuation/valuation-philosophy.md` | `historical-valuation.md` | Qualitative notes; lacks Reverse DCF implied growth engine and valuation anchor tracking | P1 |
| **Financials** | `financials/common-size-statement.md` | `financial-health.md` | Incomplete Schedule III mapping; no revenue vs total asset common-size toggles | P1 |
| **Financials** | `financials/financial-statements.md` | `balance-sheet.md` / `income-statement.md` | No Division II vs III toggle; missing ROU asset, lease liability, OCI, and cash reconciliation | P0 |
| **Financials** | `financials/revenue-projection.md` | `revenue-projection.md` | Top-down % growth only; lacks volume $\times$ realization, utilization cap, and segment bridge | P0 |
| **Financials** | `financials/segment-breakup.md` | `segment-breakup.md` | Missing Ind AS 108 inter-segment revenue eliminations and capital employed per segment | P1 |
| **SME** | `sme/assess-auditor.md` | `sme-governance.md` | Missing ICAI Peer Review Certificate check (SEBI LODR 33), CARO 2020 resignation circular | P0 |
| **SME** | `sme/board-structure.md` | `key-person-risk.md` | Lacks Companies Act 2013 Sec 149/152 compliance flags and executive family nexus map | P1 |
| **SME** | `sme/company-info.md` | `ipo-details.md` | Missing SME IPO lot size liquidity, Market Maker 3-year obligation, and anchor lock-in | P1 |
| **SME** | `sme/cost-breakup.md` | `lot-size.md` | Missing raw material concentration, import CIF vs domestic landed, and power cost/unit | P1 |
| **SME** | `sme/customer-concentration.md` | `customer-concentration.md` | Lacks related-party customer cross-check and credit term / overdue receivables tracking | P0 |
| **SME** | `sme/financial-health.md` | `working-capital.md` | No Cash Flow to EBITDA divergence test; lacks tax paid vs P&L tax expense reconciliation | P0 |
| **SME** | `sme/investment-checklist.md` | `migration-readiness.md` | Static checklist; lacks BSE SME / NSE Emerge mainboard migration criteria rules | P1 |
| **SME** | `sme/mgmt-compensation.md` | `promoter-background.md` | Missing Section 197 Companies Act 11% net profit cap check and related-party perquisites | P0 |
| **SME** | `sme/on-ground-research.md` | `anchor-investors.md` | Freeform notes; lacks channel check verification score and supplier cross-referencing | P2 |
| **SME** | `sme/other-forensics.md` | `peer-multiples.md` | Missing Section 186 loan check, CWIP aging schedule, and contingent liabilities/NW ratio | P0 |
| **SME** | `sme/promoter-forensics.md` | `order-book.md` | Org chart lacks ultimate beneficial ownership (SBO) and cross-pledged corporate guarantees | P0 |
| **SME** | `sme/wc-breakup.md` | `liquidity-tracker.md` | Missing MSMED Act 45-day rule (Sec 43B(h)), Schedule III debtor aging, bank Drawing Power | P0 |
| **Downsides** | `downsides/forensic-analysis.md` | `stress-test.md` | US-manufacturing Altman Z used on services/banks; Beneish lacks Ind AS 7 accruals adjustment | P0 |
| **Downsides** | `downsides/hedging-mechanism.md` | `downside-risks.md` | Missing NSE equity derivatives mechanics: beta hedge ratio, lot sizes, rollover cost drag | P1 |
| **Downsides** | `downsides/key-events.md` | `anti-thesis.md` | Lacks automated event trigger feeds, SEBI Reg 30 webhooks, and downside impact scoring | P1 |

---

## 2. Universal Architectural Standards for the Company Page

### 2.1 Ind AS 116 Lease Capitalization & Normalization Layer
Under Ind AS 116 (effective FY20), operating leases are recognized on-balance-sheet as Right-of-Use (ROU) Assets and Lease Liabilities. Operating rent expense is removed from EBITDA and replaced with Depreciation of ROU Asset (in D&A) and Finance Costs on Lease Liability (in Interest).
- **Core Problem:** Cross-sectional comparisons across companies and time-series comparisons pre-FY20 vs post-FY20 distort EBITDA (+15-30% in retail/airlines), EBIT (+5-10%), Net Debt, and ROCE.
- **Architectural Solution:** All company page modules consuming financial statements must support a universal normalization toggle: `Accounting Standard: [Ind AS 116 Reported | Pre-Ind AS 116 Normalized]`.
- **Normalization Formula:**
  $$\text{EBITDA}_{\text{normalized}} = \text{EBITDA}_{\text{reported}} - \text{Principal Lease Payment} - \text{Interest Lease Payment}$$
  $$\text{Net Debt}_{\text{pre-116}} = \text{Total Borrowings} - \text{Cash \& Bank} \quad (\text{excluding Lease Liabilities})$$
  $$\text{Net Debt}_{\text{post-116}} = \text{Total Borrowings} + \text{Lease Liabilities} - \text{Cash \& Bank}$$

### 2.2 Schedule III Division II (Corporate) vs Division III (NBFC/Banking) State Machine
Non-financial corporate screens (Division II) enforce Revenue, COGS, EBITDA, Working Capital, and Capex. Banking/NBFC screens (Division III) enforce Net Interest Income (NII), Net Interest Margin (NIM), Advances, Deposits, Gross/Net NPA, and Capital Adequacy (CRAR).
- **Contract:** Every company page component must evaluate `companyContext.entityType`:
  ```typescript
  type EntityType = 'COMMERCIAL_CORPORATE' | 'BANKING' | 'NBFC' | 'INSURANCE';
  ```
  Components must dynamically render relevant field sets. Division II metrics (e.g., EBITDA, Inventory Days) must be disabled or replaced by banking metrics (e.g., Cost-to-Income, PCR) when `entityType === 'BANKING' | 'NBFC'`.

### 2.3 Mathematical Guardrails for Negative Denominators & Singularities
Across all modules, formula engines must strictly adhere to forensic arithmetic guardrails:
1. **Negative Book Value / Net Worth:**
   $$\text{ROE} = \begin{cases} \text{PAT} / \text{Average Net Worth} & \text{if } \text{Net Worth} > 0 \\ \text{undefined ("Negative Net Worth / Distress")} & \text{if } \text{Net Worth} \le 0 \end{cases}$$
2. **Zero Interest/Finance Cost:**
   $$\text{Interest Coverage} = \begin{cases} \text{EBITDA} / \text{Finance Costs} & \text{if } \text{Finance Costs} > 0 \\ \infty \text{ ("Debt-Free")} & \text{if } \text{Finance Costs} = 0 \text{ and } \text{EBITDA} > 0 \\ \text{undefined} & \text{if } \text{EBITDA} \le 0 \end{cases}$$
3. **DCF Valuation Singularity:**
   $$\text{Terminal Value} = \begin{cases} \frac{\text{FCFF}_n \times (1 + g)}{WACC - g} & \text{if } WACC > g \\ \text{Error: WACC } \le g \text{ ("Invalid Parameter")} & \text{if } WACC \le g \end{cases}$$

---

## 3. Tab 1: Overview Specifications (7 Specs)

### 3.1 `specs/company-page/overview/about-company.md`
*(Prompt Reference: `about.md` / `company-profile.md`)*

#### Domain Lenses Evaluated
- Financials & SEBI LODR, UI/UX Design, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The current spec treats the company profile as a static rich-text card. An institutional analyst opening a coverage stock needs immediate verification of statutory registration (21-digit Corporate Identity Number - CIN, Registrar of Companies - RoC jurisdiction), listing status across exchanges (ISIN, BSE Scrip Code, NSE Symbol, Bloomberg/Reuters Ticker), and official industry classification (SEBI/AMFI Sector, Sub-sector, NIC Code). The corporate structure org chart lacks ownership percentages, jurisdiction of incorporation (crucial for offshore holding/subsidiaries in Mauritius/Singapore), and operational status.

#### Concrete Actionable Modifications
1. **Validation & Metadata Schema:**
   Add strict validation for statutory identifiers:
   ```typescript
   export interface StatutoryIdentifiers {
     cin: string; // Regex: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/ (21-digit Indian CIN)
     isin: string; // Regex: /^IN[A-Z0-9]{10}$/ (Indian ISIN)
     bseScripCode: string; // 6-digit numeric
     nseSymbol: string;
     amfiClassification: {
       macroSector: string;
       sector: string;
       industry: string;
       basicIndustry: string; // Standard 4-tier AMFI taxonomy
     };
   }
   ```
2. **Corporate Structure Hierarchy:**
   Update `CorporateEntity` interface to track economic stake and reporting segment:
   ```typescript
   export interface CorporateEntityV2 {
     id: string;
     name: string;
     relationship: 'Holding' | 'Subsidiary' | 'Step-down Subsidiary' | 'Associate' | 'JV';
     equityHoldingPct: number; // 0 - 100
     votingPowerPct: number;
     countryOfIncorporation: string;
     statutoryAuditor: string;
     isMaterialSubsidiary: boolean; // Under SEBI LODR Reg 16(1)(c) (>10% consolidated income/NW)
     contributionToConsolidatedRevenuePct: number;
     contributionToConsolidatedPATPct: number;
   }
   ```
3. **UI/UX Interaction States:**
   - `Loading State`: Skeleton loader with placeholder blocks for Basic Info, Key Metric Badges, and Corporate Hierarchy.
   - `Empty State`: CTA banner: "No statutory data extracted. Click [Ingest MCA/BSE Filings] or [Upload Annual Report]".
   - `Error State`: Alert badge indicating missing MCA filing with direct link to RoC master data lookup.

---

### 3.2 `specs/company-page/overview/decision-terminal.md`
*(Prompt Reference: `company-profile.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Mathematical Rigor, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec contains a severe mathematical contradiction: Section 3.1 displays `Business Quality: 4/5`, but Section 3.3 hardcodes `High=5, Medium=3, Low=1`. More critically, institutional investment processes do not operate on unconstrained linear weighted averages. If a company exhibits severe corporate governance or forensic red flags, an analyst cannot assign a "HIGH" conviction simply because valuation comfort is attractive (a classic "value trap"). The terminal lacks a **Hard Veto Governance Gate** and does not translate conviction into recommended portfolio sizing.

#### Concrete Actionable Modifications
1. **Mathematical Scoring & Governance Veto Formulation:**
   Define discrete 5-point inputs ($1 \le x \le 5$) and an explicit hard veto:
   $$\text{RawScore} = (w_{\text{bq}} \times S_{\text{bq}}) + (w_{\text{vc}} \times S_{\text{vc}}) + (w_{\text{pf}} \times S_{\text{pf}})$$
   where $w_{\text{bq}} = 0.40, w_{\text{vc}} = 0.35, w_{\text{pf}} = 0.25$.
   $$\text{FinalConviction} = \begin{cases} \text{"HARD PASS / REJECT"} & \text{if } S_{\text{governance\_gate}} < 3.0 \text{ or } \text{ActiveForensicRedFlags} \ge 2 \\ \text{"HIGH"} & \text{if } \text{RawScore} \ge 4.0 \\ \text{"MEDIUM"} & \text{if } 2.75 \le \text{RawScore} < 4.0 \\ \text{"LOW / TRACKING"} & \text{if } \text{RawScore} < 2.75 \end{cases}$$
2. **Institutional Portfolio Sizing Mapping:**
   Include position sizing guidance based on conviction tier:
   ```typescript
   export interface DecisionOutput {
     rawScore: number;
     governanceVetoActive: boolean;
     vetoReason?: string;
     convictionTier: 'HIGH' | 'MEDIUM' | 'LOW' | 'HARD_PASS';
     recommendedSizing: {
       minWeightPct: number;
       maxWeightPct: number;
       sizingCategory: 'Core Compounder (4-7%)' | 'Tactical Growth (2-4%)' | 'Tracking / Incubator (<2%)' | 'Zero / Divest (0%)';
       maxLossTolerancePct: number;
     };
     auditTrail: {
       analystId: string;
       timestamp: string;
       rationaleHash: string;
     };
   }
   ```
3. **Missing UI States:**
   - `Conflicted Conviction Banner`: Render amber badge if $S_{\text{bq}} = 5$ (Exceptional Business) but $S_{\text{vc}} = 1$ (Extreme Overvaluation) with prompt: "Great Company, Rich Valuation — Set Entry Price Alert".

---

### 3.3 `specs/company-page/overview/entry-rationale.md`
*(Prompt Reference: `ownership.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Mathematical Rigor, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
In Section 3.1, the spec shows `Upside: +31.6%, Downside: -10.5%, Risk/Reward: 1:3`. Institutional market convention expresses Reward/Risk as $3.0\times$ (3:1 reward-to-risk), whereas writing `1:3` creates confusion. Furthermore, the position sizing box permits manual entry without checking liquidity risk: if an institutional fund initiates a 5% position in a small-cap stock, how many days of Average Daily Trading Volume (ADTV) will it take to accumulate and liquidate? Sizing without ADTV liquidity guardrails is a severe oversight.

#### Concrete Actionable Modifications
1. **Reward-to-Risk & Kelly Criterion Formulation:**
   $$\text{Upside (\%)} = \frac{\text{FairValue}_{\text{Base}} - \text{CMP}}{\text{CMP}} \times 100$$
   $$\text{Downside (\%)} = \frac{\text{FairValue}_{\text{Bear}} - \text{CMP}}{\text{CMP}} \times 100$$
   $$\text{Reward/Risk Ratio} = \frac{\text{Upside (\%)}}{|\text{Downside (\%)}|}$$
   $$\text{Half-Kelly Sizing (\%)} = 0.5 \times \left( \frac{p \cdot b - q}{b} \right) \times 100$$
   where $p = \text{Analyst Probability of Win}$, $q = 1 - p$, $b = \text{Reward/Risk Ratio}$.
2. **Liquidity Guardrail Schema:**
   ```typescript
   export interface LiquidityAssessment {
     symbol: string;
     adtv30DayShares: number;
     adtv30DayValueCr: number;
     targetInvestmentCr: number;
     daysToLiquidateAt10PctADTV: number; // Formula: targetInvestmentCr / (0.10 * adtv30DayValueCr)
     liquidityWarning: 'SAFE' | 'CONSTRAINED' | 'SEVERE_ILLIQUIDITY'; // Flag if > 10 trading days
   }
   ```
3. **UI/UX State Enhancements:**
   - `Illiquidity Warning Alert`: If `daysToLiquidateAt10PctADTV > 10`, display red alert: "Position cannot be liquidated within 10 days at 10% market volume participation limit".

---

### 3.4 `specs/company-page/overview/exit-rationale.md`
*(Prompt Reference: `price-volume.md`)*

#### Domain Lenses Evaluated
- Financials & Indian Tax Law, Fundamental Investor Logic, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The exit rationale captures return and holding period but completely omits Indian capital gains taxation mechanics (critical for Family Offices, AIFs, and PMS accounts under Finance Act 2024 revisions) and benchmark performance attribution (Alpha vs Nifty 50 / BSE 500). When an analyst documents an exit, the platform must determine whether the return was driven by market beta or genuine business performance, and record an immutable post-mortem record.

#### Concrete Actionable Modifications
1. **Indian Capital Gains & Performance Attribution Math:**
   - **LTCG vs STCG Determination (Finance Act 2024):**
     $$\text{Holding Period (Days)} = \text{Exit Date} - \text{Entry Date}$$
     $$\text{Tax Rate} = \begin{cases} 20\% \text{ (STCG under Sec 111A)} & \text{if } \text{Holding Period} \le 365 \text{ days} \\ 12.5\% \text{ (LTCG under Sec 112A)} & \text{if } \text{Holding Period} > 365 \text{ days (exemption up to ₹1.25L)} \end{cases}$$
   - **XIRR & Benchmark Alpha Attribution:**
     $$\text{Alpha} = \text{XIRR}_{\text{Stock}} - \text{XIRR}_{\text{Benchmark Index (Same Cash Flows)}}$$
2. **Exit Post-Mortem Schema:**
   ```typescript
   export interface ExitPostMortemData {
     symbol: string;
     exitTranches: Array<{
       date: string;
       shares: number;
       realizedPrice: number;
       grossProceeds: number;
       sttPaid: number;
       taxCategory: 'STCG_20_PCT' | 'LTCG_12_5_PCT';
     }>;
     performanceAttribution: {
       absoluteReturnPct: number;
       xirrPct: number;
       benchmarkXirrPct: number;
       alphaBps: number;
       peExpansionContributionPct: number;
       earningsGrowthContributionPct: number;
     };
     thesisExecutionEvaluation: 'THESIS_CONFIRMED' | 'VALUATION_PEAK' | 'THESIS_INVALIDATED_MISTAKE' | 'OPPORTUNITY_COST_SWAP';
   }
   ```
3. **UI/UX State Enhancements:**
   - `Post-Mortem Diff View`: Visual side-by-side comparison of Entry Thesis Assumptions (Revenue CAGR, Target Margin, Exit P/E) vs Actual Delivered Realities upon exit.

---

### 3.5 `specs/company-page/overview/latest-changes.md`
*(Prompt Reference: `corporate-actions.md`)*

#### Domain Lenses Evaluated
- Financials & SEBI LODR Reg 30, Fundamental Investor Logic, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The current tool is a generic markdown log without classification standards. Under **SEBI LODR Regulation 30 (Schedule III Part A & B)**, listed companies must mandatorily disclose material events based on explicit quantitative thresholds (events exceeding 2% of turnover, 2% of net worth, or 5% of 3-year average PAT/loss). The tool must ingest exchange feeds and tag corporate developments by statutory category rather than relying solely on manual notes.

#### Concrete Actionable Modifications
1. **SEBI Regulation 30 Materiality Categorization:**
   ```typescript
   export type SEBIMaterialEventType =
     | 'CAPACITY_ADDITION'
     | 'ACQUISITION_M_AND_A'
     | 'DISPUTE_LITIGATION'
     | 'REGULATORY_ACTION_PENALTY'
     | 'MANAGEMENT_KMP_CHANGE'
     | 'CREDIT_RATING_REVISION'
     | 'ORDER_BOOK_WIN_CANCELLATION'
     | 'FRAUD_DEFAULT_DISCLOSURE';

   export interface MaterialChangeItem {
     id: string;
     timestamp: string;
     bseAnnouncementId?: string;
     category: SEBIMaterialEventType;
     materialityTestExceeded: boolean; // Quantitative test: >2% turnover or >5% 3Y PAT
     description: string;
     financialImpactEstimateCr?: number;
     impactDirection: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
     analystCommentary: string;
     thesisImpactFlag: 'NO_IMPACT' | 'MONITOR_CLOSELY' | 'THESIS_BREACH';
   }
   ```
2. **UI/UX Interaction States:**
   - `Thesis Threat Banner`: If an item is tagged `THESIS_BREACH`, trigger a high-visibility amber banner across the top of all 10 Company Page tabs with CTA: "Review Exit Checklist".

---

### 3.6 `specs/company-page/overview/thesis-snapshot.md`
*(Prompt Reference: `key-metrics.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Mathematical Rigor, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The thesis snapshot is the primary anchor of the company page. The spec defines scenario tables and sensitivity matrices but lacks: (1) standardization of the Margin of Safety (MoS) denominator, (2) formal calculation of probability-weighted Expected IRR over the holding horizon, and (3) automated binding to live quarterly earnings to trigger Kill Criteria flags.

#### Concrete Actionable Modifications
1. **Standardized Valuation Metrics & Probability Formulas:**
   - **Margin of Safety (MoS):** Standard institutional definition:
     $$\text{MoS (\%)} = \frac{\text{FairValue}_{\text{Base}} - \text{CMP}}{\text{FairValue}_{\text{Base}}} \times 100$$
     (In contrast to upside: $\frac{\text{FairValue} - \text{CMP}}{\text{CMP}} \times 100$).
   - **Probability-Weighted Expected Value & Expected IRR:**
     $$\text{Expected Value (EV)} = (P_{\text{bear}} \times \text{FV}_{\text{bear}}) + (P_{\text{base}} \times \text{FV}_{\text{base}}) + (P_{\text{bull}} \times \text{FV}_{\text{bull}})$$
     $$\text{Expected IRR (\%)} = \left( \frac{\text{Expected Value}}{\text{CMP}} \right)^{\frac{1}{T}} - 1$$
     where $T$ is the target horizon in years (default = 3.0). Enforce: $P_{\text{bear}} + P_{\text{base}} + P_{\text{bull}} = 1.00$.
2. **Kill Criteria Binding Schema:**
   ```typescript
   export interface KillCriterion {
     id: string;
     metric: 'OPERATING_MARGIN' | 'VOLUME_GROWTH' | 'DEBT_TO_EBITDA' | 'PROMOTER_PLEDGE' | 'AUDITOR_RESIGNATION';
     operator: '<' | '<=' | '>' | '>=' | '==';
     thresholdValue: number;
     evaluationPeriod: '1Q' | '2Q_CONSECUTIVE' | 'ANNUAL';
     currentReportedValue: number;
     status: 'INTACT' | 'NEAR_BREACH' | 'BREACHED';
     lastEvaluatedQuarter: string;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Interactive Sensitivity Slider`: Real-time dual sliders for Revenue Growth ($\pm 500\text{ bps}$) and Operating Margin ($\pm 200\text{ bps}$) dynamically shifting Fair Value and Expected IRR.

---

### 3.7 `specs/company-page/overview/tracking-table.md`
*(Prompt Reference: `chart.md` / `price-volume.md`)*

#### Domain Lenses Evaluated
- UI/UX Design, Data Plumbing, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
The spec describes a customizable spreadsheet-style tracking table for monitoring key investment factors. However, it lacks a formula engine syntax specification, has no mechanism for automatic recalculation against published quarterly results, and fails to differentiate between secular structural KPIs (e.g. store additions in retail) and cyclical indicators (e.g. gross refining margins in energy).

#### Concrete Actionable Modifications
1. **Formula Engine & Auto-Sync Contract:**
   Define support for simple spreadsheet expressions linking to platform primitives:
   ```typescript
   export interface TrackingMetricRow {
     id: string;
     label: string;
     kpiType: 'FINANCIAL' | 'OPERATIONAL' | 'MACRO';
     dataSource: 'AUTO_FINANCIALS' | 'DOC_AI' | 'MANUAL';
     sourceBindingKey?: string; // e.g. "financials.ebitdaMargin"
     formula?: string; // e.g. "=([@revenue] - [@cogs]) / [@revenue]"
     historicalValues: Record<string, number>; // "Q1FY25": 18.2
     targetGuidance: number;
     variancePct: number;
     alertCondition?: {
       operator: '<' | '>';
       threshold: number;
     };
   }
   ```
2. **UI/UX Enhancements:**
   - `Inline Sparklines & Heatmap Fill`: Background cell shading showing 8-quarter percentile rank (Green = >75th percentile, Red = <25th percentile).
   - `Data Freshness Badge`: Timestamp indicating whether row was synced from latest NSE quarterly XBRL upload.


---

## 4. Tab 2: Management & Execution Specifications (6 Specs)

### 4.1 `specs/company-page/management/capital-allocation.md`
*(Prompt Reference: `track-record.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS 116), Mathematical Rigor, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
The spec provides formulas for ROIC, Incremental ROIC (ROIIC), and FCF Conversion. However, Section 5.2 contains a **fatal mathematical flaw**:
$$\text{Inc\_ROIC} = \frac{\text{NOPAT}_t - \text{NOPAT}_{t-3}}{\text{Invested\_Capital}_t - \text{Invested\_Capital}_{t-3}}$$
When a company improves working capital or sells non-core assets, Invested Capital decreases ($\Delta \text{Invested Capital} < 0$). If NOPAT simultaneously expands, dividing positive $\Delta \text{NOPAT}$ by negative $\Delta \text{Invested Capital}$ yields a **negative** Incremental ROIC! The software would report value destruction when the company is actually generating infinite return on incremental capital! Furthermore, Invested Capital does not account for Ind AS 116 capitalized leases.

#### Concrete Actionable Modifications
1. **Mathematical Correction for Incremental ROIC (ROIIC):**
   $$\text{Invested Capital} = \text{Total Equity} + \text{Total Debt} + \text{Lease Liabilities} - \text{Cash \& Bank} - \text{Liquid Current Investments}$$
   $$\text{ROIIC} = \begin{cases} \frac{\Delta \text{NOPAT}}{\Delta \text{Invested Capital}} & \text{if } \Delta \text{Invested Capital} > 0 \\ \text{"Super-Accretive (Capital Released with Profit Growth)"} & \text{if } \Delta \text{Invested Capital} \le 0 \text{ and } \Delta \text{NOPAT} \ge 0 \\ \text{"Value Destructive (Earnings Drop with Capital Release)"} & \text{if } \Delta \text{Invested Capital} \le 0 \text{ and } \Delta \text{NOPAT} < 0 \end{cases}$$
2. **FCF Conversion Standard:**
   Define both Net Income conversion and Operating Cash Flow conversion:
   $$\text{FCF Conversion to PAT} = \frac{\text{FCFF}}{\text{PAT}} \quad (\text{flag if } \text{PAT} \le 0)$$
   $$\text{Cash Flow Quality Ratio} = \frac{\text{CFO}}{\text{EBITDA}} \quad (\text{Institutional benchmark } \ge 0.70)$$
3. **Data Schema Additions:**
   ```typescript
   export interface CapitalAllocationFramework {
     symbol: string;
     periodYears: number;
     capitalInvestedCr: {
       reinvestedInCapexCr: number;
       acquisitionsMAndACr: number;
       debtRepaidCr: number;
       dividendsPaidCr: number;
       shareBuybacksCr: number;
       retainedCashCr: number;
     };
     metrics: {
       reinvestmentRatePct: number; // (Capex - Depr + Chg NWC) / NOPAT
       cfoToEbitdaRatio: number;
       historicalROIC: number[];
       roiic3Year: number | 'SUPER_ACCRETIVE' | 'VALUE_DESTRUCTIVE';
       waccHurdlePct: number;
       economicValueAddedCr: number; // NOPAT - (Invested Capital * WACC)
     };
   }
   ```
4. **UI/UX Missing States:**
   - `Loss-Making / Negative NOPAT State`: Replace linear conversion bars with amber restructuring notice; disable FCF conversion percentage and display absolute Cash Burn / Runway in months.

---

### 4.2 `specs/company-page/management/concall-consistency.md`
*(Prompt Reference: `board-quality.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Data Plumbing, Regulatory Disclosure.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines guidance vs actual tracking but treats earnings calls as generic free-text. Under SEBI LODR Regulation 30(8), listed companies must submit audio recordings within 24 hours and written transcripts within 5 working days. Buy-side analysts need an automated extraction mechanism separating hard forward guidance (quantitative capex, volume, revenue, margin numbers) from soft qualitative commentary, scoring both numeric accuracy and management tonal confidence.

#### Concrete Actionable Modifications
1. **Structured Guidance vs Delivery Schema:**
   ```typescript
   export interface ConcallGuidanceItem {
     id: string;
     quarterAnnounced: string; // e.g. "Q4FY24"
     guidanceMetric: 'REVENUE_GROWTH' | 'EBITDA_MARGIN' | 'VOLUME' | 'CAPEX_OUTFLOW' | 'DEBT_TARGET';
     promisedValue: {
       min: number;
       max: number;
       unit: string;
     };
     timeHorizon: '1Q' | 'H1' | 'FULL_YEAR' | 'MULTI_YEAR';
     deliveredActualValue?: number;
     variancePct?: number;
     deliveryStatus: 'BEAT' | 'MET' | 'MISSED' | 'PENDING';
     credibilityImpactScore: number; // Weighted penalty for misses: -10 for margin miss, -15 for debt miss
     managementExplanation?: string;
   }
   ```
2. **Consistency Scoring Algorithm:**
   $$\text{Guidance Accuracy Score (\%)} = \left( \frac{\sum (\text{Weight}_i \times \text{DeliveryFactor}_i)}{\sum \text{Weight}_i} \right) \times 100$$
   where $\text{DeliveryFactor} = 1.0 \text{ (Beat/Met)}, 0.5 \text{ (Missed by } <10\%), 0.0 \text{ (Severe Miss)}$.
3. **UI/UX State Enhancements:**
   - `Promise vs Delivery Timeline`: Color-coded horizontal swimlanes showing quarters where guidance was given and the subsequent quarter where actual delivery occurred.

---

### 4.3 `specs/company-page/management/management-background.md`
*(Prompt Reference: `track-record.md`)*

#### Domain Lenses Evaluated
- Corporate Law (Companies Act 2013), SEBI LODR, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The current spec captures biographical text (name, role, education). For institutional diligence, this is superficial. Analysts require statutory compliance checks under the Companies Act 2013: verification of Director Identification Numbers (DIN), disqualification under Section 164(2) (failure to submit financial statements/annual returns or default on debentures/deposits), compliance with Section 165 directorship caps (max 20 directorships, max 10 public companies), and SEBI LODR Regulation 17A limits (max 7 listed directorships).

#### Concrete Actionable Modifications
1. **Statutory Governance Data Contract:**
   ```typescript
   export interface DirectorGovernanceProfile {
     din: string; // 8-digit numeric Director Identification Number
     name: string;
     designation: 'MD_AND_CEO' | 'EXECUTIVE_DIRECTOR' | 'NON_EXECUTIVE_CHAIR' | 'INDEPENDENT_DIRECTOR' | 'NOMINEE';
     dateOfAppointment: string;
     tenureYearsInCurrentCompany: number;
     totalListedDirectorships: number; // SEBI LODR 17A cap: <= 7
     totalDirectorships: number; // Companies Act 165 cap: <= 20
     auditCommitteeMembershipsCount: number; // SEBI LODR 26 cap: <= 10
     auditCommitteeChairmanshipsCount: number; // SEBI LODR 26 cap: <= 5
     isDisqualifiedUnderSec164: boolean;
     mcaStatus: 'ACTIVE' | 'DEBARRED' | 'DEFAULTING';
     compensation: {
       fixedSalaryCr: number;
       commissionCr: number;
       sittingFeesCr: number;
       stockOptionsGrantedCr: number;
       totalCr: number;
       pctOfNetProfit: number; // Companies Act Sec 197 ceiling check
     };
     interlockingDirectorshipsWithPeers: string[];
   }
   ```
2. **UI/UX State Enhancements:**
   - `Statutory Cap Breach Alert`: Display high-priority red badge if any Independent Director exceeds 7 listed boards or holds committee chairmanships exceeding SEBI limits.

---

### 4.4 `specs/company-page/management/red-flags.md`
*(Prompt Reference: `governance.md`)*

#### Domain Lenses Evaluated
- Forensic Accounting, SEBI Disclosures, CARO 2020.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an informal text table of red flags. A rigorous institutional terminal must synthesize flags from statutory sources: CARO 2020 auditor clauses, Section 143(3) reporting, SEBI SAST pledge alerts, and Ministry of Corporate Affairs (MCA) charges. Each red flag must carry an explicit forensic severity weight, feed directly into the Risk Scorecard, and maintain an immutable historical audit trail.

#### Concrete Actionable Modifications
1. **CARO 2020 & Forensic Taxonomies:**
   ```typescript
   export type ForensicRedFlagCategory =
     | 'AUDITOR_QUALIFICATION_OR_RESIGNATION'
     | 'CARO_ADVERSE_REMARK'
     | 'PROMOTER_PLEDGE_SURGE'
     | 'RELATED_PARTY_LOAN_ADVANCE'
     | 'CONTINGENT_LIABILITY_SPIKE'
     | 'FREQUENT_CFO_KMP_TURNOVER'
     | 'TAX_RAID_SEARCH_SEIZURE'
     | 'CASH_LOSSES_CARO_CLAUSE_XVII';

   export interface ForensicRedFlagItem {
     id: string;
     category: ForensicRedFlagCategory;
     severity: 'CRITICAL_VETO' | 'HIGH_ALERT' | 'MEDIUM_WATCH' | 'RESOLVED';
     dateIdentified: string;
     sourceDocument: 'ANNUAL_REPORT' | 'CARO_REPORT' | 'EXCHANGE_FILING' | 'MCA_CHARGES';
     clauseReference?: string; // e.g. "CARO 2020 Clause (ix)(a) - Default in repayment"
     description: string;
     quantifiedRiskAmountCr?: number;
     status: 'OPEN' | 'INVESTIGATING' | 'MANAGEMENT_EXPLAINED' | 'DISMISSED';
     governanceDeductionPoints: number; // Feeds composite risk engine
   }
   ```
2. **UI/UX State Enhancements:**
   - `Veto State Banner`: If any flag is tagged `CRITICAL_VETO` (e.g., statutory auditor mid-term resignation citing lack of information), lock the stock recommendation to "HARD PASS / DO NOT INVEST" across the Overview and Valuation tabs.

---

### 4.5 `specs/company-page/management/shareholding-pattern.md`
*(Prompt Reference: `promoter-holding.md` / `insider-trading.md`)*

#### Domain Lenses Evaluated
- Financials (SEBI LODR Reg 31 & SAST Reg 31), Math, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec handles basic quarterly percentages but fails to capture Indian regulatory filing mechanics:
1. **SEBI SAST Regulation 31 Encumbrances:** Encumbrances are not just loan pledges; they include Non-Disposal Undertakings (NDUs), negative liens, and third-party corporate guarantees.
2. **Significant Beneficial Ownership (SBO):** Under Section 90 of Companies Act 2013, companies disclose individual beneficial owners behind opaque corporate shells.
3. **Minimum Public Shareholding (MPS):** Rule 19A of SCRR requires $\ge 25\%$ public float. If promoter holding $> 75\%$, a statutory dilution overhang (OFS / QIP) exists.
4. **Insider Trading (PIT):** SEBI PIT Regulations require disclosures of promoter transactions exceeding ₹10 Lakh in a quarter.

#### Concrete Actionable Modifications
1. **Regulatory Shareholding Schema:**
   ```typescript
   export interface ShareholdingRegulatoryData {
     symbol: string;
     filingDate: string;
     quarterEnding: string;
     promoterHolding: {
       totalShares: number;
       pctOfTotalEquity: number;
       encumberedShares: {
         pledgedShares: number;
         pledgedPctOfPromoterHolding: number;
         nduShares: number; // Non-disposal undertakings
         totalEncumberedPct: number;
       };
       promoterEntities: Array<{
         name: string;
         dinOrPanMasked: string;
         sharesHeld: number;
         pctHeld: number;
         isPledged: boolean;
       }>;
     };
     publicHolding: {
       fiiPct: number;
       diiPct: number;
       mutualFundsPct: number;
       insuranceCosPct: number;
       aifPct: number;
       retailIndividualSharesLe2LakhPct: number;
       hniSharesGt2LakhPct: number;
       keyPublicHoldersGt1Pct: Array<{
         name: string;
         category: string;
         pctHeld: number;
         qoqChangeBps: number;
       }>;
     };
     complianceChecks: {
       mpsCompliant: boolean; // promoterHolding <= 75%
       mpsOverhangExcessPct: number; // max(0, promoterPct - 75%)
       sboDeclared: boolean;
     };
   }
   ```
2. **Mathematical Validation Guardrail:**
   Enforce total shareholding reconciliation:
   $$|\text{Promoter\%} + \text{Public\%} + \text{Non-Promoter Non-Public\%} - 100.00\%| < 0.01\%$$
3. **UI/UX Enhancements:**
   - `Pledge Threat Meter`: Gauge chart displaying total promoter encumbrance with threshold rings: Green ($<5\%$), Amber ($5-20\%$), Red ($>20\%$), Deep Crimson ($>50\%$, imminent margin call forced liquidation risk).

---

### 4.6 `specs/company-page/management/track-record.md`
*(Prompt Reference: `remuneration.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Economic Drivers, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec visualizes milestones as a static chronological table. For buy-side equity research, a track record is meaningful only when correlated with **incremental capital return efficiency** and **guidance reliability**. When management announced a ₹500 Cr capex in 2021, did it achieve targeted asset turnover within 24 months, or did it result in cost overruns and margin erosion?

#### Concrete Actionable Modifications
1. **Capex & Project Execution Tracking Schema:**
   ```typescript
   export interface HistoricalMilestoneExecution {
     id: string;
     announcementDate: string;
     projectDescription: string;
     capexBudgetCr: number;
     actualCapexSpentCr: number;
     capexOverrunPct: number; // (Actual - Budget) / Budget
     guidedCommercialOperationDate: string; // Guided COD
     actualCommercialOperationDate: string; // Actual COD
     delayMonths: number;
     subsequentSegmentAssetTurnover: number; // Revenue generated / Project Capex
     executionRating: 'EXEMPLARY' | 'ON_TRACK' | 'DELAYED_ACCEPTABLE' | 'DESTRUCTIVE';
   }
   ```
2. **UI/UX State Enhancements:**
   - `Execution Heatmap Timeline`: Interactive Gantt-style timeline where projects are flagged in green (ahead of time/under budget) or red (chronic delays and overruns).

---

## 5. Tab 3: Story & Moat Specifications (4 Specs)

### 5.1 `specs/company-page/story/business-model.md`
*(Prompt Reference: `business-model.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, Fundamental Investor Logic, Financials.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines a qualitative Business Model Canvas. However, institutional analysts evaluate business models through **unit economics** and **cash conversion velocity**. A business model is weak if high reported accounting margins are nullified by massive working capital lockups or high customer churn. The spec must provide a structured unit economics decomposition engine.

#### Concrete Actionable Modifications
1. **Unit Economics Decomposition Schema:**
   ```typescript
   export interface UnitEconomicsDecomposition {
     symbol: string;
     businessModelType: 'B2B_MANUFACTURING' | 'B2C_RETAIL' | 'SAAS_SUBSCRIPTION' | 'FINANCIAL_INTERMEDIARY' | 'PROJECT_EPC';
     unitMetrics: {
       unitLabel: string; // e.g. "Per Ton", "Per Active Subscriber", "Per Store"
       averageRealizationPerUnit: number;
       variableCostPerUnit: number;
       contributionMarginPerUnit: number;
       contributionMarginPct: number;
     };
     customerMetrics?: {
       cacRupees: number; // Customer Acquisition Cost
       ltvRupees: number; // Lifetime Value
       ltvToCacRatio: number; // Target >= 3.0x
       paybackPeriodMonths: number;
       grossRetentionPct: number;
       netRetentionPct: number;
     };
     workingCapitalDrag: {
       cashConversionCycleDays: number;
       workingCapitalAsPctOfRevenue: number;
       capitalIntensityCategory: 'ASSET_LIGHT_CASH_GENERATIVE' | 'MODERATE_REINVESTMENT' | 'HIGHLY_ABSORPTIVE_CAPEX_HEAVY';
     };
   }
   ```
2. **UI/UX State Enhancements:**
   - `Unit Margin Waterfall Chart`: Step-chart showing journey from Unit Realization $\rightarrow$ Raw Materials $\rightarrow$ Conversion Costs $\rightarrow$ Contribution Margin $\rightarrow$ Fixed Cost Allocation $\rightarrow$ Operating Profit Per Unit.

---

### 5.2 `specs/company-page/story/current-growth-drivers.md`
*(Prompt Reference: `growth-drivers.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, Financials, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
The spec treats growth drivers as unstructured text with manual percentage allocations. In fundamental equity analysis, revenue growth must be rigorously disaggregated into: (1) Volume growth, (2) Pricing/Realization growth, (3) Product mix shift, and (4) External policy tailwinds (PLI schemes, export incentives, antidumping duties). Without this disaggregation, an analyst cannot assess whether growth is durable or temporary inflation pass-through.

#### Concrete Actionable Modifications
1. **Growth Disaggregation Formulation:**
   $$\text{Revenue Growth} \approx \text{Volume Growth} + \text{Realization Growth} + \text{Mix Impact} + \text{M\&A Contribution}$$
2. **Growth Driver Structure Schema:**
   ```typescript
   export interface CurrentGrowthDriverItem {
     id: string;
     driverName: string;
     segmentBinding: string;
     driverType: 'VOLUME_EXPANSION' | 'PREMIUMIZATION_MIX' | 'PRICE_HIKE' | 'EXPORT_MARKET' | 'PLI_SUBSIDY';
     historicalGrowthContributionPct: number;
     forwardProjectedGrowthPct: number;
     policyTailwindTags: Array<'PLI_SCHEME' | 'CHINA_PLUS_ONE' | 'IMPORT_SUBSTITUTION' | 'FREE_TRADE_AGREEMENT'>;
     elasticityToInputCommodity: number; // Pricing power elasticity
     confidenceScore: number; // 0 - 1
   }
   ```
3. **UI/UX State Enhancements:**
   - `Volume vs Realization Decomposition Matrix`: Stacked bar charts showing quarterly volume growth vs realization growth across key product divisions.

---

### 5.3 `specs/company-page/story/economic-moat.md`
*(Prompt Reference: `operating-leverage.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, Mathematical Rigor, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
The spec defines a 0-100 subjective moat score across 5 Morningstar pillars. However, in institutional equity research, **a moat is an unproven assertion unless verified by quantitative financial metrics**:
1. Does the company earn an ROIC consistently exceeding its WACC across a complete 7-10 year economic cycle?
2. Does the company possess pricing power? (Verified by Gross Margin stability during commodity inflation spikes).
3. Is market share defensible or expanding?

#### Concrete Actionable Modifications
1. **Quantitative Moat Hurdle Verification:**
   $$\text{Moat Spread} = \overline{\text{ROIC}}_{7\text{Y}} - \overline{\text{WACC}}_{7\text{Y}}$$
   $$\text{Gross Margin Resilience} = \frac{\text{StdDev}(\text{Gross Margin}_{7\text{Y}})}{\text{StdDev}(\text{Sector Gross Margin}_{7\text{Y}})}$$
   $$\text{Economic Moat Classification} = \begin{cases} \text{"WIDE MOAT"} & \text{if } \text{Moat Spread} \ge +5.0\% \text{ and } \text{Gross Margin Resilience} < 0.70 \\ \text{"NARROW MOAT"} & \text{if } 0.0\% \le \text{Moat Spread} < +5.0\% \\ \text{"NO MOAT / COMMODITY"} & \text{if } \text{Moat Spread} < 0.0\% \end{cases}$$
2. **Moat Audit Data Schema:**
   ```typescript
   export interface EconomicMoatAudit {
     symbol: string;
     qualitativePillars: {
       switchingCostsScore: number; // 0-20
       networkEffectsScore: number; // 0-20
       intangibleAssetsScore: number; // 0-20
       costAdvantageScore: number; // 0-20
       efficientScaleScore: number; // 0-20
       compositeQualitativeScore: number; // 0-100
     };
     quantitativeValidation: {
       roicWaccSpread7YearAvg: number;
       isSpreadPositiveInAll7Years: boolean;
       grossMarginVolatilityVsPeers: number;
       pricingPowerEvidence: string;
       moatDurabilityConclusion: 'WIDE' | 'NARROW' | 'NONE';
     };
     peerMoatComparison: Array<{
       peerSymbol: string;
       peerMoatSpread: number;
       peerRating: string;
     }>;
   }
   ```
3. **UI/UX State Enhancements:**
   - `ROIC-WACC Spread Sparkline`: Time-series band showing the historical ROIC curve plotted against the WACC hurdle line. Shading between curves: Green for value creation ($ROIC > WACC$), Red for value destruction ($ROIC < WACC$).

---

### 5.4 `specs/company-page/story/future-growth-drivers.md`
*(Prompt Reference: `capex-tracker.md`)*

#### Domain Lenses Evaluated
- Financials, Economic Knowledge, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
Future growth drivers are frequently speculative. The spec captures narrative descriptions but does not tie them to balance sheet reality. An institutional analyst validates future growth drivers by tracking **Capital Work in Progress (CWIP)**, statutory environmental clearances, land acquisition, and commercialization schedules.

#### Concrete Actionable Modifications
1. **CWIP Capitalization & Catalyst Pipeline Schema:**
   ```typescript
   export interface FutureCatalystPipeline {
     symbol: string;
     currentCwipOnBalanceSheetCr: number; // From latest Balance Sheet
     projectedCapexNext3YearsCr: number;
     projects: Array<{
       id: string;
       projectName: string;
       targetCapacityAddition: string;
       estimatedOutlayCr: number;
       regulatoryClearances: {
         moefccEnvironmentalClearance: 'APPROVED' | 'PENDING' | 'NOT_APPLICABLE';
         landAcquiredPct: number;
         powerWaterTieUp: boolean;
       };
       guidedCod: string; // Commercial Operation Date
       probabilityOfTimelyExecution: number; // 0.0 - 1.0
       expectedRevenueRunRateAtFullUtilizationCr: number;
       targetPeakEbitdaMarginPct: number;
     }>;
   }
   ```
2. **UI/UX State Enhancements:**
   - `CWIP-to-Gross Block Conversion Tracker`: Milestone visual showing how fast balance sheet CWIP is converting into revenue-producing Gross Block assets.

---

## 6. Tab 4: Industry & Value Chain Specifications (3 Specs)

### 6.1 `specs/company-page/industry/competitors-table.md`
*(Prompt Reference: `peer-comparison.md`)*

#### Domain Lenses Evaluated
- Financials, Economic Knowledge, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines a peer comparison table. However, it lacks: (1) industry-specific operational metrics (e.g., Cost per Ton in Cement, Capacity Utilization in Chemicals, RevPAR in Hotels, Yield per Passenger in Aviation), (2) median benchmarking lines, and (3) EV/Capital Employed vs ROCE scatter plots for identifying valuation mispricings.

#### Concrete Actionable Modifications
1. **Industry-Specific & Valuation Metrics Schema:**
   ```typescript
   export interface CompetitorComparisonRow {
     symbol: string;
     companyName: string;
     marketCapCr: number;
     enterpriseValueCr: number;
     financialMetrics: {
       revenueGrowth3YCagr: number;
       ebitdaMarginPct: number;
       rocePct: number;
       roePct: number;
       netDebtToEbitda: number;
     };
     valuationMultiples: {
       peTtm: number;
       peForward: number;
       evEbitdaTtm: number;
       evCapitalEmployed: number; // EV / Capital Employed
       pbRatio: number;
     };
     industrySpecificKpis: Record<string, number | string>; // e.g. { "costPerTon": 3850, "capacityUtilization": 84 }
   }
   ```
2. **UI/UX State Enhancements:**
   - `Percentile Color Coding`: Dynamic background gradient ranking the target company against peer group medians (Top quartile green, bottom quartile red).
   - `Valuation vs Return Scatter Plot`: Built-in scatter diagram plotting ROCE (X-axis) against EV/Capital Employed (Y-axis) with regression trendline.

---

### 6.2 `specs/company-page/industry/market-sizing.md`
*(Prompt Reference: `market-share.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, Fundamental Investor Logic, Mathematical Rigor.

#### Critique & Institutional Analyst Workflow Perspective
The spec provides a generic canvas for TAM/SAM/SOM sizing. In the Indian macro context, the most critical secular growth driver across manufacturing and consumer sectors is the **Unorganized-to-Organized Transition** post-GST and formalization. A market sizing tool that fails to model the informal sector share and formalization velocity fails to reflect Indian equity realities.

#### Concrete Actionable Modifications
1. **Formalization & TAM Sizing Formulation:**
   $$\text{TAM}_{\text{Total Market}} = \text{Organized Market} + \text{Unorganized Market}$$
   $$\text{Organized Market Growth} = \text{Underlying Industry Growth} + (\text{Unorganized Market} \times \text{Formalization Shift Rate})$$
   $$\text{Company SOM} = \text{Organized Market} \times \text{Company Market Share (\%)} \times \text{Capacity Headroom}$$
2. **Market Sizing Data Schema:**
   ```typescript
   export interface MarketSizingModel {
     industryName: string;
     baseYear: number;
     totalMarketSizeCr: number;
     unorganizedSharePct: number;
     organizedSharePct: number;
     projectedUnderlyingCagr: number;
     annualShiftFromUnorganizedPct: number; // e.g. 2% per year
     tariffsAndTradeProtections: {
       antiDumpingDutyActive: boolean;
       basicCustomsDutyPct: number;
       pliIncentiveBudgetCr: number;
     };
     companyTargetShareInOrganizedPct: number;
     projectedSomCr: number;
   }
   ```
3. **UI/UX Missing States:**
   - `Data Deficiency Mode`: If industry data is unverified by formal industry associations (e.g., SIAM, CMA, CREDAI), display an unverified data warning tag.

---

### 6.3 `specs/company-page/industry/value-chain-canvas.md`
*(Prompt Reference: `competitive-advantage.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, UI/UX Design, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an interactive node-and-edge canvas for drawing value chains. While visually appealing, buy-side analysts do not need a generic flowchart; they need a **Profit Pool Map**. At each stage of the industry value chain (Raw Material $\rightarrow$ Intermediate $\rightarrow$ OEM $\rightarrow$ Distributor $\rightarrow$ Retailer), what percentage of total industry revenue and operating profit is captured? Where is the margin bottleneck?

#### Concrete Actionable Modifications
1. **Value Chain Profit Pool Data Contract:**
   ```typescript
   export interface ValueChainNode {
     nodeId: string;
     stageName: string; // e.g. "API Manufacturing", "Formulation", "C&F Distribution", "Pharmacy Retail"
     industryRevenuePoolCr: number;
     industryEbitdaPoolCr: number;
     averageEbitdaMarginPct: number;
     averageRocePct: number;
     bargainingPowerScore: 1 | 2 | 3 | 4 | 5; // Porter's supplier/buyer power
     targetCompanyActiveInNode: boolean;
     targetCompanyMarketShareInNodePct?: number;
     moatLevel: 'HIGH_BARRIER_TO_ENTRY' | 'COMMODITIZED_COMPETITION' | 'REGULATED_BOTTLENECK';
   }
   ```
2. **UI/UX State Enhancements:**
   - `Value Chain Margin Sankey / Waterfall`: Sankey diagram illustrating how end-consumer revenue cascades through each intermediate stage of the value chain.


---

## 7. Tab 5: Risk & Fragility Specifications (9 Specs)

### 7.1 `specs/company-page/risk/business-risk.md`
*(Prompt Reference: `key-risks.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Economic Knowledge, Mathematical Rigor.

#### Critique & Institutional Analyst Workflow Perspective
The spec provides a generic risk description box with probability and impact tags. In professional equity analysis, business risk must be evaluated through **operating leverage elasticity** and **revenue cyclicality**. When fixed costs are high, a minor drop in revenue causes a disproportionately violent collapse in operating profit. The spec lacks quantitative Degree of Operating Leverage (DOL) modeling.

#### Concrete Actionable Modifications
1. **Operating Leverage & Fixed Cost Elasticity Formulation:**
   $$\text{Degree of Operating Leverage (DOL)} = \frac{\% \Delta \text{EBIT}}{\% \Delta \text{Revenue}} = \frac{\text{Revenue} - \text{Variable Costs}}{\text{EBIT}} = \frac{\text{Contribution}}{\text{EBIT}}$$
   $$\text{Operating Breakeven Revenue} = \frac{\text{Fixed Operating Costs}}{\text{Contribution Margin (\%)階}}$$
   $$\text{Margin of Safety to Breakeven (\%)} = \frac{\text{Current Revenue} - \text{Breakeven Revenue}}{\text{Current Revenue}} \times 100$$
2. **Business Risk Schema Additions:**
   ```typescript
   export interface BusinessRiskEvaluation {
     symbol: string;
     costStructureProfile: {
       fixedCostsCr: number;
       variableCostsCr: number;
       degreeOfOperatingLeverage: number; // Flag high vulnerability if DOL > 3.0
       revenueBreakevenCr: number;
       distanceToBreakevenPct: number;
     };
     cyclicalityMetrics: {
       historicalRevenueDrawdownPeakToTroughPct: number;
       troughEbitdaMarginPct: number;
       pricingPowerAssessment: 'HIGH_PRICING_POWER' | 'INFLATION_PASS_THROUGH_LAG' | 'PURE_PRICE_TAKER';
     };
     customerConcentrationRisk: {
       top5CustomersRevenuePct: number; // Alert if > 40%
       topCustomerRevenuePct: number; // Alert if > 20%
     };
   }
   ```
3. **UI/UX Interaction States:**
   - `DOL Stress Slider`: Interactive simulation slider allowing an analyst to simulate a -10% or -20% industry demand contraction to immediately view the resulting EBIT and PAT drop.

---

### 7.2 `specs/company-page/risk/financial-risk.md`
*(Prompt Reference: `debt-profile.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS 116 / Ind AS 109), Mathematical Rigor, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines leverage and liquidity ratios but omits the two most common causes of corporate default in Indian credit markets: (1) **Debt maturity walls** (bunching of debt repayments within 12-24 months without operational cash flow to cover them), and (2) **Off-balance sheet guarantees & unhedged foreign currency debt**. Under Ind AS 116, lease obligations must be integrated into leverage, and Debt Service Coverage Ratio (DSCR) must be rigorously computed.

#### Concrete Actionable Modifications
1. **Debt Maturity & Debt Service Coverage Ratio (DSCR) Math:**
   $$\text{DSCR} = \begin{cases} \frac{\text{PAT} + \text{Depreciation} + \text{Finance Costs}}{\text{Finance Costs} + \text{Principal Repayments Scheduled in Year } t} & \text{if Denominator} > 0 \\ \infty \text{ ("Debt Free")} & \text{if Denominator} = 0 \end{cases}$$
   $$\text{Net Debt (Post-116)} = \text{Short-Term Debt} + \text{Long-Term Debt} + \text{Current Maturities of LTD} + \text{Lease Liabilities} - \text{Cash \& Equivalents} - \text{Liquid MF Investments}$$
2. **Debt Profile & Refinancing Risk Schema:**
   ```typescript
   export interface DebtMaturityProfile {
     symbol: string;
     totalGrossDebtCr: number;
     leaseLiabilitiesCr: number;
     cashAndLiquidInvestmentsCr: number;
     netDebtCr: number;
     netDebtToEbitda: number;
     interestCoverageRatio: number;
     dscrCurrentYear: number;
     debtRepaymentSchedule: {
       within1YearCr: number;
       year2Cr: number;
       year3Cr: number;
       year4To5Cr: number;
       beyond5YearsCr: number;
     };
     unhedgedForeignCurrencyExposureCr: number; // Schedule III disclosure
     creditRatings: Array<{
       ratingAgency: 'CRISIL' | 'ICRA' | 'CARE' | 'INDIA_RATINGS';
       instrument: 'LONG_TERM_BANK_FACILITIES' | 'COMMERCIAL_PAPER' | 'NCD';
       rating: string; // e.g. "CRISIL AA+"
       outlook: 'STABLE' | 'POSITIVE' | 'NEGATIVE' | 'ON_WATCH';
       dateOfRating: string;
     }>;
     refinancingCliffFlag: boolean; // True if within1YearCr > (CFO_TTM + Cash)
   }
   ```
3. **UI/UX State Enhancements:**
   - `Maturity Wall Visualizer`: Stacked bar chart comparing annual debt repayment obligations against annual projected Free Cash Flow. Red shading indicates debt repayment exceeding cash generation (refinancing risk).

---

### 7.3 `specs/company-page/risk/governance-risk.md`
*(Prompt Reference: `pledged-shares.md`)*

#### Domain Lenses Evaluated
- Corporate Law (Companies Act 2013), SEBI LODR Reg 23 & 31, Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec displays arbitrary hardcoded scores (`6/10`, `8/10`) with zero mathematical formulas. In Indian corporate governance analysis, governance risk must be computed using explicit statutory rules:
- **Related Party Transactions (SEBI LODR Reg 23):** Material RPTs (>₹1000 Cr or >10% of annual turnover) without independent valuation.
- **Promoter Pledge (SEBI SAST Reg 31):** Pledges $>20\%$ indicate financial stress at the promoter level; $>50\%$ indicates imminent margin call forced sale risk.
- **Independent Director Quality:** Chairmanship status, tenure $>10$ years (impairing independence under Sec 149), and family relationship ties.

#### Concrete Actionable Modifications
1. **Mathematical Governance Formulation:**
   $$\text{Promoter Pledge Penalty} = \begin{cases} 0 & \text{if } \text{Pledge\%} < 5\% \\ (\text{Pledge\%} - 5\%) \times 0.5 & \text{if } 5\% \le \text{Pledge\%} \le 20\% \\ 7.5 + (\text{Pledge\%} - 20\%) \times 1.0 & \text{if } \text{Pledge\%} > 20\% \end{cases}$$
   $$\text{RPT Severity Score} = \frac{\text{Non-Operating RPT Outflows (Loans, Advances, Brand Fees)}}{\text{Consolidated Net Profit}} \times 100$$
2. **Statutory Governance Risk Schema:**
   ```typescript
   export interface GovernanceRiskRegulatorySchema {
     symbol: string;
     promoterPledgePctOfHolding: number;
     hasNonDisposalUndertakings: boolean;
     boardMetrics: {
       totalDirectors: number;
       independentDirectorsCount: number;
       isChairmanIndependent: boolean;
       independentBoardPct: number; // Cap: >= 50% if executive chair, >= 33% if non-exec chair
       womenIndependentDirectorsCount: number;
       averageIndependentTenureYears: number; // Flag tenure > 10 years
     };
     relatedPartyTransactions: {
       annualRptVolumeCr: number;
       rptPctOfTurnover: number;
       hasLoansOrAdvancesToPromoterEntities: boolean; // CARO Clause (iii) check
       hasBrandOrRoyaltyPaymentExceeding5PctTurnover: boolean;
     };
     whistleblowerComplaintsReported: number;
     governanceRiskGrade: 'LOW_RISK' | 'MODERATE_MONITOR' | 'SEVERE_WARNING' | 'CRITICAL_VETO';
   }
   ```
3. **UI/UX State Enhancements:**
   - `Governance Threat Badge`: High-visibility status badge that automatically flips to `CRITICAL_VETO` if promoter loans or unexplained related-party cash drains are detected.

---

### 7.4 `specs/company-page/risk/industry-red-flags.md`
*(Prompt Reference: `industry-red-flags.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, Fundamental Investor Logic, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec lists qualitative industry flags. From an institutional viewpoint, the primary industry risks in India stem from: (1) **Cyclical peak profit margins** (mean reversion risk), (2) **Uncoordinated industry capex** causing capacity overhang, and (3) **Regulatory price controls** (e.g. NPPA drug pricing, steel import duty removals, power tariff capping).

#### Concrete Actionable Modifications
1. **Cyclical Peak & Regulatory Risk Schema:**
   ```typescript
   export interface IndustryRedFlagsModel {
     industrySector: string;
     cyclicalPhase: 'EARLY_RECOVERY' | 'MID_CYCLE_EXPANSION' | 'LATE_CYCLE_PEAK' | 'DOWNTURN_CONTRACTION';
     cycleMetrics: {
       currentIndustryOperatingMarginPct: number;
       historical10YearMeanMarginPct: number;
       marginZScoreVs10YearHistory: number; // (Current - Mean) / StdDev. If > +2.0, peak margin warning
       industryCapacityUtilizationPct: number;
       upcomingIndustrySupplyAsPctOfCapacity: number; // If > 25%, capacity glut alert
     };
     regulatoryVulnerabilities: Array<{
       regulationType: 'PRICE_CEILING' | 'ENVIRONMENTAL_SHUTDOWN' | 'CUSTOMS_DUTY_REDUCTION' | 'EXPORT_TAX';
       governingBody: 'NPPA' | 'MOEFCC' | 'DGTR' | 'MINISTRY_OF_STEEL' | 'CERC';
       description: string;
       potentialEbitdaImpactPct: number;
     }>;
   }
   ```
2. **UI/UX Missing States:**
   - `Peak Margin Mean-Reversion Alert`: If `marginZScoreVs10YearHistory > 1.8`, display warning banner: "Operating margins at 10-year historical peak (+1.8σ) — high mean-reversion risk".

---

### 7.5 `specs/company-page/risk/key-fragility-points.md`
*(Prompt Reference: `risk-scorecard.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Economic Knowledge, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec sets arbitrary thresholds (e.g. single customer >20%). A comprehensive buy-side fragility audit evaluates **Single Points of Failure (SPOF)** across 5 operational dimensions: (1) Customer, (2) Supplier, (3) Key Person, (4) Single Plant / Geography, and (5) Critical Regulatory License / Environmental Clearance.

#### Concrete Actionable Modifications
1. **Fragility & SPOF Assessment Schema:**
   ```typescript
   export interface OperationalFragilityAudit {
     symbol: string;
     customerFragility: {
       top1CustomerSharePct: number; // Fragile if > 20%
       top5CustomerSharePct: number; // Fragile if > 50%
     };
     supplierFragility: {
       top1SupplierSharePct: number; // Fragile if > 30%
       hasSingleSourceSoleSupplierRawMaterial: boolean;
       importDependencyPct: number; // Fragile if > 60% dependent on single country (e.g. China)
     };
     assetLocationFragility: {
       singlePlantRevenueContributionPct: number; // Fragile if > 50% from one facility
       locationVulnerableToSeismicOrCoastalDisruption: boolean;
     };
     keyPersonDependency: {
       isRAndDOrClientRelationshipPromoterCentric: boolean;
       formalSuccessionPlanInPlace: boolean;
     };
     compositeFragilityIndex: 'RESILIENT' | 'MODERATE_FRAGILITY' | 'CRITICAL_SINGLE_POINT_FAILURE';
   }
   ```
2. **UI/UX State Enhancements:**
   - `Spider / Radar Fragility Chart`: 5-axis radar chart showing exposure across Customer, Supplier, Plant, Key Person, and Geography.

---

### 7.6 `specs/company-page/risk/legal-checks.md`
*(Prompt Reference: `related-party.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS 37), Corporate Law, Tax Litigation.

#### Critique & Institutional Analyst Workflow Perspective
The spec treats legal cases as a generic note list. Under **Ind AS 37** (Provisions, Contingent Liabilities and Contingent Assets) and Schedule III, contingent liabilities are off-balance sheet exposures that can wipe out net worth. In Indian companies, disputed tax demands (Income Tax, GST, Customs) often exceed net worth. An analyst requires categorization by probability (Probable $\rightarrow$ Provisioned, Possible $\rightarrow$ Contingent, Remote $\rightarrow$ Disclosed) and a direct ratio against Net Worth.

#### Concrete Actionable Modifications
1. **Contingent Liability Exposure Formula:**
   $$\text{Contingent Liability to Net Worth Ratio (\%)} = \frac{\sum \text{Contingent Liabilities}}{\text{Tangible Net Worth}} \times 100$$
   $$\text{Thresholds}: \text{Safe} < 10\%, \text{Watch} = 10-25\%, \text{Severe Danger} > 25\%, \text{Existential Risk} > 50\%$$
2. **Legal & Tax Dispute Schema:**
   ```typescript
   export interface LegalContingentLiabilityAudit {
     symbol: string;
     contingentLiabilitiesBreakdownCr: {
       disputedDirectTaxIncomeTaxCr: number;
       disputedIndirectTaxGstExciseCustomsCr: number;
       corporateGuaranteesGivenForThirdPartiesCr: number;
       claimsAgainstCompanyNotAcknowledgedAsDebtCr: number;
       totalContingentLiabilitiesCr: number;
     };
     tangibleNetWorthCr: number;
     contingentLiabilitiesToNetWorthPct: number;
     activeLitigations: Array<{
       caseId: string;
       forum: 'SUPREME_COURT' | 'HIGH_COURT' | 'NCLT' | 'ITAT' | 'CESTAT' | 'ARBITRATION';
       matter: string;
       amountAtRiskCr: number;
       provisionMadeOnBalanceSheetCr: number;
       managementProbabilityAssessment: 'PROBABLE' | 'POSSIBLE' | 'REMOTE';
       hasAdverseInterimOrder: boolean;
     }>;
     caroClauseViiStatutoryDuesUndisputedOver6MonthsCr: number; // CARO report mandatory disclosure
   }
   ```
3. **UI/UX State Enhancements:**
   - `Net Worth Erosion Stress Meter`: Bar chart demonstrating potential Tangible Net Worth if 25%, 50%, or 100% of disputed tax claims crystallize.

---

### 7.7 `specs/company-page/risk/macro-risk.md`
*(Prompt Reference: `macro-risk.md`)*

#### Domain Lenses Evaluated
- Economic Knowledge, Financials, Mathematical Rigor.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines macro factors qualitatively. Buy-side analysts need quantitative sensitivity deltas: (1) Interest rate shock ($\Delta \text{PBT} / \Delta 100\text{ bps}$ repo rate change), (2) FX shock ($\Delta \text{EBITDA} / \Delta 1\%$ USD/INR depreciation), and (3) Crude oil / energy shock ($\Delta \text{Gross Margin} / \Delta \$10/\text{bbl}$ Brent crude change).

#### Concrete Actionable Modifications
1. **Macro Sensitivity Shock Equations:**
   $$\Delta \text{Interest Cost} = \text{Floating Rate Debt} \times \Delta r$$
   $$\Delta \text{FX Impact (PBT)} = (\text{Foreign Currency Net Receivables} - \text{Unhedged FX Debt}) \times \Delta (\text{USD/INR})$$
   $$\text{Crude Elasticity} = \frac{\% \Delta \text{Gross Margin}}{\% \Delta \text{Brent Crude Price}}$$
2. **Macro Sensitivity Model Schema:**
   ```typescript
   export interface MacroSensitivityMatrix {
     symbol: string;
     floatingRateDebtCr: number;
     unhedgedFxExposureNetCr: number;
     rawMaterialsWithCrudeLinkagePct: number;
     simulatedShocks: {
       plus100BpsInterestRatePbtImpactCr: number;
       plus5PctUsdInrDepreciationPbtImpactCr: number;
       plus10DollarBrentCrudeEbitdaMarginImpactBps: number;
       domesticGdpSensitivityBeta: number; // Regression beta of company revenue growth to India GDP growth
     };
     macroVulnerabilityScore: 'LOW_RESILIENT' | 'MODERATE_EXPOSURE' | 'HIGHLY_SENSITIVE';
   }
   ```
3. **UI/UX State Enhancements:**
   - `Macro Shock Tornado Diagram`: Visual tornado chart showing the relative sensitivity of company EPS to $+100\text{ bps}$ interest rates, $+5\%$ currency depreciation, and $+10\%$ commodity costs.

---

### 7.8 `specs/company-page/risk/risk-score.md`
*(Prompt Reference: `forensic-checks.md`)*

#### Domain Lenses Evaluated
- Mathematical Rigor, Forensic Accounting, Fundamental Investor Logic.

#### Critique & Institutional Analyst Workflow Perspective
The spec aggregates risks into a single 0-100 score using an unspecified weighted framework. In real-world risk architecture, **unconstrained linear weighted averages are hazardous**. If a company scores 90/100 on business and valuation, but has a 0/100 on governance (e.g. massive promoter fraud), a linear average would report an aggregate score of ~65 ("Moderate Risk"), masking catastrophic ruin risk. The composite risk score must enforce a **non-linear penalty function**.

#### Concrete Actionable Modifications
1. **Non-Linear Composite Risk Formulation:**
   $$\text{BaseScore} = \sum_{i=1}^6 (w_i \times S_i)$$
   where $w_{\text{gov}} = 0.30, w_{\text{fin}} = 0.25, w_{\text{biz}} = 0.20, w_{\text{legal}} = 0.10, w_{\text{val}} = 0.10, w_{\text{macro}} = 0.05$.
   $$\text{GovernancePenaltyMultiplier} = \begin{cases} 1.0 & \text{if } S_{\text{gov}} \ge 60 \\ \left( \frac{S_{\text{gov}}}{60} \right)^2 & \text{if } S_{\text{gov}} < 60 \end{cases}$$
   $$\text{FinalCompositeScore} = \text{BaseScore} \times \text{GovernancePenaltyMultiplier}$$
   $$\text{Risk Rating} = \begin{cases} \text{"LOW RISK (Green)"} & \text{if } \text{FinalCompositeScore} \ge 75 \\ \text{"MODERATE (Amber)"} & \text{if } 50 \le \text{FinalCompositeScore} < 75 \\ \text{"HIGH RISK (Red)"} & \text{if } 30 \le \text{FinalCompositeScore} < 50 \\ \text{"EXTREME FORENSIC HAZARD (Deep Red)"} & \text{if } \text{FinalCompositeScore} < 30 \end{cases}$$
2. **Composite Risk Schema:**
   ```typescript
   export interface CompositeRiskScoreOutput {
     symbol: string;
     pillarScores: {
       governanceScore: number; // 0-100
       financialRiskScore: number; // 0-100
       businessRiskScore: number; // 0-100
       legalRiskScore: number; // 0-100
       valuationRiskScore: number; // 0-100
       macroRiskScore: number; // 0-100
     };
     baseWeightedScore: number;
     governancePenaltyApplied: boolean;
     finalCompositeRiskScore: number;
     riskGrade: 'LOW_RISK' | 'MODERATE' | 'HIGH_RISK' | 'EXTREME_FORENSIC_HAZARD';
     primaryRiskDrivers: string[];
   }
   ```
3. **UI/UX State Enhancements:**
   - `Risk Waterfall Breakdown`: Waterfall chart displaying how each risk pillar contributed to or subtracted from the composite score.

---

### 7.9 `specs/company-page/risk/valuation-risk.md`
*(Prompt Reference: `regulatory-risk.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Valuation, Mathematical Rigor.

#### Critique & Institutional Analyst Workflow Perspective
The spec assesses valuation risk using spot multiples (P/E, EV/EBITDA). However, comparing a cyclical company's spot P/E to history is dangerous: at the peak of an earnings cycle, P/E looks artificially low ("value trap"), while at the trough, P/E looks high. Valuation risk must be measured using **multi-cycle z-scores** and **growth-adjusted metrics (PEG)** with explicit protections against negative earnings.

#### Concrete Actionable Modifications
1. **Valuation Multiples Z-Score & Normalization Formulation:**
   $$\text{Multiple Z-Score} = \frac{\text{Current Multiple} - \overline{\text{Multiple}}_{5\text{Y}}}{\sigma_{5\text{Y}}}$$
   $$\text{PEG Ratio} = \begin{cases} \frac{\text{P/E}}{\text{EPS CAGR}_{\text{Forward 3Y}}} & \text{if } \text{P/E} > 0 \text{ and } \text{EPS CAGR} > 0 \\ \text{undefined ("Negative Growth / Loss-Making")} & \text{otherwise} \end{cases}$$
   $$\text{Cyclically Adjusted EV/EBITDA} = \frac{\text{Current EV}}{\text{Normalized 5-Year Average EBITDA}}$$
2. **Valuation Risk Schema:**
   ```typescript
   export interface ValuationRiskMetrics {
     symbol: string;
     currentMultiples: {
       peTtm: number;
       peForward1Y: number;
       evEbitdaTtm: number;
       pbTtm: number;
     };
     historicalZScores5Year: {
       peZScore: number; // High risk if > +2.0
       evEbitdaZScore: number;
       pbZScore: number;
     };
     growthAdjustedMetrics: {
       forward3YearEpsCagrPct: number;
       pegRatio: number | 'UNDEFINED';
     };
     cyclicalOverheatingFlag: boolean; // Flag if EV/Normalized EBITDA > 2x spot EV/EBITDA
     marginOfSafetyToHistoricalMedianPct: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Historical Multiple Band Overlay`: Valuation band chart showing 5-year historical P/E trading bands ($\pm 1\sigma, \pm 2\sigma$) overlaid on the price chart.

---

## 8. Tab 6: Analysis & Catalysts Specifications (5 Specs)

### 8.1 `specs/company-page/analysis/concall-tracker.md`
*(Prompt Reference: `cost-structure.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, UI/UX Design, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec describes a customizable template for earnings call highlights. For institutional research speed, an analyst requires a structured **Call-over-Call delta tracking framework**. What changed between Q1 and Q2? Did management quietly reduce volume guidance, extend capex timelines, or change revenue tone from "robust demand" to "transitory headwinds"?

#### Concrete Actionable Modifications
1. **Structured Concall Extraction Schema:**
   ```typescript
   export interface ConcallQuarterlyRecord {
     id: string;
     symbol: string;
     quarter: string; // e.g. "Q2FY25"
     callDate: string;
     keyParticipants: string[]; // CEO, CFO, key analysts
     financialHighlightsReported: {
       revenueCr: number;
       ebitdaMarginPct: number;
       patCr: number;
     };
     guidanceUpdates: Array<{
       kpi: string;
       previousGuidance: string;
       revisedGuidance: string;
       revisionDirection: 'UPWARD_REVISION' | 'MAINTAINED' | 'DOWNWARD_CUT';
     }>;
     hardDivergenceLog: Array<{
       topic: string;
       managementClaim: string;
       subsequentReportedFact: string;
       divergenceSeverity: 'MINOR' | 'SIGNIFICANT_CONTRADICTION';
     }>;
     criticalQAndAExcerpts: Array<{
       analystName: string;
       institutionalFirm: string;
       questionSummary: string;
       managementAnswerSummary: string;
       clarityRating: 'DIRECT_TRANSPARENT' | 'EVASIVE_DEFLECTION' | 'UNANSWERED';
     }>;
   }
   ```
2. **UI/UX State Enhancements:**
   - `Call-over-Call Diff Visualizer`: Side-by-side text diff highlighting semantic additions and deletions in management guidance between consecutive quarters.

---

### 8.2 `specs/company-page/analysis/exit-checklist.md`
*(Prompt Reference: `exit-checklist.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Behavioral Finance, Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an exit checklist with status alerts. From a behavioral finance standpoint, analysts suffer from **endowment bias** and **disposition effect** (holding losers hoping to break even, cutting winners too early). The exit checklist must enforce pre-committed, immutable exit rules categorized into **Hard Stop Traps** (mandatory liquidation) vs **Soft Review Triggers** (re-underwrite thesis).

#### Concrete Actionable Modifications
1. **Pre-Committed Exit Rules Formulation:**
   $$\text{Hard Exit Triggers}: \begin{cases} \text{Auditor Resignation citing lack of cooperation} \\ \text{Promoter Pledge increases by } > 15\% \text{ in a single quarter} \\ \text{Operating Margin falls below predefined floor for 2 consecutive quarters} \\ \text{Debt covenant breach without lender waiver} \end{cases}$$
2. **Exit Checklist Schema:**
   ```typescript
   export interface ExitChecklistItem {
     id: string;
     conditionType: 'HARD_STOP_LIQUIDATE' | 'SOFT_THESIS_REVIEW';
     parameterCategory: 'GOVERNANCE' | 'OPERATIONAL_FINANCIAL' | 'VALUATION_TARGET' | 'OPPORTUNITY_COST';
     description: string;
     preCommittedThreshold: string;
     currentValue: string;
     triggered: boolean;
     dateTriggered?: string;
     analystOverrideReason?: string;
     requiresCioApprovalForOverride: boolean;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Hard Stop Mandatory Liquidation Modal`: If a `HARD_STOP_LIQUIDATE` trigger fires, display an unclosable full-screen alert requiring explicit analyst justification or triggering portfolio divestment.

---

### 8.3 `specs/company-page/analysis/ratio-analysis.md`
*(Prompt Reference: `efficiency.md` / `dupont.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS Schedule III), Mathematical Rigor, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec lists 25+ ratios across 6 categories but provides **zero mathematical formulas**, ignores Ind AS 116 lease distortion, and contains no guardrails against zero divisions or negative denominators.
- In Indian distressed equities, accumulated losses make Net Worth negative. Dividing negative PAT by negative Net Worth produces a **positive ROE**, falsely indicating high profitability!
- In debt-free companies, Finance Costs are zero, causing an uncaught division-by-zero crash in Interest Coverage Ratio.
- The spec omits the **5-Stage DuPont Decomposition**, which is the universal standard for dissecting whether ROE expansion was driven by operational margins, asset productivity, tax management, or balance sheet leverage.

#### Concrete Actionable Modifications
1. **Exact Mathematical Definitions & Forensic Guardrails:**
   - **Return on Equity (ROE) & 5-Stage DuPont:**
     $$\text{ROE} = \begin{cases} \frac{\text{PAT}}{\text{Average Net Worth}} & \text{if } \text{Net Worth} > 0 \\ \text{undefined ("Negative Net Worth / Solvency Distress")} & \text{if } \text{Net Worth} \le 0 \end{cases}$$
     $$\text{ROE} = \underbrace{\frac{\text{PAT}}{\text{PBT}}}_{\text{Tax Burden}} \times \underbrace{\frac{\text{PBT}}{\text{EBIT}}}_{\text{Interest Burden}} \times \underbrace{\frac{\text{EBIT}}{\text{Revenue}}}_{\text{Operating Margin}} \times \underbrace{\frac{\text{Revenue}}{\text{Avg Assets}}}_{\text{Asset Turnover}} \times \underbrace{\frac{\text{Avg Assets}}{\text{Avg Net Worth}}}_{\text{Financial Leverage}}$$
   - **Return on Capital Employed (ROCE):**
     $$\text{Capital Employed} = \text{Total Assets} - \text{Current Liabilities} = \text{Net Worth} + \text{Total Borrowings} + \text{Lease Liabilities}$$
     $$\text{ROCE} = \begin{cases} \frac{\text{EBIT}}{\text{Average Capital Employed}} & \text{if } \text{Capital Employed} > 0 \\ \text{undefined ("Negative Capital Employed")} & \text{if } \text{Capital Employed} \le 0 \end{cases}$$
   - **Interest Coverage Ratio (ICR):**
     $$\text{ICR} = \begin{cases} \frac{\text{EBIT}}{\text{Finance Costs}} & \text{if } \text{Finance Costs} > 0 \\ \infty \text{ ("Debt-Free")} & \text{if } \text{Finance Costs} = 0 \text{ and } \text{EBIT} > 0 \\ \text{undefined} & \text{if } \text{EBIT} \le 0 \end{cases}$$
   - **Working Capital & Turnover Ratios:**
     $$\text{Inventory Turnover} = \frac{\text{COGS}}{\text{Average Inventory}}$$
     $$\text{Debtor Days (DSO)} = \frac{\text{Average Trade Receivables}}{\text{Revenue from Operations}} \times 365$$
     $$\text{Creditor Days (DPO)} = \frac{\text{Average Trade Payables}}{\text{Cost of Materials Consumed / Purchases}} \times 365$$
     $$\text{Cash Conversion Cycle (CCC)} = \text{DIO} + \text{DSO} - \text{DPO}$$
2. **Ratio Engine API Schema:**
   ```typescript
   export interface ComprehensiveRatioReport {
     symbol: string;
     period: string;
     profitability: {
       roePct: number | 'NEGATIVE_NET_WORTH';
       rocePct: number | 'NEGATIVE_CAPITAL_EMPLOYED';
       grossMarginPct: number;
       ebitdaMarginPct: number;
       ebitMarginPct: number;
       netProfitMarginPct: number;
     };
     dupont5Stage: {
       taxBurdenRatio: number; // PAT / PBT
       interestBurdenRatio: number; // PBT / EBIT
       operatingMarginPct: number; // EBIT / Revenue
       assetTurnoverRatio: number; // Revenue / Assets
       equityMultiplierRatio: number; // Assets / Equity
     };
     leverageAndCoverage: {
       debtToEquity: number | 'NEGATIVE_EQUITY';
       netDebtToEbitda: number;
       interestCoverageRatio: number | 'DEBT_FREE' | 'LOSS_MAKING';
     };
     workingCapitalAndEfficiency: {
       inventoryDays: number;
       debtorDays: number;
       creditorDays: number;
       cashConversionCycleDays: number;
       assetTurnover: number;
       workingCapitalTurnover: number;
     };
   }
   ```
3. **UI/UX State Enhancements:**
   - `DuPont Interactive Tree`: Expandable visual flow demonstrating how changes in asset turnover and operating margin drive changes in ROE over time.

---

### 8.4 `specs/company-page/analysis/recent-events.md`
*(Prompt Reference: `recent-events.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, UI/UX Design, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an auto-sorted table of events. Institutional analysts need an **event-study price reaction overlay**: when a capacity addition or tax raid was disclosed, how did the stock price react over 1-day, 1-week, and 1-month periods relative to the benchmark? Furthermore, the tool lacks statutory classification under SEBI LODR Regulation 30.

#### Concrete Actionable Modifications
1. **Event Study & Price Overlay Schema:**
   ```typescript
   export interface CorporateEventStudyItem {
     id: string;
     timestamp: string;
     exchangeDisclosureId: string;
     eventType: 'EARNINGS_RESULT' | 'M_AND_A' | 'CAPACITY_COMMISSIONING' | 'REGULATORY_PENALTY' | 'TAX_DISPUTE' | 'MANAGEMENT_DEPARTURE';
     headline: string;
     priceReaction: {
       tPlus1DayReturnPct: number;
       tPlus1DayAlphaBps: number; // Stock return minus Nifty 50 return
       tPlus5DayReturnPct: number;
       tPlus30DayReturnPct: number;
     };
     analystActionTaken: 'NO_ACTION' | 'INCREASED_ESTIMATES' | 'TRIMMED_TARGET' | 'EXITED_POSITION';
   }
   ```
2. **UI/UX State Enhancements:**
   - `Chart Marker Overlay`: Direct visual markers (flags) on the price chart corresponding to each event entry with hover cards displaying event details and 1-day alpha.

---

### 8.5 `specs/company-page/analysis/turnaround-indicator.md`
*(Prompt Reference: `cash-flow.md`)*

#### Domain Lenses Evaluated
- Financials, Turnaround Forensics, Mathematical Rigor.

#### Critique & Institutional Analyst Workflow Perspective
The spec references a 5-pillar turnaround score without detailing the underlying indicators. A genuine corporate turnaround in India requires evidence across 5 specific quantitative hurdles:
1. **EBITDA Margin Inflection:** 2 consecutive quarters of margin expansion after a cyclical trough.
2. **CFO Inflection:** Operating Cash Flow turning positive and covering capex ($CFO > \text{Capex}$).
3. **Deleveraging / Debt Restructuring:** Significant reduction in debt or exit from restructuring / IBC resolution.
4. **Working Capital Release:** Sharp reduction in bloated inventory and receivables releasing trapped cash.
5. **Promoter / Governance Reboot:** Change in management or promoter capital infusion via warrants/equity.

#### Concrete Actionable Modifications
1. **Turnaround Quantitative Pillars Formulation:**
   $$\text{Turnaround Score} = \sum_{k=1}^5 (w_k \times H_k) \times 100$$
   where each hurdle $H_k \in \{0.0, 0.5, 1.0\}$:
   - $H_1$: $\text{EBITDA Margin Q-o-Q Expansion} \ge 2\text{ quarters}$
   - $H_2$: $\text{TTM CFO} > 0 \text{ and } \text{TTM CFO} > \text{TTM Capex}$
   - $H_3$: $\Delta \text{Gross Debt}_{\text{YoY}} < -10\%$
   - $H_4$: $\text{Cash Conversion Cycle Improvement} \ge 15\text{ days}$
   - $H_5$: $\text{Promoter Equity Infusion or Clean Auditor Opinion}$
2. **Turnaround Engine Schema:**
   ```typescript
   export interface TurnaroundIndicatorReport {
     symbol: string;
     compositeTurnaroundScore: number; // 0 - 100
     turnaroundStage: 'DISTRESS_NO_SIGN' | 'EARLY_OPERATIONAL_INFLECTION' | 'CONFIRMED_FINANCIAL_REPAIR' | 'FULLY_RESTORED';
     hurdleVerification: {
       marginInflectionPassed: boolean;
       fcfPositiveInflectionPassed: boolean;
       deleveragingPassed: boolean;
       workingCapitalReleasePassed: boolean;
       promoterCapitalInfusionPassed: boolean;
     };
     distressDistance: {
       altmanZScoreCurrent: number;
       altmanZScore2YearsAgo: number;
       interestCoverageCurrent: number;
     };
   }
   ```
3. **UI/UX State Enhancements:**
   - `Turnaround Signal Gauge`: Visual meter indicating whether the company has crossed the "Valley of Death" into sustainable positive cash generation.


---

## 9. Tab 7: Valuation Suite Specifications (6 Specs)

### 9.1 `specs/company-page/valuation/banking-valuation.md`
*(Prompt Reference: `margin-of-safety.md`)*

#### Domain Lenses Evaluated
- Financials (RBI Regulatory Norms / Schedule III Div III), Valuation Math, UI/UX.

#### Critique & Institutional Analyst Workflow Perspective
The spec applies generic P/B and ROE regressions. In Indian banking and NBFC analysis, **unadjusted Price-to-Book (P/BV) is invalid**:
1. **P/ABV Standard:** Indian banks are evaluated on **Price to Adjusted Book Value (P/ABV)**. Book value must be purged of Net Non-Performing Assets (Net NPAs), unhedged foreign currency exposures, and Net Deferred Tax Assets (DTA).
2. **DuPont RoA Tree for Banks:** ROE cannot be analyzed in isolation. It must be decomposed via the RBI banking DuPont tree:
   $$\text{RoA} = \text{Net Interest Margin (NIM)} + \text{Non-Interest Income Ratio} - \text{Cost-to-Income Drag} - \text{Credit Cost Ratio}$$
3. **Capital Adequacy (Basel III):** A bank with high ROE but low CET1 ($<11\%$) is constrained from growing without dilutive equity issuance.

#### Concrete Actionable Modifications
1. **Adjusted Book Value (ABV) & Bank Valuation Math:**
   $$\text{Net NPA} = \text{Gross NPA} - \text{Specific Provisions Held}$$
   $$\text{Adjusted Net Worth (ABV)} = \text{Reported Net Worth} - \text{Net NPAs} - \text{Net DTA} - \text{Subordinated Debt Treated as Equity}$$
   $$\text{Provision Coverage Ratio (PCR)} = \frac{\text{Specific Loan Loss Provisions}}{\text{Gross NPAs}} \times 100 \quad (\text{RBI benchmark } \ge 70\%)$$
   $$\text{Residual Income for Banks} = \text{ABV}_0 + \sum_{t=1}^n \frac{(\text{RoE}_t - K_e) \times \text{ABV}_{t-1}}{(1 + K_e)^t} + \frac{(\text{RoE}_{n+1} - K_e) \times \text{ABV}_n}{(K_e - g)(1 + K_e)^n}$$
2. **Banking Valuation Schema:**
   ```typescript
   export interface BankingValuationModel {
     symbol: string;
     reportingPeriod: string;
     regulatoryCapital: {
       cet1RatioPct: number; // Common Equity Tier 1 (RBI min: 8.0%)
       tier1CrarPct: number; // Min: 9.5%
       totalCrarPct: number; // Min: 11.5%
       riskWeightedAssetsCr: number;
     };
     assetQuality: {
       grossNpaCr: number;
       grossNpaPct: number;
       netNpaCr: number;
       netNpaPct: number;
       provisionCoverageRatioPct: number;
       slippageRatioPct: number; // Fresh NPAs / Opening Advances
       annualizedCreditCostBps: number; // Provisions / Average Advances
     };
     bookValueAdjustments: {
       reportedNetWorthCr: number;
       netNpaDeductionCr: number;
       adjustedBookValueCr: number;
       adjustedBvpsRupees: number;
     };
     valuationOutputs: {
       targetRoePct: number;
       costOfEquityPct: number;
       sustainablePriceToAbvMultiple: number;
       residualIncomeFairValuePerShare: number;
       currentMarketPriceToAbv: number;
       upsideDownsidePct: number;
     };
   }
   ```
3. **UI/UX State Enhancements:**
   - `Bank RoA Tree Visualizer`: Hierarchical flow diagram showing breakdown from Yield on Advances and Cost of Funds $\rightarrow$ NIM $\rightarrow$ RoA $\rightarrow$ RoE.

---

### 9.2 `specs/company-page/valuation/dcf-valuation.md`
*(Prompt Reference: `dcf-summary.md`)*

#### Domain Lenses Evaluated
- Valuation Mathematics, Ind AS 116, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec reduces DCF to a simplistic form with a single flat $FCF_0$ input. In institutional equity analysis, a DCF specification must resolve:
1. **FCFF Derivation Bridge:** Free cash flows must be rigorously bridged from EBIT, accounting for maintenance vs growth capex and lease principal payments.
2. **Mid-Year Discounting Convention:** Discounting cash flows assuming year-end receipt ($t=1, 2, \dots$) understates present value by $\sim 4-6\%$. Mid-year convention ($t - 0.5$) must be enforced.
3. **Singularity Guardrail:** When $WACC \le g$, Gordon Growth produces negative infinity or absurd values. The engine must throw an explicit parameter validation error.
4. **Enterprise-to-Equity Value Bridge:** Explicit treatment of Ind AS 116 lease liabilities, minority interest, investments, and surplus land.

#### Concrete Actionable Modifications
1. **Rigorous Multi-Stage FCFF & WACC Equations:**
   $$\text{FCFF}_t = \text{EBIT}_t \times (1 - t_{\text{tax}}) + \text{D\&A}_t - \text{Capex}_t - \Delta \text{Non-Cash Working Capital}_t$$
   $$\text{PV}(\text{FCFF}_t) = \frac{\text{FCFF}_t}{(1 + WACC)^{t - 0.5}} \quad (\text{Mid-Year Discounting})$$
   $$WACC = \left( \frac{E}{V} \times K_e \right) + \left( \frac{D}{V} \times K_d \times (1 - t_{\text{tax}}) \right)$$
   $$\text{where } K_e = R_f + \beta_{\text{levered}} \times ERP + \text{Company Specific Risk Premium}$$
   $$\text{Terminal Value (TV)} = \begin{cases} \frac{\text{FCFF}_n \times (1 + g_{\text{terminal}})}{WACC - g_{\text{terminal}}} & \text{if } WACC > g_{\text{terminal}} \\ \text{Error: Invalid Parameters (WACC } \le g) & \text{if } WACC \le g_{\text{terminal}} \end{cases}$$
   $$\text{Equity Value} = \text{EV} - \text{Total Debt} - \text{Lease Liabilities} - \text{Minority Interest} + \text{Cash \& Equivalents} + \text{Liquid Investments} + \text{Surplus Assets}$$
   $$\text{Fair Value Per Share} = \frac{\text{Equity Value}}{\text{Diluted Shares Outstanding (Treasury Method)}}$$
2. **DCF Engine API Schema:**
   ```typescript
   export interface DCFValuationParameters {
     symbol: string;
     projectionHorizonYears: number; // 5 - 10 years
     discountingConvention: 'MID_YEAR' | 'END_OF_YEAR';
     waccParameters: {
       riskFreeRatePct: number; // 10Y Indian G-Sec Yield (e.g. 7.0%)
       equityRiskPremiumPct: number; // India ERP (e.g. 6.0%)
       leveredBeta: number;
       companySpecificRiskPremiumPct: number;
       costOfDebtPreTaxPct: number;
       effectiveTaxRatePct: number;
       targetDebtToCapitalPct: number;
       calculatedWaccPct: number;
     };
     terminalParameters: {
       method: 'GORDON_GROWTH' | 'EXIT_MULTIPLE';
       terminalGrowthRatePct?: number; // Cap at India long-term nominal GDP growth (~6.0%)
       exitEvEbitdaMultiple?: number;
     };
     explicitProjections: Array<{
       yearIndex: number;
       calendarYear: string;
       ebitCr: number;
       effectiveTaxPct: number;
       nopatCr: number;
       depreciationAndAmortCr: number;
       capexCr: number;
       changeInNwcCr: number;
       fcffCr: number;
       discountFactor: number;
       presentValueFcffCr: number;
     }>;
     bridgeToEquityValue: {
       pvOfExplicitCashFlowsCr: number;
       pvOfTerminalValueCr: number;
       enterpriseValueCr: number;
       lessTotalDebtCr: number;
       lessLeaseLiabilitiesPost116Cr: number;
       lessMinorityInterestCr: number;
       addCashAndLiquidInvestmentsCr: number;
       addSurplusNonOperatingAssetsCr: number;
       equityValueCr: number;
       dilutedShareCountCr: number;
       impliedFairValuePerShare: number;
     };
     sensitivityTable: {
       waccSteps: number[]; // e.g. [10.5, 11.0, 11.5, 12.0, 12.5]
       growthSteps: number[]; // e.g. [3.5, 4.0, 4.5, 5.0, 5.5]
       fairValueGrid: number[][]; // Matrix of implied share prices
     };
   }
   ```
3. **UI/UX Interaction States:**
   - `Negative FCF Projection Warning`: In high-growth companies with negative near-term cash flows, display an indicator showing cumulative funding deficit and dilution requirements before self-funding inflection.

---

### 9.3 `specs/company-page/valuation/excess-return-valuation.md`
*(Prompt Reference: `implied-expectations.md`)*

#### Domain Lenses Evaluated
- Valuation Mathematics, Economic Theory, Financials.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an Excess Return / EVA model. However, it assumes a static capital charge and ignores the **Competitive Advantage Period (CAP)** fade. Economic theory and empirical finance prove that excess returns ($ROIC - WACC$) inevitably decay toward zero as competitive entry occurs. The model must implement a 3-stage fading excess return framework.

#### Concrete Actionable Modifications
1. **Fading Excess Return (EVA) Formulation:**
   $$\text{EVA}_t = \text{NOPAT}_t - (WACC \times \text{Invested Capital}_{t-1}) = (\text{ROIC}_t - WACC) \times \text{Invested Capital}_{t-1}$$
   $$\text{Firm Value} = \text{Invested Capital}_0 + \sum_{t=1}^T \frac{\text{EVA}_t}{(1 + WACC)^t} + \sum_{k=1}^M \frac{\text{EVA}_T \times (1 - \text{Fade Rate})^k}{(1 + WACC)^{T+k}}$$
   where $T$ is the explicit competitive advantage period (e.g. 10 years), and Fade Rate ($10-20\%$ per annum) models the erosion of economic rents.
2. **Excess Return Schema:**
   ```typescript
   export interface ExcessReturnValuationData {
     symbol: string;
     baseInvestedCapitalCr: number;
     waccPct: number;
     explicitYears: Array<{
       year: string;
       investedCapitalBeginningCr: number;
       nopatCr: number;
       roicPct: number;
       capitalChargeCr: number;
       economicValueAddedCr: number;
       presentValueEvaCr: number;
     }>;
     terminalFadeAssumptions: {
       fadeYears: number; // e.g. 10 years
       annualFadeRatePct: number; // e.g. 15%
       terminalSpreadAtInfinityPct: number; // 0.0% (returns equal WACC)
     };
     totalEquityValueCr: number;
     fairValuePerShare: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Economic Profit Horizon Graph`: Area chart showing annual EVA decaying over time toward the economic breakeven baseline ($EVA = 0$).

---

### 9.4 `specs/company-page/valuation/relative-valuation.md`
*(Prompt Reference: `comparable-multiples.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS 109), Fundamental Investor Logic, UI/UX Design.

#### Critique & Institutional Analyst Workflow Perspective
The spec defines relative peer multiples (P/E, EV/EBITDA, P/B). However, reported EBITDA in India is frequently distorted by **non-operating other income** (e.g. treasury MTM gains, interest on deposits, profit on asset sales). Furthermore, relative valuation is flawed during cyclical highs/lows unless normalized against 5-year averages.

#### Concrete Actionable Modifications
1. **Operating EV/EBITDA & Multi-Method Valuation Range Formulation:**
   $$\text{Operating EBITDA} = \text{Reported EBITDA} - \text{Other Non-Operating Income} + \text{Non-Recurring Operational Expenses}$$
   $$\text{Enterprise Value} = \text{Market Cap} + \text{Gross Debt} + \text{Lease Liabilities} - (\text{Cash} + \text{Liquid Current Treasury Investments})$$
   $$\text{Operating EV/EBITDA} = \frac{\text{Enterprise Value}}{\text{Operating EBITDA}}$$
2. **Football Field Valuation Summary Contract:**
   ```typescript
   export interface ValuationMethodologyBand {
     methodology: 'DCF_BASE_CASE' | 'OPERATING_EV_EBITDA' | 'PE_HISTORICAL_BAND' | 'SOTP' | '52_WEEK_MARKET_RANGE';
     lowFairValuePerShare: number;
     medianFairValuePerShare: number;
     highFairValuePerShare: number;
     currentMarketPrice: number;
     impliedUpsideDownsidePct: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Football Field Chart Component`: Interactive visual floating-bar chart plotting the valuation ranges across all valuation methodologies side-by-side with the Current Market Price line crossing through them.

---

### 9.5 `specs/company-page/valuation/sotp-valuation.md`
*(Prompt Reference: `target-price.md`)*

#### Domain Lenses Evaluated
- Financials (Conglomerate Holding Company Rules), Corporate Law, Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an SOTP table for conglomerates (e.g. Reliance, Tata Motors, L&T). However, it contains **three fatal institutional omissions**:
1. **Parent Ownership Multiplier:** Conglomerates rarely own 100% of all subsidiaries (e.g. RIL owns $\sim 67\%$ of Retail and Jio). Failure to multiply segment valuation by parent equity ownership percentage vastly overstates parent equity value.
2. **Holding Company (Holdco) Discount Convention:** In Indian markets, listed holdcos trade at a standard 30% to 60% discount to underlying NAV. For unlisted operating subsidiaries, a 10-25% conglomerate complexity discount applies.
3. **Unallocated Corporate Head Office Debt & Expenses:** Unallocated parent overheads must be capitalized and deducted from total equity value.

#### Concrete Actionable Modifications
1. **Rigorous SOTP Equity Bridge Math:**
   $$\text{Gross Segment Value}_i = \text{Segment Enterprise Value}_i \times \text{Parent Ownership Percentage}_i$$
   $$\text{Net Segment Value}_i = \text{Gross Segment Value}_i \times (1 - \text{Holdco Discount}_i)$$
   $$\text{Parent Consolidated Equity Value} = \sum_{i=1}^M \text{Net Segment Value}_i - \text{Parent Net Debt} - \text{PV of Corporate Overhead Costs}$$
   $$\text{Fair Value Per Share} = \frac{\text{Parent Consolidated Equity Value}}{\text{Parent Diluted Shares}}$$
2. **Conglomerate SOTP Schema:**
   ```typescript
   export interface ConglomerateSotpSegment {
     id: string;
     segmentName: string;
     valuationMethod: 'DCF' | 'EV_TO_EBITDA' | 'PE_RATIO' | 'PRICE_TO_BOOK' | 'LISTED_MARKET_CAP';
     isSeparatelyListed: boolean;
     listedScripCode?: string;
     operationalMetricValueCr: number; // e.g. Segment EBITDA
     appliedMultipleOrMethodValueCr: number;
     grossSegmentEvCr: number;
     segmentDebtCr: number;
     parentOwnershipStakePct: number; // Crucial: e.g. 67.0%
     holdingCompanyDiscountPct: number; // Standard: 0-20% for unlisted, 30-50% for listed holdco
     netAttributableValueCr: number;
   }

   export interface ConglomerateSotpBridge {
     symbol: string;
     segments: ConglomerateSotpSegment[];
     sumOfSegmentValuesCr: number;
     unallocatedParentHeadOfficeDebtCr: number;
     capitalizedCorporateOverheadCr: number; // PV of unallocated head office expenses
     finalConglomerateEquityValueCr: number;
     parentDilutedSharesCr: number;
     sotpFairValuePerShare: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Holdco Discount Sensitivity Matrix`: Table illustrating parent target price sensitivity across a 20% to 50% holding company discount range.

---

### 9.6 `specs/company-page/valuation/valuation-philosophy.md`
*(Prompt Reference: `historical-valuation.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Behavioral Finance, Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec treats valuation philosophy as narrative notes. Buy-side investment committees operate on the Michael Mauboussin / Alfred Rappaport principle: **"Do not forecast the future; calculate what the market price implies, and judge whether that expectation is feasible."** The tool must provide an automated **Reverse DCF (Expectations Investing)** engine that back-solves the market price into implied revenue growth and terminal operating margins.

#### Concrete Actionable Modifications
1. **Reverse DCF (Market Implied Expectations) Equations:**
   $$\text{Solve for } g_{\text{implied}} \text{ such that: } \text{DCF}(\text{Inputs}, g_{\text{implied}}) = \text{Current Market Price (CMP)}$$
   $$\text{Feasibility Gap} = g_{\text{implied}} - \text{Historical 5-Year Revenue CAGR}$$
   $$\text{Expectation Assessment} = \begin{cases} \text{"Priced for Perfection (Severe Downside Risk)"} & \text{if } g_{\text{implied}} > 2.0 \times \text{Industry Growth} \\ \text{"Reasonable Expectations (Fair Risk/Reward)"} & \text{if } 0.8 \times \text{Ind} \le g_{\text{implied}} \le 1.5 \times \text{Ind} \\ \text{"Priced for Disaster (High Asymmetric Upside)"} & \text{if } g_{\text{implied}} < 0.5 \times \text{Industry Growth} \end{cases}$$
2. **Reverse DCF Schema:**
   ```typescript
   export interface ReverseDCFExpectations {
     symbol: string;
     currentMarketPrice: number;
     impliedRevenueGrowthRateNext5YearsPct: number;
     historical5YearRevenueCagrPct: number;
     impliedTerminalEbitdaMarginPct: number;
     currentReportedEbitdaMarginPct: number;
     marketExpectationFeasibility: 'PRICED_FOR_PERFECTION' | 'NEUTRAL_CONSENSUS' | 'DISTRESSED_PESSIMISM';
     analystConvictionThesisSummary: string;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Market Implied vs Reality Gauge`: Interactive visual comparing what the market expects vs what the company has historically achieved.

---

## 10. Tab 8: Financials & Accounting Specifications (4 Specs)

### 10.1 `specs/company-page/financials/common-size-statement.md`
*(Prompt Reference: `financial-health.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS Schedule III Division II), UI/UX Design, Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines common-size statements. However, it fails to specify the dual denominator standard required by institutional analysts:
1. **P&L Common-Size:** All items must be expressed as a % of Revenue from Operations (Net Sales).
2. **Balance Sheet Common-Size:** All items must be expressed as a % of Total Assets (or Total Equity & Liabilities).
The tool lacks horizontal trend indexing (indexing Year 1 = 100 to visualize structural cost line expansions).

#### Concrete Actionable Modifications
1. **Vertical & Horizontal Common-Size Formulations:**
   $$\text{P\&L Vertical Common-Size (\%)} = \frac{\text{Line Item}_t}{\text{Revenue from Operations}_t} \times 100$$
   $$\text{Balance Sheet Vertical Common-Size (\%)} = \frac{\text{Asset / Liability Item}_t}{\text{Total Assets}_t} \times 100$$
   $$\text{Horizontal Base Index} = \frac{\text{Line Item}_t}{\text{Line Item}_{\text{Base Year}}} \times 100$$
2. **Common Size Data Contract:**
   ```typescript
   export interface CommonSizeRow {
     lineItemId: string;
     lineItemLabel: string;
     statementType: 'PL' | 'BALANCE_SHEET';
     rawValues: Record<string, number>; // "FY24": 8000
     verticalCommonSizePct: Record<string, number>; // "FY24": 18.5%
     horizontalIndexedBase100: Record<string, number>; // "FY20": 100, "FY24": 160
     fiveYearMedianPct: number;
     standardDeviationBps: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Dual View Toggle`: Quick switcher between `[Vertical % of Revenue/Assets]` and `[Horizontal Indexed Base 100]` with automatic row heatmap highlighting structural cost inflation.

---

### 10.2 `specs/company-page/financials/financial-statements.md`
*(Prompt Reference: `balance-sheet.md` / `income-statement.md` / `cash-flow-statement.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS Schedule III Div II & Div III), Forensic Accounting, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec provides a simplified financial statement viewer. In Indian equity research, financial statements must strictly comply with **Schedule III Division II (Ind AS)**:
1. **Line Item Omissions:** The current spec omits: (a) Revenue from Operations vs Other Income, (b) ROU Assets and Lease Liabilities under Ind AS 116, (c) Exceptional Items and Discontinued Operations under Ind AS 1, (d) Other Comprehensive Income (OCI - remeasurements of defined benefit pension plans, equity instruments via FVTOCI), and (e) Trade Payables split under MSMED Act 2006.
2. **Consolidated vs Standalone Switcher:** Essential for holding companies (e.g. Tata Motors, L&T) where standalone operations represent only a fraction of group earnings.
3. **Cross-Statement Integrity Checks:** Automatic verification of balance sheet balancing ($\text{Assets} = \text{Liabilities} + \text{Equity}$) and cash flow ending balance reconciliation.

#### Concrete Actionable Modifications
1. **Schedule III Division II Complete Financial Statement Architecture:**
   - **Statement of Profit & Loss:**
     - Revenue from Operations + Other Income = Total Income
     - Expenses: Cost of Materials Consumed + Purchases of Stock-in-Trade + Changes in Inventories of WIP/FG + Employee Benefit Expense + Finance Costs (Interest + Lease interest) + Depreciation & Amortization (PPE + ROU) + Other Expenses = Total Expenses
     - Profit before Exceptional Items & Tax $\rightarrow$ Exceptional Items $\rightarrow$ PBT $\rightarrow$ Tax Expense (Current Tax + Deferred Tax) $\rightarrow$ Profit for the Period (PAT)
     - Other Comprehensive Income (OCI) items not reclassified to P&L $\rightarrow$ Total Comprehensive Income
   - **Balance Sheet:**
     - Non-Current Assets: PPE, CWIP, Right-of-Use Assets (Ind AS 116), Goodwill, Other Intangible Assets, Financial Assets (Investments, Loans, Others), Deferred Tax Assets, Other Non-Current Assets
     - Current Assets: Inventories, Financial Assets (Investments, Trade Receivables, Cash & Cash Equivalents, Bank Balances other than cash, Loans, Others), Current Tax Assets, Other Current Assets
     - Equity: Equity Share Capital, Other Equity (Reserves & Surplus, OCI Reserves), Non-Controlling Interest
     - Non-Current Liabilities: Financial Liabilities (Borrowings, Lease Liabilities, Others), Provisions, Deferred Tax Liabilities
     - Current Liabilities: Financial Liabilities (Borrowings, Lease Liabilities, Trade Payables - MSME vs Non-MSME, Others), Other Current Liabilities, Provisions, Current Tax Liabilities
   - **Cash Flow Statement (Ind AS 7):**
     - Cash Flow from Operating Activities (Indirect method starting from PBT, adjustments for non-cash/non-operating items, working capital deltas, less direct taxes paid)
     - Cash Flow from Investing Activities (Capex, acquisition/sale of investments, interest/dividend received)
     - Cash Flow from Financing Activities (Proceeds/repayment of debt, lease liability principal payment, interest paid, dividends paid)
2. **Cross-Statement Mathematical Reconciliation Checks:**
   $$\text{Assets} - (\text{Liabilities} + \text{Equity}) = 0 \quad (\pm ₹0.01 \text{ Cr tolerance})$$
   $$\text{Ending Cash Balance}_{\text{CF}} = \text{Cash \& Cash Equivalents}_{\text{BS}} + \text{Bank Balances other than Cash}_{\text{BS}}$$
   $$\text{Ending Retained Earnings} = \text{Beginning Retained Earnings} + \text{PAT} - \text{Dividends Paid} \pm \text{OCI Transfers}$$
3. **Financial Statement Schema:**
   ```typescript
   export interface ScheduleIIIFinancialStatements {
     symbol: string;
     consolidationType: 'CONSOLIDATED' | 'STANDALONE';
     frequency: 'ANNUAL' | 'QUARTERLY';
     currencyUnit: 'INR_CRORES' | 'INR_LAKHS' | 'MILLIONS';
     auditStatus: 'AUDITED' | 'UNAUDITED_LIMITED_REVIEW';
     pl: {
       revenueFromOperations: number[];
       otherIncome: number[];
       costOfMaterialsConsumed: number[];
       employeeBenefitsExpense: number[];
       financeCosts: number[];
       depreciationAndAmortization: number[];
       otherExpenses: number[];
       exceptionalItems: number[];
       pbt: number[];
       currentTax: number[];
       deferredTax: number[];
       pat: number[];
       otherComprehensiveIncome: number[];
       totalComprehensiveIncome: number[];
       basicEpsRupees: number[];
       dilutedEpsRupees: number[];
     };
     balanceSheet: {
       propertyPlantEquipment: number[];
       capitalWip: number[];
       rightOfUseAssets: number[];
       intangibleAssets: number[];
       nonCurrentInvestments: number[];
       inventories: number[];
       tradeReceivables: number[];
       cashAndCashEquivalents: number[];
       totalAssets: number[];
       equityShareCapital: number[];
       otherEquityReserves: number[];
       nonCurrentBorrowings: number[];
       nonCurrentLeaseLiabilities: number[];
       currentBorrowings: number[];
       currentLeaseLiabilities: number[];
       tradePayablesMsme: number[];
       tradePayablesNonMsme: number[];
       totalLiabilitiesAndEquity: number[];
     };
     cashFlow: {
       cashFromOperatingActivitiesBeforeTax: number[];
       directTaxesPaid: number[];
       netCashFromOperatingActivities: number[];
       netCashUsedInInvestingActivities: number[];
       netCashFromFinancingActivities: number[];
       netChangeInCash: number[];
       closingCashAndEquivalents: number[];
     };
     reconciliationPassed: boolean;
   }
   ```
4. **UI/UX State Enhancements:**
   - `Consolidated / Standalone Toggle`: Prominent switcher in top header with visual notification when analyzing holding companies where standalone revenue is $<20\%$ of consolidated.
   - `Restatement Flag`: Visual icon adjacent to historical years indicating retrospective revisions under Ind AS 8 with modal showing restated deltas.

---

### 10.3 `specs/company-page/financials/revenue-projection.md`
*(Prompt Reference: `revenue-projection.md`)*

#### Domain Lenses Evaluated
- Financials, Economic Knowledge, Mathematical Rigor.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines top-down revenue projections with driver assumptions. Top-down percentage growth models are unreliable. Institutional research requires **Capacity-Constrained Unit Driver Modeling**:
$$\text{Revenue} = \text{Installed Capacity} \times \text{Capacity Utilization (\%)} \times \text{Blended Realization Per Unit}$$
If an analyst projects 25% revenue growth for a manufacturing firm already operating at 95% capacity utilization with no new capex coming online, the projection is physically impossible. The model must enforce capacity headroom limits.

#### Concrete Actionable Modifications
1. **Capacity Headroom & Driver-Based Projection Math:**
   $$\text{Maximum Feasible Volume}_t = \text{Existing Capacity}_t + \text{New Commissioned Capacity}_t \times \text{Operational Ramp-Up (\%階)}$$
   $$\text{Projected Volume}_t = \min(\text{Unconstrained Demand Volume}_t, \text{Maximum Feasible Volume}_t \times \text{Max Peak Utilization Ceiling (e.g. 95\%)})$$
   $$\text{Projected Segment Revenue}_t = \text{Projected Volume}_t \times \text{Projected Realization}_t$$
2. **Driver-Based Projection Schema:**
   ```typescript
   export interface DriverBasedSegmentProjection {
     segmentName: string;
     installedCapacityUnits: number;
     unitLabel: string; // e.g. "Metric Tons", "Cases", "Active Ports"
     upcomingCapacityExpansions: Array<{
       commissioningDate: string;
       additionalUnits: number;
     }>;
     projectedYears: Array<{
       year: string;
       projectedCapacityUtilizationPct: number; // Cap at 95%
       projectedVolume: number;
       projectedRealizationPerUnitRupees: number;
       realizationGrowthPct: number;
       segmentRevenueCr: number;
       segmentEbitdaMarginPct: number;
       segmentEbitdaCr: number;
     }>;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Capacity Ceiling Breach Warning`: Red visual alert highlighting projection years where demand exceeds physical plant capacity without capex additions.

---

### 10.4 `specs/company-page/financials/segment-breakup.md`
*(Prompt Reference: `segment-breakup.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS 108 Operating Segments), UI/UX Design, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines a basic segment revenue table. Under **Ind AS 108**, companies must disclose: (1) Segment Revenue (including inter-segment transfers), (2) Segment Results (EBIT), and (3) Segment Capital Employed (Segment Assets minus Segment Liabilities). In multi-segment businesses (e.g. ITC - Cigarettes vs FMCG vs Hotels vs Paperboards), analyzing segment revenue without Segment ROCE obscures where capital is being destroyed.

#### Concrete Actionable Modifications
1. **Ind AS 108 Segment Return Metrics Formulation:**
   $$\text{Segment ROCE (\%)} = \frac{\text{Segment EBIT}}{\text{Segment Capital Employed}} \times 100$$
   $$\text{Capital Employed Share (\%)} = \frac{\text{Segment Capital Employed}}{\sum \text{Segment Capital Employed}} \times 100$$
   $$\text{EBIT Profit Share (\%)} = \frac{\text{Segment EBIT}}{\sum \text{Segment EBIT}} \times 100$$
2. **Ind AS 108 Segment Schema:**
   ```typescript
   export interface IndAS108SegmentRecord {
     symbol: string;
     period: string;
     segments: Array<{
       segmentId: string;
       segmentName: string;
       externalRevenueCr: number;
       interSegmentRevenueCr: number;
       totalSegmentRevenueCr: number;
       segmentEbitCr: number;
       segmentEbitMarginPct: number;
       segmentAssetsCr: number;
       segmentLiabilitiesCr: number;
       segmentCapitalEmployedCr: number;
       segmentRocePct: number;
       capexInvestedInSegmentCr: number;
     }>;
     unallocatedCorporateExpensesCr: number;
     unallocatedCorporateAssetsCr: number;
     totalConsolidatedRevenueCr: number;
     totalConsolidatedEbitCr: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Segment Profit vs Capital Bubble Chart`: Scatter chart showing Segment Capital Employed (X-axis) vs Segment ROCE (Y-axis) with bubble size representing Segment Revenue, identifying cash-cows vs capital-draining divisions.


---

## 11. Tab 9: SME & Forensics Specifications (12 Specs)

### 11.1 `specs/company-page/sme/assess-auditor.md`
*(Prompt Reference: `sme-governance.md`)*

#### Domain Lenses Evaluated
- Financials (SEBI LODR Reg 33, Companies Act 2013 Sec 139-144), Forensic Auditing.

#### Critique & Institutional Analyst Workflow Perspective
In Indian SME microcaps (BSE SME / NSE Emerge), auditor credibility is the single most critical gating filter. The current spec tracks basic fee ratios but misses three statutory determinants:
1. **ICAI Peer Review Certificate (SEBI LODR Reg 33(1)(d)):** A listed company's quarterly and annual financial statements must be audited by an auditor holding a valid certificate issued by the Peer Review Board of the ICAI. Many microcap auditors lack this, rendering filings non-compliant.
2. **SEBI Auditor Resignation Circular (CIR/CFD/CMD1/114/2019):** If an auditor resigns mid-term within 45 days of a quarter end, they are legally required to issue the limited review/audit report for that quarter prior to resignation. Reasons for resignation must be vetted for management non-cooperation.
3. **Audit Fee Disproportion:** In SMEs, audit fees growing $>50\%$ faster than revenue suggests either hush-money or massive accounting complexity; conversely, audit fees $< ₹2 \text{ Lakh}$ for a $> ₹100 \text{ Cr}$ revenue company indicate a rubber-stamp audit.

#### Concrete Actionable Modifications
1. **Auditor Forensic Scoring Formulation:**
   $$\text{Auditor Quality Score (0-100)} = 100 - \sum \text{Deduction Points}$$
   $$\text{Deductions}: \begin{cases} -50 & \text{if No Valid ICAI Peer Review Certificate (SEBI LODR 33 Violation)} \\ -40 & \text{if Mid-Term Resignation in past 3 years} \\ -30 & \text{if CARO Clause (xxi) qualifications present} \\ -20 & \text{if Non-Audit Fees } > 25\% \text{ of Total Fees (Sec 144 breach risk)} \\ -25 & \text{if Fee per Crore Turnover } < ₹2,000 \text{ (Superficial Audit Risk)} \end{cases}$$
2. **Auditor Assessment Schema:**
   ```typescript
   export interface SMEAuditorForensicAudit {
     symbol: string;
     statutoryAuditorFirm: string;
     firmRegistrationNumber: string; // ICAI FRN (e.g. "123456N")
     leadPartnerName: string;
     membershipNumber: string;
     hasValidIcAIPeerReviewCertificate: boolean; // Mandated under SEBI LODR 33(1)(d)
     peerReviewCertificateExpiryDate?: string;
     firmTenureYears: number; // Max 10 years (Companies Act 139)
     partnerTenureYears: number; // Max 5 years
     feesBreakdown: {
       auditFeesCr: number;
       taxationAndCertificationFeesCr: number;
       otherNonAuditServicesCr: number;
       nonAuditFeePct: number;
       auditFeePerCroreOfRevenueRupees: number;
     };
     historicalResignationsInLast5Years: Array<{
       resignedAuditorFirm: string;
       dateOfResignation: string;
       timingRelativeToEndOfQuarterDays: number;
       reasonStatedInAnnexureA: string;
       managementDisagreementReported: boolean;
     }>;
     caroAdverseClausesCount: number;
     auditorIntegrityGrade: 'TOP_TIER_CREDIBLE' | 'LOCAL_PEER_REVIEWED' | 'HIGH_RISK_SUSPECT' | 'STATUTORY_NON_COMPLIANT';
   }
   ```
3. **UI/UX State Enhancements:**
   - `Statutory Violation Alert`: Prominent red warning banner if `hasValidIcAIPeerReviewCertificate === false` with prompt: "Regulatory Hazard: Auditor lacks ICAI Peer Review Certificate — high risk of NSE/BSE trading suspension".

---

### 11.2 `specs/company-page/sme/board-structure.md`
*(Prompt Reference: `key-person-risk.md`)*

#### Domain Lenses Evaluated
- Corporate Law (Companies Act 2013 Sec 149/152), SEBI LODR, Governance.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an informal board table. In SME listings, promoters frequently populate the board with family members, relatives, or dummy directors to meet formal quota requirements. Institutional analysis requires explicit tracking of: (1) Family relationship nexus among board members, (2) Independent director pecuniary relationships, and (3) Attendance records at board meetings and AGMs.

#### Concrete Actionable Modifications
1. **Board Governance Compliance Schema:**
   ```typescript
   export interface SMEBoardGovernanceAudit {
     symbol: string;
     boardComposition: Array<{
       directorName: string;
       din: string;
       category: 'PROMOTER_EXECUTIVE' | 'PROMOTER_FAMILY_NON_EXEC' | 'INDEPENDENT' | 'PROFESSIONAL_KMP';
       relatedToPromoterByBloodOrMarriage: boolean;
       sharesHeldCount: number;
       remunerationCr: number;
       meetingAttendancePct: number; // Last 12 months (Alert if < 75%)
       attendedLastAgm: boolean;
       otherDirectorshipsCount: number;
       isCharteredAccountantOrFinancialExpert: boolean;
     }>;
     auditCommitteeComposition: {
       totalMembers: number;
       independentMembersCount: number;
       independentChair: boolean;
       isTwoThirdsIndependent: boolean; // Mandated under SEBI LODR 18
     };
     keyPersonRiskScore: 'LOW_INSTITUTIONALIZED' | 'MODERATE_SUCCESSION_PLAN_NEEDED' | 'EXTREME_PROMOTER_DEPENDENT';
   }
   ```
2. **UI/UX State Enhancements:**
   - `Family Tree & Board Nexus Map`: Visual diagram highlighting family relationships and common directorship linkages among board members.

---

### 11.3 `specs/company-page/sme/company-info.md`
*(Prompt Reference: `ipo-details.md`)*

#### Domain Lenses Evaluated
- BSE SME / NSE Emerge Exchange Rules, Market Microstructure, Liquidity.

#### Critique & Institutional Analyst Workflow Perspective
The spec handles generic IR details. However, SME companies trade under fundamentally different exchange microstructure rules than mainboard stocks:
1. **Minimum Trading Lot Size:** Under SEBI SME guidelines, shares trade in standardized lots (e.g. 1,000 to 4,000 shares, typically valued between ₹1,00,000 and ₹1,50,000 per lot). Retail participation is constrained, causing severe bid-ask spreads.
2. **Market Maker Obligations:** SEBI ICDR Chapter IX requires the lead manager/market maker to provide continuous 2-way quotes for a minimum of 3 years from listing date.
3. **Anchor Investor Lock-in:** 50% of anchor allocation is locked for 30 days, remaining 50% for 90 days.

#### Concrete Actionable Modifications
1. **SME Exchange Microstructure Schema:**
   ```typescript
   export interface SMEExchangeMicrostructure {
     symbol: string;
     tradingPlatform: 'BSE_SME' | 'NSE_EMERGE';
     listingDate: string;
     ipoDetails: {
       issuePriceRupees: number;
       issueSizeCr: number;
       freshIssueCr: number;
       offerForSaleCr: number;
       retailSubscriptionX: number;
       qibSubscriptionX: number;
       hniSubscriptionX: number;
       leadMerchantBanker: string;
     };
     microstructureRules: {
       tradingLotSize: number; // e.g. 1,200 shares
       minimumOrderValueRupees: number; // Lot size * CMP
       bidAskSpreadPct: number;
       marketMakerFirm: string;
       marketMakerInventoryShares: number;
       marketMakerObligationExpiryDate: string; // 3 years from listing
       isCircuitLimitApplicable: boolean; // Typically 5% or 10% daily band
     };
     anchorLockinSchedule: Array<{
       tranchePct: number; // 50%
       sharesLocked: number;
       expiryDate: string;
       isUnlocked: boolean;
     }>;
   }
   ```
2. **UI/UX State Enhancements:**
   - `Lot Sizing Calculator`: Input tool converting target investment amounts into executable whole lot increments (e.g., target ₹5,00,000 = 4 lots of 1,200 shares at ₹104 CMP = ₹4,99,200).

---

### 11.4 `specs/company-page/sme/cost-breakup.md`
*(Prompt Reference: `lot-size.md`)*

#### Domain Lenses Evaluated
- Financials (Ind AS Schedule III), Industrial Economics, Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an informal cost table. In SME manufacturing companies, operating margins are hypersensitive to **raw material price spikes** and **power & fuel tariffs**. A minor increase in commodity costs wipes out thin microcap margins unless raw material contracts are back-to-back or index-linked.

#### Concrete Actionable Modifications
1. **Raw Material Pass-Through Elasticity Formulation:**
   $$\text{Raw Material Cost Ratio (\%)} = \frac{\text{Cost of Materials Consumed}}{\text{Revenue from Operations}} \times 100$$
   $$\text{Margin Sensitivity} = \frac{\Delta \text{EBITDA Margin (bps)}}{\Delta 100\text{ bps increase in Key Raw Material Price}}$$
2. **SME Cost Structure Schema:**
   ```typescript
   export interface SMECostStructureAudit {
     symbol: string;
     reportingPeriod: string;
     costBreakdownCr: {
       rawMaterialsConsumedCr: number;
       powerAndFuelExpensesCr: number;
       freightAndLogisticsCr: number;
       employeeBenefitsCr: number;
       subContractingJobWorkChargesCr: number;
       otherOperatingExpensesCr: number;
     };
     top3RawMaterialInputs: Array<{
       materialName: string;
       pctOfTotalRawMaterials: number;
       isDomesticallySourced: boolean;
       importTariffOrDutyRisk: string;
       pricingPassThroughContractStatus: 'IMMEDIATE_INDEXED' | 'QUARTERLY_RESET_LAG' | 'FIXED_PRICE_NO_PASS_THROUGH';
     }>;
     powerCostPerUnitRupees?: number;
     captivePowerGenerationPct?: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Raw Material Inflation Sensitivity Bar`: Gauge showing EBITDA margin degradation under 5%, 10%, and 20% raw material cost inflation.

---

### 11.5 `specs/company-page/sme/customer-concentration.md`
*(Prompt Reference: `customer-concentration.md`)*

#### Domain Lenses Evaluated
- Forensic Accounting, SEBI LODR, Credit Risk.

#### Critique & Institutional Analyst Workflow Perspective
The spec analyzes top customer concentration percentages. In Indian SME forensics, **customer concentration is frequently a facade for circular billing or related-party revenue round-tripping**. If an SME reports that 45% of its revenue comes from a single customer whose receivables are $>180$ days overdue, the revenue is suspect. The tool must correlate customer concentration with **receivables aging** and **promoter cross-holdings**.

#### Concrete Actionable Modifications
1. **Customer Concentration & Forensic Integrity Formulation:**
   $$\text{Concentration Hazard Index} = \text{Top 1 Customer Share (\%)} \times \left( \frac{\text{Debtor Days of Top 1 Customer}}{60} \right)$$
   $$\text{Hazard Flags}: \begin{cases} \text{Circular Billing Alert} & \text{if Top 1 Share } > 30\% \text{ and Receivables Overdue } > 180\text{ days} \\ \text{Related Party Conflict} & \text{if Top Customer is Registered at Common RoC Address / Common Director} \end{cases}$$
2. **Customer Concentration Forensic Schema:**
   ```typescript
   export interface SMECustomerConcentrationAudit {
     symbol: string;
     topCustomers: Array<{
       customerRank: number;
       maskedOrDisclosedName: string;
       cinOrPanAvailable: boolean;
       isRelatedPartyEntity: boolean; // Crucial check
       revenueContributionCr: number;
       pctOfTotalRevenue: number;
       contractedCreditDays: number;
       actualDaysToCollect: number;
       overdueReceivablesExceeding180DaysCr: number;
       receivablesCollectionRisk: 'NORMAL' | 'ELEVATED' | 'HIGH_DEFAULT_OR_FABRICATION_RISK';
     }>;
     top5ConcentrationPct: number;
     top10ConcentrationPct: number;
     hasCustomerBankruptcyHistoryInLast3Years: boolean;
   }
   ```
3. **UI/UX State Enhancements:**
   - `Receivables Overdue Callout`: High-visibility red tag on customer rows where overdue receivables exceed 180 days with direct link to ECL provisioning.

---

### 11.6 `specs/company-page/sme/financial-health.md`
*(Prompt Reference: `working-capital.md`)*

#### Domain Lenses Evaluated
- Forensic Accounting, Ind AS 7 (Cash Flows), Tax Reconciliation.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines templates for financial health. In microcaps, the primary forensic red flags are:
1. **Cumulative CFO vs Cumulative EBITDA Divergence:** Over a 3-5 year window, if $\sum \text{CFO} < 0.6 \times \sum \text{EBITDA}$, operating profits are sitting in uncollected receivables or inventory build-up.
2. **Cash Tax Paid Divergence:** If P&L reports high tax expense, but the Cash Flow statement shows minimal actual direct taxes paid to the government, reported profits are often fabricated.
3. **Capitalization of Operating Costs:** Concealing revenue expenses in Capital Work in Progress (CWIP) or Intangibles.

#### Concrete Actionable Modifications
1. **Forensic Divergence Tests Math:**
   $$\text{CFO-to-EBITDA Conversion Ratio} = \frac{\sum_{t=1}^5 \text{CFO}_t}{\sum_{t=1}^5 \text{EBITDA}_t} \quad (\text{Threshold: } \ge 0.70 \text{ Clean, } < 0.50 \text{ Extreme Hazard})$$
   $$\text{Tax Divergence Ratio} = \frac{|\text{Tax Paid in Cash Flow Statement} - \text{Current Tax Expense in P\&L}|}{\text{Current Tax Expense in P\&L}} \times 100$$
   $$\text{Depreciation Adequacy Ratio} = \frac{\text{Depreciation Expense}_t}{\text{Gross Block of PPE}_t} \times 100 \quad (\text{Flag if } < 5\% \text{ for plant/machinery heavy})$$
2. **SME Financial Health Schema:**
   ```typescript
   export interface SMEFinancialHealthForensics {
     symbol: string;
     divergenceMetrics: {
       fiveYearCumulativeEbitdaCr: number;
       fiveYearCumulativeCfoCr: number;
       cfoToEbitdaRatio: number; // Red flag if < 0.60
       fiveYearReportedPatCr: number;
       fiveYearCumulativeFcffCr: number;
       cashTaxPaidVsPlTaxDivergencePct: number; // Red flag if > 25%
       depreciationRateOnGrossBlockPct: number;
     };
     qualityOfEarningsScore: number; // 0 - 100
     earningsQualityClassification: 'PRISTINE_CASH_BACKED' | 'MODERATE_ACCRUAL_DRAG' | 'HIGH_ACCURAL_MANIPULATION_RISK';
     auditorQualificationCount3Years: number;
   }
   ```
3. **UI/UX State Enhancements:**
   - `CFO vs EBITDA Cumulative Divergence Area Chart`: Visual gap area between cumulative operating profit and cumulative realized cash flow. Red shading indicates unrealized paper earnings.

---

### 11.7 `specs/company-page/sme/investment-checklist.md`
*(Prompt Reference: `migration-readiness.md`)*

#### Domain Lenses Evaluated
- BSE SME / NSE Emerge Migration Guidelines, SEBI Regulations.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines a generic behavioral checklist. For institutional investors participating in the Indian SME space, the most lucrative exit catalyst is **Migration from the SME Exchange to the Mainboard (BSE / NSE)**, which unlocks institutional QIB liquidity and eliminates the restrictive trading lot size. The checklist must enforce statutory migration criteria.

#### Concrete Actionable Modifications
1. **Mainboard Migration Statutory Rules Formulation:**
   Under BSE SME & NSE Emerge Migration Guidelines:
   $$\text{Rule 1 (Paid-up Capital)}: \text{Post-issue paid-up capital must be } \ge ₹10 \text{ Cr and } \le ₹25 \text{ Cr (Mandatory if } > ₹25 \text{ Cr})$$
   $$\text{Rule 2 (Net Worth)}: \text{Net Worth must be } \ge ₹15 \text{ Cr (BSE) or } \ge ₹25 \text{ Cr (NSE) for last 2 years}$$
   $$\text{Rule 3 (Profitability)}: \text{Operating Profit \& PAT must be positive in at least 2 of the last 3 fiscal years}$$
   $$\text{Rule 4 (Shareholder Base)}: \text{Minimum 250 public shareholders as of record date}$$
   $$\text{Rule 5 (Shareholder Approval)}: \text{Special Resolution passed by at least 2/3 of Non-Promoter Shareholders}$$
2. **Migration Readiness Schema:**
   ```typescript
   export interface MainboardMigrationReadiness {
     symbol: string;
     currentPlatform: 'BSE_SME' | 'NSE_EMERGE';
     listingTenureYears: number; // Minimum 2 years required
     statutoryCriteriaCheck: {
       paidUpEquityCapitalCr: number; // Must be >= 10 Cr and <= 25 Cr
       tangibleNetWorthCr: number; // Must be >= 15 Cr (BSE) or >= 25 Cr (NSE)
       consecutivePositivePatYears: number; // Must be >= 2
       minimumPublicShareholdersCount: number; // Must be >= 250
       nonPromoterTwoThirdsApprovalFeasibility: boolean;
       noRegulatoryDebarmentOrBseNseSanctions: boolean;
     };
     overallMigrationReadinessScore: number; // 0 - 100
     estimatedMigrationTimelineMonths: number;
     liquidityExpansionCatalystRating: 'HIGH_IMMINENT_MIGRATION' | 'MEDIUM_PROGRESSING' | 'LONG_TERM_UNREADY';
   }
   ```
3. **UI/UX State Enhancements:**
   - `Migration Progress Roadmap Tracker`: 5-step milestone stepper verifying each statutory criterion with green checks or red blockers.

---

### 11.8 `specs/company-page/sme/mgmt-compensation.md`
*(Prompt Reference: `promoter-background.md`)*

#### Domain Lenses Evaluated
- Corporate Law (Companies Act 2013 Sec 197), Governance Forensics.

#### Critique & Institutional Analyst Workflow Perspective
The spec lists compensation numbers and median employee multiples. In Indian microcaps, promoters frequently extract capital through **excessive managerial remuneration exceeding the statutory ceiling under Section 197 of the Companies Act 2013**:
- Total managerial remuneration for all executive directors cannot exceed **11% of Net Profits** (computed under Section 198).
- Remuneration for a single Managing Director cannot exceed **5% of Net Profits** without a special resolution.
- In loss-making companies, remuneration is strictly capped by Section II of Part II of Schedule V based on effective capital.

#### Concrete Actionable Modifications
1. **Section 197 Ceiling Compliance Formulation:**
   $$\text{Managerial Remuneration Share (\%)} = \frac{\sum \text{Executive Director Remuneration}}{\text{Net Profit under Section 198}} \times 100$$
   $$\text{Statutory Violation Flag} = \begin{cases} \text{BREACH} & \text{if } \text{Remuneration Share} > 11.0\% \text{ without Central Govt / Shareholder Special Resolution} \\ \text{COMPLIANT} & \text{if } \text{Remuneration Share} \le 11.0\% \end{cases}$$
2. **Management Compensation Schema:**
   ```typescript
   export interface SMEManagementCompensationAudit {
     symbol: string;
     netProfitUnderSection198Cr: number;
     totalManagerialRemunerationCr: number;
     remunerationAsPctOfSection198Profit: number; // Flag if > 11%
     isLossMakingCompany: boolean;
     scheduleVCapComplianceVerified: boolean;
     directorsCompensation: Array<{
       directorName: string;
       designation: string;
       fixedSalaryCr: number;
       commissionCr: number;
       perquisitesAndBenefitsCr: number;
       totalCompensationCr: number;
       medianEmployeeSalaryRupees: number;
       multipleOfMedianEmployeeSalary: number; // e.g. 85x
       yearOnYearIncreasePct: number;
     }>;
     promoterFamilyRemunerationCr: number;
     promoterFamilyRemunerationPctOfPat: number; // Severe red flag if > 30%
   }
   ```
3. **UI/UX State Enhancements:**
   - `Statutory Remuneration Ceiling Warning`: Prominent alert if executive pay exceeds 11% of net profits or if remuneration increased while PAT declined.

---

### 11.9 `specs/company-page/sme/on-ground-research.md`
*(Prompt Reference: `anchor-investors.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic (Philip Fisher Scuttlebutt), Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec provides unstructured field notes. Institutional scuttlebutt requires a **standardized channel-check verification framework** across: (1) Dealers/Distributors (inventory push, credit terms, discounting), (2) Customers (product quality, warranty claims), (3) Competitors (pricing rivalry, factory operating rates), and (4) Ex-employees (internal morale, attrition, management ethics).

#### Concrete Actionable Modifications
1. **Scuttlebutt Channel-Check Schema:**
   ```typescript
   export interface SMEScuttlebuttLog {
     id: string;
     symbol: string;
     visitDate: string;
     channelType: 'DEALER_DISTRIBUTOR' | 'END_CUSTOMER' | 'SUPPLIER_VENDOR' | 'COMPETITOR' | 'EX_EMPLOYEE';
     locationCity: string;
     contactDesignationMasked: string;
     keyFindings: {
       demandTrendObservation: 'STRONG_SURGE' | 'STABLE_HEALTHY' | 'SLUGGISH_ACCUMULATING_STOCK' | 'SEVERE_DROP';
       dealerDiscountingAndRebates: 'NORMAL' | 'AGGRESSIVE_DISCOUNTING' | 'REDUCING_CREDIT_PERIOD';
       productQualityComplaints: 'NONE' | 'ISOLATED' | 'CHRONIC_DEFECTS';
       channelInventoryDaysObserved: number;
       promoterReputationFeedback: 'HIGH_INTEGRITY' | 'AGGRESSIVE_FINANCIALLY' | 'UNRELIABLE_PAYMENTS';
     };
     credibilityScore: 1 | 2 | 3 | 4 | 5;
     analystVerificationNotes: string;
   }
   ```
2. **UI/UX State Enhancements:**
   - `Channel Sentiment Gauge`: Aggregated sentiment score synthesized from all dealer and supplier field checks.

---

### 11.10 `specs/company-page/sme/other-forensics.md`
*(Prompt Reference: `peer-multiples.md`)*

#### Domain Lenses Evaluated
- Forensic Accounting (Companies Act Sec 186, Ind AS 37), CARO 2020.

#### Critique & Institutional Analyst Workflow Perspective
The spec acts as a catch-all for forensic checks. In Indian equity diligence, this module must explicitly audit:
1. **Section 186 Inter-Corporate Loans & Investments:** Has the company loaned money to third parties, LLPs, or entities outside its core business?
2. **Capital Work in Progress (CWIP) Aging Schedule:** Under MCA amendments, companies must disclose CWIP aging ($<1\text{y}$, $1-2\text{y}$, $2-3\text{y}$, $>3\text{y}$) and projects with cost/time overruns. Chronic CWIP without commissioning indicates operating expenses are being capitalized to inflate profits.
3. **Contingent Liabilities to Net Worth Ratio.**

#### Concrete Actionable Modifications
1. **CWIP & Section 186 Forensic Formulations:**
   $$\text{CWIP-to-Gross Block Ratio (\%)} = \frac{\text{Capital Work in Progress}}{\text{Gross Block of PPE}} \times 100 \quad (\text{Flag if } > 40\% \text{ for extended periods})$$
   $$\text{Overdue CWIP Exceeding 2 Years Share (\%)} = \frac{\text{CWIP Aging } > 2\text{ Years}}{\text{Total CWIP}} \times 100 \quad (\text{Threshold: } > 20\% \implies \text{Impairment Risk})$$
2. **Comprehensive Other Forensics Schema:**
   ```typescript
   export interface SMEOtherForensicsAudit {
     symbol: string;
     cwipAgingAnalysis: {
       totalCwipCr: number;
       cwipAsPctOfGrossBlock: number;
       agingScheduleCr: {
         lessThan1Year: number;
         oneToTwoYears: number;
         twoToThreeYears: number;
         moreThanThreeYears: number; // Red flag: stalled project
       };
       hasProjectsTemporarilySuspended: boolean;
       potentialCapitalizedOpexHazard: boolean;
     };
     section186InterCorporateLoans: {
       totalLoansAndGuaranteesCr: number;
       asPctOfNetWorth: number; // Statutory ceiling: 60% of paid-up capital + reserves or 100% of free reserves
       hasLoansToPromoterConnectedEntities: boolean;
       averageInterestRateChargedPct: number; // Flag if < G-Sec yield (subsidized siphoning)
     };
     statutoryAuditorRemarks: {
       hasCaroClauseIiiLoanDefaultRemarks: boolean;
       hasCaroClauseIxDefaultInRepaymentRemarks: boolean;
       hasCaroClauseXviiCashLossesRemarks: boolean;
     };
     compositeOtherForensicsRiskGrade: 'CLEAN' | 'CAUTION_MONITOR' | 'HIGH_HAZARD';
   }
   ```
3. **UI/UX State Enhancements:**
   - `CWIP Aging Breakdown Stacked Bar`: Visual bar chart illustrating the proportion of CWIP stuck for $>2$ years.

---

### 11.11 `specs/company-page/sme/promoter-forensics.md`
*(Prompt Reference: `order-book.md`)*

#### Domain Lenses Evaluated
- Corporate Law (Companies Act 2013 Sec 90 SBO Rules), SEBI SAST.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines an org chart. In Indian SME forensics, the critical risk is **opaque holding structures and circular corporate guarantees**:
1. **Significant Beneficial Ownership (SBO):** Tracing the individual human beings holding economic rights through layers of holding companies, trusts, and LLPs.
2. **Cross-Corporate Guarantees:** Did the listed company guarantee debt for an unlisted private entity belonging to the promoter?
3. **Insolvency (NCLT) & Cheque Bounce (Sec 138 NI Act) Records.**

#### Concrete Actionable Modifications
1. **Promoter Group & SBO Architecture Schema:**
   ```typescript
   export interface SMEPromoterForensicStructure {
     symbol: string;
     promoterGroupEntitiesCount: number;
     significantBeneficialOwners: Array<{
       individualName: string;
       nationality: string;
       dinOrPanMasked: string;
       directShareholdingPct: number;
       indirectBeneficialHoldingPct: number;
       totalEffectiveControlPct: number;
       registeredUnderSboRules: boolean;
     }>;
     interEntityGuarantees: Array<{
       guarantorEntity: string;
       beneficiaryEntity: string; // Flag if private promoter co
       guaranteeAmountCr: number;
       isSecuredByListedCompanyAssets: boolean;
       approvalObtainedUnderLODR23: boolean;
     }>;
     litigationRecords: {
       hasActiveSection138ChequeBounceCases: boolean;
       hasNcltInsolvencyPetitionsFiledByCreditors: boolean;
       hasDrtDebtRecoveryProceedings: boolean;
       promoterCibilScoreBand?: 'EXCELLENT' | 'GOOD' | 'SUB_PRIME_WARNING' | 'DEFAULT';
     };
   }
   ```
2. **UI/UX State Enhancements:**
   - `Beneficial Ownership Tree`: Interactive D3 graph showing ultimate human owners, holding companies, and cross-corporate guarantees in distinct colors.

---

### 11.12 `specs/company-page/sme/wc-breakup.md`
*(Prompt Reference: `liquidity-tracker.md`)*

#### Domain Lenses Evaluated
- Financials (MSMED Act 2006, Section 43B(h)), Schedule III, Banking Norms.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines a working capital breakup. However, it contains **critical regulatory and mathematical oversights**:
1. **MSME 45-Day Rule (Section 43B(h) of Income Tax Act):** Introduced in Finance Act 2023, payments to registered MSME suppliers delayed beyond 45 days (or 15 days without agreement) are disallowed as tax deductions in that fiscal year, causing huge unexpected tax penalties.
2. **Schedule III Debtor & Creditor Aging:** Mandatory disclosure of ageing: Undisputed vs Disputed, $<6\text{m}$, $6\text{m}-1\text{y}$, $1-2\text{y}$, $2-3\text{y}$, $>3\text{y}$. Receivables $>180\text{ days}$ are high default risks.
3. **Payables Days Formula Correction:** Line 114 divides payables by COGS. Payables represent raw material purchases, power, and services. Payables should be divided by **Purchases / Cost of Materials Consumed**, not COGS.
4. **Bank Drawing Power (DP):** SME working capital is bounded by bank-approved Drawing Power:
   $$DP = (\text{Eligible Stock} \times (1 - \text{Margin})) + (\text{Eligible Debtors } < 90\text{ Days} \times (1 - \text{Margin}))$$

#### Concrete Actionable Modifications
1. **Mathematical Formulation & Regulatory Calculations:**
   $$\text{Payables Days (Corrected)} = \frac{\text{Average Trade Payables}}{\text{Cost of Materials Consumed} + \text{Purchases of Stock-in-Trade}} \times 365$$
   $$\text{MSME Payables Overdue Drag} = \text{Trade Payables to MSME Outstanding } > 45\text{ Days}$$
   $$\text{Section 43B(h) Disallowance Exposure} = \text{MSME Overdue Payables} \times \text{Corporate Tax Rate (25.17\%)階}}$$
2. **SME Working Capital Aging Schema:**
   ```typescript
   export interface SMEWorkingCapitalAgingAudit {
     symbol: string;
     period: string;
     cashConversionCycleDays: number;
     receivablesAging: {
       totalTradeReceivablesCr: number;
       undisputedLessThan6MonthsCr: number;
       undisputed6MonthsTo1YearCr: number;
       undisputed1To2YearsCr: number;
       undisputed2To3YearsCr: number;
       undisputedMoreThan3YearsCr: number; // Red flag
       disputedTradeReceivablesCr: number;
       expectedCreditLossProvisionCr: number;
       netReportedTradeReceivablesCr: number;
     };
     payablesAgingAndMsmeCompliance: {
       totalTradePayablesCr: number;
       tradePayablesDueToMicroAndSmallEnterprisesCr: number;
       tradePayablesDueToOtherSuppliersCr: number;
       msmeDuesDelayedExceeding45DaysCr: number; // Section 43B(h) tax disallowance risk
       interestPayableUnderMsmedActCr: number;
     };
     bankWorkingCapitalFacilities: {
       sanctionedCashCreditLimitCr: number;
       bankAssessedDrawingPowerCr: number;
       actualCcOdUtilizationCr: number;
       drawingPowerUtilizationPct: number; // Severe stress if > 95%
     };
   }
   ```
3. **UI/UX State Enhancements:**
   - `43B(h) Tax Disallowance Threat Banner`: Warning badge displaying potential disallowance and cash penalty if MSME dues exceed 45 days.

---

## 12. Tab 10: Downsides & Hedging Specifications (3 Specs)

### 12.1 `specs/company-page/downsides/forensic-analysis.md`
*(Prompt Reference: `stress-test.md`)*

#### Domain Lenses Evaluated
- Forensic Mathematics, Ind AS 7, Turnaround Theory.

#### Critique & Institutional Analyst Workflow Perspective
The spec aggregates Beneish M-Score, Altman Z-Score, and Piotroski F-Score. However, it exhibits **two severe model specification errors**:
1. **Altman Z-Score Model Misapplication:** The original Altman Z-Score ($Z = 1.2 X_1 + 1.4 X_2 + 3.3 X_3 + 0.6 X_4 + 0.999 X_5$) was calibrated strictly on US manufacturing firms. When applied to Indian service companies, IT, consumer retail, or financial institutions, it produces false distress alarms. For non-manufacturing and emerging markets, the **Altman $Z''$-Score** must be used. Altman models must be completely disabled for Banks and NBFCs.
2. **Beneish M-Score Ind AS Accruals Calibration:** The Total Accruals to Total Assets (TATA) variable must be computed using Operating Cash Flow derived from Ind AS 7, not US GAAP adjustments.

#### Concrete Actionable Modifications
1. **Altman $Z''$-Score (Emerging Markets & Non-Manufacturing) Math:**
   $$Z'' = 6.56 X_1 + 3.26 X_2 + 6.72 X_3 + 1.05 X_4 + 3.25$$
   where:
   - $X_1 = \frac{\text{Working Capital}}{\text{Total Assets}}$
   - $X_2 = \frac{\text{Retained Earnings}}{\text{Total Assets}}$
   - $X_3 = \frac{\text{EBIT}}{\text{Total Assets}}$
   - $X_4 = \frac{\text{Book Value of Equity}}{\text{Total Liabilities}}$
   $$\text{Classification}: \begin{cases} Z'' < 4.15 & \text{Distress Zone (High Insolvency Risk)} \\ 4.15 \le Z'' \le 5.85 & \text{Grey Zone} \\ Z'' > 5.85 & \text{Safe Zone} \end{cases}$$
2. **Beneish M-Score 8-Variable Ind AS Formulation:**
   $$\text{M-Score} = -4.84 + (0.920 \times \text{DSRI}) + (0.528 \times \text{GMI}) + (0.404 \times \text{AQI}) + (0.892 \times \text{SGI}) + (0.115 \times \text{DEPI}) - (0.172 \times \text{SGAI}) + (4.037 \times \text{TATA}) + (0.0327 \times \text{LVGI})$$
   $$\text{where } \text{TATA} = \frac{\text{Net Income from Continuing Operations} - \text{CFO}_{\text{Ind AS 7}}}{\text{Total Assets}}$$
   $$\text{Threshold}: \text{M-Score} > -1.78 \implies \text{High Probability of Earnings Manipulation (Red Flag)}$$
3. **Forensic Suite Schema:**
   ```typescript
   export interface IntegratedForensicDashboardData {
     symbol: string;
     entityType: 'COMMERCIAL_CORPORATE' | 'BANKING' | 'NBFC';
     altmanModelUsed: 'ALTMAN_Z_MANUFACTURING' | 'ALTMAN_Z_DOUBLE_PRIME_EMERGING' | 'NOT_APPLICABLE_FINANCIAL';
     altmanZScore: number | 'DISABLED_FOR_BANKS';
     altmanZone: 'SAFE' | 'GREY' | 'DISTRESS' | 'NOT_APPLICABLE';
     beneishMScore: {
       score: number;
       isManipulationLikely: boolean; // True if > -1.78
       variables: {
         dsri: number; // Days Sales in Receivables Index
         gmi: number; // Gross Margin Index
         aqi: number; // Asset Quality Index
         sgi: number; // Sales Growth Index
         depi: number; // Depreciation Index
         sgai: number; // SGA Expenses Index
         lvgi: number; // Leverage Index
         tata: number; // Total Accruals to Total Assets
       };
     };
     piotroskiFScore: {
       score: number; // 0 - 9
       fGrade: 'STRONG_8_9' | 'MEDIOCRE_5_7' | 'WEAK_0_4';
       binaryTestBreakdown: Record<string, boolean>;
     };
     compositeForensicRiskSummary: 'CLEAN_UNMANIPULATED' | 'ACCRUAL_WARNING' | 'SEVERE_DISTRESS_FRAUD_RISK';
   }
   ```
4. **UI/UX State Enhancements:**
   - `Financial Sector Exception State`: For Banks and NBFCs, disable Altman and Beneish with clear indicator: "Altman Z and Beneish M-Score models are disabled for Financial Institutions due to balance sheet structure. Please consult Bank Asset Quality & PCR metrics in the Valuation tab."

---

### 12.2 `specs/company-page/downsides/hedging-mechanism.md`
*(Prompt Reference: `downside-risks.md`)*

#### Domain Lenses Evaluated
- NSE Equity Derivatives Microstructure, Risk Management Math.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines hedging mechanisms conceptually. In Indian stock markets (NSE):
1. **F&O Eligibility Restriction:** Only $\sim 180$ large/liquid stocks trade in the NSE Single-Stock Futures & Options segment. Mid-cap, small-cap, and SME stocks **do not have single-stock derivatives**.
2. **Beta-Hedging Mechanics:** For non-F&O stocks or illiquid options, institutional risk managers hedge portfolio risk using **Beta-Adjusted Index Futures or Puts (Nifty 50 / Nifty Bank)**.
3. **Cost of Hedging:** Rollover basis drag, dividend discount adjustments, and option time-decay ($\theta$).

#### Concrete Actionable Modifications
1. **NSE Beta-Hedging Equations:**
   $$\text{Single-Stock F\&O Eligible}: \begin{cases} \text{Direct Put Purchase / Covered Call} & \text{if Stock is in NSE F\&O List} \\ \text{Beta-Adjusted Index Hedge} & \text{if Stock is NOT in NSE F\&O List} \end{cases}$$
   $$\text{Beta-Adjusted Index Futures Contracts} = \frac{\text{Position Value (₹)} \times \beta_{\text{stock}}}{\text{Nifty Futures Index Value} \times \text{Nifty Lot Size (25 shares)}}$$
   $$\text{Basis Cost / Rollover Drag (\%)} = \frac{\text{Futures Price} - \text{Spot Price}}{\text{Spot Price}} \times \left( \frac{365}{\text{Days to Expiry}} \right)$$
2. **Hedging Architecture Schema:**
   ```typescript
   export interface InstitutionalHedgingStrategy {
     symbol: string;
     isNseFoEligible: boolean;
     stockBetaVsNifty50: number;
     stockBetaVsNiftyBank?: number;
     directSingleStockDerivative?: {
       lotSize: number;
       atmPutStrike: number;
       atmPutPremiumRupees: number;
       impliedVolatilityPct: number;
       putProtectionCostAnnualizedPct: number;
     };
     proxyIndexHedgeStrategy: {
       recommendedIndex: 'NIFTY_50' | 'NIFTY_BANK' | 'NIFTY_FIN_SERVICE';
       indexCurrentLevel: number;
       indexLotSize: number;
       requiredIndexLotsToFullyHedgePosition: number;
       estimatedMonthlyRolloverDragBps: number;
       residualBasisRiskCorrelationPct: number;
     };
     collarStrategyOption?: {
       longPutStrike: number;
       shortCallStrike: number;
       netDebitCreditRupees: number;
     };
   }
   ```
3. **UI/UX State Enhancements:**
   - `F&O Eligibility Pill`: Badge showing `NSE F&O ACTIVE` or `NON-F&O STOCK (INDEX HEDGE REQUIRED)`.

---

### 12.3 `specs/company-page/downsides/key-events.md`
*(Prompt Reference: `anti-thesis.md`)*

#### Domain Lenses Evaluated
- Fundamental Investor Logic, Risk Management, Data Plumbing.

#### Critique & Institutional Analyst Workflow Perspective
The spec outlines monitoring key exit events. In professional portfolio management, an analyst needs an automated **Downside Anti-Thesis Catalyst Calendar**. What specific future events could trigger a catastrophic thesis break? (e.g. USFDA plant re-inspection date, Supreme Court tax hearing, expiration of patent, customer contract renewal, debt maturity cliff).

#### Concrete Actionable Modifications
1. **Anti-Thesis Event Calendar Schema:**
   ```typescript
   export interface AntiThesisEventMonitoring {
     symbol: string;
     upcomingBinaryEvents: Array<{
       id: string;
       scheduledDate: string;
       eventType: 'USFDA_INSPECTION_OAI_RISK' | 'SUPREME_COURT_TAX_HEARING' | 'PATENT_CLIFF_EXPIRATION' | 'KEY_CLIENT_RENEWAL' | 'DEBT_REFINANCING_DEADLINE';
       description: string;
       bullOutcomeProbability: number;
       bearOutcomeProbability: number;
       estimatedDownsideIfBearCaseTriggersPct: number;
       associatedExitChecklistTriggerId: string;
       status: 'MONITORING_ACTIVE' | 'RESOLVED_FAVORABLE' | 'TRIGGERED_THESIS_BREACH';
     }>;
   }
   ```
2. **UI/UX State Enhancements:**
   - `Event Countdown Radar`: Visual countdown timer highlighting upcoming binary regulatory and legal event dates with risk severity colors.

---

## 13. Implementation Roadmap & Hermes Priority Matrix

To execute these recommendations cleanly, Hermes should follow this sequenced 3-stage sprint architecture:

```mermaid
graph TD
    A[Phase 1: P0 Core Accounting & Math Engine] --> B[Phase 2: P1 Regulatory & Schema Ingestion]
    B --> C[Phase 3: P2 Terminal UI/UX & Interaction States]
    
    subgraph "Phase 1: P0 Critical Mathematical & Accounting Fixes"
        A1[Ind AS 116 Lease Normalization Layer]
        A2[Negative Denominator Guardrails in ROE/ROCE/ROIIC]
        A3[DCF Mid-Year Discounting & Singularity Guards]
        A4[Banking P/ABV & Net NPA Deductions]
        A5[SOTP Conglomerate Parent Stake & Holdco Discounts]
        A6[SME Section 43B(h) & MSME Payables Math]
    end
    
    subgraph "Phase 2: P1 Regulatory & Data Schemas"
        B1[Schedule III Div II vs Div III State Machine]
        B2[SEBI LODR 23 RPT & LODR 31 Shareholding Enums]
        B3[ICAI Peer Review Verification for SME Auditors]
        B4[CARO 2020 Forensic Clause Tagging]
        B5[BSE SME / NSE Emerge Mainboard Migration Rules]
    end
    
    subgraph "Phase 3: P2 Interaction Design & Workflows"
        C1[Bloomberg/FactSet High-Density UI Polish]
        C2[Loading Skeleton, Empty, Error, and Zero-Revenue States]
        C3[DuPont 5-Stage Interactive Flow Tree]
        C4[Football Field Valuation Summary Chart]
        C5[F&O Eligibility & Beta-Hedging Calculator]
    end
```

### 13.1 Prioritized Implementation Sprints

#### Sprint 1: P0 — Critical Mathematical & Accounting Core (Immediate Priority)
- **Financial Statements (`financials/financial-statements.md`):** Implement Schedule III Division II complete line item schema, Ind AS 116 lease normalization layer, and mathematical cross-statement balancing validation.
- **Ratio Analysis (`analysis/ratio-analysis.md`):** Implement full formulas for 25+ ratios, 5-Stage DuPont decomposition, and explicit negative denominator guardrails ($ROE, ROCE, ICR$).
- **Capital Allocation (`management/capital-allocation.md`):** Correct Incremental ROIC (ROIIC) denominator flip bug ($\Delta \text{Invested Capital} \le 0$) and capitalize Ind AS 116 leases.
- **DCF Valuation (`valuation/dcf-valuation.md`):** Implement multi-stage FCFF derivation, mid-year discounting convention ($t-0.5$), $WACC \le g$ singularity check, and complete Enterprise-to-Equity value bridge.
- **Banking Valuation (`valuation/banking-valuation.md`):** Transition to Price to Adjusted Book Value (P/ABV) with Net NPA and DTA deductions, Basel III CET1 tracking, and Bank DuPont RoA tree.
- **SOTP Valuation (`valuation/sotp-valuation.md`):** Enforce Parent Economic Ownership Percentage ($Ownership\%$), Holdco discount convention (30-50%), and corporate head office debt bridge.
- **SME Working Capital (`sme/wc-breakup.md`):** Correct payables turnover formula, implement Section 43B(h) MSME overdue rules, and Schedule III debtor aging.
- **Forensic Suite (`downsides/forensic-analysis.md`):** Implement Altman $Z''$-Score for emerging markets and non-manufacturing; calibrate Beneish M-Score for Ind AS 7 accruals; disable Altman for banks.

#### Sprint 2: P1 — Statutory & Regulatory Schema Ingestion
- **Auditor Governance (`sme/assess-auditor.md`):** Add ICAI Peer Review Certificate check under SEBI LODR 33(1)(d) and SEBI mid-term resignation tracking.
- **Shareholding Pattern (`management/shareholding-pattern.md`):** Ingest SEBI SAST Reg 31 encumbrances (NDU, liens), SBO rules under Companies Act Sec 90, and Minimum Public Shareholding (MPS) 25% float rules.
- **Governance Risk & Red Flags (`risk/governance-risk.md`, `management/red-flags.md`):** Map SEBI LODR Reg 23 material RPT thresholds, CARO 2020 reporting clauses, and Section 197 managerial compensation limits.
- **Mainboard Migration (`sme/investment-checklist.md`):** Automate BSE SME and NSE Emerge migration readiness rules.
- **NSE Hedging (`downsides/hedging-mechanism.md`):** Add NSE F&O eligibility detection and Beta-adjusted Nifty Index hedging calculations.

#### Sprint 3: P2 — Terminal UI/UX & Interaction States
- **Terminal Interaction States:** Build standardized `LoadingSkeleton`, `EmptyDocAICTA`, `ErrorRetry`, and `ZeroRevenue/LossMaking` state machines across all 59 widgets.
- **Interactive Visualizers:** Build DuPont Interactive Flow Tree, Football Field Valuation Range Chart, Reverse DCF Expectations Slider, and Value Chain Profit Pool Sankey.
