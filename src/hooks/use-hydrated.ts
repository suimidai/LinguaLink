import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false during server rendering and the browser's first (hydration) render,
 * true afterwards. Use it to keep window-size-dependent UI identical to the
 * server HTML until hydration is done (avoids "Hydration failed" errors).
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
