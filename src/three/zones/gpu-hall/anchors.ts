import type { Anchor } from '@/content/types';

/**
 * World positions (units) of each Zone 1 object. Ground top is y = 0, ground spans x ±11, z ±9.
 * Camera looks from +x +z, so screen-left is (-x,+z) and screen-up is (-x,-z).
 */
export const anchors: Record<string, Anchor> = {
  data: { position: [-6.5, 0.9, 5.6], label: 'Data', focus: [-6, 0, 5] },
  cpu: { position: [-5, 2.1, -5.2], label: 'CPU', focus: [-5, 0.6, -5.2] },
  gpu: { position: [-2, 2.4, -3.0], label: 'GPU', focus: [0, 0.5, 0] },
  sm: { position: [2.25, 1.5, -1.2], label: 'SM', focus: [0, 0.6, -0.6] },
  'cuda-core': { position: [-3.0, 0.9, 2.4], label: 'CUDA core', focus: [-1.2, 0.2, 2.3] },
  'tensor-core': { position: [1.9, 1.8, 2.0], label: 'Tensor Core', focus: [1.9, 0.5, 2] },
  hbm: { position: [8.5, 3.0, -0.5], label: 'HBM', focus: [8, 0.7, 1.2] },
  'memory-bandwidth': { position: [4.8, 0.9, 2.2], label: 'Bandwidth', focus: [4.4, 0.3, 2.2] },
};
