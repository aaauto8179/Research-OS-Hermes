import { Card, CardContent } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";

interface KPICardProps {
  metrics?: string[];
}

export default function KPICard({ metrics = ['pe', 'ev_ebitda', 'roe', 'roce', 'fcf_yield', 'debt_equity'] }: KPICardProps) {
  const mockData: Record<string, { value: string; change: string; trend: 'up' | 'down' }> = {
    pe: { value: "28.5", change: "+2.1%", trend: "up" },
    ev_ebitda: { value: "18.2", change: "-0.5%", trend: "down" },
    roe: { value: "22.5%", change: "+1.2%", trend: "up" },
    roce: { value: "28.1%", change: "+0.8%", trend: "up" },
    fcf_yield: { value: "3.2%", change: "-0.3%", trend: "down" },
    debt_equity: { value: "0.45", change: "-0.05", trend: "down" },
    sales_growth: { value: "15.2%", change: "+2.1%", trend: "up" },
    profit_growth: { value: "18.5%", change: "+1.8%", trend: "up" },
    promoter_holding: { value: "52.3%", change: "+0.5%", trend: "up" },
    pledged_holding: { value: "2.1%", change: "-0.2%", trend: "down" },
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map((key) => {
            const data = mockData[key];
            if (!data) return null;
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return <MetricCard key={key} label={label} value={data.value} change={data.change} trend={data.trend} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}