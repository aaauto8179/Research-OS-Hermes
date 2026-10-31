import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";

export default function IndustryOverview() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Industry Overview</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Market Size" value="₹4.2L Cr" change="+8.5%" trend="up" />
          <MetricCard label="Growth Rate" value="12.3%" change="+1.2%" trend="up" />
          <MetricCard label="Companies" value="45" change="+3" trend="up" />
          <MetricCard label="Avg Margin" value="18.2%" change="-0.5%" trend="down" />
        </div>
      </CardContent>
    </Card>
  );
}
