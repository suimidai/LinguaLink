import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Brand, Fonts } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { translate, type Params, type TFunction } from '@/demo/i18n';
import { LANGS, type Lang, type MachineStatus } from '@/demo/types';
import { useHydrated } from '@/hooks/use-hydrated';

import { Icon, type IconName } from './icon';

/*
 * Design direction: "factory control room": calm, precise, industrial.
 * Hairline borders instead of shadows, uppercase spaced labels, monospaced
 * live numbers, one accent (LinguaLink teal), status shown by colour stripes.
 */

/** Spacing scale (4 px grid). */
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
/** Type scale with strong jumps. */
export const T = { label: 11, small: 13, body: 15, h3: 17, h2: 20, h1: 30, metric: 28 } as const;
export const RADIUS = 10;

export const WIDE_MIN = 900;

/**
 * True on the big-screen web dashboard layout.
 * Before hydration the server can't know the window size, so web assumes the
 * wide dashboard on both server and first client render, then uses the real width.
 */
export function useIsWide() {
  const { width } = useWindowDimensions();
  const hydrated = useHydrated();
  // Server rendering doesn't report 'web', so only real phones are excluded here.
  if (Platform.OS === 'ios' || Platform.OS === 'android') return false;
  return hydrated ? width >= WIDE_MIN : true;
}

export function Screen({
  eyebrow,
  title,
  subtitle,
  right,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const wide = useIsWide();
  const { error, state, t } = useDemo();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.screenContent,
        wide ? styles.screenWide : { paddingTop: insets.top + S.md, paddingBottom: insets.bottom + BottomTabInset + S.xl },
      ]}>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: S.xs }}>
          {eyebrow ? <Label>{eyebrow}</Label> : null}
          <Text style={[styles.title, !wide && { fontSize: 26 }]}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {error ? (
        <Card tone="danger">
          <Body style={{ color: Brand.redDark }}>
            {t('serverError')} ({error})
          </Body>
        </Card>
      ) : null}
      {!state && !error ? <ActivityIndicator color={Brand.teal} style={{ marginTop: 40 }} /> : null}
      {state ? children : null}
    </ScrollView>
  );
}

type Tone = 'default' | 'danger' | 'success' | 'accent' | 'warning' | 'sunken';

const TONES: Record<Tone, { bg: string; border: string; stripe?: string }> = {
  default: { bg: Brand.card, border: Brand.border },
  sunken: { bg: '#EEF3F4', border: '#E1E8EA' },
  danger: { bg: Brand.redBg, border: '#F7C9CB', stripe: Brand.red },
  success: { bg: Brand.greenBg, border: '#BFE7D4', stripe: Brand.green },
  accent: { bg: Brand.mint, border: '#BFE9E3', stripe: Brand.teal },
  warning: { bg: Brand.amberBg, border: '#F6DDAA', stripe: Brand.amber },
};

/** Flat card with a hairline border; coloured tones get a status stripe on the left edge. */
export function Card({ children, style, tone = 'default' }: { children: ReactNode; style?: StyleProp<ViewStyle>; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <View style={[styles.card, { backgroundColor: t.bg, borderColor: t.border }, t.stripe ? { borderLeftWidth: 4, borderLeftColor: t.stripe } : null, style]}>
      {children}
    </View>
  );
}

/** Uppercase, spaced section label: the "control panel" voice. */
export function Label({ children, color = Brand.sub, icon, style }: { children: ReactNode; color?: string; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.labelRow, style]}>
      {icon ? <Icon name={icon} size={13} color={color} /> : null}
      <Text style={[styles.label, { color }]}>{children}</Text>
    </View>
  );
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}

export function Body({ children, style, numberOfLines }: { children: ReactNode; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  return (
    <Text style={[styles.body, style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Muted({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

/** Monospaced, tabular numbers for live readings (digits don't jump). */
export function Metric({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.metric, style]}>{children}</Text>;
}

/** Small status tag: coloured square + uppercase text. */
export function Tag({ label, color = Brand.tealDark, icon }: { label: string; color?: string; icon?: IconName }) {
  return (
    <View style={styles.tag}>
      {icon ? <Icon name={icon} size={12} color={color} /> : <View style={[styles.tagDot, { backgroundColor: color }]} />}
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

/** Kept for soft badges (counts, targets). */
export function Pill({ label, color = Brand.tealDark, bg = Brand.mint, style }: { label: string; color?: string; bg?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const BUTTONS: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Brand.teal, fg: '#FFFFFF', border: Brand.teal },
  secondary: { bg: '#FFFFFF', fg: Brand.tealDark, border: '#BFE9E3' },
  danger: { bg: Brand.red, fg: '#FFFFFF', border: Brand.red },
  ghost: { bg: 'transparent', fg: Brand.sub, border: Brand.border },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  small,
  disabled,
  style,
  a11yLabel,
}: {
  label?: string;
  /** Name for screen readers when the button shows only an icon. */
  a11yLabel?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  small?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = BUTTONS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ?? a11yLabel}
      style={({ pressed, hovered, focused }: { pressed: boolean; hovered?: boolean; focused?: boolean }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        hovered && !disabled && styles.buttonHover,
        focused && styles.focusRing,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
        style,
      ]}>
      {icon ? <Icon name={icon} size={small ? 15 : 17} color={v.fg} /> : null}
      {label ? <Text style={[styles.buttonText, small && { fontSize: T.small }, { color: v.fg }]}>{label}</Text> : null}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, color = Brand.teal, icon }: { label: string; selected?: boolean; onPress?: () => void; color?: string; icon?: IconName }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ hovered, focused }: { pressed: boolean; hovered?: boolean; focused?: boolean }) => [
        styles.chip,
        hovered && !selected && { borderColor: '#C9D5D8' },
        focused && styles.focusRing,
        selected ? { backgroundColor: color, borderColor: color } : null,
      ]}>
      {icon ? <Icon name={icon} size={13} color={selected ? '#FFFFFF' : Brand.sub} /> : null}
      <Text style={[styles.chipText, selected ? { color: '#FFFFFF' } : null]}>{label}</Text>
    </Pressable>
  );
}

export function LangPicker({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <View style={styles.row}>
      {LANGS.map((l) => (
        <Chip key={l.code} label={l.label} selected={value === l.code} onPress={() => onChange(l.code)} />
      ))}
    </View>
  );
}

export const STATUS_STYLE: Record<MachineStatus, { label: string; color: string }> = {
  RUNNING: { label: 'Running', color: Brand.greenDark },
  CRITICAL: { label: 'Needs repair', color: Brand.redDark },
  MAINTENANCE: { label: 'Under repair', color: '#475569' },
};

export function ProgressBar({ value, color = Brand.teal }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export function timeAgo(ts: number, now: number, t?: TFunction) {
  const tr = t ?? ((key: string, p?: Params) => translate('en', key, p));
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return tr('ago.s', { n: s });
  const m = Math.round(s / 60);
  return m < 60 ? tr('ago.m', { n: m }) : tr('ago.h', { n: Math.round(m / 60) });
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Brand.canvas },
  screenContent: { paddingHorizontal: S.lg, gap: S.lg },
  screenWide: { paddingHorizontal: S.xxl + S.sm, paddingTop: S.xxl, paddingBottom: S.xxl * 1.5, gap: S.xl },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: S.md, flexWrap: 'wrap' },
  title: { fontSize: T.h1, fontWeight: '800', color: Brand.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: T.body, color: Brand.sub },
  card: { borderRadius: RADIUS, borderWidth: 1, padding: S.lg, gap: S.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: T.label, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  h2: { fontSize: T.h3 + 1, fontWeight: '700', color: Brand.ink, letterSpacing: -0.2 },
  body: { fontSize: T.body, color: Brand.ink, lineHeight: 22 },
  muted: { fontSize: T.small, color: Brand.sub, lineHeight: 19 },
  metric: { fontFamily: Fonts?.mono, fontVariant: ['tabular-nums'], fontSize: T.h3, fontWeight: '600', color: Brand.ink },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagDot: { width: 8, height: 8, borderRadius: 2 },
  tagText: { fontSize: T.label, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  pill: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: S.sm, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: '700' },
  button: { flexDirection: 'row', gap: S.sm, borderRadius: 8, borderWidth: 1, paddingVertical: S.md, paddingHorizontal: S.lg + 2, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  buttonSmall: { paddingVertical: 6, paddingHorizontal: S.md, minHeight: 36 },
  buttonHover: { transform: [{ translateY: -1 }] },
  focusRing: { outlineColor: Brand.teal, outlineWidth: 2, outlineStyle: 'solid', outlineOffset: 2 },
  buttonText: { fontSize: T.body, fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 6, borderWidth: 1, borderColor: Brand.border, backgroundColor: '#FFFFFF', paddingHorizontal: S.md - 2, paddingVertical: 6, minHeight: 32, maxWidth: '100%' },
  chipText: { fontSize: T.small, fontWeight: '700', color: Brand.sub, flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, alignItems: 'center' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#E3EAEC', overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
});
