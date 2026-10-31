import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const scores = [
  { name: "Beneish M-Score", value: "-2.45", status: "Low Risk", color: "text-green-500" },
  { name: "Altman Z-Score", value: "3.82", status: "Safe Zone", color: "text-green-500" },
  { name: "Piotroski F-Score", value: "7/9", status: "Strong", color: "text-green-500" },
  { name: "Management Consistency", value: "85%", status: "High", color: "text-green-500" },
];

export default function RiskAssessment() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scores.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-sm">{s.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm font-bold ${s.color}`}>{s.value}</span>
                <Badge variant="outline">{s.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
