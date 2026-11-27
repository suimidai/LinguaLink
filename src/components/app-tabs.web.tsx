import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/components/demo/icon';
import { WelcomeModal } from '@/components/demo/welcome';
import { useIsWide } from '@/components/demo/ui';
import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';

const SIDEBAR = 248;
const PANEL = '#0F2A2E'; // control-room ink
const PANEL_LINE = '#1E3B40';
const PANEL_TEXT = '#9FB6BA';

const RAIL = 76;

/**
 * Web: dark control-room sidebar on big screens. On phone-size screens the same dark menu
 * becomes a slim rail on the left (icon above a short label), so all pages stay one tap away.
 */
export default function AppTabs() {
  const wide = useIsWide();
  const { state, t } = useDemo();
  const reports = state?.jobs.filter((j) => j.stage === 'REPORTED').length ?? 0;
  const openJobs = state?.jobs.filter((j) => j.stage !== 'RESOLVED').length ?? 0;
  // Same badges as the phone app: only this worker's jobs, unread notices, a fresh AI handover.
  const myJobs = state?.jobs.filter((j) => j.assigneeId === state.phoneUserId && j.stage !== 'RESOLVED').length ?? 0;
  const unacked = state?.announcements.filter((a) => a.requireAck && !a.phoneAcked).length ?? 0;
  const latest = state?.handovers[0];
  const newSummary = latest && state && state.now - latest.createdAt < 5 * 60_000;

  return (
    <Tabs>
      <TabSlot style={{ height: '100%', marginLeft: wide ? SIDEBAR : RAIL }} />
      <TabList asChild>
        <Sidebar wide={wide}>
          <TabTrigger name="home" href="/" asChild>
            <NavItem wide={wide} icon={wide ? 'dashboard' : 'home'} label={wide ? 'Dashboard' : t('tab.home')} badge={wide ? reports : 0} />
          </TabTrigger>
          <TabTrigger name="shift" href="/shift" asChild>
            <NavItem wide={wide} icon="chat" label={wide ? 'Shift handover' : t('tab.shift')} badge={wide || !newSummary ? 0 : 'AI'} />
          </TabTrigger>
          <TabTrigger name="jobs" href="/jobs" asChild>
            <NavItem wide={wide} icon="jobs" label={wide ? 'Repair jobs' : t('tab.jobs')} badge={wide ? openJobs : myJobs} badgeTone={wide ? 'neutral' : 'alert'} />
          </TabTrigger>
          <TabTrigger name="knowledge" href="/knowledge" asChild>
            <NavItem wide={wide} icon="bulb" label={wide ? 'Knowledge base' : t('tab.knowledge')} />
          </TabTrigger>
          <TabTrigger name="announcements" href="/announcements" asChild>
            <NavItem wide={wide} icon="announce" label={wide ? 'Announcements' : t('tab.notices')} badge={wide ? 0 : unacked} />
          </TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild>
            <NavItem wide={wide} icon="calendar" label={wide ? 'Calendar' : t('calendarTitle')} />
          </TabTrigger>
          <TabTrigger name="manuals" href="/manuals" asChild>
            <NavItem wide={wide} icon="manual" label={wide ? 'Manuals' : t('manualsTitle')} />
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
}: TabTriggerSlotProps & { wide: boolean; icon: IconName; label: string; badge?: number | string; badgeTone?: 'alert' | 'neutral' }) {
  const fg = isFocused ? '#FFFFFF' : PANEL_TEXT;
  if (!wide) {
    // Left rail item: icon above a short label, same dark style as the desktop sidebar.
    return (
      <Pressable {...(props as PressableProps)} style={({ pressed }) => [s.tab, isFocused && s.itemActive, pressed && { opacity: 0.7 }]} accessibilityLabel={label}>
        {isFocused ? <View style={s.activeBar} /> : null}
        <View style={s.tabIcon}>
          <Icon name={icon} size={21} color={isFocused ? Brand.teal : fg} />
          {badge ? (
            <View style={[s.badge, s.tabBadge, badgeTone === 'neutral' && s.badgeNeutral]}>
              <Text style={[s.badgeText, { fontSize: 10 }]}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={2} style={[s.tabText, { color: fg }, isFocused && { fontWeight: '700' }]}>
          {label}
        </Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      {...(props as PressableProps)}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        s.item,
        hovered && !isFocused && { backgroundColor: '#163539' },
        isFocused && s.itemActive,
        pressed && { opacity: 0.8 },
      ]}>
      {isFocused ? <View style={s.activeBar} /> : null}
      <Icon name={icon} size={19} color={isFocused ? Brand.teal : fg} />
      <Text style={[s.itemText, { color: fg }, isFocused && { fontWeight: '700' }]}>{label}</Text>
      {badge ? (
        <View style={[s.badge, badgeTone === 'neutral' && s.badgeNeutral]}>
          <Text style={s.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** Who is using this computer: their typed name (click to change), else the demo engineer Kenji. */
function FooterUser() {
  const { me, t } = useDemo();
  const [renaming, setRenaming] = useState(false);
  return (
    <>
      <Text style={s.footerName}>{me?.name ?? 'Kenji'}</Text>
      {me ? (
        <Pressable onPress={() => setRenaming(true)} accessibilityRole="button">
          <Text style={[s.footerRole, { textDecorationLine: 'underline' }]}>{t('changeName')}</Text>
        </Pressable>
      ) : (
        <Text style={s.footerRole}>Maintenance Engineer</Text>
      )}
      <WelcomeModal open={renaming} onClose={() => setRenaming(false)} />
    </>
  );
}

function Sidebar({ wide, children, ...props }: TabListProps & { wide: boolean }) {
  if (!wide) {
    return (
      <View {...props} style={s.rail}>
        <View style={[s.logo, { alignSelf: 'center', marginBottom: 6 }]}>
          <Image source={require('@/assets/images/logo-mark.png')} style={s.logoImg} contentFit="contain" />
        </View>
        {children}
      </View>
    );
  }
  return (
    <View {...props} style={s.sidebar}>
      <View style={s.brand}>
        <View style={s.logo}>
          <Image source={require('@/assets/images/logo-mark.png')} style={s.logoImg} contentFit="contain" />
        </View>
        <View>
          <Text style={s.brandName}>LinguaLink</Text>
          <Text style={s.brandSub}>MAIN PLANT · LINE 1–2</Text>
        </View>
      </View>
      <Text style={s.section}>OPERATIONS</Text>
      <View style={s.nav}>{children}</View>
      {(
        <View style={s.footer}>
          <View style={s.liveRow}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE · DEMO DATA</Text>
          </View>
          <FooterUser />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sidebar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: SIDEBAR, backgroundColor: PANEL, paddingVertical: 24, paddingHorizontal: 16, gap: 16 },
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: RAIL, backgroundColor: PANEL, paddingVertical: 14, paddingHorizontal: 6, gap: 4, zIndex: 10 },
  tab: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8, paddingHorizontal: 2, borderRadius: 8, overflow: 'hidden' },
  tabIcon: { width: 40, height: 26, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 12 },
  tabBadge: { position: 'absolute', top: -4, right: -2, minWidth: 18, height: 16, borderRadius: 8, paddingHorizontal: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingBottom: 8 },
  logo: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  logoImg: { width: 32, height: 32 },
  brandName: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
  brandSub: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: PANEL_TEXT, marginTop: 2 },
  section: { fontSize: 10, fontWeight: '800', letterSpacing: 1.6, color: '#5F7C81', paddingHorizontal: 12, marginTop: 8 },
  nav: { gap: 2 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, overflow: 'hidden' },
  itemActive: { backgroundColor: '#17393E' },
  activeBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, backgroundColor: Brand.teal },
  itemText: { flex: 1, fontSize: 15, fontWeight: '500' },
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
