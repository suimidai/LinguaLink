import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { jobTitle } from '@/demo/localize';
import { personName } from '@/demo/mock/people';
import type { Machine } from '@/demo/types';

import { Button, Card, Muted, STATUS_STYLE, Tag } from './ui';

/** Machine status is set by people (reports, repairs). No live AI telemetry in v2. */
export function MachineCard({ machine }: { machine: Machine }) {
  const { state, act, t, lang } = useDemo();
  const st = STATUS_STYLE[machine.status];
  const critical = machine.status === 'CRITICAL';
  const job = state?.jobs.find((j) => j.machineId === machine.id && j.stage !== 'RESOLVED');
  return (
    <Card tone={critical ? 'danger' : 'default'} style={[s.card, !critical && { borderLeftWidth: 4, borderLeftColor: machine.status === 'MAINTENANCE' ? Brand.slate : Brand.green }]}>
      <View style={s.top}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.label}>{machine.label}</Text>
          <Text style={s.code}>
            {machine.code} · {machine.type}
          </Text>
        </View>
        <Tag label={st.label} color={st.color} icon={critical ? 'warning' : undefined} />
      </View>
      {job && state ? (
        <Muted>
          {jobTitle(job, t, lang)} · reported by {personName(state.people, job.reportedBy)}
          {job.assigneeId ? ` · ${personName(state.people, job.assigneeId)} on it` : ''}
        </Muted>
      ) : (
        <Muted>No open problems.</Muted>
      )}
      {machine.status === 'RUNNING' ? (
        <Button small variant="ghost" icon="report" label="Report problem" onPress={() => act({ type: 'report', machineId: machine.id })} style={{ alignSelf: 'flex-start' }} />
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flex: 1, minWidth: 240 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  label: { fontSize: 17, fontWeight: '800', color: Brand.ink, letterSpacing: -0.2 },
  code: { fontSize: 12, color: Brand.sub, letterSpacing: 0.3 },
});
