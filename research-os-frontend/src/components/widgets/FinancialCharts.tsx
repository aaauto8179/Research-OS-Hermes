import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { year: "FY20", revenue: 1200, ebitda: 300, pat: 150 },
  { year: "FY21", revenue: 1500, ebitda: 400, pat: 200 },
  { year: "FY22", revenue: 1800, ebitda: 480, pat: 250 },
  { year: "FY23", revenue: 2200, ebitda: 600, pat: 320 },
  { year: "FY24", revenue: 2600, ebitda: 720, pat: 400 },
];

export default function FinancialCharts() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Financial Trends</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            <Bar dataKey="ebitda" fill="#10b981" name="EBITDA" />
            <Bar dataKey="pat" fill="#f59e0b" name="PAT" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
