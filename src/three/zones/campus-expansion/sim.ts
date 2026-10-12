import type { CampusSimParams } from '@/content/types';

/**
 * Zone 9 toy model: how a campus grows by scalable units, and who owns them. ILLUSTRATIVE, NOT MEASURED.
 *
 *   SuperPOD   DGX count = DGX_PER_UNIT x units, GPU count = GPUS_PER_DGX x DGX count (SPEC §8: 32 DGX per scalable unit, 8 H100 per DGX H100).
 *   BasePOD    the DGX count of a BasePOD is not in SPEC §8, so DGX and GPU counts are null and the UI shows TODO(fact).
 *   ownership  on-prem owns every unit, cloud rents every unit, hybrid owns the first half (rounded up) and rents the rest.
 */
export const DGX_PER_UNIT = 32;
export const GPUS_PER_DGX = 8;
export const MAX_UNITS = 4;

export type Slot = 'owned' | 'rented' | 'empty';

export type CampusResult = {
  /** DGX systems in the campus; null for BasePOD (TODO(fact)). */
  dgx: number | null;
  /** GPUs in the campus; null for BasePOD (TODO(fact)). */
  gpus: number | null;
  owned: number;
  rented: number;
  /** What stands on each of the MAX_UNITS building slots, in build order. */
  slots: Slot[];
};

export const clampUnits = (u: number) => Math.min(MAX_UNITS, Math.max(1, Math.round(u)));

export function simulate({ architecture, deployment, units }: CampusSimParams): CampusResult {
  const n = clampUnits(units);
  const owned = deployment === 'on-prem' ? n : deployment === 'cloud' ? 0 : Math.ceil(n / 2);
  const slots: Slot[] = Array.from({ length: MAX_UNITS }, (_, i) => (i >= n ? 'empty' : i < owned ? 'owned' : 'rented'));
  const dgx = architecture === 'superpod' ? DGX_PER_UNIT * n : null;
  return { dgx, gpus: dgx === null ? null : dgx * GPUS_PER_DGX, owned, rented: n - owned, slots };
}
