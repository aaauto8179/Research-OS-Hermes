# Entry Rationale Tool Specification

**Tool Name:** Entry Rationale  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured text box for documenting the rationale behind initiating an investment position. Includes thesis summary, key catalysts, risk/reward assessment, and position sizing logic. Links to Thesis Snapshot for detailed scenario analysis.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Overview |
| Tool | Entry Rationale |
| Description | This will be a text box |
| Data Source | Manual |
| Sample Link | https://drive.google.com/file/d/1l4-Lt5-aKapzhIVEDQcsiYTspLPwBNer/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Entry Rationale - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ THESIS SUMMARY                                              │ │
│ │ [Rich text: 2-3 sentences on why we're buying]             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ KEY CATALYSTS (Next 12 Months)                                 │
│ ┌────┬──────────────────────┬──────────┬────────────────────┐  │
│ │ #  │ Catalyst             │ Timeline │ Impact (H/M/L)     │  │
│ ├────┼──────────────────────┼──────────┼────────────────────┤  │
│ │ 1  │ Capacity expansion   │ Q3 FY25  │ High               │  │
│ │ 2  │ New product launch   │ Q4 FY25  │ Medium             │  │
│ │ 3  │ Debt reduction       │ Q2 FY25  │ High               │  │
│ └────┴──────────────────────┴──────────┴────────────────────┘  │
│ [Add Catalyst] [Remove]                                        │
├─────────────────────────────────────────────────────────────────┤
│ RISK / REWARD ASSESSMENT                                       │
│ ┌─────────────────┬─────────────────┬────────────────────────┐ │
│ │ Base Case FV    │ ₹1,250          │ [From Thesis Snapshot]  │ │
│ │ Current Price   │ ₹950            │ [Auto from Company Page]  │ │
│ │ Upside          │ +31.6%          │ [Calculated]            │ │
│ │ Downside (Bear) │ ₹850 (-10.5%)    │ [From Thesis Snapshot]  │ │
│ │ Risk/Reward     │ 1:3             │ [Calculated]            │ │
│ └─────────────────┴─────────────────┴────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ POSITION SIZING                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Portfolio Allocation: [5%] ▼  (max 10% per position)       │ │
│ │ Entry Price Target: ₹920-₹960 (limit order range)           │ │
│ │ Stop Loss: ₹800 (15% below entry)                           │ │
│ │ Target Holding Period: 24-36 months                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RATIONALE DETAILS                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Rich text editor: Detailed reasoning, references to       │ │
│ │  Thesis Snapshot, Valuation Suite, Risk Analysis, etc.]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Save] [Link to Thesis Snapshot] [Export PDF]                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Interactions
- Catalyst table: inline add/edit/delete, drag to reorder
- Risk/Reward auto-calculates from Thesis Snapshot data
- Position sizing validates against portfolio limits
- Auto-links to Thesis Snapshot for detailed scenarios

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source | Validation |
|-------|------|--------|------------|
| thesis_summary | string (HTML) | Manual | Max 500 chars |
| catalysts | array | Manual | Min 1, max 10 |
| risk_reward | object | Auto-calculated | From Thesis Snapshot |
| position_sizing | object | Manual | Portfolio limits |
| rationale_details | string (HTML) | Manual | Max 5000 chars |

### 4.2 Data Dependencies
- **Reads from:** Thesis Snapshot (FV scenarios), Company Page (CMP), Portfolio (limits)
- **Writes to:** workspaceStore (`entry-rationale-${symbol}`)

---

## 5. API Contract

```typescript
interface EntryRationaleData {
  symbol: string;
  thesisSummary: string;
  catalysts: Catalyst[];
  riskReward: {
    baseCaseFV: number;
    currentPrice: number;
    upside: number;
    downside: number;
    riskRewardRatio: number;
  };
  positionSizing: {
    allocationPct: number;
    entryRange: [number, number];
    stopLoss: number;
    holdingPeriodMonths: [number, number];
  };
  rationaleDetails: string;
  lastUpdated: string;
  updatedBy: string;
}

interface Catalyst {
  id: string;
  description: string;
  timeline: string;  // e.g., "Q3 FY25"
  impact: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Achieved' | 'Missed';
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Component + CatalystTable sub-component | Week 1 |
| 2 | Auto-calc from Thesis Snapshot, portfolio limits | Week 1 |
| 3 | Persistence, PDF export | Week 2 |
| 4 | Cross-linking to Thesis Snapshot | Week 2 |

---

## 7. Testing
- Catalyst CRUD operations
- Risk/Reward calculation accuracy
- Position sizing validation
- Cross-link navigation to Thesis Snapshot

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*