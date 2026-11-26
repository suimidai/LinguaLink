import { useLocalSearchParams } from 'expo-router';

import { KnowledgeBase } from '@/components/demo/knowledge';
import { ManualViewer } from '@/components/demo/manual-viewer';
import { Label, LangPicker, Screen, useIsWide } from '@/components/demo/ui';
import { useDemo } from '@/demo/demo-provider';

export default function KnowledgeScreen() {
  const { q, manual } = useLocalSearchParams<{ q?: string; manual?: string }>();
  const { lang, setLang, t } = useDemo();
  const wide = useIsWide();
  return (
    <Screen eyebrow={t('knowledge')} title={t('kbTitle')} subtitle={t('kbSub')} right={wide ? <LangPicker value={lang} onChange={setLang} /> : undefined}>
      {/* key: re-ask when opened again from a repair job */}
      <KnowledgeBase key={`q-${q ?? ''}`} initialQuestion={q} />
      <Label icon="manual">{t('manualsSop')}</Label>
      <ManualViewer key={`m-${manual ?? ''}`} initialId={manual} />
    </Screen>
  );
}
