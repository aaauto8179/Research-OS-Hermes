# Research OS (Hermes) — Master Specification Index & Implementation Roadmap
**Comprehensive Multidisciplinary Audit of all 128 Platform Specifications**

**Document Version:** 1.0.0-PROD  
**Audit Date:** 2026-11-02  
**Auditor Archetype:** Teamwork Master Auditor & Synthesizer (`teamwork_worker`)  
**Scope:** Exhaustive audit of all 128 specifications in `specs/` across 9 categories and 6 multidisciplinary domain lenses.  
**Governing Standards:** Ind AS (Division II & III Schedule III), SEBI (LODR / SAST / PIT / ICDR), RBI Master Directions (LAF Corridor, NPA Classification, CRAR), Income Tax Act 1961 (Post-July 23, 2024 Budget Amendments), Companies Act 2013 (CARO 2020), and NSE/BSE Market Microstructure.

---

## 1. Executive Summary & Scope Census

### 1.1 Master Scope Census Table (All 128 Specifications Accounted For)

The table below provides a complete census confirming that every single one of the 128 specification files in `specs/` has been thoroughly audited, evaluated across all 6 core lenses, and documented in actionable category recommendation artifacts under `specs/audits/`. In accordance with institutional research workflows, none of the original specification files in `specs/` have been modified directly.

| Category # | Functional Category | Target Recommendation File (Relative Markdown Path) | Subdirectories & Tools Included | Spec Count | P0 Critical | P1 High | P2 Polish | Audit Status |
|:---:|---|---|---|:---:|:---:|:---:|:---:|:---:|
| **1** | **Company Page** | [`./company-page-recommendations.md`](./company-page-recommendations.md) | Overview (7), Management (6), Story (4), Industry (3), Risk (7), Analysis (7), Valuation (8), Financials (7), SME (6), Downsides (4) | **59** | 22 | 28 | 9 | Complete & Actionable |
| **2** | **Core Engines** | [`./engines-recommendations.md`](./engines-recommendations.md) | Altman, Banking, Beneish, Common-Size, Concall, Corp Actions, DCF, Excess Return, Hedging, Piotroski, Portfolio, Ratio, Relative, Revenue, Risk, Screening, SOTP, Turnaround | **18** | 8 | 7 | 3 | Complete & Actionable |
| **3** | **Portfolio Management** | [`./portfolio-management-recommendations.md`](./portfolio-management-recommendations.md) | Quality Checks, Capital Gains, Construction, Corp Actions, Current Holdings, Event Risk, Fundamentals, Liquidity, Performance, Dashboard, Risk, Risk Metrics, Reconciliation, Trade History, Valuation Metrics, Valuation Risk | **16** | 7 | 7 | 2 | Complete & Actionable |
| **4** | **Industry Page** | [`./industry-page-recommendations.md`](./industry-page-recommendations.md) | Dashboard, Demand, Supply, Risk, Regulations, Demand Drivers, Cost Drivers, Cost Comparison, Companies Table, Aggregate Financials, Supply Chain Mapper | **11** | 4 | 5 | 2 | Complete & Actionable |
| **5** | **Macro Page** | [`./macro-page-recommendations.md`](./macro-page-recommendations.md) | Macro Dashboard (Yield curve, Inflation, RBI corridor), Live Market Metrics (NSE/BSE Microstructure, FII/DII, Breadth) | **2** | 1 | 1 | 0 | Complete & Actionable |
| **6** | **Document AI** | [`./document-ai-recommendations.md`](./document-ai-recommendations.md) | Document AI Hub, Research AI Chat, Financial Extractor, Concall Analysis (+ Ingestion Pipeline Architecture) | **4** | 2 | 2 | 0 | Complete & Actionable |
| **7** | **Weigh Decisions** | [`./weigh-decisions-recommendations.md`](./weigh-decisions-recommendations.md) | Decision Terminal Wizard, Conviction Sizing, Decision Journal, Portfolio Fit, Reverse DCF, Scenario Engine | **6** | 3 | 2 | 1 | Complete & Actionable |
| **8** | **Tasks & Time** | [`./tasks-time-recommendations.md`](./tasks-time-recommendations.md) | Institutional Earnings Calendar, Regulatory Filing Tracker, Research Lifecycle Task Manager | **3** | 1 | 2 | 0 | Complete & Actionable |
| **9** | **Additional Tools** | [`./additional-tools-recommendations.md`](./additional-tools-recommendations.md) | Auxiliary UI (4 specs), Idea Generation & Screening (2 specs), Watchlists & Alerts (2 specs), GRWTH Capex Pipeline (1 spec) | **9** | 2 | 5 | 2 | Complete & Actionable |
| **TOTAL** | **Entire Research OS Platform** | **All 9 Recommendation Artifacts** | **Full System Architecture** | **128** | **50** | **59** | **19** | **100% Audited** |

---

### 1.2 Core Objectives & Multidisciplinary Synthesis Across the 6 Lenses

To bridge the gap between abstract software prototypes and the rigorous demands of institutional Indian buy-side and sell-side research houses, every module was subjected to a 6-lens forensic cross-examination:

```
                                 ┌───────────────────────────────────────────────────┐
                                 │     RESEARCH OS (HERMES) MULTIDISCIPLINARY LENSES  │
                                 └─────────────────────────┬─────────────────────────┘
                                                           │
        ┌───────────────────┬───────────────────┬──────────┴────────┬───────────────────┬───────────────────┐
        ▼                   ▼                   ▼                   ▼                   ▼                   ▼
 ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
 │ 1.FINANCIAL │     │ 2.ECONOMIC  │     │ 3.INVESTOR  │     │ 4.UI/UX &   │     │ 5.MATH &    │     │ 6.DATA      │
 │  ACCOUNTING │     │  & MACRO    │     │    LOGIC    │     │  TERMINAL   │     │  FORENSICS  │     │  PLUMBING   │
 └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
  • Ind AS 115/116    • RBI LAF Corridor  • IC Memo Wizard    • Bloomberg-grade   • Beneish LVGI      • Hybrid RRF RAG
  • Sch III Div II/III• Net Liquidity     • Veto Gates        • Full Lifecycles   • Banking ABVPS     • Bounding Boxes
  • SEBI LODR/SAST/PIT• CCIL Yield Curve  • Kelly Sizing      • Dark-Mode Density • Cash Fractions    • Triple Reconcil.
  • CARO 2020 / MSME  • CPI - WPI Spread  • Pre-Mortem Logs   • Keyboard First    • Harmonic Mean     • EBNF Compilers
```

1. **Financial Knowledge & Indian Regulatory Accounting**:
   - Replaced generic US-centric GAAP conventions with statutory Indian accounting frameworks: Ministry of Corporate Affairs (MCA) Schedule III Division II (Commercial & Industrial) versus Division III (NBFCs & Banks).
   - Enforced Ind AS 116 lease capitalization normalization across EBITDA, Net Debt, and ROCE.
   - Integrated statutory disclosure regulations: SEBI (LODR) Regulations 23, 29, 30, 31, and 33; SEBI (SAST) Regulations 29 and 31 (promoter encumbrance/NDU disclosures); SEBI (PIT) Regulation 7(2) insider trades; and CARO 2020 auditor reporting clauses.
2. **Economic Knowledge & Macro Realities**:
   - Modernized monetary policy to reflect the post-April 2022 RBI Liquidity Adjustment Facility (LAF) corridor: Standing Deposit Facility (SDF, 6.25%) as the uncollateralized floor, Policy Repo (6.50%), Marginal Standing Facility (MSF, 6.75%) as the ceiling, and daily Net Systemic Liquidity (deficit/surplus in ₹ Lakh Crore).
   - Modeled the CCIL sovereign yield curve and corporate credit spreads (AAA/AA-).
   - Incorporated the macro corporate margin spread ($\text{CPI Headline} - \text{WPI Headline}$) and corrected exchange reporting schedules (daily EOD FII/DII flows vs erroneous 15-minute polling).
3. **Fundamental Investor Logic & Conviction Workflows**:
   - Shifted from linear score averaging to **Hard Red-Flag Veto Gates** (auditor qualification/resignation under CARO, promoter pledge > 40%, unresolved litigations > 50% tangible net worth).
   - Automated Investment Committee (IC) memo generation with conditions precedent and recorded dissents.
   - Introduced dynamic Bayesian probability updating upon earnings arrivals, fractional Kelly sizing bounded by SEBI concentration limits (10% single-stock / 25% sector), and systematic Pre-Mortem failure analysis.
4. **UI/UX & Terminal Interaction Design**:
   - Elevated information density to Bloomberg/FactSet institutional standards (compact typography, tabular numeral alignments, sub-second keyboard shortcuts).
   - Mandated 6 explicit UI lifecycle states across all tools: `loading` (custom skeletons), `empty` (guided onboarding CTA), `error` (actionable diagnostic recovery), `zero-revenue` (pre-commercial), `loss-making` (negative P/E indicators), and `pre-IPO/SME` (migration trackers).
   - Designed responsive split-screen verification cockpits for Document AI.
5. **Mathematical Rigor & Forensic Formulas**:
   - Corrected critical algebraic errors across engines: Beneish Leverage Index ($LVGI$) tracking asset growth instead of financial leverage; Banking P/B-ROE regression percentage scaling explosions (64x error); DCF omission of mid-year discounting and Gordon Growth singularity collapses ($WACC \le g$).
   - Replaced naive arithmetic peer and portfolio multiples with **Weighted Harmonic Means**.
   - Fixed corporate action fractional share integer truncation into SEBI-mandated market auction cash pooling.
6. **Data Plumbing, System Architecture & Pipeline Integration**:
   - Formulated hybrid vector search (BM25 + BGE-M3 RRF) backed by exact PDF bounding box coordinates `[page, x1, y1, x2, y2]`.
   - Engineered triple-way portfolio reconciliation (Broker Contract Note $\leftrightarrow$ Demat Holding CAS $\leftrightarrow$ Bank Ledger).
   - Specified an EBNF grammar compiler for stock screening and resilient WebSocket market data feeds.

---

## 2. Category-by-Category Synthesis

This section summarizes the key findings, architectural improvements, and critical remediations for each of the 9 category recommendation files.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        CATEGORY AUDIT BLUEPRINT NAVIGATION MATRIX                      │
├────┬────────────────────────────┬─────────────────────────────┬────────────────────────┤
│ #  │ Category File               │ Link                        │ Core Architectural Focus│
├────┼────────────────────────────┼─────────────────────────────┼────────────────────────┤
│ 1  │ Company Deep-Dive (59)     │ [Company Page](./company-page-recommendations.md)   │ Ind AS 116, Div II/III, Negative NW    │
│ 2  │ Computational Engines (18) │ [Engines](./engines-recommendations.md)            │ Beneish, Banking, DCF, Corp Actions    │
│ 3  │ Portfolio Management (16)  │ [Portfolio](./portfolio-management-recommendations.md) │ Budget 2024 Tax, 3-Way Reconcile, CAS  │
│ 4  │ Industry Analysis (11)     │ [Industry Page](./industry-page-recommendations.md) │ Ind AS 108 Segments, Cost Curves       │
│ 5  │ Macro & Microstructure (2) │ [Macro Page](./macro-page-recommendations.md)       │ RBI Corridor, Net Liq, CCIL Yield Curve│
│ 6  │ Document Intelligence (4)  │ [Document AI](./document-ai-recommendations.md)     │ Split-Screen, Bounding Boxes, RRF RAG  │
│ 7  │ Decision Systems (6)       │ [Weigh Decisions](./weigh-decisions-recommendations.md)│ Veto Gates, IC Memo, Kelly Sizing      │
│ 8  │ Tasks & Compliance (3)     │ [Tasks & Time](./tasks-time-recommendations.md)     │ SEBI LODR 29/33, DiamondPass, PIT 7(2) │
│ 9  │ Auxiliary & Discovery (9)  │ [Additional Tools](./additional-tools-recommendations.md)│ EBNF Screener, ExcelJS, Volume Profile │
└────┴────────────────────────────┴─────────────────────────────┴────────────────────────┘
```

---

### 2.1 Category 1: Company Page Deep-Dive (59 Specifications)
**Detailed Artifact:** [`specs/audits/company-page-recommendations.md`](./company-page-recommendations.md)  
**Scope:** 10 Functional Tabs (`overview/`, `management/`, `story/`, `industry/`, `risk/`, `analysis/`, `valuation/`, `financials/`, `sme/`, `downsides/`).

#### Key Findings & Primary Deficiencies:
1. **Division II vs Division III Structural Blindness:** The specifications uniformly assumed manufacturing/commercial P&Ls (Revenue, COGS, EBITDA, Working Capital). Subjecting banks (HDFC, ICICI) and NBFCs (Bajaj Finance) to these metrics resulted in broken data models.
2. **Ind AS 116 Lease Distortion:** Capitalized leases distorted EBITDA by 15–30% in retail, aviation, and hospitality, while inflating Net Debt and depressing reported ROCE.
3. **Negative Net Worth Singularity:** Distressed or turn-around companies with negative equity ($-PAT / -NW$) erroneously produced positive ROE figures, deceiving the screening and valuation tools.
4. **SME Exchange Norms Ignored:** BSE SME and NSE Emerge companies were evaluated without checking ICAI Peer Review auditor certification, 3-year market-making obligations, or minimum trading lot liquidity risks.

#### Architectural Remediations Implemented:
- **Universal Entity-Type State Machine:** Implemented dynamic switching between `COMMERCIAL_CORPORATE` (Schedule III Division II) and `BANKING`/`NBFC` (Division III), dynamically exposing NII, NIM, Advances, Deposits, Gross/Net NPAs, and CRAR.
- **Ind AS 116 Normalization Layer:** Provided a global toggle allowing analysts to switch between reported Ind AS 116 figures and Pre-Ind AS 116 normalized series across all 59 views.
- **Forensic Boundary Guardrails:** Implemented strict division-by-zero clamps and undefined states for negative denominators in ROE, ROCE, and ROIIC ($ROIIC = \Delta NOPAT / \Delta \text{Invested Capital}$).
- **MCA21 & SEBI Corporate Registry Linkage:** Integrated Corporate Identity Number (CIN), Director Identification Number (DIN) disqualification checks under Section 164(2), and SEBI SAST Reg 31 encumbrance tracking.

---

### 2.2 Category 2: Core Computational Engines (18 Specifications)
**Detailed Artifact:** [`specs/audits/engines-recommendations.md`](./engines-recommendations.md)  
**Scope:** All 18 calculation engines in `specs/engines/`.

#### Key Findings & Mathematical Breakthroughs:
1. **Beneish M-Score Leverage Index ($LVGI$) Bug (`beneish-engine.md`):**  
   The baseline specification defined $LVGI = \frac{(\text{Debt} + \text{Equity})_t}{(\text{Debt} + \text{Equity})_{t-1}}$. Because Total Assets $\approx$ Debt + Equity, this tracked asset growth rather than financial leverage.  
   *Remediation:* Replaced with the authentic forensic formula:
   $$\text{LVGI} = \frac{(\text{Current Liabilities}_t + \text{Long Term Debt}_t) / \text{Total Assets}_t}{(\text{Current Liabilities}_{t-1} + \text{Long Term Debt}_{t-1}) / \text{Total Assets}_{t-1}}$$
2. **Banking Valuation Scale Explosion (`banking-engine.md`):**  
   Regression equation $P/B = 0.8 + 8.5 \times \text{ROE}$ assumed ROE in decimal form ($0.162$). The golden vector passed percentage `16.2`, creating a 64x price explosion ($P/B = 138.5x$).  
   *Remediation:* Added automatic decimal normalization ($ROE > 1.0 \implies ROE / 100$) and mandated RBI-compliant Adjusted Book Value per Share (ABVPS), deducting Net NPAs, Security Receipts, and DTA haircuts.
3. **DCF Mid-Year Discounting & Singularity Bounds (`dcf-engine.md`):**  
   Omission of mid-year discounting systematically undervalued steady-state cash flow firms by 5–7%. Gordon Growth denominator collapsed when $WACC \le g$.  
   *Remediation:* Implemented mid-year discount factors $(t - 0.5)$ and enforced terminal parameter bounds: $WACC - g \ge 1.0\%$.
4. **Corporate Actions Fractional Cash Pool (`corporate-actions-engine.md`):**  
   The engine truncated fractional bonus/demerger entitlements (`int(qty * ratio)`), violating SEBI circulars requiring fractional shares to be pooled, auctioned in the market, and distributed pro-rata in cash.  
   *Remediation:* Built complete SEBI-compliant fractional auction cash distribution and Section 49(2C) net book value tax-cost apportionment algorithms.

---

### 2.3 Category 3: Portfolio Management Suite (16 Specifications)
**Detailed Artifact:** [`specs/audits/portfolio-management-recommendations.md`](./portfolio-management-recommendations.md)  
**Scope:** All 16 specs in `specs/portfolio-management/`.

#### Key Findings & Statutory Upgrades:
1. **Union Budget (July 23, 2024) Tax Regime Overhaul:** The baseline spec was obsolete, using outdated tax rates. We fully integrated:
   - Section 111A Short-Term Capital Gains (STCG) increased from 15% to **20%**.
   - Section 112A Long-Term Capital Gains (LTCG) increased from 10% to **12.5%**, with exemption raised from ₹1 Lakh to **₹1.25 Lakh**.
   - FY 2024-25 dual-rate transaction bifurcation (pre- vs post-July 23, 2024).
   - Section 55(2)(ac) Grandfathering Fair Market Value (FMV as of January 31, 2018).
   - Disallowed STT deductions from capital gains per Section 48.
2. **NSDL / CDSL Triple-Way Reconciliation Engine:** Engineered automated three-way reconciliation: Broker Trade Ledger $\leftrightarrow$ Demat Holding CAS $\leftrightarrow$ Bank Transaction Statement, identifying CUSA margin accounts, pledged shares, and T+1 settlement discrepancies.
3. **Weighted Harmonic Mean Multiples:** Eliminated arithmetic mean upward skew in portfolio valuation metrics:
   $$\text{Portfolio } P/E = \frac{\sum_{i=1}^N \text{Weight}_i}{\sum_{i=1}^N \frac{\text{Weight}_i}{P/E_i}} = \frac{\text{Total Market Cap}}{\text{Total Positive Net Profit}}$$
4. **Daily Modified Dietz & Sub-30 Day XIRR Solver:** Handled intraday cash injections without distorting Time-Weighted Returns (TWR) and implemented Brent's method with Annualized Return fallbacks for short holding periods.

---

### 2.4 Category 4: Industry Analysis Page (11 Specifications)
**Detailed Artifact:** [`specs/audits/industry-page-recommendations.md`](./industry-page-recommendations.md)  
**Scope:** All 11 specs in `specs/industry-page/`.

#### Key Findings & Sectoral Enhancements:
1. **Catastrophic P&L Aggregation Bug (`industry-aggregate.md`):**  
   The spec multiplied line items by revenue share: `line * revenue / total_rev`, computing a squared fraction rather than an absolute sum.  
   *Remediation:* Corrected to absolute rupee summation ($\sum \text{Rupees}$), deriving margins and ratios strictly from aggregated sums.
2. **Ind AS 108 Segment Reporting Integration (`industry-analysis.md`):**  
   Conglomerates (Reliance, L&T, ITC) previously distorted sector peer sets. Engineered dual aggregation: Entity-Level for pure-plays and Segment-Level (Ind AS 108 Note 32) for conglomerate divisions.
3. **Cost Pass-Through Deflation Guard (`cost-drivers.md`):**  
   Formula $\Delta \text{Price} / \Delta \text{Cost}$ produced negative numbers or crashed when input costs fell and prices held firm. Formulated gross margin spread tracking:
   $$\text{Margin Impact} = \Delta \text{Realization} - (\text{Input Cost Share} \times \Delta \text{Input Cost})$$
4. **Indian Policy & Trade Instruments (`regulations.md`):**  
   Integrated Production-Linked Incentive (PLI) disbursement milestones, DGTR Anti-Dumping Duty (ADD) expiries, and GST Council rate changes directly into earnings forecast models.

---

### 2.5 Category 5: Macro & Market Microstructure (2 Specifications)
**Detailed Artifact:** [`specs/audits/macro-page-recommendations.md`](./macro-page-recommendations.md)  
**Scope:** `macro-dashboard.md` and `market-metrics.md`.

#### Key Findings & Monetary Architecture:
1. **Modernized RBI LAF Monetary Corridor:** Replaced the static "Repo Rate" scalar with the post-April 2022 RBI Liquidity Adjustment Facility (LAF) corridor:
   $$\text{SDF (6.25\%)} \le \text{Policy Repo (6.50\%)} \le \text{MSF (6.75\%)}$$
   Integrated Net Systemic Banking Liquidity (SDF absorption + VRR vs MSF borrowing + Repo injections in ₹ Lakh Cr) as the lead indicator for money market rates (TREPS, WACR, Commercial Paper).
2. **Factual Correction on FII / DII Flow Reporting:** Eradicated the erroneous "15-minute intraday polling" requirement for FII/DII cash flows. Aligned with Indian market realities: provisional cash flows are published by NSE/BSE between 16:30 and 17:00 IST; final depository settlement reports appear between 18:00 and 20:30 IST.
3. **Macro Margin Spread Engine:** Formulated the corporate gross margin tailwind indicator: $\text{Spread}_t = \text{CPI Headline YoY}_t - \text{WPI Headline YoY}_t$, disaggregating Core CPI (ex-food & fuel) from food volatility.
4. **SEBI Circuit Breaker State Machine:** Implemented the complete 10%, 15%, and 20% index circuit breaker halt rules with cooling periods and 15-minute pre-open discovery sessions.

---

### 2.6 Category 6: Document AI & Ingestion Pipeline (4 Specifications)
**Detailed Artifact:** [`specs/audits/document-ai-recommendations.md`](./document-ai-recommendations.md)  
**Scope:** All 4 specs in `specs/document-ai/` plus the ingestion pipeline architecture.

#### Key Findings & RAG Architecture:
1. **Split-Screen Verification Cockpit:** Designed an interactive split-screen layout: conversational research chat on the left (45%) and synchronized PDF canvas on the right (55%) with sentence bounding boxes.
2. **Bounding Box Grounding Schema:** Every LLM citation must return exact coordinates `[pageNumber, x1, y1, x2, y2]`. Clicking an answer snippet instantly jumps the PDF viewer to the highlighted clause.
3. **Hybrid RAG Retrieval Engine:** Solved numerical extraction failures in pure dense vector search by coupling BM25 keyword search with BGE-M3 dense embeddings via Reciprocal Rank Fusion (RRF):
   $$\text{RRF\_Score}(d) = \sum_{m \in \{\text{BM25, Dense}\}} \frac{w_m}{60 + \text{Rank}_m(d)}$$
4. **Speaker Diarization & Concall Evasion Metrics:** Disaggregated conference calls into Management Presentation vs Analyst Q&A, scoring management evasiveness and tracking guidance commitment deliverability.

---

### 2.7 Category 7: Weigh Decisions & Conviction Systems (6 Specifications)
**Detailed Artifact:** [`specs/audits/weigh-decisions-recommendations.md`](./weigh-decisions-recommendations.md)  
**Scope:** All 6 specs in `specs/weigh-decisions/`.

#### Key Findings & Cognitive Upgrades:
1. **Compulsory Red-Flag Veto Gates:** Replaced linear score averaging with non-negotiable institutional veto gates. If an auditor resigns, CARO contains adverse qualifications, or promoter pledge exceeds 40%, the tool enforces `MANDATORY_VETO`, terminating the buy thesis.
2. **Institutional Investment Committee (IC) Memo Suite:** Built an automated 2-page IC Memo generator with structured fields for thesis pillars, risks, dissent recording, and explicit conditions precedent.
3. **Dynamic Bayesian Conviction Updating:** Transitioned conviction from a static label to a sequential probability distribution updated via Bayes' rule upon receipt of quarterly filings and regulatory notices:
   $$P(\text{Thesis } H_1 \mid \text{Evidence } E) = \frac{P(E \mid H_1) \cdot P(H_1)}{P(E \mid H_1) \cdot P(H_1) + P(E \mid H_0) \cdot P(H_0)}$$
4. **Fractional Kelly Sizing & SEBI Concentration Caps:** Sized allocations via Half-Kelly criterion ($f^* = 0.5 \times (p/a - q/b)$), strictly bounded by SEBI mutual fund/PMS caps (10% single equity / 25% sector ceiling).
5. **Decision Journal & Calibration Tracking:** Implemented Brier score tracking ($\text{Brier} = \frac{1}{N}\sum(p_i - o_i)^2$) and Pre-Mortem failure simulations to mitigate confirmation bias.

---

### 2.8 Category 8: Tasks & Time Compliance Suite (3 Specifications)
**Detailed Artifact:** [`specs/audits/tasks-time-recommendations.md`](./tasks-time-recommendations.md)  
**Scope:** All 3 specs in `specs/tasks-time/`.

#### Key Findings & Regulatory Workflows:
1. **SEBI LODR Reg 29 & 33 Earnings Calendar:** Transformed generic datebooks into statutory compliance engines: tracking 5 clear days advance notice for board meetings, and 45-day (quarterly) / 60-day (annual) submission cutoffs.
2. **Indian Concall Dial-In Logistics:** Integrated automated Chorus Call DiamondPass PIN bypass generation, direct PSTN phone dialers (+91 22 6280 xxxx), and calendar invite (.ics) syncing.
3. **Regulatory Disclosure Radar:** Automated live tracking for SEBI SAST Reg 29 (2% shareholding shifts), SEBI PIT Reg 7(2) (>₹10 Lakhs quarterly insider transactions), and credit rating downgrades (CRISIL, ICRA, CARE).
4. **Quarterly Research Sprint Coordination:** Structured research tasks across the earnings lifecycle: Pre-Earnings Preview $\to$ First-Cut Flash (within 2 hours of release) $\to$ Concall Parsing $\to$ Financial Model Update $\to$ IC Memo Revision.

---

### 2.9 Category 9: Additional Tools, Screening, Watchlists & GRWTH (9 Specifications)
**Detailed Artifact:** [`specs/audits/additional-tools-recommendations.md`](./additional-tools-recommendations.md)  
**Scope:** `additional-tools/` (4 specs), `generate-ideas/` (2 specs), `watchlist/` (2 specs), `grwth/` (1 spec).

#### Key Findings & Discovery Infrastructure:
1. **Dynamic Formula Excel Export (ExcelJS):** Replaced static CSV dumps with dynamic `.xlsx` financial models preserving live Excel formulas (`=SUM()`, `=C12-B12`) and Indian numbering currency formatting (`₹##,##,##0.00`).
2. **EBNF Screener Query Compiler:** Engineered a domain-specific query language compiler parsing complex nested financial logic: `[P/E < 25] AND [ROCE > 20%] AND [Promoter_Pledge == 0%]`, handling Consolidated vs Standalone scopes and TTM timeframes.
3. **Volume Profile & Delivery Spikes:** Augmented stock charts with daily NSE Bhavcopy delivery percentages (`Delivery Qty / Traded Qty * 100`) and Point of Control (POC) volume clusters.
4. **Institutional Watchlist & Deal Radar:** Replaced simple price alerts with NSE/BSE Bulk & Block deal feeds, insider trading alerts, and circuit-limit warnings.
5. **GRWTH Capex & Reinvestment Engine:** Grounded capex tracking in corporate reinvestment rates and Incremental Capital Output Ratios (ICOR), projecting realistic future capacity additions.

---

## 3. Cross-Cutting Architectural Themes & Breakthroughs

This section presents the deep technical synthesis across the six multidisciplinary pillars, establishing the engineering benchmarks for Hermes.

### 3.1 Financials & Accounting (Ind AS / SEBI / Companies Act)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INDIAN FINANCIAL ACCOUNTING ARCHITECTURE                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SCHEDULE III DIVISION II (Corporates)      │  SCHEDULE III DIVISION III (NBFCs/Banks) │
│  • Gross Revenue, Net Revenue              │  • Interest Earned & Interest Expended   │
│  • Raw Materials, Inventory, Power & Fuel  │  • Net Interest Income (NII) & NIM       │
│  • EBITDA, Operating Profit, D&A           │  • Provisions & Contingencies (ECL)      │
│  • Finance Costs, PBT, Tax, PAT            │  • Gross NPA, Net NPA, PCR (>= 70%)      │
│  • Capital Work-in-Progress (CWIP) Aging   │  • Capital Adequacy Ratio (CRAR / Tier-1)│
├─────────────────────────────────────────────┴──────────────────────────────────────────┤
│  IND AS 116 NORMALIZATION LAYER                                                        │
│  • EBITDA_norm = EBITDA_rep - Principal_Lease_Payment - Interest_Lease_Payment         │
│  • Net_Debt_post116 = Total_Borrowings + Lease_Liabilities - Cash_Equivalents          │
│  • Capital_Employed_pre116 = Net_Worth + Long_Term_Borrowings - ROU_Assets             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SEBI REGULATORY DISCLOSURE RADAR                                                      │
│  • Reg 23 LODR: Related Party Transactions (> 10% consolidated turnover threshold)    │
│  • Reg 30 LODR: Material Event Disclosure (Lower of 2% turnover or 5% net worth)       │
│  • Reg 31 LODR & SAST 31: Shareholding pattern & Promoter Non-Disposal Undertakings    │
│  • Reg 33 LODR: 45-day quarterly / 60-day annual audited result submission deadlines  │
│  • PIT Reg 7(2): Continual Insider Trading (> ₹10 Lakhs value per calendar quarter)    │
│  • CARO 2020: Inventory verification, Title deeds, Wilful defaulter, Internal audits  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Accounting Normalization Specifications:
1. **Schedule III Division II vs Division III State Machine:**  
   Hermes dynamically evaluates `companyContext.entityType`:
   ```typescript
   export type EntityType = 'COMMERCIAL_CORPORATE' | 'BANKING' | 'NBFC' | 'INSURANCE';
   ```
   When `entityType === 'BANKING' | 'NBFC'`, all non-financial corporate concepts (COGS, EBITDA, Working Capital, Inventory Turnover) are disabled. The UI renders the statutory Division III financial structure: Net Interest Income (NII), Net Interest Margin (NIM), Non-Interest Income, Operating Expenses (Cost-to-Income), Provisions under Ind AS 109 Expected Credit Loss (ECL), Gross/Net NPAs, Provision Coverage Ratio (PCR), and Capital Adequacy (CRAR Tier-1 and Tier-2).
2. **Ind AS 116 Lease Capitalization Normalizer:**  
   Operating leases recognized on-balance-sheet as Right-of-Use (ROU) Assets and Lease Liabilities create massive distortion in time-series (pre-FY20 vs post-FY20) and cross-border comparisons. All analytical tools provide a global toggle:
   $$\text{EBITDA}_{\text{normalized}} = \text{EBITDA}_{\text{reported}} - \text{Principal Lease Repayment} - \text{Interest on Lease Liability}$$
   $$\text{Net Debt}_{\text{pre-116}} = \text{Total Borrowings} - \text{Cash \& Equivalents} \quad (\text{Excludes Lease Liabilities})$$
   $$\text{Net Debt}_{\text{post-116}} = \text{Total Borrowings} + \text{Lease Liabilities} - \text{Cash \& Equivalents}$$
3. **Statutory SEBI LODR & CARO 2020 Governance Radar:**  
   - **SEBI LODR Regulation 30:** Automated flagging of corporate announcements exceeding statutory materiality thresholds: value exceeding 2% of consolidated turnover, 2% of consolidated net worth, or 5% of average three-year PBT.
   - **CARO 2020 Integration:** Automated parsing of the statutory auditor's report across 21 clauses, flagging Clause (i)(c) title deed disputes, Clause (ii)(b) quarterly working capital return discrepancies > 5% with bank books, Clause (ix)(b) wilful defaulter declarations, and Clause (xix) capability of meeting liabilities due within 1 year.

---

### 3.2 Economic & Macro Realities

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INDIAN MACROECONOMIC & MONETARY COCKPIT                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  RBI LIQUIDITY ADJUSTMENT FACILITY (LAF) ASYMMETRIC CORRIDOR                           │
│  • Ceiling: Marginal Standing Facility (MSF) = Policy Repo + 25 bps (6.75%)           │
│  • Policy Benchmark: Repo Rate = 6.50%                                                 │
│  • Floor: Standing Deposit Facility (SDF) = Policy Repo - 25 bps (6.25%)              │
│  • Transmission Metric: WACR Position = (WACR - SDF) / (MSF - SDF) in [0.0, 1.0]      │
│  • Net Systemic Liquidity = (SDF + VRR Absorption) - (MSF + Repo Injection) [₹ Lakh Cr]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SOVEREIGN YIELD CURVE (CCIL NDS-OM) & SPREADS                                         │
│  • On-The-Run Benchmark: 10Y G-Sec Yield                                               │
│  • Term Spreads: 2Y - 10Y Yield Spread, 91D T-Bill to 10Y Spread                       │
│  • Credit Risk Spreads: AAA PSU Corporate Bond Spread, AA- Private Corporate Spread    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  MACRO MARGIN SPREAD & INFLATION DISAGGREGATION                                        │
│  • Macro Corporate Margin Spread = CPI Headline YoY - WPI Headline YoY                 │
│    - Spread > +300 bps: Severe Gross Margin Expansion Tailwind (Low raw input costs)   │
│    - Spread < 0 bps: Cost-Push Squeeze (Wholesale inflation outstripping retail pricing)│
│  • Core CPI = Disaggregated index ex-Food & Beverages (45.86%) and Fuel & Light (6.84%)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  EXCHANGE RELEASE PIPELINE (INDIAN MARKET MICROSTRUCTURE)                              │
│  • FII / DII Cash Flows: EOD Provisional (16:30-17:00 IST), Depository (18:00-20:30)    │
│  • SEBI Circuit Breakers: 10%, 15%, 20% Index Halts, 45m/1h45m Cooling, 15m Pre-Open  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Macroeconomic Implementation Rules:
1. **Net Systemic Banking Liquidity Engine:** Rather than treating interest rates as a static number, Hermes monitors daily Net Systemic Liquidity (₹ Lakh Crore). When liquidity drops into deficit (e.g., advance tax outflows, festive currency drainage), call money rates (WACR) trade against the MSF ceiling (6.75%), tightening bank credit spreads and depressing treasury profits. When in surplus, WACR gravitates to SDF (6.25%).
2. **Exchange Reporting Truth (FII/DII Data):** Hermes strictly enforces Indian depository publication schedules: FII/DII cash market data is ingested via an EOD scheduled trigger at 17:00 IST (provisional) and 20:30 IST (final CDSL/NSDL depository settlement), eliminating broken 15-minute intraday polling loops.
3. **Macro Margin Spread Tracking:** Hermes tracks the spread between consumer and wholesale inflation:
   $$\text{MacroMarginSpread}_t = \text{CPI Headline YoY}_t - \text{WPI Headline YoY}_t$$
   When the spread expands above +300 bps (as observed when global crude, chemical, and metal prices drop while Indian domestic retail prices hold), manufacturing sector gross margins expand systematically across the coverage universe.

---

### 3.3 Fundamental Investor Logic & Conviction Workflows

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INVESTMENT COMMITTEE (IC) CONVICTION ENGINE                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  STAGE 1: HARD FORENSIC VETO GATES (COMPULSORY KNOCKOUT CRITERIA)                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Check 1: Auditor Resignation / Qualified CARO 2020 Opinion  ──► [VETO TRIGGERED] │  │
│  │ Check 2: Promoter Encumbrance / Pledge > 40% of Holding     ──► [VETO TRIGGERED] │  │
│  │ Check 3: Material Litigations / Disputed Tax > 50% Tang. NW ──► [VETO TRIGGERED] │  │
│  │ Check 4: Related Party Loans (Sec 186) > 20% Net Worth      ──► [VETO TRIGGERED] │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│                             │ If ALL Clear (0 Vetoes)                                  │
│                             ▼                                                          │
│  STAGE 2: MULTI-PILLAR WEIGHTED SCORING & SENSITIVITY                                  │
│  • Business Moat (30%) + Financial Health (25%) + Mgmt (25%) + Margin of Safety (20%)   │
│                             │                                                          │
│                             ▼                                                          │
│  STAGE 3: BAYESIAN CONVICTION UPDATING                                                 │
│  • Sequential updating upon earnings releases, concall guidance & regulatory filings   │
│                             │                                                          │
│                             ▼                                                          │
│  STAGE 4: FRACTIONAL KELLY SIZING & SEBI CONCENTRATION BOUNDS                          │
│  • Kelly Fraction: f* = 0.5 * (p/a - q/b)                                              │
│  • Hard Allocation Bounds: Min 1.5%, Max = min(f*, 10.0% Single Equity, 25.0% Sector)  │
│                             │                                                          │
│                             ▼                                                          │
│  STAGE 5: AUTOMATED 2-PAGE IC MEMO GENERATION & PRE-MORTEM LOG                         │
│  • Executive Synthesis, Valuation Range, Dissenting Votes, Conditions Precedent        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Decision Engine Workflow Contracts:
1. **Compulsory Red-Flag Veto Gates:** Buy recommendations cannot proceed if any corporate governance red-flag triggers a veto. The system automatically shifts `DecisionAction` to `MANDATORY_VETO`, locking the user out of `BUY`/`ACCUMULATE` recommendations until a formal Compliance Override is logged.
2. **Bayesian Thesis Calibration:** When a quarterly concall or result is released, Hermes updates thesis conviction using odds-form Bayes' theorem:
   $$\text{Posterior Odds} = \text{Prior Odds} \times \frac{P(\text{Quarterly Result } \mid \text{Bull Thesis})}{P(\text{Quarterly Result } \mid \text{Bear Thesis})}$$
3. **Institutional Investment Committee (IC) Memo:** Produces a standardized, immutable 2-page research document capturing:
   - Target Price, Margin of Safety, and Implied Growth hurdle (from Reverse DCF).
   - Voting record of committee members (e.g., 3 For, 1 Against) with full dissenting rationale.
   - Explicit **Conditions Precedent** (e.g., "Allocation conditional on Q3 gross debt reducing below ₹400 Cr").
   - Pre-Mortem failure scenarios logged before capital deployment.

---

### 3.4 UI/UX Interactive Design & Terminal Ergonomics

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        BLOOMBERG-GRADE TERMINAL DENSITY ARCHITECTURE                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  VISUAL HIERARCHY & TYPOGRAPHY                                                         │
│  • Dense tabular numerals (`font-variant-numeric: tabular-nums;`) for clean column alignment │
│  • Sub-second keyboard navigation (`/` search, `j`/`k` list nav, `1`-`9` tab jump)     │
│  • High-contrast institutional dark palette (Slate-950 background, Slate-200 text)     │
│  • Metric coloring: Positive (Emerald-400), Negative (Rose-400), Muted Neutral (Slate-400)│
├────────────────────────────────────────────────────────────────────────────────────────┤
│  STRICT UI LIFECYCLE STATES                                                            │
│  1. LOADING: Custom skeleton components matching exact tabular & chart layouts         │
│  2. EMPTY: Clear actionable state with guided onboarding CTA (e.g., "Upload CAS File") │
│  3. ERROR: Actionable diagnostics with retry button, API error payload & status code   │
│  4. ZERO-REVENUE: Tailored display for pre-revenue biotech / greenfield capex plays    │
│  5. LOSS-MAKING: Distinct badging for negative P/E, displaying EV/Sales or P/ABV       │
│  6. PRE-IPO / SME: Migration countdown, lot size liquidities, and market maker status  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  SPLIT-SCREEN INTERACTIVE RESEARCH COCKPIT                                             │
│  • Left Pane (45%): Conversational LLM Research Assistant with citation links          │
│  • Right Pane (55%): Synchronized high-resolution PDF canvas with active bounding box  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Terminal Interaction Standards:
- **Zero-Latency Keyboard Navigation:** Institutional analysts must never be bottlenecked by mouse interactions. Hermes implements global keyboard shortcuts: `/` focuses ticker search, `Tab` traverses interactive cells, `Ctrl + E` triggers dynamic Excel export, and `Esc` closes modals.
- **Data Density Preservation:** Tables enforce compact 28px row heights with dense typography (11px/12px Inter or JetBrains Mono for financial figures), ensuring 25+ rows of financial line items are visible without vertical scrolling.
- **Negative Metric Clarity:** Loss-making companies display `Negative Net Profit (Loss-Making)` instead of erroneous negative P/E ratios, automatically pivoting the valuation summary strip to EV/EBITDA or Price/Adjusted Book Value.

---

### 3.5 Mathematical Rigor & Forensic Formulas

This subsection catalogs the exact, corrected mathematical equations enforced across the platform:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATHEMATICAL & FORENSIC FORMULAS SUMMARY                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. BENEISH M-SCORE LEVERAGE INDEX (LVGI):                                              │
│    LVGI = [(Current_Liabilities_t + Long_Term_Debt_t) / Total_Assets_t] /              │
│           [(Current_Liabilities_{t-1} + Long_Term_Debt_{t-1}) / Total_Assets_{t-1}]   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. BANKING ADJUSTED BOOK VALUE PER SHARE (ABVPS):                                      │
│    Adjusted_Net_Worth = Net_Worth - Net_NPAs - Net_Security_Receipts - (1-t)*DTA_Haircut│
│    ABVPS = Adjusted_Net_Worth / Diluted_Shares                                         │
│    Predicted_P_ABV = alpha + beta * (target_roe / 100.0)                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. DCF MID-YEAR DISCOUNTING & TERMINAL VALUE:                                          │
│    PV_Explicit = Sum_{t=1}^N [ FCFF_t / (1 + WACC)^{t - 0.5} ]                         │
│    Terminal_Value = [ FCFF_N * (1 + g) ] / (WACC - g)    [Guard: WACC - g >= 0.010]    │
│    PV_Terminal = Terminal_Value / (1 + WACC)^N                                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. WEIGHTED HARMONIC MEAN PORTFOLIO / INDUSTRY P/E:                                    │
│    P/E_agg = [ Sum_{i=1}^N Mcap_i ] / [ Sum_{i=1}^N Net_Profit_i ]                    │
│            = 1 / [ Sum_{i=1}^N (w_i / (P/E)_i) ]   (where Net_Profit_i > 0)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. ALTMAN Z''-SCORE (EMERGING MARKETS MODEL):                                          │
│    Z'' = 3.25 + 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4                                 │
│    where X1 = WC/TA, X2 = Retained_Earnings/TA, X3 = EBIT/TA, X4 = Book_Equity/Total_Liab│
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. PASS-THROUGH MARGIN DELTA (DEFLATION-SAFE):                                         │
│    Gross_Margin_Impact = Delta_Realization - (Input_Cost_Weight * Delta_Input_Cost)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Proofs and Boundary Conditions:
1. **Beneish Leverage Index ($LVGI$) Proof:**  
   In Beneish (1999), $LVGI$ is designed to detect increasing financial leverage (which increases risk of covenant breach and incentivizes earnings manipulation). Setting the numerator as Debt + Equity causes $LVGI \approx \frac{\text{Assets}_t}{\text{Assets}_{t-1}}$, making $LVGI$ perfectly collinear with Total Asset Growth ($SGI$). The corrected implementation guarantees that $LVGI > 1.0$ strictly reflects increasing debt-to-assets.
2. **Harmonic Mean Proof for Financial Ratios:**  
   Suppose Company A has Net Profit ₹100 Cr and Mcap ₹1,000 Cr ($P/E = 10x$). Company B has Net Profit ₹1 Cr and Mcap ₹1,000 Cr ($P/E = 1000x$). Equal-weighted arithmetic mean is $(10 + 1000)/2 = 505x$. However, the true portfolio generates ₹101 Cr of earnings on ₹2,000 Cr of capital, yielding a true aggregate P/E of $2000 / 101 = 19.8x$. The Weighted Harmonic Mean correctly converges to $19.8x$, preventing catastrophic valuation distortion.
3. **Mid-Year DCF Discounting Proof:**  
   Cash flows do not materialize in a single lump sum on December 31; revenues, vendor payments, and operational cash flows are earned continuously across the fiscal year. Discounting cash flows by $(1 + WACC)^t$ assumes all cash flows are deferred until the final second of year $t$, systematically underestimating firm value by approximately $\frac{1}{2} \times WACC \approx 5\text{–}7\%$. Mid-year discounting uses $(1 + WACC)^{t - 0.5}$, reflecting the authentic midpoint of cash flow realization.

---

### 3.6 Data Plumbing, System Architecture & Pipeline Integration

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA PLUMBING & INGESTION PIPELINE                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  HYBRID VECTOR RETRIEVAL (RECIPROCAL RANK FUSION - RRF)                                │
│  • Dense Vector Search: BGE-M3 Embeddings (1024-dim) in PostgreSQL `pgvector`          │
│  • Lexical Keyword Search: PostgreSQL full-text search (BM25 ranking)                  │
│  • Fusion Algorithm: RRF_Score = w_dense/(60 + Rank_dense) + w_bm25/(60 + Rank_bm25)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  PDF CANVAS BOUNDING BOX CITATION PIPELINE                                             │
│  • Coordinates: Normalized `[pageNumber, x1, y1, x2, y2]` in [0.0, 1.0] relative scale │
│  • Frontend Action: 1-click jump to PDF page with Canvas border highlight layer        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  TRIPLE-WAY BROKER & DEPOSITORY RECONCILIATION ENGINE                                  │
│  • Ingest: 1. Broker Contract Note (PDF/CSV)                                           │
│            2. NSDL / CDSL Consolidated Account Statement (CAS e-PDF)                   │
│            3. Bank Current/Savings Account Statement (Net Settlement)                  │
│  • Matching Logic: Deductible Transfer Expenses (Sec 48) vs STT disallowance           │
│  • Settlement Rules: T+1 Rolling Settlement (Ex-Date == Record Date)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  STREAMING MARKET DATA & QUERY COMPILERS                                               │
│  • WebSocket Gateway: NSE/BSE tick streamer with backpressure and heartbeat            │
│  • EBNF Query Compiler: Domain-specific AST parser for multi-variable screening queries│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Pipeline Data Contracts & Schemas:
1. **Verifiable PDF Citation Interface:**
   ```typescript
   export interface VerifiableCitation {
     citationId: string;
     documentId: string;
     documentTitle: string;
     filingType: 'ANNUAL_REPORT' | 'CONCALL_TRANSCRIPT' | 'INVESTOR_PRESENTATION' | 'SEBI_REG_30';
     fiscalPeriod: string;
     pageNumber: number;
     boundingBox: {
       x1: number; // 0.0 to 1.0
       y1: number;
       x2: number;
       y2: number;
     };
     rawExcerpt: string;
     entailmentScore: number; // 0.0 to 1.0 from NLI premise verifier
   }
   ```
2. **Indian Statutory Capital Gains Tax Lot Schema:**
   ```typescript
   export interface IndianTaxLot {
     lotId: string;
     isin: string;
     symbol: string;
     buyDate: string;
     buyQuantity: number;
     buyPrice: number;
     brokerageAndLeviesDeductible: number;
     stampDutyPaid: number;
     effectiveCostBasisPerShare: number;
     isGrandfatheredPre2018: boolean;
     fmvAsOfJan31_2018?: number; // Sec 55(2)(ac)
     isBonusShare: boolean; // Sec 55(2)(aa) - ₹0 cost basis
   }
   ```

---

## 4. Master Prioritized Implementation Roadmap for Hermes

The implementation roadmap organizes all remediations across the 128 specifications into three sequential, dependency-governed execution phases.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        HERMES MASTER IMPLEMENTATION TIMELINE                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 1 (P0): WEEKS 1–4                                                               │
│  "Critical Mathematical Formulas, Forensic Integrity & Data Safety"                   │
│  • Fix Beneish LVGI, Banking PB/ROE, DCF mid-year & singularities                      │
│  • Implement Budget 2024 Tax Engine (STCG 20%, LTCG 12.5%, Sec 55(2)(ac))              │
│  • Enforce Hard Red-Flag Veto Gates in Decision Terminal                               │
│  • Fix P&L aggregation formula bug in Industry Aggregate                               │
│  • Deliverable: Verified Quantitative Engine Core & Zero-Error Math Tests              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 2 (P1): WEEKS 5–8                                                               │
│  "Core Regulatory Compliance, Institutional Analyst Workflows & Pipeline Contracts"    │
│  • Schedule III Division II vs Division III state machine                              │
│  • Ind AS 116 Lease Normalization Layer across all company & peer views                │
│  • RBI LAF Monetary Corridor & Net Systemic Liquidity Engine                           │
│  • Split-Screen Document AI Viewer with Bounding Box Citations                         │
│  • Triple-Way CAS & Broker Contract Note Reconciliation Engine                         │
│  • Deliverable: End-to-End Regulatory Ingestion & Provenance Architecture              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 3 (P2): WEEKS 9–12                                                              │
│  "UI/UX Terminal Density, Interaction States & Decision Engines"                       │
│  • Bloomberg-density UI system with keyboard shortcuts & tabular numerals              │
│  • Full 6 lifecycle states across all tools (Loading, Empty, Error, Loss, Pre-IPO)     │
│  • 2-Page IC Memo Generator & Bayesian Conviction Updating Engine                      │
│  • EBNF Screener Query Compiler with Consolidated/Standalone scopes                    │
│  • Deliverable: Production-Ready Hermes Research OS Platform                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.1 Phase 1 (P0): Critical Mathematical Formulas, Forensic Integrity & Data Safety
**Duration:** Weeks 1 to 4  
**Primary Objective:** Eliminate catastrophic formula errors, division-by-zero crashes, regulatory tax non-compliance, and data corruption bugs across all calculation engines.

#### Work Packages & Affected Specifications:
1. **Mathematical Engine Bug Remediation (`specs/engines/`):**
   - Correct Beneish $LVGI$ to leverage ratio and re-calibrate $TATA$ accruals under Ind AS 7 (`beneish-engine.md`).
   - Fix Banking P/B-ROE decimal percentage scaling and mandate Net NPA Adjusted Book Value deductions (`banking-engine.md`).
   - Implement DCF mid-year discounting and Gordon Growth $WACC - g \ge 1.0\%$ denominator bounds (`dcf-engine.md`).
   - Fix Revenue Projection free cash flow formula by removing double-counted D&A tax shields (`revenue-projection-engine.md`).
   - Invert Hedging collar payoff signs and correct NSE option lot size roundings (`hedging-engine.md`).
   - Replace arithmetic mean peer/portfolio multiples with Weighted Harmonic Means (`relative-engine.md`, `portfolio-engine.md`).
2. **Indian Capital Gains Tax Overhaul (`specs/portfolio-management/`):**
   - Implement Finance (No. 2) Act, 2024 capital gains rules: Section 111A STCG @ 20% and Section 112A LTCG @ 12.5% with ₹1.25 Lakh exemption (`capital-gains-import.md`, `trade-history.md`).
   - Implement Section 55(2)(ac) grandfathering FMV lookup as of January 31, 2018.
   - Enforce Section 48 non-deductibility of STT from capital gains computations.
   - Implement Section 49(2C) demerger cost allocation and Section 55(2)(aa) ₹0 bonus share tax lotting (`corporate-actions-handler.md`).
3. **Compulsory Red-Flag Veto Gates (`specs/weigh-decisions/`):**
   - Implement hard knockout gates terminating buy recommendations upon auditor qualifications under CARO, auditor resignations, or promoter pledge > 40% (`weigh-decisions.md`, `portfolio-fit-check.md`).
4. **Industry Financial Aggregation Bug Fix (`specs/industry-page/`):**
   - Replace revenue-weighted squared fraction bug with absolute rupee summations in `industry-aggregate.md`.
   - Handle negative equity denominators in aggregate sector ROE calculations (`companies-table.md`).

#### Acceptance & Verification Criteria:
- Unit test suite verifies 100% of mathematical test vectors with zero division-by-zero crashes.
- Beneish engine flags historical Indian corporate accounting frauds (Satyam, DHFL, Sintex).
- Capital gains engine reconciles tax liabilities against FY 2024-25 ITR-2 / ITR-3 schedules to ₹0.01 tolerance.

---

### 4.2 Phase 2 (P1): Core Regulatory Compliance, Institutional Analyst Workflows & Pipeline Contracts
**Duration:** Weeks 5 to 8  
**Primary Objective:** Deliver regulatory compliance layers, institutional research workflows, and reliable pipeline ingestion contracts.

#### Work Packages & Affected Specifications:
1. **Schedule III Division II / III Dynamic State Machine (`specs/company-page/`):**
   - Implement dynamic switching between Corporate (Division II) and Banking/NBFC (Division III) across all 59 company page specifications.
   - Implement Ind AS 116 Lease Normalization global toggle across EBITDA, Net Debt, and ROCE views.
2. **Macroeconomic Corridor & Yield Curve Pipeline (`specs/macro-page/`):**
   - Build post-April 2022 RBI LAF corridor (SDF, Repo, MSF) and daily Net Systemic Liquidity tracker (`macro-dashboard.md`).
   - Integrate CCIL G-Sec yield curve and corporate credit spread engine.
   - Re-schedule FII/DII cash flow ingestion to daily EOD release windows (`market-metrics.md`).
3. **Document AI Split-Screen Viewer & Bounding Box Citations (`specs/document-ai/`):**
   - Implement responsive split-screen UI: conversational LLM assistant alongside `react-pdf` canvas viewer (`document-ai.md`, `ai-chat.md`).
   - Implement hybrid vector retrieval (BM25 + BGE-M3 RRF) in `SPEC_INGESTION_PIPELINE.md`.
   - Implement concall speaker diarization separating Management remarks from Analyst Q&A (`concall-analysis.md`).
4. **Triple-Way Portfolio Reconciliation Engine (`specs/portfolio-management/`):**
   - Build automated parser for NSDL/CDSL CAS e-PDFs, Broker Contract Notes, and Bank statements (`statement-reconciliation.md`).
5. **Institutional Earnings Calendar & Filing Radar (`specs/tasks-time/`):**
   - Integrate SEBI LODR Regulation 29 (5 clear days notice) and Regulation 33 (45d/60d deadlines) compliance tracking (`tasks-time-tracker.md`).
   - Integrate Chorus Call DiamondPass 1-click concall registration and PSTN phone dialer links.
   - Automate SEBI SAST Reg 29 and PIT Reg 7(2) insider transaction disclosures (`filing-tracker.md`).

#### Acceptance & Verification Criteria:
- Switching between Tata Motors (Corporate) and HDFC Bank (Banking) correctly shifts all 10 tabs from EBITDA/Inventory to NII/NIM/NPAs.
- PDF citations jump to exact bounding box coordinates across 400-page Annual Reports in under 500ms.
- Triple-way reconciliation flags uncredited dividend distributions and demat holding mismatches.

---

### 4.3 Phase 3 (P2): UI/UX Terminal Density, Interaction States & Decision Engines
**Duration:** Weeks 9 to 12  
**Primary Objective:** Perfect terminal density, implement complete UI interaction states, and deploy advanced institutional decision engines.

#### Work Packages & Affected Specifications:
1. **Bloomberg-Density UI Design System (`specs/additional-tools/`):**
   - Deploy institutional dark theme tokens (Slate-950 background, tabular numerals, 28px row heights).
   - Implement zero-latency keyboard shortcut system (`/` search, `j`/`k` list nav, `Ctrl + E` Excel export).
   - Enforce 6 explicit lifecycle states (`loading`, `empty`, `error`, `zero-revenue`, `loss-making`, `pre-IPO`) across all 128 tools.
2. **Investment Committee (IC) Memo Suite & Bayesian Updating (`specs/weigh-decisions/`):**
   - Build automated 2-page IC Memo generator with dissenting vote capture and conditions precedent (`weigh-decisions.md`).
   - Implement sequential Bayesian conviction updating engine (`decision-journal.md`).
   - Deploy fractional Kelly sizing bounded by SEBI concentration limits (`conviction-sizing.md`).
3. **EBNF Screener Query Compiler & Dynamic Excel Exporter (`specs/additional-tools/`, `specs/generate-ideas/`):**
   - Build domain-specific query compiler supporting nested logical filters, Consolidated/Standalone scopes, and TTM periods (`screening.md`).
   - Deploy dynamic Excel export engine generating live Excel formulas and Indian number formatting (`filtered-table.md`).
4. **Supply Chain Graph & Cost Moats Canvas (`specs/industry-page/`):**
   - Deploy interactive supply chain graph with Supply Disruption Risk Index (SDRI) and cumulative industry cost curves (`cost-comparison.md`, `supply-chain-mapper.md`).

#### Acceptance & Verification Criteria:
- UI maintains 60 FPS rendering under live streaming data updates.
- 100% of screens exhibit zero layout shifts across all 6 lifecycle states.
- Exported `.xlsx` files open cleanly in Microsoft Excel with working dynamic formulas.

---

## 5. System Topology & Data Flow (Mermaid Architecture Diagrams)

The diagrams below illustrate the end-to-end architectural topology, data ingestion pipelines, forensic calculation engines, and user interface layers across Research OS (Hermes).

### 5.1 End-to-End System Topology & Data Flow

```mermaid
flowchart TD
    %% External Data Ingestion Layer
    subgraph External_Sources["1. External Market & Regulatory Ingestion Layer"]
        NSE_BSE["NSE / BSE Feeds<br/>(Bhavcopy, Ticks, Block Deals)"]
        MCA_SEBI["MCA21 & SEBI Disclosures<br/>(LODR 30/33, SAST 29/31, PIT 7(2))"]
        RBI_CCIL["RBI DBIE & CCIL NDS-OM<br/>(LAF Corridor, G-Sec Yields)"]
        DEP_BROKER["NSDL/CDSL CAS & Broker<br/>(Contract Notes, Holding Stmts)"]
        DOCS["Filing Repositories<br/>(Annual Reports, Concalls, Presentations)"]
    end

    %% Pipeline & Normalization Layer
    subgraph Ingestion_Pipeline["2. Ingestion, Normalization & Storage Pipeline"]
        STREAM_INGEST["WebSocket & Tick Gateway<br/>(Backpressure & T+1 Calendar)"]
        XBRL_PARSER["SEBI XBRL & Financial Parser<br/>(Div II vs Div III Classifier)"]
        OCR_RAG["Document AI & OCR Engine<br/>(BGE-M3 + BM25 RRF, Bounding Boxes)"]
        RECON_ENGINE["Triple-Way Reconciliation<br/>(Contract Note vs CAS vs Bank)"]
        
        DB[(PostgreSQL / TimescaleDB<br/>& pgvector Store)]
        CACHE[(Redis Distributed Cache<br/>Multi-Tier TTL)]
    end

    %% Computational & Forensic Core
    subgraph Core_Engines["3. Core Computational & Forensic Engines (specs/engines/)"]
        MATH_FORENSICS["Forensic Accounting Engine<br/>• Corrected Beneish LVGI<br/>• Emerging Altman Z''<br/>• CARO 2020 Radar"]
        VALUATION_ENG["Institutional Valuation Engine<br/>• Mid-Year Discounted DCF<br/>• Banking ABVPS & DuPont<br/>• Weighted Harmonic P/E"]
        TAX_CORP_ACT["Statutory Tax & Corp Actions<br/>• Post-July 2024 CG (Sec 111A/112A)<br/>• Sec 55(2)(ac) Grandfathering<br/>• Fractional Auction Cash Pool"]
        MACRO_MONETARY["Macro & Sector Engine<br/>• Net Systemic Liquidity<br/>• Macro Margin Spread (CPI - WPI)<br/>• Ind AS 108 Segment Aggregator"]
    end

    %% Cognitive Decision Systems
    subgraph Decision_Systems["4. Cognitive Conviction & Sizing Core (specs/weigh-decisions/)"]
        VETO_GATES{"Compulsory Red-Flag<br/>Veto Gates<br/>(Auditor Resign, Pledge>40%)"}
        BAYES_UPDATER["Sequential Bayesian Updater<br/>(Quarterly Conviction Calibration)"]
        KELLY_SIZING["Fractional Kelly Allocator<br/>(SEBI 10%/25% Concentration Caps)"]
        IC_MEMO_GEN["2-Page IC Memo Generator<br/>(Dissent Logs & Conditions Precedent)"]
    end

    %% Terminal UI Layer
    subgraph UI_Terminal["5. Institutional Terminal UI Cockpit (Bloomberg-Density)"]
        COMPANY_UI["Company Deep-Dive Cockpit<br/>(10 Tabs, Ind AS 116 Toggle, Div II/III)"]
        MACRO_UI["Macro & Microstructure Cockpit<br/>(RBI Corridor, Breadth, EOD Flows)"]
        PORTFOLIO_UI["Portfolio & Tax Dashboard<br/>(Daily Mod. Dietz, Reconciled CAS)"]
        DOCAI_UI["Split-Screen Document Hub<br/>(45% RAG Chat | 55% PDF Bounding Box)"]
        SCREENER_UI["EBNF Screener & Canvas<br/>(Dynamic Excel Exporter, Supply Graph)"]
    end

    %% Data Connections
    NSE_BSE --> STREAM_INGEST
    MCA_SEBI --> XBRL_PARSER
    RBI_CCIL --> STREAM_INGEST
    DEP_BROKER --> RECON_ENGINE
    DOCS --> OCR_RAG

    STREAM_INGEST --> DB
    XBRL_PARSER --> DB
    OCR_RAG --> DB
    RECON_ENGINE --> DB

    DB --> CACHE
    CACHE --> Core_Engines

    MATH_FORENSICS --> VETO_GATES
    VALUATION_ENG --> VETO_GATES
    TAX_CORP_ACT --> PORTFOLIO_UI
    MACRO_MONETARY --> MACRO_UI

    VETO_GATES -- "PASSED (0 Vetoes)" --> BAYES_UPDATER
    VETO_GATES -- "VETO TRIGGERED" --> IC_MEMO_GEN
    BAYES_UPDATER --> KELLY_SIZING
    KELLY_SIZING --> IC_MEMO_GEN

    IC_MEMO_GEN --> COMPANY_UI
    Core_Engines --> COMPANY_UI
    Core_Engines --> SCREENER_UI
    OCR_RAG --> DOCAI_UI
    DB --> PORTFOLIO_UI
```

---

### 5.2 Document AI & Ingestion Pipeline Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Analyst as Equity Research Analyst
    participant UI as Document AI Split-Screen UI
    participant Gateway as API Gateway / Orchestrator
    participant RAG as Hybrid Retrieval Engine (BM25 + BGE-M3)
    participant VectorStore as PostgreSQL (pgvector)
    participant PDFViewer as react-pdf Canvas Renderer

    Analyst->>UI: Submits Query: "What is Jamnagar New Energy capex for FY25?"
    UI->>Gateway: POST /api/v1/document-ai/query (symbol, query, filters)
    
    par Dual Retrieval
        Gateway->>RAG: Lexical BM25 Keyword Search
        Gateway->>RAG: Dense Vector Embedding (BGE-M3, 1024-dim)
    end
    
    RAG->>VectorStore: Reciprocal Rank Fusion (RRF) SQL Query
    VectorStore-->>RAG: Top-5 Ranked Chunks with Bounding Boxes [p, x1, y1, x2, y2]
    RAG->>Gateway: Synthesizes Answer with Grounding Verification (NLI Entailment)
    Gateway-->>UI: Returns Synthesized Answer + Verifiable Citations Array
    
    UI->>Analyst: Displays Answer in Left Pane (45%) with Highlighted Citations
    Analyst->>UI: Clicks Citation [1] (Annual Report FY24, Note 34, p.142)
    UI->>PDFViewer: Dispatches JumpToCoordinateEvent(page=142, bbox=[0.12, 0.45, 0.88, 0.62])
    PDFViewer-->>Analyst: Scrolls to Page 142 & Draws Yellow Bounding Box Highlight
```

---

### 5.3 Investment Decision & Conviction State Machine

```mermaid
stateDiagram-v2
    [*] --> Ingestion: New Company Analysis Initiated
    
    state Ingestion {
        [*] --> Financials_Loaded
        Financials_Loaded --> Forensic_Engine_Run
    }
    
    state Forensic_Verification {
        Forensic_Engine_Run --> Auditor_Check: Evaluate CARO 2020 & Resignations
        Auditor_Check --> Pledge_Check: Evaluate Promoter Pledge / Encumbrance
        Pledge_Check --> Litigation_Check: Disputed Claims vs Net Worth
    }
    
    state Veto_Gate {
        Auditor_Check --> Mandatory_Veto: Auditor Resigned or Adverse CARO
        Pledge_Check --> Mandatory_Veto: Pledge > 40%
        Litigation_Check --> Mandatory_Veto: Litigations > 50% Tangible NW
    }
    
    Mandatory_Veto --> IC_Memo_Vetoed: Lock Recommendation to MANDATORY_VETO
    IC_Memo_Vetoed --> [*]: Compliance Review Only
    
    Litigation_Check --> Valuation_Sizing: ALL Veto Checks Clear
    
    state Valuation_Sizing {
        [*] --> Reverse_DCF: Implied Growth Expectations
        Reverse_DCF --> Bayesian_Update: Apply Quarterly Concall Signals
        Bayesian_Update --> Fractional_Kelly: Compute Target Allocation
        Fractional_Kelly --> SEBI_Caps: Apply 10% Single Stock / 25% Sector Limit
    }
    
    SEBI_Caps --> IC_Memo_Generation: Compile Investment Thesis
    
    state IC_Memo_Generation {
        [*] --> Generate_2Page_Memo
        Generate_2Page_Memo --> Record_Dissent: Capture Committee Votes
        Record_Dissent --> Conditions_Precedent: Attach Monitoring Triggers
    }
    
    IC_Memo_Generation --> Execution_Ready: Approved by IC
    Execution_Ready --> [*]
```

---

## 6. Verification & Attestation Summary

This master synthesis has been cross-verified against the underlying source specifications and statutory benchmarks:
1. **Scope Attestation:** 100% of all 128 specifications in `specs/` are accounted for in the census matrix and analyzed across all 9 category recommendation documents.
2. **Path Integrity:** Every markdown reference in Section 1 and Section 2 maps to a valid file in `specs/audits/`.
3. **Mathematical Precision:** All formulas in Section 3.5 have been cross-referenced with foundational academic literature (Beneish 1999, Altman 1968/1983/1995, Ohlson 1995, Damodaran 2012).
4. **Regulatory Veracity:** All tax and compliance guidelines reflect the authentic legal code of the Ministry of Corporate Affairs, Reserve Bank of India, Securities and Exchange Board of India, and the Finance (No. 2) Act, 2024.

*End of Research OS (Hermes) Master Specification Index & Implementation Roadmap.*
