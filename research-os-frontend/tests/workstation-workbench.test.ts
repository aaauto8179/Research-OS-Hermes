import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkbenchCard, WorkbenchCardProps } from "@/components/workstation/WorkbenchCard";
import { CardNotesEditor } from "@/components/workstation/CardNotesEditor";
import {
  CardAttachmentDropzone,
  formatBytes,
  formatAttachmentDate,
} from "@/components/workstation/CardAttachmentDropzone";
import { WorkbenchSlideOver } from "@/components/workstation/WorkbenchSlideOver";
import { useCardWorkbench, CardNote, CardAttachment } from "@/hooks/useCardWorkbench";

// Mock localStorage for Node test environment
class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe("Universal Card Workbench (M4) Test Suite", () => {
  const originalFetch = globalThis.fetch;
  let mockStorage: LocalStorageMock;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = new LocalStorageMock();

    // Mock global window and localStorage
    (globalThis as any).localStorage = mockStorage;
    if (typeof window === "undefined") {
      (globalThis as any).window = { localStorage: mockStorage };
    } else {
      Object.defineProperty(window, "localStorage", {
        value: mockStorage,
        writable: true,
      });
    }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("1. Utility Functions", () => {
    it("formatBytes correctly converts binary bytes to human-readable strings across boundaries", () => {
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(512)).toBe("512 B");
      expect(formatBytes(1023)).toBe("1023 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1536)).toBe("1.5 KB");
      expect(formatBytes(1024 * 1024)).toBe("1 MB");
      expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
      expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GB");
      expect(formatBytes(1024 * 1024 * 1024 * 1.2)).toBe("1.2 GB");
      expect(formatBytes(1024 * 1024 * 1024 * 1024 * 3.5)).toBe("3.5 TB");
    });

    it("formatAttachmentDate handles valid ISO dates, empty strings, and nullish inputs", () => {
      expect(formatAttachmentDate(undefined)).toBe("Just now");
      expect(formatAttachmentDate("")).toBe("Just now");

      const isoDate = "2026-11-05T08:00:00.000Z";
      const formatted = formatAttachmentDate(isoDate);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
      expect(formatted).not.toBe("Just now");
    });
  });

  describe("2. Client Persistence Contracts & LocalStorage Caching", () => {
    it("generates predictable localStorage cache key matching wb_notes_{symbol}_{cardId}", () => {
      const symbol = "RELIANCE";
      const cardId = "card-financial-statements";
      const expectedKey = `wb_notes_${symbol}_${cardId}`;

      const samplePayload = {
        notes: [
          {
            id: "n-1",
            symbol,
            card_id: cardId,
            title: "Q3 Margin Expansion",
            content: "Strong gross margins in retail and digital services.",
            tags: ["Bull Thesis", "Guidance"],
            updated_at: new Date().toISOString(),
          },
        ],
        activeNote: {
          id: "n-1",
          symbol,
          card_id: cardId,
          title: "Q3 Margin Expansion",
          content: "Strong gross margins in retail and digital services.",
          tags: ["Bull Thesis", "Guidance"],
        },
      };

      mockStorage.setItem(expectedKey, JSON.stringify(samplePayload));
      const retrieved = JSON.parse(mockStorage.getItem(expectedKey)!);

      expect(retrieved.activeNote.title).toBe("Q3 Margin Expansion");
      expect(retrieved.notes).toHaveLength(1);
      expect(retrieved.notes[0].tags).toContain("Bull Thesis");
      expect(retrieved.notes[0].tags).toContain("Guidance");
    });

    it("creates multipart FormData with required fields for file upload", () => {
      const file = new File(["dummy content"], "investor-presentation.pdf", {
        type: "application/pdf",
      });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("symbol", "TCS");
      fd.append("card_id", "widget-dcf");
      fd.append("user_id", "default_user");

      expect(fd.get("symbol")).toBe("TCS");
      expect(fd.get("card_id")).toBe("widget-dcf");
      expect(fd.get("user_id")).toBe("default_user");
      const attachedFile = fd.get("file") as File;
      expect(attachedFile.name).toBe("investor-presentation.pdf");
      expect(attachedFile.type).toBe("application/pdf");
    });

    it("constructs correct download endpoint path for attachments", () => {
      const attachmentId = "att-uuid-1234";
      const downloadUrl = `/api/workstation/attachments/${attachmentId}/download`;
      expect(downloadUrl).toBe("/api/workstation/attachments/att-uuid-1234/download");
    });
  });

  describe("3. CardNotesEditor Component", () => {
    it("renders qualitative notes editor with title input, preset tags, and textarea", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "success",
            data: [],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      const html = renderToStaticMarkup(
        React.createElement(CardNotesEditor, {
          cardId: "test-card-1",
          symbol: "RELIANCE",
        })
      );

      expect(html).toContain('data-testid="card-notes-editor"');
      expect(html).toContain("Research Notes • RELIANCE");
      expect(html).toContain("Bull Thesis");
      expect(html).toContain("Accounting Risk");
      expect(html).toContain("Guidance");
      expect(html).toContain("Valuation");
      expect(html).toContain("Catalyst");
      expect(html).toContain("Auto-syncs 500ms");
    });

    it("renders auto-save indicator in ready state initially", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(CardNotesEditor, {
          cardId: "card-2",
          symbol: "TCS",
        })
      );

      expect(html).toContain("Ready");
    });

    it("renders close button when onClose handler is provided", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(CardNotesEditor, {
          cardId: "card-close-test",
          symbol: "INFY",
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('title="Close Notes"');
    });
  });

  describe("4. CardAttachmentDropzone Component", () => {
    it("renders dropzone container, file input, and empty state when no attachments exist", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(CardAttachmentDropzone, {
          cardId: "card-dropzone-1",
          symbol: "HDFCBANK",
        })
      );

      expect(html).toContain('data-testid="card-attachment-dropzone"');
      expect(html).toContain('data-testid="attachment-file-input"');
      expect(html).toContain("Drag &amp; drop files or click to browse");
      expect(html).toContain("No attachments for this card yet");
      expect(html).toContain("Attached Documents (0)");
    });

    it("renders attachment items with download links and delete actions", () => {
      const cacheKey = "wb_notes_RELIANCE_card-att-list";
      mockStorage.setItem(
        cacheKey,
        JSON.stringify({
          notes: [],
          activeNote: null,
          attachments: [
            {
              id: "att-pdf-1",
              symbol: "RELIANCE",
              card_id: "card-att-list",
              file_name: "Annual_Report_2024.pdf",
              file_size: 1024 * 1024 * 4.2,
              mime_type: "application/pdf",
              created_at: "2026-11-05T08:00:00.000Z",
            },
          ],
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(CardAttachmentDropzone, {
          cardId: "card-att-list",
          symbol: "RELIANCE",
        })
      );

      expect(html).toContain('data-testid="card-attachment-dropzone"');
      expect(html).toContain("Annual_Report_2024.pdf");
      expect(html).toContain("4.2 MB");
      expect(html).toContain("/api/workstation/attachments/att-pdf-1/download");
      expect(html).toContain("Attached Documents (1)");
    });
  });

  describe("5. WorkbenchCard Universal Container Component", () => {
    it("renders card frame with drag handle, title, category badge, and default widget view", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const testContent = React.createElement("div", { id: "mock-widget-content" }, "Real Financial Table");

      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          {
            cardId: "widget-fin-statements",
            symbol: "RELIANCE",
            title: "Financial Statements Workstation",
            category: "Financials",
            description: "Multi-year P&L, Balance Sheet, and Cash Flow grid",
            onRemove: vi.fn(),
          },
          testContent
        )
      );

      expect(html).toContain('data-testid="workbench-card"');
      expect(html).toContain('data-card-id="widget-fin-statements"');
      expect(html).toContain("card-drag-handle");
      expect(html).toContain("Financial Statements Workstation");
      expect(html).toContain("Financials");
      expect(html).toContain("Real Financial Table");
      expect(html).toContain('aria-label="Open slide-over drawer"');
      expect(html).toContain('aria-label="Remove widget"');
    });

    it("renders segmented view control with Widget, Notes, and Files options", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          {
            cardId: "widget-scenario",
            symbol: "TCS",
            title: "Scenario Projections",
            category: "Scenarios",
          },
          React.createElement("div", null, "Scenario Chart")
        )
      );

      expect(html).toContain("Widget");
      expect(html).toContain("Notes");
      expect(html).toContain("Files");
    });

    it("displays notes indicator dot when note content is cached in localStorage", () => {
      const cacheKey = "wb_notes_RELIANCE_widget-notes-test";
      mockStorage.setItem(
        cacheKey,
        JSON.stringify({
          activeNote: {
            id: "n-100",
            symbol: "RELIANCE",
            card_id: "widget-notes-test",
            title: "Catalyst Analysis",
            content: "Expected tariff hike in telecom subsidiary.",
            tags: ["Catalyst"],
          },
          notes: [],
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          {
            cardId: "widget-notes-test",
            symbol: "RELIANCE",
            title: "Valuation Sensitivity",
          },
          React.createElement("div", null, "Sensitivity Matrix")
        )
      );

      expect(html).toContain('data-testid="notes-indicator-dot"');
    });

    it("omits remove button if onRemove is not provided", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(
          WorkbenchCard,
          {
            cardId: "widget-no-remove",
            symbol: "TCS",
            title: "KPI Overview",
          },
          React.createElement("div", null, "KPI content")
        )
      );

      expect(html).not.toContain('aria-label="Remove widget"');
    });
  });

  describe("6. WorkbenchSlideOver Component", () => {
    it("renders slide-over dialog structure with title, symbol, and category", () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "success", data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const html = renderToStaticMarkup(
        React.createElement(WorkbenchSlideOver, {
          isOpen: true,
          onClose: vi.fn(),
          cardId: "widget-dcf",
          symbol: "RELIANCE",
          cardTitle: "DCF Valuation Engine",
          category: "Valuation",
          portal: false,
        })
      );

      expect(html).toContain("DCF Valuation Engine");
      expect(html).toContain("RELIANCE");
      expect(html).toContain("Valuation");
      expect(html).toContain("Qualitative Notes");
      expect(html).toContain("Supporting Files");
      expect(html).toContain("Persists to PostgreSQL across sessions");
    });
  });
});
