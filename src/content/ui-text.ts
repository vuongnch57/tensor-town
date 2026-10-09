import type { GpuModel, ModelSize, NumberFormat, PackFormat, Workload } from './types';

/** User-facing text for the zone page UI. */
export const zoneText = {
  clickPrompt: 'Click any numbered object',
  resetView: 'Reset view',
  indexLabel: (n: number) => `Index · ${n}`,
  indexTitle: (n: number) => `Zone ${n} index`,
  counts: (objects: number, concepts: number) => `${objects} clickable objects · ${concepts} concepts`,
  concepts: 'Concepts',
  overviewTitle: 'Zone overview',
  emptyPrompt: 'Click any numbered object in the scene, or pick an item from the index.',
  keyFacts: 'Key facts',
  compare: 'Compare',
  fullComparison: 'Full comparison ›',
  related: 'Related',
  comingSoon: 'coming soon',
  previous: 'Previous item',
  next: 'Next item',
  readMore: 'Read more ↑',
  readLess: 'Show less ↓',
  closeSheet: 'Close',
  loadingScene: 'Loading scene…',
  position: (n: number, total: number) => `${n} of ${total}`,
  inTheFactory: 'In the factory:',
  prevZone: (n: number) => `‹ Zone ${n}`,
  nextZone: (n: number) => `Zone ${n} ›`,
  zoneSoon: 'This zone is not built yet. It arrives in a later phase.',
  backToMap: 'Back to the map',
  fallbackNote: '3D is not available in this browser, so this is a flat picture of the zone. Everything is still reachable from the index.',
  sceneLabel: (title: string) => `${title} scene. Click any numbered object for details.`,
};

export const gpuHallText = {
  simulate: {
    title: 'Simulate',
    workload: 'Workload',
    gpu: 'GPU',
    format: 'Number format',
    smBusy: 'SMs busy',
    memoryBound: 'Memory-bound',
    computeBound: 'Compute-bound',
    illustrative: 'Illustrative, not measured',
    workloadOptions: [
      { value: 'training', label: 'Training' },
      { value: 'inference', label: 'LLM inference' },
    ] as { value: Workload; label: string }[],
    gpuOptions: [
      { value: 'h100', label: 'H100' },
      { value: 'h200', label: 'H200' },
    ] as { value: GpuModel; label: string }[],
    formatOptions: [
      { value: 'fp16', label: 'FP16' },
      { value: 'fp8', label: 'FP8' },
    ] as { value: NumberFormat; label: string }[],
  },
};

export const packText = {
  simulate: {
    title: 'Simulate',
    format: 'Number format',
    model: 'Model size',
    weights: 'Weights need',
    fits: 'Fits on one 80 GB GPU',
    fitsYes: 'Fits',
    fitsNo: 'Does not fit',
    legendTitle: 'Bits on each crate lid',
    legend: [
      { key: 'roof', label: 'Sign' },
      { key: 'parcelHot', label: 'Exponent (range)' },
      { key: 'coolant', label: 'Mantissa or value (detail)' },
    ],
    illustrative: 'Illustrative, not measured. Weights only: no activations or cache.',
    formatOptions: [
      { value: 'fp32', label: 'FP32' },
      { value: 'bf16', label: 'BF16' },
      { value: 'fp8', label: 'FP8' },
      { value: 'int8', label: 'INT8' },
    ] as { value: PackFormat; label: string }[],
    modelOptions: [
      { value: '7b', label: '7B' },
      { value: '13b', label: '13B' },
      { value: '70b', label: '70B' },
    ] as { value: ModelSize; label: string }[],
    gb: (n: number) => `${n} GB`,
  },
};
