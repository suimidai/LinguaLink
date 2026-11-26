import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { machineName } from '@/demo/i18n';
import { jobReport, jobTitle, localizeNotification } from '@/demo/localize';
import { ANNOUNCEMENT_PRESETS } from '@/demo/mock/announcements';
import type { NotificationKind } from '@/demo/types';

import { Icon, type IconName } from './icon';
import { MonthCalendar } from './month-calendar';
import { HandoverCard } from './shift-chat';
import { Body, Button, Card, H2, Label, LangPicker, Muted, Screen, Tag, timeAgo } from './ui';

export const KIND_ICON: Record<NotificationKind, IconName> = {
  JOB: 'jobs',
  HR: 'announce',
  PARTS: 'parts',
  SHIFT: 'clock',
  TRAINING: 'training',
};

/** Phone home screen for a technician on the shop floor. Every text follows the chosen language. */
export function PhoneHome() {
  const { state, lang, setLang, act, t } = useDemo();
  const me = state?.people.find((p) => p.id === state.phoneUserId);
  const myJob = state?.jobs.find((j) => j.assigneeId === state.phoneUserId && j.stage !== 'RESOLVED');
  const jobMachine = state?.machines.find((m) => m.id === myJob?.machineId);
  const unacked = state?.announcements.find((a) => a.requireAck && !a.phoneAcked);
  const unackedPreset = ANNOUNCEMENT_PRESETS.find((p) => p.id === unacked?.presetId);
  const partsReady = state?.notifications.filter((n) => n.kind === 'PARTS').length ?? 0;

  return (
    <Screen eyebrow={`${t('role.tech')} · ${t('mainPlant')}`} title={t('hello', { name: me?.name ?? '' })}>
      {myJob ? (
        <Card tone={myJob.stage === 'ASSIGNED' ? 'danger' : 'warning'}>
          <Tag label={myJob.stage === 'ASSIGNED' ? t('newJob') : t('inProgress')} color={myJob.stage === 'ASSIGNED' ? Brand.redDark : '#9A6700'} icon="jobs" />
          <H2>
            {machineName(t, jobMachine?.label)}: {jobTitle(myJob, t)}
          </H2>
          <Body style={{ fontSize: 14 }}>“{jobReport(myJob, t)}”</Body>
          <Button icon="arrowRight" label={t('openJob')} variant={myJob.stage === 'ASSIGNED' ? 'danger' : 'primary'} onPress={() => router.push('/jobs')} />
        </Card>
      ) : null}

      <HandoverCard />

      {unacked && unackedPreset ? (
        <Card tone="accent">
          <Tag label={t('hrNotice')} color={Brand.tealDark} icon="announce" />
          <H2>{unackedPreset.title[lang]}</H2>
          <Body>{unackedPreset.body[lang]}</Body>
          <Button icon="check" label={t('acknowledge')} onPress={() => act({ type: 'ack', announcementId: unacked.id })} />
        </Card>
      ) : null}

      <View style={s.tiles}>
        <Card style={s.tile}>
          <View style={s.tileHead}>
            <Icon name="parts" size={20} color={Brand.tealDark} />
            {partsReady ? (
              <View style={s.count}>
                <Text style={s.countText}>{partsReady}</Text>
              </View>
            ) : null}
          </View>
          <Body style={{ fontWeight: '700' }}>{t('spareParts')}</Body>
          <Muted>{partsReady ? t('partsReady') : t('noneWaiting')}</Muted>
        </Card>
        <Pressable style={{ flex: 1 }} onPress={() => router.push('/knowledge')}>
          <Card style={s.tile}>
            <Icon name="bulb" size={20} color={Brand.tealDark} />
            <Body style={{ fontWeight: '700' }}>{t('askSenior')}</Body>
            <Muted>{t('askSeniorSub')}</Muted>
          </Card>
        </Pressable>
      </View>

      <Card>
        <Label icon="globe">{t('appLanguage')}</Label>
        <LangPicker value={lang} onChange={setLang} />
      </Card>

      <Label icon="calendar">{t('calendarTitle')}</Label>
      <MonthCalendar />

      <Label>{t('notifications')}</Label>
      {state?.notifications.length === 0 ? <Muted>{t('notifEmpty')}</Muted> : null}
      {state?.notifications.length ? (
        <View style={s.list}>
          {state.notifications.slice(0, 10).map((n, i) => {
            const txt = localizeNotification(n, state, lang, t);
            return (
              <View key={n.id} style={[s.notif, i > 0 && s.notifDivider]}>
                <View style={s.notifIcon}>
                  <Icon name={KIND_ICON[n.kind]} size={17} color={n.kind === 'JOB' ? Brand.redDark : Brand.tealDark} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Body style={{ fontWeight: '700' }}>{txt.title}</Body>
                  <Body style={{ fontSize: 14, color: Brand.sub }}>{txt.body}</Body>
                  <Muted>{timeAgo(n.createdAt, state.now, t)}</Muted>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, gap: 6 },
  tileHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { minWidth: 22, height: 22, borderRadius: 6, backgroundColor: Brand.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, fontVariant: ['tabular-nums'] },
  list: { backgroundColor: Brand.card, borderRadius: 10, borderWidth: 1, borderColor: Brand.border },
  notif: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 14 },
  notifDivider: { borderTopWidth: 1, borderTopColor: Brand.border },
  notifIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: Brand.mint, alignItems: 'center', justifyContent: 'center' },
});
