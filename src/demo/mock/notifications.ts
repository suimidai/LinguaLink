import { translate } from '../i18n';
import type { NotificationKind } from '../types';

// Pool of "random" phone notifications that keep the demo feeling alive.
// Text lives in i18n as `${key}.t` / `${key}.b` so each phone shows its own language.
const POOL: { kind: NotificationKind; key: string }[] = [
  { kind: 'PARTS', key: 'n.parts1' },
  { kind: 'SHIFT', key: 'n.shift' },
  { kind: 'TRAINING', key: 'n.training' },
  { kind: 'HR', key: 'n.payslip' },
  { kind: 'SHIFT', key: 'n.ot' },
  { kind: 'PARTS', key: 'n.parts2' },
  { kind: 'HR', key: 'n.canteen' },
  { kind: 'TRAINING', key: 'n.sop' },
];

export const RANDOM_NOTIFICATIONS = POOL.map((n) => ({
  ...n,
  title: translate('en', `${n.key}.t`),
  body: translate('en', `${n.key}.b`),
}));
