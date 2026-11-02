# AI Assistant Tool Specification

**Tool Name:** AI Assistant  
**Category:** Document Intelligence  
**Sheet:** document ai  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
AI-powered assistant that automatically generates key insights from uploaded documents. Analyzes financial statements, concall transcripts, annual reports, and presentations to surface: revenue growth drivers, margin trends, management guidance changes, risk factors, and competitive positioning. Zero-configuration, runs automatically on document upload.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ AI Assistant - [SYMBOL]                                         │
├─────────────────────────────────────────────────────────────────┤
│ AUTO-GENERATED INSIGHTS                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 Revenue Growth Accelerating                               │ │
│ │ Q2 FY25 revenue +15% YoY vs +12% Q1. Margin expansion from │ │
│ │ pricing power in Retail segment. [Annual Report, Q2 Concall]│ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Rising Input Costs                                        │ │
│ │ Raw material costs +12% QoQ. Steel +15%, Aluminum +8%.     │ │
│ │ Pass-through at 85% for Steel, 70% for Aluminum. [Cost Break]│ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 📈 Capacity Expansion On Track                               │ │
│ │ Green hydrogen plant (2MT) on track for FY27. Capex ₹2,000Cr│ │
│ │ [CapEx Announcement, Sep 2024]                              │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Regulatory Risk                                          │ │
│ │ New emission norms (BS7) effective Apr 2025. Capex impact:  │ │
│ │ ₹500Cr over 3 years. [SEBI Filing, Oct 2024]                │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 📊 Peer Comparison                                          │ │
│ │ ROE: 22.5% vs Industry 15.2%. Margin: 22% vs 18%.          │ │
│ │ [Industry Page, Peer Comparison]                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ INSIGHT CATEGORIES                                              │
│ [📊 Financial] [⚠️ Risk] [📈 Growth] [⚖️ Valuation] [📋 Governance] │
├─────────────────────────────────────────────────────────────────┤
│ [Regenerate Insights] [Export Report] [Feedback 👍/👎]         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Insight Types
| Category | Examples | Source Documents |
|----------|----------|------------------|
| Financial | Revenue growth, margin trends, FCF, debt levels | Annual reports, Quarterly results |
| Growth | Capacity additions, new products, market expansion | Investor presentations, Concall |
| Risk | Regulatory, commodity, FX, concentration | Filings, News, Concall |
| Valuation | P/E vs history, peer premium/discount | Valuation models, Peer data |
| Governance | Board changes, auditor, RPT, compensation | CG reports, Annual reports |

---

## 4. Data Pipeline

### 3.1 Insight Generation Pipeline
```
Document Upload → Classifier → Extractor → PIT Transformer → Chunker → Embedder → Vector Store
                                              ↓
                                    RAG Engine → LLM (GPT-4/Claude) → Insight Generator
                                              ↓
                                    Insight Classifier → Categorizer → Deduplicator → Ranker
                                              ↓
                                    UI: Insight Cards with Citations
```

### 3.2 Insight Schema
```typescript
interface Insight {
  id: string;
  category: 'financial' | 'growth' | 'risk' | 'valuation' | 'governance';
  title: string;
  summary: string;  // 1-2 sentences
  evidence: Citation[];
  confidence: number;  // 0-1
  severity: 'info' | 'warning' | 'critical';
  tags: string[];
  generatedAt: string;
  sourceDocuments: string[];
}

interface Citation {
  documentId: string;
  documentTitle: string;
  page: number;
  excerpt: string;
  relevanceScore: number;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Document AI (Query):** Uses same RAG pipeline
- **Company Page Tabs:** Insights displayed in relevant tabs
- **Alerts:** Critical insights trigger alerts
- **Reports:** Insights included in PDF reports

---

## 4. API Contract

```typescript
interface AIAssistantData {
  symbol: string;
  insights: Insight[];
  categories: InsightCategory[];
  lastGenerated: string;
  documentCount: number;
}

interface InsightCategory {
  name: string;
  count: number;
  insights: Insight[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Insight card component, category filter | Week 1 |
| 2 | LLM integration (GPT-4/Claude), prompt engineering | Week 1-2 |
| 2 | Citation UI, confidence scoring | Week 2 |
| 3 | Feedback loop (👍/👎), insight regeneration | Week 2 |
| 3 | Scheduled re-generation (daily/weekly) | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Insight relevance | >80% relevant per user feedback |
| Citation accuracy | >90% citations traceable |
| Hallucination rate | <5% |
| Latency | <5s per insight batch |
| Categorization | >90% correct category |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*