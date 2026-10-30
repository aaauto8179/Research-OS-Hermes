"""
Fundamental Research OS - Data Ingestion Layer
===============================================
Unified data ingestion from Indian market sources:
- Screener.in (unofficial API)
- BSE/NSE corporate filings RSS
- PDF parsing for annual reports, concalls, investor presentations
- Point-in-Time (PIT) compliant storage

Author: Data & Systems Architect Agent
Spec: DPS-01_SEC_XBRL_Ingestion.md, DPS-02_PIT_Database_Schema.sql
"""

from __future__ import annotations
import asyncio
import aiohttp
import json
import re
import hashlib
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Any, AsyncGenerator
from dataclasses import dataclass, field
from enum import Enum
from abc import ABC, abstractmethod
import logging
from urllib.parse import urljoin, urlparse
import feedparser
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

# ============================================================
# CORE TYPES
# ============================================================

class DataSource(str, Enum):
    SCREENER = "screener"
    BSE = "bse"
    NSE = "nse"
    COMPANY_WEBSITE = "company_website"
    MANUAL_UPLOAD = "manual_upload"

class DocumentType(str, Enum):
    ANNUAL_REPORT = "annual_report"
    CONCALL_TRANSCRIPT = "concall_transcript"
    INVESTOR_PRESENTATION = "investor_presentation"
    QUARTERLY_RESULT = "quarterly_result"
    CREDIT_RATING = "credit_rating"
    NEWS = "news"
    OTHER = "other"

@dataclass
class CompanySnapshot:
    """Lightweight company snapshot for screening"""
    symbol: str
    name: str
    current_price: float
    market_cap: float
    pe: Optional[float] = None
    pb: Optional[float] = None
    ev_ebitda: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_equity: Optional[float] = None
    fcf_yield: Optional[float] = None
    sales_growth_3y: Optional[float] = None
    profit_growth_3y: Optional[float] = None
    promoter_holding: Optional[float] = None
    pledged_holding: Optional[float] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    last_updated: datetime = field(default_factory=datetime.now)

@dataclass
class FinancialStatement:
    """Parsed financial statement line item"""
    company_symbol: str
    fiscal_year: int
    fiscal_quarter: str  # Q1, Q2, Q3, Q4, FY
    period_end_date: date
    filing_date: date
    statement_type: str  # PL, BS, CF
    line_item: str
    value: float
    unit: str = "INR_CRORES"
    source_document_hash: Optional[str] = None

@dataclass
class DocumentMetadata:
    """Document metadata for storage"""
    company_symbol: str
    title: str
    doc_type: DocumentType
    source: DataSource
    source_url: str
    file_hash: str
    fiscal_year: Optional[int] = None
    fiscal_quarter: Optional[str] = None
    period_end_date: Optional[date] = None
    pages: Optional[int] = None
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None

# ============================================================
# BASE CLASSES
# ============================================================

class BaseSource(ABC):
    """Abstract base for data sources"""
    
    def __init__(self, rate_limit_per_minute: int = 30):
        self.rate_limit_per_minute = rate_limit_per_minute
        self._last_request_time = 0
        self._request_count = 0
        self._window_start = 0
    
    async def _rate_limit(self):
        """Enforce rate limiting"""
        now = datetime.now().timestamp()
        if now - self._window_start >= 60:
            self._window_start = now
            self._request_count = 0
        
        if self._request_count >= self.rate_limit_per_minute:
            wait_time = 60 - (now - self._window_start)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
            self._window_start = datetime.now().timestamp()
            self._request_count = 0
        
        min_interval = 60 / self.rate_limit_per_minute
        elapsed = now - self._last_request_time
        if elapsed < min_interval:
            await asyncio.sleep(min_interval - elapsed)
        
        self._last_request_time = datetime.now().timestamp()
        self._request_count += 1
    
    @abstractmethod
    async def fetch(self, *args, **kwargs) -> Any:
        pass

class BaseParser(ABC):
    """Abstract base for document parsers"""
    
    @abstractmethod
    async def parse(self, content: bytes, metadata: DocumentMetadata) -> List[FinancialStatement]:
        pass

# ============================================================
# SCREENER.IN SOURCE
# ============================================================

class ScreenerSource(BaseSource):
    """
    Screener.in unofficial API client.
    Note: This is for educational/research purposes. Respect robots.txt and TOS.
    """
    
    BASE_URL = "https://www.screener.in"
    API_ENDPOINT = "/api/company/search/"
    
    def __init__(self, rate_limit_per_minute: int = 20):
        super().__init__(rate_limit_per_minute)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://www.screener.in/',
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch(self, *args, **kwargs) -> Any:
        """Abstract method implementation - delegates to specific methods"""
        if args and args[0] == 'search':
            return await self.search_companies(kwargs.get('query', ''))
        elif args and args[0] == 'company':
            return await self.get_company_data(kwargs.get('symbol', ''))
        elif args and args[0] == 'financials':
            return await self.get_financials(kwargs.get('symbol', ''))
        elif args and args[0] == 'quarterly':
            return await self.get_quarterly_results(kwargs.get('symbol', ''))
        return None
    
    async def search_companies(self, query: str) -> List[Dict]:
        """Search companies by name/symbol"""
        await self._rate_limit()
        
        if not self.session:
            raise RuntimeError("Session not initialized. Use async context manager.")
        
        params = {'q': query}
        async with self.session.get(f"{self.BASE_URL}{self.API_ENDPOINT}", params=params) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get('results', [])
            else:
                logger.warning(f"Screener search failed: {resp.status}")
                return []
    
    async def get_company_data(self, symbol: str) -> Optional[CompanySnapshot]:
        """Get comprehensive company data for screening"""
        await self._rate_limit()
        
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        # Get company page
        url = f"{self.BASE_URL}/company/{symbol}/"
        async with self.session.get(url) as resp:
            if resp.status != 200:
                logger.warning(f"Failed to fetch {symbol}: {resp.status}")
                return None
            
            html = await resp.text()
            return self._parse_company_page(symbol, html)
    
    async def get_financials(self, symbol: str) -> Dict[str, Any]:
        """Get financial statements from Screener"""
        await self._rate_limit()
        
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        url = f"{self.BASE_URL}/api/company/{symbol}/financials/"
        async with self.session.get(url) as resp:
            if resp.status == 200:
                return await resp.json()
            return {}
    
    async def get_quarterly_results(self, symbol: str) -> List[Dict]:
        """Get quarterly results"""
        await self._rate_limit()
        
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        url = f"{self.BASE_URL}/api/company/{symbol}/quarterly-results/"
        async with self.session.get(url) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get('results', [])
            return []
    
    def _parse_company_page(self, symbol: str, html: str) -> CompanySnapshot:
        """Parse company page HTML for key metrics"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract basic info
        name_elem = soup.find('h1', class_='company-name')
        name = name_elem.get_text(strip=True) if name_elem else symbol
        
        # Extract key ratios from the ratios table
        ratios = {}
        ratio_tables = soup.find_all('table', class_='ratio-table')
        for table in ratio_tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    key = cells[0].get_text(strip=True).lower().replace(' ', '_').replace('/', '_')
                    val_text = cells[1].get_text(strip=True)
                    try:
                        ratios[key] = float(val_text.replace(',', '').replace('%', ''))
                    except ValueError:
                        pass
        
        # Extract price and market cap
        price = None
        market_cap = None
        price_elem = soup.find('span', class_='current-price')
        if price_elem:
            try:
                price = float(price_elem.get_text(strip=True).replace(',', ''))
            except ValueError:
                pass
        
        mc_elem = soup.find('span', {'data-number': 'market_cap'})
        if mc_elem:
            try:
                market_cap = float(mc_elem.get('data-value', 0))
            except ValueError:
                pass
        
        return CompanySnapshot(
            symbol=symbol,
            name=name,
            current_price=price or 0,
            market_cap=market_cap or 0,
            pe=ratios.get('pe_ratio') or ratios.get('p_e') or ratios.get('p_e_ratio'),
            pb=ratios.get('pb_ratio') or ratios.get('p_b') or ratios.get('p_b_ratio'),
            ev_ebitda=ratios.get('ev_ebitda'),
            roe=ratios.get('roe'),
            roce=ratios.get('roce'),
            debt_equity=ratios.get('debt_equity') or ratios.get('debt_to_equity'),
            fcf_yield=ratios.get('fcf_yield'),
            sales_growth_3y=ratios.get('sales_growth_3y'),
            profit_growth_3y=ratios.get('profit_growth_3y'),
            promoter_holding=ratios.get('promoter_holding'),
            pledged_holding=ratios.get('pledged_holding'),
        )

# ============================================================
# BSE/NSE RSS FEED SOURCE
# ============================================================

class BSENSESource(BaseSource):
    """BSE/NSE corporate announcements RSS feed parser"""
    
    BSE_RSS = "https://www.bseindia.com/xml-data/corporate_announcements.xml"
    NSE_RSS = "https://www.nseindia.com/api/announcements"
    
    def __init__(self, rate_limit_per_minute: int = 10):
        super().__init__(rate_limit_per_minute)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/xml, application/rss+xml, text/xml',
            }
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch(self, *args, **kwargs) -> Any:
        """Abstract method implementation"""
        if args and args[0] == 'announcements':
            return await self.fetch_latest_announcements(kwargs.get('hours_back', 24))
        return None
    
    async def fetch_latest_announcements(self, hours_back: int = 24) -> List[DocumentMetadata]:
        """Fetch latest corporate announcements from BSE RSS"""
        await self._rate_limit()
        
        if not self.session:
            raise RuntimeError("Session not initialized")
        
        async with self.session.get(self.BSE_RSS) as resp:
            if resp.status != 200:
                logger.warning(f"BSE RSS fetch failed: {resp.status}")
                return []
            
            content = await resp.text()
            return self._parse_bse_rss(content, hours_back)
    
    def _parse_bse_rss(self, xml_content: str, hours_back: int) -> List[DocumentMetadata]:
        """Parse BSE RSS feed"""
        feed = feedparser.parse(xml_content)
        cutoff = datetime.now() - timedelta(hours=hours_back)
        announcements = []
        
        for entry in feed.entries:
            try:
                # Parse publication date
                pub_date = datetime(*entry.published_parsed[:6]) if entry.published_parsed else datetime.now()
                if pub_date < cutoff:
                    continue
                
                # Extract symbol from title/category
                title = entry.get('title', '')
                symbol_match = re.search(r'\b([A-Z]{2,10})\b', title)
                symbol = symbol_match.group(1) if symbol_match else 'UNKNOWN'
                
                # Determine document type from title
                doc_type = self._classify_document_type(title)
                
                # Get link
                link = entry.get('link', '')
                
                # Create hash
                content_hash = hashlib.sha256(f"{title}{link}{pub_date.isoformat()}".encode()).hexdigest()
                
                announcements.append(DocumentMetadata(
                    company_symbol=symbol,
                    title=title,
                    doc_type=doc_type,
                    source=DataSource.BSE,
                    source_url=link,
                    file_hash=content_hash,
                    fiscal_year=pub_date.year,
                    period_end_date=pub_date.date(),
                ))
            except Exception as e:
                logger.warning(f"Failed to parse BSE entry: {e}")
                continue
        
        return announcements
    
    def _classify_document_type(self, title: str) -> DocumentType:
        """Classify document type from title"""
        title_lower = title.lower()
        if any(kw in title_lower for kw in ['annual report', 'annual result', 'annualresult']):
            return DocumentType.ANNUAL_REPORT
        elif any(kw in title_lower for kw in ['concall', 'conference call', 'transcript', 'earnings call']):
            return DocumentType.CONCALL_TRANSCRIPT
        elif any(kw in title_lower for kw in ['investor presentation', 'presentation', 'analyst meet']):
            return DocumentType.INVESTOR_PRESENTATION
        elif any(kw in title_lower for kw in ['quarterly result', 'quarterlyresult', 'financial result', 'un-audited']):
            return DocumentType.QUARTERLY_RESULT
        elif any(kw in title_lower for kw in ['credit rating', 'rating']):
            return DocumentType.CREDIT_RATING
        elif any(kw in title_lower for kw in ['board meeting', 'agm', 'egm', 'dividend', 'bonus', 'split']):
            return DocumentType.OTHER
        return DocumentType.NEWS

# ============================================================
# PDF PARSERS
# ============================================================

class PDFParser(BaseParser):
    """PDF parser for financial documents using pdfplumber + Camelot"""
    
    def __init__(self):
        self._pdfplumber = None
        self._camelot = None
    
    def _get_pdfplumber(self):
        if self._pdfplumber is None:
            import pdfplumber
            self._pdfplumber = pdfplumber
        return self._pdfplumber
    
    def _get_camelot(self):
        if self._camelot is None:
            import camelot
            self._camelot = camelot
        return self._camelot
    
    async def parse(self, content: bytes, metadata: DocumentMetadata) -> List[FinancialStatement]:
        """Parse PDF and extract financial statements"""
        import io
        
        statements = []
        pdf_file = io.BytesIO(content)
        
        try:
            # Use pdfplumber for text extraction
            pdfplumber = self._get_pdfplumber()
            with pdfplumber.open(pdf_file) as pdf:
                metadata.pages = len(pdf.pages)
                
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                # Extract tables using Camelot for structured data
                pdf_file.seek(0)
                tables = self._extract_tables_camelot(pdf_file)
                
                # Parse financial statements from text and tables
                statements = self._parse_financial_statements(
                    full_text, tables, metadata
                )
        
        except Exception as e:
            logger.error(f"PDF parsing failed for {metadata.title}: {e}")
        
        return statements
    
    def _extract_tables_camelot(self, pdf_file) -> List[Any]:
        """Extract tables using Camelot"""
        try:
            camelot = self._get_camelot()
            tables = camelot.read_pdf(pdf_file, pages='all', flavor='stream')
            return tables
        except Exception as e:
            logger.warning(f"Camelot table extraction failed: {e}")
            return []
    
    def _parse_financial_statements(
        self, 
        text: str, 
        tables: List[Any], 
        metadata: DocumentMetadata
    ) -> List[FinancialStatement]:
        """Parse financial line items from text and tables"""
        statements = []
        
        # Common line item patterns (Indian GAAP/Ind-AS)
        line_item_patterns = {
            'revenue': [r'total\s+revenue', r'revenue\s+from\s+operations', r'net\s+sales'],
            'ebitda': [r'ebitda', r'earnings\s+before\s+interest\s+tax\s+depreciation'],
            'ebit': [r'ebit', r'operating\s+profit', r'profit\s+before\s+interest\s+and\s+tax'],
            'pbt': [r'profit\s+before\s+tax', r'pbt'],
            'pat': [r'profit\s+after\s+tax', r'pat', r'net\s+profit'],
            'eps': [r'earnings\s+per\s+share', r'basic\s+eps', r'diluted\s+eps'],
            'total_assets': [r'total\s+assets'],
            'total_equity': [r'total\s+equity', r'shareholders?\s+funds'],
            'total_debt': [r'total\s+debt', r'borrowings'],
            'cash': [r'cash\s+and\s+cash\s+equivalents', r'cash\s+&?\s*bank'],
            'depreciation': [r'depreciation\s+and\s+amortisation', r'depreciation'],
            'capex': [r'capital\s+expenditure', r'capex', r'purchase\s+of\s+fixed\s+assets'],
            'operating_cash_flow': [r'cash\s+generated\s+from\s+operations', r'operating\s+cash\s+flow'],
        }
        
        # Extract from tables (more reliable)
        for table in tables:
            df = table.df
            statements.extend(self._parse_table_df(df, metadata))
        
        # Fallback: regex extraction from text
        if not statements:
            statements.extend(self._regex_extract(text, metadata))
        
        return statements
    
    def _parse_table_df(self, df, metadata: DocumentMetadata) -> List[FinancialStatement]:
        """Parse financial data from table DataFrame"""
        statements = []
        
        # Try to identify period columns and line item rows
        # This is a simplified heuristic - production would need more sophistication
        try:
            # Look for date-like column headers
            period_cols = []
            for col in df.columns:
                col_str = str(col).lower()
                if any(kw in col_str for kw in ['202', '201', 'mar', 'jun', 'sep', 'dec', 'q1', 'q2', 'q3', 'q4', 'fy']):
                    period_cols.append(col)
            
            if not period_cols:
                return statements
            
            # First column typically has line items
            item_col = df.columns[0]
            
            for _, row in df.iterrows():
                item_name = str(row[item_col]).strip().lower()
                if not item_name or len(item_name) < 3:
                    continue
                
                # Match to canonical line items
                canonical = self._canonicalize_line_item(item_name)
                if not canonical:
                    continue
                
                # Extract values for each period
                for period_col in period_cols:
                    val = row[period_col]
                    if pd_is_number(val):
                        statements.append(FinancialStatement(
                            company_symbol=metadata.company_symbol,
                            fiscal_year=metadata.fiscal_year or datetime.now().year,
                            fiscal_quarter=metadata.fiscal_quarter or 'FY',
                            period_end_date=metadata.period_end_date or date.today(),
                            filing_date=date.today(),
                            statement_type='PL' if canonical in ['revenue', 'ebitda', 'ebit', 'pbt', 'pat'] else 'BS',
                            line_item=canonical,
                            value=float(val),
                            unit='INR_CRORES',
                            source_document_hash=metadata.file_hash,
                        ))
        except Exception as e:
            logger.warning(f"Table parsing failed: {e}")
        
        return statements
    
    def _canonicalize_line_item(self, item: str) -> Optional[str]:
        """Map raw line item to canonical name"""
        item = item.lower().replace('\n', ' ').strip()
        
        patterns = {
            'revenue': ['revenue', 'net sales', 'turnover', 'income from operations'],
            'ebitda': ['ebitda', 'operating profit before dep'],
            'ebit': ['ebit', 'operating profit', 'profit before interest and tax'],
            'pbt': ['profit before tax', 'pbt'],
            'pat': ['profit after tax', 'pat', 'net profit', 'profit for the period'],
            'eps': ['earnings per share', 'eps', 'basic eps', 'diluted eps'],
            'total_assets': ['total assets'],
            'total_equity': ['total equity', 'shareholders fund', 'net worth'],
            'total_debt': ['total debt', 'borrowings', 'long term borrowings'],
            'cash': ['cash and cash equivalent', 'cash & bank', 'cash and bank'],
            'depreciation': ['depreciation', 'amortisation', 'dep & amort'],
            'capex': ['capital expenditure', 'capex', 'purchase of fixed assets'],
            'operating_cash_flow': ['cash from operations', 'operating cash flow', 'cfo'],
        }
        
        for canonical, variants in patterns.items():
            if any(v in item for v in variants):
                return canonical
        return None
    
    def _regex_extract(self, text: str, metadata: DocumentMetadata) -> List[FinancialStatement]:
        """Regex fallback extraction"""
        statements = []
        # Simplified - production would use more sophisticated NLP
        return statements

class ConcallsParser(BaseParser):
    """Specialized parser for concall transcripts"""
    
    async def parse(self, content: bytes, metadata: DocumentMetadata) -> List[FinancialStatement]:
        """Extract management guidance, Q&A highlights from concall"""
        import io
        import pdfplumber
        
        statements = []
        
        try:
            pdf_file = io.BytesIO(content)
            with pdfplumber.open(pdf_file) as pdf:
                full_text = ""
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text += text + "\n"
                
                # Extract guidance statements
                guidance = self._extract_guidance(full_text)
                # Extract key Q&A
                qa_highlights = self._extract_qa_highlights(full_text)
                
                # Store as metadata (not financial statements per se)
                metadata.meta = metadata.meta or {}
                metadata.meta['guidance'] = guidance
                metadata.meta['qa_highlights'] = qa_highlights
        
        except Exception as e:
            logger.error(f"Concall parsing failed: {e}")
        
        return statements
    
    def _extract_guidance(self, text: str) -> List[Dict]:
        """Extract management guidance"""
        guidance = []
        patterns = [
            r'guidance.*?(\d+\.?\d*)\s*[%]',
            r'expect.*?(\d+\.?\d*)\s*[%]',
            r'target.*?(\d+\.?\d*)\s*[%]',
            r'project.*?(\d+\.?\d*)\s*[%]',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                context_start = max(0, match.start() - 200)
                context_end = min(len(text), match.end() + 200)
                guidance.append({
                    'text': text[context_start:context_end].strip(),
                    'value': float(match.group(1)) if match.groups() else None,
                })
        
        return guidance[:20]  # Limit
    
    def _extract_qa_highlights(self, text: str) -> List[Dict]:
        """Extract key Q&A highlights"""
        highlights = []
        # Look for analyst questions and management responses
        qa_pattern = r'(?:analyst|question|q:).*?(?:management|answer|a:)'
        matches = re.finditer(qa_pattern, text, re.IGNORECASE | re.DOTALL)
        
        for match in list(matches)[:30]:
            snippet = match.group()[:500]
            highlights.append({'snippet': snippet.strip()})
        
        return highlights

# ============================================================
# DATA TRANSFORMERS (PIT-COMPLIANT)
# ============================================================

class PITTransformer:
    """Transform raw data into Point-in-Time compliant format"""
    
    @staticmethod
    def create_pit_record(
        company_symbol: str,
        line_item: str,
        value: float,
        period_end_date: date,
        filing_date: date,
        statement_type: str,
        unit: str = "INR_CRORES",
        source_document_hash: Optional[str] = None,
        xbrl_tag: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a PIT-compliant financial record"""
        return {
            'company_symbol': company_symbol,
            'line_item': line_item,
            'value': value,
            'period_end_date': period_end_date.isoformat(),
            'filing_date': filing_date.isoformat(),
            'statement_type': statement_type,
            'unit': unit,
            'source_document_hash': source_document_hash,
            'xbrl_tag': xbrl_tag,
            'is_restated': False,
            'created_at': datetime.now().isoformat(),
        }
    
    @staticmethod
    def handle_restatement(
        existing_record: Dict[str, Any],
        new_value: float,
        new_filing_date: date,
        new_source_hash: str,
    ) -> List[Dict[str, Any]]:
        """Handle restatement by preserving original and adding restated version"""
        # Original record remains unchanged (PIT principle)
        # New record points to original via restated_from
        restated = existing_record.copy()
        restated['value'] = new_value
        restated['filing_date'] = new_filing_date.isoformat()
        restated['source_document_hash'] = new_source_hash
        restated['is_restated'] = True
        restated['restated_from_hash'] = existing_record.get('source_document_hash')
        restated['created_at'] = datetime.now().isoformat()
        
        return [existing_record, restated]

# ============================================================
# OFFLINE/MOCK SANDBOX
# ============================================================

class MockDataSandbox:
    """Offline sandbox with pre-cached test data"""
    
    # Pre-loaded test companies for development
    MOCK_COMPANIES = {
        'RELIANCE': CompanySnapshot(
            symbol='RELIANCE',
            name='Reliance Industries Ltd',
            current_price=2500.0,
            market_cap=1690000.0,
            pe=24.5,
            pb=2.1,
            ev_ebitda=14.2,
            roe=0.12,
            roce=0.10,
            debt_equity=0.45,
            fcf_yield=0.035,
            sales_growth_3y=0.15,
            profit_growth_3y=0.18,
            promoter_holding=0.50,
            pledged_holding=0.02,
            sector='Oil & Gas',
            industry='Refining & Marketing',
        ),
        'TCS': CompanySnapshot(
            symbol='TCS',
            name='Tata Consultancy Services Ltd',
            current_price=3800.0,
            market_cap=1380000.0,
            pe=28.5,
            pb=12.5,
            ev_ebitda=19.8,
            roe=0.45,
            roce=0.52,
            debt_equity=0.01,
            fcf_yield=0.045,
            sales_growth_3y=0.12,
            profit_growth_3y=0.10,
            promoter_holding=0.72,
            pledged_holding=0.0,
            sector='IT Services',
            industry='Software Services',
        ),
        'HDFCBANK': CompanySnapshot(
            symbol='HDFCBANK',
            name='HDFC Bank Ltd',
            current_price=1650.0,
            market_cap=920000.0,
            pe=18.5,
            pb=2.8,
            ev_ebitda=None,  # N/A for banks
            roe=0.17,
            roce=None,
            debt_equity=None,
            fcf_yield=None,
            sales_growth_3y=0.18,
            profit_growth_3y=0.20,
            promoter_holding=0.26,
            pledged_holding=0.0,
            sector='Banking',
            industry='Private Sector Bank',
        ),
    }
    
    @classmethod
    def get_company(cls, symbol: str) -> Optional[CompanySnapshot]:
        return cls.MOCK_COMPANIES.get(symbol.upper())
    
    @classmethod
    def get_all_companies(cls) -> List[CompanySnapshot]:
        return list(cls.MOCK_COMPANIES.values())
    
    @classmethod
    def get_mock_financials(cls, symbol: str) -> Dict[str, Any]:
        """Return mock financial statements for testing"""
        return {
            'revenue': [500000, 550000, 600000, 680000, 750000],
            'ebitda': [80000, 90000, 100000, 115000, 130000],
            'pat': [40000, 45000, 52000, 60000, 70000],
            'total_assets': [1200000, 1300000, 1450000, 1600000, 1750000],
            'total_equity': [600000, 650000, 720000, 800000, 900000],
            'total_debt': [200000, 220000, 250000, 280000, 300000],
            'cash': [150000, 180000, 200000, 220000, 250000],
            'years': [2020, 2021, 2022, 2023, 2024],
        }

# ============================================================
# FACTORY
# ============================================================

class DataIngestionFactory:
    """Factory for creating data ingestion components"""
    
    @staticmethod
    def create_screener_source(rate_limit: int = 20) -> ScreenerSource:
        return ScreenerSource(rate_limit_per_minute=rate_limit)
    
    @staticmethod
    def create_bse_nse_source(rate_limit: int = 10) -> BSENSESource:
        return BSENSESource(rate_limit_per_minute=rate_limit)
    
    @staticmethod
    def create_pdf_parser() -> PDFParser:
        return PDFParser()
    
    @staticmethod
    def create_concall_parser() -> ConcallsParser:
        return ConcallsParser()
    
    @staticmethod
    def create_pit_transformer() -> PITTransformer:
        return PITTransformer()
    
    @staticmethod
    def create_mock_sandbox() -> MockDataSandbox:
        return MockDataSandbox()

# ============================================================
# CONVENIENCE FUNCTIONS
# ============================================================

async def fetch_screener_company(symbol: str) -> Optional[CompanySnapshot]:
    """Quick fetch from Screener.in"""
    async with ScreenerSource() as source:
        return await source.get_company_data(symbol)

async def fetch_latest_bse_announcements(hours_back: int = 24) -> List[DocumentMetadata]:
    """Quick fetch from BSE RSS"""
    async with BSENSESource() as source:
        return await source.fetch_latest_announcements(hours_back)

def get_mock_company(symbol: str) -> Optional[CompanySnapshot]:
    """Get mock company for offline development"""
    return MockDataSandbox.get_company(symbol)

def get_all_mock_companies() -> List[CompanySnapshot]:
    return MockDataSandbox.get_all_companies()