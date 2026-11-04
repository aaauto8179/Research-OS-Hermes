"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, Save, Edit, Download, CheckCircle, AlertCircle, Target, TrendingUp, TrendingDown, Shield, Users, Building2, DollarSign, FileText } from "lucide-react";

interface CustomTableWidgetProps {
  title: string;
  columns: string[];
  rows?: string[][];
  addRowLabel?: string;
}

export default function CustomTableWidget({ title, columns, rows = [], addRowLabel = "Add Row" }: CustomTableWidgetProps) {
  const [data, setData] = useState<string[][]>(rows.length > 0 ? rows : [Array(columns.length).fill("")]);
  const [isEditing, setIsEditing] = useState(false);

  const addRow = () => setData(prev => [...prev, Array(columns.length).fill("")]);
  const removeRow = (idx: number) => setData(prev => prev.filter((_, i) => i !== idx));
  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setData(prev => prev.map((row, i) => i === rowIdx ? row.map((c, j) => j === colIdx ? value : c) : row));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">{data.length} rows</Badge>
          <Button variant="outline" size="sm" onClick={addRow}><Plus className="mr-1 h-3 w-3" /> {addRowLabel}</Button>
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
              {data.map((row, rowIdx) => (
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
      </CardContent>
    </Card>
  );
}