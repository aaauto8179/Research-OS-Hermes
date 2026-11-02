# Time Tracker Tool Specification

**Tool Name:** Time Tracker  
**Category:** Productivity  
**Sheet:** To - Do  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Time tracking for tasks and projects: manual entry, timer (start/stop), weekly/monthly reports, targets vs actuals, utilization rates. Integrates with Todo Tracker (Kanban) for seamless task + time management.

---

## 3. UI/UX Specification

### 3.1 Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Time Tracker                                                    │
├─────────────────────────────────────────────────────────────────┤
│ TIMER (Active)                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Task: RELIANCE Q2 Analysis  │ Project: Company Research    │ │
│ │ ⏱ 02:34:12  │ [▶ Start] [⏸ Pause] [■ Stop] [🏷 Switch]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ WEEKLY VIEW                                                     │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┬────┐ │
│ │ Day│ Mon    │ Tue    │ Wed    │ Thu    │ Fri    │ Sat  │ Sun│ │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┼────┤ │
│ │ Hrs│ 6.5    │ 7.0    │ 5.5    │ 8.0    │ 4.0    │ 0    │ 0  │ │
│ │ Tgt│ 7.0    │ 7.0    │ 7.0    │ 7.0    │ 7.0    │ 0    │ 0  │ │
│ │ %  │ 93%    │ 100%   │ 79%    │ 114%   │ 57%    │ -    │ -  │ │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┴────┘ │
│ Weekly: 31.0h / 35.0h (89%)  │ Monthly: 142h / 160h (89%)       │
├─────────────────────────────────────────────────────────────────┤
│ TIME ENTRIES                                                    │
│ ┌────┬────────┬────────┬────────┬────────┬────────┬────────┐   │
│ │ #  │ Date   │ Task   │ Project│ Start  │ End    │ Dur. │   │
│ ├────┼────────┼────────┼────────┼────────┼────────┼────────┤   │
│ │ 1  │ 11/04  │ REL Q2 │ Research│ 09:00 │ 11:30 | 2.5h │   │
│ │ 2  │ 11/04  │ TCS Val│ Valuat. │ 14:00 │ 16:30 | 2.5h │   │
│ │ 3  │ 11/04  │ Admin  │ Internal│ 16:30 │ 17:00 | 0.5h │   │
│ └────┴────────┴────────┴────────┴────────┴────────┴────────┘   │
│ [+ Manual Entry] [Import from Calendar] [Export Report]        │
├─────────────────────────────────────────────────────────────────┤
│ ANALYTICS                                                       │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Utilization: 89%  │ Billable: 78%  │ Internal: 22%         │ │
│ │ Top Projects: Research (45%), Valuation (30%), Admin (15%) │ │
│ │ [Charts: Daily, Weekly, Monthly, By Project, By Category]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Data Model
```typescript
interface TimeEntry {
  id: string;
  taskId?: string;        // Link to Todo Tracker
  projectId?: string;     // Link to GRWTH/Project
  project: string;        // e.g., "Research", "Valuation", "Admin"
  category: 'billable' | 'internal' | 'learning' | 'admin';
  startTime: string;      // ISO datetime
  endTime: string;
  durationMinutes: number;
  description: string;
  source: 'manual' | 'timer' | 'calendar_import';
  createdAt: string;
}

interface TimeTarget {
  period: 'weekly' | 'monthly';
  targetHours: number;
  billableTargetPct: number;  // % of hours that should be billable
}

interface TimeAnalytics {
  period: string;
  totalHours: number;
  targetHours: number;
  utilization: number;        // total / target
  billableHours: number;
  billablePct: number;
  byProject: { project: string; hours: number; pct: number }[];
  byCategory: { category: string; hours: number }[];
  dailyBreakdown: { date: string; hours: number }[];
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Todo Tracker (Kanban):** Start timer from task, auto-link
- **GRWTH Pipeline:** Track time on capex projects
- **Calendar:** Import from Google/Outlook
- **Analytics Dashboard:** Utilization reports
- **Capacity Planning:** Team availability

---

## 4. API Contract

```typescript
interface TimeTrackerData {
  activeTimer: TimeEntry | null;
  entries: TimeEntry[];
  targets: TimeTarget;
  analytics: TimeAnalytics;
  projects: string[];
  categories: string[];
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Timer (start/pause/stop), manual entry, project/category | Week 1 |
| 2 | Weekly/monthly views, targets, calendar import | Week 1 |
| 2 | Analytics charts (daily, weekly, by project/category) | Week 2 |
| 3 | Todo Tracker integration, export, reports | Week 2 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Timer accuracy | <1s drift over 1h |
| Manual entry | Validates start < end |
| Calendar import | Matches events |
| Utilization calc | total/target * 100 |
| Billable % | billable/total * 100 |
| Export | CSV with all fields |

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started | Priority: HIGH*