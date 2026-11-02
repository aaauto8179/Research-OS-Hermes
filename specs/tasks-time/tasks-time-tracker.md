# Tasks & Time Tracker Tool Specification

**Tool Name:** Tasks & Time Tracker  
**Sheet:** To - Do  
**Spec Version:** 1.0.0  
**Status:** ⏳ Not Started  
**Owner:** Frontend Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Kanban-based task manager with pomodoro timer, time tracking, analytics, and capacity planning. 8 views: Kanban, List, Calendar, Timeline, Analytics, Workload, Archive, Settings. CRDT sync for multi-user.

---

## 3. UI/UX Specification

### 3.1 Layout (Kanban View)
```
┌─────────────────────────────────────────────────────────────────┐
│ Tasks & Time Tracker                                            │
├─────────────────────────────────────────────────────────────────┤
│ VIEW: [Kanban ▼] [List] [Calendar] [Timeline] [Analytics] [Workload] [Archive] [Settings] │
├─────────────────────────────────────────────────────────────────┤
│ KANBAN BOARD                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│ │ Backlog (5) │ │ To Do (3)   │ │ In Progress │ │ Done (8)   │ │
│ ├─────────────┤ ├─────────────┤ ├─────────────┤ ├────────────┤ │
│ │ Research XYZ│ │ Q2 FY25 Model│ │ Draft Memo  │ │ Q3 Review  │ │
│ │ [2h] 🏷️Res  │ │ [4h] 🏷️Mod  │ │ [3h] 🏷️Wri │ │ [1h] 🏷️Rev│ │
│ │ ─────────── │ │ ─────────── │ │ ─────────── │ │ ────────── │ │
│ │ Factory Visit│ │ Concall Prep│ │ [Add Task]  │ │            │ │
│ │ [3h] 🏷️OG  │ │ [2h] 🏷️Prep│ │             │ │            │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ TASK DETAIL (on click)                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Title: Draft Investment Memo - RELIANCE                     │ │
│ │ Status: In Progress  │ Priority: High  │ Est: 3h  │ Actual: 2.5h │ │
│ │ Tags: 🏷️Writing  🏷️Research  🏷️Valuation                   │ │
│ │ Assignee: Me  │ Due: 2024-11-20  │ Created: 2024-11-10      │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ POMODORO TIMER                                              │ │
│ │ [25:00] [Start] [Pause] [Reset]  [Sessions: 2/4]           │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ SUBTASKS                                                    │ │
│ │ ☐ DCF Valuation  │ ☐ Relative Val │ ☐ Risks │ ☐ Formatting │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ TIME ENTRIES                                                │ │
│ │ 2024-11-15  10:00-11:30  (1.5h)  DCF Valuation             │ │
│ │ 2024-11-15  14:00-15:30  (1.5h)  Relative Valuation        │ │
│ │ [Add Time Entry] [Start Timer]                              │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ NOTES                                                       │ │
│ │ [Rich text: Key assumptions, sources, decisions...]         │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ANALYTICS (Weekly)                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Total Hours: 32h  │ Pomodoros: 28  │ Focus Score: 87%      │ │
│ │ By Tag: Research 12h | Writing 10h | Valuation 8h | Meetings 4h │ │
│ │ By Project: RELIANCE 15h | TCS 8h | Admin 5h | Other 4h     │ │
│ │ Capacity: 40h/week  │ Utilization: 80%  │ Overtime: 0h      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Pipeline

### 3.1 Task Schema
```typescript
interface Task {
  id: string;
  title: string;
  description: string;  // HTML
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tags: string[];
  assignee: string;
  dueDate?: string;
  estimatedHours: number;
  actualHours: number;
  pomodorosCompleted: number;
  pomodoroTarget: number;
  subtasks: Subtask[];
  timeEntries: TimeEntry[];
  notes: string;  // HTML
  linkedCompany?: string;  // Company symbol
  linkedDocument?: string;  // Document ID
  createdAt: string;
  updatedAt: string;
  version: number;  // for CRDT sync
}
```

### 3.2 Time Entry
```typescript
interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description: string;
  isPomodoro: boolean;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page:** Link tasks to companies (auto-suggest from Company Page)
- **Document AI:** Link tasks to documents
- **Concall Tracker:** Follow-up actions create tasks
- **Exit Checklist:** Triggered items create tasks
- **On-Ground Research:** Follow-up actions create tasks

---

## 4. API Contract

```typescript
interface TasksData {
  tasks: Task[];
  views: ViewConfig[];
  analytics: TimeAnalytics;
  settings: TaskSettings;
}

interface TimeAnalytics {
  totalHours: number;
  pomodoros: number;
  focusScore: number;
  byTag: { [tag: string]: number };
  byProject: { [project: string]: number };
  weeklyTrend: { week: string; hours: number }[];
  capacity: { hours: number; utilization: number };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Kanban board with drag-drop (dnd-kit), task CRUD | Week 1-2 |
| 2 | Pomodoro timer, time entries, subtasks | Week 2 |
| 2 | Rich text notes, subtasks, time entries | Week 2 |
| 3 | Analytics dashboard (charts), workload view | Week 3 |
| 3 | CRDT sync (Yjs), Calendar view, Timeline view | Week 3-4 |
| 4 | Cross-links (Company, Doc AI, Concall), Settings | Week 4 |

---

## 6. Testing
- Drag-drop between columns
- Pomodoro timer accuracy
- Time entry CRUD
- Analytics calculations
- CRDT sync (multi-user)
- Cross-link navigation

---

*Spec Version: 1.0.0 | Status: ⏳ Not Started*