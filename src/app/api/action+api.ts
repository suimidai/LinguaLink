import { applyAction } from '@/demo/server/store';
import type { DemoAction } from '@/demo/types';

export async function POST(request: Request) {
  const action = (await request.json()) as DemoAction;
  return Response.json(applyAction(action), { headers: { 'Cache-Control': 'no-store' } });
}
