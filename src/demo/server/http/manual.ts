import { deleteManual, getManualFor } from '@/demo/server/manuals';
import { LANGS, type Lang } from '@/demo/types';

/** One uploaded manual: original content + the requested language if it's translated already. */
export async function GET(request: Request, { id }: { id: string }) {
  const q = new URL(request.url).searchParams.get('lang');
  const lang = LANGS.find((l) => l.code === q)?.code as Lang | undefined;
  const m = await getManualFor(id, lang);
  if (!m) return Response.json({ error: 'notFound' }, { status: 404 });
  return Response.json(m, { headers: { 'Cache-Control': 'no-store' } });
}

/** The person who uploaded it can remove it. */
export async function DELETE(request: Request, { id }: { id: string }) {
  const { userId } = (await request.json().catch(() => ({}))) as { userId?: string };
  const ok = userId ? await deleteManual(id, userId) : false;
  return Response.json({ ok }, { status: ok ? 200 : 403 });
}
