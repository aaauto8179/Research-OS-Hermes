import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET as rootGET } from '../src/app/api/workstation/route';
import {
  GET as bffGET,
  POST as bffPOST,
  DELETE as bffDELETE,
  PUT as bffPUT,
  PATCH as bffPATCH,
  OPTIONS as bffOPTIONS,
} from '../src/app/api/workstation/[...path]/route';

describe('Workstation BFF Proxy Routes', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Root Route /api/workstation', () => {
    it('returns online service metadata and endpoint catalog', async () => {
      const response = await rootGET();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.status).toBe('online');
      expect(json.service).toBe('research-os-workstation-bff');
      expect(json.endpoints).toContain('/api/workstation/layout/{symbol}');
      expect(json.endpoints).toContain('/api/workstation/notes/{symbol}');
      expect(json.endpoints).toContain('/api/workstation/attachments/{symbol}');
    });
  });

  describe('OPTIONS Preflight Handling', () => {
    it('returns 204 No Content with permissive CORS headers', async () => {
      const response = await bffOPTIONS();
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    });
  });

  describe('Graceful Offline Fallback Handling', () => {
    it('returns structured JSON with 503 status when backend connection fails for layout', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:8001'));

      const req = new Request('http://localhost:3000/api/workstation/layout/RELIANCE', {
        method: 'GET',
      });
      const context = { params: Promise.resolve({ path: ['layout', 'RELIANCE'] }) };

      const response = await bffGET(req, context);
      expect(response.status).toBe(503);
      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('x-workstation-fallback')).toBe('true');

      const json = await response.json();
      expect(json.status).toBe('offline_fallback');
      expect(json.offline).toBe(true);
      expect(json.data).toBeNull();
      expect(json.message).toContain('Workstation backend service currently unreachable');
    });

    it('returns structured fallback JSON with empty array for notes and attachments', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('fetch failed'));

      const reqNotes = new Request('http://localhost:3000/api/workstation/notes/TCS', { method: 'GET' });
      const contextNotes = { params: Promise.resolve({ path: ['notes', 'TCS'] }) };
      const resNotes = await bffGET(reqNotes, contextNotes);
      const jsonNotes = await resNotes.json();
      expect(jsonNotes.data).toEqual([]);

      const reqAtt = new Request('http://localhost:3000/api/workstation/attachments/TCS', { method: 'GET' });
      const contextAtt = { params: Promise.resolve({ path: ['attachments', 'TCS'] }) };
      const resAtt = await bffGET(reqAtt, contextAtt);
      const jsonAtt = await resAtt.json();
      expect(jsonAtt.data).toEqual([]);
    });

    it('handles POST and DELETE offline gracefully without crashing', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const reqPost = new Request('http://localhost:3000/api/workstation/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: 'HDFCBANK', active_tab_id: 'overview' }),
      });
      const contextPost = { params: Promise.resolve({ path: ['layout'] }) };
      const resPost = await bffPOST(reqPost, contextPost);
      expect(resPost.status).toBe(503);
      const jsonPost = await resPost.json();
      expect(jsonPost.status).toBe('offline_fallback');

      const reqDel = new Request('http://localhost:3000/api/workstation/notes/note-123', { method: 'DELETE' });
      const contextDel = { params: Promise.resolve({ path: ['notes', 'note-123'] }) };
      const resDel = await bffDELETE(reqDel, contextDel);
      expect(resDel.status).toBe(503);
    });
  });

  describe('Successful Backend Proxy Forwarding', () => {
    it('forwards GET request and returns backend JSON response with identical headers', async () => {
      const mockPayload = {
        status: 'success',
        data: {
          symbol: 'RELIANCE',
          active_tab_id: 'overview',
          tabs: [{ id: 'overview', label: 'Overview' }],
        },
      };

      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(mockPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const req = new Request('http://localhost:3000/api/workstation/layout/RELIANCE?user_id=default_user', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token' },
      });
      const context = { params: Promise.resolve({ path: ['layout', 'RELIANCE'] }) };

      const res = await bffGET(req, context);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json).toEqual(mockPayload);

      // Verify that backend was invoked with the exact target path and query params
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/workstation/layout/RELIANCE?user_id=default_user'),
        expect.objectContaining({
          method: 'GET',
          cache: 'no-store',
        })
      );
    });

    it('forwards multipart file streaming downloads with Content-Disposition', async () => {
      const mockBinaryData = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // %PDF header
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(mockBinaryData, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="reliance_report.pdf"',
          },
        })
      );

      const req = new Request('http://localhost:3000/api/workstation/attachments/att-456/download', {
        method: 'GET',
      });
      const context = { params: Promise.resolve({ path: ['attachments', 'att-456', 'download'] }) };

      const res = await bffGET(req, context);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/pdf');
      expect(res.headers.get('content-disposition')).toBe('attachment; filename="reliance_report.pdf"');

      const arrayBuffer = await res.arrayBuffer();
      expect(new Uint8Array(arrayBuffer)).toEqual(mockBinaryData);
    });

    it('supports PUT and PATCH methods', async () => {
      globalThis.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ status: 'success', updated: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
      );

      const reqPut = new Request('http://localhost:3000/api/workstation/notes/note-99', {
        method: 'PUT',
        body: JSON.stringify({ content: 'Updated thesis note' }),
      });
      const resPut = await bffPUT(reqPut, { params: Promise.resolve({ path: ['notes', 'note-99'] }) });
      expect(resPut.status).toBe(200);

      const reqPatch = new Request('http://localhost:3000/api/workstation/notes/note-99', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Revised Title' }),
      });
      const resPatch = await bffPATCH(reqPatch, { params: Promise.resolve({ path: ['notes', 'note-99'] }) });
      expect(resPatch.status).toBe(200);
    });
  });
});
