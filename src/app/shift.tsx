import { ShiftChat } from '@/components/demo/shift-chat';
import { LangPicker, Screen, useIsWide } from '@/components/demo/ui';
import { useDemo } from '@/demo/demo-provider';

export default function ShiftScreen() {
  const { state, lang, setLang, t } = useDemo();
  const wide = useIsWide();
  return (
    <Screen
      eyebrow={t('shiftLive', { shift: state?.shift ?? 'A' })}
      title={t('shiftChat')}
      subtitle={t('shiftChatSub')}
      right={wide ? <LangPicker value={lang} onChange={setLang} /> : undefined}>
      <ShiftChat />
    </Screen>
  );
}
