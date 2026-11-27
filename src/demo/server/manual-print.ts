// A translated manual as a clean, printable HTML page. The browser's "Save as PDF" turns it into a PDF.
import { translate } from '../i18n';
import { LANG_NAMES } from '../i18n-lingualink';
import type { Lang, ManualContent, UploadedManual } from '../types';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Noto fonts so Thai, Myanmar, Khmer, Lao and Japanese print correctly on any computer.
const FONTS =
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Thai:wght@400;700&family=Noto+Sans+Myanmar:wght@400;700&family=Noto+Sans+Khmer:wght@400;700&family=Noto+Sans+Lao:wght@400;700&family=Noto+Sans+JP:wght@400;700&display=swap';

export function manualPrintHtml(m: UploadedManual, doc: ManualContent, lang: Lang): string {
  const t = (k: string, p?: Record<string, string>) => translate(lang, k, p);
  const from = m.sourceLang ? LANG_NAMES[lang][m.sourceLang] : '';
  const translated = m.sourceLang !== lang;
  let step = 0;

  const body = doc.sections
    .map((sec) => {
      step = 0;
      const blocks = sec.blocks
        .map((b) => {
          if (b.type === 'step') return `<div class="step"><span class="n">${++step}</span><p>${esc(b.text)}</p></div>`;
          if (b.type === 'warning') return `<div class="warn">⚠ ${esc(b.text)}</div>`;
          if (b.type === 'table' && b.rows.length) {
            const [head, ...rows] = b.rows;
            return `<table>${b.text ? `<caption>${esc(b.text)}</caption>` : ''}<thead><tr>${head.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows
              .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
              .join('')}</tbody></table>`;
          }
          return b.text ? `<p>${esc(b.text)}</p>` : '';
        })
        .join('\n');
      return `<section>${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ''}${blocks}</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(doc.title || m.fileName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
  :root { --ink: #0F2A2E; --sub: #5B6B73; --teal: #00A896; --line: #D9E2E5; --warn: #FFF4D6; --warnInk: #7A5200; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #F5F7FA; color: var(--ink); font: 15px/1.6 'Noto Sans', 'Noto Sans Thai', 'Noto Sans Myanmar', 'Noto Sans Khmer', 'Noto Sans Lao', 'Noto Sans JP', system-ui, sans-serif; }
  .bar { position: sticky; top: 0; display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 10px 16px; background: #0F2A2E; color: #fff; }
  .bar button { font: inherit; font-weight: 700; border: 0; border-radius: 8px; padding: 10px 16px; background: var(--teal); color: #fff; cursor: pointer; }
  main { max-width: 820px; margin: 24px auto; background: #fff; padding: 32px; border: 1px solid var(--line); border-radius: 12px; }
  h1 { font-size: 26px; line-height: 1.3; margin: 0 0 6px; }
  .meta { color: var(--sub); font-size: 13px; margin-bottom: 20px; }
  .note { background: #E6F7F5; border-radius: 8px; padding: 10px 12px; font-size: 13px; margin-bottom: 20px; }
  h2 { font-size: 19px; margin: 24px 0 8px; padding-top: 12px; border-top: 1px solid var(--line); }
  .step { display: flex; gap: 12px; align-items: flex-start; margin: 10px 0; }
  .step .n { flex: none; width: 28px; height: 28px; border: 1.5px solid var(--teal); border-radius: 6px; display: grid; place-items: center; font-weight: 700; color: #007F72; }
  .step p { margin: 2px 0 0; }
  .warn { background: var(--warn); color: var(--warnInk); border-left: 4px solid #E0A100; padding: 10px 12px; border-radius: 6px; margin: 10px 0; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
  caption { text-align: left; font-weight: 700; margin-bottom: 6px; }
  th, td { border: 1px solid var(--line); padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #F1F5F6; }
  @media (max-width: 600px) { main { margin: 0; border-radius: 0; padding: 20px 16px; } }
  @media print {
    body { background: #fff; }
    .bar { display: none; }
    main { margin: 0; border: 0; padding: 0; max-width: none; }
    h2 { break-after: avoid; }
    .step, .warn, tr { break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="bar"><span>LinguaLink</span><button onclick="window.print()">${esc(t('savePdf'))}</button></div>
<main>
  <h1>${esc(doc.title || m.fileName)}</h1>
  <div class="meta">${esc(m.fileName)} · ${m.pages} ${esc(t('pagesShort'))}</div>
  ${translated ? `<div class="note">${esc(t('translatedByAi', { lang: from }))}</div>` : ''}
  ${body}
</main>
</body>
</html>`;
}
