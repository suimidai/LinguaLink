// Shared drawing kit for LinguaLink C4 container diagrams (Session 9 style)
const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

const W = 1920, H = 1300;
const C = {
  ink: '#1d1d1f', green: '#12b88f', cont: '#1fc7a3', contDark: '#14a988', person: '#0e9474',
  ext: '#6c6c7c', line: '#8a8f98', label: '#4f555e', bound: '#9aa0a8', step: '#0e9474',
};
const F = "Helvetica Neue, Helvetica, Arial, sans-serif";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const tw = (s, size) => s.length * size * 0.53; // rough text width

// ---------- fixed slots ----------
const SLOT = {
  p1: { x: 60, y: 270, w: 280, h: 130 },
  p2: { x: 60, y: 540, w: 280, h: 130 },
  p3: { x: 60, y: 810, w: 280, h: 130 },
  mobile: { x: 520, y: 250, w: 260, h: 160 },
  web: { x: 520, y: 790, w: 260, h: 160 },
  api: { x: 920, y: 310, w: 240, h: 180 },
  aiw: { x: 920, y: 640, w: 240, h: 160 },
  db: { x: 1270, y: 320, w: 210, h: 180 },
  store: { x: 1270, y: 560, w: 210, h: 130 },
  push: { x: 1590, y: 175, w: 280, h: 130 },
  sakura: { x: 1590, y: 780, w: 280, h: 150 },
};
// anchor on a slot side: side in L R T B, t = 0..1 along that side
function A(id, side, t = 0.5) {
  const r = SLOT[id];
  if (side === 'L') return [r.x, r.y + r.h * t];
  if (side === 'R') return [r.x + r.w, r.y + r.h * t];
  if (side === 'T') return [r.x + r.w * t, r.y];
  return [r.x + r.w * t, r.y + r.h];
}

function Diagram() {
  const out = [];
  const labels = [];
  const T = (x, y, lines, o = {}) => {
    const size = o.size || 20, lh = o.lh || 1.3;
    return lines.map((l, i) => {
      const L = typeof l === 'string' ? { t: l } : l;
      const s = L.size || size;
      return `<text x="${x}" y="${y + i * size * lh}" font-family="${F}" font-size="${s}" font-weight="${L.bold ? 700 : 400}" fill="${L.fill || o.fill || '#fff'}" text-anchor="${o.anchor || 'middle'}">${esc(L.t)}</text>`;
    }).join('');
  };
  const block = (r, lines) => {
    // lines: [{t,bold,size}] centred vertically in r
    const hs = lines.map(l => (l.size || 17) * 1.3);
    let y = r.y + r.h / 2 - hs.reduce((a, b) => a + b, 0) / 2 + (lines[0].size || 17);
    lines.forEach((l, i) => { out.push(T(r.x + r.w / 2, y, [l])); y += hs[i]; });
  };
  const nameLines = (name, tech, desc) => [{ t: name, bold: true, size: 23 }, ...[].concat(tech).map(t => ({ t, size: 17 })), ...desc.map(t => ({ t, size: 17 }))];
  const badge = (cx, cy, g) => { out.push(`<circle cx="${cx}" cy="${cy}" r="30" fill="#fff" stroke="#dfe3e8" stroke-width="2"/>` + GLYPH[g](cx, cy)); };

  const api = {
    raw(x) { out.push(x); },
    text(x, y, lines, o) { out.push(T(x, y, lines, o)); },
    canvas(title1, title2, subtitle) {
      out.push(`<rect width="${W}" height="${H}" fill="#fff"/><defs>
<radialGradient id="g1" cx="0.92" cy="0.06" r="0.5"><stop offset="0" stop-color="#e3f7f1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${C.line}"/></marker>
<marker id="ahs" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M10 0 L0 5 L10 10 z" fill="${C.line}"/></marker>
</defs><rect width="${W}" height="${H}" fill="url(#g1)"/>`);
      out.push(`<text x="70" y="98" font-family="${F}" font-size="48" font-weight="700" fill="${C.ink}">${esc(title1)}<tspan fill="${C.green}">${esc(title2)}</tspan></text>`);
      out.push(T(72, 140, [subtitle], { size: 21, fill: C.label, anchor: 'start' }));
    },
    boundary() {
      // deployment zones: factory site | internet | Sakura cloud (Japan)
      out.push(`<rect x="480" y="200" width="340" height="790" rx="6" fill="#f6fbfa" stroke="${C.bound}" stroke-width="2.5" stroke-dasharray="10 8"/>`);
      out.push(T(496, 976, [{ t: 'Factory site [phones, office PCs]', bold: true }], { size: 16, fill: C.label, anchor: 'start' }));
      out.push(`<rect x="870" y="200" width="630" height="790" rx="6" fill="#f6fbfa" stroke="${C.bound}" stroke-width="2.5" stroke-dasharray="10 8"/>`);
      out.push(T(886, 976, [{ t: 'Sakura cloud, Japan [LinguaLink back end]', bold: true }], { size: 16, fill: C.label, anchor: 'start' }));
      out.push(`<text x="845" y="720" font-family="${F}" font-size="15" font-weight="700" letter-spacing="3" fill="${C.bound}" text-anchor="middle" transform="rotate(-90 845 720)">INTERNET · HTTPS / WSS</text>`);
    },
    node(y1, y2, label) {
      out.push(`<rect x="898" y="${y1}" width="284" height="${y2 - y1}" rx="8" fill="none" stroke="${C.person}" stroke-width="2" stroke-dasharray="4 5"/>`);
      out.push(T(910, y2 - 10, [{ t: label, bold: true }], { size: 15, fill: C.person, anchor: 'start' }));
    },
    gateway(y = 796) {
      out.push(`<rect x="1450" y="${y}" width="110" height="46" rx="8" fill="#fff" stroke="${C.ext}" stroke-width="2.5"/>`);
      out.push(T(1505, y + 19, [{ t: 'Endpoint', bold: true, size: 14, fill: C.ext }, { t: 'gateway', bold: true, size: 14, fill: C.ext }], { lh: 1.15 }));
    },
    tiles(heading, items) {
      out.push(`<line x1="60" y1="1010" x2="1860" y2="1010" stroke="#dfe3e8" stroke-width="2"/>`);
      out.push(T(60, 1045, [{ t: heading, bold: true }], { size: 20, fill: C.ink, anchor: 'start' }));
      const n = items.length, gap = 16, w = (1800 - gap * (n - 1)) / n;
      items.forEach((it, i) => {
        const x = 60 + i * (w + gap), y = 1065;
        const hl = it.hl;
        out.push(`<rect x="${x}" y="${y}" width="${w}" height="205" rx="12" fill="${hl ? C.person : '#eefaf6'}"/>`);
        out.push(T(x + 18, y + 52, [{ t: it.v, bold: true }], { size: 36, fill: hl ? '#fff' : C.person, anchor: 'start' }));
        out.push(T(x + 18, y + 84, [{ t: it.k, bold: true }], { size: 17, fill: hl ? '#fff' : C.ink, anchor: 'start' }));
        const maxc = Math.floor((w - 30) / 7.6), why = [];
        String(it.why).split(' ').forEach(wd => { if (why.length && (why[why.length - 1] + ' ' + wd).length <= maxc) why[why.length - 1] += ' ' + wd; else why.push(wd); });
        out.push(T(x + 18, y + 112, why, { size: 15, fill: hl ? '#e6f7f1' : C.label, anchor: 'start', lh: 1.35 }));
      });
    },
    person(id, name, desc) {
      const r = SLOT[id];
      out.push(`<circle cx="${r.x + r.w / 2}" cy="${r.y - 32}" r="40" fill="${C.person}"/>`);
      out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="28" fill="${C.person}"/>`);
      block(r, nameLines(name, '[Person]', desc));
    },
    container(id, name, tech, desc, opts = {}) {
      const r = { ...SLOT[id], ...(opts.rect || {}) };
      const shape = opts.shape || { web: 'browser', db: 'db', store: 'bucket' }[id] || 'rect';
      const glyph = opts.glyph || { mobile: 'phone', web: 'browser', api: 'server', aiw: 'gear', db: 'db', store: 'bucket' }[id];
      const right = id === 'db' || id === 'store';
      if (shape === 'db') {
        const ry = 18;
        out.push(`<path d="M${r.x} ${r.y + ry} v${r.h - 2 * ry} a${r.w / 2} ${ry} 0 0 0 ${r.w} 0 v-${r.h - 2 * ry}" fill="${C.cont}"/><ellipse cx="${r.x + r.w / 2}" cy="${r.y + ry}" rx="${r.w / 2}" ry="${ry}" fill="${C.contDark}"/>`);
        block({ ...r, y: r.y + 14 }, nameLines(name, tech, desc));
      } else if (shape === 'bucket') {
        out.push(`<path d="M${r.x} ${r.y} h${r.w} l-20 ${r.h} h-${r.w - 40} z" fill="${C.cont}"/>`);
        block(r, nameLines(name, tech, desc));
      } else {
        out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6" fill="${C.cont}"/>`);
        if (shape === 'browser') {
          out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="20" rx="6" fill="${C.contDark}"/>`);
          [0, 1, 2].forEach(i => out.push(`<circle cx="${r.x + r.w - 50 + i * 14}" cy="${r.y + 10}" r="3.5" fill="#fff"/>`));
        }
        if (opts.chips) {
          // name + tech at top, then feature chips
          let y = r.y + 40;
          out.push(T(r.x + r.w / 2, y, [{ t: name, bold: true, size: 23 }])); y += 26;
          [].concat(tech).forEach(t => { out.push(T(r.x + r.w / 2, y, [{ t, size: 16 }])); y += 21; });
          y += 6;
          opts.chips.forEach(([k, t]) => {
            out.push(`<rect x="${r.x + 16}" y="${y}" width="${r.w - 32}" height="28" rx="14" fill="#fff" fill-opacity="0.92"/>`);
            out.push(`<circle cx="${r.x + 32}" cy="${y + 14}" r="11" fill="${C.person}"/>`);
            out.push(T(r.x + 32, y + 20, [{ t: k, bold: true, size: 15 }]));
            out.push(T(r.x + 50, y + 20, [{ t, size: 15, fill: C.ink }], { anchor: 'start' }));
            y += 33;
          });
        } else block({ ...r, y: r.y + (shape === 'browser' ? 10 : 0) }, nameLines(name, tech, desc));
      }
      badge(right ? r.x + r.w - 6 : r.x + 6, r.y + 4, glyph);
    },
    external(id, name, tech, desc) {
      const r = SLOT[id];
      out.push(`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6" fill="${C.ext}"/>`);
      block(r, nameLines(name, tech, desc));
      badge(id === 'push' ? r.x + r.w - 6 : r.x + 6, r.y + 4, id === 'push' ? 'bell' : 'cloud');
    },
    // pts: list of [x,y]; label: {lines, n, at:[x,y]}
    arrow(pts, label, o = {}) {
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
      out.push(`<path d="${d}" fill="none" stroke="${C.line}" stroke-width="2.5" ${o.dashed ? 'stroke-dasharray="9 7"' : ''} marker-end="url(#ah)" ${o.both ? 'marker-start="url(#ahs)"' : ''}/>`);
      if (!label) return;
      let at = label.at;
      if (!at) { // midpoint of longest segment
        let best = 0, m = pts[0];
        for (let i = 1; i < pts.length; i++) {
          const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
          if (L > best) { best = L; m = [(pts[i][0] + pts[i - 1][0]) / 2, (pts[i][1] + pts[i - 1][1]) / 2]; }
        }
        at = m;
      }
      labels.push({ at, lines: [].concat(label.lines), n: label.n, inline: label.inline });
    },
    render(file) {
      // labels last so they sit on top of lines
      labels.forEach(({ at, lines, n, inline }) => {
        const size = 16, lh = 21;
        const ns = n === undefined ? '' : String(n);
        const pw = ns ? Math.max(24, tw(ns, 15) + 16) : 0;
        const tws = Math.max(...lines.map(l => tw(l, size)));
        const stack = ns && !inline;
        const w = (inline ? tws + pw + 8 : Math.max(tws, pw)) + 14;
        const h = lines.length * lh + 8 + (stack ? 28 : 0);
        const x0 = at[0] - w / 2, y0 = at[1] - h / 2;
        out.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="5" fill="#fff" fill-opacity="0.96"/>`);
        let tx = at[0], ty = y0 + 4;
        if (ns) {
          const px = inline ? x0 + 7 : at[0] - pw / 2, py = inline ? y0 + 4 + lh / 2 - 11 : y0 + 4;
          out.push(`<rect x="${px}" y="${py}" width="${pw}" height="24" rx="12" fill="${C.step}"/>`);
          out.push(T(px + pw / 2, py + 17, [{ t: ns, bold: true, size: 15 }]));
          if (inline) tx = at[0] + (pw + 8) / 2; else ty += 28;
        }
        lines.forEach((l, i) => out.push(T(tx, ty + (i + 1) * lh - 5, [l], { size, fill: C.label })));
      });
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out.join('\n')}</svg>`;
      const png = new Resvg(svg, { fitTo: { mode: 'width', value: W * 2 }, font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } }).render().asPng();
      fs.writeFileSync(file, png);
    },
  };
  return api;
}

const GLYPH = {
  browser: (x, y) => `<rect x="${x-16}" y="${y-12}" width="32" height="24" rx="3" fill="none" stroke="${C.cont}" stroke-width="3"/><line x1="${x-16}" y1="${y-5}" x2="${x+16}" y2="${y-5}" stroke="${C.cont}" stroke-width="3"/>`,
  phone: (x, y) => `<rect x="${x-10}" y="${y-17}" width="20" height="34" rx="4" fill="none" stroke="${C.cont}" stroke-width="3"/><circle cx="${x}" cy="${y+11}" r="2" fill="${C.cont}"/>`,
  server: (x, y) => `<text x="${x}" y="${y+8}" font-family="Menlo, monospace" font-size="22" font-weight="700" fill="${C.cont}" text-anchor="middle">&gt;_</text>`,
  gear: (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="none" stroke="${C.cont}" stroke-width="3"/>` + [0,45,90,135].map(a=>{const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180);return `<line x1="${x+15*c}" y1="${y+15*s}" x2="${x-15*c}" y2="${y-15*s}" stroke="${C.cont}" stroke-width="3"/>`}).join('') + `<circle cx="${x}" cy="${y}" r="7" fill="#fff"/>`,
  db: (x, y) => `<ellipse cx="${x}" cy="${y-10}" rx="13" ry="5" fill="none" stroke="${C.cont}" stroke-width="3"/><path d="M${x-13} ${y-10} v20 a13 5 0 0 0 26 0 v-20" fill="none" stroke="${C.cont}" stroke-width="3"/>`,
  bucket: (x, y) => `<path d="M${x-15} ${y-10} h30 l-5 24 h-20 z" fill="none" stroke="${C.cont}" stroke-width="3"/>`,
  cloud: (x, y) => `<path d="M${x-14} ${y+8} a8 8 0 0 1 2-15 a10 10 0 0 1 19-2 a7 7 0 0 1 7 17 z" fill="none" stroke="${C.ext}" stroke-width="3"/>`,
  bell: (x, y) => `<path d="M${x-11} ${y+7} q3-3 3-10 a8 8 0 0 1 16 0 q0 7 3 10 z" fill="none" stroke="${C.ext}" stroke-width="3"/><circle cx="${x}" cy="${y+11}" r="2.5" fill="${C.ext}"/>`,
};

module.exports = { Diagram, A, SLOT };
