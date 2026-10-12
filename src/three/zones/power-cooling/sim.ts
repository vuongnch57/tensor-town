import type { PowerSimParams } from '@/content/types';

/**
 * Zone 8 toy model: what cooling a rack density calls for, and the PUE of a facility. ILLUSTRATIVE, NOT MEASURED.
 *
 *   density  relative rack density from 0 (light) to 1 (very dense). It is a level, not kW per rack.
 *   cooling  air up to DENSITY_LIQUID, liquid above it. DENSITY_LIQUID is a toy value: the real air-cooling limit is TODO(fact).
 *   PUE      total facility power divided by IT equipment power (SPEC §8). Facility power can never be below IT power.
 */
export const DENSITY_LIQUID = 0.6;
export const IT_RANGE = { min: 2, max: 20 };

export type Cooling = 'air' | 'liquid';

export type PowerResult = {
  cooling: Cooling;
  /** Facility power actually used: never below the IT power. */
  facilityMW: number;
  pue: number;
  /** Power that is not IT: cooling, conversion losses and the rest. */
  overheadMW: number;
  /** Heat the rack puts out, relative, 0 to 1. */
  heat: number;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function simulate({ density, itMW, facilityMW }: PowerSimParams): PowerResult {
  const it = Math.max(itMW, 0.001);
  const facility = Math.max(facilityMW, it);
  return {
    cooling: density > DENSITY_LIQUID ? 'liquid' : 'air',
    facilityMW: facility,
    pue: facility / it,
    overheadMW: facility - it,
    heat: clamp(density, 0, 1),
  };
}
