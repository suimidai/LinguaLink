# Pitch deck: notes to check later

Canva deck: **"IDEA & PROBLEM"** (https://www.canva.com/d/LvkD2EeUbxhmZmG)
Claude only works on the **diagram page** (Canva page id `PBmyw5l4S3BlBkKF`). Teammates keep moving pages: it was page 4, then 13, then 15, and now (2026-11-25) **page 19**. Find it by page id, not by number. Other pages are left untouched.

## Diagram (page 19): done 2026-11-25
- Still diagram (no animation) built from editable Canva shapes, C4 colours (green = person, blue = LinguaLink, red = external system).
- Current layout (saved 2026-11-25): **one feature in depth, "Smart Group Chat & AI Shift Handover"**, read from who to who:
  - FROM Operator Mya (Shift A, Myanmar) → LinguaLink, in 4 steps: 1 Tick & leave notes (checklist + voice / text / photo / spec file) → 2 AI translates (speech-to-text, auto-translation) → 3 AI shift summary (Done / Still to do / Watch out) → 4 Pinned banner → TO Operator Noy (Shift B, Lao). Noy's replies go back to Mya in Myanmar.
  - Steps 2 and 3 use SAKURA internet AI (an external system, inside Japan).
  - Bottom of the page: a worked example in 3 cards (Mya's checklist + voice note about the loose Press-02 guard bolt → AI summary → Noy's pinned banner in Lao, "Done 2 · To do 1 · Watch out 1").
  - The demo app uses the same example (done 2026-11-25: shift chat seeds Mya's voice note; Ask a senior answers with “▶ Prasert · 1:24”).
- Later on 2026-11-25 the user rearranged it themselves: Mya + Noy on top, LinguaLink box (steps 1 and 4) bottom left, SAKURA AI box (steps 2 and 3) on the right, plus a new yellow **Core System Server** box (chat & checklist, shift schedule, workers & accounts). Claude then added the connecting arrows, the server's inner cards and the legend entry. The worked-example cards are no longer on the page.
- Earlier versions, all replaced at the user's request: C4 system context, 4-row "from who to who" covering 4 features, and Senior Knowledge Base in depth. The scripts are in the session scratchpad only.
- The old Figma animation (`plantos-diagram.mp4/.png`) is outdated, so don't use it.

## Overview container diagram in the deck (page 13): done 2026-11-25
- The user asked for it on the blank page 13 (Canva page id `PBPRXJwkJ6QYW1H4`). It is a piece-by-piece copy of `container-diagrams/lingualink-container-00-overview.png`, built from editable Canva shapes, text and arrows using the same positions and colours. It uses Canva's default font.
- The generator script exists only in the session scratchpad (`ov.py`). It reads its positions from `container-diagrams/src/lib.js` (SLOT) and `diagrams.js` (00-overview).

## Container diagrams (C4 level 2): drawn 2026-11-25
- Folder `container-diagrams/`: 8 PNGs (3840×2160), styled after pages 24–29 of "Session9_Solution_Architecture" (DAHVeDJH49o). They aren't in the Canva deck yet.
  - `00-overview`: all 7 features (A–G) in one system. The API box lists the features.
  - `A`–`G`: one detailed diagram per feature. Numbered steps show the order things happen, and each one shows only the parts that feature uses.
- To edit: change `container-diagrams/src/diagrams.js`, then run `node diagrams.js <outDir>` (needs `@resvg/resvg-js`).
- "AI worker" and "pgvector" are my choices. The PRD only says "AI services" and "vector index", so check that the team agrees.

## Deployment + scale diagrams (for the cost estimate): drawn 2026-11-25
- Folder `deployment-and-scale/`: an overview, A–G and `99-cost-sheet` (PNG, 1920×1300 at 2× resolution), plus `lingualink-cost-model.csv` for a spreadsheet.
- Each diagram shows the path (factory → internet → Sakura cloud → server → endpoint gateway → AI Engine) and the monthly amounts, each with its reason.
- **All numbers come from `deployment-and-scale/src/model.js`.** Change an assumption there and run `node diagrams.js <outDir>` to update everything.
- Sized for the company persona (`company_persona.md`): Siam Precision Industries, **250 employees**.
- Result at Session 10 example prices: **≈ ฿15,300 a month at month 12** (≈ ฿184k a year), plus ≈ ฿5,500 once for translating the manuals.
- [ ] Check with the team: 31 office + 73 per shift × 3 = 250; 4 lines; 60 machines; 24 technicians; 8 seniors (assumptions).
- [ ] PRD/demo sample numbers "142 On-Site" and "135 / 142" don't fit a 250-person plant (≈ 104 on site per shift).
- [ ] Ask Sakura: AI Engine price per token (chat translation is ~74 % of AI cost), speech-to-text price (฿0.25/min is a placeholder), endpoint gateway price, and whether data out (~41 GB/month) is charged.

## Recommendations for teammates' pages (not applied, your call)

### Name: PlantOS → LinguaLink
- [ ] Page 15 (Timeline resources image): "12-Week **PlantOS** Timeline"
- [ ] Page 21 (Financial Feasibility): "To achieve a three-year payback period, **PlantOS** would need…"

### AI machine monitoring was removed (decided 2026-11-25)
- [ ] Page 7 (IDEA, old version): still lists **"AI Live Monitor & Smart Ticketing"**. Page 6 already shows the new features, so page 7 may be an old copy to delete.
- [ ] Page 9 (OUR SOLUTION): **Feature 4 "Smart Machine Monitoring"** (real-time monitoring, AI failure prediction). Replace it with Senior Knowledge Base & AI Skill Transfer, or remove it.
- [ ] Page 21 (ROI): "Reduced machine downtime through **earlier detection of abnormal operating conditions**" and "Better visibility into **machine operating conditions** and energy consumption" both describe the removed feature.

### Typos
- [ ] Page 6: "Multilingual **Annoucements**" → "**Announcements**"
- [ ] Page 7: "Multilingual **Annoucements**" → "**Announcements**"

### Translations in the demo app
- [ ] Ask native speakers to check the **Myanmar / Khmer / Lao** text (Thai and Japanese too if possible):
  - `src/demo/mock/announcements.ts`: HR announcements
  - `src/demo/mock/manuals.ts`: machine manuals
  - `src/demo/i18n.ts` and `src/demo/i18n-lingualink.ts`: the phone app's text, including the new shift-chat and knowledge-base phrases
  - `src/demo/mock/shift.ts`: shift checklists, chat messages, quick notes, AI summary lines
  - `src/demo/mock/knowledge.ts`: senior tips (transcripts), questions
