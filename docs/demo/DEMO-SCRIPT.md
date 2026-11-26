# LinguaLink demo: how to run it and what to show

All data is **mock data**, and all "AI" is **scripted**: there is no internet call, so it works on stage. The laptop runs a small demo server, and the web dashboard and the phone both talk to it live.

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
5. **An operator reports a problem.** Press **Simulate report (Noy, Press-02)** in *Demo controls*, or **Report problem** on a machine card. (A random report also arrives every 1–2 minutes.) Machine 02 turns red, and the report shows Noy's words auto-translated.
6. **Supervisor assigns**: pick **Somchai 📱** → **Assign repair job**. **The phone pops up a notification.**
7. **Phone → Jobs → Ask a senior.** The question "Press-02 bolt is stripped, how do I fix it?" is asked for you. The AI answers in steps, each with a link like **▶ Prasert · 1:24**. Tap it: the clip opens **at 1:24** with the transcript.
8. **Phone → Jobs:** **Start repair** → choose the root cause and parts → **Mark as fixed**. Machine 02 turns green on the web. (End the shift again and the fix shows up under *Done*.)
9. **Web → Knowledge base → Add knowledge**: a senior "uploads" a tip. It shows *Transcribing & translating…*, then joins the library.
10. **Nice-to-have, if there's time:** **Announcements** (send "Flu vaccine drive", acknowledge on the phone) and **Manuals** (inside *Knowledge*, or **Open manual** on the Press-02 job). The first one is a downloaded PDF, `HP-200_取扱説明書_JA.pdf`: it opens in Japanese, a scan line shows "AI is translating page…", then the same pages (layout, figures, tables, torque values) appear in the reader's language. Tap **TH / EN / MY / KM / LO** to translate it again, or **Original** to see the Japanese.

Random phone notifications (spare parts ready, shift reminder, training, payslip) arrive every 20–40 s, so the phone feels alive.

**Reset** before the real pitch: *Demo controls → Reset demo* (or restart `npx expo start`).

## 3. Tips
- Notifications pop up while the app is **open**. That's normal for this demo (local notifications in Expo Go).
- Keep the laptop awake and on the same network as the phone.
- Free-typed chat messages are shown as typed (the demo only translates the ready-made phrases). The knowledge-base box understands typed questions about the bolt, the spindle noise or Machine 03 running hot, in Thai, English or Japanese; anything else gets "no senior tip yet", because the AI never guesses.
