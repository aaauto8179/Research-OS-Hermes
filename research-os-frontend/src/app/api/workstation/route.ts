import { NextResponse } from "next/server";

/**
 * Root endpoint for Workstation BFF service (/api/workstation)
 */
const BACKEND_BASE = (
  process.env.DATA_INGESTION_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8001"
).replace(/\/+$/, "");

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "research-os-workstation-bff",
    version: "1.0.0",
    backend_url: BACKEND_BASE,
    endpoints: [
      "/api/workstation/layout/{symbol}",
      "/api/workstation/notes/{symbol}",
      "/api/workstation/attachments/{symbol}",
    ],
  });
}
