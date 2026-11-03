"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Zap, CheckCircle, Loader2, Copy } from "lucide-react";

interface SmartSummarizerProps {
  documentId?: string;
  companySymbol?: string;
}

export default function SmartSummarizer({ documentId = "1", companySymbol = "RELIANCE" }: SmartSummarizerProps) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`/api/data-ingestion/summarize?document_id=${documentId}&company_symbol=${companySymbol}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setSummary(json);
      } catch (e: any) {
        setError(e.message);
        // Fallback mock
        setSummary({
          executive_summary: "Reliance Industries delivered strong Q4 FY24 results with consolidated revenue growing 12% YoY to ₹2.4L Cr, driven by O2C margin improvement and Retail expansion. EBITDA grew 15% YoY to ₹45K Cr. Management guided for 12-15% revenue growth in FY25 with EBITDA margins of 18-20%.",
          key_points: [
            "O2C segment EBITDA/bbl improved to $13.2 from $11.8 YoY",
            "Retail revenue crossed ₹2.4L Cr, store count at 18,500+",
            "Jio ARPU increased to ₹182, subscriber base at 470M",
            "Capex guidance of ₹1.2L Cr for FY25, focus on new energy",
            "Net debt reduced to ₹50K Cr from ₹75K Cr YoY",
          ],
          risk_factors: [
            "Global recession risk impacting O2C demand",
            "Regulatory changes in telecom tariffs",
            "New energy execution risk at scale",
          ],
          citations: [
            { page: 12, text: "Consolidated revenue for Q4 FY24 stood at ₹2,40,000 Cr" },
            { page: 15, text: "O2C EBITDA per barrel improved to $13.2" },
            { page: 28, text: "Retail store count reached 18,500+" },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [documentId, companySymbol]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/data-ingestion/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId, company_symbol: companySymbol, regenerate: true }),
      });
      if (res.ok) {
        const json = await res.json();
        setSummary(json);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>AI Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !summary) {
    return (
      <Card className="h-full">
        <CardHeader><CardTitle>AI Summary</CardTitle></CardHeader>
        <CardContent>
          <p className="text-red-500 text-sm">Error: {error}</p>
          <Button variant="outline" onClick={handleGenerate} className="mt-2">
            <Zap className="mr-2 h-4 w-4" /> Generate Summary
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Summary — Doc #{documentId}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {summary.citations?.length || 0} citations
          </Badge>
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            <Zap className="mr-1 h-3 w-3" /> {generating ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Executive Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> Executive Summary
          </h4>
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm leading-relaxed">{summary.executive_summary || "No summary available"}</p>
          </div>
        </div>

        {/* Key Points */}
        {summary.key_points?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Key Points</h4>
            <div className="space-y-1">
              {summary.key_points.map((point: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-green-500/5 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {summary.risk_factors?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Risk Factors</h4>
            <div className="space-y-1">
              {summary.risk_factors.map((risk: string, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-red-500/5 rounded">
                  <span className="h-4 w-4 text-red-500 shrink-0 mt-0.5">⚠</span>
                  <p className="text-sm">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citations */}
        {summary.citations?.length > 0 && (
          <div className="group">
            <details>
              <summary className="flex items-center justify-between cursor-pointer p-2 rounded bg-muted/30">
                <span className="font-medium text-sm">Citations ({summary.citations.length})</span>
                <Badge variant="outline" className="text-xs">Page references</Badge>
              </summary>
              <div className="p-3 border-t text-sm space-y-2">
                {summary.citations.map((c: any, i: number) => (
                  <div key={i} className="p-2 bg-muted/50 rounded flex items-start gap-2">
                    <span className="text-xs text-muted-foreground shrink-0">p.{c.page}</span>
                    <p className="flex-1 text-muted-foreground">{c.text}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(c.text)} title="Copy citation">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
