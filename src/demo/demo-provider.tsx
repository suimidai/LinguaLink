import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { translate, type TFunction } from './i18n';
import type { DemoAction, DemoState, Lang } from './types';

const POLL_MS = 1500;

/** Who is using this device (a judge or visitor who typed their name). Saved in this browser only. */
export interface Me {
  id: string;
  name: string;
  lang: Lang;
}

const ME_KEY = 'lingualink.me';

function loadMe(): Me | null {
  try {
    if (typeof localStorage === 'undefined') return null; // phones in Expo Go: asked once per launch
    const v = JSON.parse(localStorage.getItem(ME_KEY) ?? 'null') as Me | null;
    return v && typeof v.id === 'string' && typeof v.name === 'string' ? v : null;
  } catch {
    return null;
  }
}

function saveMe(me: Me) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(ME_KEY, JSON.stringify(me));
  } catch {
    // Private mode / storage blocked: the name still works until the page is closed.
  }
}

const newUserId = () => `u-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

interface DemoContextValue {
  state: DemoState | null;
  error: string | null;
  act: (action: DemoAction) => Promise<void>;
  /** Language chosen on this device (the phone user's language). */
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a UI key into this device's language. */
  t: TFunction;
  /** True while this device is waiting for the AI to rewrite the live shift summary. */
  summaryBusy: boolean;
  /** Let the AI read the shift's existing messages (translate, tick tasks, rewrite the summary). */
  catchUp: () => Promise<void>;
  /** This device's person, once they typed a name (null = ask). `meLoaded` is false until storage was read. */
  me: Me | null;
  meLoaded: boolean;
  join: (name: string, lang: Lang) => Promise<void>;
}

// Phones start in Thai; the web dashboard (engineers / HR) stays English.
// (Server rendering doesn't report 'web', so only real phones get Thai — keeps hydration consistent.)
const DEFAULT_LANG: Lang = Platform.OS === 'ios' || Platform.OS === 'android' ? 'th' : 'en';

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  const t = useCallback<TFunction>((key, params) => translate(lang, key, params), [lang]);
  const inFlight = useRef(false);
  const [summaryRuns, setSummaryRuns] = useState(0);
  const [me, setMe] = useState<Me | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setState((await res.json()) as DemoState);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cannot reach the demo server');
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [refresh]);

  // After a message or tick, ask the AI to rewrite the live summary (runs in the background).
  const refreshSummary = useCallback(async () => {
    setSummaryRuns((n) => n + 1);
    try {
      await fetch('/api/summary', { method: 'POST' });
      await refresh();
    } catch {
      // The next poll picks up whatever is there; the summary just stays as it was.
    } finally {
      setSummaryRuns((n) => n - 1);
    }
  }, [refresh]);

  const catchUp = useCallback(async () => {
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catchUp: true }),
      });
      if (res.ok && ((await res.json()) as { translated?: number }).translated) await refresh();
    } catch {
      // Nothing to catch up, or the AI is unavailable: the summary below still refreshes.
    }
    await refreshSummary();
  }, [refresh, refreshSummary]);

  const act = useCallback(async (action: DemoAction) => {
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setState((await res.json()) as DemoState);
      setError(null);
      if (action.type === 'chat' && !action.presetId) {
        // The message is already visible; translate it, then update the live summary.
        void (async () => {
          try {
            await fetch('/api/translate', { method: 'POST' });
            await refresh();
          } catch {
            // It stays "not translated"; the summary still updates.
          }
          await refreshSummary();
        })();
      } else if (action.type === 'chat' || action.type === 'check') void refreshSummary();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  }, [refresh, refreshSummary]);

  // Read the saved name after the first render (the server render can't see browser storage).
  useEffect(() => {
    const id = setTimeout(() => {
      const saved = loadMe();
      if (saved) {
        setMe(saved);
        setLang(saved.lang);
      }
      setMeLoaded(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const join = useCallback(
    async (name: string, l: Lang) => {
      const next: Me = { id: me?.id ?? newUserId(), name: name.trim().slice(0, 24), lang: l };
      setMe(next);
      saveMe(next);
      setLang(l);
      await act({ type: 'join', userId: next.id, name: next.name, lang: l });
    },
    [me, act],
  );

  // After "Reset demo" (or a new database) this person isn't on the server any more: add them back.
  const rejoinedAt = useRef(0);
  const missing = !!(me && state && !state.people.some((p) => p.id === me.id));
  useEffect(() => {
    if (!missing || !me || Date.now() - rejoinedAt.current < 5000) return;
    rejoinedAt.current = Date.now();
    void act({ type: 'join', userId: me.id, name: me.name, lang: me.lang });
  }, [missing, me, act]);

  return (
    <DemoContext.Provider value={{ state, error, act, lang, setLang, t, summaryBusy: summaryRuns > 0, catchUp, me, meLoaded, join }}>{children}</DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}
