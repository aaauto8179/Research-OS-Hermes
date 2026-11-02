# Red Flags Tool Specification

**Tool Name:** Red Flags  
**Category:** Management & Execution  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Text table tracking key risk factors: related party transactions, auditor changes, promoter pledge increases, contingent liabilities, regulatory actions, governance lapses. Each flag has severity, status, and analyst assessment.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Red Flags - [SYMBOL]                                            │
├─────────────────────────────────────────────────────────────────┤
│ RED FLAGS TABLE                                                 │
│ ┌────┬────────────────────────┬────────┬────────┬────────────┐ │
│ │ #  │ Flag                   │ Severity│ Status │ Assessment │ │
│ ├────┼────────────────────────┼────────┼────────┼────────────┤ │
│ │ 1  │ Promoter pledge ↑ 5%→8%│ 🔴 High │ Open   │ Monitor    │ │
│ │ 2  │ Auditor resigned FY23  │ 🟡 Med  │ Closed │ Resolved   │ │
│ │ 3  │ RPT with Promoter Co.  │ 🔴 High │ Open   │ Review     │ │
│ │ 4  │ Contingent liability ₹50Cr│ 🟡 Med │ Open   │ Quantify   │ │
│ └────┴────────────────────────┴────────┴────────┴────────────┘ │
│ [Add Flag] [Import from Doc AI] [Export CSV]                    │
├─────────────────────────────────────────────────────────────────┤
│ SEVERITY LEGEND: 🔴 High (immediate action)  🟡 Medium (monitor)  🟢 Low (watch) │
├─────────────────────────────────────────────────────────────────┤
│ FLAG DETAILS (on click)                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Flag: Promoter pledge ↑ 5%→8%                               │ │
│ │ Detected: Q2 FY24 | Source: Shareholding Pattern            │ │
│ │ Details: Promoter group pledged additional 3% shares to     │ │
│ │          secure working capital loan. Total pledge now 8%.  │ │
│ │ Impact: Potential forced selling risk if stock declines.    │ │
│ │ Analyst Note: "Loan is short-term, collateral is liquid"    │ │
│ │ Action: Track quarterly. Escalate if >10%.                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Flag] [Filter: All ▼] [Export CSV]                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| flags | RedFlag[] | Manual / Doc AI |
| auto_detected | boolean | Doc AI |

### 3.2 Flag Schema
```typescript
interface RedFlag {
  id: string;
  title: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed';
  category: 'Pledge' | 'Auditor' | 'RPT' | 'Contingent' | 'Regulatory' | 'Governance' | 'Other';
  detectedDate: string;
  source: 'manual' | 'doc_ai' | 'auto';
  analystAssessment: string;
  actionRequired: string;
  confidence?: number;
}
```

---

## 4. Doc AI Auto-Detection

### 4.1 Auto-Detection Rules
| Flag Type | Trigger | Source Document |
|-----------|---------|-----------------|
| Promoter Pledge Increase | Pledge % QoQ > 2% | Shareholding Pattern |
| Auditor Change | Auditor name change | Annual Report |
| Related Party Transaction | RPT note disclosure | Financial Statements |
| Contingent Liability Spike | Amount QoQ > 20% | Notes to Accounts |
| Regulatory Action | SEBI/NSE/BSE order | Exchange Filings |
| Governance Lapse | Board/Committee change | Corporate Governance Report |

---

## 5. API Contract

```typescript
interface RedFlagsData {
  symbol: string;
  flags: RedFlag[];
  summary: {
    high: number;
    medium: number;
    low: number;
    open: number;
  };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Table with severity badges, status dropdown | Week 1 |
| 2 | Detail modal, category filter | Week 1 |
| 2 | Doc AI auto-detection rules | Week 2 |
| 3 | Alert system (new high severity), CSV export | Week 2 |

---

## 6. Testing
- Severity badge rendering
- Status workflow (Open → Under Review → Resolved)
- Auto-detection rule accuracy
- Alert triggering
- Cross-link to Shareholding Pattern, Financial Statements

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*