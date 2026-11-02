# Auto Quality Checks Tool Specification

**Tool Name:** Auto Quality Checks  
**Category:** Portfolio Management → Data Quality  
**Sheet:** Portfolio management Page → 2. Automatic Data Quality & Balance Checks  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Automated data quality validation running 11 checks after every import/reconciliation. Flags critical issues (negative quantities, negative cash, duplicates) and warnings (missing dates, missing prices, duplicate holdings). Runs automatically post-import and on-demand.

---

## 3. UI/UX Specification

### 3.1 Layout (Quality Dashboard)
```
┌─────────────────────────────────────────────────────────────────┐
│ Auto Quality Checks - [Portfolio Name]                          │
├─────────────────────────────────────────────────────────────────┤
│ LAST RUN: 2024-11-15 14:32  │  STATUS: ⚠️ 3 WARNINGS 1 CRITICAL │
├─────────────────────────────────────────────────────────────────┤
│ CHECKS                                                          │
│ ┌────┬─────────────────────────────┬────────┬────────────────┐ │
│ │ #  │ Check                       │ Status │ Details        │ │
│ ├────┼─────────────────────────────┼────────┼────────────────┤ │
│ │ 1  │ Negative Quantities         │ 🔴     │ 2 holdings     │ │
│ │ 2  │ Unexplained Negative Cash   │ 🟢     │ Clean          │ │
│ │ 3  │ Duplicate Transactions      │ 🟡     │ 3 potential    │ │
│ │ 4  │ Missing Transaction Dates   │ 🟢     │ Clean          │ │
│ │ 5  │ Missing Prices/Values       │ 🟢     │ Clean          │ │
│ │ 6  │ Duplicate Holdings          │ 🟡     │ 1 duplicate    │ │
│ │ 7  │ Invalid Securities          │ 🟢     │ Clean          │ │
│ │ 8  │ Quantity Reconciliation     │ 🔴     │ 3 mismatches   │ │
│ │ 9  │ Cost Reconciliation         │ 🟢     │ Clean          │ │
│ │ 10 │ Cash Balance Inconsistencies│ 🟢     │ Clean          │ │
│ │ 11 │ Corporate Action Gaps       │ 🟡     │ 2 unprocessed  │ │
│ └────┴─────────────────────────────┴────────┴────────────────┘ │
│ [Run Checks] [View Details] [Export Report] [Configure Thresholds] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Check Detail Modal (on click)
```
┌─────────────────────────────────────────────────────────────────┐
│ NEGATIVE QUANTITIES (CRITICAL)                                  │
├─────────────────────────────────────────────────────────────────┤
│ Found 2 holdings with negative quantity:                        │
│ ┌────┬────────┬────────┬────────┬────────────────────────────┐ │
│ │ #  │ Symbol │ Qty    │ Avg Px │ Source                     │ │
│ ├────┼────────┼────────┼────────┼────────────────────────────┤ │
│ │ 1  │ RELIANCE│ -50   │ 2,500  │ Import: Zerodha 11/15      │ │
│ │ 2  │ TCS     │ -25    │ 3,200  │ Corporate Action: Split    │ │
│ └────┴────────┴────────┴────────┴────────────────────────────┘ │
│ [Fix: Reverse Transaction] [Fix: Manual Adjust] [Ignore]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Check Definitions

### 4.1 Check Definitions
| # | Check | Query Logic | Severity | Auto-Fix |
|---|-------|-------------|----------|----------|
| 1 | Negative Quantities | `holdings WHERE qty < 0` | Critical | Manual |
| 2 | Unexplained Negative Cash | `cash_balance < 0 AND NOT explained_by_margin` | Critical | Manual |
| 3 | Duplicate Transactions | `transactions GROUP BY (symbol, date, qty, price, side) HAVING COUNT(*) > 1` | High | Flag |
| 4 | Missing Transaction Dates | `transactions WHERE date IS NULL OR date = ''` | High | Manual |
| 5 | Missing Prices/Values | `transactions WHERE price IS NULL OR price <= 0` | High | Manual |
| 5 | Duplicate Holdings | `holdings GROUP BY symbol HAVING COUNT(*) > 1` | Medium | Merge |
| 6 | Invalid Securities | `holdings WHERE symbol NOT IN valid_symbols` | Medium | Flag |
| 6 | Quantity Reconciliation | `reconciliation_mismatches WHERE type='quantity'` | High | Reconcile |
| 9 | Cost Reconciliation | `reconciliation_mismatches WHERE field='avg_price'` | High | Reconcile |
| 10 | Cash Balance Inconsistencies | `cash_balance != sum(transactions.cash_flow)` | High | Manual |
| 11 | Corporate Action Gaps | `ca_events WHERE processed = false AND ex_date < today` | Medium | Auto-process |

---

## 4. Engine Integration

### 4.1 Check Runner
```typescript
async function runQualityChecks(portfolioId: string): Promise<QualityCheckResult[]> {
  const checks = [
    { id: 1, name: 'Negative Quantities', fn: checkNegativeQuantities, severity: 'critical' },
    { id: 2, name: 'Unexplained Negative Cash', fn: checkNegativeCash, severity: 'critical' },
    { id: 3, name: 'Duplicate Transactions', fn: checkDuplicateTransactions, severity: 'high' },
    { id: 4, name: 'Missing Transaction Dates', fn: checkMissingDates, severity: 'high' },
    { id: 5, name: 'Missing Prices/Values', fn: checkMissingPrices, severity: 'high' },
    { id: 6, name: 'Duplicate Holdings', fn: checkDuplicateHoldings, severity: 'medium' },
    { id: 7, name: 'Invalid Securities', fn: checkInvalidSecurities, severity: 'medium' },
    { id: 8, name: 'Quantity Reconciliation', fn: checkQtyReconciliation, severity: 'high' },
    { id: 9, name: 'Cost Reconciliation', fn: checkCostReconciliation, severity: 'high' },
    { id: 9, name: 'Cash Balance Inconsistencies', fn: checkCashBalance, severity: 'high' },
    { id: 10, name: 'Corporate Action Gaps', fn: checkCAGaps, severity: 'medium' },
  ];
  
  const results = await Promise.all(
    checks.map(async (check) => ({
      checkId: check.id,
      name: check.name,
      severity: check.severity,
      ...await check.fn(portfolioId)
    }))
  );
  
  return results;
}
```

---

## 5. API Contract

```typescript
interface QualityCheckResult {
  checkId: number;
  name: string;
  status: 'pass' | 'warning' | 'fail';
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  details: any[];
  autoFixAvailable: boolean;
  lastRun: string;
}

interface QualityReport {
  portfolioId: string;
  overallStatus: 'pass' | 'warning' | 'fail';
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  checks: QualityCheckResult[];
  lastRun: string;
  nextScheduled: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Check runner framework, 11 check implementations | Week 1 |
| 2 | Dashboard UI with severity badges, detail modals | Week 1 |
| 2 | Auto-fix handlers (where applicable) | Week 2 |
| 3 | Scheduler (post-import, daily, on-demand), notifications | Week 2 |

---

## 5. Testing

| Test | Description |
|------|-------------|
| Check accuracy | Each check returns correct count for seeded data |
| Severity mapping | Correct severity for each issue type |
| Auto-fix | Available fixes work correctly |
| Scheduler | Runs post-import, daily at 6 AM, on-demand |
| Notifications | Email/slack on critical failures |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*