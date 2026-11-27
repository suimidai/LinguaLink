import { manualPrintHtml } from '@/demo/server/manual-print';
import { getManualFor } from '@/demo/server/manuals';
import { LANGS, type Lang } from '@/demo/types';

/** The translated manual as a clean printable page ("Save as PDF" in the browser). */
export async function GET(request: Request, { id }: { id: string }) {
  const q = new URL(request.url).searchParams.get('lang');
  const lang = (LANGS.find((l) => l.code === q)?.code ?? 'en') as Lang;
  const m = await getManualFor(id, lang);
  if (!m?.doc) return new Response('Not found', { status: 404 });
  const doc = m.sourceLang === lang ? m.doc : m.translations[lang];
  if (!doc) return new Response('Not translated yet', { status: 409 });
  return new Response(manualPrintHtml(m, doc, lang), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
