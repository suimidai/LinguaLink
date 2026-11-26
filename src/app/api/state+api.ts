import { getState } from '@/demo/server/store';

export function GET() {
  return Response.json(getState(), { headers: { 'Cache-Control': 'no-store' } });
}
