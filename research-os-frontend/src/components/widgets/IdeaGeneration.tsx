"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, CheckCircle, AlertCircle, Calendar, Clock, Zap, Search, Filter, Lightbulb, TrendingUp, Brain, ArrowUpRight } from "lucide-react";

interface IdeaGenerationProps {
  onIdeaSelect?: (idea: any) => void;
}

const MOCK_IDEAS = [
  { id: "1", title: "RELIANCE - New Energy Capex Optionality", description: "₹75K Cr new energy capex not fully priced in. O2C + Retail + Jio steady compounding provides downside protection.", source: "SCREENING", status: "RESEARCHING", score: 92, tags: ["CONGLOMERATE", "NEW_ENERGY", "OPTIONALITY"], created: "2024-07-15" },
  { id: "2", title: "TRENT - Westside Store Expansion", description: "50 new stores/year, SSG 15%+, margin trajectory improving. ROE 28%+ with long runway.", source: "MANUAL", status: "WEIGHING", score: 88, tags: ["RETAIL", "CONSUMER", "GROWTH"], created: "2024-07-10" },
  { id: "3", title: "PERSISTENT - Cloud Migration Beneficiary", description: "AWS partnership, digital transformation tailwinds, margin expansion from 20% to 24%+.", source: "SCREENING", status: "NEW", score: 85, tags: ["IT", "CLOUD", "TRANSFORMATION"], created: "2024-07-12" },
  { id: "4", title: "BAJFINANCE - Credit Cost Normalization", description: "Credit costs peaked, provision coverage 85%+, NPA trends improving. ROE 22%+ at reasonable P/E.", source: "CONCALL", status: "RESEARCHING", score: 82, tags: ["NBFC", "CREDIT", "TURNAROUND"], created: "2024-07-08" },
  { id: "5", title: "COFORGE - Europe Nearshoring Play", description: "Poland delivery center ramp, nearshoring economics, BFSI vertical strength.", source: "SCREENING", status: "NEW", score: 78, tags: ["IT", "EUROPE", "NEARSHORING"], created: "2024-07-14" },
];

const SOURCES = ["ALL", "SCREENING", "MANUAL", "CONCALL", "NEWS", "READING"];
const STATUSES = ["ALL", "NEW", "RESEARCHING", "WEIGHING", "REJECTED", "PORTFOLIO"];

export default function IdeaGeneration({ onIdeaSelect }: IdeaGenerationProps) {
  const [ideas, setIdeas] = useState(MOCK_IDEAS);
  const [filteredIdeas, setFilteredIdeas] = useState(MOCK_IDEAS);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: "", description: "", source: "MANUAL", tags: "" });

  useEffect(() => {
    let result = [...ideas];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (sourceFilter !== "ALL") result = result.filter(i => i.source === sourceFilter);
    if (statusFilter !== "ALL") result = result.filter(i => i.status === statusFilter);
    setFilteredIdeas(result);
  }, [ideas, searchQuery, sourceFilter, statusFilter]);

  const addIdea = () => {
    if (!newIdea.title.trim()) return;
    const newId = Date.now().toString();
    setIdeas(prev => [...prev, { 
      id: newId, 
      title: newIdea.title, 
      description: newIdea.description, 
      source: newIdea.source, 
      status: "NEW", 
      score: 0, 
      tags: newIdea.tags.split(",").map(t => t.trim()), 
      created: new Date().toISOString().split("T")[0] 
    }]);
    setNewIdea({ title: "", description: "", source: "MANUAL", tags: "" });
    setShowCreate(false);
  };

  const updateIdeaStatus = (id: string, status: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const deleteIdea = (id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const promoteToWeigh = (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (idea && onIdeaSelect) onIdeaSelect(idea);
    updateIdeaStatus(id, "WEIGHING");
  };

  // Ideas table content
  const ideasTableContent = filteredIdeas.length === 0 ? (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
        No ideas found. Add a new idea or adjust filters.
      </TableCell>
    </TableRow>
  ) : (
    filteredIdeas.map(idea => (
      <TableRow key={idea.id}>
        <TableCell className="font-bold text-right">
          <Badge variant={idea.score >= 85 ? "default" : idea.score >= 75 ? "secondary" : "outline"}>{idea.score}</Badge>
        </TableCell>
        <TableCell className="font-medium max-w-xs truncate">{idea.title}</TableCell>
        <TableCell><Badge variant="outline" className="text-xs">{idea.source}</Badge></TableCell>
        <TableCell>
          <Badge variant={
            idea.status === "NEW" ? "outline" :
            idea.status === "RESEARCHING" ? "default" :
            idea.status === "WEIGHING" ? "secondary" :
            idea.status === "REJECTED" ? "destructive" : "success"
          } className="text-xs">{idea.status}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {idea.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
            {idea.tags.length > 3 && <Badge variant="secondary" className="text-[10px]">+{idea.tags.length - 3}</Badge>}
          </div>
        </TableCell>
        <TableCell className="text-sm">{idea.created}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => promoteToWeigh(idea.id)} title="Promote to Weigh Decisions"><ArrowUpRight className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => updateIdeaStatus(idea.id, "RESEARCHING")} title="Start Research"><Brain className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => updateIdeaStatus(idea.id, "REJECTED")} title="Reject"><Trash2 className="h-4 w-4 text-red-600" /></Button>
          </div>
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Idea Generation Pipeline</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">{filteredIdeas.length} ideas</Badge>
          <Button variant="outline" size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="mr-1 h-3 w-3" /> {showCreate ? "Cancel" : "New Idea"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Create Form */}
        {showCreate && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <Input value={newIdea.title} onChange={e => setNewIdea({...newIdea, title: e.target.value})} placeholder="Idea title (e.g., TRENT - Westside Expansion)" autoFocus />
              </div>
              <div className="md:col-span-2">
                <Input value={newIdea.description} onChange={e => setNewIdea({...newIdea, description: e.target.value})} placeholder="Thesis description..." />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Select value={newIdea.source} onValueChange={v => setNewIdea({...newIdea, source: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["MANUAL", "SCREENING", "CONCALL", "NEWS", "READING"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input value={newIdea.tags} onChange={e => setNewIdea({...newIdea, tags: e.target.value})} placeholder="Tags (comma separated)" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => { setShowCreate(false); setNewIdea({ title: "", description: "", source: "MANUAL", tags: "" }); }}>Cancel</Button>
                <Button onClick={addIdea} disabled={!newIdea.title.trim()}>Add Idea</Button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Search ideas..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Idea Table */}
        <div className="flex-1 overflow-hidden border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Score</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ideasTableContent}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}