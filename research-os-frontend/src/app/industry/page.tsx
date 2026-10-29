"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Building2, DollarSign, TrendingUp, BarChart2, TrendingUp as TrendingUpIcon, LayoutDashboard, ArrowLeft, Link, BarChart3, ArrowRight } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardCanvas } from "@/components/DashboardCanvas";
import { MetricCard } from "@/components/ui/metric-card";

const INDUSTRIES = [
  { code: "AUTO", name: "Automobiles & Auto Components", companies: 15, mcap: 1200000, revenue_growth: 12, ebitda_margin: 14, roe: 15 },
  { code: "BANKING", name: "Banking & Financial Services", companies: 25, mcap: 3500000, revenue_growth: 18, ebitda_margin: 0, roe: 16 },
  { code: "CEMENT", name: "Cement & Building Materials", companies: 10, mcap: 400000, revenue_growth: 8, ebitda_margin: 18, roe: 12 },
  { code: "CHEMICALS", name: "Chemicals", companies: 12, mcap: 600000, revenue_growth: 15, ebitda_margin: 20, roe: 18 },
  { code: "CONSUMER", name: "Consumer Goods (FMCG)", companies: 18, mcap: 1800000, revenue_growth: 9, ebitda_margin: 22, roe: 25 },
  { code: "INFRA", name: "Infrastructure & Construction", companies: 15, mcap: 500000, revenue_growth: 14, ebitda_margin: 10, roe: 11 },
  { code: "IT_SERVICES", name: "IT Services", companies: 20, mcap: 2200000, revenue_growth: 10, ebitda_margin: 24, roe: 28 },
  { code: "METALS", name: "Metals & Mining", companies: 12, mcap: 800000, revenue_growth: 6, ebitda_margin: 16, roe: 14 },
  { code: "OIL_GAS", name: "Oil, Gas & Consumable Fuels", companies: 8, mcap: 2000000, revenue_growth: 11, ebitda_margin: 13, roe: 13 },
  { code: "PHARMA", name: "Pharmaceuticals", companies: 15, mcap: 900000, revenue_growth: 13, ebitda_margin: 21, roe: 17 },
  { code: "POWER", name: "Power & Utilities", companies: 10, mcap: 600000, revenue_growth: 7, ebitda_margin: 25, roe: 12 },
  { code: "REALTY", name: "Real Estate", companies: 12, mcap: 400000, revenue_growth: 15, ebitda_margin: 18, roe: 10 },
  { code: "TELECOM", name: "Telecommunications", companies: 4, mcap: 600000, revenue_growth: 8, ebitda_margin: 30, roe: 8 },
  { code: "TEXTILES", name: "Textiles & Apparel", companies: 10, mcap: 200000, revenue_growth: 10, ebitda_margin: 12, roe: 11 },
];

export default function IndustryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const filteredIndustries = useMemo(() =>
    INDUSTRIES.filter(i =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const totalMcap = useMemo(() => INDUSTRIES.reduce((s, i) => s + i.mcap, 0), []);
  const avgRevenueGrowth = useMemo(() => INDUSTRIES.reduce((s, i) => s + i.revenue_growth, 0) / INDUSTRIES.length, []);
  const avgEbitdaMargin = useMemo(() => INDUSTRIES.filter(i => i.ebitda_margin > 0).reduce((s, i) => s + i.ebitda_margin, 0) / INDUSTRIES.filter(i => i.ebitda_margin > 0).length, []);
  const avgRoe = useMemo(() => INDUSTRIES.reduce((s, i) => s + i.roe, 0) / INDUSTRIES.length, []);

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Industry Analysis</h1>
          <p className="text-sm text-muted-foreground">Structural analysis, competitive benchmarking, and value chain economics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <MetricCard label="Industries Tracked" value={INDUSTRIES.length} icon={Building2} />
        <MetricCard label="Total Mkt Cap" value={"₹" + (totalMcap/100).toFixed(0) + " Cr"} icon={DollarSign} />
        <MetricCard label="Avg Rev Growth" value={avgRevenueGrowth.toFixed(1) + "%"} icon={TrendingUp} />
        <MetricCard label="Avg EBITDA Margin" value={avgEbitdaMargin.toFixed(1) + "%"} icon={BarChart2} />
        <MetricCard label="Avg ROE" value={avgRoe.toFixed(1) + "%"} icon={TrendingUpIcon} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="detail"><Building2 className="mr-2 h-4 w-4" /> Deep Dive</TabsTrigger>
          <TabsTrigger value="compare"><BarChart3 className="mr-2 h-4 w-4" /> Compare</TabsTrigger>
          <TabsTrigger value="dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Custom Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 mt-4 space-y-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search industry..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredIndustries.map(ind => (
              <IndustryCard key={ind.code} industry={ind} onClick={() => { setSelectedIndustry(ind.code); setActiveTab("detail"); }} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detail" className="flex-1 mt-4 space-y-4">
          {selectedIndustry ? (
            <IndustryDetail industryCode={selectedIndustry} onBack={() => { setSelectedIndustry(null); setActiveTab("overview"); }} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Select an industry from Overview</h3>
                <p className="text-sm">Click on any industry card to see deep dive analysis</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compare" className="flex-1 mt-4 space-y-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search industries to compare..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
          </div>
          <IndustryCompareTable industries={filteredIndustries} />
        </TabsContent>

        <TabsContent value="dashboard" className="flex-1 mt-4">
          <DashboardCanvas context="industry" contextKey="all" className="h-[calc(100%-80px)]" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IndustryCard({ industry, onClick }: { industry: any; onClick: () => void }) {
  const color = industry.ebitda_margin > 20 ? "green" : industry.ebitda_margin > 15 ? "yellow" : "red";

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: color === "green" ? "green" : color === "yellow" ? "yellow" : "red" }} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{industry.code}</span>
          <Badge variant="secondary" className="text-xs">{industry.companies} cos</Badge>
        </div>
        <h3 className="font-semibold mt-1">{industry.name}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Mkt Cap</p><p className="font-bold">₹{(industry.mcap/100).toFixed(0)} Cr</p></div>
          <div className="p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Companies</p><p className="font-bold">{industry.companies}</p></div>
          <div className="p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">Rev Growth</p><p className="font-bold">{industry.revenue_growth}%</p></div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">EBITDA %</p><p className="font-bold">{industry.ebitda_margin > 0 ? industry.ebitda_margin + "%" : "N/A"}</p></div>
          <div className="p-2 bg-muted/50 rounded"><p className="text-xs text-muted-foreground">ROE</p><p className="font-bold">{industry.roe}%</p></div>
        </div>
      </CardContent>
    </Card>
  );
}

function IndustryDetail({ industryCode, onBack }: { industryCode: string; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold">{industryCode} Detail View</h2>
        </div>
        <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Overview</Button>
      </div>

      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">Deep dive for {industryCode}</h3>
          <p className="text-sm">Detailed industry analysis with demand drivers, supply dynamics, regulations, and value chain</p>
        </div>
      </div>
    </div>
  );
}

function IndustryCompareTable({ industries }: { industries: any[] }) {
  return (
    <div className="overflow-hidden border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Industry</TableHead>
            <TableHead className="text-right">Companies</TableHead>
            <TableHead className="text-right">Mkt Cap (Cr)</TableHead>
            <TableHead className="text-right">Rev Growth %</TableHead>
            <TableHead className="text-right">EBITDA %</TableHead>
            <TableHead className="text-right">ROE %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INDUSTRIES.map(ind => (
            <TableRow key={ind.code}>
              <TableCell className="font-medium">{ind.name}</TableCell>
              <TableCell className="text-right">{ind.companies}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">₹{(ind.mcap/100).toFixed(0)}</TableCell>
              <TableCell className="text-right">{ind.revenue_growth}%</TableCell>
              <TableCell className="text-right">{ind.ebitda_margin > 0 ? ind.ebitda_margin + "%" : "N/A"}</TableCell>
              <TableCell className="text-right">{ind.roe}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
