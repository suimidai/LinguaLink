# LinguaLink: architecture and key user flows

Diagrams for LinguaLink, based on the PRD (`product_requirements_document_prd-2.md`, v2.0).
v2.0 **removed AI machine monitoring** (no telemetry, no AI risk warnings). The two core modules are **Smart Group Chat & AI Shift Handover** and **Senior Knowledge Base & AI Skill Transfer**.

## Stack decision

> **Note:** this replaces PRD §5.1 (React + Vite + Capacitor).

- **One Expo codebase** (Expo SDK 58, Expo Router, react-native-web) builds both clients.
- **Web comes first** for engineers, supervisors and HR, who work on big screens.
- **Mobile is a native iOS/Android app**, chosen for security: tokens in the device keychain (`expo-secure-store`), biometric login and no browser attack surface. It serves operators and technicians on the shop floor.
- Platform-specific UI uses Expo's file suffixes, for example `src/components/app-tabs.web.tsx` (web sidebar) and `src/components/app-tabs.tsx` (native tabs).
- **AI runs on SAKURA internet** (servers in Japan): speech-to-text, translation, shift summaries and knowledge-base answers.

---

## 1. System architecture

```mermaid
flowchart LR
    subgraph CLIENTS["Clients: one Expo codebase"]
        direction TB
        WEB["<b>Web dashboard</b><br/>sidebar layout<br/>ENGINEER · SUPERVISOR · HR_ADMIN"]
        MOB["<b>Native iOS / Android app</b><br/>5 bottom tabs<br/>OPERATOR · TECHNICIAN · SENIOR"]
    end

    subgraph BACKEND["LinguaLink backend"]
        direction TB
        API["<b>API</b><br/>REST · RBAC · audit log"]
        WS["WebSocket gateway<br/>chat · checklist · job status"]
        PG[("PostgreSQL + pgvector<br/>users · shifts · chat · checklists<br/>tickets · announcements · tip index")]
        OBJ[("Object storage<br/>voice notes · photos · clips · PDFs")]
        WORK["AI worker<br/>queues jobs to the AI engine"]
        API --- PG
        API --- WS
        API --- OBJ
        API --> WORK
    end

    subgraph EXT["External systems"]
        direction TB
        SAKURA["<b>SAKURA internet AI Engine</b><br/>speech-to-text · translation<br/>shift summary · answers from tips"]
        PUSH["FCM / APNs push"]
    end

    WEB <-->|HTTPS + WSS| API
    MOB <-->|HTTPS + WSS| API
    WORK <--> SAKURA
    API --> PUSH
    PUSH -.-> MOB
```

There is no connection to the machines themselves. Machine status is set by people (reports, repairs, PM).

---

## 2. Platform & role map

```mermaid
flowchart LR
    subgraph ROLES["Roles"]
        OP["OPERATOR"]
        TECH["TECHNICIAN"]
        SEN["SENIOR"]
        SUP["SUPERVISOR"]
        ENG["ENGINEER"]
        HR["HR_ADMIN"]
    end

    subgraph MOBP["Native app: shop floor"]
        M1["Shift chat: tick checklist, voice / photo / file notes"]
        M2["Read the pinned AI handover summary"]
        M3["Report a machine problem in < 30 s"]
        M4["Repair jobs + Ask a senior"]
        M5["Notices + acknowledge"]
    end

    subgraph WEBP["Web dashboard"]
        W1["Factory overview: machines, reports, handover"]
        W2["Assign reports to technicians"]
        W3["Knowledge base: upload & approve tips"]
        W4["Announcement composer + ack progress"]
        W5["Manuals · calendar"]
    end

    OP ==> MOBP
    TECH ==> MOBP
    SEN ==> MOBP
    SEN -.-> WEBP
    SUP ==> WEBP
    SUP -.-> MOBP
    ENG ==> WEBP
    HR ==> WEBP
```

Thick arrow = main platform, dotted arrow = also uses it.

---

## 3. Key user flows

### 3.1 Shift chat → AI shift handover (FR-CH-01..04)

```mermaid
sequenceDiagram
    autonumber
    participant MYA as Mya, Shift A (app, Myanmar)
    participant API as LinguaLink API
    participant AI as SAKURA AI Engine
    participant NOY as Noy, Shift B (app, Lao)
    participant SUP as Supervisor (web)

    MYA->>API: tick checklist item ✓
    API-->>NOY: WebSocket: checklist updated
    MYA->>API: voice note + photo (Press-02 guard bolt loose, "Watch out")
    API->>AI: speech-to-text + translate (TH, EN, MY, KM, LO, JA)
    AI-->>API: transcript + 6 translations
    API-->>NOY: message shown in Lao ("Show original" = Myanmar)
    Note over API: Shift A ends
    API->>AI: summarize: checklist + flagged notes + open / fixed jobs
    AI-->>API: Done / Still to do / Watch out (6 languages)
    API-->>NOY: pinned AI summary at the top of the chat + push
    API-->>SUP: notification: handover ready
```

### 3.2 Ask a senior → answer with timestamp (FR-KB-01..04)

```mermaid
sequenceDiagram
    autonumber
    participant SEN as Senior Prasert (app / web)
    participant API as LinguaLink API
    participant AI as SAKURA AI Engine
    participant ENG as Engineer (web)
    participant TECH as Technician Somchai (app, Thai)

    SEN->>API: upload video tip (Press-02, stripped bolt)
    API->>AI: transcribe + translate + index with timestamps
    AI-->>API: segments (0:42, 1:24, 2:15 …)
    ENG->>API: approve tip
    TECH->>API: "เครื่อง Press-02 น็อตหวาน แก้ยังไง" (typed or spoken)
    API->>AI: answer only from approved tips + manuals
    AI-->>API: steps + citations
    API-->>TECH: answer in Thai with "▶ Prasert · 1:24"
    TECH->>TECH: tap → clip opens at 1:24
    Note over AI,TECH: No matching tip → "no senior tip yet". The AI never guesses.
```

### 3.3 Manual breakdown report → resolved (FR-TK-01..03)

```mermaid
sequenceDiagram
    autonumber
    participant OP as Operator (app)
    participant API as LinguaLink API
    participant SUP as Supervisor (web)
    participant TECH as Technician (app)

    OP->>API: report problem (machine, category, voice / photo)
    API->>API: ticket REPORTED · machine "Needs repair" · text auto-translated
    API-->>SUP: new report on the dashboard
    SUP->>API: assign technician
    API-->>TECH: push notification in the technician's language
    TECH->>TECH: Ask a senior (pre-filled machine + problem) · open manual
    TECH->>API: start → IN_PROGRESS
    TECH->>API: resolve (root cause, parts used)
    API->>API: RESOLVED · machine history updated
    Note over API: The fix appears under "Done" in the next AI shift summary
```

### 3.4 Targeted HR announcement → acknowledge (FR-HR-01..04, nice-to-have)

```mermaid
sequenceDiagram
    autonumber
    participant HR as HR Admin (web)
    participant API as LinguaLink API
    participant EMP as Employees (app)

    HR->>API: compose once · target Shift B & C · require ack
    API->>API: translate into each reader's language
    API-->>EMP: push + Home callout, in their language
    EMP->>API: tap "Acknowledge (รับทราบประกาศ)"
    API-->>HR: live progress (e.g. 198 / 208)
```

---

## 4. How the demo app maps to this

The demo (`npx expo start`) runs a small backend in its API routes (`src/app/api/*`). The web dashboard and the phone poll `/api/state` every 1.5 s.

- **Store** (`src/demo/server/store.ts`): the demo state. When `MONGODB_URI` is set, it is loaded from and saved to MongoDB on every request (`src/demo/server/db.ts`):
  - collection `state`: one document, with a version check so two servers or judges can't overwrite each other;
  - collection `messages`: the shift chat;
  - collection `usage`: the daily AI-call counter.

  Without `MONGODB_URI` it stays in memory.
- **AI** (`src/demo/server/ai.ts`, server only): Gemini API (`gemini-3.8-flash` by default, `GEMINI_MODEL` to change; JSON output) for:
  - translating free-typed chat into TH/EN/MY/KM/LO/JA and flagging *Watch out* messages;
  - writing the shift handover from the real checklist, chat and jobs;
  - answering *Ask a senior* questions (`/api/ask`) only from cited senior-tip moments. Cites that don't exist are dropped.
- **Fallback:** with no `GEMINI_API_KEY`, no internet or the daily cap reached, the scripted demo AI is used:
  - handover lists built from the checklist and chat;
  - a keyword matcher over `src/demo/mock/knowledge.ts`;
  - pre-written translations in `src/demo/mock/*` and `src/demo/i18n*.ts`.
- **Machine live** is a beta feature. It opens from the dashboard's *Machine live · Beta* button (`src/components/demo/machine-live.tsx`).

Setup: `docs/demo/AI-SETUP.md`.
