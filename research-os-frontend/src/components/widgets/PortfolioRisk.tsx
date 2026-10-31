import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const risks = [
  { name: "Concentration (Top 3)", value: "65%", status: "High" },
  { name: "Sector Exposure", value: "Energy 40%", status: "Medium" },
  { name: "Beta", value: "1.15", status: "Medium" },
  { name: "VaR (95%)", value: "-2.1%", status: "Low" },
];

export default function PortfolioRisk() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Portfolio Risk</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.name} className="flex items-center justify-between">
              <span className="text-sm">{r.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{r.value}</span>
                <span className={`text-xs ${r.status === "High" ? "text-red-500" : r.status === "Medium" ? "text-yellow-500" : "text-green-500"}`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
