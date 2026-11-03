"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit, Save, Download, Clock, FileText } from "lucide-react";

export default function SimpleTextBox() {
  const [title, setTitle] = useState("Quick Notes");
  const [content, setContent] = useState("Type your notes here...\n\nThis is a simple text box for quick annotations, observations, and reminders.");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [lastSaved, setLastSaved] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = () => {
    setContent(editContent);
    setLastSaved(new Date().toISOString().split("T")[0]);
    setIsEditing(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <Input value={title} onChange={e => setTitle(e.target.value)} className="font-medium border-0 p-0 h-auto text-base" />
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}><Save className="mr-1 h-3 w-3" /> Save</Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => { setIsEditing(true); setEditContent(content); }}>
              <Edit className="mr-1 h-3 w-3" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isEditing ? (
          <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="flex-1 min-h-[150px] font-mono text-sm" />
        ) : (
          <div className="flex-1 p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm">{content}</div>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last saved: {lastSaved}
          </div>
          <Badge variant="outline" className="text-xs">{content.split(/\s+/).length} words</Badge>
        </div>
      </CardContent>
    </Card>
  );
}