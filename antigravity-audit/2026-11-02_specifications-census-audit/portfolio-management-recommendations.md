# Portfolio Management Module Specifications: Comprehensive Audit & Implementation Recommendations

**Document ID:** `specs/audits/portfolio-management-recommendations.md`  
**Target Category:** `specs/portfolio-management/` (16 Specification Files)  
**Author:** Institutional Portfolio Management & Engineering Auditor (Hermes Specialist Team)  
**Status:** Completed & Actionable  
**Date:** November 2026  
**Audited Target Specifications:**
1. `specs/portfolio-management/auto-quality-checks.md`
2. `specs/portfolio-management/capital-gains-import.md`
3. `specs/portfolio-management/construction-diversification.md`
4. `specs/portfolio-management/corporate-actions-handler.md`
5. `specs/portfolio-management/current-holdings.md`
6. `specs/portfolio-management/event-risk-monitor.md`
7. `specs/portfolio-management/fundamentals-quality.md`
8. `specs/portfolio-management/liquidity-risk.md`
9. `specs/portfolio-management/performance-metrics.md`
10. `specs/portfolio-management/portfolio-dashboard.md`
11. `specs/portfolio-management/portfolio-risk.md`
12. `specs/portfolio-management/risk-metrics.md`
13. `specs/portfolio-management/statement-reconciliation.md`
14. `specs/portfolio-management/trade-history.md`
15. `specs/portfolio-management/valuation-metrics.md`
16. `specs/portfolio-management/valuation-risk.md`

---

## 1. Executive Summary & Critical Audit Findings

A rigorous, multidisciplinary audit of all 16 specification files under `specs/portfolio-management/` reveals substantial architectural gaps, mathematical inaccuracies, and statutory non-compliance with Indian market execution realities. While the initial specifications provide an intuitive baseline UI shell, they fail in critical institutional, quantitative, tax, and regulatory workflows.

### Summary of Systemic Deficiencies Identified:
1. **Indian Capital Gains Tax Non-Compliance**:
   - Completely ignores the **July 23, 2024 Union Budget** tax regime overhaul (Section 111A STCG increased from 15% to 20%; Section 112A LTCG increased from 10% to 12.5% with ₹1.25 Lakh exemption threshold). For FY 2024-25, transactions must be bifurcated across pre- and post-July 23, 2024 windows.
   - Omission of **Section 55(2)(ac) Grandfathering Fair Market Value (FMV)** mechanics for equities acquired prior to January 31, 2018.
   - Fatal error in `trade-history.md` applying the ₹1 Lakh LTCG exemption *per trade* rather than as an aggregate annual exemption across the financial year, leading to severe tax underreporting.
   - Improper classification of intraday equity and F&O derivatives under capital gains instead of **Speculative and Non-Speculative Business Income under Section 43(5)**.
   - Violation of **Section 48** by improperly deducting STT as an expense from capital gains.
2. **Depository & Clearing Execution Blindness**:
   - Absence of **NSDL/CDSL Consolidated Account Statement (CAS)** three-way reconciliation (Broker Ledger $\leftrightarrow$ Demat Holding $\leftrightarrow$ Bank Statement).
   - Ignorance of **SEBI T+1 settlement cycles** (effective January 27, 2023) where Ex-Date equals Record Date, while specs incorrectly reference T+2 liquidity and show Record Dates occurring before Ex-Dates.
   - Complete omission of **Client Unpaid Securities Account (CUSA)**, Margin Pledge/Re-pledge flags, and MTF collateral segregation.
3. **Corporate Actions Accounting Errors**:
   - Incorrectly assuming corporate demergers reduce parent company share quantities, while omitting the statutory **Section 49(2C) and 49(2D)** net book value cost apportionment rules.
   - Diluting bonus share cost basis across total shares rather than maintaining a **₹0 cost basis under Section 55(2)(aa)** with dual tax-lot vs. book-cost tracking.
   - Complete neglect of **Rights Entitlements (RE)** exchange trading and fractional share cash disbursement payouts.
4. **Mathematical & Quantitative Pitfalls**:
   - Calculating portfolio valuation multiples ($P/E$, $P/B$) via **arithmetic mean rather than Weighted Harmonic Mean**, producing severe upward distortion from outlier multiples.
   - Inability of performance engines to link daily returns via **Daily Modified Dietz**, resulting in flawed TWR when intraday cash flows occur.
   - Flawed VaR horizon scaling multiplying sample returns by $\sqrt{h}$ prior to quantile evaluation, and stress-testing logic multiplying daily returns by $(1 + \text{shock})$ rather than shocking macro factors.
   - Lack of convergence guardrails in Newton-Raphson XIRR solvers, failing to provide Brent/bisection fallbacks or holding-period-return overrides for durations under 30 days.
   - Outdated static market cap thresholds (₹20,000 Cr / ₹5,000 Cr) violating **SEBI/AMFI semi-annual market cap ranking** mandates.

This document provides complete, line-by-line actionable engineering recommendations, exact mathematical formulations, TypeScript schemas, Python algorithms, and UI workflows to transform these 16 specifications into an institutional-grade portfolio engine.

---

## 2. Cross-Cutting Architectural Frameworks

Prior to detailing individual specification audits, the following six architectural pillars establish the foundation for the entire portfolio management engine.

```
       ┌─────────────────────────────────────────────────────────────┐
       │             Hermes Portfolio Management Engine              │
       └──────┬──────────────────────┬──────────────────────┬────────┘
              │                      │                      │
 ┌────────────▼─────────┐ ┌──────────▼──────────┐ ┌─────────▼────────────┐
 │  Data Plumbing &     │ │  Tax Engine &       │ │  Performance &       │
 │  3-Way Reconciliation│ │  Corporate Actions  │ │  Quantitative Risk   │
 │                      │ │                     │ │                      │
 │ • NSDL/CDSL CAS Parser│ │ • July 2024 Budget  │ │ • Daily Mod. Dietz   │
 │ • Broker Contract Note│ │ • Sec 55(2)(ac) FMV │ │ • Brent XIRR Solver  │
 │ • Idempotent Ingestion│ │ • Sec 49(2C) Demerg │ │ • Cornish-Fisher VaR │
 │ • T+1 / CUSA / Pledge │ │ • Sec 43(5) Business│ │ • Harmonic Multiples │
 └──────────────────────┘ └─────────────────────┘ └──────────────────────┘
```

### 2.1 Lens 1: Indian Statutory Charges & Contract Note Parsing Engine
Every Indian equity trade produces a legally binding Contract Note under SEBI regulations. The engine must compute and reconcile every levy to the exact paisa (₹0.01 tolerance):

| Levy / Charge | Statutory Basis & Rate | Equity Delivery (Cash) | Intraday Equity | F&O (Futures) | F&O (Options) | Tax Deductibility (Sec 48) |
|---|---|---|---|---|---|---|
| **Brokerage** | Broker rate card | Flat ₹20 or up to 0.1% | Flat ₹20 or 0.03% | Flat ₹20 or 0.03% | Flat ₹20 / order | ✅ Deductible transfer expense |
| **STT** (Securities Transaction Tax) | Finance Act / Budget 2024 | 0.1% on Buy & Sell | 0.025% on Sell only | 0.02% on Sell (eff. Oct 1, 2024) | 0.1% on Premium on Sell | ❌ Strictly Non-Deductible for CG |
| **Exchange Turnover Charges** | NSE / BSE tariff | NSE: 0.00297% (eff. Oct 1, 2024) | NSE: 0.00297% | NSE: 0.00173% | NSE: 0.03503% (on premium) | ✅ Deductible transfer expense |
| **SEBI Turnover Fee** | SEBI (Stock Brokers) Reg. | ₹10 / Crore (0.0001%) | ₹10 / Crore | ₹10 / Crore | ₹10 / Crore | ✅ Deductible transfer expense |
| **Stamp Duty** | Indian Stamp Act (eff. July 1, 2020) | 0.015% on BUY side only | 0.003% on BUY side | 0.002% on BUY side | 0.003% on BUY side | ✅ Deductible cost of acquisition |
| **GST** | CGST + SGST or IGST | 18% on (Brokerage + Exch + SEBI) | 18% on fees | 18% on fees | 18% on fees | ✅ Deductible transfer expense |
| **DP Charges** | CDSL / NSDL per ISIN debit | ₹13.50 to ₹18.50 + 18% GST (on sell) | ₹0 (no demat debit) | ₹0 | ₹0 | ✅ Deductible transfer expense |

**Contract Note Reconciliation Formula:**
$$\text{Gross Obligation} = \sum (\text{Qty}_i \times \text{Price}_i)$$
$$\text{Total Deductible Transfer Expenses} = \text{Brokerage} + \text{Exchange Charges} + \text{SEBI Fee} + \text{Stamp Duty (on buy)} + \text{GST} + \text{DP Charges (on sell)}$$
$$\text{Net Settlement Payable/Receivable} = \text{Gross Obligation} \pm \text{Total Deductible Expenses} \pm \text{STT}$$

---

### 2.2 Lens 2: Indian Capital Gains Tax Engine (Post-July 23, 2024 Transition)

The Union Budget presented on July 23, 2024 overhauled Chapter IV-E of the Income Tax Act, 1961:
1. **Short-Term Capital Gains (Section 111A)**:
   - For sales executed on or before July 22, 2024: **15%**
   - For sales executed on or after July 23, 2024: **20%**
2. **Long-Term Capital Gains (Section 112A)**:
   - For sales executed on or before July 22, 2024: **10%** on gains exceeding aggregate threshold.
   - For sales executed on or after July 23, 2024: **12.5%** on gains exceeding aggregate threshold.
   - Aggregate annual basic exemption for FY 2024-25 increased from ₹1,00,000 to **₹1,25,000**.
   - Allocation of the ₹1.25 Lakh exemption: Applied against pre-July 23 gains first (taxed at 10%) or post-July 23 gains (taxed at 12.5%) in the manner most beneficial to the assessee under CBDT circular guidelines.
3. **Section 55(2)(ac) Grandfathering Mechanics (Pre-Jan 31, 2018 Acquisitions)**:
   For any equity share or unit of equity-oriented fund acquired before February 1, 2018:
   $$\text{Cost of Acquisition (COA)} = \max\Big(\text{Actual Purchase Price}, \min(\text{FMV as of 31-Jan-2018}, \text{Sale Price})\Big)$$
   where $\text{FMV as of 31-Jan-2018}$ is the highest traded price on NSE/BSE on 31-Jan-2018 (or the unadjusted traded price on the last trading day prior to 31-Jan-2018 if not traded that day).
4. **Income Characterization under Section 43(5)**:
   - **Delivery Equity**: Capital Gains (Sec 111A / 112A). STT non-deductible under Sec 48.
   - **Intraday Equity (Speculative Business Income)**: Sec 43(5). Taxed at slab rates. Losses cannot be offset against any income other than speculative business profits.
   - **F&O Derivatives (Non-Speculative Business Income)**: Sec 43(5)(e). Taxed at slab rates under "Profits and Gains of Business or Profession" (PGBP). All expenses including advisory, terminal costs, STT (under Sec 36(1)(xvi)), and interest are fully deductible.

```python
def compute_indian_tax_lot_capital_gain(lot_buy_date, sell_date, buy_price, sell_price, qty, fmv_31jan2018=None):
    """
    Computes Capital Gain under Section 111A, 112A, and 55(2)(ac)
    reflecting the July 23, 2024 Union Budget transition.
    """
    holding_days = (sell_date - lot_buy_date).days
    is_ltcg = holding_days > 365
    
    # Section 55(2)(ac) Grandfathering
    if lot_buy_date < date(2018, 2, 1) and fmv_31jan2018 is not None:
        capped_fmv = min(fmv_31jan2018, sell_price)
        effective_coa = max(buy_price, capped_fmv)
    else:
        effective_coa = buy_price
        
    gain_per_share = sell_price - effective_coa
    total_gain = gain_per_share * qty
    
    # July 23, 2024 Budget Cut-Off
    budget_transition = date(2024, 7, 23)
    
    if is_ltcg:
        tax_regime = "LTCG_POST_BUDGET" if sell_date >= budget_transition else "LTCG_PRE_BUDGET"
        tax_rate = 0.125 if sell_date >= budget_transition else 0.10
    else:
        tax_regime = "STCG_POST_BUDGET" if sell_date >= budget_transition else "STCG_PRE_BUDGET"
        tax_rate = 0.20 if sell_date >= budget_transition else 0.15
        
    return {
        "holding_days": holding_days,
        "is_ltcg": is_ltcg,
        "tax_regime": tax_regime,
        "tax_rate": tax_rate,
        "effective_coa": effective_coa,
        "capital_gain": total_gain
    }
```

---

### 2.3 Lens 3: SEBI Corporate Actions & Settlement Mechanics

1. **SEBI T+1 Settlement Regime**:
   Since January 27, 2023, Indian equities operate on T+1 rolling settlement. Consequently, the **Ex-Date and Record Date are identical calendar days**. Cum-date is $T-1$.
2. **Bonus Shares Cost Basis (Section 55(2)(aa))**:
   The statutory cost of acquisition of bonus shares is **₹0.00**. Holding period commences on the **date of allotment**. The system must preserve original tax-lot integrity while calculating blended cost strictly for accounting P&L:
   $$\text{Tax Lot 1 (Original)}: Q_{\text{orig}} \text{ shares @ Buy Price}, \text{ Date} = D_{\text{buy}}$$
   $$\text{Tax Lot 2 (Bonus)}: Q_{\text{bonus}} \text{ shares @ ₹0.00}, \text{ Date} = D_{\text{allotment}}$$
3. **Demerger Cost Apportionment (Section 49(2C) & 49(2D))**:
   Demergers do NOT extinguish or reduce parent share count. Shareholders receive new shares of the resulting company. The cost of acquisition of the original parent shares is apportioned based on the net asset ratio:
   $$\text{Apportionment Ratio } (R) = \frac{\text{Net Book Value of Assets transferred in Demerger}}{\text{Net Worth of Demerged Co immediately prior to Demerger}}$$
   $$\text{Cost of Resulting Company Shares} = \text{Cost of Original Shares} \times R$$
   $$\text{Cost of Demerged Company Shares (Post-Demerger)} = \text{Cost of Original Shares} \times (1 - R)$$
   Holding period of the resulting company shares includes the holding period of original parent shares under **Section 2(42A)(g)**.
4. **Rights Entitlements (RE) Trading**:
   Rights Entitlements are credited to Demat with distinct ISINs and traded on secondary exchanges. 
   - Renunciation on exchange: Realized STCG with ₹0 cost of acquisition.
   - Application: Cash outflow = $\text{Application Qty} \times \text{Issue Price}$; new lot created on allotment date.
   - Lapsed: No cash impact; original cost basis untouched.
5. **Fractional Share Cash Disbursements**:
   Depositories (CDSL/NSDL) do not hold fractional shares. Companies appoint fractional share trustees to consolidate fractions, sell them on the exchange, and disburse cash via NEFT/ECS directly to client bank accounts. The engine must reconcile these as corporate cash distributions.

---

### 2.4 Lens 4: Quantitative Performance & Risk Formulas

1. **Daily Modified Dietz & True Time-Weighted Return (TWR)**:
   For any day $t$ with starting market value $BMV_t$, ending market value $EMV_t$, and net external cash flows $CF_t$:
   $$R_{\text{daily}, t} = \frac{EMV_t - BMV_t - CF_t}{BMV_t + W_t \cdot CF_t}$$
   where $W_t \in [0, 1]$ represents the day weighting of the cash flow (default 0.5 for mid-day cash flows).
   $$\text{Cumulative TWR} = \prod_{t=1}^N (1 + R_{\text{daily}, t}) - 1$$
   $$\text{Annualized TWR} = (1 + \text{Cumulative TWR})^{\frac{365}{\text{Days}}} - 1 \quad (\text{only if Days} \ge 365)$$
2. **Robust XIRR Solver with Fallback Hierarchy**:
   The XIRR equation seeks the root $r$ such that:
   $$\sum_{i=1}^M \frac{CF_i}{(1 + r)^{\frac{d_i - d_0}{365}}} = 0$$
   - *Solver Guardrails*:
     - If portfolio duration $< 30$ days: Suppress annualized XIRR and display Holding Period Return (HPR) to prevent misleading annualized figures (e.g., $+4500\%$).
     - Newton-Raphson primary solver with derivative $f'(r) = -\sum_{i=1}^M \frac{d_i - d_0}{365} \frac{CF_i}{(1 + r)^{\frac{d_i - d_0}{365} + 1}}$.
     - If Newton-Raphson diverges or exceeds 50 iterations: Automatically fall back to **Brent's Method** bounded within $[-0.999, 10.0]$.
3. **Sortino Ratio with Downside Deviation & Minimum Acceptable Return (MAR)**:
   $$\text{Downside Deviation} = \sqrt{\frac{1}{N} \sum_{t=1}^N \min(R_t - MAR, 0)^2}$$
   *(Note: Denominator divides by total sample size $N$, not the count of negative days).*
   $$\text{Sortino Ratio} = \frac{R_{\text{portfolio}} - MAR}{\text{Downside Deviation}} \times \sqrt{252}$$
   Standard Indian institutional benchmark $MAR = R_f$ (91-day FBIL T-Bill yield, typically ~6.65%).
4. **Cornish-Fisher Fat-Tail VaR & CVaR**:
   Given portfolio return skewness $S$ and excess kurtosis $K$, the standard Gaussian quantile $z_\alpha$ (e.g., $-1.645$ for 95%) is transformed via the Cornish-Fisher expansion:
   $$z_{CF} = z_\alpha + \frac{1}{6}(z_\alpha^2 - 1)S + \frac{1}{24}(z_\alpha^3 - 3z_\alpha)K - \frac{1}{36}(2z_\alpha^3 - 5z_\alpha)S^2$$
   $$\text{Parametric VaR}_{95\%} = -(\mu + z_{CF} \cdot \sigma)$$
5. **Weighted Harmonic Mean for Valuation Multiples**:
   To prevent severe arithmetic upward skewness from high-multiple constituents:
   $$P/E_{\text{portfolio}} = \frac{1}{\sum_{i=1}^n \frac{w_i}{P/E_i}} = \frac{\sum w_i}{\sum w_i \cdot \frac{E_i}{P_i}} = \frac{1}{\text{Portfolio Earnings Yield}}$$
   For constituents with $E_i \le 0$ (loss-makers), calculate aggregate earnings yield:
   $$P/E_{\text{portfolio, aggregate}} = \frac{\sum_{i=1}^n w_i \times \text{Market Cap}_i}{\sum_{i=1}^n w_i \times \text{PAT}_i} \quad (\text{flag as N/A if aggregate PAT} \le 0)$$

---

### 2.5 Lens 5: Institutional Portfolio UI/UX System

1. **Information Density & Multi-Lot Holdings Grid**:
   - Primary table displaying aggregated positions with expandable drill-down drawers for individual tax lots (Buy Date, Days Held, STCG/LTCG status, 31-Jan-2018 Grandfathering status).
   - Position status flags: **Demat Settled**, **T1 Unsettled**, **Margin Pledged**, **MTF Funded**.
2. **Portfolio Drift & Rebalancing Preview Modal**:
   - Visual target vs. actual weight drift indicators with alert badges when drift exceeds $\pm 2.0\%$.
   - Interactive rebalancing preview displaying: proposed buy/sell quantities rounded to board lots, estimated transaction charges, statutory levies (STT, Stamp Duty, GST), and **immediate tax liability triggered** (STCG @ 20%, LTCG @ 12.5%).
3. **Tax-Loss Harvesting Workflow**:
   - Dedicated tax-loss harvesting tab identifying unrealized short-term losses before March 31.
   - Computes net tax savings ($\text{Realized Loss} \times 20\%$) and suggests correlated replacement instruments to maintain market exposure without triggering wash-sale scrutiny.

---

### 2.6 Lens 6: Data Plumbing & State Synchronization

```
 ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
 │  Broker P&L /  │     │   NSDL / CDSL  │     │   Bank Fund    │
 │  Tradebook CSV │     │    e-CAS PDF   │     │     Ledger     │
 └───────┬────────┘     └───────┬────────┘     └───────┬────────┘
         │                      │                      │
         ▼                      ▼                      ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                Triple-Way Reconciliation Pipeline            │
 │   • Trade Idempotency Key: broker_id + order_id + trade_id   │
 │   • Demat Matching: ISIN + DP_ID + Client_BO_ID              │
 │   • Corporate Action & Settlement Drift Check (T+1 / CUSA)   │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │           Canonical Unified Portfolio State (DB)             │
 └──────────────────────────────────────────────────────────────┘
```

1. **Depository CAS Ingestion**:
   - Automated parser for password-protected CDSL/NSDL monthly e-CAS PDF statements (Standard password: `PAN (Uppercase) + DOB (DDMMYYYY)`).
   - Ingests Beneficiary Owner ID (BO ID), Depository Participant ID (DP ID), ISIN-level locked-in shares, pledged balances, and mutual fund folio holdings.
2. **Idempotent Ingestion Pipeline**:
   - Unique composite natural key:
     $$\text{Idempotency Key} = \text{SHA256}(\text{broker\_id} \mathbin{\Vert} \text{order\_id} \mathbin{\Vert} \text{trade\_id} \mathbin{\Vert} \text{isin} \mathbin{\Vert} \text{trade\_timestamp})$$
   - Prevents duplicate trade insertion upon overlapping broker statement imports.

---

## 3. In-Depth Specification Audits & Actionable Recommendations

---

### 3.1 Spec 1: `specs/portfolio-management/auto-quality-checks.md`
**Component Name:** Auto Quality Checks Engine  
**Current Status:** Not Started | Priority: High  

#### 3.1.1 Lenses Evaluated & Core Critique
- **Lens 1 (Brokerage & Reconciliation)**: The 11 defined checks overlook essential Indian clearing anomalies: CUSA pool account retention, uncleared T+1 trades, and MTF collateral mismatches.
- **Lens 3 (Corporate Actions)**: Check 11 ("Corporate Action Gaps") lacks rules for fractional share cash reconciliations and rights entitlement expirations.
- **Lens 6 (Data Plumbing)**: Checks 8 and 9 are numbered identically to Checks 5 and 6 in lines 76-80 of the spec, showing basic copy-paste syntax errors. There is no depository holding check against NSDL/CDSL CAS balances.

#### 3.1.2 Actionable Replacements & Enhanced Specification
Expand from 11 checks to **16 Institutional Integrity Checks** with concrete SQL/ORM rules:

```typescript
export interface DataQualityCheckRule {
  checkId: number;
  name: string;
  category: 'CASH' | 'HOLDING' | 'TAX' | 'CLEARING' | 'CORPORATE_ACTION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sqlQuery: string;
  autoRemediationType: 'FIFO_REBUILD' | 'FLAG_FOR_REVIEW' | 'CAS_POLL' | 'MERGE_SYMBOLS';
}

export const INSTITUTIONAL_QUALITY_CHECKS: DataQualityCheckRule[] = [
  {
    checkId: 1,
    name: "Negative Share Quantity",
    category: "HOLDING",
    severity: "CRITICAL",
    sqlQuery: "SELECT isin, symbol, SUM(quantity) FROM portfolio_holdings GROUP BY isin, symbol HAVING SUM(quantity) < 0",
    autoRemediationType: "FLAG_FOR_REVIEW"
  },
  {
    checkId: 2,
    name: "Unsettled T+1 Clearing Overhang",
    category: "CLEARING",
    severity: "HIGH",
    sqlQuery: "SELECT * FROM transactions WHERE trade_date < CURRENT_DATE - INTERVAL '2 days' AND settlement_status = 'PENDING'",
    autoRemediationType: "FLAG_FOR_REVIEW"
  },
  {
    checkId: 3,
    name: "CUSA Retention Breach (>7 Days)",
    category: "CLEARING",
    severity: "CRITICAL",
    sqlQuery: "SELECT * FROM holdings WHERE account_type = 'CUSA' AND allocation_date < CURRENT_DATE - INTERVAL '7 days'",
    autoRemediationType: "FLAG_FOR_REVIEW"
  },
  {
    checkId: 4,
    name: "Pre-2018 Acquisitions Missing 31-Jan-2018 FMV",
    category: "TAX",
    severity: "HIGH",
    sqlQuery: "SELECT isin, symbol, purchase_date FROM tax_lots WHERE purchase_date < '2018-02-01' AND fmv_31jan2018 IS NULL",
    autoRemediationType: "CAS_POLL"
  },
  {
    checkId: 5,
    name: "Depository CAS Discrepancy",
    category: "HOLDING",
    severity: "CRITICAL",
    sqlQuery: "SELECT h.isin, h.settled_qty, cas.cas_qty FROM holdings h FULL OUTER JOIN cas_balances cas ON h.isin = cas.isin WHERE h.settled_qty != cas.cas_qty",
    autoRemediationType: "FLAG_FOR_REVIEW"
  },
  {
    checkId: 6,
    name: "Duplicate Broker Trade Ingestion",
    category: "HOLDING",
    severity: "CRITICAL",
    sqlQuery: "SELECT idempotency_key, COUNT(*) FROM raw_trades GROUP BY idempotency_key HAVING COUNT(*) > 1",
    autoRemediationType: "FIFO_REBUILD"
  }
];
```

#### 3.1.3 Acceptance Criteria
- [ ] Auto-quality check runner must execute all 16 checks within 1.5 seconds for a portfolio of 500 positions.
- [ ] Any CUSA retention over 7 days triggers an immediate high-priority warning banner on the main dashboard.
- [ ] Fix row numbering bugs in spec lines 76-81.

---

### 3.2 Spec 2: `specs/portfolio-management/capital-gains-import.md`
**Component Name:** Multi-Broker Capital Gains & Statement Importer  
**Current Status:** Not Started | Priority: High  

#### 3.2.1 Lenses Evaluated & Core Critique
- **Lens 1 (Broker Statement Formats)**: The spec lists Zerodha, Groww, Upstox, ICICI Direct, and Angel One, but fails to distinguish between *Tax P&L reports* (which contain broker FIFO matching) and *Tradebook files* (raw order executions).
- **Lens 2 (Indian Capital Gains Laws)**: The spec contains zero mention of the **July 23, 2024 Budget changes**, treating all STCG as 15% and all LTCG as 10%. It omits the Section 55(2)(ac) grandfathering FMV lookup table.
- **Lens 2 (Section 43(5) Business Income)**: Lumps intraday trades and F&O contracts into STCG, which is illegal under Indian Income Tax filing standards (ITR-2 vs. ITR-3).
- **Lens 6 (Data Plumbing)**: `sttPaid` is included in the capital gains record schema without specifying that Section 48 bars STT from being deducted from capital gains.

#### 3.2.2 Actionable Replacements & Enhanced Specification
1. **Budget 2024 Split Tax Schema**:
```typescript
export interface TaxComputedLot {
  lotId: string;
  isin: string;
  symbol: string;
  quantity: number;
  buyDate: string;
  sellDate: string;
  holdingDays: number;
  isLtcg: boolean;
  actualBuyPrice: number;
  fmv31Jan2018?: number;
  effectiveCoa: number; // Max(Actual, Min(FMV, SellPrice))
  sellPrice: number;
  grossGain: number;
  deductibleExpenses: number; // Brokerage + Exch + Stamp Duty + GST (STT excluded!)
  netCapitalGain: number;
  taxPeriod: 'PRE_BUDGET_2024' | 'POST_BUDGET_2024';
  applicableTaxRate: 0.15 | 0.20 | 0.10 | 0.125;
}

export interface BusinessIncomeTrade {
  tradeId: string;
  segment: 'INTRADAY_EQUITY' | 'EQUITY_FUTURES' | 'EQUITY_OPTIONS';
  incomeCategory: 'SPECULATIVE_BUSINESS' | 'NON_SPECULATIVE_BUSINESS';
  grossTurnover: number; // Computed per ICAI Guidance Note on Tax Audit
  netProfitLoss: number;
  deductibleStt: number; // Deductible under Sec 36(1)(xvi) for business
  brokerageAndCharges: number;
}
```

2. **Broker Statement Normalization Mapping**:
Add explicit parser templates for Zerodha Console (`Tax P&L XLSX`), Groww (`Capital Gains Excel`), and ICICI Direct (`Capital Gains Statement PDF`):
- Zerodha: Read sheet `Equity`, column `Buy Date`, `Sell Date`, `Buy Value`, `Sell Value`, `Fair Market Value (31-Jan-2018)`.
- Disallow STT subtraction from transfer consideration under Sec 48.

#### 3.2.3 Acceptance Criteria
- [ ] Trades executed between 01-Apr-2024 and 22-Jul-2024 calculate STCG @ 15% and LTCG @ 10%.
- [ ] Trades executed on or after 23-Jul-2024 calculate STCG @ 20% and LTCG @ 12.5%.
- [ ] Intraday equity is routed to the Speculative Business Income report, never STCG.

---

### 3.3 Spec 3: `specs/portfolio-management/construction-diversification.md`
**Component Name:** Portfolio Construction & Diversification  
**Current Status:** Not Started | Priority: High  

#### 3.3.1 Lenses Evaluated & Core Critique
- **Lens 4 (Formulas & Math)**:
  - Line 34 UI shows `Diversification Ratio: 0.68`. As proven mathematically, $DR = \frac{\sum w_i \sigma_i}{\sigma_p} \ge 1.0$. Showing a value below 1.0 is an embarrassing mathematical impossibility.
  - Market cap categorization in lines 96-98 hardcodes `mcap > 20000` for Large Cap and `5000 < mcap <= 20000` for Mid Cap. This violates **SEBI circular SEBI/HO/IMD/DF3/CIR/P/2017/114**, which defines Large Cap as 1st–100th, Mid Cap as 101st–250th, and Small Cap as 251st onwards, published semi-annually by AMFI.
- **Lens 5 (UI/UX)**: Lacks an actionable rebalancing workflow with order generation and tax impact preview.

#### 3.3.2 Actionable Replacements & Enhanced Specification
1. **Mathematical & SEBI Correction**:
```python
def compute_portfolio_diversification(weights, volatilities, cov_matrix, amfi_rank_map):
    """
    Computes Herfindahl-Hirschman Index (HHI), Effective N,
    and Diversification Ratio (DR >= 1.0).
    Categorizes Market Cap per SEBI/AMFI rank rules.
    """
    import numpy as np
    w = np.array(weights)
    vols = np.array(volatilities)
    
    # 1. HHI & Effective N
    hhi = np.sum(w ** 2)
    effective_n = 1.0 / hhi
    
    # 2. Diversification Ratio (DR >= 1.0)
    port_vol = np.sqrt(w.T @ cov_matrix @ w)
    weighted_vol = np.sum(w * vols)
    diversification_ratio = weighted_vol / port_vol if port_vol > 0 else 1.0
    
    # 3. SEBI/AMFI Market Cap Classification
    large_cap_wt = 0.0
    mid_cap_wt = 0.0
    small_cap_wt = 0.0
    micro_cap_wt = 0.0
    
    for weight, isin in zip(weights, amfi_rank_map.keys()):
        rank = amfi_rank_map.get(isin, 9999)
        if rank <= 100:
            large_cap_wt += weight
        elif rank <= 250:
            mid_cap_wt += weight
        elif rank <= 500:
            small_cap_wt += weight
        else:
            micro_cap_wt += weight
            
    return {
        "hhi": float(hhi),
        "effective_n": float(effective_n),
        "diversification_ratio": float(diversification_ratio),
        "large_cap_weight": float(large_cap_wt),
        "mid_cap_weight": float(mid_cap_wt),
        "small_cap_weight": float(small_cap_wt),
        "micro_cap_weight": float(micro_cap_wt)
    }
```

2. **Rebalancing Preview Modal UI**:
Add a rebalancing preview showing current weight, target weight, drift %, shares to rebalance, and estimated STCG/LTCG tax liability generated by selling overweight positions.

#### 3.3.3 Acceptance Criteria
- [ ] Diversification ratio is verified to be $\ge 1.0$.
- [ ] Market cap exposure dynamically binds to the latest AMFI semi-annual ranking table.

---

### 3.4 Spec 4: `specs/portfolio-management/corporate-actions-handler.md`
**Component Name:** Corporate Actions Handler  
**Current Status:** Not Started | Priority: High  

#### 3.4.1 Lenses Evaluated & Core Critique
- **Lens 3 (Corporate Actions)**:
  - Line 180 shows: `EX-DATE: 2024-11-15 | RECORD DATE: 2024-11-14`. Having record date occur *before* ex-date is an impossible anachronism. Under SEBI T+1 settlement, Ex-Date and Record Date are the identical day.
  - Demergers: Spec line 43 claims `qty_parent *= ratio | avg_price_parent *= (1-ratio)`. This is completely inaccurate. Indian demergers (e.g. Jio Financial Services demerger from Reliance) do NOT reduce parent share counts! They apportion cost of acquisition under **Section 49(2C) and 49(2D)**.
  - Bonus Shares: Spec line 40 dilutes average price across all shares. Under **Section 55(2)(aa)**, bonus shares have a statutory cost of ₹0. Blended costs must only be used for book accounting, while maintaining discrete zero-cost tax lots.
  - Math Bug in line 100: Rights issue calculation divides by `(holding.quantity + rights_qty)`, but in line 41 table it divides by `new_qty`!

#### 3.4.2 Actionable Replacements & Enhanced Specification
```python
def process_indian_demerger(parent_holding, demerged_co_symbol, demerged_co_isin, 
                            allotment_ratio, cost_apportionment_ratio, ex_date):
    """
    Apportions cost of acquisition under Section 49(2C) and 49(2D).
    Parent share quantity remains UNCHANGED.
    """
    # 1. Parent shares retain their original quantity
    original_parent_cost = parent_holding.avg_price
    
    # 2. Section 49(2D): Parent post-demerger cost basis
    parent_post_cost = round(original_parent_cost * (1.0 - cost_apportionment_ratio), 4)
    parent_holding.avg_price = parent_post_cost
    
    # 3. Section 49(2C): Resulting company new holding created
    new_shares_qty = int(parent_holding.quantity * allotment_ratio)
    new_holding_cost = round(original_parent_cost * cost_apportionment_ratio / allotment_ratio, 4)
    
    new_holding = {
        "symbol": demerged_co_symbol,
        "isin": demerged_co_isin,
        "quantity": new_shares_qty,
        "avg_price": new_holding_cost,
        "acquisition_date": parent_holding.original_acquisition_date, # Sec 2(42A)(g)
        "source": f"DEMERGER_FROM_{parent_holding.symbol}"
    }
    return parent_holding, new_holding
```

#### 3.4.3 Acceptance Criteria
- [ ] Demerger processing creates the spun-off company holding while leaving parent share count intact.
- [ ] Bonus shares assigned ₹0 tax basis under Section 55(2)(aa).
- [ ] Ex-Date and Record Date set as identical calendar date under T+1 rules.

---

### 3.5 Spec 5: `specs/portfolio-management/current-holdings.md`
**Component Name:** Current Portfolio Holdings  
**Current Status:** Not Started | Priority: High  

#### 3.5.1 Lenses Evaluated & Core Critique
- **Lens 1 (Brokerage & Clearing)**: Only exposes aggregate `quantity`, failing to distinguish between:
  - Settled Demat Quantity (available for immediate sell & delivery).
  - T+1 Unsettled Quantity (bought yesterday, settling today after 4:30 PM).
  - Pledged Collateral Quantity (pledged for F&O margin).
  - MTF Funded Quantity (held under Margin Trading Facility pledge).
- **Lens 2 (Tax)**: Holdings lack tax-status indicators: STCG eligible quantity vs. LTCG eligible quantity.
- **Lens 5 (UI/UX)**: Lacks tax-lot drill-down drawers and portfolio drift visual bars.

#### 3.5.2 Actionable Replacements & Enhanced Specification
Enhanced `Holding` Interface and Grid Layout:

```typescript
export interface EnrichedHolding {
  id: string;
  symbol: string;
  isin: string;
  name: string;
  
  // Clearing & Depository Breakdown
  totalQuantity: number;
  settledDematQty: number;
  t1UnsettledQty: number;
  pledgedMarginQty: number;
  mtfFundedQty: number;
  
  // Financial Metrics
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  totalPnl: number;
  totalPnlPct: number;
  dayPnl: number;
  dayPnlPct: number;
  
  // Tax Status Breakdown
  stcgEligibleQty: number;
  ltcgEligibleQty: number;
  unrealizedStcg: number;
  unrealizedLtcg: number;
  isGrandfatheredPre2018: boolean;
  
  // Portfolio Architecture
  weightPct: number;
  targetWeightPct: number;
  driftPct: number; // weightPct - targetWeightPct
  sebiCategory: 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'MICRO_CAP';
  sectorNse: string;
  nextCorporateAction?: {
    type: 'DIVIDEND' | 'SPLIT' | 'BONUS' | 'AGM';
    exDate: string;
    details: string;
  };
}
```

UI Layout: Add expand-chevron per row to display individual tax lots with purchase dates, days remaining until LTCG qualification, and grandfathered FMV benchmarks.

#### 3.5.3 Acceptance Criteria
- [ ] Holdings table clearly segregates settled, T+1, pledged, and MTF quantities.
- [ ] Drift bar visually alerts when position drift exceeds $\pm 2.0\%$.

---

### 3.6 Spec 6: `specs/portfolio-management/event-risk-monitor.md`
**Component Name:** Event Risk Monitor  
**Current Status:** Not Started | Priority: Medium  

#### 3.6.1 Lenses Evaluated & Core Critique
- **Lens 1 & 3 (Corporate & SEBI Events)**: Omits SEBI Prohibition of Insider Trading (PIT) **trading window closure dates** (from quarter-end until 48 hours post-financial results announcement) and RBI Monetary Policy Committee (MPC) bi-monthly cycle calendars.
- **Lens 4 (Math & Impact)**: Impact scoring in line 80 simply checks `exposure > 0.1` and `base_impact in ['high', 'medium']`. It ignores volatility beta and sector concentration.

#### 3.6.2 Actionable Replacements & Enhanced Specification
1. **Dynamic Event Impact Score**:
$$\text{Event Risk Score} = \text{Portfolio Weight}_i \times \text{Beta}_i \times \text{Event Severity Weight} \times \Big(1 + \frac{\text{Historical 5-Day Event Volatility}}{\text{Index Volatility}}\Big)$$
2. **Indian Event Pipeline**:
   - Board Meetings for Quarterly Financial Results (SEBI LODR Reg 29).
   - PIT Trading Window Closure notifications.
   - RBI MPC Interest Rate Decisions & CRR/SLR announcements.
   - Union Budget & GST Council meetings.

#### 3.6.3 Acceptance Criteria
- [ ] Event monitor surfaces upcoming earnings announcements for all portfolio holdings within the next 30 days.
- [ ] High-impact alerts trigger when holding weight $> 8\%$ or portfolio exposure to interest-rate-sensitive sectors $> 30\%$ prior to RBI MPC announcements.

---

### 3.7 Spec 7: `specs/portfolio-management/fundamentals-quality.md`
**Component Name:** Portfolio Fundamentals & Quality  
**Current Status:** Not Started | Priority: High  

#### 3.7.1 Lenses Evaluated & Core Critique
- **Lens 1 (Accounting Realities)**: Banking and Financial Services (BFSI) represent 30% to 38% of major Indian portfolios. Line 57 shows `HDFC | ROCE: N/A | D/E: N/A`. 
  - If financial holdings are included with `0` or `null` in weighted ROCE or Debt-to-Equity, the portfolio aggregate is drastically distorted downwards.
  - D/E and ROCE are fundamentally invalid for banks, where deposits are operational liabilities rather than financial leverage.
- **Lens 4 (Math)**: Weighted average fails to handle companies with negative net worth or negative EBITDA (e.g. turnaround/loss-making companies).

#### 3.7.2 Actionable Replacements & Enhanced Specification
1. **Dual-Track Quality Scorecard (Ex-Financials vs. Financials)**:
```python
def compute_portfolio_fundamentals(holdings):
    """
    Separates Non-Financial constituents from BFSI constituents
    to avoid corrupting ROCE, Debt/Equity, and Interest Coverage.
    """
    non_fin_holdings = [h for h in holdings if h.sector != 'Financial Services']
    fin_holdings = [h for h in holdings if h.sector == 'Financial Services']
    
    non_fin_weight = sum(h.weight for h in non_fin_holdings)
    
    # 1. Non-Financial Aggregate Metrics (Re-weighted to 100% of Non-Fin basket)
    port_roce = sum((h.weight / non_fin_weight) * h.roce for h in non_fin_holdings if h.roce is not None)
    port_de = sum((h.weight / non_fin_weight) * h.debt_equity for h in non_fin_holdings if h.debt_equity is not None)
    port_interest_coverage = sum((h.weight / non_fin_weight) * h.interest_cov for h in non_fin_holdings if h.interest_cov is not None)
    
    # 2. Banking / NBFC Specific Quality Metrics
    fin_weight = sum(h.weight for h in fin_holdings)
    if fin_weight > 0:
        port_bank_roa = sum((h.weight / fin_weight) * h.bank_roa for h in fin_holdings if h.bank_roa is not None)
        port_bank_nim = sum((h.weight / fin_weight) * h.bank_nim for h in fin_holdings if h.bank_nim is not None)
        port_bank_nnpa = sum((h.weight / fin_weight) * h.bank_nnpa for h in fin_holdings if h.bank_nnpa is not None)
        port_bank_cet1 = sum((h.weight / fin_weight) * h.bank_cet1 for h in fin_holdings if h.bank_cet1 is not None)
    else:
        port_bank_roa, port_bank_nim, port_bank_nnpa, port_bank_cet1 = None, None, None, None
        
    return {
        "non_fin_weight": non_fin_weight,
        "portfolio_roce_ex_fin": port_roce,
        "portfolio_de_ex_fin": port_de,
        "portfolio_interest_coverage_ex_fin": port_interest_coverage,
        "banking_metrics": {
            "weight": fin_weight,
            "weighted_roa": port_bank_roa,
            "weighted_nim": port_bank_nim,
            "weighted_net_npa": port_bank_nnpa,
            "weighted_cet1_ratio": port_bank_cet1
        }
    }
```

#### 3.7.3 Acceptance Criteria
- [ ] Non-financial metrics (ROCE, D/E, Interest Coverage) are re-scaled ex-BFSI and explicitly labeled as "Ex-Financials".
- [ ] Financial institutions display ROA, NIM, Net NPA %, and CET-1 Capital Adequacy.

---

### 3.8 Spec 8: `specs/portfolio-management/liquidity-risk.md`
**Component Name:** Portfolio Liquidity Risk  
**Current Status:** Not Started | Priority: High  

#### 3.8.1 Lenses Evaluated & Core Critique
- **Lens 1 (Clearing)**: Displays "T+1 Liquidity" and "T+2 Liquidity" as primary metrics. Since January 2023, the entire Indian secondary cash market settles on T+1. T+2 is obsolete.
- **Lens 1 & 4 (SEBI Liquidity Stress Testing Guidelines)**: In March 2024, SEBI mandated liquidity stress testing for equity funds: calculating **Days to Liquidate 25% and 50% of the portfolio on a pro-rata basis**, capping daily trading participation at **10% (or 20%) of the 30-day or 90-day Average Daily Trading Volume (ADTV)**. The current spec lacks this regulatory framework.
- **Lens 4 (Math)**: Line 87 references undefined variable `eta` in `temporary_impact = eta * (qty / adv)`, causing a Python runtime crash.

#### 3.8.2 Actionable Replacements & Enhanced Specification
```python
def compute_sebi_liquidity_stress_test(holdings, adtv_30d_map, participation_rate=0.10):
    """
    Computes Days to Liquidate (DTL) 25% and 50% of portfolio on a pro-rata basis
    under SEBI Mutual Fund / PMS stress testing mandates.
    Daily liquidation is capped at 10% of 30-day ADTV.
    """
    import math
    
    total_portfolio_value = sum(h.market_value for h in holdings)
    target_25_pct = total_portfolio_value * 0.25
    target_50_pct = total_portfolio_value * 0.50
    
    days_to_liquidate = []
    
    for h in holdings:
        adtv_shares = adtv_30d_map.get(h.isin, 1000)
        daily_liquidable_shares = adtv_shares * participation_rate
        daily_liquidable_value = daily_liquidable_shares * h.current_price
        
        # Pro-rata required liquidation for 25% and 50%
        req_value_25 = h.market_value * 0.25
        req_value_50 = h.market_value * 0.50
        
        dtl_25 = req_value_25 / daily_liquidable_value if daily_liquidable_value > 0 else 999.0
        dtl_50 = req_value_50 / daily_liquidable_value if daily_liquidable_value > 0 else 999.0
        
        days_to_liquidate.append({
            "symbol": h.symbol,
            "weight": h.weight,
            "dtl_25": dtl_25,
            "dtl_50": dtl_50
        })
        
    portfolio_dtl_25 = max(item["dtl_25"] for item in days_to_liquidate)
    portfolio_dtl_50 = max(item["dtl_50"] for item in days_to_liquidate)
    
    return {
        "portfolio_days_to_liquidate_25pct": math.ceil(portfolio_dtl_25),
        "portfolio_days_to_liquidate_50pct": math.ceil(portfolio_dtl_50),
        "holding_level_dtl": days_to_liquidate
    }
```

#### 3.8.3 Acceptance Criteria
- [ ] Remove obsolete "T+2 Liquidity" references.
- [ ] Display SEBI regulatory Days to Liquidate (DTL) 25% and 50% metrics with 10% ADTV cap.
- [ ] Eliminate undefined variables (`eta`) in impact cost algorithms.

---

### 3.9 Spec 9: `specs/portfolio-management/performance-metrics.md`
**Component Name:** Portfolio Performance Metrics  
**Current Status:** Not Started | Priority: High  

#### 3.9.1 Lenses Evaluated & Core Critique
- **Lens 4 (Math & Return Calculations)**:
  - TWR calculation in line 82 simply multiplies sub-period returns without specifying cash-flow weighting. If deposits/withdrawals occur mid-month, simple linking fails. True GIPS standard requires **Daily Modified Dietz linking**.
  - Newton-Raphson XIRR solver has no divergence handling, root-bracket testing, or duration guardrails. Short-holding portfolios (< 30 days) report astronomical annualized returns.
  - Sortino formula does not specify MAR (Minimum Acceptable Return) or sample size divisor in downside deviation.
  - Risk-free rate is unspecified; must default to Indian 91-day / 364-day FBIL T-Bill yield.

#### 3.9.2 Actionable Replacements & Enhanced Specification
1. **Daily Modified Dietz Engine**:
```python
def calculate_daily_modified_dietz_twr(daily_records):
    """
    Calculates exact daily time-weighted returns linked over the period.
    daily_records: list of dicts with keys: 'bmv', 'emv', 'net_cf', 'cf_weight'
    """
    import numpy as np
    daily_returns = []
    
    for day in daily_records:
        bmv = day['bmv']
        emv = day['emv']
        cf = day['net_cf']
        w = day.get('cf_weight', 0.5) # 0.5 for mid-day cash flow
        
        denominator = bmv + (w * cf)
        if denominator <= 0:
            r_day = 0.0
        else:
            r_day = (emv - bmv - cf) / denominator
        daily_returns.append(r_day)
        
    compounded_twr = np.prod([1.0 + r for r in daily_returns]) - 1.0
    days = len(daily_records)
    
    # GIPS rule: Only annualize if period >= 365 days
    if days >= 365:
        annualized_twr = ((1.0 + compounded_twr) ** (365.0 / days)) - 1.0
    else:
        annualized_twr = compounded_twr
        
    return {
        "cumulative_twr": float(compounded_twr),
        "annualized_twr": float(annualized_twr),
        "days": days
    }
```

2. **Robust XIRR Solver with Brent Fallback**:
```python
from scipy import optimize

def robust_xirr(dates, cash_flows):
    """
    Robust XIRR calculation with Newton-Raphson and Brent root-finding fallback.
    """
    d0 = dates[0]
    days_from_start = [(d - d0).days for d in dates]
    duration_days = max(days_from_start)
    
    # Duration guardrail: For < 30 days, do not report annualized XIRR
    if duration_days < 30:
        total_in = sum(cf for cf in cash_flows if cf < 0)
        total_out = sum(cf for cf in cash_flows if cf > 0)
        hpr = (total_out + total_in) / abs(total_in) if total_in != 0 else 0.0
        return {"xirr": None, "hpr": hpr, "note": "Duration < 30 days: Annualization suppressed"}
        
    def xnpv(rate):
        return sum(cf / ((1.0 + rate) ** (day / 365.0)) for cf, day in zip(cash_flows, days_from_start))
        
    def xnpv_prime(rate):
        return sum(- (day / 365.0) * cf / ((1.0 + rate) ** (day / 365.0 + 1.0)) for cf, day in zip(cash_flows, days_from_start))
        
    # Primary: Newton-Raphson
    try:
        sol = optimize.newton(xnpv, x0=0.10, fprime=xnpv_prime, maxiter=50, tol=1e-5)
        return {"xirr": float(sol), "method": "NEWTON"}
    except (RuntimeError, OverflowError):
        # Fallback: Brent's Method bounded [-0.999, 10.0]
        try:
            sol = optimize.brentq(xnpv, a=-0.999, b=10.0, maxiter=100)
            return {"xirr": float(sol), "method": "BRENT_FALLBACK"}
        except Exception as e:
            return {"xirr": None, "error": f"Convergence failed: {str(e)}"}
```

#### 3.9.3 Acceptance Criteria
- [ ] Performance engine links daily returns using Daily Modified Dietz.
- [ ] XIRR solver falls back to Brent's method without crashing when Newton-Raphson fails.
- [ ] Durations under 30 days report HPR and suppress annualized XIRR.

---

### 3.10 Spec 10: `specs/portfolio-management/portfolio-dashboard.md`
**Component Name:** Main Portfolio Dashboard  
**Current Status:** Not Started | Priority: High  

#### 3.10.1 Lenses Evaluated & Core Critique
- **Lens 1 (Broker Reconciliation)**: Line 77 specifies "Match by Symbol + Qty + Avg Price (fuzzy)". Fuzzy matching on stock quantities or prices is catastrophic in portfolio accounting. Matching must be exact to the ISIN and to the paisa.
- **Lens 5 (UI/UX)**: Main dashboard lacks quick-action buttons for Tax-Loss Harvesting, Corporate Action pending alerts, and Triple-Way reconciliation discrepancy badges.

#### 3.10.2 Actionable Replacements & Enhanced Specification
1. **Dashboard KPI Card Structure**:
   - Total Portfolio Value (Live LTP) | Day Change (₹ and %)
   - XIRR (Inception) | 1-Year TWR vs. Nifty 50 TRI
   - Realized STCG / LTCG (Current FY with Budget 2024 split)
   - Quality Health Score (Ex-Financials ROCE / Banking ROA)
   - Reconciliation Status Badge (Green: 100% Demat Matched; Red: Mismatches Found)
2. **Reconciliation Pipeline Integration**:
   Eliminate fuzzy matching. Enforce exact matching on `ISIN` and `Quantity`. Allow avg price tolerance strictly within $\pm ₹0.05$ solely to accommodate broker per-share stamp duty / GST rounding.

#### 3.10.3 Acceptance Criteria
- [ ] Main dashboard surfaces reconciliation discrepancy badges linking to the 3-way reconciliation modal.
- [ ] Exact ISIN matching replaces fuzzy symbol matching.

---

### 3.11 Spec 11: `specs/portfolio-management/portfolio-risk.md`
**Component Name:** Portfolio Risk Aggregation  
**Current Status:** Not Started | Priority: High  

#### 3.11.1 Lenses Evaluated & Core Critique
- **Lens 4 (Math & Python Errors)**:
  - Lines 82 and 86:
    ```python
    portfolio_var = sum(w_i * var_i for w_i, var_i in zip(weights, vars))
    cov_matrix = get_correlation_matrix(symbols) * np.outer(stdevs, stdevs)
    portfolio_var = np.sqrt(weights.T @ cov_matrix @ weights)
    ```
    Line 86 completely overwrites line 82. Furthermore, line 86 calculates portfolio standard deviation ($\sigma_p$), NOT VaR! To obtain parametric VaR, $\sigma_p$ must be scaled by the normal quantile or Cornish-Fisher factor.
  - Line 97 refers to undefined variable `portfolio_var_95_1d`, causing a Python NameError.
  - Lacks Diversification Benefit metric ($\sum w_i \text{VaR}_i - \text{VaR}_{\text{portfolio}}$).

#### 3.11.2 Actionable Replacements & Enhanced Specification
```python
def compute_portfolio_risk_aggregation(weights, stdevs, corr_matrix, skewness, excess_kurtosis, confidence=0.95):
    """
    Computes parametric VaR with Cornish-Fisher fat-tail adjustment,
    individual undiversified VaR, and diversification benefit.
    """
    import numpy as np
    from scipy.stats import norm
    
    w = np.array(weights)
    sigmas = np.array(stdevs)
    
    # 1. Covariance Matrix & Portfolio Sigma
    cov_matrix = corr_matrix * np.outer(sigmas, sigmas)
    portfolio_sigma = np.sqrt(w.T @ cov_matrix @ w)
    
    # 2. Gaussian Quantile vs Cornish-Fisher Quantile
    z_alpha = norm.ppf(1.0 - confidence) # e.g. -1.6448 for 95%
    S = skewness
    K = excess_kurtosis
    
    z_cf = (z_alpha + 
            (1.0/6.0) * (z_alpha**2 - 1.0) * S + 
            (1.0/24.0) * (z_alpha**3 - 3.0 * z_alpha) * K - 
            (1.0/36.0) * (2.0 * z_alpha**3 - 5.0 * z_alpha) * (S**2))
            
    # 3. 1-Day Parametric Cornish-Fisher VaR (positive loss amount)
    var_95_1d_pct = - z_cf * portfolio_sigma
    var_95_10d_pct = var_95_1d_pct * np.sqrt(10.0)
    
    # 4. Undiversified VaR & Diversification Benefit
    undiversified_var_pct = np.sum(w * (- z_alpha * sigmas))
    diversification_benefit_pct = undiversified_var_pct - var_95_1d_pct
    
    return {
        "portfolio_sigma_daily": float(portfolio_sigma),
        "portfolio_sigma_annualized": float(portfolio_sigma * np.sqrt(252)),
        "cornish_fisher_quantile": float(z_cf),
        "var_95_1d_pct": float(var_95_1d_pct),
        "var_95_10d_pct": float(var_95_10d_pct),
        "diversification_benefit_pct": float(diversification_benefit_pct)
    }
```

#### 3.11.3 Acceptance Criteria
- [ ] Fix syntax errors and variable name bugs (`portfolio_var_95_1d`).
- [ ] Expose Cornish-Fisher VaR and Diversification Benefit metrics.

---

### 3.12 Spec 12: `specs/portfolio-management/risk-metrics.md`
**Component Name:** Comprehensive Risk Analytics Engine  
**Current Status:** Not Started | Priority: High  

#### 3.12.1 Lenses Evaluated & Core Critique
- **Lens 4 (Math & Scaling Fallacy)**:
  - Line 81: `scaled_returns = returns * sqrt(horizon)` followed by percentile calculation. Multiplying raw daily returns by $\sqrt{h}$ before taking the percentile violates the mathematical properties of order statistics for non-Gaussian empirical distributions! Multi-day historical VaR must be computed on rolling $h$-day cumulative returns ($\prod_{i=0}^{h-1}(1+r_{t-i})-1$).
  - Stress testing in line 106 does `shocked = portfolio_returns * (1 + shock)`. Multiplying daily returns by $(1 - 0.3)$ shrinks daily volatility; it does not simulate a market crash!

#### 3.12.2 Actionable Replacements & Enhanced Specification
```python
def compute_rolling_historical_var(daily_returns, horizon=10, confidence=0.95):
    """
    Computes genuine multi-day historical VaR using rolling compound returns.
    """
    import numpy as np
    import pandas as pd
    
    s = pd.Series(daily_returns)
    # Rolling compounded horizon returns
    rolling_h_returns = (1.0 + s).rolling(window=horizon).apply(np.prod, raw=True) - 1.0
    rolling_h_returns = rolling_h_returns.dropna().values
    
    var_quantile = np.percentile(rolling_h_returns, (1.0 - confidence) * 100)
    cvar_tail = rolling_h_returns[rolling_h_returns <= var_quantile]
    cvar = cvar_tail.mean() if len(cvar_tail) > 0 else var_quantile
    
    return {
        "var_horizon": float(-var_quantile),
        "cvar_horizon": float(-cvar),
        "sample_size": len(rolling_h_returns)
    }

def simulate_macro_factor_stress(portfolio_holdings, factor_exposures, macro_shocks):
    """
    Simulates portfolio drawdown under historical macro scenarios
    (e.g., 2008 GFC: Nifty -52%, USDINR +20%, Crude Oil +50%).
    """
    # Shock = sum_i (w_i * (beta_market_i * shock_market + beta_oil_i * shock_oil + ...))
    total_drawdown = 0.0
    for h in portfolio_holdings:
        holding_shock = (
            h.beta_market * macro_shocks.get('MARKET', 0.0) +
            h.beta_fx * macro_shocks.get('USDINR', 0.0) +
            h.beta_commodity * macro_shocks.get('CRUDE_OIL', 0.0)
        )
        total_drawdown += h.weight * holding_shock
        
    return {
        "simulated_portfolio_drawdown": total_drawdown,
        "simulated_value_loss": total_drawdown * sum(h.market_value for h in portfolio_holdings)
    }
```

#### 3.12.3 Acceptance Criteria
- [ ] Eliminate flawed return multiplication by $\sqrt{h}$ in historical simulation.
- [ ] Replace `portfolio_returns * (1 + shock)` with factor-based macro stress tests.

---

### 3.13 Spec 13: `specs/portfolio-management/statement-reconciliation.md`
**Component Name:** Automated Statement Reconciliation Engine  
**Current Status:** Not Started | Priority: High  

#### 3.13.1 Lenses Evaluated & Core Critique
- **Lens 1 (Triple-Way Matching)**: Spec only reconciles Broker vs. Internal calculations. It completely misses depository reconciliation against **NSDL/CDSL Consolidated Account Statements (CAS)** and bank statements.
- **Lens 2 (Tax Law Non-Compliance)**: Line 203 includes options: `fifoMethod: 'fifo' | 'lifo' | 'hifo'`. Under the Indian Income Tax Act (Section 45 read with depository regulations), **FIFO is mandatory for dematerialized shares**. Offering LIFO or HIFO is legally invalid in India.
- **Lens 1 (Clearing Lag)**: Lacks reconciliation states for T+1 rolling settlement and CUSA account transfers.

#### 3.13.2 Actionable Replacements & Enhanced Specification
1. **Triple-Way Demat Reconciliation Schema**:
```typescript
export interface TripleWayReconciliationResult {
  reconciliationDate: string;
  pan: string;
  dpId: string;
  clientId: string;
  
  holdingsAudit: {
    isin: string;
    symbol: string;
    internalAccountingQty: number;
    brokerStatementQty: number;
    depositoryCasQty: number; // NSDL / CDSL CAS
    unsettledT1Qty: number;
    cusaPoolQty: number;
    discrepancyType: 'CLEAN' | 'T1_CLEARING_LAG' | 'CUSA_HOLD' | 'UNRESOLVED_DISCREPANCY';
    paisaDifference: number;
  }[];
  
  cashAndCorporateActionsAudit: {
    expectedDividendInflow: number;
    bankStatementCredit: number;
    tdsDeducted26AS: number; // Form 26AS / AIS matching
    reconciled: boolean;
  }[];
}
```

2. **Resolution Drawer UI**:
When an ISIN mismatch occurs between broker statements and CDSL/NSDL CAS, display a side-by-side drawer highlighting:
- Unsettled buy trades within the last 24 hours (clearing on T+1).
- Shares pledged under broker margin collateral.
- Direct option: `Acknowledge T+1 Clearing Lag` or `File Depository Discrepancy Ticket`.

#### 3.13.3 Acceptance Criteria
- [ ] Strict removal of LIFO/HIFO options; enforce statutory FIFO.
- [ ] Reconcile broker holdings against uploaded NSDL/CDSL CAS statement.

---

### 3.14 Spec 14: `specs/portfolio-management/trade-history.md`
**Component Name:** Trade History & Realized P&L  
**Current Status:** Not Started | Priority: High  

#### 3.14.1 Lenses Evaluated & Core Critique
- **Lens 2 (Catastrophic Tax Calculation Bug)**:
  - Lines 111-112 state: `trade.tax_amount = max(0, (trade.net_pnl - 100000) * 0.10)`.
  - **FATAL ERROR**: This applies the ₹1,00,000 LTCG exemption *to every single individual trade*! If an investor makes 5 profitable long-term sales of ₹80,000 each (total gain ₹4 Lakh), the spec calculates ₹0 tax instead of taxing the net gain above the annual exemption!
- **Lens 2 (Budget 2024 Transition)**: Omission of the July 23, 2024 rate changes (STCG 20%, LTCG 12.5%, exemption ₹1.25L).
- **Lens 1 (Statutory Levies)**: Line 102 subtracts STT from gross P&L for tax purposes, violating Section 48. Line 99 charges stamp duty on sell transactions, which has been non-existent under the Indian Stamp Act since July 2020. Line 97 omits 18% GST.

#### 3.14.2 Actionable Replacements & Enhanced Specification
```python
def compute_annual_tax_report(realized_trades, financial_year="2024-2025"):
    """
    Computes realized capital gains adhering to Section 111A, 112A,
    Section 48 cost rules, and the July 23, 2024 Budget transition.
    """
    from datetime import date
    cutoff = date(2024, 7, 23)
    
    stcg_pre = 0.0
    stcg_post = 0.0
    ltcg_pre = 0.0
    ltcg_post = 0.0
    
    for t in realized_trades:
        # Section 48: STT is NOT deductible!
        # Deductible: Brokerage + Exchange Turnover + Stamp Duty (buy only) + SEBI Fee + GST
        gross_pnl = (t.sell_price - t.buy_price) * t.qty
        deductible_expenses = t.brokerage + t.exchange_charges + t.stamp_duty + t.sebi_fees + t.gst
        taxable_pnl = gross_pnl - deductible_expenses
        
        is_ltcg = t.holding_days > 365
        is_post_budget = t.sell_date >= cutoff
        
        if is_ltcg:
            if is_post_budget:
                ltcg_post += taxable_pnl
            else:
                ltcg_pre += taxable_pnl
        else:
            if is_post_budget:
                stcg_post += taxable_pnl
            else:
                stcg_pre += taxable_pnl
                
    # Section 112A Annual Exemption: ₹1,25,000 for FY 2024-25
    annual_exemption = 125000.0
    total_ltcg = max(0.0, ltcg_pre) + max(0.0, ltcg_post)
    
    # Exemption applied first to 10% bracket (pre-budget) then 12.5% bracket
    exempt_used_pre = min(max(0.0, ltcg_pre), annual_exemption)
    taxable_ltcg_pre = max(0.0, ltcg_pre) - exempt_used_pre
    
    rem_exemption = annual_exemption - exempt_used_pre
    exempt_used_post = min(max(0.0, ltcg_post), rem_exemption)
    taxable_ltcg_post = max(0.0, ltcg_post) - exempt_used_post
    
    tax_liability = {
        "stcg_pre_budget_tax": max(0.0, stcg_pre) * 0.15,
        "stcg_post_budget_tax": max(0.0, stcg_post) * 0.20,
        "ltcg_pre_budget_tax": taxable_ltcg_pre * 0.10,
        "ltcg_post_budget_tax": taxable_ltcg_post * 0.125,
        "total_tax_before_cess": (
            max(0.0, stcg_pre) * 0.15 +
            max(0.0, stcg_post) * 0.20 +
            taxable_ltcg_pre * 0.10 +
            taxable_ltcg_post * 0.125
        ),
        "health_and_education_cess_4pct": 0.0 # Computed at 4%
    }
    tax_liability["health_and_education_cess_4pct"] = tax_liability["total_tax_before_cess"] * 0.04
    tax_liability["net_tax_payable"] = tax_liability["total_tax_before_cess"] * 1.04
    
    return tax_liability
```

#### 3.14.3 Acceptance Criteria
- [ ] Eliminate per-trade LTCG exemption deduction; apply ₹1.25L exemption annually.
- [ ] Exclude STT from capital gains expense deductions.
- [ ] Add 4% Health & Education Cess on total capital gains tax liability.

---

### 3.15 Spec 15: `specs/portfolio-management/valuation-metrics.md`
**Component Name:** Portfolio Valuation Metrics  
**Current Status:** Not Started | Priority: High  

#### 3.15.1 Lenses Evaluated & Core Critique
- **Lens 4 (Mathematical Flaw - Arithmetic Mean of Multiples)**:
  - Lines 67 and 75: `weighted_pe = sum(w_i * pe_i)` and `weighted_pb = sum(w_i * pb_i)`.
  - Calculating portfolio $P/E$ or $P/B$ via arithmetic weighted average produces massive upward bias due to the right-skewed nature of price-to-earnings ratios. A single company trading at $200\times P/E$ with a 5% portfolio weight adds $10.0$ directly to the portfolio P/E!
  - Industry benchmark standards (Morningstar, MSCI, FactSet) mandate the **Weighted Harmonic Mean**.
  - Negative earnings ($P/E < 0$ or undefined) break arithmetic formulas completely.

#### 3.15.2 Actionable Replacements & Enhanced Specification
```python
def compute_portfolio_valuation_multiples(holdings):
    """
    Computes portfolio valuation metrics using the Weighted Harmonic Mean
    and Aggregate Yield methods to handle high multiples and loss-makers.
    """
    import numpy as np
    
    # 1. Aggregate Sum Method (Ideal for overall portfolio)
    total_market_cap_held = sum(h.shares_held * h.current_price for h in holdings)
    total_earnings_held = sum(h.shares_held * h.eps_ttm for h in holdings)
    total_book_value_held = sum(h.shares_held * h.bvps for h in holdings)
    total_dividends_held = sum(h.shares_held * h.dps_ttm for h in holdings)
    
    aggregate_pe = (total_market_cap_held / total_earnings_held) if total_earnings_held > 0 else None
    aggregate_pb = (total_market_cap_held / total_book_value_held) if total_book_value_held > 0 else None
    portfolio_div_yield = (total_dividends_held / total_market_cap_held) * 100.0 if total_market_cap_held > 0 else 0.0
    
    # 2. Weighted Harmonic Mean of Positive Constituents
    positive_pe_holdings = [h for h in holdings if h.pe_ttm is not None and h.pe_ttm > 0]
    pos_weight_sum = sum(h.weight for h in positive_pe_holdings)
    
    if pos_weight_sum > 0:
        harmonic_pe = pos_weight_sum / sum(h.weight / h.pe_ttm for h in positive_pe_holdings)
    else:
        harmonic_pe = None
        
    return {
        "aggregate_pe": round(aggregate_pe, 2) if aggregate_pe else "N/A (Loss-Making)",
        "weighted_harmonic_pe": round(harmonic_pe, 2) if harmonic_pe else "N/A",
        "harmonic_pe_coverage_pct": round(pos_weight_sum * 100, 1),
        "aggregate_pb": round(aggregate_pb, 2) if aggregate_pb else "N/A",
        "portfolio_dividend_yield_pct": round(portfolio_div_yield, 2)
    }
```

#### 3.15.3 Acceptance Criteria
- [ ] Replace arithmetic P/E and P/B with Weighted Harmonic Mean and Aggregate Market Cap / Earnings.
- [ ] Display coverage percentage when loss-making constituents are excluded from harmonic P/E.

---

### 3.16 Spec 16: `specs/portfolio-management/valuation-risk.md`
**Component Name:** Portfolio Valuation Risk  
**Current Status:** Not Started | Priority: Medium  

#### 3.16.1 Lenses Evaluated & Core Critique
- **Lens 4 (Valuation Aggregation)**: Line 49 displays `DCF Base Case: ₹1,250 | Current Price: ₹950` at the portfolio level without defining how individual company DCF fair values are normalized across different share counts and currency denominations.
- **Lens 5 (UI/UX)**: Lacks a unified Margin of Safety (MOS) waterfall showing the distribution of conviction across individual portfolio holdings.

#### 3.16.2 Actionable Replacements & Enhanced Specification
```python
def compute_portfolio_margin_of_safety(holdings_with_dcf):
    """
    Aggregates Margin of Safety across holdings weighted by portfolio value.
    MOS_i = (Intrinsic Value_i - Current Price_i) / Intrinsic Value_i
    """
    weighted_base_mos = 0.0
    weighted_bear_mos = 0.0
    holdings_risk_breakdown = []
    
    for h in holdings_with_dcf:
        base_mos = (h.dcf_fair_value_base - h.current_price) / h.dcf_fair_value_base
        bear_mos = (h.dcf_fair_value_bear - h.current_price) / h.dcf_fair_value_bear
        
        weighted_base_mos += h.weight * base_mos
        weighted_bear_mos += h.weight * bear_mos
        
        holdings_risk_breakdown.append({
            "symbol": h.symbol,
            "weight": h.weight,
            "base_mos_pct": round(base_mos * 100, 1),
            "bear_mos_pct": round(bear_mos * 100, 1),
            "status": "OVERVALUED" if base_mos < 0 else "UNDERVALUED"
        })
        
    return {
        "portfolio_weighted_mos_base": round(weighted_base_mos * 100, 2),
        "portfolio_weighted_mos_bear": round(weighted_bear_mos * 100, 2),
        "holdings_breakdown": holdings_risk_breakdown
    }
```

#### 3.16.3 Acceptance Criteria
- [ ] Normalize DCF fair value into percentage Margin of Safety (MOS) prior to portfolio weighting.
- [ ] Provide portfolio-level base-case and bear-case MOS indicators.

---

## 4. Master Implementation Roadmap for Hermes

To implement these recommendations systematically without introducing system instability, Hermes should execute the engineering plan across 4 distinct sprints:

```
 Sprint 1: Tax Engine & Depository Plumbing (Weeks 1 - 2)
 ├── Implement July 23, 2024 Capital Gains Split (Sec 111A, 112A, 55(2)(ac))
 ├── Build NSDL/CDSL e-CAS PDF parser & trade idempotency hash key
 └── Implement Section 49(2C) Demerger Cost Apportionment & Bonus ₹0 basis

 Sprint 2: Core Data Pipeline & Reconciliation (Weeks 3 - 4)
 ├── Deploy Triple-Way Reconciliation (Broker vs. CAS vs. Bank)
 ├── Remove LIFO/HIFO options; enforce statutory FIFO
 └── Integrate 16 Institutional Data Quality & CUSA clearing checks

 Sprint 3: Mathematical Engine Upgrades (Weeks 5 - 6)
 ├── Daily Modified Dietz TWR & Brent-fallback XIRR solver
 ├── Weighted Harmonic Mean for portfolio P/E, P/B, and EV/EBITDA
 ├── Cornish-Fisher fat-tail VaR & factor stress simulation
 └── SEBI Pro-Rata 10%/20% ADTV Days-to-Liquidate Liquidity model

 Sprint 4: Institutional UI/UX Deployment (Weeks 7 - 8)
 ├── High-density holdings grid with Demat Settled vs. T+1 vs. Pledged flags
 ├── Tax-Loss Harvesting recommendation drawer with net savings calculator
 └── Rebalancing preview modal with real-time statutory charges & tax preview
```

---

## 5. Golden Test Vectors for Engine Verification

To guarantee forensic compliance during QA, the following golden test cases must be verified against the implementation:

### Test Vector 1: FY 2024-25 Split Capital Gains
- **Transaction 1**: Bought 100 TCS on 10-May-2023 @ ₹3,200. Sold on 15-Jun-2024 @ ₹3,800.
  - *Expected*: Holding period 401 days (LTCG). Execution date < 23-Jul-2024 $\rightarrow$ Tax rate **10%** under Section 112A.
- **Transaction 2**: Bought 100 Infy on 10-May-2023 @ ₹1,300. Sold on 10-Aug-2024 @ ₹1,800.
  - *Expected*: Holding period 457 days (LTCG). Execution date $\ge$ 23-Jul-2024 $\rightarrow$ Tax rate **12.5%** under Section 112A.
- **Combined Exemption Test**:
  - Total LTCG Gain = ₹60,000 + ₹50,000 = ₹1,10,000.
  - *Expected*: Total Gain (₹1.10L) is less than the revised ₹1,25,000 annual exemption limit $\rightarrow$ **Total Tax = ₹0.00**.

### Test Vector 2: Section 55(2)(ac) Grandfathering
- **Transaction**: Bought 100 Reliance on 15-Mar-2016 @ ₹500. FMV as of 31-Jan-2018 is ₹960. Sold on 20-Oct-2024 @ ₹1,400.
  - *Expected*: $\text{Effective COA} = \max(500, \min(960, 1400)) = ₹960$.
  - Taxable Capital Gain = $(1400 - 960) \times 100 = ₹44,000$. (Tax rate 12.5% under Section 112A).

### Test Vector 3: Harmonic Mean Portfolio P/E
- **Portfolio**: 
  - Stock A: Weight 50%, $P/E = 15.0$
  - Stock B: Weight 50%, $P/E = 300.0$
- *Arithmetic Mean (Flawed)*: $0.5 \times 15 + 0.5 \times 300 = 157.5\times$
- *Weighted Harmonic Mean (Correct)*:
  $$\frac{1.0}{\frac{0.5}{15} + \frac{0.5}{300}} = \frac{1.0}{0.03333 + 0.001667} = \frac{1.0}{0.0350} = \mathbf{28.57\times}$$
  *(Notice the dramatic 82% distortion avoided by using Harmonic Mean!)*

---
*End of Portfolio Management Recommendations Document.*
