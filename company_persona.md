# Company persona: Siam Precision Industries Co., Ltd.

LinguaLink is designed for this company. It is a **fictional company** from the course: Session 8 "Business Context", page 3 (Canva design `DAHVeORwElA`, https://canva.link/xyww8nha3jt9rmo).

## From the course (given facts)

| | |
|---|---|
| **Name** | Siam Precision Industries Co., Ltd. (fictional) |
| **Size** | ~**250 employees**, including **3 Japanese expatriates** |
| **Business** | Metal processing and machine parts |
| **Position in the supply chain** | **Tier 2 supplier** |
| **Location** | Chonburi, Thailand (Eastern Seaboard) |
| **Owner** | A **Japanese parent company**: a mid-sized manufacturer with ~600 employees |
| **Customers** | Japanese automotive manufacturers and electrical equipment manufacturers |

### The company's two problems

1. **Skills are leaving.** Skilled workers retire, and young people are not drawn to manufacturing.
2. **Labour is getting more expensive.** Costs rise each year, and adding more people is becoming unsustainable.

## How LinguaLink answers them

| Problem | LinguaLink feature |
|---|---|
| Skills are leaving | **B. Senior Knowledge Base & AI Skill Transfer**: seniors record tips before they retire, and anyone can ask a question and get the exact moment in the clip. |
| Skills are leaving | **G. Translated Manuals / SOPs**: Japanese OEM manuals in every worker's language, so new staff learn faster. |
| Labour is getting more expensive | **A. Smart Group Chat & AI Shift Handover**: fewer missed handovers and less time lost at each shift change, without hiring more supervisors. |
| Labour is getting more expensive | **D. Breakdown Reporting** and **E. Spare Parts**: faster repairs and pickups, so less downtime per person. |
| A mixed-language workforce with 3 Japanese managers | Auto-translation everywhere (TH, EN, MY, KM, LO, JA), plus **F. Multilingual Announcements**. |

## Our planning assumptions (not from the course: check with the team)

These turn "~250 employees" into the numbers used for sizing and cost. They live in `docs/pitch-diagram/deployment-and-scale/src/model.js`. Change them there, and every diagram and the cost sheet update.

| Assumption | Value | Why |
|---|---|---|
| Office staff (day shift) | 31 | Management, HR, admin, purchasing, QA office, engineers, including the 3 Japanese expatriates |
| Shop-floor staff | 219 | 250 − 31 |
| Shifts | 3 (A, B, C) | From the PRD |
| People on the floor per shift | ~73 | 219 ÷ 3 |
| Production lines (shift chats) | 4 | ~18 people per line chat |
| Technicians | 24 (8 per shift) | |
| Senior technicians close to retiring | 8 | The people whose know-how we must capture |
| Machines | 60 | CNC lathes, machining centres, presses |
| Machine models with OEM manuals | 25 | Many machines share a model |
| Workforce languages | Thai, Myanmar, Khmer, Lao + Japanese managers + English | From the PRD. The course doesn't give nationalities. |
| Peak users online | 177 | At shift change, two shifts overlap, plus the office |

## What this means for the system

- **Small scale:** 250 accounts and ~177 people online at the busiest moment. One Sakura server (API + AI worker) and one PostgreSQL database are enough.
- **Running cost:** about **฿15,300 a month** at month 12 (≈ ฿184k a year) at the Session 10 example prices, plus ≈ ฿5,500 once to translate the existing manuals. See `docs/pitch-diagram/deployment-and-scale/lingualink-99-cost-sheet.png`.
- **The biggest cost is translating shift chat** (about 74% of the AI and speech-to-text cost). Ask Sakura about pricing per token.

## Note: the PRD's sample numbers don't match this size

The PRD (`product_requirements_document_prd-2.md`) uses **"142 On-Site"** (hero card) and **"135 / 142 acknowledged"** (announcements) as sample numbers. For a 250-person plant with 3 shifts, about **73 + 31 office ≈ 104 people** are on site during a shift. Consider changing those samples (and the demo app's mock data) to match.
