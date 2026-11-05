"use client";

import React from "react";
import { CardNotesEditor } from "@/components/workstation/CardNotesEditor";
import { CardAttachmentDropzone } from "@/components/workstation/CardAttachmentDropzone";

export interface QualitativeAdapterProps {
  symbol: string;
  cardId?: string;
}

/**
 * Dedicated Full-Height Qualitative Research & Investment Thesis Notes Adapter
 * Directly renders CardNotesEditor allowing analysts to draft comprehensive thesis notes.
 */
export function StandaloneNotesAdapter({
  symbol,
  cardId = "standalone-notes",
}: QualitativeAdapterProps) {
  return (
    <div
      className="h-full w-full overflow-auto p-3 bg-card"
      data-testid="standalone-notes-widget"
    >
      <CardNotesEditor
        cardId={cardId}
        symbol={symbol}
        showHeader={false}
        className="border-0 shadow-none p-0"
      />
    </div>
  );
}

/**
 * Dedicated Full-Height File & Document Attachment Repository Hub Adapter
 * Directly renders CardAttachmentDropzone for managing filings, PDFs, Excel sheets, and evidence.
 */
export function AttachmentHubAdapter({
  symbol,
  cardId = "attachment-hub",
}: QualitativeAdapterProps) {
  return (
    <div
      className="h-full w-full overflow-auto p-3 bg-card"
      data-testid="attachment-hub-widget"
    >
      <CardAttachmentDropzone
        cardId={cardId}
        symbol={symbol}
        className="border-0 shadow-none p-0"
      />
    </div>
  );
}
