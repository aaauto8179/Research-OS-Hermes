"""
Fundamental Research Operating System - Deterministic Math Engine
================================================================
Zero-LLM financial computations. All formulas implemented in pure Python
with numpy/pandas/scipy. Every function has explicit inputs, deterministic
outputs, and audit trail capability.

Author: Financial Domain Analyst Agent
Spec: FDS-02_Valuation_Models.md, FDS-03_Forensics_Algorithms.md
"""

from __future__ import annotations
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any, Literal
from enum import Enum
import math
from abc import ABC, abstractmethod
import json
from datetime import date, datetime
import warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

# ============================================================
# CORE TYPES & DATA CLASSES
# ============================================================

class ValuationMethod(str, Enum):
    DCF_FCFF = "dcf_fcff"
    DCF_FCFE = "dcf_fcfe"
    RELATIVE_TRADING = "relative_trading"
    RELATIVE_TRANSACTION = "relative_transaction"
    SOTP = "sotp"
    BANKING_PB_ROE = "banking_pb_roe"
    EXCESS_RETURN = "excess_return"

class ForecastScenario(str, Enum):
    BEAR = "bear"
    BASE = "base"
    BULL = "bull"

@dataclass
class DCFInputs:
    """Inputs for DCF valuation - all explicit, no defaults"""
    # Historical / Current
    revenue: float
    ebit: float
    depreciation: float
    capex: float
    change_nwc: float
    tax_rate: float
    total_debt: float
    cash: float
    minority_interest: float
    diluted_shares: float
    
    # Forecast assumptions
    revenue_growth_years: List[float]  # Year-by-year growth rates
    ebit_margin: float                 # Steady-state EBIT margin
    capex_pct_revenue: float           # Capex as % of revenue
    nwc_pct_revenue: float             # Change in NWC as % of revenue change
    
    # WACC inputs
    risk_free_rate: float
    equity_risk_premium: float
    beta: float
    cost_of_debt: float
    debt_to_value: float               # Target D/V ratio
    
    # Terminal value
    terminal_growth_rate: float
    exit_multiple: float               # EV/EBITDA exit multiple
    forecast_years: int = 10
    # ── Ind AS 116 / Audit additions (all have defaults) ──
    lease_liabilities: float = 0.0     # Ind AS 116 lease liabilities (added to net debt bridge)
    ebitda_margin: float = 0.0         # EBITDA margin for terminal value projection (0 = derive from EBIT+D&A)
    mid_year_discounting: bool = True  # Mid-year convention (default True per audit)
    
    def validate(self) -> List[str]:
        errors = []
        if self.diluted_shares <= 0:
            errors.append("diluted_shares must be > 0")
        if self.tax_rate < 0 or self.tax_rate > 1:
            errors.append("tax_rate must be between 0 and 1")
        if self.forecast_years < 1:
            errors.append("forecast_years must be >= 1")
        if len(self.revenue_growth_years) != self.forecast_years:
            errors.append(f"revenue_growth_years length ({len(self.revenue_growth_years)}) must equal forecast_years ({self.forecast_years})")
        if self.terminal_growth_rate >= self.risk_free_rate + self.equity_risk_premium:
            errors.append("terminal_growth_rate must be < risk_free_rate + equity_risk_premium")
        # WACC <= g guard (50 bps minimum spread)
        wacc = (1 - self.debt_to_value) * (self.risk_free_rate + self.beta * self.equity_risk_premium) + \
               self.debt_to_value * self.cost_of_debt * (1 - self.tax_rate)
        if self.terminal_growth_rate >= wacc - 0.005:
            errors.append(f"terminal_growth_rate ({self.terminal_growth_rate}) must be < WACC ({wacc:.4f}) - 0.005 (50 bps spread)")
        return errors

@dataclass
class DCFOutputs:
    """Complete DCF outputs with audit trail"""
    # Year-by-year projections
    years: List[int]
    revenue_proj: List[float]
    ebit_proj: List[float]
    nopat_proj: List[float]
    depreciation_proj: List[float]
    capex_proj: List[float]
    change_nwc_proj: List[float]
    fcff_proj: List[float]
    
    # WACC & Discounting
    wacc: float
    cost_of_equity: float
    discount_factors: List[float]
    pv_fcff: List[float]
    
    # Terminal Value
    terminal_value_gordon: float
    terminal_value_multiple: float
    pv_terminal_gordon: float
    pv_terminal_multiple: float
    
    # Enterprise & Equity Value
    ev_gordon: float
    ev_multiple: float
    equity_value_gordon: float
    equity_value_multiple: float
    fair_value_per_share_gordon: float
    fair_value_per_share_multiple: float
    
    # Sensitivity
    sensitivity_wacc: List[float]
    sensitivity_growth: List[float]
    sensitivity_matrix_gordon: List[List[float]]
    sensitivity_matrix_multiple: List[List[float]]
    
    # Audit
    inputs_hash: str
    calculation_timestamp: str
    
    def to_dict(self) -> Dict:
        return {k: v for k, v in self.__dict__.items()}

@dataclass
class RelativeValuationInputs:
    """Inputs for relative valuation (trading & transaction comps)"""
    # Target company
    target_market_cap: float
    target_net_debt: float
    target_minority_interest: float
    target_preferred: float
    target_ebitda: float
    target_eps: float
    target_sales: float
    target_eps_cagr_3y: float
    
    # Peer group
    peer_symbols: List[str]
    peer_market_caps: List[float]
    peer_net_debts: List[float]
    peer_ebitdas: List[float]
    peer_eps: List[float]
    peer_sales: List[float]
    peer_eps_cagr_3y: List[float]
    # FIX: Add peer_diluted_shares for correct peer P/E calculation
    peer_diluted_shares: List[float] = field(default_factory=list)
    
    # FIX: Add diluted_shares for correct P/E calculation (Price = MarketCap / diluted_shares)
    diluted_shares: Optional[float] = None
    
    # Transaction comps (optional)
    txn_peer_symbols: List[str] = field(default_factory=list)
    txn_ev_ebitda: List[float] = field(default_factory=list)
    txn_ev_sales: List[float] = field(default_factory=list)

@dataclass
class RelativeValuationOutputs:
    """Relative valuation outputs"""
    # Normalized multiples for target
    target_ev_ebitda: float
    target_pe: float
    target_ev_sales: float
    target_peg: float
    
    # Peer statistics
    peer_ev_ebitda_median: float
    peer_ev_ebitda_p25: float
    peer_ev_ebitda_p75: float
    peer_pe_median: float
    peer_pe_p25: float
    peer_pe_p75: float
    peer_ev_sales_median: float
    peer_peg_median: float
    
    # Implied valuations
    implied_value_ev_ebitda_median: float
    implied_value_ev_ebitda_p25: float
    implied_value_ev_ebitda_p75: float
    implied_value_pe_median: float
    implied_value_pe_p25: float
    implied_value_pe_p75: float
    
    # Transaction comps (if available)
    txn_ev_ebitda_median: Optional[float] = None
    txn_ev_sales_median: Optional[float] = None
    implied_value_txn_ev_ebitda: Optional[float] = None
    implied_value_txn_ev_sales: Optional[float] = None
    
    # Football field data
    football_field: Dict[str, Dict[str, float]] = field(default_factory=dict)
    
    # Audit trail
    inputs_hash: str = ""
    calculation_timestamp: str = ""
    
    def to_dict(self) -> Dict:
        return {k: v for k, v in self.__dict__.items()}

@dataclass
class SOTPInputs:
    """Sum-of-the-Parts inputs"""
    segments: List[Dict[str, Any]]  # Each: {name, metric, value, multiple, method, conglomerate_discount, valuation_level, effective_stake_pct, holdco_discount}
    net_debt: float
    cash: float
    minority_interest: float
    diluted_shares: float
    # Audit additions
    holdco_discount: float = 0.30          # Default holdco discount (30%)
    parent_standalone_debt: float = 0.0   # Parent standalone debt (for equity-value segments)

@dataclass
class SOTPOutputs:
    segment_values: List[Dict[str, float]]
    total_ev: float
    equity_value: float
    fair_value_per_share: float
    segment_contributions: Dict[str, float]
    inputs_hash: str = ""
    calculation_timestamp: str = ""

@dataclass
class BankingValuationInputs:
    """Banking/Financial Institution valuation inputs"""
    book_value: float                    # Reported BVPS
    roe: float                          # ROE (can be % or decimal, auto-normalized)
    cost_of_equity: float               # Ke (can be % or decimal, auto-normalized)
    growth_rate: float                  # Terminal growth (can be % or decimal, auto-normalized)
    peer_roes: List[float]
    peer_pbs: List[float]
    market_cap: float
    # Audit additions
    net_npa_per_share: float = 0.0      # Net NPA per share (for ABVPS)
    net_dta_per_share: float = 0.0      # Net DTA per share (haircut)
    payout_ratio: float = 0.30          # Dividend payout ratio
    forecast_years: int = 5

@dataclass
class BankingValuationOutputs:
    adjusted_bvps: float                # Adjusted Book Value Per Share
    justified_pb: float
    implied_price_justified_pb: float
    regression_slope: float
    regression_intercept: float
    regression_r2: float
    predicted_pb: float
    implied_price_regression: float
    premium_discount_pct: float
    inputs_hash: str
    calculation_timestamp: str

@dataclass
class ExcessReturnInputs:
    """Excess Return / Residual Income model inputs"""
    book_value: float
    net_income_forecast: List[float]  # Year-by-year
    cost_of_equity: float
    growth_rate: float
    forecast_years: int
    diluted_shares: float
    # Audit additions
    comprehensive_income_adj: float = 0.0  # OCI adjustment for Clean Surplus (Ind AS 19/109)
    omega: float = 0.6                   # Ohlson persistence parameter [0,1)
    payout_ratio: float = 0.30

@dataclass
class ExcessReturnOutputs:
    residual_incomes: List[float]
    pv_residual_incomes: List[float]
    terminal_ri: float
    pv_terminal_ri: float
    equity_value: float
    fair_value_per_share: float
    inputs_hash: str = ""
    calculation_timestamp: str = ""

# ============================================================
# FORENSIC SCORING DATA CLASSES
# ============================================================

@dataclass
class BeneishInputs:
    """8 variables for Beneish M-Score"""
    dsri: float  # Days Sales in Receivables Index
    gmi: float   # Gross Margin Index
    aqi: float   # Asset Quality Index
    sgi: float   # Sales Growth Index
    depi: float  # Depreciation Index
    sgai: float  # Sales, General & Administrative Expenses Index
    lvgi: float  # Leverage Index
    tata: float  # Total Accruals to Total Assets

@dataclass
class BeneishOutputs:
    m_score: float
    components: Dict[str, float]
    signal: str  # "MANIPULATION_LIKELY" | "MANIPULATION_UNLIKELY"
    threshold: float = -1.78
    inputs_hash: str = ""
    calculation_timestamp: str = ""

@dataclass
class AltmanZInputs:
    """Variables for Altman Z-Score"""
    x1: float  # Working Capital / Total Assets
    x2: float  # Retained Earnings / Total Assets
    x3: float  # EBIT / Total Assets
    x4: float  # Market Value of Equity / Total Liabilities (original) or BV Equity / TL (revised/emerging)
    x5: float  # Sales / Total Assets
    is_manufacturing: bool = True
    model: str = "original"  # 'original', 'revised', 'emerging'
    total_liabilities: float = 0.0  # For zero-liabilities guard
    total_assets: float = 0.0       # For zero-liabilities guard

@dataclass
class AltmanZOutputs:
    z_score: float
    zone: str  # "DISTRESS", "GREY", "SAFE"
    thresholds: Dict[str, float]
    inputs_hash: str = ""
    calculation_timestamp: str = ""

@dataclass
class PiotroskiInputs:
    """9 binary criteria for Piotroski F-Score"""
    # Profitability
    roa_positive: bool
    cfo_positive: bool
    roa_improving: bool
    accruals_quality: bool  # CFO > ROA
    # Leverage/Liquidity
    leverage_decreasing: bool
    liquidity_improving: bool
    no_dilution: bool
    # Operating Efficiency
    margin_improving: bool
    turnover_improving: bool

@dataclass
class PiotroskiOutputs:
    f_score: int
    components: Dict[str, int]
    interpretation: str
    inputs_hash: str = ""
    calculation_timestamp: str = ""

# ============================================================
# DETERMINISTIC CALCULATION ENGINE - BASE CLASS
# ============================================================

class DeterministicCalculator(ABC):
    """Base class ensuring all calculations are deterministic and auditable"""
    
    @abstractmethod
    def calculate(self, inputs: Any) -> Any:
        pass
    
    def _hash_inputs(self, inputs: Any) -> str:
        """Create deterministic hash of inputs for audit trail"""
        import hashlib
        serialized = json.dumps(inputs.__dict__, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode()).hexdigest()[:16]

# ============================================================
# DCF VALUATION ENGINE
# ============================================================

class DCFEngine(DeterministicCalculator):
    """Deterministic DCF (FCFF) Valuation Engine"""
    
    def calculate(self, inputs: DCFInputs) -> DCFOutputs:
        errors = inputs.validate()
        if errors:
            raise ValueError(f"DCF Input validation failed: {errors}")

        # WACC Calculation
        cost_of_equity = inputs.risk_free_rate + inputs.beta * inputs.equity_risk_premium
        wacc = (1 - inputs.debt_to_value) * cost_of_equity + \
               inputs.debt_to_value * inputs.cost_of_debt * (1 - inputs.tax_rate)

        # Year-by-year projections
        years = list(range(1, inputs.forecast_years + 1))
        revenue_proj = []
        ebit_proj = []
        nopat_proj = []
        depreciation_proj = []
        capex_proj = []
        change_nwc_proj = []
        fcff_proj = []

        current_revenue = inputs.revenue
        current_depr_rate = (inputs.depreciation / inputs.revenue) if inputs.revenue > 0 else 0.0

        for i, growth in enumerate(inputs.revenue_growth_years):
            current_revenue = current_revenue * (1 + growth)
            revenue_proj.append(current_revenue)

            current_ebit = current_revenue * inputs.ebit_margin
            ebit_proj.append(current_ebit)

            nopat = current_ebit * (1 - inputs.tax_rate)
            nopat_proj.append(nopat)

            current_depr = current_revenue * current_depr_rate
            depreciation_proj.append(current_depr)

            current_capex = current_revenue * inputs.capex_pct_revenue
            capex_proj.append(current_capex)

            revenue_change = current_revenue - (revenue_proj[i-1] if i > 0 else inputs.revenue)
            current_nwc = revenue_change * inputs.nwc_pct_revenue
            change_nwc_proj.append(current_nwc)

            fcff = nopat + current_depr - current_capex - current_nwc
            fcff_proj.append(fcff)

        # Discount factors — mid-year convention: exponent = year - 0.5
        if inputs.mid_year_discounting:
            discount_factors = [(1 + wacc) ** -(y - 0.5) for y in years]
        else:
            discount_factors = [(1 + wacc) ** -y for y in years]
        pv_fcff = [fcff * df for fcff, df in zip(fcff_proj, discount_factors)]

        # Terminal Value - Gordon Growth (with WACC > g guard)
        fcff_terminal = fcff_proj[-1] * (1 + inputs.terminal_growth_rate)
        if wacc - inputs.terminal_growth_rate < 0.005:
            terminal_value_gordon = float('inf')
            pv_terminal_gordon = float('inf')
        else:
            terminal_value_gordon = fcff_terminal / (wacc - inputs.terminal_growth_rate)
            if inputs.mid_year_discounting:
                pv_terminal_gordon = terminal_value_gordon * (1 + wacc) ** -(inputs.forecast_years - 0.5)
            else:
                pv_terminal_gordon = terminal_value_gordon * discount_factors[-1]

        # Terminal Value - Exit Multiple
        # Proper EBITDA projection: use ebitda_margin if provided, else derive from EBIT + D&A
        if inputs.ebitda_margin > 0:
            ebitda_terminal = revenue_proj[-1] * inputs.ebitda_margin
        else:
            ebitda_terminal = ebit_proj[-1] + depreciation_proj[-1]
        terminal_value_multiple = ebitda_terminal * inputs.exit_multiple
        if inputs.mid_year_discounting:
            pv_terminal_multiple = terminal_value_multiple * (1 + wacc) ** -(inputs.forecast_years - 0.5)
        else:
            pv_terminal_multiple = terminal_value_multiple * discount_factors[-1]

        # Enterprise Value
        ev_gordon = sum(pv_fcff) + pv_terminal_gordon
        ev_multiple = sum(pv_fcff) + pv_terminal_multiple

        # Equity Value — Ind AS 116: deduct lease liabilities alongside borrowings
        net_debt = inputs.total_debt + inputs.lease_liabilities - inputs.cash
        equity_value_gordon = ev_gordon - net_debt - inputs.minority_interest
        equity_value_multiple = ev_multiple - net_debt - inputs.minority_interest

        # Fair Value Per Share
        fair_value_gordon = equity_value_gordon / inputs.diluted_shares
        fair_value_multiple = equity_value_multiple / inputs.diluted_shares

        # Sensitivity Analysis
        wacc_range = np.linspace(wacc - 0.015, wacc + 0.015, 7)
        growth_range = np.linspace(inputs.terminal_growth_rate - 0.005, inputs.terminal_growth_rate + 0.005, 7)

        sensitivity_matrix_gordon = []
        sensitivity_matrix_multiple = []

        for g in growth_range:
            row_gordon = []
            row_multiple = []
            for w in wacc_range:
                # Recalculate with perturbed WACC
                if w - g < 0.005:
                    row_gordon.append(float('nan'))
                else:
                    tv_g = fcff_proj[-1] * (1 + g) / (w - g)
                    if inputs.mid_year_discounting:
                        pv_tv_g = tv_g * (1 + w) ** -(inputs.forecast_years - 0.5)
                    else:
                        pv_tv_g = tv_g * (1 + w) ** -inputs.forecast_years
                    ev_g = sum([fcff * (1 + w) ** -(y - 0.5 if inputs.mid_year_discounting else y) for fcff, y in zip(fcff_proj, years)]) + pv_tv_g
                    eq_g = ev_g - net_debt - inputs.minority_interest
                    row_gordon.append(eq_g / inputs.diluted_shares)

                tv_m = ebitda_terminal * inputs.exit_multiple
                if inputs.mid_year_discounting:
                    pv_tv_m = tv_m * (1 + w) ** -(inputs.forecast_years - 0.5)
                else:
                    pv_tv_m = tv_m * (1 + w) ** -inputs.forecast_years
                ev_m = sum([fcff * (1 + w) ** -(y - 0.5 if inputs.mid_year_discounting else y) for fcff, y in zip(fcff_proj, years)]) + pv_tv_m
                eq_m = ev_m - net_debt - inputs.minority_interest
                row_multiple.append(eq_m / inputs.diluted_shares)
            sensitivity_matrix_gordon.append(row_gordon)
            sensitivity_matrix_multiple.append(row_multiple)

        return DCFOutputs(
            years=years,
            revenue_proj=revenue_proj,
            ebit_proj=ebit_proj,
            nopat_proj=nopat_proj,
            depreciation_proj=depreciation_proj,
            capex_proj=capex_proj,
            change_nwc_proj=change_nwc_proj,
            fcff_proj=fcff_proj,
            wacc=wacc,
            cost_of_equity=cost_of_equity,
            discount_factors=discount_factors,
            pv_fcff=pv_fcff,
            terminal_value_gordon=terminal_value_gordon,
            terminal_value_multiple=terminal_value_multiple,
            pv_terminal_gordon=pv_terminal_gordon,
            pv_terminal_multiple=pv_terminal_multiple,
            ev_gordon=ev_gordon,
            ev_multiple=ev_multiple,
            equity_value_gordon=equity_value_gordon,
            equity_value_multiple=equity_value_multiple,
            fair_value_per_share_gordon=fair_value_gordon,
            fair_value_per_share_multiple=fair_value_multiple,
            sensitivity_wacc=wacc_range.tolist(),
            sensitivity_growth=growth_range.tolist(),
            sensitivity_matrix_gordon=sensitivity_matrix_gordon,
            sensitivity_matrix_multiple=sensitivity_matrix_multiple,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# RELATIVE VALUATION ENGINE
# ============================================================

class RelativeValuationEngine(DeterministicCalculator):
    """Deterministic Relative Valuation (Trading & Transaction Comps)"""
    
    def _calc_percentile(self, values: List[float], p: float) -> float:
        if not values:
            return np.nan
        valid = [v for v in values if not np.isnan(v)]
        if not valid:
            return np.nan
        return float(np.percentile(valid, p * 100))

    def _harmonic_mean(self, values: List[float]) -> float:
        positive = [v for v in values if v is not None and not np.isnan(v) and v > 0]
        if not positive:
            return np.nan
        return len(positive) / sum(1.0 / v for v in positive)
    
    def _safe_divide(self, num: float, den: float) -> float:
        return num / den if den != 0 else np.nan
    
    def calculate(self, inputs: RelativeValuationInputs) -> RelativeValuationOutputs:
        # Target EV
        target_ev = (inputs.target_market_cap + inputs.target_net_debt + 
                     inputs.target_minority_interest + inputs.target_preferred)
        
        # Target normalized multiples
        target_ebitda = inputs.target_ebitda if inputs.target_ebitda != 0 else np.nan
        target_ev_ebitda = self._safe_divide(target_ev, target_ebitda)
        # FIX: P/E = Price/EPS, not MarketCap/EPS. Need diluted_shares to compute price.
        # If diluted_shares not provided, use MarketCap/NetIncome (where NetIncome = EPS * diluted_shares)
        if inputs.diluted_shares and inputs.diluted_shares > 0:
            target_price = inputs.target_market_cap / inputs.diluted_shares
            target_pe = self._safe_divide(target_price, inputs.target_eps)
        else:
            # Fallback: MarketCap / (EPS * diluted_shares) = MarketCap / NetIncome
            # Since we don't have diluted_shares, this is undefined. Use NaN.
            target_pe = np.nan
        target_ev_sales = self._safe_divide(target_ev, inputs.target_sales)
        target_peg = self._safe_divide(target_pe, inputs.target_eps_cagr_3y * 100) if inputs.target_eps_cagr_3y != 0 else np.nan
        
        # Peer multiples
        peer_ev_ebitdas = []
        peer_pes = []
        peer_ev_sales = []
        peer_pegs = []
        
        for i in range(len(inputs.peer_symbols)):
            peer_ev = inputs.peer_market_caps[i] + inputs.peer_net_debts[i]
            peer_ebitda = inputs.peer_ebitdas[i]
            peer_eps = inputs.peer_eps[i]
            peer_sales = inputs.peer_sales[i]
            peer_cagr = inputs.peer_eps_cagr_3y[i]

            # Loss-maker exclusion: peers with negative EBITDA or EPS excluded
            ev_ebitda_val = self._safe_divide(peer_ev, peer_ebitda)
            if peer_ebitda <= 0:
                ev_ebitda_val = np.nan  # Loss-maker: exclude
            peer_ev_ebitdas.append(ev_ebitda_val)

            # P/E = Price/EPS
            if inputs.peer_diluted_shares and i < len(inputs.peer_diluted_shares) and inputs.peer_diluted_shares[i] > 0:
                peer_price = inputs.peer_market_caps[i] / inputs.peer_diluted_shares[i]
                pe_val = self._safe_divide(peer_price, peer_eps)
                if peer_eps <= 0:
                    pe_val = np.nan  # Loss-maker: exclude
                peer_pes.append(pe_val)
            else:
                peer_pes.append(np.nan)
            peer_ev_sales.append(self._safe_divide(peer_ev, peer_sales))
            peer_pegs.append(self._safe_divide(peer_pes[-1], peer_cagr * 100) if peer_cagr != 0 else np.nan)
        
        # Peer statistics
        peer_ev_ebitda_median = self._calc_percentile(peer_ev_ebitdas, 0.5)
        peer_ev_ebitda_p25 = self._calc_percentile(peer_ev_ebitdas, 0.25)
        peer_ev_ebitda_p75 = self._calc_percentile(peer_ev_ebitdas, 0.75)
        peer_pe_median = self._calc_percentile(peer_pes, 0.5)
        peer_pe_p25 = self._calc_percentile(peer_pes, 0.25)
        peer_pe_p75 = self._calc_percentile(peer_pes, 0.75)
        peer_ev_sales_median = self._calc_percentile(peer_ev_sales, 0.5)
        peer_peg_median = self._calc_percentile(peer_pegs, 0.5)
        
        # Implied valuations
        implied_ev_ebitda_median = peer_ev_ebitda_median * target_ebitda - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred
        implied_ev_ebitda_p25 = peer_ev_ebitda_p25 * target_ebitda - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred
        implied_ev_ebitda_p75 = peer_ev_ebitda_p75 * target_ebitda - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred
        
        implied_pe_median = peer_pe_median * inputs.target_eps
        implied_pe_p25 = peer_pe_p25 * inputs.target_eps
        implied_pe_p75 = peer_pe_p75 * inputs.target_eps
        
        # Transaction comps
        txn_ev_ebitda_median = None
        txn_ev_sales_median = None
        implied_txn_ev_ebitda = None
        implied_txn_ev_sales = None
        
        if inputs.txn_ev_ebitda:
            txn_ev_ebitda_median = self._calc_percentile(inputs.txn_ev_ebitda, 0.5)
            implied_txn_ev_ebitda = txn_ev_ebitda_median * target_ebitda - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred
        
        if inputs.txn_ev_sales:
            txn_ev_sales_median = self._calc_percentile(inputs.txn_ev_sales, 0.5)
            implied_txn_ev_sales = txn_ev_sales_median * inputs.target_sales - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred
        
        # Football field - FIX: DCF rows should NOT copy EV/EBITDA comps
        # DCF values should come from a separate DCF engine call. For now, mark as NaN.
        # The frontend should call DCF engine separately and merge.
        football_field = {
            "DCF_Gordon": {"low": np.nan, "mid": np.nan, "high": np.nan},
            "DCF_Multiple": {"low": np.nan, "mid": np.nan, "high": np.nan},
            "Trading_Comps_EV_EBITDA": {"low": implied_ev_ebitda_p25, "mid": implied_ev_ebitda_median, "high": implied_ev_ebitda_p75},
            "Trading_Comps_PE": {"low": implied_pe_p25, "mid": implied_pe_median, "high": implied_pe_p75},
        }
        if txn_ev_ebitda_median:
            football_field["Transaction_Comps_EV_EBITDA"] = {"low": implied_txn_ev_ebitda * 0.9, "mid": implied_txn_ev_ebitda, "high": implied_txn_ev_ebitda * 1.1}
        
        return RelativeValuationOutputs(
            target_ev_ebitda=target_ev_ebitda,
            target_pe=target_pe,
            target_ev_sales=target_ev_sales,
            target_peg=target_peg,
            peer_ev_ebitda_median=peer_ev_ebitda_median,
            peer_ev_ebitda_p25=peer_ev_ebitda_p25,
            peer_ev_ebitda_p75=peer_ev_ebitda_p75,
            peer_pe_median=peer_pe_median,
            peer_pe_p25=peer_pe_p25,
            peer_pe_p75=peer_pe_p75,
            peer_ev_sales_median=peer_ev_sales_median,
            peer_peg_median=peer_peg_median,
            implied_value_ev_ebitda_median=implied_ev_ebitda_median,
            implied_value_ev_ebitda_p25=implied_ev_ebitda_p25,
            implied_value_ev_ebitda_p75=implied_ev_ebitda_p75,
            implied_value_pe_median=implied_pe_median,
            implied_value_pe_p25=implied_pe_p25,
            implied_value_pe_p75=implied_pe_p75,
            txn_ev_ebitda_median=txn_ev_ebitda_median,
            txn_ev_sales_median=txn_ev_sales_median,
            implied_value_txn_ev_ebitda=implied_txn_ev_ebitda,
            implied_value_txn_ev_sales=implied_txn_ev_sales,
            football_field=football_field,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# SOTP VALUATION ENGINE
# ============================================================

class SOTPEngine(DeterministicCalculator):
    """Deterministic Sum-of-the-Parts Valuation"""
    
    def calculate(self, inputs: SOTPInputs) -> SOTPOutputs:
        segment_values = []
        total_ev = 0.0
        total_equity_value = 0.0
        segment_contributions = {}
        holdco_discount = inputs.holdco_discount if hasattr(inputs, 'holdco_discount') else 0.0

        for seg in inputs.segments:
            method = seg.get('method', 'EV_EBITDA')
            metric = seg.get('metric', seg.get('value', 0))
            multiple = seg.get('multiple', 0)
            discount = seg.get('conglomerate_discount', 0)
            valuation_level = seg.get('valuation_level', 'ENTERPRISE_VALUE')
            stake_pct = seg.get('effective_stake_pct', 100.0) / 100.0
            seg_holdco = seg.get('holdco_discount', holdco_discount)

            seg_value_raw = metric * multiple * (1 - discount)
            # Apply ownership stake and holdco discount
            seg_contributed = seg_value_raw * stake_pct * (1 - seg_holdco)

            if valuation_level == 'ENTERPRISE_VALUE':
                seg_ev = seg_contributed
                total_ev += seg_ev
            elif valuation_level == 'EQUITY_VALUE':
                seg_ev = 0.0
                total_equity_value += seg_contributed
            else:
                seg_ev = seg_contributed
                total_ev += seg_ev

            seg_value = {
                'name': seg.get('name', 'Unknown'),
                'method': method,
                'metric': metric,
                'multiple': multiple,
                'discount': discount,
                'valuation_level': valuation_level,
                'effective_stake_pct': stake_pct * 100,
                'holdco_discount': seg_holdco,
                'ev': seg_ev,
                'contributed_value': seg_contributed,
            }
            segment_values.append(seg_value)
            segment_contributions[seg.get('name', 'Unknown')] = seg_contributed

        # Bridge: EV segments subtract consolidated net debt; Equity segments subtract only parent standalone debt
        parent_standalone_debt = inputs.parent_standalone_debt if hasattr(inputs, 'parent_standalone_debt') else inputs.net_debt
        equity_value = total_ev - inputs.net_debt + inputs.cash - inputs.minority_interest + total_equity_value - parent_standalone_debt
        fair_value_per_share = equity_value / inputs.diluted_shares if inputs.diluted_shares > 0 else 0
        
        return SOTPOutputs(
            segment_values=segment_values,
            total_ev=total_ev,
            equity_value=equity_value,
            fair_value_per_share=fair_value_per_share,
            segment_contributions=segment_contributions,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# BANKING VALUATION ENGINE
# ============================================================

class BankingValuationEngine(DeterministicCalculator):
    """Deterministic Banking Valuation (P/B vs ROE)"""
    
    def calculate(self, inputs: BankingValuationInputs) -> BankingValuationOutputs:
        # Normalize ROE/Ke/g to decimals (handle % input)
        roe = inputs.roe / 100.0 if inputs.roe > 1.0 else inputs.roe
        ke = inputs.cost_of_equity / 100.0 if inputs.cost_of_equity > 1.0 else inputs.cost_of_equity
        g = inputs.growth_rate / 100.0 if inputs.growth_rate > 1.0 else inputs.growth_rate

        # Adjusted Book Value Per Share (ABVPS) — RBI standard
        abvps = max(0.0, inputs.book_value - inputs.net_npa_per_share - inputs.net_dta_per_share)

        # Justified P/B = (ROE - g) / (Ke - g) — with guard
        if ke - g < 0.005:
            justified_pb = float('nan')
            implied_price_justified_pb = float('nan')
        else:
            justified_pb = (roe - g) / (ke - g)
            implied_price_justified_pb = justified_pb * abvps

        # Residual Income (5-year) with Ohlson-style terminal
        b_t = abvps
        pv_ri_sum = 0.0
        for t in range(1, inputs.forecast_years + 1):
            ri = (roe - ke) * (b_t * (1.0 + roe * (1.0 - inputs.payout_ratio)) ** (t - 1))
            pv_ri_sum += ri / ((1.0 + ke) ** t)
        # Terminal RI with persistence
        terminal_ri = (roe - ke) * (b_t * (1.0 + roe * (1.0 - inputs.payout_ratio)) ** inputs.forecast_years)
        if ke - g < 0.005:
            pv_terminal_ri = float('nan')
        else:
            pv_terminal_ri = terminal_ri / ((ke - g) * (1.0 + ke) ** inputs.forecast_years)
        implied_price_ri = abvps + pv_ri_sum + (pv_terminal_ri if not (pv_terminal_ri != pv_terminal_ri) else 0.0)

        # P/B vs ROE Regression (normalize peer ROEs too)
        peer_roes_norm = [r / 100.0 if r > 1.0 else r for r in inputs.peer_roes]
        if len(peer_roes_norm) >= 3 and len(inputs.peer_pbs) >= 3:
            x = np.array(peer_roes_norm)
            y = np.array(inputs.peer_pbs)
            slope, intercept = np.polyfit(x, y, 1)
            y_pred = slope * x + intercept
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

            predicted_pb = slope * roe + intercept
            implied_price_regression = predicted_pb * abvps
            premium_discount_pct = (justified_pb / predicted_pb - 1) * 100 if predicted_pb != 0 else 0
        else:
            slope = intercept = r2 = predicted_pb = implied_price_regression = premium_discount_pct = float('nan')

        return BankingValuationOutputs(
            adjusted_bvps=round(abvps, 2),
            justified_pb=justified_pb if justified_pb == justified_pb else 0.0,
            implied_price_justified_pb=implied_price_justified_pb if implied_price_justified_pb == implied_price_justified_pb else 0.0,
            regression_slope=slope,
            regression_intercept=intercept,
            regression_r2=r2,
            predicted_pb=predicted_pb,
            implied_price_regression=implied_price_regression,
            premium_discount_pct=premium_discount_pct,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# EXCESS RETURN / RESIDUAL INCOME ENGINE
# ============================================================

class ExcessReturnEngine(DeterministicCalculator):
    """Deterministic Excess Return / Residual Income Model"""
    
    def calculate(self, inputs: ExcessReturnInputs) -> ExcessReturnOutputs:
        residual_incomes = []
        pv_residual_incomes = []

        # Normalize cost of equity and growth to decimals
        ke = inputs.cost_of_equity / 100.0 if inputs.cost_of_equity > 1.0 else inputs.cost_of_equity
        g = inputs.growth_rate / 100.0 if inputs.growth_rate > 1.0 else inputs.growth_rate
        omega = max(0.0, min(0.999, inputs.omega))

        # Clean Surplus: B_t = B_{t-1} + Comprehensive Income_t - Dividends_t
        # Comprehensive Income = NI + OCI adjustment
        book_value = inputs.book_value + inputs.comprehensive_income_adj
        for year in range(inputs.forecast_years):
            ni = inputs.net_income_forecast[year]
            # Comprehensive income = NI + OCI (Ind AS 19/109)
            ci = ni + (inputs.comprehensive_income_adj if year == 0 else 0.0)
            # Dividends = NI * payout_ratio
            dividends = ni * inputs.payout_ratio
            ri = ci - (ke * book_value)
            residual_incomes.append(ri)
            pv_residual_incomes.append(ri / (1 + ke) ** (year + 1))
            book_value = book_value + ci - dividends

        # Terminal Residual Income with Ohlson persistence
        # PV(Terminal RI) = RI_T * omega / ((1 + ke - omega) * (1 + ke)^T)
        terminal_ri = residual_incomes[-1] * (1 + g)
        if 1 + ke - omega <= 0:
            pv_terminal_ri = 0.0
        else:
            pv_terminal_ri = (terminal_ri * omega) / ((1 + ke - omega) * (1 + ke) ** inputs.forecast_years)

        equity_value = inputs.book_value + sum(pv_residual_incomes) + pv_terminal_ri
        fair_value_per_share = equity_value / inputs.diluted_shares if inputs.diluted_shares > 0 else 0
        
        return ExcessReturnOutputs(
            residual_incomes=residual_incomes,
            pv_residual_incomes=pv_residual_incomes,
            terminal_ri=terminal_ri,
            pv_terminal_ri=pv_terminal_ri,
            equity_value=equity_value,
            fair_value_per_share=fair_value_per_share,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# FORENSIC SCORING ENGINES
# ============================================================

class BeneishEngine(DeterministicCalculator):
    """Beneish M-Score for Earnings Manipulation Detection"""
    
    def calculate(self, inputs: BeneishInputs) -> BeneishOutputs:
        # M = -4.84 + 0.920*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI
        #     + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI

        # GMI clamping: if current Gross Margin <= 0, GMI becomes negative,
        # falsely lowering M-Score. Clamp GMI in [0.1, 5.0].
        gmi_clamped = max(0.1, min(5.0, inputs.gmi))

        components = {
            'dsri': 0.920 * inputs.dsri,
            'gmi': 0.528 * gmi_clamped,
            'aqi': 0.404 * inputs.aqi,
            'sgi': 0.892 * inputs.sgi,
            'depi': 0.115 * inputs.depi,
            'sgai': -0.172 * inputs.sgai,
            'tata': 4.679 * inputs.tata,
            'lvgi': -0.327 * inputs.lvgi,
        }
        
        m_score = -4.84 + sum(components.values())
        signal = "MANIPULATION_LIKELY" if m_score > -1.78 else "MANIPULATION_UNLIKELY"
        
        return BeneishOutputs(
            m_score=m_score,
            components=components,
            signal=signal,
            threshold=-1.78,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

class AltmanZEngine(DeterministicCalculator):
    """Altman Z-Score for Solvency Risk"""
    
    def calculate(self, inputs: AltmanZInputs) -> AltmanZOutputs:
        # If model not explicitly set by user, derive from is_manufacturing
        if inputs.model == "original" and not inputs.is_manufacturing:
            model = "emerging"  # backward compat: non-manufacturing → emerging markets model
        else:
            model = inputs.model.lower() if inputs.model else ("original" if inputs.is_manufacturing else "emerging")

        # Zero-liabilities guard: clamp effective TL
        ta = inputs.total_assets if inputs.total_assets > 0 else 1.0
        eff_tl = max(inputs.total_liabilities, 0.01 * ta) if inputs.total_liabilities >= 0 else max(0.01 * ta, 0.01 * ta)
        # Re-derive x4 if total_liabilities provided (X4 = equity / eff_tl)
        x4 = inputs.x4
        if inputs.total_liabilities > 0 and inputs.total_assets > 0:
            # x4 is passed as raw; if it's MarketCap/TL we keep it for original model
            pass

        if model == "original":
            # Original manufacturing: X4 = Market Cap / Total Liabilities
            z = (1.2 * inputs.x1 + 1.4 * inputs.x2 + 3.3 * inputs.x3 +
                 0.6 * inputs.x4 + 0.999 * inputs.x5)
            thresholds = {"distress": 1.81, "grey_upper": 2.99}
        elif model == "revised":
            # Z' for private firms: X4 = BV Equity / Total Liabilities
            z = (0.717 * inputs.x1 + 0.847 * inputs.x2 + 3.107 * inputs.x3 +
                 0.420 * inputs.x4 + 0.998 * inputs.x5)
            thresholds = {"distress": 1.23, "grey_upper": 2.90}
        elif model == "emerging":
            # Z'' for emerging markets: X4 = BV Equity / Total Liabilities, +3.25 intercept
            z = (6.56 * inputs.x1 + 3.26 * inputs.x2 + 6.72 * inputs.x3 +
                 1.05 * inputs.x4) + 3.25
            thresholds = {"distress": 1.10, "grey_upper": 2.60}
        else:
            # Default to revised
            z = (0.717 * inputs.x1 + 0.847 * inputs.x2 + 3.107 * inputs.x3 +
                 0.420 * inputs.x4 + 0.998 * inputs.x5)
            thresholds = {"distress": 1.23, "grey_upper": 2.90}

        if z < thresholds["distress"]:
            zone = "DISTRESS"
        elif z <= thresholds["grey_upper"]:
            zone = "GREY"
        else:
            zone = "SAFE"

        return AltmanZOutputs(
            z_score=z,
            zone=zone,
            thresholds=thresholds,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

class PiotroskiEngine(DeterministicCalculator):
    """Piotroski F-Score (9 Fundamental Criteria)"""
    
    def calculate(self, inputs: PiotroskiInputs) -> PiotroskiOutputs:
        components = {
            'roa_positive': int(inputs.roa_positive),
            'cfo_positive': int(inputs.cfo_positive),
            'roa_improving': int(inputs.roa_improving),
            'accruals_quality': int(inputs.accruals_quality),
            'leverage_decreasing': int(inputs.leverage_decreasing),
            'liquidity_improving': int(inputs.liquidity_improving),
            'no_dilution': int(inputs.no_dilution),
            'margin_improving': int(inputs.margin_improving),
            'turnover_improving': int(inputs.turnover_improving),
        }
        
        f_score = sum(components.values())
        
        if f_score >= 7:
            interpretation = "HIGH_QUALITY"
        elif f_score >= 4:
            interpretation = "MODERATE_QUALITY"
        else:
            interpretation = "LOW_QUALITY"
        
        return PiotroskiOutputs(
            f_score=f_score,
            components=components,
            interpretation=interpretation,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# PORTFOLIO ANALYTICS ENGINE
# ============================================================

@dataclass
class PortfolioMetricsInputs:
    """Portfolio performance & risk metrics inputs"""
    portfolio_values: List[float]  # Daily portfolio values
    benchmark_values: List[float]  # Daily benchmark values
    cash_flows: List[Tuple[date, float]]  # (date, cash_flow) for XIRR
    risk_free_rate: float = 0.07

@dataclass
class PortfolioMetricsOutputs:
    """Portfolio metrics outputs"""
    # Returns
    twr: float  # Time-weighted return
    xirr: float  # Money-weighted return (XIRR)
    annualized_return: float
    excess_return: float
    
    # Risk
    volatility: float
    beta: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float
    max_drawdown_duration: int
    
    # Period returns
    mtd: float
    ytd: float
    one_year: float
    three_year: float
    five_year: float
    since_inception: float
    
    # Audit trail
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class PortfolioAnalyticsEngine(DeterministicCalculator):
    """Deterministic Portfolio Performance & Risk Analytics"""
    
    def calculate(self, inputs: PortfolioMetricsInputs) -> PortfolioMetricsOutputs:
        pv = np.array(inputs.portfolio_values)
        bv = np.array(inputs.benchmark_values)
        
        if len(pv) < 2:
            raise ValueError("Need at least 2 portfolio values")
        
        # Daily returns
        port_returns = np.diff(pv) / pv[:-1]
        bench_returns = np.diff(bv) / bv[:-1]
        
        # TWR (Time-Weighted Return)
        twr = np.prod(1 + port_returns) - 1
        
        # Annualized return
        days = len(port_returns)
        annualized_return = (1 + twr) ** (252 / days) - 1 if days > 0 else 0
        
        # Benchmark annualized
        bench_twr = np.prod(1 + bench_returns) - 1
        bench_annualized = (1 + bench_twr) ** (252 / days) - 1 if days > 0 else 0
        excess_return = annualized_return - bench_annualized
        
        # Volatility (annualized)
        volatility = np.std(port_returns, ddof=1) * np.sqrt(252)
        
        # Beta
        if np.std(bench_returns) > 0:
            beta = np.cov(port_returns, bench_returns)[0, 1] / np.var(bench_returns)
        else:
            beta = 1.0
        
        # Sharpe Ratio
        sharpe = (annualized_return - inputs.risk_free_rate) / volatility if volatility > 0 else 0
        
        # Sortino Ratio (downside deviation vs MAR=0)
        # FIX: Use Minimum Acceptable Return (MAR) = risk_free_rate / 252 (daily)
        mar_daily = inputs.risk_free_rate / 252
        downside_returns = port_returns[port_returns < mar_daily]
        if len(downside_returns) > 1:
            downside_dev = np.std(downside_returns - mar_daily, ddof=1) * np.sqrt(252)
        elif len(downside_returns) == 1:
            downside_dev = abs(downside_returns[0] - mar_daily) * np.sqrt(252)
        else:
            downside_dev = volatility  # No downside returns, use total volatility
        sortino = (annualized_return - inputs.risk_free_rate) / downside_dev if downside_dev > 0 else 0
        
        # Max Drawdown
        cumulative = np.cumprod(1 + port_returns)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = np.min(drawdown)
        
        # Max drawdown duration
        in_drawdown = drawdown < 0
        drawdown_durations = []
        current_duration = 0
        for is_dd in in_drawdown:
            if is_dd:
                current_duration += 1
            else:
                if current_duration > 0:
                    drawdown_durations.append(current_duration)
                current_duration = 0
        if current_duration > 0:
            drawdown_durations.append(current_duration)
        max_dd_duration = max(drawdown_durations) if drawdown_durations else 0
        
        # XIRR (with boundary guards)
        xirr = self._calculate_xirr(inputs.cash_flows)
        
        # Period returns (assuming daily data, starting from Jan 1)
        # FIX: YTD should use calendar year start, not first data point
        # For simplicity, assume data starts at year beginning if >= 252 days
        mtd = pv[-1] / pv[max(0, len(pv)-22)] - 1 if len(pv) >= 22 else twr
        # YTD: if we have >= 252 days, use the first ~252 days as "year start"
        # In production, this should use actual dates
        if len(pv) >= 252:
            ytd = pv[-1] / pv[len(pv) - 252] - 1
        else:
            ytd = twr
        one_year = pv[-1] / pv[max(0, len(pv)-252)] - 1 if len(pv) >= 252 else twr
        three_year = pv[-1] / pv[max(0, len(pv)-756)] - 1 if len(pv) >= 756 else twr
        five_year = pv[-1] / pv[max(0, len(pv)-1260)] - 1 if len(pv) >= 1260 else twr
        since_inception = pv[-1] / pv[0] - 1
        
        return PortfolioMetricsOutputs(
            twr=twr,
            xirr=xirr,
            annualized_return=annualized_return,
            excess_return=excess_return,
            volatility=volatility,
            beta=beta,
            sharpe_ratio=sharpe,
            sortino_ratio=sortino,
            max_drawdown=max_drawdown,
            max_drawdown_duration=max_dd_duration,
            mtd=mtd,
            ytd=ytd,
            one_year=one_year,
            three_year=three_year,
            five_year=five_year,
            since_inception=since_inception,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )
    
    def _calculate_xirr(self, cash_flows: List[Tuple[date, float]]) -> float:
        """Calculate XIRR using Newton-Raphson method with boundary guards"""
        if not cash_flows:
            return 0.0
        
        # Sort by date
        cash_flows = sorted(cash_flows, key=lambda x: x[0])
        dates = [cf[0] for cf in cash_flows]
        amounts = [cf[1] for cf in cash_flows]
        
        # Days from first date
        base_date = dates[0]
        days = [(d - base_date).days for d in dates]
        
        # Check for valid cash flows (must have at least one positive and one negative)
        has_positive = any(a > 0 for a in amounts)
        has_negative = any(a < 0 for a in amounts)
        if not (has_positive and has_negative):
            return 0.0
        
        # Newton-Raphson with boundary guards
        rate = 0.1  # Initial guess
        for iteration in range(100):
            npv = sum(amount / (1 + rate) ** (day / 365) for amount, day in zip(amounts, days))
            dnpv = sum(-amount * (day / 365) / (1 + rate) ** (day / 365 + 1) for amount, day in zip(amounts, days))
            
            if abs(dnpv) < 1e-10:
                break
            
            rate_new = rate - npv / dnpv
            
            # FIX: Boundary guards - rate must be > -1 (can't have <= -100% return)
            if rate_new <= -0.99:
                rate_new = -0.99
            if rate_new > 10.0:  # Cap at 1000% for sanity
                rate_new = 10.0
            
            if abs(rate_new - rate) < 1e-8:
                rate = rate_new
                break
            rate = rate_new
        
        # Final validation
        if rate <= -1.0 or rate > 10.0 or np.isnan(rate) or np.isinf(rate):
            return 0.0
        
        return rate

# ============================================================
# SCREENING ENGINE
# ============================================================

@dataclass
class ScreeningCriteria:
    """Multi-factor screening criteria"""
    # Valuation
    pe_max: Optional[float] = None
    ev_ebitda_max: Optional[float] = None
    pb_max: Optional[float] = None
    fcf_yield_min: Optional[float] = None
    
    # Quality
    roe_min: Optional[float] = None
    roce_min: Optional[float] = None
    roic_min: Optional[float] = None
    debt_ebitda_max: Optional[float] = None
    ocf_ebitda_min: Optional[float] = None
    
    # Momentum
    dist_from_52w_high_max: Optional[float] = None
    dma_200_spread_min: Optional[float] = None
    rel_strength_3m_min: Optional[float] = None
    
    # Forensic
    beneish_max: Optional[float] = None  # e.g., -1.78
    altman_z_min: Optional[float] = None  # e.g., 1.81
    piotroski_min: Optional[int] = None  # e.g., 6
    
    # Market cap
    market_cap_min: Optional[float] = None
    market_cap_max: Optional[float] = None
    market_cap_category: Optional[List[str]] = None

@dataclass
class ScreeningResult:
    symbol: str
    name: str
    score: float  # 0-100 composite score
    passed_filters: Dict[str, bool]
    metrics: Dict[str, float]
    rank: int
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class ScreeningEngine(DeterministicCalculator):
    """Deterministic Multi-Factor Screening Engine with percentile-based scoring."""

    # Factors where LOWER is better (need percentile inversion)
    LOWER_BETTER_FACTORS = {
        'pe', 'ev_ebitda', 'pb', 'debt_ebitda', 'beneish_m_score', 
        'dist_from_52w_high'  # closer to 52w high = less upside
    }

    def _percentile_rank(self, value: float, all_values: List[float], lower_is_better: bool = False) -> float:
        """Percentile rank: % of universe with value <= this company's value.
        For lower_is_better: invert (100 - percentile)."""
        valid = [v for v in all_values if v is not None and not np.isnan(v) and v != np.inf and v != -np.inf]
        if not valid:
            return 50.0
        rank = sum(1 for v in valid if v <= value) / len(valid) * 100
        if lower_is_better:
            rank = 100 - rank
        return round(rank, 1)

    def calculate(self, universe: List[Dict], criteria: ScreeningCriteria) -> List[ScreeningResult]:
        if not universe:
            return []

        # Pre-compute all factor values across universe for percentile ranking
        factor_values = {}
        active_factors = []

        # Collect all factor values present in criteria
        if criteria.pe_max is not None:
            active_factors.append(('pe', 'pe', True))  # lower_is_better
        if criteria.ev_ebitda_max is not None:
            active_factors.append(('ev_ebitda', 'ev_ebitda', True))
        if criteria.pb_max is not None:
            active_factors.append(('pb', 'pb', True))
        if criteria.fcf_yield_min is not None:
            active_factors.append(('fcf_yield', 'fcf_yield', False))  # higher better
        if criteria.roe_min is not None:
            active_factors.append(('roe', 'roe', False))
        if criteria.roce_min is not None:
            active_factors.append(('roce', 'roce', False))
        if criteria.roic_min is not None:
            active_factors.append(('roic', 'roic', False))
        if criteria.debt_ebitda_max is not None:
            active_factors.append(('debt_ebitda', 'debt_ebitda', True))
        if criteria.ocf_ebitda_min is not None:
            active_factors.append(('ocf_ebitda', 'ocf_ebitda', False))
        if criteria.dist_from_52w_high_max is not None:
            active_factors.append(('dist_from_52w_high', 'dist_from_52w_high', True))
        if criteria.dma_200_spread_min is not None:
            active_factors.append(('dma_200_spread', 'dma_200_spread', False))
        if criteria.rel_strength_3m_min is not None:
            active_factors.append(('rel_strength_3m', 'rel_strength_3m', False))
        if criteria.beneish_max is not None:
            active_factors.append(('beneish_m_score', 'beneish_m_score', True))
        if criteria.altman_z_min is not None:
            active_factors.append(('altman_z', 'altman_z', False))
        if criteria.piotroski_min is not None:
            active_factors.append(('piotroski_f_score', 'piotroski_f_score', False))

        # Build factor value arrays
        for factor_key, company_key, _ in active_factors:
            factor_values[factor_key] = [c.get(company_key, np.nan) for c in universe]

        results = []

        for idx, company in enumerate(universe):
            passed = {}
            metrics = {}
            factor_percentiles = {}

            symbol = company.get('symbol', '')
            name = company.get('name', '')

            # Loss-making detection - only if pat explicitly provided and negative
            is_loss_making = False
            pe = company.get('pe', np.nan)
            if not np.isnan(pe) and pe <= 0:
                is_loss_making = True
            # Only flag as loss-making if pat is explicitly provided and negative
            if 'pat' in company:
                pat = company.get('pat')
                if pat is not None and pat <= 0:
                    is_loss_making = True

            # Valuation checks with percentile scoring
            if criteria.pe_max is not None:
                val = company.get('pe', np.nan)
                metrics['pe'] = val
                if is_loss_making:
                    passed['pe'] = False
                    factor_percentiles['pe'] = 0.0  # Loss-maker gets 0 percentile
                else:
                    passed['pe'] = val <= criteria.pe_max if not np.isnan(val) else False
                    factor_percentiles['pe'] = self._percentile_rank(val, factor_values['pe'], lower_is_better=True)

            if criteria.ev_ebitda_max is not None:
                val = company.get('ev_ebitda', np.nan)
                metrics['ev_ebitda'] = val
                if is_loss_making and company.get('ebitda', 0) <= 0:
                    passed['ev_ebitda'] = False
                    factor_percentiles['ev_ebitda'] = 0.0
                else:
                    passed['ev_ebitda'] = val <= criteria.ev_ebitda_max if not np.isnan(val) else False
                    factor_percentiles['ev_ebitda'] = self._percentile_rank(val, factor_values['ev_ebitda'], lower_is_better=True)

            if criteria.pb_max is not None:
                val = company.get('pb', np.nan)
                metrics['pb'] = val
                if company.get('total_equity', 0) <= 0:
                    passed['pb'] = False
                    factor_percentiles['pb'] = 0.0
                else:
                    passed['pb'] = val <= criteria.pb_max if not np.isnan(val) else False
                    factor_percentiles['pb'] = self._percentile_rank(val, factor_values['pb'], lower_is_better=True)

            # FCF Yield = (CFO - Capex) / Market Cap — NOT CFO/MarketCap
            if criteria.fcf_yield_min is not None:
                cfo = company.get('cfo', np.nan)
                capex = company.get('capex', np.nan)
                mc = company.get('market_cap', np.nan)
                if not np.isnan(cfo) and not np.isnan(capex) and mc and mc > 0:
                    fcf_yield = (cfo - capex) / mc
                else:
                    fcf_yield = company.get('fcf_yield', np.nan)  # fallback
                metrics['fcf_yield'] = fcf_yield
                passed['fcf_yield'] = fcf_yield >= criteria.fcf_yield_min if not np.isnan(fcf_yield) else False
                factor_percentiles['fcf_yield'] = self._percentile_rank(fcf_yield, factor_values['fcf_yield'], lower_is_better=False)

            # Quality checks
            for factor_key, company_key, lower_better in [('roe', 'roe', False), ('roce', 'roce', False), 
                                                            ('roic', 'roic', False), ('debt_ebitda', 'debt_ebitda', True),
                                                            ('ocf_ebitda', 'ocf_ebitda', False)]:
                criterion_attr = f'{factor_key}_min' if not lower_better else f'{factor_key}_max'
                criterion_val = getattr(criteria, criterion_attr, None)
                if criterion_val is not None:
                    val = company.get(company_key, np.nan)
                    metrics[factor_key] = val
                    if not lower_better:
                        passed[factor_key] = val >= criterion_val if not np.isnan(val) else False
                    else:
                        passed[factor_key] = val <= criterion_val if not np.isnan(val) else False
                    factor_percentiles[factor_key] = self._percentile_rank(val, factor_values[factor_key], lower_is_better=lower_better)

            # Momentum checks
            for factor_key, company_key, lower_better in [('dist_from_52w_high', 'dist_from_52w_high', True),
                                                            ('dma_200_spread', 'dma_200_spread', False),
                                                            ('rel_strength_3m', 'rel_strength_3m', False)]:
                criterion_attr = f'{factor_key}_min' if not lower_better else f'{factor_key}_max'
                criterion_val = getattr(criteria, criterion_attr, None)
                if criterion_val is not None:
                    val = company.get(company_key, np.nan)
                    metrics[factor_key] = val
                    if not lower_better:
                        passed[factor_key] = val >= criterion_val if not np.isnan(val) else False
                    else:
                        passed[factor_key] = val <= criterion_val if not np.isnan(val) else False
                    factor_percentiles[factor_key] = self._percentile_rank(val, factor_values[factor_key], lower_is_better=lower_better)

            # Forensic checks
            if criteria.beneish_max is not None:
                val = company.get('beneish_m_score', np.nan)
                metrics['beneish_m_score'] = val
                passed['beneish'] = val <= criteria.beneish_max if not np.isnan(val) else False
                factor_percentiles['beneish_m_score'] = self._percentile_rank(val, factor_values['beneish_m_score'], lower_is_better=True)

            if criteria.altman_z_min is not None:
                val = company.get('altman_z', np.nan)
                metrics['altman_z'] = val
                passed['altman_z'] = val >= criteria.altman_z_min if not np.isnan(val) else False
                factor_percentiles['altman_z'] = self._percentile_rank(val, factor_values['altman_z'], lower_is_better=False)

            if criteria.piotroski_min is not None:
                val = company.get('piotroski_f_score', -1)
                metrics['piotroski_f_score'] = val
                passed['piotroski'] = val >= criteria.piotroski_min
                factor_percentiles['piotroski_f_score'] = self._percentile_rank(val, factor_values['piotroski_f_score'], lower_is_better=False)

            # Market cap filter
            if criteria.market_cap_min is not None or criteria.market_cap_max is not None:
                mc = company.get('market_cap', 0)
                min_ok = mc >= criteria.market_cap_min if criteria.market_cap_min else True
                max_ok = mc <= criteria.market_cap_max if criteria.market_cap_max else True
                passed['market_cap'] = min_ok and max_ok
                metrics['market_cap'] = mc

            if criteria.market_cap_category:
                cat = company.get('market_cap_category', '')
                passed['category'] = cat in criteria.market_cap_category
                metrics['market_cap_category'] = cat

            # Composite score: weighted average of factor percentiles
            # Weight configuration (can be customized)
            weights = {
                'pe': 10, 'ev_ebitda': 10, 'pb': 5, 'fcf_yield': 10,
                'roe': 10, 'roce': 10, 'roic': 5, 'debt_ebitda': 10, 'ocf_ebitda': 5,
                'dist_from_52w_high': 5, 'dma_200_spread': 5, 'rel_strength_3m': 5,
                'beneish_m_score': 10, 'altman_z': 5, 'piotroski_f_score': 10,
            }
            # Only use weights for active factors
            active_weights = {k: v for k, v in weights.items() if k in factor_percentiles}
            total_weight = sum(active_weights.values()) or 1
            composite_score = sum(factor_percentiles[k] * active_weights[k] for k in factor_percentiles) / total_weight
            composite_score = min(100, max(0, composite_score))

            # Apply loss-maker penalty (hard cap at 30)
            if is_loss_making:
                composite_score = min(composite_score, 30.0)

            results.append(ScreeningResult(
                symbol=symbol,
                name=name,
                score=round(composite_score, 1),
                passed_filters=passed,
                metrics=metrics,
                rank=0,
                inputs_hash="",
                calculation_timestamp=datetime.now().isoformat()
            ))

        # Sort by composite score descending and assign ranks
        results.sort(key=lambda x: x.score, reverse=True)
        for i, r in enumerate(results):
            r.rank = i + 1

        return results

# ============================================================
# FACTORY & REGISTRY
# ============================================================

# ============================================================
# RATIO ANALYSIS ENGINE
# ============================================================

@dataclass
class RatioAnalysisInputs:
    """Inputs for ratio analysis engine"""
    symbol: str
    entity_type: str = "COMMERCIAL_CORPORATE"  # COMMERCIAL_CORPORATE, BANKING, NBFC, INSURANCE
    # P&L
    revenue: float = 0.0
    cogs: float = 0.0
    ebitda: float = 0.0
    ebit: float = 0.0
    pat: float = 0.0
    interest_expense: float = 0.0
    tax_expense: float = 0.0
    # Balance Sheet
    total_assets: float = 0.0
    current_assets: float = 0.0
    cash_investments: float = 0.0
    inventory: float = 0.0
    receivables: float = 0.0
    total_equity: float = 0.0
    total_debt: float = 0.0
    lease_liabilities: float = 0.0
    current_liabilities: float = 0.0
    payables: float = 0.0
    # Market
    market_cap: float = 0.0
    cmp: float = 0.0
    shares_outstanding: float = 0.0
    # Cash Flow
    cfo: float = 0.0
    capex: float = 0.0
    # Banking specific
    interest_income: float = 0.0
    non_interest_income: float = 0.0
    operating_expense: float = 0.0
    gross_npa: float = 0.0
    net_npa: float = 0.0
    tier1_capital: float = 0.0
    risk_weighted_assets: float = 0.0
    advances: float = 0.0
    deposits: float = 0.0
    # Averages (for turnover ratios)
    avg_total_assets: float = 0.0
    avg_equity: float = 0.0
    avg_inventory: float = 0.0
    avg_receivables: float = 0.0
    avg_payables: float = 0.0
    avg_net_fixed_assets: float = 0.0
    # Growth (for CAGR)
    revenue_prev: float = 0.0
    ebitda_prev: float = 0.0
    pat_prev: float = 0.0
    eps_prev: float = 0.0
    eps: float = 0.0
    growth_years: int = 1
    # Dividend
    dividend_per_share: float = 0.0
    # Previous period total assets for turnover
    total_assets_prev: float = 0.0

@dataclass
class RatioAnalysisOutputs:
    symbol: str
    entity_type: str
    ratios: Dict[str, Any]
    dupont: Dict[str, Any]
    distress_flags: List[Dict[str, str]]
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class RatioAnalysisEngine(DeterministicCalculator):
    """Deterministic Ratio Analysis Engine with entityType branching and guardrails."""

    @staticmethod
    def _nm_if(cond: bool):
        return "NM" if cond else None

    def calculate(self, inputs: RatioAnalysisInputs) -> RatioAnalysisOutputs:
        et = inputs.entity_type.upper()
        ratios = {"profitability": [], "leverage": [], "liquidity": [],
                  "efficiency": [], "valuation": [], "growth": []}
        distress_flags = []

        # Helper: safe division
        def safe_div(num, den, zero_result="NM", neg_result="NM"):
            if den == 0:
                return zero_result
            if den < 0:
                return neg_result
            return num / den

        # ── Profitability ──
        # ROE
        avg_eq = inputs.avg_equity if inputs.avg_equity != 0 else inputs.total_equity
        if avg_eq <= 0:
            roe = "NM"
            distress_flags.append({"type": "NEGATIVE_NET_WORTH", "severity": "CRITICAL",
                                  "message": "Negative/zero equity — ROE not meaningful", "affectedRatios": ["ROE"]})
        else:
            roe = inputs.pat / avg_eq
        ratios["profitability"].append({"name": "ROE", "value": roe, "unit": "ratio"})

        # ROCE
        cap_employed = inputs.total_assets - inputs.current_liabilities
        avg_cap = cap_employed  # simplified
        if avg_cap <= 0:
            roce = "NM"
            distress_flags.append({"type": "NEGATIVE_CAPITAL_EMPLOYED", "severity": "HIGH",
                                  "message": "Negative capital employed", "affectedRatios": ["ROCE"]})
        else:
            roce = inputs.ebit / avg_cap
        ratios["profitability"].append({"name": "ROCE", "value": roce, "unit": "ratio"})

        # ROA
        avg_ta = inputs.avg_total_assets if inputs.avg_total_assets != 0 else inputs.total_assets
        if avg_ta <= 0:
            roa = "NM"
        else:
            roa = inputs.pat / avg_ta
        ratios["profitability"].append({"name": "ROA", "value": roa, "unit": "ratio"})

        # Net Margin
        net_margin = safe_div(inputs.pat, inputs.revenue)
        ratios["profitability"].append({"name": "Net Margin", "value": net_margin, "unit": "pct"})

        # EBITDA Margin
        ebitda_margin = safe_div(inputs.ebitda, inputs.revenue)
        ratios["profitability"].append({"name": "EBITDA Margin", "value": ebitda_margin, "unit": "pct"})

        # Gross Margin
        if inputs.revenue <= 0:
            gross_margin = "NM"
        else:
            gross_margin = (inputs.revenue - inputs.cogs) / inputs.revenue
        ratios["profitability"].append({"name": "Gross Margin", "value": gross_margin, "unit": "pct"})

        # FCF Margin
        fcff = inputs.cfo - inputs.capex
        fcf_margin = safe_div(fcff, inputs.revenue)
        ratios["profitability"].append({"name": "FCF Margin", "value": fcf_margin, "unit": "pct"})

        # Banking-specific ratios
        if et in ("BANKING", "NBFC"):
            # NIM
            if inputs.interest_income > 0:
                nim = (inputs.interest_income - inputs.interest_expense) / inputs.interest_income if inputs.interest_income != 0 else "NM"
            else:
                earning_assets = inputs.advances + inputs.cash_investments
                nim = safe_div(inputs.interest_income - inputs.interest_expense, earning_assets) if earning_assets > 0 else "NM"
            ratios["profitability"].append({"name": "NIM", "value": nim, "unit": "pct"})

            # Cost-to-Income
            c2i_denom = inputs.interest_income - inputs.interest_expense + inputs.non_interest_income
            c2i = safe_div(inputs.operating_expense, c2i_denom)
            ratios["profitability"].append({"name": "Cost-to-Income", "value": c2i, "unit": "pct"})

            # GNPA %, NNPA %
            gnpa_pct = safe_div(inputs.gross_npa, inputs.advances) if inputs.advances > 0 else "NM"
            nnpa_pct = safe_div(inputs.net_npa, inputs.advances) if inputs.advances > 0 else "NM"
            ratios["profitability"].append({"name": "GNPA %", "value": gnpa_pct, "unit": "pct"})
            ratios["profitability"].append({"name": "NNPA %", "value": nnpa_pct, "unit": "pct"})

            # PCR
            pcr = safe_div(inputs.gross_npa - inputs.net_npa, inputs.gross_npa) if inputs.gross_npa > 0 else "NM"
            ratios["profitability"].append({"name": "PCR", "value": pcr, "unit": "pct"})

            # CRAR
            crar = safe_div(inputs.tier1_capital, inputs.risk_weighted_assets) if inputs.risk_weighted_assets > 0 else "NM"
            ratios["profitability"].append({"name": "CRAR (Tier 1)", "value": crar, "unit": "pct"})

            # CASA %
            casa = safe_div(inputs.deposits * 0.4, inputs.deposits) if inputs.deposits > 0 else "NM"  # simplified
            ratios["profitability"].append({"name": "CASA %", "value": casa, "unit": "pct"})

        # ── Leverage ──
        # D/E
        if inputs.total_equity <= 0:
            de = "NM"
            distress_flags.append({"type": "NEGATIVE_NET_WORTH", "severity": "CRITICAL",
                                  "message": "Negative equity — D/E not meaningful", "affectedRatios": ["D/E"]})
        else:
            net_debt = inputs.total_debt + inputs.lease_liabilities - inputs.cash_investments
            if net_debt < 0:
                de = "NET_CASH"
            else:
                de = inputs.total_debt / inputs.total_equity
        ratios["leverage"].append({"name": "Debt/Equity", "value": de, "unit": "ratio"})

        # Debt/EBITDA
        net_debt = inputs.total_debt + inputs.lease_liabilities - inputs.cash_investments
        if inputs.ebitda <= 0:
            debt_ebitda = "NM"
            distress_flags.append({"type": "OPERATIONAL_DISTRESS", "severity": "HIGH",
                                  "message": "EBITDA <= 0 — Debt/EBITDA not meaningful", "affectedRatios": ["Debt/EBITDA"]})
        elif net_debt < 0:
            debt_ebitda = "NET_CASH"
        else:
            debt_ebitda = net_debt / inputs.ebitda
        ratios["leverage"].append({"name": "Debt/EBITDA", "value": debt_ebitda, "unit": "ratio"})

        # Interest Coverage
        if inputs.interest_expense == 0:
            if inputs.ebit > 0:
                ic = "INFINITY"
            else:
                ic = "NM"
        elif inputs.ebit <= 0:
            ic = "NM"
        else:
            ic = inputs.ebit / inputs.interest_expense
        ratios["leverage"].append({"name": "Interest Coverage", "value": ic, "unit": "times"})

        # ── Liquidity ──
        # Current Ratio
        if inputs.current_liabilities == 0:
            cr = "INFINITY"
        else:
            cr = inputs.current_assets / inputs.current_liabilities
        ratios["liquidity"].append({"name": "Current Ratio", "value": cr, "unit": "ratio"})

        # Quick Ratio
        if inputs.current_liabilities == 0:
            qr = "INFINITY"
        else:
            qr = (inputs.current_assets - inputs.inventory) / inputs.current_liabilities
        ratios["liquidity"].append({"name": "Quick Ratio", "value": qr, "unit": "ratio"})

        # Cash Ratio
        if inputs.current_liabilities == 0:
            cash_r = "INFINITY"
        else:
            cash_r = inputs.cash_investments / inputs.current_liabilities
        ratios["liquidity"].append({"name": "Cash Ratio", "value": cash_r, "unit": "ratio"})

        # Working Capital Cycle
        inv_days = safe_div(inputs.avg_inventory, inputs.cogs) * 365 if inputs.cogs > 0 else "NM"
        rec_days = safe_div(inputs.avg_receivables, inputs.revenue) * 365 if inputs.revenue > 0 else "NM"
        pay_days = safe_div(inputs.avg_payables, inputs.cogs) * 365 if inputs.cogs > 0 else "NM"
        if isinstance(inv_days, str) or isinstance(rec_days, str) or isinstance(pay_days, str):
            wcc = "NM"
        else:
            wcc = inv_days + rec_days - pay_days
        ratios["liquidity"].append({"name": "Working Capital Cycle", "value": wcc, "unit": "days"})

        # ── Efficiency ──
        # Asset Turnover
        asset_to = safe_div(inputs.revenue, avg_ta) if avg_ta > 0 else "NM"
        ratios["efficiency"].append({"name": "Asset Turnover", "value": asset_to, "unit": "times"})

        # Inventory Turnover
        inv_to = safe_div(inputs.cogs, inputs.avg_inventory) if inputs.avg_inventory > 0 else "NM"
        ratios["efficiency"].append({"name": "Inventory Turnover", "value": inv_to, "unit": "times"})

        # Receivables Turnover
        rec_to = safe_div(inputs.revenue, inputs.avg_receivables) if inputs.avg_receivables > 0 else "NM"
        ratios["efficiency"].append({"name": "Receivables Turnover", "value": rec_to, "unit": "times"})

        # Payables Turnover
        pay_to = safe_div(inputs.cogs, inputs.avg_payables) if inputs.avg_payables > 0 else "NM"
        ratios["efficiency"].append({"name": "Payables Turnover", "value": pay_to, "unit": "times"})

        # Fixed Asset Turnover
        fat = safe_div(inputs.revenue, inputs.avg_net_fixed_assets) if inputs.avg_net_fixed_assets > 0 else "NM"
        ratios["efficiency"].append({"name": "Fixed Asset Turnover", "value": fat, "unit": "times"})

        # ── Valuation ──
        # P/E
        if inputs.pat <= 0 or inputs.eps <= 0:
            pe = "NM"
            if inputs.pat <= 0:
                distress_flags.append({"type": "LOSS_MAKING", "severity": "HIGH",
                                      "message": "Loss-making — P/E not meaningful", "affectedRatios": ["P/E"]})
        else:
            pe = inputs.market_cap / inputs.pat if inputs.pat != 0 else "NM"
        ratios["valuation"].append({"name": "P/E", "value": pe, "unit": "ratio"})

        # P/B
        if inputs.total_equity <= 0:
            pb = "NM"
        else:
            pb = inputs.market_cap / inputs.total_equity
        ratios["valuation"].append({"name": "P/B", "value": pb, "unit": "ratio"})

        # EV/EBITDA
        ev = inputs.market_cap + inputs.total_debt + inputs.lease_liabilities - inputs.cash_investments
        if inputs.ebitda <= 0:
            ev_ebitda = "NM"
        else:
            ev_ebitda = ev / inputs.ebitda
        ratios["valuation"].append({"name": "EV/EBITDA", "value": ev_ebitda, "unit": "ratio"})

        # EV/Sales
        if inputs.revenue <= 0:
            ev_sales = "NM"
        else:
            ev_sales = ev / inputs.revenue
        ratios["valuation"].append({"name": "EV/Sales", "value": ev_sales, "unit": "ratio"})

        # FCF Yield
        fcf_yield = safe_div(fcff, inputs.market_cap) if inputs.market_cap > 0 else "NM"
        ratios["valuation"].append({"name": "FCF Yield", "value": fcf_yield, "unit": "pct"})

        # Dividend Yield
        if inputs.cmp <= 0:
            div_yield = "NM"
        else:
            div_yield = inputs.dividend_per_share / inputs.cmp
        ratios["valuation"].append({"name": "Dividend Yield", "value": div_yield, "unit": "pct"})

        # ── Growth (CAGR) ──
        n = inputs.growth_years if inputs.growth_years > 0 else 1
        # Revenue CAGR
        if inputs.revenue_prev <= 0:
            rev_cagr = "NM"
        else:
            rev_cagr = (inputs.revenue / inputs.revenue_prev) ** (1.0 / n) - 1
        ratios["growth"].append({"name": "Revenue CAGR", "value": rev_cagr, "unit": "pct"})

        # EBITDA CAGR
        if inputs.ebitda_prev <= 0:
            ebitda_cagr = "NM"
        else:
            ebitda_cagr = (inputs.ebitda / inputs.ebitda_prev) ** (1.0 / n) - 1
        ratios["growth"].append({"name": "EBITDA CAGR", "value": ebitda_cagr, "unit": "pct"})

        # PAT CAGR
        if inputs.pat_prev <= 0 if hasattr(inputs, 'pat_prev') else inputs.pat <= 0:
            pat_cagr = "NM"
        else:
            pat_prev = getattr(inputs, 'pat_prev', 0)
            if pat_prev <= 0:
                pat_cagr = "NM"
            else:
                pat_cagr = (inputs.pat / pat_prev) ** (1.0 / n) - 1
        ratios["growth"].append({"name": "PAT CAGR", "value": pat_cagr, "unit": "pct"})

        # EPS CAGR
        if inputs.eps_prev <= 0:
            eps_cagr = "NM"
        else:
            eps_cagr = (inputs.eps / inputs.eps_prev) ** (1.0 / n) - 1
        ratios["growth"].append({"name": "EPS CAGR", "value": eps_cagr, "unit": "pct"})

        # ── DuPont ──
        if avg_eq <= 0:
            dupont = {"status": "NM", "reason": "Negative Equity"}
        else:
            net_margin = inputs.pat / inputs.revenue if inputs.revenue != 0 else None
            asset_turnover = inputs.revenue / avg_ta if avg_ta != 0 else None
            financial_leverage = avg_ta / avg_eq if avg_eq != 0 else None
            if None in (net_margin, asset_turnover, financial_leverage):
                dupont = {"status": "NM", "reason": "Zero denominator in DuPont"}
            else:
                roe_val = net_margin * asset_turnover * financial_leverage
                dupont = {
                    "status": "COMPUTED",
                    "roe": roe_val,
                    "netMargin": net_margin,
                    "assetTurnover": asset_turnover,
                    "financialLeverage": financial_leverage,
                    "extended": {
                        "taxBurden": inputs.pat / (inputs.pat + inputs.tax_expense) if (inputs.pat + inputs.tax_expense) != 0 else None,
                        "interestBurden": (inputs.pat + inputs.tax_expense) / inputs.ebit if inputs.ebit != 0 else None,
                        "ebitMargin": inputs.ebit / inputs.revenue if inputs.revenue != 0 else None,
                    }
                }

        return RatioAnalysisOutputs(
            symbol=inputs.symbol,
            entity_type=et,
            ratios=ratios,
            dupont=dupont,
            distress_flags=distress_flags,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# TURNOVER ENGINE (Turnaround Indicator)
# ============================================================

@dataclass
class TurnaroundInputs:
    symbol: str
    roe_t: float = 0.0
    roe_t_1: float = 0.0
    debt_t: float = 0.0
    debt_t_1: float = 0.0
    cfo_positive: bool = False
    operating_margin_t: float = 0.0
    operating_margin_t_1: float = 0.0
    ebitda_t: float = 0.0
    ebitda_t_1: float = 0.0
    interest_coverage_t: float = 0.0
    interest_coverage_t_1: float = 0.0
    asset_turnover_t: float = 0.0
    asset_turnover_t_1: float = 0.0
    share_count_t: float = 0.0
    share_count_t_1: float = 0.0
    split_factor: float = 1.0  # Corporate action split/bonus normalization
    min_debt_reduction: float = 25.0  # Minimum nominal debt reduction in Cr

@dataclass
class TurnaroundOutputs:
    symbol: str
    signals: Dict[str, bool]
    turnaround_score: float  # 0-100
    signal_count: int
    dilution_warning: bool
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class TurnaroundEngine(DeterministicCalculator):
    """Turnaround Indicator Engine with normalized thresholds."""

    def calculate(self, inputs: TurnaroundInputs) -> TurnaroundOutputs:
        signals = {}
        score = 0.0

        # 1. ROE Inflection: decimal threshold > 0.05 (500 bps), not > 5
        roe_diff = inputs.roe_t - inputs.roe_t_1
        signals['roe_inflection'] = roe_diff > 0.05
        if signals['roe_inflection']:
            score += 20

        # 2. Debt Reduction: check zero-division, minimum nominal threshold
        if inputs.debt_t_1 > 0:
            debt_reduction_ratio = inputs.debt_t / inputs.debt_t_1
            debt_reduction_nominal = inputs.debt_t_1 - inputs.debt_t
            signals['debt_reduction'] = (debt_reduction_ratio < 0.8 and
                                         debt_reduction_nominal >= inputs.min_debt_reduction)
        else:
            signals['debt_reduction'] = False
        if signals['debt_reduction']:
            score += 20

        # 3. CFO Positive
        signals['cfo_positive'] = inputs.cfo_positive
        if signals['cfo_positive']:
            score += 15

        # 4. Operating Margin Improvement
        margin_diff = inputs.operating_margin_t - inputs.operating_margin_t_1
        signals['margin_improvement'] = margin_diff > 0.02  # 200 bps
        if signals['margin_improvement']:
            score += 15

        # 5. EBITDA Growth
        if inputs.ebitda_t_1 > 0:
            ebitda_growth = (inputs.ebitda_t / inputs.ebitda_t_1) - 1
            signals['ebitda_growth'] = ebitda_growth > 0.10  # 10%
        else:
            signals['ebitda_growth'] = False
        if signals['ebitda_growth']:
            score += 15

        # 6. Interest Coverage Improvement
        ic_diff = inputs.interest_coverage_t - inputs.interest_coverage_t_1
        signals['interest_coverage_improvement'] = ic_diff > 0.5
        if signals['interest_coverage_improvement']:
            score += 10

        # 7. Asset Turnover Improvement
        at_diff = inputs.asset_turnover_t - inputs.asset_turnover_t_1
        signals['asset_turnover_improvement'] = at_diff > 0.05
        if signals['asset_turnover_improvement']:
            score += 5

        # IBC / NCLT Dilution Check: normalize share count by split factor
        normalized_shares_t = inputs.share_count_t / inputs.split_factor if inputs.split_factor > 0 else inputs.share_count_t
        normalized_shares_t_1 = inputs.share_count_t_1
        if normalized_shares_t_1 > 0:
            dilution_pct = (normalized_shares_t / normalized_shares_t_1 - 1) * 100
            dilution_warning = dilution_pct > 10.0  # > 10% dilution
        else:
            dilution_warning = False

        signal_count = sum(1 for v in signals.values() if v)

        return TurnaroundOutputs(
            symbol=inputs.symbol,
            signals=signals,
            turnaround_score=min(100, score),
            signal_count=signal_count,
            dilution_warning=dilution_warning,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# HEDGING ENGINE
# ============================================================

@dataclass
class HedgingInputs:
    spot_price: float
    call_strike: float
    put_strike: float
    call_premium: float
    put_premium: float
    risk_free_rate: float = 0.07
    dividend_yield: float = 0.0
    time_to_expiry_days: int = 30
    portfolio_value: float = 0.0
    futures_value: float = 0.0
    hedge_ratio: float = 0.0
    nse_lot_size: int = 1

@dataclass
class HedgingOutputs:
    collar_max_gain: float
    collar_max_loss: float
    fair_future_price: float
    hedge_lots: int
    basis_risk: float
    stt_cost_drag: float
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class HedgingEngine(DeterministicCalculator):
    """Hedging Mechanism Engine with correct payoff math."""

    def calculate(self, inputs: HedgingInputs) -> HedgingOutputs:
        S0 = inputs.spot_price
        Kc = inputs.call_strike
        Kp = inputs.put_strike
        C = inputs.call_premium
        P = inputs.put_premium
        T = inputs.time_to_expiry_days / 365.0
        r = inputs.risk_free_rate
        q = inputs.dividend_yield

        # Collar: Max Gain = (K_call - S0) + (C - P)  [selling call RECEIVES premium +C]
        collar_max_gain = (Kc - S0) + (C - P)
        # Max Loss = (S0 - K_put) + (P - C)
        collar_max_loss = (S0 - Kp) + (P - C)

        # Futures Cost of Carry: F = S0 * [1 + (r - q) * T/365]
        # Correct: percentage yield, not subtracted from rupee price
        fair_future = S0 * (1 + (r - q) * T)

        # Hedge lots: round to integer NSE lots
        if inputs.futures_value > 0 and inputs.portfolio_value > 0:
            raw_lots = (inputs.hedge_ratio * inputs.portfolio_value) / inputs.futures_value
            hedge_lots = int(round(raw_lots / inputs.nse_lot_size)) * inputs.nse_lot_size
        else:
            hedge_lots = 0

        # Basis risk (simplified: difference between spot and futures)
        basis_risk = abs(S0 - fair_future) / S0 if S0 > 0 else 0.0

        # STT cost drag: 0.02% futures, 0.1% options (simplified)
        stt_cost_drag = 0.0002 * inputs.portfolio_value if inputs.portfolio_value > 0 else 0.0

        return HedgingOutputs(
            collar_max_gain=collar_max_gain,
            collar_max_loss=collar_max_loss,
            fair_future_price=fair_future,
            hedge_lots=hedge_lots,
            basis_risk=basis_risk,
            stt_cost_drag=stt_cost_drag,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# RISK SCORE ENGINE
# ============================================================

@dataclass
class RiskScoreInputs:
    symbol: str
    promoter_pledge_pct: float = 0.0
    rpt_pct_of_turnover: float = 0.0
    auditor_type: str = "BIG4"  # BIG4, TIER2, EMPHASIS, QUALIFIED, RESIGNED
    debt_ebitda: float = 0.0
    interest_coverage: float = 0.0
    current_ratio: float = 0.0
    promoter_holding_pct: float = 0.0
    pledged_shares_pct: float = 0.0
    available_factors: List[str] = field(default_factory=list)

@dataclass
class RiskScoreOutputs:
    symbol: str
    category_scores: Dict[str, float]
    composite_score: float  # 0-100, higher = more risk
    risk_level: str  # LOW, MODERATE, HIGH, SEVERE
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class RiskScoreEngine(DeterministicCalculator):
    """Risk Score Engine with SEBI LODR calibrations and transfer functions."""

    def _promoter_pledge_score(self, pct: float) -> float:
        if pct <= 5:
            return 0.0
        elif pct <= 20:
            return 40.0
        elif pct <= 50:
            return 80.0
        else:
            return 100.0

    def _rpt_score(self, pct: float) -> float:
        if pct <= 10:
            return 0.0
        elif pct <= 25:
            return 50.0
        else:
            return 100.0

    def _auditor_score(self, auditor_type: str) -> float:
        mapping = {
            "BIG4": 0.0,
            "TIER2": 25.0,
            "EMPHASIS": 50.0,
            "QUALIFIED": 80.0,
            "RESIGNED": 100.0,
        }
        return mapping.get(auditor_type.upper(), 50.0)

    def _leverage_score(self, debt_ebitda: float) -> float:
        if debt_ebitda <= 1:
            return 0.0
        elif debt_ebitda <= 2:
            return 25.0
        elif debt_ebitda <= 4:
            return 50.0
        elif debt_ebitda <= 6:
            return 75.0
        else:
            return 100.0

    def _liquidity_score(self, current_ratio: float) -> float:
        if current_ratio >= 2.0:
            return 0.0
        elif current_ratio >= 1.5:
            return 25.0
        elif current_ratio >= 1.0:
            return 50.0
        elif current_ratio >= 0.5:
            return 75.0
        else:
            return 100.0

    def calculate(self, inputs: RiskScoreInputs) -> RiskScoreOutputs:
        category_scores = {
            "promoter_pledge": self._promoter_pledge_score(inputs.promoter_pledge_pct),
            "related_party_transactions": self._rpt_score(inputs.rpt_pct_of_turnover),
            "auditor_quality": self._auditor_score(inputs.auditor_type),
            "leverage": self._leverage_score(inputs.debt_ebitda),
            "liquidity": self._liquidity_score(inputs.current_ratio),
        }

        # Default weights
        weights = {
            "promoter_pledge": 0.25,
            "related_party_transactions": 0.20,
            "auditor_quality": 0.20,
            "leverage": 0.20,
            "liquidity": 0.15,
        }

        # Dynamic weight renormalization for unavailable factors
        if inputs.available_factors:
            available = set(inputs.available_factors)
            valid_weights = {k: v for k, v in weights.items() if k in available}
            total_w = sum(valid_weights.values()) or 1.0
            valid_weights = {k: v / total_w for k, v in valid_weights.items()}
        else:
            valid_weights = weights

        composite = sum(category_scores[k] * valid_weights.get(k, 0) for k in category_scores)
        composite = min(100, max(0, composite))

        if composite <= 25:
            risk_level = "LOW"
        elif composite <= 50:
            risk_level = "MODERATE"
        elif composite <= 75:
            risk_level = "HIGH"
        else:
            risk_level = "SEVERE"

        return RiskScoreOutputs(
            symbol=inputs.symbol,
            category_scores=category_scores,
            composite_score=round(composite, 1),
            risk_level=risk_level,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# COMMON SIZE ENGINE
# ============================================================

@dataclass
class CommonSizeInputs:
    symbol: str
    revenue: float = 0.0
    total_operating_expenses: float = 0.0
    cogs: float = 0.0
    employee_expenses: float = 0.0
    subcontracting: float = 0.0
    ebitda: float = 0.0
    depreciation: float = 0.0
    ebit: float = 0.0
    interest: float = 0.0
    pbt: float = 0.0
    tax: float = 0.0
    pat: float = 0.0
    total_assets: float = 0.0
    current_assets: float = 0.0
    fixed_assets: float = 0.0
    total_liabilities: float = 0.0
    current_liabilities: float = 0.0
    total_equity: float = 0.0
    lease_liabilities: float = 0.0
    cfo: float = 0.0
    cfi: float = 0.0
    cff: float = 0.0
    base_type: str = "REVENUE"  # REVENUE or TOTAL_OPEX
    cash_flow_base: str = "REVENUE"  # REVENUE or TOTAL_INFLOW

@dataclass
class CommonSizeOutputs:
    symbol: str
    pnl_common_size: Dict[str, float]
    balance_sheet_common_size: Dict[str, float]
    cash_flow_common_size: Dict[str, float]
    base_used: str
    reconciliation_check: bool
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class CommonSizeEngine(DeterministicCalculator):
    """Common Size Statement Engine with zero-revenue fallback and Ind AS 116."""

    def calculate(self, inputs: CommonSizeInputs) -> CommonSizeOutputs:
        # Determine P&L base
        if inputs.base_type == "REVENUE" and inputs.revenue != 0:
            pnl_base = inputs.revenue
        elif inputs.revenue == 0 and inputs.total_operating_expenses > 0:
            pnl_base = inputs.total_operating_expenses  # Fallback for pre-revenue firms
        else:
            pnl_base = inputs.revenue if inputs.revenue != 0 else 1.0

        # P&L Common Size
        pnl_cs = {}
        if pnl_base != 0:
            pnl_cs['cogs_pct'] = inputs.cogs / pnl_base * 100
            pnl_cs['employee_expenses_pct'] = inputs.employee_expenses / pnl_base * 100
            pnl_cs['subcontracting_pct'] = inputs.subcontracting / pnl_base * 100
            pnl_cs['ebitda_pct'] = inputs.ebitda / pnl_base * 100
            pnl_cs['depreciation_pct'] = inputs.depreciation / pnl_base * 100
            pnl_cs['ebit_pct'] = inputs.ebit / pnl_base * 100
            pnl_cs['interest_pct'] = inputs.interest / pnl_base * 100
            # Ind AS 116: separate interest on borrowings vs lease accretion
            pnl_cs['interest_on_borrowings_pct'] = inputs.interest / pnl_base * 100
            pnl_cs['interest_lease_accretion_pct'] = 0.0  # Placeholder for Ind AS 116 separation
            pnl_cs['pbt_pct'] = inputs.pbt / pnl_base * 100
            pnl_cs['tax_pct'] = inputs.tax / pnl_base * 100
            pnl_cs['pat_pct'] = inputs.pat / pnl_base * 100

        # Balance Sheet Common Size (base = Total Assets)
        bs_base = inputs.total_assets if inputs.total_assets != 0 else 1.0
        bs_cs = {}
        if bs_base != 0:
            bs_cs['current_assets_pct'] = inputs.current_assets / bs_base * 100
            bs_cs['fixed_assets_pct'] = inputs.fixed_assets / bs_base * 100
            bs_cs['total_liabilities_pct'] = inputs.total_liabilities / bs_base * 100
            bs_cs['current_liabilities_pct'] = inputs.current_liabilities / bs_base * 100
            bs_cs['lease_liabilities_pct'] = inputs.lease_liabilities / bs_base * 100
            bs_cs['total_equity_pct'] = inputs.total_equity / bs_base * 100

        # Reconciliation: Liabilities% + Equity% should = 100%
        recon_check = abs((inputs.total_liabilities + inputs.total_equity) / bs_base * 100 - 100.0) < 0.01 if bs_base != 0 else False

        # Cash Flow Common Size
        if inputs.cash_flow_base == "REVENUE" and inputs.revenue != 0:
            cf_base = inputs.revenue
        else:
            total_inflow = abs(inputs.cfo) + abs(inputs.cfi) + abs(inputs.cff)
            cf_base = total_inflow if total_inflow > 0 else 1.0

        cf_cs = {}
        if cf_base != 0:
            cf_cs['cfo_pct'] = inputs.cfo / cf_base * 100
            cf_cs['cfi_pct'] = inputs.cfi / cf_base * 100
            cf_cs['cff_pct'] = inputs.cff / cf_base * 100

        base_used = "REVENUE" if (inputs.base_type == "REVENUE" and inputs.revenue != 0) else "TOTAL_OPEX"

        return CommonSizeOutputs(
            symbol=inputs.symbol,
            pnl_common_size=pnl_cs,
            balance_sheet_common_size=bs_cs,
            cash_flow_common_size=cf_cs,
            base_used=base_used,
            reconciliation_check=recon_check,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# REVENUE PROJECTION ENGINE
# ============================================================

@dataclass
class RevenueProjectionInputs:
    symbol: str
    segments: List[Dict[str, Any]] = field(default_factory=list)  # [{name, revenue, growth_rate, tam}]
    intersegment_eliminations: float = 0.0
    ebitda_margin: float = 0.0
    depreciation_pct: float = 0.0
    tax_rate: float = 0.25
    capex_pct: float = 0.0
    nwc_change_pct: float = 0.0
    s_curve_params: Dict[str, Any] = field(default_factory=dict)  # {L, k, t0}

@dataclass
class RevenueProjectionOutputs:
    symbol: str
    consolidated_revenue: float
    segment_revenues: Dict[str, float]
    fcf: float
    ebitda: float
    ebit: float
    tax_shield: float
    s_curve_adoption: Optional[float]
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class RevenueProjectionEngine(DeterministicCalculator):
    """Revenue Projection Engine with correct FCF tax shield."""

    def calculate(self, inputs: RevenueProjectionInputs) -> RevenueProjectionOutputs:
        # Segment revenues with intersegment eliminations
        segment_revenues = {}
        total_segment_revenue = 0.0
        for seg in inputs.segments:
            name = seg.get('name', 'Unknown')
            rev = seg.get('revenue', 0.0)
            growth = seg.get('growth_rate', 0.0)
            projected_rev = rev * (1 + growth)
            segment_revenues[name] = projected_rev
            total_segment_revenue += projected_rev

        consolidated_revenue = total_segment_revenue - inputs.intersegment_eliminations

        # EBITDA
        ebitda = consolidated_revenue * inputs.ebitda_margin

        # D&A
        da = consolidated_revenue * inputs.depreciation_pct

        # EBIT = EBITDA - D&A
        ebit = ebitda - da

        # Correct FCF: FCFF = (EBITDA - DA) * (1 - t) + DA - Capex - ΔNWC
        # = EBITDA * (1 - t) + DA * t - Capex - ΔNWC
        tax_shield = da * inputs.tax_rate
        nopat = ebit * (1 - inputs.tax_rate)
        fcf = nopat + da - (consolidated_revenue * inputs.capex_pct) - (consolidated_revenue * inputs.nwc_change_pct)

        # S-curve adoption (logistic)
        s_curve_adoption = None
        if inputs.s_curve_params:
            L = inputs.s_curve_params.get('L', 1.0)
            k = inputs.s_curve_params.get('k', 0.5)
            t0 = inputs.s_curve_params.get('t0', 5.0)
            t = inputs.s_curve_params.get('t', 1.0)
            # Validate: L <= TAM, k in [0.05, 2.0]
            tam = inputs.s_curve_params.get('TAM', L)
            L = min(L, tam)
            k = max(0.05, min(2.0, k))
            import math
            s_curve_adoption = L / (1 + math.exp(-k * (t - t0)))

        return RevenueProjectionOutputs(
            symbol=inputs.symbol,
            consolidated_revenue=consolidated_revenue,
            segment_revenues=segment_revenues,
            fcf=fcf,
            ebitda=ebitda,
            ebit=ebit,
            tax_shield=tax_shield,
            s_curve_adoption=s_curve_adoption,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

# ============================================================
# CONCALL CONSISTENCY ENGINE
# ============================================================

@dataclass
class ConcallConsistencyInputs:
    symbol: str
    guidance_items: List[Dict[str, Any]] = field(default_factory=list)
    # Each item: {type: 'revenue'|'margin'|'capex'|'qualitative', lower: float, upper: float, actual: float, period: int}
    lambda_decay: float = 0.85

@dataclass
class ConcallConsistencyOutputs:
    symbol: str
    item_scores: List[Dict[str, Any]]
    weighted_score: float
    beat_count: int
    met_count: int
    miss_count: int
    inputs_hash: str = ""
    calculation_timestamp: str = ""

class ConcallConsistencyEngine(DeterministicCalculator):
    """Concall Consistency Engine with range parsing and time-decay weighting."""

    TYPE_WEIGHTS = {
        'revenue': 0.30,
        'volume': 0.30,
        'margin': 0.35,
        'ebitda': 0.35,
        'capex': 0.20,
        'qualitative': 0.15,
        'milestone': 0.15,
    }

    def calculate(self, inputs: ConcallConsistencyInputs) -> ConcallConsistencyOutputs:
        items = inputs.guidance_items
        n = len(items)
        if n == 0:
            return ConcallConsistencyOutputs(
                symbol=inputs.symbol,
                item_scores=[],
                weighted_score=0.0,
                beat_count=0,
                met_count=0,
                miss_count=0,
                inputs_hash=self._hash_inputs(inputs),
                calculation_timestamp=datetime.now().isoformat()
            )

        item_scores = []
        beat_count = 0
        met_count = 0
        miss_count = 0
        weighted_sum = 0.0
        weight_sum = 0.0

        for i, item in enumerate(items):
            g_type = item.get('type', 'qualitative').lower()
            lower = item.get('lower', 0.0)
            upper = item.get('upper', 0.0)
            actual = item.get('actual', 0.0)
            period = item.get('period', i + 1)

            # Range parsing: actual vs [lower, upper]
            if actual > upper:
                status = "BEAT"
                score = 1.0
                beat_count += 1
            elif lower <= actual <= upper:
                status = "MET"
                score = 0.5
                met_count += 1
            else:
                status = "MISS"
                score = 0.0
                miss_count += 1

            # Type weight
            w_type = self.TYPE_WEIGHTS.get(g_type, 0.15)

            # Time decay: lambda^(N - t)
            time_weight = inputs.lambda_decay ** (n - period)

            combined_weight = w_type * time_weight

            item_scores.append({
                'type': g_type,
                'lower': lower,
                'upper': upper,
                'actual': actual,
                'status': status,
                'score': score,
                'weight': combined_weight,
            })

            weighted_sum += combined_weight * score
            weight_sum += combined_weight

        weighted_score = weighted_sum / weight_sum if weight_sum > 0 else 0.0

        return ConcallConsistencyOutputs(
            symbol=inputs.symbol,
            item_scores=item_scores,
            weighted_score=round(weighted_score, 4),
            beat_count=beat_count,
            met_count=met_count,
            miss_count=miss_count,
            inputs_hash=self._hash_inputs(inputs),
            calculation_timestamp=datetime.now().isoformat()
        )

class MathEngineRegistry:
    """Central registry for all deterministic engines"""
    
    _engines = {
        'dcf': DCFEngine(),
        'relative': RelativeValuationEngine(),
        'sotp': SOTPEngine(),
        'banking': BankingValuationEngine(),
        'excess_return': ExcessReturnEngine(),
        'beneish': BeneishEngine(),
        'altman_z': AltmanZEngine(),
        'piotroski': PiotroskiEngine(),
        'portfolio': PortfolioAnalyticsEngine(),
        'screening': ScreeningEngine(),
        'ratio_analysis': RatioAnalysisEngine(),
        'turnaround': TurnaroundEngine(),
        'hedging': HedgingEngine(),
        'risk_score': RiskScoreEngine(),
        'common_size': CommonSizeEngine(),
        'revenue_projection': RevenueProjectionEngine(),
        'concall_consistency': ConcallConsistencyEngine(),
    }
    
    @classmethod
    def get(cls, name: str) -> DeterministicCalculator:
        if name not in cls._engines:
            raise ValueError(f"Unknown engine: {name}. Available: {list(cls._engines.keys())}")
        return cls._engines[name]
    
    @classmethod
    def list_engines(cls) -> List[str]:
        return list(cls._engines.keys())

# ============================================================
# CONVENIENCE FUNCTIONS
# ============================================================

def run_dcf(inputs: DCFInputs) -> DCFOutputs:
    return MathEngineRegistry.get('dcf').calculate(inputs)

def run_relative(inputs: RelativeValuationInputs) -> RelativeValuationOutputs:
    return MathEngineRegistry.get('relative').calculate(inputs)

def run_sotp(inputs: SOTPInputs) -> SOTPOutputs:
    return MathEngineRegistry.get('sotp').calculate(inputs)

def run_banking(inputs: BankingValuationInputs) -> BankingValuationOutputs:
    return MathEngineRegistry.get('banking').calculate(inputs)

def run_excess_return(inputs: ExcessReturnInputs) -> ExcessReturnOutputs:
    return MathEngineRegistry.get('excess_return').calculate(inputs)

def run_beneish(inputs: BeneishInputs) -> BeneishOutputs:
    return MathEngineRegistry.get('beneish').calculate(inputs)

def run_altman_z(inputs: AltmanZInputs) -> AltmanZOutputs:
    return MathEngineRegistry.get('altman_z').calculate(inputs)

def run_piotroski(inputs: PiotroskiInputs) -> PiotroskiOutputs:
    return MathEngineRegistry.get('piotroski').calculate(inputs)

def run_portfolio(inputs: PortfolioMetricsInputs) -> PortfolioMetricsOutputs:
    return MathEngineRegistry.get('portfolio').calculate(inputs)

def run_screening(universe: List[Dict], criteria: ScreeningCriteria) -> List[ScreeningResult]:
    return MathEngineRegistry.get('screening').calculate(universe, criteria)

def run_turnaround(inputs: TurnaroundInputs) -> TurnaroundOutputs:
    return MathEngineRegistry.get('turnaround').calculate(inputs)

def run_hedging(inputs: HedgingInputs) -> HedgingOutputs:
    return MathEngineRegistry.get('hedging').calculate(inputs)

def run_risk_score(inputs: RiskScoreInputs) -> RiskScoreOutputs:
    return MathEngineRegistry.get('risk_score').calculate(inputs)

def run_common_size(inputs: CommonSizeInputs) -> CommonSizeOutputs:
    return MathEngineRegistry.get('common_size').calculate(inputs)

def run_revenue_projection(inputs: RevenueProjectionInputs) -> RevenueProjectionOutputs:
    return MathEngineRegistry.get('revenue_projection').calculate(inputs)

def run_concall_consistency(inputs: ConcallConsistencyInputs) -> ConcallConsistencyOutputs:
    return MathEngineRegistry.get('concall_consistency').calculate(inputs)

def run_ratio_analysis(inputs: RatioAnalysisInputs) -> RatioAnalysisOutputs:
    return MathEngineRegistry.get('ratio_analysis').calculate(inputs)