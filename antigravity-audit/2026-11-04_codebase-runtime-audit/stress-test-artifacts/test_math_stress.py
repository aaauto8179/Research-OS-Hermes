"""
Empirical Stress Test Harness: Math Engine (Hermes M2)
=====================================================
Executes rigorous adversarial stress tests across:
1. DCF Valuation Engine
2. Banking Valuation Engine
3. Altman Z-Score Engine
4. Beneish M-Score Engine
5. Piotroski F-Score Engine
6. Corporate Actions Engine
7. Relative & SOTP Valuation Engines
8. Ratio Analysis & Turnaround & Hedging Engines
"""

import sys
import os
import math
import traceback
import json
from datetime import date, datetime
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
MATH_ENGINE_SRC = os.path.join(BASE_DIR, "math-engine", "src")
if MATH_ENGINE_SRC not in sys.path:
    sys.path.insert(0, MATH_ENGINE_SRC)

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


class MathStressRunner:
    def __init__(self):
        self.results: List[Dict[str, Any]] = []
        self.flaws_found = []

    def log_result(self, category: str, test_id: str, description: str,
                   inputs_summary: Any, outcome: str, details: Dict[str, Any],
                   is_bug_or_vulnerability: bool = False, severity: str = "INFO"):
        record = {
            "category": category,
            "test_id": test_id,
            "description": description,
            "inputs": str(inputs_summary),
            "outcome": outcome,
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
    def test_dcf(self):
        engine = DCFEngine()

        # Case 1.1: Deeply Negative FCF Projections
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
                "DCF", "DCF-01-NegativeFCF", "Deeply negative cash flows across entire forecast horizon",
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
            self.log_result("DCF", "DCF-01-NegativeFCF", "Negative FCF projections", {}, "EXCEPTION", {"error": str(e), "trace": traceback.format_exc()}, is_bug_or_vulnerability=True, severity="HIGH")

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
            inputs = DCFInputs(
                revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                tax_rate=0.25, total_debt=1000.0, cash=400.0, minority_interest=50.0, diluted_shares=50.0,
                revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                risk_free_rate=0.065, equity_risk_premium=0.05, beta=1.0, cost_of_debt=0.06, debt_to_value=0.20,
                terminal_growth_rate=0.100, exit_multiple=8.0, forecast_years=5
            )
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

        # Case 1.4: Zero Net Debt
        try:
            inputs_zd = DCFInputs(
                revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                tax_rate=0.25, total_debt=0.0, cash=0.0, minority_interest=0.0, diluted_shares=50.0,
                revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                risk_free_rate=0.07, equity_risk_premium=0.06, beta=1.0, cost_of_debt=0.08, debt_to_value=0.0,
                terminal_growth_rate=0.02, exit_multiple=8.0, forecast_years=5, lease_liabilities=0.0
            )
            out_zd = engine.calculate(inputs_zd)
            self.log_result("DCF", "DCF-04-ZeroDebt", "Zero net debt scenario (EV == Equity Value)", {}, "PASS", {
                "ev_gordon": out_zd.ev_gordon, "equity_value_gordon": out_zd.equity_value_gordon, "exact_match": out_zd.ev_gordon == out_zd.equity_value_gordon
            })
        except Exception as e:
            self.log_result("DCF", "DCF-04-ZeroDebt", "Zero net debt error", {}, "EXCEPTION", {"error": str(e)})

        # Case 1.5: Massive Net Debt ($600,000 debt vs $5,000 revenue)
        try:
            inputs_hd = DCFInputs(
                revenue=5000.0, ebit=800.0, depreciation=200.0, capex=300.0, change_nwc=100.0,
                tax_rate=0.25, total_debt=500000.0, cash=50.0, minority_interest=0.0, diluted_shares=50.0,
                revenue_growth_years=[0.05]*5, ebit_margin=0.16, capex_pct_revenue=0.06, nwc_pct_revenue=0.02,
                risk_free_rate=0.07, equity_risk_premium=0.06, beta=1.0, cost_of_debt=0.08, debt_to_value=0.90,
                terminal_growth_rate=0.02, exit_multiple=8.0, forecast_years=5, lease_liabilities=100000.0
            )
            out_hd = engine.calculate(inputs_hd)
            self.log_result("DCF", "DCF-05-MassiveDebt", "Massive debt bridge produces negative fair value without guard", {}, "PASS", {
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
    def test_banking(self):
        engine = BankingValuationEngine()

        # Case 2.1: Zero Book Value
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

        # Case 2.2: Negative Net Worth (clamped to 0.0)
        try:
            inputs = BankingValuationInputs(
                book_value=-50.0, roe=15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0,
                net_npa_per_share=10.0, net_dta_per_share=5.0
            )
            out = engine.calculate(inputs)
            self.log_result("Banking", "BANK-02-NegativeNetWorth", "Negative Book Value clamped silently to zero ABVPS", {}, "COMPLETED", {
                "abvps": out.adjusted_bvps,
                "implied_price": out.implied_price_justified_pb,
                "clamped_to_zero_silently": out.adjusted_bvps == 0.0
            }, is_bug_or_vulnerability=True, severity="MEDIUM")
        except Exception as e:
            self.log_result("Banking", "BANK-02-NegativeNetWorth", "Negative book value exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 2.3: Net NPA exceeds Book Value
        try:
            inputs = BankingValuationInputs(
                book_value=100.0, roe=15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0,
                net_npa_per_share=120.0, net_dta_per_share=10.0
            )
            out = engine.calculate(inputs)
            self.log_result("Banking", "BANK-03-NetNPAExceedsBook", "Net NPA per share exceeds Book Value", {}, "COMPLETED", {
                "abvps": out.adjusted_bvps,
                "implied_price": out.implied_price_justified_pb
            })
        except Exception as e:
            self.log_result("Banking", "BANK-03-NetNPAExceedsBook", "Net NPA exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 2.4: THE NORMALIZATION FLAW on Negative ROE
        try:
            inputs_neg_pct = BankingValuationInputs(
                book_value=100.0, roe=-15.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0
            )
            out_neg = engine.calculate(inputs_neg_pct)
            # Check justified_pb
            # If normalized properly (-0.15): (-0.15 - 0.05)/(0.12 - 0.05) = -2.857
            # If bug: (-15.0 - 0.05)/(0.12 - 0.05) = -215.0!
            is_bug = abs(out_neg.justified_pb - (-215.0)) < 1.0
            self.log_result(
                "Banking", "BANK-04-NegativeROENormalizationBug",
                "Normalization flaw: negative ROE percentage (-15.0) fails `roe > 1.0` check and is not divided by 100",
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

        # Case 2.5: Extreme positive ROE (> 100%, e.g. 150%)
        try:
            inputs_huge = BankingValuationInputs(
                book_value=100.0, roe=150.0, cost_of_equity=12.0, growth_rate=5.0,
                peer_roes=[14.0, 15.0, 16.0], peer_pbs=[1.2, 1.3, 1.5], market_cap=500.0
            )
            out_huge = engine.calculate(inputs_huge)
            self.log_result("Banking", "BANK-05-ExtremePositiveROE", "150% ROE handled", {}, "COMPLETED", {
                "justified_pb": out_huge.justified_pb,
                "implied_price": out_huge.implied_price_justified_pb
            })
        except Exception as e:
            self.log_result("Banking", "BANK-05-ExtremePositiveROE", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 3. FORENSICS STRESS TESTS
    # ============================================================
    def test_forensics(self):
        altman = AltmanZEngine()

        # Case 3.1: Infinite x4 from zero liabilities
        try:
            inputs_inf_x4 = AltmanZInputs(x1=0.2, x2=0.1, x3=0.05, x4=float('inf'), x5=1.0, is_manufacturing=True)
            out_inf = altman.calculate(inputs_inf_x4)
            self.log_result("Forensics", "ALTMAN-01-InfX4", "Infinite x4 from zero liabilities", {}, "COMPLETED", {
                "z_score": out_inf.z_score, "zone": out_inf.zone
            })
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-01-InfX4", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.2: NaN in Altman Z defaults to "SAFE"
        try:
            inputs_nan = AltmanZInputs(x1=float('nan'), x2=0.1, x3=0.05, x4=1.0, x5=1.0, is_manufacturing=True)
            out_nan = altman.calculate(inputs_nan)
            is_bug = math.isnan(out_nan.z_score) and out_nan.zone == "SAFE"
            self.log_result(
                "Forensics", "ALTMAN-02-NaNClassifiedAsSafe",
                "NaN inputs result in NaN z_score falling through to SAFE zone",
                {"x1": "NaN"},
                "VULNERABILITY_CONFIRMED" if is_bug else "HANDLED",
                {
                    "z_score": str(out_nan.z_score),
                    "zone": out_nan.zone,
                    "fallthrough_flaw": "Comparison with NaN returns False, defaulting to 'else: zone = SAFE'"
                },
                is_bug_or_vulnerability=is_bug,
                severity="CRITICAL"
            )
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-02-NaNClassifiedAsSafe", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.3: Dead code liabilities guard verification
        try:
            inputs_dc = AltmanZInputs(
                x1=0.2, x2=0.1, x3=0.05, x4=2.0, x5=1.0,
                total_liabilities=0.0, total_assets=1000.0, is_manufacturing=True
            )
            out_dc = altman.calculate(inputs_dc)
            self.log_result("Forensics", "ALTMAN-03-DeadCodeLiabilitiesGuard", "total_liabilities parameter has no effect on x4", {}, "COMPLETED", {
                "z_score": out_dc.z_score, "zone": out_dc.zone
            })
        except Exception as e:
            self.log_result("Forensics", "ALTMAN-03-DeadCodeLiabilitiesGuard", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Beneish M-Score
        beneish = BeneishEngine()

        # Case 3.4: GMI clamping
        for gmi_val in [-5.0, 0.0, 0.05, 0.1, 2.5, 5.0, 10.0]:
            try:
                inputs_gmi = BeneishInputs(dsri=1.0, gmi=gmi_val, aqi=1.0, sgi=1.0, depi=1.0, sgai=1.0, lvgi=1.0, tata=0.0)
                out_gmi = beneish.calculate(inputs_gmi)
                clamped_val = out_gmi.components['gmi'] / 0.528
                self.log_result("Forensics", f"BENEISH-01-GMI-{gmi_val}", f"GMI clamping for input {gmi_val}", {}, "PASS", {
                    "input_gmi": gmi_val, "clamped_gmi": round(clamped_val, 4), "m_score": out_gmi.m_score
                })
            except Exception as e:
                self.log_result("Forensics", f"BENEISH-01-GMI-{gmi_val}", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.5: Negative depreciation
        try:
            inputs_depi = BeneishInputs(dsri=1.0, gmi=1.0, aqi=1.0, sgi=1.0, depi=-2.0, sgai=1.0, lvgi=1.0, tata=0.0)
            out_depi = beneish.calculate(inputs_depi)
            self.log_result("Forensics", "BENEISH-02-NegativeDepreciation", "Negative DEPI (-2.0) lowers M-Score", {}, "COMPLETED", {
                "m_score": out_depi.m_score, "signal": out_depi.signal, "depi_component": out_depi.components['depi']
            })
        except Exception as e:
            self.log_result("Forensics", "BENEISH-02-NegativeDepreciation", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.6: Extreme accruals
        try:
            inputs_tata = BeneishInputs(dsri=1.0, gmi=1.0, aqi=1.0, sgi=1.0, depi=1.0, sgai=1.0, lvgi=1.0, tata=2.5)
            out_tata = beneish.calculate(inputs_tata)
            self.log_result("Forensics", "BENEISH-03-ExtremeAccruals", "Extreme TATA (2.5)", {}, "PASS", {
                "m_score": out_tata.m_score, "signal": out_tata.signal, "flagged": out_tata.signal == "MANIPULATION_LIKELY"
            })
        except Exception as e:
            self.log_result("Forensics", "BENEISH-03-ExtremeAccruals", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.7: NaN in Beneish defaults to MANIPULATION_UNLIKELY
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

        # Piotroski F-Score
        piotroski = PiotroskiEngine()

        # Case 3.8: Boundaries 0 vs 9
        try:
            p0 = PiotroskiInputs(**{k: False for k in [
                'roa_positive', 'cfo_positive', 'roa_improving', 'accruals_quality',
                'leverage_decreasing', 'liquidity_improving', 'no_dilution',
                'margin_improving', 'turnover_improving'
            ]})
            out0 = piotroski.calculate(p0)
            p9 = PiotroskiInputs(**{k: True for k in [
                'roa_positive', 'cfo_positive', 'roa_improving', 'accruals_quality',
                'leverage_decreasing', 'liquidity_improving', 'no_dilution',
                'margin_improving', 'turnover_improving'
            ]})
            out9 = piotroski.calculate(p9)
            self.log_result("Forensics", "PIOTROSKI-01-Boundaries", "Boundary 0 and 9 verified", {}, "PASS", {
                "f_score_0": out0.f_score, "f_score_9": out9.f_score
            })
        except Exception as e:
            self.log_result("Forensics", "PIOTROSKI-01-Boundaries", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 3.9: Missing prior year data (passing None)
        try:
            p_none = PiotroskiInputs(
                roa_positive=True, cfo_positive=True, roa_improving=None, accruals_quality=True,
                leverage_decreasing=None, liquidity_improving=True, no_dilution=True,
                margin_improving=None, turnover_improving=True
            )
            out_none = piotroski.calculate(p_none)
            self.log_result("Forensics", "PIOTROSKI-02-NoneInputs", "Piotroski with None handled", {}, "PASS", {"score": out_none.f_score})
        except TypeError as te:
            self.log_result(
                "Forensics", "PIOTROSKI-02-NoneInputs",
                "int(None) raises TypeError when prior year data is missing (None passed)",
                {"roa_improving": None},
                "VULNERABILITY_CONFIRMED",
                {"error": str(te), "root_cause": "int(inputs.roa_improving) crashes on None"},
                is_bug_or_vulnerability=True,
                severity="MEDIUM"
            )
        except Exception as e:
            self.log_result("Forensics", "PIOTROSKI-02-NoneInputs", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 4. CORPORATE ACTIONS STRESS TESTS
    # ============================================================
    def test_corporate_actions(self):
        engine = CorporateActionsEngine()

        # Case 4.1: Bonus fractional
        try:
            holdings = [{"symbol": "INFY", "qty": 11, "avg_price": 1500.0}]
            action = CorporateAction(
                symbol="INFY", action_type="bonus", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2), ratio=0.5
            )
            adj = engine.adjust_holdings(holdings, action, market_price=1600.0)
            res = adj[0]
            self.log_result("CorporateActions", "CA-01-BonusFractional", "Bonus 1:2 with odd holding (11 shares)", {}, "PASS", {
                "new_qty": res["qty"], "fractional_cash_credit": res["fractional_cash_credit"]
            })
        except Exception as e:
            self.log_result("CorporateActions", "CA-01-BonusFractional", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.2: Reverse split with ratio = 0.0 (ZeroDivisionError)
        try:
            holdings = [{"symbol": "PENNY", "qty": 100, "avg_price": 5.0}]
            action = CorporateAction(
                symbol="PENNY", action_type="split", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2), ratio=0.0
            )
            adj = engine.adjust_holdings(holdings, action, market_price=50.0)
            self.log_result("CorporateActions", "CA-02-ZeroRatioSplit", "Zero ratio split handled", {}, "UNEXPECTED_PASS", {"result": adj})
        except ZeroDivisionError as zde:
            self.log_result(
                "CorporateActions", "CA-02-ZeroRatioSplit",
                "Zero ratio split triggers unhandled ZeroDivisionError in new_avg_cost = avg_price / factor",
                {"ratio": 0.0},
                "VULNERABILITY_CONFIRMED",
                {"error": str(zde)},
                is_bug_or_vulnerability=True,
                severity="MEDIUM"
            )
        except Exception as e:
            self.log_result("CorporateActions", "CA-02-ZeroRatioSplit", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Case 4.3: Demerger where transferred assets exceed net worth (alpha > 1.0)
        try:
            holdings = [{"symbol": "DISTRESSED", "qty": 100, "avg_price": 100.0}]
            action = CorporateAction(
                symbol="DISTRESSED", action_type="demerger", ex_date=date(2026, 1, 1), record_date=date(2026, 1, 2),
                net_book_value_transferred=120.0, pre_demerger_net_worth=100.0, swap_ratio=1.0
            )
            adj = engine.adjust_holdings(holdings, action)
            res = adj[0]
            is_bug_neg_cost = res["parent_avg_cost"] < 0
            self.log_result(
                "CorporateActions", "CA-03-DemergerNegativeParentCost",
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
            self.log_result("CorporateActions", "CA-03-DemergerNegativeParentCost", "Exception", {}, "EXCEPTION", {"error": str(e)})

    # ============================================================
    # 5. ADDITIONAL ENGINES STRESS TESTS
    # ============================================================
    def test_additional_engines(self):
        # Ratio Analysis
        ratio_engine = RatioAnalysisEngine()
        try:
            inputs_distress = RatioAnalysisInputs(
                symbol="DISTRESSCO", revenue=0.0, cogs=100.0, ebitda=-150.0, ebit=-200.0,
                pat=-250.0, interest_expense=50.0, total_assets=500.0, total_equity=-100.0,
                total_debt=600.0, current_assets=100.0, current_liabilities=300.0,
                market_cap=200.0, cmp=10.0, shares_outstanding=20.0
            )
            out_distress = ratio_engine.calculate(inputs_distress)
            flag_types = [f["type"] for f in out_distress.distress_flags]
            self.log_result("RatioAnalysis", "RATIO-01-DistressCompany", "Zero revenue & negative net worth ratio handling", {}, "PASS", {
                "distress_flags": flag_types,
                "has_neg_net_worth": "NEGATIVE_NET_WORTH" in flag_types,
                "dupont_status": out_distress.dupont.get("status")
            })
        except Exception as e:
            self.log_result("RatioAnalysis", "RATIO-01-DistressCompany", "Exception", {}, "EXCEPTION", {"error": str(e)})

        # Turnaround split_factor = 0
        turn_engine = TurnaroundEngine()
        try:
            inputs_tf = TurnaroundInputs(symbol="TURNCO", share_count_t=1000.0, share_count_t_1=1000.0, split_factor=0.0)
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

        # Relative Valuation all peers loss makers
        rel_engine = RelativeValuationEngine()
        try:
            inputs_all_loss = RelativeValuationInputs(
                target_market_cap=10000.0, target_net_debt=1000.0, target_minority_interest=0.0,
                target_preferred=0.0, target_ebitda=1000.0, target_eps=10.0, target_sales=5000.0,
                target_eps_cagr_3y=0.10, diluted_shares=1000.0,
                peer_symbols=["LOSS1", "LOSS2", "LOSS3"],
                peer_market_caps=[5000.0, 4000.0, 6000.0],
                peer_net_debts=[500.0, 400.0, 600.0],
                peer_ebitdas=[-100.0, -200.0, -50.0],
                peer_eps=[-2.0, -5.0, -1.0],
                peer_sales=[3000.0, 2500.0, 4000.0],
                peer_eps_cagr_3y=[0.05, 0.05, 0.05],
                peer_diluted_shares=[500.0, 400.0, 600.0]
            )
            out_rel = rel_engine.calculate(inputs_all_loss)
            self.log_result("Relative", "REL-01-AllPeersLossMakers", "All peers loss makers excluded (harmonic mean returns NaN)", {}, "PASS", {
                "peer_ev_ebitda_median": str(out_rel.peer_ev_ebitda_median),
                "nan_handled_safely": math.isnan(out_rel.peer_ev_ebitda_median)
            })
        except Exception as e:
            self.log_result("Relative", "REL-01-AllPeersLossMakers", "Exception", {}, "EXCEPTION", {"error": str(e)})

    def run_all(self):
        print("=== RUNNING MATH ENGINE EMPIRICAL STRESS TESTS ===")
        self.test_dcf()
        self.test_banking()
        self.test_forensics()
        self.test_corporate_actions()
        self.test_additional_engines()
        print(f"\nMath Engine Tests Finished: {len(self.results)} total tests, {len(self.flaws_found)} flaws identified.")


if __name__ == "__main__":
    runner = MathStressRunner()
    runner.run_all()
    out_path = os.path.join(os.path.dirname(__file__), "math_stress_results.json")
    with open(out_path, "w") as f:
        json.dump(runner.results, f, indent=2)
    print(f"Results written to {out_path}")
