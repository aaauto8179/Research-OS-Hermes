import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const news = [
  { title: "RELIANCE announces Q2 results", source: "ET", time: "2h ago" },
  { title: "Oil prices surge 5%", source: "Reuters", time: "4h ago" },
  { title: "New 5G spectrum auction", source: "Bloomberg", time: "1d ago" },
];

export default function NewsFeed() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>News Feed</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {news.map((n, i) => (
            <div key={i} className="p-2 rounded bg-muted/50">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.source} • {n.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
