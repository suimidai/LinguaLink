import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { machineName } from '@/demo/i18n';
import { PROBLEMS } from '@/demo/mock/machines';

import { Icon } from './icon';
import { useMe } from './shift-chat';
import { Body, Button, Card, Chip, H2, Label, Muted, Tag } from './ui';

/** "Report a problem" button + pop-up: pick a machine, tap a common problem or describe it in any language. */
export function ReportProblemButton({ small, style }: { small?: boolean; style?: object }) {
  const { t } = useDemo();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button small={small} variant="danger" icon="report" label={t('reportTitle')} onPress={() => setOpen(true)} style={style} />
      {open ? <ReportProblemModal onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function ReportProblemModal({ onClose }: { onClose: () => void }) {
  const { state, act, lang, t } = useDemo();
  const me = useMe();
  const [machineId, setMachineId] = useState<string | null>(null);
  const [pb, setPb] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  if (!state) return null;

  const machine = state.machines.find((m) => m.id === machineId);
  const busy = machine && machine.status !== 'RUNNING';
  const canSend = !!machine && !busy && (pb !== null || !!text.trim()) && !sending;

  const send = async () => {
    if (!canSend || !machine) return;
    setSending(true);
    try {
      await act({ type: 'report', machineId: machine.id, reporterId: me, lang, ...(text.trim() ? { text: text.trim() } : { pb: pb ?? 0 }) });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel={t('close')}>
        <Pressable style={s.panel} onPress={() => {}}>
          <Card style={{ gap: 12 }}>
            <View style={s.head}>
              <H2 style={{ flex: 1 }}>{t('reportTitle')}</H2>
              <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={onClose} hitSlop={10}>
                <Icon name="close" size={22} color={Brand.sub} />
              </Pressable>
            </View>
            {sent ? (
              <>
                <Tag label={t('reportSent')} color={Brand.greenDark} icon="checkCircle" />
                <Button icon="check" label={t('close')} onPress={onClose} />
              </>
            ) : (
              <ScrollView contentContainerStyle={{ gap: 12 }}>
                <Label>{t('pickMachine')}</Label>
                <View style={s.wrap}>
                  {state.machines.map((m) => (
                    <Chip
                      key={m.id}
                      icon={m.status === 'RUNNING' ? 'machine' : 'warning'}
                      label={`${machineName(t, m.label)} · ${t(m.typeKey)}`}
                      selected={machineId === m.id}
                      onPress={() => setMachineId(m.id)}
                    />
                  ))}
                </View>
                {busy ? <Muted style={{ color: Brand.redDark }}>{t('alreadyReported')}</Muted> : null}
                <Label>{t('commonProblems')}</Label>
                <View style={s.wrap}>
                  {PROBLEMS.map((_, i) => (
                    <Chip
                      key={i}
                      label={t(`pb.${i}.title`)}
                      selected={pb === i && !text.trim()}
                      onPress={() => {
                        setPb(i);
                        setText('');
                      }}
                    />
                  ))}
                </View>
                <TextInput
                  value={text}
                  onChangeText={(v) => {
                    setText(v);
                    if (v) setPb(null);
                  }}
                  placeholder={t('describeProblem')}
                  placeholderTextColor={Brand.sub}
                  style={s.input}
                  multiline
                  maxLength={300}
                />
                {text.trim() ? (
                  <View style={s.row}>
                    <Icon name="translate" size={13} color={Brand.tealDark} />
                    <Body style={{ fontSize: 13, color: Brand.tealDark, flex: 1 }}>{t('inYourLang')}</Body>
                  </View>
                ) : null}
                <Button icon="send" label={sending ? t('translating') : t('sendReport')} variant="danger" onPress={send} disabled={!canSend} />
              </ScrollView>
            )}
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(10,30,35,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 520, maxHeight: '92%' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { minHeight: 80, borderWidth: 1, borderColor: Brand.border, borderRadius: 8, padding: 12, fontSize: 15, color: Brand.ink, backgroundColor: '#FFFFFF', textAlignVertical: 'top' },
});
