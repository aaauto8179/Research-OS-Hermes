import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const holdings = [
  { symbol: "RELIANCE", qty: 10, avgPrice: 2500, current: 2950, pnl: "+18%" },
  { symbol: "INFY", qty: 25, avgPrice: 1400, current: 1520, pnl: "+8.6%" },
  { symbol: "TCS", qty: 15, avgPrice: 3200, current: 3650, pnl: "+14%" },
];

export default function PortfolioHoldings() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Avg</TableHead>
              <TableHead>LTP</TableHead>
              <TableHead>P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h) => (
              <TableRow key={h.symbol}>
                <TableCell className="font-medium">{h.symbol}</TableCell>
                <TableCell>{h.qty}</TableCell>
                <TableCell>₹{h.avgPrice}</TableCell>
                <TableCell>₹{h.current}</TableCell>
                <TableCell className="text-green-500">{h.pnl}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
