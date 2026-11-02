# Smart Summarizer Tool Specification

**Tool Name:** Smart Summarizer  
**Category:** Document Intelligence  
**Sheet:** document ai  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
LLM-powered document summarizer with financial domain expertise. Generates structured summaries for: Concall transcripts (Q&A, guidance, tone), Annual reports (MD&A, financial highlights, risk factors), Investor presentations (strategy, capex, growth), Research reports (thesis, valuation, risks). Outputs structured JSON for downstream consumption.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Smart Summarizer - [DOCUMENT TITLE]                             │
├─────────────────────────────────────────────────────────────────┤
│ DOCUMENT: RELIANCE Q2 FY25 Concall  │ TYPE: Concall Transcript │
│ UPLOADED: 2024-10-15                │ PAGES: 24                │
├─────────────────────────────────────────────────────────────────┤
│ SUMMARY SECTIONS                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ KEY HIGHLIGHTS                                              │ │
│ │ • Revenue: ₹2.34L Cr (+15% YoY) | EBITDA: ₹48K Cr (+18%)   │ │
│ │ • Retail growth: 22% | O2C: 8% | Digital: 15%              │ │
│ │ • Net Debt: ₹2.1L Cr (Net Debt/EBITDA: 1.1x)               │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ MANAGEMENT GUIDANCE                                         │ │
│ │ • FY25 Revenue growth: 12-15% (prev: 10-12%)               │ │
│ │ • Capex: ₹1.5L Cr (Green energy: ₹50K Cr)                  │ │
│ │ • Retail store additions: 1,000+ in FY25                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Q&A THEMES                                                  │ │
│ │ 1. Green Energy: Timeline for hydrogen, solar module plant │ │
│ │ 2. Retail: Same-store growth, new format economics         │ │
│ │ 3. O2C: Cracker margin outlook, petchem cycle              │ │
│ │ 4. Debt: Net debt target, deleveraging timeline            │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ TONE ANALYSIS                                               │ │
│ │ Overall: Confident (0.82/1.0)                              │ │
│ │ Positive keywords: "Strong", "On track", "Accelerating"    │ │
│ │ Cautious areas: "Monitoring", "Watchful", "Headwinds"      │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ RISK FACTORS MENTIONED                                      │ │
│ │ 1. Global recession risk → demand impact                   │ │
│ │ 2. Crude oil volatility → O2C margins                      │ │
│ │ 3. Regulatory: Carbon tax, emission norms                  │ │
│ │ 4. Execution risk: Green energy scale-up                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ EXPORT: [JSON] [PDF] [Copy to Clipboard] [Add to Company Notes]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Summary Templates by Document Type
```python
SUMMARY_TEMPLATES = {
    'concall': [
        'key_highlights', 'management_guidance', 'qa_themes',
        'tone_analysis', 'risk_factors', 'forward_looking'
    ],
    'annual_report': [
        'financial_highlights', 'mda_summary', 'business_overview',
        'risk_factors', 'governance', 'sustainability', 'outlook'
    ],
    'investor_presentation': [
        'strategy', 'capex_plan', 'growth_drivers', 'financial_targets',
        'competitive_position', 'key_metrics'
    ],
    'research_report': [
        'investment_thesis', 'valuation', 'key_risks', 'catalysts',
        'peer_comparison', 'price_target'
    ],
}
```

### 3.2 Prompt Engineering
```python
CONCALL_PROMPT = """
You are a financial analyst. Summarize this concall transcript for {symbol}.
Focus on: 1) Financial results vs expectations 2) Management guidance changes
3) Q&A themes 4) Tone (confident/cautious) 5) Risk factors 6) Forward-looking statements
Output structured JSON matching the template. Cite page/paragraph numbers.
"""
```

---

## 4. Engine Integration

### 4.1 Links
- **Document AI (Query):** Uses same RAG pipeline
- **Company Page Tabs:** Summaries auto-linked to Concall Tracker
- **Alerts:** Guidance changes trigger alerts
- **AI Assistant:** Summaries feed insight generation

---

## 4. API Contract

```typescript
interface SmartSummarizerData {
  documentId: string;
  documentType: 'concall' | 'annual_report' | 'investor_presentation' | 'research_report';
  summary: Record<string, any>;  // Template-based
  rawText: string;
  metadata: DocumentMetadata;
  generatedAt: string;
  model: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Document type detection, template selection | Week 1 |
| 2 | LLM integration, structured JSON output | Week 1 |
| 2 | Citation linking, tone analysis | Week 2 |
| 3 | Export formats (JSON/PDF), Company Notes integration | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Template selection | Correct for 100% of test docs |
| JSON validity | 100% valid JSON |
| Citation accuracy | >90% traceable |
| Guidance detection | >95% recall |
| Tone accuracy | >85% human agreement |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*