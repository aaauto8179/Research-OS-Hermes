"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Palette, Type, Layout, Component, CheckCircle, AlertCircle, Info, 
  ChevronRight, Star, Heart, Settings, Bell, Search, Plus, Trash2, Download 
} from "lucide-react";

export default function UIPrimitives() {
  const [activeTab, setActiveTab] = useState("buttons");
  const [checked, setChecked] = useState(false);
  const [progress, setProgress] = useState(65);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>UI Primitives Showcase</CardTitle>
        <Badge variant="secondary" className="text-xs">Design System</Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="flex-1 mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Button Variants</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <h4 className="text-sm font-medium mt-4">Button Sizes</h4>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
              <h4 className="text-sm font-medium mt-4">With Icons</h4>
              <div className="flex flex-wrap gap-2">
                <Button><Plus className="mr-2 h-4 w-4" /> Add</Button>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                <Button variant="ghost"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                <Button variant="secondary"><Settings className="mr-2 h-4 w-4" /> Settings</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inputs" className="flex-1 mt-4 space-y-4">
            <div className="space-y-3">
              <div><Label>Text Input</Label><Input placeholder="Enter text..." className="mt-1" /></div>
              <div><Label>Select</Label>
                <Select><SelectTrigger className="mt-1"><SelectValue placeholder="Choose..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Option A</SelectItem>
                    <SelectItem value="b">Option B</SelectItem>
                    <SelectItem value="c">Option C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2"><Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} /><Label>Checkbox</Label></div>
              <div><Label>Textarea</Label><Textarea placeholder="Enter text..." className="mt-1" /></div>
              <div><Label>Progress: {progress}%</Label><div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2"><div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} /></div></div>
              <div><Label>Skeleton</Label><Skeleton className="h-4 w-full mt-2" /></div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="flex-1 mt-4 space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2"><Info className="h-4 w-4 text-blue-600" /><span className="font-medium text-blue-700">Info</span></div>
                <p className="text-sm text-blue-600 mt-1">This is an informational message.</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-600" /><span className="font-medium text-red-700">Error</span></div>
                <p className="text-sm text-red-600 mt-1">Something went wrong.</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /><span className="font-medium text-green-700">Success</span></div>
                <p className="text-sm text-green-600 mt-1">Operation completed successfully.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="flex-1 mt-4 space-y-4">
            <div className="space-y-3">
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <Card><CardContent className="p-4"><p className="text-sm font-medium">Card 1</p><p className="text-2xl font-bold">1,234</p></CardContent></Card>
                <Card><CardContent className="p-4"><p className="text-sm font-medium">Card 2</p><p className="text-2xl font-bold">5,678</p></CardContent></Card>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold">AB</span></div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold">CD</span></div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-bold">EF</span></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
