import type { GpuModel, NumberFormat, SimParams, Workload } from '@/content/types';

/**
 * Zone 1 toy model. ILLUSTRATIVE, NOT MEASURED.
 *
 *   dataSupply = bandwidthTBs / bytesPerValue        (values the belt can deliver)
 *   smBusy     = clamp(dataSupply * ratio, 0.05, 1)   (ratio = work per value / hall capacity)
 *
 * Bandwidth and bytes per value are SPEC §8 facts. The two `ratio` constants are calibration
 * values chosen so the toy lands where SPEC §4.9 says it should; they are not hardware facts.
 */
export const BANDWIDTH_TBS: Record<GpuModel, number> = { h100: 3.35, h200: 4.8 };
export const BYTES_PER_VALUE: Record<NumberFormat, number> = { fp16: 2, fp8: 1 };

/** Work per value divided by hall capacity. Training does far more work per value than LLM inference. */
export const RATIO: Record<Workload, number> = { training: 0.55, inference: 0.209 };

/** Below this the hall is waiting on the belt. */
export const COMPUTE_BOUND_AT = 0.9;
const MIN_BUSY = 0.05;
/** Belt speed is shown relative to H100 + FP16 = 1. */
const BASE_SUPPLY = BANDWIDTH_TBS.h100 / BYTES_PER_VALUE.fp16;

export type Bottleneck = 'memory' | 'compute';
export type SimResult = {
  dataSupply: number;
  smBusy: number; // 0.05..1
  bottleneck: Bottleneck;
  /** Relative belt speed, 1 = H100 + FP16. */
  beltSpeed: number;
};

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function simulate({ workload, gpu, format }: SimParams): SimResult {
  const dataSupply = BANDWIDTH_TBS[gpu] / BYTES_PER_VALUE[format];
  const smBusy = clamp(dataSupply * RATIO[workload], MIN_BUSY, 1);
  return {
    dataSupply,
    smBusy,
    bottleneck: smBusy >= COMPUTE_BOUND_AT ? 'compute' : 'memory',
    beltSpeed: dataSupply / BASE_SUPPLY,
  };
}
