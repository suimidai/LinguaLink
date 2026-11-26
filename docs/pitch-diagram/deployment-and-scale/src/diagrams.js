// LinguaLink deployment + scale diagrams: overview, one per feature (A–G), and a cost sheet.
// All numbers come from model.js. Usage: node diagrams.js <outDir>
const fs = require('fs');
const path = require('path');
const { Diagram } = require('./lib');
const { F, P, FEAT, T, k, gb, baht, featCost } = require('./model');
const OUT = process.argv[2] || '.';
const { A, B, C, D, E, G } = FEAT; const Fa = FEAT.F;

// ---- reusable routes ----
const R = {
  p1Mobile: [[340, 335], [520, 335]],
  p2Mobile: [[340, 600], [600, 410]],
  p3Web: [[340, 875], [520, 875]],
  mobileApi: [[780, 360], [920, 360]],
  webApi: [[745, 790], [745, 600], [955, 490]],
  apiDb: [[1160, 400], [1270, 400]],
  apiStore: [[1135, 490], [1135, 525], [1276, 600]],
  apiAiw: [[1030, 490], [1030, 640]],
  aiwSakura: [[1160, 736], [1590, 840]],
  apiPush: [[1000, 310], [1000, 240], [1590, 240]],
  pushMobile: [[1730, 175], [1730, 163], [650, 163], [650, 250]],
};
const at = {
  p1Mobile: [430, 335], p3Web: [430, 875], mobileApi: [850, 455], webApi: [745, 690],
  apiDb: [1215, 455], apiStore: [1215, 605], apiAiw: [1030, 565], pushMobile: [1200, 163], aiwSakura: [1300, 772],
};
const SRV = `Sakura server ×1 · 4 vCPU · 8 GB`;
const sakura = d => d.external('sakura', 'Sakura AI Engine', '[Software system, Japan]', ['LLM, speech-to-text,', 'embeddings, RAG']);
const push = d => d.external('push', 'Push notifications', '[Software system: FCM / APNs]', ['free']);
const sub = (prio, extra) => `${prio} · deployment path and monthly scale · ${extra}`;
const costTile = (f, extra) => ({ hl: true, v: `≈ ${baht(featCost(f))}`, k: 'AI + speech / month', why: extra || `AI ${baht(f.ai * P.aiUnit)} + speech ${baht(f.stt * P.sttMin)}. Server, database and storage are shared: see the cost sheet.` });
const aiTile = (f, why) => ({ v: k(f.ai), k: 'AI units / month', why: `1 unit ≈ 3,000 tokens ≈ one answer. ${why}` });

const diagrams = {
  // ------------------------------------------------------------ overview
  '00-overview'(d) {
    d.canvas('LinguaLink: ', 'all 7 features, path and scale', `Overview deployment diagram · Siam Precision Industries, ${F.users} employees · every number is an assumption from model.js, with its reason`);
    d.boundary();
    d.node(220, 900, SRV);
    d.person('p1', 'Shop-floor staff', [`${F.perShift} per shift × ${F.shifts} shifts`, 'TH, MY, KM, LO']);
    d.person('p2', 'Senior technician', [`${F.seniors} seniors`, `${B.tips} tips / month`]);
    d.person('p3', 'Office staff', [`${F.office} incl. 3 Japanese`, 'expats, HR, engineers']);
    d.container('mobile', 'Mobile app', ['[Container: Expo,', 'iOS / Android]'], [`${F.perShift * F.shifts} phones,`, 'Wi-Fi / 4G, offline cache']);
    d.container('web', 'Web app', ['[Container: Expo,', 'React Native Web]'], [`${F.office} office PCs,`, 'served by the API server']);
    d.container('api', 'API', ['[Container: Node.js +', 'WebSocket]'], [], {
      rect: { y: 245, h: 385 },
      chips: [['A', 'Shift chat & handover'], ['B', 'Senior knowledge base'], ['C', 'Machine database'], ['D', 'Breakdown reports'], ['E', 'Spare parts pickup'], ['F', 'Announcements'], ['G', 'Translated manuals']],
    });
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['same server as the API', `${k(T.ai)} AI units / month`, `${k(T.stt)} min speech / month`], { rect: { y: 700, h: 160 } });
    d.container('db', 'Database', ['[PostgreSQL appliance ×1', '+ pgvector]'], ['< 5 GB after', '1 year']);
    d.container('store', 'Object storage', '[Container: Sakura]', [`+${gb(T.gbMonth)} GB / month,`, `${T.gbAt(12).toFixed(0)} GB at month 12`]);
    push(d); sakura(d);
    d.arrow(R.p1Mobile, { lines: ['chats, reports,', 'asks, picks up'], at: at.p1Mobile });
    d.arrow(R.p2Mobile, { lines: ['records tips'] });
    d.arrow(R.p3Web, { lines: ['reads in JA, posts,', 'approves, logs parts'], at: at.p3Web });
    d.arrow(R.mobileApi, { lines: ['HTTPS + WSS', `peak ${F.peakOnline}`, 'online'], at: at.mobileApi });
    d.arrow([[745, 790], [745, 640], [920, 600]], { lines: ['HTTPS + WSS'], at: [745, 715] });
    d.arrow(R.apiDb, { lines: ['SQL,', 'private', 'network'], at: [1215, 470] });
    d.arrow([[1160, 590], [1278, 610]], { lines: ['HTTPS', `${Math.round(T.gbOut)} GB`, 'out / mo'], at: [1215, 660] });
    d.arrow([[1040, 630], [1040, 700]], { lines: ['job queue (same server)'], at: [1040, 665] }, { both: true });
    d.arrow([[1160, 800], [1590, 850]], { lines: [`${k(T.ai)} units + ${k(T.stt)} min / mo`, 'private, via gateway'], at: [1300, 845] });
    d.gateway(817);
    d.arrow([[1100, 245], [1100, 213], [1590, 213]], { lines: [`${k(T.push)} pushes / month [HTTPS]`], at: [1380, 213] });
    d.arrow(R.pushMobile, { lines: ['notifies the phone [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
    d.tiles('Whole system, per month', [
      { v: String(F.users), k: 'Users (accounts)', why: `${F.perShift} per shift × ${F.shifts} shifts + ${F.office} office staff.` },
      { v: String(F.peakOnline), k: 'Peak online', why: 'At shift change two shifts overlap, plus the office. One server handles this easily.' },
      { v: k(T.ai), k: 'AI units / month', why: `1 unit ≈ 3,000 tokens ≈ one answer. Chat translation (A) is ${Math.round(A.ai / T.ai * 100)} % of it.` },
      { v: k(T.stt), k: 'Speech-to-text min', why: 'Voice notes, senior clips, spoken questions.' },
      { v: `${T.gbAt(12).toFixed(0)} GB`, k: 'Storage at month 12', why: `${gb(T.gbOnce)} GB at start + ${gb(T.gbMonth)} GB each month (voice, photos, clips).` },
      { v: `${Math.round(T.gbOut)} GB`, k: 'Data out / month', why: 'Photos, voice and clips people open. Ask Sakura if this is charged.' },
      { hl: true, v: `≈ ${baht(T.month(12))}`, k: 'Per month (month 12)', why: `≈ ${baht(T.month(12) * 12)} a year, at Session 10 prices. One-time: manual translation ${baht(T.aiOnce * P.aiUnit)}.` },
    ]);
  },

  // ------------------------------------------------------------ A
  'A-shift-chat-handover'(d) {
    d.canvas('Feature A: ', 'Smart Group Chat & AI Shift Handover', sub('Core feature', 'numbers in circles show the order'));
    d.boundary(); d.node(285, 830, SRV);
    d.person('p1', 'Outgoing shift', [`${F.perShift} workers,`, `${F.lines} line chats`]);
    d.person('p2', 'Incoming shift', ['reads the AI banner', 'first, in own language']);
    d.person('p3', 'Line supervisor', ['checks every handover', 'on the dashboard']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['shift chat, checklist,', 'voice & photo notes']);
    d.container('web', 'Web app', '[Container: Expo web]', ['handover history', 'per line and shift']);
    d.container('api', 'API', ['[Container: Node.js +', 'WebSocket]'], ['chat rooms, live sync', `peak ${F.peakOnline} sockets`]);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['transcribe, translate,', `${A.handovers} banners / month`]);
    d.container('db', 'Database', '[PostgreSQL]', [`${k(A.msgs)} msgs +`, `${k(A.tick)} ticks / mo`]);
    d.container('store', 'Object storage', '[Container: Sakura]', [`+${gb(A.gbMonth)} GB / month`]);
    push(d); sakura(d);
    d.arrow(R.p1Mobile, { n: 1, lines: ['ticks, sends notes', `${k(A.msgs)} / month`], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: '2, 7', lines: ['WSS', 'live', '< 2 s'], at: at.mobileApi }, { both: true });
    d.arrow(R.apiStore, { n: 3, lines: [`voice + photo`, `${Math.round(A.gbOut)} GB out`], at: at.apiStore });
    d.arrow(R.apiDb, { n: '3, 6', lines: ['saves', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiAiw, { n: 4, lines: ['shift ends:', 'banner job'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 5, lines: [`${k(A.msgs)} translations`, `+ ${A.handovers} banners, ${k(A.stt)} min`], at: at.aiwSakura });
    d.gateway();
    d.arrow(R.apiPush, { n: 8, lines: [`${k(A.push)} pushes / month`] });
    d.arrow(R.pushMobile, { n: 8, inline: true, lines: ['banner ready: incoming shift + supervisor'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p2Mobile, { n: 9, lines: ['reads the pinned', 'banner, own language'] });
    d.arrow(R.p3Web, { n: 10, lines: ['checks the', 'handover'], at: at.p3Web });
    d.arrow(R.webApi, { n: 10, lines: ['HTTPS + WSS'], at: at.webApi });
    d.tiles('Feature A, per month', [
      { v: k(A.msgs), k: 'Messages & notes', why: `${F.perShift} per shift × 4 notes × ${F.shifts} shifts × ${F.days} days.` },
      aiTile(A, `Translate each message ≈ 400 tokens; ${A.handovers} banners × 6,000.`),
      { v: k(A.stt), k: 'Speech-to-text min', why: '25 % of notes are voice, 15 seconds each.' },
      { v: `+${gb(A.gbMonth)} GB`, k: 'New storage', why: '10 % photos (0.4 MB) + voice notes (0.12 MB).' },
      { v: `${Math.round(A.gbOut)} GB`, k: 'Data out', why: `Each note is opened by everyone in the line chat (about ${F.perLine} people).` },
      costTile(A),
    ]);
  },

  // ------------------------------------------------------------ B
  'B-senior-knowledge-base'(d) {
    d.canvas('Feature B: ', 'Senior Knowledge Base & AI Skill Transfer', sub('Core feature', 'steps 1–7 save a tip, 8–13 answer'));
    d.boundary(); d.node(285, 830, SRV);
    d.person('p1', 'Senior technician', [`${F.seniors} seniors × 8 tips`, '= ' + B.tips + ' tips / month']);
    d.person('p2', 'Technician', [`${F.technicians} technicians,`, `${k(B.questions)} questions / mo`]);
    d.person('p3', 'Engineer', ['reviews and approves', 'tips before publishing']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['record tips, ask by voice', 'or text, play clips']);
    d.container('web', 'Web app', '[Container: Expo web]', ['review queue,', 'most-used tips']);
    d.container('api', 'API', '[Container: Node.js]', ['tips, approvals,', 'Q&A, clip links']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['transcribe + timestamps,', 'translate, index, answer']);
    d.container('db', 'Database', ['[PostgreSQL', '+ pgvector]'], ['segments +', 'vectors, small']);
    d.container('store', 'Object storage', '[Container: Sakura]', [`+${gb(B.gbMonth)} GB / month`, '(2-min clips)']);
    sakura(d);
    d.arrow(R.p1Mobile, { n: 1, lines: ['records a 2-min', 'clip, tags machine'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: '2, 9', lines: ['upload,', 'question', 'HTTPS'], at: at.mobileApi }, { both: true });
    d.arrow(R.apiStore, { n: 3, lines: ['30 MB a clip', `${gb(B.gbOut)} GB out`], at: at.apiStore });
    d.arrow(R.apiAiw, { n: '4, 11', lines: ['index the tip /', 'answer'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: '5, 12', lines: [`${B.tips} tips indexed`, `+ ${k(B.questions)} answers / month`], at: at.aiwSakura });
    d.gateway();
    d.arrow(R.apiDb, { n: '6, 10', lines: ['save /', 'vector', 'search'], at: at.apiDb }, { both: true });
    d.arrow(R.p3Web, { n: 7, lines: ['approves', 'the tip'], at: at.p3Web });
    d.arrow(R.webApi, { n: 7, lines: ['HTTPS'], at: at.webApi });
    d.arrow(R.p2Mobile, { n: '8, 13', lines: ['asks; taps', '"▶ Prasert · 1:24"'] });
    d.tiles('Feature B, per month', [
      { v: String(B.tips), k: 'New tips', why: `${F.seniors} seniors × 8 tips, 2-minute clips.` },
      { v: k(B.questions), k: 'Questions', why: `${F.technicians} technicians × 2 a day × ${F.workDays} work days.` },
      aiTile(B, 'Indexing a tip ≈ 5,000 tokens; each answer ≈ 3,000.'),
      { v: k(B.stt), k: 'Speech-to-text min', why: 'Clips (2 min) + half of questions spoken (10 s).' },
      { v: `+${gb(B.gbMonth)} GB`, k: 'New storage', why: `A 2-minute 720p clip ≈ 30 MB. Data out ${gb(B.gbOut)} GB: 60 % watch 30 s.` },
      costTile(B),
    ]);
  },

  // ------------------------------------------------------------ C
  'C-machine-database'(d) {
    d.canvas('Feature C: ', 'Machine & Asset Database', sub('Core (supporting) feature', 'no AI here'));
    d.boundary(); d.node(285, 565, SRV);
    d.person('p1', 'Operator / technician', ['scans the QR label', `${k(C.scans)} scans / month`]);
    d.person('p3', 'Engineer', ['keeps machine profiles', 'and PM checklists']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['QR scan (camera),', 'machine profile']);
    d.container('web', 'Web app', '[Container: Expo web]', ['machine list, search,', 'status filters']);
    d.container('api', 'API', '[Container: Node.js]', ['profile, history, BOM,', 'linked tips, manuals']);
    d.container('db', 'Database', '[PostgreSQL]', [`${F.machines} machines,`, 'history, BOM']);
    d.container('store', 'Object storage', '[Container: Sakura]', [`${gb(C.gbOnce)} GB once`, '(photos, PDFs)']);
    d.arrow(R.p1Mobile, { n: 1, lines: ['scans the', 'QR label'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 2, lines: ['HTTPS', `${k(C.scans)}`, '/ month'], at: at.mobileApi });
    d.arrow(R.apiDb, { n: '3, 7', lines: ['read /', 'write', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiStore, { n: 4, lines: ['photo, manual', `${gb(C.gbOut)} GB out`], at: at.apiStore });
    d.arrow(R.p3Web, { n: 5, lines: ['edits profiles,', 'PM checklists'], at: at.p3Web });
    d.arrow(R.webApi, { n: 6, lines: ['HTTPS'], at: at.webApi });
    d.tiles('Feature C, per month', [
      { v: String(F.machines), k: 'Machines', why: 'CNC lathes, machining centres, presses (estimate). Each has a QR label.' },
      { v: k(C.scans), k: 'QR scans', why: `${F.scansPerDay} scans a day across all shifts.` },
      { v: '0', k: 'AI units', why: 'No AI. People set the machine status.' },
      { v: `${gb(C.gbOnce)} GB`, k: 'Storage, one time', why: `${F.machines} machines × 20 MB of photos and drawings.` },
      { v: '< 0.1 GB', k: 'Database', why: 'Profiles, history and BOM rows are small text.' },
      { hl: true, v: '≈ ฿0', k: 'Extra / month', why: 'Runs on the shared server and database. Storage ≈ ฿17 a month.' },
    ]);
  },

  // ------------------------------------------------------------ D
  'D-breakdown-reporting'(d) {
    d.canvas('Feature D: ', 'Machine Breakdown Reporting', sub('Core (supporting) feature', 'Reported → Assigned → In Progress → Resolved'));
    d.boundary(); d.node(285, 830, SRV);
    d.person('p1', 'Operator', ['reports a problem', `${D.reports} reports / month`]);
    d.person('p2', 'Technician', ['gets the job,', 'fixes it, closes it']);
    d.person('p3', 'Line supervisor', ['assigns a technician', 'on the dashboard']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['report: category, voice,', 'photo · 4-stage tracker']);
    d.container('web', 'Web app', '[Container: Expo web]', ['repair board,', 'assign technician']);
    d.container('api', 'API', '[Container: Node.js]', ['repair tickets and', 'their 4 stages']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['transcribe and', 'translate the note']);
    d.container('db', 'Database', '[PostgreSQL]', ['tickets,', 'machine history']);
    d.container('store', 'Object storage', '[Container: Sakura]', [`+${gb(D.gbMonth)} GB / month`]);
    push(d); sakura(d);
    d.arrow(R.p1Mobile, { n: 1, lines: ['scans machine,', 'picks category, talks'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: '2, 9', lines: ['report,', 'status', 'HTTPS'], at: at.mobileApi }, { both: true });
    d.arrow(R.apiStore, { n: 3, lines: ['photo, voice'], at: at.apiStore });
    d.arrow(R.apiDb, { n: '3, 10', lines: ['ticket,', 'history', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiAiw, { n: 4, lines: ['translate', 'the note'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 5, lines: [`${k(D.reports * 3)} translations`, `+ ${k(D.stt)} min / month`], at: at.aiwSakura });
    d.gateway();
    d.arrow(R.p3Web, { n: 6, lines: ['assigns a', 'technician'], at: at.p3Web });
    d.arrow(R.webApi, { n: 6, lines: ['HTTPS'], at: at.webApi });
    d.arrow(R.apiPush, { n: 7, lines: [`${k(D.push)} pushes / month`] });
    d.arrow(R.pushMobile, { n: 8, inline: true, lines: ['job alert in the technician\'s language'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p2Mobile, { n: 9, lines: ['In Progress → Resolved,', 'root cause, parts'] });
    d.tiles('Feature D, per month', [
      { v: String(D.reports), k: 'Breakdown reports', why: `${F.reportsPerDay} a day across ${F.machines} machines.` },
      aiTile(D, 'Report + 2 status notes translated, ≈ 400 tokens each.'),
      { v: k(D.stt), k: 'Speech-to-text min', why: '60 % of reports have a 15-second voice note.' },
      { v: `+${gb(D.gbMonth)} GB`, k: 'New storage', why: 'Photo + voice ≈ 0.5 MB a report.' },
      { v: k(D.push), k: 'Pushes', why: 'Assigned, in progress, resolved: 3 per report. Free.' },
      costTile(D),
    ]);
  },

  // ------------------------------------------------------------ E
  'E-spare-parts'(d) {
    d.canvas('Feature E: ', 'Spare Parts & Store Pickup', sub('Core (supporting) feature', 'no AI here'));
    d.boundary(); d.node(285, 565, SRV);
    d.person('p1', 'Technician', ['ordered a part,', 'picks it up']);
    d.person('p3', 'Storekeeper', ['logs parts as', 'they arrive']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['red badge "Spare Parts 6",', 'bin location, QR sign-off']);
    d.container('web', 'Web app', '[Container: Expo web]', ['goods-in, assign', 'to requester']);
    d.container('api', 'API', '[Container: Node.js]', ['pickups, stock']);
    d.container('db', 'Database', '[PostgreSQL]', ['parts, stock,', 'pickups']);
    push(d);
    d.arrow(R.p3Web, { n: 1, lines: ['logs the part,', 'picks requester'], at: at.p3Web });
    d.arrow(R.webApi, { n: 2, lines: ['HTTPS'], at: at.webApi });
    d.arrow(R.apiDb, { n: '3, 7', lines: ['pickup,', 'stock', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiPush, { n: 4, lines: [`${E.pickups} pushes / month`] });
    d.arrow(R.pushMobile, { n: 5, inline: true, lines: ['push + red badge [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p1Mobile, { n: 6, lines: ['goes to the bin,', 'scans pickup QR'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 7, lines: ['sign-off', 'HTTPS'], at: at.mobileApi });
    d.tiles('Feature E, per month', [
      { v: String(E.pickups), k: 'Pickups', why: `About ${Math.round(F.pickups / F.workDays)} parts a work day.` },
      { v: '0', k: 'AI units', why: 'No AI.' },
      { v: '0', k: 'Speech-to-text', why: 'No voice.' },
      { v: '< 0.1 GB', k: 'Database', why: 'Small text rows only.' },
      { v: String(E.pickups), k: 'Pushes', why: 'One per pickup. Free.' },
      { hl: true, v: '≈ ฿0', k: 'Extra / month', why: 'Runs on the shared server and database.' },
    ]);
  },

  // ------------------------------------------------------------ F
  'F-announcements'(d) {
    d.canvas('Feature F: ', 'Multilingual Announcements', sub('Nice-to-have', 'HR writes once, everyone reads it in their language'));
    d.boundary(); d.node(285, 830, SRV);
    d.person('p1', 'All employees', [`${F.users} people read it`, 'in their own language']);
    d.person('p3', 'HR & admin', [`${Fa.notices} notices / month`]);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['notices,', 'Acknowledge button']);
    d.container('web', 'Web app', '[Container: Expo web]', ['composer, audience,', 'live "135 / 142" count']);
    d.container('api', 'API', '[Container: Node.js]', ['audience, priority,', 'read receipts']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['translate into', '6 languages']);
    d.container('db', 'Database', '[PostgreSQL]', [`${k(Fa.receipts)} receipts`, '/ month']);
    push(d); sakura(d);
    d.arrow(R.p3Web, { n: 1, lines: ['writes once, picks', 'Shift B & C, Urgent'], at: at.p3Web });
    d.arrow(R.webApi, { n: '2, 9', lines: ['publish, live count', 'HTTPS + WSS'], at: at.webApi }, { both: true });
    d.arrow(R.apiAiw, { n: 3, lines: ['translate'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 4, lines: [`${Fa.notices} notices × 6 languages`], at: at.aiwSakura });
    d.gateway();
    d.arrow(R.apiDb, { n: '5, 8', lines: ['notice,', 'receipts', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiPush, { n: 6, lines: [`${k(Fa.push)} pushes / month`] });
    d.arrow(R.pushMobile, { n: 6, inline: true, lines: ['notifies every phone (Emergency = full screen)'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p1Mobile, { n: 7, lines: ['reads, taps', 'Acknowledge'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 8, lines: ['ack', 'HTTPS'], at: at.mobileApi });
    d.tiles('Feature F, per month', [
      { v: String(Fa.notices), k: 'Notices', why: 'About 2 every work day.' },
      aiTile(Fa, 'One notice into 6 languages ≈ 1,500 tokens.'),
      { v: k(Fa.push), k: 'Pushes', why: `Each notice reaches about ${F.noticeReach} people. Free.` },
      { v: k(Fa.receipts), k: 'Read receipts', why: 'One row per person per notice: tiny.' },
      { v: '0', k: 'Storage', why: 'Text only.' },
      costTile(Fa),
    ]);
  },

  // ------------------------------------------------------------ G
  'G-translated-manuals'(d) {
    d.canvas('Feature G: ', 'Translated Manuals / SOPs', sub('Nice-to-have', 'a big one-time translation, then a small monthly one'));
    d.boundary(); d.node(285, 830, SRV);
    d.person('p1', 'Technician', [`${k(G.reads)} manual opens`, '/ month']);
    d.person('p3', 'Engineer', ['uploads OEM manuals', 'and SOPs (often JA)']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['manual reader, language', 'switch, offline cache']);
    d.container('web', 'Web app', '[Container: Expo web]', ['upload manuals,', 'check translations']);
    d.container('api', 'API', '[Container: Node.js]', ['manuals, steps,', 'links to machines']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['split into steps,', 'translate']);
    d.container('db', 'Database', '[PostgreSQL]', ['steps in', '6 languages']);
    d.container('store', 'Object storage', '[Container: Sakura]', [`${gb(G.gbOnce)} GB of PDFs`]);
    sakura(d);
    d.arrow(R.p3Web, { n: 1, lines: ['uploads a', 'Japanese PDF'], at: at.p3Web });
    d.arrow(R.webApi, { n: 2, lines: ['HTTPS'], at: at.webApi });
    d.arrow(R.apiStore, { n: 3, lines: ['stores original'], at: at.apiStore });
    d.arrow(R.apiAiw, { n: 4, lines: ['translate job'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 5, lines: [`${k(G.pagesOnce)} pages once,`, `then ${G.pagesMonth} pages / month`], at: at.aiwSakura });
    d.gateway();
    d.arrow(R.apiDb, { n: '6, 9', lines: ['save /', 'read', '[SQL]'], at: at.apiDb });
    d.arrow(R.p1Mobile, { n: 7, lines: ['opens from machine,', 'job or Knowledge tab'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 8, lines: ['HTTPS', `${k(G.reads)}`, '/ month'], at: at.mobileApi });
    d.tiles('Feature G: one time, then per month', [
      { v: k(G.pagesOnce), k: 'Pages, one time', why: `${F.oemManuals} OEM manuals × 60 pages + 200 SOP pages.` },
      { v: k(G.aiOnce), k: 'AI units, one time', why: `≈ 5,600 tokens a page (Japanese in, 5 languages out) = ${baht(G.aiOnce * P.aiUnit)} once.` },
      { v: String(G.pagesMonth), k: 'New pages / month', why: 'New or updated SOPs.' },
      aiTile(G, `${G.pagesMonth} pages × 5,600 tokens.`),
      { v: `${gb(G.gbOnce)} GB`, k: 'Storage, one time', why: `${F.oemManuals} PDFs × 15 MB.` },
      costTile(G, `Monthly AI. Plus ${baht(G.aiOnce * P.aiUnit)} once for the first translation.`),
    ]);
  },

  // ------------------------------------------------------------ cost sheet
  '99-cost-sheet'(d) {
    d.canvas('LinguaLink: ', 'what it costs to run', 'Session 10 method: price × how many × months · quantities from the diagrams · every number is an assumption');
    const cols = [70, 690, 1000, 1330, 1850];
    const rows = T.lines(12);
    let y = 200;
    d.raw(`<rect x="60" y="${y - 38}" width="1800" height="52" rx="8" fill="#eefaf6"/>`);
    const cx = [80, 610, 860, 1290, 1840];
    ['ITEM', 'PRICE', 'WHERE THE PRICE COMES FROM', 'HOW MANY', 'PER MONTH'].forEach((h, i) => d.text(cx[i], y, [{ t: h, bold: true }], { size: 17, fill: '#0e9474', anchor: i === 4 ? 'end' : 'start' }));
    y += 58;
    rows.forEach(r => {
      d.raw(`<line x1="60" y1="${y + 18}" x2="1860" y2="${y + 18}" stroke="#e6e9ed" stroke-width="1.5"/>`);
      d.text(cx[0], y, [{ t: r.item, bold: true }], { size: 21, fill: '#1d1d1f', anchor: 'start' });
      d.text(cx[1], y, [r.price], { size: 20, fill: '#4f555e', anchor: 'start' });
      d.text(cx[2], y, [r.src], { size: 18, fill: r.src.includes('confirm') || r.src.includes('not in') ? '#c2410c' : '#8a8f98', anchor: 'start' });
      d.text(cx[3], y, [r.qty], { size: 20, fill: '#4f555e', anchor: 'start' });
      d.text(cx[4], y, [{ t: r.cost === null ? '?' : baht(r.cost), bold: true }], { size: 21, fill: '#1d1d1f', anchor: 'end' });
      y += 62;
    });
    d.raw(`<rect x="60" y="${y - 30}" width="1800" height="70" rx="10" fill="#0e9474"/>`);
    d.text(cx[0], y + 14, [{ t: 'Per month, at month 12', bold: true }], { size: 26, anchor: 'start' });
    d.text(cx[4], y + 14, [{ t: `${baht(T.month(12))}  ×  12  ≈  ${baht(T.month(12) * 12)} a year`, bold: true }], { size: 26, anchor: 'end' });
    y += 100;
    // AI by feature
    d.text(70, y, [{ t: 'Where the AI + speech money goes (per month)', bold: true }], { size: 21, fill: '#1d1d1f', anchor: 'start' });
    y += 20;
    const names = { A: 'A Shift chat', B: 'B Knowledge', C: 'C Machines', D: 'D Repairs', E: 'E Parts', F: 'F Notices', G: 'G Manuals' };
    const max = Math.max(...Object.values(FEAT).map(featCost));
    Object.entries(FEAT).forEach(([key, f], i) => {
      const yy = y + i * 34, v = featCost(f), w = v / max * 900;
      d.text(70, yy + 22, [names[key]], { size: 17, fill: '#4f555e', anchor: 'start' });
      d.raw(`<rect x="230" y="${yy + 6}" width="${Math.max(w, 2)}" height="22" rx="4" fill="${key === 'A' ? '#0e9474' : '#1fc7a3'}"/>`);
      d.text(240 + Math.max(w, 2), yy + 23, [baht(v)], { size: 16, fill: '#4f555e', anchor: 'start' });
    });
    // notes
    const nx = 1240; let ny = y + 10;
    [
      { t: 'Read this first', bold: true, size: 19, fill: '#1d1d1f' },
      `• One-time: manual translation ${baht(T.aiOnce * P.aiUnit)}, Google Play ${baht(P.googleOnce)}.`,
      `• Month 1 is ${baht(T.month(1))}: storage starts small and grows.`,
      `• Chat translation (A) is ${Math.round(featCost(A) / Object.values(FEAT).reduce((a, f) => a + featCost(f), 0) * 100)} % of AI + speech.`,
      '• A price per token, not per answer, could cut that a lot.',
      '• Orange = not in Session 10: ask Sakura about',
      '  speech-to-text, the gateway and data out.',
      `• 1 AI unit = 3,000 tokens ≈ one answer (our rule).`,
      '• Not included: people\'s time (man-days), support.',
    ].forEach(l => { d.text(nx, ny, [l], { size: 17, fill: '#4f555e', anchor: 'start' }); ny += 30; });
  },
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, fn] of Object.entries(diagrams)) {
  const d = Diagram();
  fn(d);
  const f = path.join(OUT, `lingualink-${name}.png`);
  d.render(f);
  console.log(f);
}

// CSV for spreadsheets
const { F: FF } = require('./model');
const csv = [['section', 'item', 'value', 'unit', 'reason / source']];
csv.push(['factory', 'employees', FF.employees, 'people', 'company persona: Siam Precision Industries (Session 8)']);
csv.push(['factory', 'workers per shift', FF.perShift, 'people', '(employees - office) / shifts']);
csv.push(['factory', 'shifts', FF.shifts, 'per day', 'PRD Shift A/B/C']);
csv.push(['factory', 'office staff', FF.office, 'people', 'assumption, incl. 3 Japanese expatriates']);
csv.push(['factory', 'users', FF.users, 'accounts', 'workers x shifts + office']);
csv.push(['factory', 'peak online', FF.peakOnline, 'people', 'two shifts overlap + office']);
for (const [key, f] of Object.entries(FEAT)) {
  csv.push([`feature ${key}`, 'AI units', f.ai.toFixed(0), 'per month', '1 unit = 3,000 tokens']);
  csv.push([`feature ${key}`, 'speech-to-text', f.stt.toFixed(0), 'min per month', '']);
  csv.push([`feature ${key}`, 'new storage', f.gbMonth.toFixed(2), 'GB per month', '']);
  csv.push([`feature ${key}`, 'data out', f.gbOut.toFixed(1), 'GB per month', '']);
  csv.push([`feature ${key}`, 'push notifications', f.push, 'per month', 'free']);
}
T.lines(12).forEach(l => csv.push(['cost (month 12)', l.item, l.cost === null ? '' : Math.round(l.cost), 'THB per month', `${l.price} x ${l.qty} (${l.src})`]));
csv.push(['cost (month 12)', 'TOTAL', Math.round(T.month(12)), 'THB per month', 'Session 10 example prices']);
csv.push(['one-time', 'manual translation', Math.round(T.aiOnce * P.aiUnit), 'THB', `${Math.round(T.aiOnce)} AI units`]);
csv.push(['one-time', 'Google Play', P.googleOnce, 'THB', '≈ US$25']);
fs.writeFileSync(path.join(OUT, 'lingualink-cost-model.csv'), '﻿' + csv.map(r => r.map(c => /[",]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c).join(',')).join('\n'));
console.log('csv ok');
