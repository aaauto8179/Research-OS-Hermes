# Industry Regulations Tracker Tool Specification

**Tool Name:** Regulations  
**Category:** Industry Analysis  
**Sheet:** Industry page  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Tracker for regulatory changes affecting the industry: new acts, amendments, circulars, court orders. Tracks status (proposed/enacted/implemented), impact assessment, compliance deadline. Sources: Government gazettes, ministry websites, legal databases.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Industry Regulations Tracker - [INDUSTRY]                       │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS: [Status ▼] [Ministry ▼] [Impact ▼] [Date Range ▼]     │
├─────────────────────────────────────────────────────────────────┤
│ REGULATIONS TABLE                                               │
│ ┌────┬────────┬─────────────────────┬────────┬────────┬────────┐ │
│ │ #  │ Date   │ Regulation          │ Ministry│ Status │ Impact│ │
│ ├────┼────────┼─────────────────────┼────────┼────────┼────────┤ │
│ │ 1  │ 2024-11│ New Labour Code     │ Labour │ Enacted│ High  │ │
│ │ 2  │ 2024-10│ Env Clearance Norms │ MoEF   │ Draft  │ Med   │ │
│ │ 3  │ 2024-09│ GST Rate Change     │ Finance│ Prop.  │ Low   │ │
│ └────┴────────┴─────────────────────┴────────┴────────┴────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ REGULATION DETAIL (on click)                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Regulation: New Labour Code 2024                            │ │
│ │ Ministry: Labour & Employment  │ Date: 2024-11-15          │ │
│ │ Status: Enacted  │ Effective: 2025-04-01                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SUMMARY: Consolidates 29 labour laws into 4 codes...       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ IMPACT ON INDUSTRY:                                         │ │
│ │ • Compliance cost: +₹50Cr/yr for large firms               │ │
│ │ • Contract labour norms tightened                          │ │
│ │ • Overtime rules revised                                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ COMPLIANCE CHECKLIST:                                       │ │
│ │ ☐ Update contracts  ☐ Revise HR policies  ☐ Train staff   │ │
│ │ Deadline: 2025-03-31                                       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SOURCE: Gazette Notification  │ [🔗 Link]                  │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Auto-fetch from Gazette] [Alert on New] [Export] [Sync Calendar]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Sources & Frequency
| Source | Method | Frequency |
|--------|--------|-----------|
| Gazette of India | API/RSS | Daily |
| Ministry Websites | Scraper | Daily |
| PRS Legislative | API | Real-time |
| Legal DBs (Manupatra) | Manual/Alert | Weekly |

### 3.2 Data Model
```typescript
interface Regulation {
  id: string;
  industry: string;
  title: string;
  ministry: string;
  date: string;
  status: 'Proposed' | 'Draft' | 'Enacted' | 'Implemented' | 'Withdrawn';
  effectiveDate?: string;
  summary: string;
  impact: 'High' | 'Medium' | 'Low';
  impactDetails: string;
  complianceDeadline?: string;
  checklist: ChecklistItem[];
  sourceUrl: string;
  sourceType: 'gazette' | 'ministry' | 'court' | 'rbi' | 'sebi';
  tags: string[];
  lastUpdated: string;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Event Risk Monitor:** Regulations as risk events
- **Company Page (Risk/Governance):** Company-specific compliance
- **Document AI:** Extract regulation details from PDFs
- **Calendar:** Compliance deadline sync

---

## 4. API Contract

```typescript
interface RegulationsData {
  industry: string;
  regulations: Regulation[];
  stats: { proposed: number; enacted: number; highImpact: number };
  upcomingDeadlines: { regulation: string; deadline: string; daysLeft: number }[];
  lastUpdated: string;
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Regulations table, detail modal, status workflow | Week 1 |
| 2 | Auto-fetch from Gazette/Ministry APIs, RSS | Week 1-2 |
| 2 | Impact assessment framework, checklist generator | Week 2 |
| 3 | Alert system, calendar sync, export | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Auto-fetch | New regulations appear within 24h |
| Status workflow | Proposed→Draft→Enacted→Implemented |
| Impact scoring | Consistent with risk matrix |
| Calendar sync | Deadlines appear in Google/Outlook |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*