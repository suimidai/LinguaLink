import { useLocalSearchParams } from 'expo-router';

import { KnowledgeBase } from '@/components/demo/knowledge';
import { LangPicker, Screen, useIsWide } from '@/components/demo/ui';
import { useDemo } from '@/demo/demo-provider';

/** Ask a senior + the senior-tip library. Machine manuals live on their own page (and open from repair jobs). */
export default function KnowledgeScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { lang, setLang, t } = useDemo();
  const wide = useIsWide();
  return (
    <Screen eyebrow={t('knowledge')} title={t('kbTitle')} subtitle={t('kbSub')} right={wide ? <LangPicker value={lang} onChange={setLang} /> : undefined}>
      {/* key: re-ask when opened again from a repair job */}
      <KnowledgeBase key={`q-${q ?? ''}`} initialQuestion={q} />
    </Screen>
  );
}
