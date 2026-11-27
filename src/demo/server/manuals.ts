// Uploaded manuals (PDF / Word / photos of pages). Stored in MongoDB (`manuals` + `manualFiles`)
// so everyone shares them; kept in memory when MONGODB_URI isn't set.
// Gemini reads a manual once; each language is translated the first time someone asks, then saved.
import type { Lang, ManualContent, UploadedManual, UploadedManualSummary, UploadKind } from '../types';
import { readManual, translateManual } from './ai';
import { getDb, mongoEnabled } from './db';

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // keeps each stored file under MongoDB's 16 MB document limit
export const MAX_PAGES = 20;
const MAX_DOCX_CHARS = 60_000; // about 20 pages of text
const STALE_MS = 4 * 60_000; // a "reading"/"translating" job older than this is retried

interface StoredFile {
  _id: string;
  parts: { mimeType: string; data: string }[]; // base64
}
type StoredManual = Omit<UploadedManual, 'langs'> & { _id: string; readingSince?: number; translatingSince?: Partial<Record<Lang, number>> };

const g = globalThis as unknown as {
  __llManuals?: Map<string, StoredManual>;
  __llManualFiles?: Map<string, StoredFile>;
  __llManualJobs?: Map<string, Promise<unknown>>;
};
const mem = () => (g.__llManuals ??= new Map());
const memFiles = () => (g.__llManualFiles ??= new Map());
const jobs = () => (g.__llManualJobs ??= new Map());

async function cols() {
  const db = await getDb();
  return { manuals: db.collection<StoredManual>('manuals'), files: db.collection<StoredFile>('manualFiles') };
}

const summary = (m: StoredManual): UploadedManualSummary => ({
  id: m.id,
  fileName: m.fileName,
  kind: m.kind,
  size: m.size,
  pages: m.pages,
  uploadedBy: m.uploadedBy,
  uploadedAt: m.uploadedAt,
  status: m.status,
  error: m.error,
  sourceLang: m.sourceLang,
  title: m.title,
  langs: [...new Set([...(m.sourceLang ? [m.sourceLang] : []), ...(Object.keys(m.translations ?? {}) as Lang[])])],
});

async function getManual(id: string): Promise<StoredManual | null> {
  if (!mongoEnabled()) return mem().get(id) ?? null;
  return (await cols()).manuals.findOne({ _id: id });
}

async function saveManual(m: StoredManual, patch: Partial<StoredManual>) {
  Object.assign(m, patch);
  if (!mongoEnabled()) return void mem().set(m.id, m);
  const unset = Object.fromEntries(Object.entries(patch).filter(([, v]) => v === undefined).map(([k]) => [k, ''] as const));
  const set = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  await (await cols()).manuals.updateOne({ _id: m.id }, { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) });
}

export async function listManuals(): Promise<UploadedManualSummary[]> {
  const all = mongoEnabled()
    ? await (await cols()).manuals.find({}, { projection: { doc: 0, translations: 0 } }).sort({ uploadedAt: -1 }).limit(50).toArray()
    : [...mem().values()].sort((a, b) => b.uploadedAt - a.uploadedAt);
  // The list projection drops translations, so read just their language keys separately.
  if (mongoEnabled()) {
    const langs = await (await cols()).manuals
      .aggregate<{ _id: string; langs: { k: Lang }[] }>([{ $project: { langs: { $objectToArray: { $ifNull: ['$translations', {}] } } } }])
      .toArray();
    const byId = new Map(langs.map((x) => [x._id, x.langs.map((l) => l.k)]));
    return all.map((m) => ({ ...summary({ ...m, translations: {} }), langs: [...new Set([...(m.sourceLang ? [m.sourceLang] : []), ...(byId.get(m._id) ?? [])])] }));
  }
  return all.map(summary);
}

/** The manual with its original content and (if saved) the requested language. */
export async function getManualFor(id: string, lang?: Lang): Promise<UploadedManual | null> {
  const m = await getManual(id);
  if (!m) return null;
  const { _id: _i, readingSince: _r, translatingSince: _t, ...rest } = m;
  return { ...rest, ...summary(m), translations: lang && m.translations?.[lang] ? { [lang]: m.translations[lang] } : {} };
}

export async function getOriginalFile(id: string): Promise<{ fileName: string; mimeType: string; bytes: Uint8Array } | null> {
  const m = await getManual(id);
  const f = mongoEnabled() ? await (await cols()).files.findOne({ _id: id }) : memFiles().get(id);
  if (!m || !f || m.kind === 'images') return null;
  return { fileName: m.fileName, mimeType: f.parts[0].mimeType, bytes: Uint8Array.from(atob(f.parts[0].data), (c) => c.charCodeAt(0)) };
}

// ---------- Upload ----------

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

export class UploadError extends Error {
  constructor(public code: 'tooBig' | 'tooManyPages' | 'unsupported' | 'empty') {
    super(code);
  }
}

const toBase64 = (bytes: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};

/** Rough PDF page count: counts page objects (good enough to stop very long files). */
function pdfPages(bytes: Uint8Array) {
  const text = new TextDecoder('latin1').decode(bytes);
  return (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
}

export async function uploadManual(files: File[], uploadedBy: string): Promise<UploadedManualSummary> {
  if (!files.length) throw new UploadError('empty');
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_UPLOAD_BYTES) throw new UploadError('tooBig');

  const first = files[0];
  const name = first.name.toLowerCase();
  let kind: UploadKind;
  let pages: number;
  const parts: StoredFile['parts'] = [];

  if (files.length === 1 && (first.type === 'application/pdf' || name.endsWith('.pdf'))) {
    kind = 'pdf';
    const bytes = new Uint8Array(await first.arrayBuffer());
    pages = pdfPages(bytes);
    if (pages > MAX_PAGES) throw new UploadError('tooManyPages');
    parts.push({ mimeType: 'application/pdf', data: toBase64(bytes) });
  } else if (files.length === 1 && (first.type === DOCX || name.endsWith('.docx'))) {
    kind = 'docx';
    const bytes = new Uint8Array(await first.arrayBuffer());
    const text = await docxText(bytes);
    if (!text.trim()) throw new UploadError('unsupported');
    if (text.length > MAX_DOCX_CHARS) throw new UploadError('tooManyPages');
    pages = Math.max(1, Math.ceil(text.length / 3000));
    parts.push({ mimeType: DOCX, data: toBase64(bytes) });
  } else if (files.every((f) => IMAGE_TYPES.includes(f.type) || /\.(png|jpe?g|webp|heic|heif)$/i.test(f.name))) {
    kind = 'images';
    if (files.length > MAX_PAGES) throw new UploadError('tooManyPages');
    pages = files.length;
    for (const f of files) parts.push({ mimeType: f.type || 'image/jpeg', data: toBase64(new Uint8Array(await f.arrayBuffer())) });
  } else {
    throw new UploadError('unsupported');
  }

  const id = `up-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const manual: StoredManual = {
    _id: id,
    id,
    fileName: kind === 'images' ? `${files.length} photo${files.length > 1 ? 's' : ''}` : first.name.slice(0, 120),
    kind,
    size: total,
    pages,
    uploadedBy,
    uploadedAt: Date.now(),
    status: 'reading',
    translations: {},
  };
  if (mongoEnabled()) {
    const { manuals, files: fileCol } = await cols();
    await fileCol.insertOne({ _id: id, parts });
    await manuals.insertOne(manual);
  } else {
    memFiles().set(id, { _id: id, parts });
    mem().set(id, manual);
  }
  return summary(manual);
}

/** Run a job once per manual+key in this server; parallel callers share it. */
function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const running = jobs().get(key) as Promise<T> | undefined;
  if (running) return running;
  const p = fn().finally(() => jobs().delete(key));
  jobs().set(key, p);
  return p;
}

/** Gemini reads the manual into structured content (called right after upload, and retried if it got stuck). */
export function processManual(id: string): Promise<UploadedManualSummary | null> {
  return once(`read:${id}`, async () => {
    const m = await getManual(id);
    if (!m) return null;
    if (m.status === 'ready' || (m.status === 'failed' && m.error !== 'ai')) return summary(m);
    // Another server is reading it right now: don't start a second copy (unless it looks stuck).
    if (m.status === 'reading' && m.readingSince && Date.now() - m.readingSince < STALE_MS) return summary(m);
    await saveManual(m, { status: 'reading', readingSince: Date.now(), error: undefined });
    const f = mongoEnabled() ? await (await cols()).files.findOne({ _id: id }) : memFiles().get(id);
    if (!f) {
      await saveManual(m, { status: 'failed', error: 'missing' });
      return summary(m);
    }
    const input =
      m.kind === 'docx'
        ? { text: await docxText(Uint8Array.from(atob(f.parts[0].data), (c) => c.charCodeAt(0))) }
        : { files: f.parts };
    const read = await readManual(input);
    if (!read) await saveManual(m, { status: 'failed', error: 'ai', readingSince: undefined });
    else await saveManual(m, { status: 'ready', sourceLang: read.lang, title: read.doc.title, doc: read.doc, readingSince: undefined });
    return summary(m);
  });
}

/** Translate into one language (first request does the work; the result is saved for everyone). */
export function translateUploaded(id: string, lang: Lang): Promise<ManualContent | null> {
  return once(`tr:${id}:${lang}`, async () => {
    const m = await getManual(id);
    if (!m?.doc) return null;
    if (m.sourceLang === lang) return m.doc;
    if (m.translations?.[lang]) return m.translations[lang]!;
    const tr = await translateManual(m.doc, lang);
    if (tr) await saveManual(m, { translations: { ...(m.translations ?? {}), [lang]: tr } });
    return tr;
  });
}

export async function deleteManual(id: string, by: string): Promise<boolean> {
  const m = await getManual(id);
  if (!m || m.uploadedBy !== by) return false;
  if (!mongoEnabled()) {
    mem().delete(id);
    memFiles().delete(id);
    return true;
  }
  const { manuals, files } = await cols();
  await Promise.all([manuals.deleteOne({ _id: id }), files.deleteOne({ _id: id })]);
  return true;
}

/** "Reset demo" clears uploaded manuals too. */
export async function clearManuals() {
  if (!mongoEnabled()) {
    mem().clear();
    memFiles().clear();
    return;
  }
  const { manuals, files } = await cols();
  await Promise.all([manuals.deleteMany({}), files.deleteMany({})]);
}

// ---------- Word (.docx) → text ----------

/** A .docx is a zip; pull word/document.xml out and turn it into plain text (tables as " | " rows). */
async function docxText(bytes: Uint8Array): Promise<string> {
  const xml = await unzipEntry(bytes, 'word/document.xml');
  if (!xml) return '';
  return xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<\/w:tc>/g, ' | ')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function unzipEntry(bytes: Uint8Array, wanted: string): Promise<string | null> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // Find the end-of-central-directory record.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  for (let n = 0; n < count && p + 46 <= bytes.length; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) return null;
    const method = view.getUint16(p + 10, true);
    const compSize = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    if (name === wanted) {
      const lNameLen = view.getUint16(local + 26, true);
      const lExtraLen = view.getUint16(local + 28, true);
      const start = local + 30 + lNameLen + lExtraLen;
      const data = bytes.subarray(start, start + compSize);
      if (method === 0) return new TextDecoder().decode(data);
      if (method !== 8) return null;
      const stream = new Blob([new Uint8Array(data)]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return await new Response(stream).text();
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return null;
}
