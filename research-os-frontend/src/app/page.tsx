'use client'

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  Filter,
  Kanban,
  Building2,
  TrendingUp,
  FileText,
  Target,
  ArrowRight,
  ChevronRight,
  Settings,
  Database,
  Brain,
  ClipboardCheck,
  LineChart,
  PieChart,
  BarChart,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricCard } from "@/components/ui/metric-card"

// Mock data for demonstration
const mockCompanies = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", sector: "Oil & Gas", marketCap: "LARGE", stage: "RESEARCH", conviction: 8.5 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", marketCap: "LARGE", stage: "WEIGH", conviction: 9.2 },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking", marketCap: "LARGE", stage: "TRACK", conviction: 8.8 },
  { symbol: "INFY", name: "Infosys Ltd", sector: "IT Services", marketCap: "LARGE", stage: "GENERATE", conviction: 6.5 },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking", marketCap: "LARGE", stage: "RESEARCH", conviction: 7.8 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", sector: "FMCG", marketCap: "LARGE", stage: "TRACK", conviction: 7.2 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Telecom", marketCap: "LARGE", stage: "WEIGH", conviction: 8.0 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", marketCap: "LARGE", stage: "GENERATE", conviction: 6.0 },
]

const stageColors: Record<string, string> = {
  GENERATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RESEARCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  WEIGH: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  TRACK: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  HARVEST: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const stageOrder = ["GENERATE", "RESEARCH", "WEIGH", "TRACK", "HARVEST"]

function StageBadge({ stage }: { stage: string }) {
  return (
    <Badge className={cn(stageColors[stage], "text-xs")}>
      {stage}
    </Badge>
  )
}

function CompanyCard({ company }: { company: typeof mockCompanies[0] }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{company.symbol}</span>
            <StageBadge stage={company.stage} />
          </div>
          <p className="text-xs text-muted-foreground truncate">{company.name}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="px-1.5 py-0.5 bg-muted rounded">{company.sector}</span>
            <span className="px-1.5 py-0.5 bg-muted rounded">{company.marketCap}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-primary">{company.conviction}</div>
          <div className="text-xs text-muted-foreground">Conviction</div>
        </div>
      </div>
    </Card>
  )
}

function StatsCard({ title, value, change, icon: Icon, trend }: { 
  title: string
  value: string
  change?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className={cn("text-xs mt-1", trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground")}>
                {change}
              </p>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  const actions = [
    { label: "New Idea", icon: Plus, href: "/screening" },
    { label: "New Company", icon: Building2, href: "/company/new" },
    { label: "Upload Document", icon: FileText, href: "/documents/upload" },
    { label: "Run Screening", icon: Filter, href: "/screening" },
    { label: "Portfolio Review", icon: Target, href: "/portfolio" },
    { label: "GRWTH Pipeline", icon: Kanban, href: "/grwth" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-20 flex-col gap-2 justify-center"
              asChild
            >
              <a href={action.href}>
                <action.icon className="h-5 w-5" />
                <span className="text-sm">{action.label}</span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const activities = [
    { time: "2 hours ago", action: "Uploaded Annual Report", entity: "RELIANCE", type: "document" },
    { time: "4 hours ago", action: "Moved to WEIGH stage", entity: "TCS", type: "stage" },
    { time: "Yesterday", action: "Completed DCF model", entity: "HDFCBANK", type: "analysis" },
    { time: "2 days ago", action: "Added to watchlist", entity: "INFY", type: "watchlist" },
    { time: "3 days ago", action: "Updated conviction to 8.5", entity: "RELIANCE", type: "conviction" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors">
              <div className="p-1.5 bg-muted rounded">
                {activity.type === "document" && <FileText className="h-4 w-4" />}
                {activity.type === "stage" && <ArrowRight className="h-4 w-4" />}
                {activity.type === "analysis" && <LineChart className="h-4 w-4" />}
                {activity.type === "watchlist" && <Target className="h-4 w-4" />}
                {activity.type === "conviction" && <TrendingUp className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.entity}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function GRWTHPipeline() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stageOrder.map((stage) => (
        <div key={stage} className="min-w-[280px] max-w-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", stageColors[stage].replace("bg-", "bg-").replace("text-", ""))} />
              <span className="font-medium text-sm">{stage}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {mockCompanies.filter((c) => c.stage === stage).length}
            </span>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {mockCompanies
              .filter((c) => c.stage === stage)
              .map((company) => (
                <CompanyCard key={company.symbol} company={company} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "companies">("overview")

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Ideas" value="24" change="+3 this week" trend="up" icon={Target} />
              <MetricCard label="In Research" value="8" change="2 moved to Weigh" trend="up" icon={FileText} />
              <MetricCard label="Portfolio Companies" value="12" change="+1 new position" trend="up" icon={Building2} />
              <MetricCard label="Documents Processed" value="156" change="+12 this week" trend="up" icon={Database} />
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <QuickActions />
                <RecentActivity />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pipeline Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stageOrder.map((stage) => (
                        <div key={stage} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2.5 h-2.5 rounded-full", stageColors[stage].replace("bg-", "bg-").replace("text-", ""))} />
                            <span className="text-sm font-medium">{stage}</span>
                          </div>
                          <Badge variant="secondary" className={stageColors[stage]}>
                            {mockCompanies.filter((c) => c.stage === stage).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pipeline" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">GRWTH Pipeline</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-4">
                <GRWTHPipeline />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "companies" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Companies</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Symbol</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Company</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Sector</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Market Cap</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Stage</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Conviction</th>
                        <th className="p-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockCompanies.map((company) => (
                        <tr key={company.symbol} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{company.symbol}</td>
                          <td className="p-4">{company.name}</td>
                          <td className="p-4">
                            <Badge variant="secondary">{company.sector}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{company.marketCap}</Badge>
                          </td>
                          <td className="p-4">
                            <StageBadge stage={company.stage} />
                          </td>
                          <td className="p-4 font-bold text-primary">{company.conviction}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
