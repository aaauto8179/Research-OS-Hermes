import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const docs = [
  { name: "Annual Report FY25", type: "annual", date: "2025-06-15" },
  { name: "Q2 FY26 Concall Transcript", type: "concall", date: "2025-10-20" },
  { name: "Investor Presentation", type: "presentation", date: "2025-09-10" },
];

export default function DocumentViewer() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {docs.map((d, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.type} • {d.date}</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
