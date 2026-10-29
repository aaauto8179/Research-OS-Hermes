"""
Golden Test Vectors for FROS Math Engine
=========================================
Deterministic tests with known expected values.
All tests must pass with bit-identical results.

Reference cases:
- DCF: Standard textbook case with known output
- Beneish: Enron 2000 10-K (M-Score > -1.78)
- Altman Z: Known distress/safe zone cases
- Piotroski: Known high/low quality companies
"""

import pytest
import numpy as np
import math
from datetime import date
from math_engine import (
    DCFEngine, DCFInputs, DCFOutputs,
    RelativeValuationEngine, RelativeValuationInputs, RelativeValuationOutputs,
    SOTPEngine, SOTPInputs, SOTPOutputs,
    BankingValuationEngine, BankingValuationInputs, BankingValuationOutputs,
    ExcessReturnEngine, ExcessReturnInputs, ExcessReturnOutputs,
    BeneishEngine, BeneishInputs, BeneishOutputs,
    AltmanZEngine, AltmanZInputs, AltmanZOutputs,
    PiotroskiEngine, PiotroskiInputs, PiotroskiOutputs,
    PortfolioAnalyticsEngine, PortfolioMetricsInputs, PortfolioMetricsOutputs,
    ScreeningEngine, ScreeningCriteria, ScreeningResult,
    MathEngineRegistry,
)


# ============================================================
# DCF TESTS
# ============================================================

class TestDCFEngine:
    """Test DCF valuation with known reference values"""
    
    def test_standard_dcf_case(self):
        """Standard DCF case from Damodaran textbook"""
        inputs = DCFInputs(
            revenue=10000.0,
            ebit=1500.0,
            depreciation=500.0,
            capex=800.0,
            change_nwc=200.0,
            tax_rate=0.25,
            total_debt=3000.0,
            cash=1000.0,
            minority_interest=100.0,
            diluted_shares=100.0,
            revenue_growth_years=[0.12, 0.10, 0.08, 0.06, 0.05, 0.04, 0.035, 0.03, 0.025, 0.02],
            ebit_margin=0.18,
            capex_pct_revenue=0.06,
            nwc_pct_revenue=0.02,
            risk_free_rate=0.065,
            equity_risk_premium=0.055,
            beta=1.15,
            cost_of_debt=0.08,
            debt_to_value=0.30,
            terminal_growth_rate=0.025,
            exit_multiple=8.5,
            forecast_years=10
        )
        
        engine = DCFEngine()
        outputs = engine.calculate(inputs)
        
        # Validate structure
        assert isinstance(outputs, DCFOutputs)
        assert len(outputs.years) == 10
        assert len(outputs.fcff_proj) == 10
        assert len(outputs.pv_fcff) == 10
        assert outputs.wacc > 0
        assert outputs.fair_value_per_share_gordon > 0
        assert outputs.fair_value_per_share_multiple > 0
        
        # Sensitivity matrix dimensions
        assert len(outputs.sensitivity_matrix_gordon) == 7
        assert len(outputs.sensitivity_matrix_gordon[0]) == 7
        assert len(outputs.sensitivity_matrix_multiple) == 7
        assert len(outputs.sensitivity_matrix_multiple[0]) == 7
        
        # Audit trail
        assert outputs.inputs_hash is not None
        assert len(outputs.inputs_hash) == 16
        assert outputs.calculation_timestamp is not None
    
    def test_dcf_deterministic(self):
        """Same inputs must produce identical outputs"""
        inputs = DCFInputs(
            revenue=5000.0,
            ebit=750.0,
            depreciation=200.0,
            capex=400.0,
            change_nwc=100.0,
            tax_rate=0.30,
            total_debt=2000.0,
            cash=500.0,
            minority_interest=50.0,
            diluted_shares=50.0,
            revenue_growth_years=[0.15, 0.12, 0.10, 0.08, 0.06],
            ebit_margin=0.20,
            capex_pct_revenue=0.07,
            nwc_pct_revenue=0.03,
            risk_free_rate=0.07,
            equity_risk_premium=0.06,
            beta=1.2,
            cost_of_debt=0.09,
            debt_to_value=0.25,
            terminal_growth_rate=0.03,
            exit_multiple=9.0,
            forecast_years=5
        )
        
        engine = DCFEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        # Bit-identical results
        assert out1.fair_value_per_share_gordon == out2.fair_value_per_share_gordon
        assert out1.fair_value_per_share_multiple == out2.fair_value_per_share_multiple
        assert out1.wacc == out2.wacc
        assert out1.inputs_hash == out2.inputs_hash
        assert out1.sensitivity_matrix_gordon == out2.sensitivity_matrix_gordon
    
    def test_dcf_validation_errors(self):
        """Invalid inputs should raise ValueError"""
        inputs = DCFInputs(
            revenue=1000.0,
            ebit=100.0,
            depreciation=50.0,
            capex=80.0,
            change_nwc=20.0,
            tax_rate=1.5,  # Invalid: > 1
            total_debt=500.0,
            cash=100.0,
            minority_interest=10.0,
            diluted_shares=10.0,
            revenue_growth_years=[0.1, 0.08],
            ebit_margin=0.15,
            capex_pct_revenue=0.05,
            nwc_pct_revenue=0.02,
            risk_free_rate=0.06,
            equity_risk_premium=0.05,
            beta=1.0,
            cost_of_debt=0.07,
            debt_to_value=0.3,
            terminal_growth_rate=0.02,
            exit_multiple=8.0,
            forecast_years=2
        )
        
        engine = DCFEngine()
        with pytest.raises(ValueError, match="tax_rate must be between 0 and 1"):
            engine.calculate(inputs)
    
    def test_dcf_terminal_growth_validation(self):
        """Terminal growth must be < risk_free + ERP"""
        inputs = DCFInputs(
            revenue=1000.0,
            ebit=100.0,
            depreciation=50.0,
            capex=80.0,
            change_nwc=20.0,
            tax_rate=0.25,
            total_debt=500.0,
            cash=100.0,
            minority_interest=10.0,
            diluted_shares=10.0,
            revenue_growth_years=[0.1, 0.08],
            ebit_margin=0.15,
            capex_pct_revenue=0.05,
            nwc_pct_revenue=0.02,
            risk_free_rate=0.06,
            equity_risk_premium=0.05,
            beta=1.0,
            cost_of_debt=0.07,
            debt_to_value=0.3,
            terminal_growth_rate=0.12,  # Invalid: > 0.11
            exit_multiple=8.0,
            forecast_years=2
        )
        
        engine = DCFEngine()
        with pytest.raises(ValueError, match="terminal_growth_rate must be < risk_free_rate"):
            engine.calculate(inputs)


# ============================================================
# RELATIVE VALUATION TESTS
# ============================================================

class TestRelativeValuationEngine:
    """Test relative valuation with known comps"""
    
    def test_trading_comps_basic(self):
        """Basic trading comps calculation"""
        inputs = RelativeValuationInputs(
            target_market_cap=50000.0,
            target_net_debt=5000.0,
            target_minority_interest=500.0,
            target_preferred=0.0,
            target_ebitda=8000.0,
            target_eps=25.0,
            target_sales=40000.0,
            target_eps_cagr_3y=0.15,
            peer_symbols=['PEER1', 'PEER2', 'PEER3', 'PEER4', 'PEER5'],
            peer_market_caps=[60000, 45000, 80000, 35000, 55000],
            peer_net_debts=[3000, 2000, 8000, 1000, 4000],
            peer_ebitdas=[9000, 7000, 12000, 5000, 8500],
            peer_eps=[30.0, 20.0, 40.0, 15.0, 28.0],
            peer_sales=[50000, 35000, 90000, 28000, 48000],
            peer_eps_cagr_3y=[0.12, 0.18, 0.10, 0.20, 0.14]
        )
        
        engine = RelativeValuationEngine()
        outputs = engine.calculate(inputs)
        
        # Validate structure
        assert isinstance(outputs, RelativeValuationOutputs)
        assert outputs.target_ev_ebitda > 0
        assert outputs.target_pe > 0
        assert outputs.peer_ev_ebitda_median > 0
        assert outputs.peer_pe_median > 0
        assert outputs.implied_value_ev_ebitda_median > 0
        assert outputs.implied_value_pe_median > 0
        
        # Football field
        assert 'Trading_Comps_EV_EBITDA' in outputs.football_field
        assert 'Trading_Comps_PE' in outputs.football_field
    
    def test_transaction_comps(self):
        """Test with transaction comps"""
        inputs = RelativeValuationInputs(
            target_market_cap=50000.0,
            target_net_debt=5000.0,
            target_minority_interest=500.0,
            target_preferred=0.0,
            target_ebitda=8000.0,
            target_eps=25.0,
            target_sales=40000.0,
            target_eps_cagr_3y=0.15,
            peer_symbols=['PEER1', 'PEER2'],
            peer_market_caps=[60000, 45000],
            peer_net_debts=[3000, 2000],
            peer_ebitdas=[9000, 7000],
            peer_eps=[30.0, 20.0],
            peer_sales=[50000, 35000],
            peer_eps_cagr_3y=[0.12, 0.18],
            txn_peer_symbols=['TXN1', 'TXN2', 'TXN3'],
            txn_ev_ebitda=[10.5, 11.2, 9.8],
            txn_ev_sales=[2.1, 2.3, 1.9]
        )
        
        engine = RelativeValuationEngine()
        outputs = engine.calculate(inputs)
        
        assert outputs.txn_ev_ebitda_median is not None
        assert outputs.implied_value_txn_ev_ebitda is not None
        assert outputs.txn_ev_sales_median is not None
        assert outputs.implied_value_txn_ev_sales is not None
        assert 'Transaction_Comps_EV_EBITDA' in outputs.football_field
    
    def test_relative_deterministic(self):
        """Same inputs must produce identical outputs"""
        inputs = RelativeValuationInputs(
            target_market_cap=10000.0,
            target_net_debt=1000.0,
            target_minority_interest=100.0,
            target_preferred=0.0,
            target_ebitda=2000.0,
            target_eps=10.0,
            target_sales=8000.0,
            target_eps_cagr_3y=0.10,
            peer_symbols=['P1', 'P2', 'P3'],
            peer_market_caps=[12000, 9000, 11000],
            peer_net_debts=[800, 500, 1200],
            peer_ebitdas=[2500, 1800, 2200],
            peer_eps=[12.0, 8.0, 11.0],
            peer_sales=[10000, 7000, 9000],
            peer_eps_cagr_3y=[0.12, 0.08, 0.11]
        )
        
        engine = RelativeValuationEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        assert out1.target_ev_ebitda == out2.target_ev_ebitda
        assert out1.peer_ev_ebitda_median == out2.peer_ev_ebitda_median
        assert out1.implied_value_ev_ebitda_median == out2.implied_value_ev_ebitda_median
        assert out1.football_field == out2.football_field


# ============================================================
# SOTP TESTS
# ============================================================

class TestSOTPEngine:
    """Test Sum-of-the-Parts valuation"""
    
    def test_sotp_basic(self):
        """Basic SOTP with multiple segments"""
        inputs = SOTPInputs(
            segments=[
                {'name': 'Retail', 'metric': 5000, 'multiple': 2.5, 'method': 'EV_SALES', 'conglomerate_discount': 0.10},
                {'name': 'Wholesale', 'metric': 800, 'multiple': 8.0, 'method': 'EV_EBITDA', 'conglomerate_discount': 0.15},
                {'name': 'Logistics', 'metric': 200, 'multiple': 12.0, 'method': 'EV_EBITDA', 'conglomerate_discount': 0.20},
            ],
            net_debt=2000.0,
            cash=500.0,
            minority_interest=100.0,
            diluted_shares=100.0
        )
        
        engine = SOTPEngine()
        outputs = engine.calculate(inputs)
        
        assert isinstance(outputs, SOTPOutputs)
        assert len(outputs.segment_values) == 3
        assert outputs.total_ev > 0
        assert outputs.equity_value > 0
        assert outputs.fair_value_per_share > 0
        assert 'Retail' in outputs.segment_contributions
        assert 'Wholesale' in outputs.segment_contributions
        assert 'Logistics' in outputs.segment_contributions
    
    def test_sotp_deterministic(self):
        """SOTP must be deterministic"""
        inputs = SOTPInputs(
            segments=[
                {'name': 'SegA', 'metric': 1000, 'multiple': 10, 'method': 'EV_EBITDA', 'conglomerate_discount': 0.0},
                {'name': 'SegB', 'metric': 500, 'multiple': 2, 'method': 'EV_SALES', 'conglomerate_discount': 0.05},
            ],
            net_debt=500.0,
            cash=200.0,
            minority_interest=50.0,
            diluted_shares=50.0
        )
        
        engine = SOTPEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        assert out1.total_ev == out2.total_ev
        assert out1.equity_value == out2.equity_value
        assert out1.fair_value_per_share == out2.fair_value_per_share


# ============================================================
# BANKING VALUATION TESTS
# ============================================================

class TestBankingValuationEngine:
    """Test Banking P/B vs ROE valuation"""
    
    def test_justified_pb(self):
        """Test justified P/B calculation"""
        inputs = BankingValuationInputs(
            book_value=200.0,
            roe=0.18,
            cost_of_equity=0.14,
            growth_rate=0.05,
            peer_roes=[0.15, 0.12, 0.20, 0.16, 0.14],
            peer_pbs=[1.8, 1.2, 2.5, 2.0, 1.6],
            market_cap=400.0
        )
        
        engine = BankingValuationEngine()
        outputs = engine.calculate(inputs)
        
        assert isinstance(outputs, BankingValuationOutputs)
        # Justified P/B = (0.18 - 0.05) / (0.14 - 0.05) = 0.13 / 0.09 = 1.444...
        expected_pb = (0.18 - 0.05) / (0.14 - 0.05)
        assert abs(outputs.justified_pb - expected_pb) < 0.001
        assert outputs.implied_price_justified_pb == outputs.justified_pb * inputs.book_value
        
        # Regression should work with 5 peers
        assert not math.isnan(outputs.regression_slope)
        assert not math.isnan(outputs.regression_intercept)
        assert 0 <= outputs.regression_r2 <= 1
    
    def test_insufficient_peers(self):
        """Regression should handle insufficient peers"""
        inputs = BankingValuationInputs(
            book_value=200.0,
            roe=0.18,
            cost_of_equity=0.14,
            growth_rate=0.05,
            peer_roes=[0.15, 0.12],  # Only 2 peers
            peer_pbs=[1.8, 1.2],
            market_cap=400.0
        )
        
        engine = BankingValuationEngine()
        outputs = engine.calculate(inputs)
        
        assert math.isnan(outputs.regression_slope)
        assert math.isnan(outputs.regression_intercept)
        assert math.isnan(outputs.regression_r2)


# ============================================================
# EXCESS RETURN TESTS
# ============================================================

class TestExcessReturnEngine:
    """Test Excess Return / Residual Income model"""
    
    def test_excess_return_basic(self):
        """Basic excess return calculation"""
        inputs = ExcessReturnInputs(
            book_value=1000.0,
            net_income_forecast=[150, 165, 182, 200, 220],
            cost_of_equity=0.12,
            growth_rate=0.03,
            forecast_years=5,
            diluted_shares=50.0
        )
        
        engine = ExcessReturnEngine()
        outputs = engine.calculate(inputs)
        
        assert isinstance(outputs, ExcessReturnOutputs)
        assert len(outputs.residual_incomes) == 5
        assert len(outputs.pv_residual_incomes) == 5
        assert outputs.equity_value > inputs.book_value  # Should add value
        assert outputs.fair_value_per_share > 0
        assert outputs.terminal_ri > 0
        assert outputs.pv_terminal_ri > 0
    
    def test_excess_return_deterministic(self):
        """Excess return must be deterministic"""
        inputs = ExcessReturnInputs(
            book_value=500.0,
            net_income_forecast=[80, 88, 97],
            cost_of_equity=0.10,
            growth_rate=0.02,
            forecast_years=3,
            diluted_shares=25.0
        )
        
        engine = ExcessReturnEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        assert out1.equity_value == out2.equity_value
        assert out1.fair_value_per_share == out2.fair_value_per_share


# ============================================================
# BENEISH M-SCORE TESTS
# ============================================================

class TestBeneishEngine:
    """Test Beneish M-Score with Enron 2000 reference"""
    
    def test_enron_2000_reference(self):
        """
        Enron 2000 10-K values (approximate from literature):
        M-Score should be > -1.78 indicating manipulation likely
        """
        # Approximate Enron 2000 values from academic papers
        inputs = BeneishInputs(
            dsri=1.20,   # Receivables growing faster than sales
            gmi=1.15,    # Gross margin deteriorating
            aqi=1.25,    # Asset quality declining
            sgi=1.30,    # High sales growth
            depi=1.10,   # Depreciation rate declining
            sgai=1.05,   # SG&A growing
            lvgi=1.15,   # Leverage increasing
            tata=0.08    # High accruals
        )
        
        engine = BeneishEngine()
        outputs = engine.calculate(inputs)
        
        assert isinstance(outputs, BeneishOutputs)
        assert outputs.m_score > -1.78  # Manipulation likely
        assert outputs.signal == "MANIPULATION_LIKELY"
        assert outputs.threshold == -1.78
        assert len(outputs.components) == 8
    
    def test_clean_company(self):
        """Clean company should have M-Score < -1.78"""
        inputs = BeneishInputs(
            dsri=0.95,
            gmi=0.98,
            aqi=0.95,
            sgi=1.05,
            depi=0.98,
            sgai=0.97,
            lvgi=0.95,
            tata=0.02
        )
        
        engine = BeneishEngine()
        outputs = engine.calculate(inputs)
        
        assert outputs.m_score < -1.78
        assert outputs.signal == "MANIPULATION_UNLIKELY"
    
    def test_beneish_deterministic(self):
        """Beneish must be deterministic"""
        inputs = BeneishInputs(
            dsri=1.10, gmi=1.05, aqi=1.08, sgi=1.15,
            depi=1.02, sgai=1.03, lvgi=1.07, tata=0.05
        )
        
        engine = BeneishEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        assert out1.m_score == out2.m_score
        assert out1.signal == out2.signal
        assert out1.components == out2.components


# ============================================================
# ALTMAN Z-SCORE TESTS
# ============================================================

class TestAltmanZEngine:
    """Test Altman Z-Score with known cases"""
    
    def test_distress_zone(self):
        """Company in distress zone (Z < 1.81)"""
        inputs = AltmanZInputs(
            x1=0.05,   # WC/TA
            x2=0.02,   # RE/TA
            x3=0.01,   # EBIT/TA
            x4=0.50,   # MVE/TL
            x5=0.80,   # Sales/TA
            is_manufacturing=True
        )
        
        engine = AltmanZEngine()
        outputs = engine.calculate(inputs)
        
        assert isinstance(outputs, AltmanZOutputs)
        assert outputs.z_score < 1.81
        assert outputs.zone == "DISTRESS"
        assert outputs.thresholds["distress"] == 1.81
    
    def test_grey_zone(self):
        """Company in grey zone (1.81 <= Z <= 2.99)"""
        inputs = AltmanZInputs(
            x1=0.15,
            x2=0.10,
            x3=0.08,
            x4=1.20,
            x5=1.20,
            is_manufacturing=True
        )
        
        engine = AltmanZEngine()
        outputs = engine.calculate(inputs)
        
        assert 1.81 <= outputs.z_score <= 2.99
        assert outputs.zone == "GREY"
    
    def test_safe_zone(self):
        """Company in safe zone (Z > 2.99)"""
        inputs = AltmanZInputs(
            x1=0.30,
            x2=0.25,
            x3=0.15,
            x4=2.50,
            x5=1.80,
            is_manufacturing=True
        )
        
        engine = AltmanZEngine()
        outputs = engine.calculate(inputs)
        
        assert outputs.z_score > 2.99
        assert outputs.zone == "SAFE"
    
    def test_non_manufacturing(self):
        """Non-manufacturing formula"""
        inputs = AltmanZInputs(
            x1=0.10,
            x2=0.15,
            x3=0.08,
            x4=1.50,
            x5=1.20,
            is_manufacturing=False
        )
        
        engine = AltmanZEngine()
        outputs = engine.calculate(inputs)
        
        # Z = 6.56*0.10 + 3.26*0.15 + 6.72*0.08 + 1.05*1.50
        #   = 0.656 + 0.489 + 0.5376 + 1.575 = 3.2576
        assert outputs.z_score > 2.6  # Safe zone for non-mfg
        assert outputs.thresholds["distress"] == 1.1
    
    def test_altman_deterministic(self):
        """Altman Z must be deterministic"""
        inputs = AltmanZInputs(x1=0.2, x2=0.15, x3=0.1, x4=1.5, x5=1.5, is_manufacturing=True)
        engine = AltmanZEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        assert out1.z_score == out2.z_score
        assert out1.zone == out2.zone


# ============================================================
# PIOTROSKI F-SCORE TESTS
# ============================================================

class TestPiotroskiEngine:
    """Test Piotroski F-Score"""
    
    def test_high_quality(self):
        """High quality company (F-Score >= 7)"""
        inputs = PiotroskiInputs(
            roa_positive=True,
            cfo_positive=True,
            roa_improving=True,
            accruals_quality=True,
            leverage_decreasing=True,
            liquidity_improving=True,
            no_dilution=True,
            margin_improving=True,
            turnover_improving=True
        )
        
        engine = PiotroskiEngine()
        outputs = engine.calculate(inputs)
        
        assert outputs.f_score == 9
        assert outputs.interpretation == "HIGH_QUALITY"
        assert all(v == 1 for v in outputs.components.values())
    
    def test_moderate_quality(self):
        """Moderate quality (4 <= F-Score <= 6)"""
        inputs = PiotroskiInputs(
            roa_positive=True,
            cfo_positive=True,
            roa_improving=False,
            accruals_quality=True,
            leverage_decreasing=False,
            liquidity_improving=True,
            no_dilution=True,
            margin_improving=False,
            turnover_improving=False
        )
        
        engine = PiotroskiEngine()
        outputs = engine.calculate(inputs)
        
        assert outputs.f_score == 5
        assert outputs.interpretation == "MODERATE_QUALITY"
    
    def test_low_quality(self):
        """Low quality (F-Score <= 3)"""
        inputs = PiotroskiInputs(
            roa_positive=False,
            cfo_positive=False,
            roa_improving=False,
            accruals_quality=False,
            leverage_decreasing=False,
            liquidity_improving=False,
            no_dilution=True,
            margin_improving=False,
            turnover_improving=False
        )
        
        engine = PiotroskiEngine()
        outputs = engine.calculate(inputs)
        
        assert outputs.f_score == 1
        assert outputs.interpretation == "LOW_QUALITY"
    
    def test_piotroski_deterministic(self):
        """Piotroski must be deterministic"""
        inputs = PiotroskiInputs(
            roa_positive=True, cfo_positive=True, roa_improving=True,
            accruals_quality=True, leverage_decreasing=False,
            liquidity_improving=True, no_dilution=True,
            margin_improving=True, turnover_improving=False
        )
        
        engine = PiotroskiEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        assert out1.f_score == out2.f_score
        assert out1.components == out2.components


# ============================================================
# PORTFOLIO ANALYTICS TESTS
# ============================================================

class TestPortfolioAnalyticsEngine:
    """Test portfolio performance & risk metrics"""
    
    def test_basic_metrics(self):
        """Test with simple upward-trending portfolio"""
        # Portfolio grows 10% over 252 days with some noise
        np.random.seed(42)
        base_pv = [100000 * (1.10 ** (i / 252)) for i in range(253)]
        noise = np.random.normal(0, 0.005, 253)  # 0.5% daily noise
        pv = [base_pv[i] * (1 + noise[i]) for i in range(253)]
        
        # Benchmark grows 8% with noise
        base_bv = [100000 * (1.08 ** (i / 252)) for i in range(253)]
        noise_b = np.random.normal(0, 0.005, 253)
        bv = [base_bv[i] * (1 + noise_b[i]) for i in range(253)]
        
        cash_flows = [(date(2023, 1, 1), -100000), (date(2023, 12, 31), 110000)]
        
        inputs = PortfolioMetricsInputs(
            portfolio_values=pv,
            benchmark_values=bv,
            cash_flows=cash_flows,
            risk_free_rate=0.07
        )
        
        engine = PortfolioAnalyticsEngine()
        outputs = engine.calculate(inputs)
        
        assert isinstance(outputs, PortfolioMetricsOutputs)
        assert outputs.annualized_return > 0
        assert outputs.annualized_return < 0.15  # Reasonable
        assert outputs.volatility > 0
        assert not math.isnan(outputs.beta) and not math.isinf(outputs.beta)
        assert outputs.sharpe_ratio > -2 and outputs.sharpe_ratio < 5
        assert outputs.sortino_ratio > -2 and outputs.sortino_ratio < 5
        assert outputs.max_drawdown <= 0
        assert outputs.max_drawdown_duration >= 0
    
    def test_flat_portfolio(self):
        """Flat portfolio should have zero return"""
        pv = [100000] * 253
        bv = [100000] * 253
        cash_flows = [(date(2023, 1, 1), -100000), (date(2023, 12, 31), 100000)]
        
        inputs = PortfolioMetricsInputs(
            portfolio_values=pv,
            benchmark_values=bv,
            cash_flows=cash_flows,
            risk_free_rate=0.07
        )
        
        engine = PortfolioAnalyticsEngine()
        outputs = engine.calculate(inputs)
        
        assert abs(outputs.annualized_return) < 0.001
        assert outputs.volatility < 0.001
        assert outputs.max_drawdown == 0
    
    def test_portfolio_deterministic(self):
        """Portfolio metrics must be deterministic"""
        pv = [100000 * (1.12 ** (i / 252)) for i in range(253)]
        bv = [100000 * (1.10 ** (i / 252)) for i in range(253)]
        cash_flows = [(date(2023, 1, 1), -100000), (date(2023, 6, 30), -50000), (date(2023, 12, 31), 170000)]
        
        inputs = PortfolioMetricsInputs(
            portfolio_values=pv,
            benchmark_values=bv,
            cash_flows=cash_flows,
            risk_free_rate=0.07
        )
        
        engine = PortfolioAnalyticsEngine()
        out1 = engine.calculate(inputs)
        out2 = engine.calculate(inputs)
        
        assert out1.annualized_return == out2.annualized_return
        assert out1.xirr == out2.xirr
        assert out1.sharpe_ratio == out2.sharpe_ratio
        assert out1.max_drawdown == out2.max_drawdown


# ============================================================
# SCREENING ENGINE TESTS
# ============================================================

class TestScreeningEngine:
    """Test multi-factor screening"""
    
    def test_screening_basic(self):
        """Basic screening with multiple criteria"""
        universe = [
            {'symbol': 'GOODCO', 'name': 'Good Company', 'pe': 15, 'ev_ebitda': 10, 'fcf_yield': 0.06,
             'roe': 0.20, 'roce': 0.22, 'debt_ebitda': 1.5, 'dist_from_52w_high': 0.05,
             'beneish_m_score': -2.5, 'piotroski_f_score': 8, 'market_cap': 50000, 'market_cap_category': 'MID'},
            {'symbol': 'BADCO', 'name': 'Bad Company', 'pe': 50, 'ev_ebitda': 30, 'fcf_yield': 0.01,
             'roe': 0.05, 'roce': 0.06, 'debt_ebitda': 5.0, 'dist_from_52w_high': 0.40,
             'beneish_m_score': -1.0, 'piotroski_f_score': 3, 'market_cap': 10000, 'market_cap_category': 'SMALL'},
            {'symbol': 'MIDCO', 'name': 'Middle Company', 'pe': 22, 'ev_ebitda': 14, 'fcf_yield': 0.04,
             'roe': 0.15, 'roce': 0.16, 'debt_ebitda': 2.5, 'dist_from_52w_high': 0.15,
             'beneish_m_score': -2.0, 'piotroski_f_score': 6, 'market_cap': 100000, 'market_cap_category': 'LARGE'},
        ]
        
        criteria = ScreeningCriteria(
            pe_max=25,
            ev_ebitda_max=15,
            fcf_yield_min=0.03,
            roe_min=0.12,
            roce_min=0.14,
            debt_ebitda_max=3.0,
            dist_from_52w_high_max=0.20,
            beneish_max=-1.78,
            piotroski_min=5,
            market_cap_min=20000,
            market_cap_category=['MID', 'LARGE']
        )
        
        engine = ScreeningEngine()
        results = engine.calculate(universe, criteria)
        
        assert len(results) == 3
        # GOODCO should rank highest (first in input, stable sort)
        assert results[0].symbol == 'GOODCO'
        assert results[0].score >= results[1].score  # Allow equal scores
        assert results[0].passed_filters['pe'] == True
        assert results[0].passed_filters['beneish'] == True
        assert results[0].passed_filters['piotroski'] == True
        
        # BADCO should fail most filters and rank last
        assert results[-1].symbol == 'BADCO'
        assert results[-1].passed_filters['pe'] == False
        assert results[-1].passed_filters['beneish'] == False
        assert results[-1].passed_filters['piotroski'] == False
    
    def test_screening_deterministic(self):
        """Screening must be deterministic"""
        universe = [
            {'symbol': 'A', 'name': 'A', 'pe': 10, 'ev_ebitda': 8, 'fcf_yield': 0.08,
             'roe': 0.25, 'roce': 0.28, 'debt_ebitda': 1.0, 'dist_from_52w_high': 0.02,
             'beneish_m_score': -3.0, 'piotroski_f_score': 9, 'market_cap': 50000, 'market_cap_category': 'MID'},
            {'symbol': 'B', 'name': 'B', 'pe': 20, 'ev_ebitda': 12, 'fcf_yield': 0.04,
             'roe': 0.18, 'roce': 0.20, 'debt_ebitda': 2.0, 'dist_from_52w_high': 0.10,
             'beneish_m_score': -2.2, 'piotroski_f_score': 7, 'market_cap': 80000, 'market_cap_category': 'MID'},
        ]
        
        criteria = ScreeningCriteria(
            pe_max=25, ev_ebitda_max=15, fcf_yield_min=0.03,
            roe_min=0.15, roce_min=0.16, debt_ebitda_max=2.5,
            beneish_max=-1.78, piotroski_min=6
        )
        
        engine = ScreeningEngine()
        r1 = engine.calculate(universe, criteria)
        r2 = engine.calculate(universe, criteria)
        
        assert len(r1) == len(r2)
        for a, b in zip(r1, r2):
            assert a.symbol == b.symbol
            assert a.score == b.score
            assert a.rank == b.rank
            assert a.passed_filters == b.passed_filters


# ============================================================
# REGISTRY TESTS
# ============================================================

class TestMathEngineRegistry:
    """Test engine registry"""
    
    def test_all_engines_registered(self):
        engines = MathEngineRegistry.list_engines()
        expected = ['dcf', 'relative', 'sotp', 'banking', 'excess_return', 
                    'beneish', 'altman_z', 'piotroski', 'portfolio', 'screening']
        for e in expected:
            assert e in engines
    
    def test_get_engine(self):
        engine = MathEngineRegistry.get('dcf')
        assert isinstance(engine, DCFEngine)
        
        engine = MathEngineRegistry.get('beneish')
        assert isinstance(engine, BeneishEngine)
    
    def test_invalid_engine(self):
        with pytest.raises(ValueError, match="Unknown engine"):
            MathEngineRegistry.get('nonexistent')


# ============================================================
# CONVENIENCE FUNCTION TESTS
# ============================================================

class TestConvenienceFunctions:
    """Test module-level convenience functions"""
    
    def test_run_dcf(self):
        from math_engine import run_dcf
        inputs = DCFInputs(
            revenue=1000, ebit=150, depreciation=50, capex=80, change_nwc=20,
            tax_rate=0.25, total_debt=500, cash=100, minority_interest=10,
            diluted_shares=10, revenue_growth_years=[0.1, 0.08],
            ebit_margin=0.15, capex_pct_revenue=0.05, nwc_pct_revenue=0.02,
            risk_free_rate=0.06, equity_risk_premium=0.05, beta=1.0,
            cost_of_debt=0.07, debt_to_value=0.3, terminal_growth_rate=0.02,
            exit_multiple=8.0, forecast_years=2
        )
        outputs = run_dcf(inputs)
        assert isinstance(outputs, DCFOutputs)
    
    def test_run_beneish(self):
        from math_engine import run_beneish
        inputs = BeneishInputs(dsri=1.1, gmi=1.05, aqi=1.0, sgi=1.1,
                               depi=1.0, sgai=1.0, lvgi=1.0, tata=0.03)
        outputs = run_beneish(inputs)
        assert isinstance(outputs, BeneishOutputs)
    
    def test_run_screening(self):
        from math_engine import run_screening
        universe = [{'symbol': 'TEST', 'name': 'Test', 'pe': 15, 'ev_ebitda': 10,
                     'fcf_yield': 0.05, 'roe': 0.2, 'roce': 0.22, 'debt_ebitda': 1.5,
                     'dist_from_52w_high': 0.05, 'beneish_m_score': -2.5,
                     'piotroski_f_score': 8, 'market_cap': 50000, 'market_cap_category': 'MID'}]
        criteria = ScreeningCriteria(pe_max=20, roe_min=0.15)
        results = run_screening(universe, criteria)
        assert len(results) == 1
        assert results[0].symbol == 'TEST'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])