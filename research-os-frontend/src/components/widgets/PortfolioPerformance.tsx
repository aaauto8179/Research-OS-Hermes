import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";

export default function PortfolioPerformance() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="XIRR" value="18.5%" change="+2.1%" trend="up" />
          <MetricCard label="Total P&L" value="₹2.4L" change="+12.3%" trend="up" />
          <MetricCard label="Sharpe" value="1.42" change="+0.15" trend="up" />
          <MetricCard label="Max DD" value="-8.2%" change="+1.5%" trend="up" />
        </div>
      </CardContent>
    </Card>
  );
}
