import { NativeTabs } from 'expo-router/native-tabs';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

/** Phone: 5 bottom tabs (PRD §3.2). Calendar sits on Home; manuals sit inside Knowledge. */
export default function AppTabs() {
  const { state, t } = useDemo();
  const myActiveJobs = state?.jobs.filter((j) => j.assigneeId === state.phoneUserId && j.stage !== 'RESOLVED').length ?? 0;
  const unacked = state?.announcements.filter((a) => a.requireAck && !a.phoneAcked).length ?? 0;
  const latest = state?.handovers[0];
  const newSummary = latest && state && state.now - latest.createdAt < 5 * 60_000 ? 1 : 0;

  return (
    <NativeTabs backgroundColor="#FFFFFF" indicatorColor={Brand.mint} labelStyle={{ selected: { color: Brand.tealDark } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tab.home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="shift">
        <NativeTabs.Trigger.Label>{t('tab.shift')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bubble.left.and.bubble.right.fill" md="forum" />
        {newSummary ? <NativeTabs.Trigger.Badge>AI</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="jobs">
        <NativeTabs.Trigger.Label>{t('tab.jobs')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="wrench.and.screwdriver.fill" md="build" />
        {myActiveJobs ? <NativeTabs.Trigger.Badge>{String(myActiveJobs)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="knowledge">
        <NativeTabs.Trigger.Label>{t('tab.knowledge')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="lightbulb.fill" md="lightbulb" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="announcements">
        <NativeTabs.Trigger.Label>{t('tab.notices')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="megaphone.fill" md="campaign" />
        {unacked ? <NativeTabs.Trigger.Badge>{String(unacked)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
