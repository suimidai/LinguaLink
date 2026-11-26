import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { MANUALS } from '@/demo/mock/manuals';
import { PDF_DOC, PDF_MANUAL_ID } from '@/demo/mock/pdf-manual';
import { LANGS, type Lang } from '@/demo/types';

import { Icon } from './icon';
import { PdfManualViewer } from './pdf-manual';
import { Body, Card, H2, LangPicker, Muted, Tag, useIsWide } from './ui';

export function ManualViewer({ initialId }: { initialId?: string }) {
  const { lang: deviceLang, t } = useDemo();
  const wide = useIsWide();
  const [manualId, setManualId] = useState(initialId === PDF_MANUAL_ID || MANUALS.some((m) => m.id === initialId) ? initialId! : PDF_MANUAL_ID);
  // Follows the app language; picking a language here overrides it for this screen only.
  const [override, setLang] = useState<Lang | null>(null);
  const lang = override ?? deviceLang;
  const manual = MANUALS.find((m) => m.id === manualId) ?? MANUALS[0];
  const langName = LANGS.find((l) => l.code === lang)?.native;

  return (
    <View style={[{ gap: 16 }, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
      <View style={[{ gap: 10 }, wide && { width: 300 }]}>
        <Pressable onPress={() => setManualId(PDF_MANUAL_ID)}>
          <Card tone={manualId === PDF_MANUAL_ID ? 'accent' : 'default'} style={s.item}>
            <Icon name="file" size={18} color={manualId === PDF_MANUAL_ID ? Brand.tealDark : Brand.sub} />
            <View style={{ flex: 1, gap: 2 }}>
              <Body style={{ fontWeight: '700' }}>
                {PDF_DOC.title[lang]} · {PDF_DOC.subtitle[lang]}
              </Body>
              <Muted>
                PDF · {PDF_DOC.size} · {PDF_DOC.machine}
              </Muted>
            </View>
          </Card>
        </Pressable>
        {MANUALS.map((m) => (
          <Pressable key={m.id} onPress={() => setManualId(m.id)}>
            <Card tone={m.id === manualId ? 'accent' : 'default'} style={s.item}>
              <Icon name="manual" size={18} color={m.id === manualId ? Brand.tealDark : Brand.sub} />
              <View style={{ flex: 1, gap: 2 }}>
                <Body style={{ fontWeight: '700' }}>{m.title[lang]}</Body>
                <Muted>{m.machineTypeKeys.map((k) => t(k)).join(' · ')}</Muted>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>

      {manualId === PDF_MANUAL_ID ? (
        <View style={wide ? { flex: 1 } : undefined}>
          <PdfManualViewer />
        </View>
      ) : (
        <Card style={wide ? { flex: 1 } : undefined}>
          <View style={s.badges}>
            <Tag label={t('originalJa')} color={Brand.sub} />
            {lang !== 'ja' ? <Tag label={t('translatedTo', { lang: langName ?? '' })} color={Brand.tealDark} icon="globe" /> : null}
          </View>
          <H2 style={{ fontSize: 22 }}>{manual.title[lang]}</H2>
          {lang !== 'ja' ? <Muted>{manual.title.ja}</Muted> : null}
          <LangPicker value={lang} onChange={setLang} />
          <View style={{ gap: 12, marginTop: 4 }}>
            {manual.steps.map((step, i) => (
              <View key={i} style={s.step}>
                <View style={s.num}>
                  <Text style={s.numText}>{i + 1}</Text>
                </View>
                <Body style={{ flex: 1, fontSize: 17, lineHeight: 26 }}>{step.text[lang]}</Body>
              </View>
            ))}
          </View>
          <View style={s.safety}>
            <Icon name="warning" size={15} color="#9A6700" />
            <Muted style={{ flex: 1 }}>{t('safety')}</Muted>
          </View>
        </Card>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  step: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  num: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Brand.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  numText: {
    color: Brand.tealDark,
    fontWeight: '800',
    fontFamily: Fonts?.mono,
  },
  safety: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: Brand.amberBg,
    borderRadius: 8,
    padding: 10,
  },
});
