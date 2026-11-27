import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { groupName, machineName } from '@/demo/i18n';
import { jobTitle } from '@/demo/localize';
import { personName } from '@/demo/mock/people';
import { JOB_STAGES, type Job, type JobStage } from '@/demo/types';

import { Icon } from './icon';
import { Body, Card, H2, Muted, Tag, timeAgo } from './ui';

/** 4-stage progress tracker: Reported → Assigned → In progress → Resolved. */
export function JobStepper({ stage }: { stage: JobStage }) {
  const { t } = useDemo();
  const current = JOB_STAGES.indexOf(stage);
  const color = stage === 'RESOLVED' ? Brand.green : Brand.teal;
  return (
    <View style={s.stepper}>
      {JOB_STAGES.map((st, i) => {
        const done = i <= current;
        return (
          <View key={st} style={s.step}>
            <View style={[s.segment, { backgroundColor: done ? color : Brand.border }]} />
            <Text style={[s.stepLabel, done && { color: Brand.ink }, i === current && { fontWeight: '800' }]}>
              {String(i + 1).padStart(2, '0')} {t(`stage.${st}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function JobRow({ job }: { job: Job }) {
  const { state, t, lang } = useDemo();
  if (!state) return null;
  const m = state.machines.find((x) => x.id === job.machineId);
  const resolved = job.stage === 'RESOLVED';
  const onPhone = job.assigneeId === state.phoneUserId;
  return (
    <Card tone={resolved ? 'default' : job.stage === 'REPORTED' ? 'warning' : 'accent'}>
      <View style={s.rowTop}>
        <View style={{ flex: 1, gap: 2 }}>
          <H2 style={{ fontSize: 16 }}>
            {jobTitle(job, t, lang)} ({machineName(t, m?.label)})
          </H2>
          <Muted>
            {groupName(t, m?.group)} · {timeAgo(job.createdAt, state.now, t)}
          </Muted>
        </View>
        {job.assigneeId ? (
          <Tag label={`${personName(state.people, job.assigneeId)}${onPhone ? ' · phone' : ''}`} color={Brand.tealDark} icon={onPhone ? 'phone' : 'person'} />
        ) : (
          <Tag label="Unassigned" color="#9A6700" />
        )}
      </View>
      <JobStepper stage={job.stage} />
      {resolved && job.rootCause ? (
        <View style={s.result}>
          <Icon name="checkCircle" size={15} color={Brand.greenDark} />
          <Body style={{ fontSize: 14, color: Brand.greenDark, flex: 1 }}>
            {t('rootCauseResult', { cause: t(job.rootCause) })}
            {job.partsUsed?.length ? ` · ${t('partsLabel')}: ${job.partsUsed.map((p) => t(p)).join(', ')}` : ''} · {t('savedHistory')}
          </Body>
        </View>
      ) : null}
    </Card>
  );
}

export function JobBoard({ limit }: { limit?: number }) {
  const { state } = useDemo();
  if (!state) return null;
  const jobs = limit ? state.jobs.slice(0, limit) : state.jobs;
  return (
    <View style={{ gap: 12 }}>
      {jobs.length === 0 ? (
        <Card tone="sunken">
          <Muted>No repair jobs yet. When an operator reports a machine problem, the job appears here.</Muted>
        </Card>
      ) : (
        jobs.map((j) => <JobRow key={j.id} job={j} />)
      )}
    </View>
  );
}

const s = StyleSheet.create({
  rowTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' },
  stepper: { flexDirection: 'row', gap: 6 },
  step: { flex: 1, gap: 6 },
  segment: { height: 4, borderRadius: 2 },
  stepLabel: { fontSize: 11, fontWeight: '600', color: Brand.sub, letterSpacing: 0.3 },
  result: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
