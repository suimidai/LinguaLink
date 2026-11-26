// LinguaLink container diagrams: 1 overview + 1 per feature (A–G)
// Usage: node diagrams.js <outDir>
const path = require('path');
const { Diagram, A } = require('./lib');
const OUT = process.argv[2] || '.';

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
  p1Mobile: [430, 335], p3Web: [430, 875], mobileApi: [850, 450], webApi: [745, 690],
  apiDb: [1215, 455], apiStore: [1215, 600], apiAiw: [1030, 565], pushMobile: [1200, 163],
};
const sakura = d => d.external('sakura', 'Sakura AI Engine', '[Software system, via', ['endpoint gateway, in Japan]', 'LLM, speech-to-text, RAG']);
const push = d => d.external('push', 'Push notifications', '[Software system: FCM / APNs]', ['alerts on each phone']);
const sub = (prio, extra) => `${prio} · detailed container view · ${extra}`;

const diagrams = {
  // ------------------------------------------------------------ overview
  '00-overview'(d) {
    d.canvas('LinguaLink: ', 'all 7 features in one system', 'Overview container diagram (C4 level 2) · A–G are the features, and each has its own detailed diagram');
    d.boundary();
    d.person('p1', 'Shop-floor staff', ['operators, supervisors,', 'technicians (TH, MY, KM, LO)']);
    d.person('p2', 'Senior technician', ['records know-how', 'before retiring']);
    d.person('p3', 'Office staff', ['Japanese engineers, HR,', 'storekeepers (big screen)']);
    d.container('mobile', 'Mobile app', ['[Container: Expo,', 'iOS / Android]'], ['all features on the', 'shop floor, offline cache']);
    d.container('web', 'Web app', ['[Container: Expo,', 'React Native Web]'], ['dashboard for', 'all features']);
    d.container('api', 'API', ['[Container: Node.js +', 'WebSocket, Sakura server]'], [], {
      rect: { y: 230, h: 400 },
      chips: [['A', 'Shift chat & handover'], ['B', 'Senior knowledge base'], ['C', 'Machine database'], ['D', 'Breakdown reports'], ['E', 'Spare parts pickup'], ['F', 'Announcements'], ['G', 'Translated manuals']],
    });
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['translate: all features', 'speech-to-text: A, B, D', 'summary: A · answers: B'], { rect: { y: 700, h: 170 } });
    d.container('db', 'Database', ['[Container: PostgreSQL', '+ pgvector]'], ['all records +', 'tip vectors']);
    d.container('store', 'Object storage', '[Container: Sakura]', ['clips, voice,', 'photos, PDFs']);
    push(d); sakura(d);
    d.arrow(R.p1Mobile, { lines: ['chats, reports,', 'asks, picks up'], at: at.p1Mobile });
    d.arrow(R.p2Mobile, { lines: ['records tips'] });
    d.arrow(R.p3Web, { lines: ['reads in JA, posts,', 'approves, logs parts'], at: at.p3Web });
    d.arrow(R.mobileApi, { lines: ['calls', '[HTTPS', '+ WSS]'], at: at.mobileApi });
    d.arrow([[745, 790], [745, 640], [920, 600]], { lines: ['calls', '[HTTPS + WSS]'], at: [745, 715] });
    d.arrow(R.apiDb, { lines: ['reads,', 'writes', '[SQL]'], at: [1215, 470] });
    d.arrow([[1160, 590], [1278, 610]], { lines: ['stores', 'media'], at: [1215, 650] });
    d.arrow([[1040, 630], [1040, 700]], { lines: ['sends jobs, gets results [JSON]'], at: [1040, 665] }, { both: true });
    d.arrow([[1160, 800], [1590, 850]], { lines: ['asks [HTTPS, gateway]'], at: [1375, 850] });
    d.arrow([[1100, 230], [1100, 215], [1590, 215]], { lines: ['sends alerts [HTTPS]'], at: [1400, 215] });
    d.arrow(R.pushMobile, { lines: ['notifies the phone [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
  },

  // ------------------------------------------------------------ A
  'A-shift-chat-handover'(d) {
    d.canvas('Feature A: ', 'Smart Group Chat & AI Shift Handover', sub('Core feature', 'numbers show the order things happen'));
    d.boundary();
    d.person('p1', 'Outgoing shift', ['ticks the checklist,', 'leaves notes']);
    d.person('p2', 'Incoming shift', ['reads the AI banner', 'first, in own language']);
    d.person('p3', 'Line supervisor', ['checks every handover', 'on the dashboard']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['shift chat, checklist,', 'voice & photo notes']);
    d.container('web', 'Web app', '[Container: Expo web]', ['handover history', 'per line and shift']);
    d.container('api', 'API', ['[Container: Node.js +', 'WebSocket]'], ['chat rooms, live', 'checklist sync']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['transcribe, translate,', 'write the shift banner']);
    d.container('db', 'Database', '[Container: PostgreSQL]', ['messages, ticks,', 'banners']);
    d.container('store', 'Object storage', '[Container: Sakura]', ['voice notes,', 'photos, files']);
    push(d); sakura(d);
    d.arrow(R.p1Mobile, { n: 1, lines: ['ticks items, sends', 'voice / photo notes'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: '2, 7', lines: ['syncs', 'live', '[WSS]'], at: at.mobileApi }, { both: true });
    d.arrow(R.apiStore, { n: 3, lines: ['saves media'], at: at.apiStore });
    d.arrow(R.apiDb, { n: '3, 6', lines: ['saves', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiAiw, { n: 4, lines: ['shift ends:', 'make banner [JSON]'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 5, lines: ['speech-to-text, translate,', 'summarise: Done / To do /', 'Watch out [HTTPS]'] });
    d.arrow(R.apiPush, { n: 8, lines: ['alerts the supervisor [HTTPS]'] });
    d.arrow(R.pushMobile, { n: 8, inline: true, lines: ['notifies the supervisor [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p2Mobile, { n: 9, lines: ['reads the pinned', 'banner, own language'] });
    d.arrow(R.p3Web, { n: 10, lines: ['checks the', 'handover'], at: at.p3Web });
    d.arrow(R.webApi, { n: 10, lines: ['calls', '[HTTPS + WSS]'], at: at.webApi });
  },

  // ------------------------------------------------------------ B
  'B-senior-knowledge-base'(d) {
    d.canvas('Feature B: ', 'Senior Knowledge Base & AI Skill Transfer', sub('Core feature', 'steps 1–7 save a tip, steps 8–13 answer a question'));
    d.boundary();
    d.person('p1', 'Senior technician', ['records a tip on a', 'machine (video / voice)']);
    d.person('p2', 'Technician', ['asks "how do I fix', 'X on machine Y?"']);
    d.person('p3', 'Engineer', ['reviews and approves', 'tips before publishing']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['record tips, ask by voice', 'or text, play clips']);
    d.container('web', 'Web app', '[Container: Expo web]', ['review queue,', 'most-used tips']);
    d.container('api', 'API', '[Container: Node.js]', ['tips, approvals,', 'Q&A, clip links']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['transcribe + timestamps,', 'translate, index, answer']);
    d.container('db', 'Database', ['[Container: PostgreSQL', '+ pgvector]'], ['tip segments', '+ vectors']);
    d.container('store', 'Object storage', '[Container: Sakura]', ['senior video', '& voice clips']);
    sakura(d);
    d.arrow(R.p1Mobile, { n: 1, lines: ['records a clip,', 'tags Press-02'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: '2, 9', lines: ['upload,', 'question', '[HTTPS]'], at: at.mobileApi }, { both: true });
    d.arrow(R.apiStore, { n: 3, lines: ['stores clip'], at: at.apiStore });
    d.arrow(R.apiAiw, { n: '4, 11', lines: ['index the tip /', 'answer [JSON]'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: '5, 12', lines: ['transcribe + timestamps,', 'translate, embed / answer', 'only from approved tips'] });
    d.arrow(R.apiDb, { n: '6, 10', lines: ['save /', 'search', '[SQL]'], at: at.apiDb }, { both: true });
    d.arrow(R.p3Web, { n: 7, lines: ['approves', 'the tip'], at: at.p3Web });
    d.arrow(R.webApi, { n: 7, lines: ['approve', '[HTTPS]'], at: at.webApi });
    d.arrow(R.p2Mobile, { n: '8, 13', lines: ['asks; taps', '"▶ Prasert · 1:24"'] });
  },

  // ------------------------------------------------------------ C
  'C-machine-database'(d) {
    d.canvas('Feature C: ', 'Machine & Asset Database', sub('Core (supporting) feature', 'no AI here: people set the machine status'));
    d.boundary();
    d.person('p1', 'Operator / technician', ['scans the QR label', 'on a machine']);
    d.person('p3', 'Engineer', ['keeps machine profiles', 'and PM checklists']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['QR scan (camera),', 'machine profile']);
    d.container('web', 'Web app', '[Container: Expo web]', ['machine list, search,', 'status filters']);
    d.container('api', 'API', '[Container: Node.js]', ['profile, history, BOM,', 'linked tips (B),', 'manuals (G)']);
    d.container('db', 'Database', '[Container: PostgreSQL]', ['machines, history,', 'BOM, stock']);
    d.container('store', 'Object storage', '[Container: Sakura]', ['machine photos,', 'manual PDFs']);
    d.arrow(R.p1Mobile, { n: 1, lines: ['scans the', 'QR label'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 2, lines: ['asks for', 'MC-CNC-04', '[HTTPS]'], at: at.mobileApi });
    d.arrow(R.apiDb, { n: '3, 7', lines: ['read /', 'write', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiStore, { n: 4, lines: ['photos, manual'], at: at.apiStore });
    d.arrow(R.p3Web, { n: 5, lines: ['edits profiles,', 'PM checklists'], at: at.p3Web });
    d.arrow(R.webApi, { n: 6, lines: ['saves', '[HTTPS]'], at: at.webApi });
  },

  // ------------------------------------------------------------ D
  'D-breakdown-reporting'(d) {
    d.canvas('Feature D: ', 'Machine Breakdown Reporting', sub('Core (supporting) feature', 'a person reports it, then Reported → Assigned → In Progress → Resolved'));
    d.boundary();
    d.person('p1', 'Operator', ['reports a problem', 'in under 30 seconds']);
    d.person('p2', 'Technician', ['gets the job,', 'fixes it, closes it']);
    d.person('p3', 'Line supervisor', ['assigns a technician', 'on the dashboard']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['report: category, voice,', 'photo · 4-stage tracker']);
    d.container('web', 'Web app', '[Container: Expo web]', ['repair board,', 'assign technician']);
    d.container('api', 'API', '[Container: Node.js]', ['repair tickets and', 'their 4 stages']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['transcribe and', 'translate the note']);
    d.container('db', 'Database', '[Container: PostgreSQL]', ['tickets,', 'machine history']);
    d.container('store', 'Object storage', '[Container: Sakura]', ['problem photos,', 'voice notes']);
    push(d); sakura(d);
    d.arrow(R.p1Mobile, { n: 1, lines: ['scans machine,', 'picks category, talks'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: '2, 9', lines: ['report,', 'status', '[HTTPS]'], at: at.mobileApi }, { both: true });
    d.arrow(R.apiStore, { n: 3, lines: ['saves media'], at: at.apiStore });
    d.arrow(R.apiDb, { n: '3, 10', lines: ['ticket,', 'history', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiAiw, { n: 4, lines: ['translate', 'the note [JSON]'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 5, lines: ['speech-to-text,', 'translate [HTTPS]'] });
    d.arrow(R.p3Web, { n: 6, lines: ['assigns a', 'technician'], at: at.p3Web });
    d.arrow(R.webApi, { n: 6, lines: ['assign', '[HTTPS]'], at: at.webApi });
    d.arrow(R.apiPush, { n: 7, lines: ['job alert in the technician\'s language'] });
    d.arrow(R.pushMobile, { n: 8, inline: true, lines: ['notifies the technician [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p2Mobile, { n: 9, lines: ['In Progress → Resolved,', 'root cause, parts'] });
  },

  // ------------------------------------------------------------ E
  'E-spare-parts'(d) {
    d.canvas('Feature E: ', 'Spare Parts & Store Pickup', sub('Core (supporting) feature', 'no AI here'));
    d.boundary();
    d.person('p1', 'Technician', ['ordered a part,', 'picks it up']);
    d.person('p3', 'Storekeeper', ['logs parts as', 'they arrive']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['red badge "Spare Parts 6",', 'bin location, QR sign-off']);
    d.container('web', 'Web app', '[Container: Expo web]', ['goods-in, assign', 'to requester']);
    d.container('api', 'API', '[Container: Node.js]', ['pickups, stock']);
    d.container('db', 'Database', '[Container: PostgreSQL]', ['parts, stock,', 'pickups']);
    push(d);
    d.arrow(R.p3Web, { n: 1, lines: ['logs the part,', 'picks requester'], at: at.p3Web });
    d.arrow(R.webApi, { n: 2, lines: ['saves', '[HTTPS]'], at: at.webApi });
    d.arrow(R.apiDb, { n: '3, 7', lines: ['pickup,', 'stock', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiPush, { n: 4, lines: ['pickup alert [HTTPS]'] });
    d.arrow(R.pushMobile, { n: 5, inline: true, lines: ['push + red badge [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p1Mobile, { n: 6, lines: ['goes to the bin,', 'scans pickup QR'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 7, lines: ['sign-off', '[HTTPS]'], at: at.mobileApi });
  },

  // ------------------------------------------------------------ F
  'F-announcements'(d) {
    d.canvas('Feature F: ', 'Multilingual Announcements', sub('Nice-to-have', 'HR writes once, everyone reads it in their own language'));
    d.boundary();
    d.person('p1', 'All employees', ['read the notice in', 'their own language']);
    d.person('p3', 'HR & admin', ['writes one notice,', 'picks the audience']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['notices,', 'Acknowledge button']);
    d.container('web', 'Web app', '[Container: Expo web]', ['composer, audience,', 'live "135 / 142" count']);
    d.container('api', 'API', '[Container: Node.js]', ['audience, priority,', 'read receipts']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['translate into', '6 languages']);
    d.container('db', 'Database', '[Container: PostgreSQL]', ['notices, translations,', 'receipts']);
    push(d); sakura(d);
    d.arrow(R.p3Web, { n: 1, lines: ['writes once, picks', 'Shift B & C, Urgent'], at: at.p3Web });
    d.arrow(R.webApi, { n: '2, 9', lines: ['publish, live count', '[HTTPS + WSS]'], at: at.webApi }, { both: true });
    d.arrow(R.apiAiw, { n: 3, lines: ['translate', '[JSON]'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 4, lines: ['TH, EN, MY, KM,', 'LO, JA [HTTPS]'] });
    d.arrow(R.apiDb, { n: '5, 8', lines: ['notice,', 'receipts', '[SQL]'], at: at.apiDb });
    d.arrow(R.apiPush, { n: 6, lines: ['push (Emergency = full screen)'] });
    d.arrow(R.pushMobile, { n: 6, inline: true, lines: ['notifies every phone [FCM / APNs]'], at: at.pushMobile }, { dashed: true });
    d.arrow(R.p1Mobile, { n: 7, lines: ['reads, taps', 'Acknowledge'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 8, lines: ['ack', '[HTTPS]'], at: at.mobileApi });
  },

  // ------------------------------------------------------------ G
  'G-translated-manuals'(d) {
    d.canvas('Feature G: ', 'Translated Manuals / SOPs', sub('Nice-to-have', 'a Japanese OEM manual becomes readable in every language'));
    d.boundary();
    d.person('p1', 'Technician', ['opens the manual', 'in own language']);
    d.person('p3', 'Engineer', ['uploads OEM manuals', 'and SOPs (often JA)']);
    d.container('mobile', 'Mobile app', '[Container: Expo]', ['manual reader, language', 'switch, offline cache']);
    d.container('web', 'Web app', '[Container: Expo web]', ['upload manuals,', 'check translations']);
    d.container('api', 'API', '[Container: Node.js]', ['manuals, steps,', 'links to machines']);
    d.container('aiw', 'AI worker', '[Container: Node.js jobs]', ['split into steps,', 'translate']);
    d.container('db', 'Database', '[Container: PostgreSQL]', ['manual steps in', '6 languages']);
    d.container('store', 'Object storage', '[Container: Sakura]', ['original PDFs']);
    sakura(d);
    d.arrow(R.p3Web, { n: 1, lines: ['uploads a', 'Japanese PDF'], at: at.p3Web });
    d.arrow(R.webApi, { n: 2, lines: ['upload', '[HTTPS]'], at: at.webApi });
    d.arrow(R.apiStore, { n: 3, lines: ['stores original'], at: at.apiStore });
    d.arrow(R.apiAiw, { n: 4, lines: ['translate job', '[JSON]'], at: at.apiAiw }, { both: true });
    d.arrow(R.aiwSakura, { n: 5, lines: ['translate step by step', 'with the plant glossary'] });
    d.arrow(R.apiDb, { n: '6, 9', lines: ['save /', 'read', '[SQL]'], at: at.apiDb });
    d.arrow(R.p1Mobile, { n: 7, lines: ['opens from machine,', 'job or Knowledge tab'], at: at.p1Mobile });
    d.arrow(R.mobileApi, { n: 8, lines: ['asks for', 'manual', '[HTTPS]'], at: at.mobileApi });
  },
};

for (const [name, fn] of Object.entries(diagrams)) {
  const d = Diagram();
  fn(d);
  const f = path.join(OUT, `lingualink-container-${name}.png`);
  d.render(f);
  console.log(f);
}
