import { listManuals, MAX_UPLOAD_BYTES, uploadManual, UploadError } from '@/demo/server/manuals';

const noStore = { 'Cache-Control': 'no-store' };

/** List uploaded manuals (no content). */
export async function GET() {
  try {
    return Response.json(await listManuals(), { headers: noStore });
  } catch (e) {
    console.error('[manuals] list failed:', e instanceof Error ? e.message : e);
    return Response.json([], { headers: noStore });
  }
}

/** Upload a manual: one PDF, one Word file, or up to 20 photos of pages (multipart field "files"). */
export async function POST(request: Request) {
  const len = Number(request.headers.get('content-length') ?? 0);
  if (len > MAX_UPLOAD_BYTES + 512 * 1024) return Response.json({ error: 'tooBig' }, { status: 413 });
  try {
    // (React Native's FormData type doesn't describe the server's Web FormData, so read it loosely.)
    const form = (await request.formData()) as unknown as { getAll(k: string): unknown[]; get(k: string): unknown };
    const files = form.getAll('files').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f);
    const by = String(form.get('userId') ?? '').slice(0, 40) || 'guest';
    return Response.json(await uploadManual(files, by), { headers: noStore });
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ error: e.code }, { status: 400 });
    console.error('[manuals] upload failed:', e instanceof Error ? e.message : e);
    return Response.json({ error: 'failed' }, { status: 500 });
  }
}
