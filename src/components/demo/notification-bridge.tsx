import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { useDemo } from '@/demo/demo-provider';
import { localizeNotification } from '@/demo/localize';

// Show banners even while the app is open (the demo runs in the foreground).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Turns new demo notifications from the server into real phone notifications
 * (local notifications — these work in Expo Go).
 */
export function NotificationBridge() {
  const { state, lang, t } = useDemo();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    (async () => {
      // No custom Android channel: in Expo Go (SDK 58) creating one crashes natively
      // (NullPointerException), and the default channel shows our local notifications fine.
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
    })().catch((e: unknown) => console.warn('Notification setup failed', e));
  }, []);

  const notifications = state?.notifications;
  useEffect(() => {
    if (!notifications) return;
    // First load: don't replay old notifications.
    if (!seen.current) {
      seen.current = new Set(notifications.map((n) => n.id));
      return;
    }
    const fresh = notifications.filter((n) => !seen.current!.has(n.id)).reverse();
    for (const n of fresh) {
      seen.current.add(n.id);
      const { title, body } = localizeNotification(n, state, lang, t);
      Notifications.scheduleNotificationAsync({
        content: { title, body, data: { jobId: n.jobId, announcementId: n.announcementId } },
        trigger: null,
      }).catch(() => {});
    }
  }, [notifications, state, lang, t]);

  return null;
}
