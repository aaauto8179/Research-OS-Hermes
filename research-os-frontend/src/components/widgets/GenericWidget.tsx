"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, Save, Edit, Download, CheckCircle, AlertCircle, Target, TrendingUp, TrendingDown, Shield, Users, Building2, DollarSign, FileText, Brain, Zap } from "lucide-react";

// Generic widget factory for simple table/text widgets
interface GenericWidgetProps {
  title: string;
  description?: string;
  columns?: string[];
  defaultRows?: string[][];
  textContent?: string;
}

export default function GenericWidget({ title, description, columns = ["Item", "Value", "Notes"], defaultRows = [], textContent }: GenericWidgetProps) {
  const [rows, setRows] = useState<string[][]>(defaultRows.length > 0 ? defaultRows : [Array(columns.length).fill("")]);
  const [text, setText] = useState(textContent || "");
  const [isEditing, setIsEditing] = useState(false);

  const addRow = () => setRows(prev => [...prev, Array(columns.length).fill("")]);
  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx));
  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setRows(prev => prev.map((row, i) => i === rowIdx ? row.map((c, j) => j === colIdx ? value : c) : row));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{rows.length} rows</Badge>
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="mr-1 h-3 w-3" /> Add</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => <TableHead key={i}>{col}</TableHead>)}
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {row.map((cell, colIdx) => (
                    <TableCell key={colIdx}>
                      <Input value={cell} onChange={e => updateCell(rowIdx, colIdx, e.target.value)} className="h-8 text-sm" placeholder={columns[colIdx]} />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(rowIdx)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {text && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg">
            <Textarea value={text} onChange={e => setText(e.target.value)} className="min-h-[60px] text-sm" placeholder="Notes..." />
          </div>
        )}
      </CardContent>
    </Card>
  );
}