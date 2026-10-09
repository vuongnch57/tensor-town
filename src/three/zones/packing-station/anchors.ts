import type { Anchor } from '@/content/types';

/**
 * World positions (units) of each Zone 2 object, in the Packing Dock's yard east of the packing building.
 * Unlike Zone 1 these are town coordinates directly. Camera looks from +x +z, so screen-right is +x -z.
 */
export const anchors: Record<string, Anchor> = {
  fp32: { position: [15.0, 1.9, -8.4], label: 'FP32', focus: [15.0, 0.5, -8.4] },
  'bf16-fp16': { position: [16.4, 1.5, -9.8], label: 'BF16 / FP16', focus: [16.4, 0.4, -9.8] },
  fp8: { position: [17.8, 1.2, -11.2], label: 'FP8', focus: [17.8, 0.3, -11.2] },
  int8: { position: [19.2, 1.2, -12.6], label: 'INT8', focus: [19.2, 0.3, -12.6] },
  'delivery-truck': { position: [20.0, 2.1, -5.6], label: 'Truck', focus: [20.0, 0.5, -5.6] },
  'transformer-engine': { position: [16.8, 2.3, -5.6], label: 'Transformer Engine', focus: [16.8, 0.6, -5.6] },
};
