import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

import { Icon } from './icon';
import { ManualViewer } from './manual-viewer';
import { H2 } from './ui';

/** A machine manual in a pop-up, opened from a repair job (works on phones and the web). */
export function ManualModal({ manualId, onClose }: { manualId: string | null; onClose: () => void }) {
  const { t } = useDemo();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!manualId} animationType="slide" onRequestClose={onClose}>
      <View style={[s.wrap, { paddingTop: insets.top + 8 }]}>
        <View style={s.head}>
          <H2>{t('manualsTitle')}</H2>
          <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={onClose} hitSlop={12}>
            <Icon name="close" size={24} color={Brand.sub} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 24 }]}>
          {manualId ? <ManualViewer key={manualId} initialId={manualId} /> : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Brand.canvas },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  body: { paddingHorizontal: 16, gap: 16, maxWidth: 1100, width: '100%', alignSelf: 'center' },
});
