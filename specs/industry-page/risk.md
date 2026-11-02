# Industry Risk Factors Tool Specification

**Tool Name:** Risk  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
A scalable table widget to enter key risk factors of the industry with columns for risk description, likelihood, impact, mitigation, and source. Sources: Uploaded reports + manual entry.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Risk Factors - [INDUSTRY]                              │
├─────────────────────────────────────────────────────────────────┤
│ RISK FACTORS TABLE                                              │
│ ┌────┬─────────────────────┬────────┬────────┬────────┬────────┐ │
│ │ #  │ Risk Factor         │ Likeli.│ Impact │ Score  │ Mitig. │ │
│ ├────┼─────────────────────┼────────┼────────┼────────┼────────┤ │
│ │ 1  │ Policy Change       │ High   │ High   │ 9/10   │ Divers.│ │
│ │ 2  │ Commodity Volatility│ Med    │ High   │ 7/10   │ Hedge  │ │
│ │ 3  │ Tech Disruption     │ Low    │ Critical│ 8/10  │ R&D    │ │
│ │ 4  │ [+ Add Row]         │        │        │        │        │ │
│ └────┴─────────────────────┴────────┴────────┴────────┴────────┘ │
│ RISK MATRIX (Visual)                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Impact                                                        │ │
│ │ High    │ [2] Commodity    │ [1] Policy                    │ │
│ │ Med     │                │                                 │ │
│ │ Low     │                │ [3] Tech Disrupt                │ │
│ └─────────┴────────────────┴─────────────────────────────────┘ │
│        Low         Med          High        Likelihood          │
│ [Export] [Link to Company Risk] [Sync to Portfolio Risk]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Risk Scoring
```python
RISK_SCORE = {
    ('Low', 'Low'): 1,
    ('Low', 'Med'): 2,
    ('Low', 'High'): 3,
    ('Low', 'Critical'): 4,
    ('Med', 'Low'): 2,
    ('Med', 'Med'): 4,
    ('Med', 'High'): 6,
    ('Med', 'Critical'): 8,
    ('High', 'Low'): 3,
    ('High', 'Med'): 6,
    ('High', 'High'): 9,
    ('High', 'Critical'): 12,
}
```

### 3.2 Data Model
```typescript
interface IndustryRisk {
  id: string;
  industry: string;
  factor: string;
  likelihood: 'Low' | 'Med' | 'High';
  impact: 'Low' | 'Med' | 'High' | 'Critical';
  score: number;          // 1-12
  mitigation: string;
  source: string;         // doc ID or manual
  category: 'Policy' | 'Commodity' | 'Tech' | 'Competition' | 'Regulatory' | 'Other';
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (Risk tab):** Industry risks auto-populate
- **Portfolio Risk:** Aggregated industry risk exposure
- **Risk Score Engine:** Feeds industry risk component
- **Document AI:** Extract risks from reports

---

## 4. API Contract

```typescript
interface IndustryRiskData {
  industry: string;
  risks: IndustryRisk[];
  riskMatrix: { likelihood: string; impact: string; risks: string[] }[][];
  aggregateScore: number;   // Weighted average
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Risk table with likelihood/impact dropdowns, auto-score | Week 1 |
| 2 | Risk matrix visualization (heatmap) | Week 1 |
| 2 | Doc AI extraction, category tagging | Week 2 |
| 3 | Cross-tab sync (Company Risk, Portfolio Risk) | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Auto-score calculation | Matches matrix |
| Risk matrix rendering | Correct positioning |
| Category filtering | Works |
| Cross-tab sync | Updates Company/Portfolio |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*