# Decision Terminal Tool Specification

**Tool Name:** Decision Terminal  
**Category:** Overview  
**Sheet:** Company Page → Overview  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Dropdown-based conviction tagging on 3 parameters: Business Quality, Valuation Comfort, Portfolio Fit. Outputs a composite conviction tag (High/Medium/Low) with rationale. Used for quick portfolio screening and committee discussions.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Decision Terminal - [SYMBOL]                                    │
├─────────────────────────────────────────────────────────────────┤
│ PARAMETER           │ SELECTION              │ WEIGHT │ SCORE  │
├─────────────────────┼────────────────────────┼────────┼────────┤
│ Business Quality    │ [High ▼]               │ 40%    │ 4/5    │
│ Valuation Comfort   │ [Medium ▼]             │ 35%    │ 3/5    │
│ Portfolio Fit       │ [High ▼]               │ 25%    │ 5/5    │
├─────────────────────┼────────────────────────┼────────┼────────┤
│ CONVICTION: HIGH    │ Composite: 4.0/5.0     │        │        │
├─────────────────────────────────────────────────────────────────┤
│ RATIONALE: "Strong moat, fair valuation, good diversification" │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Parameters & Options
| Parameter | Options | Weights |
|-----------|---------|---------|
| Business Quality | High / Medium / Low | 40% |
| Valuation Comfort | High / Medium / Low | 35% |
| Portfolio Fit | High / Medium / Low | 25% |

### 3.3 Conviction Logic
```python
composite = (bq_score × 0.4) + (vc_score × 0.35) + (pf_score × 0.25)
# High=5, Medium=3, Low=1
conviction = "HIGH" if composite >= 4 else "MEDIUM" if composite >= 2.5 else "LOW"
```

---

## 6. Implementation Plan
- **Component:** `DecisionTerminal.tsx` in `src/components/company/overview/`
- **WidgetRegistry:** `"decision-terminal"`
- **Persistence:** workspaceStore (companyWidgets)

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*