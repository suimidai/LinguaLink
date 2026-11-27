// Shared types for the LinguaLink demo (simplified from PRD §5.2).

export type Lang = 'th' | 'en' | 'my' | 'km' | 'lo' | 'ja';
export type Translated = Record<Lang, string>;

export const LANGS: { code: Lang; label: string; native: string }[] = [
  { code: 'th', label: 'TH', native: 'ไทย' },
  { code: 'en', label: 'EN', native: 'English' },
  { code: 'my', label: 'MY', native: 'မြန်မာ' },
  { code: 'km', label: 'KM', native: 'ខ្មែរ' },
  { code: 'lo', label: 'LO', native: 'ລາວ' },
  { code: 'ja', label: 'JA', native: '日本語' },
];

export type Role = 'ENGINEER' | 'SUPERVISOR' | 'TECHNICIAN' | 'HR' | 'OPERATOR' | 'SENIOR' | 'GUEST';

export interface Person {
  id: string;
  name: string;
  role: Role;
  title: string;
  lang: Lang;
}

export type MachineStatus = 'RUNNING' | 'CRITICAL' | 'MAINTENANCE';

export interface Machine {
  id: string;
  label: string; // "Machine 01"
  code: string; // "MC-CNC-01"
  type: string; // "CNC Lathe"
  typeKey: string; // i18n key, e.g. "mt.cnc"
  group: string; // "Supervisor 01"
  supervisorId: string;
  manualIds: string[];
  /** Set by people: a report makes it CRITICAL, a repair MAINTENANCE, a fix RUNNING. */
  status: MachineStatus;
}

export type JobStage = 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export const JOB_STAGES: JobStage[] = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

export interface Job {
  id: string;
  machineId: string;
  /** Index into PROBLEMS (i18n keys pb.N.title / pb.N.text). */
  pb: number;
  /** The person who reported the problem by hand (operator or supervisor). */
  reportedBy: string;
  title: string;
  rootCauseOptions: string[];
  stage: JobStage;
  assigneeId?: string;
  createdAt: number;
  updatedAt: number;
  rootCause?: string;
  partsUsed?: string[];
  /** A report in the person's own words (from the Report button or the chat), auto-translated. */
  custom?: { title: Translated; text: Translated };
}

export interface AnnouncementPreset {
  id: string;
  title: Translated;
  body: Translated;
}

export interface Announcement {
  id: string;
  presetId: string;
  target: string;
  requireAck: boolean;
  sentAt: number;
  ackCount: number;
  ackTotal: number;
  phoneAcked: boolean;
}

export type NotificationKind = 'JOB' | 'HR' | 'PARTS' | 'SHIFT' | 'TRAINING';

export interface PhoneNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: number;
  announcementId?: string;
  jobId?: string;
  /** i18n key prefix: title = `${key}.t`, body = `${key}.b`. */
  key?: string;
  params?: Record<string, string | number>;
}

export type CalendarType = 'SHIFT' | 'PM' | 'MEETING' | 'HR';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  type: CalendarType;
  detail?: string;
  /** i18n keys so each device shows the event in its own language. */
  key?: string;
  detailKey?: string;
  params?: Record<string, string>;
}

export interface ManualStep {
  text: Translated;
}

export interface Manual {
  id: string;
  title: Translated;
  /** i18n keys of the machine types this manual covers. */
  machineTypeKeys: string[];
  steps: ManualStep[];
}

// ---- Smart Group Chat & AI Shift Handover ----

export type ChatKind = 'text' | 'voice' | 'photo' | 'file';

export interface ChatMessage {
  id: string;
  authorId: string;
  kind: ChatKind;
  /** Language the author wrote / spoke in. */
  original: Lang;
  /** Message (or voice transcript), auto-translated. */
  text: Translated;
  /** False for free-typed text the mock translator doesn't know. */
  translated: boolean;
  /** Saved, translation on its way (shows "Translating…"). */
  pending?: boolean;
  /** The AI tried to translate it and failed (not retried automatically). */
  aiTried?: boolean;
  watchOut?: boolean;
  /** Gemini spotted the warning by itself (the writer didn't press "Watch out"). */
  aiFlagged?: boolean;
  /** Short line for the AI summary's "Watch out" list. */
  watch?: Translated;
  durationSec?: number;
  fileName?: string;
  photo?: PhotoKey;
  system?: boolean;
  createdAt: number;
}

export type PhotoKey = 'coolant' | 'bolt' | 'sensor';

export interface ChecklistItem {
  id: string;
  label: Translated;
  done: boolean;
  /** Ticked by the AI from a chat message (not by tapping). */
  viaChat?: boolean;
  /** Added by the AI from a chat message, by this person. */
  addedBy?: string;
  doneBy?: string;
  doneAt?: number;
}

export interface HandoverSummary {
  id: string;
  fromShift: string;
  toShift: string;
  done: Translated[];
  todo: Translated[];
  watchOut: Translated[];
  /** Written by Gemini from the real shift data (false = scripted fallback). */
  ai?: boolean;
  createdAt: number;
  /** The "AI" shows a short "summarizing…" state until this time. */
  readyAt: number;
}

export interface LiveSummary {
  shift: string;
  done: Translated[];
  todo: Translated[];
  watchOut: Translated[];
  /** false = scripted (no AI available). */
  ai: boolean;
  /** Which shift data it was written from (to skip repeat AI calls). */
  basedOn: string;
  updatedAt: number;
}

// ---- Senior Knowledge Base ----

export type KnowledgeFormat = 'VIDEO' | 'VOICE' | 'TEXT';

export interface KnowledgeSegment {
  /** Second in the clip where this part starts. */
  at: number;
  text: Translated;
}

export interface KnowledgeEntry {
  id: string;
  seniorId: string;
  format: KnowledgeFormat;
  machineId: string;
  title: Translated;
  durationSec: number;
  segments: KnowledgeSegment[];
  addedAt: number;
  /** Mock ingestion: transcribing → translating → indexing until this time. */
  readyAt: number;
}

export interface DemoState {
  now: number;
  phoneUserId: string;
  people: Person[];
  machines: Machine[];
  jobs: Job[];
  announcements: Announcement[];
  notifications: PhoneNotification[];
  liveEvents: CalendarEvent[];
  nextReportAt: number;
  shift: string;
  chat: ChatMessage[];
  checklist: ChecklistItem[];
  handovers: HandoverSummary[];
  /** AI summary of the shift so far, rewritten after every message / tick. */
  liveSummary?: LiveSummary;
  /** Tasks the AI took from chat for the next shift; added to its checklist when the shift ends. */
  nextShiftTasks?: ChecklistItem[];
  knowledge: KnowledgeEntry[];
}

export type DemoAction =
  | { type: 'report'; machineId?: string; pb?: number; reporterId?: string; text?: string; lang?: Lang }
  | { type: 'join'; userId: string; name: string; lang: Lang }
  | { type: 'assign'; jobId: string; technicianId: string }
  | { type: 'start'; jobId: string }
  | { type: 'resolve'; jobId: string; rootCause: string; parts: string[] }
  | { type: 'announce'; presetId: string; target: string; requireAck: boolean }
  | { type: 'ack'; announcementId: string }
  | { type: 'check'; itemId: string; userId: string }
  | { type: 'chat'; authorId: string; lang: Lang; presetId?: string; text?: string; watchOut?: boolean }
  | { type: 'endShift' }
  | { type: 'addKnowledge'; presetId: string }
  | { type: 'reset' };

// ---- Uploaded manuals (PDF / Word / photos), translated on request ----

export type ManualBlockType = 'paragraph' | 'step' | 'warning' | 'table';

export interface ManualBlock {
  type: ManualBlockType;
  text: string;
  /** Only for tables: rows of cells (first row = header). */
  rows: string[][];
}

export interface ManualContent {
  title: string;
  sections: { heading: string; blocks: ManualBlock[] }[];
}

export type UploadKind = 'pdf' | 'docx' | 'images';

/** What the manual list shows (no content). */
export interface UploadedManualSummary {
  id: string;
  fileName: string;
  kind: UploadKind;
  size: number;
  pages: number;
  uploadedBy: string;
  uploadedAt: number;
  status: 'reading' | 'ready' | 'failed';
  error?: string;
  sourceLang?: Lang;
  title?: string;
  /** Languages already translated and saved. */
  langs: Lang[];
}

export interface UploadedManual extends UploadedManualSummary {
  doc?: ManualContent;
  translations: Partial<Record<Lang, ManualContent>>;
}
