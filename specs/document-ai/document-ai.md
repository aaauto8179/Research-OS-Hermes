# Document AI Tool Specification

**Tool Name:** Document AI  
**Sheet:** document ai  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Document intelligence hub: upload PDFs (annual reports, concalls, presentations, filings), auto-classify, extract structured data, PIT-compliant storage, RAG-based Q&A with citations. Two main tools: Document AI (question + filter) and AI Assistant (auto-insights).

---

## 3. UI/UX Specification

### 3.1 Layout (Document AI)
```
┌─────────────────────────────────────────────────────────────────┐
│ Document AI - [SYMBOL/INDUSTRY]                                 │
├─────────────────────────────────────────────────────────────────┤
│ UPLOAD & MANAGE                                                 │
│ [Upload PDF]  [Drag & Drop]  [Supported: PDF, Max 50MB]        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ File              │ Type           │ Status    │ Pages │ Date │ │
│ ├───────────────────┼────────────────┼───────────┼───────┼──────┤ │
│ │ Annual Report FY24│ annual_report  │ Processed │ 150   │ Today│ │
│ │ Q2 FY25 Concall   │ concall        │ Processing│ 45    │ 1h   │ │
│ │ Investor Pres     │ presentation   │ Queued    │ 25    │ -    │ │
│ └───────────────────┴────────────────┴───────────┴───────┴──────┘ │
├─────────────────────────────────────────────────────────────────┤
│ QUERY INTERFACE                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Question: [What is the revenue guidance for FY25?        ]   │ │
│ │ Filters: [Doc Type ▼] [Date Range ▼] [Section ▼]          │ │
│ │ [Ask]                                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ANSWER WITH CITATIONS                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Based on the retrieved documents, the company guided for    │ │
│ │ FY25 revenue growth of 15-18% YoY [Annual Report FY24, p.12]│ │
│ │ Management expects O2C volume growth of 8-10% [Q2 FY25      │ │
│ │ Concall, p.8]                                               │ │
│ │                                                             │ │
│ │ Citations:                                                  │ │
│ │ 1. [Annual Report FY24, p.12] "Revenue growth 15-18%..."   │ │
│ │ 2. [Q2 FY25 Concall, p.8] "O2C volume growth 8-10%..."     │ │
│ │ Confidence: 92%                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Layout (AI Assistant)
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
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Ingestion Pipeline
```
PDF Upload → Classifier → Extractor (PDF/Table) → PIT Transformer → Chunker → Embedder → Vector Store
                    ↓
            Metadata Extraction (Type, Date, Company, Period)
```

### 3.2 Components
| Component | Technology | Purpose |
|-----------|------------|---------|
| Classifier | Rule-based + ML | 8 doc types |
| PDF Extractor | pdfplumber + Camelot | Text + Tables |
| Concalls Parser | pdfplumber | Guidance, Q&A |
| PIT Transformer | Custom | Point-in-time compliance |
| Chunker | Sliding window (512/50) | RAG chunks |
| Embedder | BGE-M3 (1024-dim) | Vector embeddings |
| Vector Store | pgvector / Qdrant | Semantic search |
| RAG Engine | Retrieval + LLM | Cited answers |

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (all tabs):** Auto-feeds extracted data
- **Industry Page:** Industry reports, regulations
- **Concall Tracker:** Guidance extraction
- **Financial Statements:** P&L/BS/CF line items
- **Risk/Red Flags:** Forensic flags from documents

---

## 4. API Contract

```typescript
interface DocumentAIUploadResponse {
  documentId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: number;
}

interface DocumentAIQueryResponse {
  answer: string;
  citations: Citation[];
  confidence: number;
  queryId: string;
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

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Upload UI, document table, status polling | Week 1 |
| 2 | Query interface with filters, RAG answer display | Week 1-2 |
| 2 | Ingestion pipeline (Classifier → Extractor → Chunker → Embed) | Week 2-3 |
| 3 | AI Assistant auto-insights, citation UI | Week 3 |
| 3 | PIT compliance, vector store, RAG evaluation | Week 3-4 |

---

## 6. Testing
- PDF extraction accuracy (text + tables)
- Classification accuracy (8 types)
- RAG answer quality (citation accuracy, hallucination rate)
- PIT compliance (no future data leakage)
- Query latency (<3s)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*