import { getOriginalFile } from '@/demo/server/manuals';

/** Download the original PDF / Word file. */
export async function GET(_request: Request, { id }: { id: string }) {
  const f = await getOriginalFile(id);
  if (!f) return new Response('Not found', { status: 404 });
  return new Response(new Blob([new Uint8Array(f.bytes)]), {
    headers: {
      'Content-Type': f.mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(f.fileName)}`,
    },
  });
}
