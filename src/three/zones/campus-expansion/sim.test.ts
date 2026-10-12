import { describe, expect, it } from 'vitest';
import { DGX_PER_UNIT, GPUS_PER_DGX, MAX_UNITS, clampUnits, simulate } from './sim';

const base = { architecture: 'superpod', deployment: 'on-prem', units: 2 } as const;

describe('zone 9 campus model', () => {
  it('a SuperPOD has 32 DGX per scalable unit and 8 GPUs per DGX', () => {
    const r = simulate(base);
    expect(r.dgx).toBe(2 * DGX_PER_UNIT);
    expect(r.gpus).toBe(2 * DGX_PER_UNIT * GPUS_PER_DGX);
  });
  it('counts scale linearly with the unit count', () => {
    expect(simulate({ ...base, units: 4 }).dgx).toBe(2 * simulate({ ...base, units: 2 }).dgx!);
  });
  it('a BasePOD has no DGX or GPU count: it is TODO(fact)', () => {
    const r = simulate({ ...base, architecture: 'basepod' });
    expect(r.dgx).toBeNull();
    expect(r.gpus).toBeNull();
  });
  it('on-prem owns everything, cloud rents everything, hybrid splits with the owner getting the extra unit', () => {
    expect(simulate({ ...base, units: 3 })).toMatchObject({ owned: 3, rented: 0 });
    expect(simulate({ ...base, deployment: 'cloud', units: 3 })).toMatchObject({ owned: 0, rented: 3 });
    expect(simulate({ ...base, deployment: 'hybrid', units: 3 })).toMatchObject({ owned: 2, rented: 1 });
    expect(simulate({ ...base, deployment: 'hybrid', units: 1 })).toMatchObject({ owned: 1, rented: 0 });
  });
  it('owned plus rented is the unit count, and the unbuilt slots stay empty', () => {
    for (const deployment of ['on-prem', 'cloud', 'hybrid'] as const) {
      for (let units = 1; units <= MAX_UNITS; units++) {
        const r = simulate({ ...base, deployment, units });
        expect(r.owned + r.rented).toBe(units);
        expect(r.slots.filter((s) => s === 'empty')).toHaveLength(MAX_UNITS - units);
        expect(r.slots).toHaveLength(MAX_UNITS);
      }
    }
  });
  it('clamps the unit count to 1..4', () => {
    expect(clampUnits(0)).toBe(1);
    expect(clampUnits(9)).toBe(MAX_UNITS);
  });
});
