# Other Forensics Tool Specification

**Tool Name:** Other Forensics  
**Category:** Company Page → SME Forensics  
**Sheet:** Company Page → Tab 9 (SME Forensics)  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Catch-all for additional forensic checks not covered by specific tools: Contingent liabilities, Off-balance sheet items, Related party transaction deep-dive, Auditor qualifications, Accounting policy changes, Segment reporting quality, Cash flow vs earnings quality, Promoter pledge details, Insider trading patterns, Corporate structure complexity.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Other Forensics - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ FORENSIC CHECKLIST                                              │
│ ┌────┬─────────────────────────────┬────────┬─────────────────┐ │
│ │ #  │ Check                       │ Status │ Details/Notes   │ │
│ ├────┼─────────────────────────────┼────────┼─────────────────┤ │
│ │ 1  │ Contingent Liabilities      │ ⚠️     │ ₹2,500Cr tax dispute │ │
│ │ 2  │ Off-Balance Sheet Items     │ ✅     │ None material   │ │
│ │ 3  │ RPT Deep-Dive               │ ⚠️     │ 3 parties, ₹150Cr │ │
│ │ 4  │ Auditor Qualifications      │ ✅     │ Clean opinion   │ │
│ │ 5  │ Accounting Policy Changes   │ ⚠️     │ Rev rec change FY23│ │
│ │ 6  │ Segment Reporting Quality   │ ✅     │ Clear 3 segments │ │
│ │ 7  │ Cash Flow vs Earnings       │ ✅     │ CFO > PAT       │ │
│ │ 8  │ Promoter Pledge Details     │ ⚠️     │ 12% shares pledged│ │
│ │ 9  │ Insider Trading Patterns    │ ✅     │ No unusual activity│ │
│ │ 10 │ Corporate Structure Complexity│ ⚠️   │ 15 subsidiaries │ │
│ │ 11 │ [+ Add Custom Check]        │        │                 │ │
│ └────┴─────────────────────────────┴────────┴─────────────────┘ │
│ [Run All Checks] [Export Report] [Link to Documents]           │
├─────────────────────────────────────────────────────────────────┤
│ DETAIL: CONTINGENT LIABILITIES                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Items:                                                       │ │
│ │ 1. Income Tax Demand AY 2018-19: ₹1,200Cr (Appeal pending) │ │
│ │ 2. Excise Duty Dispute: ₹800Cr (Tribunal)                   │ │
│ │ 3. Bank Guarantees: ₹500Cr                                  │ │
│ │ Total: ₹2,500Cr (4.2% of Net Worth)                         │ │
│ │ Probability: Medium (30-50%)                                │ │
│ │ [View in Documents: Note 32, Note 35]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DETAIL: RELATED PARTY TRANSACTIONS                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Party          │ Relationship   │ Type        │ Amount │ FY │ │
│ ├────────────────┼────────────────┼─────────────┼────────┼────┤ │
│ │ Subsidiary A   │ 100% Sub       │ Sales       │ ₹450Cr│ 24 │ │
│ │ Promoter Co B  │ Promoter       │ Rent        │ ₹12Cr │ 24 │ │
│ │ Associate C    │ 26% Assoc      │ Royalty     │ ₹85Cr │ 24 │ │
│ │ KMP Relative   │ KMP Relative   │ Consulting  │ ₹8Cr  │ 24 │ │
│ │ Total RPT      │                │             │ ₹555Cr│    │ │
│ │ % of Revenue   │                │             │ 2.8%   │    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Data Sources
| Check | Source | Extraction |
|-------|--------|------------|
| Contingent Liabilities | Notes to Accounts (Note 30-35) | Doc AI (Key Data Extractor) |
| Off-Balance Sheet | Notes, Lease disclosures | Doc AI + Manual |
| RPT Deep-Dive | Note 38-40, Form AOC-2 | Doc AI + Manual |
| Auditor Qualifications | Audit Report, CARO | Doc AI |
| Policy Changes | Note 2-3, Significant Policies | Doc AI |
| Segment Quality | Segment Note | Doc AI |
| Cash Flow Quality | Cash Flow Stmt, Note | Calculation |
| Promoter Pledge | Shareholding Pattern, BSE/NSE | API + Doc AI |
| Insider Trading | SEBI SAST, PIT filings | SEBI API |
| Corp Structure | Subsidiary list, Annual Report | Doc AI |

### 3.2 Scoring
```python
FORENSIC_WEIGHTS = {
    'contingent_liabilities': 0.15,
    'off_balance_sheet': 0.10,
    'rpt_deep_dive': 0.15,
    'auditor_qualifications': 0.10,
    'policy_changes': 0.10,
    'segment_quality': 0.05,
    'cash_flow_quality': 0.10,
    'promoter_pledge': 0.10,
    'insider_trading': 0.05,
    'corp_structure': 0.10,
}

def forensic_score(checks):
    score = 0
    for check, weight in FORENSIC_WEIGHTS.items():
        if checks[check].status == 'clean':
            score += weight * 100
        elif checks[check].status == 'caution':
            score += weight * 50
        # 'red' = 0
    return round(score)
```

---

## 4. Engine Integration

### 4.1 Links
- **Document AI:** Auto-extract from uploaded docs
- **Company Page (Risk → Legal Checks):** Cross-reference
- **SME Forensics Tab:** Part of 12-tool suite
- **Decision Journal:** Forensic flags as decision inputs
- **Screening Engine:** Forensic score as filter

---

## 4. API Contract

```typescript
interface OtherForensicsData {
  symbol: string;
  checks: ForensicCheck[];
  overallScore: number;      // 0-100
  grade: 'Clean' | 'Caution' | 'Red Flag';
  lastUpdated: string;
  docAiExtractions: DocAiExtraction[];
}

interface ForensicCheck {
  id: string;
  name: string;
  category: 'Legal' | 'Accounting' | 'Governance' | 'Structure';
  status: 'clean' | 'caution' | 'red';
  details: string;
  amount?: number;
  probability?: string;
  sourceDocuments: string[];
  weight: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Checklist UI with 10 default checks, custom add | Week 1 |
| 2 | Detail modals for each check, Doc AI mapping | Week 1 |
| 2 | Scoring engine, grade calculation | Week 1 |
| 3 | Cross-tab links (Risk, Legal, Screening), export | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Doc AI extraction | >80% accuracy on test docs |
| Scoring | Weights sum to 1.0 |
| Grade thresholds | Clean≥80, Caution≥50, Red<50 |
| Cross-tab links | Open correct tabs |
| Export | All checks included |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*