import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

import { Icon } from './icon';
import { MachineCard } from './machine-card';
import { Button, Card, Label, Muted, Tag } from './ui';

/** Machine Live is a beta feature: it stays off the main dashboard and opens in a pop-up. */
export function MachineLiveButton() {
  const [open, setOpen] = useState(false);
  const { state } = useDemo();
  const problem = state?.machines.some((m) => m.status !== 'RUNNING');
  return (
    <>
      <View style={s.btnWrap}>
        <Button small variant="secondary" icon="machine" label="Machine live · Beta" onPress={() => setOpen(true)} />
        {problem ? <View style={s.alertDot} /> : null}
      </View>
      <MachineLiveModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function MachineLiveModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { state } = useDemo();
  const machines = state?.machines ?? [];
  const running = machines.filter((m) => m.status === 'RUNNING').length;
  const groups = [...new Set(machines.map((m) => m.group))];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* Inner Pressable stops taps on the panel from closing it. */}
        <Pressable style={s.panel} onPress={() => {}}>
          <Card style={{ gap: 16, flex: 1 }}>
            <View style={s.head}>
              <View style={{ gap: 6, flex: 1 }}>
                <View style={s.row}>
                  <Text style={s.title}>Machine live</Text>
                  <Tag label="BETA" color="#9A6700" />
                </View>
                <Muted>
                  {running}/{machines.length} machines running · status is set by people, not sensors
                </Muted>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
                <Icon name="close" size={22} color={Brand.sub} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: 20 }}>
              {groups.map((g) => (
                <View key={g} style={{ gap: 10 }}>
                  <Label icon="group" color={Brand.tealDark}>
                    {g}
                  </Label>
                  <View style={s.machines}>
                    {machines
                      .filter((m) => m.group === g)
                      .map((m) => (
                        <MachineCard key={m.id} machine={m} />
                      ))}
                  </View>
                </View>
              ))}
              <View style={s.row}>
                <Icon name="eye" size={15} color={Brand.sub} />
                <Muted style={{ flex: 1 }}>
                  Beta: an operator reports a problem, a technician fixes it. No remote control, for safety.
                </Muted>
              </View>
            </ScrollView>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  btnWrap: { position: 'relative' },
  alertDot: { position: 'absolute', top: -3, right: -3, width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.red, borderWidth: 2, borderColor: '#FFFFFF' },
  backdrop: { flex: 1, backgroundColor: 'rgba(10,30,35,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 1000, maxHeight: '90%' },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  machines: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
});
