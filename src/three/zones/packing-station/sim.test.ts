import { describe, expect, it } from 'vitest';
import { BYTES_PER_PARAM, GPU_MEMORY_GB, simulate } from './sim';

describe('packing sim', () => {
  it('multiplies parameters by bytes per value', () => {
    expect(simulate({ format: 'fp32', model: '7b' }).weightGB).toBe(28);
    expect(simulate({ format: 'bf16', model: '13b' }).weightGB).toBe(26);
    expect(simulate({ format: 'fp8', model: '70b' }).weightGB).toBe(70);
    expect(simulate({ format: 'int8', model: '70b' }).weightGB).toBe(70);
  });
  it('uses the SPEC byte sizes', () => expect(BYTES_PER_PARAM).toEqual({ fp32: 4, bf16: 2, fp8: 1, int8: 1 }));
  it('says whether the weights fit on one 80 GB GPU', () => {
    expect(GPU_MEMORY_GB).toBe(80);
    expect(simulate({ format: 'bf16', model: '70b' }).fitsOneGpu).toBe(false);
    expect(simulate({ format: 'fp8', model: '70b' }).fitsOneGpu).toBe(true);
    expect(simulate({ format: 'fp32', model: '13b' }).fitsOneGpu).toBe(true);
    expect(simulate({ format: 'fp32', model: '70b' }).fitsOneGpu).toBe(false);
  });
  it('never needs more memory when the format gets smaller', () => {
    for (const model of ['7b', '13b', '70b'] as const) {
      const w = (['fp32', 'bf16', 'fp8'] as const).map((format) => simulate({ format, model }).weightGB);
      expect(w[0]).toBeGreaterThan(w[1]);
      expect(w[1]).toBeGreaterThan(w[2]);
    }
  });
});
