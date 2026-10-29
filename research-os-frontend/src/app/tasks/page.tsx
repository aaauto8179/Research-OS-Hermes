"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  Plus, Eye, Download, Settings, AlertTriangle,
  TrendingUp, TrendingDown, Target, Zap,
  Building2, Briefcase, BarChart2, FileText,
  Layers, ClipboardList, Calculator, Lightbulb,
  CheckCircle, XCircle, HelpCircle, Pencil,
  Save, Undo2, Redo2, Loader2,
  Calendar, Flag, Truck, Factory, Zap as ZapIcon,
  DollarSign, TrendingUp as TrendingUpIcon,
  PieChart, RefreshCw, ArrowUpRight, ArrowDownRight,
  Star, Bell, Minus, LineChart, Activity, Gauge,
  User, Users, Globe, Link, BarChart3, PieChart as PieChartIcon,
  ArrowLeft, Shield, Scale, Brain, Heart, AlertCircle,
  Clock, Play, Pause, Stop, Square, Timer, Trash2, Edit2
} from "lucide-react";
import { MOCK_COMPANIES } from "@/lib/mock-data";

const MOCK_TASKS = [
  { id: "1", title: "Q1 FY25 Earnings Analysis - RELIANCE", description: "Analyze O2C crack spreads, Jio ARPU, Retail SSG", status: "IN_PROGRESS", priority: 1, assignee: "Analyst 1", due_date: "2024-07-20", estimated_hours: 8, actual_hours: 4.5, tags: ["EARNINGS", "O2C", "JIO"], related_company: "RELIANCE", stage: "RESEARCH" },
  { id: "2", title: "TCS Valuation Model Update", description: "Update DCF with Q4 FY24 numbers, refresh peer comps", status: "TODO", priority: 2, assignee: "Analyst 2", due_date: "2024-07-25", estimated_hours: 6, actual_hours: 0, tags: ["VALUATION", "DCF"], related_company: "TCS", stage: "WEIGH" },
  { id: "3", title: "HDFC Bank Merger Integration Tracker", description: "Track HDFC-HDFC Bank merger milestones, synergy realization", status: "REVIEW", priority: 1, assignee: "Analyst 1", due_date: "2024-07-18", estimated_hours: 10, actual_hours: 7, tags: ["MERGER", "BANKING"], related_company: "HDFCBANK", stage: "TRACK" },
  { id: "4", title: "TRENT Deep Dive - Westside Expansion", description: "Model 50 new stores, same-store sales growth, margin trajectory", status: "TODO", priority: 3, assignee: "Analyst 3", due_date: "2024-08-01", estimated_hours: 12, actual_hours: 0, tags: ["RETAIL", "CONSUMER"], related_company: "TRENT", stage: "GENERATE" },
  { id: "5", title: "Bajaj Finance Credit Cost Analysis", description: "Analyze credit cost trajectory, provision coverage, NPA trends", status: "IN_PROGRESS", priority: 2, assignee: "Analyst 2", due_date: "2024-07-22", estimated_hours: 8, actual_hours: 3, tags: ["NBFC", "CREDIT"], related_company: "BAJFINANCE", stage: "RESEARCH" },
  { id: "6", title: "PERSISTENT Cloud Migration Thesis", description: "AWS partnership, digital transformation, margin expansion", status: "DONE", priority: 2, assignee: "Analyst 3", due_date: "2024-07-10", estimated_hours: 6, actual_hours: 5.5, tags: ["IT", "CLOUD"], related_company: "PERSISTENT", stage: "WEIGH" },
  { id: "7", title: "COFORGE Europe Expansion", description: "Poland delivery center ramp, nearshoring economics", status: "TODO", priority: 3, assignee: "Analyst 3", due_date: "2024-08-15", estimated_hours: 10, actual_hours: 0, tags: ["IT", "EUROPE"], related_company: "COFORGE", stage: "GENERATE" },
  { id: "8", title: "DMART Store Economics", description: "Unit economics, footprint expansion, competitive moat", status: "REVIEW", priority: 2, assignee: "Analyst 1", due_date: "2024-07-28", estimated_hours: 8, actual_hours: 6, tags: ["RETAIL", "CONSUMER"], related_company: "DMART", stage: "TRACK" },
];

const TIME_CATEGORIES = [
  "10-K/Annual Report Reading",
  "Quarterly Results Analysis",
  "Valuation Modeling",
  "Concall/Transcript Review",
  "Primary Research/Channel Checks",
  "Management Meetings",
  "Monitoring Existing Positions",
  "Portfolio Review",
  "Risk Analysis",
  "Report Writing",
  "Admin/Other",
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("kanban");
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filteredTasks, setFilteredTasks] = useState(MOCK_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [editingTask, setEditingTask] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [activeTimer, setActiveTimer] = useState<{taskId: string, startTime: number} | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const assignees = ["Analyst 1", "Analyst 2", "Analyst 3"];

  useEffect(() => {
    let result = [...tasks];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.related_company?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    if (assigneeFilter !== "all") {
      result = result.filter(t => t.assignee === assigneeFilter);
    }
    setFilteredTasks(result);
  }, [tasks, searchQuery, statusFilter, assigneeFilter]);

  const startTimer = (taskId: string) => {
    setActiveTimer({ taskId, startTime: Date.now() });
  };

  const stopTimer = () => {
    if (activeTimer) {
      const duration = Math.round((Date.now() - activeTimer.startTime) / 60000);
      setTimeEntries(prev => [...prev, {
        id: Date.now().toString(),
        task_id: activeTimer.taskId,
        start_time: new Date(activeTimer.startTime).toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: duration,
        category: "Research",
        notes: "Auto-tracked",
      }]);
      // Update task actual hours
      setTasks(prev => prev.map(t => 
        t.id === activeTimer.taskId 
          ? { ...t, actual_hours: (t.actual_hours || 0) + duration / 60 }
          : t
      ));
      setActiveTimer(null);
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks & Time Tracker</h1>
          <p className="text-sm text-muted-foreground">Research operations, productivity tracking, and time allocation discipline</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowCreateTask(true)}><Plus className="mr-2 h-4 w-4" /> New Task</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
        </div>
      </div>

      {/* Active Timer */}
      {activeTimer && (
        <div className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg flex items-center gap-4 animate-pulse">
          <div>
            <p className="text-sm font-medium">Active Timer</p>
            <p className="text-2xl font-bold font-mono" id="timer-display">00:00:00</p>
          </div>
          <Button variant="secondary" onClick={stopTimer} className="h-10 px-4">
            <Square className="mr-2 h-4 w-4" /> Stop
          </Button>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Tasks" value={tasks.length} icon={ClipboardList} />
        <MetricCard label="In Progress" value={tasks.filter(t => t.status === "IN_PROGRESS").length} icon={Play} />
        <MetricCard label="Completed" value={tasks.filter(t => t.status === "DONE").length} icon={CheckCircle} />
        <MetricCard label="Blocked" value={tasks.filter(t => t.status === "BLOCKED").length} icon={AlertCircle} />
        <MetricCard label="Est. Hours" value={tasks.reduce((s,t) => s + (t.estimated_hours || 0), 0)}h icon={Clock} />
        <MetricCard label="Actual Hours" value={tasks.reduce((s,t) => s + (t.actual_hours || 0), 0).toFixed(1)}h icon={Timer} />
      </div>

      {/* Filters */}
      <div className="border rounded-lg p-4 bg-muted/30 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search title, company, tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="REVIEW">Review</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="All Assignees" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {["Analyst 1", "Analyst 2", "Analyst 3"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kanban"><Layers className="mr-2 h-4 w-4" /> Kanban</TabsTrigger>
          <TabsTrigger value="list"><ClipboardList className="mr-2 h-4 w-4" /> List</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart2 className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
        </TabsList>

        {/* Kanban Tab */}
        <TabsContent value="kanban" className="flex-1 mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
            {["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"].map(status => {
              const statusTasks = filteredTasks.filter(t => t.status === status);
              const statusConfig = {
                TODO: { color: "#3B82F6", label: "To Do" },
                IN_PROGRESS: { color: "#8B5CF6", label: "In Progress" },
                REVIEW: { color: "#F59E0B", label: "Review" },
                DONE: { color: "#10B981", label: "Done" },
                BLOCKED: { color: "#EF4444", label: "Blocked" },
              };
              const config = statusConfig[status as keyof typeof statusConfig];

              return (
                <div key={status} className="min-w-[320px] max-w-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-3 p-3 rounded-t-lg" style={{ backgroundColor: config.color + "20" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                      <span className="font-medium text-sm">{config.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto p-3 bg-muted/20 rounded-b-lg min-h-[400px]" 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData("taskId");
                      if (taskId) {
                        setTasks(prev => prev.map(t => 
                          t.id === taskId ? { ...t, status: status } : t
                        ));
                      }
                    }}>
                    {statusTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        stageColor={config.color}
                        onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                        onClick={() => setEditingTask(task)}
                      />
                    ))}
                    {statusTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Drag tasks here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="flex-1 mt-4">
          <div className="overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><input type="checkbox" className="rounded border-input" /></TableHead>
                  <TableHead className="cursor-pointer">Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead className="text-right">Est. Hours</TableHead>
                  <TableHead className="text-right">Actual Hours</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map(task => (
                  <TableRow key={task.id} className={editingTask?.id === task.id ? 'bg-primary/5' : ''} onClick={() => setEditingTask(task)}>
                    <TableCell><input type="checkbox" className="rounded border-input" /></TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{task.title}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{task.related_company || "—"}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={
                        task.status === "DONE" ? "default" :
                        task.status === "IN_PROGRESS" ? "default" :
                        task.status === "REVIEW" ? "secondary" :
                        task.status === "TODO" ? "outline" :
                        "destructive"
                      }>{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={task.priority === 1 ? "destructive" : task.priority === 2 ? "secondary" : "outline"}>
                        P{task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.assignee}</TableCell>
                    <TableCell className="text-right font-mono">{task.estimated_hours}h</TableCell>
                    <TableCell className="text-right font-mono" style={{color: (task.actual_hours || 0) > task.estimated_hours ? 'red' : 'inherit'}}>{(task.actual_hours || 0).toFixed(1)}h</TableCell>
                    <TableCell>{task.due_date}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{task.stage}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startTimer(task.id); }}><Play className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="flex-1 mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Time Allocation by Category</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TIME_CATEGORIES.slice(0, 8).map((cat, i) => {
                    const hours = Math.random() * 20 + 5;
                    const pct = (hours / 100) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-40 text-sm text-muted-foreground truncate">{cat}</span>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-20 text-right font-mono text-sm">{hours.toFixed(1)}h</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Assignee Workload</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Analyst 1", "Analyst 2", "Analyst 3"].map(a => {
                    const assigneeTasks = filteredTasks.filter(t => t.assignee === a);
                    const totalEst = assigneeTasks.reduce((s, t) => s + (t.estimated_hours || 0), 0);
                    const totalAct = assigneeTasks.reduce((s, t) => s + (t.actual_hours || 0), 0);
                    const inProgress = assigneeTasks.filter(t => t.status === "IN_PROGRESS").length;
                    return (
                      <div key={a} className="p-3 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{a}</span>
                          <Badge variant={inProgress > 3 ? "destructive" : inProgress > 1 ? "secondary" : "default"}>{inProgress} active</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div><p className="text-muted-foreground">Estimated</p><p className="font-bold">{totalEst}h</p></div>
                          <div><p className="text-muted-foreground">Actual</p><p className="font-bold">{totalAct.toFixed(1)}h</p></div>
                          <div><p className="text-muted-foreground">Efficiency</p><p className="font-bold" style={{color: totalAct > totalEst ? 'red' : 'green'}}>{((totalAct/totalEst)*100).toFixed(0)}%</p></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Weekly Time Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around px-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-primary rounded-t" style={{ height: `${Math.random() * 8 + 2}%` }} />
                      <span className="text-xs text-center mt-1">{day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Priority Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "P1 - Critical", count: tasks.filter(t => t.priority === 1).length, color: "red" },
                    { label: "P2 - High", count: tasks.filter(t => t.priority === 2).length, color: "yellow" },
                    { label: "P3 - Medium", count: tasks.filter(t => t.priority === 3).length, color: "blue" },
                    { label: "P4 - Low", count: tasks.filter(t => t.priority === 4).length, color: "gray" },
                  ].map(p => (
                    <div key={p.label} className="flex items-center gap-3">
                      <span className="w-32 text-sm">{p.label}</span>
                      <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${tasks.length > 0 ? (p.count / tasks.length) * 100 : 0}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="w-12 text-right font-mono">{p.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Task Modal */}
      {(showCreateTask || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowCreateTask(false); setEditingTask(null); }}>
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">{editingTask ? "Edit Task" : "New Task"}</h2>
              <Button variant="ghost" size="icon" onClick={() => { setShowCreateTask(false); setEditingTask(null); }}><XCircle className="h-5 w-5" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <div><Label>Title</Label><Input value={editingTask?.title || ""} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} placeholder="Task title" /></div>
              <div><Label>Description</Label><Textarea value={editingTask?.description || ""} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} placeholder="Description" rows={3} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label>
                  <Select value={editingTask?.status || "TODO"} onValueChange={(v) => setEditingTask({...editingTask, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="REVIEW">Review</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={editingTask?.priority || 2} onValueChange={(v) => setEditingTask({...editingTask, priority: parseInt(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">P1 - Critical</SelectItem>
                      <SelectItem value="2">P2 - High</SelectItem>
                      <SelectItem value="3">P3 - Medium</SelectItem>
                      <SelectItem value="4">P4 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Assignee</Label>
                  <Select value={editingTask?.assignee || "Analyst 1"} onValueChange={(v) => setEditingTask({...editingTask, assignee: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Analyst 1", "Analyst 2", "Analyst 3"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Due Date</Label><Input type="date" value={editingTask?.due_date || ""} onChange={(e) => setEditingTask({...editingTask, due_date: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Estimated Hours</Label><Input type="number" step="0.5" value={editingTask?.estimated_hours || 0} onChange={(e) => setEditingTask({...editingTask, estimated_hours: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Related Company</Label>
                  <Select value={editingTask?.related_company || ""} onValueChange={(v) => setEditingTask({...editingTask, related_company: v})}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {MOCK_COMPANIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.symbol}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Tags (comma separated)</Label><Input value={editingTask?.tags?.join(",") || ""} onChange={(e) => setEditingTask({...editingTask, tags: e.target.value.split(",").map(t => t.trim())})} placeholder="EARNINGS, VALUATION, etc." /></div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => { setShowCreateTask(false); setEditingTask(null); }}>Cancel</Button>
                <Button onClick={() => { setShowCreateTask(false); setEditingTask(null); }}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, stageColor, onDragStart, onClick }: { task: any; stageColor: string; onDragStart: (e: React.DragEvent) => void; onClick: () => void }) {
  const isOverdue = new Date(task.due_date) < new Date() && task.status !== "DONE";

  return (
    <div 
      className="p-3 bg-background border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${stageColor}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-sm truncate flex-1">{task.title}</span>
        <div className="flex items-center gap-1">
          <Badge variant={task.priority === 1 ? "destructive" : task.priority === 2 ? "secondary" : "outline"} className="text-xs">P{task.priority}</Badge>
          {isOverdue && <AlertCircle className="h-3 w-3 text-red-600" title="Overdue" />}
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {task.due_date} {isOverdue && <span className="text-red-600">(Overdue)</span>}</div>
        <div className="flex items-center gap-1"><User className="h-3 w-3" /> {task.assignee}</div>
        <div className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {task.related_company || "—"}</div>
        <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Est: {task.estimated_hours}h | Act: {(task.actual_hours || 0).toFixed(1)}h</div>
      </div>
      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
          {task.tags.length > 3 && <Badge variant="outline" className="text-xs">+{task.tags.length - 3} more</Badge>}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon: Icon }: { label: string; value: string; change?: string; trend?: "up" | "down"; icon?: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />} {change}
              </p>
            )}
          </div>
          {Icon && <div className="p-2 bg-muted rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
        </div>
      </CardContent>
    </Card>
  );
}

