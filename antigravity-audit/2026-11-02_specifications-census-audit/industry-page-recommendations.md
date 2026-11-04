# Multidisciplinary Audit & Actionable Recommendations: Industry Page Specifications

**Target Directory:** `specs/industry-page/` (11 Specifications)  
**Audit Category:** Industry Analysis & Sector Modeling  
**Auditor Archetype:** Teamwork Industry & Macro Specialist (`teamwork_worker`)  
**Date of Audit:** 2026-11-02  
**Status:** COMPLETE & ACTIONABLE  
**Output Reference:** Hermes Implementation Roadmap — Category 4  

---

## 1. Executive Summary & Category Audit Overview

The `specs/industry-page/` category comprises 11 specification files designed to power the institutional top-down equity research workflow: screening industries, decomposing demand and cost structures, benchmarking competitive moats via cumulative cost curves, synthesizing consolidated industry financial statements, and mapping supply chain dependencies.

### 1.1 Category Inventory Audited

| # | Spec File | Tool / Component Title | Primary Lenses Evaluated | Audit Verdict |
|---|---|---|---|---|
| 1 | `industry-analysis.md` | Industry Analysis Master Dashboard | UI/UX Architecture, Ind AS 108 Segments, Fundamental Logic | Critical Structural Overhaul Required |
| 2 | `demand.md` | Industry Demand Analysis | Fundamental Logic, Econometrics, Indian Macro Data | Major Refactoring (Decouple Drivers) |
| 3 | `supply.md` | Industry Supply Analysis | Industrial Operations, Clearances/LARR, Capacity Derating | Major Refactoring (Effective Capacity) |
| 4 | `risk.md` | Industry Risk Factors | Mathematical Rigor, Valuation Integration, Multi-Factor Risk | Major Upgrade (Non-linear Severity & Ke Link) |
| 5 | `regulations.md` | Industry Regulations Tracker | Indian Regulatory Policy, PLI, DGTR Duties, Ingestion | Critical Domain Alignment & Earnings Model |
| 6 | `demand-drivers.md` | Demand Drivers Time-Series | Econometric Rigor, Log-Log OLS, Sensitivity Attribution | Critical Mathematical Correction (Zero-Division) |
| 7 | `cost-drivers.md` | Industry Cost Drivers | Microeconomics, Ind AS Schedule III, Pass-Through Logic | Critical Mathematical Fix (Deflation Inversion) |
| 8 | `cost-comparison.md` | Cost Comparison & Cost Curve | Commodity Economics, Captive Moats, Realization Spreads | Major Upgrade (Captive Mining & Cash Costs) |
| 9 | `companies-table.md` | Industry Companies Master Table | Valuation Multiples, Harmonic Mean, Standalone/Consolidated | Critical Mathematical Fix (Loss-Making P/E) |
| 10 | `industry-aggregate.md` | Industry Aggregate Financial Statements | Financial Accounting, Rupee Summation, Insolvent Equity | Critical Mathematical Bug Fix (Revenue Weighting) |
| 11 | `supply-chain-mapper.md` | Supply Chain & Value Chain Mapper | Graph Theory, Disruption Index (SDRI), Dynamic Profit Pools | Major Upgrade (SDRI & Temporal Migration) |

### 1.2 Summary of Critical Mathematical & Domain Defects Identified

1. **Catastrophic P&L Aggregation Formula Bug (`industry-aggregate.md`):** The specification multiplies individual company P&L line items by their revenue share: `agg[line] = sum(getattr(c, line) * c.revenue / total_rev)`. This computes a revenue-weighted squared fraction rather than an absolute rupee summation. Absolute P&L lines must be arithmetic sums ($\sum \text{Rupees}$); margins must be derived from aggregate sums.
2. **Negative Net Worth Collapse in Industry ROE (`industry-aggregate.md`, `companies-table.md`):** When distressed sectors (e.g., telecom post-AGR, power distribution, aviation) have $\sum \text{Equity} \le 0$, the standard formula $\sum(\text{ROE} \times \text{Equity}) / \sum \text{Equity}$ inverts or divides by zero.
3. **P/E Multiple Corruption from Loss-Making Constituents (`companies-table.md`):** Using market-cap-weighted arithmetic P/E ($\sum(\text{P/E}_i \times \text{Mcap}_i) / \sum \text{Mcap}_i$) corrupts the sector valuation whenever any company is loss-making ($\text{PAT} \le 0$). The institutional standard is aggregate market cap over aggregate positive net profit (Harmonic Mean).
4. **Pass-Through Ratio Sign Inversion during Deflation (`cost-drivers.md`):** The formula $\frac{\Delta \text{Price}}{\Delta \text{Cost}}$ produces negative numbers or crashes when costs fall ($\Delta \text{Cost} < 0$) and prices hold steady ($\Delta \text{Price} \ge 0$), falsely flagging strong pricing power as a negative ratio.
5. **Point-to-Point Elasticity Fragility (`demand-drivers.md`):** Calculating elasticity as $\frac{\% \Delta \text{Demand}}{\% \Delta \text{Driver}}$ crashes with division by zero whenever driver growth is flat and creates massive volatility.
6. **Neglect of Ind AS 108 Segment Reporting (`industry-analysis.md`):** Conglomerates like Reliance Industries (Oil-to-Chemicals + Retail + Telecom) or L&T (Infra + IT + Financial Services) cannot be treated as single-industry monoliths.
7. **Neglect of Indian Trade & Industrial Policy Instruments (`regulations.md`):** Omission of Production-Linked Incentives (PLI), DGTR Anti-Dumping Duties (ADD), and GST Council rate rationalization.

---

## 2. In-Depth Specification Audits & Actionable Recommendations

```
================================================================================
SPECIFICATION 1 OF 11: industry-analysis.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/industry-analysis.md`
- **Title:** Industry Page Tool Specification (Master Dashboard)

### 2. Lenses Evaluated & Core Critique
- **UI/UX & Information Architecture:** Section 3.1 squeezes 9 full analytical tools (Demand, Supply, Risk, Regulations, Cost Drivers, Cost Comparison, TAM Sizing, Companies Table, Aggregate Statements, Supply Chain) into a cramped $3 \times 3$ grid inside a single "Deep Dive" tab. An equity research analyst cannot view a 20-column peer table or an interactive value-chain graph in a tiny grid cell.
- **Financial Knowledge & Ind AS 108 (Operating Segments):** Indian industrial structures are heavily dominated by diversified conglomerates (e.g., Reliance Industries, Tata Motors, Mahindra & Mahindra, Larsen & Toubro, ITC). Aggregating purely at the legal entity ticker level contaminates sector analytics.
- **Mathematical Rigor:** The embedded `compute_industry_aggregate` function contains the unhandled negative equity denominator flaw in `weighted_roe`.
- **Fundamental Investor Logic:** Top-down sector screening requires immediate visibility of: (a) Sector Concentration (CR4, CR8, Herfindahl-Hirschman Index), (b) Dispersion of peer margins and return ratios (IQR / Box-plots), and (c) Stage in the capital expenditure cycle.

### 3. Actionable Replacements

#### 3.1 Mathematical Formulations & Concentration Metrics
To evaluate market structure and antitrust pricing power, Hermes must compute the Herfindahl-Hirschman Index (HHI) and 4-Firm Concentration Ratio (CR4):

$$\text{CR4} = \sum_{i=1}^{4} s_{(i)} \quad \text{where } s_{(1)} \ge s_{(2)} \ge \dots \ge s_{(N)} \text{ are sorted revenue market shares}$$

$$\text{HHI} = \sum_{i=1}^{N} (s_i \times 100)^2 \quad \in [0, 10\,000]$$

- **HHI Interpretation:**
  - $\text{HHI} < 1\,500$: Unconcentrated / Competitive market.
  - $1\,500 \le \text{HHI} \le 2\,500$: Moderately concentrated.
  - $\text{HHI} > 2\,500$: Highly concentrated / Oligopoly (High pricing power).

#### 3.2 Ind AS 108 Segmental Aggregation Architecture
Hermes must support dual aggregation modes:
1. **Entity-Level Aggregation:** Aggregates primary listed companies assigned to the sector.
2. **Segment-Level Aggregation (Ind AS 108 Note 32):** Aggregates reported segment revenue, segment EBIT, and segment capital employed across both pure-plays and diversified conglomerates.

$$\text{IndustrySegmentRevenue} = \sum_{c \in \text{PurePlays}} \text{Revenue}_c + \sum_{k \in \text{Conglomerates}} \text{SegmentRevenue}_{k, \text{TargetSegment}}$$

$$\text{IndustrySegmentEBIT} = \sum_{c \in \text{PurePlays}} \text{EBIT}_c + \sum_{k \in \text{Conglomerates}} \text{SegmentEBIT}_{k, \text{TargetSegment}}$$

#### 3.3 UI/UX Layout Replacement
Replace the cramped $3 \times 3$ grid with a professional 5-Tab Institutional Workbench:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Industry: Specialty Chemicals | Benchmark: NIFTY 500 | Constituents: 34 Listed | HHI: 1,840    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TABS: [1. Overview & Health] [2. Demand & Supply] [3. Cost & Moats] [4. Peer Directory] [5. Canvas] │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TOP KPI STRIP (Trailing 12 Months)                                                              │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌────────────────────┐ │
│ │ Industry TAM  │ │ 3Y Rev CAGR   │ │ Agg EBITDA %  │ │ Median ROE    │ │ Agg Capex / Rev    │ │
│ │ ₹1,85,400 Cr  │ │ +14.2%        │ │ 19.4% (+80bps)│ │ 17.8%         │ │ 8.4% (Expansionary)│ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MAIN WORKBENCH: TAB 1 (OVERVIEW & HEALTH)                                                       │
│ ┌──────────────────────────────────────────────┐ ┌────────────────────────────────────────────┐ │
│ │ SECTOR VALUATION & PERFORMANCE DISPERSION    │ │ CAPITAL CYCLE & AGGREGATE FREE CASH FLOW   │ │
│ │ • Quartile 1 (75th percentile): ROE 24.1%    │ │ • Sector Gross Capex (TTM): ₹15,600 Cr     │ │
│ │ • Median (50th percentile):     ROE 17.8%    │ │ • Sector CFO: ₹22,100 Cr                   │ │
│ │ • Quartile 3 (25th percentile): ROE 11.2%    │ │ • Sector FCF Yield: 3.2%                   │ │
│ │ [Box-Plot: EBITDA Margin vs Sales Growth]   │ │ [Bar Chart: Capex Pipeline vs Net Debt/EBITDA]│
│ └──────────────────────────────────────────────┘ └────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ CONGLOMERATE SEGMENT BREAKDOWN (Ind AS 108)                                                 │ │
│ │ Toggle: [● Segmental View (Pure-play + Conglomerate Segments)]  [○ Entity Ticker View]      │ │
│ │ Contributing Conglomerates: Reliance (O2C: ₹5.6L Cr) | Aarti Ind | Deepak Nitrite           │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 3.4 Data Contract (TypeScript Schema)
```typescript
export interface IndustryMasterData {
  industryId: string;
  industryName: string;
  sectorGroup: string;
  aggregationMode: 'ENTITY_LEVEL' | 'IND_AS_108_SEGMENT_LEVEL';
  metrics: {
    tamRupeesCr: number;
    revenueCagr3Y: number;
    aggregateEbitdaMargin: number;
    medianRoe: number;
    cr4Ratio: number;
    hhiIndex: number;
    marketStructure: 'COMPETITIVE' | 'MODERATE_OLIGOPOLY' | 'TIGHT_OLIGOPOLY';
  };
  dispersion: {
    roeQuartiles: [number, number, number]; // 25th, 50th, 75th percentile
    ebitdaMarginQuartiles: [number, number, number];
    peQuartiles: [number, number, number];
  };
  segmentContributions?: {
    companySymbol: string;
    segmentName: string;
    segmentRevenueCr: number;
    segmentEbitCr: number;
    segmentAssetsCr: number;
  }[];
  lastCalculatedAt: string;
}
```

---

```
================================================================================
SPECIFICATION 2 OF 11: demand.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/demand.md`
- **Title:** Industry Demand Analysis Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Fundamental Investor Logic & Econometrics:** Section 3.1 and Section 4.2 enforce a strict constraint: $\sum \text{ImpactPct} \approx 100\%$. In real-world macroeconomic analysis, demand drivers (e.g., Urbanization, Infrastructure capex, Per-capita income expansion, GST compliance formalization) are non-mutually exclusive, overlapping macroeconomic factors. Forcing an equity analyst to assign percentages that sum strictly to 100% creates false attribution.
- **Indian Economic Data Reality:**
  - The spec lists data source: `"Govt Data (Census, NSSO) | Annual"`. India's decennial Census last occurred in 2011; the 2021 Census was indefinitely delayed.
  - The spec states `"Annual Reports | Quarterly"`. In India under SEBI LODR, Annual Reports are published once a year; quarterly releases are unaudited/limited review financial results and investor presentations.
- **Data Plumbing:** Real institutional feeds for demand drivers come from:
  1. MOSPI (Ministry of Statistics and Programme Implementation): Monthly IIP (Index of Industrial Production) and Quarterly GDP Private Final Consumption Expenditure (PFCE).
  2. Ministry of Commerce / DGFT: Monthly export volume data.
  3. Industry Apex Bodies: SIAM (Society of Indian Automobile Manufacturers), CMA (Cement Manufacturers Association), Joint Plant Committee (JPC Steel).

### 3. Actionable Replacements

#### 3.1 Two-Tier Architectural Decoupling
Decouple the demand framework into two distinct analytical modules:
1. **Tier A: End-Use Volume Consumption Mix (Exhaustive, Sums to 100%):**
   $$\sum_{j=1}^{M} \text{EndUseShare}_j = 100.0\%$$
   *(Example for Indian Cement: Individual Home Builders 62%, Infrastructure & Roads 23%, Commercial Real Estate 15%)*
2. **Tier B: Macroeconomic Growth Drivers (Econometric Sensitivities, Independent):**
   $$\Delta \text{Demand}_t = \alpha + \sum_{k=1}^K \beta_k \cdot \Delta \text{MacroDriver}_{k, t} + \varepsilon_t$$
   *(Where $\beta_k$ represents the independent elasticity to GDP, Monsoon / Rural disposable income, or State Capex).*

#### 3.2 Data Pipeline & Official Indian Feeds
Replace the bogus "Census: Annual" source table with real Indian data connectors:

| Demand Dimension | Primary Source | Frequency | API / Ingestion Mechanism |
|---|---|---|---|
| Industrial End-Use Demand | MOSPI IIP Core 8 Sectors | Monthly (12th of month) | MOSPI Data Portal Scraper / DBIE |
| Consumer Demand (Rural/Urban) | NSSO Household Consumption Survey / CMIE Consumer Pyramids | Semi-Annual / Monthly | CMIE Economic Outlook API |
| Auto & Component Volumes | SIAM Monthly Flash | Monthly (1st week) | Automated PDF Ingestion (Doc AI) |
| Infrastructure & Construction | NHAI Road Construction (km/day) & MoHUA PMAY tracker | Monthly / Quarterly | MoHUA / NHAI MIS Dashboard |
| Commercial Vehicles / Freight | VAHAN National Register & E-Way Bill Generation | Monthly (1st of month) | GSTN E-Way Bill Portal Feed |

#### 3.3 Data Contract (TypeScript Schema)
```typescript
export interface IndustryDemandAnalysis {
  industryId: string;
  endUseSlices: {
    segmentName: string; // e.g., "Rural Housing", "Infrastructure", "Exports"
    shareOfVolumePct: number; // Sums strictly to 100%
    yoyGrowthPct: number;
    growthTrend: 'EXPANDING' | 'CONTRACTING' | 'STABLE';
    primaryDrivers: string[];
  }[];
  macroDrivers: {
    driverId: string;
    driverName: string; // e.g., "Central Infrastructure Capex", "Rural Real Wages"
    sourceName: 'MOSPI' | 'CMIE' | 'SIAM' | 'VAHAN' | 'RBI_DBIE';
    currentValue: number;
    unit: string;
    yoyChangePct: number;
    elasticityCoefficient: number; // % change in industry demand per 1% change in driver
    correlationCoefficient: number; // 5-year rolling correlation
    confidenceLevel: number; // 0.0 - 1.0 from Document AI or OLS regression
  }[];
  lastValidatedAt: string;
}
```

---

```
================================================================================
SPECIFICATION 3 OF 11: supply.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/supply.md`
- **Title:** Industry Supply Analysis Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Industrial Operations & Plant Derating:** The spec assumes static capacity numbers. In process industries (Cement, Steel, Chemicals, Refining), nameplate installed capacity is never 100% achievable:
  - Clinker factor balancing: Cement grinding capacity cannot exceed available clinker capacity.
  - Environmental clearance (EC) restrictions: MoEF&CC / SPCB consent to operate (CTO) limits throughput.
  - Power outages & fuel shortages: Thermal power or captive generation availability restricts effective output.
- **Indian Capex Realities & Project Lead Times:** Lumping capex announcements into an unweighted future capacity pipeline generates severe supply forecast errors. In India:
  - Greenfield projects require land acquisition under LARR Act 2013 and MoEF Terms of Reference (ToR), taking 36 to 60 months.
  - Brownfield expansions take 12 to 24 months.
- **Data Model Anti-Pattern:** The spec defines `value: string` (`"8% YoY"`, `"₹500Cr"`). Storing numbers as formatted strings prevents computing the supply-demand balance chart.

### 3. Actionable Replacements

#### 3.1 Mathematical Formulations for Effective Capacity & Pricing Power
Replace static sums with probabilistic effective capacity and pricing power metrics:

$$\text{EffectiveCapacity}_{i, t} = \text{NameplateCapacity}_{i, t} \times \text{DeratingFactor}_i \times \text{ClearanceCeilingPct}_i$$

$$\text{FutureSupplyPipeline}_t = \sum_{k \in \text{Brownfield}} \text{Cap}_k \times P(\text{Commissioning}_k \le t) + \sum_{m \in \text{Greenfield}} \text{Cap}_m \times P(\text{Commissioning}_m \le t)$$

$$\text{TotalEffectiveSupply}_t = \sum_i \text{EffectiveCapacity}_{i, t} + \text{FutureSupplyPipeline}_t + \text{NetImports}_t$$

$$\text{IndustryCapacityUtilization}_t = \frac{\text{TotalIndustryDemand}_t}{\text{TotalEffectiveSupply}_t} \times 100\%$$

- **Pricing Power Thresholds:**
  - $\text{Utilization}_t \ge 85\%$: **Structural Supply Deficit / Sellers' Pricing Power** (Aggressive margin expansion).
  - $75\% \le \text{Utilization}_t < 85\%$: **Balanced Supply / Cost Pass-Through Mode**.
  - $\text{Utilization}_t < 75\%$: **Structural Oversupply / Price War & Margin Compression**.

#### 3.2 Clearance Stage Probabilities in India
Institutional analysts model project completion probability based on statutory milestones:

| Project Milestone (India) | Clearance Stage Code | Completion Probability Weight ($P$) | Lead Time Range |
|---|---|---|---|
| Land Acquisition / Feasibility | `LARR_STAGE` | 0.25 | 36 - 60 months |
| Environmental Clearance Terms of Reference | `MoEF_TOR` | 0.50 | 24 - 36 months |
| Environmental Clearance Final (EC-II) | `MoEF_EC_GRANTED` | 0.75 | 18 - 24 months |
| Financial Closure & EPC Awarded | `FINANCIAL_CLOSURE` | 0.90 | 12 - 18 months |
| Trial Production / Commercial COD | `TRIAL_RUN` | 0.98 | 1 - 3 months |

#### 3.3 Data Contract (TypeScript Schema)
```typescript
export interface IndustrySupplyModel {
  industryId: string;
  nameplateCapacityUnit: string; // e.g., "MTPA", "Tons/Day", "MW"
  nameplateCapacityTotal: number;
  effectiveCapacityTotal: number;
  currentOperatingRatePct: number; // Demand / Effective Capacity
  pricingPowerRegime: 'SELLERS_MARKET' | 'BALANCED' | 'BUYERS_MARKET';
  capexPipeline: {
    projectId: string;
    companySymbol: string;
    expansionType: 'BROWNFIELD' | 'GREENFIELD' | 'DEBOTTLENECKING';
    incrementalCapacity: number;
    announcedCapexRupeesCr: number;
    milestoneStatus: 'LARR_STAGE' | 'MoEF_TOR' | 'MoEF_EC_GRANTED' | 'FINANCIAL_CLOSURE' | 'TRIAL_RUN';
    probabilityWeight: number; // 0.0 - 1.0
    expectedCodYearQuarter: string; // e.g., "2026-Q3"
  }[];
  supplyDemandBalance5Y: {
    fiscalYear: string;
    effectiveSupply: number;
    projectedDemand: number;
    gapVolume: number; // Effective Supply - Projected Demand
    projectedUtilizationPct: number;
  }[];
  lastUpdated: string;
}
```

---

```
================================================================================
SPECIFICATION 4 OF 11: risk.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/risk.md`
- **Title:** Industry Risk Factors Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Mathematical Rigor & Scale Inconsistency:**
  - In Section 3.1 layout, scores are displayed out of 10 (`9/10`, `7/10`, `8/10`), but Section 3.1 code snippet uses a lookup table producing integer scores from 1 to 12.
  - Linear product ($L \times I$) produces undesirable risk ties: $(\text{Med}, \text{High}) = 2 \times 3 = 6$ and $(\text{High}, \text{Med}) = 3 \times 2 = 6$. In equity risk management, high impact with moderate likelihood poses a far greater risk of solvency impairment than frequent low/moderate impact events.
- **Valuation Integration:** The risk score is an orphaned qualitative indicator. It does not inform the cost of equity ($K_e$), weighted average cost of capital (WACC), or multiple haircuts in Hermes's valuation engines.
- **Risk Velocity Dimension:** Neglects the time-to-onset (velocity): a sudden event (e.g. overnight export duty imposition by DGTR) vs a multi-year trend (e.g. EV penetration).

### 3. Actionable Replacements

#### 3.1 Non-Linear Severity Formulation with Velocity
Formulate an asymmetric institutional Risk Index ($R_i \in [1, 100]$):

$$R_i = \left( L_i \times I_i^{1.6} \times V_i \right) \times \frac{100}{S_{\max}}$$

Where:
- Likelihood $L_i \in \{1: \text{Rare}, 2: \text{Unlikely}, 3: \text{Possible}, 4: \text{Likely}, 5: \text{Almost Certain}\}$
- Impact $I_i \in \{1: \text{Negligible}, 2: \text{Minor}, 3: \text{Moderate}, 4: \text{Major}, 5: \text{Catastrophic}\}$
- Velocity $V_i \in \{1.0: \text{Slow (>2 years)}, 1.25: \text{Medium (6-24 months)}, 1.50: \text{Rapid (<6 months)}\}$
- $S_{\max} = 5 \times 5^{1.6} \times 1.50 \approx 98.24$, normalizing $R_i$ onto a clean $1 - 100$ scale.

#### 3.2 Quantitative Valuation Bridge (WACC & Exit Multiple Haircut)
Feed the industry risk score directly into Hermes Valuation Engines:

$$\Delta K_e (\text{bps}) = \max\left(0, \frac{\text{AggregateRiskScore} - 50}{50}\right) \times 200 \text{ bps}$$

$$\text{TargetMultipleHaircutPct} = \min\left(25\%, \frac{\text{AggregateRiskScore}}{100} \times 25\%\right)$$

*(Example: An industry risk score of 75 adds 100 bps to the Cost of Equity and applies an 18.75% haircut to EV/EBITDA exit multiples).*

#### 3.3 Data Contract (TypeScript Schema)
```typescript
export interface IndustryRiskProfile {
  industryId: string;
  aggregateRiskScore: number; // 0 - 100
  riskRegime: 'LOW_RISK' | 'MODERATE_RISK' | 'ELEVATED_RISK' | 'HIGH_VULNERABILITY';
  valuationAdjustment: {
    waccAddonBps: number;
    exitMultipleHaircutPct: number;
  };
  risks: {
    riskId: string;
    factorName: string;
    category: 'POLICY' | 'COMMODITY' | 'TECHNOLOGY' | 'COMPETITION' | 'REGULATORY' | 'ESG';
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    velocity: 1.0 | 1.25 | 1.50;
    computedScore: number; // 1 - 100
    mitigants: string[];
    affectedConstituentSymbols: string[];
    primarySource: string;
  }[];
  lastReviewedAt: string;
}
```

---

```
================================================================================
SPECIFICATION 5 OF 11: regulations.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/regulations.md`
- **Title:** Industry Regulations Tracker Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Indian Industrial & Trade Policy Deficiencies:** The spec ignores the major levers of corporate profitability in India:
  1. **PLI Schemes (Production-Linked Incentives):** Governed by DPIIT, IFCI, and line ministries across 14 sectors. Crucial metrics include committed vs actual capex, baseline turnover, incremental sales targets, and incentive disbursement ratios.
  2. **DGTR Trade Remedies:** Directorate General of Trade Remedies initiates anti-dumping duty (ADD), countervailing duty (CVD), and safeguard investigations. A DGTR notification can immediately raise domestic realizations by 10-25%.
  3. **GST Council Decisions:** Rate changes, inverted duty structure rectifications, and compensation cess phase-outs.
  4. **Quality Control Orders (QCOs):** Bureau of Indian Standards (BIS) mandatory certifications blocking sub-standard imports.
- **Data Plumbing Reality:** Spec claims: `"Gazette of India | API/RSS | Daily"`. The Gazette of India (egazette.gov.in) does NOT have an open structured REST API. It publishes scanned, image-based, non-OCR PDFs. The ingestion pipeline must have dedicated OCR preprocessing with checksum deduplication.
- **Financial Workflow Gap:** Compliance checklists ("Update contracts", "Train staff") are HR/legal tasks. Institutional equity analysts need an **Earnings Impact Model** ($\Delta \text{EBITDA}$ in ₹ Cr and bps).

### 3. Actionable Replacements

#### 3.1 Financial Impact Formulation for Trade & Regulatory Policy
For any regulatory change, Hermes must compute the quantified impact on sector EBITDA:

$$\Delta \text{EBITDA}_{\text{Sector}} = \left( \Delta \text{DomesticRealization}_{\text{post-ADD/Tariff}} \times \text{DomesticVolume} \right) + \text{AnnualPLIDisbursement} - \text{ComplianceCapexAmortization} - \Delta \text{DirectTax}$$

#### 3.2 PLI (Production Linked Incentive) Sub-Engine Schema
Track sector incentive realization:

$$\text{IncentiveEarned}_t = \max\left(0, \text{Sales}_t - \text{BaselineSales}\right) \times \text{IncentiveRatePct} \quad (\text{Subject to CapexThresholdMet} == \text{True})$$

#### 3.3 Data Contract (TypeScript Schema)
```typescript
export interface IndustryRegulatoryTracker {
  industryId: string;
  pliScheme?: {
    schemeName: string;
    nodalMinistry: string;
    totalOutlayRupeesCr: number;
    committedCapexTotalCr: number;
    incentiveRatePct: number;
    participatingCompanies: {
      symbol: string;
      capexCommittedCr: number;
      capexActualCr: number;
      incrementalSalesCr: number;
      disbursementReceivedCr: number;
      complianceStatus: 'ON_TRACK' | 'UNDERPERFORMING' | 'DISQUALIFIED';
    }[];
  };
  tradeRemedies: {
    remedyId: string;
    type: 'ANTI_DUMPING_DUTY' | 'SAFEGUARD_DUTY' | 'COUNTERVAILING_DUTY' | 'QCO_BIS';
    targetProductHsCode: string;
    targetCountries: string[]; // e.g., ["China", "Vietnam", "Korea"]
    dutyAmountOrPct: string; // e.g., "$120/MT" or "18.5%"
    effectiveDate: string;
    sunsetReviewDate: string;
    domesticMarginImpactBps: number;
    dgtrNotificationRef: string;
  }[];
  generalRegulations: {
    regId: string;
    title: string;
    ministry: 'MoF' | 'MCA' | 'MoEF' | 'RBI' | 'SEBI' | 'DPIIT';
    status: 'DRAFT_CONSULTATION' | 'GAZETTE_NOTIFICATION' | 'ENACTED' | 'CHALLENGED_COURT';
    effectiveDate: string;
    estimatedEbitdaImpactCr: number;
    documentUrl: string;
    ocrConfidence: number;
  }[];
  lastScrapedAt: string;
}
```

---

```
================================================================================
SPECIFICATION 6 OF 11: demand-drivers.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/demand-drivers.md`
- **Title:** Industry Demand Drivers Tool Specification (Time-Series)

### 2. Lenses Evaluated & Core Critique
- **Mathematical Rigor & Zero Denominator:** Section 3.1 code snippet states:
  ```python
  def calculate_elasticity(demand_growth, driver_growth):
      if driver_growth == 0:
          return None
      return demand_growth / driver_growth
  ```
  Simple point-to-point percentage changes produce severe distortion:
  1. If $\text{driver\_growth} = 0$, it returns `None`, crashing downstream aggregation.
  2. If $\text{driver\_growth} = 0.001$, elasticity explodes to infinity.
  3. Point-to-point elasticity fluctuates wildly across quarterly seasonality.
- **Econometric Rigor:** Demand elasticity w.r.t an exogenous macroeconomic driver requires log-log Ordinary Least Squares (OLS) regression over a multi-year panel: $\ln(\text{Demand}_t) = \beta_0 + \beta_1 \ln(\text{Driver}_t) + \varepsilon_t$.
- **Undefined Composite Exposure Score:** In Section 3.1 layout, the table presents a composite exposure score (`0.85`, `0.65`) without defining the weighting methodology.

### 3. Actionable Replacements

#### 3.1 Econometrically Rigorous Elasticity Formulation (Log-Log OLS)
Estimate elasticity $\beta_1$ via robust linear regression with $t$-statistics and $R^2$ goodness-of-fit:

$$\ln(\text{Demand}_t) = \alpha + \beta_1 \ln(\text{Driver}_t) + \varepsilon_t$$

$$\hat{\beta}_1 = \frac{\sum_{t=1}^T (\ln \text{Driver}_t - \overline{\ln \text{Driver}})(\ln \text{Demand}_t - \overline{\ln \text{Demand}})}{\sum_{t=1}^T (\ln \text{Driver}_t - \overline{\ln \text{Driver}})^2}$$

- **Edge Case Guard:** If $\text{Var}(\ln \text{Driver}) < 1e-6$ or $T < 8$ quarters, fallback to Bayesian shrink towards sector prior:
  $$\beta_{\text{shrink}} = w \hat{\beta}_1 + (1 - w) \beta_{\text{prior}}$$
  where $w = \frac{T}{T + 4}$.

#### 3.2 Formal Definition of Company Composite Exposure Score
Calculate company exposure to the industry driver basket:

$$\text{CompositeExposure}_i = \sum_{k=1}^K w_k \cdot s_{ik}$$

Where:
- $w_k = \frac{R_k^2}{\sum_{m} R_m^2}$ is the statistical explanatory weight of driver $k$.
- $s_{ik} \in [0.0, 1.0]$ is company $i$'s normalized revenue exposure to driver $k$.

#### 3.3 Data Contract (TypeScript Schema)
```typescript
export interface DemandDriverEconometrics {
  driverId: string;
  driverName: string;
  timeSeries: {
    period: string; // "2024-Q1", "2024-Q2", etc.
    driverValue: number;
    demandValue: number;
  }[];
  regressionResult: {
    elasticityBeta: number;
    standardError: number;
    tStatistic: number;
    pValue: number;
    rSquared: number;
    isStatisticallySignificant: boolean; // pValue < 0.05
  };
  forecastProjections: {
    period: string;
    projectedDriverValue: number;
    projectedDemandGrowthPct: number;
    lowerBound95Pct: number;
    upperBound95Pct: number;
  }[];
  companyExposures: {
    companySymbol: string;
    exposureScore: number; // 0.0 - 1.0
    qualitativeTag: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}
```

---

```
================================================================================
SPECIFICATION 7 OF 11: cost-drivers.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/cost-drivers.md`
- **Title:** Industry Cost Drivers Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Catastrophic Mathematical Flaw (Deflation Sign Inversion):**
  Section 3.1 code snippet states:
  ```python
  def pass_through_ability(cost_change, price_change):
      if cost_change == 0:
          return None
      return price_change / cost_change
  ```
  - **Deflationary Scenario:** Raw material costs drop by 15% ($\Delta \text{Cost} = -15$). The company maintains or slightly raises prices ($\Delta \text{Price} = +2$).
  - **Code Result:** $\frac{+2}{-15} = -0.133$ (Negative Pass-Through).
  - **Economic Reality:** Maintaining prices during cost deflation is the ultimate sign of pricing power and moats (margin expansion), yet this formula outputs a negative score!
- **Ind AS Accounting & Schedule III Violation:** The spec bundles "Logistics" and "Overhead" into "% of COGS". Under Ind AS Schedule III:
  - COGS consists strictly of: Cost of Materials Consumed + Purchases of Stock-in-Trade + Changes in Inventories.
  - Freight outward is part of Other Expenses (or deducted from Revenue under Ind AS 115).
  - Power & Fuel is reported under Other Expenses.
  - Conflating Ind AS COGS with Operating Expenses corrupts automated financial extraction from XBRL filings.
- **Contractual Lag in Indian Industry:** Pass-through in B2B supply contracts (e.g., auto components, packaging) operates with a 1-quarter contractual lag indexed to commodity benchmarks (e.g., ICIS, Platts, LME).

### 3. Actionable Replacements

#### 3.1 Asymmetric Pass-Through & Pricing Power Formulation
Deconstruct the metric into inflationary pass-through and deflationary margin retention:

$$\text{PricingPowerMetric}(\Delta C, \Delta P) = \begin{cases} 
\dfrac{\Delta P}{\Delta C} & \text{if } \Delta C > 0 \quad (\text{Inflationary Pass-Through Ratio}) \\[10pt]
1 + \dfrac{\Delta P - \Delta C}{P_{\text{base}}} & \text{if } \Delta C \le 0 \quad (\text{Deflationary Margin Expansion Index})
\end{cases}$$

- **Contractual Lagged Formulation:**
  $$\Delta P_t = \gamma_0 + \gamma_1 \Delta C_{t-1} + \varepsilon_t \quad (\gamma_1 \text{ measures 1-quarter lagged pass-through})$$

#### 3.2 Ind AS Compliant Cost Tree
Restructure the cost decomposition into standardized Ind AS categories:

```
Total Operating Cost Structure (100%)
├── 1. Ind AS Schedule III Cost of Materials Consumed (COGS proper)
│   ├── Feedstock / Raw Material A (% and Hedging: Futures/Physical)
│   └── Feedstock / Raw Material B (% and Hedging)
├── 2. Power & Fuel Expense (Classified under Other Expenses)
│   ├── Grid Tariff (% open exposure)
│   └── Captive Power / WHRS / Renewable PPA (% contracted)
├── 3. Employee Benefit Expense (Salaries, wages, bonus, PF)
├── 4. Logistics & Freight Outward (Classified under Other Expenses)
│   ├── Railway Freight vs Road Transportation Split
│   └── Diesel price pass-through clause
└── 5. Other Manufacturing & Overhead Expenses
```

#### 3.3 Interactive UI Commodity Sensitivity Slider
Equip the UI with dynamic commodity sensitivity sliders:
- Sliders: Crude Oil ($\pm 20\%$), USD/INR ($\pm 5\%$), Power Grid Tariff ($\pm 10\%$).
- Dynamic Output: Expected impact on Sector Gross Margin (bps) and EBITDA Margin (bps).

#### 3.4 Data Contract (TypeScript Schema)
```typescript
export interface IndustryCostStructure {
  industryId: string;
  costClassification: 'IND_AS_SCHEDULE_III';
  breakdown: {
    costElement: 'RAW_MATERIALS_COGS' | 'POWER_AND_FUEL' | 'EMPLOYEE_BENEFITS' | 'LOGISTICS_FREIGHT' | 'OTHER_OPERATING';
    pctOfNetSales: number; // Based on Ind AS Net Sales
    yoyInflationPct: number;
    inflationRegime: 'INFLATIONARY' | 'DEFLATIONARY' | 'STABLE';
    passThroughRatio: number; // 0.0 - 1.0 (in inflation)
    marginRetentionIndex: number; // >= 1.0 (in deflation)
    contractualLagMonths: number; // e.g., 3 months
    hedgeStrategy: 'EXCHANGE_FUTURES' | 'LONG_TERM_PPA' | 'BILATERAL_FORMULA' | 'OPEN_SPOT';
    hedgedCoveragePct: number; // e.g., 65%
  }[];
  sensitivityMatrix: {
    inputCommodity: string; // e.g., "Brent Crude ($/bbl)", "LME Aluminium ($/t)"
    shockPct: number; // e.g., +10%
    grossMarginImpactBps: number; // e.g., -140 bps
    ebitdaImpactRupeesCr: number;
  }[];
  lastUpdated: string;
}
```

---

```
================================================================================
SPECIFICATION 8 OF 11: cost-comparison.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/cost-comparison.md`
- **Title:** Industry Cost Comparison Tool Specification (Cumulative Cost Curve)

### 2. Lenses Evaluated & Core Critique
- **Indian Industrial Realities & Captive Moats:** The spec attributes cost differences purely to scale elasticity and plant age ("vintage"). In India's resource sectors (Steel, Cement, Aluminium), the primary determinant of cost leadership is **Captive Resource Backward Integration**:
  - Tata Steel has 100% captive iron ore mines; JSW Steel buys iron ore via NMDC auctions or market imports, creating a structural ₹1,500 - ₹2,500/ton cost gap independent of scale.
  - UltraTech Cement has high Waste Heat Recovery Systems (WHRS) and captive limestone clusters.
- **Product Mix & Net Realization Bias:** Sorting companies purely on unit production cost (₹/ton) creates a major analytical error:
  - A manufacturer producing low-value commodity sponge iron has low cost/ton but low realization.
  - A manufacturer producing high-value cold-rolled automotive galvanized steel has much higher cost/ton but double the realization/ton.
  - Comparing unit cost without **Net Realization and EBITDA Spread per Unit** flags the high-margin value-add producer as "inefficient".
- **Scale Elasticity Econometric Rigor:** The spec lacks a formal econometric definition of scale elasticity.

### 3. Actionable Replacements

#### 3.1 Stepped Cumulative Cash Cost Curve (Merit-Order Industry Curve)
Formulate the cumulative capacity cost curve:

Sort companies in ascending order of Cash Cost of Production ($C_1 \le C_2 \le \dots \le C_N$):

$$x_k = \sum_{i=1}^k \text{EffectiveCapacity}_i \quad (\text{Cumulative Industry MTPA})$$

$$y_k = C_k \quad (\text{₹ / Ton Cash Cost of Production})$$

#### 3.2 Realization-Adjusted Unit Spread (EBITDA per Unit)
Benchmarking must evaluate unit profitability alongside unit cost:

$$\text{EBITDA Spread}_i = \text{BlendedRealizationPerUnit}_i - \text{CashCostPerUnit}_i$$

#### 3.3 Econometric Scale Elasticity Formulation with Integration Dummy
Isolate genuine economies of scale from captive backward integration:

$$\ln(\text{CashCost}_i) = \alpha + \beta_{\text{scale}} \ln(\text{Capacity}_i) + \gamma \cdot \text{CaptiveIntegrationScore}_i + \delta \cdot \text{VAP\_Ratio}_i + \varepsilon_i$$

Where:
- $\beta_{\text{scale}} < 0$ captures true scale elasticity (e.g., $-0.15 \implies 10\%$ capacity increase yields $1.5\%$ lower unit cash cost).
- $\text{CaptiveIntegrationScore}_i \in [0.0, 1.0]$ tracks captive iron ore, bauxite, limestone, or coal linkage.
- $\text{VAP\_Ratio}_i = \frac{\text{Value-Added Sales}}{\text{Total Sales}}$ normalizes for high-end product mix.

#### 3.4 Data Contract (TypeScript Schema)
```typescript
export interface IndustryCostComparison {
  industryId: string;
  unitOfMeasure: string; // "₹/Ton", "₹/Bag", "$/oz"
  cashCostBenchmarkType: 'WOOD_MACKENZIE_C1_CASH_COST';
  costCurve: {
    symbol: string;
    companyName: string;
    effectiveCapacity: number;
    cumulativeCapacity: number;
    cashCostPerUnit: number;
    blendedRealizationPerUnit: number;
    ebitdaPerUnit: number;
    captiveScore: number; // 0.0 - 1.0 (e.g. 1.0 for 100% captive raw materials)
    whrsPowerPct: number; // % of power from Waste Heat Recovery
    valueAddedProductPct: number; // % of turnover from premium grades
    costCurveQuartile: 'Q1_LOWEST_COST' | 'Q2' | 'Q3' | 'Q4_MARGINAL_PRODUCER';
  }[];
  econometricElasticity: {
    pureScaleElasticity: number;
    captiveResourceCostAdvantagePerUnit: number;
  };
  lastUpdated: string;
}
```

---

```
================================================================================
SPECIFICATION 9 OF 11: companies-table.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/companies-table.md`
- **Title:** Industry Companies Table Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Catastrophic Valuation Multiple Corruption:** Section 3.1 code snippet states:
  ```python
  weighted_pe = sum(c.pe * c.mcap for c in companies) / sum(c.mcap for c in companies)
  ```
  This is a critical mathematical bug in institutional equity analysis:
  1. **Loss-Making Constituents:** If a constituent company has negative earnings ($\text{PAT} \le 0$), its P/E is negative (e.g., $-15\text{x}$) or undefined (`None`). Multiplying negative P/E by market cap corrupts the entire sector multiple, dragging down an otherwise expensive sector to an artificial bargain number!
  2. **Arithmetic Mean Multiple Bias:** In statistics, price multiples are ratios where the price is in the numerator. Taking an arithmetic weighted average of P/E ratios creates an upward skew. The mathematically correct institutional metric is the **Harmonic Mean** (or Aggregate Market Cap divided by Aggregate Net Profit).
- **Ind AS Standalone vs. Consolidated Ambiguity:** Many Indian mid and large caps hold major operating subsidiaries, debt, and cash in subsidiary entities (e.g., Tata Motors, L&T, Motherson Sumi). Comparing standalone for some companies and consolidated for others introduces severe reporting distortion.
- **Missing Valuation Metrics:** Standard Indian institutional coverage requires Aggregate EV/EBITDA, Aggregate P/B, and TTM Dividend Yield alongside P/E.

### 3. Actionable Replacements

#### 3.1 Mathematically Sound Industry Multiple Formulations
Replace the corrupted arithmetic weighted formula with the standard Institutional Harmonic Mean:

$$\text{Aggregate P/E}_{\text{All}} = \frac{\sum_{i=1}^N \text{MarketCap}_i}{\sum_{i=1}^N \text{PAT}_i} \quad (\text{Condition: } \sum \text{PAT}_i > 0)$$

$$\text{Aggregate P/E}_{\text{ProfitableOnly}} = \frac{\sum_{i \in \mathcal{P}} \text{MarketCap}_i}{\sum_{i \in \mathcal{P}} \text{PAT}_i} \quad \text{where } \mathcal{P} = \{i \mid \text{PAT}_i > 0\}$$

$$\text{Aggregate EV/EBITDA} = \frac{\sum_{i=1}^N \text{EnterpriseValue}_i}{\sum_{i=1}^N \text{EBITDA}_i}$$

$$\text{Aggregate P/B} = \frac{\sum_{i=1}^N \text{MarketCap}_i}{\sum_{i \in \mathcal{B}^+} \text{BookValue}_i} \quad (\text{Excluding negative book value entities})$$

- **Edge Case Rules:**
  - If $\sum_{i=1}^N \text{PAT}_i \le 0$, mark `Aggregate P/E = 'N/A (Loss-Making Sector)'` and display the Profitable Cohort P/E alongside the count of loss-makers (e.g. `14.2x (Excl. 4 loss-makers)`).
  - Explicitly disclose the percentage of sector market cap represented by profitable constituents.

#### 3.2 Standalone vs. Consolidated SEBI LODR Toggle
Implement a strict global toggle: `[● Consolidated (Recommended)] [○ Standalone]`. All calculations, market caps, and multiples must strictly pull from the selected accounting boundary.

#### 3.3 UI Layout: ROE vs. P/E Scatter Chart Guards
In the ROE vs. P/E quadrant scatter chart:
- Filter out entities with negative P/E or negative ROE from standard log-scale plots.
- Display them in an adjacent "Special Situations / Distressed" badge container.
- Use median ROE and median P/E as the dynamic quadrant crosshairs (Quality, Value, Expensive, Value Trap).

#### 3.4 Data Contract (TypeScript Schema)
```typescript
export interface IndustryCompaniesTableData {
  industryId: string;
  reportingBasis: 'CONSOLIDATED' | 'STANDALONE';
  timeframe: 'TTM' | 'FY_RECENT';
  aggregateMultiples: {
    harmonicPeAll: number | null; // null if aggregate PAT <= 0
    harmonicPeProfitableOnly: number;
    lossMakerCount: number;
    aggregateEvEbitda: number;
    aggregatePb: number;
    medianPe: number;
    medianRoe: number;
  };
  companies: {
    symbol: string;
    companyName: string;
    marketCapCr: number;
    enterpriseValueCr: number;
    revenueCr: number;
    ebitdaMarginPct: number;
    patCr: number;
    roePct: number;
    isProfitable: boolean;
    peMultiple: number | null; // null if loss-making
    evEbitdaMultiple: number | null; // null if EBITDA <= 0
    pbMultiple: number | null;
    netDebtToEbitda: number;
    segmentClassification: string;
  }[];
  lastUpdated: string;
}
```

---

```
================================================================================
SPECIFICATION 10 OF 11: industry-aggregate.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/industry-aggregate.md`
- **Title:** Industry Aggregate Financial Statements Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Catastrophic Code Bug in Aggregation Engine:**
  Section 3.1 code snippet states:
  ```python
  # P&L: Revenue-weighted
  total_rev = sum(c.revenue for c in companies)
  agg = {}
  for line in INCOME_STATEMENT_LINES:
      agg[line] = sum(getattr(c, line) * c.revenue / total_rev for c in companies)
  ```
  - This is an enormous mathematical bug. If `line` is `'revenue'`, the formula computes:
    $$\sum_{c} \frac{\text{revenue}_c^2}{\text{total\_rev}} \neq \text{total\_rev}$$
    *(Example: Two companies with revenues ₹100 Cr and ₹200 Cr. Total revenue is ₹300 Cr. The formula calculates: $100 \times \frac{100}{300} + 200 \times \frac{200}{300} = 33.3 + 133.3 = \text{₹166.7 Cr}$! Over 44% of revenue vanishes due to squared weighting!).*
  - Absolute rupee financial statements must be **arithmetic sums** ($\sum \text{LineItem}_c$). Revenue weighting applies only to margin percentages, not absolute rupee totals!
- **Negative Equity Denominator Collapse in Aggregate ROE:**
  Section 3.1 formula:
  ```python
  agg['roe'] = sum(c.roe * c.equity for c in companies) / sum(c.equity for c in companies)
  ```
  In distressed sectors where aggregate net worth is wiped out ($\sum \text{Equity} \le 0$), dividing aggregate PAT by negative equity inverts the sign of ROE or causes division by zero.
- **Inter-Company Elimination Ignored:**
  In vertically integrated industries (e.g. basic chemicals $\to$ specialty chemicals), intra-industry intermediate sales cause double counting of gross sector revenue.

### 3. Actionable Replacements

#### 3.1 Correct Mathematical Rupee Aggregation & Derived Margins
Replace the buggy code with true absolute rupee summation and derived margins:

$$\text{LineItem}_{\text{AggRupees}} = \sum_{c \in \text{Companies}} \text{LineItem}_c$$

$$\text{AggregateEBITDAMarginPct} = \frac{\sum_{c} \text{EBITDA}_c}{\sum_{c} \text{Revenue}_c} \times 100\%$$

$$\text{AggregatePATMarginPct} = \frac{\sum_{c} \text{PAT}_c}{\sum_{c} \text{Revenue}_c} \times 100\%$$

#### 3.2 Robust Insolvent Equity Guard for Aggregate ROE & ROCE
Define strict mathematical guards for aggregate return ratios:

$$\text{TotalEquity}_{\text{Agg}} = \sum_{c \in \text{Companies}} \text{Equity}_c$$

$$\text{AggregateROE} = \begin{cases} 
\dfrac{\sum_{c} \text{PAT}_c}{\text{TotalEquity}_{\text{Agg}}} \times 100\% & \text{if } \text{TotalEquity}_{\text{Agg}} > 0 \\[10pt]
\text{NaN (Insolvent Aggregate Net Worth)} & \text{if } \text{TotalEquity}_{\text{Agg}} \le 0
\end{cases}$$

When aggregate equity is $\le 0$:
1. Display status: `NEGATIVE_NET_WORTH_INSOLVENT`.
2. Provide **Solvent Cohort ROE**: $\frac{\sum_{c \in \mathcal{E}^+} \text{PAT}_c}{\sum_{c \in \mathcal{E}^+} \text{Equity}_c}$ (where $\mathcal{E}^+ = \{c \mid \text{Equity}_c > 0\}$).
3. Fall back to **Aggregate ROCE** (which uses Capital Employed = Net Worth + Total Debt, rarely negative).

#### 3.3 Debt-to-Equity Guard
$$\text{Aggregate D/E} = \begin{cases} 
\dfrac{\sum_{c} \text{TotalDebt}_c}{\sum_{c} \text{Equity}_c} & \text{if } \sum_{c} \text{Equity}_c > 0 \\[10pt]
\text{Infinity (Capital Structure Impaired)} & \text{if } \sum_{c} \text{Equity}_c \le 0
\end{cases}$$

#### 3.4 Data Contract (TypeScript Schema)
```typescript
export interface IndustryAggregateStatements {
  industryId: string;
  statementPeriod: 'FY22' | 'FY23' | 'FY24' | 'TTM';
  constituentCount: number;
  solvencyStatus: 'NORMAL' | 'AGGREGATE_NEGATIVE_NET_WORTH';
  incomeStatementRupeesCr: {
    revenueFromOperations: number;
    rawMaterialsConsumed: number;
    employeeBenefits: number;
    otherExpenses: number;
    ebitda: number;
    depreciation: number;
    ebit: number;
    financeCosts: number;
    pbt: number;
    taxExpense: number;
    pat: number;
  };
  balanceSheetRupeesCr: {
    grossPpe: number;
    capitalWorkInProgress: number;
    totalAssets: number;
    totalDebt: number;
    netDebt: number;
    totalEquity: number;
    capitalEmployed: number;
  };
  keyRatios: {
    ebitdaMarginPct: number;
    netProfitMarginPct: number;
    aggregateRoePct: number | null; // null if totalEquity <= 0
    solventCohortRoePct?: number;
    aggregateRocePct: number;
    debtToEquityRatio: number | null; // null if totalEquity <= 0
    interestCoverageRatio: number;
  };
  lastAggregatedAt: string;
}
```

---

```
================================================================================
SPECIFICATION 11 OF 11: supply-chain-mapper.md
================================================================================
```

### 1. Target Spec File Path & Title
- **File Path:** `specs/industry-page/supply-chain-mapper.md`
- **Title:** Industry Supply Chain Mapper Tool Specification

### 2. Lenses Evaluated & Core Critique
- **Graph Theory & Visualization:** The spec uses static `{x, y}` coordinates in `SupplyChainNode`. In a dynamic platform with real-time Doc AI auto-population, hardcoded coordinates cause overlapping nodes. Requires automatic hierarchical Directed Acyclic Graph (DAG) layout with cycle detection (e.g., Dagre / D3 hierarchy).
- **Missing Disruption Index & Dependency Weighting:** Edges only record `volumePct: number`. In reality, a supply chain bottleneck is not just volume; it is **criticality, supplier concentration, and import substitution feasibility** (e.g., Active Pharmaceutical Ingredients - API intermediates imported from a single cluster in China).
- **Dynamic Profit Pool Migration:** Section 3.1 treats margin pools as static percentages summing to 100%. In reality, margin pools migrate drastically across economic cycles:
  - Commodity boom: Raw material extractors capture 50% of the industry profit pool.
  - Commodity glut: Downstream converters/brand owners capture 70% of the profit pool.
  - The tool lacks a **Temporal Cycle Slider** to visualize profit migration.

### 3. Actionable Replacements

#### 3.1 Supply Disruption Risk Index (SDRI) Formulation
Formulate the Supply Disruption Risk Index for any node $j$:

$$\text{SDRI}_j = \text{HHI}_{\text{Suppliers}, j} \times \left(1 - \text{DomesticSubstituteRatio}_j\right) \times \text{CriticalityWeight}_j \times \frac{\text{LeadTimeWeeks}_j}{52}$$

Where:
- $\text{HHI}_{\text{Suppliers}, j} = \sum_{k} s_k^2$ is the Herfindahl concentration of suppliers for node $j$ ($0.0 - 1.0$).
- $\text{DomesticSubstituteRatio}_j \in [0.0, 1.0]$ (e.g. 0.1 for 90% import-dependent semiconductors or raw lithium).
- $\text{CriticalityWeight}_j \in [1.0, 5.0]$ (1 = easily swappable, 5 = single-point line-stopping bottleneck).

#### 3.2 Upstream Vulnerability Propagation
Propagate risk downstream across graph paths:

$$\text{DownstreamVulnerability}(i) = \max_{p \in \text{Paths}(\text{Root}, i)} \left( \sum_{j \in p} w_{j \to i} \cdot \text{SDRI}_j \right)$$

#### 3.3 Dynamic Margin Pool Cycle Migration Slider
Incorporate a 5-year timeline slider (`[FY20] [FY21] [FY22] [FY23] [FY24] [Current]`):
- Shows how node EBITDA margins and total rupee profit pools shifted over the cycle.

#### 3.4 Graph Architecture & Auto-Layout
- Use `dagre` layout engine to compute deterministic node coordinates $(x, y)$ dynamically based on tier ranks (`rankdir: 'LR'`).
- Handle closed feedback loops (e.g. scrap recycling in steel) by treating secondary loops as non-structural overlay edges (`type: 'feedback'`).

#### 3.5 Data Contract (TypeScript Schema)
```typescript
export interface SupplyChainGraph {
  industryId: string;
  selectedCycleYear: string; // e.g., "FY24"
  nodes: {
    id: string;
    stage: 'RAW_MATERIAL' | 'PROCESSING' | 'MANUFACTURING' | 'DISTRIBUTION' | 'END_USER';
    label: string;
    constituentSymbols: string[];
    stageCapacity: number;
    stageUtilizationPct: number;
    marginPoolPct: number; // % of total value chain EBITDA in selected year
    marginPoolRupeesCr: number;
    sdriScore: number; // 0 - 100 Supply Disruption Risk Index
    isBottleneck: boolean;
    tierRank: number; // 0 for raw materials, 1 for processing, etc.
  }[];
  edges: {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    materialName: string;
    volumeFlowPct: number;
    isCriticalPath: boolean;
    isFeedbackLoop: boolean;
  }[];
  historicalMarginMigration: {
    fiscalYear: string;
    stageMarginShares: Record<string, number>; // stage -> % share of pool
  }[];
  lastUpdated: string;
}
```

---

## 3. Prioritized Implementation Roadmap for Hermes

| Priority | Spec Target | Key Modification Required | Impact on System |
|---|---|---|---|
| **P0 (Immediate)** | `industry-aggregate.md` | Fix revenue-weighted bug in P&L; implement rupee summation and negative equity ROE guards. | Prevents complete corruption of all sector financial statements. |
| **P0 (Immediate)** | `companies-table.md` | Replace arithmetic weighted P/E with Harmonic Mean; guard against negative PAT and negative equity. | Ensures reliable sector valuation multiples. |
| **P0 (Immediate)** | `cost-drivers.md` | Fix pass-through sign inversion during deflation; align cost categories with Ind AS Schedule III. | Eliminates absurd negative pass-through ratios during margin expansion. |
| **P1 (High)** | `industry-analysis.md` | Overhaul UI layout into 5-Tab workbench; incorporate Ind AS 108 segment aggregation. | Prevents conglomerate distortion and resolves UI crowding. |
| **P1 (High)** | `regulations.md` | Add PLI tracker, DGTR anti-dumping duty monitor, and quantified EBITDA impact model. | Delivers vital Indian regulatory and earnings insights. |
| **P1 (High)** | `demand.md` & `demand-drivers.md` | Decouple end-use volume mix from macro drivers; replace fragile point-to-point elasticity with log-log OLS. | Eliminates synthetic 100% sum distortions and zero-division errors. |
| **P2 (Medium)** | `supply.md` & `cost-comparison.md` | Incorporate derated effective capacity, statutory clearance lead times, and captive resource cost moats. | Transforms static tables into dynamic commodity cycle tools. |
| **P2 (Medium)** | `supply-chain-mapper.md` & `risk.md` | Implement Supply Disruption Risk Index (SDRI), dynamic profit pool slider, and non-linear risk severity. | Enables institutional stress-testing and supply chain risk quantification. |
