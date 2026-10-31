import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ownership = [
  { category: "Promoter", percent: 52.3, change: "+0.5" },
  { category: "FII", percent: 18.2, change: "-1.2" },
  { category: "DII", percent: 12.1, change: "+0.8" },
  { category: "Retail", percent: 17.4, change: "+0.1" },
];

export default function OwnershipAnalysis() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Ownership Analysis</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ownership.map((o) => (
            <div key={o.category} className="flex items-center justify-between">
              <span className="text-sm">{o.category}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${o.percent}%` }} />
                </div>
                <span className="font-mono text-sm w-12 text-right">{o.percent}%</span>
                <span className={`text-xs ${parseFloat(o.change) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {o.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
