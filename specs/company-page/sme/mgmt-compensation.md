# Management Compensation & Benefits Tool Specification

**Tool Name:** Management Compensation & Benefits  
**Category:** Corporate Governance  
**Sheet:** Company Page → SME → Corporate Governance  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Detailed table of management compensation: names, roles, fixed pay, variable pay, total, and multiples of median employee salary. Tracks year-over-year changes, peer comparison, and alignment with performance.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Management Compensation & Benefits - [SYMBOL]                   │
├─────────────────────────────────────────────────────────────────┤
│ PERIOD: [FY24 ▼]  [Compare YoY ▼]                               │
├─────────────────────────────────────────────────────────────────┤
│ COMPENSATION TABLE                                              │
│ ┌────┬────────────┬────────┬────────┬────────┬────────┬───────┐│
│ │ #  │ Name       │ Role   │ Fixed  │ Variable│ Total │ x Med││
│ ├────┼────────────┼────────┼────────┼────────┼────────┼───────┤│
│ │ 1  │ Mr. A      │ CMD    │ 5.0 Cr │ 8.0 Cr  │ 13 Cr │ 45x  ││
│ │ 2  │ Mr. B      │ CEO    │ 3.0 Cr │ 5.0 Cr  │ 8 Cr  │ 28x  ││
│ │ 3  │ Ms. C      │ CFO    │ 2.5 Cr │ 3.5 Cr  │ 6 Cr  │ 21x  ││
│ │ 4  │ Mr. D      │ COO    │ 2.0 Cr │ 3.0 Cr  │ 5 Cr  │ 17x  ││
│ └────┴────────────┴────────┴────────┴────────┴────────┴───────┘│
│ Median Employee: ₹2.9L  │  CEO/Median: 45x  │ Industry Avg: 35x│
├─────────────────────────────────────────────────────────────────┤
│ YOY CHANGES                                                     │
│ ┌────────────┬────────┬────────┬────────┬────────┬────────┐    │
│ │ Name       │ FY23   │ FY24   │ Change │ % Chg  │ Perf.  │    │
│ ├────────────┼────────┼────────┼────────┼────────┼────────┤    │
│ │ Mr. A      │ 11 Cr  │ 13 Cr  │ +2 Cr  │ +18%   │ Met    │    │
│ │ Mr. B      │ 7 Cr   │ 8 Cr   │ +1 Cr  │ +14%   │ Beat   │    │
│ └────────────┴────────┴────────┴────────┴────────┴────────┘    │
├─────────────────────────────────────────────────────────────────┤
│ BENEFITS & PERQUISITES                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ESOPs: 50,000 shares (vesting 4yr)  │ Car: Provided        │ │
│ │ Housing: ₹50L/yr                     │ Medical: Family      │ │
│ │ Club Membership: 2 clubs            │ Travel: Business     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Add Entry] [Import from Doc AI] [Link to Board Structure] [Export CSV] │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Input Data
| Field | Type | Source |
|-------|------|--------|
| compensation | CompensationEntry[] | Manual / Doc AI |
| benefits | Benefits[] | Manual / Doc AI |

### 3.2 Schema
```typescript
interface CompensationEntry {
  id: string;
  name: string;
  role: string;
  fixed: number;
  variable: number;
  total: number;
  xMedian: number;
  year: string;
  performanceRating: 'Met' | 'Beat' | 'Missed';
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Board Structure:** Links to board members
- **Promoter Forensics:** Compensation table
- **Capital Allocation:** Compensation as % of profit

---

## 4. API Contract

```typescript
interface ManagementCompensationData {
  symbol: string;
  year: string;
  entries: CompensationEntry[];
  medianEmployeeSalary: number;
  ceoToMedianRatio: number;
  industryAvgRatio: number;
  benefits: Benefit[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Compensation table with x-median calculation | Week 1 |
| 2 | YoY comparison, benefits section | Week 1 |
| 2 | Doc AI import (annual report compensation table) | Week 2 |
| 3 | Cross-link to Board Structure, CSV export | Week 2 |

---

## 6. Testing
- x-median calculation accuracy
- YoY % change calculation
- Cross-link to Board Structure
- Doc AI extraction accuracy

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*