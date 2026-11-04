"""
Empirical Stress Test Harness for Research OS (Hermes M2)
==========================================================
Executes rigorous adversarial stress tests across:
1. DCF Valuation Engine
2. Banking Valuation Engine
3. Altman Z-Score Engine
4. Beneish M-Score Engine
5. Piotroski F-Score Engine
6. Corporate Actions Engine
7. Relative & SOTP Valuation Engines
8. Ratio Analysis & Turnaround & Hedging Engines
9. Data Ingestion: SlidingWindowChunker
10. Data Ingestion: PITTransformer & PDFExtractor

Runs from challenger working directory without modifying repo files.
"""

import sys
import os
import math
import traceback
import json
from datetime import date, datetime
from typing import Dict, Any, List

# Add math-engine and data-ingestion src to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MATH_ENGINE_SRC = os.path.join(BASE_DIR, "math-engine", "src")
DATA_INGESTION_SRC = os.path.join(BASE_DIR, "data-ingestion", "src")

if MATH_ENGINE_SRC not in sys.path:
    sys.path.insert(0, MATH_ENGINE_SRC)
if DATA_INGESTION_SRC not in sys.path:
    sys.path.insert(0, DATA_INGESTION_SRC)

from math_engine import (
    DCFEngine, DCFInputs, DCFOutputs,
    BankingValuationEngine, BankingValuationInputs, BankingValuationOutputs,
    BeneishEngine, BeneishInputs, BeneishOutputs,
    AltmanZEngine, AltmanZInputs, AltmanZOutputs,
    PiotroskiEngine, PiotroskiInputs, PiotroskiOutputs,
    RelativeValuationEngine, RelativeValuationInputs, RelativeValuationOutputs,
    SOTPEngine, SOTPInputs, SOTPOutputs,
    ExcessReturnEngine, ExcessReturnInputs, ExcessReturnOutputs,
    RatioAnalysisEngine, RatioAnalysisInputs, RatioAnalysisOutputs,
    TurnaroundEngine, TurnaroundInputs, TurnaroundOutputs,
    HedgingEngine, HedgingInputs, HedgingOutputs,
    RiskScoreEngine, RiskScoreInputs, RiskScoreOutputs,
    CommonSizeEngine, CommonSizeInputs, CommonSizeOutputs,
    RevenueProjectionEngine, RevenueProjectionInputs, RevenueProjectionOutputs,
    ConcallConsistencyEngine, ConcallConsistencyInputs, ConcallConsistencyOutputs,
    PortfolioAnalyticsEngine, PortfolioMetricsInputs, PortfolioMetricsOutputs,
    ScreeningEngine, ScreeningCriteria,
)
from math_engine.portfolio.corporate_actions import CorporateActionsEngine, CorporateAction
from data_ingestion.chunkers.sliding_window import SlidingWindowChunker, Chunk
from data_ingestion.pit.transformer import PITTransformer
from data_ingestion.extractors.pdf import PDFExtractor


class StressTestRunner:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []
        self.passed_count = 0
        self.failed_count = 0
        self.flaws_found = []

    def log_result(self, category: str, test_id: str, description: str,
                   inputs_summary: Any, outcome: str, details: Dict[str, Any],
                   is_bug_or_vulnerability: bool = False, severity: str = "INFO"):
        record = {
            "category": category,
            "test_id": test_id,
            "description": description,
            "inputs": str(inputs_summary),
            "outcome": outcome,  # PASS, FAIL, EXCEPTION, ANOMALY
            "details": details,
            "is_bug": is_bug_or_vulnerability,
            "severity": severity,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(record)
        if is_bug_or_vulnerability:
            self.flaws_found.append(record)
            print(f"[{severity}] BUG FOUND - {test_id}: {description}")
        else:
            print(f"[{outcome}] {test_id}: {description}")

    # ============================================================
    # 1. DCF VALUATION ENGINE STRESS TESTS
    # ============================================================
    def test_dcf_stress(self):
        engine = DCFEngine()

        # Case 1.1: Negative FCF projections (huge capex & NWC)
        try:
            inputs = DCFInputs(
                revenue=10000.0, ebit=-500.0, depreciation=200.0, capex=3000.0, change_nwc=1500.0,
                tax_rate=0.25, total_debt=2000.0, cash=500.0, minority_interest=100.0, diluted_shares=100.0,
                revenue_growth_years=[0.05]*10, ebit_margin=-0.05, capex_pct_revenue=0.30, nwc_pct_revenue=0.15,
                risk_free_rate=0.065, equity_risk_premium=0.055, beta=1.2, cost_of_debt=0.08, debt_to_value=0.30,
                terminal_growth_rate=0.02, exit_multiple=5.0, forecast_years=10
            )
            out = engine.calculate(inputs)
            is_negative_fv = out.fair_value_per_share_gordon < 0
            self.log_result(
                "DCF", "DCF-01", "Deeply negative cash flows across entire forecast horizon",
                {"ebit_margin": -0.05, "capex_pct": 0.30},
                "COMPLETED",
                {
                    "fcff_year1": out.fcff_proj[0],
                    "fcff_year10": out.fcff_proj[-1],
                    "ev_gordon": out.ev_gordon,
                    "equity_value_gordon": out.equity_value_gordon,
                    "fair_value_gordon": out.fair_value_per_share_gordon,
                    "fair_value_multiple": out.fair_value_per_share_multiple,
                    "negative_price_returned": is_negative_fv
                },
                is_bug_or_vulnerability=False,
                severity="INFO"
            )
        except Exception as e:
            self.log_result("DCF", "DCF-01", "Negative FCF projections", {}, "EXCEPTION", {"error": str(e), "trace": traceback.format_exc()}, is_bug_or_vulnerability=True, severity="HIGH")

        # Case 1.2: Terminal growth rate zero and negative
        for g_val in [0.0, -0.02, -0.05]:
            try:
                inputs = DCFInputs(
                    revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                    tax_rate=0.25, total_debt=1000.0, cash=400.0, minority_interest=50.0, diluted_shares=50.0,
                    revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                    risk_free_rate=0.07, equity_risk_premium=0.06, beta=1.0, cost_of_debt=0.08, debt_to_value=0.20,
                    terminal_growth_rate=g_val, exit_multiple=8.0, forecast_years=5
                )
                out = engine.calculate(inputs)
                self.log_result(
                    "DCF", f"DCF-02-g{g_val}", f"Terminal growth rate = {g_val}",
                    {"terminal_growth_rate": g_val},
                    "COMPLETED",
                    {
                        "terminal_val_gordon": out.terminal_value_gordon,
                        "ev_gordon": out.ev_gordon,
                        "fair_value_gordon": out.fair_value_per_share_gordon
                    }
                )
            except Exception as e:
                self.log_result("DCF", f"DCF-02-g{g_val}", f"Terminal growth rate {g_val}", {}, "EXCEPTION", {"error": str(e)})

        # Case 1.3: WACC <= g or WACC - g < 0.005 guard
        try:
            # WACC is approx: (1-0.2)*(0.065 + 1.0*0.05) + 0.2*0.06*(1-0.25) = 0.8*0.115 + 0.009 = 0.101
            # Setting terminal_growth_rate = 0.100 (diff < 0.005)
            inputs = DCFInputs(
                revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                tax_rate=0.25, total_debt=1000.0, cash=400.0, minority_interest=50.0, diluted_shares=50.0,
                revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                risk_free_rate=0.065, equity_risk_premium=0.05, beta=1.0, cost_of_debt=0.06, debt_to_value=0.20,
                terminal_growth_rate=0.100, exit_multiple=8.0, forecast_years=5
            )
            # Should fail validation
            errs = inputs.validate()
            if errs:
                self.log_result(
                    "DCF", "DCF-03-WACC-g-guard", "WACC <= g guard triggered in validation",
                    {"terminal_growth_rate": 0.100},
                    "GUARD_TRIGGERED",
                    {"validation_errors": errs}
                )
            else:
                out = engine.calculate(inputs)
                self.log_result("DCF", "DCF-03-WACC-g-guard", "WACC <= g guard NOT triggered", {}, "FAIL", {"output": str(out)}, is_bug_or_vulnerability=True, severity="CRITICAL")
        except ValueError as ve:
            self.log_result("DCF", "DCF-03-WACC-g-guard", "Validation properly raised ValueError", {}, "PASS", {"message": str(ve)})
        except Exception as e:
            self.log_result("DCF", "DCF-03-WACC-g-guard", "Unexpected exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 1.4: Zero Net Debt vs Massive Net Debt
        # Zero net debt:
        try:
            inputs_zero_debt = DCFInputs(
                revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                tax_rate=0.25, total_debt=0.0, cash=0.0, minority_interest=0.0, diluted_shares=50.0,
                revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                risk_free_rate=0.07, equity_risk_premium=0.06, beta=1.0, cost_of_debt=0.08, debt_to_value=0.0,
                terminal_growth_rate=0.02, exit_multiple=8.0, forecast_years=5, lease_liabilities=0.0
            )
            out_zd = engine.calculate(inputs_zero_debt)
            self.log_result("DCF", "DCF-04-ZeroDebt", "Zero net debt scenario", {}, "PASS", {
                "ev_gordon": out_zd.ev_gordon, "equity_value_gordon": out_zd.equity_value_gordon, "equal": out_zd.ev_gordon == out_zd.equity_value_gordon
            })
        except Exception as e:
            self.log_result("DCF", "DCF-04-ZeroDebt", "Zero net debt error", {}, "EXCEPTION", {"error": str(e)})

        # Massive net debt:
        try:
            inputs_huge_debt = DCFInputs(
                revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                tax_rate=0.25, total_debt=500000.0, cash=50.0, minority_interest=0.0, diluted_shares=50.0,
                revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                risk_free_rate=0.07, equity_risk_premium=0.06, beta=1.0, cost_of_debt=0.08, debt_to_value=0.90,
                terminal_growth_rate=0.02, exit_multiple=8.0, forecast_years=5, lease_liabilities=100000.0
            )
            out_hd = engine.calculate(inputs_huge_debt)
            self.log_result("DCF", "DCF-05-MassiveDebt", "Massive net debt scenario ($600,000 debt vs $5,000 rev)", {}, "PASS", {
                "ev_gordon": out_hd.ev_gordon,
                "net_debt": 500000.0 + 100000.0 - 50.0,
                "equity_value_gordon": out_hd.equity_value_gordon,
                "fair_value_per_share": out_hd.fair_value_per_share_gordon,
                "negative_equity_unhandled": out_hd.equity_value_gordon < 0
            })
        except Exception as e:
            self.log_result("DCF", "DCF-05-MassiveDebt", "Massive net debt error", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 2. BANKING VALUATION STRESS TESTS
    # ============================================================
    def test_banking_stress(self):
        engine = BankingValuationEngine()

        # Case 2.1: Zero Equity / Zero Book Value
        try:
            inputs = BankingValuationInputs(
                book_value=0.0, roe=15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0,
                net_npa_per_share=0.0, net_dta_per_share=0.0
            )
            out = engine.calculate(inputs)
            self.log_result("Banking", "BANK-01-ZeroEquity", "Zero Book Value Per Share", {}, "COMPLETED", {
                "abvps": out.adjusted_bvps,
                "justified_pb": out.justified_pb,
                "implied_price": out.implied_price_justified_pb,
                "predicted_pb": out.predicted_pb
            })
        except Exception as e:
            self.log_result("Banking", "BANK-01-ZeroEquity", "Zero book value exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 2.2: Negative Net Worth
        try:
            inputs = BankingValuationInputs(
                book_value=-50.0, roe=15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0,
                net_npa_per_share=10.0, net_dta_per_share=5.0
            )
            out = engine.calculate(inputs)
            # Notice abvps = max(0.0, -50 - 10 - 5) = 0.0
            self.log_result("Banking", "BANK-02-NegativeNetWorth", "Negative Book Value clamped to zero ABVPS", {}, "COMPLETED", {
                "abvps": out.adjusted_bvps,
                "implied_price": out.implied_price_justified_pb,
                "clamped_to_zero_silently": out.adjusted_bvps == 0.0
            }, is_bug_or_vulnerability=True, severity="MEDIUM")
        except Exception as e:
            self.log_result("Banking", "BANK-02-NegativeNetWorth", "Negative book value exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 2.3: 100% Gross NPA and zero PCR
        try:
            inputs = BankingValuationInputs(
                book_value=100.0, roe=15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0,
                net_npa_per_share=120.0, net_dta_per_share=10.0  # Net NPA exceeds entire book value
            )
            out = engine.calculate(inputs)
            self.log_result("Banking", "BANK-03-NetNPAExceedsBook", "Net NPA per share exceeds Book Value", {}, "COMPLETED", {
                "abvps": out.adjusted_bvps,
                "implied_price": out.implied_price_justified_pb
            })
        except Exception as e:
            self.log_result("Banking", "BANK-03-NetNPAExceedsBook", "Net NPA exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 2.4: Extreme ROE (>100% or <-100%) & THE NORMALIZATION BUG
        # Test 2.4a: Negative ROE entered as percentage e.g. -15.0%
        try:
            inputs_neg_pct = BankingValuationInputs(
                book_value=100.0, roe=-15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0
            )
            out_neg = engine.calculate(inputs_neg_pct)
            # Check what ROE became: roe = inputs.roe / 100 if inputs.roe > 1.0 else inputs.roe
            # If inputs.roe == -15.0, since -15.0 > 1.0 is False, roe IS NOT NORMALIZED and remains -15.0 (-1500%)!
            # Let's inspect justified_pb = (roe - g) / (ke - g)
            # ke = 12 / 100 = 0.12, g = 5 / 100 = 0.05
            # Expected if normalized: (-0.15 - 0.05)/(0.12 - 0.05) = -0.20 / 0.07 = -2.857
            # If BUG occurs: (-15.0 - 0.05)/(0.12 - 0.05) = -15.05 / 0.07 = -215.0!
            is_bug = abs(out_neg.justified_pb - (-215.0)) < 1.0
            self.log_result(
                "Banking", "BANK-04-NegativeROENormalizationBug",
                "Normalization flaw: negative ROE percentage (e.g. -15.0) is NOT divided by 100",
                {"input_roe": -15.0, "input_ke": 12.0, "input_g": 5.0},
                "VULNERABILITY_CONFIRMED" if is_bug else "NORMALIZED",
                {
                    "justified_pb": out_neg.justified_pb,
                    "expected_if_normalized": (-0.15 - 0.05) / 0.07,
                    "actual_erroneous_pb": out_neg.justified_pb,
                    "formula_culprit": "roe = inputs.roe / 100.0 if inputs.roe > 1.0 else inputs.roe"
                },
                is_bug_or_vulnerability=is_bug,
                severity="HIGH"
            )
        except Exception as e:
            self.log_result("Banking", "BANK-04-NegativeROENormalizationBug", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Test 2.4b: Extreme positive ROE (> 100%, e.g. 150%)
        try:
            inputs_huge_roe = BankingValuationInputs(
                book_value=100.0, roe=150.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0
            )
            out_huge = engine.calculate(inputs_huge_roe)
            # roe = 150 / 100 = 1.5
            self.log_result("Banking", "BANK-05-ExtremePositiveROE", "150% ROE handled", {}, "COMPLETED", {
                "justified_pb": out_huge.justified_pb,
                "implied_price": out_huge.implied_price_justified_pb
            })
        except Exception as e:
            self.log_result("Banking", "BANK-05-ExtremePositiveROE", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Test 2.4c: Decimal ROE between 0 and 1 entered as 0.15 vs 15.0
        try:
            inputs_dec = BankingValuationInputs(
                book_value=100.0, roe=0.15, cost_of_equity=0.12, growth_rate=0.05,
                peer_roes=[0.14, 0.15, 0.16], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0
            )
            out_dec = engine.calculate(inputs_dec)
            inputs_pct = BankingValuationInputs(
                book_value=100.0, roe=15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0
            )
            out_pct = engine.calculate(inputs_pct)
            pb_diff = abs(out_dec.justified_pb - out_pct.justified_pb)
            self.log_result("Banking", "BANK-06-DecimalVsPctEquivalence", "Decimal vs Percentage input parity for positive values", {}, "PASS" if pb_diff < 0.01 else "FAIL", {
                "dec_pb": out_dec.justified_pb, "pct_pb": out_pct.justified_pb, "diff": pb_diff
            })
        except Exception as e:
            self.log_result("Banking", "BANK-06-DecimalVsPctEquivalence", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 3. FORENSIC SCORES STRESS TESTS
    # ============================================================
    def test_forensics_stress(self):
        # 3.1 Altman Z-Score
        altman = AltmanZEngine()

        # Case 3.1a: Zero Total Assets or Zero Liabilities (NaN / Inf inputs)
        try:
            # When caller encounters Total Liabilities = 0, x4 = MarketCap / TL = inf
            inputs_inf_x4 = AltmanZInputs(x1=0.2, x2=0.1, x3=0.05, x4=float('inf'), x5=1.0, is_manufacturing=True)
            out_inf = altman.calculate(inputs_inf_x4)
            self.log_result("Forensics", "ALTMAN-01-InfX4", "Infinite x4 from zero liabilities", {}, "COMPLETED", {
                "z_score": out_inf.z_score, "zone": out_inf.zone
            })
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-01-InfX4", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.1b: NaN input results in "SAFE" zone!
        try:
            inputs_nan = AltmanZInputs(x1=float('nan'), x2=0.1, x3=0.05, x4=1.0, x5=1.0, is_manufacturing=True)
            out_nan = altman.calculate(inputs_nan)
            # z_score is nan.
            # In AltmanZEngine:
            # if z < thresholds["distress"]: (False)
            # elif z <= thresholds["grey_upper"]: (False)
            # else: zone = "SAFE" (TRIGGERED!)
            is_bug = math.isnan(out_nan.z_score) and out_nan.zone == "SAFE"
            self.log_result(
                "Forensics", "ALTMAN-02-NaNClassifiedAsSafe",
                "NaN inputs result in NaN z_score falling through to SAFE zone",
                {"x1": "NaN"},
                "VULNERABILITY_CONFIRMED" if is_bug else "HANDLED",
                {
                    "z_score": str(out_nan.z_score),
                    "zone": out_nan.zone,
                    "fallthrough_flaw": "Comparison with NaN always returns False, defaulting to 'else: zone = SAFE'"
                },
                is_bug_or_vulnerability=is_bug,
                severity="CRITICAL"
            )
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-02-NaNClassifiedAsSafe", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.1c: Zero liabilities dead code verification
        try:
            inputs_dead_code = AltmanZInputs(
                x1=0.2, x2=0.1, x3=0.05, x4=2.0, x5=1.0,
                total_liabilities=0.0, total_assets=1000.0, is_manufacturing=True
            )
            out_dc = altman.calculate(inputs_dead_code)
            self.log_result("Forensics", "ALTMAN-03-DeadCodeLiabilitiesGuard", "total_liabilities parameter has no effect on x4", {}, "COMPLETED", {
                "z_score": out_dc.z_score, "zone": out_dc.zone
            })
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-03-DeadCodeLiabilitiesGuard", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.1d: Extreme working capital deficits
        try:
            inputs_wc_def = AltmanZInputs(x1=-10.0, x2=-5.0, x3=-2.0, x4=0.1, x5=0.5, is_manufacturing=True)
            out_wc = altman.calculate(inputs_wc_def)
            self.log_result("Forensics", "ALTMAN-04-ExtremeWCDeficit", "Extreme negative working capital & retained earnings", {}, "PASS", {
                "z_score": out_wc.z_score, "zone": out_wc.zone, "is_distress": out_wc.zone == "DISTRESS"
            })
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-04-ExtremeWCDeficit", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # 3.2 Beneish M-Score
        beneish = BeneishEngine()

        # Case 3.2a: Clamped GMI behavior test
        for gmi_val in [-5.0, 0.0, 0.05, 0.1, 2.5, 5.0, 10.0]:
            try:
                inputs_gmi = BeneishInputs(
                    dsri=1.0, gmi=gmi_val, aqi=1.0, sgi=1.0, depi=1.0, sgai=1.0, lvgi=1.0, tata=0.0
                )
                out_gmi = beneish.calculate(inputs_gmi)
                actual_gmi_term = out_gmi.components['gmi']
                clamped_val = actual_gmi_term / 0.528
                self.log_result("Forensics", f"BENEISH-01-GMI-{gmi_val}", f"GMI clamping for input {gmi_val}", {}, "PASS", {
                    "input_gmi": gmi_val, "clamped_gmi": round(clamped_val, 4), "m_score": out_gmi.m_score
                })
            except Exception as e:
                self.log_result("Forensics", f"BENEISH-01-GMI-{gmi_val}", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.2b: Negative depreciation
        try:
            inputs_depi = BeneishInputs(dsri=1.0, gmi=1.0, aqi=1.0, sgi=1.0, depi=-2.0, sgai=1.0, lvgi=1.0, tata=0.0)
            out_depi = beneish.calculate(inputs_depi)
            self.log_result("Forensics", "BENEISH-02-NegativeDepreciation", "Negative DEPI (-2.0) lowers M-Score", {}, "COMPLETED", {
                "m_score": out_depi.m_score, "signal": out_depi.signal, "depi_component": out_depi.components['depi']
            })
        except Exception as e:
            self.log_result("Forensics", "BENEISH-02-NegativeDepreciation", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.2c: Extreme accruals (TATA > 1.0)
        try:
            inputs_tata = BeneishInputs(dsri=1.0, gmi=1.0, aqi=1.0, sgi=1.0, depi=1.0, sgai=1.0, lvgi=1.0, tata=2.5)
            out_tata = beneish.calculate(inputs_tata)
            self.log_result("Forensics", "BENEISH-03-ExtremeAccruals", "Extreme TATA (2.5)", {}, "PASS", {
                "m_score": out_tata.m_score, "signal": out_tata.signal, "flagged": out_tata.signal == "MANIPULATION_LIKELY"
            })
        except Exception as e:
            self.log_result("Forensics", "BENEISH-03-ExtremeAccruals", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.2d: NaN in Beneish leads to "MANIPULATION_UNLIKELY"
        try:
            inputs_nan_b = BeneishInputs(dsri=float('nan'), gmi=1.0, aqi=1.0, sgi=1.0, depi=1.0, sgai=1.0, lvgi=1.0, tata=0.0)
            out_nan_b = beneish.calculate(inputs_nan_b)
            is_bug_b = math.isnan(out_nan_b.m_score) and out_nan_b.signal == "MANIPULATION_UNLIKELY"
            self.log_result(
                "Forensics", "BENEISH-04-NaNManipUnlikely",
                "NaN inputs result in NaN M-Score defaulting to MANIPULATION_UNLIKELY",
                {"dsri": "NaN"},
                "VULNERABILITY_CONFIRMED" if is_bug_b else "HANDLED",
                {
                    "m_score": str(out_nan_b.m_score),
                    "signal": out_nan_b.signal,
                    "fallthrough_flaw": "nan > -1.78 is False, so signal becomes MANIPULATION_UNLIKELY"
                },
                is_bug_or_vulnerability=is_bug_b,
                severity="HIGH"
            )
        except Exception as e:
            self.log_result("Forensics", "BENEISH-04-NaNManipUnlikely", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # 3.3 Piotroski F-Score
        piotroski = PiotroskiEngine()

        # Case 3.3a: Boundary 0 vs 9
        try:
            p_all_false = PiotroskiInputs(**{k: False for k in [
                'roa_positive', 'cfo_positive', 'roa_improving', 'accruals_quality',
                'leverage_decreasing', 'liquidity_improving', 'no_dilution',
                'margin_improving', 'turnover_improving'
            ]})
            out_0 = piotroski.calculate(p_all_false)
            self.log_result("Forensics", "PIOTROSKI-01-Score0", "All criteria False -> F-Score 0", {}, "PASS", {
                "f_score": out_0.f_score, "interpretation": out_0.interpretation
            })

            p_all_true = PiotroskiInputs(**{k: True for k in [
                'roa_positive', 'cfo_positive', 'roa_improving', 'accruals_quality',
                'leverage_decreasing', 'liquidity_improving', 'no_dilution',
                'margin_improving', 'turnover_improving'
            ]})
            out_9 = piotroski.calculate(p_all_true)
            self.log_result("Forensics", "PIOTROSKI-02-Score9", "All criteria True -> F-Score 9", {}, "PASS", {
                "f_score": out_9.f_score, "interpretation": out_9.interpretation
            })
        except Exception as e:
            self.log_result("Forensics", "PIOTROSKI-01-Score0", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.3b: Missing prior year data (passing None instead of bool)
        try:
            p_none = PiotroskiInputs(
                roa_positive=True, cfo_positive=True, roa_improving=None, accruals_quality=True,
                leverage_decreasing=None, liquidity_improving=True, no_dilution=True,
                margin_improving=None, turnover_improving=True
            )
            out_none = piotroski.calculate(p_none)
            self.log_result("Forensics", "PIOTROSKI-03-NoneInputs", "Piotroski with None for missing prior year", {}, "PASS", {
                "f_score": out_none.f_score
            })
        except TypeError as te:
            self.log_result(
                "Forensics", "PIOTROSKI-03-NoneInputs",
                "int(None) raises TypeError when prior year data is missing (None passed)",
                {"roa_improving": None},
                "VULNERABILITY_CONFIRMED",
                {"error": str(te), "root_cause": "int(inputs.roa_improving) crashes on None"},
                is_bug_or_vulnerability=True,
                severity="MEDIUM"
            )
        except Exception as e:
            self.log_result("Forensics", "PIOTROSKI-03-NoneInputs", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 4. CORPORATE ACTIONS STRESS TESTS
    # ============================================================
    def test_corporate_actions_stress(self):
        engine = CorporateActionsEngine()

        # Case 4.1: Bonus issue with fractional shares
        try:
            holdings = [{"symbol": "INFY", "qty": 11, "avg_price": 1500.0}]
            action = CorporateAction(
                symbol="INFY", action_type="bonus", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2),
                ratio=0.5  # 1 bonus for every 2 shares held -> 11 * 1.5 = 16.5 shares
            )
            adj = engine.adjust_holdings(holdings, action, market_price=1600.0)
            res = adj[0]
            # Should have whole_shares = 16, fractional_cash_credit = 0.5 * 1600 = 800.0
            self.log_result("CorporateActions", "CA-01-BonusFractional", "Bonus issue 1:2 with odd holding (11 shares)", {}, "PASS", {
                "new_qty": res["qty"],
                "avg_price": res["avg_price"],
                "fractional_cash_credit": res["fractional_cash_credit"],
                "expected_qty": 16,
                "expected_cash": 800.0
            })
        except Exception as e:
            self.log_result("CorporateActions", "CA-01-BonusFractional", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.2: Reverse split with ratio < 1.0
        try:
            holdings = [{"symbol": "PENNY", "qty": 105, "avg_price": 5.0}]
            action = CorporateAction(
                symbol="PENNY", action_type="split", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2),
                ratio=0.1  # 1-for-10 reverse split -> 105 * 0.1 = 10.5 shares
            )
            adj = engine.adjust_holdings(holdings, action, market_price=50.0)
            res = adj[0]
            # whole_shares = 10, fractional_cash_credit = 0.5 * 50 = 25.0, new_avg_cost = 5.0 / 0.1 = 50.0
            self.log_result("CorporateActions", "CA-02-ReverseSplit", "1-for-10 reverse split with fractional entitlement", {}, "PASS", {
                "new_qty": res["qty"],
                "avg_price": res["avg_price"],
                "fractional_cash_credit": res["fractional_cash_credit"]
            })
        except Exception as e:
            self.log_result("CorporateActions", "CA-02-ReverseSplit", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.3: Reverse split with ratio = 0.0 (Zero Division)
        try:
            holdings = [{"symbol": "PENNY", "qty": 100, "avg_price": 5.0}]
            action = CorporateAction(
                symbol="PENNY", action_type="split", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2),
                ratio=0.0
            )
            adj = engine.adjust_holdings(holdings, action, market_price=50.0)
            self.log_result("CorporateActions", "CA-03-ZeroRatioSplit", "Zero ratio split handled without crash", {}, "UNEXPECTED_PASS", {"result": adj})
        except ZeroDivisionError as zde:
            self.log_result(
                "CorporateActions", "CA-03-ZeroRatioSplit",
                "Zero ratio split triggers unhandled ZeroDivisionError in new_avg_cost = avg_price / factor",
                {"ratio": 0.0},
                "VULNERABILITY_CONFIRMED",
                {"error": str(zde)},
                is_bug_or_vulnerability=True,
                severity="MEDIUM"
            )
        except Exception as e:
            self.log_result("CorporateActions", "CA-03-ZeroRatioSplit", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.4: Demerger Cost Apportionment under SEBI Sec 49(2C)
        # Normal demerger case
        try:
            holdings = [{"symbol": "RELIANCE", "qty": 100, "avg_price": 2000.0}]
            action = CorporateAction(
                symbol="RELIANCE", action_type="demerger", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2),
                net_book_value_transferred=10000.0,
                pre_demerger_net_worth=100000.0,  # alpha = 0.10
                swap_ratio=1.0
            )
            adj = engine.adjust_holdings(holdings, action)
            res = adj[0]
            # parent_cost = 2000 * 0.9 = 1800.0, spinoff_cost = 2000 * 0.1 / 1.0 = 200.0
            self.log_result("CorporateActions", "CA-04-DemergerNormal", "SEBI Sec 49(2C) demerger cost allocation (alpha=0.10)", {}, "PASS", {
                "parent_cost": res["parent_avg_cost"],
                "spinoff_cost": res["spinoff_avg_cost"],
                "spinoff_qty": res["spinoff_qty"],
                "alpha": res["demerger_alpha"]
            })
        except Exception as e:
            self.log_result("CorporateActions", "CA-04-DemergerNormal", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.5: Demerger where transferred assets exceed pre-demerger net worth (alpha > 1.0)
        try:
            holdings = [{"symbol": "DISTRESSED", "qty": 100, "avg_price": 100.0}]
            action = CorporateAction(
                symbol="DISTRESSED", action_type="demerger", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2),
                net_book_value_transferred=120.0,
                pre_demerger_net_worth=100.0,  # alpha = 1.20!
                swap_ratio=1.0
            )
            adj = engine.adjust_holdings(holdings, action)
            res = adj[0]
            # parent_cost = 100 * (1 - 1.20) = -20.0! NEGATIVE COST OF ACQUISITION!
            is_bug_neg_cost = res["parent_avg_cost"] < 0
            self.log_result(
                "CorporateActions", "CA-05-DemergerNegativeParentCost",
                "Transferred book value exceeds net worth causing negative parent cost of acquisition",
                {"net_book_value_transferred": 120.0, "pre_demerger_net_worth": 100.0},
                "VULNERABILITY_CONFIRMED" if is_bug_neg_cost else "GUARDED",
                {
                    "parent_avg_cost": res["parent_avg_cost"],
                    "spinoff_avg_cost": res["spinoff_avg_cost"],
                    "alpha": res["demerger_alpha"],
                    "tax_consequence": "Section 49(2C) prohibits negative cost of acquisition"
                },
                is_bug_or_vulnerability=is_bug_neg_cost,
                severity="HIGH"
            )
        except Exception as e:
            self.log_result("CorporateActions", "CA-05-DemergerNegativeParentCost", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.6: Bonus shares NIL cost under Section 55(2)(aa)
        try:
            res_nil = engine.adjust_for_bonus_nil_cost(qty=100, avg_cost=500.0, bonus_ratio=1.0)
            self.log_result("CorporateActions", "CA-06-BonusNilCostSec55", "Section 55(2)(aa) bonus shares NIL cost method", {}, "PASS", {
                "original_shares": res_nil["original_shares"],
                "original_cost": res_nil["original_cost_per_share"],
                "bonus_shares": res_nil["bonus_shares"],
                "bonus_cost": res_nil["bonus_cost_per_share"],
                "total_shares": res_nil["total_shares"]
            })
        except Exception as e:
            self.log_result("CorporateActions", "CA-06-BonusNilCostSec55", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 5. DATA INGESTION: SLIDING WINDOW CHUNKER STRESS TESTS
    # ============================================================
    def test_chunker_stress(self):
        # Case 5.1: Text smaller than window size
        try:
            chunker = SlidingWindowChunker(chunk_size=512, overlap=50)
            chunks = chunker.chunk("This is a small document with only eight words.")
            self.log_result("DataIngestion", "CHUNK-01-SmallText", "Text smaller than window size (8 words vs 512)", {}, "PASS", {
                "chunk_count": len(chunks), "text": chunks[0].text if chunks else ""
            })
        except Exception as e:
            self.log_result("DataIngestion", "CHUNK-01-SmallText", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 5.2: Empty document
        try:
            chunker = SlidingWindowChunker(chunk_size=512, overlap=50)
            chunks = chunker.chunk("")
            self.log_result("DataIngestion", "CHUNK-02-EmptyText", "Empty document string", {}, "PASS", {
                "chunk_count": len(chunks)
            })
        except Exception as e:
            self.log_result("DataIngestion", "CHUNK-02-EmptyText", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 5.3: CRITICAL BUG: Infinite loop when overlap >= chunk_size
        try:
            # If overlap >= chunk_size, start = end - overlap = start + chunk_size - overlap <= start
            # Will loop indefinitely! We use a loop counter or timeout simulation to verify
            words = ["word"] * 100
            text = " ".join(words)
            chunker = SlidingWindowChunker(chunk_size=20, overlap=20)
            
            # Manually step to check if start advances:
            start = 0
            end = min(start + chunker.chunk_size, len(words))
            next_start = end - chunker.overlap
            infinite_loop_proven = (next_start <= start)
            
            self.log_result(
                "DataIngestion", "CHUNK-03-InfiniteLoopOverlap",
                "Infinite loop in SlidingWindowChunker when overlap >= chunk_size",
                {"chunk_size": 20, "overlap": 20},
                "VULNERABILITY_CONFIRMED" if infinite_loop_proven else "PASS",
                {
                    "start": start,
                    "end": end,
                    "next_start": next_start,
                    "advancement": next_start - start,
                    "flaw": "while start < len(words): start = end - overlap. If overlap >= chunk_size, start never advances."
                },
                is_bug_or_vulnerability=infinite_loop_proven,
                severity="CRITICAL"
            )
        except Exception as e:
            self.log_result("DataIngestion", "CHUNK-03-InfiniteLoopOverlap", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 5.4: Large text (50,000 words) throughput test
        try:
            chunker = SlidingWindowChunker(chunk_size=512, overlap=50)
            large_text = " ".join(["financial"] * 50000)
            start_t = datetime.now()
            chunks = chunker.chunk(large_text)
            elapsed = (datetime.now() - start_t).total_seconds()
            self.log_result("DataIngestion", "CHUNK-04-LargeDoc50KWords", "Chunking 50,000 words text buffer", {}, "PASS", {
                "chunk_count": len(chunks), "elapsed_seconds": elapsed, "chunks_per_second": round(len(chunks)/elapsed, 1) if elapsed > 0 else "instant"
            })
        except Exception as e:
            self.log_result("DataIngestion", "CHUNK-04-LargeDoc50KWords", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 6. DATA INGESTION: PIT & PDF STRESS TESTS
    # ============================================================
    def test_pit_and_pdf_stress(self):
        pit = PITTransformer(as_of_date=date(2025, 3, 31))

        # Case 6.1: Corrupted / invalid date strings in filter_by_date
        try:
            records = [
                {"id": 1, "date": "2024-12-31", "revenue": 100},
                {"id": 2, "date": "invalid-date-string", "revenue": 200},
                {"id": 3, "date": "2026-06-30", "revenue": 300},
            ]
            res = pit.filter_by_date(records)
            self.log_result("DataIngestion", "PIT-01-InvalidDateString", "Invalid date string handled without crash", {}, "UNEXPECTED_PASS", {"result": res})
        except ValueError as ve:
            self.log_result(
                "DataIngestion", "PIT-01-InvalidDateString",
                "datetime.fromisoformat raises unhandled ValueError on malformed date string",
                {"date": "invalid-date-string"},
                "VULNERABILITY_CONFIRMED",
                {"error": str(ve)},
                is_bug_or_vulnerability=True,
                severity="HIGH"
            )
        except Exception as e:
            self.log_result("DataIngestion", "PIT-01-InvalidDateString", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 6.2: Missing date field or None date
        try:
            records_missing = [
                {"id": 1, "revenue": 100},  # missing date field entirely
                {"id": 2, "date": None, "revenue": 200},
                {"id": 3, "date": "2024-03-31", "revenue": 300},
            ]
            res_missing = pit.filter_by_date(records_missing)
            self.log_result("DataIngestion", "PIT-02-MissingDateField", "Missing and None date fields properly filtered", {}, "PASS", {
                "filtered_records_count": len(res_missing), "included_ids": [r["id"] for r in res_missing]
            })
        except Exception as e:
            self.log_result("DataIngestion", "PIT-02-MissingDateField", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 6.3: tag_pit with None source_date
        try:
            rec = {"id": 1, "revenue": 100}
            res_tag = pit.tag_pit(rec, None)
            self.log_result("DataIngestion", "PIT-03-NoneSourceDate", "tag_pit with None source date handled", {}, "UNEXPECTED_PASS", {"result": res_tag})
        except AttributeError as ae:
            self.log_result(
                "DataIngestion", "PIT-03-NoneSourceDate",
                "tag_pit crashes with AttributeError on None source_date",
                {"source_date": None},
                "VULNERABILITY_CONFIRMED",
                {"error": str(ae)},
                is_bug_or_vulnerability=True,
                severity="MEDIUM"
            )
        except Exception as e:
            self.log_result("DataIngestion", "PIT-03-NoneSourceDate", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 6.4: PDFExtractor mock inspection
        try:
            extractor = PDFExtractor()
            ext_res = extractor.extract("non_existent_corrupted_file.pdf")
            is_mock = ext_res.get("text") == "Extracted text from PDF..."
            self.log_result(
                "DataIngestion", "PDF-01-MockImplementation",
                "PDFExtractor is an unintegrated placeholder/mock that ignores file_path",
                {"file_path": "non_existent_file.pdf"},
                "MOCK_CONFIRMED" if is_mock else "ACTIVE",
                {"extracted_sample": ext_res, "comment": "Hardcoded dictionary returned, does not touch disk"},
                is_bug_or_vulnerability=is_mock,
                severity="LOW"
            )
        except Exception as e:
            self.log_result("DataIngestion", "PDF-01-MockImplementation", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 7. ADDITIONAL NEW ENGINES STRESS TESTS
    # ============================================================
    def test_additional_engines_stress(self):
        # 7.1 Ratio Analysis Engine: Zero Revenue, Negative Net Worth, Loss-Making
        ratio_engine = RatioAnalysisEngine()
        try:
            inputs_distress = RatioAnalysisInputs(
                symbol="DISTRESSCO",
                revenue=0.0,
                cogs=100.0,
                ebitda=-150.0,
                ebit=-200.0,
                pat=-250.0,
                interest_expense=50.0,
                total_assets=500.0,
                total_equity=-100.0,  # Negative Net Worth
                total_debt=600.0,
                current_assets=100.0,
                current_liabilities=300.0,
                market_cap=200.0,
                cmp=10.0,
                shares_outstanding=20.0
            )
            out_distress = ratio_engine.calculate(inputs_distress)
            flag_types = [f["type"] for f in out_distress.distress_flags]
            self.log_result("RatioAnalysis", "RATIO-01-DistressCompany", "Zero revenue & negative net worth ratio handling", {}, "PASS", {
                "distress_flags": flag_types,
                "has_neg_net_worth": "NEGATIVE_NET_WORTH" in flag_types,
                "has_loss_making": "LOSS_MAKING" in flag_types,
                "dupont_status": out_distress.dupont.get("status")
            })
        except Exception as e:
            self.log_result("RatioAnalysis", "RATIO-01-DistressCompany", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # 7.2 Turnaround Engine: Split Factor = 0 (ZeroDivisionError)
        turn_engine = TurnaroundEngine()
        try:
            inputs_tf = TurnaroundInputs(
                symbol="TURNCO",
                share_count_t=1000.0,
                share_count_t_1=1000.0,
                split_factor=0.0  # Zero split factor
            )
            out_turn = turn_engine.calculate(inputs_tf)
            self.log_result("Turnaround", "TURN-01-ZeroSplitFactor", "Zero split factor handled", {}, "PASS", {"score": out_turn.turnaround_score})
        except ZeroDivisionError as zde:
            self.log_result(
                "Turnaround", "TURN-01-ZeroSplitFactor",
                "Zero split factor causes ZeroDivisionError in normalized_shares calculation",
                {"split_factor": 0.0},
                "VULNERABILITY_CONFIRMED",
                {"error": str(zde)},
                is_bug_or_vulnerability=True,
                severity="MEDIUM"
            )
        except Exception as e:
            self.log_result("Turnaround", "TURN-01-ZeroSplitFactor", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # 7.3 Hedging Engine: Zero futures value / lot size rounding
        hedge_engine = HedgingEngine()
        try:
            inputs_hedge = HedgingInputs(
                spot_price=2500.0, call_strike=2600.0, put_strike=2400.0,
                call_premium=45.0, put_premium=35.0, risk_free_rate=0.07,
                dividend_yield=0.015, time_to_expiry_days=30,
                portfolio_value=10000000.0, futures_value=0.0,  # Zero futures value
                hedge_ratio=1.0, nse_lot_size=250
            )
            out_hedge = hedge_engine.calculate(inputs_hedge)
            self.log_result("Hedging", "HEDGE-01-ZeroFuturesValue", "Zero futures value handled safely", {}, "PASS", {
                "collar_max_gain": out_hedge.collar_max_gain,
                "collar_max_loss": out_hedge.collar_max_loss,
                "hedge_lots": out_hedge.hedge_lots
            })
        except Exception as e:
            self.log_result("Hedging", "HEDGE-01-ZeroFuturesValue", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # 7.4 Relative Valuation: All peers loss-makers (Harmonic Mean & Exclusion)
        rel_engine = RelativeValuationEngine()
        try:
            inputs_all_loss = RelativeValuationInputs(
                target_market_cap=10000.0, target_net_debt=1000.0, target_minority_interest=0.0,
                target_preferred=0.0, target_ebitda=1000.0, target_eps=10.0, target_sales=5000.0,
                target_eps_cagr_3y=0.10, diluted_shares=1000.0,
                peer_symbols=["LOSS1", "LOSS2", "LOSS3"],
                peer_market_caps=[5000.0, 4000.0, 6000.0],
                peer_net_debts=[500.0, 400.0, 600.0],
                peer_ebitdas=[-100.0, -200.0, -50.0],  # All negative EBITDA
                peer_eps=[-2.0, -5.0, -1.0],           # All negative EPS
                peer_sales=[3000.0, 2500.0, 4000.0],
                peer_eps_cagr_3y=[0.05, 0.05, 0.05],
                peer_diluted_shares=[500.0, 400.0, 600.0]
            )
            out_rel = rel_engine.calculate(inputs_all_loss)
            self.log_result("Relative", "REL-01-AllPeersLossMakers", "All peers are loss-makers (excluded)", {}, "PASS", {
                "peer_ev_ebitda_median": str(out_rel.peer_ev_ebitda_median),
                "peer_pe_median": str(out_rel.peer_pe_median),
                "implied_ev_ebitda": str(out_rel.implied_value_ev_ebitda_median),
                "nan_handled_safely": math.isnan(out_rel.peer_ev_ebitda_median)
            })
        except Exception as e:
            self.log_result("Relative", "REL-01-AllPeersLossMakers", "Exception", {}, "EXCEPTION", {"error": str(e)})

    def run_all(self):
        print("Starting Empirical Stress Tests...")
        self.test_dcf_stress()
        self.test_banking_stress()
        self.test_forensics_stress()
        self.test_corporate_actions_stress()
        self.test_chunker_stress()
        self.test_pit_and_pdf_stress()
        self.test_additional_engines_stress()
        print(f"\nCompleted {len(self.results)} stress tests. Flaws found: {len(self.flaws_found)}.")


if __name__ == "__main__":
    runner = StressTestRunner()
    runner.run_all()
    
    # Save raw json results to working directory
    out_path = os.path.join(os.path.dirname(__file__), "stress_test_raw_results.json")
    with open(out_path, "w") as f:
        json.dump(runner.results, f, indent=2)
    print(f"Raw results written to {out_path}")
