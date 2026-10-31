import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const companies = [
  { name: "RELIANCE", growth: 15.2 }, { name: "INFY", growth: 8.5 },
  { name: "TCS", growth: 6.2 }, { name: "HDFCBANK", growth: 12.1 },
  { name: "TATAMOTORS", growth: 22.8 }, { name: "ITC", growth: 5.1 },
  { name: "SBIN", growth: 14.3 }, { name: "BHARTIARTL", growth: 18.7 },
];

export default function SectorHeatmap() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Sector Heatmap</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {companies.map((c) => (
            <div key={c.name} className="p-3 rounded text-center" style={{ backgroundColor: `rgba(16, 185, 129, ${c.growth / 30})` }}>
              <p className="text-xs font-bold">{c.name}</p>
              <p className="text-sm">{c.growth}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
