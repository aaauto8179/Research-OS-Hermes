"""
Pytest Suite: Challenger 1 Empirical Mathematical & Forensic Stress Tests
=========================================================================
Tests verifying mathematical rigor, edge-case resilience, and regulatory compliance
for the 7 core focus areas identified in specs/audits/.
"""

import math
import pytest
from datetime import date

# -----------------------------------------------------------------------------
# 1. BENEISH M-SCORE TESTS
# -----------------------------------------------------------------------------
class TestBeneishStress:
    def test_lvgi_asset_growth_flaw(self):
        """
        Tests that the legacy formula (Debt+Equity)_t / (Debt+Equity)_{t-1}
        erroneously signals increasing leverage during equity-financed deleveraging,
        whereas the true Beneish (1999) Leverage Index correctly identifies deleveraging.
        """
        # Deleveraging scenario:
        # t-1: Debt=700, Equity=300, TA=1000 => Leverage = 0.70
        # t:   Debt=150, Equity=1850, TA=2000 => Leverage = 0.075
        debt_t_prev, eq_t_prev, ta_t_prev = 700.0, 300.0, 1000.0
        debt_t, eq_t, ta_t = 150.0, 1850.0, 2000.0
        
        lvgi_legacy = (debt_t + eq_t) / (debt_t_prev + eq_t_prev)
        lev_prev = debt_t_prev / ta_t_prev
        lev_curr = debt_t / ta_t
        lvgi_correct = lev_curr / lev_prev
        
        assert lvgi_legacy == 2.0  # Legacy falsely claims 2x leverage expansion
        assert lvgi_correct < 0.15 # True Beneish shows massive deleveraging (0.107)
        assert lvgi_legacy > lvgi_correct * 10 # Massive discrepancy

    def test_beneish_coefficients_discrepancy(self):
        """
        Beneish (1999) 8-variable model uses:
        + 4.037*TATA + 0.0327*LVGI
        whereas flawed spec line 31 used:
        + 4.679*TATA - 0.327*LVGI
        """
        # A surge in leverage (LVGI = 3.0) should increase manipulation probability
        coeff_beneish_paper = 0.0327
        coeff_flawed_spec = -0.327
        
        impact_paper = coeff_beneish_paper * 3.0   # +0.0981 (higher risk)
        impact_flawed = coeff_flawed_spec * 3.0     # -0.9810 (falsely cleans manipulator!)
        
        assert impact_paper > 0
        assert impact_flawed < 0
        assert impact_paper != impact_flawed

    def test_gmi_negative_margin_clamping(self):
        """Negative gross margins must be clamped to prevent artificially depressing M-score."""
        gpm_prev = 0.20
        gpm_curr = -0.10
        gmi_raw = gpm_prev / gpm_curr # -2.0
        
        # Unclamped negative GMI lowers M-score because GMI coefficient is +0.528
        score_reduction = 0.528 * gmi_raw
        assert score_reduction == -1.056
        
        # Clamped safeguard prevents categorizing distressed company as clean
        gmi_clamped = max(0.1, min(5.0, abs(gmi_raw)))
        assert gmi_clamped == 2.0


# -----------------------------------------------------------------------------
# 2. BANKING VALUATION TESTS
# -----------------------------------------------------------------------------
class TestBankingValuationStress:
    def test_roe_scaling_explosion(self):
        """Tests that passing ROE as percentage (16.2) causes 64x price explosion without normalization."""
        alpha, beta = 0.8, 8.5
        roe_pct = 16.2
        bvps = 580.0
        
        pb_unnormalized = alpha + beta * roe_pct
        price_unnormalized = pb_unnormalized * bvps
        
        roe_norm = roe_pct / 100.0 if roe_pct > 1.0 else roe_pct
        pb_norm = alpha + beta * roe_norm
        price_norm = pb_norm * bvps
        
        assert round(pb_unnormalized, 2) == 138.50
        assert round(price_unnormalized, 2) == 80330.00
        assert round(pb_norm, 2) == 2.18
        assert round(price_norm, 2) == 1262.66
        assert price_unnormalized / price_norm > 60.0

    def test_net_npa_abvs_deduction(self):
        """Tests that unadjusted reported BVPS inflates banking valuation without RBI Net NPA deductions."""
        reported_bvps = 580.0
        net_npa_per_share = 48.0
        dta_per_share = 12.0
        
        abvps = reported_bvps - net_npa_per_share - dta_per_share
        p_abv = 2.177
        
        price_reported = p_abv * reported_bvps
        price_adjusted = p_abv * abvps
        
        assert abvps == 520.0
        assert price_reported > price_adjusted
        assert round(price_reported - price_adjusted, 2) == 130.62


# -----------------------------------------------------------------------------
# 3. DCF SINGULARITY & MID-YEAR DISCOUNTING TESTS
# -----------------------------------------------------------------------------
class TestDCFStress:
    def test_mid_year_discounting_convergence(self):
        """Mid-year discounting must converge to exactly sqrt(1+WACC) * Year-End PV."""
        fcff_list = [1000.0, 1200.0, 1400.0, 1600.0, 1800.0]
        wacc = 0.12
        
        pv_ye = sum(cf / ((1.0 + wacc) ** t) for t, cf in enumerate(fcff_list, start=1))
        pv_my = sum(cf / ((1.0 + wacc) ** (t - 0.5)) for t, cf in enumerate(fcff_list, start=1))
        
        expected_ratio = math.sqrt(1.0 + wacc)
        actual_ratio = pv_my / pv_ye
        
        assert math.isclose(actual_ratio, expected_ratio, rel_tol=1e-9)
        assert (pv_my - pv_ye) / pv_my > 0.05 # >5% systematic undervaluation

    def test_gordon_growth_singularity(self):
        """Gordon growth must guard against WACC <= g denominator singularity."""
        fcff_terminal = 1500.0 * 1.04
        g = 0.04
        
        # When WACC == g
        wacc_equal = g
        with pytest.raises(ZeroDivisionError):
            _ = fcff_terminal / (wacc_equal - g)
            
        # When WACC < g (negative terminal value)
        wacc_lower = 0.03
        tv_negative = fcff_terminal / (wacc_lower - g)
        assert tv_negative < 0 # Absurd negative valuation


# -----------------------------------------------------------------------------
# 4. HARMONIC MEAN P/E TESTS
# -----------------------------------------------------------------------------
class TestHarmonicMeanStress:
    def test_arithmetic_mean_corruption_by_outlier(self):
        """Outliers with near-zero earnings corrupt arithmetic mean but leave Harmonic Mean robust."""
        mcap_a, pat_a = 10000.0, 1000.0  # PE = 10
        mcap_b, pat_b = 8000.0, 400.0    # PE = 20
        mcap_c, pat_c = 6000.0, 0.5      # PE = 12000
        
        total_mcap = mcap_a + mcap_b + mcap_c
        total_pat = pat_a + pat_b + pat_c
        
        w_a = mcap_a / total_mcap
        w_b = mcap_b / total_mcap
        w_c = mcap_c / total_mcap
        
        arithmetic_pe = w_a * 10.0 + w_b * 20.0 + w_c * 12000.0
        harmonic_pe = total_mcap / total_pat
        
        assert arithmetic_pe > 3000.0 # Blown up by outlier
        assert 16.0 < harmonic_pe < 18.0 # Stays true to aggregate earnings capital
        assert arithmetic_pe / harmonic_pe > 150.0

    def test_harmonic_pe_with_loss_makers(self):
        """Loss-making companies must not yield negative PE multiples or corrupt profitable cohorts."""
        companies = [
            {"mcap": 1000.0, "pat": 100.0},
            {"mcap": 1000.0, "pat": -50.0},
        ]
        
        # Profitable only cohort
        prof_cohort = [c for c in companies if c['pat'] > 0]
        pe_prof = sum(c['mcap'] for c in prof_cohort) / sum(c['pat'] for c in prof_cohort)
        assert pe_prof == 10.0
        
        # Aggregate with loss-maker
        agg_pat = sum(c['pat'] for c in companies)
        pe_agg = sum(c['mcap'] for c in companies) / agg_pat
        assert pe_agg == 40.0 # 2000 Mcap on 50 net profit
        
        # Insolvent sector
        companies_insolvent = [
            {"mcap": 1000.0, "pat": -100.0},
            {"mcap": 1000.0, "pat": -50.0},
        ]
        agg_pat_loss = sum(c['pat'] for c in companies_insolvent)
        assert agg_pat_loss < 0
        pe_output = "N/A (Loss-Making Sector)" if agg_pat_loss <= 0 else None
        assert pe_output == "N/A (Loss-Making Sector)"


# -----------------------------------------------------------------------------
# 5. INPUT COST PASS-THROUGH TESTS
# -----------------------------------------------------------------------------
class TestPassThroughStress:
    def test_negative_passthrough_inversion(self):
        """Legacy ratio price_change / cost_change produces absurd negative values during deflation."""
        # Cost deflation (-15%), price increase (+2%)
        dc = -15.0
        dp = 2.0
        
        legacy_ratio = dp / dc # -0.133
        assert legacy_ratio < 0 # Legacy claims negative pricing power
        
        # Audit formulation: 1 + (dp - dc) / p_base
        p_base = 100.0
        audit_metric = 1.0 + (dp - dc) / p_base # 1 + 17/100 = 1.17
        assert audit_metric > 1.0 # Correctly recognizes margin expansion & pricing power


# -----------------------------------------------------------------------------
# 6. CORPORATE ACTION FRACTIONAL AUCTION TESTS
# -----------------------------------------------------------------------------
class TestCorporateActionsStress:
    def test_fractional_auction_vs_integer_truncation(self):
        """Integer truncation int(qty * ratio) destroys shareholder capital; auction restores it."""
        shares = 15
        price_before = 120000.0
        bonus_ratio = 0.5 # 1:2 bonus
        
        factor = 1.0 + bonus_ratio
        ex_price = price_before / factor # 80000.0
        
        # Legacy truncation:
        legacy_shares = int(shares * factor) # 22
        legacy_value = legacy_shares * ex_price # 1,760,000.0
        lost_capital = (shares * price_before) - legacy_value
        
        # SEBI auction proceeds:
        total_shares = shares * factor # 22.5
        whole_shares = int(math.floor(total_shares)) # 22
        fractional_shares = total_shares - whole_shares # 0.5
        cash_credit = fractional_shares * ex_price # 40,000.0
        sebi_total = whole_shares * ex_price + cash_credit
        
        assert lost_capital == 40000.0
        assert sebi_total == shares * price_before # No capital lost


# -----------------------------------------------------------------------------
# 7. INDIAN CAPITAL GAINS TAX TESTS
# -----------------------------------------------------------------------------
class TestIndianTaxStress:
    def test_budget_2024_rates(self):
        """Verifies STCG 20% and LTCG 12.5% effective July 23, 2024."""
        cutoff = date(2024, 7, 23)
        
        # Pre vs Post STCG
        date_pre = date(2024, 6, 1)
        date_post = date(2024, 8, 1)
        
        rate_stcg_pre = 0.15 if date_pre < cutoff else 0.20
        rate_stcg_post = 0.20 if date_post >= cutoff else 0.15
        
        assert rate_stcg_pre == 0.15
        assert rate_stcg_post == 0.20

    def test_ltcg_125k_exemption(self):
        """Verifies Ôé╣1.25 Lakh annual basic exemption under Section 112A."""
        exemption = 125000.0
        gain_1 = 110000.0
        gain_2 = 200000.0
        
        taxable_1 = max(0.0, gain_1 - exemption)
        taxable_2 = max(0.0, gain_2 - exemption)
        
        assert taxable_1 == 0.0
        assert taxable_2 == 75000.0
        assert taxable_2 * 0.125 == 9375.0

    def test_section_55_2_ac_grandfathering(self):
        """
        Verifies Section 55(2)(ac) Cost of Acquisition:
        COA = max(Actual_Cost, min(FMV_Jan31_2018, Sale_Price))
        """
        def calc_coa(actual_cost, fmv, sale_price):
            return max(actual_cost, min(fmv, sale_price))
            
        # Case A: Upward trend post-2018
        assert calc_coa(500.0, 960.0, 1400.0) == 960.0
        # Case B: Peaked on Jan 31 2018, sold between cost and FMV
        assert calc_coa(500.0, 960.0, 800.0) == 800.0
        # Case C: Sold below actual cost
        assert calc_coa(500.0, 960.0, 400.0) == 500.0
        # Case D: Crashed before Jan 31 2018, sold below cost
        assert calc_coa(500.0, 300.0, 400.0) == 500.0
