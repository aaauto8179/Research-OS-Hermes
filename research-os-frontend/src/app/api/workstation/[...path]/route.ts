import { NextRequest, NextResponse } from "next/server";

/**
 * Frontend BFF Proxy Route for Antigravity Workstation Backend
 *
 * Forwards GET, POST, PUT, DELETE, PATCH requests to the Python ingestion backend
 * at http://localhost:8001/api/workstation/ (or DATA_INGESTION_BACKEND_URL / BACKEND_URL).
 *
 * Key Capabilities:
 * 1. Seamless proxy forwarding for layout, qualitative notes, and attachments endpoints.
 * 2. Full binary and multipart streaming support for file attachment uploads and downloads.
 * 3. Graceful offline JSON handling when the Python backend is starting or offline,
 *    preventing client-side HTML error crashes and enabling local fallback.
 */

const BACKEND_BASE = (
  process.env.DATA_INGESTION_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8001"
).replace(/\/+$/, "");

async function forwardToBackend(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
  method: string
): Promise<Response> {
  const resolvedParams = await context.params;
  const pathSegments = resolvedParams?.path || [];
  const targetPath = pathSegments.join("/");
  const incomingUrl = new URL(request.url);
  const targetUrl = `${BACKEND_BASE}/api/workstation/${targetPath}${incomingUrl.search}`;

  // Forward sanitized headers, preserving content-type, authorization, accept
  const forwardHeaders = new Headers();
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!["host", "connection", "transfer-encoding", "content-length"].includes(lowerKey)) {
      forwardHeaders.set(key, value);
    }
  });

  // Extract body buffer for non-GET/HEAD methods with content
  let bodyBuffer: ArrayBuffer | undefined = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      const buffer = await request.arrayBuffer();
      if (buffer.byteLength > 0) {
        bodyBuffer = buffer;
      }
    } catch {
      // Body empty or unreadable
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body: bodyBuffer,
      // @ts-ignore - Node.js 18+ fetch duplex support
      duplex: bodyBuffer ? "half" : undefined,
      cache: "no-store",
    });

    // Mirror backend headers
    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (!["transfer-encoding", "content-encoding"].includes(lowerKey)) {
        responseHeaders.set(key, value);
      }
    });

    // Check for binary/streaming attachment download
    const contentType = backendRes.headers.get("content-type") || "";
    const isStream =
      contentType.includes("application/octet-stream") ||
      contentType.includes("application/pdf") ||
      contentType.includes("image/") ||
      targetPath.includes("download");

    if (isStream && backendRes.body) {
      return new Response(backendRes.body, {
        status: backendRes.status,
        statusText: backendRes.statusText,
        headers: responseHeaders,
      });
    }

    // Default response buffer
    const resData = await backendRes.arrayBuffer();
    return new Response(resData, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.warn(
      `[Workstation BFF Proxy] Backend offline or unreachable at ${targetUrl} (${errorMessage}). Returning graceful fallback JSON.`
    );

    const isNotes = targetPath.includes("notes");
    const isAttachments = targetPath.includes("attachments");

    const fallbackPayload = {
      status: "offline_fallback",
      success: false,
      offline: true,
      target: targetUrl,
      path: targetPath,
      data: isNotes || isAttachments ? [] : null,
      message: `Workstation backend service currently unreachable at ${BACKEND_BASE}. Operating in client storage mode.`,
      error: errorMessage,
    };

    return NextResponse.json(fallbackPayload, {
      status: 503,
      headers: {
        "content-type": "application/json",
        "x-workstation-fallback": "true",
        "retry-after": "5",
      },
    });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardToBackend(request, context, "GET");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardToBackend(request, context, "POST");
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardToBackend(request, context, "DELETE");
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardToBackend(request, context, "PUT");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  return forwardToBackend(request, context, "PATCH");
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}
