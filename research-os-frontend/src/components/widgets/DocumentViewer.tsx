"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, FileQuestion, FileCheck, FileX, Loader2, Eye, Download } from "lucide-react";

interface DocumentViewerProps {
  companySymbol?: string;
  docType?: string;
}

const STATUS_COLORS = {
  PARSED: "default",
  PENDING: "secondary",
  PARSING: "outline",
  FAILED: "destructive",
} as const;

const STATUS_ICONS = {
  PARSED: FileCheck,
  PENDING: FileQuestion,
  PARSING: Loader2,
  FAILED: FileX,
};

export default function DocumentViewer({ companySymbol = "RELIANCE", docType = "all" }: DocumentViewerProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const params = new URLSearchParams();
        if (companySymbol) params.append("company_symbol", companySymbol);
        if (docType && docType !== "all") params.append("doc_type", docType);
        
        const res = await fetch(`/api/data-ingestion/documents?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setDocuments(json.documents || []);
      } catch (e: any) {
        setError(e.message);
        // Fallback mock data
        setDocuments([
          { id: "1", company_symbol: companySymbol, title: "Annual Report FY24", doc_type: "ANNUAL_REPORT", source: "BSE", date: "2024-05-15", pages: 245, status: "PARSED", file_size: "12.4 MB" },
          { id: "2", company_symbol: companySymbol, title: "Q4 FY24 Concall Transcript", doc_type: "CONCALL_TRANSCRIPT", source: "BSE", date: "2024-05-20", pages: 45, status: "PARSED", file_size: "2.1 MB" },
          { id: "3", company_symbol: companySymbol, title: "Investor Presentation Q3 FY24", doc_type: "INVESTOR_PRESENTATION", source: "BSE", date: "2024-02-10", pages: 35, status: "PARSED", file_size: "8.7 MB" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [companySymbol, docType]);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && documents.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Documents — {companySymbol}</CardTitle>
        <Badge variant="outline">{documents.length} docs</Badge>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No documents found for {companySymbol}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-xs">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.doc_type} • {doc.date} • {doc.pages} pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = STATUS_ICONS[doc.status as keyof typeof STATUS_ICONS] || FileQuestion;
                    return (
                      <Badge 
                        variant={STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS] || "secondary"} 
                        className="gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {doc.status}
                      </Badge>
                    );
                  })()}
                  <Button variant="ghost" size="icon" title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
