# Promoter & Governance Forensics Tool Specification

**Tool Name:** Promoter & Governance Forensics  
**Category:** SME Forensics  
**Sheet:** Company Page → SME  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Deep forensic analysis of promoter and governance: board structure, compensation analysis, auditor assessment, related party transactions, promoter group structure, succession planning. Links to Governance Risk (Risk tab) and Board Structure (Corporate Governance).

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Promoter & Governance Forensics - [SYMBOL]                      │
├─────────────────────────────────────────────────────────────────┤
│ PROMOTER GROUP STRUCTURE                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Org Chart: Promoter → Holding Co → Subsidiaries → JVs]    │ │
│ │ Key: █ Promoter  █ Holding  █ Subsidiary  █ JV             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ BOARD STRUCTURE                                                 │
│ ┌────┬────────────┬────────────┬────────┬─────────┬────────┐  │
│ │ #  │ Name       │ Category   │ Since  │ Committees│ Indep.│ │
│ ├────┼────────────┼────────────┼────────┼─────────┼────────┤  │
│ │ 1  │ Mr. A      │ Chairman   │ 2010   │ Audit, NRC│ Yes   │ │
│ │ 2  │ Ms. B      │ Independent│ 2015   │ Risk, CSR │ Yes   │ │
│ │ 3  │ Mr. C      │ Executive  │ 2018   │ -         │ No    │ │
│ └────┴────────────┴────────────┴────────┴─────────┴────────┘  │
│ Independence: 60%  │ Avg Tenure: 8.2 yrs  │ Women: 20%         │
├─────────────────────────────────────────────────────────────────┤
│ MANAGEMENT COMPENSATION                                         │
│ ┌────┬────────────┬────────┬────────┬────────┬────────┬───────┐│
│ │ #  │ Name       │ Role   │ Fixed  │ Variable│ Total │ x Med││
│ ├────┼────────────┼────────┼────────┼────────┼────────┼───────┤│
│ │ 1  │ Mr. A      │ CMD    │ 5 Cr   │ 8 Cr    │ 13 Cr │ 45x  ││
│ │ 2  │ Mr. B      │ CEO    │ 3 Cr   │ 5 Cr    │ 8 Cr  │ 28x  ││
│ └────┴────────────┴────────┴────────┴────────┴────────┴───────┘│
│ Median Employee: ₹2.9L  │  CEO/Median: 45x  │ Industry Avg: 35x│
├─────────────────────────────────────────────────────────────────┤
│ AUDITOR ASSESSMENT                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Auditor: [Big 4 Firm]  │ Tenure: 8 yrs  │ Rotation: Due 2026│ │
│ │ Fees: Audit ₹2.5Cr, Non-audit ₹0.3Cr (11%)                   │ │
│ │ Qualifications: None  │ Peer Review: Clean                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ RELATED PARTY TRANSACTIONS                                      │
│ ┌────┬────────────────────────┬────────┬────────┬────────────┐│
│ │ #  │ Party                  │ Type   │ Amount │ Terms      ││
│ ├────┼────────────────────────┼────────┼────────┼────────────┤│
│ │ 1  │ Promoter Group Co.     │ Sales  │ ₹1,200Cr│ Arm's len. ││
│ │ 2  │ Promoter Group Co.     │ Purch. │ ₹800 Cr │ Arm's len. ││
│ └────┴────────────────────────┴────────┴────────┴────────────┘│
├─────────────────────────────────────────────────────────────────┤
│ [Import from Doc AI] [Link to Governance Risk] [Link to Board Structure] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| promoter_structure | OrgNode[] | Manual / Doc AI |
| board | BoardMember[] | Manual / Doc AI |
| compensation | Compensation[] | Annual Report / Doc AI |
| auditor | AuditorInfo | Annual Report |
| rpt | RPTEntry[] | Financial Statements / Doc AI |

### 3.2 Doc AI Extraction
- **Source:** Annual reports (Corporate Governance Report, Directors' Report, RPT notes)
- **Extractor:** `PromoterForensicsExtractor`
- **Output:** Structured promoter group, board, compensation, RPT data

---

## 4. Engine Integration

### 4.1 Links
- **Governance Risk (Risk tab):** Auto-feeds board independence, auditor, RPT scores
- **Board Structure (Corporate Governance):** Detailed board view
- **Red Flags:** Cross-references RPT, auditor, pledge flags

---

## 4. API Contract

```typescript
interface PromoterForensicsData {
  symbol: string;
  promoterStructure: OrgNode[];
  board: BoardMember[];
  compensation: CompensationEntry[];
  auditor: AuditorInfo;
  rpt: RPTEntry[];
  lastUpdated: string;
}

interface OrgNode {
  id: string;
  name: string;
  type: 'Promoter' | 'Holding' | 'Subsidiary' | 'JV' | 'Associate';
  ownership: number;
  children: OrgNode[];
}

interface CompensationEntry {
  name: string;
  role: string;
  fixed: number;
  variable: number;
  total: number;
  xMedian: number;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Org chart (react-d3-tree or custom), board table | Week 1-2 |
| 2 | Compensation table with x-median calc | Week 1 |
| 2 | Auditor info, RPT table | Week 2 |
| 3 | Org chart renderer, Doc AI import, cross-links | Week 2 |

---

## 6. Testing
- Org chart rendering (50+ nodes)
- Compensation x-median calculation
- RPT arm's length flagging
- Cross-link navigation
- Doc AI extraction accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*