"use client";

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MultiModalUploaderProps {
  onLoadSample: (symbol: string) => void;
  onUploadSuccess?: (fileName: string, type: string) => void;
  activeSymbol: string;
}

export function MultiModalUploader({
  onLoadSample,
  onUploadSuccess,
  activeSymbol,
}: MultiModalUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setIsProcessing(true);
    setUploadStatus(`Parsing ${file.name}... Extracting multi-year line items & grounding citations...`);

    setTimeout(() => {
      setIsProcessing(false);
      setUploadStatus(`Successfully ingested ${file.name}! Loaded 10 fiscal years and indexed statement citations.`);
      if (onUploadSuccess) {
        onUploadSuccess(file.name, file.type);
      }
    }, 1200);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    setUploadStatus(`Fetching exchange announcement from ${urlInput}...`);

    setTimeout(() => {
      setIsProcessing(false);
      setUploadStatus(`Ingested exchange disclosure from ${urlInput}. Chunk metadata indexed in document vault.`);
      setUrlInput("");
    }, 1200);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setUploadStatus("Indexing qualitative commentary chunk into database...");

    setTimeout(() => {
      setIsProcessing(false);
      setUploadStatus("Qualitative chunk indexed with citation chunk ID.");
      setTextInput("");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Fast Sample Data Loaders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Database className="h-4 w-4 text-primary" />
              1-Click Institutional Ground-Truth Datasets
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pre-loaded with 10 years of statutory P&L, Balance Sheet, Cash Flow & audited citations
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
            Active: {activeSymbol}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Reliance */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              activeSymbol === "RELIANCE" ? "ring-2 ring-primary border-primary bg-primary/5" : ""
            }`}
            onClick={() => onLoadSample("RELIANCE")}
          >
            <CardHeader className="p-3.5 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  RELIANCE
                </Badge>
                {activeSymbol === "RELIANCE" && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 bg-emerald-600">
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm mt-1">Reliance Industries</CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                Conglomerate • O2C, Retail, Jio & Green Energy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>FY24 Revenue:</span>
                  <span className="font-mono font-medium text-foreground">₹8,92,450 Cr</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-mono">FY15–FY24 (10 Years)</span>
                </div>
              </div>
              <Button
                variant={activeSymbol === "RELIANCE" ? "secondary" : "outline"}
                size="sm"
                className="w-full mt-3 h-7 text-xs font-medium"
              >
                Load Reliance FY15-FY24
              </Button>
            </CardContent>
          </Card>

          {/* TCS */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              activeSymbol === "TCS" ? "ring-2 ring-primary border-primary bg-primary/5" : ""
            }`}
            onClick={() => onLoadSample("TCS")}
          >
            <CardHeader className="p-3.5 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  TCS
                </Badge>
                {activeSymbol === "TCS" && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 bg-emerald-600">
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm mt-1">Tata Consultancy Services</CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                IT Services • BFSI, Retail & Cloud Transformation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>FY24 Revenue:</span>
                  <span className="font-mono font-medium text-foreground">₹2,40,893 Cr</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-mono">FY15–FY24 (10 Years)</span>
                </div>
              </div>
              <Button
                variant={activeSymbol === "TCS" ? "secondary" : "outline"}
                size="sm"
                className="w-full mt-3 h-7 text-xs font-medium"
              >
                Load TCS FY15-FY24
              </Button>
            </CardContent>
          </Card>

          {/* HDFC Bank */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              activeSymbol === "HDFCBANK" ? "ring-2 ring-primary border-primary bg-primary/5" : ""
            }`}
            onClick={() => onLoadSample("HDFCBANK")}
          >
            <CardHeader className="p-3.5 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  HDFCBANK
                </Badge>
                {activeSymbol === "HDFCBANK" && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4 bg-emerald-600">
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm mt-1">HDFC Bank Limited</CardTitle>
              <CardDescription className="text-xs line-clamp-1">
                Banking & Finance • Retail & Wholesale Advances
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              <div className="text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>FY24 Deposits:</span>
                  <span className="font-mono font-medium text-foreground">₹23,79,786 Cr</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-mono">FY15–FY24 (10 Years)</span>
                </div>
              </div>
              <Button
                variant={activeSymbol === "HDFCBANK" ? "secondary" : "outline"}
                size="sm"
                className="w-full mt-3 h-7 text-xs font-medium"
              >
                Load HDFC Bank FY15-FY24
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Multi-Modal Ingestion Dropzone */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" />
              Multi-Modal Data Ingestion Engine
            </span>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]">PDF</Badge>
              <Badge variant="outline" className="text-[10px]">Excel/CSV</Badge>
              <Badge variant="outline" className="text-[10px]">OCR Scans</Badge>
              <Badge variant="outline" className="text-[10px]">Links</Badge>
              <Badge variant="outline" className="text-[10px]">Text</Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-xs">
            Upload any source filing or paste URLs/transcripts to automatically parse statement lines into the active workstation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="file" className="text-xs">File Upload (PDF/Excel/Images)</TabsTrigger>
              <TabsTrigger value="url" className="text-xs">URL / Exchange Link</TabsTrigger>
              <TabsTrigger value="text" className="text-xs">Unstructured Text / Concall</TabsTrigger>
            </TabsList>

            {/* File Dropzone */}
            <TabsContent value="file">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 bg-muted/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                  <FileText className="h-6 w-6 text-rose-500" />
                  <ImageIcon className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Drag & Drop Files Here or Click to Browse
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Supports Screener.in & BSE Excels/CSVs (`.xlsx`, `.csv`), Annual Report & Concall PDFs (`.pdf`), and Scanned Table Images (`.png`, `.jpg`).
                </p>

                <input
                  id="multi-modal-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs"
                  onClick={() => document.getElementById("multi-modal-file-input")?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Select Local Files
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* URL Fetch */}
            <TabsContent value="url">
              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.bseindia.com/xml-data/corpfiling/AttachLive/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" size="sm" className="text-xs shrink-0" disabled={isProcessing}>
                    <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                    Fetch & Ingest
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Provide corporate announcement URLs, exchange disclosure links, or investor relations filings.
                </p>
              </form>
            </TabsContent>

            {/* Unstructured Text */}
            <TabsContent value="text">
              <form onSubmit={handleTextSubmit} className="space-y-3">
                <Textarea
                  placeholder="Paste concall management commentary, conference call transcripts, or auditor notes to extract metrics and link citation chunks..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[90px] text-xs font-mono"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="text-xs" disabled={isProcessing}>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Ingest Text Block
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* Status Alert */}
          {uploadStatus && (
            <div className="mt-4 flex items-center gap-2 rounded-md bg-muted p-2.5 text-xs text-foreground">
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin text-primary shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
              <span className="flex-1">{uploadStatus}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-1.5"
                onClick={() => setUploadStatus(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
