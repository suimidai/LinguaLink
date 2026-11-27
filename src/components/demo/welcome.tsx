import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { translate } from '@/demo/i18n';
import { LANGS, type Lang } from '@/demo/types';

import { Button, Card, H2, Label, Muted } from './ui';

/**
 * First open: "What's your name?" + language. Saved on this device, so judges and visitors
 * show up by name in the chat and checklist. Also used to change the name later.
 */
export function WelcomeModal({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const { me, meLoaded, join, lang: deviceLang } = useDemo();
  // Without `open` this is the app-wide first-run prompt; with `open` it's a "Change name" dialog.
  const firstRun = open === undefined;
  const asking = firstRun && meLoaded && !me;
  const visible = firstRun ? asking : open;
  const [name, setName] = useState('');
  const [lang, setLang] = useState<Lang | null>(null);
  const [saving, setSaving] = useState(false);
  const l = lang ?? me?.lang ?? deviceLang;
  const t = (key: string, params?: Record<string, string | number>) => translate(l, key, params);
  const value = name || (!firstRun ? (me?.name ?? '') : '');

  const submit = async () => {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      await join(value, l);
      setName('');
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => (asking ? undefined : onClose?.())}>
      <View style={s.backdrop}>
        <Card style={s.panel}>
          <H2>{t('welcomeTitle')}</H2>
          <Muted>{t('welcomeSub')}</Muted>
          <Label>{t('yourName')}</Label>
          <TextInput
            value={value}
            onChangeText={setName}
            placeholder={t('yourName')}
            placeholderTextColor={Brand.sub}
            style={s.input}
            maxLength={24}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <Label>{t('yourLang')}</Label>
          <View style={s.langs}>
            {LANGS.map((x) => (
              <Pressable
                key={x.code}
                onPress={() => setLang(x.code)}
                accessibilityRole="button"
                accessibilityState={{ selected: x.code === l }}
                style={[s.lang, x.code === l && s.langOn]}>
                <Text style={[s.langText, x.code === l && { color: '#FFFFFF' }]}>{x.native}</Text>
              </Pressable>
            ))}
          </View>
          <Button icon="arrowRight" label={t('start')} onPress={submit} disabled={!value.trim() || saving} />
        </Card>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,30,35,0.55)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 440, gap: 12 },
  input: { minHeight: 46, borderWidth: 1, borderColor: Brand.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: Brand.ink, backgroundColor: '#FFFFFF' },
  langs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  lang: { borderWidth: 1, borderColor: Brand.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF' },
  langOn: { backgroundColor: Brand.teal, borderColor: Brand.teal },
  langText: { fontSize: 14, fontWeight: '700', color: Brand.ink },
});
