# Todo Tracker Tool Specification

**Tool Name:** Todo Tracker  
**Category:** Productivity  
**Sheet:** To - Do  
**Spec Version:** 1.0.0  
**Status:** ✅ Partially Implemented (Backend 80%, Frontend 60%)  
**Owner:** Full Stack Team  
**Last Updated:** 2025-10-31

---

## 1. Purpose & Scope

### 1.1 What this tool does
Kanban + Pomodoro + Time Analytics + Capacity Planning. 8 views: Kanban, Calendar, List, Gantt, Analytics, Pomodoro, Capacity, Settings. CRDT-based sync for offline-first. Integrates with Company Page (tasks per company), GRWTH (project tasks), Portfolio (rebalance tasks).

---

## 3. UI/UX Specification

### 3.1 Layout (8 Views)
```
┌─────────────────────────────────────────────────────────────────┐
│ Todo Tracker                                                    │
├─────────────────────────────────────────────────────────────────┤
│ VIEWS: [Kanban ▼] [Calendar] [List] [Gantt] [Analytics]        │
│        [Pomodoro] [Capacity] [Settings]                         │
├─────────────────────────────────────────────────────────────────┤
│ VIEW: KANBAN                                                    │
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┐       │
│ │ Backlog  │ Ready    │ In Prog  │ Review   │ Done     │       │
│ │ (12)     │ (5)      │ (3)      │ (2)      │ (45)     │       │
│ ├──────────┼──────────┼──────────┼──────────┼──────────┤       │
│ │ Task A   │ Task B   │ Task C   │ Task D   │ Task E   │       │
│ │ 🏷️ REL   │ 🏷️ TCS   │ 🏷️ Portfolio│ 🏷️ GRWTH │ 🏷️ REL  │       │
│ │ ⏱️ 2h    │ ⏱️ 1h    │ ⏱️ 4h    │ ⏱️ 1h    │ ✅       │       │
│ │ 🔴 High  │ 🟡 Med   │ 🔴 High  │ 🟢 Low   │          │       │
│ └──────────┴──────────┴──────────┴──────────┴──────────┘       │
│ [Drag-drop between columns] [Click for detail]                  │
├─────────────────────────────────────────────────────────────────┤
│ VIEW: CALENDAR                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ November 2024                                               │ │
│ │ Mon Tue Wed Thu Fri Sat Sun                                 │ │
│ │     1   2   3   4   5   6   7                               │ │
│ │  8  9  10  11  12  13  14  ← Tasks on days                  │ │
│ │ 15 16 17  18  19  20  21                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ VIEW: POMODORO                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Task: RELIANCE Q2 Analysis     │ [▶ Start] [⏸ Pause]       │ │
│ │ 🍅 25:00  │ Sessions: 3/4  │ Break: 5min  │ Long: 15min    │ │
│ │ [Auto-break] [Sound] [Stats]  │                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ VIEW: ANALYTICS                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Velocity: 23 pts/week  │ Cycle Time: 2.3 days              │ │
│ │ Throughput: 18 tasks/wk │ WIP Limit: 5                    │ │
│ │ Focus Time: 14h/week   │ Interruptions: 12/day            │ │
│ │ [Charts: Velocity, Cycle Time, Focus, Interruptions]       │ │
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
  description: string;
  status: 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];  // company symbols, 'portfolio', 'grwth', 'personal'
  assignee: string;
  storyPoints: number;
  estimatedHours: number;
  actualHours: number;
  pomodoroSessions: number;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  linkedTo: {
    company?: string;  // symbol
    portfolio?: string;
    grwthProject?: string;
  };
  dependencies: string[];  // task IDs
  createdAt: string;
  updatedAt: string;
  crdtVersion: number;  // For CRDT sync
}
```

### 3.2 CRDT Sync
```typescript
// Yjs-based CRDT for offline-first sync
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

const ydoc = new Y.Doc();
const ytasks = ydoc.getMap('tasks');
const provider = new WebrtcProvider('todo-tracker-room', ydoc);

// Each task is a Y.Map with CRDT properties
function taskToYMap(task: Task): Y.Map<any> {
  const ymap = new Y.Map();
  Object.entries(task).forEach(([k, v]) => ymap.set(k, v));
  return ymap;
}
```

---

## 4. Engine Integration

### 4.1 Links
- **Company Page (Tasks tab):** Company-specific tasks
- **GRWTH Pipeline:** Project tasks
- **Portfolio Management:** Rebalance, review tasks
- **Calendar:** Due dates, recurring tasks
- **Notifications:** Due reminders, overdue alerts

---

## 4. API Contract

```typescript
interface TodoTrackerData {
  tasks: Task[];
  views: {
    kanban: KanbanColumn[];
    calendar: CalendarEvent[];
    list: Task[];
    gantt: GanttBar[];
    analytics: AnalyticsData;
    pomodoro: PomodoroState;
    capacity: CapacityData;
  };
  sync: {
    lastSynced: string;
    pendingChanges: number;
    conflicts: Conflict[];
  };
}
```

---

## 5. Implementation Plan

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1 | Task schema, Kanban (react-beautiful-dnd), CRDT setup | Week 1 |
| 2 | Calendar view, List view, Gantt view | Week 1-2 |
| 2 | Pomodoro timer, Analytics dashboard | Week 2 |
| 3 | Capacity planning, CRDT conflict resolution | Week 3 |
| 3 | Company Page integration, notifications | Week 3 |

---

## 5. Testing

| Test | Expected |
|------|----------|
| Kanban drag-drop | Status updates persist |
| CRDT sync | Offline edits merge correctly |
| Pomodoro timer | Accurate 25/5 intervals |
| Analytics | Velocity, cycle time correct |
| Calendar | Tasks appear on due dates |

---

*Spec Version: 1.0.0 | Status: ✅ Partially Implemented | Priority: HIGH*