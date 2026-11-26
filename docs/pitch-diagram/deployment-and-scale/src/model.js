// LinguaLink scale & cost model. EVERY number here is an assumption, with the reason beside it.
// Change a number here, re-run `node diagrams.js <outDir>`, and every diagram + the cost sheet update.

// ---------- 1. The factory ----------
const F = {
  // Company persona (Session 8, page 3): Siam Precision Industries, ~250 employees incl. 3 Japanese expatriates.
  employees: 250,
  office: 31,         // management, HR, admin, purchasing, QA office, engineers (incl. 3 Japanese expatriates) (assumption)
  shifts: 3,          // PRD: Shift A, B, C
  lines: 4,           // production lines = shift group chats (assumption for ~73 people a shift)
  days: 30,
  workDays: 25,
  machines: 60,       // CNC lathes, machining centres, presses (assumption for a 250-person Tier 2 shop)
  oemManuals: 25,     // machine models, not machines: many machines share a model (assumption)
  technicians: 24,    // 8 per shift (assumption)
  seniors: 8,         // senior technicians retiring in the next few years (assumption)
  reportsPerDay: 6,   // breakdown reports (≈ 1 per 10 machines a day)
  scansPerDay: 60,    // QR scans (≈ 1 per machine a day)
  pickups: 250,       // spare-part pickups a month (≈ 10 a work day)
  notices: 40,        // HR notices a month (≈ 2 a work day)
};
F.perShift = Math.round((F.employees - F.office) / F.shifts);   // 73 on the floor each shift
F.users = F.perShift * F.shifts + F.office;                     // 250 accounts
F.peakOnline = F.perShift * 2 + F.office;                       // shift change: two shifts + office
F.perLine = Math.round(F.perShift / F.lines);                   // ≈ 18 people in each line chat
F.noticeReach = Math.round(F.users * 0.7);                      // a notice reaches ~70 % of staff

// ---------- 2. Prices (Session 10 example prices unless marked) ----------
const P = {
  server: 2800,        // ฿ per server per month (Session 10)
  db: 1400,            // ฿ per database per month (Session 10)
  storageGB: 7,        // ฿ per GB per month (Session 10)
  aiUnit: 1.75,        // ฿ per AI answer (Session 10). 1 unit = one typical answer ≈ 3,000 tokens
  tokensPerUnit: 3000, // our assumption, so small jobs (a translation) count as part of a unit
  sttMin: 0.25,        // ฿ per minute of speech-to-text: PLACEHOLDER, about US$0.006/min, confirm with Sakura
  appleYear: 3500,     // ฿ per year Apple developer (≈ US$99)
  googleOnce: 900,     // ฿ once Google Play (≈ US$25)
};
const units = tokens => tokens / P.tokensPerUnit;

// ---------- 3. Per feature, per month ----------
const A = (() => { // Shift chat & AI handover
  const msgs = F.perShift * 4 * F.shifts * F.days;          // 4 messages/notes per worker per shift
  const voice = msgs * 0.25, photos = msgs * 0.10;          // 25 % voice notes (15 s), 10 % photos
  const handovers = F.lines * F.shifts * F.days;            // one banner per line per shift
  const tokens = msgs * 400 + handovers * 6000;             // translate 1 msg into all langs ≈ 400 tokens; banner reads the shift ≈ 6,000
  return {
    msgs, handovers,
    ai: units(tokens), stt: voice * 15 / 60,
    gbMonth: (voice * 0.12 + photos * 0.4) / 1000,           // voice 0.12 MB, photo 0.4 MB
    gbOut: (voice * 0.12 + photos * 0.4) / 1000 * F.perLine, // each note opened by everyone in the line chat
    push: handovers * (F.perLine + 1),                       // incoming shift on that line + supervisor
    tick: F.lines * F.shifts * F.days * 15,                  // 15 checklist items per line per shift
  };
})();
const B = (() => { // Senior knowledge base
  const tips = F.seniors * 8;                               // 8 tips per senior per month, 2 min each
  const questions = F.technicians * 2 * F.workDays;          // 2 questions per technician per work day
  return {
    tips, questions,
    ai: units(tips * 5000 + questions * 3000),               // index a tip ≈ 5,000 tokens; 1 answer ≈ 3,000
    stt: tips * 2 + questions * 0.5 * 10 / 60,              // clips + half the questions spoken (10 s)
    gbMonth: tips * 30 / 1000,                               // 2 min 720p clip ≈ 30 MB
    gbOut: questions * 0.6 * 7.5 / 1000,                     // 60 % play ~30 s of the clip ≈ 7.5 MB
    push: 0,
  };
})();
const Cm = { scans: F.scansPerDay * F.days, ai: 0, stt: 0, gbOnce: F.machines * 20 / 1000, gbMonth: 0.01, gbOut: F.scansPerDay * F.days * 0.3 / 1000, push: 0 };
const D = (() => {
  const reports = F.reportsPerDay * F.days;
  return { reports, ai: units(reports * 3 * 400), stt: reports * 0.6 * 15 / 60, gbMonth: reports * 0.5 / 1000, gbOut: reports * 0.5 * 5 / 1000, push: reports * 3 };
})();
const E = { pickups: F.pickups, ai: 0, stt: 0, gbMonth: 0, gbOut: 0, push: F.pickups };
const Fa = { notices: F.notices, ai: units(F.notices * 1500), stt: 0, gbMonth: 0, gbOut: 0, push: F.notices * F.noticeReach, receipts: F.notices * F.noticeReach };
const G = (() => {
  const pagesOnce = F.oemManuals * 60 + 200;                // OEM manuals × 60 pages + 200 SOP pages
  const pagesMonth = 50;
  return { pagesOnce, pagesMonth, reads: 1500, ai: units(pagesMonth * 5600), aiOnce: units(pagesOnce * 5600), stt: 0, gbOnce: F.oemManuals * 15 / 1000, gbMonth: 0.02, gbOut: 1500 * 1 / 1000, push: 0 };
})();
const FEAT = { A, B, C: Cm, D, E, F: Fa, G };

// ---------- 4. Totals ----------
const sum = k => Object.values(FEAT).reduce((a, f) => a + (f[k] || 0), 0);
const T = { ai: sum('ai'), stt: sum('stt'), gbMonth: sum('gbMonth'), gbOnce: sum('gbOnce'), gbOut: sum('gbOut'), push: sum('push'), aiOnce: G.aiOnce };
T.gbAt = m => T.gbOnce + T.gbMonth * m;
T.lines = m => [
  { item: 'Server: API + AI worker (4 vCPU, 8 GB)', price: `฿${P.server.toLocaleString()} / month`, src: 'Session 10', qty: '1', cost: P.server },
  { item: 'Database: PostgreSQL appliance', price: `฿${P.db.toLocaleString()} / month`, src: 'Session 10', qty: '1', cost: P.db },
  { item: `Object storage (month ${m})`, price: `฿${P.storageGB} / GB`, src: 'Session 10', qty: `${T.gbAt(m).toFixed(0)} GB`, cost: T.gbAt(m) * P.storageGB },
  { item: 'Sakura AI Engine', price: `฿${P.aiUnit} / unit`, src: 'Session 10 (per answer)', qty: `${Math.round(T.ai).toLocaleString()} units`, cost: T.ai * P.aiUnit },
  { item: 'Speech-to-text', price: `฿${P.sttMin} / min`, src: 'placeholder, confirm', qty: `${Math.round(T.stt).toLocaleString()} min`, cost: T.stt * P.sttMin },
  { item: 'Apple developer account', price: `฿${P.appleYear.toLocaleString()} / year`, src: '≈ US$99', qty: '1/12', cost: P.appleYear / 12 },
  { item: 'Push notifications (FCM / APNs)', price: 'free', src: 'Google / Apple', qty: `${Math.round(T.push).toLocaleString()}`, cost: 0 },
  { item: 'Endpoint gateway, data out', price: 'confirm with Sakura', src: 'not in Session 10', qty: `1 · ${Math.round(T.gbOut)} GB out`, cost: null },
];
T.month = m => T.lines(m).reduce((a, l) => a + (l.cost || 0), 0);

// ---------- 5. Formatting ----------
const k = n => n >= 10000 ? (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '') + 'k' : Math.round(n).toLocaleString();
const gb = n => n < 1 ? n.toFixed(2) : n.toFixed(1);
const baht = n => '฿' + Math.round(n).toLocaleString();
const featCost = f => f.ai * P.aiUnit + f.stt * P.sttMin;

module.exports = { F, P, FEAT, T, k, gb, baht, featCost };

if (require.main === module) {
  for (const [n, f] of Object.entries(FEAT)) console.log(n, 'ai', f.ai.toFixed(0), 'stt', f.stt.toFixed(0), 'gb/mo', f.gbMonth.toFixed(2), 'out', f.gbOut.toFixed(1), 'push', f.push, baht(featCost(f)));
  console.log('users', F.users, 'peak', F.peakOnline, 'ai', T.ai.toFixed(0), 'stt', T.stt.toFixed(0), 'gb12', T.gbAt(12).toFixed(1), 'out', T.gbOut.toFixed(0), 'm1', baht(T.month(1)), 'm12', baht(T.month(12)), 'aiOnce', T.aiOnce.toFixed(0));
}
