import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stages = [
  { name: "Raw Materials", margin: "5%" },
  { name: "Manufacturing", margin: "12%" },
  { name: "Distribution", margin: "8%" },
  { name: "Retail", margin: "15%" },
  { name: "After-Sales", margin: "25%" },
];

export default function ValueChainMapper() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Value Chain Mapper</CardTitle></CardHeader>
      <CardContent>
        <div className="flex gap-2 overflow-x-auto">
          {stages.map((s, i) => (
            <div key={s.name} className="flex-shrink-0 p-3 rounded bg-muted/50 text-center min-w-[100px]">
              <p className="text-xs font-medium">{s.name}</p>
              <p className="text-sm font-bold text-primary">{s.margin}</p>
              {i < stages.length - 1 && <span className="text-xs">→</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
