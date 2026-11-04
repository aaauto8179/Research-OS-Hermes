# Research OS - Technical Architecture

> Deep technical architecture documentation for the Research OS equity research platform.

## 🏛️ System Architecture Overview

### High-Level Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         RESEARCH OS SYSTEM ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────────┐  │
│  │   Frontend       │    │   Math Engine    │    │   Data Ingestion         │  │
│  │   (Next.js 15)   │◄──►│   (Python/FastAPI)│◄──►│   (Python/FastAPI)       │  │
│  │   Port 3000      │    │   Port 8000      │    │   Port 8001              │  │
│  └────────┬─────────┘    └────────┬─────────┘    └───────────┬─────────────┘  │
│           │                       │                       │                   │
│           ▼                       ▼                       ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                    SHARED INFRASTRUCTURE LAYER                           │  │
│  ├──────────────────┬──────────────────┬──────────────────┬───────────────┤  │
│  │   PostgreSQL     │      Qdrant      │    File Storage  │   Redis       │  │
│  │   + pgvector     │   (Vector DB)    │   (Local/S3)     │   (Cache)     │  │
│  │   Port 5432      │   Port 6333      │                  │   Port 6379   │  │
│  └──────────────────┴──────────────────┴──────────────────┴───────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Architecture (Next.js 15)

### Technology Stack
- **Framework**: Next.js 15.5.28 (App Router)
- **React**: 19.3.0
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 3.4 + CSS Variables
- **UI Primitives**: Radix UI + shadcn/ui patterns
- **State Management**: Zustand 5 + Immer
- **Data Fetching**: SWR 2.3 (stale-while-revalidate)
- **Charts**: Recharts 3.10 + TradingView Lightweight Charts
- **Tables**: @tanstack/react-table v9
- **Drag & Drop**: @dnd-kit + react-grid-layout
- **Testing**: Vitest 3 + React Testing Library

### Project Structure (Frontend)

```
research-os-frontend/
├── src/
│   ├── app/                    # Next.js App Router (pages)
│   │   ├── api/               # API routes (proxies to Python services)
│   │   ├── companies/         # Company list page
│   │   ├── company/[symbol]/  # Company deep-dive (10 tabs)
│   │   ├── documents/         # Document AI hub
│   │   ├── generate-ideas/    # Idea generation pipeline
│   │   ├── grwth/             # GRWTH pipeline tracker
│   │   ├── industry/          # Industry analysis
│   │   ├── macro/             # Macro dashboard
│   │   ├── portfolio/         # Portfolio management
│   │   ├── screening/         # Stock screening
│   │   ├── tasks/             # Tasks & time tracking
│   │   ├── test/              # Test page
│   │   ├── valuation/         # Valuation models
│   │   ├── watchlist/         # Watchlist management
│   │   ├── weigh/             # Decision weighing
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles + CSS variables
│   │   └── middleware.ts      # Middleware (auth disabled)
│   │
│   ├── components/
│   │   ├── ui/                # Radix UI primitives (15 components)
│   │   ├── widgets/           # 86 registered widgets
│   │   ├── CompanyTabs.tsx    # Tab management (drag-reorder, rename)
│   │   ├── DashboardCanvas.tsx # Drag-drop grid layout
│   │   ├── CompanyTabs.tsx    # Tab system
│   │   └── Navigation.tsx     # Sidebar navigation
│   │
│   ├── hooks/
│   │   └── usePrices.ts       # SWR price polling hook
│   │
│   ├── lib/
│   │   ├── workspace-store.ts # Zustand store (Immer + persist)
│   │   ├── supabase.ts        # Supabase client
│   │   ├── types.ts           # Shared TypeScript types
│   │   ├── utils.ts           # Utility functions
│   │   └── mock-data.ts       # Mock data for development
│   │
│   ├── middleware.ts          # Next.js middleware (auth disabled)
│   ├── vitest.config.ts       # Vitest configuration
│   ├── vitest.setup.ts        # Test setup
│   └── smoke.test.ts          # Smoke test
│
├── public/                    # Static assets
├── package.json
├── vitest.config.ts
├── vitest.setup.ts
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vercel.json
└── Dockerfile
```

### Key Frontend Patterns

#### 1. Widget Registry System
```typescript
// WidgetRegistry.tsx - Lazy-loaded widget components
const WIDGET_REGISTRY: Record<string, React.ComponentType<any>> = {
  "dcf-valuation": dynamic(() => import("./DCFValuation")),
  "ratio-analysis": dynamic(() => import("./RatioAnalysis")),
  // ... 86 widgets
};

export function WidgetRenderer({ type, props }: { type: string; props?: any }) {
  const Component = WIDGET_REGISTRY[type];
  if (!Component) return <UnknownWidget type={type} />;
  return <Suspense fallback={<WidgetSkeleton />}><Component {...props} /></Suspense>;
}
```

#### 2. Company Tab System
```typescript
// CompanyTabs.tsx - Dynamic tab management
interface TabConfig {
  id: string;
  label: string;
  isCustom?: boolean;
  widgets: string[];  // Widget keys from registry
}

// 10 default tabs matching Excel 1:1
const DEFAULT_TABS: TabConfig[] = [
  { id: "overview", label: "Overview", widgets: [...] },
  { id: "story", label: "Story", widgets: [...] },
  { id: "management", label: "Management", widgets: [...] },
  // ... 7 more
];
```

#### 3. Dashboard Canvas (Drag-Drop Grid)
```typescript
// DashboardCanvas.tsx - react-grid-layout based
interface WidgetLayout {
  i: string;      // Widget key
  x: number;      // Grid column
  y: number;      // Grid row
  w: number;      // Width
  h: number;      // Height
  minW?: number;
  minH?: number;
  static?: boolean;
}
```

#### 4. State Management (Zustand + Immer)
```typescript
// workspace-store.ts
interface WorkspaceState {
  // Company context
  currentSymbol: string;
  companyTabs: Record<string, TabConfig>;
  
  // Dashboard layouts
  industryLayouts: Record<string, WidgetLayout[]>;
  companyLayouts: Record<string, WidgetLayout[]>;
  
  // Widget registry
  availableWidgets: WidgetConfig[];
  
  // Actions
  addTab: (symbol: string, tab: TabConfig) => void;
  reorderTabs: (symbol: string, tabs: TabConfig[]) => void;
  updateWidgetLayout: (context: string, key: string, layout: WidgetLayout[]) => void;
}
```

---

## 🧮 Math Engine Architecture (Python/FastAPI)

### Technology Stack
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.109+
- **Math**: NumPy, SciPy, Pandas
- **Validation**: Pydantic v2
- **Testing**: pytest + hypothesis
- **Serialization**: dataclasses + dataclasses-json

### Project Structure (Math Engine)

```
math-engine/
├── api/
│   └── main.py              # FastAPI app + 18 endpoints
├── src/
│   └── math_engine/
│       ├── __init__.py      # All exports + convenience functions
│       ├── valuation/       # 5 valuation engines
│       │   ├── dcf.py
│       │   ├── relative.py
│       │   ├── sotp.py
│       │   ├── banking.py
│       │   └── excess_return.py
│       ├── forensics/       # 3 forensic engines
│       │   ├── beneish.py
│       │   ├── altman.py
│       │   └── piotroski.py
│       ├── portfolio/       # 2 portfolio engines
│       │   ├── analytics.py
│       │   └── corporate_actions.py
│       ├── screening/       # Screening engine
│       │   └── screening.py
│       ├── projection/      # Revenue projection
│       │   └── revenue.py
│       ├── grwth/           # GRWTH pipeline
│       │   └── pipeline.py
│       └── utils/           # Shared utilities
└── tests/
    └── test_math_engine.py  # 36 golden vector tests
```

### Engine Interface (All Engines)

```python
# Base pattern for all engines
from dataclasses import dataclass
from typing import List, Optional
import hashlib
import json
from datetime import datetime

@dataclass
class EngineInputs:
    # All inputs explicit, no defaults
    symbol: str
    # ... engine-specific fields
    
    def validate(self) -> List[str]:
        """Return list of validation errors"""
        pass

@dataclass
class EngineOutputs:
    # All outputs explicit
    inputs_hash: str          # SHA-256 of canonicalized inputs
    calculation_timestamp: str # ISO 8601
    
    def to_dict(self) -> dict:
        return dataclasses.asdict(self)

class Engine(DeterministicCalculator):
    def calculate(self, inputs: EngineInputs) -> EngineOutputs:
        # Pure function: same inputs -> same outputs
        # No side effects, no external dependencies
        pass
    
    def _hash_inputs(self, inputs: EngineInputs) -> str:
        """SHA-256 of canonicalized inputs for audit trail"""
        canonical = json.dumps(dataclasses.asdict(inputs), sort_keys=True)
        return hashlib.sha256(canonical.encode()).hexdigest()[:16]
```

### API Endpoints (18 Calculation Endpoints)

| Endpoint | Engine | Input | Output |
|----------|--------|-------|--------|
| `POST /dcf` | DCF | DCFInputs | DCFOutputs |
| `POST /relative` | Relative | RelativeInputs | RelativeOutputs |
| `POST /sotp` | SOTP | SOTPInputs | SOTPOutputs |
| `POST /banking` | Banking | BankingInputs | BankingOutputs |
| `POST /excess-return` | Excess Return | ExcessReturnInputs | ExcessReturnOutputs |
| `POST /beneish` | Beneish | BeneishInputs | BeneishOutputs |
| `POST /altman` | Altman | AltmanInputs | AltmanOutputs |
| `POST /piotroski` | Piotroski | PiotroskiInputs | PiotroskiOutputs |
| `POST /portfolio` | Portfolio | PortfolioInputs | PortfolioOutputs |
| `POST /screening` | Screening | ScreeningCriteria | List[ScreeningResult] |
| `POST /ratio-analysis` | Ratio | RatioInputs | RatioOutputs |
| `POST /turnaround` | Turnaround | TurnaroundInputs | TurnaroundOutputs |
| `POST /hedging` | Hedging | HedgingInputs | HedgingOutputs |
| `POST /risk-score` | Risk Score | RiskScoreInputs | RiskScoreOutputs |
| `POST /common-size` | Common Size | CommonSizeInputs | CommonSizeOutputs |
| `POST /revenue-projection` | Revenue | RevenueInputs | RevenueOutputs |
| `POST /concall-consistency` | Concall | ConcallInputs | ConcallOutputs |
| `POST /corporate-actions` | Corp Actions | CorporateAction | AdjustedHoldings |

### Serialization Standard

```python
# All endpoints use dataclasses.asdict() for serialization
# (Not Pydantic model_dump - engines use stdlib dataclasses)

@app.post("/dcf")
async def dcf_endpoint(request: Request):
    data = await request.json()
    inputs = DCFInputs(**data)
    engine = DCFEngine()
    outputs = engine.calculate(inputs)
    return JSONResponse(content=dataclasses.asdict(outputs))
```

---

## 📄 Data Ingestion Architecture (Python/FastAPI)

### Technology Stack
- **Framework**: FastAPI 0.109+
- **PDF**: PyMuPDF (fitz), pdfplumber
- **Chunking**: Sliding window (configurable size/overlap)
- **Embeddings**: BGE-M3 (local) + BM25 (PostgreSQL FTS)
- **Vector Store**: Qdrant / pgvector
- **Classification**: Rule-based + LLM fallback
- **RAG**: Hybrid retrieval (BM25 + Dense) + NLI verification

### Project Structure (Data Ingestion)

```
data-ingestion/
├── api/
│   └── main.py              # FastAPI app + endpoints
├── src/
│   └── data_ingestion/
│       ├── chunkers/
│       │   └── sliding_window.py
│       ├── classifiers/
│       │   └── document_classifier.py  # 8 doc types
│       ├── embeddings/
│       │   └── vector_store.py
│       ├── extractors/
│       │   ├── pdf.py
│       │   └── legal.py
│       ├── pit/
│       │   └── transformer.py          # PIT compliance
│       ├── rag/
│       │   └── citation_engine.py      # NLI verification
│       └── scrapers/                   # Web scrapers
└── tests/
    └── test_data_ingestion.py          # 13 tests
```

### Document Types (8 Categories)
1. **ANNUAL_REPORT** - Full annual reports
2. **CONCALL_TRANSCRIPT** - Earnings call transcripts
3. **INVESTOR_PRESENTATION** - Investor decks
4. **SEBI_REG_30** - Material event disclosures
5. **BOARD_MEETING** - Board meeting outcomes
6. **CREDIT_RATING** - Credit rating reports
7. **ORDER_BOOK** - Order book snapshots
8. **OTHER** - Miscellaneous

### Pipeline Stages

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  EXTRACT     │───►│  CLASSIFY    │───►│   PIT        │───►│  EMBED       │───►│  STORE       │
│  (PDF/Excel) │    │  (8 types)   │    │  (Point-in-  │    │  (BM25+BGE)  │    │  (Qdrant/    │
│              │    │              │    │   Time)      │    │              │    │  pgvector)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /extract` | Extract text/tables from PDF |
| `POST /classify` | Classify document type |
| `POST /chunk` | Chunk text with sliding window |
| `POST /pit-transform` | Apply PIT transformation |
| `POST /ingest` | Full ingestion pipeline |
| `POST /search` | Hybrid search (BM25 + Dense) |
| `POST /embed` | Generate embeddings |

---

## 🗄️ Database Schema (PostgreSQL + pgvector)

### Core Tables

```sql
-- Company master
CREATE TABLE companies (
    symbol VARCHAR(20) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    isin VARCHAR(12),
    bse_code VARCHAR(10),
    nse_symbol VARCHAR(20),
    face_value NUMERIC(10,2),
    listing_date DATE,
    market_cap_category VARCHAR(20),  -- LARGE, MID, SMALL, MICRO
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial statements (normalized, multi-year)
CREATE TABLE financial_statements (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) REFERENCES companies(symbol),
    fiscal_year INT NOT NULL,
    period_type VARCHAR(10) NOT NULL,  -- ANNUAL, QUARTERLY, TTM
    
    -- Income Statement
    revenue NUMERIC(20,2),
    cogs NUMERIC(20,2),
    gross_profit NUMERIC(20,2),
    ebitda NUMERIC(20,2),
    depreciation NUMERIC(20,2),
    ebit NUMERIC(20,2),
    interest_expense NUMERIC(20,2),
    pbt NUMERIC(20,2),
    tax NUMERIC(20,2),
    pat NUMERIC(20,2),
    
    -- Balance Sheet
    total_assets NUMERIC(20,2),
    current_assets NUMERIC(20,2),
    fixed_assets NUMERIC(20,2),
    total_equity NUMERIC(20,2),
    total_debt NUMERIC(20,2),
    lease_liabilities NUMERIC(20,2),
    current_liabilities NUMERIC(20,2),
    cash_investments NUMERIC(20,2),
    
    -- Cash Flow
    cfo NUMERIC(20,2),
    capex NUMERIC(20,2),
    cfi NUMERIC(20,2),
    cff NUMERIC(20,2),
    
    -- Market Data
    market_cap NUMERIC(20,2),
    share_price NUMERIC(10,2),
    diluted_shares NUMERIC(20,4),
    
    -- Metadata
    source_doc_id BIGINT REFERENCES documents(id),
    is_consolidated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(symbol, fiscal_year, period_type)
);

-- Documents
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(20) REFERENCES companies(symbol),
    doc_type VARCHAR(30) NOT NULL,  -- ANNUAL_REPORT, CONCALL, etc.
    fiscal_year INT,
    quarter INT,
    file_path TEXT NOT NULL,
    file_hash VARCHAR(64),
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, PARSING, PARSED, FAILED
    page_count INT,
    language VARCHAR(10) DEFAULT 'en',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    parsed_at TIMESTAMPTZ
);

-- Document chunks (for RAG)
CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES documents(id),
    chunk_index INT NOT NULL,
    text TEXT NOT NULL,
    token_count INT,
    embedding vector(1024),  -- pgvector
    page_number INT,
    bbox JSONB,  -- {x1, y1, x2, y2} normalized [0,1]
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User workspace (widget layouts, preferences)
CREATE TABLE user_workspaces (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    symbol VARCHAR(20),
    context VARCHAR(50),  -- 'company', 'industry', 'portfolio', 'macro'
    layout JSONB NOT NULL,  -- DashboardCanvas layout
    tabs JSONB,             -- CompanyTabs config
    preferences JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol, context)
);

-- Vector index for similarity search
CREATE INDEX ON document_chunks USING hnsw (embedding vector_cosine_ops);
```

---

## 🔌 API Contracts

### Frontend → Math Engine (Port 8000)

```typescript
// All requests: POST /{endpoint}
// Headers: Content-Type: application/json
// Response: { data } or { error: string }

// Example: DCF Valuation
interface DCFInputs {
  symbol: string;
  revenue: number;
  ebit: number;
  depreciation: number;
  capex: number;
  change_nwc: number;
  tax_rate: number;
  total_debt: number;
  cash: number;
  minority_interest: number;
  diluted_shares: number;
  revenue_growth_years: number[];
  ebit_margin: number;
  capex_pct_revenue: number;
  nwc_pct_revenue: number;
  risk_free_rate: number;
  equity_risk_premium: number;
  beta: number;
  cost_of_debt: number;
  debt_to_value: number;
  terminal_growth_rate: number;
  exit_multiple: number;
  forecast_years: number;
  lease_liabilities?: number;
  ebitda_margin?: number;
  mid_year_discounting?: boolean;
}

interface DCFOutputs {
  years: number[];
  revenue_proj: number[];
  ebit_proj: number[];
  nopat_proj: number[];
  depreciation_proj: number[];
  capex_proj: number[];
  change_nwc_proj: number[];
  fcff_proj: number[];
  wacc: number;
  cost_of_equity: number;
  discount_factors: number[];
  pv_fcff: number[];
  terminal_value_gordon: number;
  terminal_value_multiple: number;
  pv_terminal_gordon: number;
  pv_terminal_multiple: number;
  ev_gordon: number;
  ev_multiple: number;
  equity_value_gordon: number;
  equity_value_multiple: number;
  fair_value_per_share_gordon: number;
  fair_value_per_share_multiple: number;
  sensitivity_wacc: number[];
  sensitivity_growth: number[];
  sensitivity_matrix_gordon: number[][];
  sensitivity_matrix_multiple: number[][];
  inputs_hash: string;
  calculation_timestamp: string;
}
```

### Frontend → Data Ingestion (Port 8001)

```typescript
// POST /extract - Extract text from PDF
interface ExtractRequest {
  document: { content: string }; // base64
}
interface ExtractResponse {
  text: string;
  tables: Array<{ rows: string[][] }>;
  metadata: { pages: number; word_count: number };
}

// POST /chunk - Chunk text
interface ChunkRequest {
  text: string;
  chunk_size?: number;  // default 512
  overlap?: number;     // default 50
}
interface ChunkResponse {
  chunks: Array<{
    text: string;
    start_idx: number;
    end_idx: number;
    metadata: Record<string, any>;
  }>;
}

// POST /classify - Classify document
interface ClassifyRequest {
  text: string;
}
interface ClassifyResponse {
  doc_type: string;
  confidence: number;
  metadata: Record<string, any>;
}

// POST /search - Hybrid search
interface SearchRequest {
  query: string;
  top_k?: number;
  filters?: Record<string, any>;
}
interface SearchResponse {
  results: Array<{
    chunk_id: string;
    text: string;
    score: number;
    citation: {
      document_id: string;
      page_number: number;
      bbox: { x1: number; y1: number; x2: number; y2: number };
    };
  }>;
}
```

---

## 🔐 Authentication & Authorization

### Current State: **Disabled for Development**

```typescript
// src/middleware.ts
export default function middleware() {
  return NextResponse.next();
}
```

### Production Plan (NextAuth v5)

```typescript
// src/lib/auth.ts (to be implemented)
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        // Verify against database
        return user ? { id: user.id, email: user.email } : null;
      }
    })
  ],
  pages: { signIn: '/auth/signin' },
  callbacks: {
    jwt({ token, user }) { if (user) token.id = user.id; return token; },
    session({ session, token }) { session.user.id = token.id; return session; }
  }
});
```

### Middleware (Production)

```typescript
// src/middleware.ts (production)
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  
  if (!isLoggedIn && !isAuthPage && !isApiRoute) {
    return NextResponse.redirect(new URL('/auth/signin', req.nextUrl));
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

---

## 📦 Deployment Architecture

### Vercel Deployment (3 Services)

```json
// vercel.json (root)
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["bom1"],
  "functions": {
    "research-os-frontend/src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

| Service | Framework | Root Directory | Port |
|---------|-----------|----------------|------|
| `research-os-frontend` | Next.js | `research-os-frontend` | 3000 |
| `math-engine-api` | FastAPI | `math-engine` | 8000 |
| `data-ingestion-api` | FastAPI | `data-ingestion` | 8001 |

### Docker Compose (Local Dev)

```yaml
# docker-compose.yml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: research_os
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d

  qdrant:
    image: qdrant/qdrant:v1.7
    ports: ["6333:6333", "6334:6334"]
    volumes:
      - qdrant_data:/qdrant/storage

  math-engine:
    build: ./math-engine
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/research_os
      QDRANT_URL: http://qdrant:6333
    depends_on: [postgres, qdrant]

  data-ingestion:
    build: ./data-ingestion
    ports: ["8001:8001"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/research_os
      QDRANT_URL: http://qdrant:6333
    depends_on: [postgres, qdrant]

  frontend:
    build: ./research-os-frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_MATH_ENGINE_URL: http://math-engine:8000
      NEXT_PUBLIC_DATA_INGESTION_URL: http://data-ingestion:8001
    depends_on: [math-engine, data-ingestion]

volumes:
  postgres_data:
  qdrant_data:
```

---

## 🔄 Data Flow Patterns

### 1. Company Deep-Dive Flow
```
User visits /company/RELIANCE
       │
       ▼
Frontend: CompanyTabs loads 10 tabs
       │
       ▼
Each tab loads its widgets via WidgetRenderer
       │
       ▼
WidgetRenderer fetches from Math Engine API
       │
       ▼
Math Engine calculates using deterministic engines
       │
       ▼
Results cached in Zustand store
       │
       ▼
Widgets render with real data
```

### 2. Document Ingestion Flow
```
User uploads PDF → /api/ingest
       │
       ▼
Data Ingestion: Extract → Classify → Chunk → Embed → Store
       │
       ▼
PostgreSQL: documents + document_chunks
       │
       ▼
Qdrant: vector embeddings
       │
       ▼
Frontend: DocumentViewer shows status
```

### 3. Revenue Projection → DCF Chain
```
User adjusts growth in RevenueProjection widget
       │
       ▼
Widget calls /revenue-projection → RevenueProjectionEngine
       │
       ▼
Result: projected_fcf array
       │
       ▼
User clicks "Update DCF" or auto-sync
       │
       ▼
DCF widget calls /dcf with projected_fcf
       │
       ▼
DCFEngine recalculates fair value
       │
       ▼
ValuationSummary widget updates automatically
```

---

## 📊 Monitoring & Observability

### Health Checks
```bash
# Frontend
curl http://localhost:3000/api/health

# Math Engine
curl http://localhost:8000/health

# Data Ingestion
curl http://localhost:8001/health
```

### Logging
```python
# Python services - structured logging
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        if record.exc_info:
            log["exception"] = self.formatException(record.exc_info)
        return json.dumps(log)
```

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Frontend FCP | < 1.5s |
| Frontend TTI | < 3s |
| API P95 latency | < 500ms |
| Math engine calc | < 100ms |
| Document ingestion | < 30s/page |
| RAG query | < 1s |
| Build time | < 3min |

---

## 🔒 Security Considerations

1. **Input Validation**: All inputs validated via Pydantic (Python) / Zod (TypeScript)
2. **SQL Injection**: Parameterized queries only (SQLAlchemy ORM)
3. **XSS**: React auto-escapes, CSP headers
4. **CSRF**: SameSite cookies, CSRF tokens for forms
5. **Rate Limiting**: API rate limits per IP
6. **File Upload**: Type validation, size limits, virus scan
7. **Secrets**: Environment variables only, no hardcoded secrets

---

## 📝 API Versioning

- **v1**: Current stable (all endpoints under `/api/v1/`)
- **Breaking changes**: New version `/api/v2/`
- **Deprecation**: 6 months notice, both versions run in parallel

---

## 📚 References

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Apache Hamilton](https://hamilton.dagworks.io/)
- [Riskfolio-Lib](https://riskfolio-lib.readthedocs.io/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Vitest](https://vitest.dev/)
- [Zustand](https://github.com/pmndrs/zustand)