import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const txns = [
  { date: "2026-10-15", symbol: "RELIANCE", type: "BUY", qty: 5, price: 2900 },
  { date: "2026-10-10", symbol: "INFY", type: "BUY", qty: 10, price: 1500 },
  { date: "2026-10-05", symbol: "TCS", type: "SELL", qty: 3, price: 3700 },
];

export default function TransactionLog() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txns.map((t, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs">{t.date}</TableCell>
                <TableCell className="font-medium">{t.symbol}</TableCell>
                <TableCell className={t.type === "BUY" ? "text-green-500" : "text-red-500"}>{t.type}</TableCell>
                <TableCell>{t.qty}</TableCell>
                <TableCell>₹{t.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
