"use client";

import React, { useState, useRef, useCallback } from "react";
import { useCardWorkbench, CardAttachment } from "@/hooks/useCardWorkbench";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  Download,
  Trash2,
  Loader2,
  Paperclip,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardAttachmentDropzoneProps {
  cardId: string;
  symbol: string;
  className?: string;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatAttachmentDate(dateStr?: string): string {
  if (!dateStr) return "Just now";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getFileIcon(fileName: string, mimeType?: string) {
  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType || "").toLowerCase();

  if (lowerName.endsWith(".pdf") || lowerMime.includes("pdf")) {
    return <FileText className="h-5 w-5 text-rose-500" />;
  }
  if (
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    lowerName.endsWith(".csv") ||
    lowerMime.includes("spreadsheet") ||
    lowerMime.includes("csv") ||
    lowerMime.includes("excel")
  ) {
    return <FileSpreadsheet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
  }
  if (
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".webp") ||
    lowerMime.startsWith("image/")
  ) {
    return <FileImage className="h-5 w-5 text-sky-500" />;
  }
  return <File className="h-5 w-5 text-muted-foreground" />;
}

export function CardAttachmentDropzone({
  cardId,
  symbol,
  className,
}: CardAttachmentDropzoneProps) {
  const {
    attachments,
    uploadAttachment,
    deleteAttachment,
    isLoading,
  } = useCardWorkbench(cardId, symbol);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setIsUploading(true);
      setUploadError(null);

      try {
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          await uploadAttachment(file);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload file";
        setUploadError(msg);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [uploadAttachment]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAttachment(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      data-testid="card-attachment-dropzone"
      className={cn("flex flex-col h-full bg-background/50 rounded-md p-3 space-y-3", className)}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
        multiple
        className="hidden"
        data-testid="attachment-file-input"
      />

      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 select-none",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border/80 hover:border-primary/50 hover:bg-muted/40",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex flex-col items-center text-center space-y-1.5">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">
              {isUploading
                ? "Uploading attachment..."
                : isDragging
                ? "Drop files here to attach"
                : "Drag & drop files or click to browse"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Supports SEC/NSE Filings, PDFs, Excel sheets, Models & Images
            </p>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="flex items-center gap-2 p-2 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Attachments List */}
      <div className="flex-1 flex flex-col min-h-0 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground px-0.5">
          <div className="flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5" />
            <span>Attached Documents ({attachments.length})</span>
          </div>
          <span className="text-[11px]">{symbol}</span>
        </div>

        {attachments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-border/40 rounded-md bg-muted/10">
            <Paperclip className="h-8 w-8 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs font-medium text-muted-foreground">
              No attachments for this card yet
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Attach investor calls, earnings filings, or valuation workbooks.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[300px]">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-md border border-border/60 bg-card hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="shrink-0">{getFileIcon(att.file_name, att.mime_type)}</div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-medium text-foreground truncate"
                      title={att.file_name}
                    >
                      {att.file_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>{formatBytes(att.file_size)}</span>
                      <span>•</span>
                      <span>{formatAttachmentDate(att.created_at)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Download Link */}
                  <a
                    href={`/api/workstation/attachments/${encodeURIComponent(att.id)}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-primary rounded hover:bg-muted transition-colors"
                    title={`Download ${att.file_name}`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="sr-only">Download</span>
                  </a>

                  {/* Delete Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive rounded transition-colors"
                    onClick={() => handleDelete(att.id)}
                    disabled={deletingId === att.id}
                    title="Delete attachment"
                  >
                    {deletingId === att.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
