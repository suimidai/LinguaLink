import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { ANNOUNCEMENT_PRESETS, ANNOUNCEMENT_TARGETS } from '@/demo/mock/announcements';

import { Body, Button, Card, Chip, Label, Muted, ProgressBar, timeAgo } from './ui';

/** Dashboard card: latest announcements with acknowledgement progress, plus a quick send. */
export function AnnouncementsCard() {
  const { state, act } = useDemo();
  const [presetId, setPresetId] = useState(ANNOUNCEMENT_PRESETS[0].id);
  const [target, setTarget] = useState(ANNOUNCEMENT_TARGETS[0].id);
  const [sending, setSending] = useState(false);
  if (!state) return null;
  const recent = state.announcements.slice(0, 2);

  const send = async () => {
    setSending(true);
    try {
      await act({ type: 'announce', presetId, target, requireAck: true });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      {recent.length === 0 ? <Muted>Nothing sent yet. Send one below: every worker gets it in their own language.</Muted> : null}
      {recent.map((a) => {
        const p = ANNOUNCEMENT_PRESETS.find((x) => x.id === a.presetId);
        const pct = a.ackTotal ? a.ackCount / a.ackTotal : 0;
        return (
          <View key={a.id} style={s.item}>
            <View style={s.itemHead}>
              <Body style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>
                {p?.title.en}
              </Body>
              <Muted>{timeAgo(a.sentAt, state.now)}</Muted>
            </View>
            {a.requireAck ? (
              <>
                <View style={s.ackRow}>
                  <Text style={s.ack}>
                    {a.ackCount}
                    <Text style={s.ackTotal}> / {a.ackTotal}</Text>
                  </Text>
                  <Muted>acknowledged · {a.target}</Muted>
                </View>
                <ProgressBar value={pct} color={pct > 0.9 ? Brand.green : Brand.teal} />
              </>
            ) : (
              <Muted>{a.target} · no acknowledgement needed</Muted>
            )}
          </View>
        );
      })}

      <View style={s.divider} />
      <Label>Quick send</Label>
      <View style={s.chips}>
        {ANNOUNCEMENT_PRESETS.map((p) => (
          <Chip key={p.id} label={p.title.en} selected={presetId === p.id} onPress={() => setPresetId(p.id)} />
        ))}
      </View>
      <View style={s.chips}>
        {ANNOUNCEMENT_TARGETS.map((t) => (
          <Chip key={t.id} icon="group" label={`${t.label} · ${t.headcount}`} selected={target === t.id} onPress={() => setTarget(t.id)} />
        ))}
      </View>
      <View style={s.actions}>
        <Button small icon="send" label={sending ? 'Sending…' : 'Send'} disabled={sending} onPress={send} />
        <Button small variant="ghost" icon="arrowRight" label="Open announcements" onPress={() => router.push('/announcements')} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  item: { gap: 6 },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ackRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  ack: { fontFamily: Fonts?.mono, fontVariant: ['tabular-nums'], fontSize: 20, fontWeight: '700', color: Brand.ink },
  ackTotal: { fontSize: 13, color: Brand.sub },
  divider: { height: 1, backgroundColor: Brand.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
});
