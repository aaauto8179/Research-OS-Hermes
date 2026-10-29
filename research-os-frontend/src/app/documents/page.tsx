"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Search, Filter, ChevronDown, ChevronUp, 
  Plus, Eye, Download, Settings, AlertTriangle,
  TrendingUp, TrendingDown, Target, Zap,
  Building2, Briefcase, BarChart2, FileText,
  Layers, ClipboardList, Calculator, Lightbulb,
  CheckCircle, XCircle, HelpCircle, Pencil,
  Save, Undo2, Redo2, Upload, Loader2,
  FileQuestion, FileCheck, FileX
} from "lucide-react";
import { Document, DocumentType, DocumentMetadata } from "@/lib/types";

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "ANNUAL_REPORT", label: "Annual Report" },
  { value: "CONCALL_TRANSCRIPT", label: "Concall Transcript" },
  { value: "INVESTOR_PRESENTATION", label: "Investor Presentation" },
  { value: "QUARTERLY_RESULT", label: "Quarterly Result" },
  { value: "CREDIT_RATING", label: "Credit Rating" },
  { value: "NEWS", label: "News" },
  { value: "OTHER", label: "Other" },
];

const MOCK_DOCUMENTS = [
  { id: "1", company_symbol: "RELIANCE", title: "Annual Report FY24", doc_type: "ANNUAL_REPORT", source: "BSE", date: "2024-05-15", pages: 245, status: "PARSED" as const, file_size: "12.4 MB" },
  { id: "2", company_symbol: "RELIANCE", title: "Q4 FY24 Concall Transcript", doc_type: "CONCALL_TRANSCRIPT", source: "BSE", date: "2024-05-20", pages: 45, status: "PARSED" as const, file_size: "2.1 MB" },
  { id: "3", company_symbol: "RELIANCE", title: "Investor Presentation Q3 FY24", doc_type: "INVESTOR_PRESENTATION", source: "BSE", date: "2024-02-10", pages: 35, status: "PARSED" as const, file_size: "8.7 MB" },
  { id: "4", company_symbol: "TCS", title: "Annual Report FY24", doc_type: "ANNUAL_REPORT", source: "BSE", date: "2024-04-18", pages: 198, status: "PARSED" as const, file_size: "9.2 MB" },
  { id: "5", company_symbol: "TCS", title: "Q4 FY24 Concall Transcript", doc_type: "CONCALL_TRANSCRIPT", source: "BSE", date: "2024-04-22", pages: 38, status: "PARSED" as const, file_size: "1.8 MB" },
  { id: "6", company_symbol: "HDFCBANK", title: "Annual Report FY24", doc_type: "ANNUAL_REPORT", source: "BSE", date: "2024-04-20", pages: 212, status: "PARSING" as const, file_size: "11.5 MB" },
  { id: "7", company_symbol: "INFY", title: "Q3 FY24 Results", doc_type: "QUARTERLY_RESULT", source: "BSE", date: "2024-01-15", pages: 12, status: "PARSED" as const, file_size: "1.2 MB" },
  { id: "8", company_symbol: "BAJFINANCE", title: "Credit Rating - CRISIL AAA", doc_type: "CREDIT_RATING", source: "CRISIL", date: "2024-03-01", pages: 8, status: "PARSED" as const, file_size: "0.5 MB" },
];

const STATUS_COLORS = {
  PARSED: "default",
  PENDING: "secondary",
  PARSING: "outline",
  FAILED: "destructive",
} as const;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const [filteredDocuments, setFilteredDocuments] = useState(MOCK_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [showReader, setShowReader] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter documents
  useEffect(() => {
    let result = [...documents];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.company_symbol.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      result = result.filter(d => d.doc_type === typeFilter);
    }
    if (companyFilter !== "all") {
      result = result.filter(d => d.company_symbol === companyFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter(d => d.status === statusFilter);
    }
    setFilteredDocuments(result);
  }, [documents, searchQuery, typeFilter, companyFilter, statusFilter]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setUploadProgress(0);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Simulate upload progress
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(r => setTimeout(r, 50));
        setUploadProgress(p);
      }
      
      const newDoc = {
        id: String(Date.now() + i),
        company_symbol: "UNKNOWN",
        title: file.name.replace(/\.[^/.]+$/, ""),
        doc_type: "OTHER" as DocumentType,
        source: "MANUAL_UPLOAD",
        date: new Date().toISOString().split("T")[0],
        pages: 0,
        status: "PENDING" as const,
        file_size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      };
      setDocuments(prev => [newDoc, ...prev]);
    }
    setUploading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PARSED": return <FileCheck className="h-4 w-4 text-green-600" />;
      case "PENDING": return <FileQuestion className="h-4 w-4 text-yellow-600" />;
      case "PARSING": return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "FAILED": return <FileX className="h-4 w-4 text-red-600" />;
      default: return <FileQuestion className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Document AI Hub</h1>
          <p className="text-sm text-muted-foreground">Upload, parse, and analyze financial documents with AI-powered extraction</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Button>
          <input id="file-upload" type="file" multiple accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Uploading {uploadProgress}%</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="border rounded-lg p-4 bg-muted/30 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search title, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="All Companies" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="RELIANCE">RELIANCE</SelectItem>
              <SelectItem value="TCS">TCS</SelectItem>
              <SelectItem value="HDFCBANK">HDFCBANK</SelectItem>
              <SelectItem value="INFY">INFY</SelectItem>
              <SelectItem value="BAJFINANCE">BAJFINANCE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PARSED">Parsed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARSING">Parsing</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-hidden border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input type="checkbox" className="rounded border-input" />
              </TableHead>
              <TableHead className="cursor-pointer">Title</TableHead>
              <TableHead className="w-36">Type</TableHead>
              <TableHead className="w-24">Company</TableHead>
              <TableHead className="w-36">Date</TableHead>
              <TableHead className="w-24">Pages</TableHead>
              <TableHead className="w-32">Size</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No documents found. Upload documents or adjust filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className={selectedDoc?.id === doc.id ? 'bg-primary/5' : ''}>
                  <TableCell>
                    <input type="checkbox" checked={selectedDoc?.id === doc.id} onChange={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)} className="rounded border-input" />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{doc.title}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{doc.doc_type}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{doc.company_symbol}</Badge></TableCell>
                  <TableCell className="text-right text-sm">{doc.date}</TableCell>
                  <TableCell className="text-right text-sm">{doc.pages}</TableCell>
                  <TableCell className="text-right text-sm">{doc.file_size}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS] || "secondary"} className="gap-1">
                      {getStatusIcon(doc.status)}
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedDoc(doc); setShowReader(true); }} title="Open in Reader">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Re-parse">
                        <Loader2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Document AI Reader Modal */}
      {showReader && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReader(false)}>
          <div className="bg-background rounded-lg w-full max-w-6xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{selectedDoc.doc_type}</Badge>
                <h2 className="font-semibold truncate max-w-md">{selectedDoc.title}</h2>
                <Badge variant="outline">{selectedDoc.company_symbol}</Badge>
                <Badge variant={STATUS_COLORS[selectedDoc.status as keyof typeof STATUS_COLORS] || "secondary"}>{selectedDoc.status}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowReader(false)}><XCircle className="h-5 w-5" /></Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Left: PDF Viewer */}
              <div className="w-1/2 border-r bg-muted/30 flex flex-col">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="font-medium">PDF Viewer</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Page 1 of {selectedDoc.pages}
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="bg-white rounded-lg shadow-lg max-w-md mx-auto aspect-[0.7] border" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' }}>
                    <div className="p-6 text-center text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p>PDF Preview Placeholder</p>
                      <p className="text-sm mt-2">{selectedDoc.title}</p>
                      <p className="text-xs">Page-aware citations enabled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI Extraction Console */}
              <div className="w-1/2 flex flex-col overflow-hidden">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="font-medium">AI Extraction Console</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Auto-extract</Badge>
                    <Button variant="outline" size="sm" className="hidden sm:block"><Zap className="mr-1 h-4 w-4" /> Run All</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <ExtractionCard title="Management Guidance" icon={Target} status="extracted" items={[
                    { label: "Revenue Growth", value: "12-15%", confidence: 95 },
                    { label: "EBITDA Margin", value: "18-20%", confidence: 90 },
                    { label: "Capex", value: "₹12,000 Cr", confidence: 85 },
                  ]} />
                  <ExtractionCard title="Segment Highlights" icon={BarChart2} status="extracted" items={[
                    { label: "O2C EBITDA", value: "$13.2/bbl", confidence: 98 },
                    { label: "Retail Revenue", value: "₹2.4L Cr", confidence: 95 },
                    { label: "Jio ARPU", value: "₹182", confidence: 97 },
                  ]} />
                  <ExtractionCard title="Capex Updates" icon={Layers} status="pending" items={[]} />
                  <ExtractionCard title="Key Footnotes" icon={FileQuestion} status="pending" items={[]} />
                  <ExtractionCard title="Negative Q&A" icon={XCircle} status="pending" items={[]} />
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReader(false)}>Close</Button>
              <Button onClick={() => { /* Export extraction */ }}>Export Results</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExtractionCard({ title, icon: Icon, status, items }: { title: string; icon: any; status: string; items: any[] }) {
  const statusConfig = {
    extracted: { color: "green", icon: CheckCircle },
    pending: { color: "yellow", icon: Loader2 },
    failed: { color: "red", icon: XCircle },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: config.color }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant={status === "extracted" ? "default" : status === "pending" ? "secondary" : "destructive"} className="gap-1">
            <config.icon className="h-3 w-3" />
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead className="text-right">Citation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{item.label}</TableCell>
                  <TableCell className="text-right">{item.value}</TableCell>
                  <TableCell className="text-center">{item.confidence}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Go to source page">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {status === "pending" && <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />}
            <p>No extractions yet. Click "Run All" to start AI extraction.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

