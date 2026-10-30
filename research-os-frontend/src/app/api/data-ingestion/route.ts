import { NextRequest, NextResponse } from 'next/server';

const DATA_INGESTION_URL = process.env.DATA_INGESTION_URL || 'http://localhost:8001';

async function proxyToDataIngestion(path: string, request: NextRequest) {
  const url = `${DATA_INGESTION_URL}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const body = request.method !== 'GET' && request.method !== 'HEAD' 
    ? await request.text() 
    : undefined;

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
    cache: 'no-store',
  });

  const data = await response.text();
  
  return new NextResponse(data, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}

export async function POST(request: NextRequest) {
  return proxyToDataIngestion('/extract', request);
}

export async function GET(request: NextRequest) {
  return proxyToDataIngestion('/health', request);
}
