# Corporate Actions Handler Tool Specification

**Tool Name:** Corporate Actions Handler  
**Category:** Portfolio Management → Corporate Actions  
**Sheet:** Portfolio management Page → 3. Corporate Actions & Special Transaction Handling  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Automated identification, classification, and processing of corporate actions: Transfer In, Transfer Out, MTF (Margin Trading Facility), Intraday Adjustment, Stock Splits, Bonus Issues, Rights Issues, Mergers, Demergers, Dividends. Applies correct adjustments to holdings, cost basis, and P&L.

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Portfolio management Page |
| Category | 3. Corporate Actions & Special Transaction Handling |
| Tool | Corporate Actions Handler |
| Description | The system should identify, classify, and correctly process: Transfer In, Transfer Out, MTF, Intraday Adjustment, Stock Splits, Bonus Issues, Rights Issues, Mergers, Demergers, Dividends |
| Data Source | Broker statements, Corporate announcements |
| Sample Link | — |

---

## 3. Corporate Actions Taxonomy

### 3.1 Action Types & Processing

| Action | Category | Quantity Adjustment | Avg Price Adjustment | P&L Impact | Tax Treatment |
|--------|----------|---------------------|---------------------|------------|---------------|
| **Stock Split** | Structural | qty *= ratio | avg_price /= ratio | None | No tax event |
| **Bonus Issue** | Structural | qty += qty * ratio | avg_price /= (1+ratio) | None | No tax event |
| **Rights Issue** | Structural | qty += qty * ratio | avg_price = (old_qty*avg + new_qty*price)/new_qty | None | Cost basis adjust |
| **Merger** | Structural | qty *= swap_ratio | avg_price = avg_price / swap_ratio | Realized if cash | CG on cash portion |
| **Demerger** | Structural | qty_parent *= ratio | avg_price_parent *= (1-ratio) | New holding | CG on spun-off |
| **Dividend** | Income | None | None | Dividend income | Taxable (slab) |
| **Transfer In** | Transfer | qty += incoming | avg_price = weighted | None | Cost basis carries |
| **Transfer Out** | Transfer | qty -= outgoing | None | Realized P&L | CG on sold |
| **MTF (Margin Trading)** | Leverage | qty += mtf_qty | avg_price = weighted | Interest expense | CG on sale |
| **Intraday Adjustment** | Adjustment | None | None | Realized P&L | Speculative income |

---

## 3.2 Processing Rules

| Action | Detection | Auto-Process | Manual Review |
|--------|-----------|--------------|---------------|
| Stock Split | Broker CA notice / Price gap > 20% | ✅ | Ratio verification |
| Bonus Issue | Ex-date + ratio in CA notice | ✅ | Ratio verification |
| Rights Issue | CA notice + application | ⚠️ Manual | Price/ratio verify |
| Merger | CA notice + swap ratio | ⚠️ Manual | Swap ratio verify |
| Demerger | CA notice + allotment ratio | ⚠️ Manual | Ratio verify |
| Dividend | Ex-date + amount in CA notice | ✅ | Amount verify |
| Transfer In/Out | Broker ledger entry | ✅ | Counterparty verify |
| MTF | Broker MTF ledger | ✅ | Interest calc verify |
| Intraday | Same-day buy+sell same symbol | ✅ | P&L verify |

---

## 3.3 Processing Logic

### Stock Split
```python
def process_split(holding, ratio, ex_date):
    # ratio = new_shares / old_shares (e.g., 2 for 1:1 split)
    holding.quantity = int(holding.quantity * ratio)
    holding.avg_price = round(holding.avg_price / ratio, 2)
    holding.last_corporate_action = {'type': 'split', 'ratio': ratio, 'ex_date': ex_date}
    return holding
```

### Bonus Issue
```python
def process_bonus(holding, ratio, ex_date):
    # ratio = bonus_shares / existing_shares (e.g., 1 for 1:1 bonus)
    bonus_qty = int(holding.quantity * ratio)
    holding.quantity += bonus_qty
    holding.avg_price = round(holding.avg_price / (1 + ratio), 2)
    holding.last_corporate_action = {'type': 'bonus', 'ratio': ratio, 'ex_date': ex_date}
    return holding
```

### Rights Issue
```python
def process_rights(holding, ratio, price, ex_date):
    # ratio = rights_shares / existing_shares
    # price = rights issue price
    rights_qty = int(holding.quantity * ratio)
    holding.quantity += rights_qty
    holding.avg_price = round(
        (holding.quantity * holding.avg_price + rights_qty * price) / 
        (holding.quantity + rights_qty), 2
    )
    holding.cash_outflow += rights_qty * price
    holding.last_corporate_action = {'type': 'rights', 'ratio': ratio, 'price': price, 'ex_date': ex_date}
    return holding
```

### Dividend
```python
def process_dividend(holding, amount_per_share, ex_date, record_date):
    dividend_income = holding.quantity * amount_per_share
    return {
        'dividend_income': dividend_income,
        'ex_date': ex_date,
        'record_date': record_date,
        'tax_deducted': dividend_income * 0.1  # 10% TDS
    }
```

---

## 4. Corporate Actions Engine API

```typescript
interface CorporateActionEvent {
  id: string;
  symbol: string;
  actionType: 'split' | 'bonus' | 'rights' | 'merger' | 'demerger' | 
              'dividend' | 'transfer_in' | 'transfer_out' | 'mtf' | 'intraday';
  exDate: string;
  recordDate?: string;
  ratio?: number;        // for split/bonus/rights
  price?: number;        // for rights
  swapRatio?: number;    // for merger/demerger
  cashComponent?: number; // for merger cash portion
  dividendPerShare?: number;
  details: any;
  status: 'detected' | 'pending' | 'processed' | 'failed' | 'manual_review';
  source: 'broker_ca' | 'exchange_feed' | 'manual_entry';
  detectedAt: string;
  processedAt?: string;
}

interface CorporateActionsEngine {
  detect(transactions: Transaction[], caFeed: CAFeed): CorporateActionEvent[];
  process(action: CorporateActionEvent, holdings: Holding[]): ProcessingResult;
  validate(action: CorporateActionEvent): ValidationResult;
  rollback(actionId: string): RollbackResult;
}
```

---

## 4. UI/UX Specification

### 3.1 Corporate Actions Dashboard
```
┌─────────────────────────────────────────────────────────────────┐
│ Corporate Actions - [Portfolio Name]                            │
├─────────────────────────────────────────────────────────────────┤
│ STATUS: [All ▼] [Pending (3) ▼] [Processed (12)] [Failed (1)]  │
├─────────────────────────────────────────────────────────────────┤
│ CORPORATE ACTIONS TABLE                                         │
│ ┌────┬────────┬──────────┬──────────┬────────┬────────┬───────┐│
│ │ #  │ Symbol │ Action   │ Ex-Date  │ Ratio  │ Status │ Act   ││
│ ├────┼────────┼──────────┼──────────┼────────┼────────┼───────┤│
│ │ 1  │ RELIANCE│ Split    │ 2024-11-15│ 2:1   │ ✅ Done│ [🔍] ││
│ │ 2  │ TCS     │ Bonus    │ 2024-10-20│ 1:1    │ ⏳ Pend│ [✅] ││
│ │ 3  │ HDFC    │ Dividend │ 2024-11-01│ ₹18/sh │ ⚠️ Review│ [🔍] ││
│ │ 4  │ INFY    │ Rights   │ 2024-12-01│ 1:5 @₹1200│ ❌ Fail│ [🔧] ││
│ └────┴────────┴──────────┴──────────┴────────┴────────┴───────┘│
│ [Process Pending] [Retry Failed] [Manual Entry] [Export Log]    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Action Detail Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ CORPORATE ACTION: RELIANCE - SPLIT 2:1                          │
├─────────────────────────────────────────────────────────────────┤
│ EX-DATE: 2024-11-15  │  RECORD DATE: 2024-11-14               │
│ RATIO: 2:1 (1 old → 2 new)                                      │
│ PRE-SPLIT: 100 shares @ ₹2,500 avg                              │
│ POST-SPLIT: 200 shares @ ₹1,250 avg                             │
│ VALUE CHECK: 100 × 2,500 = 200 × 1,250 = ₹2,50,000 ✅          │
├─────────────────────────────────────────────────────────────────┤
│ HOLDINGS AFFECTED:                                              │
│ ┌────────┬────────┬────────┬────────┬────────┬──────────────┐  │
│ │ Port.  │ Pre-Qty│ Post-Qty│ Pre-Avg│ Post-Avg│ Status     │  │
│ ├────────┼────────┼────────┼────────┼────────┼──────────────┤  │
│ │ Main   │ 100    │ 200     │ 2,500  │ 1,250   │ ✅ Applied  │  │
│ │ Joint  │ 50     │ 100     │ 2,500  │ 1,250   │ ✅ Applied  │  │
│ └────────┴────────┴────────┴────────┴────────┴──────────────┘  │
│ [Reprocess] [Rollback] [Export Details]                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 4.1 CA Detection Sources
| Source | Method | Frequency |
|--------|--------|-----------|
| Broker CA Feed | API/Webhook | Real-time |
| Exchange Announcements | NSE/BSE API | Daily |
| Broker Ledger Entries | Parser | On import |
| Corporate Announcements | NSE RSS | Hourly |

### 4.2 Auto-Processing Pipeline
```python
async def process_corporate_actions():
    # 1. Fetch CA events from all sources
    ca_events = await fetch_ca_events()
    
    # 2. Deduplicate (same symbol + action + ex_date)
    ca_events = deduplicate(ca_events)
    
    # 3. Validate each event
    for event in ca_events:
        validation = validate_ca_event(event)
        if not validation.valid:
            event.status = 'failed'
            continue
        
        # 4. Auto-process if simple, flag for review if complex
        if event.actionType in ['split', 'bonus', 'dividend', 'split', 'mtf', 'intraday']:
            result = await process_auto(event)
            event.status = 'processed' if result.success else 'failed'
        else:
            event.status = 'manual_review'
    
    # 5. Update holdings
    await update_holdings_from_ca()
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Reconciliation:** CA adjustments trigger re-reconciliation
- **Capital Gains:** CA affects cost basis for CG calculation
- **Portfolio Analytics:** CA events tracked in attribution
- **Document AI:** CA notices auto-extracted from PDFs

---

## 5. API Contract

```typescript
// POST /api/corporate-actions/detect
interface DetectCARequest {
  portfolioId: string;
  transactions?: Transaction[];
  caFeed?: CAFeedEntry[];
}

// POST /api/corporate-actions/process
interface ProcessCARequest {
  eventId: string;
  action: 'process' | 'skip' | 'manual_override';
  overrideParams?: {
    ratio?: number;
    price?: number;
    cashComponent?: number;
  };
}

// GET /api/corporate-actions/:portfolioId
interface CAListResponse {
  events: CorporateActionEvent[];
  summary: {
    pending: number;
    processed: number;
    failed: number;
    manualReview: number;
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | CA event model, detection from broker feeds | Week 1 |
| 2 | Processing logic for all 10 action types | Week 1-2 |
| 2 | UI dashboard with status badges, action buttons | Week 2 |
| 3 | Auto-processing pipeline, manual review queue | Week 2-3 |
| 3 | Rollback/rollback support, audit trail | Week 3 |

---

## 6. Testing

| Test | Description |
|------|-------------|
| Split processing | 2:1 split → qty×2, avg/2, value preserved |
| Bonus processing | 1:1 bonus → qty×2, avg/2, value preserved |
| Rights issue | qty increase, avg recalculated, cash outflow recorded |
| Dividend | Income recorded, no holding change |
| Merger | Swap ratio applied, cash component handled |
| Demerger | Parent qty reduced, new holding created |
| Dividend tax | 10% TDS calculated correctly |
| MTF interest | Daily interest accrual, margin calc |
| Rollback | Reverses all holding changes, restores pre-CA state |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*