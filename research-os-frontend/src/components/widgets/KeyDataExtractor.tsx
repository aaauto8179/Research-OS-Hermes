"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BarChart2, Target, DollarSign, TrendingUp, Factory, Truck, Zap, Copy, CheckCircle } from "lucide-react";

interface KeyDataExtractorProps {
  documentId?: string;
  companySymbol?: string;
}

const EXTRACTION_CATEGORIES = [
  { key: "financials", label: "Financial Metrics", icon: DollarSign, color: "text-green-500" },
  { key: "guidance", label: "Management Guidance", icon: Target, color: "text-blue-500" },
  { key: "segments", label: "Segment Highlights", icon: BarChart2, color: "text-purple-500" },
  { key: "capex", label: "Capex Updates", icon: Factory, color: "text-orange-500" },
  { key: "risks", label: "Key Risks", icon: TrendingUp, color: "text-red-500" },
  { key: "operations", label: "Operational Metrics", icon: Truck, color: "text-indigo-500" },
];

const MOCK_EXTRACTIONS: Record<string, any[]> = {
  financials: [
    { field: "Revenue", value: "₹2,40,000 Cr", confidence: 98, page: 12 },
    { field: "EBITDA", value: "₹45,000 Cr", confidence: 97, page: 15 },
    { field: "PAT", value: "₹28,500 Cr", confidence: 95, page: 18 },
    { field: "EPS", value: "₹42.50", confidence: 96, page: 18 },
    { field: "Net Debt", value: "₹50,000 Cr", confidence: 94, page: 22 },
  ],
  guidance: [
    { field: "Revenue Growth FY25", value: "12-15%", confidence: 92, page: 8 },
    { field: "EBITDA Margin FY25", value: "18-20%", confidence: 90, page: 8 },
    { field: "Capex FY25", value: "₹1.2L Cr", confidence: 88, page: 9 },
    { field: "Retail Store Addition", value: "2,500+", confidence: 85, page: 10 },
  ],
  segments: [
    { field: "O2C EBITDA/bbl", value: "$13.2", confidence: 98, page: 15 },
    { field: "Retail Revenue", value: "₹2.4L Cr", confidence: 95, page: 28 },
    { field: "Jio ARPU", value: "₹182", confidence: 97, page: 32 },
    { field: "Jio Subscribers", value: "470M", confidence: 99, page: 32 },
  ],
  capex: [
    { field: "New Energy Capex", value: "₹75,000 Cr", confidence: 80, page: 24 },
    { field: "O2C Maintenance", value: "₹25,000 Cr", confidence: 85, page: 25 },
    { field: "Retail Expansion", value: "₹15,000 Cr", confidence: 90, page: 25 },
  ],
  risks: [
    { field: "Global Recession Impact", value: "High", confidence: 70, page: 35 },
    { field: "Regulatory Risk (Telecom)", value: "Medium", confidence: 75, page: 36 },
    { field: "New Energy Execution", value: "Medium-High", confidence: 65, page: 37 },
  ],
  operations: [
    { field: "Refining Throughput", value: "1.4M bpd", confidence: 95, page: 14 },
    { field: "Retail Footfall", value: "850M/yr", confidence: 88, page: 29 },
    { field: "Data Traffic", value: "2.5 EB/month", confidence: 92, page: 33 },
  ],
};

export default function KeyDataExtractor({ documentId = "1", companySymbol = "RELIANCE" }: KeyDataExtractorProps) {
  const [extractions, setExtractions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("financials");
  const [extracting, setExtracting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExtractions() {
      try {
        const res = await fetch(`/api/data-ingestion/extract?document_id=${documentId}&company_symbol=${companySymbol}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setExtractions(json);
      } catch (e: any) {
        setError(e.message);
        setExtractions(MOCK_EXTRACTIONS);
      } finally {
        setLoading(false);
      }
    }
    fetchExtractions();
  }, [documentId, companySymbol]);

  const handleExtract = async (category: string) => {
    setExtracting(category);
    try {
      const res = await fetch("/api/data-ingestion/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId, company_symbol: companySymbol, category, regenerate: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setExtractions((prev: any) => ({ ...prev, [category]: json[category] }));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExtracting(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const currentExtractions = extractions?.[activeCategory] || MOCK_EXTRACTIONS[activeCategory] || [];
  const categoryInfo = EXTRACTION_CATEGORIES.find(c => c.key === activeCategory);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Key Data Extractor</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !extractions) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Key Data Extractor</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Key Data Extractor — Doc #{documentId}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {Object.values(extractions || MOCK_EXTRACTIONS).flat().length} fields
          </Badge>
          <Button variant="outline" size="sm" onClick={() => EXTRACTION_CATEGORIES.forEach(c => handleExtract(c.key))} disabled={!!extracting}>
            <Zap className="mr-1 h-3 w-3" /> {extracting ? `Extracting ${extracting}...` : "Extract All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
          {EXTRACTION_CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <cat.icon className="inline h-3 w-3 mr-1" /> {cat.label}
            </button>
          ))}
        </div>

        {/* Extraction Table */}
        <div className="flex-1 overflow-y-auto">
          {currentExtractions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No extractions for {categoryInfo?.label}. Click "Extract All" or select a category.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead className="text-right">Extracted Value</TableHead>
                  <TableHead className="text-center">Confidence</TableHead>
                  <TableHead className="text-center">Page</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentExtractions.map((item: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.field}</TableCell>
                    <TableCell className="text-right font-mono">{item.value}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.confidence >= 90 ? "bg-green-500" : item.confidence >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono ${item.confidence >= 90 ? "text-green-500" : item.confidence >= 75 ? "text-amber-500" : "text-red-500"}`}>
                          {item.confidence}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">p.{item.page}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(item.value)} title="Copy value">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}