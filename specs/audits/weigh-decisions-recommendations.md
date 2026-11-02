# Weigh Decisions Subsystem Specification Audit & Recommendations

**Author:** Document AI & Decision Systems Specialist (`teamwork_worker`)  
**Scope:** All 6 specification files in `specs/weigh-decisions/`:
1. `specs/weigh-decisions/weigh-decisions.md` (Master Omnibus Workflow & Decision Terminal)
2. `specs/weigh-decisions/conviction-sizing.md` (Conviction Sizing & Sizing Models)
3. `specs/weigh-decisions/decision-journal.md` (Decision Journal & Calibration Engine)
4. `specs/weigh-decisions/portfolio-fit-check.md` (Portfolio Fit Check & Multi-Pillar Scoring)
5. `specs/weigh-decisions/reverse-dcf.md` (Reverse DCF & Expectation Investing)
6. `specs/weigh-decisions/scenario-analysis.md` (Scenario Stress Testing & Monte Carlo Engine)  
**Date:** 2026-11-02  
**Status:** Complete Audit & Actionable Blueprint  

---

## 1. Executive Summary & Inventory Synthesis

The `weigh-decisions` category constitutes the cognitive and quantitative core of Research OS. It bridges fundamental equity research (financial statement analysis, moat evaluation, valuation modeling) with portfolio construction and execution. 

While the existing 6 specifications introduce valuable concepts (such as Kelly sizing, Brier calibration, Reverse DCF, and Monte Carlo simulation), our multidisciplinary audit identified fundamental vulnerabilities across financial regulations, mathematical stability, behavioral finance, and institutional Investment Committee (IC) workflows:
1. **Absence of Hard Forensic Vetoes:** The decision workflow allows high valuation upside or favorable portfolio fit to average out or obscure catastrophic forensic red flags (such as qualified auditor opinions or massive promoter share pledges).
2. **Mathematical Singularities in Valuation & Sizing:** Kelly criterion models assume unbounded Gaussian distributions without fat-tail protections; Reverse DCF algorithms crash when working capital requirements outpace operating cash during growth; and Monte Carlo Cholesky decompositions fail when historical correlation matrices are not strictly positive definite.
3. **Missing Bayesian Conviction Updating:** Conviction is treated as a static qualitative label ('High', 'Medium', 'Low') rather than a dynamic probability distribution updated sequentially via Bayes' rule upon the arrival of quarterly results, management changes, or regulatory notices.
4. **Neglect of Indian Market Microstructure & SEBI Mandates:** Sizing models omit SEBI mutual fund/PMS concentration ceilings (e.g., 10% single-stock / 25% sector limit), conglomerate multi-segment lookthrough (e.g., Reliance across Retail, Telecom, and Energy), and NSE derivative lot size constraints.

The following sections provide concrete, actionable replacement specifications for each file in the subsystem.

---

## 2. Audit & Recommendations: `specs/weigh-decisions/weigh-decisions.md`

### 2.1 Target Spec File Path & Title
- **File:** `specs/weigh-decisions/weigh-decisions.md`
- **Title:** Weigh Decisions Tool Specification (Spec Version: 1.0.0)

### 2.2 Lenses Evaluated & Core Critique

#### 1. Fundamental Investor Logic: Compulsory Red-Flag Gates & Vetoes
- **Flawed Linear Averaging:** In the current 5-step wizard, an analyst progresses through steps 1 to 5, arriving at an aggregate recommendation. This is dangerous. In institutional investing, certain corporate governance and forensic failures must act as **Compulsory Veto Gates** (hard stops) that immediately terminate the investment process regardless of valuation attractiveness:
  1. *Auditor Qualification or Resignation:* If the statutory auditor resigns mid-term or issues a qualified/adverse opinion under CARO (Companies Auditor's Report Order), the tool must veto any BUY recommendation.
  2. *Promoter Pledge Trap:* Promoter encumbrance/pledge > 40% of shareholding coupled with debt default triggers a mandatory veto.
  3. *Unresolved Material Litigation:* Disputed tax/regulatory claims exceeding 50% of tangible net worth.

#### 2. Institutional Investment Committee (IC) Workflow & Sign-Off
- **Missing Governance Trail:** Institutional buy-side firms require formal sign-off workflows. An investment thesis cannot simply be "saved". The tool must support:
  - Generation of a standardized 2-page IC Memo.
  - Recording dissenting opinions and committee vote distributions (e.g., 3 in favor, 1 against).
  - Explicit conditions precedent (e.g., "Approved subject to Q3 concall confirming gross margin > 22%").

#### 3. UI/UX Design: Interactive Conviction Dials & Visual Hierarchy
- **Low Data Density & Disjointed Wizard:** The current layout relies on disconnected text boxes. Analysts need an integrated cockpit featuring:
  - An interactive conviction dial (0–100%) dynamically driven by underlying pillar scores.
  - A real-time red-flag warning banner pinned to the top of every wizard step.
  - An automated, one-click IC Memo Preview modal.

---

### 2.3 Actionable Replacements

#### Compulsory Red-Flag Gate State Machine & IC Sign-Off Schema
Replace Section 4.1 with a state machine that enforces hard institutional vetoes:

```typescript
export type DecisionAction = 'STRONG_BUY' | 'ACCUMULATE' | 'HOLD' | 'TRIM' | 'EXIT' | 'MANDATORY_VETO';

export interface CompulsoryRedFlagCheck {
  id: string;
  name: string;
  triggered: boolean;
  severity: 'WARNING' | 'CRITICAL_VETO';
  observedValue: string;
  vetoThreshold: string;
  sourceSpec: string; // e.g. "company-page/sme/assess-auditor.md"
}

export interface InvestmentCommitteeMemo {
  memoId: string;
  symbol: string;
  date: string;
  authorAnalyst: string;
  targetPrice: number;
  currentMarketPrice: number;
  upsidePct: number;
  recommendedAllocationPct: number;
  
  // Compulsory Veto Gates
  vetoChecks: CompulsoryRedFlagCheck[];
  isVetoed: boolean;
  vetoReason?: string;
  
  // Executive Synthesis
  coreInvestmentPillars: {
    pillar: 'BUSINESS_MOAT' | 'FINANCIAL_STRENGTH' | 'MANAGEMENT_INTEGRITY' | 'VALUATION_MOS';
    score: number; // 0-100
    thesisSnippet: string;
  }[];
  
  // Committee Sign-off
  committeeReview: {
    meetingDate: string;
    membersPresent: string[];
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    approvalStatus: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL';
    approvalConditions: string[];
  };
}
```

#### Compulsory Red-Flag Gate Enforcement Logic
Add the gatekeeper validation engine:

```python
def evaluate_compulsory_veto_gates(company_data: dict) -> tuple[bool, list[str]]:
    """
    Evaluates institutional hard-stop conditions. 
    If any critical veto condition is met, the tool forcibly overrides the decision to MANDATORY_VETO.
    """
    veto_reasons = []
    
    # 1. Auditor Red Flags (CARO / Resignation)
    if company_data.get("auditor_resigned_past_24m", False):
        veto_reasons.append("Statutory auditor resigned prematurely within the last 24 months.")
    if company_data.get("auditor_opinion_qualified", False):
        veto_reasons.append("Auditor report contains qualified or adverse opinion under CARO 2020.")
        
    # 2. Promoter Encumbrance / Pledge
    promoter_holding = company_data.get("promoter_holding_pct", 0.0)
    pledged_pct_of_holding = company_data.get("promoter_pledged_pct_of_holding", 0.0)
    if pledged_pct_of_holding > 40.0:
        veto_reasons.append(f"Excessive promoter pledge: {pledged_pct_of_holding:.1f}% of promoter stake is pledged (Veto limit: 40%).")
        
    # 3. Contingent Liabilities Hazard
    contingent_liab = company_data.get("contingent_liabilities_cr", 0.0)
    net_worth = company_data.get("net_worth_cr", 1.0)
    if (contingent_liab / net_worth) > 0.50:
        veto_reasons.append(f"Contingent liabilities exceed 50% of net worth ({contingent_liab/net_worth*100:.1f}%).")
        
    # 4. Related Party Transactions (RPT) Distortion
    rpt_to_revenue = company_data.get("rpt_sales_purchases_pct_revenue", 0.0)
    if rpt_to_revenue > 25.0:
        veto_reasons.append(f"Excessive related-party transactions: {rpt_to_revenue:.1f}% of revenue (Veto limit: 25%).")

    is_vetoed = len(veto_reasons) > 0
    return is_vetoed, veto_reasons
```

#### Enhanced UI Layout with Conviction Dial & IC Memo Generator
Replace Section 3.1 with an integrated view featuring interactive dials:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Weigh Decisions Executive Cockpit - [SYMBOL: TITAN | CMP: ₹3,420]                                │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🛡️ COMPULSORY RED-FLAG GATES: [ ✅ ALL 4 INSTITUTIONAL VETO CHECKS PASSED ]                      │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ LEFT PANEL: MULTI-PILLAR CONVICTION MATRIX (50%)│ RIGHT PANEL: IC MEMO & PORTFOLIO IMPACT (50%)  │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │ ┌────────────────────────────────────────────┐ │
│ │ COMPOSITE CONVICTION SCORE: 84 / 100        │ │ │ PROPOSED ACTION: BUY (Allocation: 4.5%)    │ │
│ │ [===== DIAL: HIGH CONVICTION (84%) =====]   │ │ │ Expected IRR: +22.4% | Horizon: 3Y         │ │
│ ├─────────────────────────────────────────────┤ │ ├────────────────────────────────────────────┤ │
│ │ 1. Business Moat (Weight: 30%):        92/100│ │ │ Portfolio Volatility Delta: 14.8% → 15.1%  │ │
│ │    Strong brand pricing power; Tanishq SSG   │ │ │ Sector Weight (Consumer):   16.5% → 21.0%  │ │
│ │ 2. Management & Forensics (Weight: 25%): 88/100│ │ │ Days to Liquidate Position: 1.4 Days      │ │
│ │    Clean Tata governance; zero pledge        │ │ ├────────────────────────────────────────────┤ │
│ │ 3. Valuation Margin of Safety (25%):  64/100│ │ │ PRE-MORTEM RISKS IDENTIFIED:               │ │
│ │    Reverse DCF implies 15.2% growth (Fair)   │ │ │ 1. Custom duty hike on gold (>15% margin)  │ │
│ │ 4. Portfolio Fit & Liquidity (20%):   86/100│ │ │ 2. Lab-grown diamonds eroding solitaire GM │ │
│ └─────────────────────────────────────────────┘ │ └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│ BOTTOM CONTROLS: [Generate Institutional IC Memo (.PDF)] [Send to Decision Journal] [Apply Order] │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Audit & Recommendations: `specs/weigh-decisions/conviction-sizing.md`

### 3.1 Target Spec File Path & Title
- **File:** `specs/weigh-decisions/conviction-sizing.md`
- **Title:** Conviction Sizing Tool Specification (Spec Version: 1.0.0)

### 3.2 Lenses Evaluated & Core Critique

#### 1. Mathematical Rigor: Kelly Paradox, Fat Tails & Log-Odds Stability
- **Catastrophic Kelly Drawdowns:** The current spec implements standard continuous Kelly:
  $$f^* = \frac{bp - q}{b}$$
  In real-world equity markets—especially Indian mid/small caps—returns are severely non-Gaussian, displaying heavy left-skew and fat tails. Circuit breakers (-5%, -10%, -20%) and liquidity black holes during market crises produce drawdowns that bankrupt standard Kelly sizing.
- **Missing Bayesian Belief Updating:** The spec relies on static conviction ('High', 'Medium', 'Low'). Fundamental investors update beliefs upon new evidence (quarterly earnings beats, channel checks, management exits). Operating on linear probabilities leads to probability boundary violations ($p < 0$ or $p > 1$) and numerical rounding distortion. Calculations must be formulated in **log-odds space** ($\text{logit}$) with numerical clamping to $[0.01, 0.99]$.

#### 2. Financial Knowledge: SEBI Portfolio Limits & Incomplete Criteria Handling
- **SEBI Regulatory Caps Ignored:** SEBI mutual fund guidelines enforce a hard ceiling of 10% in a single security (12% with prior board approval) and a 25% single-sector ceiling (excluding BFSI). Sizing recommendations that exceed these limits violate Indian regulatory compliance.
- **Incomplete Criteria Weight Normalization:** When an analyst does not rate a certain subjective dimension (e.g., ESG or turnaround timing), naive weighted averages either drop the weight or divide by arbitrary constants. The weights must be dynamically normalized such that:
  $$\sum_{i \in \text{Rated}} w_i = 1.0$$

---

### 3.3 Actionable Replacements

#### Log-Odds Bayesian Belief Updating Algorithm
Add the log-odds formulation for conviction probability updating:

```python
import math

def bayesian_conviction_update(prior_probability: float, likelihood_ratio: float) -> tuple[float, float]:
    """
    Updates conviction probability using Bayes' Rule in log-odds space to prevent overflow/underflow.
    Logit(P_posterior) = Logit(P_prior) + ln(Likelihood_Ratio)
    
    likelihood_ratio > 1.0: Bullish evidence (e.g., quarterly EBITDA beat, margin expansion)
    likelihood_ratio < 1.0: Bearish evidence (e.g., promoter selling, regulatory notice)
    """
    # Clamp prior to safe numerical boundaries
    p_clamped = min(max(prior_probability, 0.01), 0.99)
    
    # Transform to log-odds
    prior_log_odds = math.log(p_clamped / (1.0 - p_clamped))
    
    # Clamp likelihood ratio to prevent explosive arithmetic
    lr_clamped = min(max(likelihood_ratio, 0.05), 20.0)
    
    # Update log-odds
    posterior_log_odds = prior_log_odds + math.log(lr_clamped)
    
    # Transform back to probability
    posterior_prob = 1.0 / (1.0 + math.exp(-posterior_log_odds))
    posterior_prob = min(max(posterior_prob, 0.01), 0.99)
    
    return posterior_prob, posterior_log_odds
```

#### Fat-Tailed Fractional Kelly with SEBI Regulatory Clamping
Replace Section 4.1 with a robust sizing formulation:

```python
def compute_fat_tailed_position_size(
    win_prob: float, 
    win_loss_ratio: float, 
    tail_risk_kurtosis: float,
    current_portfolio_cash: float,
    current_sector_weight: float,
    sebi_single_stock_cap: float = 0.10,
    sebi_sector_cap: float = 0.25
) -> dict:
    """
    Calculates institutional position size using Fractional Kelly adjusted for kurtosis / fat tails,
    subject to SEBI single-stock (10%) and sector (25%) hard ceilings.
    """
    # 1. Standard Kelly Fraction
    b = max(win_loss_ratio, 0.1)
    p = win_prob
    q = 1.0 - p
    f_star = (b * p - q) / b
    
    if f_star <= 0:
        return {"recommended_weight": 0.0, "reason": "Negative expected edge (Kelly <= 0)"}
        
    # 2. Kurtosis / Fat-Tail Adjustment: Higher excess kurtosis dampens Kelly fraction
    # In Indian small/mid caps, excess kurtosis often exceeds 4.0
    kurtosis_damping = max(0.25, 1.0 / (1.0 + 0.15 * max(0.0, tail_risk_kurtosis - 3.0)))
    
    # Apply Quarter-Kelly baseline (institutional standard) modified by kurtosis damping
    fractional_kelly = f_star * 0.25 * kurtosis_damping
    
    # 3. SEBI and Risk Concentration Limits
    headroom_sector = max(0.0, sebi_sector_cap - current_sector_weight)
    headroom_cash = current_portfolio_cash
    
    final_weight = min(
        fractional_kelly,
        sebi_single_stock_cap,
        headroom_sector,
        headroom_cash
    )
    
    return {
        "raw_kelly_pct": round(f_star * 100, 2),
        "kurtosis_damping": round(kurtosis_damping, 2),
        "fractional_kelly_pct": round(fractional_kelly * 100, 2),
        "recommended_weight_pct": round(final_weight * 100, 2),
        "active_constraints": {
            "sebi_stock_cap_hit": final_weight == sebi_single_stock_cap,
            "sebi_sector_cap_hit": final_weight == headroom_sector
        }
    }
```

---

## 4. Audit & Recommendations: `specs/weigh-decisions/decision-journal.md`

### 4.1 Target Spec File Path & Title
- **File:** `specs/weigh-decisions/decision-journal.md`
- **Title:** Decision Journal Tool Specification (Spec Version: 1.0.0)

### 4.2 Lenses Evaluated & Core Critique

#### 1. Fundamental Investor Logic: Behavioral Debiasing & Cognitive Blindspots
- **Hindsight Bias & Shifting Theses:** Fundamental investors frequently rationalize bad investments by retroactively altering their initial thesis (e.g. buying a stock for "growth", and when growth stalls, claiming "it is now a deep-value dividend play"). The Decision Journal must freeze the initial thesis cryptographically with Point-in-Time (PIT) timestamps and force formal thesis change reviews.
- **Specific Cognitive Bias Audits:** The current behavioral checklist is superficial. The tool must systematically test for:
  1. *Sunk Cost Fallacy:* Has the analyst recommended averaging down on a stock where 2 or more initial thesis assumptions have failed?
  2. *Anchoring Bias:* Is the analyst refusing to sell a position because the CMP is below their initial entry price?
  3. *Confirmation Bias:* Are negative broker downgrades and concall red flags marked as "noise" while positive commentary is amplified?

#### 2. Mathematical Rigor: Brier Score Decomposition & Calibration Diagrams
- **Lack of Murphy Decomposition:** The spec lists Brier score $\text{BS} = \frac{1}{N} \sum (p_i - o_i)^2$, but fails to implement the Murphy decomposition. The Brier score must be decomposed into its three structural components:
  $$\text{Brier Score} = \text{Reliability} - \text{Resolution} + \text{Uncertainty}$$
  This tells the Chief Investment Officer (CIO) whether an analyst is overconfident (poor reliability) or incapable of sorting winners from losers (poor resolution).

---

### 4.3 Actionable Replacements

#### Murphy Brier Score Decomposition Engine
Add the mathematical implementation for analyst calibration:

```python
import numpy as np

def compute_brier_decomposition(probabilities: list[float], outcomes: list[int], n_bins: int = 5) -> dict:
    """
    Computes Murphy's decomposition of the Brier Score into Reliability, Resolution, and Uncertainty.
    Brier = Reliability - Resolution + Uncertainty
    Lower Reliability is better (0 = perfect calibration).
    Higher Resolution is better (measures discriminatory ability).
    """
    p = np.array(probabilities)
    o = np.array(outcomes) # 1 for thesis met / win, 0 for failure
    N = len(p)
    if N == 0:
        return {"brier_score": 0.0, "reliability": 0.0, "resolution": 0.0, "uncertainty": 0.0}
        
    base_rate = np.mean(o)
    uncertainty = base_rate * (1.0 - base_rate)
    
    # Binning probabilities into discrete calibration buckets
    bin_edges = np.linspace(0.0, 1.0, n_bins + 1)
    reliability = 0.0
    resolution = 0.0
    
    calibration_curve = []
    
    for i in range(n_bins):
        bin_mask = (p >= bin_edges[i]) & (p < bin_edges[i+1] if i < n_bins - 1 else p <= bin_edges[i+1])
        n_k = np.sum(bin_mask)
        if n_k > 0:
            p_k_bar = np.mean(p[bin_mask])
            o_k_bar = np.mean(o[bin_mask])
            
            reliability += (n_k / N) * ((p_k_bar - o_k_bar) ** 2)
            resolution += (n_k / N) * ((o_k_bar - base_rate) ** 2)
            
            calibration_curve.append({
                "bin_range": f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}",
                "mean_predicted": round(float(p_k_bar), 3),
                "empirical_hit_rate": round(float(o_k_bar), 3),
                "count": int(n_k)
            })
            
    brier_score = reliability - resolution + uncertainty
    
    return {
        "brier_score": round(float(brier_score), 4),
        "reliability": round(float(reliability), 4),
        "resolution": round(float(resolution), 4),
        "uncertainty": round(float(uncertainty), 4),
        "calibration_curve": calibration_curve
    }
```

#### Behavioral Bias Audit Checklist Schema
Replace Section 3.1 with a structured behavioral review schema:

```typescript
export interface BehavioralAuditRecord {
  decisionId: string;
  auditTimestamp: string;
  biasChecks: {
    biasType: 'SUNK_COST' | 'ANCHORING' | 'CONFIRMATION' | 'RECENCY' | 'OVERCONFIDENCE';
    warningTriggered: boolean;
    diagnosticQuestion: string;
    analystJustification: string;
  }[];
  falsificationTriggers: {
    metric: string;
    failureThreshold: string;
    currentObserved: string;
    breached: boolean;
  }[];
  lockState: {
    isThesisFrozen: boolean;
    frozenTimestamp: string;
    sha256Hash: string;
  };
}
```

---

## 5. Audit & Recommendations: `specs/weigh-decisions/portfolio-fit-check.md`

### 5.1 Target Spec File Path & Title
- **File:** `specs/weigh-decisions/portfolio-fit-check.md`
- **Title:** Portfolio Fit Check Tool Specification (Spec Version: 1.0.0)

### 5.2 Lenses Evaluated & Core Critique

#### 1. Financial Knowledge: Conglomerate Multi-Segment Lookthrough
- **Single Sector Tag Distortion:** The current spec maps every company to a single monolithic sector string (`new_holding.sector`). In the Indian equity landscape, dominant large caps are complex multi-industry conglomerates. For example, Reliance Industries encompasses Oil-to-Chemicals (Energy), Reliance Retail (Consumer), and Jio Infocomm (Telecom). Classifying Reliance purely as "Energy" severely distorts portfolio sector risk. A segment-weighted lookthrough breakdown is mandatory.

#### 2. Market Plumbing: Indian T+1 Settlement & ADTV Liquidity Mechanics
- **Unrealistic Days-to-Liquidate:** In Section 3.1, liquidity impact is modeled via an abstract `t1_liquidity` scalar. Institutional investors manage liquidity based on **Average Daily Trading Volume (ADTV)**. Under institutional risk rules, an investment cannot assume more than 15–20% of the 30-day ADTV without generating severe market impact slippage.

---

### 5.3 Actionable Replacements

#### Multi-Segment Lookthrough & ADTV Liquidity Formula
Replace Section 4.1 with multi-segment lookthrough and realistic liquidity calculations:

```python
def calculate_segment_lookthrough_exposure(
    proposed_holding_symbol: str,
    proposed_weight: float,
    company_segment_breakdown: list[dict], # e.g. [{"sector": "Retail", "weight": 0.40}, {"sector": "Telecom", "weight": 0.35}]
    portfolio_sector_weights: dict[str, float]
) -> dict[str, float]:
    """
    Distributes proposed position size across constituent business segments,
    preventing sector concentration misclassification.
    """
    updated_sector_weights = dict(portfolio_sector_weights)
    for seg in company_segment_breakdown:
        sec = seg["sector"]
        seg_pct = seg["revenue_or_ebitda_share"]
        incremental_exposure = proposed_weight * seg_pct
        updated_sector_weights[sec] = updated_sector_weights.get(sec, 0.0) + incremental_exposure
    return updated_sector_weights

def calculate_days_to_liquidate(
    position_shares: int,
    adtv_30d_shares: int,
    max_volume_participation: float = 0.15
) -> float:
    """
    Computes trading days required to liquidate position without causing >1.5% market impact,
    capping daily participation at 15% of 30-day ADTV.
    """
    if adtv_30d_shares <= 0:
        return 999.0
    daily_liquid_capacity = adtv_30d_shares * max_volume_participation
    days = position_shares / daily_liquid_capacity
    return round(days, 1)
```

---

## 6. Audit & Recommendations: `specs/weigh-decisions/reverse-dcf.md`

### 6.1 Target Spec File Path & Title
- **File:** `specs/weigh-decisions/reverse-dcf.md`
- **Title:** Reverse DCF Tool Specification (Spec Version: 1.0.0)

### 6.2 Lenses Evaluated & Core Critique

#### 1. Mathematical Rigor: Working Capital Drag & Terminal Value Singularity
- **Negative Cash Flow in Hypergrowth:** In Section 4.1, the spec defines:
  $$\text{FCFF} = \text{EBITDA} \times (1 - t) \times (1 - \text{capex\_sales} - \text{wc\_sales} \cdot g)$$
  If the solver tests a high growth rate $g = 25\%$ and $\text{wc\_sales} = 15\%$, then $\text{wc\_sales} \cdot g$ becomes large, and when combined with Capex, $(1 - \text{capex} - \text{wc} \cdot g)$ turns negative, generating negative cash flows that cause the binary search solver to fail or diverge.
- **Terminal Value Singularity:** If $\text{WACC} \le g_{\text{term}}$, the denominator $(\text{WACC} - g_{\text{term}})$ becomes zero or negative, resulting in infinite or negative enterprise value. The algorithm must enforce:
  $$g_{\text{term}} \le \min(\text{India 10Y G-Sec Yield} - 250\text{ bps}, \text{WACC} - 200\text{ bps})$$

#### 2. Financial Knowledge: Reinvestment Rate Formulation
- **Economic Formulation via ROIC:** Sound institutional expectation investing (Mauboussin & Rappaport) derives reinvestment from Return on Invested Capital (ROIC):
  $$\text{Reinvestment Rate} = \frac{g}{\text{ROIC}}$$
  $$\text{FCFF} = \text{NOPAT} \times \left(1 - \frac{g}{\text{ROIC}}\right)$$
  This enforces economic reality: a firm cannot grow without invested capital unless its ROIC is infinite.

---

### 6.3 Actionable Replacements

#### Economically Grounded Reverse DCF Solver
Replace lines 76–104 with an ROIC-consistent numerical solver:

```python
def solve_reverse_dcf_growth(
    target_ev: float,
    current_ebitda: float,
    tax_rate: float,
    depreciation_amortization: float,
    wacc: float,
    terminal_growth: float,
    projected_roic: float,
    forecast_years: int = 10
) -> dict:
    """
    Solves for the implied NOPAT/EBITDA growth rate 'g' using economic reinvestment:
    FCFF_t = NOPAT_t * (1 - g / ROIC)
    Clamps terminal growth to prevent WACC singularity.
    """
    # 1. Terminal Growth Guardrail: Must be strictly less than WACC
    g_term = min(terminal_growth, wacc - 0.02, 0.06) # Max 6% terminal growth for India
    
    base_ebit = max(current_ebitda - depreciation_amortization, 1.0)
    base_nopat = base_ebit * (1.0 - tax_rate)
    
    def calculate_ev_for_growth(g: float) -> float:
        # Prevent reinvestment rate >= 100%
        reinvestment_rate = min(max(g / max(projected_roic, 0.05), 0.0), 0.90)
        pv_fcff = 0.0
        
        current_nopat = base_nopat
        for t in range(1, forecast_years + 1):
            current_nopat *= (1.0 + g)
            fcff_t = current_nopat * (1.0 - reinvestment_rate)
            pv_fcff += fcff_t / ((1.0 + wacc) ** t)
            
        # Terminal Value
        terminal_nopat = current_nopat * (1.0 + g_term)
        terminal_reinvestment = min(g_term / max(projected_roic, 0.05), 0.70)
        terminal_fcff = terminal_nopat * (1.0 - terminal_reinvestment)
        terminal_value = terminal_fcff / (wacc - g_term)
        pv_terminal = terminal_value / ((1.0 + wacc) ** forecast_years)
        
        return pv_fcff + pv_terminal

    # Binary search for implied growth rate g in [-20%, +60%]
    low, high = -0.20, 0.60
    tolerance = 1000.0 # EV in INR thousands/lakhs tolerance
    
    for _ in range(60):
        mid = (low + high) / 2.0
        computed_ev = calculate_ev_for_growth(mid)
        if abs(computed_ev - target_ev) < tolerance:
            break
        if computed_ev < target_ev:
            low = mid
        else:
            high = mid
            
    implied_g = (low + high) / 2.0
    
    return {
        "implied_growth_pct": round(implied_g * 100, 2),
        "terminal_growth_used_pct": round(g_term * 100, 2),
        "reinvestment_rate_pct": round(min(implied_g / projected_roic, 0.9) * 100, 2),
        "wacc_pct": round(wacc * 100, 2)
    }
```

---

## 7. Audit & Recommendations: `specs/weigh-decisions/scenario-analysis.md`

### 7.1 Target Spec File Path & Title
- **File:** `specs/weigh-decisions/scenario-analysis.md`
- **Title:** Scenario Analysis Tool Specification (Spec Version: 1.0.0)

### 7.2 Lenses Evaluated & Core Critique

#### 1. Mathematical Rigor: Covariance Matrix Non-Positive Definiteness & Cholesky Crashes
- **Matrix Singularity:** In Section 4.1, the Monte Carlo simulation executes:
  `L = np.linalg.cholesky(corr_matrix)`
  In real-world multi-asset portfolios—especially when tracking assets with missing historical dates or extreme shocks—sample covariance matrices are frequently **not positive definite** (eigenvalues $\le 0$). This causes `np.linalg.cholesky` to crash immediately with `LinAlgError: Matrix is not positive definite`. The algorithm must apply **Higham's Nearest Correlation Matrix algorithm** to project the matrix onto the positive semi-definite cone before decomposition.

#### 2. Fundamental Investor Logic: Pre-Mortem Systematic Failure Modes
- **Generic Scenarios vs. Failure Categories:** The spec uses generic "Bear, Base, Bull" states. Institutional pre-mortems (Gary Klein framework) require mapping explicit, systematic failure modes across 4 fundamental categories:
  1. *Regulatory / Policy Shock:* Windfall taxes, export duties, tariff reductions.
  2. *Technological Disruption / Obsolescence:* New entrants eroding structural pricing power.
  3. *Promoter Capital Misallocation:* Unrelated overseas acquisitions, empire building.
  4. *Customer Concentration Loss:* Loss of a single client contributing > 25% of revenue.

#### 3. Market Plumbing: NSE Derivatives Lot Size Sizing
- **Derivative Sizing Friction:** The optimal hedge recommends "Nifty Put 2% notional". In the Indian market, derivatives trade strictly in standardized exchange lot sizes (e.g., Nifty = 25 shares/lot, Bank Nifty = 15 shares/lot). Recommendations must snap to integer lot multiples and compute realistic STT and rollover costs.

---

### 7.3 Actionable Replacements

#### Higham Nearest Positive Definite Correlation Projection Algorithm
Add the matrix stabilization algorithm:

```python
import numpy as np

def nearest_positive_definite_correlation(A: np.ndarray, max_iterations: int = 100) -> np.ndarray:
    """
    Computes the nearest positive semi-definite correlation matrix using Higham's (2002) algorithm,
    guaranteeing that Cholesky decomposition will succeed without LinAlgError crashes.
    """
    B = (A + A.T) / 2.0
    n = B.shape[0]
    
    # SVD / Eigenvalue clipping
    eigvals, eigvecs = np.linalg.eigh(B)
    eigvals = np.maximum(eigvals, 1e-7) # Clip negative eigenvalues
    C = eigvecs @ np.diag(eigvals) @ eigvecs.T
    
    # Force unit diagonal
    D = np.sqrt(np.diag(C))
    C = C / np.outer(D, D)
    np.fill_diagonal(C, 1.0)
    
    return C

def safe_correlated_monte_carlo(returns: np.ndarray, n_sims: int = 10000, horizon_days: int = 252) -> np.ndarray:
    """Safely executes correlated Geometric Brownian Motion with stabilized correlation."""
    corr = np.corrcoef(returns, rowvar=False)
    corr_stable = nearest_positive_definite_correlation(corr)
    
    # Cholesky decomposition guaranteed to succeed
    L = np.linalg.cholesky(corr_stable)
    
    mu = np.mean(returns, axis=0) * 252
    sigma = np.std(returns, axis=0) * np.sqrt(252)
    
    z = np.random.normal(0, 1, (n_sims, horizon_days, len(mu)))
    correlated_z = z @ L.T
    
    simulated_paths = np.exp((mu - 0.5 * sigma**2) / 252 + (sigma / np.sqrt(252)) * correlated_z)
    final_returns = np.prod(simulated_paths, axis=1) - 1.0
    return final_returns
```

#### Pre-Mortem Systematic Failure Matrix Schema
Add the pre-mortem schema to replace generic scenario inputs:

```typescript
export type PreMortemCategory = 
  | 'REGULATORY_POLICY_SHOCK' 
  | 'TECHNOLOGICAL_DISRUPTION' 
  | 'PROMOTER_CAPITAL_MISALLOCATION' 
  | 'CUSTOMER_CONCENTRATION_LOSS' 
  | 'BALANCE_SHEET_REFINANCING';

export interface PreMortemFailureMode {
  id: string;
  category: PreMortemCategory;
  failureScenarioTitle: string;
  narrativeDescription: string;
  probability: number; // 0.0 - 1.0
  terminalImpactOnEbitdaPct: number; // e.g. -35%
  terminalImpactOnValuationMultiple: number; // e.g. P/E contracts from 35x to 18x
  observableEarlyWarningIndicators: string[];
  mitigatingHedgeAvailable: boolean;
  recommendedHedgeInstrument?: string; // e.g., "NIFTY_PUT_SPREAD"
}
```

---

## 8. Summary Implementation Matrix for Weigh Decisions Subsystem

| Spec File | Critical Finding | Recommended Fix | Primary Lens Impact |
|---|---|---|---|
| `weigh-decisions.md` | Lacks compulsory vetoes; linear score averaging obscures forensic traps; no formal IC sign-off. | Hard-stop veto state machine (Auditor/Pledge/CARO); 2-page IC Memo generator with committee voting audit trail. | Fundamental Logic & Governance |
| `conviction-sizing.md` | Continuous Kelly ignores fat tails and circuit limits; static conviction; ignores SEBI limits (10% stock / 25% sector). | Kurtosis-damped Fractional Kelly; Log-Odds Bayesian belief updater; SEBI regulatory clamping. | Mathematical Rigor & SEBI Compliance |
| `decision-journal.md` | No behavioral debiasing against sunk-cost averaging; Brier score lacks decomposition. | Cryptographically frozen thesis timestamps; Murphy Brier Score decomposition (Reliability, Resolution, Uncertainty). | Behavioral Finance & Mathematical Forensics |
| `portfolio-fit-check.md` | Single-sector tagging distorts conglomerates (e.g. Reliance); liquidity ignores market participation limits. | Multi-segment lookthrough engine; ADTV-based days-to-liquidate formula (max 15% participation). | Financial Reality & Market Plumbing |
| `reverse-dcf.md` | Working capital drag generates negative cash flows; terminal growth WACC singularity; ignores ROIC. | Reinvestment rate derived from ROIC; terminal growth clamped below WACC-200 bps; robust binary search solver. | Valuation Rigor & Mathematical Algorithms |
| `scenario-analysis.md` | Cholesky crashes on non-positive definite correlation; generic scenarios miss structural pre-mortems. | Higham nearest correlation matrix projection; 4-category systematic pre-mortem schema; NSE lot-size options snapping. | Quantitative Finance & Risk Analysis |
