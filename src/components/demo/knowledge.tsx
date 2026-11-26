import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { machineName } from '@/demo/i18n';
import { ADD_PRESETS, clock, matchQuestion, QUESTIONS, type KbQuestion } from '@/demo/mock/knowledge';
import { personName, SENIOR_YEARS } from '@/demo/mock/people';
import type { KnowledgeEntry } from '@/demo/types';

import { Icon, type IconName } from './icon';
import { Body, Button, Card, Chip, H2, Label, Muted, ProgressBar, Tag, useIsWide } from './ui';

const FORMAT_ICON: Record<KnowledgeEntry['format'], IconName> = { VIDEO: 'video', VOICE: 'mic', TEXT: 'file' };
const THINK_MS = 1200;

type Clip = { entryId: string; at: number };

/** Mock clip player: opens a senior's tip at the cited second and plays the transcript along (PRD FR-KB-03). */
function ClipPlayer({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  const { state, lang, t } = useDemo();
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(started);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const entry = state?.knowledge.find((k) => k.id === clip.entryId);
  if (!entry || !state) return null;
  const timed = entry.format !== 'TEXT';
  const pos = timed ? Math.min(entry.durationSec, clip.at + (now - started) / 1000) : clip.at;
  const current = [...entry.segments].reverse().find((sg) => sg.at <= pos) ?? entry.segments[0];
  return (
    <Card style={s.player}>
      <View style={s.playerHead}>
        <Tag label={t(`fmt.${entry.format}`)} color="#7FE0D4" icon={FORMAT_ICON[entry.format]} />
        <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={onClose} hitSlop={10}>
          <Icon name="close" size={18} color="#CFE3E5" />
        </Pressable>
      </View>
      <Text style={s.playerTitle}>{entry.title[lang]}</Text>
      <Text style={s.playerSub}>
        {personName(state.people, entry.seniorId)} · {t('yearsExp', { n: SENIOR_YEARS[entry.seniorId] ?? 20 })} · {machineName(t, state.machines.find((m) => m.id === entry.machineId)?.label)}
      </Text>
      {timed ? (
        <>
          <View style={s.screen}>
            <Icon name="play" size={26} color="#FFFFFF" />
            <Text style={s.caption}>{current.text[lang]}</Text>
          </View>
          <ProgressBar value={pos / Math.max(1, entry.durationSec)} color="#2DD4BF" />
          <View style={s.playerHead}>
            <Text style={s.time}>
              {clock(pos)} / {clock(entry.durationSec)}
            </Text>
            <Text style={s.playerSub}>{t('playingFrom', { time: clock(clip.at) })}</Text>
          </View>
        </>
      ) : null}
      <Label color="#9FB6BA">{t('transcript')}</Label>
      {entry.segments.map((sg) => (
        <View key={sg.at} style={[s.seg, sg === current && s.segNow]}>
          {timed ? <Text style={s.segTime}>{clock(sg.at)}</Text> : null}
          <Text style={[s.segText, sg === current && { color: '#FFFFFF' }]}>{sg.text[lang]}</Text>
        </View>
      ))}
    </Card>
  );
}

/** AI direct answer: built only from cited senior tips, never guessed (PRD FR-KB-02). */
function Answer({ question, asked, onOpen }: { question?: KbQuestion; asked: string; onOpen: (c: Clip) => void }) {
  const { state, lang, t } = useDemo();
  if (!state) return null;
  if (!question) {
    return (
      <Card tone="warning">
        <Body style={{ fontWeight: '700' }}>“{asked}”</Body>
        <Body>{t('noSource')}</Body>
      </Card>
    );
  }
  return (
    <Card tone="accent">
      <Body style={{ fontWeight: '700' }}>“{asked}”</Body>
      <Tag label={t('aiAnswer')} color={Brand.tealDark} icon="ai" />
      {question.cites.map((c, i) => {
        const entry = state.knowledge.find((k) => k.id === c.entryId);
        const seg = entry?.segments.find((sg) => sg.at === c.at);
        if (!entry || !seg) return null;
        const senior = personName(state.people, entry.seniorId);
        return (
          <View key={i} style={s.step}>
            <Text style={s.stepNo}>{i + 1}</Text>
            <View style={{ flex: 1, gap: 6 }}>
              <Body>{seg.text[lang]}</Body>
              <Pressable onPress={() => onOpen(c)} accessibilityRole="button" style={({ pressed }) => [s.cite, pressed && { opacity: 0.7 }]}>
                <Icon name={entry.format === 'TEXT' ? 'file' : 'play'} size={12} color={Brand.tealDark} />
                <Text style={s.citeText}>
                  {senior}
                  {entry.format === 'TEXT' ? '' : ` · ${clock(c.at)}`}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      <Muted>{t('onlyFromTips')}</Muted>
    </Card>
  );
}

function TipCard({ entry, onOpen }: { entry: KnowledgeEntry; onOpen: (c: Clip) => void }) {
  const { state, lang, t } = useDemo();
  if (!state) return null;
  const processing = state.now < entry.readyAt;
  const m = state.machines.find((x) => x.id === entry.machineId);
  return (
    <Pressable disabled={processing} onPress={() => onOpen({ entryId: entry.id, at: 0 })}>
      <Card tone={processing ? 'sunken' : 'default'} style={s.tip}>
        <View style={s.tipIcon}>
          <Icon name={FORMAT_ICON[entry.format]} size={18} color={Brand.tealDark} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Body style={{ fontWeight: '700' }}>{entry.title[lang]}</Body>
          <Muted>
            {personName(state.people, entry.seniorId)} · {t('yearsExp', { n: SENIOR_YEARS[entry.seniorId] ?? 20 })} · {machineName(t, m?.label)}
            {entry.durationSec ? ` · ${clock(entry.durationSec)}` : ''}
          </Muted>
          {processing ? <Tag label={t('processing')} color="#9A6700" icon="clock" /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

/** Web only: a senior "uploads" a tip; the AI transcribes, translates and indexes it. */
function AddKnowledge() {
  const { state, act } = useDemo();
  if (!state) return null;
  return (
    <Card tone="sunken" style={{ borderStyle: 'dashed' }}>
      <Label icon="upload">Add knowledge · senior uploads a tip</Label>
      <View style={s.wrap}>
        {ADD_PRESETS.map((p) => (
          <Button
            key={p.id}
            small
            variant="secondary"
            icon="upload"
            label={p.label}
            disabled={state.knowledge.some((k) => k.id === p.id)}
            onPress={() => act({ type: 'addKnowledge', presetId: p.id })}
          />
        ))}
      </View>
      <Muted>The AI transcribes the clip, translates it into 6 languages and indexes it with timestamps. An engineer approves it before it is used in answers.</Muted>
    </Card>
  );
}

/** Ask a senior: question box, AI answer with timestamp links, clip player and the tip library. */
export function KnowledgeBase({ initialQuestion }: { initialQuestion?: string }) {
  const { state, lang, t } = useDemo();
  const wide = useIsWide();
  const preset = QUESTIONS.find((q) => q.id === initialQuestion);
  const [text, setText] = useState(preset ? preset.text[lang] : '');
  const [asked, setAsked] = useState<{ text: string; q?: KbQuestion } | null>(preset ? { text: preset.text[lang], q: preset } : null);
  const [clip, setClip] = useState<Clip | null>(null);
  // The scripted AI "searches" for a moment before answering.
  const [thinking, setThinking] = useState(!!preset);
  useEffect(() => {
    if (!thinking) return;
    const id = setTimeout(() => setThinking(false), THINK_MS);
    return () => clearTimeout(id);
  }, [thinking, asked]);
  if (!state) return null;

  const ask = (value: string, q?: KbQuestion) => {
    if (!value.trim()) return;
    setText(value);
    setClip(null);
    setAsked({ text: value, q: q ?? matchQuestion(value) });
    setThinking(true);
  };

  const askBox = (
    <Card>
      <H2>{t('kbTitle')}</H2>
      <View style={s.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('askPlaceholder')}
          placeholderTextColor={Brand.sub}
          style={s.input}
          onSubmitEditing={() => ask(text)}
          returnKeyType="search"
        />
        <Button icon="search" label={t('ask')} onPress={() => ask(text)} disabled={!text.trim()} />
      </View>
      <View style={s.wrap}>
        <Button small variant="secondary" icon="mic" label={t('speak')} onPress={() => ask(QUESTIONS[0].text[lang], QUESTIONS[0])} />
        <Muted>{t('suggested')}:</Muted>
      </View>
      <View style={s.wrap}>
        {QUESTIONS.map((q) => (
          <Chip key={q.id} label={q.text[lang]} onPress={() => ask(q.text[lang], q)} />
        ))}
      </View>
    </Card>
  );

  const result = asked ? (
    thinking ? (
      <Card tone="sunken">
        <Muted>{t('aiSearching')}</Muted>
      </Card>
    ) : (
      <Answer question={asked.q} asked={asked.text} onOpen={setClip} />
    )
  ) : null;

  const library = (
    <View style={{ gap: 10 }}>
      <Label icon="bulb">{t('seniorTips')} · {t('tipsCount', { n: state.knowledge.length })}</Label>
      {state.knowledge.map((k) => (
        <TipCard key={k.id} entry={k} onOpen={setClip} />
      ))}
      {wide ? <AddKnowledge /> : null}
    </View>
  );

  const player = clip ? <ClipPlayer key={`${clip.entryId}-${clip.at}`} clip={clip} onClose={() => setClip(null)} /> : null;

  if (wide) {
    return (
      <View style={s.cols}>
        <View style={{ flex: 1.4, gap: 16 }}>
          {askBox}
          {player}
          {result}
        </View>
        <View style={{ flex: 1, minWidth: 320 }}>{library}</View>
      </View>
    );
  }
  return (
    <View style={{ gap: 16 }}>
      {askBox}
      {player}
      {result}
      {library}
    </View>
  );
}

const s = StyleSheet.create({
  cols: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: Brand.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: Brand.ink, backgroundColor: '#FFFFFF' },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNo: { width: 24, height: 24, borderRadius: 12, backgroundColor: Brand.teal, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, fontWeight: '800', fontSize: 13, overflow: 'hidden' },
  cite: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BFE9E3', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  citeText: { fontSize: 13, fontWeight: '700', color: Brand.tealDark, fontFamily: Fonts?.mono },
  tip: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  tipIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: Brand.mint, alignItems: 'center', justifyContent: 'center' },
  player: { backgroundColor: '#0F2A2E', borderColor: '#1E3B40' },
  playerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  playerTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  playerSub: { fontSize: 12, color: '#9FB6BA' },
  screen: { height: 150, borderRadius: 8, backgroundColor: '#081A1D', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16 },
  caption: { color: '#FFFFFF', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  time: { fontFamily: Fonts?.mono, color: '#FFFFFF', fontSize: 13, fontVariant: ['tabular-nums'] },
  seg: { flexDirection: 'row', gap: 10, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6 },
  segNow: { backgroundColor: '#17393E' },
  segTime: { fontFamily: Fonts?.mono, color: '#2DD4BF', fontSize: 12, width: 34 },
  segText: { flex: 1, color: '#9FB6BA', fontSize: 13, lineHeight: 19 },
});
