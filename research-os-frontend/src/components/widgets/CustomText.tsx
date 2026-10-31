import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function CustomText() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
      <CardContent>
        <Textarea placeholder="Add your notes here..." className="min-h-[120px]" />
      </CardContent>
    </Card>
  );
}
