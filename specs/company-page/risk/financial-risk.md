# Financial Risk Tool Specification

**Tool Name:** Financial Risk  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured financial risk assessment: leverage ratios, interest coverage, liquidity ratios, cash flow volatility, debt maturity profile, covenant compliance. Auto-calculated from financial statements with thresholds and alerts.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Financial Risk - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ LEVERAGE & COVERAGE                                             │
│ ┌─────────────────────┬──────────┬──────────┬────────────────┐  │
│ │ Metric              │ Value    │ Threshold│ Status         │  │
│ ├─────────────────────┼──────────┼──────────┼────────────────┤  │
│ │ Debt/Equity         │ 0.45     │ < 1.0    │ ✅ Pass         │  │
│ │ Net Debt/EBITDA     │ 1.2x     │ < 3.0x   │ ✅ Pass         │  │
│ │ Interest Coverage   │ 8.5x     │ > 4.0x   │ ✅ Pass         │  │
│ │ Debt Service Cover  │ 2.8x     │ > 1.5x   │ ✅ Pass         │  │
│ │ Debt Maturity < 1Y  │ 15%      │ < 30%    │ ✅ Pass         │  │
│ └─────────────────────┴──────────┴──────────┴────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ LIQUIDITY & CASH FLOW                                           │
│ ┌─────────────────────┬──────────┬──────────┬────────────────┐  │
│ │ Current Ratio       │ 1.8x     │ > 1.5x   │ ✅ Pass         │  │
│ │ Quick Ratio         │ 1.2x     │ > 1.0x   │ ✅ Pass         │  │
│ │ Cash Ratio          │ 0.8x     │ > 0.5x   │ ✅ Pass         │  │
│ │ Operating CF/Revenue│ 12%      │ > 8%     │ ✅ Pass         │  │
│ │ FCF Volatility (5Y) │ 18%      │ < 25%    │ ✅ Pass         │  │
│ └─────────────────────┴──────────┴──────────┴────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ DEBT MATURITY PROFILE                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Year  │ Principal (₹Cr) │ Interest (₹Cr) │ Total (₹Cr)     │ │
│ ├───────┼─────────────────┼────────────────┼─────────────────┤ │
│ │ FY25  │ 200             │ 50             │ 250             │ │
│ │ FY26  │ 300             │ 45             │ 345             │ │
│ │ FY27  │ 150             │ 35             │ 185             │ │
│ │ FY28+ │ 400             │ 80             │ 480             │ │
│ └───────┴─────────────────┴────────────────┴─────────────────┘ │
│ [Import from Doc AI] [Link to Ratio Analysis] [Export Schedule] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| ratios | FinancialRatio[] | Auto from financials |
| debt_schedule | DebtSchedule[] | Manual / Doc AI |
| covenants | Covenant[] | Manual / Doc AI |

### 3.2 Auto-Calculated Metrics
All ratios auto-calculated from financial statements via Ratio Analysis Engine.

---

## 4. Engine Integration

### 4.1 Links
- **Ratio Analysis Engine:** Auto-calculates all leverage/liquidity ratios
- **Risk Score Engine:** Feeds into Financial Risk category score
- **Portfolio Risk:** Aggregates to portfolio level

---

## 4. API Contract

```typescript
interface FinancialRiskData {
  symbol: string;
  leverage: RatioMetric[];
  liquidity: RatioMetric[];
  debtSchedule: DebtSchedule[];
  covenants: Covenant[];
  alerts: RiskAlert[];
  lastUpdated: string;
}

interface RatioMetric {
  name: string;
  value: number;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=';
  status: 'Pass' | 'Fail' | 'Warning';
}

interface DebtSchedule {
  year: string;
  principal: number;
  interest: number;
  total: number;
}

interface Covenant {
  name: string;
  required: number;
  actual: number;
  status: 'Compliant' | 'Breach' | 'At Risk';
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Metric cards with auto-calc from Ratio Engine | Week 1 |
| 2 | Debt maturity chart (Gantt-style) | Week 1 |
| 2 | Covenant tracking with alerts | Week 2 |
| 3 | Doc AI import for debt schedule, CSV export | Week 2 |

---

## 6. Testing
- Ratio auto-calculation accuracy
- Threshold comparison logic
- Debt schedule chart rendering
- Covenant breach alert triggering

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*