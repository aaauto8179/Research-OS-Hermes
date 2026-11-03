"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Clock, User, Building2, GripVertical } from "lucide-react";

interface KanbanBoardProps {
  tasks?: any[];
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

const STATUS_CONFIG = {
  TODO: { color: "#3B82F6", label: "To Do" },
  IN_PROGRESS: { color: "#8B5CF6", label: "In Progress" },
  REVIEW: { color: "#F59E0B", label: "Review" },
  DONE: { color: "#10B981", label: "Done" },
  BLOCKED: { color: "#EF4444", label: "Blocked" },
};

const STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "BLOCKED"];

const MOCK_TASKS = [
  { id: "1", title: "Q1 FY25 Earnings Analysis - RELIANCE", description: "Analyze O2C crack spreads, Jio ARPU, Retail SSG", status: "IN_PROGRESS", priority: 1, assignee: "Analyst 1", due_date: "2024-07-20", estimated_hours: 8, actual_hours: 4.5, tags: ["EARNINGS", "O2C", "JIO"], related_company: "RELIANCE", stage: "RESEARCH" },
  { id: "2", title: "TCS Valuation Model Update", description: "Update DCF with Q4 FY24 numbers, refresh peer comps", status: "TODO", priority: 2, assignee: "Analyst 2", due_date: "2024-07-25", estimated_hours: 6, actual_hours: 0, tags: ["VALUATION", "DCF"], related_company: "TCS", stage: "WEIGH" },
  { id: "3", title: "HDFC Bank Merger Integration Tracker", description: "Track HDFC-HDFC Bank merger milestones, synergy realization", status: "REVIEW", priority: 1, assignee: "Analyst 1", due_date: "2024-07-18", estimated_hours: 10, actual_hours: 7, tags: ["MERGER", "BANKING"], related_company: "HDFCBANK", stage: "TRACK" },
  { id: "4", title: "TRENT Deep Dive - Westside Expansion", description: "Model 50 new stores, same-store sales growth, margin trajectory", status: "TODO", priority: 3, assignee: "Analyst 3", due_date: "2024-08-01", estimated_hours: 12, actual_hours: 0, tags: ["RETAIL", "CONSUMER"], related_company: "TRENT", stage: "GENERATE" },
  { id: "5", title: "Bajaj Finance Credit Cost Analysis", description: "Analyze credit cost trajectory, provision coverage, NPA trends", status: "IN_PROGRESS", priority: 2, assignee: "Analyst 2", due_date: "2024-07-22", estimated_hours: 8, actual_hours: 3, tags: ["NBFC", "CREDIT"], related_company: "BAJFINANCE", stage: "RESEARCH" },
];

export default function KanbanBoard({ tasks: initialTasks = [], onTaskUpdate }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<any[]>(initialTasks.length > 0 ? initialTasks : MOCK_TASKS);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    if (initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId") || draggedTask;
    if (taskId) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status } : t
      ));
      if (onTaskUpdate) {
        onTaskUpdate(taskId, { status });
      }
    }
    setDraggedTask(null);
  };

  const handleTaskClick = (task: any) => {
    // Could emit event or call callback
    console.log("Task clicked:", task);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Kanban Board</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
          {STATUSES.map(status => {
            const statusTasks = tasks.filter(t => t.status === status);
            const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

            return (
              <div key={status} className="min-w-[300px] max-w-[300px] flex flex-col">
                <div className="flex items-center justify-between mb-3 p-3 rounded-t-lg" style={{ backgroundColor: config.color + "20" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="font-medium text-sm">{config.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3 bg-muted/20 rounded-b-lg min-h-[400px]" 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status)}>
                  {statusTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      stageColor={config.color}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                  {statusTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
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
          {isOverdue && <AlertCircle className="h-3 w-3 text-red-600" />}
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
          {task.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
          {task.tags.length > 3 && <Badge variant="outline" className="text-xs">+{task.tags.length - 3} more</Badge>}
        </div>
      )}
    </div>
  );
}