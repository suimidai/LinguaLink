import { StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

import { Icon } from './icon';
import { JobBoard } from './jobs';
import { MachineCard } from './machine-card';
import { DemoControls, ReportsPanel } from './reports-panel';
import { HandoverCard } from './shift-chat';
import { Card, Label, Muted, Screen } from './ui';

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'red' | 'green' }) {
  const color = tone === 'red' ? Brand.redDark : tone === 'green' ? Brand.greenDark : Brand.ink;
  return (
    <View style={s.kpi}>
      <Label>{label}</Label>
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
    </View>
  );
}

function LiveBadge() {
  return (
    <View style={s.live}>
      <View style={s.liveDot} />
      <Text style={s.liveText}>LIVE</Text>
    </View>
  );
}

/** Big-screen web dashboard for engineers, supervisors and HR. */
export function Dashboard() {
  const { state } = useDemo();
  const machines = state?.machines ?? [];
  const running = machines.filter((m) => m.status === 'RUNNING').length;
  const reports = state?.jobs.filter((j) => j.stage === 'REPORTED').length ?? 0;
  const checked = state?.checklist.filter((c) => c.done).length ?? 0;
  const openJobs = state?.jobs.filter((j) => j.stage !== 'RESOLVED').length ?? 0;
  const groups = [...new Set(machines.map((m) => m.group))];

  return (
    <Screen eyebrow={`Siam Precision Industries · Main plant · Shift ${state?.shift ?? 'A'} active`} title="Factory overview" right={<LiveBadge />}>
      {/* One instrument strip instead of five floating KPI cards */}
      <Card style={s.kpis}>
        <Kpi label="Machines running" value={`${running}/${machines.length}`} tone={running === machines.length ? 'green' : 'red'} />
        <View style={s.divider} />
        <Kpi label="Open reports" value={String(reports)} tone={reports ? 'red' : 'green'} />
        <View style={s.divider} />
        <Kpi label="Open jobs" value={String(openJobs)} />
        <View style={s.divider} />
        <Kpi label={`Shift ${state?.shift ?? 'A'} checklist`} value={`${checked}/${state?.checklist.length ?? 0}`} />
        <View style={s.divider} />
        <Kpi label="On site" value="104" />
        <View style={s.divider} />
        <Kpi label="Senior tips" value={String(state?.knowledge.length ?? 0)} />
      </Card>

      <View style={s.main}>
        <View style={{ flex: 1.7, gap: 20 }}>
          {groups.map((g) => (
            <View key={g} style={{ gap: 10 }}>
              <Label icon="group" color={Brand.tealDark}>
                {g}
              </Label>
              <View style={s.machines}>
                {machines
                  .filter((m) => m.group === g)
                  .map((m) => (
                    <MachineCard key={m.id} machine={m} />
                  ))}
              </View>
            </View>
          ))}
          <View style={s.note}>
            <Icon name="eye" size={15} color={Brand.sub} />
            <Muted style={{ flex: 1 }}>Machine status is set by people: an operator reports a problem, a technician fixes it. No remote control, for safety.</Muted>
          </View>
        </View>
        <View style={{ flex: 1, gap: 12, minWidth: 340 }}>
          <Label icon="chat" color={Brand.tealDark}>
            Shift handover
          </Label>
          <HandoverCard />
          <Label icon="report" color={Brand.tealDark}>
            Problem reports
          </Label>
          <ReportsPanel />
          <DemoControls />
        </View>
      </View>

      <Label icon="jobs" color={Brand.tealDark}>
        Repair jobs
      </Label>
      <JobBoard limit={4} />
    </Screen>
  );
}

const s = StyleSheet.create({
  kpis: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 0, paddingVertical: 14 },
  kpi: { flex: 1, minWidth: 130, gap: 4, paddingHorizontal: 12 },
  kpiValue: { fontFamily: Fonts?.mono, fontVariant: ['tabular-nums'], fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  divider: { width: 1, backgroundColor: Brand.border },
  main: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  machines: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  live: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#BFE7D4', backgroundColor: Brand.greenBg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.green },
  liveText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, color: Brand.greenDark },
});
