import { aiEnabled } from '@/demo/server/ai';
import { getDb, mongoEnabled } from '@/demo/server/db';

/**
 * Status check for the deployed site: is the database set up and reachable, is the AI key set?
 * Never returns secrets, only yes/no and a short error type.
 */
export async function GET() {
  let db: 'not-configured' | 'connected' | 'error' = 'not-configured';
  let dbError: string | undefined;
  if (mongoEnabled()) {
    try {
      const d = await Promise.race([getDb(), new Promise<never>((_, no) => setTimeout(() => no(new Error('timeout after 8s')), 8000))]);
      await d.command({ ping: 1 });
      db = 'connected';
    } catch (e) {
      db = 'error';
      // Keep only the error kind (no hosts, users or passwords).
      dbError = (e instanceof Error ? `${e.name}: ${e.message}` : String(e)).replace(/mongodb(\+srv)?:\/\/\S+/gi, '[uri]').slice(0, 160);
    }
  }
  return Response.json(
    { db, dbError, ai: aiEnabled() ? 'configured' : 'not-configured', time: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
