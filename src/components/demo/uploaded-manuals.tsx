import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { LANG_NAMES } from '@/demo/i18n-lingualink';
import { LANGS, type Lang, type ManualContent, type UploadedManual, type UploadedManualSummary } from '@/demo/types';

import { Icon } from './icon';
import { useMe } from './shift-chat';
import { Body, Button, Card, H2, LangPicker, Muted, Tag } from './ui';

const ERRORS: Record<string, string> = { tooBig: 'upTooBig', tooManyPages: 'upTooManyPages', unsupported: 'upUnsupported', empty: 'upUnsupported' };

/** The shared list of uploaded manuals (refreshes; faster while one is being read). */
export function useUploadedManuals() {
  const [list, setList] = useState<UploadedManualSummary[]>([]);
  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/manuals', { cache: 'no-store' });
      if (res.ok) setList((await res.json()) as UploadedManualSummary[]);
    } catch {
      // keep the last list
    }
  }, []);
  const reading = list.some((m) => m.status === 'reading');
  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const id = setInterval(refresh, reading ? 2000 : 5000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [refresh, reading]);
  return { list, refresh };
}

/** Pick a PDF, a Word file or photos of pages, upload, then let the AI read it. Web only. */
export function UploadManualButton({ onUploaded }: { onUploaded: (m: UploadedManualSummary) => void }) {
  const { t } = useDemo();
  const me = useMe();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (Platform.OS !== 'web') return null;

  const pick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*';
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (!files.length) return;
      setBusy(true);
      setError(null);
      try {
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        form.append('userId', me);
        const res = await fetch('/api/manuals', { method: 'POST', body: form });
        const data = (await res.json().catch(() => ({}))) as UploadedManualSummary & { error?: string };
        if (!res.ok) {
          setError(t(ERRORS[data.error ?? ''] ?? 'upFailed'));
          return;
        }
        onUploaded(data);
        void fetch(`/api/manuals/${data.id}/read`, { method: 'POST' }); // AI reads it in the background
      } catch {
        setError(t('upFailed'));
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  return (
    <View style={{ gap: 6 }}>
      <Button icon="upload" variant="secondary" label={busy ? t('uploading') : t('uploadManual')} onPress={pick} disabled={busy} />
      <Muted>{t('uploadHint')}</Muted>
      {error ? <Muted style={{ color: Brand.redDark }}>{error}</Muted> : null}
    </View>
  );
}

/** One uploaded manual in the list on the left. */
export function UploadedManualItem({ m, selected, onPress }: { m: UploadedManualSummary; selected: boolean; onPress: () => void }) {
  const { state, t } = useDemo();
  const who = state?.people.find((p) => p.id === m.uploadedBy)?.name;
  return (
    <Pressable onPress={onPress}>
      <Card tone={selected ? 'accent' : 'default'} style={s.item}>
        <Icon name={m.kind === 'images' ? 'photo' : 'file'} size={18} color={selected ? Brand.tealDark : Brand.sub} />
        <View style={{ flex: 1, gap: 2 }}>
          <Body style={{ fontWeight: '700' }} numberOfLines={2}>
            {m.title || m.fileName}
          </Body>
          <Muted>
            {m.kind.toUpperCase()} · {m.pages} {t('pagesShort')}
            {who ? ` · ${t('uploadedBy', { name: who })}` : ''}
          </Muted>
          {m.status === 'reading' ? <Tag label={t('readingManual')} color="#9A6700" icon="clock" /> : null}
          {m.status === 'failed' ? <Tag label={t('readFailed')} color={Brand.redDark} icon="warning" /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

/** Read an uploaded manual in any language. Missing languages are translated on request and saved for everyone. */
export function UploadedManualView({ id, onRemoved }: { id: string; onRemoved: () => void }) {
  const { lang: deviceLang, t } = useDemo();
  const me = useMe();
  const [override, setOverride] = useState<Lang | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const lang = override ?? deviceLang;
  const [m, setM] = useState<UploadedManual | null>(null);
  const [translating, setTranslating] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const asked = useRef(new Set<string>());

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/manuals/${id}?lang=${lang}`, { cache: 'no-store' });
      if (res.ok) setM((await res.json()) as UploadedManual);
    } catch {
      // try again on the next tick
    }
  }, [id, lang]);

  // Poll while the AI is still reading the file.
  useEffect(() => {
    const first = setTimeout(load, 0);
    const iv = setInterval(() => {
      if (!m || m.status === 'reading') void load();
    }, 2000);
    return () => {
      clearTimeout(first);
      clearInterval(iv);
    };
  }, [load, m]);

  const doc: ManualContent | undefined = !m?.doc ? undefined : showOriginal || m.sourceLang === lang ? m.doc : m.translations[lang];
  const needsTranslation = !!m?.doc && !showOriginal && m.sourceLang !== lang && !m.translations[lang];

  // First time anyone reads it in this language: translate (then it's saved for everyone).
  useEffect(() => {
    if (!needsTranslation || asked.current.has(lang)) return;
    asked.current.add(lang);
    const run = async () => {
      setTranslating(true);
      setFailed(false);
      try {
        const res = await fetch(`/api/manuals/${id}/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang }) });
        if (!res.ok) setFailed(true);
        await load();
      } catch {
        setFailed(true);
      } finally {
        setTranslating(false);
      }
    };
    void run();
  }, [needsTranslation, lang, id, load, retryNonce]);

  if (!m) return <Card style={{ flex: 1 }}><Muted>…</Muted></Card>;

  const retryRead = async () => {
    await fetch(`/api/manuals/${id}/read`, { method: 'POST' }).catch(() => undefined);
    await load();
  };
  const retryTranslate = () => {
    asked.current.delete(lang);
    setFailed(false);
    setRetryNonce((n) => n + 1);
  };
  const open = (path: string) => {
    if (Platform.OS === 'web') window.open(path, '_blank', 'noopener');
  };
  const remove = async () => {
    const res = await fetch(`/api/manuals/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: me }) }).catch(() => null);
    if (res?.ok) onRemoved();
  };
  const sourceName = m.sourceLang ? LANG_NAMES[lang][m.sourceLang] : '';
  const viewLang = showOriginal ? m.sourceLang : lang;

  return (
    <Card style={{ flex: 1, gap: 12 }}>
      <View style={s.badges}>
        {m.sourceLang ? <Tag label={`${t('originalText')} · ${sourceName}`} color={Brand.sub} /> : null}
        {!showOriginal && m.sourceLang && m.sourceLang !== lang && doc ? (
          <Tag label={t('translatedTo', { lang: LANGS.find((l) => l.code === lang)?.native ?? '' })} color={Brand.tealDark} icon="globe" />
        ) : null}
      </View>
      <H2 style={{ fontSize: 22 }}>{doc?.title || m.title || m.fileName}</H2>
      {m.status === 'ready' ? (
        <View style={s.tools}>
          <LangPicker
            value={lang}
            onChange={(l) => {
              setOverride(l);
              setShowOriginal(false);
            }}
          />
          <View style={s.tools}>
            <Button small variant={showOriginal ? 'primary' : 'secondary'} label={t('originalText')} onPress={() => setShowOriginal((v) => !v)} />
            {doc && Platform.OS === 'web' ? (
              <Button small icon="download" label={t('downloadPdf')} onPress={() => open(`/api/manuals/${id}/print?lang=${viewLang}`)} />
            ) : null}
            {m.kind !== 'images' && Platform.OS === 'web' ? (
              <Button small variant="ghost" icon="download" label={t('originalFile')} onPress={() => open(`/api/manuals/${id}/file`)} />
            ) : null}
            {m.uploadedBy === me ? <Button small variant="ghost" icon="close" label={t('deleteManual')} onPress={remove} /> : null}
          </View>
        </View>
      ) : null}

      {m.status === 'reading' ? <Muted>{t('readingManual')}</Muted> : null}
      {m.status === 'failed' ? (
        <View style={{ gap: 8 }}>
          <Muted style={{ color: Brand.redDark }}>{t('readFailed')}</Muted>
          <Button small icon="reset" label={t('retry')} onPress={retryRead} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : null}
      {m.status === 'ready' && !doc ? (
        translating || !failed ? (
          <Muted style={{ color: Brand.tealDark }}>{t('translatingManual')}</Muted>
        ) : (
          <View style={{ gap: 8 }}>
            <Muted style={{ color: Brand.redDark }}>{t('translateFailed')}</Muted>
            <Button small icon="reset" label={t('retry')} onPress={retryTranslate} style={{ alignSelf: 'flex-start' }} />
          </View>
        )
      ) : null}
      {doc ? <ManualDocView doc={doc} /> : null}
    </Card>
  );
}

function ManualDocView({ doc }: { doc: ManualContent }) {
  return (
    <View style={{ gap: 4 }}>
      {doc.sections.map((sec, si) => {
        let n = 0;
        return (
          <View key={si} style={s.section}>
            {sec.heading ? <Text style={s.heading}>{sec.heading}</Text> : null}
            {sec.blocks.map((b, bi) => {
              if (b.type === 'step') {
                n += 1;
                return (
                  <View key={bi} style={s.step}>
                    <View style={s.num}>
                      <Text style={s.numText}>{n}</Text>
                    </View>
                    <Body style={{ flex: 1, fontSize: 16, lineHeight: 24 }}>{b.text}</Body>
                  </View>
                );
              }
              if (b.type === 'warning') {
                return (
                  <View key={bi} style={s.warn}>
                    <Icon name="warning" size={15} color="#9A6700" />
                    <Body style={{ flex: 1, fontWeight: '700', color: '#7A5200' }}>{b.text}</Body>
                  </View>
                );
              }
              if (b.type === 'table' && b.rows.length) {
                return (
                  <ScrollView key={bi} horizontal style={{ marginVertical: 6 }}>
                    <View>
                      {b.text ? <Muted style={{ fontWeight: '700', marginBottom: 4 }}>{b.text}</Muted> : null}
                      {b.rows.map((r, ri) => (
                        <View key={ri} style={[s.tr, ri === 0 && { backgroundColor: '#F1F5F6' }]}>
                          {r.map((c, ci) => (
                            <Text key={ci} style={[s.td, ri === 0 && { fontWeight: '700' }]}>
                              {c}
                            </Text>
                          ))}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                );
              }
              return b.text ? (
                <Body key={bi} style={{ fontSize: 15, lineHeight: 23 }}>
                  {b.text}
                </Body>
              ) : null;
            })}
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  section: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: Brand.border },
  heading: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  num: { width: 28, height: 28, borderRadius: 6, borderWidth: 1.5, borderColor: Brand.teal, alignItems: 'center', justifyContent: 'center' },
  numText: { color: Brand.tealDark, fontWeight: '800', fontFamily: Fonts?.mono },
  warn: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: Brand.amberBg, borderRadius: 8, padding: 10 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderColor: Brand.border },
  td: { width: 150, padding: 6, fontSize: 13, color: Brand.ink, borderRightWidth: 1, borderColor: Brand.border },
});
