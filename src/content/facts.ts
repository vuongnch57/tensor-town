/**
 * The only numbers allowed in user-facing content: SPEC §8 "Verified facts".
 * Anything else must be written as TODO(fact) with a visible placeholder.
 */
export const TODO_MARK = 'TODO(fact)';

export const VERIFIED_FACTS: { fact: string; value: string }[] = [
  { fact: 'H100 SXM SM count', value: '132' },
  { fact: 'CUDA cores (FP32) per H100 SM', value: '128' },
  { fact: 'Tensor Cores per H100 SM', value: '4 (4th generation)' },
  { fact: 'Threads per warp', value: '32' },
  { fact: 'H100 SXM memory', value: '80 GB HBM3, ~3.35 TB/s' },
  { fact: 'H200 memory', value: '141 GB HBM3e, ~4.8 TB/s' },
  { fact: 'H100 L2 cache', value: '50 MB' },
  { fact: 'NVLink bandwidth per H100 GPU', value: '900 GB/s total' },
  { fact: 'PCIe Gen5 x16', value: '~128 GB/s bidirectional' },
  { fact: 'NVLink on Blackwell', value: '1.8 TB/s per GPU' },
  { fact: 'DGX H100', value: '8× H100 GPUs, 4 NVSwitch chips' },
  { fact: 'DGX SuperPOD scalable unit (H100 generation)', value: '32 DGX systems' },
  { fact: 'GB200 NVL72', value: '72 Blackwell GPUs + 36 Grace CPUs in one NVLink domain' },
  { fact: 'ConnectX-7', value: 'up to 400 Gb/s' },
  { fact: 'Format sizes', value: 'FP32 4 B, FP16/BF16 2 B, FP8/INT8 1 B' },
  { fact: 'Format bits (exponent/mantissa)', value: 'FP32 8/23, TF32 8/10, FP16 5/10, BF16 8/7, FP8 E4M3 or E5M2' },
];

/** Numeric tokens that appear in the table above. Used by the content check. */
export const ALLOWED_NUMBERS = new Set([
  '1', '2', '4', '5', '7', '8', '10', '23', '32', '36', '50', '72', '80', '128', '132', '141', '400', '900',
  '3.35', '4.8', '1.8',
]);
