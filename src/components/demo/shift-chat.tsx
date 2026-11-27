import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { LANG_NAMES } from '@/demo/i18n-lingualink';
import { clock } from '@/demo/mock/knowledge';
import { BOLT_NOTE, CHAT_PRESETS, PHOTO_CAPTION } from '@/demo/mock/shift';
import { LANGS, type ChatMessage, type HandoverSummary, type Translated } from '@/demo/types';

import { Icon, type IconName } from './icon';
import { Body, Button, Card, Chip, Label, Muted, ProgressBar, Tag, timeAgo, useIsWide } from './ui';

/** Who is typing on this device: the person who typed their name, else the demo phone user / engineer Kenji. */
export function useMe() {
  const { state, me } = useDemo();
  const wide = useIsWide();
  if (me) return me.id;
  return wide ? 'eng-1' : (state?.phoneUserId ?? 'tech-1');
}

const Dot = () => <Text style={s.dot}>·</Text>;

/** Done / To do / Watch out lists, in the reader's language. */
function SummaryLists({ done, todo, watchOut }: { done: Translated[]; todo: Translated[]; watchOut: Translated[] }) {
  const { lang, t } = useDemo();
  const section = (title: string, items: Translated[], color: string, icon: IconName) => (
    <View style={{ gap: 6 }}>
      <View style={s.secHead}>
        <Icon name={icon} size={14} color={color} />
        <Text style={[s.secTitle, { color }]}>
          {title} · {items.length}
        </Text>
      </View>
      {items.length === 0 ? <Muted>—</Muted> : null}
      {items.map((it, i) => (
        <View key={i} style={s.secItem}>
          <View style={[s.bullet, { backgroundColor: color }]} />
          <Body style={{ fontSize: 14, flex: 1 }}>{it[lang]}</Body>
        </View>
      ))}
    </View>
  );
  return (
    <View style={{ gap: 12 }}>
      {section(t('sumDone'), done, Brand.greenDark, 'checkCircle')}
      {section(t('sumTodo'), todo, '#9A6700', 'clock')}
      {section(t('sumWatch'), watchOut, Brand.redDark, 'warning')}
    </View>
  );
}

/** Live AI summary of the current shift, rewritten after every message or tick. */
export function LiveSummaryCard() {
  const { state, t, summaryBusy } = useDemo();
  const live = state?.liveSummary;
  if (!state || !live || live.shift !== state.shift) return null;
  return (
    <Card tone="accent">
      <View style={s.bannerHead}>
        <Tag label={t('aiSummary')} color={Brand.tealDark} icon="ai" />
        <View style={s.row}>
          {summaryBusy ? (
            <Muted style={{ color: Brand.tealDark }}>{t('aiUpdating')}</Muted>
          ) : (
            <>
              <View style={s.liveDot} />
              <Muted>
                {t('liveSummary', { shift: live.shift })} · {timeAgo(live.updatedAt, state.now, t)}
              </Muted>
            </>
          )}
        </View>
      </View>
      <View style={summaryBusy ? { opacity: 0.55 } : undefined}>
        <SummaryLists done={live.done} todo={live.todo} watchOut={live.watchOut} />
      </View>
    </Card>
  );
}

/** AI handover summary from the previous shift (PRD FR-CH-03). */
export function HandoverBanner({ handover }: { handover: HandoverSummary }) {
  const { state, t } = useDemo();
  const ready = (state?.now ?? 0) >= handover.readyAt;
  return (
    <Card tone="accent">
      <View style={s.bannerHead}>
        <Tag label={t('aiSummary')} color={Brand.tealDark} icon="ai" />
        <View style={s.row}>
          <Icon name="pin" size={13} color={Brand.tealDark} />
          <Muted>{t('handoverFrom', { from: handover.fromShift, to: handover.toShift })}</Muted>
        </View>
      </View>
      {!ready ? <Muted>{t('summarizing')}</Muted> : <SummaryLists done={handover.done} todo={handover.todo} watchOut={handover.watchOut} />}
    </Card>
  );
}

/** Interactive shift checklist: tap ✓, synced live to everyone (PRD FR-CH-01). */
export function Checklist() {
  const { state, act, lang, t } = useDemo();
  const me = useMe();
  if (!state) return null;
  const done = state.checklist.filter((c) => c.done).length;
  return (
    <Card>
      <View style={s.bannerHead}>
        <Label icon="checkCircle">{t('checklistTitle', { shift: state.shift })}</Label>
        <Muted>{t('checklistProgress', { done, total: state.checklist.length })}</Muted>
      </View>
      <ProgressBar value={state.checklist.length ? done / state.checklist.length : 0} color={Brand.green} />
      {state.nextShiftTasks?.length ? (
        <View style={s.row}>
          <Icon name="clock" size={13} color={Brand.tealDark} />
          <Muted style={{ color: Brand.tealDark }}>{t('nextShiftTasks', { n: state.nextShiftTasks.length })}</Muted>
        </View>
      ) : null}
      <View style={{ gap: 2 }}>
        {state.checklist.map((c) => {
          const who = state.people.find((p) => p.id === c.doneBy);
          return (
            <Pressable
              key={c.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: c.done }}
              onPress={() => act({ type: 'check', itemId: c.id, userId: me })}
              style={({ pressed }) => [s.check, pressed && { opacity: 0.7 }]}>
              <View style={[s.box, c.done && s.boxDone]}>{c.done ? <Icon name="check" size={14} color="#FFFFFF" /> : null}</View>
              <View style={{ flex: 1, gap: 1 }}>
                <Body style={[{ fontSize: 15 }, c.done && { color: Brand.sub, textDecorationLine: 'line-through' }]}>{c.label[lang]}</Body>
                {c.done && c.doneAt ? (
                  <Muted>
                    ✓ {who?.id === me ? t('you') : who?.name} <Dot /> {timeAgo(c.doneAt, state.now, t)}
                    {c.viaChat ? (
                      <>
                        {' '}
                        <Dot /> <Text style={{ color: Brand.tealDark }}>{t('viaChat')}</Text>
                      </>
                    ) : null}
                  </Muted>
                ) : null}
                {!c.done && c.addedBy ? (
                  <Muted>
                    + {state.people.find((p) => p.id === c.addedBy)?.name ?? '—'} <Dot /> <Text style={{ color: Brand.tealDark }}>{t('viaChat')}</Text>
                  </Muted>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const { state, lang, t } = useDemo();
  const me = useMe();
  const [orig, setOrig] = useState(false);
  if (!state) return null;
  if (msg.system) {
    return (
      <View style={s.system}>
        <Icon name="ai" size={13} color={Brand.tealDark} />
        <Muted style={{ color: Brand.tealDark }}>{msg.text[lang]}</Muted>
      </View>
    );
  }
  const author = state.people.find((p) => p.id === msg.authorId);
  const mine = msg.authorId === me;
  const foreign = msg.original !== lang;
  const shown = orig ? msg.text[msg.original] : msg.text[lang];
  return (
    <View style={[s.msg, mine && { alignSelf: 'flex-end' }]}>
      <View style={[s.row, mine && { justifyContent: 'flex-end' }]}>
        <Text style={s.author}>{mine ? t('you') : author?.name}</Text>
        <Muted>
          {LANGS.find((l) => l.code === msg.original)?.label} <Dot /> {timeAgo(msg.createdAt, state.now, t)}
        </Muted>
        {msg.watchOut ? <Tag label={msg.aiFlagged ? `${t('watchOutTag')} · ${t('aiFlagged')}` : t('watchOutTag')} color={Brand.redDark} icon={msg.aiFlagged ? 'ai' : 'warning'} /> : null}
      </View>
      <View style={[s.bubble, mine ? s.bubbleMine : null, msg.watchOut && s.bubbleWatch]}>
        {msg.kind === 'voice' ? (
          <View style={s.voice}>
            <Icon name="play" size={14} color={Brand.tealDark} />
            <View style={s.wave}>
              {Array.from({ length: 22 }, (_, i) => (
                <View key={i} style={[s.waveBar, { height: 4 + ((i * 7) % 13) }]} />
              ))}
            </View>
            <Muted>{clock(msg.durationSec ?? 0)}</Muted>
          </View>
        ) : null}
        {msg.photo ? (
          <View style={s.photo}>
            <Icon name="photo" size={22} color={Brand.sub} />
            <Muted>{PHOTO_CAPTION[msg.photo][lang]}</Muted>
          </View>
        ) : null}
        {msg.kind === 'file' && msg.fileName ? (
          <View style={s.file}>
            <Icon name="file" size={16} color={Brand.tealDark} />
            <Text style={s.fileName}>{msg.fileName}</Text>
          </View>
        ) : null}
        <Body style={{ fontSize: 15 }}>
          {msg.kind === 'voice' ? `${t('voiceNote')}: ` : ''}
          {shown}
        </Body>
      </View>
      {msg.pending && state.now - msg.createdAt < 120_000 ? (
        <View style={[s.row, mine && { justifyContent: 'flex-end' }]}>
          <Icon name="translate" size={12} color={Brand.tealDark} />
          <Muted style={{ color: Brand.tealDark }}>{t('translating')}</Muted>
        </View>
      ) : foreign ? (
        msg.translated ? (
          <Pressable onPress={() => setOrig((o) => !o)} style={[s.row, mine && { justifyContent: 'flex-end' }]}>
            <Icon name="translate" size={12} color={Brand.sub} />
            <Muted>
              {t('translatedFrom', { lang: LANG_NAMES[lang][msg.original] })} <Dot />{' '}
              <Text style={s.link}>{orig ? t('showTranslation') : t('showOriginal')}</Text>
            </Muted>
          </Pressable>
        ) : (
          <Muted>{t('notTranslated')}</Muted>
        )
      ) : null}
    </View>
  );
}

/** Notes as text, voice, photo or file. Presets are pre-translated (PRD FR-CH-02). */
function Composer() {
  const { act, lang, t } = useDemo();
  const me = useMe();
  const [text, setText] = useState('');
  const [watch, setWatch] = useState(false);
  // Saving is quick now (the translation follows in the background); this just stops double sends.
  const [busy, setBusy] = useState(false);
  const send = async (presetId?: string) => {
    if (busy || (!presetId && !text.trim())) return;
    const typed = text;
    setText('');
    setWatch(false);
    if (presetId) {
      await act({ type: 'chat', authorId: me, lang, presetId, watchOut: watch || undefined });
      return;
    }
    setBusy(true);
    try {
      await act({ type: 'chat', authorId: me, lang, text: typed, watchOut: watch });
    } finally {
      setBusy(false);
    }
  };
  const quick = CHAT_PRESETS.filter((p) => p.kind === 'text');
  return (
    <Card>
      <Label>{t('quickNotes')}</Label>
      <View style={s.wrap}>
        {quick.map((p) => (
          <Chip key={p.id} label={p.text[lang]} onPress={() => send(p.id)} />
        ))}
      </View>
      <View style={s.wrap}>
        <Chip icon="warning" label={t('watchOutTag')} selected={watch} color={Brand.red} onPress={() => setWatch((w) => !w)} />
        <Button small variant="secondary" icon="mic" label={t('record')} onPress={() => send(me === 'eng-1' ? 'v-noise' : BOLT_NOTE.id)} />
        <Button small variant="secondary" icon="photo" label={t('attachPhoto')} onPress={() => send('p-sensor')} />
        <Button small variant="secondary" icon="file" label={t('attachFile')} onPress={() => send('f-spec')} />
      </View>
      <View style={s.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('typeMessage')}
          placeholderTextColor={Brand.sub}
          style={s.input}
          onSubmitEditing={() => send()}
          returnKeyType="send"
          maxLength={300}
        />
        <Button icon="send" onPress={() => send()} disabled={busy || !text.trim()} />
      </View>

    </Card>
  );
}

function Messages() {
  const { state } = useDemo();
  if (!state) return null;
  return (
    <Card style={{ gap: 16 }}>
      {state.chat.slice(-30).map((m) => (
        <MessageBubble key={m.id} msg={m} />
      ))}
    </Card>
  );
}

/** The whole shift chat screen: pinned AI banner, checklist, messages, composer. */
export function ShiftChat() {
  const { state, act, t, catchUp } = useDemo();
  const wide = useIsWide();
  const [ending, setEnding] = useState(false);
  // When the chat opens, let the AI read the messages that are already there (once per visit).
  const loaded = !!state;
  const caughtUp = useRef(false);
  useEffect(() => {
    if (!loaded || caughtUp.current) return;
    caughtUp.current = true;
    void catchUp();
  }, [loaded, catchUp]);
  if (!state) return null;
  const latest = state.handovers[0];
  const endShift = async () => {
    if (ending) return;
    setEnding(true);
    try {
      await act({ type: 'endShift' });
    } finally {
      setEnding(false);
    }
  };
  const endBtn = <Button icon="ai" label={ending ? t('aiWriting') : t('endShift')} disabled={ending} onPress={endShift} />;

  if (wide) {
    return (
      <View style={s.cols}>
        <View style={{ flex: 1.6, gap: 16 }}>
          <LiveSummaryCard />
          {latest ? <HandoverBanner handover={latest} /> : null}
          <Messages />
          <Composer />
        </View>
        <View style={{ flex: 1, gap: 16, minWidth: 320 }}>
          <Checklist />
          {endBtn}
          {!latest ? <Muted>{t('noHandover')}</Muted> : null}
        </View>
      </View>
    );
  }
  return (
    <View style={{ gap: 16 }}>
      <LiveSummaryCard />
      {latest ? <HandoverBanner handover={latest} /> : null}
      <Checklist />
      <Messages />
      <Composer />
      {endBtn}
    </View>
  );
}

/** Small card for the home screens: the latest handover, or how the current shift is going. */
export function HandoverCard() {
  const { state, t } = useDemo();
  if (!state) return null;
  const latest = state.handovers[0];
  const done = state.checklist.filter((c) => c.done).length;
  const ready = latest && state.now >= latest.readyAt;
  return (
    <Card tone="accent">
      <Tag label={latest ? t('handoverReady', { from: latest.fromShift }) : t('shiftLive', { shift: state.shift })} color={Brand.tealDark} icon={latest ? 'ai' : 'chat'} />
      {latest ? (
        ready ? (
          <Body style={{ fontWeight: '700' }}>
            {t('sumDone')} {latest.done.length} · {t('sumTodo')} {latest.todo.length} · {t('sumWatch')} {latest.watchOut.length}
          </Body>
        ) : (
          <Muted>{t('summarizing')}</Muted>
        )
      ) : (
        <Body>{t('checklistProgress', { done, total: state.checklist.length })}</Body>
      )}
      <Button small icon="chat" label={latest ? t('readSummary') : t('openChat')} variant="secondary" onPress={() => router.push('/shift')} style={{ alignSelf: 'flex-start' }} />
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  dot: { color: Brand.sub },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Brand.green },
  cols: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  bannerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  secItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingLeft: 2 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  check: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 8 },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#C9D5D8', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxDone: { backgroundColor: Brand.green, borderColor: Brand.green },
  system: { flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'center', backgroundColor: Brand.mint, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  msg: { gap: 4, maxWidth: '88%', alignSelf: 'flex-start' },
  author: { fontSize: 13, fontWeight: '800', color: Brand.ink },
  bubble: { backgroundColor: '#F1F5F6', borderRadius: 10, padding: 12, gap: 8 },
  bubbleMine: { backgroundColor: Brand.mint },
  bubbleWatch: { borderLeftWidth: 3, borderLeftColor: Brand.red },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1, minWidth: 100 },
  waveBar: { width: 3, borderRadius: 2, backgroundColor: Brand.teal },
  photo: { height: 90, borderRadius: 8, backgroundColor: '#E3EAEC', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8 },
  file: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 6, borderWidth: 1, borderColor: Brand.border, paddingHorizontal: 8, paddingVertical: 6, alignSelf: 'flex-start' },
  fileName: { fontSize: 13, fontWeight: '700', color: Brand.tealDark },
  link: { color: Brand.tealDark, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: Brand.border, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: Brand.ink, backgroundColor: '#FFFFFF' },
});
