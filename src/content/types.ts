export const ZONE_SLUGS = [
  'gpu-hall',
  'packing-station',
  'dgx-building',
  'transport-network',
  'storage-yard',
  'production-line',
  'control-room',
  'power-cooling',
  'campus-expansion',
] as const;
export type ZoneSlug = (typeof ZONE_SLUGS)[number];

export type ItemKind = 'object' | 'concept';

/** Scene colour token used for the metaphor swatch (see design/tokens.json). */
export type SceneToken =
  | 'scene-ground'
  | 'scene-path'
  | 'scene-coolant'
  | 'scene-hall'
  | 'scene-storage'
  | 'scene-network'
  | 'scene-wall'
  | 'scene-roof'
  | 'scene-parcel'
  | 'scene-parcel-hot'
  | 'scene-idle';

/** One row of a comparison. `values[0]` is the item itself, the rest follow `compare.with`. */
export type CompareRow = {
  label: string;
  values: string[];
  /** Index into `values` of the strongest cell, if the row has one. */
  best?: number;
};

/** Simulation state for Zone 1 (the only simulated zone so far). */
export type Workload = 'training' | 'inference';
export type GpuModel = 'h100' | 'h200';
export type NumberFormat = 'fp16' | 'fp8';
export type SimParams = { workload: Workload; gpu: GpuModel; format: NumberFormat };

/** Simulation state for Zone 2 (the packing dock). */
export type PackFormat = 'fp32' | 'bf16' | 'fp8' | 'int8';
export type ModelSize = '7b' | '13b' | '70b';
export type PackSimParams = { format: PackFormat; model: ModelSize };

/** Simulation state for Zone 3 (the DGX building). */
export type FabricInterconnect = 'pcie' | 'nvlink' | 'nvswitch';
export type FabricSimParams = { interconnect: FabricInterconnect };

/** Simulation state for Zone 4 (the transport network). Congestion runs from 0 (empty lanes) to 1 (jammed). */
export type NetworkKind = 'infiniband' | 'ethernet' | 'spectrumx';
export type NetSimParams = { network: NetworkKind; congestion: number };

/** Simulation state for Zone 5 (the storage yard). `epoch` counts passes over the data, starting at 1. */
export type StoragePath = 'cpu' | 'gpudirect';
export type StorageSimParams = { cache: boolean; path: StoragePath; epoch: number };

/** Simulation state for Zone 6 (the production line): what the business needs decides which station lights up. */
export type LineNeed = 'tools' | 'prepare' | 'train' | 'optimize' | 'serve-custom' | 'serve-ready';
export type LineSimParams = { need: LineNeed };

/** Simulation state for Zone 7 (the control room): how one GPU is shared between jobs. */
export type GpuSharing = 'one' | 'mig' | 'time-slicing' | 'vgpu';
export type ShareSimParams = { sharing: GpuSharing };

export type Item = {
  id: string; // unique across the site, e.g. 'hbm'
  zone: ZoneSlug;
  kind: ItemKind;
  number?: number; // objects only; matches the hotspot and the zone index
  name: string;
  /** Other names people search for (spelled-out forms, plurals). Never numbers or claims. */
  aliases?: string[];
  category: string;
  metaphor: string;
  swatch?: SceneToken;
  summary: string; // 2–3 sentences
  facts: { label: string; value: string }[]; // from SPEC §8 only, else TODO(fact)
  compare?: {
    /** Display names of the other columns (some comparands, e.g. GDDR, are not items). */
    with: string[];
    rows: CompareRow[];
    fullCompareId?: string;
  };
  related: string[]; // item ids, same zone or other zones
  anchorId?: string; // objects: id of the 3D anchor in anchors.ts
  sim?: Partial<SimParams>;
  /** Zone 2: simulation state to apply on select. */
  packSim?: Partial<PackSimParams>;
  /** Zone 3: simulation state to apply on select. */
  fabricSim?: Partial<FabricSimParams>;
  /** Zone 4: simulation state to apply on select. */
  netSim?: Partial<NetSimParams>;
  /** Zone 5: simulation state to apply on select. */
  storageSim?: Partial<StorageSimParams>;
  /** Zone 6: simulation state to apply on select. */
  lineSim?: Partial<LineSimParams>;
  /** Zone 7: simulation state to apply on select. */
  shareSim?: Partial<ShareSimParams>;
};

export type Comparison = {
  id: string;
  title: string;
  zones: ZoneSlug[];
  columns: string[]; // display names
  rows: CompareRow[];
  whyConfused: string;
};

export type Zone = {
  slug: ZoneSlug;
  number: number;
  title: string;
  blurb: string;
};

/** Position of an object in the 3D scene (world units) plus hotspot label. */
export type Anchor = {
  position: [number, number, number];
  label: string;
  /** Where the camera looks when this object is selected (defaults to the hotspot position). */
  focus?: [number, number, number];
  /** Closer or turned camera for small objects: zoom multiplier and the viewing angles in degrees (default 45° azimuth, 35° elevation). */
  view?: { zoom?: number; azimuth?: number; elevation?: number };
};
