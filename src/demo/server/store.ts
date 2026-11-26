// In-memory demo "backend". Lives on globalThis so it survives between API
// requests (and module re-evaluation) while `npx expo start` is running.
// All "AI" here is scripted: no network, so it works on stage without internet.
import { ANNOUNCEMENT_PRESETS, ANNOUNCEMENT_TARGETS } from '../mock/announcements';
import { translate } from '../i18n';
import { ymd } from '../mock/calendar';
import { ADD_PRESETS, KNOWLEDGE_SEED } from '../mock/knowledge';
import { createMachines, PROBLEM_BY_MACHINE, PROBLEMS } from '../mock/machines';
import { RANDOM_NOTIFICATIONS } from '../mock/notifications';
import { PEOPLE, PHONE_USER_ID, REPORTER_BY_GROUP } from '../mock/people';
import { BOLT_NOTE, CHAT_PRESETS, CHECKLISTS, nextShift, same, SEED_CHAT, SHIFT_ENDED, SUMMARY_LINES } from '../mock/shift';
import { LANGS, type ChecklistItem, type DemoAction, type DemoState, type Job, type Lang, type Translated } from '../types';

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
  if (!g.__lingualinkDemo) g.__lingualinkDemo = create();
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
function report(machineId?: string, pb?: number, reporterId?: string) {
  const s = db().state;
  const candidates = s.machines.filter((m) => m.status === 'RUNNING');
  const m = (machineId && candidates.find((c) => c.id === machineId)) || pick(candidates);
  if (!m) return;
  const problem = pb ?? PROBLEM_BY_MACHINE[m.id] ?? 0;
  const now = Date.now();
  m.status = 'CRITICAL';
  s.jobs.unshift({
    id: id('job'),
    machineId: m.id,
    pb: problem,
    reportedBy: reporterId ?? REPORTER_BY_GROUP[m.group] ?? 'op-1',
    title: `${translate('en', `pb.${problem}.title`)} (${m.label})`,
    rootCauseOptions: PROBLEMS[problem].rootCauses,
    stage: 'REPORTED',
    createdAt: now,
    updatedAt: now,
  });
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
function endShift() {
  const d = db();
  const s = d.state;
  const now = Date.now();
  const from = s.shift;
  const to = nextShift(from);
  const since = d.shiftStartedAt;
  const jobLine = (tr: Translated, j: Job) => {
    const m = s.machines.find((x) => x.id === j.machineId);
    return fmt(tr, {
      machine: (l) => translate(l, 'machine', { n: (m?.label ?? '').replace(/\D+/g, '') }),
      title: (l) => translate(l, `pb.${j.pb}.title`),
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

  s.handovers.unshift({ id: id('ho'), fromShift: from, toShift: to, done, todo, watchOut, createdAt: now, readyAt: now + SUMMARY_MS });
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
  s.checklist = checklistFor(to);
  d.shiftStartedAt = now;
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

export function getState(): DemoState {
  tick();
  return db().state;
}

export function applyAction(a: DemoAction): DemoState {
  const s = db().state;
  const now = Date.now();
  switch (a.type) {
    case 'report': {
      if (!hasActiveProblem(s) || a.machineId) report(a.machineId, a.pb, a.reporterId);
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
        detailKey: `pb.${job.pb}.title`,
        detail: translate('en', `pb.${job.pb}.title`),
      });
      if (a.technicianId === s.phoneUserId) {
        const reporter = s.people.find((p) => p.id === job.reportedBy)?.name ?? '';
        const params = { machine: m?.label ?? '', group: m?.group ?? '', pb: job.pb, reporter };
        notify({
          kind: 'JOB',
          key: 'n.job',
          params,
          title: translate('en', 'n.job.t', params),
          body: translate('en', 'n.job.b', { ...params, title: translate('en', `pb.${job.pb}.title`) }),
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
      break;
    }
    case 'chat': {
      const preset = [...CHAT_PRESETS, BOLT_NOTE].find((p) => p.id === a.presetId);
      const free = a.text?.trim();
      if (!preset && !free) break;
      const watchOut = a.watchOut ?? !!preset?.watch;
      s.chat.push({
        id: id('msg'),
        authorId: a.authorId,
        kind: preset?.kind ?? 'text',
        original: a.lang,
        text: preset ? preset.text : same(free!),
        translated: !!preset,
        watchOut,
        watch: watchOut ? (preset?.watch ?? preset?.text ?? same(free!)) : undefined,
        durationSec: preset?.durationSec,
        fileName: preset?.fileName,
        photo: preset?.photo,
        createdAt: now,
      });
      s.chat = s.chat.slice(-60);
      break;
    }
    case 'endShift': {
      endShift();
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
      g.__lingualinkDemo = create();
      break;
    }
  }
  return getState();
}
