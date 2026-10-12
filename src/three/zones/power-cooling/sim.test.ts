import { describe, expect, it } from 'vitest';
import { DENSITY_LIQUID, simulate } from './sim';

const base = { density: 0.3, itMW: 10, facilityMW: 12 };

describe('zone 8 power and cooling model', () => {
  it('PUE is facility power divided by IT power', () => {
    const r = simulate(base);
    expect(r.pue).toBeCloseTo(1.2, 10);
    expect(r.overheadMW).toBeCloseTo(2, 10);
  });
  it('PUE never drops below 1: facility power is raised to the IT power', () => {
    const r = simulate({ ...base, facilityMW: 4 });
    expect(r.facilityMW).toBe(10);
    expect(r.pue).toBe(1);
    expect(r.overheadMW).toBe(0);
  });
  it('more overhead means a higher PUE', () => {
    expect(simulate({ ...base, facilityMW: 15 }).pue).toBeGreaterThan(simulate(base).pue);
  });
  it('suggests air for light racks and liquid for dense ones, switching once and staying switched', () => {
    expect(simulate({ ...base, density: 0.1 }).cooling).toBe('air');
    expect(simulate({ ...base, density: DENSITY_LIQUID }).cooling).toBe('air');
    expect(simulate({ ...base, density: 0.9 }).cooling).toBe('liquid');
    const kinds = [0, 0.2, 0.4, 0.6, 0.8, 1].map((density) => simulate({ ...base, density }).cooling);
    expect(kinds.indexOf('liquid')).toBe(kinds.lastIndexOf('air') + 1);
  });
  it('heat follows density and is clamped to 0..1', () => {
    expect(simulate({ ...base, density: 2 }).heat).toBe(1);
    expect(simulate({ ...base, density: -1 }).heat).toBe(0);
    expect(simulate({ ...base, density: 0.5 }).heat).toBe(0.5);
  });
});
