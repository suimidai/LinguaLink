import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { jobReport, jobTitle } from '@/demo/localize';
import { personName } from '@/demo/mock/people';
import { LANGS } from '@/demo/types';

import { Icon } from './icon';
import { Body, Button, Card, Chip, H2, Label, Muted, Tag, timeAgo } from './ui';

/** Problems reported by people on the floor. The supervisor assigns a technician. */
export function ReportsPanel() {
  const { state, act, t } = useDemo();
  const [picked, setPicked] = useState<Record<string, string>>({});
  if (!state) return null;

  const toAssign = state.jobs.filter((j) => j.stage === 'REPORTED');
  const technicians = state.people.filter((p) => p.role === 'TECHNICIAN');

  if (toAssign.length === 0) {
    return (
      <Card tone="success">
        <Tag label="No open reports" color={Brand.greenDark} icon="checkCircle" />
        <Muted>When an operator reports a machine problem from the phone, it shows up here to assign.</Muted>
      </Card>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {toAssign.map((j) => {
        const m = state.machines.find((x) => x.id === j.machineId);
        const reporter = state.people.find((p) => p.id === j.reportedBy);
        const chosen = picked[j.id] ?? state.phoneUserId;
        return (
          <Card key={j.id} tone="danger">
            <View style={s.head}>
              <Tag label={`Reported · ${m?.label}`} color={Brand.redDark} icon="report" />
              <Muted>{timeAgo(j.createdAt, state.now)}</Muted>
            </View>
            <H2>{jobTitle(j, t)}</H2>
            <View style={s.quote}>
              <Icon name="translate" size={14} color={Brand.tealDark} />
              <Body style={{ fontSize: 14, flex: 1 }}>
                “{jobReport(j, t)}” {reporter ? `· ${reporter.name} (${LANGS.find((l) => l.code === reporter.lang)?.label}, auto-translated)` : ''}
              </Body>
            </View>
            <Label>{m?.group}: assign a technician</Label>
            <View style={s.techs}>
              {technicians.map((p) => (
                <Chip
                  key={p.id}
                  icon={p.id === state.phoneUserId ? 'phone' : 'person'}
                  label={`${p.name} · ${LANGS.find((l) => l.code === p.lang)?.label}`}
                  selected={chosen === p.id}
                  onPress={() => setPicked((cur) => ({ ...cur, [j.id]: p.id }))}
                />
              ))}
            </View>
            <Button icon="arrowRight" label="Assign repair job" onPress={() => act({ type: 'assign', jobId: j.id, technicianId: chosen })} />
          </Card>
        );
      })}
    </View>
  );
}

export function DemoControls() {
  const { act, state } = useDemo();
  if (!state) return null;
  const busy = state.machines.some((m) => m.status !== 'RUNNING');
  const secs = Math.max(0, Math.round((state.nextReportAt - state.now) / 1000));
  return (
    <Card tone="sunken" style={{ borderStyle: 'dashed' }}>
      <Label>Demo controls · presenter only</Label>
      <View style={s.timer}>
        <Icon name="clock" size={14} color={Brand.sub} />
        <Muted>{busy ? 'A machine problem is open.' : `Next random operator report in ~${secs}s`}</Muted>
      </View>
      <View style={s.actions}>
        <Button
          small
          icon="report"
          label={`Simulate report (${personName(state.people, 'op-3')}, Press-02)`}
          variant="danger"
          disabled={busy}
          onPress={() => act({ type: 'report', machineId: 'm02', pb: 1, reporterId: 'op-3' })}
        />
        <Button small icon="reset" label="Reset demo" variant="ghost" onPress={() => act({ type: 'reset' })} />
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  quote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  actions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  techs: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  timer: { flexDirection: 'row', gap: 6, alignItems: 'center' },
});
