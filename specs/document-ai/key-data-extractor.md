# Key Data Extractor Tool Specification

**Tool Name:** Key Data Extractor  
**Category:** Document Intelligence  
**Sheet:** document ai  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured extraction of financial data from documents: P&L line items, Balance Sheet, Cash Flow, Ratios, Segment data, Capex, Debt schedule, Shareholding. Outputs normalized JSON with PIT timestamps for time-series construction. Handles tables, unstructured text, and footnotes.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Key Data Extractor - [DOCUMENT TITLE]                           │
├─────────────────────────────────────────────────────────────────┤
│ EXTRACTED DATA (Structured JSON)                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ INCOME STATEMENT                                            │ │
│ │ ┌────────────┬────────┬────────┬────────┬────────┐         │ │
│ │ │ Line Item  │ Q2 FY25 │ Q1 FY25 │ Q2 FY24 │ YoY%   │         │ │
│ │ ├────────────┼────────┼────────┼────────┼────────┤         │ │
│ │ │ Revenue    │ 2,34,000│ 2,25,000│ 2,03,000│ +15.3% │         │ │
│ │ │ EBITDA     │  48,000 │  45,000 │  40,500 │ +18.5% │         │ │
│ │ │ PAT        │  32,000 │  30,000 │  26,000 │ +23.1% │         │ │
│ │ └────────────┴────────┴────────┴────────┴────────┘         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ BALANCE SHEET                                               │ │
│ │ ┌────────────┬────────┬────────┐                           │ │
│ │ │ Line Item  │ Sep-24  │ Mar-24 │                           │ │
│ │ ├────────────┼────────┼────────┤                           │ │
│ │ │ Equity     │ 5,20,000│ 4,95,000│                          │ │
│ │ │ Debt       │ 2,10,000│ 2,20,000│                          │ │
│ │ │ Cash       │  85,000 │  92,000 │                          │ │
│ │ └────────────┴────────┴────────┘                           │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SEGMENT DATA                                                │ │
│ │ ┌────────────┬────────┬────────┬────────┐                  │ │
│ │ │ Segment    │ Revenue │ EBITDA │ Margin │                  │ │
│ │ ├────────────┼────────┼────────┼────────┤                  │ │
│ │ │ Retail     │ 1,20,000│ 28,000 │ 23.3%  │                  │ │
│ │ │ O2C        │  85,000 │ 15,000 │ 17.6%  │                  │ │
│ │ │ Digital    │  29,000 │  5,000 │ 17.2%  │                  │ │
│ │ └────────────┴────────┴────────┴────────┘                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ VALIDATION: [✅ All cross-checks pass] [⚠️ 2 warnings]         │
│ [Export JSON] [Push to Company Financials] [Download CSV]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Extraction Pipeline
```
Document → PDF Parser (pdfplumber) → Table Detector → Table Extractor
         → Text Chunker → Section Classifier → LLM Extractor
         → Validator (Cross-checks: BS balances, CF = ΔBS, Segment sum = Total)
         → Normalizer (Units, Dates, Signs) → PIT Tagger → JSON Output
```

### 3.2 Extraction Schema
```typescript
interface ExtractedFinancials {
  incomeStatement: PeriodData[];
  balanceSheet: PeriodData[];
  cashFlow: PeriodData[];
  segments: SegmentData[];
  ratios: RatioData[];
  capex: CapexData[];
  debtSchedule: DebtData[];
  shareholding: ShareholdingData[];
  metadata: {
    documentId: string;
    documentType: string;
    periodEnd: string;
    currency: string;
    unit: 'lakhs' | 'crores' | 'millions';
    pitTimestamp: string;  // When this data became public
    confidence: number;    // Overall extraction confidence
  };
}

interface PeriodData {
  period: string;
  lineItems: { name: string; value: number; confidence: number }[];
}

interface ValidationResult {
  passed: boolean;
  checks: {
    name: string;
    expected: number;
    actual: number;
    tolerance: number;
    status: 'pass' | 'warn' | 'fail';
  }[];
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page Financials Tab:** Auto-populates financial statements
- **Valuation Suite:** Feeds DCF/Relative inputs
- **Ratio Analysis Engine:** Computes ratios from extracted data
- **Screening Engine:** Updates fundamental database
- **Document AI (Query):** Extracted data searchable

---

## 4. API Contract

```typescript
interface KeyDataExtractorData {
  documentId: string;
  extracted: ExtractedFinancials;
  validation: ValidationResult;
  extractionLog: {
    tablesFound: number;
    tablesExtracted: number;
    textSections: number;
    llmCalls: number;
    durationMs: number;
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | PDF table extraction (pdfplumber), table detection | Week 1 |
| 2 | LLM-based text extraction for non-table data | Week 1 |
| 2 | Validation engine (cross-checks), normalization | Week 2 |
| 3 | PIT tagging, Company Financials integration | Week 2 |
| 3 | Export JSON/CSV, confidence scoring | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Table extraction | >95% table detection rate |
| Value accuracy | >98% vs manual extraction |
| Cross-check pass rate | >95% for clean PDFs |
| Unit normalization | Correct for lakhs/crores/millions |
| PIT timestamp | Accurate to filing date |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*