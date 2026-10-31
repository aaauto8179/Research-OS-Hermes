import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bridges = [
  { label: "Base Margin", value: 15.0, color: "bg-blue-500" },
  { label: "Price Effect", value: 2.5, color: "bg-green-500" },
  { label: "Volume Effect", value: 1.2, color: "bg-green-500" },
  { label: "Cost Effect", value: -1.8, color: "bg-red-500" },
  { label: "Final Margin", value: 16.9, color: "bg-blue-500" },
];

export default function MarginBridge() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Margin Bridge</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {bridges.map((b) => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-xs w-24">{b.label}</span>
              <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                <div className={`h-full ${b.color}`} style={{ width: `${Math.abs(b.value) * 5}%` }} />
              </div>
              <span className="text-xs font-mono w-12 text-right">{b.value > 0 ? "+" : ""}{b.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
