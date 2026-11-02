# Assess Auditor Tool Specification

**Tool Name:** Assess Auditor  
**Category:** Corporate Governance  
**Sheet:** Company Page → SME → Corporate Governance  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Auditor assessment: firm name, tenure, rotation status, fees (audit vs non-audit), qualifications, peer review status, resignation history, and independence assessment.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Assess Auditor - [SYMBOL]                                       │
├─────────────────────────────────────────────────────────────────┤
│ AUDITOR PROFILE                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Firm: [Big 4 Firm Name]                                     │ │
│ │ Tenure: 8 years (since FY16)                                │ │
│ │ Rotation Due: FY2026 (10-year limit)                        │ │
│ │ Lead Partner: [Name], Tenure: 3 years                       │ │
│ │ Peer Review: Clean (ICAI 2023)                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ FEE STRUCTURE                                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ FY24:  Audit ₹2.5 Cr  │ Non-Audit ₹0.3 Cr (11%)             │ │
│ │ FY23:  Audit ₹2.3 Cr  │ Non-Audit ₹0.2 Cr (9%)              │ │
│ │ FY22:  Audit ₹2.1 Cr  │ Non-Audit ₹0.1 Cr (5%)              │ │
│ │ Trend: Non-audit % rising (5% → 11% in 3 years) ⚠️        │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ QUALIFICATIONS & PEER REVIEW                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Qualifications (Last 3 Years): None                          │ │
│ │ Emphasis of Matter: None                                     │ │
│ │ Peer Review (ICAI): Clean (2023)                            │ │
│ │ Regulatory Actions: None                                     │ │
│ │ Resignation History: None (Stable since FY16)               │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ INDEPENDENCE ASSESSMENT                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Non-Audit Fee %: 11% (FY24) │ Threshold: <20% ✅           │ │
│ │ Tenure: 8 years │ Rotation Due: FY2026 (10-yr limit)       │ │
│ │ Non-Audit Services: Tax advisory, certifications           │ │
│ │ Partner Rotation: Due FY2026 (5-yr limit)                   │ │
│ │ Independence Score: 85/100  │ Rating: GOOD                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Import from Doc AI] [Link to Promoter Forensics] [Export PDF]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| auditor | AuditorInfo | Manual / Doc AI |
| fee_history | FeeEntry[] | Annual Report / Doc AI |
| peer_review | PeerReview | ICAI / Doc AI |

### 3.2 Schema
```typescript
interface AuditorInfo {
  firmName: string;
  tenureYears: number;
  rotationDueYear: number;
  leadPartner: string;
  partnerTenureYears: number;
  peerReviewStatus: 'Clean' | 'Qualified' | 'Adverse';
  peerReviewYear: number;
  regulatoryActions: string[];
  resignationHistory: Resignation[];
}

interface FeeEntry {
  year: string;
  auditFee: number;
  nonAuditFee: number;
  nonAuditPct: number;
  nonAuditServices: string[];
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Promoter Forensics:** Auditor assessment
- **Governance Risk (Risk tab):** Feeds auditor quality score
- **Financial Statements:** Audit fees from notes

---

## 4. API Contract

```typescript
interface AssessAuditorData {
  symbol: string;
  auditor: AuditorInfo;
  feeHistory: FeeEntry[];
  peerReview: PeerReview;
  independenceScore: number;
  independenceRating: 'Good' | 'Moderate' | 'Weak';
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Auditor profile, fee history table with trend | Week 1 |
| 2 | Qualifications, peer review, independence scorecard | Week 1 |
| 2 | Doc AI import (annual report auditor section) | Week 2 |
| 3 | Cross-links to Promoter Forensics, Governance Risk | Week 2 |

---

## 6. Testing
- Non-audit fee % trend calculation
- Rotation due date calculation
- Independence scorecard logic
- Doc AI extraction accuracy
- Cross-tab navigation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*