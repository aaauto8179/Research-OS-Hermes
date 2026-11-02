# Computational Engines Audit & Actionable Recommendations

**Category:** Core Computational Engines (`specs/engines/`) | **Spec Count:** 18  
**Auditor:** Worker: Computational Engines Auditor (`teamwork_worker`)  
**Scope:** In-depth audit of all 18 calculation engines across 6 lenses:
1. Mathematical Rigor & Forensic Proofs | 2. Numerical Stability & Edge Cases  
3. Indian Accounting Standards (Ind AS) & Regulatory (SEBI/RBI/Tax)  
4. Fundamental Investor Logic | 5. UI/UX Interaction Design | 6. Data Plumbing & Performance

---

## Executive Summary & Systemic Findings

A forensic audit of all 18 engine specs in `specs/engines/` revealed critical discrepancies requiring immediate remediation before production deployment:
1. **Catastrophic Formula Errors**:
   - **Beneish M-Score (`beneish-engine.md`)**: Defines Leverage Index ($LVGI$) as $(Debt+Equity)_t / (Debt+Equity)_{t-1}$. Because Total Assets $\approx$ Debt + Equity, this tracks asset growth rather than financial leverage.
   - **Banking Valuation (`banking-engine.md`)**: P/B-ROE regression lacks decimal normalization, causing a 64x price explosion when ROE is input as a percentage (16.2% yielding P/B of 138.5x). Raw Book Value is used without mandatory RBI Net NPA deductions.
   - **DCF Valuation (`dcf-engine.md`)**: Lacks mid-year discounting (causing 5-7% systematic undervaluation), suffers denominator explosion when $WACC \le g$, and uses a dimensionally invalid formula to reverse-engineer EBITDA from FCFF.
   - **Revenue Projection (`revenue-projection-engine.md`)**: Adds full D&A to taxed EBITDA ($EBITDA \times (1-t) + DA$), double-counting the tax shield and overstating free cash flows by $DA \times (1-t)$.
   - **Hedging Engine (`hedging-engine.md`)**: Inverts collar payoff signs (subtracts call premium received) and subtracts dividend yield percentages directly from rupee spot prices.
2. **Regulatory & Tax Violations**:
   - **Corporate Actions (`corporate-actions-engine.md`)**: Uses integer truncation `int(qty * ratio)` on fractional entitlements, violating SEBI regulations requiring pooled market auction and pro-rata cash distribution. Completely omits Section 49(2C) demerger cost allocation rules and Section 55(2)(aa) bonus share NIL cost tax lotting.
3. **Severe Edge Case Vulnerabilities**:
   - Division by zero across multiple engines when EBIT, EBITDA, Interest Expense, Total Liabilities, or Cash Flows equal zero.
   - Inverted metrics for loss-making firms or negative net worth companies (e.g. negative PAT / negative Equity yielding positive ROE).

```
┌────────────────────────────────────────────────────────────────────────┐
│                   COMPUTATIONAL ENGINES AUDIT MATRIX                   │
├──────────────────────────┬───────────────────┬─────────────────────────┤
│ Engine Spec              │ Criticality       │ Primary Remediation     │
├──────────────────────────┼───────────────────┼─────────────────────────┤
│ altman-engine.md         │ High              │ EM Z'' calibration & X4 │
│ banking-engine.md        │ Critical          │ ROE scale & Net NPA ABV │
│ beneish-engine.md        │ Critical          │ Correct LVGI & TATA     │
│ common-size-engine.md    │ Medium            │ Zero base & Ind AS map  │
│ concall-consistency.md   │ Medium            │ Weighted score & ranges │
│ corporate-actions.md     │ Critical          │ SEBI cash fractional    │
│ dcf-engine.md            │ Critical          │ Mid-year & WACC<=g cap  │
│ excess-return-engine.md  │ High              │ FV scale & Ohlson fade  │
│ hedging-engine.md        │ High              │ Collar payoff & NSE lot │
│ piotroski-engine.md      │ High              │ Clean LEVER & bonus adj │
│ portfolio-engine.md      │ High              │ XIRR solver & sub-1y    │
│ ratio-analysis-engine.md │ Critical          │ Neg Equity & Bank split │
│ relative-engine.md       │ Critical          │ EV bridge & loss peers  │
│ revenue-projection.md    │ High              │ FCF tax shield & elims  │
│ risk-score-engine.md     │ Medium            │ Transfer func & SEBI    │
│ screening-engine.md      │ High              │ FCF yield & rank invert │
│ sotp-engine.md           │ Critical          │ EV vs Eq & Stake %      │
│ turnaround-engine.md     │ High              │ ROE scale & IBC dilute  │
└──────────────────────────┴───────────────────┴─────────────────────────┘
```

---

## Spec-by-Spec Detailed Recommendations

### 1. `specs/engines/altman-engine.md` — Altman Z-Score Engine
- **Critique**: Section 3.1 & 3.2 defines $X_4 = \text{Market Cap} / \text{Total Liabilities}$ across all models. In Altman Z' (1983 private firms) and Altman Z'' (1995/2005 emerging markets), $X_4$ is **Book Value of Equity / Total Liabilities**. In Emerging Market model ($Z''$), Altman includes an intercept $+3.25$ to calibrate the median score around 0. The spec omits this intercept while retaining non-intercept thresholds ($2.60 / 1.10$).
- **Ind AS Mapping**: Under Ind AS, Working Capital ($X_1$) must include current lease liabilities (Ind AS 116) within Current Liabilities. EBIT ($X_3$) must map to Operating Profit from Continuing Operations (PBIT excluding Other Income). Retained Earnings ($X_2$) must map to Other Equity excluding non-distributable reserves.
- **Edge Cases**: Zero Total Liabilities (debt-free firm with zero creditors) causes $X_4 \to \infty$. Clamp effective liabilities to $\max(\text{Total Liabilities}, 0.01 \times \text{Total Assets})$. Negative Working Capital (common in efficient FMCG giants like HUL) must be noted in UI. Total Assets $\le 0$ must raise a validation error.
- **Exact Python Formula**:
```python
def calculate_altman_z(model: str, wc: float, re: float, ebit: float, mc: Optional[float], bv_eq: float, tl: float, ta: float, rev: float):
    if ta <= 0: raise ValueError("Total Assets must be strictly positive.")
    eff_tl = max(tl, 0.01 * ta)  # Zero-liabilities guard
    x1, x2, x3, x5 = wc / ta, re / ta, ebit / ta, rev / ta
    if model == "original":
        if mc is None: raise ValueError("Market Cap required for Original model.")
        x4 = mc / eff_tl
        z = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.999 * x5
        zones = {"safe": 2.99, "grey": 1.81}
    elif model == "revised":
        x4 = bv_eq / eff_tl
        z = 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5
        zones = {"safe": 2.90, "grey": 1.23}
    elif model == "emerging":
        x4 = bv_eq / eff_tl
        z = 6.56 * x1 + 3.26 * x2 + 6.72 * x3 + 1.05 * x4  # Altman-Hartzell-Peck standard
        zones = {"safe": 2.60, "grey": 1.10}
    zone = "SAFE" if z > zones["safe"] else ("GREY" if z >= zones["grey"] else "DISTRESS")
    return {"z_score": round(z, 2), "zone": zone, "variables": {"x1": x1, "x2": x2, "x3": x3, "x4": x4, "x5": x5}}
```

---

### 2. `specs/engines/banking-engine.md` — Banking P/B-ROE Valuation Engine
- **Critique**: The regression `predicted_pb = 0.8 + 8.5 * target_roe` requires `target_roe` in decimal ($0.162$). The golden vector table writes `16.2%`. Passing $16.2$ yields predicted P/B of $138.5\times$ and price of ₹80,330 instead of ₹1,245.
- **RBI Prudential Norms**: Raw Book Value per Share is NEVER used in Indian banking equity research. Valuation must use **Adjusted Book Value per Share (ABVPS)**:
  $$\text{Adjusted Net Worth} = \text{Net Worth} - \text{Net NPAs} - \text{Net Security Receipts} - (1 - t) \times \text{DTA Haircut}$$
  $$\text{ABVPS} = \text{Adjusted Net Worth} / \text{Diluted Shares}$$
- **Residual Income Terminal Value**: Formula uses $B_{T-1}$ instead of $B_T$ for the terminal year residual base. Guard against $r \le g$ denominator explosion.
- **Exact Implementation**:
```python
def calculate_banking_valuation(target_roe: float, reported_bvps: float, net_npa_per_share: float, r: float, g: float, payout: float, alpha=0.8, beta=8.5):
    roe_norm = target_roe / 100.0 if target_roe > 1.0 else target_roe
    r_norm, g_norm = (r / 100.0 if r > 1.0 else r), (g / 100.0 if g > 1.0 else g)
    abvps = max(0.0, reported_bvps - net_npa_per_share)
    predicted_p_abv = alpha + beta * roe_norm
    implied_price_reg = predicted_p_abv * abvps
    if (r_norm - g_norm) <= 0.005: raise ValueError("Cost of Equity must exceed terminal growth by >= 50 bps.")
    b_t = abvps
    pv_ri_sum = sum(((roe_norm - r_norm) * (b_t * (1.0 + roe_norm * (1.0 - payout))**(t-1))) / ((1.0 + r_norm)**t) for t in range(1, 6))
    terminal_ri = ((roe_norm - r_norm) * (b_t * (1.0 + roe_norm * (1.0 - payout))**5)) / (r_norm - g_norm)
    implied_price_ri = abvps + pv_ri_sum + (terminal_ri / ((1.0 + r_norm)**5))
    return {"adjusted_bvps": round(abvps, 2), "predicted_p_abv": round(predicted_p_abv, 2), "implied_price_reg": round(implied_price_reg, 2), "implied_price_ri": round(implied_price_ri, 2)}
```

---

### 3. `specs/engines/beneish-engine.md` — Beneish M-Score Engine
- **Critique (Critical Defect)**: Line 25 defines $\text{LVGI} = (\text{Debt}+\text{Equity})_t / (\text{Debt}+\text{Equity})_{t-1}$. Total Assets $\approx$ Debt + Equity, so this measures asset expansion. Beneish (1999) defines:
  $$\text{Leverage}_t = (\text{Current Liabilities}_t + \text{Long-Term Debt}_t) / \text{Total Assets}_t \implies \text{LVGI} = \text{Leverage}_t / \text{Leverage}_{t-1}$$
- **TATA Line Mapping**: $\text{TATA} = (\text{Profit from Continuing Operations} - \text{CFO}) / \text{Total Assets}_t$. Ind AS exceptional items and OCI must be excluded.
- **Negative Margin Safeguard**: In $GMI = GPM_{t-1} / GPM_t$, if current Gross Margin $GPM_t \le 0$, $GMI$ becomes negative. Because $GMI$ has a positive coefficient ($+0.528$), negative $GMI$ falsely lowers the M-Score, categorizing distressed manipulators as clean. Clamp $GMI \in [0.1, 5.0]$.
- **Exact Formula**:
$$M = -4.84 + 0.920 \cdot DSRI + 0.528 \cdot GMI + 0.404 \cdot AQI + 0.892 \cdot SGI + 0.115 \cdot DEPI - 0.172 \cdot SGAI + 4.679 \cdot TATA - 0.327 \cdot LVGI$$
$$\text{Manipulation Probability } P = 1 / (1 + e^{-M}) \quad (\text{Threshold: } M > -1.78)$$

---

### 4. `specs/engines/common-size-engine.md` — Common Size Statement Engine
- **Critique**: Pre-revenue firms or Ind AS 115 real estate developers with zero revenue produce zero-division errors for P&L items. In such cases, fallback base must be Total Operating Expenses.
- **Negative Equity Handling**: For insolvent firms with negative net worth, Equity% is negative (e.g. $-35\%$). Balance sheet reconciliation must enforce $\sum \text{Liabilities}\% + \text{Equity}\% = 100.0\%$.
- **Cash Flow Base**: The spec uses Revenue as the Cash Flow base. Cash Flow must support dual toggles: (1) % of Revenue, and (2) % of Total Inflows ($\text{CFO}_{\text{in}} + \text{CFI}_{\text{in}} + \text{CFF}_{\text{in}}$).
- **Ind AS 116 Mapping**: Finance costs must separately itemize interest on borrowings vs interest accretion on lease liabilities.

---

### 5. `specs/engines/concall-consistency-engine.md` — Concall Consistency Engine
- **Critique**: Division by zero occurs when $Total = 0$. Unweighted counts treat small qualitative items identically to massive capex guidance misses.
- **Range & Milestone Parsing**: Guidance is typically delivered as ranges $[L_i, U_i]$ (e.g., "Margin 22–24%"). Actual $A_i > U_i \implies \text{Beat}$; $L_i \le A_i \le U_i \implies \text{Met}$; $A_i < L_i \implies \text{Miss}$.
- **Time-Decay Weighted Score**:
  $$S = \frac{\sum_{t=1}^N w_{\text{type}} \cdot \lambda^{(N - t)} \cdot \text{Score}_t}{\sum_{t=1}^N w_{\text{type}} \cdot \lambda^{(N - t)}} \quad (\lambda = 0.85)$$
  Weights: Revenue/Volume ($30\%$), Margins/EBITDA ($35\%$), Capex ($20\%$), Qualitative Milestones ($15\%$).

---

### 6. `specs/engines/corporate-actions-engine.md` — Corporate Actions Engine
- **SEBI Violation (Critical Defect)**: Line 31 executes `h.qty = int(h.qty * action.ratio)`. Under SEBI guidelines and Section 63 of Companies Act 2013, fractional entitlements are pooled, auctioned on exchange by a Trustee, and net cash proceeds are credited to the investor's bank/broker account. Integer truncation destroys investor capital.
- **Section 49(2C) Demerger Cost Apportionment (Missing)**:
  $$\alpha = \frac{\text{Net Book Value of Assets Transferred}}{\text{Pre-demerger Net Worth}} \implies \text{Parent Cost}' = \text{Cost} \times (1 - \alpha), \quad \text{Spinoff Cost} = \frac{\text{Cost} \times \alpha}{\text{Swap Ratio}}$$
- **Section 55(2)(aa) Bonus Shares**: Statutorily deemed acquisition cost is **NIL (₹0.00)**. Blending bonus shares into a single average purchase price violates Indian capital gains tax FIFO filing rules.
- **Exact Implementation**:
```python
def adjust_for_corporate_action(qty: int, avg_cost: float, action_type: str, ratio: float, mkt_price: float):
    if action_type in ("split", "bonus"):
        factor = ratio if action_type == "split" else (1.0 + ratio)
        new_total = qty * factor
        whole_shares = int(math.floor(new_total))
        fractional_shares = new_total - whole_shares
        fractional_cash = round(fractional_shares * mkt_price, 2)
        new_avg_cost = avg_cost / factor
        return {"whole_shares": whole_shares, "avg_cost": round(new_avg_cost, 2), "fractional_cash_credit": fractional_cash}
```

---

### 7. `specs/engines/dcf-engine.md` — DCF Valuation Engine
- **Mid-Year Discounting Convention**: Year-end discounting $(1+WACC)^t$ assumes cash flows arrive on the final day of the year, causing 5-7% systematic undervaluation under Indian 10-14% WACC environments. Mid-year discounting:
  $$\text{PV}(FCFF_t) = \frac{FCFF_t}{(1 + WACC)^{t - 0.5}}$$
- **Terminal Growth Explosion ($WACC \le g$)**: When $WACC \le g$, Gordon growth explodes to $\pm \infty$. Enforce:
  $$WACC - g \ge 0.005 \quad (50\text{ bps spread}) \quad \text{and} \quad g \le \min(g_{\text{input}}, \text{India 10Y G-Sec Yield} - 2.0\%)$$
- **EBITDA Reverse-Engineering Error**: Line 129 `EBITDA_n = FCFF_n / (1 - Tax_Rate) * EBITDA_Margin` is mathematically invalid. Terminal EBITDA must be projected cleanly from terminal revenue and margin: $\text{EBITDA}_n = \text{Revenue}_n \times \text{EBITDA\_Margin}_n$.
- **Ind AS 116 Net Debt Bridge**: EV to Equity Value bridge must deduct Lease Liabilities alongside Borrowings:
  $$\text{Equity Value} = \text{EV} - (\text{Borrowings} + \text{Lease Liabilities}) + \text{Cash \& Current Investments} - \text{Minority Interest}$$

---

### 8. `specs/engines/excess-return-engine.md` — Excess Return (Residual Income) Engine
- **Scale Discrepancy**: Golden vector Base case (lines 50-64) specifies $B_0 = 380$, $\sum PV(RI) = 143.4$, and $PV(TV) = 112.4$. The sum is $635.8$ ₹/share, but line 54 writes `fair_value_per_share: 1271.6` ($635.8 \times 2$). The engine must resolve whether inputs are per share or aggregate, eliminating the undocumented $2\times$ bug.
- **Ind AS Clean Surplus Violation**: Direct items in Other Comprehensive Income (OCI) under Ind AS 19 (actuarial pension/gratuity gains/losses) and Ind AS 109 (FVOCI investments) violate Clean Surplus ($B_t = B_{t-1} + PAT_t - Div_t$). The engine must track Comprehensive Income ROE: $B_t = B_{t-1} + \text{Comprehensive Income}_t - \text{Dividends}_t$.
- **Ohlson Persistence Parameter**: Gordon growth on terminal residual income is prone to explosive values. Implement Ohlson persistence parameter $\omega \in [0, 1)$: $\text{PV(Terminal RI)} = \frac{RI_T \times \omega}{(1 + r - \omega)(1 + r)^T}$.

---

### 9. `specs/engines/hedging-engine.md` — Hedging Mechanism Engine
- **Payoff Math Errors**:
  - Collar Max Gain: Spec line 41 states `max_gain = (Call_Strike - Stock_Price) - Call_Premium`. Selling a call RECEIVES premium ($+C$), buying a put PAYS premium ($-P$). Correct: $\text{Max Gain} = (K_{\text{call}} - S_0) + (C - P)$ and $\text{Max Loss} = (S_0 - K_{\text{put}}) + (P - C)$.
  - Futures Cost of Carry: Spec line 46 writes `fair_future = Spot * (1 + r * T/365) - Div_Yield`. Subtracting percentage yield from a rupee price is a severe dimensional error. Correct: $F = S_0 \times [1 + (r - q) \times \frac{T}{365}]$.
- **NSE F&O Institutional Reality**: Single-stock and index derivatives trade strictly in discrete market lots (Nifty 25, Reliance 250). Continuous hedge ratios must round to integer lots: $N = \text{round}(h^* \times V_p / V_f)$. Engine must calculate basis risk and STT cost drag (0.02% futures, 0.1% options).

---

### 10. `specs/engines/piotroski-engine.md` — Piotroski F-Score Engine
- **Leverage Distortion (F5)**: Spec defines $\Delta \text{Leverage} < 0$ as $Debt/Equity_t < Debt/Equity_{t-1}$. In turnaround firms with negative net worth, negative debt/equity produces inverted signals. Piotroski (2000) originally specified:
  $$\Delta \text{LEVER} \le 0 \quad \text{where } \text{LEVER} = \text{Long-Term Debt} / \text{Average Total Assets}$$
- **Dilution Misclassification (F7)**: Spec flags dilution if $Shares_t > Shares_{t-1}$. If a company issues a 1:1 bonus or executes a stock split, shares double without any dilution of economic equity. Share count MUST be normalized by corporate action split/bonus factors.
- **Ind AS Schedule III IT/Services Margin (F8)**: IT firms (TCS, Infosys) do not report COGS. The engine must compute Gross Profit as $\text{Revenue} - \text{Employee Expenses} - \text{Subcontracting Charges}$.

---

### 11. `specs/engines/portfolio-engine.md` — Portfolio Analytics Engine
- **XIRR Solver Failure**: Standard Newton-Raphson diverges when cash flow sign flips create multiple local extrema. Engine must implement **Brent-Dekker hybrid bracketing** bounded in $[-0.9999, 10.0]$ with fallback to bisection.
- **SEBI Sub-1-Year Holding Period Rule**: Annualizing holding periods $< 365$ days produces absurd results (3% gain in 15 days = 103% annualized). Per SEBI performance presentation standards, holding periods $< 1$ year must display **Absolute Return** only.
- **Risk-Free Rate Mismatch**: When daily returns are used, the risk-free rate must be daily: $r_{f,\text{daily}} = (1 + r_{f,\text{annual}})^{1/252} - 1$.
- **Benchmark Convention**: Must use Nifty 50 TRI (Total Return Index), not PR (Price Return), to prevent artificial dividend alpha fabrication.

---

### 12. `specs/engines/ratio-analysis-engine.md` — Ratio Analysis Engine
- **Negative Equity Inversion**: Line 28 defines $ROE = PAT / Avg\_Equity$. If $PAT = -₹50\text{ Cr}$ and $Equity = -₹100\text{ Cr}$, $ROE = +50\%$! This displays an insolvent firm as an elite compounder. When $Equity \le 0$, ROE must return status `NOT_MEANINGFUL` (`NM`).
- **Negative EBITDA / Net Cash**: $Debt/EBITDA$ when $EBITDA \le 0$ must return `NM` with an operational distress alert. When Net Debt $< 0$ (cash rich firm), ratio must be flagged as `NET_CASH`.
- **Mandatory Banking / NBFC Separation**: Industrial metrics (Gross Margin, D/E, Debt/EBITDA, Current Ratio) are meaningless for financial institutions. The engine must branch by `entity_type`:
  - **Banks/NBFCs**: NIM, Cost-to-Income, Gross NPA %, Net NPA %, Provision Coverage Ratio (PCR), Capital Adequacy Ratio (CRAR Tier 1 & 2), CASA Ratio, RoA.

---

### 13. `specs/engines/relative-engine.md` — Relative Valuation Engine
- **EV to Equity Value Bridge Omission (Fatal Error)**: Line 71 specifies `implied_value = peer_median * target_metric`. For enterprise multiples ($EV/EBITDA$, $EV/Sales$), this produces **Implied Enterprise Value**, NOT Implied Stock Price!
  $$\text{Implied Equity Value} = \text{Implied EV} - \text{Net Debt} - \text{Lease Liabilities} - \text{Minority Interest} + \text{Liquid Assets}$$
  $$\text{Implied Price} = \text{Implied Equity Value} / \text{Shares Outstanding}$$
  Omitting this bridge overstates target equity by tens of thousands of crores for leveraged firms!
- **Loss-Making Peer Distortion**: Peers with negative PAT ($P/E < 0$) or negative EBITDA ($EV/EBITDA < 0$) must be excluded before computing peer median or harmonic mean.
- **Harmonic Mean for Value Multiples**: $P/E_{\text{Harmonic}} = N / \sum_{i=1}^N (1 / P/E_i)$ for all positive peers.

---

### 14. `specs/engines/revenue-projection-engine.md` — Revenue Projection Engine
- **Free Cash Flow Tax Shield Double-Counting**: Line 29 defines `fcf_t = ebitda_t * (1 - tax) + da - capex - Δnwc`. Because $EBIT = EBITDA - D\&A$, starting from EBITDA taxed at $(1-t)$ already accounts for part of D&A. Adding full $D\&A$ overstates cash flows by $D\&A \times (1 - t)$!
  $$\text{Correct: } FCFF_t = (EBITDA_t - D\&A_t) \times (1 - t) + D\&A_t - Capex_t - \Delta NWC_t \equiv EBITDA_t \times (1 - t) + (D\&A_t \times t) - Capex_t - \Delta NWC_t$$
- **Intersegment Eliminations**: Consolidated revenue cannot be a simple sum of segment revenues in conglomerates. The engine must subtract intersegment eliminations: $\text{Consolidated Revenue}_t = \sum \text{Segment Revenue}_{i,t} - \text{Intersegment Eliminations}_t$.
- **S-Curve Parameter Boundaries**: For logistic adoption $P(t) = \frac{L}{1 + e^{-k(t - t_0)}}$, validate $L \le TAM$ and $k \in [0.05, 2.0]$.

---

### 15. `specs/engines/risk-score-engine.md` — Risk Score Engine
- **Missing Transfer Functions**: The spec scores categories 0–100 but provides zero mathematical transfer functions mapping underlying ratios to points.
- **SEBI LODR Regulatory Calibrations**:
  - **Promoter Pledge**: $\le 5\% \to 0\text{ pts}$; $5\%-20\% \to 40\text{ pts}$; $20\%-50\% \to 80\text{ pts}$; $> 50\% \to 100\text{ pts}$ (severe governance risk).
  - **Related Party Transactions (RPT)**: $> 10\%$ of turnover requires minority shareholder approval under SEBI LODR Regulation 23. RPT $> 10\% \to 100\text{ pts}$.
  - **Auditor Quality**: Big 4 unmodified $\to 0\text{ pts}$; Tier-2 $\to 25\text{ pts}$; Emphasis of Matter $\to 50\text{ pts}$; Qualified Opinion $\to 80\text{ pts}$; Auditor Resignation $\to 100\text{ pts}$.
- **Dynamic Weight Renormalization**: When metrics are unavailable for a sector (e.g. EV/EBITDA for banks), weights must renormalize over available factors: $w'_i = w_i / \sum_{j \in \text{valid}} w_j$.

---

### 16. `specs/engines/screening-engine.md` — Multi-Factor Screening Engine
- **FCF Yield Conceptual Flaw**: Line 20 defines $\text{FCF Yield} = CFO / \text{Market Cap}$. CFO is Operating Cash Flow, not Free Cash Flow! Correct: $\text{FCF Yield} = (CFO - \text{Capex}) / \text{Market Cap}$.
- **Factor Directionality & Percentile Inversion**: For "Lower Better" factors (P/E, EV/EBITDA, Debt/Equity, Beneish M-Score), raw percentile rank must be inverted: $\text{Factor Score} = 100 - \text{Percentile Rank}$.
- **Loss-Making Firms Screening Trap**: Firms with negative P/E sort below low-valuation firms in standard ascending order, accidentally receiving a top percentile ranking! Loss-makers must be flagged as `LOSS_MAKING` and assigned a factor percentile of $0$.
- **Beneish M-Score Inversion**: A score of $-3.0$ is cleaner than $-1.8$. Invert ranking so lower M-scores receive higher forensic quality points.

---

### 17. `specs/engines/sotp-engine.md` — SOTP Valuation Engine
- **Valuation Level Mismatch (Double-Counting Debt)**: Line 39 calculates `total_ev = sum(segment_net_value)` and then subtracts consolidated net debt. If Segment A was valued via P/E (Equity Value) and Segment B via EV/EBITDA (Enterprise Value), subtracting consolidated debt subtracts Segment A's debt twice! The schema must require each segment to specify its `valuation_level`:
  - If `ENTERPRISE_VALUE`: Add segment EV, then subtract Consolidated Net Debt at the bridge.
  - If `EQUITY_VALUE`: Add segment Equity Value, and subtract only Parent Standalone Debt at the bridge.
- **Subsidiary Ownership Stake Percentage**: Spec omits ownership percentages. Indian conglomerates do not own 100% of their subsidiaries (e.g. Reliance owns $\sim 67\%$ of Retail and $\sim 67\%$ of Jio). Each segment must include `effective_stake_pct`:
  $$\text{Segment Contributed Value} = \text{Segment Value} \times \text{effective\_stake\_pct} \times (1 - \text{holdco\_discount})$$
- **Holding Company Discount Sensitivity**: Indian holdcos trade at persistent discounts of $30\% - 65\%$ to NAV. The engine must produce a sensitivity table ranging from $20\%$ to $60\%$.

---

### 18. `specs/engines/turnaround-engine.md` — Turnaround Indicator Engine
- **Scaling Bug in ROE Inflection**: Line 28 checks `(roe_t - roe_t_1) > 5`. When ROE is stored as a decimal ($0.12 - 0.06 = 0.06$), `0.06 > 5` is always `False`! Normalize to decimal threshold ($> 0.05$ or $500\text{ bps}$).
- **Debt Reduction Zero-Division & Nominal Significance**: `debt_t / debt_t_1 < 0.8` divides by zero if prior debt is 0. Additionally, debt reduction must satisfy a minimum nominal threshold (e.g. $> ₹25\text{ Cr}$) to avoid flagging immaterial changes.
- **IBC / NCLT Dilution Trap**: Debt reduction achieved via Insolvency & Bankruptcy Code (IBC) debt-for-equity swaps typically dilutes existing equity holders by $90\%-99\%$. The engine must check `share_dilution_pct < 10%` to verify the turnaround benefits equity holders.
- **Pillar Weight Alignment**: Reconcile the 6 binary signals in code with the 5 weighted pillars in Section 3.1 into a unified hierarchical scoring schema.

---

## Technical Architecture & Cross-Engine Guidelines

1. **Precision & Typing**: Currency and share count calculations must use high-precision Float64 or Python `Decimal` to avoid floating-point drift. Pydantic v2 data models must be enforced across all API boundaries with strict range validators (`ge`, `le`).
2. **Computational Performance & Vectorization**: Multi-factor screening and sensitivity matrices must be implemented via vectorized NumPy / Polars arrays rather than Python loops. 9x9 sensitivity matrices must execute in $< 1.5\text{ ms}$.
3. **Idempotency & Caching**: All valuation and forensic engines must be deterministic and pure functions. Cache results keyed by `hash(canonical_json(inputs))` with Redis TTL = 24 hours.

---

*Category Audit Complete | Actionable Implementation Specifications Delivered for Hermes*
