"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Calendar,
  Layers,
  BookOpen,
  Info,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatementCellData } from "@/data/sample-statements";
import { formatINRCrores, formatPercent, formatPerShare } from "@/lib/formatters";

export interface SelectedCellInfo {
  metricKey: string;
  displayName: string;
  category: string;
  period: string;
  cellData: StatementCellData;
}

interface SourceOfTruthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCell: SelectedCellInfo | null;
  companySymbol: string;
  companyName: string;
}

export function SourceOfTruthDrawer({
  isOpen,
  onClose,
  selectedCell,
  companySymbol,
  companyName,
}: SourceOfTruthDrawerProps) {
  if (!selectedCell) return null;

  const { metricKey, displayName, category, period, cellData } = selectedCell;
  const citation = cellData.citation;

  const formattedValue = (() => {
    if (cellData.unit === 'PERCENT') {
      return formatPercent(cellData.value);
    }
    if (cellData.unit === 'PER_SHARE') {
      return formatPerShare(cellData.value);
    }
    return formatINRCrores(cellData.value, { decimals: 0, useParenthesesForNegative: true });
  })();

  const [copied, setCopied] = React.useState(false);

  const handleCopyCitation = () => {
    if (!citation) return;
    const text = `${companyName} (${companySymbol}) - ${displayName} [${period}]: ${formattedValue}. Source: ${citation.documentTitle}, ${citation.pageNumber ? `Page ${citation.pageNumber}, ` : ''}${citation.noteReference || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" />
        <Dialog.Content
          data-testid="source-of-truth-drawer"
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-border bg-background p-0 shadow-2xl transition-transform animate-in slide-in-from-right duration-300 sm:max-w-xl focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <Dialog.Title className="text-base font-semibold leading-none tracking-tight">
                  Source of Truth Citation
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted-foreground mt-1">
                  Ground-truth audit trail for {companySymbol} • {period}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </Dialog.Close>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Metric Value Card */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider mb-1.5 font-mono">
                    {category} • {metricKey}
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground">{displayName}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground font-medium">{period} Reported</div>
                  <div className="text-2xl font-mono font-bold text-primary mt-0.5">
                    {formattedValue}
                  </div>
                </div>
              </div>
            </div>

            {/* Citation Available vs Not Available */}
            {citation ? (
              <div className="space-y-5">
                {/* Verification Badge */}
                <div className="flex items-center justify-between rounded-md bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      <strong>Audited Statutory Source:</strong> Verified against official {citation.source} filing.
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                    {Math.round(citation.confidence * 100)}% match
                  </Badge>
                </div>

                {/* Source Document Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    Filing Metadata
                  </h4>

                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2.5 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs text-muted-foreground shrink-0 w-24">Document:</span>
                      <span className="font-medium text-foreground text-right">{citation.documentTitle}</span>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-semibold">{(citation.docType || "DOCUMENT").replace(/_/g, " ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Exchange / Src:</span>{" "}
                        <span className="font-semibold">{citation.source}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Filing Date:</span>{" "}
                        <span className="font-semibold">{citation.filingDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fiscal Period:</span>{" "}
                        <span className="font-semibold">{citation.fiscalPeriod}</span>
                      </div>
                    </div>

                    {(citation.pageNumber || citation.noteReference) && (
                      <>
                        <Separator />
                        <div className="rounded bg-background/80 p-2 text-xs space-y-1">
                          {citation.pageNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Page Number:</span>
                              <Badge variant="outline" className="font-mono text-[11px]">
                                Page {citation.pageNumber}
                              </Badge>
                            </div>
                          )}
                          {citation.noteReference && (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-muted-foreground">Notes to Accounts:</span>
                              <span className="font-medium text-primary text-right">{citation.noteReference}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Document Snippet / Excerpt */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Document Snippet & Verbatim Excerpt
                  </h4>

                  {citation.extractedSnippet.textPassage && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-foreground">
                      <p className="italic font-serif border-l-2 border-amber-500 pl-3">
                        &ldquo;{citation.extractedSnippet.textPassage}&rdquo;
                      </p>
                    </div>
                  )}

                  {citation.extractedSnippet?.tableSlice &&
                    Array.isArray(citation.extractedSnippet.tableSlice.headers) &&
                    Array.isArray(citation.extractedSnippet.tableSlice.rows) && (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground">
                        Extracted Schedule Table Slice
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              {citation.extractedSnippet.tableSlice.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {citation.extractedSnippet.tableSlice.rows.map((r, ri) => (
                              <tr key={ri} className="border-b last:border-0 hover:bg-muted/30">
                                {Array.isArray(r) && r.map((c, ci) => (
                                  <td key={ci} className={`px-3 py-1.5 ${ci > 0 ? 'text-right font-mono' : 'font-medium'}`}>
                                    {typeof c === 'number' ? formatINRCrores(c) : c}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {citation.chunkId && (
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-muted/40 p-2 rounded">
                      <span className="font-mono">Chunk ID: {citation.chunkId}</span>
                      <Badge variant="outline" className="text-[10px]">Indexed</Badge>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
                <Info className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-semibold text-foreground">Historical Standard Metric</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  This value for <strong>{period}</strong> was compiled from the historical 10-year Screener.in / BSE standardized accounting ledger.
                </p>
                <div className="pt-2">
                  <Badge variant="secondary" className="text-xs">
                    Standardized Ledger Row
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border p-4 bg-muted/30 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCitation}
              disabled={!citation}
              className="text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              {copied ? "Copied!" : "Copy Citation"}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                className="text-xs"
                onClick={() => {
                  alert(`Navigating to Document Vault for ${companySymbol} • ${citation?.documentTitle || 'Filing'}`);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                View in Vault
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
