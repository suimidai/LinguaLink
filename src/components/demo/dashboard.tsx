import { StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

import { AnnouncementsCard } from './announcements-card';
import { JobBoard } from './jobs';
import { ReportProblemButton } from './report-problem';
import { MachineLiveButton } from './machine-live';
import { DemoControls, ReportsPanel } from './reports-panel';
import { HandoverCard } from './shift-chat';
import { Card, Label, Screen } from './ui';

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'red' | 'green' }) {
  const color = tone === 'red' ? Brand.redDark : tone === 'green' ? Brand.greenDark : Brand.ink;
  return (
    <View style={s.kpi}>
      <Label>{label}</Label>
      <Text style={[s.kpiValue, { color }]}>{value}</Text>
    </View>
  );
}

/** Big-screen web dashboard for engineers, supervisors and HR. Machine Live (beta) opens in a pop-up. */
export function Dashboard() {
  const { state } = useDemo();
  const reports = state?.jobs.filter((j) => j.stage === 'REPORTED').length ?? 0;
  const checked = state?.checklist.filter((c) => c.done).length ?? 0;
  const openJobs = state?.jobs.filter((j) => j.stage !== 'RESOLVED').length ?? 0;

  return (
    <Screen eyebrow={`Siam Precision Industries · Main plant · Shift ${state?.shift ?? 'A'} active`} title="Factory overview" right={<MachineLiveButton />}>
      <Card style={s.kpis}>
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
        <View style={{ flex: 1.4, gap: 12 }}>
          <Label icon="chat" color={Brand.tealDark}>
            Shift handover
          </Label>
          <HandoverCard />
          <Label icon="jobs" color={Brand.tealDark}>
            Repair jobs
          </Label>
          <JobBoard limit={4} />
          <Label icon="announce" color={Brand.tealDark}>
            Announcements
          </Label>
          <AnnouncementsCard />
        </View>
        <View style={{ flex: 1, gap: 12, minWidth: 340 }}>
          <View style={s.labelRow}>
            <Label icon="report" color={Brand.tealDark}>
              Problem reports
            </Label>
            <ReportProblemButton small />
          </View>
          <ReportsPanel />
          <DemoControls />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  kpis: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'stretch', gap: 0, paddingVertical: 14 },
  kpi: { flex: 1, minWidth: 130, gap: 4, paddingHorizontal: 12 },
  kpiValue: { fontFamily: Fonts?.mono, fontVariant: ['tabular-nums'], fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  divider: { width: 1, backgroundColor: Brand.border },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  main: { flexDirection: 'row', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' },
});
