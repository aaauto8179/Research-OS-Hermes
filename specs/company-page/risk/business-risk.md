# Business Risk Tool Specification

**Tool Name:** Business Risk  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Structured text box for recording key business risks with assumption tracking. Each risk has description, probability, impact, mitigation, and links to relevant analysis tabs. Feeds into Risk Score engine.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Business Risk - [SYMBOL]                                        │
├─────────────────────────────────────────────────────────────────┤
│ RISK REGISTER                                                   │
│ ┌────┬────────────────────────┬────────┬────────┬────────────┐ │
│ │ #  │ Risk                   │ Prob.  │ Impact │ Mitigation │ │
│ ├────┼────────────────────────┼────────┼────────┼────────────┤ │
│ │ 1  │ Raw material cost vol. │ High   │ High   │ Hedging,   │ │
│ │    │                        │        │        │ contracts    │ │
│ │ 2  │ Regulatory policy chg. │ Medium │ High   │ Lobbying,  │ │
│ │    │                        │        │        │ diversification│ │
│ │ 3  │ Technology disruption  │ Low    │ High   │ R&D invest.│ │
│ └────┴────────────────────────┴────────┴────────┴────────────┘ │
│ [Add Risk] [Import from Doc AI] [Export CSV]                    │
├─────────────────────────────────────────────────────────────────┤
│ RISK MATRIX (Probability × Impact)                              │
│        Impact: Low      Medium      High                        │
│ Prob: High    │  R3    │  R1    │  R2    │                      │
│      Medium   │        │        │        │                      │
│      Low      │        │        │        │                      │
├─────────────────────────────────────────────────────────────────┤
│ [Add Risk] [Filter] [Export Risk Report] [Link to Risk Score]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Risk Schema
```typescript
interface BusinessRisk {
  id: string;
  title: string;
  description: string;
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
  category: 'Operational' | 'Market' | 'Regulatory' | 'Technology' | 'Competitive' | 'Other';
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Risk Score Engine:** Feeds into Risk Score calculation
- **Risk Analysis (Analysis tab):** Links to detailed risk analysis
- **Downsides Tab:** Links to Key Events, Hedging

---

## 4. API Contract

```typescript
interface BusinessRiskData {
  symbol: string;
  risks: BusinessRisk[];
  matrix: RiskMatrixPosition[];
  lastUpdated: string;
}

interface RiskMatrixPosition {
  riskId: string;
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Risk register table with probability/impact dropdowns | Week 1 |
| 2 | Risk matrix visualization (3x3 grid) | Week 1 |
| 2 | Doc AI import, risk matrix positioning | Week 2 |
| 3 | Risk Score engine link, CSV export | Week 2 |

---

## 6. Testing
- Risk matrix positioning accuracy
- Probability/Impact dropdown validation
- Cross-link navigation
- CSV export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*