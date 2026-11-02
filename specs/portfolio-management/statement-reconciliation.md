# Portfolio Reconciliation Tool Specification

**Tool Name:** Portfolio Reconciliation  
**Category:** Portfolio Management → Reconcile  
**Sheet:** Portfolio management Page → Reconciliation  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Automated reconciliation engine comparing internally calculated portfolio against broker statements. Four reconciliation types: Holdings vs Transactions, Capital Gains vs Transactions, Holding vs Broker Statement, Capital Gains Reconciliation. Auto-detects mismatches with resolution UI.

### 1.2 What this tool does NOT do
- Does not modify broker data
- Does not execute correction trades
- Does not replace auditor verification

---

## 2. Excel Source Reference

| Field | Value |
|-------|-------|
| Sheet | Portfolio management Page |
| Category | Reconciliation |
| Tool | 1. Statement Reconciliation 2. Capital Gains Reconciliation |
| Description | Holding Statement vs Transaction Records / Capital Gains Reconciliation |
| Data Source | Internal calc vs Broker statements |
| Sample Link | — |

---

## 3. UI/UX Specification

### 3.1 Layout (Reconciliation Dashboard)
```
┌─────────────────────────────────────────────────────────────────┐
│ Portfolio Reconciliation - [Portfolio Name]                     │
├─────────────────────────────────────────────────────────────────┤
│ RECONCILIATION TYPE: [Holdings vs Transactions ▼] [Run]        │
├─────────────────────────────────────────────────────────────────┤
│ SUMMARY                                                         │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌────────────┐ │
│ │ Total Holdings      │ │ Matched             │ │ Mismatches │ │
│ │ 25                  │ │ 22 (88%)            │ │ 3 (12%)    │ │
│ └─────────────────────┘ └─────────────────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ MISMATCH DETAILS                                                │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Symbol │ Field  │ Internal│ Broker │ Diff   │ Action │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ 1  │ RELIANCE│ Qty    │ 100     │ 98     │ -2     │ [🔧]   │   │
│ │ 2  │ TCS     │ Avg Px │ 3200    │ 3195   │ -5     │ [🔧]   │   │
│ │ 3  │ INFY    │ Avg Px │ 3200    │ 3210   │ +10    │ [🔧]   │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
│ [Apply All Broker] [Apply All Internal] [Export Mismatches]    │
├─────────────────────────────────────────────────────────────────┤
│ CAPITAL GAINS RECONCILIATION                                    │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Symbol │ FY     │ Type   │ Calc   │ Broker │ Diff    │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ 1  │ RELIANCE│ FY24   │ STCG   │ ₹45,000│ ₹44,800│ -₹200  │ [🔧]   │
│ │ 2  │ TCS     │ FY24   │ LTCG   │ ₹1.2L  │ ₹1.18L │ -₹2,000│ [🔧]   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
│ [Recalculate CG] [Export CG Report] [Download Form 10BA]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Reconciliation Types & Logic

### 3.1 Holdings vs Transactions (HvT)
```python
def reconcile_holdings_vs_transactions(portfolio_holdings, transactions):
    """Reconstruct holdings from transactions (FIFO) and compare"""
    calculated = reconstruct_holdings_fifo(transactions)
    mismatches = []
    for symbol, calc_holding in calculated.items():
        broker_holding = portfolio_holdings.get(symbol)
        if broker_holding:
            diff_qty = calc_holding.qty - broker_holding.qty
            diff_avg = calc_holding.avg_price - broker_holding.avg_price
            if abs(diff_qty) > 0 or abs(diff_avg) > broker_holding.avg_price * 0.01:
                mismatches.append({
                    'symbol': symbol,
                    'field': 'quantity' if diff_qty else 'avg_price',
                    'internal': calc_holding.qty if diff_qty else calc_holding.avg_price,
                    'broker': broker_holding.qty if diff_qty else broker_holding.avg_price,
                    'diff': diff_qty if diff_qty else diff_avg
                })
    return mismatches
```

### 3.2 Capital Gains Reconciliation (CGvT)
```python
def reconcile_capital_gains(cg_calculated, cg_broker):
    """Match CG records by symbol + FY + type (STCG/LTCG)"""
    mismatches = []
    for key, calc_cg in cg_calculated.items():
        broker_cg = cg_broker.get(key)
        if broker_cg:
            diff = calc_cg.amount - broker_cg.amount
            if abs(diff) > 1:  # ₹1 tolerance
                mismatches.append({
                    'symbol': key.symbol,
                    'fy': key.fy,
                    'type': key.type,  # STCG/LTCG
                    'calculated': calc_cg.amount,
                    'broker': broker_cg.amount,
                    'diff': diff
                })
    return mismatches
```

### 3.3 Holding Statement vs Broker (HvB)
```python
def reconcile_holding_vs_broker(internal_holdings, broker_holding_stmt):
    """Compare internal holdings vs broker holding statement"""
    # Match by symbol + ISIN
    # Check: quantity, avg_price, market_value
    pass
```

### 3.4 Capital Gains Reconciliation (CG Reconciliation)
```python
def reconcile_cg_vs_broker(cg_calculated, cg_broker_stmt):
    """Compare STCG/LTCG totals per FY"""
    mismatches = []
    for fy in financial_years:
        calc_stcg = sum(c.amount for c in cg_calculated if c.fy == fy and c.type == 'STCG')
        calc_ltcg = sum(c.amount for c in cg_calculated if c.fy == fy and c.type == 'LTCG')
        broker_stcg = cg_broker_stmt.get(fy, {}).get('stcg', 0)
        broker_ltcg = cg_broker_stmt.get(fy, {}).get('ltcg', 0)
        
        if abs(calc_stcg - broker_stcg) > 1:
            mismatches.append({fy, 'STCG', calc_stcg, broker_stcg})
        if abs(calc_ltcg - broker_ltcg) > 1:
            mismatches.append({fy, 'LTCG', calc_ltcg, broker_ltcg})
    return mismatches
```

---

## 4. Auto Quality Checks (11 Checks)

| # | Check | Description | Severity |
|---|-------|-------------|----------|
| 1 | Negative Quantities | Identify securities with negative holdings | Critical |
| 2 | Unexplained Negative Cash | Flag negative cash not explained by transactions | Critical |
| 3 | Duplicate Transactions | Detect potentially duplicated transactions | High |
| 4 | Missing Transaction Dates | Flag transactions with missing dates | High |
| 5 | Missing Prices/Values | Flag missing transaction prices or values | High |
| 6 | Duplicate Holdings | Detect duplicate security names | Medium |
| 5 | Invalid Securities | Identify unrecognized security symbols | Medium |
| 8 | Quantity Reconciliation Errors | Qty mismatch between holdings & transactions | High |
| 9 | Cost Reconciliation Errors | Avg price mismatch between holdings & transactions | High |
| 10 | Cash Balance Inconsistencies | Cash balance doesn't match transaction sum | High |
| 11 | Corporate Action Gaps | Missing split/bonus/dividend processing | Medium |

---

## 4. Engine Integration

### 4.1 Corporate Actions Handler
```python
class CorporateActionsHandler:
    def process_split(self, symbol: str, ratio: float, ex_date: date):
        # Adjust quantity: qty *= ratio
        # Adjust avg_price: avg_price /= ratio
    
    def process_bonus(self, symbol: str, ratio: float, ex_date: date):
        # qty += qty * ratio
        # avg_price /= (1 + ratio)
    
    def process_dividend(self, symbol: str, amount: float, ex_date: date):
        # Record dividend income
        # Adjust cost basis if required
    
    def process_rights(self, symbol: str, ratio: float, price: float, ex_date: date):
        # qty += qty * ratio
        # avg_price = (qty_old * avg_price + qty_new * price) / qty_new
```

---

## 5. API Contract

```typescript
// POST /api/portfolio/reconcile
interface ReconcileRequest {
  portfolioId: string;
  type: 'holdings_vs_transactions' | 'cg_vs_transactions' | 'holding_vs_broker' | 'cg_reconciliation';
  brokerData?: BrokerData;
  options: {
    tolerancePct: number;  // default 1%
    toleranceAbs: number;  // default 1 (₹1)
    fifoMethod: 'fifo' | 'lifo' | 'hifo';
  };
}

interface ReconcileResponse {
  reconciliationId: string;
  type: string;
  status: 'completed' | 'mismatches_found' | 'error';
  summary: {
    totalCompared: number;
    matched: number;
    mismatches: number;
    matchRate: number;
  };
  mismatches: Mismatch[];
  qualityChecks: QualityCheck[];
}

// GET /api/portfolio/reconcile/:reconciliationId/mismatches/:mismatchId/resolve
interface ResolveMismatchRequest {
  action: 'accept_internal' | 'accept_broker' | 'manual';
  manualValue?: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Reconciliation engine (4 types), mismatch detection | Week 1 |
| 2 | Mismatch resolution UI, auto-reconcile options | Week 1 |
| 2 | Quality checks (11 checks), severity badges | Week 2 |
| 3 | Corporate actions handler, CG reconciliation | Week 2 |
| 3 | Export reports (CSV, PDF), audit trail | Week 3 |

---

## 6. Testing

| Test | Description |
|------|-------------|
| HvT matching | FIFO reconstruction matches broker holding |
| CGvT matching | FIFO CG matches broker CG statement |
| HvB matching | Internal holding = broker holding |
| CG Reconciliation | STCG/LTCG totals match broker CG statement |
| Quality checks | All 11 checks trigger correctly |
| Mismatch resolution | Accept internal/broker/manual updates portfolio correctly |

---

## 6. Testing

### 6.1 Unit Tests
- FIFO reconstruction accuracy
- CG calculation (STCG/LTCG) with various scenarios
- Reconciliation matching accuracy (±1% tolerance)
- Quality check triggers

### 6.2 Integration Tests
- Full reconciliation flow (upload → match → resolve)
- Corporate action application during reconciliation
- Large portfolio (500+ holdings) performance

### 6.3 Test Data
- 50 test portfolios with known mismatches
- Broker statements from 5 brokers
- Corporate action test cases (split, bonus, rights, merger)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*