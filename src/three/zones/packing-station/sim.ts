import type { ModelSize, PackFormat, PackSimParams } from '@/content/types';

/**
 * Zone 2 toy model. ILLUSTRATIVE, NOT MEASURED.
 *
 *   weightGB = parameters (billions) × bytes per parameter
 *
 * Bytes per parameter are SPEC §8 facts (FP32 4 B, BF16 2 B, FP8/INT8 1 B). Model sizes are the choices SPEC §4.9 lists.
 * The 80 GB limit is one H100 SXM's memory (SPEC §8). Activations, the KV cache and runtime overhead are left out.
 */
export const BYTES_PER_PARAM: Record<PackFormat, number> = { fp32: 4, bf16: 2, fp8: 1, int8: 1 };
export const PARAMS_BILLIONS: Record<ModelSize, number> = { '7b': 7, '13b': 13, '70b': 70 };
export const GPU_MEMORY_GB = 80;

export type PackResult = {
  bytesPerParam: number;
  /** Memory for the weights alone, in GB. */
  weightGB: number;
  fitsOneGpu: boolean;
  /** Share of the 80 GB used by the weights (can exceed 1). */
  usedShare: number;
};

export function simulate({ format, model }: PackSimParams): PackResult {
  const bytesPerParam = BYTES_PER_PARAM[format];
  const weightGB = PARAMS_BILLIONS[model] * bytesPerParam;
  return {
    bytesPerParam,
    weightGB,
    fitsOneGpu: weightGB <= GPU_MEMORY_GB,
    usedShare: weightGB / GPU_MEMORY_GB,
  };
}
