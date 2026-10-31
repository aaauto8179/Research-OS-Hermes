import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const drivers = [
  { name: "Urbanization", impact: 35, trend: "up" },
  { name: "Income Growth", impact: 28, trend: "up" },
  { name: "Digital Adoption", impact: 22, trend: "up" },
  { name: "Regulatory Push", impact: 15, trend: "neutral" },
];

export default function DemandDrivers() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Demand Drivers</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drivers.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="text-sm w-32">{d.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${d.impact}%` }} />
              </div>
              <span className="text-xs font-mono w-8 text-right">{d.impact}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
