# Governance Risk Tool Specification

**Tool Name:** Governance Risk  
**Category:** Risk  
**Sheet:** Company Page → Risk  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Governance risk assessment: promoter pledge, board independence, auditor quality, related party transactions, whistleblower mechanism, shareholder rights. Auto-calculated from Management tab and forensic engines.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Governance Risk - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ GOVERNANCE SCORECARD                                            │
│ ┌────────────────────────┬────────┬────────────────────────────┐ │
│ │ Pillar                 │ Score  │ Assessment                 │ │
│ ├────────────────────────┼────────┼────────────────────────────┤ │
│ │ Promoter Pledge        │  6/10  │ 8% pledged, rising trend   │ │
│ │ Board Independence     │  8/10  │ 60% independent, diverse   │ │
│ │ Auditor Quality        │  7/10  │ Big 4, no qualifications   │ │
│ │ Related Party Trans.   │  5/10  │ Material RPTs, disclosures │ │
│ │ Whistleblower Mech.    │  8/10  │ Active, anonymous reporting│ │
│ │ Shareholder Rights     │  7/10  │ E-voting, postal ballot    │ │
│ ├────────────────────────┼────────┼────────────────────────────┤ │
│ │ TOTAL                  │ 68/100 │ Rating: MODERATE           │ │
│ └────────────────────────┴────────┴────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DETAIL: PROMOTER PLEDGE                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Current: 8.2%  │ Trend: ↗ 5%→8% (3Y)  │ Alert: >10% = 🔴   │ │
│ │ Top pledged: Entity A (4.2%), Entity B (3.1%)               │ │
│ │ Reason: Working capital loans, margin funding               │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DETAIL: RELATED PARTY TRANSACTIONS                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ FY24 RPT: ₹2,500 Cr (3.2% of Revenue)                       │ │
│ │ Top: Sales to Promoter Co. (₹1,200 Cr), Purchases (₹800 Cr) │ │
│ │ Terms: Arm's length certified, board approved               │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Link to Red Flags] [Link to Shareholding Pattern] [Link to Board Structure] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| governance_metrics | object | Auto from Management tab + engines |
| pledge_history | PledgePoint[] | Shareholding Pattern |
| rpt_history | RPTPoint[] | Financial Statements |

### 3.2 Auto-Calculated
All scores auto-calculated from Management tab data + forensic engines (Beneish, etc.).

---

## 4. Engine Integration

### 4.1 Links
- **Shareholding Pattern:** Pledge data
- **Red Flags:** Cross-references flags
- **Board Structure (SME tab):** Board independence data
- **Risk Score Engine:** Feeds Governance category

---

## 4. API Contract

```typescript
interface GovernanceRiskData {
  symbol: string;
  totalScore: number;
  rating: 'Strong' | 'Moderate' | 'Weak';
  pillars: {
    promoterPledge: { score: number; assessment: string };
    boardIndependence: { score: number; assessment: string };
    auditorQuality: { score: number; assessment: string };
    relatedPartyTransactions: { score: number; assessment: string };
    whistleblower: { score: number; assessment: string };
    shareholderRights: { score: number; assessment: string };
  };
  pledgeHistory: PledgePoint[];
  rptHistory: RPTPoint[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Scorecard with 6 pillars, detail modals | Week 1 |
| 2 | Pledge history chart, RPT trend | Week 1 |
| 2 | Cross-links to Shareholding, Red Flags, Board Structure | Week 2 |
| 3 | Auto-scoring from source data | Week 2 |

---

## 6. Testing
- Pledge trend chart accuracy
- RPT trend accuracy
- Cross-link navigation
- Auto-scoring formula validation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*