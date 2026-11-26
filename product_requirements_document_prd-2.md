# Product Requirements Document (PRD): LinguaLink (Urbanice-Inspired Multilingual Factory App)

| Metadata | Details |
| :--- | :--- |
| **Product Name** | **LinguaLink** (Multilingual Shift Communication, Knowledge Transfer & Workforce Platform) |
| **Document Version** | 2.0 (Renamed from PlantOS. AI machine monitoring removed. Adds Smart Shift Handover Chat & Senior Knowledge Base) |
| **Target Platforms** | Reactive Web App (PWA) & Cross-Platform Mobile (iOS / Android) |
| **Design Inspiration** | Urbanice (`https://urbanice.app`) — Clean Mint/Teal Card-Based Mobile UI |
| **Languages** | Thai, English, Myanmar, Khmer, Lao, Japanese, with automatic translation of all messages, summaries, tips and manuals |

### Change log
* **v2.0:**
  * Renamed **PlantOS → LinguaLink**.
  * **Removed** AI Live Machine Monitoring, predictive failure scoring and AI-drafted maintenance reports (old Modules C & D).
  * **Added** two core modules:
    * **Smart Group Chat & AI Shift Handover**
    * **Senior Knowledge Base & AI Skill Transfer**
  * Repair tickets are now reported **by people** (no AI warnings).
  * Multilingual Announcements and Translated Manuals are now **Nice-to-Have**.
* v1.3: Single-factory edition with AI live telemetry & automated AI reporting.

---

## 1. Executive Summary & Concept Mapping

### 1.1 Vision
**LinguaLink** reimagines the intuitive, frictionless experience of **Urbanice** (Thailand's leading residential community management platform) for **a single, dedicated manufacturing factory with a multinational workforce**. Thai, Myanmar, Khmer and Lao operators work alongside Japanese engineers. Information gets lost in two places:

1. **At every shift change.** Handovers are verbal or on paper, in one language, and things get missed.
2. **When senior technicians retire.** Decades of hands-on tricks leave with them.

LinguaLink fixes both:
* A **group chat with an AI shift-handover summary**. Everything is auto-translated, so every worker reads it in their own language.
* A **knowledge base** that captures seniors' tips as video, voice or text. AI answers questions with links to the exact moment in the clip.

### 1.2 Urbanice-to-Factory Domain Translation

| Urbanice (Residential Condo) | LinguaLink (Single-Factory Equivalent) | Primary Users |
| :--- | :--- | :--- |
| **Condo / Building Profile** (`ข้อมูลโครงการ`) | **Dedicated Factory Hub** (`หน้าหลักโรงงาน — แสดงกะและสถานะรวม`) | All Factory Personnel |
| **Community Chat / Juristic Messages** | **Smart Shift Group Chat & AI Handover** (`แชทส่งต่อกะ + สรุปงาน`) | Operators, Technicians, Supervisors, Engineers |
| **Building Handbook / FAQ** | **Senior Knowledge Base & AI Q&A** (`คลังเกร็ดความรู้รุ่นเก๋า + AI ตอบคำถาม`) | Technicians, Operators, Senior Staff |
| **Juristic Announcements** (`ประกาศ`) | **Multilingual HR & Management Announcements** | HR, Admin, All Staff |
| **Parcel Notification + Red Badge** (`พัสดุ [6]`) | **Spare Parts / Store Pickup + Red Badge** (`เบิกอะไหล่ / พัสดุ [6]`) | Technicians, Line Leaders |
| **Property / Room Info** (`ข้อมูลห้อง / คอนโด`) | **Machine & Asset Database + Translated Manuals** (`ฐานข้อมูลเครื่องจักร / คู่มือแปลภาษา`) | Technicians, Engineers |
| **Repair Request** (`แจ้งซ่อม`) | **Machine Breakdown Reporting** (`แจ้งซ่อมเครื่องจักร`) | Operators, Supervisors, Technicians |
| **Common Fee / Bills** (`แจ้งเตือนค่าใช้จ่าย`) | **Payslip, OT & Shift Attendance Summary** (`สลิปเงินเดือน / โอที`) | HR, All Employees |
| **Facility Booking** (`จองส่วนกลาง`) | **Meeting Room, Training & Shuttle Booking** (`จองห้องประชุม / รถรับส่ง`) | All Employees |
| **Visitor Management (i-Pass)** (`ลงทะเบียนผู้มาติดต่อ`) | **Contractor & Visitor Gate Pass** (`ลงทะเบียนผู้รับเหมา / ผู้มาติดต่อ`) | Security, HR, Engineers |

### 1.3 Feature Priorities
| Priority | Feature |
| :--- | :--- |
| **Core** | Smart Group Chat & AI Shift Handover (Module A) |
| **Core** | Senior Knowledge Base & AI Skill Transfer (Module B) |
| **Core (supporting)** | Machine & Asset Database, Breakdown Reporting, Spare Parts (Modules C–E) |
| **Nice-to-Have** | Multilingual Announcements (Module F) |
| **Nice-to-Have** | Translated Manuals / SOPs (Module G) |

---

## 2. User Personas & Role-Based Access Control (RBAC)

LinguaLink adapts its action grid, chat channels and write permissions to the user's role. **Every user picks their own app language**, and all content is shown in that language.

1. **Shop-Floor Operator (`OPERATOR`)**
   * **Needs:** Tick off shift checklist items and leave quick notes (voice/photo) without typing long text. Read the AI handover summary at the start of shift. Report a machine problem in under 30 seconds. Read HR notices in their own language.
   * **Monitors** machines only. There is no remote control, for safety.
2. **Line Supervisor (`SUPERVISOR`)**
   * **Needs:** See what each shift finished, what is left and what to watch out for. Assign reported breakdowns to technicians. Publish shift notices.
3. **Maintenance Technician (`TECHNICIAN`)**
   * **Needs:** Receive repair jobs, ask the knowledge base "how do I fix X on machine Y", watch the exact part of a senior's video, and open manuals in their own language.
4. **Senior Technician / Expert (`SENIOR`)**
   * **Needs:** Record tips quickly (short video, voice or text) before retiring, and see which tips are most used.
5. **Engineer (`ENGINEER`)** — often Japanese-speaking
   * **Needs:** Read the floor's chat and handovers in Japanese, post instructions that reach workers in their languages, and review/approve knowledge-base entries.
6. **HR & Admin Manager (`HR_ADMIN`)**
   * **Needs:** Publish targeted or factory-wide announcements in all languages, track read receipts ("Acknowledge"), and manage visitor passes.

---

## 3. UI/UX Design System (Urbanice-Inspired Visual Identity)

### 3.1 Color Palette & Visual Tokens
* **Primary Brand Teal:** `#00A896` (active tab icons, primary buttons, AI summary label)
* **Soft Mint Surface:** `#E6F7F5` (circular icon containers, pinned AI handover banner, translated-message highlight)
* **App Canvas Background:** `#F5F7FA`
* **Elevated Card Surface:** `#FFFFFF`, `box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04)`, `14px` radius
* **Notification Red:** `#FF5A5F` (unread chat, spare parts and urgent HR counters)
* **Semantic Status Colors:**
  * Operational / Done: `#10B981` (Emerald Green)
  * Watch out / Pending: `#F59E0B` (Amber)
  * Breakdown / Urgent: `#EF4444` (Crimson Red)
  * Maintenance / Offline: `#64748B` (Slate Gray)

### 3.2 Layout Architecture & Screen Blueprint
1. **Top Hero Card:** factory cover photo with `Operational • Live`, `MAIN MANUFACTURING PLANT (โรงงานหลัก)`, `Shift B [Active]` | `142 On-Site`.
2. **Floating Priority Callout Card:** shows the **latest AI handover summary** ("3 tasks left from Shift A · 1 watch-out"), an urgent HR bulletin, or Spare Parts Ready `[6]`.
3. **2-Column Quick-Action Grid:**
   1. `Shift Chat & Handover` (`แชทส่งต่อกะ`)
   2. `Ask a Senior` (`ถามรุ่นพี่ / คลังความรู้`)
   3. `Report Problem` (`แจ้งซ่อมเครื่องจักร`)
   4. `Machine DB` (`ฐานข้อมูลเครื่องจักร`)
   5. `Manuals / SOP` (`คู่มือแปลภาษา`)
   6. `HR Announcements` (`ประกาศจาก HR`)
   7. `Spare Parts Pickup` (`เบิกอะไหล่ / พัสดุ`)
   8. `Work Shifts & OT` (`ตารางกะ / โอที`)
   9. `Safety Training` (`อบรมความปลอดภัย`)
   10. `Gate Pass (i-Pass)` (`ลงทะเบียนผู้มาติดต่อ`)
4. **Fixed Bottom Navigation Bar (5 Tabs):**
   * `Home` (`หน้าหลัก` — hero, callout, service grid, calendar)
   * `Shift Chat` (`แชทกะ` — group chat, checklist, pinned AI handover banner)
   * `Jobs` (`งานซ่อม` — my repair jobs)
   * `Knowledge` (`คลังความรู้` — Ask a Senior, clips, manuals)
   * `Notices` (`ประกาศ` — HR & management bulletins)
   * Profile, language and settings sit behind the avatar on Home.

---

## 4. Core Functional Requirements

### 4.1 Module A: Smart Group Chat & AI Shift Handover (`แชทส่งต่อกะ + สรุปงาน`) — **CORE**
Replaces verbal/paper handovers with a shift group chat that every nationality can read, plus an AI summary at the end of every shift.

* **FR-CH-01 (Interactive Checklist):**
  * Each shift/line has a routine checklist (e.g., *"Check coolant level on CNC-01"*, *"Clean Press-02 die area"*).
  * Workers just **tap ✓** to complete an item. No long typing.
  * The app records who did it and when, and syncs it live to everyone in the shift group.
* **FR-CH-02 (Multi-Input Notes):**
  * Workers can leave notes as **voice recordings, typed text, photos, or attached files** (e.g., spec sheets, PDFs).
  * Voice notes are transcribed automatically.
  * Any note can be flagged as **"Watch out"** (`ระวัง`).
* **FR-CH-03 (AI Shift Banner):**
  * When a shift ends, the AI immediately **pins a summary at the top of the chat** with three parts:
    * **Done** (`เสร็จแล้ว`): completed checklist items and resolved issues
    * **Still to do** (`เหลือต้องทำต่อ`): unticked items and open repair jobs
    * **Watch out** (`สิ่งที่ต้องระวัง`): flagged notes, unusual machine behaviour, safety points
  * The incoming shift sees the banner first, and the supervisor gets a notification.
  * Each line in the summary links back to the original message/photo.
* **FR-CH-04 (Auto-Translation):**
  * Every message, voice transcript and summary banner is **translated automatically** into each reader's language (TH, EN, MY, KM, LO, JA).
  * A **"Show original"** toggle sits under every translated message.
  * Factory terms (machine codes, part names) are kept consistent using a plant glossary.

### 4.2 Module B: Senior Knowledge Base & AI Skill Transfer (`คลังเกร็ดความรู้รุ่นเก๋า + AI ตอบคำถาม`) — **CORE**
Captures the know-how of senior technicians before they retire and makes it instantly searchable for everyone.

* **FR-KB-01 (Multi-Format Ingestion):**
  * Seniors record tips as **short video clips, voice recordings or text**, tagged with a machine (e.g., `Press-02`) and a topic.
  * The AI transcribes, translates and indexes each tip with **timestamps**.
  * An engineer can review and approve entries before they are published.
* **FR-KB-02 (AI Direct Answer):**
  * Workers **type or speak a question in natural language**, in their own language. For example: *"เครื่อง Press-02 น็อตหวาน แก้ยังไง"* (*"Press-02 bolt is stripped — how do I fix it?"*).
  * The AI answers immediately with step-by-step instructions, grounded **only** on approved senior tips and manuals.
  * If no tip covers the question, the AI says so and suggests asking a senior to record one. It never makes up an answer.
* **FR-KB-03 (Timestamp Citation):**
  * Every answer includes reference links to the **exact moment in the source video** (e.g., `▶ Uncle Prasert · 1:24`).
  * Tapping a link opens the clip at that second, so the worker sees the real demonstration.
* **FR-KB-04 (Link to Repair Jobs):** An open repair job shows an **"Ask a senior"** button that pre-fills the machine and problem.

### 4.3 Module C: Machine & Asset Database
* **FR-DB-01 (QR / Barcode Lookup):** Scan the QR label on a machine to open its profile.
* **FR-DB-02 (Search & Filters):** Search by asset code (e.g., `MC-CNC-04`), name or area, with status chips: `All`, `Needs repair`, `Running`, `Maintenance`.
* **FR-DB-03 (Asset Profile):**
  * Overview: code, name, maker, model, area, status, assigned technician, MTTR/MTBF.
  * Maintenance history and PM checklists.
  * Spare parts BOM with bin location and stock.
  * **Linked senior tips** (Module B) and **translated manuals** (Module G).
* Machine status is **set by people** (reports, repairs, PM). There is no AI telemetry analysis in v2.0.

### 4.4 Module D: Machine Breakdown Reporting (`แจ้งซ่อม`)
* **FR-TK-01 (Manual Problem Report):**
  * An operator or supervisor scans/selects the machine.
  * They pick a problem category (`Mechanical`, `Electrical`, `Noise/Vibration`, `Leak`, `Other`) and add a voice note or photo, which are auto-translated.
  * Submitting takes under 30 seconds.
* **FR-TK-02 (Progress Tracker):** a live 4-stage stepper: `Reported` → `Assigned` → `In Progress` → `Resolved`.
  * The supervisor assigns a technician, and the technician gets a push notification in their language.
* **FR-TK-03 (Auto-Sync):** When a ticket is resolved, its root cause and parts used are added to the machine history. The fix also appears in the next AI shift banner.

### 4.5 Module E: Spare Parts & Store Pickup (`เบิกอะไหล่ / พัสดุ`)
* **FR-PT-01:** Storekeepers log arriving parts and assign them to the requester.
* **FR-PT-02:** The requester gets a push notification and a red badge (`Spare Parts [6]`), with the bin location and QR pickup sign-off.

### 4.6 Module F: Multilingual Announcements — **Nice-to-Have**
* **FR-HR-01 (Audience Targeting):** All, by department, by shift (e.g., `Shift B & C`), by role, or specific people.
* **FR-HR-02 (Multilingual Delivery):** HR writes once, and each employee receives the notice in their own language.
* **FR-HR-03 (Priority & Category):** `Normal`, `Urgent` (pinned to the home callout), `Emergency` (full-screen + push).
* **FR-HR-04 (Read Receipts):** a **"Acknowledge (`รับทราบประกาศ`)"** button, with live progress on the HR dashboard (e.g., `135 / 142 acknowledged`).

### 4.7 Module G: Translated Manuals / SOPs — **Nice-to-Have**
* **FR-MN-01:** OEM machine manuals (often Japanese) and factory SOPs are translated into every supported language, step by step.
* **FR-MN-02:** Manuals open from the machine profile, a repair job or the Knowledge tab, in the reader's language, with a switch to view other languages.

---

## 5. Technical Architecture & Data Models

### 5.1 Recommended Tech Stack
* **App:** Expo (React Native + React Native Web) with Expo Router and TypeScript. One codebase serves the web dashboard and the iOS/Android apps.
* **Notifications:** Expo Notifications (FCM/APNs).
* **Media:** `expo-video` for knowledge clips (seek to timestamp), plus audio recording and image picker for chat notes.
* **Backend & real-time:** PostgreSQL + Node.js with WebSockets for chat, checklist sync and notifications. Object storage holds video/voice/photos.
* **AI services:**
  * **Translation:** LLM translation with a plant glossary, applied to chat messages, transcripts, banners, tips and manuals.
  * **Speech-to-text:** for voice notes and senior clips, with word-level timestamps.
  * **Shift summary:** an LLM that reads the shift's checklist, messages and jobs and produces Done / To do / Watch out.
  * **Knowledge Q&A (RAG):** a vector index over timestamped transcript segments and manuals. Answers must cite segments (clip + second).
* **Offline:** cached checklists, manuals and recently viewed tips for Wi-Fi dead zones.

### 5.2 Core Data Schemas (TypeScript)

```typescript
export type Lang = 'th' | 'en' | 'my' | 'km' | 'lo' | 'ja';
export type Translated = Record<Lang, string>;
export type UserRole = 'OPERATOR' | 'SUPERVISOR' | 'TECHNICIAN' | 'SENIOR' | 'ENGINEER' | 'HR_ADMIN';

export interface ShiftChecklistItem {
  id: string;
  shiftId: string;
  label: Translated;
  done: boolean;
  doneBy?: string;
  doneAt?: string;
}

export interface ChatMessage {
  id: string;
  shiftId: string;
  authorId: string;
  kind: 'TEXT' | 'VOICE' | 'PHOTO' | 'FILE';
  originalLang: Lang;
  text: Translated;          // message or voice transcript, translated
  mediaUrl?: string;
  watchOut: boolean;
  createdAt: string;
}

export interface ShiftHandoverSummary {
  id: string;
  shiftId: string;
  done: Translated[];
  todo: Translated[];
  watchOut: Translated[];
  sourceMessageIds: string[];
  pinnedAt: string;
}

export interface KnowledgeEntry {
  id: string;
  authorId: string;          // senior technician
  format: 'VIDEO' | 'VOICE' | 'TEXT';
  machineCodes: string[];    // e.g., ["PR-02"]
  title: Translated;
  mediaUrl?: string;
  segments: { startSec: number; endSec: number; text: Translated }[];
  status: 'PROCESSING' | 'PENDING_REVIEW' | 'PUBLISHED';
}

export interface KnowledgeAnswer {
  question: string;
  answer: Translated;
  citations: { entryId: string; startSec: number }[];
  confidence: 'ANSWERED' | 'NO_SOURCE';
}

export interface RepairTicket {
  id: string;
  assetId: string;
  reportedBy: string;
  category: 'MECHANICAL' | 'ELECTRICAL' | 'NOISE_VIBRATION' | 'LEAK' | 'OTHER';
  note?: Translated;
  photoUrls?: string[];
  stage: 'REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  assigneeId?: string;
  rootCause?: string;
  partsUsed?: string[];
  createdAt: string;
}

export interface HRAnnouncement {
  id: string;
  title: Translated;
  body: Translated;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  targetAudience: { scope: 'ALL' | 'TARGETED'; departments?: string[]; shifts?: string[]; roles?: UserRole[]; specificUserIds?: string[] };
  requireAcknowledgment: boolean;
  acknowledgedBy: { userId: string; acknowledgedAt: string }[];
  publishedAt: string;
}
```

---

## 6. Non-Functional Requirements & Security

1. **Performance:**
   * UI interactions respond in under 100 ms.
   * Chat messages and checklist ticks reach other devices in under 2 seconds.
   * Translations appear in under 3 seconds.
   * The AI shift banner is ready within 30 seconds of shift end.
2. **Human-in-the-Loop AI:**
   * AI handover summaries are marked "AI summary", always link to their source messages, and can be edited by the supervisor.
   * Knowledge answers only use approved tips/manuals and always show citations. If there is no source, the AI says so.
   * The original text is always one tap away.
3. **Safety:** Workers only **monitor** machines in the app. There is no remote machine control.
4. **Privacy & PDPA:**
   * Seniors give consent before their video/voice is published.
   * Role-based access controls who sees chat and HR data, with audit logs.
5. **Shop-Floor Ergonomics:**
   * Large touch targets (≥ 44 px), and one-tap checklist and voice note.
   * Works one-handed with gloves in bright lighting.

---

## 7. Phased Roadmap & Success Metrics (KPIs)

### Phase 1: MVP (Weeks 1–6)
* Urbanice-style app shell with 6-language UI.
* **Smart Shift Group Chat** with checklist, multi-input notes and auto-translation.
* **AI Shift Banner** (Done / To do / Watch out).
* Machine database + manual breakdown reporting with the 4-stage tracker.

### Phase 2: Knowledge Transfer (Weeks 7–11)
* **Senior Knowledge Base:** video/voice/text ingestion, transcription, review flow.
* **AI Direct Answer** with timestamp citations, plus "Ask a senior" from repair jobs.
* Spare parts pickup notifications.

### Phase 3: Nice-to-Have & Self-Service (Weeks 12+)
* Multilingual announcements with read receipts.
* Translated manuals / SOPs.
* Payslip/OT viewer, safety training tracker, contractor gate pass.

### Key Success Metrics (KPIs)
* **Handover quality:** ≥ 90% of shifts end with a completed checklist and an AI banner. 50% fewer "didn't know" incidents at shift change.
* **Language reach:** ≥ 95% of messages read by non-Thai workers in their own language.
* **Knowledge captured:** ≥ 100 senior tips recorded before the first planned retirements.
* **Faster fixes:** 30% lower MTTR on repairs where "Ask a senior" was used.
* **Daily active workforce:** ≥ 85% daily active use across all shifts.
