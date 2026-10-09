import { describe, expect, it } from 'vitest';
import { FOOTPRINT, JOBS, SHARING_MODES, simulate } from './sim';

describe('zone 7 GPU sharing model', () => {
  it('shows 100% utilization in every mode: that is the trap', () => {
    for (const sharing of SHARING_MODES) expect(simulate({ sharing }).utilization).toBe(1);
  });
  it('a single small job looks busy while few SMs work', () => {
    const r = simulate({ sharing: 'one' });
    expect(r.utilization).toBe(1);
    expect(r.smActivity).toBe(FOOTPRINT);
    expect(r.smActivity).toBeLessThan(r.utilization);
  });
  it('MIG runs the jobs at once, so SM activity adds up and each job keeps full speed', () => {
    const r = simulate({ sharing: 'mig' });
    expect(r.smActivity).toBeCloseTo(JOBS * FOOTPRINT, 10);
    expect(r.perJob).toBe(1);
    expect(r.isolated).toBe(true);
  });
  it('time-slicing leaves SM activity where it was and gives each job a share of the time', () => {
    const r = simulate({ sharing: 'time-slicing' });
    expect(r.smActivity).toBe(FOOTPRINT);
    expect(r.perJob).toBeCloseTo(1 / JOBS, 10);
    expect(r.isolated).toBe(false);
  });
  it('vGPU is isolated like MIG but time-shared like time-slicing, with a small overhead', () => {
    const r = simulate({ sharing: 'vgpu' });
    expect(r.isolated).toBe(true);
    expect(r.smActivity).toBeLessThan(FOOTPRINT);
    expect(r.perJob).toBeLessThan(simulate({ sharing: 'time-slicing' }).perJob + 1);
    expect(r.perJob).toBeLessThan(1 / JOBS);
  });
  it('MIG is the only mode that raises SM activity', () => {
    const base = simulate({ sharing: 'one' }).smActivity;
    for (const sharing of SHARING_MODES) expect(simulate({ sharing }).smActivity > base).toBe(sharing === 'mig');
  });
});
