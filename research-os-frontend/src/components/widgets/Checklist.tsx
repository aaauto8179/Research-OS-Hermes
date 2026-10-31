import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const items = [
  { id: "1", label: "Business model understood", checked: true },
  { id: "2", label: "Management quality verified", checked: true },
  { id: "3", label: "Financials audited (3 years)", checked: true },
  { id: "4", label: "Valuation within margin of safety", checked: false },
  { id: "5", label: "Risk factors catalogued", checked: false },
  { id: "6", label: "Exit triggers defined", checked: false },
];

export default function Checklist() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Investment Checklist</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox checked={item.checked} />
              <span className={`text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
