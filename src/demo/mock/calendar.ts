import { translate } from '../i18n';
import type { CalendarEvent, CalendarType } from '../types';

export const CALENDAR_TYPES: { type: CalendarType; label: string; color: string }[] = [
  { type: 'SHIFT', label: 'Shifts & OT', color: '#3B82F6' },
  { type: 'PM', label: 'Machine maintenance', color: '#F59E0B' },
  { type: 'MEETING', label: 'Meetings & training', color: '#8B5CF6' },
  { type: 'HR', label: 'HR events', color: '#00A896' },
];

export const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Demo events for any month, generated relative to that month so it always looks current. */
export function buildMonthEvents(year: number, month: number): CalendarEvent[] {
  const days = new Date(year, month + 1, 0).getDate();
  const at = (day: number) => ymd(new Date(year, month, Math.min(day, days)));
  const events: CalendarEvent[] = [];
  let n = 0;
  const add = (day: number, type: CalendarType, key: string, time?: string, detailKey?: string, params?: Record<string, string>) =>
    events.push({
      id: `cal-${year}-${month}-${n++}`,
      date: at(day),
      type,
      time,
      key,
      detailKey,
      params,
      title: translate('en', key, params),
      detail: detailKey ? translate('en', detailKey) : undefined,
    });

  for (let d = 1; d <= days; d++) {
    const wd = new Date(year, month, d).getDay();
    if (wd >= 1 && wd <= 5) add(d, 'SHIFT', 'ev.shiftB', '14:00–22:00', 'det.line');
    if (wd === 6 && d % 2 === 0) add(d, 'SHIFT', 'ev.ot', '08:00–12:00', 'det.ot');
  }

  add(5, 'PM', 'ev.pm', '08:00', 'det.pm', { machine: 'Machine 02' });
  add(12, 'PM', 'ev.pm', '08:00', 'det.pm', { machine: 'Machine 04' });
  add(19, 'PM', 'ev.pm', '08:00', 'det.pm', { machine: 'Machine 01' });
  add(26, 'PM', 'ev.pm', '08:00', 'det.pm', { machine: 'Machine 03' });

  add(3, 'MEETING', 'ev.safety', '09:00', 'det.roomA');
  add(10, 'MEETING', 'ev.forklift', '09:00', 'det.training');
  add(17, 'MEETING', 'ev.loto', '13:00', 'det.workshop');
  add(24, 'MEETING', 'ev.lineMeeting', '15:00', 'det.roomB');

  add(7, 'HR', 'ev.flu', '13:00–16:00', 'det.clinic');
  add(15, 'HR', 'ev.payday', undefined, 'det.payslip');
  add(22, 'HR', 'ev.sports', '16:00', 'det.field');
  add(28, 'HR', 'ev.birthday', '12:00', 'det.canteen');

  return events;
}
