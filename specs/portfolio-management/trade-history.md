# Trade History Tool Specification

**Tool Name:** Trade History  
**Category:** Portfolio Management  
**Sheet:** Portfolio management Page → Trade History  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Trade history table with entry/exit dates, realized P&L, entry/exit rationale, holding period, transaction costs. Filters by symbol, date range, P&L status. Export to CSV/Excel for tax reporting.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Trade History - [Portfolio Name]                                │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS: [Symbol ▼] [Date Range ▼] [P&L: All ▼] [Side ▼]       │
├─────────────────────────────────────────────────────────────────┤
│ TRADE HISTORY TABLE                                             │
│ ┌────┬────────┬────────┬────────┬─────┬──────┬───────┬────────┐ │
│ │ #  │ Symbol │ Entry  │ Exit   │ Qty │ Side │ P&L  │ P&L%   │ │
│ ├────┼────────┼────────┼────────┼─────┼──────┼───────┼────────┤ │
│ │ 1  │ RELIANCE│ 2023-06│ 2024-03│ 50  │ SELL │+₹75K │ +42%   │ │
│ │ 2  │ TCS     │ 2023-01│ 2023-11│ 20  │ SELL │+₹42K │ +18%   │ │
│ │ 3  │ INFY    │ 2022-08│ 2023-05│ 15  │ SELL │-₹12K │ -8%    │ │
│ └────┴────────┴────────┴────────┴─────┴──────┴───────┴────────┘ │
│ [Export CSV] [Filter] [Group by Symbol] [Summary Stats]         │
├─────────────────────────────────────────────────────────────────┤
│ TRADE DETAIL (on click)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Symbol: RELIANCE  │ Entry: 2023-06-15 @ ₹2,450             │ │
│ │ Exit: 2024-03-10 @ ₹2,950  │ Qty: 50  │ Side: SELL        │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Gross P&L: +₹25,000  │ Brokerage: -₹450  │ STT: -₹375      │ │
│ │ Net P&L: +₹24,175  │ P&L%: +42%  │ Holding: 268 days       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ENTRY RATIONALE: "Strong O2C recovery, FCF improvement"    │ │
│ │ EXIT RATIONALE: "Target reached, rebalance to TCS"         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ TAX: STCG @ 15% = ₹3,626  │ LTCG: N/A                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Export CSV] [Filter] [Group by Symbol/Year] [Tax Report]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Engine Integration

### 3.1 FIFO Matching Logic
```python
def match_trades_fifo(buy_trades, sell_trades):
    """Match buys to sells using FIFO"""
    matched = []
    buy_queue = deque(sorted(buy_trades, key=lambda t: t.date))
    
    for sell in sorted(sell_trades, key=lambda t: t.date):
        remaining_qty = sell.qty
        while remaining_qty > 0 and buy_queue:
            buy = buy_queue[0]
            matched_qty = min(remaining_qty, buy.qty)
            
            matched.append({
                'symbol': sell.symbol,
                'buy_date': buy.date,
                'sell_date': sell.date,
                'qty': matched_qty,
                'buy_price': buy.price,
                'sell_price': sell.price,
                'pnl': (sell.price - buy.price) * matched_qty,
                'holding_days': (sell.date - buy.date).days
            })
            
            remaining_qty -= matched_qty
            buy.qty -= matched_qty
            if buy.qty == 0:
                buy_queue.popleft()
    return matched
```

### 3.2 Realized P&L Calculation
```python
def calculate_realized_pnl(matched_trades):
    for trade in matched_trades:
        gross_pnl = (trade.sell_price - trade.buy_price) * trade.qty
        brokerage = trade.qty * (trade.buy_price + trade.sell_price) * 0.0003
        stt = trade.qty * trade.sell_price * 0.001
        stamp_duty = trade.qty * trade.buy_price * 0.00015
        exchange_charges = trade.qty * (trade.buy_price + trade.sell_price) * 0.0000345
        
        total_costs = brokerage + stt + stamp_duty + exchange_charges
        trade.net_pnl = gross_pnl - total_costs
        trade.net_pnl_pct = (trade.net_pnl / (trade.buy_price * trade.qty)) * 100
        
        # Tax classification
        if trade.holding_days <= 365:
            trade.tax_type = 'STCG'
            trade.tax_amount = trade.net_pnl * 0.15
        else:
            trade.tax_type = 'LTCG'
            trade.tax_amount = max(0, (trade.net_pnl - 100000) * 0.10)
```

---

## 4. Engine Integration

### 4.1 Links
- **Portfolio Analytics:** Realized P&L feeds into XIRR/TWR
- **Tax Reporting:** STCG/LTCG classification for Form 10BA
- **Capital Gains Reconciliation:** Matches broker CG statement

---

## 4. API Contract

```typescript
interface TradeHistoryResponse {
  portfolioId: string;
  trades: TradeRecord[];
  summary: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalRealizedPnL: number;
    totalRealizedPnLPct: number;
    avgHoldingPeriod: number;
    stcg: number;
    ltcg: number;
  };
  filters: {
    symbols: string[];
    dateRange: [string, string];
    pnlFilter: 'all' | 'profit' | 'loss';
    sideFilter: 'all' | 'buy' | 'sell';
  };
}

interface TradeRecord {
  id: string;
  symbol: string;
  entryDate: string;
  exitDate: string;
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  side: 'BUY' | 'SELL';
  grossPnL: number;
  brokerage: number;
  stt: number;
  stampDuty: number;
  exchangeCharges: number;
  netPnL: number;
  netPnLPct: number;
  holdingDays: number;
  entryRationale: string;
  exitRationale: string;
  taxType: 'STCG' | 'LTCG' | 'N/A';
  taxAmount: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | FIFO matching engine, realized P&L calc | Week 1 |
| 2 | Trade history table with filters, grouping | Week 1 |
| 2 | Trade detail modal with rationale, tax calc | Week 1 |
| 3 | CSV/Excel export, tax report generation | Week 2 |
| 3 | Capital Gains Reconciliation link | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| FIFO matching | Correct qty/price matching |
| P&L calculation | Gross - costs = net |
| Tax classification | STCG ≤365d, LTCG >365d |
| Tax amount | STCG 15%, LTCG 10% >1L |
| Grouping | By symbol/year correct |
| Export CSV | All fields, correct format |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*