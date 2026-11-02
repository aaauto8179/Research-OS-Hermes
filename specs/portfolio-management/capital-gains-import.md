# Portfolio Import Tool Specification

**Tool Name:** Portfolio Import (Capital Gains / Ledger / Holdings / Transactions)  
**Category:** Portfolio Management → Import  
**Sheet:** Portfolio management Page → Import  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Multi-format broker statement importer supporting Zerodha, Groww, Upstox, ICICI Direct, Angel One, HDFC Sec, Kotak Sec, 5Paisa, and generic CSV/Excel. Parses 4 statement types: Capital Gains, Normal Ledger, MTF Ledger, Holding Statements, Transaction Statements. Auto-normalizes to internal schema.

### 1.2 What this tool does NOT do
- Does not execute trades
- Does not file taxes (generates tax-ready data)
- Does not replace broker platforms

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Portfolio management Page |
| Category | Import |
| Tool | Capital Gains / Normal Ledger / MTF Ledger / Holding Statements / Transaction Statements |
| Description | 1) Capital Gains 2) Ledger - a) Normal ledger b) MTF Ledger 3) Holding Statements 4) Transaction Statements |
| Data Source | Uploaded statements |
| Sample Link | — |

---

## 3. UI/UX Specification

### 3.1 Layout (Import Wizard - 4 Steps)
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Import - Step 1 of 4: Select Broker & Statement      │
├─────────────────────────────────────────────────────────────────┤
│ BROKER: [Zerodha ▼]  STATEMENT: [Capital Gains ▼]  FY: [2024-25 ▼] │
├─────────────────────────────────────────────────────────────────┤
│ DRAG & DROP OR CLICK TO UPLOAD                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │  📄  Drop .xlsx, .csv, .pdf here (Max 50MB)                │ │
│ │     Supported: Zerodha, Groww, Upstox, ICICI, Angel, HDFC  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ [Next: Preview & Map]                                           │
├─────────────────────────────────────────────────────────────────┤
│ STEP 2: PREVIEW & MAP (shows parsed data with column mapping)  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Column Mapping: Broker Column → Internal Field             │ │
│ │ ┌──────────────┬──────────────────┬────────────────────┐   │ │
│ │ │ Broker Col   │ Sample Data      │ Internal Field ▼   │   │ │
│ │ ├──────────────┼──────────────────┼────────────────────┤   │ │
│ │ │ Symbol       │ RELIANCE         │ symbol             │   │ │
│ │ │ Qty          │ 10               │ quantity           │   │ │
│ │ │ Avg Price    │ 2500.50          │ avg_price          │   │ │
│ │ │ Trade Date   │ 15-01-2024       │ trade_date         │   │ │
│ │ │ Buy/Sell     │ BUY              │ side               │   │ │
│ │ └──────────────┴──────────────────┴────────────────────┘   │ │
│ │ [Auto-Map] [Save Mapping] [Next: Validate]                 │ │
├─────────────────────────────────────────────────────────────────┤
│ STEP 3: VALIDATE (shows errors/warnings with row highlights)   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Row 5: Symbol "RELIANCE-EQ" not recognized → Map to RELIANCE │ │
│ │ ⚠️ Row 12: Negative quantity -25 → Check side column        │ │
│ │ ✅ 98/100 rows valid                                         │ │
│ │ [Fix & Revalidate] [Next: Confirm]                          │ │
├─────────────────────────────────────────────────────────────────┤
│ STEP 4: CONFIRM & IMPORT                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Summary: 98 trades, 15 symbols, ₹12.5L value               │ │
│ │ ☐ Apply corporate actions (splits/bonus)                   │ │
│ │ ☐ Auto-reconcile with existing holdings                    │ │
│ │ [Import] [Cancel]                                           │ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 4.1 Supported Brokers & Formats
| Broker | Capital Gains | Ledger | MTF Ledger | Holdings | Transactions | Formats |
|--------|---------------|--------|------------|----------|--------------|---------|
| Zerodha | ✅ | ✅ | ✅ | ✅ | ✅ | CSV, XLSX, PDF |
| Groww | ✅ | ✅ | ❌ | ✅ | ✅ | CSV, XLSX |
| Upstox | ✅ | ✅ | ✅ | ✅ | ✅ | CSV, XLSX |
| ICICI Direct | ✅ | ✅ | ✅ | ✅ | ✅ | PDF, XLSX |
| Angel One | ✅ | ✅ | ❌ | ✅ | ✅ | CSV, PDF |
| HDFC Sec | ✅ | ✅ | ✅ | ✅ | ✅ | XLSX, PDF |
| Kotak Sec | ✅ | ✅ | ✅ | ✅ | ✅ | CSV, XLSX |
| 5Paisa | ✅ | ✅ | ❌ | ✅ | ✅ | CSV |
| Generic | ✅ | ✅ | ✅ | ✅ | ✅ | CSV, XLSX |

### 4.2 Parsing Pipeline
```
Upload → Broker Detector → Parser (Broker-specific) → Normalizer → Validator → Reconciler → Portfolio DB
```

### 4.3 Parser Interface
```typescript
interface BrokerParser {
  detect(file: File): boolean;  // Auto-detect broker
  parse(file: File, statementType: StatementType): ParsedData;
  normalize(data: ParsedData): NormalizedData;
  validate(data: NormalizedData): ValidationResult;
}

type StatementType = 'capital_gains' | 'ledger' | 'mtf_ledger' | 'holdings' | 'transactions';
```

---

## 5. Reconciliation Engine

### 5.1 Reconciliation Types
| Type | Description | Matching Logic |
|------|-------------|----------------|
| Holdings vs Transactions | Portfolio calc vs Broker holding | Symbol + Qty + Avg Price (±1%) |
| Capital Gains vs Transactions | CG calc vs Trade history | FIFO matching, date + symbol |
| Holding vs Broker Statement | Internal vs Broker holding | Symbol + Qty (exact) |
| Capital Gains Reconciliation | STCG/LTCG vs Broker CG | Amount + Symbol + FY |

### 5.2 Mismatch Resolution UI
```
┌─────────────────────────────────────────────────────────────────┐
│ RECONCILIATION RESULTS                                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Symbol │ Field  │ Internal│ Broker │ Diff  │ Action │   │
│ ├────┼────────┼────────┼────────┼────────┼───────┼────────┤   │
│ │ 1  │ RELIANCE│ Qty    │ 100     │ 98     │ -2    │ [Accept Broker] [Keep Internal] [Manual] │
│ │ 2  │ TCS     │ Avg Px │ 3200    │ 3195   │ -5    │ [Accept Broker] [Keep Internal] [Manual] │
│ └────┴────────┴────────┴────────┴────────┴───────┴────────┘   │
│ [Apply Selected] [Export Mismatches] [Re-run]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 4.1 Capital Gains Statement
```typescript
interface CapitalGainsRecord {
  symbol: string;
  isin: string;
  quantity: number;
  purchaseDate: string;
  saleDate: string;
  purchasePrice: number;
  salePrice: number;
  stcg: number;
  ltcg: number;
  sttPaid: number;
  stampDuty: number;
  exchange: 'NSE' | 'BSE';
  segment: 'EQ' | 'FO' | 'CD';
}
```

### 4.2 Ledger (Normal/MTF)
```typescript
interface LedgerEntry {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  refNumber: string;
  type: 'normal' | 'mtf';
}
```

### 4.3 Holding Statement
```typescript
interface HoldingRecord {
  symbol: string;
  isin: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPct: number;
  segment: 'EQ' | 'MF' | 'BOND' | 'ETF';
}
```

### 4.4 Transaction Statement
```typescript
interface TransactionRecord {
  tradeDate: string;
  settlementDate: string;
  symbol: string;
  isin: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  grossAmount: number;
  brokerage: number;
  stt: number;
  exchange: string;
  segment: string;
  orderId: string;
  tradeId: string;
}
```

---

## 5. Engine Integration

### 5.1 Auto-Reconciliation
```typescript
async function autoReconcile(portfolioId: string, brokerData: BrokerData) {
  const mismatches = [];
  
  // 1. Holdings reconciliation
  for (const holding of portfolio.holdings) {
    const brokerHolding = brokerData.holdings.find(h => h.symbol === holding.symbol);
    if (brokerHolding) {
      const qtyDiff = Math.abs(holding.qty - brokerHolding.qty);
      const priceDiff = Math.abs(holding.avgPrice - brokerHolding.avgPrice);
      if (qtyDiff > 0 || priceDiff > holding.avgPrice * 0.01) {
        mismatches.push({ type: 'holding', ... });
      }
    }
  }
  
  // 2. Capital Gains reconciliation
  // ... FIFO matching logic
  
  return { mismatches, reconciled: mismatches.length === 0 };
}
```

---

## 6. API Contract

```typescript
// POST /api/portfolio/import
interface ImportRequest {
  portfolioId: string;
  broker: string;
  statementType: StatementType;
  file: File;
  mapping?: ColumnMapping[];
  options: {
    applyCorporateActions: boolean;
    autoReconcile: boolean;
    fiscalYear: string;
  };
}

interface ImportResponse {
  importId: string;
  status: 'processing' | 'preview' | 'validating' | 'completed' | 'failed';
  preview?: ParsedData;
  validation?: ValidationResult;
  summary?: ImportSummary;
}

// GET /api/portfolio/import/:importId/status
interface ImportStatusResponse {
  status: 'processing' | 'preview' | 'validating' | 'completed' | 'failed';
  progress: number;
  preview?: ParsedData;
  validation?: ValidationResult;
  summary?: ImportSummary;
  errors?: ImportError[];
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Broker detector, base parser interface | Week 1 |
| 2 | 5 broker parsers (Zerodha, Groww, Upstox, ICICI, Angel) | Week 1-2 |
| 2 | Import wizard UI (4 steps), column mapping UI | Week 2 |
| 3 | Validation engine, row-level error display | Week 2 |
| 3 | Reconciliation engine (4 types), mismatch UI | Week 3 |
| 4 | Corporate actions handler, tax lot tracking | Week 3-4 |
| 4 | Export/Import mapping templates, batch import | Week 4 |

---

## 7. Testing

### 7.1 Unit Tests
- Broker detection accuracy (100 samples per broker)
- Parser output schema validation
- Normalizer output schema validation
- Reconciliation matching accuracy

### 7.2 Integration Tests
- Full import flow (upload → preview → validate → import)
- Mismatch detection accuracy
- Corporate action application
- Large file handling (10k+ rows)

### 7.3 Test Data
- 50 sample files per broker × 5 statement types = 1,250 test files
- Golden master files for regression testing

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Broker format changes | High | High | Versioned parsers, automated format detection alerts |
| Large file timeout | Medium | High | Streaming parse, chunked upload, progress indicator |
| Column mapping errors | Medium | High | Auto-map with confidence, manual override |
| Corporate action complexity | High | High | Dedicated CA engine, manual override |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*