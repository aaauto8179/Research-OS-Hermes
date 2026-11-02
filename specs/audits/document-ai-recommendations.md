# Document AI & Ingestion Pipeline Specification Audit & Recommendations

**Author:** Document AI & Decision Systems Specialist (`teamwork_worker`)  
**Scope:** `specs/document-ai/` (4 specs) and `research-os-frontend/SPEC_INGESTION_PIPELINE.md` (1 core architectural spec)  
**Date:** 2026-11-02  
**Status:** Complete Audit & Actionable Blueprint  

---

## 1. Executive Summary & Inventory Synthesis

The Document Intelligence subsystem serves as the foundational data gateway for Research OS. Institutional fundamental analysis in the Indian equity market depends entirely on the veracity, provenance, and timeliness of unstructured corporate filings: Annual Reports (often 400+ pages), quarterly Concall Transcripts, Investor Presentations, and SEBI/Exchange corporate announcements. 

While the baseline specifications establish a modern stack (combining `pdfplumber`, `BGE-M3` embeddings, PostgreSQL `pgvector`, and LLMs), they suffer from critical operational, accounting, and user-experience gaps that would lead to failure in an institutional production environment:
1. **Indian Filing Nuances Overlooked:** Scanned non-OCR PDFs on BSE/NSE, multi-column reading order corruption, Ind AS Schedule III format variations, and bilingual (Hindi/English) disclosures.
2. **Concall Analysis Deficits:** Lack of formal speaker diarization (separating Executive remarks from Analyst Q&A), missing management evasion detection, and absent guidance delivery scorecards.
3. **RAG & Hallucination Vulnerabilities:** Inadequate citation grounding (lacking PDF canvas bounding box coordinates `[x1, y1, x2, y2]`), no Natural Language Inference (NLI) premise verification, and absence of XBRL automated cross-reconciliation.
4. **UI/UX Friction:** Missing split-screen side-by-side document verification with live snippet jumping, and absent audit trail controls.

This document delivers actionable, ready-to-implement replacements for all 5 specification files.

---

## 2. Audit & Recommendations: `specs/document-ai/document-ai.md`

### 2.1 Target Spec File Path & Title
- **File:** `specs/document-ai/document-ai.md`
- **Title:** Document AI Tool Specification (Spec Version: 1.0.0)

### 2.2 Lenses Evaluated & Core Critique

#### 1. Financial Knowledge & Indian Regulatory Filings
- **SEBI LODR Regulation 30/33 Realities:** The current spec handles basic Annual Reports and Presentations, but misses the deluge of daily regulatory disclosures filed under Regulation 30 (material events, litigation updates, tax demands under GST/Income Tax, capacity commissioning) and Regulation 33 (unaudited/audited financial results with limited review reports).
- **Multi-Class Taxonomy Deficit:** The 8 document types in the spec are insufficient. Indian filings require distinct handling for: `ANNUAL_REPORT`, `CONCALL_TRANSCRIPT`, `INVESTOR_PRESENTATION`, `LIMITED_REVIEW_FINANCIALS`, `SEBI_REG_30_DISCLOSURE`, `CREDIT_RATING_REPORT`, `SCHEME_OF_ARRANGEMENT`, and `SECRETARIAL_AUDIT_REPORT`.

#### 2. Fundamental Investor Logic & Workflow
- **Analyst Provenance Mandate:** An institutional equity analyst or fund manager cannot cite an AI answer in an Investment Committee (IC) memo without verifying the primary source. The current citation model returns only a page number and text string. If the user cannot view the PDF page with the highlighted bounding box alongside the answer, workflow trust collapses.

#### 3. UI/UX & Interactive Design Systems
- **Missing Split-Screen Canvas:** The current wireframe is a single-column stacked view where the query interface sits below the document table. Analysts need a responsive split-screen layout: the left pane holds the conversational RAG query interface with collapsible citations, while the right pane renders the interactive PDF page via `react-pdf`, auto-scrolling to and highlighting the exact source sentence.

#### 4. Mathematical Rigor & Forensic Formulas
- **Cosine Similarity vs. Hybrid Retrieval:** Naive cosine distance search on vector embeddings fails for financial queries involving specific numerical lookups (e.g., "What was the capital work-in-progress for Jamnagar in FY24?"). Vector embeddings blur numerical precision. Hybrid search combining BM25 keyword matching with Reciprocal Rank Fusion (RRF) and dense vector embeddings is mandatory.

#### 5. Data Plumbing & System Architecture
- **Large PDF Ingestion Failure:** Indian annual reports (e.g., Reliance, Tata Steel, L&T) average 350–500 pages and 40–80 MB. Attempting to extract, chunk, and embed such documents in a single synchronous or uncheckpointed background worker leads to out-of-memory (OOM) crashes, worker timeouts, and database lock contention. Progressive chunked ingestion with resume tokens is required.

---

### 2.3 Actionable Replacements

#### UI/UX Split-Screen Layout Specification
Replace Section 3.1 with the following split-screen layout:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Document AI Hub - RELIANCE INDUSTRIES LIMITED [BSE: 500325 | NSE: RELIANCE]                     │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ LEFT PANE: RESEARCH ASSISTANT & QUERY CHAT (45%)│ RIGHT PANE: SYNCHRONIZED PDF VIEWER (55%)      │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │ ┌────────────────────────────────────────────┐ │
│ │ Filters: [Doc Type: All ▼] [FY23-FY25 ▼]    │ │ │ Document: Annual_Report_FY24.pdf           │ │
│ ├─────────────────────────────────────────────┤ │ │ Page: [ 142 ] / 486  [Zoom: 100% ▼] [Find] │ │
│ │ Q: What is the capex guidance for New Energy│ │ ├────────────────────────────────────────────┤ │
│ │    and what amount was spent in FY24?       │ │ │ ...                                        │ │
│ └─────────────────────────────────────────────┘ │ │ │ Note 34: Capital Expenditure Commitments │ │
│                                                 │ │ │                                          │ │
│ ┌─────────────────────────────────────────────┐ │ │ │ ┌──────────────────────────────────────┐ │ │
│ │ 🤖 Synthesized Answer (Confidence: 96%)     │ │ │ │ │ [HIGHLIGHTED BOUNDING BOX]           │ │ │
│ │ Management committed ₹75,000 Crore over     │ │ │ │ │ "Capital expenditure incurred on the  │ │ │
│ │ 3 years for the New Energy business [1].   │ │ │ │ │ New Energy Gigafactory complex at     │ │ │
│ │ In FY24, actual capital expenditure incurred│ │ │ │ │ Jamnagar stood at ₹12,450 Crore in    │ │ │
│ │ stood at ₹12,450 Crore [2], primarily for  │ │ │ │ │ FY 2023-24 (Previous Year: ₹5,800 Cr)"│ │ │
│ │ the solar giga-factory at Jamnagar.         │ │ │ │ └──────────────────────────────────────┘ │ │
│ │                                             │ │ │                                          │ │
│ │ Citations & Grounding:                      │ │ │ Balance Sheet Capital WIP Schedule ...     │ │
│ │ • [1] Investor Presentation Q4FY24, p.18    │ │ │                                            │ │
│ │   [Jump to Coordinate] (Entailment: 0.98)   │ │ │                                            │ │
│ │ • [2] Annual Report FY24, Note 34, p.142    │ │ │                                            │ │
│ │   [Jump to Coordinate] (Entailment: 0.99)   │ │ │                                            │ │
│ │                                             │ │ │                                            │ │
│ │ ⚖️ Financial Grounding Verification:        │ │ │                                            │ │
│ │ Verified against BSE XBRL Segment Note 34.  │ │ │                                            │ │
│ │ [Download Verifiable IC Snippet .PDF]       │ │ │                                            │ │
│ └─────────────────────────────────────────────┘ │ └────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┴────────────────────────────────────────────────┤
│ BOTTOM DRAWER: INGESTED CORPORATE FILINGS REPOSITORY                                             │
│ [Upload New] [Sync Exchange Feeds] Filter: [Annual Reports] [Concalls] [Presentations] [Reg 30] │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Enhanced API Contract & Citation Schema
Replace the API contracts in Section 4 with coordinate-grounded schemas:

```typescript
export interface BoundingBox {
  pageNumber: number;
  x1: number; // Normalized coordinate [0.0 - 1.0] relative to page width
  y1: number; // Normalized coordinate [0.0 - 1.0] relative to page height
  x2: number;
  y2: number;
}

export interface Citation {
  citationId: string;
  documentId: string;
  documentTitle: string;
  documentType: DocumentType;
  filingDate: string; // ISO 8601
  pageNumber: number;
  boundingBox: BoundingBox;
  verbatimExcerpt: string;
  relevanceScore: number;       // Hybrid BM25 + Vector score [0.0 - 1.0]
  entailmentScore: number;      // NLI confidence [0.0 - 1.0]
  xbrlReconciled?: boolean;     // Cross-checked against XBRL filing
  xbrlFactReference?: string;   // e.g., "in-gaap:CapitalWorkInProgress"
}

export interface DocumentAIQueryResponse {
  queryId: string;
  query: string;
  symbol: string;
  answer: string;
  citations: Citation[];
  overallConfidence: number;
  hallucinationCheck: {
    passed: boolean;
    nliEntailmentAvg: number;
    unsupportedClaimsCount: number;
  };
  latencyMs: number;
  generatedAt: string;
}
```

#### Hybrid Retrieval & Reciprocal Rank Fusion (RRF) Algorithm
Add the mathematical formulation for hybrid search to replace naive vector similarity:

```python
def reciprocal_rank_fusion(dense_rankings: list[str], sparse_rankings: list[str], k: int = 60) -> dict[str, float]:
    """
    RRF computes robust document scores combining dense vector cosine similarity
    and sparse lexical BM25 matching, preventing numerical entity loss.
    RRF_Score(d) = sum_{m in models} 1 / (k + rank_m(d))
    """
    scores = {}
    for rank, doc_id in enumerate(dense_rankings, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))
    for rank, doc_id in enumerate(sparse_rankings, start=1):
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank))
    return dict(sorted(scores.items(), key=lambda item: item[1], reverse=True))
```

---

## 3. Audit & Recommendations: `specs/document-ai/ai-assistant.md`

### 3.1 Target Spec File Path & Title
- **File:** `specs/document-ai/ai-assistant.md`
- **Title:** AI Assistant Tool Specification (Spec Version: 1.0.0)

### 3.2 Lenses Evaluated & Core Critique

#### 1. Fundamental Investor Logic & Guidance Tracking
- **Static Insights vs. Quarter-over-Quarter Diffing:** The current spec generates static insight cards (e.g. "Revenue Growth Accelerating"). In reality, an analyst already knows the revenue growth from headlines. The true institutional value of an AI assistant is **Delta Analysis**: What changed between Q1 and Q2? Did management quietly lower their capex target? Did working capital days stretch by 18 days? Did guidance shift from "20% growth" to "high-teens"?
- **Audit Deficit on Guidance Delivery:** The AI assistant must maintain a living tracker of management commitments made in prior periods and compare them to actual disclosures in the newly uploaded document.

#### 2. Financial Knowledge & Ind AS Footnote Forensics
- **Overlooking Off-Balance Sheet & Footnote Risks:** The 5 insight categories (`financial`, `growth`, `risk`, `valuation`, `governance`) ignore critical forensic accounting line items:
  1. Contingent Liabilities vs. Net Worth (Ind AS 37)
  2. Related Party Transactions (RPT) volume vs. historical norms (Ind AS 24)
  3. Capitalization of R&D / Operating expenses into Intangibles (Ind AS 38)
  4. Auditor Emphasis of Matter / Qualifications

#### 3. Mathematical Rigor & Hallucination Guardrails
- **Unverified Generative Output:** The spec specifies a target hallucination rate of `<5%` but defines no automated verification mechanism. In institutional asset management, a 5% hallucination rate means 1 out of 20 investment committee facts is false. The system must implement Natural Language Inference (NLI) premise checking where each generated insight sentence is formally verified as an entailment of the source chunk.

---

### 3.3 Actionable Replacements

#### Delta-First Insight Schema
Replace Section 3.2 and 4.2 with an expanded schema that incorporates delta tracking, accounting checks, and NLI verification:

```typescript
export type InsightSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InsightCategory = 
  | 'CAPITAL_ALLOCATION' 
  | 'EARNINGS_QUALITY_FORENSICS' 
  | 'GUIDANCE_DELTA' 
  | 'MARGIN_DYNAMICS' 
  | 'OPERATIONAL_RISK' 
  | 'GOVERNANCE_RPT';

export interface AutomatedInsight {
  id: string;
  symbol: string;
  category: InsightCategory;
  severity: InsightSeverity;
  headline: string;
  currentFinding: string;
  historicalDelta?: {
    priorPeriod: string;
    priorStatedMetric: string;
    changeDescription: string;
    direction: 'IMPROVING' | 'DETERIORATING' | 'NEUTRAL';
  };
  evidenceCitations: Citation[];
  forensicFlag: boolean;
  nliVerification: {
    premiseChunks: string[];
    entailmentScore: number; // Min 0.90 required to publish without human review
    verified: boolean;
  };
  createdAt: string;
}
```

#### Natural Language Inference (NLI) Premise Guardrail Pipeline
Add an automated verification stage to the insight pipeline before publishing cards:

```python
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

class InsightFactVerifier:
    """
    DeBERTa-v3-large fine-tuned on MNLI to perform hard factual verification.
    Every generated insight claim MUST be an entailment of the cited evidence chunks.
    """
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained("cross-encoder/nli-deberta-v3-large")
        self.model = AutoModelForSequenceClassification.from_pretrained("cross-encoder/nli-deberta-v3-large")
        self.model.eval()

    def verify_claim(self, evidence_chunk: str, claim: str) -> tuple[bool, float]:
        inputs = self.tokenizer(evidence_chunk, claim, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            logits = self.model(**inputs).logits
            probs = torch.softmax(logits, dim=-1).squeeze()
            # DeBERTa NLI classes: 0: Contradiction, 1: Neutral, 2: Entailment
            entailment_prob = probs[2].item()
            contradiction_prob = probs[0].item()
            
        is_valid = entailment_prob >= 0.88 and contradiction_prob < 0.05
        return is_valid, entailment_prob
```

#### UI Insight Card with Delta Pill & Verification Badge
Replace the insight card design in Section 3.1:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔴 CRITICAL FORENSIC DELTA: Contingent Liabilities Spike                    │
│ Category: [EARNINGS_QUALITY_FORENSICS]  │  Severity: HIGH                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Disputed tax demands under GST & Customs surged 64% YoY from ₹1,240 Cr to  │
│ ₹2,034 Cr, now representing 18.2% of Tangible Net Worth (prev. 11.5%).     │
│                                                                             │
│ 📉 Historical Delta:                                                        │
│ • FY23: ₹1,240 Cr (11.5% Net Worth) → FY24: ₹2,034 Cr (18.2% Net Worth)     │
│                                                                             │
│ 📎 Evidence Grounding (NLI Entailment: 0.96 [Verified]):                   │
│ • Annual Report FY24, Note 38 "Contingent Liabilities", p. 198 [View PDF]   │
│ • Limited Review Note 6, Q2FY25 Filing, p. 14 [View PDF]                    │
│                                                                             │
│ [Flag for Valuation Engine (Discount Rate +25 bps)]  [Dismiss]  [Add to IC] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Audit & Recommendations: `specs/document-ai/smart-summarizer.md`

### 4.1 Target Spec File Path & Title
- **File:** `specs/document-ai/smart-summarizer.md`
- **Title:** Smart Summarizer Tool Specification (Spec Version: 1.0.0)

### 4.2 Lenses Evaluated & Core Critique

#### 1. Fundamental Investor Logic: Concall Realities
- **Management Evasion & Question Dodging:** Indian corporate managements frequently sidestep difficult analyst queries (e.g. regarding inventory write-downs, related party loans, or loss of market share) with platitudes ("we are cautiously optimistic", "industry-wide phenomenon", "too early to comment"). The current spec only performs generic tone scoring. It fails to identify **Evasive Answers** where an analyst asked a quantitative question and management gave a non-responsive qualitative reply.
- **Guidance vs. Actual Execution Tracking:** A standalone summary is insufficient. When an analyst reads a Q2 concall summary, they need immediate contextual contrast with the guidance provided in Q1.

#### 2. Financial Knowledge: Speaker Diarization
- **Speaker Role Inconsistency:** Third-party Indian transcript providers (Chorus Call, ResearchBytes, Trendlyne) feature inconsistent transcript headers. Management speakers (CMD, CFO, Business Heads) must be rigorously separated from Sell-Side / Institutional Analysts. Mixing executive remarks with analyst questions invalidates sentiment analysis and guidance extraction.

#### 3. Mathematical Rigor: Sentiment vs. Financial Reality Divergence
- **Tone-Guidance Divergence Metric:** Management teams almost invariably sound "positive" and "confident" in prepared remarks. Relying purely on NLP tone analysis creates severe bullish bias. The system must formulate a **Divergence Metric** between Management Verbal Sentiment and Realized Fundamental Metrics (revenue trajectory, cash flow, receivables days).

---

### 3.3 Actionable Replacements

#### Concall Diarization & Evasion Detection Schema
Replace Section 3.1 and 4.1 with a dedicated transcript parser schema:

```typescript
export interface ConcallParticipant {
  name: string;
  designation?: string;
  organization?: string;
  role: 'MANAGEMENT' | 'ANALYST' | 'MODERATOR';
}

export interface ConcallQAExchange {
  exchangeId: string;
  analyst: ConcallParticipant;
  questionTopic: string;
  questionSummary: string;
  isQuantitativeQuestion: boolean;
  managementResponders: ConcallParticipant[];
  answerSummary: string;
  evasionAnalysis: {
    evasionScore: number; // [0.0 - 1.0] where 1.0 is total non-answer
    evasionIndicators: string[]; // e.g., "Non-committal timeline", "Deflection to macro"
    quantitativeAnswerProvided: boolean;
  };
  guidanceExtracted?: {
    metric: string;
    guidanceValue: string;
    timeframe: string;
  };
}

export interface ConcallSummaryData {
  documentId: string;
  symbol: string;
  quarter: string; // e.g., "Q2FY25"
  callDate: string;
  executiveSummary: string;
  guidanceScorecard: {
    metric: string;
    priorGuidance: string;
    revisedGuidance: string;
    actualReported: string;
    variancePct: number;
    managementJustification: string;
  }[];
  qaExchanges: ConcallQAExchange[];
  sentimentDivergence: {
    verbalSentimentScore: number;    // +1.0 (Bullish) to -1.0 (Bearish)
    financialExecutionScore: number; // Based on actual quarterly deltas
    divergenceGap: number;           // verbalScore - executionScore
    divergenceClassification: 'ALIGNED' | 'UNWARRANTED_EUPHORIA' | 'EXCESSIVE_PESSIMISM';
  };
}
```

#### Evasion Detection Algorithm & Tone-Guidance Divergence Formulation
Add the mathematical and heuristic engine for concall analysis:

```python
import re

def compute_tone_guidance_divergence(verbal_tone: float, revenue_growth_yoy: float, ebitda_margin_delta_bps: float) -> dict:
    """
    Computes whether management's bullish rhetoric diverges from empirical operational metrics.
    verbal_tone: Loughran-McDonald tone in [-1.0, 1.0]
    revenue_growth_yoy: e.g. 0.05 (5%)
    ebitda_margin_delta_bps: e.g. -150 (-1.5% margin compression)
    """
    # Normalize quarterly fundamental performance to [-1.0, 1.0] scale
    perf_growth = min(max(revenue_growth_yoy / 0.25, -1.0), 1.0)
    perf_margin = min(max(ebitda_margin_delta_bps / 300.0, -1.0), 1.0)
    financial_execution_score = (0.5 * perf_growth) + (0.5 * perf_margin)
    
    divergence_gap = verbal_tone - financial_execution_score
    
    if divergence_gap > 0.6:
        classification = "UNWARRANTED_EUPHORIA"
    elif divergence_gap < -0.6:
        classification = "EXCESSIVE_PESSIMISM"
    else:
        classification = "ALIGNED"
        
    return {
        "verbal_tone": round(verbal_tone, 3),
        "execution_score": round(financial_execution_score, 3),
        "divergence_gap": round(divergence_gap, 3),
        "classification": classification
    }

EVASION_PATTERNS = [
    r"too early to (predict|say|comment|quantify)",
    r"we (will|shall) see as we go along",
    r"industry-wide phenomenon",
    r"lumpy business",
    r"we don't give guidance on",
    r"matter is sub-judice",
    r"dynamic market situation",
]

def detect_management_evasion(analyst_question: str, management_answer: str) -> float:
    """Calculates evasion score [0.0 - 1.0] based on evasion regex and brevity penalty."""
    score = 0.0
    matches = sum(1 for pat in EVASION_PATTERNS if re.search(pat, management_answer, re.IGNORECASE))
    score += min(matches * 0.35, 0.70)
    
    # If analyst asked a number-based question and answer lacks any numerical digit
    has_question_numbers = bool(re.search(r"\d+|percent|margin|capex|guidance|crore", analyst_question, re.IGNORECASE))
    has_answer_numbers = bool(re.search(r"\d+", management_answer))
    if has_question_numbers and not has_answer_numbers:
        score += 0.30
        
    return min(score, 1.0)
```

---

## 5. Audit & Recommendations: `specs/document-ai/key-data-extractor.md`

### 5.1 Target Spec File Path & Title
- **File:** `specs/document-ai/key-data-extractor.md`
- **Title:** Key Data Extractor Tool Specification (Spec Version: 1.0.0)

### 5.2 Lenses Evaluated & Core Critique

#### 1. Financial Knowledge: Ind AS Presentation Realities
- **Absence of Standard EBITDA in Schedule III:** The spec assumes that "EBITDA" is a row item extracted directly from financial statements. Under the Companies Act 2013 and Ind AS Schedule III Division II, **EBITDA does not exist as a statutory line item**. Official P&L statements disclose:
  - Revenue from Operations
  - Other Income
  - Cost of Materials Consumed
  - Purchase of Stock-in-Trade
  - Changes in Inventories of Finished Goods, WIP and Stock-in-Trade
  - Employee Benefits Expense
  - Finance Costs
  - Depreciation and Amortization Expense
  - Other Expenses
  EBITDA must be programmatically derived with accounting consistency rules.
- **Unit Scaling Ambiguity:** Indian financial reports oscillate unpredictably between ₹ Crores (large caps), ₹ Lakhs (mid/small caps), ₹ Thousands (subsidiaries), and ₹ Millions (MNCs / IT services). Extracting numbers without rigorous statement-level unit detection causes catastrophic 100x scale errors.

#### 2. Mathematical Rigor: Accounting Identity Checks
- **Flawed Cash Flow Validation Rule:** In Section 3.1 and `SPEC_INGESTION_PIPELINE.md`, the validation rule is stated as `cfo + cfi + cff ≈ 0`. **This is an accounting error.** Net cash flow is:
  $$\Delta \text{Cash} = \text{CFO} + \text{CFI} + \text{CFF} + \text{FX Effect}$$
  Cash flow only sums to zero if there is zero change in cash balances between periods.
- **Balance Sheet Equality:** Must strictly enforce:
  $$\text{Total Equity and Liabilities} \equiv \text{Total Assets}$$
  $$\text{Total Non-Current Assets} + \text{Total Current Assets} \equiv \text{Total Assets}$$

#### 3. Data Plumbing & XBRL Verification
- **Missing Direct Verification Pipeline:** Extracted tables from OCR/PDF must be cross-verified against the official Ministry of Corporate Affairs (MCA) / Exchange XBRL `.xml` filings where available. If extracted numbers mismatch XBRL disclosures, the system must trigger an automated reconciliation warning.

---

### 5.3 Actionable Replacements

#### Standardized Ind AS Derivation & Validation Logic
Replace Section 4.1 with explicit accounting calculations and checks:

```python
from decimal import Decimal

def compute_ind_as_ebitda(pnl: dict[str, Decimal]) -> Decimal:
    """
    Synthesizes standard Operating EBITDA from official Ind AS Schedule III P&L line items.
    Excludes Other Income and exceptional items to reflect pure operating core cash generation.
    """
    revenue_ops = pnl.get("revenue_from_operations", Decimal("0"))
    mat_consumed = pnl.get("cost_of_materials_consumed", Decimal("0"))
    stock_purchases = pnl.get("purchases_of_stock_in_trade", Decimal("0"))
    inv_changes = pnl.get("changes_in_inventories", Decimal("0")) # Note: negative if inventory built up
    emp_expenses = pnl.get("employee_benefits_expense", Decimal("0"))
    other_expenses = pnl.get("other_expenses", Decimal("0"))
    
    operating_expenses = mat_consumed + stock_purchases + inv_changes + emp_expenses + other_expenses
    operating_ebitda = revenue_ops - operating_expenses
    return operating_ebitda

def validate_financial_statement_integrity(bs: dict[str, Decimal], cf: dict[str, Decimal]) -> list[dict]:
    """Rigorous Ind AS balance sheet and cash flow identity checks."""
    errors = []
    
    # 1. Balance Sheet Equality Check
    total_assets = bs.get("total_assets", Decimal("0"))
    total_equity_liab = bs.get("total_equity", Decimal("0")) + bs.get("total_liabilities", Decimal("0"))
    bs_diff = abs(total_assets - total_equity_liab)
    if bs_diff > Decimal("1.0"): # Tolerance for rounding in crores
        errors.append({
            "check": "BALANCE_SHEET_EQUALITY",
            "message": f"Total Assets ({total_assets}) does not match Total Equity + Liabilities ({total_equity_liab}). Diff: {bs_diff}",
            "status": "FAIL"
        })
        
    # 2. Cash Flow Identity Check
    cfo = cf.get("cfo", Decimal("0"))
    cfi = cf.get("cfi", Decimal("0"))
    cff = cf.get("cff", Decimal("0"))
    fx_effect = cf.get("fx_effect", Decimal("0"))
    net_cf_computed = cfo + cfi + cff + fx_effect
    
    closing_cash = bs.get("cash_and_equivalents_closing", Decimal("0"))
    opening_cash = bs.get("cash_and_equivalents_opening", Decimal("0"))
    net_cf_expected = closing_cash - opening_cash
    
    cf_diff = abs(net_cf_computed - net_cf_expected)
    if cf_diff > Decimal("1.0"):
        errors.append({
            "check": "CASH_FLOW_DELTA_IDENTITY",
            "message": f"Net cash flow ({net_cf_computed}) does not match change in cash & equivalents ({net_cf_expected}). Diff: {cf_diff}",
            "status": "FAIL"
        })
        
    return errors
```

#### Unit Detection & Normalization Engine
Add unit detection specification to prevent scale errors:

```python
import re
from enum import Enum

class CurrencyUnit(Enum):
    RUPEES_CRORES = 10_000_000
    RUPEES_LAKHS = 100_000
    RUPEES_THOUSANDS = 1_000
    RUPEES_MILLIONS = 1_000_000
    ABSOLUTE_RUPEES = 1

def detect_statement_unit(text_header: str) -> CurrencyUnit:
    """
    Parses table header or preamble for Indian currency denomination strings.
    Defaults to CRORES for large corporate reports if unspecified.
    """
    clean_header = text_header.lower()
    if re.search(r"(₹|rs\.?|inr)\s*(in)?\s*(crores?|cr\.?)", clean_header):
        return CurrencyUnit.RUPEES_CRORES
    if re.search(r"(₹|rs\.?|inr)\s*(in)?\s*(lakhs?|lacs?)", clean_header):
        return CurrencyUnit.RUPEES_LAKHS
    if re.search(r"(₹|rs\.?|inr)\s*(in)?\s*(thousands?)", clean_header):
        return CurrencyUnit.RUPEES_THOUSANDS
    if re.search(r"(₹|rs\.?|inr)\s*(in)?\s*(millions?|mn\.?)", clean_header):
        return CurrencyUnit.RUPEES_MILLIONS
    return CurrencyUnit.RUPEES_CRORES
```

---

## 6. Audit & Recommendations: `research-os-frontend/SPEC_INGESTION_PIPELINE.md`

### 6.1 Target Spec File Path & Title
- **File:** `research-os-frontend/SPEC_INGESTION_PIPELINE.md`
- **Title:** Research OS - Document Ingestion Pipeline Specification (646 lines)

### 6.2 Lenses Evaluated & Core Critique

#### 1. Indian Filing Nuances: Scanned PDFs & Bilingual Announcements
- **Scanned Non-OCR Failure:** Corporate filings uploaded to BSE/NSE by companies under SEBI Regulation 30 (e.g. notices of tax demands, strikes, acquisition agreements) are frequently scanned physical papers saved as image-only PDFs. `pdfplumber` returns an empty string on these files, causing silent extraction failure.
- **Bilingual Filings:** Announcements from Public Sector Undertakings (PSUs like ONGC, Coal India, SBI) and statutory AGM notices frequently contain identical text in Hindi and English or dual-column scripts. Naive token chunking interleaves Devanagari and Latin scripts, degrading embedding retrieval.

#### 2. Data Plumbing & Layout Analysis
- **Multi-Column Reading Order Corruption:** Annual report MD&A sections in India are formatted in 2-column or 3-column glossy magazine formats. Naive horizontal extraction (`pdfplumber` line-by-line) reads across columns (Line 1 Col 1 → Line 1 Col 2), garbling the syntax and making RAG answers nonsensical.
- **Vector Search Index Scaling:** The spec specifies an `IVFFlat` index on `pgvector`. `IVFFlat` requires retraining when data changes and suffers severe recall degradation on dynamic document updates. Production pgvector deployments must use `HNSW` (`m=16, ef_construction=64`).

---

### 6.3 Actionable Replacements

#### Multi-Tier Ingestion Architecture with OCR Fallback
Replace lines 153–185 of `SPEC_INGESTION_PIPELINE.md` with a multi-stage parser:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ MULTI-STAGE DOCUMENT INGESTION PIPELINE                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1. PDF Pre-Check: Detect Text Density & Layout                                   │
│    ├── Check character count per page                                           │
│    └── If text density < 100 characters/page → Route to OCR Pipeline            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 2. Text PDF Branch:                                                            │
│    ├── LayoutLMv3 / Heuristic Column Detection (Detect 2-col or 3-col grids)    │
│    ├── De-hyphenation and Reading-Order Stream Reconstruction                   │
│    └── Language Filter: Separate Hindi / English blocks                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 3. Scanned PDF Branch (Fallback OCR):                                          │
│    ├── DPI Normalization: Render pages at 300 DPI image buffers                 │
│    ├── Preprocessing: Deskewing, Contrast enhancement, Binarization             │
│    └── Tesseract 5 / PaddleOCR / AWS Textract execution with Bounding Boxes    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 4. Table Extraction Stack:                                                      │
│    ├── Bordered Tables: Camelot Lattice / pdfplumber lines                      │
│    └── Borderless Tables: Table-Transformer / Camelot Stream                    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### Code Replacement: OCR Fallback & Layout-Aware Parser
Add the production ingestion handler:

```python
import fitz # PyMuPDF
import pdfplumber
import pytesseract
from PIL import Image
import io

def parse_document_page_with_ocr_fallback(page: fitz.Page, min_char_threshold: int = 100) -> dict:
    """
    Robust page parser that falls back to Tesseract OCR when digital text is absent or corrupt.
    Preserves token coordinates for bounding-box grounding.
    """
    raw_text = page.get_text("text").strip()
    
    # If page contains adequate embedded digital text
    if len(raw_text) >= min_char_threshold:
        words = page.get_text("words") # list of (x0, y0, x1, y1, word, block_no, line_no, word_no)
        rect = page.rect
        return {
            "is_scanned": False,
            "text": raw_text,
            "tokens": [
                {
                    "word": w[4],
                    "bbox": [w[0] / rect.width, w[1] / rect.height, w[2] / rect.width, w[3] / rect.height]
                }
                for w in words
            ]
        }
    
    # Otherwise, execute OCR on rendered 300 DPI raster
    pix = page.get_pixmap(dpi=300)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    
    ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
    extracted_words = []
    text_parts = []
    
    w_scale = float(pix.width)
    h_scale = float(pix.height)
    
    for i in range(len(ocr_data['text'])):
        word = ocr_data['text'][i].strip()
        if word:
            text_parts.append(word)
            x, y, w, h = ocr_data['left'][i], ocr_data['top'][i], ocr_data['width'][i], ocr_data['height'][i]
            extracted_words.append({
                "word": word,
                "bbox": [x / w_scale, y / h_scale, (x + w) / w_scale, (y + h) / h_scale]
            })
            
    return {
        "is_scanned": True,
        "text": " ".join(text_parts),
        "tokens": extracted_words
    }
```

#### Database Schema Optimization: HNSW Index
Replace lines 320–337 with an optimized PostgreSQL `pgvector` HNSW index specification:

```sql
-- Migration: Upgrade vector index from IVFFlat to HNSW for superior high-recall performance
CREATE EXTENSION IF NOT EXISTS vector;

DROP TABLE IF EXISTS document_chunks CASCADE;

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    company_symbol VARCHAR(20) NOT NULL,
    chunk_index INT NOT NULL,
    page_number INT NOT NULL,
    bounding_box JSONB, -- Stores [x1, y1, x2, y2]
    section_name VARCHAR(150),
    text_content TEXT NOT NULL,
    token_count INT NOT NULL,
    embedding vector(1024), -- BGE-M3 (1024-dim) or text-embedding-3-large (3072-dim)
    pit_effective_date TIMESTAMPTZ NOT NULL,
    is_restated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index provides 98%+ recall with zero training downtime
CREATE INDEX idx_document_chunks_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_chunks_symbol_date ON document_chunks (company_symbol, pit_effective_date);
```

---

## 7. Summary Implementation Matrix for Document AI

| Spec File | Critical Finding | Recommended Fix | Primary Lens Impact |
|---|---|---|---|
| `document-ai.md` | Single-pane layout; citations lack coordinates; naive vector retrieval. | Responsive split-screen PDF viewer (`react-pdf`); bounding box schema `[x1, y1, x2, y2]`; hybrid BM25 + Vector RRF search. | UI/UX & Data Plumbing |
| `ai-assistant.md` | Static insight cards; 5% hallucination risk; no delta comparison. | Quarter-over-quarter delta cards; DeBERTa NLI automated entailment check (0.88 threshold); Ind AS 37 contingent liability detector. | Fundamental Logic & Forensic Math |
| `smart-summarizer.md` | Unfiltered transcripts; sentiment detached from financials; misses evasive answers. | Concall diarization parser (Management vs Analyst); Evasion detection score; Tone-Guidance Divergence metric. | Financial Knowledge & Fundamental Logic |
| `key-data-extractor.md` | EBITDA assumed on Schedule III P&L; incorrect Cash Flow formula `CFO+CFI+CFF=0`; unit scaling errors. | Programmatic Ind AS EBITDA synthesizer; corrected cash flow delta identity; explicit ₹ Crores/Lakhs regex detector. | Financial Accounting (Ind AS) & Math |
| `SPEC_INGESTION_PIPELINE.md` | Scanned PDFs fail silently; multi-column reading order corruption; IVFFlat index churn. | Dual-path OCR fallback (Tesseract 5 @ 300 DPI); LayoutLMv3 column splitter; pgvector HNSW index migration. | Data Plumbing & System Architecture |
