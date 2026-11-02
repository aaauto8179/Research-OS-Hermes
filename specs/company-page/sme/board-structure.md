# Board Structure Tool Specification

**Tool Name:** Board Structure  
**Category:** Corporate Governance  
**Sheet:** Company Page → SME → Corporate Governance  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Board structure analysis: directors with age, gender, education, qualifications, committee memberships, attendance, independence assessment, and diversity metrics. Dropdown to select diversification level (Low/Medium/High).

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Board Structure - [SYMBOL]                                      │
├─────────────────────────────────────────────────────────────────┤
│ DIVERSITY: [Medium ▼]  [Low] [Medium] [High]                    │
├─────────────────────────────────────────────────────────────────┤
│ BOARD MEMBERS                                                   │
│ ┌────┬────────────┬────┬────────────┬────────┬────────┬──────┐ │
│ │ #  │ Name       │ Age│ Education  │ Category│ Committees│ Ind│ │
│ ├────┼────────────┼────┼────────────┼────────┼────────┼──────┤ │
│ │ 1  │ Mr. A      │ 62 │ IIT/BSc    │ Chairman│ Audit,NRC│ Yes│ │
│ │ 2  │ Ms. B      │ 55 │ PhD        │ Indep.  │ Risk,CSR│ Yes │ │
│ │ 3  │ Mr. C      │ 58 │ MBA        │ Exec.   │ -       │ No   │ │
│ │ 4  │ Ms. D      │ 50 │ CA         │ Indep.  │ Audit   │ Yes  │ │
│ └────┴────────────┴────┴────────────┴────────┴────────┴──────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DIVERSITY METRICS                                               │
│ ┌──────────────────┬────────┬────────────────────────────────┐ │
│ │ Metric           │ Value  │ Assessment                     │ │
│ ├──────────────────┼────────┼────────────────────────────────┤ │
│ │ Independence     │ 60%    │ Good (3 of 5 independent)      │ │
│ │ Gender Diversity │ 20%    │ Low (1 of 5 women)             │ │
│ │ Age Diversity    │ 55 avg │ Moderate (range 50-62)         │ │
│ │ Skill Diversity  │ High   │ Finance, Tech, Legal, Ops      │ │
│ │ Tenure Diversity │ 8.2 yr │ Good (range 3-15 yrs)          │ │
│ └──────────────────┴────────┴────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ COMMITTEE COMPOSITION                                           │
│ ┌─────────────────┬────────────────────────────────────────────┐│
│ │ Audit Committee │ Ms. B (Chair), Mr. A, Ms. D                ││
│ │ NRC             │ Mr. A (Chair), Ms. B, Ms. D                ││
│ │ Risk Committee  │ Ms. B (Chair), Mr. C, Ms. D                ││
│ │ CSR Committee   │ Ms. D (Chair), Mr. A, Mr. C                ││
│ └─────────────────┴────────────────────────────────────────────┘│
│ [Import from Doc AI] [Link to Promoter Forensics] [Export CSV]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| directors | Director[] | Manual / Doc AI |
| committees | Committee[] | Manual / Doc AI |

### 3.2 Schema
```typescript
interface Director {
  id: string;
  name: string;
  age: number;
  education: string;
  category: 'Chairman' | 'Executive' | 'Independent' | 'Nominee';
  sinceYear: number;
  committees: string[];
  isIndependent: boolean;
  attendancePct: number;
  skills: string[];
}

interface Committee {
  name: string;
  chair: string;
  members: string[];
  meetingCount: number;
  avgAttendance: number;
}
```

### 3.3 Diversity Assessment Logic
```python
def assess_diversity(directors):
    independence = sum(d.isIndependent for d in directors) / len(directors)
    gender = sum(1 for d in directors if d.gender == 'Female') / len(directors)
    # ... other metrics
    if independence > 0.5 and gender > 0.2:
        return 'High'
    elif independence > 0.33:
        return 'Medium'
    else:
        return 'Low'
```

---

## 4. Engine Integration

### 4.1 Links
- **Promoter Forensics:** Board structure data
- **Management Compensation:** Links to directors
- **Governance Risk (Risk tab):** Feeds board independence score
- **Assess Auditor:** Auditor independence from board

---

## 4. API Contract

```typescript
interface BoardStructureData {
  symbol: string;
  directors: Director[];
  committees: Committee[];
  diversity: DiversityMetrics;
  diversificationLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

interface DiversityMetrics {
  independence: { value: number; assessment: string };
  gender: { value: number; assessment: string };
  age: { value: number; assessment: string };
  skills: { value: string; assessment: string };
  tenure: { value: number; assessment: string };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Directors table with diversity metrics | Week 1 |
| 2 | Committee composition, diversity dropdown | Week 1 |
| 2 | Doc AI import (CG report), diversity auto-assessment | Week 2 |
| 3 | Cross-links, CSV export | Week 2 |

---

## 6. Testing
- Diversity auto-assessment logic
- Committee composition accuracy
- Dropdown diversification level sync
- Doc AI extraction accuracy
- Cross-tab navigation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*