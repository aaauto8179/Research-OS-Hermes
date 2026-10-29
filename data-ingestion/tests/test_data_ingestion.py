"""
Tests for FROS Data Ingestion Layer
"""

import pytest
import asyncio
from datetime import date, datetime
from unittest.mock import AsyncMock, Mock, patch

from data_ingestion import (
    CompanySnapshot,
    DocumentMetadata,
    FinancialStatement,
    DataSource,
    DocumentType,
    MockDataSandbox,
    ScreenerSource,
    BSENSESource,
    PITTransformer,
    get_mock_company,
    get_all_mock_companies,
)


class TestMockDataSandbox:
    """Test offline mock sandbox"""
    
    def test_get_known_companies(self):
        """Test getting known mock companies"""
        reliance = MockDataSandbox.get_company('RELIANCE')
        assert reliance is not None
        assert reliance.symbol == 'RELIANCE'
        assert reliance.name == 'Reliance Industries Ltd'
        assert reliance.current_price == 2500.0
        assert reliance.market_cap == 1690000.0
        assert reliance.pe == 24.5
        assert reliance.sector == 'Oil & Gas'
    
    def test_get_tcs(self):
        tcs = MockDataSandbox.get_company('TCS')
        assert tcs is not None
        assert tcs.symbol == 'TCS'
        assert tcs.roe == 0.45
        assert tcs.debt_equity == 0.01
    
    def test_get_hdfcbank(self):
        hdfc = MockDataSandbox.get_company('HDFCBANK')
        assert hdfc is not None
        assert hdfc.symbol == 'HDFCBANK'
        assert hdfc.pe == 18.5
        assert hdfc.ev_ebitda is None  # N/A for banks
    
    def test_unknown_company(self):
        unknown = MockDataSandbox.get_company('UNKNOWN')
        assert unknown is None
    
    def test_get_all_companies(self):
        all_companies = MockDataSandbox.get_all_companies()
        assert len(all_companies) == 3
        symbols = {c.symbol for c in all_companies}
        assert symbols == {'RELIANCE', 'TCS', 'HDFCBANK'}
    
    def test_mock_financials(self):
        financials = MockDataSandbox.get_mock_financials('RELIANCE')
        assert 'revenue' in financials
        assert 'ebitda' in financials
        assert 'pat' in financials
        assert len(financials['revenue']) == 5
        assert financials['years'] == [2020, 2021, 2022, 2023, 2024]


class TestConvenienceFunctions:
    """Test module-level convenience functions"""
    
    def test_get_mock_company(self):
        company = get_mock_company('RELIANCE')
        assert company is not None
        assert company.symbol == 'RELIANCE'
    
    def test_get_all_mock_companies(self):
        companies = get_all_mock_companies()
        assert len(companies) == 3


class TestPITTransformer:
    """Test PIT-compliant data transformation"""
    
    def test_create_pit_record(self):
        record = PITTransformer.create_pit_record(
            company_symbol='RELIANCE',
            line_item='revenue',
            value=750000.0,
            period_end_date=date(2024, 3, 31),
            filing_date=date(2024, 5, 15),
            statement_type='PL',
            unit='INR_CRORES',
            source_document_hash='abc123',
            xbrl_tag='RevenueFromOperations',
        )
        
        assert record['company_symbol'] == 'RELIANCE'
        assert record['line_item'] == 'revenue'
        assert record['value'] == 750000.0
        assert record['period_end_date'] == '2024-03-31'
        assert record['filing_date'] == '2024-05-15'
        assert record['statement_type'] == 'PL'
        assert record['unit'] == 'INR_CRORES'
        assert record['source_document_hash'] == 'abc123'
        assert record['xbrl_tag'] == 'RevenueFromOperations'
        assert record['is_restated'] is False
        assert 'created_at' in record
    
    def test_handle_restatement(self):
        original = {
            'company_symbol': 'RELIANCE',
            'line_item': 'revenue',
            'value': 700000.0,
            'period_end_date': '2024-03-31',
            'filing_date': '2024-05-15',
            'statement_type': 'PL',
            'unit': 'INR_CRORES',
            'source_document_hash': 'abc123',
            'is_restated': False,
        }
        
        records = PITTransformer.handle_restatement(
            existing_record=original,
            new_value=720000.0,
            new_filing_date=date(2024, 8, 15),
            new_source_hash='def456',
        )
        
        assert len(records) == 2
        # Original unchanged
        assert records[0]['value'] == 700000.0
        assert records[0]['filing_date'] == '2024-05-15'
        assert records[0]['is_restated'] is False
        
        # Restated record
        assert records[1]['value'] == 720000.0
        assert records[1]['filing_date'] == '2024-08-15'
        assert records[1]['is_restated'] is True
        assert records[1]['restated_from_hash'] == 'abc123'
        assert records[1]['source_document_hash'] == 'def456'


class TestDocumentMetadata:
    """Test document metadata creation"""
    
    def test_document_metadata_creation(self):
        meta = DocumentMetadata(
            company_symbol='RELIANCE',
            title='Annual Report 2023-24',
            doc_type=DocumentType.ANNUAL_REPORT,
            source=DataSource.BSE,
            source_url='https://bseindia.com/report.pdf',
            file_hash='sha256hash',
            fiscal_year=2024,
            fiscal_quarter='FY',
            period_end_date=date(2024, 3, 31),
        )
        
        assert meta.company_symbol == 'RELIANCE'
        assert meta.doc_type == DocumentType.ANNUAL_REPORT
        assert meta.source == DataSource.BSE
        assert meta.fiscal_year == 2024
        assert meta.period_end_date == date(2024, 3, 31)


class TestBSENSESource:
    """Test BSE/NSE RSS source (unit tests with mocked responses)"""
    
    @pytest.mark.asyncio
    async def test_classify_document_type(self):
        async with BSENSESource() as source:
            # Test annual report
            assert source._classify_document_type('Annual Report 2023-24') == DocumentType.ANNUAL_REPORT
            assert source._classify_document_type('Annual Result') == DocumentType.ANNUAL_REPORT
            
            # Test concall
            assert source._classify_document_type('Concall Transcript Q4 FY24') == DocumentType.CONCALL_TRANSCRIPT
            assert source._classify_document_type('Earnings Call Transcript') == DocumentType.CONCALL_TRANSCRIPT
            
            # Test investor presentation
            assert source._classify_document_type('Investor Presentation Q3') == DocumentType.INVESTOR_PRESENTATION
            assert source._classify_document_type('Analyst Meet Presentation') == DocumentType.INVESTOR_PRESENTATION
            
            # Test quarterly result
            assert source._classify_document_type('Quarterly Result Q3 FY24') == DocumentType.QUARTERLY_RESULT
            assert source._classify_document_type('Un-audited Financial Result') == DocumentType.QUARTERLY_RESULT
            
            # Test credit rating
            assert source._classify_document_type('Credit Rating Update') == DocumentType.CREDIT_RATING
            
            # Test other
            assert source._classify_document_type('Board Meeting Outcome') == DocumentType.OTHER
            assert source._classify_document_type('Dividend Declaration') == DocumentType.OTHER
            
            # Default to news
            assert source._classify_document_type('Random News Item') == DocumentType.NEWS


class TestScreenerSource:
    """Test Screener.in source (unit tests with mocked responses)"""
    
    @pytest.mark.asyncio
    async def test_parse_company_page(self):
        async with ScreenerSource() as source:
            # Mock HTML content
            html = """
            <html>
                <h1 class="company-name">Test Company Ltd</h1>
                <span class="current-price">1,250.50</span>
                <span data-number="market_cap" data-value="500000"></span>
                <table class="ratio-table">
                    <tr><td>P/E Ratio</td><td>18.5</td></tr>
                    <tr><td>P/B Ratio</td><td>3.2</td></tr>
                    <tr><td>EV/EBITDA</td><td>12.8</td></tr>
                    <tr><td>ROE</td><td>22.5</td></tr>
                    <tr><td>ROCE</td><td>25.0</td></tr>
                    <tr><td>Debt/Equity</td><td>0.3</td></tr>
                    <tr><td>FCF Yield</td><td>4.5</td></tr>
                    <tr><td>Sales Growth 3Y</td><td>15.2</td></tr>
                    <tr><td>Profit Growth 3Y</td><td>18.0</td></tr>
                    <tr><td>Promoter Holding</td><td>55.0</td></tr>
                    <tr><td>Pledged Holding</td><td>1.5</td></tr>
                </table>
            </html>
            """
            
            snapshot = source._parse_company_page('TEST', html)
            
            assert snapshot.symbol == 'TEST'
            assert snapshot.name == 'Test Company Ltd'
            assert snapshot.current_price == 1250.50
            assert snapshot.market_cap == 500000
            assert snapshot.pe == 18.5
            assert snapshot.pb == 3.2
            assert snapshot.ev_ebitda == 12.8
            assert snapshot.roe == 22.5  # Note: stored as percentage
            assert snapshot.roce == 25.0
            assert snapshot.debt_equity == 0.3
            assert snapshot.fcf_yield == 4.5
            assert snapshot.sales_growth_3y == 15.2
            assert snapshot.profit_growth_3y == 18.0
            assert snapshot.promoter_holding == 55.0
            assert snapshot.pledged_holding == 1.5


if __name__ == "__main__":
    pytest.main([__file__, "-v"])