import type { Person } from '../types';

export const PHONE_USER_ID = 'tech-1';

export const PEOPLE: Person[] = [
  { id: 'eng-1', name: 'Kenji', role: 'ENGINEER', title: 'Maintenance Engineer', lang: 'ja' },
  { id: 'sup-1', name: 'Niran', role: 'SUPERVISOR', title: 'Supervisor 01', lang: 'th' },
  { id: 'sup-2', name: 'Malee', role: 'SUPERVISOR', title: 'Supervisor 02', lang: 'th' },
  { id: 'tech-1', name: 'Somchai', role: 'TECHNICIAN', title: 'Technician · Shift B', lang: 'th' },
  { id: 'tech-2', name: 'Aung Ko', role: 'TECHNICIAN', title: 'Technician · Shift B', lang: 'my' },
  { id: 'tech-3', name: 'Dara', role: 'TECHNICIAN', title: 'Technician · Shift C', lang: 'km' },
  { id: 'hr-1', name: 'Pim', role: 'HR', title: 'HR Manager', lang: 'th' },
  { id: 'op-1', name: 'Mya', role: 'OPERATOR', title: 'Operator · Shift A', lang: 'my' },
  { id: 'op-2', name: 'Sokha', role: 'OPERATOR', title: 'Operator · Shift A', lang: 'km' },
  { id: 'op-3', name: 'Noy', role: 'OPERATOR', title: 'Operator · Shift B', lang: 'lo' },
  { id: 'sen-1', name: 'Prasert', role: 'SENIOR', title: 'Senior Technician · 32 years', lang: 'th' },
  { id: 'sen-2', name: 'Tanaka', role: 'SENIOR', title: 'Senior Engineer · 28 years', lang: 'ja' },
  { id: 'sen-3', name: 'Boonmee', role: 'SENIOR', title: 'Senior Technician · 25 years', lang: 'th' },
];

export function personName(people: Person[], id?: string) {
  return people.find((p) => p.id === id)?.name ?? '—';
}

/** Senior experience in years, shown on knowledge-base tips. */
export const SENIOR_YEARS: Record<string, number> = { 'sen-1': 32, 'sen-2': 28, 'sen-3': 25 };

/** Who reports problems on each supervisor's machines (operators on the floor). */
export const REPORTER_BY_GROUP: Record<string, string> = { 'Supervisor 01': 'op-1', 'Supervisor 02': 'op-3' };
