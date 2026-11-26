import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { translate, type TFunction } from './i18n';
import type { DemoAction, DemoState, Lang } from './types';

const POLL_MS = 1500;

interface DemoContextValue {
  state: DemoState | null;
  error: string | null;
  act: (action: DemoAction) => Promise<void>;
  /** Language chosen on this device (the phone user's language). */
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Translate a UI key into this device's language. */
  t: TFunction;
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  }, []);

  return (
    <DemoContext.Provider value={{ state, error, act, lang, setLang, t }}>{children}</DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside <DemoProvider>');
  return ctx;
}
