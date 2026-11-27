import { aiEnabled } from '@/demo/server/ai';
import { translateUploaded } from '@/demo/server/manuals';
import { LANGS, type Lang } from '@/demo/types';

/** Translate into one language (saved for everyone; later requests are instant). */
export async function POST(request: Request, { id }: { id: string }) {
  const { lang } = (await request.json().catch(() => ({}))) as { lang?: string };
  const to = LANGS.find((l) => l.code === lang)?.code as Lang | undefined;
  if (!to) return Response.json({ error: 'badLang' }, { status: 400 });
  if (!aiEnabled()) return Response.json({ error: 'noAi' }, { status: 503 });
  const doc = await translateUploaded(id, to);
  if (!doc) return Response.json({ error: 'failed' }, { status: 502 });
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
