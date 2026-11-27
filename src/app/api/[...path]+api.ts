// One entry point for every /api/* request. Keeping a single API route means the server bundle
// holds ONE copy of MongoDB + Gemini (13 separate routes each carried their own copy, which
// made the deployed Cloudflare Worker run out of memory at startup).
import * as action from '@/demo/server/http/action';
import * as ask from '@/demo/server/http/ask';
import * as health from '@/demo/server/http/health';
import * as manual from '@/demo/server/http/manual';
import * as manualFile from '@/demo/server/http/manual-file';
import * as manualPrint from '@/demo/server/http/manual-print';
import * as manualRead from '@/demo/server/http/manual-read';
import * as manualTranslate from '@/demo/server/http/manual-translate';
import * as manuals from '@/demo/server/http/manuals';
import * as state from '@/demo/server/http/state';
import * as summary from '@/demo/server/http/summary';
import * as translate from '@/demo/server/http/translate';

type Handler = (request: Request, params: { id: string }) => Response | Promise<Response>;
type Module = Partial<Record<'GET' | 'POST' | 'DELETE', Handler>>;

const SIMPLE: Record<string, Module> = { state, action, translate, summary, ask, health, manuals } as Record<string, Module>;
const MANUAL_SUB: Record<string, Module> = { read: manualRead, translate: manualTranslate, file: manualFile, print: manualPrint } as Record<string, Module>;

function route(request: Request): { mod?: Module; id: string } {
  const parts = new URL(request.url).pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 1) return { mod: SIMPLE[parts[0]], id: '' };
  if (parts[0] === 'manuals' && parts.length === 2) return { mod: manual as Module, id: parts[1] };
  if (parts[0] === 'manuals' && parts.length === 3) return { mod: MANUAL_SUB[parts[2]], id: parts[1] };
  return { id: '' };
}

function dispatch(method: 'GET' | 'POST' | 'DELETE') {
  return async (request: Request) => {
    const { mod, id } = route(request);
    const handler = mod?.[method];
    if (!mod) return Response.json({ error: 'notFound' }, { status: 404 });
    if (!handler) return new Response('Method not allowed', { status: 405 });
    return handler(request, { id });
  };
}

export const GET = dispatch('GET');
export const POST = dispatch('POST');
export const DELETE = dispatch('DELETE');
