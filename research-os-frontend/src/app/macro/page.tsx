"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  Plus, Eye, Download, Settings, AlertTriangle,
  TrendingUp, TrendingDown, Target, Zap,
  Building2, Briefcase, BarChart2, FileText,
  Layers, ClipboardList, Calculator, Lightbulb,
  CheckCircle, XCircle, HelpCircle, Pencil,
  Save, Undo2, Redo2, Loader2,
  Calendar, Flag, Truck, Factory, Zap as ZapIcon,
  DollarSign, TrendingUp as TrendingUpIcon,
  PieChart, RefreshCw, ArrowUpRight, ArrowDownRight,
  Star, Bell, Minus, LineChart, Activity, Gauge
} from "lucide-react";

const MACRO_INDICATORS = [
  { code: "GDP_GROWTH", name: "Real GDP Growth (YoY%)", value: 7.8, unit: "%", frequency: "QUARTERLY", source: "MOSPI", trend: "up", percentile: 65, sparkline: [6.2, 6.8, 7.1, 7.5, 7.2, 7.8, 7.6, 7.8] },
  { code: "REPO_RATE", name: "RBI Repo Rate", value: 6.5, unit: "%", frequency: "DAILY", source: "RBI", trend: "neutral", percentile: 62, sparkline: [4.0, 4.4, 4.9, 5.4, 5.9, 6.25, 6.5, 6.5] },
  { code: "CPI_INFLATION", name: "CPI Inflation", value: 5.1, unit: "%", frequency: "MONTHLY", source: "MOSPI", trend: "down", percentile: 45, sparkline: [7.4, 7.0, 6.7, 6.2, 5.7, 5.1, 4.8, 5.1] },
  { code: "GS10_YIELD", name: "10Y G-Sec Yield", value: 7.05, unit: "%", frequency: "DAILY", source: "RBI", trend: "up", percentile: 58, sparkline: [7.3, 7.2, 7.1, 7.0, 7.05, 7.1, 7.08, 7.05] },
  { code: "USD_INR", name: "USD/INR", value: 83.12, unit: "₹", frequency: "DAILY", source: "RBI", trend: "down", percentile: 72, sparkline: [82.8, 83.1, 83.2, 83.0, 82.9, 83.1, 83.05, 83.12] },
  { code: "BRENT_CRUDE", name: "Brent Crude Oil", value: 84.5, unit: "$/bbl", frequency: "DAILY", source: "TRADING_ECONOMICS", trend: "up", percentile: 55, sparkline: [78, 80, 82, 81, 83, 84, 84.2, 84.5] },
  { code: "IIP", name: "Index of Industrial Production", value: 5.2, unit: "%", frequency: "MONTHLY", source: "MOSPI", trend: "up", percentile: 60, sparkline: [3.8, 4.2, 4.5, 4.8, 5.0, 5.1, 5.2, 5.2] },
  { code: "CORE_SECTOR", name: "Core Sector Growth", value: 6.8, unit: "%", frequency: "MONTHLY", source: "MOSPI", trend: "up", percentile: 58, sparkline: [4.5, 5.0, 5.5, 5.8, 6.0, 6.2, 6.5, 6.8] },
];

const MARKET_METRICS = [
  { code: "NIFTY50", name: "NIFTY 50", value: 24850, change: 1.2, changePct: 0.49, trend: "up" },
  { code: "NIFTY_NEXT50", name: "NIFTY Next 50", value: 58200, change: 0.8, changePct: 0.38, trend: "up" },
  { code: "NIFTY_MIDCAP150", name: "NIFTY Midcap 150", value: 18500, change: 1.5, changePct: 0.82, trend: "up" },
  { code: "NIFTY_SMALLCAP250", name: "NIFTY Smallcap 250", value: 12800, change: 2.1, changePct: 1.67, trend: "up" },
  { code: "SENSEX", name: "S&P BSE Sensex", value: 81500, change: 1.1, changePct: 0.36, trend: "up" },
  { code: "NIFTY_PE", name: "NIFTY P/E", value: 22.8, change: -0.2, changePct: -0.87, trend: "down" },
  { code: "NIFTY_PB", name: "NIFTY P/B", value: 3.8, change: 0.0, changePct: 0.0, trend: "neutral" },
  { code: "BUFFETT_INDIA", name: "MCap/GDP (Buffett)", value: 1.12, change: 0.02, changePct: 1.8, trend: "up" },
];

const VALUATION_HISTORY = [
  { period: "2020-03", nifty_pe: 17.2, nifty_pb: 2.8, mcap_gdp: 0.72 },
  { period: "2020-06", nifty_pe: 24.5, nifty_pb: 3.2, mcap_gdp: 0.88 },
  { period: "2020-09", nifty_pe: 28.5, nifty_pb: 3.5, mcap_gdp: 1.02 },
  { period: "2020-12", nifty_pe: 32.1, nifty_pb: 3.8, mcap_gdp: 1.15 },
  { period: "2021-03", nifty_pe: 29.5, nifty_pb: 3.6, mcap_gdp: 1.08 },
  { period: "2021-06", nifty_pe: 26.8, nifty_pb: 3.4, mcap_gdp: 1.01 },
  { period: "2021-09", nifty_pe: 24.2, nifty_pb: 3.2, mcap_gdp: 0.95 },
  { period: "2021-12", nifty_pe: 22.5, nifty_pb: 3.1, mcap_gdp: 0.90 },
  { period: "2022-03", nifty_pe: 21.8, nifty_pb: 3.0, mcap_gdp: 0.88 },
  { period: "2022-06", nifty_pe: 20.5, nifty_pb: 2.9, mcap_gdp: 0.85 },
  { period: "2022-09", nifty_pe: 21.2, nifty_pb: 3.0, mcap_gdp: 0.87 },
  { period: "2022-12", nifty_pe: 20.8, nifty_pb: 2.9, mcap_gdp: 0.86 },
  { period: "2023-03", nifty_pe: 20.2, nifty_pb: 2.8, mcap_gdp: 0.84 },
  { period: "2023-06", nifty_pe: 21.5, nifty_pb: 2.9, mcap_gdp: 0.89 },
  { period: "2023-09", nifty_pe: 22.8, nifty_pb: 3.1, mcap_gdp: 0.95 },
  { period: "2023-12", nifty_pe: 23.5, nifty_pb: 3.2, mcap_gdp: 1.01 },
  { period: "2024-03", nifty_pe: 22.8, nifty_pb: 3.8, mcap_gdp: 1.12 },
];

export default function MacroPage() {
  const [activeTab, setActiveTab] = useState("indicators");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Macro Dashboard</h1>
          <p className="text-sm text-muted-foreground">Economic indicators, market valuation, and regime context for Indian equities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Data</Button>
          <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicators"><Gauge className="mr-2 h-4 w-4" /> Indicators</TabsTrigger>
          <TabsTrigger value="market"><BarChart2 className="mr-2 h-4 w-4" /> Market Metrics</TabsTrigger>
          <TabsTrigger value="valuation"><LineChart className="mr-2 h-4 w-4" /> Valuation History</TabsTrigger>
          <TabsTrigger value="regime"><Activity className="mr-2 h-4 w-4" /> Regime Analysis</TabsTrigger>
        </TabsList>

        {/* Indicators Tab */}
        <TabsContent value="indicators" className="flex-1 mt-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            {MACRO_INDICATORS.map(ind => (
              <MacroCard key={ind.code} indicator={ind} />
            ))}
          </div>
        </TabsContent>

        {/* Market Metrics Tab */}
        <TabsContent value="market" className="flex-1 mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MARKET_METRICS.map(m => (
              <MarketMetricCard key={m.code} metric={m} />
            ))}
          </div>
        </TabsContent>

        {/* Valuation History Tab */}
        <TabsContent value="valuation" className="flex-1 mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>NIFTY Valuation Cone</CardTitle>
                <Badge variant="outline">10Y History</Badge>
              </CardHeader>
              <CardContent>
                <ValuationChart data={VALUATION_HISTORY} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Valuation Percentiles (Current)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <ValuationPercentileRow label="NIFTY P/E" current={22.8} p10={18.5} p25={20.1} p50={22.5} p75={25.2} p90={28.5} />
                  <ValuationPercentileRow label="NIFTY P/B" current={3.8} p10={2.5} p25={2.8} p50={3.1} p75={3.5} p90={4.0} />
                  <ValuationPercentileRow label="MCap/GDP" current={1.12} p10={0.75} p25={0.85} p50={0.95} p75={1.05} p90={1.15} />
                  <ValuationPercentileRow label="NIFTY P/E (Midcap)" current={28.5} p10={20.1} p25={22.8} p50={26.2} p75={30.5} p90={34.0} />
                  <ValuationPercentileRow label="NIFTY P/E (Smallcap)" current={32.1} p10={22.0} p25={25.5} p50={29.8} p75={35.0} p90={40.2} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Regime Analysis Tab */}
        <TabsContent value="regime" className="flex-1 mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader><CardTitle>Current Regime Assessment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <RegimeCard title="Growth Regime" value="Above Trend" description="GDP growth above potential, credit growth healthy" color="green" />
                <RegimeCard title="Inflation Regime" value="Moderate" description="CPI within RBI target band, core inflation easing" color="green" />
                <RegimeCard title="Monetary Regime" value="Restrictive" description="Repo rate at 6.5%, real rates positive" color="yellow" />
                <RegimeCard title="Valuation Regime" value="Fair to Rich" description="NIFTY P/E near 10Y median, mid/small rich" color="yellow" />
                <RegimeCard title="External Regime" value="Stable" description="CAD manageable, reserves adequate, INR stable" color="green" />
                <RegimeCard title="Corporate Earnings" value="Strong" description="NIFTY earnings growth 15%+ YoY, broad-based" color="green" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Asset Allocation Implications</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <AllocationRow asset="Equity (Large Cap)" stance="Overweight" rationale="Earnings momentum, reasonable valuations" color="green" />
                <AllocationRow asset="Equity (Mid/Small)" stance="Neutral" rationale="Rich valuations, selective opportunities" color="yellow" />
                <AllocationRow asset="Equity (Banking)" stance="Overweight" rationale="Credit growth, asset quality improvement" color="green" />
                <AllocationRow asset="Debt (Short Duration)" stance="Overweight" rationale="Attractive carry, rate cut optionality" color="green" />
                <AllocationRow asset="Gold" stance="Neutral" rationale="Hedge against external shocks" color="yellow" />
                <AllocationRow asset="Cash" stance="Underweight" rationale="Deploy on corrections" color="red" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Key Risks to Monitor</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <RiskItem risk="Monsoon failure" impact="High" probability="Medium" desc="Rural demand, food inflation" />
                <RiskItem risk="Global recession" impact="High" probability="Low" desc="Export demand, risk-off flows" />
                <RiskItem risk="Geopolitical escalation" impact="Medium" probability="Medium" desc="Oil prices, supply chains" />
                <RiskItem risk="Fiscal slippage" impact="Medium" probability="Low" desc="Bond yields, crowding out" />
                <RiskItem risk="Regulatory uncertainty" impact="Medium" probability="Medium" desc="Sector-specific (fintech, gaming, crypto)" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MacroCard({ indicator }: { indicator: any }) {
  const trendColors = { up: "text-green-600", down: "text-red-600", neutral: "text-gray-600" };
  const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
  const TrendIcon = trendIcons[indicator.trend as keyof typeof trendIcons] || Minus;

  return (
    <Card className="border-l-4 min-w-[280px] flex-shrink-0" style={{ borderLeftColor: indicator.trend === "up" ? "green" : indicator.trend === "down" ? "red" : "gray" }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{indicator.name}</h4>
          <Badge variant="outline" className="text-xs">{indicator.frequency}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold tabular-nums">{indicator.value}</span>
          <span className="text-lg text-muted-foreground">{indicator.unit}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${trendColors[indicator.trend as keyof typeof trendColors]}`}>
            <TrendIcon className="inline h-4 w-4 mr-1" />
            {indicator.trend === "up" ? "Rising" : indicator.trend === "down" ? "Falling" : "Stable"}
          </span>
          <span className="text-xs text-muted-foreground">{indicator.percentile}th percentile (10Y)</span>
        </div>
        <div className="h-16 w-full">
          <Sparkline data={indicator.sparkline} color={indicator.trend === "up" ? "green" : indicator.trend === "down" ? "red" : "gray"} />
        </div>
        <div className="text-xs text-muted-foreground">Source: {indicator.source}</div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100 / (data.length - 1);

  return (
    <svg viewBox="0 0 100 16" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={data.map((d, i) => `${i * width},${16 - ((d - min) / range) * 14}`).join(" ")}
      />
      <circle cx={95} cy={16 - ((data[data.length - 1] - min) / range) * 14} r="2" fill={color} />
    </svg>
  );
}

function MarketMetricCard({ metric }: { metric: any }) {
  const trendColors = { up: "text-green-600", down: "text-red-600", neutral: "text-gray-600" };
  const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
  const TrendIcon = trendIcons[metric.trend as keyof typeof trendIcons] || Minus;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: metric.trend === "up" ? "green" : metric.trend === "down" ? "red" : "gray" }}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{metric.name}</h4>
          <Badge variant={metric.trend === "up" ? "default" : metric.trend === "down" ? "destructive" : "secondary"} className="text-xs">
            <TrendIcon className="inline h-3 w-3 mr-1" />
            {metric.changePct >= 0 ? "+" : ""}{metric.changePct.toFixed(2)}%
          </Badge>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tabular-nums">{metric.value.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">{metric.trend === "up" ? "▲" : metric.trend === "down" ? "▼" : "■"} {metric.change >= 0 ? "+" : ""}{metric.change.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ValuationChart({ data }: { data: any[] }) {
  const maxPE = Math.max(...data.map(d => d.nifty_pe));
  const minPE = Math.min(...data.map(d => d.nifty_pe));
  const range = maxPE - minPE || 1;
  const stepX = 100 / (data.length - 1);

  return (
    <div className="h-64 relative">
      <svg viewBox="0 0 100 64" className="w-full h-full" preserveAspectRatio="none">
        {/* Mean ± 1σ bands */}
        <rect x="0" y="0" width="100" height="64" fill="#f0fdf4" />
        {/* P/E line */}
        <polyline
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
          points={data.map((d, i) => `${i * stepX},${64 - ((d.nifty_pe - minPE) / (maxPE - minPE || 1)) * 56}`).join(" ")}
        />
        {/* Mean line */}
        <line x1="0" y1={64 - ((22 - minPE) / range) * 56} x2="100" y2={64 - ((22 - minPE) / range) * 56} stroke="#16a34a" strokeDasharray="4,4" strokeWidth="1" opacity="0.5" />
        {/* ±1σ lines */}
        <line x1="0" y1={64 - ((22 + 4.5 - minPE) / range) * 56} x2="100" y2={64 - ((22 + 4.5 - minPE) / range) * 56} stroke="#16a34a" strokeDasharray="2,2" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1={64 - ((22 - 4.5 - minPE) / range) * 56} x2="100" y2={64 - ((22 - 4.5 - minPE) / range) * 56} stroke="#16a34a" strokeDasharray="2,2" strokeWidth="0.5" opacity="0.3" />
        {/* Current point */}
        <circle cx={95} cy={64 - ((22.8 - minPE) / range) * 56} r="3" fill="#16a34a" />
        <text x="97" y={64 - ((22.8 - minPE) / range) * 56 - 4} fontSize="4" fill="#16a34a" fontWeight="bold">22.8x</text>
      </svg>
      <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-muted-foreground">
        <span>2020</span>
        <span>2021</span>
        <span>2022</span>
        <span>2023</span>
        <span>2024</span>
      </div>
    </div>
  );
}

function ValuationPercentileRow({ label, current, p10, p25, p50, p75, p90 }: { label: string; current: number; p10: number; p25: number; p50: number; p75: number; p90: number }) {
  const percentile = current <= p10 ? 10 : current <= p25 ? 25 : current <= p50 ? 50 : current <= p75 ? 75 : current <= p90 ? 90 : 95;
  const color = percentile <= 25 ? "green" : percentile <= 75 ? "yellow" : "red";

  return (
    <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
      <div className="w-40 text-sm font-medium">{label}</div>
      <div className="flex-1 h-6 bg-muted rounded-full relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1/10 bg-green-200" />
        <div className="absolute top-0 bottom-0 left-1/10 right-1/10 bg-yellow-200" />
        <div className="absolute top-0 bottom-0 right-1/10 bg-red-200" />
        <div className="absolute top-0 bottom-0 w-1 bg-white shadow" style={{ left: `${percentile}%` }} />
        <div className="absolute top-0 bottom-0 w-2 bg-${color}-500" style={{ left: `${((current - 15) / (40 - 15)) * 100}%` }} />
      </div>
      <div className="w-20 text-right text-sm font-medium text-${color}-600">{current}</div>
      <div className="w-24 text-xs text-muted-foreground">({percentile}th %ile)</div>
    </div>
  );
}

function RegimeCard({ title, value, description, color }: { title: string; value: string; description: string; color: string }) {
  const colors = {
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };
  const c = colors[color as keyof typeof colors] || colors.yellow;

  return (
    <div className={`p-3 rounded-lg border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <Badge variant={color === "green" ? "default" : color === "yellow" ? "secondary" : "destructive"} className="text-xs">{value}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function AllocationRow({ asset, stance, rationale, color }: { asset: string; stance: string; rationale: string; color: string }) {
  const colors = {
    green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };
  const c = colors[color as keyof typeof colors] || colors.yellow;

  return (
    <div className={`p-3 rounded-lg border ${c.bg} ${c.border} flex items-center justify-between`}>
      <div>
        <p className="font-medium text-sm">{asset}</p>
        <p className="text-xs text-muted-foreground">{rationale}</p>
      </div>
      <Badge variant={color === "green" ? "default" : color === "yellow" ? "secondary" : "destructive"}>{stance}</Badge>
    </div>
  );
}

function RiskItem({ risk, impact, probability, desc }: { risk: string; impact: string; probability: string; desc: string }) {
  const impactColors = { High: "text-red-600", Medium: "text-yellow-600", Low: "text-green-600" };
  const probColors = { High: "text-red-600", Medium: "text-yellow-600", Low: "text-green-600" };

  return (
    <div className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{risk}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="text-right">
        <p className="text-xs">Impact: <span className={impactColors[impact as keyof typeof impactColors]} font-medium>{impact}</span></p>
        <p className="text-xs">Probability: <span className={probColors[probability as keyof typeof probColors]} font-medium>{probability}</span></p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, trend, icon: Icon }: { label: string; value: string; change?: string; trend?: "up" | "down"; icon?: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />} {change}
              </p>
            )}
          </div>
          {Icon && <div className="p-2 bg-muted rounded-lg"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
        </div>
      </CardContent>
    </Card>
  );
}

