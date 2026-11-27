import { processManual } from '@/demo/server/manuals';

/** Gemini reads the uploaded file into structured content. The app calls this right after uploading. */
export async function POST(_request: Request, { id }: { id: string }) {
  const m = await processManual(id);
  if (!m) return Response.json({ error: 'notFound' }, { status: 404 });
  return Response.json(m, { headers: { 'Cache-Control': 'no-store' } });
}
