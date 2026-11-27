// Demo "backend". The state lives on globalThis between requests; when MONGODB_URI is set it is
// loaded from / saved to MongoDB on every request (so it works on a hosted server and survives
// restarts), and chat messages go into their own `messages` collection.
// Real AI (Gemini) is called by the API routes *before* the state is changed; when it isn't
// available, the scripted behaviour below is used, so the demo also works offline.
import { ANNOUNCEMENT_PRESETS, ANNOUNCEMENT_TARGETS } from '../mock/announcements';
import { translate } from '../i18n';
import { ymd } from '../mock/calendar';
import { ADD_PRESETS, KNOWLEDGE_SEED } from '../mock/knowledge';
import { createMachines, PROBLEM_BY_MACHINE, PROBLEMS } from '../mock/machines';
import { RANDOM_NOTIFICATIONS } from '../mock/notifications';
import { PEOPLE, PHONE_USER_ID, REPORTER_BY_GROUP } from '../mock/people';
import { AI_NOTES, BOLT_NOTE, CHAT_PRESETS, CHECKLISTS, nextShift, same, SEED_CHAT, SHIFT_ENDED, SUMMARY_LINES } from '../mock/shift';
import type { SummaryInput, SummaryResult, TipSegment, TranslateResult } from './ai';
import { messagesCol, mongoEnabled, ROOM_ID, STATE_ID, stateCol, type StoredMessage } from './db';
import { LANGS, type ChatMessage, type ChecklistItem, type DemoAction, type DemoState, type Job, type Lang, type Translated } from '../types';

interface Internal {
  state: DemoState;
  seq: number;
  lastTick: number;
  lastSample: number;
  nextNotifAt: number;
  lastRandomNotif: number;
  /** Start of the current shift (for "what happened this shift"). */
  shiftStartedAt: number;
}

const g = globalThis as unknown as { __lingualinkDemo?: Internal };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// First operator report ~60 s after start, so the shift-chat part of the demo isn't interrupted.
const FIRST_REPORT_MS = 60_000;
const nextReportDelay = () => rand(60_000, 120_000);
const nextNotifDelay = () => rand(20_000, 40_000);
const SUMMARY_MS = 2500;
const INGEST_MS = 6000;

/** Fill {params} in every language. Values may themselves differ per language. */
function fmt(tr: Translated, params: Record<string, string | ((l: Lang) => string)>): Translated {
  const out = {} as Translated;
  for (const { code } of LANGS) {
    out[code] = tr[code].replace(/\{(\w+)\}/g, (_, k: string) => {
      const v = params[k];
      return v === undefined ? `{${k}}` : typeof v === 'function' ? v(code) : v;
    });
  }
  return out;
}

const checklistFor = (shift: string): ChecklistItem[] => (CHECKLISTS[shift] ?? CHECKLISTS.A).map((c) => ({ id: c.id, label: c.label, done: false }));

function create(): Internal {
  const now = Date.now();
  const checklist = checklistFor('A');
  // Shift A has already done two items when the demo starts (same as the pitch diagram).
  checklist[0] = { ...checklist[0], done: true, doneBy: 'op-1', doneAt: now - 95 * 60_000 };
  checklist[1] = { ...checklist[1], done: true, doneBy: 'op-2', doneAt: now - 70 * 60_000 };
  return {
    seq: 1,
    lastTick: now,
    lastSample: now,
    nextNotifAt: now + 15_000,
    lastRandomNotif: -1,
    shiftStartedAt: now - 6 * 3600_000,
    state: {
      now,
      phoneUserId: PHONE_USER_ID,
      people: PEOPLE,
      machines: createMachines(),
      jobs: [],
      announcements: [],
      notifications: [],
      liveEvents: [],
      nextReportAt: now + FIRST_REPORT_MS,
      shift: 'A',
      chat: SEED_CHAT.map((c, i) => ({
        id: `seed-${i}`,
        authorId: c.authorId,
        kind: c.preset.kind,
        original: c.lang,
        text: c.preset.text,
        translated: true,
        watchOut: c.watchOut,
        watch: c.preset.watch,
        durationSec: c.preset.durationSec,
        fileName: c.preset.fileName,
        photo: c.preset.photo,
        createdAt: now - c.minsAgo * 60_000,
      })),
      checklist,
      handovers: [],
      knowledge: KNOWLEDGE_SEED.map((k, i) => ({ ...k, addedAt: now - (i + 3) * 86_400_000, readyAt: 0 })),
    },
  };
}

function db(): Internal {
  if (!g.__lingualinkDemo) {
    const d = create();
    setLive(d, scriptedSummary(d), false, summaryKey(d));
    g.__lingualinkDemo = d;
  }
  return g.__lingualinkDemo;
}

const id = (prefix: string) => `${prefix}-${db().seq++}`;

function notify(n: Omit<DemoState['notifications'][number], 'id' | 'createdAt'>) {
  const s = db().state;
  s.notifications = [{ ...n, id: id('n'), createdAt: Date.now() }, ...s.notifications].slice(0, 40);
}

function hasActiveProblem(s: DemoState) {
  return s.machines.some((m) => m.status !== 'RUNNING');
}

/** An operator (or supervisor) reports a problem by hand. No AI monitoring. */
/** Job title in English (custom reports carry their own words, translated). */
const jobTitleEn = (j: Job) => j.custom?.title.en ?? translate('en', `pb.${j.pb}.title`);

function report(machineId?: string, pb?: number, reporterId?: string, custom?: Job['custom']): boolean {
  const s = db().state;
  const candidates = s.machines.filter((m) => m.status === 'RUNNING');
  // A named machine that already has an open report isn't reported twice.
  const m = machineId ? candidates.find((c) => c.id === machineId) : pick(candidates);
  if (!m) return false;
  const problem = pb ?? PROBLEM_BY_MACHINE[m.id] ?? 0;
  const now = Date.now();
  m.status = 'CRITICAL';
  s.jobs.unshift({
    id: id('job'),
    machineId: m.id,
    pb: problem,
    reportedBy: reporterId ?? REPORTER_BY_GROUP[m.group] ?? 'op-1',
    title: `${custom?.title.en ?? translate('en', `pb.${problem}.title`)} (${m.label})`,
    rootCauseOptions: PROBLEMS[problem].rootCauses,
    stage: 'REPORTED',
    createdAt: now,
    updatedAt: now,
    custom,
  });
  return true;
}

function resolveJob(job: Job, rootCause: string, parts: string[]) {
  const s = db().state;
  job.stage = 'RESOLVED';
  job.rootCause = rootCause;
  job.partsUsed = parts;
  job.updatedAt = Date.now();
  const m = s.machines.find((x) => x.id === job.machineId);
  if (m) m.status = 'RUNNING';
  s.liveEvents.push({
    id: id('cal'),
    date: ymd(new Date()),
    time: new Date().toTimeString().slice(0, 5),
    type: 'PM',
    key: 'ev.repaired',
    params: { machine: m?.label ?? job.machineId },
    title: translate('en', 'ev.repaired', { machine: m?.label ?? job.machineId }),
    detailKey: rootCause,
    detail: translate('en', rootCause),
  });
  s.nextReportAt = Date.now() + nextReportDelay();
}

/** The scripted "AI" sums up the shift from the real checklist, chat and jobs. */
/** The scripted (no-AI) summary of the current shift: ticks, jobs and Watch-out notes. */
function scriptedSummary(d: Internal): SummaryResult {
  const s = d.state;
  const since = d.shiftStartedAt;
  const jobLine = (tr: Translated, j: Job) => {
    const m = s.machines.find((x) => x.id === j.machineId);
    return fmt(tr, {
      machine: (l) => translate(l, 'machine', { n: (m?.label ?? '').replace(/\D+/g, '') }),
      title: (l) => j.custom?.title[l] ?? translate(l, `pb.${j.pb}.title`),
    });
  };

  const done = [
    ...s.checklist.filter((c) => c.done).map((c) => c.label),
    ...s.jobs.filter((j) => j.stage === 'RESOLVED' && j.updatedAt >= since).map((j) => jobLine(SUMMARY_LINES.fixed, j)),
  ];
  const todo = [
    ...s.checklist.filter((c) => !c.done).map((c) => c.label),
    ...s.jobs.filter((j) => j.stage !== 'RESOLVED').map((j) => jobLine(SUMMARY_LINES.open, j)),
  ];
  const watchOut = s.chat.filter((c) => c.watchOut && c.createdAt >= since).map((c) => c.watch ?? c.text);
  return { done, todo, watchOut };
}

/** Changes whenever something the summary depends on changes (messages, ticks, jobs, shift). */
function summaryKey(d: Internal) {
  const s = d.state;
  const lastMsg = s.chat.filter((c) => !c.system && c.createdAt >= d.shiftStartedAt).at(-1)?.id ?? '-';
  // A translation arriving (new or caught-up message) also counts as a change.
  const waiting = s.chat.filter((c) => !c.system && (c.pending || !c.translated)).length;
  const ticks = s.checklist.filter((c) => c.done).map((c) => c.id).join(',');
  const jobs = s.jobs.filter((j) => j.stage !== 'RESOLVED' || j.updatedAt >= d.shiftStartedAt).map((j) => `${j.id}:${j.stage}`).join(',');
  const tasks = `${s.checklist.length}/${s.nextShiftTasks?.length ?? 0}`;
  return `${s.shift}|${lastMsg}|${waiting}|${ticks}|${tasks}|${jobs}`;
}

function setLive(d: Internal, sum: SummaryResult, ai: boolean, basedOn: string) {
  d.state.liveSummary = { shift: d.state.shift, ...sum, ai, basedOn, updatedAt: Date.now() };
}

function endShift(summary?: SummaryResult | null) {
  const d = db();
  const s = d.state;
  const now = Date.now();
  const from = s.shift;
  const to = nextShift(from);
  const { done, todo, watchOut } = summary ?? scriptedSummary(d);

  s.handovers.unshift({ id: id('ho'), fromShift: from, toShift: to, done, todo, watchOut, ai: !!summary, createdAt: now, readyAt: summary ? now : now + SUMMARY_MS });
  s.chat.push({
    id: id('msg'),
    authorId: 'ai',
    kind: 'text',
    original: 'en',
    text: fmt(SHIFT_ENDED, { from, to }),
    translated: true,
    system: true,
    createdAt: now,
  });
  s.shift = to;
  // Tasks the AI took from chat "for the next shift" join the new checklist.
  s.checklist = [...checklistFor(to), ...(s.nextShiftTasks ?? []).map((c) => ({ ...c, done: false }))];
  s.nextShiftTasks = [];
  d.shiftStartedAt = now;
  setLive(d, scriptedSummary(d), false, summaryKey(d));
  notify({
    kind: 'SHIFT',
    key: 'n.handover',
    params: { from, to, done: done.length, todo: todo.length, watch: watchOut.length },
    title: translate('en', 'n.handover.t', { from, to }),
    body: translate('en', 'n.handover.b', { done: done.length, todo: todo.length, watch: watchOut.length }),
  });
}

function tick() {
  const d = db();
  const s = d.state;
  const now = Date.now();
  s.now = now;
  if (now - d.lastTick < 250) return;
  d.lastTick = now;

  // Other employees acknowledge announcements over time.
  if (now - d.lastSample >= 1000) {
    d.lastSample = now;
    for (const a of s.announcements) {
      const cap = Math.floor(a.ackTotal * 0.95) - (a.phoneAcked ? 0 : 1);
      if (a.requireAck && a.ackCount < cap) a.ackCount = Math.min(cap, a.ackCount + Math.ceil(rand(a.ackTotal / 40, a.ackTotal / 15)));
    }
  }

  // Now and then an operator reports a problem (one at a time keeps the demo readable).
  if (now >= s.nextReportAt && !hasActiveProblem(s)) {
    report();
    s.nextReportAt = now + nextReportDelay();
  }

  // Random phone notifications.
  if (now >= d.nextNotifAt) {
    let i = Math.floor(Math.random() * RANDOM_NOTIFICATIONS.length);
    if (i === d.lastRandomNotif) i = (i + 1) % RANDOM_NOTIFICATIONS.length;
    d.lastRandomNotif = i;
    notify(RANDOM_NOTIFICATIONS[i]);
    d.nextNotifAt = now + nextNotifDelay();
  }

  // Jobs given to other technicians progress on their own.
  for (const job of s.jobs) {
    if (job.assigneeId === s.phoneUserId) continue;
    if (job.stage === 'ASSIGNED' && now - job.updatedAt > 6000) {
      job.stage = 'IN_PROGRESS';
      job.updatedAt = now;
      const m = s.machines.find((x) => x.id === job.machineId);
      if (m) m.status = 'MAINTENANCE';
    } else if (job.stage === 'IN_PROGRESS' && now - job.updatedAt > 15000) {
      resolveJob(job, job.rootCauseOptions[0], ['part.bearing']);
    }
  }
}

function getStateSync(): DemoState {
  tick();
  return db().state;
}

/** Results of Gemini calls made before the state changes (never taken from the client). */
export interface AiExtras {
  /** A report typed in the person's own words, translated by the AI (or kept as typed). */
  report?: Job['custom'] | null;
  /** Free-typed text will be translated right after it's saved (the message shows "Translating…"). */
  willTranslate?: boolean;
  summary?: SummaryResult | null;
}

function applyActionSync(a: DemoAction, extra: AiExtras = {}): DemoState {
  const s = db().state;
  const now = Date.now();
  switch (a.type) {
    case 'report': {
      if (!hasActiveProblem(s) || a.machineId) report(a.machineId, a.pb, a.reporterId, extra.report ?? undefined);
      break;
    }
    case 'join': {
      // A judge / visitor types their name on first open; they then appear by name in chat and checklist.
      const name = a.name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
      if (!/^u-[a-z0-9]{6,24}$/.test(a.userId) || !name) break;
      const lang = LANGS.some((l) => l.code === a.lang) ? a.lang : 'en';
      const existing = s.people.find((p) => p.id === a.userId);
      if (existing) Object.assign(existing, { name, lang });
      else if (s.people.filter((p) => p.role === 'GUEST').length < 300) s.people.push({ id: a.userId, name, role: 'GUEST', title: 'Guest', lang });
      break;
    }
    case 'assign': {
      const job = s.jobs.find((x) => x.id === a.jobId);
      if (!job || job.stage !== 'REPORTED') break;
      job.stage = 'ASSIGNED';
      job.assigneeId = a.technicianId;
      job.updatedAt = now;
      const m = s.machines.find((x) => x.id === job.machineId);
      s.liveEvents.push({
        id: id('cal'),
        date: ymd(new Date()),
        time: new Date().toTimeString().slice(0, 5),
        type: 'PM',
        key: 'ev.repairJob',
        params: { machine: m?.label ?? '' },
        title: translate('en', 'ev.repairJob', { machine: m?.label ?? '' }),
        detailKey: job.custom ? undefined : `pb.${job.pb}.title`,
        detail: jobTitleEn(job),
      });
      if (a.technicianId === s.phoneUserId) {
        const reporter = s.people.find((p) => p.id === job.reportedBy)?.name ?? '';
        const params = { machine: m?.label ?? '', group: m?.group ?? '', pb: job.pb, reporter };
        notify({
          kind: 'JOB',
          key: 'n.job',
          params,
          title: translate('en', 'n.job.t', params),
          body: translate('en', 'n.job.b', { ...params, title: jobTitleEn(job) }),
          jobId: job.id,
        });
      }
      break;
    }
    case 'start': {
      const job = s.jobs.find((x) => x.id === a.jobId);
      if (!job || job.stage !== 'ASSIGNED') break;
      job.stage = 'IN_PROGRESS';
      job.updatedAt = now;
      const m = s.machines.find((x) => x.id === job.machineId);
      if (m) m.status = 'MAINTENANCE';
      break;
    }
    case 'resolve': {
      const job = s.jobs.find((x) => x.id === a.jobId);
      if (!job || job.stage !== 'IN_PROGRESS') break;
      resolveJob(job, a.rootCause, a.parts);
      break;
    }
    case 'announce': {
      const preset = ANNOUNCEMENT_PRESETS.find((p) => p.id === a.presetId);
      const target = ANNOUNCEMENT_TARGETS.find((t) => t.id === a.target) ?? ANNOUNCEMENT_TARGETS[0];
      if (!preset) break;
      const ann = {
        id: id('ann'),
        presetId: preset.id,
        target: target.label,
        requireAck: a.requireAck,
        sentAt: now,
        ackCount: 0,
        ackTotal: target.headcount,
        phoneAcked: false,
      };
      s.announcements.unshift(ann);
      notify({ kind: 'HR', title: `HR: ${preset.title.en}`, body: preset.body.en, announcementId: ann.id });
      break;
    }
    case 'ack': {
      const ann = s.announcements.find((x) => x.id === a.announcementId);
      if (!ann || ann.phoneAcked) break;
      ann.phoneAcked = true;
      ann.ackCount = Math.min(ann.ackTotal, ann.ackCount + 1);
      break;
    }
    case 'check': {
      const item = s.checklist.find((c) => c.id === a.itemId);
      if (!item) break;
      item.done = !item.done;
      item.doneBy = item.done ? a.userId : undefined;
      item.doneAt = item.done ? now : undefined;
      item.viaChat = undefined;
      break;
    }
    case 'chat': {
      const preset = [...CHAT_PRESETS, BOLT_NOTE].find((p) => p.id === a.presetId);
      const free = a.text?.trim();
      if (!preset && !free) break;
      // Saved at once; free-typed text gets its translation a moment later (saveTranslation).
      const watchOut = a.watchOut ?? !!preset?.watch;
      const text = preset ? preset.text : same(free!);
      s.chat.push({
        id: id('msg'),
        authorId: a.authorId,
        kind: preset?.kind ?? 'text',
        original: a.lang,
        text,
        translated: !!preset,
        pending: (!preset && extra.willTranslate) || undefined,
        watchOut,
        watch: watchOut ? (preset?.watch ?? text) : undefined,
        durationSec: preset?.durationSec,
        fileName: preset?.fileName,
        photo: preset?.photo,
        createdAt: now,
      });
      s.chat = s.chat.slice(-60);
      break;
    }
    case 'endShift': {
      endShift(extra.summary);
      break;
    }
    case 'addKnowledge': {
      const preset = ADD_PRESETS.find((p) => p.id === a.presetId);
      if (!preset || s.knowledge.some((k) => k.id === preset.id)) break;
      const { label: _label, ...entry } = preset;
      s.knowledge.unshift({ ...entry, addedAt: now, readyAt: now + INGEST_MS });
      break;
    }
    case 'reset': {
      g.__lingualinkDemo = undefined;
      db(); // fresh demo with its scripted live summary
      break;
    }
  }
  return getStateSync();
}

// ---------- Data the AI needs ----------

/** What happened this shift, in English, for Gemini's handover summary. */
export function summaryInput(): SummaryInput {
  const d = db();
  const s = d.state;
  const name = (pid?: string) => s.people.find((p) => p.id === pid)?.name ?? pid ?? '';
  return {
    fromShift: s.shift,
    toShift: nextShift(s.shift),
    checklist: [
      ...s.checklist.map((c) => ({ label: c.label.en, done: c.done, by: c.done ? name(c.doneBy) : undefined })),
      ...(s.nextShiftTasks ?? []).map((c) => ({ label: `(for next shift) ${c.label.en}`, done: false })),
    ],
    chat: s.chat
      .filter((c) => !c.system && c.createdAt >= d.shiftStartedAt)
      .map((c) => ({ author: name(c.authorId), lang: c.original, text: c.text.en === c.text[c.original] ? c.text.en : `${c.text.en} (original: ${c.text[c.original]})`, watchOut: c.watchOut || undefined })),
    jobs: s.jobs
      .filter((j) => j.stage !== 'RESOLVED' || j.updatedAt >= d.shiftStartedAt)
      .map((j) => ({
        machine: s.machines.find((m) => m.id === j.machineId)?.label ?? j.machineId,
        problem: jobTitleEn(j),
        stage: j.stage,
        assignee: j.assigneeId ? name(j.assigneeId) : undefined,
      })),
  };
}

/** The live summary only if it still matches the current shift data (used to skip a repeat AI call). */
export function liveSummaryStatus(): { key: string; fresh: SummaryResult | null } {
  const d = db();
  const key = summaryKey(d);
  const live = d.state.liveSummary;
  const fresh = live && live.ai && live.basedOn === key ? { done: live.done, todo: live.todo, watchOut: live.watchOut } : null;
  return { key, fresh };
}

/** Save a new live summary, unless something changed while it was being written (then the newer request wins). */
export function saveLiveSummary(sum: SummaryResult | null, basedOn: string): Promise<DemoState> {
  return withStore(() => {
    const d = db();
    tick();
    if (summaryKey(d) === basedOn) setLive(d, sum ?? scriptedSummary(d), !!sum, basedOn);
    return d.state;
  });
}

// ---------- Translating a message after it was sent ----------

const PENDING_MAX_AGE = 2 * 60_000;

/** Messages still waiting for their translation (newest first, a few at a time). */
/**
 * Messages the AI still has to read: just-sent ones ("Translating…"), plus older messages of this
 * shift that were never translated (typed before the AI was set up, or while it was down).
 * After a send, an older message that already failed once is skipped; opening the chat (catch-up) retries it.
 */
export function pendingMessages(retryFailed = false): { id: string; text: string; lang: Lang; authorId: string }[] {
  const d = db();
  const s = d.state;
  return s.chat
    .filter((m) =>
      m.system
        ? false
        : m.pending
          ? s.now - m.createdAt < PENDING_MAX_AGE
          : !m.translated && (retryFailed || !m.aiTried) && m.createdAt >= d.shiftStartedAt,
    )
    .slice(retryFailed ? -10 : -5) // a few at a time keeps within the free-tier limits
    .reverse()
    .map((m) => ({ id: m.id, text: m.text[m.original], lang: m.original, authorId: m.authorId }));
}

/** Checklist tasks still open, in English, for the AI to match messages against. */
export function openTasks(): { id: string; label: string }[] {
  return db().state.checklist.filter((c) => !c.done).map((c) => ({ id: c.id, label: c.label.en }));
}

/** Everything the AI found in one chat message, applied for its author. */
export interface ChatFindings {
  completed: string[];
  newTasks: { label: Translated; nextShift: boolean }[];
  problem?: { machineId: string; title: Translated; text: Translated } | null;
}

const MAX_TASKS = 18;

/**
 * Act on a message: tick tasks it says are done, add tasks it asks for (now or next shift),
 * and open a repair report when it describes a machine problem. Each action leaves an AI line in the chat.
 */
export function applyChatFindings(f: ChatFindings, authorId: string): Promise<void> {
  if (!f.completed.length && !f.newTasks.length && !f.problem) return Promise.resolve();
  return withStore(() => {
    const d = db();
    const s = d.state;
    const now = Date.now();
    const aiLine = (text: Translated) =>
      s.chat.push({ id: id('msg'), authorId: 'ai', kind: 'text', original: 'en', text, translated: true, system: true, createdAt: Date.now() });

    for (const c of s.checklist) {
      if (!f.completed.includes(c.id) || c.done) continue;
      Object.assign(c, { done: true, doneBy: authorId, doneAt: now, viaChat: true });
    }
    for (const t of f.newTasks) {
      const list = t.nextShift ? (s.nextShiftTasks ??= []) : s.checklist;
      const dup = [...s.checklist, ...(s.nextShiftTasks ?? [])].some((c) => c.label.en.toLowerCase() === t.label.en.toLowerCase());
      if (dup || list.length >= MAX_TASKS) continue;
      list.push({ id: id('task'), label: t.label, done: false, addedBy: authorId });
      aiLine(fmt(t.nextShift ? AI_NOTES.taskNext : AI_NOTES.taskAdded, { task: (l) => t.label[l] }));
    }
    if (f.problem) {
      const m = s.machines.find((x) => x.id === f.problem!.machineId);
      if (m && report(m.id, undefined, authorId, { title: f.problem.title, text: f.problem.text })) {
        aiLine(
          fmt(AI_NOTES.reportOpened, {
            machine: (l) => translate(l, 'machine', { n: m.label.replace(/\D+/g, '') }),
            title: (l) => f.problem!.title[l],
          }),
        );
      }
    }
  });
}

/** What to change on a message once its translation is back (null = translation failed). */
function translationPatch(m: ChatMessage, tr: TranslateResult | null): Partial<ChatMessage> {
  if (!tr) return { translated: false, aiTried: true };
  const aiFlagged = tr.watchOut && !m.watchOut;
  const watchOut = !!m.watchOut || aiFlagged;
  return { text: tr.text, original: tr.lang, translated: true, watchOut, aiFlagged: aiFlagged || undefined, watch: watchOut ? (tr.watch ?? tr.text) : undefined };
}

/** Put the translation on a message (straight into its own MongoDB document; no state save needed). */
export async function saveTranslation(id: string, tr: TranslateResult | null): Promise<void> {
  const inMemory = () => {
    const m = db().state.chat.find((x) => x.id === id);
    if (!m || m.translated) return;
    Object.assign(m, translationPatch(m, tr));
    delete m.pending;
  };
  if (!mongoEnabled()) return inMemory();
  try {
    const mc = await messagesCol();
    const m = await mc.findOne({ _id: id });
    if (!m || m.translated) return;
    const patch = translationPatch(m, tr);
    const unset: Record<string, ''> = { pending: '' };
    for (const [k, v] of Object.entries(patch)) if (v === undefined) unset[k] = '';
    await mc.updateOne({ _id: id, translated: false }, { $set: patch, $unset: unset });
  } catch (e) {
    console.error('[db] could not save translation:', e instanceof Error ? e.message : e);
    inMemory();
  }
}

/** Every ready senior-tip moment, for "Ask a senior". */
export function tipSegments(): TipSegment[] {
  const s = db().state;
  return s.knowledge
    .filter((k) => s.now >= k.readyAt)
    .flatMap((k) =>
      k.segments.map((sg) => ({
        entryId: k.id,
        at: sg.at,
        senior: s.people.find((p) => p.id === k.seniorId)?.name ?? k.seniorId,
        title: k.title.en,
        machine: s.machines.find((m) => m.id === k.machineId)?.label ?? k.machineId,
        format: k.format,
        text: sg.text.en,
      })),
    );
}

// ---------- MongoDB persistence ----------

const gl = globalThis as unknown as { __lingualinkLock?: Promise<unknown> };
/** One change at a time inside this server process (kept on globalThis: the dev server can load this module more than once). */
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const p = (gl.__lingualinkLock ?? Promise.resolve()).then(fn, fn);
  gl.__lingualinkLock = p.catch(() => undefined);
  return p;
}

class StoreBusy extends Error {}
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Everything except clock ticks, to tell whether a save is needed. */
const fingerprint = (d: Internal) => JSON.stringify({ ...d, lastTick: 0, lastSample: 0, state: { ...d.state, now: 0, chat: [] } });

const toChat = ({ _id: _i, roomId: _r, ...m }: StoredMessage): ChatMessage => m;

/** Load the state from MongoDB, run `mutate`, and save it back (with a version check across servers). */
async function withStore<T>(mutate: () => T, opts: { reset?: boolean } = {}): Promise<T> {
  if (!mongoEnabled()) return mutate();
  try {
    return await serial(async () => {
      const sc = await stateCol<Internal>();
      const mc = await messagesCol();
      for (let attempt = 0; attempt < 10; attempt++) {
        if (attempt) await pause(20 + Math.random() * 80 * attempt);
        const doc = await sc.findOne({ _id: STATE_ID });
        const loaded = new Set<string>();
        if (doc) {
          const msgs = await mc.find({ roomId: ROOM_ID }).sort({ createdAt: -1 }).limit(60).toArray();
          msgs.forEach((m) => loaded.add(m.id));
          g.__lingualinkDemo = { ...doc.internal, state: { ...doc.internal.state, chat: msgs.reverse().map(toChat) } };
        } else {
          g.__lingualinkDemo = undefined; // first run: create() seeds a fresh demo
        }
        const before = doc ? fingerprint(db()) : '';
        const result = mutate();
        const d = db();
        if (opts.reset) loaded.clear();
        const fresh = d.state.chat.filter((m) => !loaded.has(m.id));
        if (doc && !opts.reset && !fresh.length && fingerprint(d) === before) return result;

        const internal: Internal = { ...d, state: { ...d.state, chat: [] } };
        let saved = false;
        if (!doc) {
          saved = await sc.insertOne({ _id: STATE_ID, version: 1, internal }).then(
            () => true,
            () => false,
          );
        } else {
          const r = await sc.updateOne({ _id: STATE_ID, version: doc.version }, { $set: { internal }, $inc: { version: 1 } });
          saved = r.modifiedCount === 1;
        }
        if (!saved) continue; // someone else saved first: reload and redo
        if (opts.reset || !doc) await mc.deleteMany({ roomId: ROOM_ID });
        if (fresh.length) {
          await mc.insertMany(
            fresh.map((m) => ({ ...m, _id: m.id, roomId: ROOM_ID })),
            { ordered: false },
          ).catch((e) => console.warn('[db] some messages were already saved', e?.message));
        }
        return result;
      }
      throw new StoreBusy('Demo state is busy, try again');
    });
  } catch (e) {
    if (e instanceof StoreBusy) throw e;
    // Database down or busy: keep the demo running from memory rather than failing on stage.
    console.error('[db] MongoDB unavailable, using memory:', e instanceof Error ? e.message : e);
    return mutate();
  }
}

export function getState(): Promise<DemoState> {
  return withStore(getStateSync);
}

export function applyAction(a: DemoAction, extra?: AiExtras): Promise<DemoState> {
  return withStore(() => applyActionSync(a, extra), { reset: a.type === 'reset' });
}

/** Read-only helpers run against freshly loaded state. */
export function readStore<T>(fn: () => T): Promise<T> {
  return withStore(() => {
    tick();
    return fn();
  });
}
