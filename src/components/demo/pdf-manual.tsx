import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { PDF_DOC, PDF_PAGES, PDF_UI, type PdfBlock, type PdfPage } from '@/demo/mock/pdf-manual';
import { LANGS, type Lang, type Translated } from '@/demo/types';

import { Icon } from './icon';
import { Chip } from './ui';

const TRANSLATE_MS = 1600;
const INK = '#1A1A1A';
const GREY = '#5F6368';
const fill = (tr: Translated, params: Record<string, string | number>, lang: Lang) =>
  tr[lang].replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? `{${k}}`));

/** Simple line drawings, like the figures in a printed manual. */
function Drawing({ kind }: { kind: 'press' | 'bolts' }) {
  if (kind === 'press') {
    return (
      <View style={d.box}>
        <View style={d.crown} />
        <View style={d.frameRow}>
          <View style={d.column} />
          <View style={d.window}>
            <View style={d.ram} />
            <View style={d.die} />
          </View>
          <View style={d.column} />
        </View>
        <View style={d.bed} />
        <View style={d.feetRow}>
          <View style={d.foot} />
          <View style={d.foot} />
        </View>
      </View>
    );
  }
  return (
    <View style={d.box}>
      <View style={d.guard}>
        {['A', 'B', 'C', 'D'].map((b, i) => (
          <View key={b} style={[d.bolt, { left: i % 2 ? '82%' : '8%', top: i < 2 ? '12%' : '70%' }]}>
            <Text style={d.boltText}>{b}</Text>
          </View>
        ))}
        <Text style={d.guardLabel}>GUARD</Text>
      </View>
    </View>
  );
}

function Block({ b, lang }: { b: PdfBlock; lang: Lang }) {
  switch (b.kind) {
    case 'h1':
      return <Text style={p.h1}>{b.text[lang]}</Text>;
    case 'h2':
      return <Text style={p.h2}>{b.text[lang]}</Text>;
    case 'p':
      return <Text style={p.body}>{b.text[lang]}</Text>;
    case 'warning':
    case 'caution':
      return (
        <View style={[p.alert, b.kind === 'warning' ? p.alertWarn : p.alertCaution]}>
          <View style={[p.alertHead, b.kind === 'warning' ? { backgroundColor: '#C62828' } : { backgroundColor: '#F2A900' }]}>
            <Text style={[p.alertTitle, b.kind === 'caution' && { color: INK }]}>⚠ {b.title[lang]}</Text>
          </View>
          <Text style={[p.body, { padding: 10 }]}>{b.text[lang]}</Text>
        </View>
      );
    case 'steps':
      return (
        <View style={{ gap: 6 }}>
          {b.items.map((it, i) => (
            <View key={i} style={p.stepRow}>
              <Text style={p.stepNo}>({i + 1})</Text>
              <Text style={[p.body, { flex: 1 }]}>{it[lang]}</Text>
            </View>
          ))}
        </View>
      );
    case 'table':
      return (
        <View style={p.table}>
          <View style={[p.tr, p.th]}>
            {b.head.map((h, i) => (
              <Text key={i} style={[p.td, p.thText]}>
                {h[lang]}
              </Text>
            ))}
          </View>
          {b.rows.map((r, i) => (
            <View key={i} style={p.tr}>
              {r.map((c, j) => (
                <Text key={j} style={[p.td, typeof c === 'string' && { fontFamily: Fonts?.mono }]}>
                  {typeof c === 'string' ? c : c[lang]}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );
    case 'figure':
      return (
        <View style={{ gap: 6, alignItems: 'center' }}>
          <Drawing kind={b.drawing} />
          <Text style={p.caption}>{b.caption[lang]}</Text>
        </View>
      );
  }
}

/** Moving scan line + label while the "AI" translates a page. */
function TranslatingOverlay({ page, ui }: { page: number; ui: Lang }) {
  const [pos] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pos, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [pos]);
  const top = pos.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={o.overlay} pointerEvents="none">
      <Animated.View style={[o.scan, { top }]} />
      <View style={o.pill}>
        <Icon name="translate" size={14} color="#FFFFFF" />
        <Text style={o.pillText}>{fill(PDF_UI.translating, { n: page }, ui)}</Text>
      </View>
    </View>
  );
}

function Page({ page, lang, ui, translating }: { page: PdfPage; lang: Lang; ui: Lang; translating: boolean }) {
  return (
    <View style={p.page}>
      {page.cover ? (
        <View style={{ gap: 18 }}>
          <Text style={p.maker}>{PDF_DOC.maker[lang]}</Text>
          <View style={p.rule} />
          <View style={{ gap: 4 }}>
            <Text style={p.coverTitle}>{PDF_DOC.title[lang]}</Text>
            <Text style={p.coverSub}>{PDF_DOC.subtitle[lang]}</Text>
          </View>
          {page.blocks.map((b, i) => (
            <Block key={i} b={b} lang={lang} />
          ))}
          <View style={p.readFirst}>
            <Text style={p.readFirstText}>⚠ {PDF_UI.readFirst[lang]}</Text>
          </View>
          <View style={p.coverFoot}>
            <Text style={p.small}>{PDF_DOC.docNo}</Text>
            <Text style={p.small}>MADE IN JAPAN</Text>
          </View>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <View style={p.header}>
            <Text style={p.small}>
              {PDF_DOC.model} {PDF_DOC.subtitle[lang]}
            </Text>
            <Text style={p.small}>{PDF_DOC.docNo}</Text>
          </View>
          {page.blocks.map((b, i) => (
            <Block key={i} b={b} lang={lang} />
          ))}
          <Text style={[p.small, { textAlign: 'center', marginTop: 8 }]}>— {page.number} —</Text>
        </View>
      )}
      {translating ? <TranslatingOverlay page={page.number} ui={ui} /> : null}
    </View>
  );
}

/**
 * A downloaded OEM manual shown like a PDF viewer. The original is Japanese;
 * "Auto-translate" re-renders the same pages in the reader's language.
 */
export function PdfManualViewer() {
  const { lang: deviceLang } = useDemo();
  const [target, setTarget] = useState<Lang>(deviceLang === 'ja' ? 'en' : deviceLang);
  const [auto, setAuto] = useState(true);
  // Translate once when the file opens, so the audience sees the Japanese page turn into their language.
  const [translating, setTranslating] = useState(true);
  useEffect(() => {
    if (!translating) return;
    const id = setTimeout(() => setTranslating(false), TRANSLATE_MS);
    return () => clearTimeout(id);
  }, [translating]);

  const shown: Lang = auto && !translating ? target : 'ja';
  const ui = deviceLang;
  const pick = (l: Lang) => {
    setTarget(l);
    setAuto(true);
    setTranslating(true);
  };

  return (
    <View style={v.wrap}>
      <View style={v.toolbar}>
        <Icon name="file" size={16} color="#E8EAED" />
        <Text style={v.fileName} numberOfLines={1}>
          {PDF_DOC.fileName}
        </Text>
        <Text style={v.meta}>{PDF_DOC.size}</Text>
        <Text style={v.meta}>{fill(PDF_UI.page, { n: 1, total: PDF_DOC.totalPages }, ui)}</Text>
      </View>

      <View style={v.controls}>
        <View style={v.segment}>
          <Pressable onPress={() => setAuto(false)} style={[v.segBtn, !auto && v.segOn]} accessibilityRole="button" accessibilityState={{ selected: !auto }}>
            <Text style={[v.segText, !auto && v.segTextOn]}>
              {PDF_UI.original[ui]} · 日本語
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!auto) {
                setAuto(true);
                setTranslating(true);
              }
            }}
            style={[v.segBtn, auto && v.segOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: auto }}>
            <Icon name="translate" size={13} color={auto ? '#FFFFFF' : Brand.sub} />
            <Text style={[v.segText, auto && v.segTextOn]}>
              {PDF_UI.autoTranslate[ui]} → {LANGS.find((l) => l.code === target)?.native}
            </Text>
          </Pressable>
        </View>
        <View style={v.langs}>
          {LANGS.filter((l) => l.code !== 'ja').map((l) => (
            <Chip key={l.code} label={l.label} selected={auto && target === l.code} onPress={() => pick(l.code)} />
          ))}
        </View>
      </View>

      <View style={[v.bar, !auto && { backgroundColor: '#F1F3F4' }]}>
        <Icon name={auto ? 'ai' : 'file'} size={14} color={auto ? Brand.tealDark : GREY} />
        <Text style={[v.barText, !auto && { color: GREY }]}>
          {auto ? PDF_UI.translatedBar[ui] : PDF_UI.originalBar[ui]} · {PDF_UI.excerpt[ui]}
        </Text>
      </View>

      <View style={v.canvas}>
        {PDF_PAGES.map((pg) => (
          <Page key={pg.number} page={pg} lang={shown} ui={ui} translating={translating} />
        ))}
      </View>
    </View>
  );
}

const v = StyleSheet.create({
  wrap: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#3C4043' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#323639', paddingHorizontal: 14, paddingVertical: 10 },
  fileName: { flex: 1, color: '#E8EAED', fontSize: 13, fontWeight: '600' },
  meta: { color: '#9AA0A6', fontSize: 12, fontVariant: ['tabular-nums'] },
  controls: { backgroundColor: '#FFFFFF', padding: 10, gap: 8, borderBottomWidth: 1, borderBottomColor: '#DADCE0' },
  segment: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  segBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 6, borderWidth: 1, borderColor: '#DADCE0', paddingHorizontal: 10, paddingVertical: 7 },
  segOn: { backgroundColor: Brand.teal, borderColor: Brand.teal },
  segText: { fontSize: 13, fontWeight: '700', color: Brand.sub },
  segTextOn: { color: '#FFFFFF' },
  langs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Brand.mint, paddingHorizontal: 12, paddingVertical: 8 },
  barText: { flex: 1, fontSize: 12, color: Brand.tealDark, lineHeight: 17 },
  canvas: { backgroundColor: '#525659', padding: 16, gap: 18, alignItems: 'center' },
});

const p = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 30,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    overflow: 'hidden',
  },
  maker: { fontSize: 13, fontWeight: '700', letterSpacing: 1, color: INK },
  rule: { height: 3, backgroundColor: INK },
  coverTitle: { fontSize: 28, fontWeight: '800', color: INK, fontFamily: Fonts?.serif },
  coverSub: { fontSize: 20, color: INK, fontFamily: Fonts?.serif },
  readFirst: { borderWidth: 1.5, borderColor: INK, padding: 10 },
  readFirstText: { fontSize: 13, color: INK, lineHeight: 19 },
  coverFoot: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: INK, paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: INK, paddingBottom: 6 },
  small: { fontSize: 10, color: GREY, letterSpacing: 0.4 },
  h1: { fontSize: 18, fontWeight: '800', color: INK, borderLeftWidth: 5, borderLeftColor: INK, paddingLeft: 8, marginTop: 6, fontFamily: Fonts?.serif },
  h2: { fontSize: 15, fontWeight: '700', color: INK, fontFamily: Fonts?.serif },
  body: { fontSize: 13, color: INK, lineHeight: 20, fontFamily: Fonts?.serif },
  alert: { borderWidth: 1.5 },
  alertWarn: { borderColor: '#C62828' },
  alertCaution: { borderColor: '#F2A900' },
  alertHead: { paddingHorizontal: 10, paddingVertical: 4 },
  alertTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  stepRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  stepNo: { fontSize: 13, fontWeight: '700', color: INK, width: 26, lineHeight: 20 },
  table: { borderWidth: 1, borderColor: INK },
  tr: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#9E9E9E' },
  th: { backgroundColor: '#E8E8E8', borderTopWidth: 0 },
  td: { flex: 1, fontSize: 12, color: INK, paddingHorizontal: 8, paddingVertical: 5, lineHeight: 17 },
  thText: { fontWeight: '800' },
  caption: { fontSize: 11, color: INK, fontStyle: 'italic' },
});

const d = StyleSheet.create({
  box: { width: '80%', maxWidth: 360, aspectRatio: 1.4, borderWidth: 1, borderColor: '#BDBDBD', backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', padding: 14 },
  crown: { width: '70%', height: '18%', borderWidth: 2, borderColor: INK },
  frameRow: { flexDirection: 'row', width: '70%', height: '42%' },
  column: { width: '16%', borderWidth: 2, borderTopWidth: 0, borderColor: INK },
  window: { flex: 1, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 0 },
  ram: { width: '60%', height: '35%', borderWidth: 2, borderTopWidth: 0, borderColor: INK, backgroundColor: '#E0E0E0' },
  die: { width: '70%', height: '22%', borderWidth: 2, borderColor: INK, backgroundColor: '#EEEEEE' },
  bed: { width: '80%', height: '14%', borderWidth: 2, borderColor: INK },
  feetRow: { width: '74%', flexDirection: 'row', justifyContent: 'space-between' },
  foot: { width: '14%', height: 8, backgroundColor: INK },
  guard: { width: '85%', height: '85%', borderWidth: 2, borderColor: INK, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  guardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: GREY },
  bolt: { position: 'absolute', width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: INK, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  boltText: { fontSize: 11, fontWeight: '800', color: INK },
});

const o = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  scan: { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: Brand.teal, shadowColor: Brand.teal, shadowOpacity: 0.8, shadowRadius: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Brand.tealDark, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
