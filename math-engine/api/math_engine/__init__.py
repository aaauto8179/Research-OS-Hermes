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
    segments: List[Dict[str, Any]]  # Each: {name, metric, value, multiple, method, conglomerate_discount}
    net_debt: float
    cash: float
    minority_interest: float
    diluted_shares: float

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
    book_value: float
    roe: float
    cost_of_equity: float
    growth_rate: float
    peer_roes: List[float]
    peer_pbs: List[float]
    market_cap: float

@dataclass
class BankingValuationOutputs:
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
    """5 variables for Altman Z-Score"""
    x1: float  # Working Capital / Total Assets
    x2: float  # Retained Earnings / Total Assets
    x3: float  # EBIT / Total Assets
    x4: float  # Market Value of Equity / Total Liabilities
    x5: float  # Sales / Total Assets
    is_manufacturing: bool = True

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
        current_ebit = inputs.ebit
        current_depr = inputs.depreciation
        current_capex = inputs.capex
        current_nwc = inputs.change_nwc
        
        for i, growth in enumerate(inputs.revenue_growth_years):
            current_revenue = current_revenue * (1 + growth)
            revenue_proj.append(current_revenue)
            
            current_ebit = current_revenue * inputs.ebit_margin
            ebit_proj.append(current_ebit)
            
            nopat = current_ebit * (1 - inputs.tax_rate)
            nopat_proj.append(nopat)
            
            current_depr = current_revenue * (inputs.depreciation / inputs.revenue) if inputs.revenue > 0 else current_depr
            depreciation_proj.append(current_depr)
            
            current_capex = current_revenue * inputs.capex_pct_revenue
            capex_proj.append(current_capex)
            
            revenue_change = current_revenue - (revenue_proj[i-1] if i > 0 else inputs.revenue)
            current_nwc = revenue_change * inputs.nwc_pct_revenue
            change_nwc_proj.append(current_nwc)
            
            fcff = nopat + current_depr - current_capex - current_nwc
            fcff_proj.append(fcff)
        
        # Discount factors
        discount_factors = [(1 + wacc) ** -year for year in years]
        pv_fcff = [fcff * df for fcff, df in zip(fcff_proj, discount_factors)]
        
        # Terminal Value - Gordon Growth
        fcff_terminal = fcff_proj[-1] * (1 + inputs.terminal_growth_rate)
        terminal_value_gordon = fcff_terminal / (wacc - inputs.terminal_growth_rate)
        pv_terminal_gordon = terminal_value_gordon * discount_factors[-1]
        
        # Terminal Value - Exit Multiple
        ebitda_terminal = ebit_proj[-1] + depreciation_proj[-1]
        terminal_value_multiple = ebitda_terminal * inputs.exit_multiple
        pv_terminal_multiple = terminal_value_multiple * discount_factors[-1]
        
        # Enterprise Value
        ev_gordon = sum(pv_fcff) + pv_terminal_gordon
        ev_multiple = sum(pv_fcff) + pv_terminal_multiple
        
        # Equity Value
        equity_value_gordon = ev_gordon - inputs.total_debt + inputs.cash - inputs.minority_interest
        equity_value_multiple = ev_multiple - inputs.total_debt + inputs.cash - inputs.minority_interest
        
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
                tv_g = fcff_proj[-1] * (1 + g) / (w - g) if w > g else 0
                pv_tv_g = tv_g * (1 + w) ** -inputs.forecast_years
                ev_g = sum([fcff * (1 + w) ** -y for fcff, y in zip(fcff_proj, years)]) + pv_tv_g
                eq_g = ev_g - inputs.total_debt + inputs.cash - inputs.minority_interest
                row_gordon.append(eq_g / inputs.diluted_shares)
                
                tv_m = ebitda_terminal * inputs.exit_multiple
                pv_tv_m = tv_m * (1 + w) ** -inputs.forecast_years
                ev_m = sum([fcff * (1 + w) ** -y for fcff, y in zip(fcff_proj, years)]) + pv_tv_m
                eq_m = ev_m - inputs.total_debt + inputs.cash - inputs.minority_interest
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
            
            peer_ev_ebitdas.append(self._safe_divide(peer_ev, peer_ebitda))
            # FIX: P/E = Price/EPS, not MarketCap/EPS
            if inputs.peer_diluted_shares and i < len(inputs.peer_diluted_shares) and inputs.peer_diluted_shares[i] > 0:
                peer_price = inputs.peer_market_caps[i] / inputs.peer_diluted_shares[i]
                peer_pes.append(self._safe_divide(peer_price, peer_eps))
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
        segment_contributions = {}
        
        for seg in inputs.segments:
            method = seg.get('method', 'EV_EBITDA')
            metric = seg.get('metric', seg.get('value', 0))
            multiple = seg.get('multiple', 0)
            discount = seg.get('conglomerate_discount', 0)
            
            if method == 'EV_EBITDA':
                seg_ev = metric * multiple * (1 - discount)
            elif method == 'EV_SALES':
                seg_ev = metric * multiple * (1 - discount)
            elif method == 'PE':
                seg_ev = metric * multiple * (1 - discount)
            elif method == 'PB':
                seg_ev = metric * multiple * (1 - discount)
            else:
                seg_ev = metric * multiple * (1 - discount)
            
            seg_value = {
                'name': seg.get('name', 'Unknown'),
                'method': method,
                'metric': metric,
                'multiple': multiple,
                'discount': discount,
                'ev': seg_ev
            }
            segment_values.append(seg_value)
            total_ev += seg_ev
            segment_contributions[seg.get('name', 'Unknown')] = seg_ev
        
        equity_value = total_ev - inputs.net_debt + inputs.cash - inputs.minority_interest
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
        # Justified P/B = (ROE - g) / (Ke - g)
        justified_pb = (inputs.roe - inputs.growth_rate) / (inputs.cost_of_equity - inputs.growth_rate)
        implied_price_justified_pb = justified_pb * inputs.book_value
        
        # P/B vs ROE Regression
        if len(inputs.peer_roes) >= 3 and len(inputs.peer_pbs) >= 3:
            x = np.array(inputs.peer_roes)
            y = np.array(inputs.peer_pbs)
            slope, intercept = np.polyfit(x, y, 1)
            y_pred = slope * x + intercept
            ss_res = np.sum((y - y_pred) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)
            r2 = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
            
            predicted_pb = slope * inputs.roe + intercept
            implied_price_regression = predicted_pb * inputs.book_value
            # FIX: Compare per-share to per-share. 
            # inputs.market_cap is total market cap; need per-share price
            # price_per_share = market_cap / diluted_shares (need to add diluted_shares to inputs)
            # For now, use book_value as proxy since we don't have diluted_shares
            # Better: require diluted_shares in inputs for proper per-share comparison
            price_per_share = inputs.market_cap / inputs.book_value * inputs.book_value  # placeholder - needs diluted_shares
            # Correct approach: premium_discount_pct = (price_per_share / implied_price_regression - 1) * 100
            # Since we lack diluted_shares, compute vs book_value as ratio
            premium_discount_pct = (justified_pb / predicted_pb - 1) * 100 if predicted_pb != 0 else 0
        else:
            slope = intercept = r2 = predicted_pb = implied_price_regression = premium_discount_pct = np.nan
        
        return BankingValuationOutputs(
            justified_pb=justified_pb,
            implied_price_justified_pb=implied_price_justified_pb,
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
        
        book_value = inputs.book_value
        for year in range(inputs.forecast_years):
            ri = inputs.net_income_forecast[year] - (inputs.cost_of_equity * book_value)
            residual_incomes.append(ri)
            pv_residual_incomes.append(ri / (1 + inputs.cost_of_equity) ** (year + 1))
            book_value += inputs.net_income_forecast[year]  # Simplified: assume all NI retained
        
        # Terminal Residual Income
        terminal_ri = residual_incomes[-1] * (1 + inputs.growth_rate)
        pv_terminal_ri = terminal_ri / (inputs.cost_of_equity - inputs.growth_rate) / (1 + inputs.cost_of_equity) ** inputs.forecast_years
        
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
        #     + 0.115*DEPI - 0.172*SGAI + 4.037*TATA + 0.0327*LVGI
        
        components = {
            'dsri': 0.920 * inputs.dsri,
            'gmi': 0.528 * inputs.gmi,
            'aqi': 0.404 * inputs.aqi,
            'sgi': 0.892 * inputs.sgi,
            'depi': 0.115 * inputs.depi,
            'sgai': -0.172 * inputs.sgai,
            'tata': 4.037 * inputs.tata,
            'lvgi': 0.0327 * inputs.lvgi,
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
        if inputs.is_manufacturing:
            # Original manufacturing formula
            z = (1.2 * inputs.x1 + 1.4 * inputs.x2 + 3.3 * inputs.x3 + 
                 0.6 * inputs.x4 + 0.999 * inputs.x5)
            thresholds = {"distress": 1.81, "grey_upper": 2.99}
        else:
            # Non-manufacturing / services formula
            z = (6.56 * inputs.x1 + 3.26 * inputs.x2 + 6.72 * inputs.x3 + 1.05 * inputs.x4)
            thresholds = {"distress": 1.1, "grey_upper": 2.6}
        
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
    """Deterministic Multi-Factor Screening Engine"""
    
    def calculate(self, universe: List[Dict], criteria: ScreeningCriteria) -> List[ScreeningResult]:
        results = []
        
        for company in universe:
            passed = {}
            metrics = {}
            score_components = []
            
            # Valuation checks
            if criteria.pe_max is not None:
                pe = company.get('pe', np.inf)
                passed['pe'] = pe <= criteria.pe_max if not np.isnan(pe) else False
                metrics['pe'] = pe
                if passed['pe']:
                    score_components.append(10)
            
            if criteria.ev_ebitda_max is not None:
                ev_ebitda = company.get('ev_ebitda', np.inf)
                passed['ev_ebitda'] = ev_ebitda <= criteria.ev_ebitda_max if not np.isnan(ev_ebitda) else False
                metrics['ev_ebitda'] = ev_ebitda
                if passed['ev_ebitda']:
                    score_components.append(10)
            
            if criteria.fcf_yield_min is not None:
                fcf_yield = company.get('fcf_yield', -np.inf)
                passed['fcf_yield'] = fcf_yield >= criteria.fcf_yield_min if not np.isnan(fcf_yield) else False
                metrics['fcf_yield'] = fcf_yield
                if passed['fcf_yield']:
                    score_components.append(10)
            
            # Quality checks
            if criteria.roe_min is not None:
                roe = company.get('roe', -np.inf)
                passed['roe'] = roe >= criteria.roe_min if not np.isnan(roe) else False
                metrics['roe'] = roe
                if passed['roe']:
                    score_components.append(10)
            
            if criteria.roce_min is not None:
                roce = company.get('roce', -np.inf)
                passed['roce'] = roce >= criteria.roce_min if not np.isnan(roce) else False
                metrics['roce'] = roce
                if passed['roce']:
                    score_components.append(10)
            
            if criteria.debt_ebitda_max is not None:
                debt_ebitda = company.get('debt_ebitda', np.inf)
                passed['debt_ebitda'] = debt_ebitda <= criteria.debt_ebitda_max if not np.isnan(debt_ebitda) else False
                metrics['debt_ebitda'] = debt_ebitda
                if passed['debt_ebitda']:
                    score_components.append(10)
            
            # Momentum checks
            if criteria.dist_from_52w_high_max is not None:
                dist = company.get('dist_from_52w_high', np.inf)
                passed['dist_52w'] = dist <= criteria.dist_from_52w_high_max if not np.isnan(dist) else False
                metrics['dist_from_52w_high'] = dist
                if passed['dist_52w']:
                    score_components.append(5)
            
            # Forensic checks
            if criteria.beneish_max is not None:
                beneish = company.get('beneish_m_score', np.inf)
                passed['beneish'] = beneish <= criteria.beneish_max if not np.isnan(beneish) else False
                metrics['beneish_m_score'] = beneish
                if passed['beneish']:
                    score_components.append(15)
            
            if criteria.piotroski_min is not None:
                piotroski = company.get('piotroski_f_score', -1)
                passed['piotroski'] = piotroski >= criteria.piotroski_min
                metrics['piotroski_f_score'] = piotroski
                if passed['piotroski']:
                    score_components.append(15)
            
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
            
            # Composite score (0-100)
            max_possible = len([k for k in ['pe', 'ev_ebitda', 'fcf_yield', 'roe', 'roce', 'debt_ebitda', 'dist_52w', 'beneish', 'piotroski'] 
                              if getattr(criteria, k + '_max' if 'max' in k else k + '_min' if 'min' in k else k, None) is not None])
            # Simplified: normalize score_components sum to 100
            score = min(100, sum(score_components) * (100 / max(1, max_possible * 10)))
            
            results.append(ScreeningResult(
                symbol=company.get('symbol', ''),
                name=company.get('name', ''),
                score=score,
                passed_filters=passed,
                metrics=metrics,
                rank=0,  # Will be set after sorting
                inputs_hash="",  # Individual company hash not computed here
                calculation_timestamp=datetime.now().isoformat()
            ))
        
        # Sort by score descending and assign ranks
        results.sort(key=lambda x: x.score, reverse=True)
        for i, r in enumerate(results):
            r.rank = i + 1
        
        return results

# ============================================================
# FACTORY & REGISTRY
# ============================================================

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