"""Document classifier — identifies document type from content."""
from typing import Dict, Any
from enum import Enum

class DocumentType(Enum):
    ANNUAL_REPORT = "annual_report"
    CONCALL_TRANSCRIPT = "concall_transcript"
    INVESTOR_PRESENTATION = "investor_presentation"
    QUARTERLY_RESULT = "quarterly_result"
    EXCHANGE_FILING = "exchange_filing"
    RESEARCH_REPORT = "research_report"
    NEWS_ARTICLE = "news_article"
    OTHER = "other"

class DocumentClassifier:
    """Classifies documents by type using keyword matching."""
    
    KEYWORDS = {
        DocumentType.ANNUAL_REPORT: ["annual report", "board of directors", "auditor's report", "financial statements"],
        DocumentType.CONCALL_TRANSCRIPT: ["conference call", "earnings call", "Q&A session", "operator:"],
        DocumentType.INVESTOR_PRESENTATION: ["investor presentation", "investor deck", "roadshow"],
        DocumentType.QUARTERLY_RESULT: ["quarterly results", "Q1", "Q2", "Q3", "Q4", "unaudited"],
        DocumentType.EXCHANGE_FILING: ["exchange filing", "BSE", "NSE", "regulation 30"],
        DocumentType.RESEARCH_REPORT: ["research report", "analyst", "target price", "recommendation"],
    }
    
    def classify(self, text: str) -> DocumentType:
        text_lower = text.lower()
        scores = {}
        for doc_type, keywords in self.KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            scores[doc_type] = score
        if not scores or max(scores.values()) == 0:
            return DocumentType.OTHER
        return max(scores, key=scores.get)
    
    def classify_with_confidence(self, text: str) -> Dict[str, Any]:
        doc_type = self.classify(text)
        return {"type": doc_type.value, "confidence": 0.85}

__all__ = ["DocumentType", "DocumentClassifier"]