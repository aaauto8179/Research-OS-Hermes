import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const events = [
  { date: "2026-11-15", event: "Q2 FY26 Earnings", type: "earnings" },
  { date: "2026-11-20", event: "Dividend Ex-Date", type: "dividend" },
  { date: "2026-12-05", event: "AGM", type: "corporate" },
  { date: "2026-12-15", event: "New Product Launch", type: "business" },
];

export default function CatalystTracker() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Catalyst Tracker</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.map((e, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <div>
                <p className="text-sm font-medium">{e.event}</p>
                <p className="text-xs text-muted-foreground">{e.date}</p>
              </div>
              <Badge variant="outline">{e.type}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
