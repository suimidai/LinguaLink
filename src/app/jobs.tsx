import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/demo/icon';
import { JobBoard, JobRow, JobStepper } from '@/components/demo/jobs';
import { ManualModal } from '@/components/demo/manual-modal';
import { ReportProblemButton } from '@/components/demo/report-problem';
import { Body, Button, Card, Chip, H2, Label, Muted, Screen, useIsWide } from '@/components/demo/ui';
import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { machineName } from '@/demo/i18n';
import { jobReport, jobTitle } from '@/demo/localize';
import { PROBLEMS, SPARE_PARTS } from '@/demo/mock/machines';
import { personName } from '@/demo/mock/people';
import type { Job } from '@/demo/types';

function MyJob({ job }: { job: Job }) {
  const { state, act, t, lang } = useDemo();
  const [cause, setCause] = useState(job.rootCauseOptions[0]);
  const [parts, setParts] = useState<string[]>([SPARE_PARTS[0]]);
  const [manual, setManual] = useState<string | null>(null);
  const m = state?.machines.find((x) => x.id === job.machineId);

  return (
    <Card tone={job.stage === 'ASSIGNED' ? 'danger' : 'warning'}>
      <Label>
        {machineName(t, m?.label)} · {m ? t(m.typeKey) : ''} · {m?.code}
      </Label>
      <H2>{jobTitle(job, t, lang)}</H2>
      <JobStepper stage={job.stage} />
      <View style={s.diag}>
        <Icon name="translate" size={15} color={Brand.tealDark} />
        <Body style={{ fontSize: 14, flex: 1 }}>
          {t('reportedProblem')}: “{jobReport(job, t, lang)}” · {t('reportedBy', { name: personName(state?.people ?? [], job.reportedBy) })}
        </Body>
      </View>
      <View style={s.chips}>
        <Button
          small
          icon="bulb"
          label={t('askSenior')}
          onPress={() => router.push({ pathname: '/knowledge', params: { q: PROBLEMS[job.pb]?.ask } })}
        />
        {m?.manualIds[0] ? (
          <Button
            small
            variant="secondary"
            icon="manual"
            label={t('openManual')}
            onPress={() => setManual(m.manualIds[0])}
          />
        ) : null}
      </View>
      <ManualModal manualId={manual} onClose={() => setManual(null)} />

      {job.stage === 'ASSIGNED' ? (
        <Button icon="play" label={t('startRepair')} onPress={() => act({ type: 'start', jobId: job.id })} />
      ) : null}

      {job.stage === 'IN_PROGRESS' ? (
        <View style={{ gap: 10 }}>
          <Label>{t('rootCause')}</Label>
          <View style={s.chips}>
            {job.rootCauseOptions.map((c) => (
              <Chip key={c} label={t(c)} selected={cause === c} onPress={() => setCause(c)} />
            ))}
          </View>
          <Label>{t('partsUsed')}</Label>
          <View style={s.chips}>
            {SPARE_PARTS.map((p) => (
              <Chip
                key={p}
                label={t(p)}
                selected={parts.includes(p)}
                onPress={() => setParts((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]))}
              />
            ))}
          </View>
          <Button icon="check" label={t('markFixed')} onPress={() => act({ type: 'resolve', jobId: job.id, rootCause: cause, parts })} />
        </View>
      ) : null}
    </Card>
  );
}

export default function JobsScreen() {
  const { state, t } = useDemo();
  const wide = useIsWide();

  if (wide) {
    return (
      <Screen eyebrow="Maintenance" title="Repair jobs" subtitle="Every job from operator report to fixed, tracked live" right={<ReportProblemButton />}>
        <JobBoard />
      </Screen>
    );
  }

  const mine = state?.jobs.filter((j) => j.assigneeId === state.phoneUserId) ?? [];
  const active = mine.filter((j) => j.stage !== 'RESOLVED');
  const done = mine.filter((j) => j.stage === 'RESOLVED');

  return (
    <Screen eyebrow={t('maintenance')} title={t('myJobs')} subtitle={t('myJobsSub')}>
      <ReportProblemButton style={{ alignSelf: 'flex-start' }} />
      {active.length === 0 ? (
        <Card tone="sunken">
          <Muted>{t('noJobs')}</Muted>
        </Card>
      ) : (
        active.map((j) => <MyJob key={j.id} job={j} />)
      )}
      {done.length ? <Label>{t('done')}</Label> : null}
      {done.map((j) => (
        <JobRow key={j.id} job={j} />
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  diag: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
