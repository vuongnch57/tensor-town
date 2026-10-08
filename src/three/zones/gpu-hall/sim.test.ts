import { describe, expect, it } from 'vitest';
import type { GpuModel, NumberFormat, Workload } from '@/content/types';
import { simulate } from './sim';

const busy = (workload: Workload, gpu: GpuModel, format: NumberFormat) => simulate({ workload, gpu, format }).smBusy;

describe('gpu-hall simulation', () => {
  it('training keeps the hall nearly full and is compute-bound', () => {
    for (const gpu of ['h100', 'h200'] as const)
      for (const format of ['fp16', 'fp8'] as const) {
        const r = simulate({ workload: 'training', gpu, format });
        expect(r.smBusy).toBeGreaterThanOrEqual(0.9);
        expect(r.smBusy).toBeLessThanOrEqual(1);
        expect(r.bottleneck).toBe('compute');
      }
  });
  it('LLM inference on H100 FP16 is about 0.35 and memory-bound', () => {
    const r = simulate({ workload: 'inference', gpu: 'h100', format: 'fp16' });
    expect(r.smBusy).toBeCloseTo(0.35, 2);
    expect(r.bottleneck).toBe('memory');
  });
  it('H200 FP16 inference is about 0.5', () => {
    expect(busy('inference', 'h200', 'fp16')).toBeCloseTo(0.5, 2);
  });
  it('H100 FP8 is about twice H100 FP16, capped at 1', () => {
    expect(busy('inference', 'h100', 'fp8')).toBeCloseTo(2 * busy('inference', 'h100', 'fp16'), 2);
    expect(busy('training', 'h100', 'fp8')).toBeLessThanOrEqual(1);
  });
  it('is monotonic: more bandwidth or smaller crates never lowers SM busy', () => {
    for (const w of ['training', 'inference'] as const) {
      expect(busy(w, 'h200', 'fp16')).toBeGreaterThanOrEqual(busy(w, 'h100', 'fp16'));
      expect(busy(w, 'h100', 'fp8')).toBeGreaterThanOrEqual(busy(w, 'h100', 'fp16'));
      expect(busy(w, 'h200', 'fp8')).toBeGreaterThanOrEqual(busy(w, 'h200', 'fp16'));
    }
  });
  it('stays within bounds and belt speed is 1 for H100 FP16', () => {
    expect(simulate({ workload: 'inference', gpu: 'h100', format: 'fp16' }).beltSpeed).toBeCloseTo(1, 5);
    for (const w of ['training', 'inference'] as const) {
      const v = busy(w, 'h100', 'fp16');
      expect(v).toBeGreaterThanOrEqual(0.05);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
