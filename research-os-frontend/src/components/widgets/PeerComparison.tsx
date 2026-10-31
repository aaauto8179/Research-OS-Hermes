import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const peers = [
  { name: "RELIANCE", pe: 28.5, ev_ebitda: 18.2, roe: 22.5, fcf_yield: 3.2 },
  { name: "INFY", pe: 24.1, ev_ebitda: 15.3, roe: 30.1, fcf_yield: 4.5 },
  { name: "TCS", pe: 26.8, ev_ebitda: 17.1, roe: 42.3, fcf_yield: 3.8 },
];

export default function PeerComparison() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Peer Comparison</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>P/E</TableHead>
              <TableHead>EV/EBITDA</TableHead>
              <TableHead>ROE</TableHead>
              <TableHead>FCF Yield</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {peers.map((p) => (
              <TableRow key={p.name}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.pe}</TableCell>
                <TableCell>{p.ev_ebitda}</TableCell>
                <TableCell>{p.roe}%</TableCell>
                <TableCell>{p.fcf_yield}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
