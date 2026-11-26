import { MonthCalendar } from '@/components/demo/month-calendar';
import { Screen } from '@/components/demo/ui';
import { useDemo } from '@/demo/demo-provider';

export default function CalendarScreen() {
  const { t } = useDemo();
  return (
    <Screen eyebrow={t('planning')} title={t('calendarTitle')} subtitle={t('calSub')}>
      <MonthCalendar />
    </Screen>
  );
}
