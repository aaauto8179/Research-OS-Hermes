"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, Download, Edit, Eye, Clock, User } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

const MOCK_NOTES: Note[] = [
  { id: "1", title: "RELIANCE Thesis", content: "O2C integration + Retail + Digital optionality at fair valuation. Base case 18% upside.", author: "Analyst", createdAt: "2024-01-15", updatedAt: "2024-01-20", tags: ["thesis", "reliance"] },
  { id: "2", title: "TCS Risk Factors", content: "US banking vertical slowdown, margin compression from wage inflation, attrition risk.", author: "Analyst", createdAt: "2024-01-10", updatedAt: "2024-01-12", tags: ["risk", "tcs"] },
  { id: "3", title: "HDFCBANK Merger Notes", content: "Merger with HDFC Ltd creates largest private bank. NIM compression short-term, synergies long-term.", author: "Analyst", createdAt: "2023-12-05", updatedAt: "2024-01-08", tags: ["merger", "hdfc"] },
];

export default function MultiTextBox() {
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [activeNote, setActiveNote] = useState<Note | null>(notes[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const handleNewNote = () => {
    const note: Note = {
      id: String(Date.now()),
      title: newTitle || "Untitled Note",
      content: "",
      author: "Analyst",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      tags: [],
    };
    setNotes(prev => [note, ...prev]);
    setActiveNote(note);
    setIsEditing(true);
    setEditContent("");
    setNewTitle("");
  };

  const handleSave = () => {
    if (!activeNote) return;
    setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, content: editContent, updatedAt: new Date().toISOString().split("T")[0] } : n));
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(notes[0] || null);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Multi-Text Notes</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{notes.length} notes</Badge>
          <Button variant="outline" size="sm" onClick={handleNewNote}><Plus className="mr-1 h-3 w-3" /> New Note</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Note List */}
          <div className="space-y-2 overflow-auto">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => { setActiveNote(note); setIsEditing(false); setEditContent(note.content); }}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${activeNote?.id === note.id ? "bg-muted border-primary" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm truncate">{note.title}</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); handleDelete(note.id); }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{note.content}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{note.updatedAt}</span>
                  {note.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </div>
            ))}
          </div>

          {/* Note Editor */}
          <div className="lg:col-span-2 flex flex-col">
            {activeNote ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{activeNote.title}</h3>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleSave}><Save className="mr-1 h-3 w-3" /> Save</Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditContent(activeNote.content); }}>
                        <Edit className="mr-1 h-3 w-3" /> Edit
                      </Button>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 min-h-[200px] font-mono text-sm" placeholder="Write your notes here..." />
                ) : (
                  <div className="flex-1 p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">{activeNote.content || "No content yet. Click Edit to add content."}</div>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" /> {activeNote.author}
                  <Clock className="h-3 w-3 ml-2" /> Created: {activeNote.createdAt}
                  <Clock className="h-3 w-3 ml-2" /> Updated: {activeNote.updatedAt}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a note or create a new one
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}