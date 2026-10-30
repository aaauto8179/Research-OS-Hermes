import { NextRequest, NextResponse } from 'next/server';

const MATH_ENGINE_URL = process.env.MATH_ENGINE_URL || 'http://localhost:8000';

async function proxyToMathEngine(path: string, request: NextRequest) {
  const url = `${MATH_ENGINE_URL}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Forward auth headers if any
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
    // Don't cache proxy responses
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
  return proxyToMathEngine('/dcf', request);
}

export async function GET(request: NextRequest) {
  return proxyToMathEngine('/dcf', request);
}
