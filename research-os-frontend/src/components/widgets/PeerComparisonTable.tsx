import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const data = [
  { name: "RELIANCE", rev: 2600, ebitda: 720, roe: 22.5, pe: 28.5 },
  { name: "INFY", rev: 1800, ebitda: 480, roe: 30.1, pe: 24.1 },
  { name: "TCS", rev: 2200, ebitda: 600, roe: 42.3, pe: 26.8 },
];

export default function PeerComparisonTable() {
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Peer Comparison Table</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>EBITDA</TableHead>
              <TableHead>ROE</TableHead>
              <TableHead>P/E</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.name}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.rev} Cr</TableCell>
                <TableCell>{d.ebitda} Cr</TableCell>
                <TableCell>{d.roe}%</TableCell>
                <TableCell>{d.pe}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
