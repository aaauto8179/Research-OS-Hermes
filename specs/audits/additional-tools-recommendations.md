# Audit & Actionable Recommendations: Additional Tools, Idea Generation, Watchlist & Growth Specifications

**Auditor:** Tasks, Time & Tools Specialist (`worker_tasks_tools_1`)  
**Date:** 2026-11-02  
**Target Categories:** `specs/additional-tools/` (4 specs), `specs/generate-ideas/` (2 specs), `specs/watchlist/` (2 specs), `specs/grwth/` (1 spec) — 9 Specifications Total  
**Deliverable File:** `specs/audits/additional-tools-recommendations.md`  

---

## Executive Summary & Scope Mapping

This multidisciplinary audit evaluates the 9 specifications spanning auxiliary tools, discovery engines, interactive charting, screening, watchlists, and capex frameworks across Indian institutional investing lenses:
- `specs/additional-tools/` (4 specs): `filtered-table.md`, `ui-primitives.md`, `multi-text-box.md`, `simple-text-box.md`
- `specs/generate-ideas/` (2 specs): `idea-generation.md`, `screening.md`
- `specs/watchlist/` (2 specs): `watchlist.md`, `watchlist-manager.md`
- `specs/grwth/` (1 spec): `grwth-pipeline.md`

Across these specifications, the current designs exhibit critical conceptual gaps:
1. **Financial Charting & Market Plumbing:** Price series are treated as raw unadjusted numbers, ignoring stock splits, bonuses, and rights issues; volume lacks institutional delivery overlays from the daily **NSE Bhavcopy** (`Delivery Quantity / Traded Quantity * 100`) and Volume Profile (Point of Control / Value Area).
2. **Screener & Query Grammar:** Screening logic lacks handling for **Consolidated vs. Standalone** accounts, **TTM vs. Annual FY** scopes, and crashes on negative earnings ($P/E \le 0$, negative base year in CAGR). Banking and NBFC balance sheets are improperly subjected to non-applicable metrics like Debt-to-Equity and EV/EBITDA.
3. **Peer Comparisons & KPI Normalization:** Cross-company comparisons fail to normalize industry-specific operational metrics (NIM/GNPA for Banks, RevPAR for Hotels, EBITDA/tonne for Cement, TCV/ARR for SaaS/IT).
4. **Watchlist & Alerts:** Alerts are limited to naive price levels, ignoring **NSE/BSE Bulk & Block Deals**, **52-week High/Low proximity**, **delivery volume spikes**, and **circuit limits**.
5. **Growth Framework:** Capex tracking is detached from economic fundamentals—omitting **Indian Reinvestment Rates**, **ROIC/ROCE**, and the **Incremental Capital Output Ratio (ICOR)**.

Below are the detailed, actionable audits and production-grade replacements for all 9 specifications.

---

## Part 1: `specs/additional-tools/` (4 Specifications)

### 1.1 Target Spec: `specs/additional-tools/filtered-table.md` (Dispatch Title: `data-export.md` — Institutional Tabular & Financial Model Data Export Engine)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/additional-tools/filtered-table.md`
- **Dispatch Alias / Target Title:** `specs/additional-tools/data-export.md` — *Tabular Data Export & Dynamic Financial Model Exporter*
- **Lenses Evaluated:** UI/UX Data Density, Excel Financial Modeling Integration, Indian Number Formatting, Accounting Precision.

#### B. Core Critique & Vulnerability Analysis
- The existing spec provides a basic TanStack Table with simple CSV/JSON export. In equity research, exporting to CSV strips all mathematical relationships, formulas, and formatting.
- Analysts require dynamic Excel (`.xlsx`) export where summary totals, growth rates, and valuation metrics preserve live dynamic formulas (e.g., `=SUM(C4:C15)`, `=(C12-B12)/ABS(B12)`), enabling immediate financial modeling.
- Lacks Indian numbering convention formatting (Lakhs and Crores with comma placement: `₹12,34,567.89`) and currency scale preservation across global vs domestic views.

#### C. Actionable Replacement Specification
##### 1. Dynamic Formula Excel Exporter Architecture (ExcelJS / Python openpyxl)
```typescript
import ExcelJS from 'exceljs';

export interface FinancialModelExportConfig {
  companySymbol: string;
  statementType: 'INCOME_STATEMENT' | 'BALANCE_SHEET' | 'CASH_FLOW' | 'PEER_COMPARISON';
  scale: 'CRORES' | 'LAKHS' | 'MILLIONS' | 'ACTUALS';
  includeLiveFormulas: boolean;
  currency: 'INR' | 'USD';
}

export class InstitutionalExcelExporter {
  public static async exportThreeStatementModel(
    workbook: ExcelJS.Workbook,
    data: any,
    config: FinancialModelExportConfig
  ): Promise<Buffer> {
    const sheet = workbook.addWorksheet(`${config.companySymbol}_Financials`, {
      views: [{ showGridLines: true }]
    });

    // 1. Institutional Header Banner
    sheet.mergeCells('A1:G1');
    const headerCell = sheet.getCell('A1');
    headerCell.value = `${config.companySymbol} — Comprehensive Financial Model (Figures in ₹ ${config.scale})`;
    headerCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    headerCell.alignment = { vertical: 'middle', horizontal: 'left' };

    // 2. Formatting rules for Indian Number System
    // Excel Format: [>=10000000]##\,##\,##\,##0.00;[>=100000]##\,##\,##0.00;##,##0.00
    const indianCurrencyFormat = '₹##,##,##,##0.00;(₹##,##,##,##0.00);"-"';

    // 3. Inject Dynamic Mathematical Formulas (e.g. EBITDA = Revenue - COGS - Opex)
    // Row 10: Net Revenue, Row 11: COGS, Row 12: Gross Profit (=C10-C11)
    sheet.getCell('C12').value = { formula: 'C10-C11', result: data.grossProfit };
    sheet.getCell('C12').numFmt = indianCurrencyFormat;

    // EBITDA Margin Formula: =C15/C10*100
    sheet.getCell('C16').value = { formula: 'IF(C10>0, (C15/C10), 0)', result: data.ebitdaMargin };
    sheet.getCell('C16').numFmt = '0.00%';

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }
}
```

##### 2. Indian Currency Formatter with Zero & Sign Guards
```typescript
export function formatIndianCurrency(
  val: number | null | undefined,
  scale: 'Cr' | 'Lakh' | 'Auto' = 'Cr',
  decimals: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (val === 0) return '₹0.00';

  const isNegative = val < 0;
  const absVal = Math.abs(val);

  let scaledVal = absVal;
  let unit = '';

  if (scale === 'Cr' || (scale === 'Auto' && absVal >= 1e7)) {
    scaledVal = absVal / 1e7;
    unit = ' Cr';
  } else if (scale === 'Lakh' || (scale === 'Auto' && absVal >= 1e5)) {
    scaledVal = absVal / 1e5;
    unit = ' L';
  }

  // Format with Indian Regex comma separation (3, 2, 2 digits)
  const parts = scaledVal.toFixed(decimals).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] ? `.${parts[1]}` : '';

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${integerPart}${decimalPart}${unit}`;
}
```

---

### 1.2 Target Spec: `specs/additional-tools/ui-primitives.md` (Dispatch Title: `advanced-charting.md` — Multi-Ticker Charting, Corporate Action Adjustments & NSE Bhavcopy Delivery Overlays)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/additional-tools/ui-primitives.md`
- **Dispatch Alias / Target Title:** `specs/additional-tools/advanced-charting.md` — *Advanced Technical & Fundamental Charting Engine*
- **Lenses Evaluated:** Mathematical Rigor, Indian Exchange Corporate Actions Mechanics, NSE Bhavcopy Integration, High-Performance UI.

#### B. Core Critique & Vulnerability Analysis
- The existing spec contains basic button and text tokens. It has zero capability for institutional financial charting.
- **Unadjusted vs Adjusted Price Distortions:** Historical Indian stock charts become meaningless without corporate action adjustment. A 1:1 bonus issue cuts stock price in half; a 1:10 stock split cuts it by 90%. Looking at unadjusted price shows a fictitious crash.
- **NSE Bhavcopy Delivery Percentage Gap:** Institutional investors in India rely heavily on the **NSE Daily Bhavcopy** (`sec_bhavdata_full.csv`). Traded volume includes high-frequency intraday churn. The critical metric is:
  $$\text{Delivery \%} = \frac{\text{Delivery Quantity}}{\text{Traded Quantity}} \times 100$$
  A price breakout accompanied by delivery % expanding from 25% to 65% indicates institutional accumulation. The current spec has no support for delivery overlays or Volume Profile.

#### C. Actionable Replacement Specification
##### 1. Corporate Action Split Adjustment Mathematical Formulas
For any corporate action on Ex-Date $t_{\text{ex}}$:
- **Stock Split ($N_{\text{new}} : N_{\text{old}}$) or Bonus Issue ($B$ bonus shares for every $A$ existing):**
  $$\text{Split Factor } S_f = \frac{N_{\text{new}}}{N_{\text{old}}} \quad \text{or} \quad S_f = \frac{A + B}{A}$$
  $$\text{Adjusted Price } P_{\text{adj}}(t) = \frac{P_{\text{raw}}(t)}{S_f} \quad \forall t < t_{\text{ex}}$$
  $$\text{Adjusted Volume } V_{\text{adj}}(t) = V_{\text{raw}}(t) \times S_f \quad \forall t < t_{\text{ex}}$$
- **Cash Dividend ($D$ per share):**
  $$\text{Dividend Adjustment Factor } D_f = 1 - \frac{D}{P_{\text{cum}}}$$
  $$\text{Adjusted Price } P_{\text{adj}}(t) = P_{\text{raw}}(t) \times D_f \quad \forall t < t_{\text{ex}}$$

##### 2. NSE Bhavcopy Delivery & Volume Profile Engine
```typescript
export interface BhavcopyBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  tradedQty: number;
  deliveryQty: number;
  deliveryPct: number; // (deliveryQty / tradedQty) * 100
  tradesCount: number;
}

export interface VolumeProfileResult {
  priceBins: { price: number; volume: number; deliveryVolume: number }[];
  pointOfControl: number; // Price bin with highest traded volume (POC)
  valueAreaHigh: number;  // 70% volume upper bound (VAH)
  valueAreaLow: number;   // 70% volume lower bound (VAL)
}

export class VolumeProfileCalculator {
  public static compute(bars: BhavcopyBar[], numBins: number = 50): VolumeProfileResult {
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalVol = 0;

    for (const b of bars) {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
      totalVol += b.tradedQty;
    }

    const binSize = (maxPrice - minPrice) / numBins;
    const bins = new Array(numBins).fill(0).map((_, i) => ({
      price: minPrice + (i + 0.5) * binSize,
      volume: 0,
      deliveryVolume: 0
    }));

    for (const b of bars) {
      const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor((b.close - minPrice) / binSize)));
      bins[binIdx].volume += b.tradedQty;
      bins[binIdx].deliveryVolume += b.deliveryQty;
    }

    // Find Point of Control (POC)
    let pocBin = bins[0];
    for (const bin of bins) {
      if (bin.volume > pocBin.volume) pocBin = bin;
    }

    // Compute Value Area (70% of total volume radiating from POC)
    const targetVA = totalVol * 0.70;
    let currentVA = pocBin.volume;
    let pocIdx = bins.indexOf(pocBin);
    let lowIdx = pocIdx;
    let highIdx = pocIdx;

    while (currentVA < targetVA && (lowIdx > 0 || highIdx < numBins - 1)) {
      const nextLowVol = lowIdx > 0 ? bins[lowIdx - 1].volume : -1;
      const nextHighVol = highIdx < numBins - 1 ? bins[highIdx + 1].volume : -1;

      if (nextHighVol >= nextLowVol && highIdx < numBins - 1) {
        highIdx++;
        currentVA += bins[highIdx].volume;
      } else if (lowIdx > 0) {
        lowIdx--;
        currentVA += bins[lowIdx].volume;
      } else {
        break;
      }
    }

    return {
      priceBins: bins,
      pointOfControl: pocBin.price,
      valueAreaHigh: bins[highIdx].price,
      valueAreaLow: bins[lowIdx].price
    };
  }
}
```

##### 3. Multi-Ticker Rebased Split Charting UI Wireframe
```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ADVANCED CHARTING ENGINE                                  [Symbol: RELIANCE vs TCS, INFY, NIFTY50]    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIMEFRAME: [1D] [1W] [1M] [1Y] [5Y] [MAX]   ADJUSTMENT: [☑ Bonus/Split] [☑ Dividend] [☑ Delivery %]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PANE 1: REBASED PERFORMANCE (Base = 100 on 2024-01-01)                           Volume Profile (POC)  │
│ 160 ───────────────────────────────────────────────────────────────────────────┐ █                     │
│ 140 ───────────╭─────╮─────── RELIANCE (+32.4%) ───────────────────────────────┤ ████ POC: ₹2,920      │
│ 120 ─────╭────╯     ╰───────── NIFTY 50 (+18.2%) ──────────────────────────────┤ ███                   │
│ 100 ═════╩═════════════════════════════════════════════════════════════════════╡ ████ VAH: ₹2,980      │
│  80 ────────────────────────── TCS (-4.5%) ────────────────────────────────────┤ █   VAL: ₹2,810      │
├────────────────────────────────────────────────────────────────────────────────┴───────────────────────┤
│ PANE 2: TRADED VOLUME & NSE BHAVCOPY DELIVERY OVERLAY                                                  │
│ 10M ┌─┐       ┌─┐              Traded Volume (Bar) | Delivery % (Orange Line)             Delivery: 64%│
│  5M │█│ ┌─┐   │█│   ┌─┐ ┌─┐    ───────────────────────-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-·-· │
│     └─┴─┴─┴───┴─┴───┴─┴─┴─┴─────────────────────────────────────────────────────────────────────────── │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.3 Target Spec: `specs/additional-tools/multi-text-box.md` (Dispatch Title: `peer-comparisons.md` — Sector KPI Normalization & Comparative Matrix)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/additional-tools/multi-text-box.md`
- **Dispatch Alias / Target Title:** `specs/additional-tools/peer-comparisons.md` — *Industry-Specific Peer Comparison & KPI Matrix*
- **Lenses Evaluated:** Financial Accounting Knowledge, Sector Economics, Ind AS Reporting Variations.

#### B. Core Critique & Vulnerability Analysis
- The existing spec is an unconstrained spreadsheet grid allowing freeform text entry.
- In financial analysis, a generic peer comparison table that shows P/E and EV/EBITDA across all companies is fundamentally flawed because different sectors run on completely distinct economic engines:
  - **Commercial Banks / NBFCs:** EBITDA and Debt-to-Equity are meaningless (debt is a bank's raw material). Key metrics are Net Interest Margin (NIM), Cost-to-Income, Gross Non-Performing Assets (GNPA %), Net NPA %, Provision Coverage Ratio (PCR %), and Capital Adequacy Ratio (CRAR Tier-1).
  - **Cement:** Sales volumes in Million Tonnes (MT), Realization per tonne (₹/t), EBITDA per tonne (₹/t), Power & Fuel cost/t, and Freight cost/t.
  - **Hotels / Hospitality:** Revenue Per Available Room (RevPAR), Average Daily Rate (ADR), and Occupancy Rate (%).
  - **SaaS / IT Services:** Annual Recurring Revenue (ARR), Total Contract Value (TCV), Net Retention Rate (NRR), Attrition Rate (LTM), and Offshore/Onsite Utilization %.
  - **Real Estate / Developers:** Pre-sales booking value (₹ Cr), Collections, Area sold (million sq.ft), Average realization (₹/sq.ft), and Project Launch Pipeline.

#### C. Actionable Replacement Specification
##### 1. Sector-Specific KPI Normalization Schemas (TypeScript)
```typescript
export interface SectorKPIProfile {
  sector: 'BANKING' | 'CEMENT' | 'HOSPITALITY' | 'IT_SERVICES' | 'REAL_ESTATE';
  kpis: SectorKPIDefinition[];
}

export interface SectorKPIDefinition {
  key: string;
  label: string;
  unit: 'PERCENT' | 'INR_PER_TONNE' | 'INR_PER_ROOM' | 'INR_CR' | 'RATIO' | 'COUNT';
  formulaExplanation: string;
  isLowerBetter?: boolean;
}

export const SECTOR_KPI_REGISTRY: Record<string, SectorKPIDefinition[]> = {
  BANKING: [
    { key: 'nim', label: 'Net Interest Margin (NIM)', unit: 'PERCENT', formulaExplanation: 'Net Interest Income / Average Earning Assets' },
    { key: 'cost_to_income', label: 'Cost to Income Ratio', unit: 'PERCENT', isLowerBetter: true, formulaExplanation: 'Operating Expenses / Total Income' },
    { key: 'gnpa_pct', label: 'Gross NPA %', unit: 'PERCENT', isLowerBetter: true, formulaExplanation: 'Gross Non-Performing Assets / Gross Advances' },
    { key: 'nnpa_pct', label: 'Net NPA %', unit: 'PERCENT', isLowerBetter: true, formulaExplanation: 'Net Non-Performing Assets / Net Advances' },
    { key: 'pcr_pct', label: 'Provision Coverage Ratio (PCR)', unit: 'PERCENT', formulaExplanation: 'Total Cumulative Provisions / Gross NPAs' },
    { key: 'casa_pct', label: 'CASA Ratio', unit: 'PERCENT', formulaExplanation: '(Current Account + Savings Account Deposits) / Total Deposits' },
    { key: 'tier1_crar', label: 'Tier-1 CRAR', unit: 'PERCENT', formulaExplanation: 'Tier-1 Capital / Total Risk Weighted Assets' }
  ],
  CEMENT: [
    { key: 'volume_mt', label: 'Cement Volume (MT)', unit: 'INR_CR', formulaExplanation: 'Dispatched volume in Million Tonnes' },
    { key: 'realization_per_t', label: 'Realization / Tonne', unit: 'INR_PER_TONNE', formulaExplanation: 'Net Revenue / Sales Volume in Tonnes' },
    { key: 'ebitda_per_t', label: 'EBITDA / Tonne', unit: 'INR_PER_TONNE', formulaExplanation: 'Total Operating EBITDA / Sales Volume in Tonnes' },
    { key: 'power_fuel_per_t', label: 'Power & Fuel / Tonne', unit: 'INR_PER_TONNE', isLowerBetter: true, formulaExplanation: 'Power & Fuel Expense / Volume in Tonnes' },
    { key: 'freight_per_t', label: 'Freight / Tonne', unit: 'INR_PER_TONNE', isLowerBetter: true, formulaExplanation: 'Logistics Cost / Volume in Tonnes' }
  ],
  HOSPITALITY: [
    { key: 'revpar', label: 'RevPAR (₹)', unit: 'INR_PER_ROOM', formulaExplanation: 'Total Room Revenue / Total Available Rooms' },
    { key: 'adr', label: 'Average Daily Rate (ADR)', unit: 'INR_PER_ROOM', formulaExplanation: 'Room Revenue / Occupied Rooms' },
    { key: 'occupancy_pct', label: 'Occupancy %', unit: 'PERCENT', formulaExplanation: 'Occupied Rooms / Total Available Rooms * 100' },
    { key: 'room_inventory', label: 'Operational Keys', unit: 'COUNT', formulaExplanation: 'Number of active operational hotel rooms' }
  ],
  IT_SERVICES: [
    { key: 'tcv_usd_m', label: 'Deal TCV ($M)', unit: 'INR_CR', formulaExplanation: 'Total Contract Value signed in quarter' },
    { key: 'attrition_ltm_pct', label: 'Attrition (LTM %)', unit: 'PERCENT', isLowerBetter: true, formulaExplanation: 'Voluntary leavers in past 12M / Average headcount' },
    { key: 'utilization_pct', label: 'Utilization (excl. trainees)', unit: 'PERCENT', formulaExplanation: 'Billable employee hours / Total available employee hours' },
    { key: 'offshore_revenue_pct', label: 'Offshore Mix %', unit: 'PERCENT', formulaExplanation: 'Revenue billed from Indian delivery centers / Total revenue' }
  ]
};
```

---

### 1.4 Target Spec: `specs/additional-tools/simple-text-box.md` (Dispatch Title: `screener.md` — Domain-Specific Financial Query Grammar Engine)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/additional-tools/simple-text-box.md`
- **Dispatch Alias / Target Title:** `specs/additional-tools/screener.md` — *Domain-Specific Financial Query Grammar & Filter Compiler*
- **Lenses Evaluated:** Formal Language Grammar, AST Compilation, Consolidated vs Standalone Parsing, CAGR Edge Cases.

#### B. Core Critique & Vulnerability Analysis
- The existing spec is a simple note-taking box.
- Analysts executing institutional screens require a **domain-specific query syntax** (similar to Screener.in or Bloomberg query builders, but compiled natively).
- The query language must handle:
  1. Scope specifiers: `Consolidated.` vs `Standalone.` (e.g., `Consolidated.Debt_to_Equity < 0.5`).
  2. Temporal specifiers: `TTM.` vs `FY.` (e.g., `TTM.PE < 20 AND FY.ROCE > 20%`).
  3. Historical multi-year compounders: `CAGR(metric, 5Y)`, `CAGR(metric, 10Y)`.
  4. Mathematical edge case guards: Zero denominator, negative earnings, and missing values.

#### C. Actionable Replacement Specification
##### 1. Domain-Specific Language (EBNF Grammar)
```ebnf
Expression      ::= LogicalOr
LogicalOr       ::= LogicalAnd ( ("OR" | "||") LogicalAnd )*
LogicalAnd      ::= Comparison ( ("AND" | "&&") Comparison )*
Comparison      ::= Factor ( (">" | ">=" | "<" | "<=" | "==" | "!=") Factor )?
Factor          ::= Term ( ("+" | "-") Term )*
Term            ::= Primary ( ("*" | "/") Primary )*
Primary         ::= Number | Identifier | FunctionCall | "(" Expression ")"
FunctionCall    ::= ("CAGR" | "AVG" | "MAX" | "MIN" | "COALESCE") "(" Metric "," Duration ")"
Metric          ::= ( "Consolidated." | "Standalone." )? ( "TTM." | "FY." )? Identifier
Duration        ::= [1-9][0-9]? "Y"
```

##### 2. Mathematical Formulas & CAGR Edge-Case Guard
Standard CAGR formula:
$$\text{CAGR}(t_0, t_n, n) = \left(\frac{V_n}{V_0}\right)^{\frac{1}{n}} - 1$$
**Critical Edge Cases:**
1. If Base Year $V_0 \le 0$ (e.g., negative PAT 5 years ago), pure CAGR produces a complex number or undefined behavior.
   - **Guard Rule:** If $V_0 \le 0$ and $V_n > 0$, CAGR is mathematically undefined. Fall back to absolute change or **Average Annual Capital Accretion Rate**, or flag as `COHORT_TURNAROUND`.
2. If $V_n \le 0$, return $-100\%$.
3. If $V_0 = 0$, return `NaN / Undefined`.

```typescript
export function computeSafeCAGR(startVal: number, endVal: number, years: number): {
  cagr: number | null;
  status: 'VALID' | 'NEGATIVE_BASE' | 'NEGATIVE_END' | 'ZERO_BASE';
} {
  if (years <= 0) return { cagr: null, status: 'VALID' };
  if (startVal === 0) return { cagr: null, status: 'ZERO_BASE' };
  if (startVal < 0 && endVal > 0) return { cagr: null, status: 'NEGATIVE_BASE' };
  if (startVal > 0 && endVal <= 0) return { cagr: -1.0, status: 'NEGATIVE_END' };
  if (startVal < 0 && endVal < 0) return { cagr: null, status: 'NEGATIVE_BASE' };

  const cagr = Math.pow(endVal / startVal, 1 / years) - 1;
  return { cagr, status: 'VALID' };
}
```

---

## Part 2: `specs/generate-ideas/` (2 Specifications)

### 2.1 Target Spec: `specs/generate-ideas/idea-generation.md` (Dispatch Title: `ideas-dashboard.md` — Institutional Multi-Source Idea Discovery & Scoring Terminal)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/generate-ideas/idea-generation.md`
- **Dispatch Alias / Target Title:** `specs/generate-ideas/ideas-dashboard.md` — *Multi-Source Idea Discovery & Pipeline Dashboard*
- **Lenses Evaluated:** Buy-Side Analyst Idea Intake, Signal Decay Modeling, Corporate Actions Ingestion.

#### B. Core Critique & Vulnerability Analysis
- The current spec provides a toy scoring formula ($S = \sum w_i S_i$) with arbitrary hardcoded weights that do not account for **signal half-life / time decay**. A block deal signal from yesterday carries massive market impact, whereas a block deal from 60 days ago has already been priced in.
- Lacks Indian institutional quantitative signals:
  1. **Promoter Pledge Reduction:** Promoters revoking share pledges indicates easing debt burdens.
  2. **Bulk / Block Deal Ingestion:** Tracking institutional anchor funds (e.g., Sovereign wealth funds, domestic mutual funds) acquiring > 1% stake.
  3. **Capex Approvals:** Company boards approving large greenfield/brownfield expansions.

#### C. Actionable Replacement Specification
##### 1. Signal Time-Decay Mathematical Model
For any qualitative or quantitative catalyst event $k$ occurring $t$ days ago:
$$S_k(t) = S_{k, \text{base}} \times e^{-\lambda_k \cdot t}$$
where $\lambda_k = \frac{\ln(2)}{\tau_{1/2, k}}$ is the decay constant, and $\tau_{1/2, k}$ is the catalyst half-life:
- Block / Bulk Deal: $\tau_{1/2} = 5$ days ($\lambda = 0.1386$)
- Concall Guidance Upgrade: $\tau_{1/2} = 20$ days ($\lambda = 0.0346$)
- Capex Approval under LODR 30: $\tau_{1/2} = 45$ days ($\lambda = 0.0154$)
- Credit Rating Upgrade: $\tau_{1/2} = 60$ days ($\lambda = 0.0115$)

##### 2. Comprehensive Idea Pipeline Schema
```typescript
export interface InstitutionalIdeaDossier {
  symbol: string;
  isin: string;
  currentMarketPriceInr: number;
  marketCapCategory: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MICRO_CAP';
  compositeScore: number; // 0 - 100
  signals: {
    signalType: 'PROMOTER_BUYING' | 'PLEDGE_REVOCATION' | 'CREDIT_UPGRADE' | 'BLOCK_DEAL' | 'VALUATION_DISLOCATION';
    sourceDate: string;
    rawImpactScore: number;
    decayedScore: number;
    details: string;
  }[];
  thesisDraft: {
    coreCatalyst: string;
    antiThesisRisks: string;
    targetValuationMultiple: string;
    expectedUpsidePct: number;
  };
  stage: 'DISCOVERY' | 'TRIAGE' | 'DEEP_DIVE' | 'IC_PRESENTATION' | 'APPROVED';
}
```

---

### 2.2 Target Spec: `specs/generate-ideas/screening.md` (Dispatch Title: `screen-runner.md` — High-Throughput Screen Runner & Forensic Ranker)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/generate-ideas/screening.md`
- **Dispatch Alias / Target Title:** `specs/generate-ideas/screen-runner.md` — *Multi-Factor Screen Runner & Execution Engine*
- **Lenses Evaluated:** Forensic Accounting Health Filters (Beneish, Altman, Piotroski), Negative Number Handling, Sector Exclusions.

#### B. Core Critique & Vulnerability Analysis
- The current spec's 10-factor screener breaks on loss-making companies ($PAT \le 0$) because $P/E$ becomes negative. In naive percentile ranking, negative P/E is ranked as "lower is better," placing distressed companies with negative PAT at the very top of the value rank!
- Debt-to-Equity and EV/EBITDA are applied universally, penalizing high-performing banks (e.g. HDFC Bank, ICICI Bank) whose business model inherently involves high leverage (deposits).
- Lacks forensic accounting gates: A high-ROE company must be screened against the **Beneish M-Score** (manipulation probability > -1.78) and **Altman Z-Score** to avoid screening into value traps.

#### C. Actionable Replacement Specification
##### 1. Loss-Making & Negative Earnings Segregation Algorithm
```python
def rank_universe_pe(universe_df):
    """
    Separates positive earnings from negative earnings before ranking.
    Positive PAT companies are ranked from lowest P/E to highest P/E (Value rank).
    Negative PAT companies are assigned to the bottom tier with a penalized score.
    """
    profitable = universe_df[universe_df['pat'] > 0].copy()
    loss_making = universe_df[universe_df['pat'] <= 0].copy()
    
    # Percentile ranking on profitable cohort (100 = cheapest, 0 = most expensive)
    profitable['pe_rank'] = (profitable['pe'].rank(ascending=False) / len(profitable)) * 100
    
    # Loss makers get zero value score and flag
    loss_making['pe_rank'] = 0.0
    loss_making['earnings_flag'] = 'LOSS_MAKING'
    
    return pd.concat([profitable, loss_making])
```

##### 2. Financial Sector Exclusion & Metric Substitution Rule
- When `sector IN ('BANKING', 'NBFC', 'HOUSING_FINANCE')`:
  - Drop `Debt_to_Equity`, `EV_to_EBITDA`, and `ROCE`.
  - Replace with `Price_to_Adjusted_Book_Value (P/ABV)`, `Return_on_Assets (RoA)`, `GNPA_pct`, and `Tier1_CRAR`.

---

## Part 3: `specs/watchlist/` (2 Specifications)

### 3.1 Target Spec: `specs/watchlist/watchlist.md` (Dispatch Title: `watchlist-alerts.md` — Real-Time Corporate Action & Market Anomaly Alert Hub)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/watchlist/watchlist.md`
- **Dispatch Alias / Target Title:** `specs/watchlist/watchlist-alerts.md` — *Real-Time Market Data & Anomaly Alert Hub*
- **Lenses Evaluated:** Indian Market Anomaly Detection, Delivery Volume Spikes, Block Deals, Circuit Limits.

#### B. Core Critique & Vulnerability Analysis
- The existing spec monitors basic static price threshold alerts.
- Institutional analysts monitor market microstructure signals:
  1. **Delivery Volume Spike:** Traded volume alone is deceptive. An alert must trigger when **intraday volume > 3x 20-day average delivery volume**, signaling large institutional accumulation.
  2. **NSE/BSE Block & Bulk Deals:** Alerting when a single transaction exceeds **₹10 Crores** (Block Deal window: Morning 08:45–09:00, Afternoon 14:05–14:20) or when aggregate daily trades by an entity exceed **0.5% of total paid-up equity shares** (Bulk Deal).
  3. **Circuit Limit Proximity:** Alert when a stock touches within 0.5% of its statutory Upper/Lower Circuit band (2%, 5%, 10%, 20%).

#### C. Actionable Replacement Specification
##### 1. Market Anomaly Mathematical Conditions
- **Delivery Spike Condition:**
  $$\text{Volume Alert Trigger} \iff V_{\text{today}}(t) \ge 3.0 \times \overline{\text{DelivVol}}_{20\text{D}}$$
- **52-Week High Proximity Condition:**
  $$\text{Proximity Trigger} \iff \frac{|\text{LTP} - \text{High}_{52\text{W}}|}{\text{High}_{52\text{W}}} \le 0.01 \quad (1\% \text{ of 52-week High})$$
- **Circuit Band Proximity Condition:**
  $$\text{Circuit Warning Trigger} \iff \text{LTP} \ge \text{UpperCircuit} \times 0.995 \quad \text{or} \quad \text{LTP} \le \text{LowerCircuit} \times 1.005$$

##### 2. Real-Time Alert Engine Contract & WebSocket Stream
```typescript
export interface MarketAnomalyAlert {
  id: string;
  symbol: string;
  timestamp: string;
  alertType: 'DELIVERY_SPIKE' | 'BLOCK_DEAL' | 'CIRCUIT_BREAKER' | '52W_HIGH_TOUCH' | 'SEBI_PIT_INSIDER';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  triggerDetails: {
    ltp: number;
    volumeMultiple?: number;
    blockDealValueCr?: number;
    circuitBandPct?: number;
    exchange: 'NSE' | 'BSE';
  };
  actionableLinks: {
    openChart: string;
    openBhavcopySummary: string;
    openFilingDetails?: string;
  };
}
```

---

### 3.2 Target Spec: `specs/watchlist/watchlist-manager.md` (Dispatch Title: `watchlist-manager.md` — Watchlist Organization & Column Customizer)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/watchlist/watchlist-manager.md`
- **Dispatch Alias / Target Title:** `specs/watchlist/watchlist-manager.md` — *Watchlist Organization & Column Customizer*
- **Lenses Evaluated:** Redundancy Consolidation, UI Customization, Universe Synchronization.

#### B. Core Critique & Vulnerability Analysis
- This spec duplicates 80% of `specs/watchlist/watchlist.md`. It isolates column configurations into a separate document without providing unified state management.
- Recommendation: Merge `watchlist-manager.md` into `watchlist.md` as the unified **Institutional Watchlist & Market Monitoring Suite**, supporting hierarchical list groups (e.g. `Portfolio Holdings`, `Shortlist / High Conviction`, `Turnaround Radar`, `Special Situations / Demergers`).

#### C. Actionable Replacement Specification
```typescript
export interface UnifiedWatchlistGroup {
  id: string;
  name: string;
  category: 'CORE_PORTFOLIO' | 'RESEARCH_RADAR' | 'SPECIAL_SITUATIONS' | 'SME_UNIVERSE';
  benchmarkSymbol: 'NIFTY_50' | 'NIFTY_MIDCAP_150' | 'NIFTY_SMALLCAP_250';
  symbols: {
    symbol: string;
    targetPriceInr?: number;
    convictionRating: 'HIGH' | 'MEDIUM' | 'LOW';
    thesisTags: string[];
    addedDate: string;
  }[];
  columnLayoutPreset: 'VALUATION_VIEW' | 'TECHNICAL_DELIVERY_VIEW' | 'FORENSIC_HEALTH_VIEW';
}
```

---

## Part 4: `specs/grwth/` (1 Specification)

### 4.1 Target Spec: `specs/grwth/grwth-pipeline.md` (Dispatch Title: `growth-framework.md` — Fundamental Reinvestment Rate, ROCE & ICOR Growth Modeling Suite)

#### A. Target Metadata & Scope
- **Disk Path:** `specs/grwth/grwth-pipeline.md`
- **Dispatch Alias / Target Title:** `specs/grwth/growth-framework.md` — *Fundamental Reinvestment Rate, ROCE & Industrial Capex Pipeline*
- **Lenses Evaluated:** Macroeconomics, Fundamental Capital Allocation, Incremental Capital Output Ratio (ICOR), Indian Industrial Clearances (MoEFCC / SPCB).

#### B. Core Critique & Vulnerability Analysis
- The existing spec tracks physical construction milestones (11 stages) with an empirical S-curve, but is completely divorced from **economic growth theory**:
  1. **Reinvestment Rate vs. ROIC Modeling:** In corporate finance, sustainable earnings growth is governed by:
     $$g = \text{Reinvestment Rate} \times \text{ROIC}$$
     A company announcing ₹5,000 Cr capex creates value *only* if its Marginal Return on Invested Capital ($\text{ROIC}_{\text{marginal}}$) exceeds its WACC. If $\text{ROIC} < \text{WACC}$, capex destroys shareholder value. The current spec lacks this economic filter.
  2. **Incremental Capital Output Ratio (ICOR):** In Indian capital-intensive sectors (Steel, Cement, Power, Refining), capex efficiency is evaluated via ICOR:
     $$\text{ICOR} = \frac{\Delta \text{Capital Invested}}{\Delta \text{Gross Output or Net Revenue}}$$
     A rising ICOR signals capital misallocation and project cost inflation.
  3. **Indian Statutory & Regulatory Bottlenecks:** Indian industrial projects face prolonged delays in statutory clearance windows:
     - **MoEFCC (Ministry of Environment, Forest and Climate Change):** Terms of Reference (ToR), Public Hearing, Environmental Clearance (EC) Stage-1 / Stage-2.
     - **State Pollution Control Boards (SPCB):** Consent to Establish (CTE) and Consent to Operate (CTO).
     - **Transmission / Power Linkage:** State Electricity Distribution Companies (DISCOMs).
     The spec treats construction as linear without risk-weighting statutory approval bottlenecks.

#### C. Actionable Replacement Specification
##### 1. Fundamental Reinvestment & Economic Value Added (EVA) Formulas
$$\text{Reinvestment Rate} = \frac{\text{Gross CapEx} - \text{D\&A} + \Delta \text{Non-Cash Working Capital}}{\text{NOPAT}}$$
$$\text{Invested Capital} = \text{Total Equity} + \text{Total Debt} - \text{Cash \& Liquid Mutual Funds}$$
$$\text{ROIC} = \frac{\text{NOPAT}}{\text{Average Invested Capital}}$$
$$\text{Economic Value Added (EVA)} = \text{Invested Capital} \times (\text{ROIC} - \text{WACC})$$

##### 2. Statutory Project Clearance Stage-Gate Matrix
```typescript
export interface IndustrialCapexMilestoneMatrix {
  projectId: string;
  companySymbol: string;
  capexBudgetInrCr: number;
  expectedAnnualOutputVolume: number;
  expectedMarginalRoicPct: number;
  projectIcor: number; // CapEx / Incremental Revenue
  
  statutoryClearanceChecklist: {
    landPossessionStatus: 'NOT_ACQUIRED' | 'MOU_SIGNED' | 'LAND_IN_POSSESSION';
    moefccStatus: 'NOT_APPLIED' | 'TOR_GRANTED' | 'PUBLIC_HEARING_HELD' | 'EC_GRANTED' | 'APPEAL_PENDING_NGT';
    spcbCteApproved: boolean; // Consent to Establish
    spcbCtoApproved: boolean; // Consent to Operate
    powerLinkageSecured: boolean;
    waterAllocationApproved: boolean;
  };
  
  riskAdjustedTimeline: {
    baseTargetCommissioningDate: string;
    regulatoryDelayBufferMonths: number;
    projectedCommercialDate: string;
  };
}
```

##### 3. Capex-to-Earnings Accretion S-Curve Model
Revenue adoption follows the logistic S-curve:
$$R(t) = \frac{R_{\max}}{1 + e^{-k(t - t_0)}}$$
where:
- $R_{\max} = \text{Rated Plant Capacity} \times \text{Expected Realization per Unit}$
- $t_0 = \text{Commercial Operation Date (COD)} + \text{Trial Run Window}$
- $k = \text{Ramp-up Velocity Parameter}$ (calibrated by industry: 0.15 for Refineries, 0.35 for Cement, 0.50 for Auto Assembly).

---

## Part 5: Implementation Roadmap & Migration Priorities

| Target Spec File | Canonical Title | Primary Action | Priority | Target Sprint |
|---|---|---|---|---|
| `specs/additional-tools/filtered-table.md` | `data-export.md` | Implement dynamic Excel formula export and Indian currency formatter. | **P1 (High)** | Sprint 2 |
| `specs/additional-tools/ui-primitives.md` | `advanced-charting.md` | Replace with multi-ticker split charting, corporate action split factors, and NSE Bhavcopy delivery overlays. | **P0 (Critical)** | Sprint 1 |
| `specs/additional-tools/multi-text-box.md` | `peer-comparisons.md` | Implement sector-specific KPI normalization registry (Banking, Cement, Hotels, SaaS). | **P0 (Critical)** | Sprint 1 |
| `specs/additional-tools/simple-text-box.md` | `screener.md` | Author EBNF financial query compiler with CAGR negative-base guards. | **P1 (High)** | Sprint 2 |
| `specs/generate-ideas/idea-generation.md` | `ideas-dashboard.md` | Deploy catalyst time-decay mathematical engine and signal ingestion pipeline. | **P1 (High)** | Sprint 2 |
| `specs/generate-ideas/screening.md` | `screen-runner.md` | Fix negative P/E ranking segregation and financial sector exclusions. | **P0 (Critical)** | Sprint 1 |
| `specs/watchlist/watchlist.md` | `watchlist-alerts.md` | Deploy delivery volume spike, block deal, and circuit limit alert engine. | **P0 (Critical)** | Sprint 1 |
| `specs/watchlist/watchlist-manager.md` | `watchlist-manager.md` | Consolidate redundant logic into `watchlist.md` as a unified suite. | **P2 (Medium)** | Sprint 3 |
| `specs/grwth/grwth-pipeline.md` | `growth-framework.md` | Integrate Reinvestment Rate, ROIC, ICOR modeling, and MoEFCC statutory gate matrix. | **P0 (Critical)** | Sprint 1 |

All 9 specifications have been comprehensively audited and actionable replacements defined without modifying files in `specs/`.
