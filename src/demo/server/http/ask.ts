import { aiEnabled, answerQuestion } from '@/demo/server/ai';
import { readStore, tipSegments } from '@/demo/server/store';
import { LANGS, type Lang } from '@/demo/types';

/** "Ask a senior": Gemini answers only from the senior tips. 503 → the app uses its scripted matcher. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { question?: string; lang?: string };
  const question = body.question?.trim();
  const lang = (LANGS.find((l) => l.code === body.lang)?.code ?? 'en') as Lang;
  if (!question) return Response.json({ error: 'Missing question' }, { status: 400 });
  if (!aiEnabled()) return Response.json({ error: 'AI not configured' }, { status: 503 });

  const answer = await answerQuestion(question, lang, await readStore(tipSegments));
  if (!answer) return Response.json({ error: 'AI unavailable' }, { status: 503 });
  return Response.json(answer, { headers: { 'Cache-Control': 'no-store' } });
}
