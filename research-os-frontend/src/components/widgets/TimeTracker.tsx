"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Play, Pause, Timer, Plus, Trash2, Clock, DollarSign, TrendingUp, Download, RotateCcw, Save } from "lucide-react";

interface TimeTrackerProps {
  timeEntries?: any[];
  onEntryAdd?: (entry: any) => void;
}

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

const MOCK_ENTRIES = [
  { id: "1", task_id: "1", category: "Quarterly Results Analysis", start_time: "2024-07-15T09:00:00", end_time: "2024-07-15T11:30:00", duration_minutes: 150, notes: "RELIANCE Q4 FY24 results analysis" },
  { id: "2", task_id: "2", category: "Valuation Modeling", start_time: "2024-07-15T14:00:00", end_time: "2024-07-15T16:45:00", duration_minutes: 165, notes: "TCS DCF model update" },
  { id: "3", task_id: "1", category: "Concall/Transcript Review", start_time: "2024-07-16T10:00:00", end_time: "2024-07-16T12:00:00", duration_minutes: 120, notes: "RELIANCE Q4 concall transcript" },
  { id: "4", task_id: "3", category: "Primary Research/Channel Checks", start_time: "2024-07-16T15:00:00", end_time: "2024-07-16T17:30:00", duration_minutes: 150, notes: "HDFC Bank channel checks" },
  { id: "5", task_id: "2", category: "Valuation Modeling", start_time: "2024-07-17T09:30:00", end_time: "2024-07-17T12:00:00", duration_minutes: 150, notes: "TCS DCF sensitivity analysis" },
];

export default function TimeTracker({ timeEntries: initialEntries = [], onEntryAdd }: TimeTrackerProps) {
  const [entries, setEntries] = useState<any[]>(initialEntries.length > 0 ? initialEntries : MOCK_ENTRIES);
  const [activeTimer, setActiveTimer] = useState<{taskId: string; category: string; startTime: number; notes: string} | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [newEntry, setNewEntry] = useState({ task_id: "", category: TIME_CATEGORIES[0], duration_minutes: 60, notes: "" });
  const [showManualEntry, setShowManualEntry] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = (category: string, taskId: string, notes: string) => {
    const startTime = Date.now();
    setActiveTimer({ taskId, category, startTime, notes: "" });
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);
  };

  const stopTimer = () => {
    if (activeTimer && timerRef.current) {
      clearInterval(timerRef.current);
      const duration = Math.round((Date.now() - activeTimer.startTime) / 60000);
      const newEntry = {
        id: Date.now().toString(),
        task_id: activeTimer.taskId,
        category: activeTimer.category,
        start_time: new Date(activeTimer.startTime).toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: duration,
        notes: activeTimer.notes,
      };
      setEntries(prev => [newEntry, ...prev]);
      if (onEntryAdd) onEntryAdd(newEntry);
      setActiveTimer(null);
      setElapsedTime(0);
    }
  };

  const addManualEntry = () => {
    if (!newEntry.task_id || !newEntry.duration_minutes) return;
    const newEntryData = {
      id: Date.now().toString(),
      task_id: newEntry.task_id,
      category: newEntry.category,
      start_time: new Date(Date.now() - newEntry.duration_minutes * 60000).toISOString(),
      end_time: new Date().toISOString(),
      duration_minutes: newEntry.duration_minutes,
      notes: newEntry.notes,
    };
    setEntries(prev => [newEntryData, ...prev]);
    if (onEntryAdd) onEntryAdd(newEntryData);
    setNewEntry({ task_id: "", category: TIME_CATEGORIES[0], duration_minutes: 60, notes: "" });
    setShowManualEntry(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

  // Timer content
  const getTimerContent = () => {
    if (activeTimer) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Timer className="h-6 w-6 text-primary animate-pulse" />
            <div>
              <p className="font-medium">Active Timer</p>
              <p className="text-sm text-muted-foreground">{activeTimer.category} • Task #{activeTimer.taskId}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-2xl font-mono font-bold tabular-nums" style={{ fontSize: "1.5rem" }}>
                {formatTime(Date.now() - activeTimer.startTime)}
              </span>
              <Button variant="destructive" onClick={stopTimer} className="h-10 px-4">
                <Pause className="mr-2 h-4 w-4" /> Stop
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4">
        <Timer className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1">
          <p className="font-medium">No active timer</p>
          <p className="text-sm text-muted-foreground">Start tracking time for a task</p>
        </div>
        <Select value="Quarterly Results Analysis" onValueChange={v => startTimer(v, "1", "")} defaultValue="Quarterly Results Analysis">
          <SelectTrigger className="w-48"><SelectValue placeholder="Select category" /></SelectTrigger>
          <SelectContent>
            {TIME_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => startTimer("Quarterly Results Analysis", "1", "")} className="h-10 px-4">
          <Play className="mr-2 h-4 w-4" /> Start Timer
        </Button>
      </div>
    );
  };

  const timerContent = getTimerContent();


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time Tracker</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{entries.length} entries</Badge>
          <Badge variant="secondary" className="text-xs">{formatDuration(entries.reduce((s, e) => s + (e.duration_minutes || 0), 0))}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
              {/* Active Timer */}
              <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                {timerContent}
              </div>

              {/* Manual Entry */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Manual Time Entry</span>
              <Button variant="outline" size="sm" onClick={() => setShowManualEntry(!showManualEntry)}>
                {showManualEntry ? <RotateCcw className="mr-1 h-3 w-3" /> : <Plus className="mr-1 h-3 w-3" />}
                {showManualEntry ? "Cancel" : "Add Entry"}
              </Button>
            </div>
            {showManualEntry && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-xs text-muted-foreground">Task ID</label>
                  <Input value={newEntry.task_id} onChange={e => setNewEntry({...newEntry, task_id: e.target.value})} placeholder="Task ID" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Category</label>
                  <Select value={newEntry.category} onValueChange={v => setNewEntry({...newEntry, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Duration (min)</label>
                  <Input type="number" value={newEntry.duration_minutes} onChange={e => setNewEntry({...newEntry, duration_minutes: parseInt(e.target.value) || 0})} placeholder="60" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Notes</label>
                  <Input value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} placeholder="Notes" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowManualEntry(false)}>Cancel</Button>
                  <Button onClick={addManualEntry}><Save className="mr-1 h-3 w-3" /> Save Entry</Button>
                </div>
              </div>
            )}
          </div>

          {/* Time Entries Table */}
          <div className="flex-1 overflow-hidden border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No time entries yet. Start a timer or add a manual entry.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">{new Date(entry.start_time).toLocaleDateString()} {new Date(entry.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{entry.category}</Badge></TableCell>
                      <TableCell className="font-mono text-sm">#{entry.task_id}</TableCell>
                      <TableCell className="text-right font-mono">{formatDuration(entry.duration_minutes)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{entry.notes}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteEntry(entry.id)} title="Delete"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Total Time: {formatDuration(entries.reduce((s, e) => s + (e.duration_minutes || 0), 0))}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{entries.length} entries</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" /> Export CSV</Button>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}