import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useDemo } from '@/demo/demo-provider';
import { LOCALES } from '@/demo/i18n';
import { eventText } from '@/demo/localize';
import { buildMonthEvents, CALENDAR_TYPES, ymd } from '@/demo/mock/calendar';
import type { CalendarType } from '@/demo/types';

import { Body, Button, Card, Chip, H2, Muted, useIsWide } from './ui';

const colorOf = (t: CalendarType) => CALENDAR_TYPES.find((c) => c.type === t)?.color ?? Brand.teal;

export function MonthCalendar() {
  const { state, t, lang } = useDemo();
  const locale = LOCALES[lang];
  // Weekday names in this device's language (2024-01-07 is a Sunday).
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i).toLocaleDateString(locale, { weekday: 'short' }));
  const wide = useIsWide();
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(ymd(today));
  const [hidden, setHidden] = useState<CalendarType[]>([]);

  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  // React Compiler memoizes this automatically.
  const live = (state?.liveEvents ?? []).filter((e) => e.date.startsWith(monthKey));
  const events = [...buildMonthEvents(year, month), ...live].filter((e) => !hidden.includes(e.type));

  const firstWeekday = view.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const dayEvents = events
    .filter((e) => e.date === selected)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

  return (
    <View style={[{ gap: 16 }, wide && { flexDirection: 'row', alignItems: 'flex-start' }]}>
      <Card style={wide ? { flex: 2.2 } : undefined}>
        <View style={s.head}>
          <Button small variant="ghost" icon="chevronLeft" onPress={() => setOffset((o) => o - 1)} />
          <H2 style={{ flex: 1, textAlign: 'center' }}>
            {view.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
          </H2>
          <Button small variant="ghost" icon="chevronRight" onPress={() => setOffset((o) => o + 1)} />
        </View>
        <View style={s.legend}>
          {CALENDAR_TYPES.map((c) => (
            <Chip
              key={c.type}
              label={t(`cal.${c.type}`)}
              color={c.color}
              selected={!hidden.includes(c.type)}
              onPress={() => setHidden((h) => (h.includes(c.type) ? h.filter((x) => x !== c.type) : [...h, c.type]))}
            />
          ))}
        </View>
        <View style={s.grid}>
          {weekdays.map((w, i) => (
            <Text key={i} style={s.weekday} numberOfLines={1}>
              {w}
            </Text>
          ))}
          {cells.map((d, i) => {
            if (!d) return <View key={`e${i}`} style={[s.cell, wide && s.cellWide]} />;
            const date = `${monthKey}-${String(d).padStart(2, '0')}`;
            const evs = events.filter((e) => e.date === date);
            const isToday = date === ymd(today);
            const isSel = date === selected;
            return (
              <Pressable key={date} onPress={() => setSelected(date)} style={[s.cell, wide && s.cellWide, isSel && s.cellSel]}>
                <Text style={[s.dayNum, isToday && s.today]}>{d}</Text>
                {wide ? (
                  evs.slice(0, 3).map((e) => (
                    <Text key={e.id} numberOfLines={1} style={[s.evBar, { backgroundColor: colorOf(e.type) }]}>
                      {eventText(e, t).title}
                    </Text>
                  ))
                ) : (
                  <View style={s.dots}>
                    {evs.slice(0, 4).map((e) => (
                      <View key={e.id} style={[s.dot, { backgroundColor: colorOf(e.type) }]} />
                    ))}
                  </View>
                )}
                {wide && evs.length > 3 ? <Muted style={{ fontSize: 11 }}>+{evs.length - 3} more</Muted> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={wide ? { flex: 1 } : undefined}>
        <H2>{new Date(`${selected}T00:00:00`).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</H2>
        {dayEvents.length === 0 ? <Muted>{t('nothing')}</Muted> : null}
        {dayEvents.map((e) => (
          <View key={e.id} style={[s.item, { borderLeftColor: colorOf(e.type) }]}>
            <Body style={{ fontWeight: '700' }}>{eventText(e, t).title}</Body>
            <Muted>{[e.time, eventText(e, t).detail].filter(Boolean).join(' · ')}</Muted>
          </View>
        ))}
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.2857%', textAlign: 'center', fontSize: 12, fontWeight: '700', color: Brand.sub, paddingVertical: 4 },
  cell: { width: '14.2857%', minHeight: 48, padding: 3, borderRadius: 8, alignItems: 'center', gap: 2 },
  cellWide: { minHeight: 92, alignItems: 'stretch', borderWidth: 1, borderColor: '#EEF2F4' },
  cellSel: { backgroundColor: Brand.mint, borderColor: Brand.teal },
  dayNum: { fontSize: 13, fontWeight: '700', color: Brand.ink, alignSelf: 'center' },
  today: { color: '#FFFFFF', backgroundColor: Brand.teal, borderRadius: 10, overflow: 'hidden', paddingHorizontal: 6 },
  evBar: { fontSize: 11, color: '#FFFFFF', fontWeight: '600', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1, overflow: 'hidden' },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  item: { borderLeftWidth: 4, paddingLeft: 10, paddingVertical: 4, gap: 2 },
});
