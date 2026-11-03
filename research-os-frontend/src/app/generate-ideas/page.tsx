"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetRenderer } from "@/components/widgets/WidgetRegistry";
import { Lightbulb, Search, Zap, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function GenerateIdeasPage() {
  const [activeTab, setActiveTab] = useState("pipeline");

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6" /> Generate Ideas
          </h1>
          <p className="text-sm text-muted-foreground">Idea generation pipeline, screening, and research queue</p>
        </div>
        <div className="flex items-center gap-2">
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pipeline"><Lightbulb className="mr-2 h-4 w-4" /> Idea Pipeline</TabsTrigger>
          <TabsTrigger value="screening"><Search className="mr-2 h-4 w-4" /> Screening Table</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="flex-1 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            <div className="lg:col-span-2 min-h-[600px]">
              <WidgetRenderer type="idea-generation" />
            </div>
            <div className="space-y-4">
              <Card className="h-[300px]">
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start gap-2" variant="outline"><Zap className="h-4 w-4" /> Run Quality Screen</Button>
                  <Button className="w-full justify-start gap-2" variant="outline"><Search className="h-4 w-4" /> Run Growth Screen</Button>
                  <Button className="w-full justify-start gap-2" variant="outline"><Zap className="h-4 w-4" /> Run Value Screen</Button>
                  <Button className="w-full justify-start gap-2" variant="default"><ArrowUpRight className="h-4 w-4" /> Promote Top 5 to Weigh</Button>
                </CardContent>
              </Card>
              <Card className="h-[300px]">
                <CardHeader><CardTitle>Pipeline Stats</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span>New Ideas</span><Badge variant="outline">12</Badge></div>
                  <div className="flex justify-between"><span>Researching</span><Badge variant="default">5</Badge></div>
                  <div className="flex justify-between"><span>Weighing</span><Badge variant="secondary">3</Badge></div>
                  <div className="flex justify-between"><span>Rejected</span><Badge variant="destructive">8</Badge></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-medium">In Portfolio</span><Badge variant="default">2</Badge></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="screening" className="flex-1 mt-4">
          <WidgetRenderer type="screening-table" />
        </TabsContent>
      </Tabs>
    </div>
  );
}