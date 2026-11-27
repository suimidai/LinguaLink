import { aiEnabled, describeProblem, MAX_MESSAGE_CHARS, summarizeShift } from '@/demo/server/ai';
import { clearManuals } from '@/demo/server/manuals';
import { applyAction, liveSummaryStatus, readStore, summaryInput, type AiExtras } from '@/demo/server/store';
import { same } from '@/demo/mock/shift';
import type { DemoAction } from '@/demo/types';

export async function POST(request: Request) {
  let action: DemoAction;
  try {
    action = (await request.json()) as DemoAction;
  } catch {
    return Response.json({ error: 'Bad JSON' }, { status: 400 });
  }

  // Gemini runs before the state changes; null results fall back to the scripted demo.
  const extra: AiExtras = {};
  if (action.type === 'chat' && !action.presetId && action.text?.trim()) {
    // Save straight away; the app then calls /api/translate, so sending feels instant.
    action.text = action.text.trim().slice(0, MAX_MESSAGE_CHARS);
    extra.willTranslate = aiEnabled();
  } else if (action.type === 'report' && action.text?.trim()) {
    // Report in the worker's own words: translate it (or keep it as typed when the AI is off).
    const text = action.text.trim().slice(0, MAX_MESSAGE_CHARS);
    const machine = action.machineId ?? 'unknown machine';
    extra.report = (await describeProblem(text, action.lang ?? 'en', machine)) ?? { title: same(text.length > 40 ? `${text.slice(0, 40)}…` : text), text: same(text) };
  } else if (action.type === 'endShift') {
    // Reuse the live summary when it's already up to date; otherwise write a fresh one.
    const { fresh, input } = await readStore(() => ({ ...liveSummaryStatus(), input: summaryInput() }));
    extra.summary = fresh ?? (await summarizeShift(input));
  }

  if (action.type === 'reset') await clearManuals().catch((e) => console.warn('[manuals] reset:', e?.message)); // fresh demo: no uploads

  try {
    return Response.json(await applyAction(action, extra), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Busy, try again' }, { status: 503 });
  }
}
