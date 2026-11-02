# Management Background Tool Specification

**Tool Name:** Management Background  
**Category:** Management & Execution  
**Sheet:** Company Page → Management  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Table containing key details about the management team: names, roles, tenure, education, previous experience, compensation, and shareholding. Links to Concall Consistency for guidance tracking and Capital Allocation for decision quality.

### 1.2 Excel Source
| Field | Value |
|-------|-------|
| Sheet | Company Page |
| Category | Management & Execution |
| Tool | management Background |
| Description | A table containing key details about the management of the company |
| Data Source | Documents Upload, Document AI |
| Sample Link | https://drive.google.com/file/d/1oEYm9PvSag7MOPzt6qzUCh8NtFiQZYeQ/view |

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Management Background - [SYMBOL]                                │
├─────────────────────────────────────────────────────────────────┤
│ KEY PERSONNEL                                                   │
│ ┌────┬────────────┬──────────┬────────┬──────────┬────────┬────┐ │
│ │ #  │ Name       │ Role     │ Since  │ Education│ Prev Exp│Hold│ │
│ ├────┼────────────┼──────────┼────────┼──────────┼────────┼────┤ │
│ │ 1  │ Mr. A      │ CMD      │ 2005   │ IIT/BSc  │ 25 yrs │2.1%│ │
│ │ 2  │ Mr. B      │ CEO      │ 2018   │ IIM/MBA  │ 20 yrs │0.5%│ │
│ │ 3  │ Ms. C      │ CFO      │ 2020   │ CA/CFA   │ 15 yrs │0.2%│ │
│ │ 4  │ Mr. D      │ COO      │ 2019   │ BE/MBA   │ 18 yrs │0.1%│ │
│ └────┴────────────┴──────────┴────────┴──────────┴────────┴────┘ │
│ [Add Person] [Import from Doc AI] [Export CSV]                  │
├─────────────────────────────────────────────────────────────────┤
│ BOARD OF DIRECTORS                                              │
│ ┌────┬────────────┬────────────┬────────┬──────────┬────────┐  │
│ │ #  │ Name       │ Category   │ Since  │ Committees│Indep. │ │
│ ├────┼────────────┼────────────┼────────┼──────────┼────────┤  │
│ │ 1  │ Mr. E      │ Chairman   │ 2010   │ Audit, NRC │ Yes  │ │
│ │ 2  │ Ms. F      │ Independent│ 2015   │ Risk, CSR  │ Yes  │ │
│ └────┴────────────┴────────────┴────────┴──────────┴────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ KEY MANAGEMENT METRICS                                          │
│ ┌─────────────────┬──────────────┬────────────────────────────┐ │
│ │ Avg Tenure      │ 12.5 yrs     │ Industry avg: 8.2 yrs      │ │
│ │ Promoter Mgmt % │ 60%          │ 3 of 5 key roles           │ │
│ │ Avg Age         │ 54 yrs       │ Succession plan: Yes       │ │
│ │ Women in Mgmt   │ 20%          │ 1 of 5 key roles           │ │
│ └─────────────────┴──────────────┴────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Import from Doc AI] [Link to Concall Consistency] [Link to Capital Allocation] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Personnel Fields
| Field | Type | Source |
|-------|------|--------|
| Name | String | Manual / Doc AI |
| Role | Enum | Manual |
| Since | Year | Manual |
| Education | String | Doc AI |
| Previous Experience | Text | Doc AI |
| Shareholding % | Number | Annual Report |

### 3.3 Board Fields
| Field | Type | Source |
|-------|------|--------|
| Name | String | Manual |
| Category | Enum | Manual |
| Since | Year | Manual |
| Committees | Multi-select | Manual |
| Independent | Boolean | Manual |

---

## 4. Data Pipeline

### 4.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| personnel | Person[] | Manual / Doc AI |
| board | BoardMember[] | Manual / Doc AI |
| metrics | object | Auto-calculated |

### 4.2 Doc AI Extraction
- **Source:** Annual reports (Directors' Report, Corporate Governance Report)
- **Extractor:** `ManagementExtractor`
- **Fields:** Names, roles, tenure, education, experience, committee memberships, shareholdings
- **Confidence:** Per-field confidence scoring

---

## 4. Data Pipeline

### 4.1 API Contract

```typescript
interface ManagementBackgroundData {
  symbol: string;
  personnel: KeyPerson[];
  board: BoardMember[];
  metrics: {
    avgTenure: number;
    promoterMgmtPct: number;
    avgAge: number;
    womenPct: number;
    successionPlan: boolean;
  };
  lastUpdated: string;
}

interface KeyPerson {
  id: string;
  name: string;
  role: string;
  sinceYear: number;
  education: string;
  previousExperience: string;
  shareholdingPct: number;
  compensation?: number;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}

interface BoardMember {
  id: string;
  name: string;
  category: 'Promoter' | 'Executive' | 'Independent' | 'Nominee';
  sinceYear: number;
  committees: string[];
  isIndependent: boolean;
  source: 'manual' | 'doc_ai';
  confidence?: number;
}
```

---

## 6. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Personnel + Board tables with add/edit/delete | Week 1 |
| 2 | Doc AI import with confidence review | Week 2 |
| 3 | Auto-metrics calculation, cross-links | Week 2 |
| 3 | CSV export, PDF report | Week 2 |

---

## 7. Testing
- Table CRUD operations
- Doc AI extraction accuracy review
- Cross-link navigation (Concall Consistency, Capital Allocation)
- Auto-metrics accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*