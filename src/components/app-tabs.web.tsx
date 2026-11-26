import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/components/demo/icon';
import { useIsWide } from '@/components/demo/ui';
import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

const SIDEBAR = 248;
const PANEL = '#0F2A2E'; // control-room ink
const PANEL_LINE = '#1E3B40';
const PANEL_TEXT = '#9FB6BA';

/** Web: dark control-room sidebar on big screens, light top bar on narrow windows. */
export default function AppTabs() {
  const wide = useIsWide();
  const { state } = useDemo();
  const reports = state?.jobs.filter((j) => j.stage === 'REPORTED').length ?? 0;
  const openJobs = state?.jobs.filter((j) => j.stage !== 'RESOLVED').length ?? 0;

  return (
    <Tabs>
      <TabSlot style={wide ? { height: '100%', marginLeft: SIDEBAR } : { height: '100%', paddingTop: 56 }} />
      <TabList asChild>
        <Sidebar wide={wide}>
          <TabTrigger name="home" href="/" asChild>
            <NavItem wide={wide} icon="dashboard" label={wide ? 'Dashboard' : 'Home'} badge={reports} />
          </TabTrigger>
          <TabTrigger name="shift" href="/shift" asChild>
            <NavItem wide={wide} icon="chat" label={wide ? 'Shift handover' : 'Shift'} />
          </TabTrigger>
          <TabTrigger name="jobs" href="/jobs" asChild>
            <NavItem wide={wide} icon="jobs" label={wide ? 'Repair jobs' : 'Jobs'} badge={openJobs} badgeTone="neutral" />
          </TabTrigger>
          <TabTrigger name="knowledge" href="/knowledge" asChild>
            <NavItem wide={wide} icon="bulb" label={wide ? 'Knowledge base' : 'Knowledge'} />
          </TabTrigger>
          <TabTrigger name="announcements" href="/announcements" asChild>
            <NavItem wide={wide} icon="announce" label={wide ? 'Announcements' : 'Notices'} />
          </TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild>
            <NavItem wide={wide} icon="calendar" label="Calendar" />
          </TabTrigger>
          <TabTrigger name="manuals" href="/manuals" asChild>
            <NavItem wide={wide} icon="manual" label="Manuals" />
          </TabTrigger>
        </Sidebar>
      </TabList>
    </Tabs>
  );
}

function NavItem({
  isFocused,
  wide,
  icon,
  label,
  badge,
  badgeTone = 'alert',
  ...props
}: TabTriggerSlotProps & { wide: boolean; icon: IconName; label: string; badge?: number; badgeTone?: 'alert' | 'neutral' }) {
  const fg = wide ? (isFocused ? '#FFFFFF' : PANEL_TEXT) : isFocused ? Brand.tealDark : Brand.sub;
  return (
    <Pressable
      {...(props as PressableProps)}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        wide ? s.item : s.itemNarrow,
        hovered && !isFocused && (wide ? { backgroundColor: '#163539' } : { backgroundColor: Brand.canvas }),
        isFocused && (wide ? s.itemActive : s.itemActiveNarrow),
        pressed && { opacity: 0.8 },
      ]}>
      {wide && isFocused ? <View style={s.activeBar} /> : null}
      <Icon name={icon} size={wide ? 19 : 16} color={isFocused && wide ? Brand.teal : fg} />
      <Text style={[wide ? s.itemText : s.itemTextNarrow, { color: fg }, isFocused && { fontWeight: '700' }]}>{label}</Text>
      {badge ? (
        <View style={[s.badge, badgeTone === 'neutral' && s.badgeNeutral]}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Sidebar({ wide, children, ...props }: TabListProps & { wide: boolean }) {
  return (
    <View {...props} style={wide ? s.sidebar : s.topbar}>
      <View style={s.brand}>
        <View style={s.logo}>
          <Icon name="machine" size={20} color="#FFFFFF" />
        </View>
        <View>
          <Text style={[s.brandName, !wide && { color: Brand.ink }]}>LinguaLink</Text>
          {wide ? <Text style={s.brandSub}>MAIN PLANT · LINE 1–2</Text> : null}
        </View>
      </View>
      {wide ? <Text style={s.section}>OPERATIONS</Text> : null}
      <View style={wide ? s.nav : s.navNarrow}>{children}</View>
      {wide ? (
        <View style={s.footer}>
          <View style={s.liveRow}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE · DEMO DATA</Text>
          </View>
          <Text style={s.footerName}>Kenji</Text>
          <Text style={s.footerRole}>Maintenance Engineer</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR, backgroundColor: PANEL, paddingVertical: 24, paddingHorizontal: 16, gap: 16 },
  topbar: { position: 'absolute', left: 0, right: 0, top: 0, height: 56, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Brand.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingBottom: 8 },
  logo: { width: 36, height: 36, borderRadius: 8, backgroundColor: Brand.teal, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  brandSub: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: PANEL_TEXT, marginTop: 2 },
  section: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: '#5F7C81', paddingHorizontal: 12, marginTop: 8 },
  nav: { gap: 2 },
  navNarrow: { flexDirection: 'row', gap: 2, flex: 1, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, overflow: 'hidden' },
  itemNarrow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6 },
  itemActive: { backgroundColor: '#17393E' },
  itemActiveNarrow: { backgroundColor: Brand.mint },
  activeBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, backgroundColor: Brand.teal },
  itemText: { flex: 1, fontSize: 15, fontWeight: '500' },
  itemTextNarrow: { fontSize: 13, fontWeight: '600' },
  badge: { minWidth: 22, height: 20, borderRadius: 6, backgroundColor: Brand.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeNeutral: { backgroundColor: '#2C4F55' },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', fontVariant: ['tabular-nums'] },
  footer: { marginTop: 'auto', gap: 2, borderTopWidth: 1, borderTopColor: PANEL_LINE, paddingTop: 16, paddingHorizontal: 8 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.green },
  liveText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: PANEL_TEXT },
  footerName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  footerRole: { fontSize: 12, color: PANEL_TEXT },
});
