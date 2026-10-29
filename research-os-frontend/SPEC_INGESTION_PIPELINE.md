# Research OS - Document Ingestion Pipeline Specification

## Overview
End-to-end document ingestion pipeline for equity research: PDF/HTML → Classification → Extraction → PIT-Compliant Storage → Vector Embeddings → RAG-Ready.

## Pipeline Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Ingestion  │───▶│ Classification│───▶│ Extraction  │───▶│ PIT Storage  │───▶│ Embeddings  │
│  (Sources)  │    │  (ML/Rule)    │    │ (Tables/Text)│    │ (Versioned)  │    │ (Vector DB) │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │                   │                   │
  Screener.in          Doc Type:           Tables → CSV      Point-in-Time      OpenAI/
  BSE/NSE RSS          Annual/Concall/     Text → Chunks     Snapshots          pgvector
  Company Filings      Presentation/       Metadata → JSON   Restatement        /Weaviate
  News/Transcripts     Filing/Other        Citations         Detection
```

## Data Models

### Document Metadata
```typescript
interface DocumentMetadata {
  id: string;                    // UUID v7 (time-ordered)
  company_symbol: string;        // e.g., "RELIANCE"
  doc_type: DocumentType;        // ANNUAL_REPORT | CONCALL_TRANSCRIPT | PRESENTATION | FILING | NEWS | RESEARCH_REPORT | OTHER
  source: string;                // screener | bse | nse | company | news | manual
  source_url: string;            // Original URL
  title: string;                 // Document title
  filing_date: Date;             // Official date
  received_at: Date;             // When we got it
  pages: number;                 // Page count
  file_size: number;             // Bytes
  content_hash: string;          // SHA256 for dedup
  language: string;              // en, hi, etc.
  status: ProcessingStatus;      // PENDING | PROCESSING | PARSED | FAILED | ARCHIVED
  checksum: string;              // For integrity
  
  // PIT fields
  pit_timestamp: Date;           // When this version became valid
  supersedes_id?: string;        // Previous version ID
  is_restatement: boolean;       // True if this corrects prior doc
  restatement_reason?: string;   // Why restated
}
```

### Extracted Content
```typescript
interface ExtractedContent {
  document_id: string;
  tables: ExtractedTable[];      // Financial statements, segment data
  text_chunks: TextChunk[];      // Paragraph-level with citations
  key_metrics: KeyMetric[];      // Extracted KPIs
  metadata: ExtractionMetadata;  // Parser info, confidence
}

interface ExtractedTable {
  id: string;
  page_number: number;
  bbox: [number, number, number, number]; // x1,y1,x2,y2 in PDF coords
  headers: string[];
  rows: string[][];
  table_type: TableType;         // INCOME_STATEMENT | BALANCE_SHEET | CASH_FLOW | SEGMENT | RATIOS | OTHER
  confidence: number;            // 0-1
  citations: Citation[];         // Links to source text
}

interface TextChunk {
  id: string;
  page_number: number;
  text: string;
  chunk_index: number;
  token_count: number;
  section?: string;              // e.g., "Management Discussion", "Risk Factors"
  embedding_id?: string;         // Vector DB reference
}

interface KeyMetric {
  metric_name: string;           // Standardized: "revenue", "ebitda", "pat", "roe"
  value: number;
  unit: string;                  // "crore", "percent", "times"
  period: string;                // "FY2024", "Q4FY24", "TTM"
  period_end: Date;
  source_table_id: string;
  row_index: number;
  confidence: number;
}
```

## Source Adapters

### 1. Screener.in Adapter
```python
class ScreenerAdapter:
    BASE_URL = "https://www.screener.in"
    
    def fetch_company_documents(self, symbol: str) -> List[DocumentRef]:
        # 1. Get company page
        # 2. Parse "Documents" section
        # 3. Extract: Annual Reports, Concall Transcripts, Presentations
        # 4. Return list of {url, title, date, type}
    
    def download_pdf(self, url: str) -> bytes:
        # Handle login, rate limits, retries
```

### 2. BSE/NSE RSS Adapter
```python
class ExchangeRSSAdapter:
    def fetch_announcements(self, symbol: str) -> List[Announcement]:
        # Parse RSS feeds from BSE/NSE
        # Filter: Financial Results, Board Meetings, AGM, Dividends
        # Extract PDF links
```

### 3. Manual Upload Adapter
```python
class ManualUploadAdapter:
    def process_upload(self, file: UploadFile, metadata: ManualMetadata) -> Document:
        # Validate file type (PDF, HTML)
        # Extract text preview
        # Queue for processing
```

## Classification Engine

### Rule-Based (Primary)
```python
DOC_TYPE_RULES = {
    "ANNUAL_REPORT": [
        lambda title: "annual report" in title.lower(),
        lambda title: "annual report" in title.lower() and "fy" in title.lower(),
    ],
    "CONCALL_TRANSCRIPT": [
        lambda title: "concall" in title.lower() or "earnings call" in title.lower(),
        lambda title: "transcript" in title.lower() and "q" in title.lower(),
    ],
    "PRESENTATION": [
        lambda title: "presentation" in title.lower() or "investor presentation" in title.lower(),
    ],
    "FILING": [
        lambda title: any(kw in title.lower() for kw in ["filing", "form", "regulation", "sebi"]),
    ],
}
```

### ML Classifier (Future)
- Fine-tuned DistilBERT on labeled Indian financial docs
- Features: title, first 500 chars, file size, page count
- Confidence threshold: 0.85 for auto-classify, else human review

## Extraction Pipeline

### PDF Parsing Stack
```
PDF → pdfplumber (tables) + PyMuPDF (text) → 
    Table Detection → Header normalization → 
    Row cleaning → Type inference → 
    Standardized JSON
```

### Table Extraction (pdfplumber)
```python
def extract_tables(pdf_path: str) -> List[ExtractedTable]:
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            # Extract tables with settings
            table_settings = {
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_tolerance": 3,
                "join_tolerance": 3,
                "edge_min_length": 3,
                "min_words_vertical": 1,
                "min_words_horizontal": 1,
            }
            raw_tables = page.extract_tables(table_settings)
            for table_idx, raw_table in enumerate(raw_tables):
                cleaned = clean_table(raw_table)
                if is_financial_table(cleaned):
                    tables.append(ExtractedTable(...))
    return tables
```

### Header Normalization
```python
STANDARD_HEADERS = {
    "revenue": ["revenue", "net sales", "total income", "turnover", "sales"],
    "ebitda": ["ebitda", "operating profit", "pbit", "operating income"],
    "pat": ["pat", "profit after tax", "net profit", "profit for the period"],
    "eps": ["eps", "earnings per share", "basic eps", "diluted eps"],
    # ... 200+ mappings
}

def normalize_header(header: str) -> str:
    clean = header.lower().strip().replace("\n", " ")
    for standard, variants in STANDARD_HEADERS.items():
        if any(v in clean for v in variants):
            return standard
    return clean  # fallback
```

### Financial Statement Detection
```python
def classify_table_type(headers: List[str], rows: List[List[str]]) -> TableType:
    header_text = " ".join(headers).lower()
    
    if any(kw in header_text for kw in ["revenue", "sales", "income", "profit", "loss", "expense"]):
        if "balance" in header_text or "sheet" in header_text:
            return TableType.BALANCE_SHEET
        if "cash" in header_text and "flow" in header_text:
            return TableType.CASH_FLOW
        return TableType.INCOME_STATEMENT
    
    if any(kw in header_text for kw in ["segment", "division", "business"]):
        return TableType.SEGMENT
    
    if any(kw in header_text for kw in ["ratio", "margin", "turnover", "coverage"]):
        return TableType.RATIOS
    
    return TableType.OTHER
```

## Point-in-Time (PIT) Compliance

### Versioning Strategy
```python
class PITStorage:
    def save_document_version(self, doc: DocumentMetadata, content: ExtractedContent):
        # 1. Check if document exists for this company+type+filing_date
        existing = self.get_latest_version(doc.company_symbol, doc.doc_type, doc.filing_date)
        
        if existing and self.content_changed(existing, content):
            # Create new version
            new_version = DocumentVersion(
                document_id=uuid7(),
                supersedes_id=existing.id,
                pit_timestamp=datetime.utcnow(),
                is_restatement=True,
                restatement_reason="Content updated",
                content=content
            )
        else:
            # First version
            new_version = DocumentVersion(...)
        
        self.save(new_version)
        return new_version
```

### Restatement Detection
```python
def detect_restatement(old: ExtractedContent, new: ExtractedContent) -> RestatementInfo:
    changes = []
    
    # Compare key metrics
    for metric in KEY_METRICS:
        old_val = get_metric(old, metric)
        new_val = get_metric(new, metric)
        if old_val and new_val and old_val != new_val:
            pct_change = abs(new_val - old_val) / abs(old_val)
            if pct_change > 0.05:  # 5% threshold
                changes.append({
                    "metric": metric,
                    "old": old_val,
                    "new": new_val,
                    "pct_change": pct_change,
                    "severity": "HIGH" if pct_change > 0.2 else "MEDIUM"
                })
    
    return RestatementInfo(
        is_restatement=len(changes) > 0,
        changes=changes,
        requires_review=any(c["severity"] == "HIGH" for c in changes)
    )
```

## Vector Embeddings & RAG

### Chunking Strategy
```python
def chunk_text(text: str, max_tokens: int = 512, overlap: int = 50) -> List[TextChunk]:
    # Split by sections first (headings)
    sections = split_by_headings(text)
    chunks = []
    
    for section_name, section_text in sections:
        tokens = tokenizer.encode(section_text)
        for i in range(0, len(tokens), max_tokens - overlap):
            chunk_tokens = tokens[i:i + max_tokens]
            chunk_text = tokenizer.decode(chunk_tokens)
            chunks.append(TextChunk(
                text=chunk_text,
                section=section_name,
                token_count=len(chunk_tokens)
            ))
    return chunks
```

### Embedding Generation
```python
class EmbeddingService:
    def __init__(self):
        self.model = "text-embedding-3-large"  # 3072 dim
        self.batch_size = 100
    
    async def embed_chunks(self, chunks: List[TextChunk]) -> List[EmbeddingResult]:
        # Batch embed
        texts = [c.text for c in chunks]
        embeddings = await openai.embeddings.create(
            model=self.model,
            input=texts
        )
        return [EmbeddingResult(chunk_id=c.id, vector=e.embedding) for c, e in zip(chunks, embeddings.data)]
```

### Vector Storage (pgvector)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id),
    chunk_index INT,
    text TEXT,
    section TEXT,
    token_count INT,
    embedding vector(3072),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### RAG Query
```python
async def rag_query(query: str, symbol: str, top_k: int = 10) -> RAGResponse:
    # 1. Embed query
    query_embedding = await embed(query)
    
    # 2. Search similar chunks
    results = await db.query("""
        SELECT text, section, document_id, 
               1 - (embedding <=> $1) as similarity
        FROM document_chunks
        WHERE document_id IN (
            SELECT id FROM documents WHERE company_symbol = $2
        )
        ORDER BY embedding <=> $1
        LIMIT $3
    """, query_embedding, symbol, top_k)
    
    # 3. Build context
    context = "\n\n---\n\n".join([r.text for r in results])
    
    # 4. Generate answer with citations
    answer = await openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
        ]
    )
    
    return RAGResponse(answer=answer, citations=results)
```

## Processing Pipeline (Async)

### Queue System (Redis + Bull/RQ)
```python
# Queue priorities
QUEUES = {
    "high": "priority_downloads",      # User-requested
    "default": "scheduled_downloads",  # Scheduled jobs
    "low": "batch_processing",         # Backfill, embeddings
}

# Job types
JOBS = {
    "download": {"timeout": 300, "retries": 3},
    "classify": {"timeout": 60, "retries": 2},
    "extract": {"timeout": 600, "retries": 2},
    "pit_store": {"timeout": 60, "retries": 1},
    "embed": {"timeout": 300, "retries": 2},
    "index": {"timeout": 60, "retries": 1},
}
```

### Monitoring
```python
# Prometheus metrics
ingestion_jobs_total = Counter('ingestion_jobs_total', 'Total jobs', ['status', 'job_type'])
ingestion_duration = Histogram('ingestion_duration_seconds', 'Job duration', ['job_type'])
documents_processed = Counter('documents_processed_total', 'Documents processed', ['source', 'doc_type'])
extraction_errors = Counter('extraction_errors_total', 'Extraction errors', ['error_type'])
pit_restatements = Counter('pit_restatements_total', 'Restatements detected', ['severity'])
```

## Data Quality Checks

### Automated Validation
```python
VALIDATION_RULES = [
    # Financial consistency
    ("revenue >= ebitda", "Revenue must be >= EBITDA"),
    ("ebitda >= pat", "EBITDA must be >= PAT"),
    ("assets = equity + liabilities", "Balance sheet must balance"),
    ("cfo + cfi + cff ≈ 0", "Cash flow must sum to zero"),
    
    # Period consistency
    ("period_end > period_start", "Period end must be after start"),
    ("filing_date >= period_end", "Filing date must be after period end"),
    
    # Data quality
    ("no_negative_revenue", "Revenue cannot be negative"),
    ("reasonable_ratios", "Ratios within industry bounds"),
]
```

### Quality Scoring
```python
def calculate_quality_score(doc: ExtractedContent) -> float:
    score = 1.0
    
    # Completeness
    expected_tables = ["income_statement", "balance_sheet", "cash_flow"]
    found = [t for t in expected_tables if any(t.table_type == t for t in doc.tables)]
    score *= len(found) / len(expected_tables)
    
    # Consistency
    violations = run_validations(doc)
    score *= max(0.5, 1 - len(violations) * 0.1)
    
    # Confidence
    avg_confidence = sum(t.confidence for t in doc.tables) / len(doc.tables) if doc.tables else 0
    score *= avg_confidence
    
    return max(0.0, min(1.0, score))
```

## Scheduling

### Frequency
| Source | Frequency | Priority |
|--------|-----------|----------|
| Screener.in | Daily 6 AM IST | High |
| BSE/NSE RSS | Every 15 min | High |
| Company filings | Event-driven | High |
| Manual uploads | Immediate | High |
| Embedding backfill | Weekly | Low |

### Rate Limiting
```python
RATE_LIMITS = {
    "screener.in": {"requests_per_minute": 30, "concurrent": 3},
    "bseindia.com": {"requests_per_minute": 60, "concurrent": 5},
    "nseindia.com": {"requests_per_minute": 60, "concurrent": 5},
    "openai": {"requests_per_minute": 3000, "tokens_per_minute": 1_000_000},
}
```

## Error Handling & Retries

### Retry Policy
```python
RETRY_CONFIG = {
    "max_attempts": 3,
    "base_delay": 5,      # seconds
    "max_delay": 300,     # 5 minutes
    "exponential_base": 2,
    "jitter": True,
    "retry_on": [TimeoutError, ConnectionError, HTTPError(5xx)],
    "no_retry_on": [HTTPError(4xx), ValidationError],
}
```

### Dead Letter Queue
```python
async def handle_failed_job(job: Job, error: Exception):
    await dlq.put({
        "job": job.serialize(),
        "error": str(error),
        "traceback": traceback.format_exc(),
        "failed_at": datetime.utcnow(),
        "attempts": job.attempts,
    })
    # Alert on-call if critical
    if job.priority == "high":
        await alert_oncall(error)
```

## Deployment

### Infrastructure
- **Queue**: Redis + BullMQ (or RQ)
- **Workers**: Horizontal scaling, CPU-optimized
- **Storage**: PostgreSQL (metadata) + pgvector (embeddings) + S3 (PDFs)
- **Monitoring**: Prometheus + Grafana + Alertmanager

### Scaling
- Download workers: I/O bound → more workers
- Extraction workers: CPU bound → fewer, more CPU
- Embedding workers: GPU preferred → batch processing

## File Inventory

```
data-ingestion/
├── src/data_ingestion/
│   ├── __init__.py
│   ├── sources/
│   │   ├── __init__.py
│   │   ├── screener.py
│   │   ├── bse_rss.py
│   │   ├── nse_rss.py
│   │   └── manual.py
│   ├── classifiers/
│   │   ├── __init__.py
│   │   ├── rule_based.py
│   │   └── ml_classifier.py
│   ├── extractors/
│   │   ├── __init__.py
│   │   ├── pdf_parser.py
│   │   ├── table_extractor.py
│   │   ├── text_chunker.py
│   │   └── metric_extractor.py
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── pit_store.py
│   │   ├── vector_store.py
│   │   └── restatement.py
│   ├── pipeline/
│   │   ├── __init__.py
│   │   ├── orchestrator.py
│   │   ├── queue.py
│   │   └── scheduler.py
│   ├── validators/
│   │   ├── __init__.py
│   │   ├── financial.py
│   │   └── quality.py
│   └── embeddings/
│       ├── __init__.py
│       ├── openai_embedder.py
│       └── pgvector_store.py
├── tests/
│   ├── test_extraction.py
│   ├── test_classification.py
│   └── test_pit.py
├── pyproject.toml
└── README.md
```

## Configuration (config.yaml)
```yaml
database:
  host: localhost
  port: 5432
  name: research_os
  user: ${DB_USER}
  password: ${DB_PASSWORD}

redis:
  host: localhost
  port: 6379

storage:
  s3_bucket: research-os-documents
  region: ap-south-1

openai:
  api_key: ${OPENAI_API_KEY}
  embedding_model: text-embedding-3-large
  chat_model: gpt-4o

screener:
  base_url: https://www.screener.in
  rate_limit: 30

bse_rss:
  url: https://www.bseindia.com/xml-data/corpfiling.xml
  poll_interval: 900

nse_rss:
  url: https://www.nseindia.com/api/corporate-announcements
  poll_interval: 900

embeddings:
  model: text-embedding-3-large
  batch_size: 100
  dimensions: 3072

vector_db:
  type: pgvector
  index_type: ivfflat
  lists: 100
```

## Testing Strategy

### Unit Tests
- Header normalization (200+ cases)
- Table type classification
- Metric extraction accuracy
- Restatement detection
- PIT versioning logic

### Integration Tests
- Full PDF → ExtractedContent pipeline
- Screener.in download → classify → extract
- Restatement detection on known restatements
- Vector search relevance

### Golden Datasets
- 50 PDFs with ground truth extractions
- 20 known restatements
- 100 query-answer pairs for RAG eval

## Monitoring Dashboard (Grafana)

### Key Panels
- Documents processed / hour by source
- Extraction success rate by doc type
- Avg extraction time by doc type
- Restatement detection rate
- Embedding queue lag
- Vector search latency (p50, p95, p99)
- RAG answer quality (human eval)

### Alerts
- Extraction success rate < 95%
- Queue lag > 1 hour
- Restatement with HIGH severity
- Embedding failure rate > 1%
- Disk usage > 80%

## Security

- PDFs encrypted at rest (S3 SSE-KMS)
- API keys in Vault/Secrets Manager
- Network policies: workers only talk to Redis, PG, S3, OpenAI
- No public internet egress except allowlisted domains
- Audit log for all document access