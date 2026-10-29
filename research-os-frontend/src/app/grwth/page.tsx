"use client";

import { useState, useEffect } from "react";
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
  DollarSign, TrendingUp as TrendingUpIcon
} from "lucide-react";
import { MOCK_COMPANIES } from "@/lib/mock-data";

const GRWTH_STAGES = [
  { id: "ANNOUNCED", label: "Announced", color: "#6B7280", description: "Capex/project publicly announced" },
  { id: "ENV_CLEARANCE", label: "Env. Clearance", color: "#F59E0B", description: "Regulatory/environmental approvals" },
  { id: "CONSTRUCTION", label: "Construction", color: "#3B82F6", description: "Site prep and construction underway" },
  { id: "TRIAL_RUNS", label: "Trial Runs", color: "#8B5CF6", description: "Equipment installation & trial production" },
  { id: "COMMERCIAL", label: "Commercial Prod.", color: "#10B981", description: "Full-scale commercial operations" },
  { id: "REVENUE", label: "Revenue Accretion", color: "#059669", description: "Meaningful revenue contribution" },
];

const MOCK_GRWTH_ITEMS = [
  { id: "1", company: "RELIANCE", title: "New Energy Solar Giga Factory", stage: "CONSTRUCTION", announced: "2023-08-15", target: "2024-12-31", actual: null, capex: 25000, progress: 45, notes: "Phase 1: 10GW module, 5GW cell" },
  { id: "2", company: "RELIANCE", title: "Jio 5G Rollout Pan-India", stage: "COMMERCIAL", announced: "2022-10-01", target: "2023-12-31", actual: "2024-01-15", capex: 200000, progress: 100, notes: "All 22 circles covered" },
  { id: "3", company: "TCS", title: "New Delivery Center - Hyderabad", stage: "TRIAL_RUNS", announced: "2023-06-01", target: "2024-06-30", actual: null, capex: 1500, progress: 80, notes: "5,000 seats, AI/ML focus" },
  { id: "4", company: "HDFCBANK", title: "New Branch Network Expansion", stage: "ANNOUNCED", announced: "2024-01-15", target: "2025-03-31", actual: null, capex: 500, progress: 10, notes: "200 new branches in Tier 2/3" },
  { id: "5", company: "BAJFINANCE", title: "Consumer Durables Financing Platform", stage: "ENV_CLEARANCE", announced: "2023-11-01", target: "2024-09-30", actual: null, capex: 200, progress: 25, notes: "Digital lending platform" },
  { id: "6", company: "TRENT", title: "Westside Store Expansion", stage: "REVENUE", announced: "2022-04-01", target: "2023-06-30", actual: "2023-05-15", capex: 300, progress: 100, notes: "50 new stores, strong same-store sales" },
  { id: "7", company: "PERSISTENT", title: "AWS Cloud Center of Excellence", stage: "CONSTRUCTION", announced: "2023-09-01", target: "2024-08-31", actual: null, capex: 800, progress: 60, notes: "Cloud migration services" },
  { id: "8", company: "COFORGE", title: "European Delivery Center - Poland", stage: "TRIAL_RUNS", announced: "2023-07-15", target: "2024-06-30", actual: null, capex: 1200, progress: 85, notes: "Nearshore delivery for EU clients" },
];

const getDefaultProgress = (stage: string) => {
    const progressMap: Record<string, number> = {
      ANNOUNCED: 10,
      ENV_CLEARANCE: 25,
      CONSTRUCTION: 50,
      TRIAL_RUNS: 75,
      COMMERCIAL: 90,
      REVENUE: 100,
    };
    return progressMap[stage] || 0;
  };

  const getStageColor = (stage: string) => {
    return GRWTH_STAGES.find(s => s.id === stage)?.color || "#6B7280";
  };

  const getStageLabel = (stage: string) => {
    return GRWTH_STAGES.find(s => s.id === stage)?.label || stage;
  };

export default function GrwthPipelinePage() {
  const [items, setItems] = useState(MOCK_GRWTH_ITEMS);
  const [filteredItems, setFilteredItems] = useState(MOCK_GRWTH_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "gantt" | "table">("kanban");
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    let result = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.company.toLowerCase().includes(q) ||
        d.notes.toLowerCase().includes(q)
      );
    }
    if (companyFilter !== "all") {
      result = result.filter(d => d.company === companyFilter);
    }
    if (stageFilter !== "all") {
      result = result.filter(d => d.stage === stageFilter);
    }
    setFilteredItems(result);
  }, [items, searchQuery, companyFilter, stageFilter]);

  const moveItem = (itemId: string, newStage: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, stage: newStage, progress: getDefaultProgress(newStage) } : item
    ));
  };

  

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">GRWTH Pipeline Tracker</h1>
          <p className="text-sm text-muted-foreground">Track capex milestones, operational catalysts, and revenue accretion</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border rounded-lg p-2 bg-muted/30">
            <Button variant={viewMode === "kanban" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("kanban")}><Layers className="h-4 w-4" /><span className="ml-1 hidden sm:inline">Kanban</span></Button>
            <Button variant={viewMode === "gantt" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("gantt")}><TrendingUpIcon className="h-4 w-4" /><span className="ml-1 hidden sm:inline">Gantt</span></Button>
            <Button variant={viewMode === "table" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("table")}><ClipboardList className="h-4 w-4" /><span className="ml-1 hidden sm:inline">Table</span></Button>
          </div>
          <Button onClick={() => setEditingItem({})}><Plus className="mr-2 h-4 w-4" /> New Milestone</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border rounded-lg p-4 bg-muted/30 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Search title, company, notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Companies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {MOCK_COMPANIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.symbol}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Stages" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {GRWTH_STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {GRWTH_STAGES.map(stage => {
          const count = filteredItems.filter(i => i.stage === stage.id).length;
          const capex = filteredItems.filter(i => i.stage === stage.id).reduce((sum, i) => sum + i.capex, 0);
          return (
            <Card key={stage.id} className="border-l-4" style={{ borderLeftColor: stage.color }}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stage.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Capex (Cr)</p>
                    <p className="font-bold">{capex.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Views */}
      {viewMode === "kanban" && (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {GRWTH_STAGES.map(stage => {
              const stageItems = filteredItems.filter(i => i.stage === stage.id);
              return (
                <div key={stage.id} className="min-w-[320px] max-w-[320px] flex flex-col">
                  <div className="flex items-center justify-between mb-3 p-3 rounded-t-lg" style={{ backgroundColor: stage.color + "20" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="font-medium text-sm">{stage.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{stageItems.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto p-3 bg-muted/20 rounded-b-lg min-h-[400px]" 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const itemId = e.dataTransfer.getData("itemId");
                      if (itemId) moveItem(itemId, stage.id);
                    }}>
                    {stageItems.map(item => (
                      <MilestoneCard 
                        key={item.id} 
                        item={item} 
                        stageColor={stage.color}
                        onDragStart={(e) => e.dataTransfer.setData("itemId", item.id)}
                        onClick={() => setEditingItem(item)}
                      />
                    ))}
                    {stageItems.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Drop milestones here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

      {viewMode === "gantt" && (
        <div className="flex-1 overflow-auto">
          <GanttChart items={filteredItems} stages={GRWTH_STAGES} />
        </div>
        )}

      {viewMode === "table" && (
        <div className="flex-1 overflow-hidden border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Announced</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Capex (Cr)</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id} onClick={() => setEditingItem(item)}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell><Badge variant="outline">{item.company}</Badge></TableCell>
                  <TableCell>
                    <Badge style={{ backgroundColor: getStageColor(item.stage) + "20", color: getStageColor(item.stage) }}>
                      {getStageLabel(item.stage)}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.announced}</TableCell>
                  <TableCell>{item.target}</TableCell>
                  <TableCell>{item.actual || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-right font-mono">{item.capex.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full" style={{ width: `${item.progress}%`, backgroundColor: getStageColor(item.stage) }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{item.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingItem(null)}>
          <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">{editingItem.id ? "Edit Milestone" : "New Milestone"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setEditingItem(null)}><XCircle className="h-5 w-5" /></Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Project Title</Label><Input value={editingItem.title || ""} onChange={(e) => setEditingItem({...editingItem, title: e.target.value})} placeholder="Project title" /></div>
                <div><Label>Company</Label>
                  <Select value={editingItem.company || "RELIANCE"} onValueChange={(v) => setEditingItem({...editingItem, company: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MOCK_COMPANIES.map(c => <SelectItem key={c.symbol} value={c.symbol}>{c.symbol}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Stage</Label>
                  <Select value={editingItem.stage || "ANNOUNCED"} onValueChange={(v) => setEditingItem({...editingItem, stage: v, progress: getDefaultProgress(v)})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{GRWTH_STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Capex (Cr)</Label><Input type="number" value={editingItem.capex || 0} onChange={(e) => setEditingItem({...editingItem, capex: parseFloat(e.target.value) || 0})} /></div>
                <div><Label>Announced Date</Label><Input type="date" value={editingItem.announced || ""} onChange={(e) => setEditingItem({...editingItem, announced: e.target.value})} /></div>
                <div><Label>Target Date</Label><Input type="date" value={editingItem.target || ""} onChange={(e) => setEditingItem({...editingItem, target: e.target.value})} /></div>
                <div><Label>Actual Date</Label><Input type="date" value={editingItem.actual || ""} onChange={(e) => setEditingItem({...editingItem, actual: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Progress %</Label><Input type="number" min="0" max="100" value={editingItem.progress || 0} onChange={(e) => setEditingItem({...editingItem, progress: parseFloat(e.target.value) || 0})} /></div>
                </div>
              </div>
              <div><Label>Notes</Label><Textarea value={editingItem.notes || ""} onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})} placeholder="Notes..." rows={3} /></div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={() => { /* Save logic */ setEditingItem(null); }}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MilestoneCard({ item, stageColor, onDragStart, onClick }: { item: any; stageColor: string; onDragStart: (e: React.DragEvent) => void; onClick: () => void }) {
  return (
    <div 
      className="p-3 bg-background border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      style={{ borderLeft: `4px solid ${stageColor}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-sm truncate flex-1">{item.title}</span>
        <Badge variant="outline" className="text-xs whitespace-nowrap">{item.company}</Badge>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Target: {item.target}</div>
        {item.actual && <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-600" /> Done: {item.actual}</div>}
        <div className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Capex: ₹{item.capex.toLocaleString()} Cr</div>
      </div>
      <div className="mt-2">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full transition-all duration-300" style={{ width: `${item.progress}%`, backgroundColor: stageColor }} />
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>{item.progress}% complete</span>
          <span style={{ color: stageColor }}>{getStageLabel(item.stage)}</span>
        </div>
      </div>
    </div>
  );
}

function GanttChart({ items, stages }: { items: any[]; stages: any[] }) {
  const today = new Date();
  const startDate = new Date(Math.min(...items.map(i => new Date(i.announced).getTime())));
  const endDate = new Date(Math.max(...items.map(i => new Date(i.target).getTime())));
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const pxPerDay = 2;

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="flex">
        {/* Left: Project list */}
        <div className="w-64 border-r bg-muted/30 flex-shrink-0 overflow-y-auto">
          <div className="p-2 font-medium border-b">Projects</div>
          {items.map(item => (
            <div key={item.id} className="p-2 border-b hover:bg-muted/50 cursor-pointer text-sm">
              <div className="font-medium truncate">{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.company} • ₹{item.capex} Cr</div>
            </div>
          ))}
        </div>

        {/* Right: Timeline */}
        <div className="flex-1 overflow-x-auto" style={{ minWidth: `${totalDays * pxPerDay}px` }}>
          {/* Header */}
          <div className="sticky top-0 bg-background border-b z-10">
            <div style={{ width: `${totalDays * pxPerDay}px` }} className="flex">
              {Array.from({ length: Math.ceil(totalDays / 30) }).map((_, i) => {
                const date = new Date(startDate.getTime() + i * 30 * 24 * 60 * 60 * 1000);
                return (
                  <div key={i} className="border-r text-center text-xs text-muted-foreground py-1" style={{ width: `${30 * pxPerDay}px` }}>
                    {date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                );
              })}
            </div>

            {/* Bars */}
            <div style={{ width: `${totalDays * pxPerDay}px` }}>
              {items.map((item, i) => {
                const start = (new Date(item.announced).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                const end = (new Date(item.target).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
                const left = start * pxPerDay;
                const width = Math.max(20, (end - start) * pxPerDay);
                const stage = GRWTH_STAGES.find(s => s.id === item.stage);
                const color = stage?.color || "#6B7280";

                return (
                  <div
                    key={item.id}
                    className="absolute h-8 rounded cursor-pointer"
                    style={{
                      left: `${left}px`,
                      top: `${50 + i * 36}px`,
                      width: `${width}px`,
                      backgroundColor: color,
                      opacity: 0.8,
                    }}
                    title={`${item.title} (${item.company})`}
                  >
                    <div className="flex items-center justify-between p-1 text-white text-xs font-medium truncate pr-2">
                      <span>{item.title}</span>
                      <span className="opacity-70">{item.progress}%</span>
                    </div>
                  </div>
                );
              })}
              {/* Today line */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: `${(today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) * pxPerDay}px` }} />
            </div>
          </div>
        </div>
      </div>
      </div>
    );
}
