# Investment Checklist Tool Specification

**Tool Name:** Investment Checklist  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Behavioral audit and investment decision checklist. Customizable checklist with template presets (Behavioral Audit, Pre-Investment, Post-Investment Review). Each item has condition, evidence, status, and notes. Template presets for different analysis types.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Investment Checklist - [SYMBOL]                                 │
├─────────────────────────────────────────────────────────────────┤
│ TEMPLATE: [Behavioral Audit ▼] [Pre-Investment] [Post-Investment]│
│ [Save as Template] [Load Template]                              │
├─────────────────────────────────────────────────────────────────┤
│ CHECKLIST ITEMS                                                 │
│ ┌────┬──────────────────────────────┬────────┬────────────────┐ │
│ │ #  │ Item                         │ Status │ Evidence/Notes │ │
│ ├────┼──────────────────────────────┼────────┼────────────────┤ │
│ │ 1  │ Business model understood    │ ✅ Done│ "3 revenue streams│ │
│ │ 2  │ Management quality verified  │ ✅ Done│ "15yr tenure, clean"││
│ │ 3  │ Financials audited (3 yrs)   │ ✅ Done│ "Big 4, clean"   │ │
│ │ 4  │ Valuation within MOS         │ ⏳ Pend│ "DCF ₹1250, CMP ₹950"││
│ │ 5  │ Risk factors catalogued      │ ⏳ Pend│ "5 risks identified"││
│ │ 6  │ Exit triggers defined        │ ❌ No  │ "Need to define" │ │
│ └────┴──────────────────────────────┴────────┴────────────────┘ │
│ [Add Item] [Save Template] [Export CSV] [Link to Decision Terminal] │
├─────────────────────────────────────────────────────────────────┤
│ PROGRESS: 3/6 Complete (50%)                                    │
│ [Mark All Done] [Reset] [Export Report]                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| template_id | string | User |
| items | ChecklistItem[] | Manual |

### 3.2 Item Schema
```typescript
interface ChecklistItem {
  id: string;
  text: string;
  status: 'Done' | 'Pending' | 'Not Applicable';
  evidence: string;
  category: string;
  required: boolean;
}
```

### 3.2 Templates
```json
{
  "Behavioral Audit": [
    "Business model understood",
    "Management quality verified",
    "Financials audited (3 years)",
    "Valuation within margin of safety",
    "Risk factors catalogued",
    "Exit triggers defined",
    "Confirmation bias checked",
    "Anchoring bias checked",
    "Overconfidence checked",
    "Herding bias checked"
  ],
  "Pre-Investment": [
    "Business model understood",
    "Competitive position assessed",
    "Financial health verified",
    "Valuation within MOS",
    "Risk factors identified",
    "Exit strategy defined",
    "Position size determined",
    "Stop-loss defined",
    "Review date set"
  ],
  "Post-Investment Review": [
    "Thesis still valid?",
    "New risks emerged?",
    "Valuation still attractive?",
    "Management execution on track?",
    "New information changes thesis?",
    "Rebalance / Add / Trim / Exit?"
  ]
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Decision Terminal (Overview):** Links to conviction tagging
- **Valuation Philosophy:** Checklist items reference valuation
- **Downsides Tab:** Exit triggers link

---

## 4. API Contract

```typescript
interface InvestmentChecklistData {
  symbol: string;
  templateId: string;
  templateName: string;
  items: ChecklistItem[];
  progress: { done: number; total: number; percentage: number };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Checklist table with template selector, status dropdown | Week 1 |
| 2 | Template save/load, progress tracker | Week 1 |
| 2 | Template presets (Behavioral, Pre-Invest, Post-Invest) | Week 2 |
| 3 | Cross-links to Decision Terminal, Valuation Philosophy | Week 2 |

---

## 6. Testing
- Template save/load
- Progress calculation
- Checkbox/state persistence
- Cross-link navigation
- CSV export

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*