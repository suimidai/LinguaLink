// Turns server data (which carries i18n keys) into text for this device's language.
import { groupName, machineName, type TFunction } from './i18n';
import { ANNOUNCEMENT_PRESETS } from './mock/announcements';
import type { CalendarEvent, DemoState, Job, Lang, PhoneNotification } from './types';

export function localizeNotification(n: PhoneNotification, state: DemoState | null, lang: Lang, t: TFunction) {
  if (n.announcementId) {
    const ann = state?.announcements.find((a) => a.id === n.announcementId);
    const preset = ANNOUNCEMENT_PRESETS.find((p) => p.id === ann?.presetId);
    if (preset) return { title: `HR: ${preset.title[lang]}`, body: preset.body[lang] };
  }
  if (n.key) {
    const p = n.params ?? {};
    const params = {
      ...p,
      machine: machineName(t, String(p.machine ?? '')),
      group: groupName(t, String(p.group ?? '')),
      title: (() => {
        const job = n.jobId ? state?.jobs.find((j) => j.id === n.jobId) : undefined;
        if (job?.custom) return job.custom.title[lang];
        return p.pb !== undefined ? t(`pb.${p.pb}.title`) : '';
      })(),
    };
    return { title: t(`${n.key}.t`, params), body: t(`${n.key}.b`, params) };
  }
  return { title: n.title, body: n.body };
}

export function jobTitle(job: Pick<Job, 'pb' | 'custom'>, t: TFunction, lang: Lang = 'en') {
  return job.custom?.title[lang] ?? t(`pb.${job.pb}.title`);
}

/** What the person wrote when reporting the problem (auto-translated). */
export function jobReport(job: Pick<Job, 'pb' | 'custom'>, t: TFunction, lang: Lang = 'en') {
  return job.custom?.text[lang] ?? t(`pb.${job.pb}.text`);
}

export function eventText(e: CalendarEvent, t: TFunction) {
  const params = e.params?.machine ? { ...e.params, machine: machineName(t, e.params.machine) } : e.params;
  return {
    title: e.key ? t(e.key, params) : e.title,
    detail: e.detailKey ? t(e.detailKey) : e.detail,
  };
}
