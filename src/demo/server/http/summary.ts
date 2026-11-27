import { aiEnabled, summarizeShift } from '@/demo/server/ai';
import { liveSummaryStatus, readStore, saveLiveSummary, summaryInput } from '@/demo/server/store';
import type { DemoState } from '@/demo/types';

const g = globalThis as unknown as { __lingualinkSummaryRuns?: Map<string, Promise<DemoState>> };

/**
 * Rewrite the live shift summary (Done / To do / Watch out so far). Called by the app after every
 * message or checklist tick. Requests for the same shift data share one AI call, and nothing is
 * called again when the summary is already up to date.
 */
export async function POST() {
  try {
    const { key, input, fresh } = await readStore(() => ({ ...liveSummaryStatus(), input: summaryInput() }));
    if (fresh) return Response.json({ ok: true, cached: true }, { headers: { 'Cache-Control': 'no-store' } });

    const runs = (g.__lingualinkSummaryRuns ??= new Map());
    let run = runs.get(key);
    if (!run) {
      run = (async () => saveLiveSummary(aiEnabled() ? await summarizeShift(input, { live: true }) : null, key))();
      runs.set(key, run);
      run.finally(() => runs.delete(key)).catch(() => undefined);
    }
    await run;
    return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Busy, try again' }, { status: 503 });
  }
}
