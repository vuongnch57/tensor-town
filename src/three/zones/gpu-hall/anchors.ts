import type { Anchor } from '@/content/types';

/**
 * World positions (units) of each Zone 1 object. Ground top is y = 0, ground spans x ±11, z ±9.
 * Camera looks from +x +z, so screen-left is (-x,+z) and screen-up is (-x,-z).
 */
export const anchors: Record<string, Anchor> = {
  data: { position: [-6.5, 0.9, 5.6], label: 'Data' },
  cpu: { position: [-5, 2.1, -5.2], label: 'CPU' },
  gpu: { position: [0, 2.4, -3.0], label: 'GPU' },
  sm: { position: [0.75, 1.5, -0.6], label: 'SM' },
  'cuda-core': { position: [-1.6, 0.9, 2.4], label: 'CUDA core' },
  'tensor-core': { position: [1.8, 1.5, 2.0], label: 'Tensor Core' },
  hbm: { position: [8.4, 2.9, 1.2], label: 'HBM' },
  'memory-bandwidth': { position: [4.6, 0.9, 2.2], label: 'Bandwidth' },
};
