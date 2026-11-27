# Turning on the real AI and the chat database

Without this setup, the demo still runs with its scripted AI. With it:
- the **shift chat is saved in MongoDB**, so every judge sees the same chat and it survives a restart;
- **Gemini** translates anything typed, spots *Watch out* messages, writes the shift handover, and answers *Ask a senior* questions from the senior tips.

You need two things: a **MongoDB Atlas** database (free) and a **Gemini API key** (free tier is enough to start).

## 1. MongoDB Atlas (free)
1. Go to https://www.mongodb.com/cloud/atlas and sign up.
2. Create a cluster and choose the **Free (M0)** plan. Pick a region near Thailand, e.g. *Singapore*.
3. **Database Access → Add new database user.** Make a username (e.g. `lingualink`) and a password. Write down the password.
4. **Network Access → Add IP address → Allow access from anywhere** (`0.0.0.0/0`). This is needed so the online version can connect. It's fine for a demo.
5. **Database → Connect → Drivers.** Copy the connection string. It looks like
   `mongodb+srv://lingualink:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   Then replace `<password>` with your real password.

The app creates its own collections the first time it runs:
- `messages`: the chat;
- `state`: checklist, shift, handovers and jobs;
- `usage`: the AI-call counter.

## 2. Gemini API key (free to start)
1. Go to **https://aistudio.google.com/apikey** and sign in with a Google account.
2. Click **Create API key**. If it asks, let it create a new Google Cloud project.
3. Copy the key. Don't paste it in any chat.

**Free tier:** the app uses two models, both free on the free tier: `gemini-3.5-flash-lite` (fast) translates chat messages and ticks the checklist, and `gemini-3.8-flash` (smarter) writes summaries and answers *Ask a senior*. No card is needed. Two catches:
- Google may use free-tier requests to improve its products. That's fine for this demo, which has mock factory data only, but don't type real company secrets.
- The free tier has request limits per minute and per day. If a busy judge session hits them, the terminal shows `[ai] Gemini rate limit`, and the scripted AI takes over until the limit resets.

**Each chat message uses 2 AI calls:** one to translate it and one to update the live summary. Several quick messages in a row share one summary update.

**If you add billing for higher limits:** prices for `gemini-3.8-flash` per 1M tokens are US$0.75 in / US$3.75 out (doubling from Jan 2027). That works out to well under 1 US cent per message. The app also stops calling Gemini after **1,500 calls a day** (`AI_DAILY_CAP`).

## 3. Put both in the app
In the `lingualink` folder, copy `.env.example` to **`.env.local`** and fill it in:
```
GEMINI_API_KEY=your-gemini-key
MONGODB_URI=mongodb+srv://lingualink:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
`.env.local` is never committed to git, so the keys stay on your laptop. Restart `npx expo start` after changing it.

## 4. Check it works
- Type a message in **Shift chat** in Thai, then switch the language to LO or JA. It should show *Translating…* first, then appear translated.
- Open the same page in a second browser window. You should see the same chat.
- Ask **"the guard bolt on the press keeps spinning, it won't tighten"** in *Ask a senior*. You should get an answer tagged **Gemini**, with a ▶ link to Prasert's clip.

If something is wrong, the terminal running `npx expo start` shows lines starting with `[ai]` or `[db]`:

| Message | What to do |
|---|---|
| `GEMINI_API_KEY is invalid` | Copy the key again. |
| `Gemini error 404` | The model name changed. Set `GEMINI_MODEL=` in `.env.local` to a current Flash model from aistudio.google.com/docs/models. |
| `busy (503 / timeout), trying the next model…` | Google's servers are busy. The app switches to the other model and skips the busy one for a minute. If both fail, that message gets the scripted answer. Nothing to do. |
| `MongoDB unavailable` | Check the password in the connection string and that Network Access allows your IP. |
| `daily AI cap reached` | Raise `AI_DAILY_CAP`, or wait until tomorrow. |

## 5. Online link for judges
To be done next, after the laptop version works with your keys. The keys will then be stored on the hosting service as secrets, not in the code.
