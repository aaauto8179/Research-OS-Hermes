import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const priceData = [
  { date: "Oct 1", price: 2850 }, { date: "Oct 5", price: 2870 }, { date: "Oct 10", price: 2840 },
  { date: "Oct 15", price: 2900 }, { date: "Oct 20", price: 2880 }, { date: "Oct 25", price: 2920 },
  { date: "Oct 30", price: 2950 },
];

export default function TechnicalAnalysis() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Technical Analysis</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={["dataMin - 50", "dataMax + 50"]} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>SMA50: 2,880</span>
          <span>SMA200: 2,750</span>
          <span>RSI: 58</span>
          <span>MACD: +12.5</span>
        </div>
      </CardContent>
    </Card>
  );
}
