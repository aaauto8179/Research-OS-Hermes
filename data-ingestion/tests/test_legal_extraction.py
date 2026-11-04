"""
Tests for Legal Checks & Contingent Liability Extraction
"""
import pytest
from data_ingestion.extractors.legal import (
    extract_contingent_liabilities,
    ContingentLiability,
    LiabilityCategory,
    LiabilityStatus,
)


class TestLegalExtraction:
    """Test contingent liability extraction from annual report text"""

    def test_extract_contingent_liabilities_basic(self):
        """Basic extraction from standard contingent liability note"""
        pdf_text = """
        Note 30: Contingent Liabilities not provided for
        
        (a) Claims against the Company not acknowledged as debts:
        (i) Income Tax demands for AY 2020-21: ₹ 450 Cr (pending before CIT(A))
        (ii) GST demands for FY 2021-22: ₹ 120 Cr (pending before Appellate Authority)
        (iii) Customs duty demand: ₹ 80 Cr (stayed by High Court)
        
        (b) Guarantees given on behalf of subsidiaries: ₹ 200 Cr
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        assert len(liabilities) >= 3
        # Check first liability
        tax_liab = next((l for l in liabilities if "Income Tax" in l.description), None)
        assert tax_liab is not None
        assert tax_liab.amount == 450
        assert tax_liab.category == LiabilityCategory.TAX_DISPUTE
        assert tax_liab.status == LiabilityStatus.PENDING
        assert tax_liab.authority == "CIT(A)"
        assert tax_liab.year == "2020-21"
        assert tax_liab.confidence > 0.7

    def test_extract_tax_dispute_classification(self):
        """Tax disputes should be classified with correct section mapping"""
        pdf_text = """
        Contingent Liabilities:
        1. Income Tax demand u/s 143(3) for AY 2019-20: ₹ 300 Cr
        2. Penalty u/s 271(1)(c) for AY 2020-21: ₹ 150 Cr
        3. Prosecution u/s 276C for AY 2018-19: ₹ 50 Cr
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        # Check section mapping
        s143 = next((l for l in liabilities if "143(3)" in l.description), None)
        assert s143 is not None
        assert s143.category == LiabilityCategory.TAX_DISPUTE
        assert "143(3)" in s143.description
        
        s271 = next((l for l in liabilities if "271(1)(c)" in l.description), None)
        assert s271 is not None
        assert s271.category == LiabilityCategory.TAX_DISPUTE
        
        s276 = next((l for l in liabilities if "276C" in l.description), None)
        assert s276 is not None
        assert s276.category == LiabilityCategory.TAX_DISPUTE

    def test_extract_litigation_category(self):
        """Civil, criminal, arbitration cases should be classified as Litigation"""
        pdf_text = """
        Contingent Liabilities:
        1. Civil suit filed by vendor: ₹ 75 Cr (pending in District Court)
        2. Arbitration with supplier: ₹ 200 Cr (evidence stage)
        3. Criminal complaint by SEBI: ₹ 10 Cr (investigation stage)
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        civil = next((l for l in liabilities if "Civil suit" in l.description), None)
        assert civil is not None
        assert civil.category == LiabilityCategory.LITIGATION
        
        arb = next((l for l in liabilities if "Arbitration" in l.description), None)
        assert arb is not None
        assert arb.category == LiabilityCategory.LITIGATION
        
        criminal = next((l for l in liabilities if "Criminal" in l.description), None)
        assert criminal is not None
        assert criminal.category == LiabilityCategory.LITIGATION

    def test_extract_regulatory_category(self):
        """SEBI, RBI, MCA notices should be classified as Regulatory"""
        pdf_text = """
        Contingent Liabilities:
        1. SEBI show cause notice: ₹ 25 Cr (reply filed)
        2. RBI penalty order: ₹ 5 Cr (appeal filed)
        3. MCA prosecution: ₹ 2 Cr (pending)
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        sebi = next((l for l in liabilities if "SEBI" in l.description), None)
        assert sebi is not None
        assert sebi.category == LiabilityCategory.REGULATORY
        assert sebi.authority == "SEBI"
        
        rbi = next((l for l in liabilities if "RBI" in l.description), None)
        assert rbi is not None
        assert rbi.category == LiabilityCategory.REGULATORY

    def test_extract_status_tracking(self):
        """Status should be extracted: Pending, Stayed, Decided, Settled"""
        pdf_text = """
        Contingent Liabilities:
        1. Tax demand AY 2020-21: ₹ 100 Cr (pending)
        2. GST demand: ₹ 50 Cr (stayed by High Court)
        3. Arbitration award: ₹ 30 Cr (decided - favorable)
        4. Vendor settlement: ₹ 20 Cr (settled)
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        pending = next((l for l in liabilities if "pending" in l.description.lower()), None)
        assert pending is not None
        assert pending.status == LiabilityStatus.PENDING
        
        stayed = next((l for l in liabilities if "stayed" in l.description.lower()), None)
        assert stayed is not None
        assert stayed.status == LiabilityStatus.STAYED
        
        decided = next((l for l in liabilities if "decided" in l.description.lower()), None)
        assert decided is not None
        assert decided.status in (LiabilityStatus.DECIDED_FAVORABLE, LiabilityStatus.DECIDED_ADVERSE)
        
        settled = next((l for l in liabilities if "settled" in l.description.lower()), None)
        assert settled is not None
        assert settled.status == LiabilityStatus.SETTLED

    def test_extract_amounts_in_crores(self):
        """Amounts should be parsed correctly in ₹ Crores"""
        pdf_text = """
        Contingent Liabilities:
        1. Demand: ₹ 1,250.50 Cr
        2. Claim: Rs. 500 Cr
        3. Liability: INR 75.25 Crores
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        assert len(liabilities) >= 3
        amounts = [l.amount for l in liabilities]
        assert 1250.5 in amounts or 1250.50 in amounts
        assert 500.0 in amounts
        assert 75.25 in amounts

    def test_empty_text_returns_empty_list(self):
        """Empty or irrelevant text should return empty list"""
        liabilities = extract_contingent_liabilities("")
        assert liabilities == []
        
        liabilities = extract_contingent_liabilities("This is just regular text with no contingent liabilities")
        assert liabilities == []

    def test_caro_clause_mapping_in_extraction(self):
        """Extracted liabilities should have CARO clause hints"""
        pdf_text = """
        Contingent Liabilities:
        1. Statutory dues (Income Tax) unpaid: ₹ 100 Cr
        2. Loan default to bank: ₹ 200 Cr
        3. Fraud reported by auditor: ₹ 50 Cr
        """
        
        liabilities = extract_contingent_liabilities(pdf_text)
        
        statutory = next((l for l in liabilities if "Statutory" in l.description), None)
        assert statutory is not None
        assert statutory.caro_clause == "Clause (vii)"
        
        loan = next((l for l in liabilities if "Loan default" in l.description), None)
        assert loan is not None
        assert loan.caro_clause == "Clause (ix)"
        
        fraud = next((l for l in liabilities if "Fraud" in l.description), None)
        assert fraud is not None
        assert fraud.caro_clause == "Clause (xvii)"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])