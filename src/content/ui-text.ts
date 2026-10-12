import type { GpuSharing, LineNeed, StoragePath, NetworkKind, FabricInterconnect, GpuModel, ModelSize, NumberFormat, PackFormat, Workload } from './types';

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

export const fabricText = {
  simulate: {
    title: 'Simulate',
    interconnect: 'Interconnect',
    run: 'Run all-to-all',
    running: 'Running…',
    exchange: 'Exchange time',
    illustrative: 'Illustrative, not measured. All 8 GPUs send to all 7 others.',
    reference: 'PCIe only = 1.00×',
    interconnectOptions: [
      { value: 'pcie', label: 'PCIe only' },
      { value: 'nvlink', label: 'NVLink' },
      { value: 'nvswitch', label: 'NVLink + NVSwitch' },
    ] as { value: FabricInterconnect; label: string }[],
    time: (n: number) => `${n.toFixed(2)}×`,
    faster: (n: number) => (n > 1.05 ? `${n.toFixed(1)}× faster` : 'About the same'),
  },
};

export const netText = {
  simulate: {
    title: 'Simulate',
    network: 'Network',
    congestion: 'Congestion',
    throughput: 'Effective throughput',
    dropped: 'Dropped parcels',
    illustrative: 'Illustrative, not measured. Shares of the ideal, for one pair of nodes.',
    networkOptions: [
      { value: 'infiniband', label: 'InfiniBand' },
      { value: 'ethernet', label: 'Ethernet' },
      { value: 'spectrumx', label: 'Spectrum-X' },
    ] as { value: NetworkKind; label: string }[],
    percent: (n: number) => `${Math.round(n * 100)}%`,
    droppedPill: (n: number) => (n <= 0 ? 'None dropped' : n < 0.1 ? 'A few dropped' : 'Many dropped and re-sent'),
  },
};

export const storageText = {
  simulate: {
    title: 'Simulate',
    cache: 'NVMe cache',
    path: 'Path',
    epoch: (n: number) => `Epoch ${n}`,
    next: 'Next epoch ›',
    restart: 'Restart ↺',
    fetch: 'Fetch time per epoch',
    fromCache: 'Read from cache',
    illustrative: 'Illustrative, not measured. Epoch 1 through the CPU with no cache = 1.00×.',
    cacheOptions: [
      { value: 'on', label: 'On' },
      { value: 'off', label: 'Off' },
    ] as { value: 'on' | 'off'; label: string }[],
    pathOptions: [
      { value: 'cpu', label: 'Via CPU' },
      { value: 'gpudirect', label: 'GPUDirect' },
    ] as { value: StoragePath; label: string }[],
    time: (n: number) => `${n.toFixed(2)}×`,
    percent: (n: number) => `${Math.round(n * 100)}%`,
    faster: (n: number) => (n < 0.95 ? `${(1 / n).toFixed(1)}× faster` : 'Reference speed'),
  },
};

export const lineText = {
  simulate: {
    title: 'Pick a need',
    need: 'Business need',
    lights: 'Lights up',
    illustrative: 'A rule of thumb, not a measurement.',
    needOptions: [
      { value: 'tools', label: 'Start from tested parts' },
      { value: 'prepare', label: 'Prepare data faster' },
      { value: 'train', label: 'Train a model' },
      { value: 'optimize', label: 'Make a model faster to run' },
      { value: 'serve-custom', label: 'Serve a custom mix of models' },
      { value: 'serve-ready', label: 'Get a ready endpoint fast' },
    ] as { value: LineNeed; label: string }[],
    answers: {
      tools: { station: 'NGC', why: 'A catalog of tested containers, models and tools.' },
      prepare: { station: 'RAPIDS', why: 'Runs data preparation on the GPU.' },
      train: { station: 'Training line', why: 'Many GPUs working together, with NCCL keeping them in step.' },
      optimize: { station: 'TensorRT', why: 'Compiles a trained model into a leaner, faster one.' },
      'serve-custom': { station: 'Shipping dock · Triton', why: 'The configurable bay: you choose the models and settings.' },
      'serve-ready': { station: 'Shipping dock · NIM', why: 'The pre-packed box: an optimised model with an interface, ready to run.' },
    } as Record<LineNeed, { station: string; why: string }>,
  },
};

export const shareText = {
  simulate: {
    title: 'Share a GPU',
    mode: 'Sharing mode',
    utilization: 'GPU utilization',
    sm: 'SM activity',
    perJob: 'Speed per job',
    isolation: 'Isolation',
    isolated: 'Walled off',
    notIsolated: 'None',
    trap: (sm: number) => `Reads 100% busy, but only ${sm}% of the SMs are working.`,
    fine: 'Both readings agree: the GPU is really in use.',
    illustrative: 'Illustrative numbers for three small jobs, not a measurement.',
    modeOptions: [
      { value: 'one', label: 'One small job' },
      { value: 'mig', label: 'MIG' },
      { value: 'time-slicing', label: 'Time-slicing' },
      { value: 'vgpu', label: 'vGPU' },
    ] as { value: GpuSharing; label: string }[],
  },
};
