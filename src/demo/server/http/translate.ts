import { aiEnabled, translateMessage } from '@/demo/server/ai';
import { applyChatFindings, openTasks, pendingMessages, readStore, saveTranslation } from '@/demo/server/store';

const g = globalThis as unknown as { __lingualinkTranslating?: Set<string> };

/** Translate the messages that were just sent (they show "Translating…" until this finishes). */
export async function POST(request: Request) {
  if (!aiEnabled()) return Response.json({ ok: true, translated: 0 }, { headers: { 'Cache-Control': 'no-store' } });
  const { catchUp } = (await request.json().catch(() => ({}))) as { catchUp?: boolean };
  const busy = (g.__lingualinkTranslating ??= new Set());
  try {
    const { pending, tasks } = await readStore(() => ({ pending: pendingMessages(!!catchUp), tasks: openTasks() }));
    const todo = pending.filter((m) => !busy.has(m.id));
    await Promise.all(
      todo.map(async (m) => {
        busy.add(m.id);
        try {
          const tr = await translateMessage(m.text, m.lang, tasks);
          await saveTranslation(m.id, tr);
          // "I cleaned the filter" → tick it; "next shift must…" → add a task; "03 is leaking" → open a report.
          if (tr) await applyChatFindings({ completed: tr.completed, newTasks: tr.newTasks, problem: tr.problem && { ...tr.problem, text: tr.text } }, m.authorId);
        } finally {
          busy.delete(m.id);
        }
      }),
    );
    return Response.json({ ok: true, translated: todo.length }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Busy, try again' }, { status: 503 });
  }
}
