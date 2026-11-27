# LinguaLink demo: how to run it and what to show

The laptop runs a small demo server, and the web dashboard and the phone both talk to it live.

- **With keys** (`.env.local`, see [AI-SETUP.md](AI-SETUP.md)): the shift chat is saved in **MongoDB**, and **Gemini** translates anything typed, spots *Watch out* messages, writes the handover and answers any *Ask a senior* question from the senior tips. Judges can really play with it.
- **Without keys or internet:** everything still works with the scripted demo AI, as before. Nothing breaks on stage.

## 1. Start it (laptop)
```bash
cd lingualink
npx expo start
```
- **Web dashboard:** press `w` (or open http://localhost:8081). Use a wide window (≥ 900 px) to get the sidebar dashboard.
- **Phone:** install **Expo Go**, put the phone on the **same Wi-Fi as the laptop**, and scan the QR code shown in the terminal.
  - Allow notifications when asked.
  - If the phone says "Can't reach the demo server", check the Wi-Fi, or start with `npx expo start --tunnel`.

The phone is **Somchai, Technician** (Thai by default; change it on **Home → App language**). The web is used by **Engineer Kenji** (English; the language buttons on *Shift handover* and *Knowledge base* switch it, e.g. to Japanese).

The story matches the pitch diagram: **Mya (Shift A, Myanmar)** hands over to **Noy (Shift B, Lao)**, and the loose **Press-02 guard bolt** is the thing to watch out for.

## 2. Demo script (~2½ minutes)
1. **Phone → Shift chat.** Shift A's chat is already there in Myanmar, Khmer and Japanese, but the phone reads it all in **Thai**. Tap **Show original** under Mya's voice note to show the Myanmar text.
2. **Phone: tick the checklist** ("5S sweep around Line 2"). The tick appears on the **web → Shift handover** at once, with Somchai's name.
3. **Phone: leave notes.** Tap **📷 Photo** (cracked robot-arm sensor, flagged *Watch out*) or a quick note. The web shows it **in English**. Switch the web to **JA** to show Kenji reading it in Japanese.
4. **Web: End shift & summarize.** After "AI is summarizing…" the **AI shift summary** is pinned at the top: **Done / Still to do / Watch out**, built from the real ticks and notes. The phone gets a notification and shows the same summary **in Thai** (switch the phone to **LO** to show what Noy sees).
5. **An operator reports a problem.** Press **Simulate report (Noy, Press-02)** in *Demo controls*, or open **Machine live · Beta** (top right of the dashboard) and press **Report problem** on a machine card. (A random report also arrives every 1–2 minutes.) Machine 02 turns red, and the report shows Noy's words auto-translated.
6. **Supervisor assigns**: pick **Somchai 📱** → **Assign repair job**. **The phone pops up a notification.**
7. **Phone → Jobs → Ask a senior.** The question "Press-02 bolt is stripped, how do I fix it?" is asked for you. The AI answers in steps, each with a link like **▶ Prasert · 1:24**. Tap it: the clip opens **at 1:24** with the transcript.
8. **Phone → Jobs:** **Start repair** → choose the root cause and parts → **Mark as fixed**. Machine 02 turns green in *Machine live*. (End the shift again and the fix shows up under *Done*.)
9. **Web → Knowledge base → Add knowledge**: a senior "uploads" a tip. It shows *Transcribing & translating…*, then joins the library.
10. **Nice-to-have, if there's time:** **Announcements** (send "Flu vaccine drive", acknowledge on the phone) and **Manuals** (web sidebar → *Manuals*, or **Open manual** on the Press-02 job, which opens it in a pop-up). The first one is a downloaded PDF, `HP-200_取扱説明書_JA.pdf`: it opens in Japanese, a scan line shows "AI is translating page…", then the same pages (layout, figures, tables, torque values) appear in the reader's language. Tap **TH / EN / MY / KM / LO** to translate it again, or **Original** to see the Japanese.

### Let the judges play (needs keys)
- **Everyone types their name first.** On first open, each person enters a name and picks a language. The name is remembered on that device (browser), shows in chat and on checklist ticks, and comes back after *Reset demo*. *Change name* is under the app language (phone) or at the bottom of the sidebar (computer).
- **10 checklist tasks per shift**, so a group can split them up: "I cleaned the nozzle on 03", "fire extinguisher tags checked" and so on.
- **Give work by chatting:** "next shift must replace the Press-02 drive belt" → the AI adds a task for the next shift. "Can someone check the robot gripper on 04 today?" → a task for now. An AI line in the chat says what it did.
- **Report a problem by chatting:** "Machine 03 is leaking oil, I stopped it" (any language) → the AI opens a repair report on the dashboard, in everyone's language.
- **Upload a manual:** *Manuals → Upload a manual* (web). Pick a PDF, a Word (.docx) file, or several photos of paper pages (max 20 pages, 8 MB). The AI reads it in a few seconds, then anyone can switch it to their language: the first person to pick a language waits a few seconds, after that it's instant for everyone. **Download PDF** opens a clean printable page in that language (the browser saves it as PDF); **Original file** downloads what was uploaded. *Reset demo* removes uploaded manuals.
- **Report a problem button:** phone *Home* or *Jobs*, or dashboard *Problem reports*. Pick a machine, tap a common problem or describe it in your own words.
- **Type anything in the shift chat, in any language** (e.g. Thai "เครื่อง 03 มีเสียงดังแปลกๆ"). After *Translating…* everyone reads it in their own language. Tap **Show original** to see what was typed.
- **Type a warning** without pressing *Watch out* (e.g. "Press-02 guard bolt still loose, don't run it"). Gemini tags it **Watch out · AI flagged**.
- **Finish a task by chatting:** type e.g. "ล้างไส้กรองเครื่อง 01 แล้ว" ("cleaned the filter on 01"). The AI ticks *Clean coolant filter, Machine 01* in the checklist for you, marked **via chat (AI)**, and it moves from To do to Done.
- **Watch the live summary** at the top of Shift chat. After every message or checklist tick, the AI rewrites **Done / To do / Watch out** for the shift so far ("AI updating…" while it works). Everyone sees the same live to-do list, in their own language.
- **End shift & summarize:** Gemini writes Done / Still to do / Watch out from what the judges really typed and ticked, in all six languages.
- **Ask a senior any question** (e.g. "the guard bolt on the press keeps spinning, it won't tighten"). Gemini answers only from the senior tips, with ▶ links to the exact second. An unrelated question ("how do I bake bread?") gets "no senior tip covers this", because it never guesses. The suggested question chips stay scripted, so they're instant.
- **Machine live is Beta:** it's behind the **Machine live · Beta** button on the dashboard. A red dot on the button means a machine has an open problem.

Random phone notifications (spare parts ready, shift reminder, training, payslip) arrive every 20–40 s, so the phone feels alive.

**Reset** before the real pitch and between judge groups: *Dashboard → Demo controls → Reset demo* (laptop-size window). With MongoDB, restarting `npx expo start` does **not** reset the demo, because the data is kept in the database. Without MongoDB, a restart also resets it.

## 3. Tips
- Notifications pop up while the app is **open**. That's normal for this demo (local notifications in Expo Go).
- Keep the laptop awake and on the same network as the phone.
- **Without keys:** free-typed chat messages are shown as typed (only the ready-made phrases are translated), and the knowledge-base box only understands questions about the bolt, the spindle noise or Machine 03 running hot.
- **With keys:** Gemini takes a few seconds per message ("Translating…"). If the internet drops, messages are still saved, just not translated.
- **Reset demo** also clears the chat in MongoDB, so every judge group starts fresh.
