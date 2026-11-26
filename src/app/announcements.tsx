import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/demo/icon';
import { Body, Button, Card, Chip, H2, Label, Muted, ProgressBar, Screen, Tag, timeAgo, useIsWide } from '@/components/demo/ui';
import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { ANNOUNCEMENT_PRESETS, ANNOUNCEMENT_TARGETS } from '@/demo/mock/announcements';
import { LANGS } from '@/demo/types';

function Composer() {
  const { act } = useDemo();
  const [presetId, setPresetId] = useState(ANNOUNCEMENT_PRESETS[0].id);
  const [target, setTarget] = useState(ANNOUNCEMENT_TARGETS[1].id);
  const [requireAck, setRequireAck] = useState(true);
  const preset = ANNOUNCEMENT_PRESETS.find((p) => p.id === presetId)!;

  return (
    <Card style={{ flex: 1, minWidth: 360 }}>
      <H2>New announcement</H2>
      <Label>Message</Label>
      <View style={s.chips}>
        {ANNOUNCEMENT_PRESETS.map((p) => (
          <Chip key={p.id} label={p.title.en} selected={presetId === p.id} onPress={() => setPresetId(p.id)} />
        ))}
      </View>
      <View style={s.preview}>
        <Body style={{ fontWeight: '700' }}>{preset.title.en}</Body>
        <Body>{preset.body.en}</Body>
      </View>
      <Label>Send to</Label>
      <View style={s.chips}>
        {ANNOUNCEMENT_TARGETS.map((t) => (
          <Chip key={t.id} label={`${t.label} · ${t.headcount}`} selected={target === t.id} onPress={() => setTarget(t.id)} />
        ))}
      </View>
      <View style={s.chips}>
        <Chip icon={requireAck ? 'check' : undefined} label="Require acknowledgement" selected={requireAck} onPress={() => setRequireAck((v) => !v)} />
      </View>
      <View style={s.langNote}>
        <Icon name="globe" size={15} color={Brand.tealDark} />
        <Muted style={{ flex: 1 }}>Each worker receives it in their own language: {LANGS.map((l) => l.label).join(' · ')}</Muted>
      </View>
      <Button icon="send" label="Send announcement" onPress={() => act({ type: 'announce', presetId, target, requireAck })} />
    </Card>
  );
}

function SentList() {
  const { state } = useDemo();
  if (!state) return null;
  return (
    <View style={{ flex: 1, gap: 12, minWidth: 360 }}>
      <Label>Sent · acknowledgement progress</Label>
      {state.announcements.length === 0 ? (
        <Card tone="sunken">
          <Muted>Nothing sent yet.</Muted>
        </Card>
      ) : null}
      {state.announcements.map((a) => {
        const p = ANNOUNCEMENT_PRESETS.find((x) => x.id === a.presetId)!;
        const pct = a.ackTotal ? a.ackCount / a.ackTotal : 0;
        return (
          <Card key={a.id}>
            <View style={s.rowTop}>
              <H2 style={{ flex: 1, fontSize: 16 }}>{p.title.en}</H2>
              <Tag label={a.target} color={Brand.tealDark} icon="group" />
            </View>
            {a.requireAck ? (
              <>
                <View style={s.ackRow}>
                  <Text style={s.ack}>
                    {a.ackCount}
                    <Text style={s.ackTotal}> / {a.ackTotal}</Text>
                  </Text>
                  <Muted>acknowledged · {(pct * 100).toFixed(1)}%</Muted>
                </View>
                <ProgressBar value={pct} color={pct > 0.9 ? Brand.green : Brand.teal} />
                <View style={s.langNote}>
                  <Icon name={a.phoneAcked ? 'checkCircle' : 'phone'} size={14} color={a.phoneAcked ? Brand.greenDark : Brand.sub} />
                  <Muted>{a.phoneAcked ? 'Somchai (phone) acknowledged' : 'Waiting for Somchai (phone)…'}</Muted>
                </View>
              </>
            ) : (
              <Muted>No acknowledgement required</Muted>
            )}
            <Muted>Sent {timeAgo(a.sentAt, state.now)}</Muted>
          </Card>
        );
      })}
    </View>
  );
}

function Inbox() {
  const { state, lang, act, t } = useDemo();
  if (!state) return null;
  if (state.announcements.length === 0)
    return (
      <Card tone="sunken">
        <Muted>{t('noNotices')}</Muted>
      </Card>
    );
  return (
    <>
      {state.announcements.map((a) => {
        const p = ANNOUNCEMENT_PRESETS.find((x) => x.id === a.presetId)!;
        const pending = a.requireAck && !a.phoneAcked;
        return (
          <Card key={a.id} tone={pending ? 'accent' : 'default'}>
            <Tag label={`${t('hrNotice')} · ${timeAgo(a.sentAt, state.now, t)}`} color={Brand.tealDark} icon="announce" />
            <H2>{p.title[lang]}</H2>
            <Body>{p.body[lang]}</Body>
            {a.requireAck ? (
              a.phoneAcked ? (
                <Tag label={t('acknowledged')} color={Brand.greenDark} icon="checkCircle" />
              ) : (
                <Button icon="check" label={t('acknowledge')} onPress={() => act({ type: 'ack', announcementId: a.id })} />
              )
            ) : null}
          </Card>
        );
      })}
    </>
  );
}

export default function AnnouncementsScreen() {
  const wide = useIsWide();
  const { t } = useDemo();
  if (!wide) {
    return (
      <Screen eyebrow={t('hrMgmt')} title={t('noticesTitle')} subtitle={t('inYourLang')}>
        <Inbox />
      </Screen>
    );
  }
  return (
    <Screen eyebrow="HR & management" title="Announcements" subtitle="Send to everyone, a shift or a role. Auto-translated for every worker.">
      <View style={s.cols}>
        <Composer />
        <SentList />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  cols: { flexDirection: 'row', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preview: { backgroundColor: Brand.canvas, borderRadius: 8, borderWidth: 1, borderColor: Brand.border, padding: 12, gap: 4 },
  rowTop: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ackRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  ack: { fontFamily: Fonts?.mono, fontVariant: ['tabular-nums'], fontSize: 26, fontWeight: '700', color: Brand.ink },
  ackTotal: { fontSize: 16, color: Brand.sub },
  langNote: { flexDirection: 'row', gap: 6, alignItems: 'center' },
});
