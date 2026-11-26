import { useLocalSearchParams } from 'expo-router';

import { ManualViewer } from '@/components/demo/manual-viewer';
import { Screen } from '@/components/demo/ui';
import { useDemo } from '@/demo/demo-provider';

export default function ManualsScreen() {
  const { manual } = useLocalSearchParams<{ manual?: string }>();
  const { t } = useDemo();
  return (
    <Screen eyebrow={t('knowledge')} title={t('manualsTitle')} subtitle={t('manualsSub')}>
      {/* key: reopen at the requested manual when navigated from a job */}
      <ManualViewer key={manual ?? 'default'} initialId={manual} />
    </Screen>
  );
}
