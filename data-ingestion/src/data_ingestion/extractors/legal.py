"""
Legal Checks & Contingent Liability Extractor
Extracts structured contingent liabilities from annual report PDF text.
"""
import re
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum


class LiabilityCategory(str, Enum):
    """Categories of contingent liabilities"""
    TAX_DISPUTE = "Tax Dispute"
    LITIGATION = "Litigation"
    REGULATORY = "Regulatory"
    ENVIRONMENTAL = "Environmental"
    OTHERS = "Others"


class LiabilityStatus(str, Enum):
    """Status of contingent liability"""
    PENDING = "Pending"
    STAYED = "Stayed"
    DECIDED_FAVORABLE = "Decided (Favorable)"
    DECIDED_ADVERSE = "Decided (Adverse)"
    SETTLED = "Settled"


@dataclass
class ContingentLiability:
    """Structured contingent liability entry"""
    description: str
    amount: float  # in ₹ Crores
    category: LiabilityCategory
    status: LiabilityStatus
    authority: str
    year: str
    caro_clause: str
    confidence: float  # 0.0 to 1.0


# Regex patterns for extraction
CONTINGENT_LIABILITY_PATTERNS = [
    # "contingent liabilities not provided for"
    re.compile(r'contingent liabilit(?:y|ies)\s+not\s+provided\s+for', re.IGNORECASE),
    # "claims against the company not acknowledged as debts"
    re.compile(r'claims?\s+against\s+(?:the\s+)?company\s+not\s+acknowledged\s+as\s+debts?', re.IGNORECASE),
    # "tax demands"
    re.compile(r'tax\s+demands?', re.IGNORECASE),
    # "income tax demand"
    re.compile(r'income\s+tax\s+demands?', re.IGNORECASE),
    # "GST demand"
    re.compile(r'GST\s+demands?', re.IGNORECASE),
    # "customs duty"
    re.compile(r'customs?\s+duty\s+demands?', re.IGNORECASE),
    # "show cause notice"
    re.compile(r'show\s+cause\s+notices?', re.IGNORECASE),
    # "penalty"
    re.compile(r'penalt(?:y|ies)', re.IGNORECASE),
    # "prosecution"
    re.compile(r'prosecution', re.IGNORECASE),
    # "arbitration"
    re.compile(r'arbitration', re.IGNORECASE),
    # "civil suit"
    re.compile(r'civil\s+suits?', re.IGNORECASE),
    # "criminal"
    re.compile(r'criminal\s+(?:complaint|case|prosecution)', re.IGNORECASE),
    # "guarantees"
    re.compile(r'guarantees?\s+given', re.IGNORECASE),
]

# Amount extraction patterns (₹ Crores)
AMOUNT_PATTERNS = [
    re.compile(r'[₹Rs\.]\s*([\d,]+\.?\d*)\s*(?:Cr|Crores?|CRORES?)', re.IGNORECASE),
    re.compile(r'INR\s+([\d,]+\.?\d*)\s*(?:Cr|Crores?|CRORES?)', re.IGNORECASE),
    re.compile(r'([\d,]+\.?\d*)\s*(?:Cr|Crores?|CRORES?)', re.IGNORECASE),
]

# Year/Assessment Year patterns
YEAR_PATTERNS = [
    re.compile(r'(?:AY|FY|Assessment Year|Financial Year)\s*[:\-]?\s*(\d{4}[-/]\d{2,4})', re.IGNORECASE),
    re.compile(r'(\d{4}[-/]\d{2,4})', re.IGNORECASE),
]

# Status patterns
STATUS_PATTERNS = {
    LiabilityStatus.STAYED: [re.compile(r'\bstayed\b', re.IGNORECASE), re.compile(r'stay\s+granted', re.IGNORECASE)],
    LiabilityStatus.SETTLED: [re.compile(r'\bsettled\b', re.IGNORECASE), re.compile(r'\bcompromise\b', re.IGNORECASE)],
    LiabilityStatus.DECIDED_FAVORABLE: [re.compile(r'decided\s+(?:in\s+favor|favorable)', re.IGNORECASE), re.compile(r'dismissed', re.IGNORECASE)],
    LiabilityStatus.DECIDED_ADVERSE: [re.compile(r'decided\s+against', re.IGNORECASE), re.compile(r'adverse', re.IGNORECASE)],
    LiabilityStatus.PENDING: [re.compile(r'\bpending\b', re.IGNORECASE), re.compile(r'\bhearing\b', re.IGNORECASE), re.compile(r'appeal\s+filed', re.IGNORECASE)],
}

# Authority patterns (order matters - more specific first)
AUTHORITY_PATTERNS = [
    ("CIT(A)", re.compile(r'CIT\s*\(A\)', re.IGNORECASE)),
    ("ITAT", re.compile(r'ITAT', re.IGNORECASE)),
    ("High Court", re.compile(r'High\s+Court', re.IGNORECASE)),
    ("Supreme Court", re.compile(r'Supreme\s+Court', re.IGNORECASE)),
    ("Appellate Authority", re.compile(r'Appellate\s+Authority', re.IGNORECASE)),
    ("SEBI", re.compile(r'\bSEBI\b', re.IGNORECASE)),
    ("RBI", re.compile(r'\bRBI\b', re.IGNORECASE)),
    ("MCA", re.compile(r'\bMCA\b', re.IGNORECASE)),
    ("SPCB", re.compile(r'\bSPCB\b', re.IGNORECASE)),
    ("District Court", re.compile(r'District\s+Court', re.IGNORECASE)),
    ("Arbitral Tribunal", re.compile(r'Arbitral\s+Tribunal', re.IGNORECASE)),
    ("Arbitration", re.compile(r'\bArbitration\b', re.IGNORECASE)),
]

# Category classification patterns
CATEGORY_PATTERNS = {
    LiabilityCategory.TAX_DISPUTE: [
        re.compile(r'income\s+tax', re.IGNORECASE),
        re.compile(r'GST', re.IGNORECASE),
        re.compile(r'customs?\s+duty', re.IGNORECASE),
        re.compile(r'tax\s+demand', re.IGNORECASE),
        re.compile(r'penalt(?:y|ies)\s+u?/?\s*s?\.?\s*271', re.IGNORECASE),
        re.compile(r'prosecution\s+u?/?\s*s?\.?\s*276', re.IGNORECASE),
        re.compile(r'assessment\s+u?/?\s*s?\.?\s*143', re.IGNORECASE),
        re.compile(r'statutory\s+dues', re.IGNORECASE),
    ],
    LiabilityCategory.LITIGATION: [
        re.compile(r'civil\s+suit', re.IGNORECASE),
        re.compile(r'arbitration', re.IGNORECASE),
        re.compile(r'criminal\s+(?:complaint|case|prosecution)', re.IGNORECASE),
        re.compile(r'vendor\s+dispute', re.IGNORECASE),
        re.compile(r'contract\s+dispute', re.IGNORECASE),
        re.compile(r'employee\s+litigation', re.IGNORECASE),
    ],
    LiabilityCategory.REGULATORY: [
        re.compile(r'SEBI', re.IGNORECASE),
        re.compile(r'RBI', re.IGNORECASE),
        re.compile(r'MCA', re.IGNORECASE),
        re.compile(r'show\s+cause', re.IGNORECASE),
        re.compile(r'regulatory\s+notice', re.IGNORECASE),
    ],
    LiabilityCategory.ENVIRONMENTAL: [
        re.compile(r'environmental', re.IGNORECASE),
        re.compile(r'pollution', re.IGNORECASE),
        re.compile(r'SPCB', re.IGNORECASE),
    ],
}

# CARO clause mapping
CARO_PATTERNS = {
    "Clause (vii)": [re.compile(r'statutory\s+dues', re.IGNORECASE), re.compile(r'tax\s+dues', re.IGNORECASE), re.compile(r'income\s+tax\s+unpaid', re.IGNORECASE)],
    "Clause (ix)": [re.compile(r'loan\s+default', re.IGNORECASE), re.compile(r'default\s+in\s+repayment', re.IGNORECASE), re.compile(r'borrowing\s+default', re.IGNORECASE)],
    "Clause (xvii)": [re.compile(r'fraud', re.IGNORECASE), re.compile(r'fraudulent', re.IGNORECASE)],
}


def extract_amount(text: str) -> Optional[float]:
    """Extract amount in ₹ Crores from text"""
    for pattern in AMOUNT_PATTERNS:
        match = pattern.search(text)
        if match:
            amount_str = match.group(1).replace(',', '')
            try:
                return float(amount_str)
            except ValueError:
                continue
    return None


def extract_year(text: str) -> str:
    """Extract year/AY/FY from text"""
    for pattern in YEAR_PATTERNS:
        match = pattern.search(text)
        if match:
            return match.group(1)
    return ""


def extract_status(text: str) -> LiabilityStatus:
    """Extract status from text"""
    for status, patterns in STATUS_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(text):
                return status
    return LiabilityStatus.PENDING


def extract_authority(text: str) -> str:
    """Extract authority from text"""
    for authority, pattern in AUTHORITY_PATTERNS.items():
        if pattern.search(text):
            return authority
    return ""


def extract_category(text: str) -> LiabilityCategory:
    """Classify liability category from text"""
    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(text):
                return category
    return LiabilityCategory.OTHERS


def extract_caro_clause(text: str) -> str:
    """Map to CARO 2020 clause"""
    for clause, patterns in CARO_PATTERNS.items():
        for pattern in patterns:
            if pattern.search(text):
                return clause
    return ""


def extract_contingent_liabilities(pdf_text: str) -> List[ContingentLiability]:
    """
    Extract contingent liabilities from annual report text.
    
    Args:
        pdf_text: Full text extracted from annual report PDF
        
    Returns:
        List of ContingentLiability objects with category, status, authority, etc.
    """
    liabilities = []
    
    # Split text into lines and look for liability entries
    lines = pdf_text.split('\n')
    
    # First, find the contingent liability section
    in_contingent_section = False
    section_lines = []
    
    for line in lines:
        line_lower = line.lower().strip()
        
        # Check if we're entering a contingent liability section
        for pattern in CONTINGENT_LIABILITY_PATTERNS:
            if pattern.search(line_lower):
                in_contingent_section = True
                break
        
        # Also check for numbered list items that look like liabilities
        if in_contingent_section:
            # End section on next major note or empty section
            if re.match(r'^note\s+\d+', line_lower) and 'contingent' not in line_lower:
                break
            section_lines.append(line)
    
    # If no explicit section found, search entire text for liability patterns
    if not section_lines:
        section_lines = lines
    
    # Process each line for liability entries
    current_entry = ""
    for line in section_lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line starts a new numbered entry
        if re.match(r'^[\d\(\)\.\-\*\+]+\s', line) or re.match(r'^[\(\)]?\d+[\)\.]', line):
            # Process previous entry
            if current_entry:
                liability = _parse_liability_entry(current_entry)
                if liability:
                    liabilities.append(liability)
            current_entry = line
        else:
            current_entry += " " + line
    
    # Process last entry
    if current_entry:
        liability = _parse_liability_entry(current_entry)
        if liability:
            liabilities.append(liability)
    
    # If still no liabilities found, try broader pattern matching
    if not liabilities:
        liabilities = _broad_extraction(pdf_text)
    
    return liabilities


def _parse_liability_entry(text: str) -> Optional[ContingentLiability]:
    """Parse a single liability entry text into ContingentLiability object"""
    # Skip if no amount found
    amount = extract_amount(text)
    if amount is None:
        return None
    
    description = text.strip()
    # Clean up description
    description = re.sub(r'^[\d\(\)\.\-\*\+]+\s*', '', description)
    description = description[:500]  # Limit length
    
    category = extract_category(text)
    status = extract_status(text)
    authority = extract_authority(text)
    year = extract_year(text)
    caro_clause = extract_caro_clause(text)
    
    # Calculate confidence based on how many fields we extracted
    confidence = 0.5  # Base
    if category != LiabilityCategory.OTHERS:
        confidence += 0.15
    if status != LiabilityStatus.PENDING:
        confidence += 0.1
    if authority:
        confidence += 0.1
    if year:
        confidence += 0.1
    if caro_clause:
        confidence += 0.05
    
    return ContingentLiability(
        description=description,
        amount=amount,
        category=category,
        status=status,
        authority=authority,
        year=year,
        caro_clause=caro_clause,
        confidence=min(confidence, 1.0),
    )


def _broad_extraction(pdf_text: str) -> List[ContingentLiability]:
    """Fallback: broad pattern matching across entire text"""
    liabilities = []
    
    # Find all amount mentions with context
    for pattern in AMOUNT_PATTERNS:
        for match in pattern.finditer(pdf_text):
            # Get surrounding context (200 chars before and after)
            start = max(0, match.start() - 200)
            end = min(len(pdf_text), match.end() + 200)
            context = pdf_text[start:end]
            
            # Check if context suggests contingent liability
            is_liability = False
            for kw in ['contingent', 'claim', 'demand', 'dispute', 'litigation', 'arbitration', 'notice', 'penalty', 'guarantee']:
                if kw in context.lower():
                    is_liability = True
                    break
            
            if is_liability:
                liability = _parse_liability_entry(context)
                if liability and not any(l.amount == liability.amount and l.description[:100] == liability.description[:100] for l in liabilities):
                    liabilities.append(liability)
    
    return liabilities


__all__ = [
    "ContingentLiability",
    "LiabilityCategory",
    "LiabilityStatus",
    "extract_contingent_liabilities",
]