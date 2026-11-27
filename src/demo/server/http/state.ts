import { getState } from '@/demo/server/store';

export async function GET() {
  try {
    return Response.json(await getState(), { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Busy, try again' }, { status: 503 });
  }
}
