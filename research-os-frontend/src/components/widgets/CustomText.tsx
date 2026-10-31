import { Card, CardContent } from "@/components/ui/card";

export default function CustomText() {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">CustomText widget</p>
      </CardContent>
    </Card>
  );
}
