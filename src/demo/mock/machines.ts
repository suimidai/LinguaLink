import { translate } from '../i18n';
import type { Machine } from '../types';

type MachineSeed = Omit<Machine, 'status' | 'type'>;

const SEEDS: MachineSeed[] = [
  { id: 'm01', label: 'Machine 01', code: 'MC-CNC-01', typeKey: 'mt.cnc', group: 'Supervisor 01', supervisorId: 'sup-1', manualIds: ['spindle', 'loto'] },
  { id: 'm03', label: 'Machine 03', code: 'MC-INJ-03', typeKey: 'mt.inj', group: 'Supervisor 01', supervisorId: 'sup-1', manualIds: ['loto'] },
  { id: 'm02', label: 'Machine 02', code: 'MC-PRS-02', typeKey: 'mt.press', group: 'Supervisor 02', supervisorId: 'sup-2', manualIds: ['pdf-hp200', 'loto'] },
  { id: 'm04', label: 'Machine 04', code: 'MC-ROB-04', typeKey: 'mt.robot', group: 'Supervisor 02', supervisorId: 'sup-2', manualIds: ['spindle', 'loto'] },
];

export function createMachines(): Machine[] {
  return SEEDS.map((s) => ({ ...s, type: translate('en', s.typeKey), status: 'RUNNING' }));
}

/**
 * Problems a person can report by hand (no AI monitoring).
 * Text lives in i18n as pb.N.title / pb.N.text; root causes are i18n keys.
 * `ask` is the knowledge-base question that "Ask a senior" pre-fills.
 */
export const PROBLEMS = [
  { rootCauses: ['rc.wornBearing', 'rc.lowLube', 'rc.misalign'], ask: 'q-spindle' },
  { rootCauses: ['rc.strippedThread', 'rc.looseBolts', 'rc.wornCoupling'], ask: 'q-bolt' },
  { rootCauses: ['rc.lowLube', 'rc.blockedLine', 'rc.wornBearing'], ask: 'q-grease' },
];

/** Spare parts as i18n keys. */
export const SPARE_PARTS = ['part.insert', 'part.bearing', 'part.grease', 'part.coupling', 'part.bolts'];

/** Which problem each machine gets when someone reports it (matches the knowledge-base tips). */
export const PROBLEM_BY_MACHINE: Record<string, number> = { m01: 0, m02: 1, m03: 2, m04: 0 };
