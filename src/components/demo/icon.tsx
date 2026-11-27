import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { Brand } from '@/constants/theme';

/**
 * One icon set for the whole app: SF Symbols on iOS, Material Symbols on
 * Android and web (both via expo-symbols, no extra dependency).
 */
const ICONS = {
  dashboard: { ios: 'square.grid.2x2', android: 'dashboard', web: 'dashboard' },
  home: { ios: 'house.fill', android: 'home', web: 'home' },
  jobs: { ios: 'wrench.and.screwdriver', android: 'build', web: 'build' },
  announce: { ios: 'megaphone', android: 'campaign', web: 'campaign' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  manual: { ios: 'book.closed', android: 'menu_book', web: 'menu_book' },
  warning: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  checkCircle: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  play: { ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' },
  bolt: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  reset: { ios: 'arrow.counterclockwise', android: 'restart_alt', web: 'restart_alt' },
  person: { ios: 'person.fill', android: 'person', web: 'person' },
  phone: { ios: 'iphone', android: 'smartphone', web: 'smartphone' },
  group: { ios: 'person.2', android: 'group', web: 'group' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  parts: { ios: 'shippingbox', android: 'inventory_2', web: 'inventory_2' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  training: { ios: 'graduationcap', android: 'school', web: 'school' },
  ai: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  globe: { ios: 'globe', android: 'language', web: 'language' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  arrowRight: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  send: { ios: 'paperplane.fill', android: 'send', web: 'send' },
  machine: { ios: 'gearshape.2', android: 'precision_manufacturing', web: 'precision_manufacturing' },
  chat: { ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' },
  mic: { ios: 'mic.fill', android: 'mic', web: 'mic' },
  photo: { ios: 'photo', android: 'image', web: 'image' },
  file: { ios: 'doc.text', android: 'description', web: 'description' },
  bulb: { ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' },
  report: { ios: 'exclamationmark.bubble', android: 'report', web: 'report' },
  pin: { ios: 'pin.fill', android: 'push_pin', web: 'push_pin' },
  translate: { ios: 'character.bubble', android: 'translate', web: 'translate' },
  video: { ios: 'video.fill', android: 'videocam', web: 'videocam' },
  upload: { ios: 'square.and.arrow.up', android: 'upload', web: 'upload' },
  download: { ios: 'square.and.arrow.down', android: 'download', web: 'download' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
} satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 18,
  color = Brand.sub,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} style={style} />;
}
