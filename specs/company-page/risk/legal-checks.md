# Legal Checks & Contingent Liability Tool Specification

**Tool Name:** Legal Checks & Contingent Liability  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Tracks legal cases, contingent liabilities, regulatory notices, arbitration cases. Each entry has case details, amount at risk, probability, provision status, and timeline. Links to Red Flags and Financial Statements.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Legal Checks & Contingent Liability - [SYMBOL]                  │
├─────────────────────────────────────────────────────────────────┤
│ CONTINGENT LIABILITIES                                          │
│ ┌────┬────────────────────────┬──────────┬────────┬───────────┐ │
│ │ #  │ Case / Liability       │ Amount   │ Prob.  │ Provision │ │
│ ├────┼────────────────────────┼──────────┼────────┼───────────┤ │
│ │ 1  │ Tax dispute FY18-19    │ ₹125 Cr  │ Medium │ ₹0 Cr      │ │
│ │ 2  │ Vendor arbitration     │ ₹45 Cr   │ High   │ ₹45 Cr     │ │
│ │ 3  │ Environmental notice   │ ₹15 Cr   │ Low    │ ₹0 Cr      │ │
│ │ 4  │ Employee litigation    │ ₹8 Cr    │ Medium │ ₹4 Cr      │ │
│ └────┴────────────────────────┴──────────┴────────┴───────────┘ │
│ Total Exposure: ₹193 Cr  │ Total Provided: ₹49 Cr  │ Net: ₹144 Cr │
├─────────────────────────────────────────────────────────────────┤
│ LEGAL CASES                                                     │
│ ┌────┬────────────────────────┬────────┬────────┬────────────┐ │
│ │ #  │ Case                   │ Court    │ Status │ Next Date │ │
│ ├────┼────────────────────────┼──────────┼────────┼───────────┤ │
│ │ 1  │ Tax Appeal FY18-19     │ HC       │ Hearing│ 2024-12-15│ │
│ │ 2  │ Vendor Contract Dispute│ Arbitral │ Evidence│ 2025-01-20│ │
│ └────┴────────────────────────┴──────────┴────────┴───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ REGULATORY NOTICES                                              │
│ ┌────┬────────────────────────┬──────────┬────────┬───────────┐ │
│ │ #  │ Notice                 │ Authority│ Status │ Deadline  │ │
│ ├────┼────────────────────────┼──────────┼────────┼───────────┤ │
│ │ 1  │ Show cause (Environment)│ SPCB    │ Reply  │ 2024-12-31│ │
│ └────┴────────────────────────┴──────────┴────────┴───────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Entry] [Import from Doc AI] [Export Schedule] [Link to Red Flags] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| contingent_liabilities | ContingentLiability[] | Manual / Doc AI |
| legal_cases | LegalCase[] | Manual / Doc AI |
| regulatory_notices | RegulatoryNotice[] | Manual / Doc AI |

### 3.2 Schema
```typescript
interface ContingentLiability {
  id: string;
  description: string;
  amount: number;  // ₹ Cr
  probability: 'High' | 'Medium' | 'Low';
  provision: number;  // ₹ Cr
  accountingStandard: 'IndAS 37';
  status: 'Open' | 'Provisioned' | 'Settled' | 'Dismissed';
  source: 'manual' | 'doc_ai';
}

interface LegalCase {
  id: string;
  title: string;
  court: string;
  status: 'Filed' | 'Hearing' | 'Evidence' | 'Arguments' | 'Reserved' | 'Judgment' | 'Appeal';
  nextHearingDate?: string;
  amountAtRisk?: number;
  source: 'manual' | 'doc_ai';
}

interface RegulatoryNotice {
  id: string;
  authority: string;
  description: string;
  status: 'Received' | 'Reply Filed' | 'Hearing' | 'Order Received' | 'Complied';
  deadline?: string;
  source: 'manual' | 'doc_ai';
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Red Flags:** Cross-references legal red flags
- **Financial Statements:** Contingent liability note
- **Risk Score Engine:** Feeds Governance/Legal risk
- **Document AI:** Auto-extract from legal notices, court orders

---

## 4. API Contract

```typescript
interface LegalChecksData {
  symbol: string;
  contingentLiabilities: ContingentLiability[];
  legalCases: LegalCase[];
  regulatoryNotices: RegulatoryNotice[];
  totals: {
    totalExposure: number;
    totalProvisioned: number;
    netExposure: number;
  };
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Three tabs: Contingent, Cases, Notices | Week 1 |
| 2 | Totals row with net exposure calc | Week 1 |
| 2 | Doc AI extraction (court orders, notices) | Week 2 |
| 3 | Red Flags cross-link, provision tracking | Week 2 |

---

## 6. Testing
- Net exposure calculation accuracy
- Provision vs exposure tracking
- Case status workflow
- Cross-link to Red Flags
- Doc AI extraction accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*