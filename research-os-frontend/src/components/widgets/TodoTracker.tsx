"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Clock, Flag, MoreVertical, Edit2, Filter, SortAsc, SortDesc } from "lucide-react";

interface TodoTrackerProps {
  todos?: any[];
  onTodoUpdate?: (todoId: string, updates: any) => void;
}

const MOCK_TODOS = [
  { id: "1", title: "Review RELIANCE Q4 FY25 preview", description: "Focus on O2C margins and Jio ARPU", completed: false, priority: 1, due_date: "2024-07-20", tags: ["EARNINGS", "RELIANCE"], created: "2024-07-10" },
  { id: "2", title: "Update TCS DCF model", description: "Refresh with Q4 FY24 actuals, update peer comps", completed: false, priority: 2, due_date: "2024-07-25", tags: ["VALUATION", "TCS"], created: "2024-07-12" },
  { id: "3", title: "HDFC Bank merger milestone tracker", description: "Track integration milestones, synergy realization", completed: true, priority: 1, due_date: "2024-07-18", tags: ["MERGER", "BANKING"], created: "2024-07-05" },
  { id: "4", title: "TRENT Westside expansion deep dive", description: "Model 50 new stores, SSG, margin trajectory", completed: false, priority: 3, due_date: "2024-08-01", tags: ["RETAIL", "CONSUMER"], created: "2024-07-15" },
  { id: "5", title: "Bajaj Finance credit cost analysis", description: "Analyze credit cost trajectory, NPA trends", completed: false, priority: 2, due_date: "2024-07-22", tags: ["NBFC", "CREDIT"], created: "2024-07-14" },
];

export default function TodoTracker({ todos: initialTodos = [], onTodoUpdate }: TodoTrackerProps) {
  const [todos, setTodos] = useState<any[]>(initialTodos.length > 0 ? initialTodos : MOCK_TODOS);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"priority" | "due_date" | "created">("priority");
  const [showCreate, setShowCreate] = useState(false);
  const [newTodo, setNewTodo] = useState({ title: "", description: "", priority: "2", due_date: "", tags: "" });

  const filteredTodos = todos
    .filter(t => filter === "all" || (filter === "active" && !t.completed) || (filter === "completed" && t.completed))
    .sort((a, b) => {
      if (sortBy === "priority") return a.priority - b.priority;
      if (sortBy === "due_date") return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

  const addTodo = () => {
      if (!newTodo.title.trim()) return;
      const newId = Date.now().toString();
      setTodos(prev => [...prev, { 
        id: newId, 
        title: newTodo.title, 
        description: newTodo.description, 
        completed: false, 
        priority: parseInt(newTodo.priority), 
        due_date: newTodo.due_date, 
        tags: newTodo.tags.split(",").map(t => t.trim()), 
        created: new Date().toISOString().split("T")[0] 
      }]);
      setNewTodo({ title: "", description: "", priority: "2", due_date: "", tags: "" });
      setShowCreate(false);
    };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const updateTodo = (id: string, updates: any) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (onTodoUpdate) onTodoUpdate(id, updates);
  };

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  // Todo list content
  const todoListContent = filteredTodos.length === 0 ? (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <div className="text-4xl mb-2">✓</div>
        <p>No todos found. Add a new task to get started!</p>
      </div>
    </div>
  ) : (
    filteredTodos.map(todo => (
      <div key={todo.id} className={`p-3 border rounded-lg transition-all ${todo.completed ? "bg-green-500/5 opacity-70" : "hover:bg-muted/50"}`}>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center mt-1">
            <input 
              type="checkbox" 
              checked={todo.completed} 
              onChange={() => toggleTodo(todo.id)} 
              className="w-5 h-5 rounded border-input accent-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={`font-medium text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}>{todo.title}</h4>
              <div className="flex items-center gap-1">
                <Badge variant={todo.priority === 1 ? "destructive" : todo.priority === 2 ? "secondary" : todo.priority === 3 ? "outline" : "default"} className="text-xs">P{todo.priority}</Badge>
                {new Date(todo.due_date) < new Date() && !todo.completed && <AlertCircle className="h-3 w-3 text-red-600" />}
              </div>
            </div>
            {todo.description && <p className={`text-xs text-muted-foreground mt-1 ${todo.completed ? "line-through" : ""}`}>{todo.description}</p>}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {todo.due_date}</span>
              {todo.tags.length > 0 && <span className="flex items-center gap-1">#{todo.tags.slice(0, 3).join(", #")}{todo.tags.length > 3 ? ` +${todo.tags.length - 3} more` : ""}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => updateTodo(todo.id, { completed: !todo.completed })} title={todo.completed ? "Mark active" : "Mark complete"}>
              {todo.completed ? <CheckCircle className="h-4 w-4 text-green-600" /> : <CheckCircle className="h-4 w-4 text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)} title="Delete">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>
    ))
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Todo Tracker</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{activeCount} active</Badge>
          <Badge variant="secondary" className="text-xs">{completedCount} done</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="mr-1 h-3 w-3" /> {showCreate ? "Cancel" : "New"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Create Form */}
        {showCreate && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Input value={newTodo.title} onChange={e => setNewTodo({...newTodo, title: e.target.value})} placeholder="What needs to be done?" autoFocus />
              </div>
              <div className="md:col-span-2">
                <Input value={newTodo.description} onChange={e => setNewTodo({...newTodo, description: e.target.value})} placeholder="Description (optional)" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Select value={newTodo.priority} onValueChange={v => setNewTodo({...newTodo, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">P1 - Critical</SelectItem>
                      <SelectItem value="2">P2 - High</SelectItem>
                      <SelectItem value="3">P3 - Medium</SelectItem>
                      <SelectItem value="4">P4 - Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input type="date" value={newTodo.due_date} onChange={e => setNewTodo({...newTodo, due_date: e.target.value})} placeholder="Due date" />
                </div>
                <div>
                  <Input value={newTodo.tags} onChange={e => setNewTodo({...newTodo, tags: e.target.value})} placeholder="Tags (comma separated)" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => { setShowCreate(false); setNewTodo({ title: "", description: "", priority: "2", due_date: "", tags: "" }); }}>Cancel</Button>
                <Button onClick={addTodo} disabled={!newTodo.title.trim()}>Add Todo</Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={v => setFilter(v as "all" | "active" | "completed")}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={v => setSortBy(v as "priority" | "due_date" | "created")}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="due_date">Due Date</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">{todos.filter(t => !t.completed).length} active</Badge>
            <Badge variant="secondary" className="text-xs">{todos.filter(t => t.completed).length} done</Badge>
          </div>
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {todoListContent}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Completed: {todos.filter(t => t.completed).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium">Active: {todos.filter(t => !t.completed).length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-600" />
              <span className="font-medium">Overdue: {todos.filter(t => !t.completed && new Date(t.due_date) < new Date()).length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}