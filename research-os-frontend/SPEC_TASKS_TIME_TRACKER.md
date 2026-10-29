# Research OS - Tasks & Time Tracker Specification

## Overview
A research operations management tool for tracking analyst workflows, time allocation, and productivity. Built for equity research teams who need to measure where time goes and optimize research processes.

## Purpose
- Track research tasks from idea to publication
- Measure time allocation across research activities
- Identify bottlenecks and optimize workflows
- Generate productivity reports for performance reviews
- Enable capacity planning for research teams

## Data Model

### Task
```typescript
interface ResearchTask {
  id: string;                          // UUID
  title: string;                       // "Q1 FY25 Earnings Analysis - RELIANCE"
  description: string;                 // Detailed scope
  
  // Classification
  stage: TaskStage;                    // Where in research process
  category: TaskCategory;              // Type of work
  priority: 1 | 2 | 3 | 4;             // P1=Critical, P2=High, P3=Medium, P4=Low
  
  // Ownership
  assignee: string;                    // Analyst ID/name
  reviewer?: string;                   // Reviewer ID/name
  collaborators: string[];             // Other analysts
  
  // Related entities
  related_company?: string;            // Symbol (e.g., "RELIANCE")
  related_industry?: string;           // Industry code
  related_document_ids?: string[];     // Document references
  
  // Time tracking
  estimated_hours: Decimal;
  actual_hours: Decimal;
  time_entries: TimeEntry[];
  
  // Scheduling
  status: TaskStatus;
  due_date: Date;
  start_date?: Date;
  completed_date?: Date;
  
  // Tags for filtering
  tags: string[];                      // ["EARNINGS", "O2C", "JIO", "VALUATION"]
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

type TaskStage = 
  | "GENERATE"       // Idea generation, screening
  | "RESEARCH"       // Deep dive, data gathering
  | "ANALYZE"        // Financial modeling, valuation
  | "WEIGH"          // Decision framework, conviction
  | "DOCUMENT"       // Writing memo, reports
  | "REVIEW"         // Peer/senior review
  | "PUBLISH"        // Final memo, presentation
  | "TRACK"          // Post-publication monitoring
  | "ADMIN";         // Meetings, training, other

type TaskCategory = 
  | "10K_READING"           // Annual report reading
  | "QUARTERLY_RESULTS"     // Earnings analysis
  | "VALUATION_MODELING"    // DCF, relative, SOTP
  | "CONCALL_REVIEW"        // Transcript analysis
  | "PRIMARY_RESEARCH"      // Channel checks, expert calls
  | "MANAGEMENT_MEETING"    // Company meetings
  | "MONITORING"            // Existing position tracking
  | "PORTFOLIO_REVIEW"      // Portfolio-level review
  | "RISK_ANALYSIS"         # Risk scoring, forensics
  | "REPORT_WRITING"        # Memo, note, presentation
  | "ADMIN_OTHER";          # Meetings, training, admin

type TaskStatus = 
  | "TODO"           // Not started
  | "IN_PROGRESS"    // Actively working
  | "BLOCKED"        // Waiting on dependency
  | "REVIEW"         // Submitted for review
  | "DONE"           // Completed
  | "CANCELLED";     // Cancelled
```

### Time Entry
```typescript
interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: Date;
  end_time: Date;
  duration_minutes: number;
  category: TimeCategory;           // What type of work
  notes: string;                    // What was done
  is_billable: boolean;             // For client work
  auto_tracked: boolean;            // Timer vs manual
}

type TimeCategory = 
  | "10K_READING"
  | "QUARTERLY_RESULTS"
  | "VALUATION_MODELING"
  | "CONCALL_REVIEW"
  | "PRIMARY_RESEARCH"
  | "MANAGEMENT_MEETING"
  | "MONITORING"
  | "PORTFOLIO_REVIEW"
  | "RISK_ANALYSIS"
  | "REPORT_WRITING"
  | "MEETINGS"
  | "ADMIN_OTHER"
  | "TRAINING"
  | "BREAK";
```

### User Preferences
```typescript
interface UserPreferences {
  user_id: string;
  default_task_hours: number;       // Default estimate (e.g., 8)
  workday_start: string;            // "09:00"
  workday_end: string;              // "18:00"
  timezone: string;                 // "Asia/Kolkata"
  auto_break_minutes: number;       // Auto-break after X minutes
  pomodoro_minutes: number;         // Default pomodoro length
  weekly_hours_target: number;      // e.g., 40
  notification_prefs: {
    due_soon: boolean;
    overdue: boolean;
    daily_summary: boolean;
    weekly_report: boolean;
  };
}
```

## Views

### 1. Kanban Board (Default)
```
TODO → IN_PROGRESS → REVIEW → DONE
```
- Drag-drop between columns
- Color-coded by priority (P1=red, P2=orange, P3=blue, P4=gray)
- Progress bar on cards (actual/estimated hours)
- Overdue indicator (red clock icon)
- Quick actions: start timer, mark done, assign

### 2. List View
- Sortable table (title, company, status, priority, assignee, due date, hours)
- Multi-select for bulk actions
- Inline editing for key fields
- Export to CSV

### 3. Analytics Dashboard
- **Time Allocation by Category** - Stacked bar chart
- **Assignee Workload** - Hours by person, efficiency %
- **Weekly Time Trend** - Mon-Sun bars
- **Priority Distribution** - P1-P4 breakdown
- **Stage Funnel** - Tasks by stage, conversion rates
- **Efficiency Metrics** - Actual vs Estimated, on-time completion

## Timer System

### Pomodoro Timer
```typescript
interface TimerState {
  is_running: boolean;
  mode: "pomodoro" | "short_break" | "long_break";
  remaining_seconds: number;
  task_id?: string;
  session_count: number;        // Pomodoros in current cycle
}

const TIMER_CONFIG = {
  pomodoro_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  long_break_interval: 4,       // Every 4 pomodoros
};
```

### Auto-Tracking
- Start timer → creates TimeEntry with auto_tracked=true
- Stop timer → completes entry, updates task.actual_hours
- Idle detection (5 min no input) → pauses timer
- Background tab → continues counting

### Manual Entry
- Quick add: task, date, hours, category, notes
- Bulk entry for past days
- Import from calendar (future)

## Workflow Integration

### Research Workflow Stages
```
GENERATE (Screening) 
  → RESEARCH (10K, concalls, primary)
  → ANALYZE (Valuation, risk)
  → WEIGH (Conviction, sizing)
  → DOCUMENT (Memo writing)
  → REVIEW (Peer/senior review)
  → PUBLISH (Final memo)
  → TRACK (Monitor position)
```

### Stage Transitions
- Automatic: Timer start on TODO → IN_PROGRESS
- Manual: Drag-drop or status dropdown
- Required: REVIEW needs reviewer assigned
- Blocked: Can set blocker reason, auto-notify assignee

### Review Workflow
1. Analyst moves task to REVIEW
2. System notifies reviewer
3. Reviewer: Approve / Request Changes / Reject
4. If changes: back to IN_PROGRESS with comments
5. If approve: → DONE, logs completion time

## Productivity Metrics

### Individual
```typescript
interface AnalystMetrics {
  user_id: string;
  period: { start: Date; end: Date };
  
  // Time
  total_hours: Decimal;
  billable_hours: Decimal;
  research_hours: Decimal;      // Core research categories
  admin_hours: Decimal;         // Meetings, admin
  
  // Output
  tasks_completed: number;
  tasks_on_time: number;        // Completed by due date
  avg_completion_time: Decimal; // Days from start to done
  
  // Quality
  review_pass_rate: Decimal;    // First-pass approval %
  revision_rate: Decimal;       // % needing changes
  
  // Focus
  avg_pomodoros_per_day: number;
  longest_focus_session: number; // Minutes
  context_switches: number;      // Task switches per day
  
  // Efficiency
  estimation_accuracy: Decimal; // actual/estimated hours
  on_time_rate: Decimal;        // % tasks done by due date
}
```

### Team
```typescript
interface TeamMetrics {
  period: { start: Date; end: Date };
  total_hours: Decimal;
  avg_hours_per_analyst: Decimal;
  tasks_completed: number;
  avg_completion_time: Decimal;
  bottleneck_stages: StageBottleneck[];  // Where tasks stall
  capacity_utilization: Decimal;         // % of available hours used
}
```

## Capacity Planning

### Workload Visualization
- Per-analyst weekly hours (bar chart)
- Upcoming due dates (calendar view)
- Stage distribution (pie chart)
- Skill tags for task routing

### Forecasting
```typescript
interface CapacityForecast {
  analyst_id: string;
  week_start: Date;
  available_hours: Decimal;       // Based on workday prefs
  committed_hours: Decimal;       // Tasks due this week
  buffer_hours: Decimal;          // Available - committed
  risk_level: "GREEN" | "YELLOW" | "RED";
}
```

## Notifications

### Triggers
- Task due in 24h → in-app + email
- Task overdue → in-app + email + Slack (if configured)
- Task assigned → in-app
- Review requested → in-app + email
- Review completed → in-app (to author)
- Daily summary (8 AM) → email
- Weekly report (Monday 9 AM) → email

### In-App Notification Center
- Bell icon with count
- Filter: unread, all, mentions, reviews
- Mark read, archive, snooze

## UI Components

### TaskCard (Kanban)
```tsx
<TaskCard 
  task={task}
  onDragStart={...}
  onClick={...}
  stageColor={getStageColor(task.stage)}
  priorityColor={getPriorityColor(task.priority)}
/>
// Shows: title, company badge, due date (red if overdue), 
// assignee avatar, progress ring, priority badge, tags
```

### TimeEntryForm
```tsx
<TimeEntryForm 
  taskId={taskId}
  defaultCategory={task.category}
  onSave={(entry) => saveTimeEntry(entry)}
/>
// Fields: date, start/end time or duration, category, notes
```

### TimerWidget
```tsx
<TimerWidget 
  taskId={activeTaskId}
  onComplete={(entry) => handleTimerComplete(entry)}
/>
// Shows: circular progress, time remaining, task title
// Controls: play/pause, skip break, stop
```

### AnalyticsCharts
```tsx
<TimeAllocationChart data={categoryHours} />
<WorkloadChart data={assigneeWorkload} />
<WeeklyTrendChart data={dailyHours} />
<PriorityDistributionChart data={priorityCounts} />
```

## API

```
GET    /api/tasks                     # List with filters
GET    /api/tasks/:id                 # Full task
POST   /api/tasks                     # Create
PATCH  /api/tasks/:id                 # Update
DELETE /api/tasks/:id                 # Delete

POST   /api/tasks/:id/time-entries    # Add time entry
GET    /api/tasks/:id/time-entries    # List entries
PATCH  /api/time-entries/:id          # Update entry
DELETE /api/time-entries/:id          # Delete entry

POST   /api/tasks/:id/timer/start     # Start timer
POST   /api/tasks/:id/timer/stop      # Stop timer
GET    /api/tasks/:id/timer/status    # Current timer state

GET    /api/analytics/time-allocation # Category breakdown
GET    /api/analytics/workload        # Assignee workload
GET    /api/analytics/weekly-trend    # Daily hours
GET    /api/analytics/team-capacity   # Capacity forecast

POST   /api/tasks/:id/review/request  # Request review
POST   /api/tasks/:id/review/decision # Approve/reject
```

## File Inventory
```
src/app/tasks/page.tsx                    # Main page (3 views)
src/components/tasks/
  ├── TaskCard.tsx
  ├── TaskList.tsx
  ├── TimerWidget.tsx
  ├── TimeEntryForm.tsx
  ├── TaskModal.tsx
  ├── AnalyticsDashboard.tsx
  └── WorkloadChart.tsx
src/lib/tasks/
  ├── types.ts
  ├── timer-engine.ts
  ├── analytics.ts
  └── mock-data.ts
src/app/api/tasks/                        # API routes
```

## Mock Data (8 Tasks)
```typescript
const MOCK_TASKS = [
  { id: "1", title: "Q1 FY25 Earnings - RELIANCE", stage: "RESEARCH", status: "IN_PROGRESS", 
    priority: 1, assignee: "Analyst 1", due: "2024-07-20", est: 8, act: 4.5, 
    tags: ["EARNINGS", "O2C", "JIO"], company: "RELIANCE" },
  { id: "2", title: "TCS Valuation Model Update", stage: "ANALYZE", status: "TODO",
    priority: 2, assignee: "Analyst 2", due: "2024-07-25", est: 6, act: 0,
    tags: ["VALUATION", "DCF"], company: "TCS" },
  { id: "3", title: "HDFC Bank Merger Tracker", stage: "TRACK", status: "REVIEW",
    priority: 1, assignee: "Analyst 1", due: "2024-07-18", est: 10, act: 7,
    tags: ["MERGER", "BANKING"], company: "HDFCBANK" },
  { id: "4", title: "TRENT Deep Dive - Westside", stage: "GENERATE", status: "TODO",
    priority: 3, assignee: "Analyst 3", due: "2024-08-01", est: 12, act: 0,
    tags: ["RETAIL", "CONSUMER"], company: "TRENT" },
  { id: "5", title: "Bajaj Finance Credit Costs", stage: "RESEARCH", status: "IN_PROGRESS",
    priority: 2, assignee: "Analyst 2", due: "2024-07-22", est: 8, act: 3,
    tags: ["NBFC", "CREDIT"], company: "BAJFINANCE" },
  { id: "6", title: "PERSISTENT Cloud Migration", stage: "DOCUMENT", status: "DONE",
    priority: 2, assignee: "Analyst 3", due: "2024-07-10", est: 6, act: 5.5,
    tags: ["IT", "CLOUD"], company: "PERSISTENT" },
  { id: "7", title: "COFORGE Europe Expansion", stage: "GENERATE", status: "TODO",
    priority: 3, assignee: "Analyst 3", due: "2024-08-15", est: 10, act: 0,
    tags: ["IT", "EUROPE"], company: "COFORGE" },
  { id: "8", title: "DMART Store Economics", stage: "RESEARCH", status: "REVIEW",
    priority: 2, assignee: "Analyst 1", due: "2024-07-28", est: 8, act: 6,
    tags: ["RETAIL", "CONSUMER"], company: "DMART" },
];
```

## Settings

### User Settings
- Work hours (start/end, timezone)
- Default task estimate
- Pomodoro lengths
- Notification preferences
- Theme (light/dark/system)

### Team Settings (Admin)
- Workweek definition (Mon-Fri, Sun-Thu)
- Holidays calendar
- Default reviewers by stage
- Capacity thresholds (green/yellow/red)
- Billable vs internal categories

## File Inventory
```
src/app/tasks/page.tsx                    # Main page
src/components/tasks/
  ├── TaskCard.tsx
  ├── TaskList.tsx
  ├── TimerWidget.tsx
  ├── TimeEntryForm.tsx
  ├── TaskModal.tsx
  ├── AnalyticsDashboard.tsx
  ├── WorkloadChart.tsx
  └── PomodoroTimer.tsx
src/lib/tasks/
  ├── types.ts
  ├── timer-engine.ts
  ├── analytics.ts
  └── mock-data.ts
src/app/api/tasks/                        # API routes
```