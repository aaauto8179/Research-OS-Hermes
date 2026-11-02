# Exit Rationale Tool Specification

**Tool Name:** Exit Rationale  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured text box for documenting the rationale behind exiting (fully or partially) an investment position. Captures trigger events, valuation vs price, portfolio rebalancing reasons, and lessons learned. Links to Exit Checklist (Analysis tab) and Downsides tab.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Overview |
| Tool | Exit Rationale |
| Description | This will be a text box |
| Data Source | Manual |
| Sample Link | https://drive.google.com/file/d/1nk9F5emqkrsi7u3684S11sJ8F45l-cG5/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Exit Rationale - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ EXIT TYPE: [Full Exit ▼]  [Partial Exit ▼]  [Trim ▼]           │
├─────────────────────────────────────────────────────────────────┤
│ EXIT TRIGGER                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Dropdown]                                                  │ │
│ │ □ Valuation Target Reached                                  │ │
│ │ □ Thesis Broken (fundamental deterioration)                 │ │
│ │ □ Better Opportunity (capital reallocation)                 │ │
│ │ □ Risk Limit Hit (stop loss / position limit)               │ │
│ │ □ Portfolio Rebalancing                                     │ │
│ │ □ Corporate Action (merger, delisting, etc.)                │ │
│ │ □ Other: [______________]                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ VALUATION VS PRICE AT EXIT                                      │
│ ┌─────────────────────┬─────────────────┬─────────────────────┐ │
│ │ Exit Price          │ ₹[____]         │ [Auto from trade]    │ │
│ │ FV at Exit (Base)   │ ₹[____]         │ [From Thesis Snapshot]│ │
│ │ Exit vs FV          │ [___]%          │ [Calculated]         │ │
│ │ Realized Return     │ [___]%          │ [From portfolio]     │ │
│ │ Holding Period      │ [___] months    │ [Calculated]         │ │
│ └─────────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ EXIT RATIONALE DETAILS                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Rich text editor: Detailed reasoning for exit, specific   │ │
│ │  events, data points, change in thesis, etc.]              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LESSONS LEARNED                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Structured: What worked? What didn't? What would you do   │ │
│ │  differently? Key assumptions that proved right/wrong?]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LINKS: [Exit Checklist] [Downsides Tab] [Trade History]        │
│ [Save] [Export PDF]                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source | Validation |
|-------|------|--------|------------|
| exit_type | enum | Manual | Full/Partial/Trim |
| trigger | enum + text | Manual | Required |
| exit_price | number | Trade history | Auto-filled |
| fv_at_exit | number | Thesis Snapshot | Auto-filled |
| rationale_details | string (HTML) | Manual | Max 5000 chars |
| lessons_learned | string (HTML) | Manual | Max 3000 chars |

### 4.2 Data Dependencies
- **Reads:** Trade history (exit price, return), Thesis Snapshot (FV), Company Page (CMP)
- **Writes:** workspaceStore (`exit-rationale-${symbol}`)

---

## 5. API Contract

```typescript
interface ExitRationaleData {
  symbol: string;
  exitType: 'Full' | 'Partial' | 'Trim';
  trigger: 'ValuationTarget' | 'ThesisBroken' | 'BetterOpportunity' | 'RiskLimit' | 'Rebalancing' | 'CorporateAction' | 'Other';
  customTrigger?: string;
  exitPrice: number;
  fvAtExit: number;
  exitVsFVPct: number;
  realizedReturnPct: number;
  holdingPeriodMonths: number;
  rationaleDetails: string;
  lessonsLearned: string;
  linkedExitChecklistId?: string;
  lastUpdated: string;
  updatedBy: string;
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Component with trigger dropdown, auto-fill from trade history | Week 1 |
| 2 | Auto-calc exit vs FV, realized return | Week 1 |
| 2 | Link to Exit Checklist (Analysis tab) | Week 2 |
| 3 | Lessons learned template, PDF export | Week 2 |

---

## 7. Testing
- Trigger selection logic
- Auto-calculation accuracy
- Cross-link to Exit Checklist and Downsides tab
- PDF export includes all fields

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*