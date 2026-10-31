import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const models = [
  { name: "DCF (Gordon Growth)", value: "₹3,250", upside: "+18%" },
  { name: "DCF (Exit Multiple)", value: "₹3,100", upside: "+13%" },
  { name: "Relative (P/E)", value: "₹2,950", upside: "+7%" },
  { name: "SOTP", value: "₹3,400", upside: "+23%" },
  { name: "Banking P/B-ROE", value: "₹2,800", upside: "+1%" },
  { name: "Excess Return", value: "₹3,150", upside: "+14%" },
];

export default function ValuationSummary() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Valuation Summary</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {models.map((m) => (
            <div key={m.name} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm font-medium">{m.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{m.value}</span>
                <Badge variant={m.upside.startsWith("+") ? "default" : "destructive"}>{m.upside}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
