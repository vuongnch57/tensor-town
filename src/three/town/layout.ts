import type { ZoneSlug } from '@/content/types';
import { connections } from '@/content/town';
import type { SceneColor } from '../core/palette';
import { makePath, type Path, type Pt } from './path';

/**
 * Where everything sits in the town, in world units. The ground top is y = 0 and spans x ±TOWN_W/2, z ±TOWN_D/2.
 * The camera looks from +x +z, so screen-right is +x -z and screen-down is +x +z (see design/mockup-town.html for the arrangement).
 * The Factory Quarter is the Zone 1 scene at full detail (see FactoryHero); the other districts are simpler buildings in the same style.
 */
export const TOWN_W = 46;
export const TOWN_D = 36;

export type Building = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** Base height (for things standing on the hill or bridging). */
  y0?: number;
  wall?: SceneColor;
  roof?: SceneColor;
  /** Roof colour that is not a palette token (derived), as a hex string. */
  roofHex?: string;
  /** Windows on the +z and +x faces: columns across and rows up. */
  win?: [cols: number, rows: number];
  door?: boolean;
  /** No roof overhang (cap, platform, crate-like). */
  flat?: boolean;
};
export type Cylinder = { x: number; z: number; r: number; h: number; y0?: number; color: SceneColor };

/** Storage roofs are the storage colour pushed toward the roof slate (same value as derived.storageRoof). */
const STORAGE_ROOF = 'storage-roof';

export const buildings: Building[] = [
  // Control Tower on its hill (hill base is drawn separately)
  { x: -14, z: -9, w: 2.2, d: 2.2, h: 5, y0: 0.6, roof: 'roof', win: [2, 4] },
  { x: -14, z: -9, w: 3.2, d: 3.2, h: 0.5, y0: 5.6, wall: 'roof', roof: 'roof', flat: true },
  { x: -16.4, z: -6.8, w: 1.8, d: 1.5, h: 1.2, y0: 0.6, roof: 'roof', door: true, win: [1, 1] },
  // Power Station
  { x: -13.1, z: 1.9, w: 5, d: 3.4, h: 2, roof: 'roof', win: [3, 1], door: true },
  { x: -10.2, z: 5.4, w: 1, d: 1, h: 3.6, wall: 'roof', roof: 'roof', flat: true },
  { x: -16.6, z: 4.6, w: 1.6, d: 1.4, h: 1, roof: 'network', door: true },
  // Tower Block
  { x: -7.8, z: 3.8, w: 2.2, d: 2.2, h: 6, roof: 'network', win: [2, 5] },
  { x: -4.9, z: 3.8, w: 2, d: 2, h: 4.8, roof: 'network', win: [2, 4] },
  { x: -6.3, z: 7.2, w: 2.8, d: 2.2, h: 3.4, roof: 'network', win: [3, 3], door: true },
  // Gatehouse and Rail Yard
  { x: -14.3, z: 10.0, w: 1.6, d: 1.6, h: 2.6, roof: 'network', door: true },
  { x: -14.3, z: 15.2, w: 1.6, d: 1.6, h: 2.6, roof: 'network' },
  { x: -14.3, z: 12.6, w: 1.8, d: 6.8, h: 0.5, y0: 2.6, wall: 'network', roof: 'network', flat: true },
  { x: -8.5, z: 16.4, w: 3.4, d: 1.8, h: 1.6, roof: 'network', win: [2, 1], door: true },
  // Harbour Depot
  { x: 5.7, z: 10.8, w: 5, d: 3, h: 2.2, roof: 'storage', roofHex: STORAGE_ROOF, door: true, win: [2, 1] },
  { x: 11.2, z: 11.4, w: 3, d: 2.4, h: 1.6, roof: 'storage', roofHex: STORAGE_ROOF, door: true },
  { x: 3.6, z: 6.9, w: 1.8, d: 1.5, h: 1.1, roof: 'roof', door: true },
  // Packing Dock
  { x: 11.4, z: -8.5, w: 4.4, d: 3.2, h: 2, roof: 'parcel', door: true, win: [3, 1] },
  { x: 16.6, z: -5.2, w: 2.4, d: 1.2, h: 1, wall: 'network', roof: 'wall', flat: true },
  // Assembly Row
  { x: 14.6, z: 0.4, w: 2.8, d: 6.6, h: 1.8, roof: 'hall', win: [2, 1] },
  { x: 18, z: 0.4, w: 2.2, d: 6.6, h: 1.4, roof: 'storage', win: [2, 1] },
  // New Development
  { x: 17, z: 9, w: 3, d: 2.4, h: 1.6, roof: 'storage' },
  { x: 20.2, z: 9, w: 2.4, d: 2.4, h: 1.6, roof: 'storage' },
  { x: 17, z: 12.6, w: 3, d: 2.4, h: 0.06, y0: 0, wall: 'path', roof: 'path', flat: true },
  { x: 20.2, z: 12.6, w: 2.4, d: 2.4, h: 0.06, y0: 0, wall: 'path', roof: 'path', flat: true },
];

export const cylinders: Cylinder[] = [
  { x: -14.2, z: 5.6, r: 0.9, h: 1.4, color: 'coolant' },
  { x: -12.0, z: 6.1, r: 0.9, h: 1.4, color: 'coolant' },
  { x: -17.2, z: 1.4, r: 0.6, h: 2.2, color: 'coolant' },
  { x: 13.3, z: -2.4, r: 0.4, h: 2.8, y0: 1.8, color: 'roof' },
  { x: -14, z: -9, r: 0.07, h: 1.2, y0: 6.1, color: 'roof' },
  // Pond where the river begins (low and wide, so it reads as water)
  { x: 7.6, z: -15.4, r: 2.3, h: 0.07, color: 'coolant' },
];

/** The hill under the control tower. */
export const hill = { x: -14, z: -9, w: 7.6, d: 7.6, h: 0.6 };

/** The Zone 1 scene is placed so the hall sits here (the hall is the origin of its own coordinates). */
export const FACTORY_ORIGIN: [number, number] = [1.9, 1];
export const FACTORY_BLOCKS: Building[] = [
  { x: 1.9, z: 1, w: 6.6, d: 6.4, h: 1.4, roof: 'hall' },
  { x: -3.1, z: -4.2, w: 2.8, d: 2.2, h: 1.3, roof: 'roof' },
  { x: 9.9, z: 2.2, w: 3.6, d: 3.4, h: 1.9, roof: 'storage' },
];

type District = { slug: ZoneSlug; focus: Pt; marker: [number, number, number] };

export const districtLayout: District[] = [
  { slug: 'gpu-hall', focus: [4, 1], marker: [1.9, 3.1, 1] },
  { slug: 'packing-station', focus: [12.5, -7.5], marker: [11.4, 3.5, -8.5] },
  { slug: 'dgx-building', focus: [-6.3, 5], marker: [-6.3, 7.4, 3.9] },
  { slug: 'transport-network', focus: [-12, 12], marker: [-14.3, 3.7, 12.6] },
  { slug: 'storage-yard', focus: [6.5, 10.5], marker: [5.7, 3.6, 10.8] },
  { slug: 'production-line', focus: [16, 0.4], marker: [16.4, 3.4, 0.4] },
  { slug: 'control-room', focus: [-14, -9], marker: [-14, 7.6, -9] },
  { slug: 'power-cooling', focus: [-13, 2.5], marker: [-16.4, 3.6, 2.6] },
  { slug: 'campus-expansion', focus: [18.4, 10.6], marker: [18.5, 2.8, 10.6] },
];

const find = (slug: ZoneSlug): District => {
  const d = districtLayout.find((x) => x.slug === slug);
  if (!d) throw new Error(`no layout for ${slug}`);
  return d;
};
export const markerWorld = (slug: ZoneSlug): [number, number, number] => [...find(slug).marker];
export const districtCenter = (slug: ZoneSlug): [number, number, number] => [find(slug).focus[0], 0, find(slug).focus[1]];
/** Where sensor lines leave the control tower. */
export const sensorStart = (): [number, number, number] => [-14, 6.4, -9];

/** Main river channel, from a pond near the Packing Dock past the control hill and the halls, out through the power station's bank. */
export const riverPts: Pt[] = [[6.4, -14.6], [4, -12], [-1, -8.5], [-6.5, -5.5], [-10, -2.2], [-14, -1.2], [-23, -0.8]];

export type ConnGeometry = { pts: Pt[]; z?: number; bridge?: boolean; pipe?: boolean; cable?: boolean; parcels?: boolean };

export const connectionGeometry: Record<string, ConnGeometry> = {
  'road-gate-harbour': { pts: [[-12.5, 13.2], [5.7, 13.2], [5.7, 12.4]], parcels: true },
  'road-gate-factory': { pts: [[0.9, 13.2], [0.9, 4.4]], parcels: true },
  'road-factory-assembly': { pts: [[5.4, -0.6], [13.0, -0.6]], parcels: true },
  'road-harbour-assembly': { pts: [[12.8, 11.4], [12.8, 5], [14.6, 5], [14.6, 3.8]], parcels: true },
  'road-harbour-newdev': { pts: [[12.8, 11.4], [15.4, 11.4]] },
  'rail-gate-harbour': { pts: [[-12.5, 14.7], [10.6, 14.7], [10.6, 12.7]], parcels: true },
  'rail-tower-gate': { pts: [[-6.3, 8.4], [-6.3, 14.7]] },
  'rail-harbour-factory': { pts: [[11.6, 10.2], [11.6, 4.0]], parcels: true },
  'belt-harbour-factory': { pts: [[8.4, 9.3], [8.4, 6.0], [9.9, 6.0], [9.9, 4.0]], parcels: true },
  'belt-packing-factory': { pts: [[9.6, -6.9], [9.6, -3.4], [1.9, -3.4], [1.9, -2.3]], parcels: true },
  'belt-packing-assembly': { pts: [[13.6, -6.9], [13.6, -4.6], [14.6, -4.6], [14.6, -2.9]] },
  'bridge-tower-factory': { pts: [[-3.9, 3.8], [-1.2, 3.8]], z: 3.1, bridge: true, parcels: true },
  'pipe-power-factory': { pts: [[0.5, -9.2], [0.5, -2.4]], pipe: true },
  'pipe-power-tower': { pts: [[-7.8, -1.6], [-7.8, 2.6]], pipe: true },
  'cable-power-tower': { pts: [[-10.6, 2.0], [-9.6, 2.0], [-9.6, 3.8], [-8.95, 3.8]], cable: true },
  'cable-power-newdev': { pts: [[-13, 3.7], [-13, 16.2], [18.6, 16.2], [18.6, 13.8]], cable: true },
};

/** World-space paths for every non-sensor connection. */
export const connectionPaths: Record<string, Path> = Object.fromEntries(Object.entries(connectionGeometry).map(([id, g]) => [id, makePath(g.pts)]));

/** Half-width each connection kind occupies on the ground, used to keep trees off roads. */
export const CLEARANCE: Record<string, number> = { river: 1.1, roads: 0.5, rail: 0.5, belts: 0.45, river_pipe: 0.4, power: 0.3 };

export const lamps: readonly (readonly [number, number])[] = [[-9, 12.3], [-3.5, 12.3], [2.5, 12.3], [8.6, 12.3], [-0.2, 8.5], [12, 6]];
export const fences: [number, number][][] = [
  [[8.6, -11.5], [8.6, -6.0]],
  [[8.6, -11.5], [16.2, -11.5]],
  [[15.4, 7.2], [22.4, 7.2]],
  [[15.4, 7.2], [15.4, 8.2]],
  [[15.4, 14.4], [22.4, 14.4]],
];
export const crates: readonly (readonly [number, number, number?])[] = [
  [15.0, -9.0], [15.5, -8.5], [14.6, -9.4], [8.0, 11.8], [8.8, 12.2], [14.4, 11.6], [14.9, 12.2], [-10.8, 12.2],
];

// ---- trees: seeded grid with jitter, kept clear of buildings, roads and the river ----
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const segDist = (p: Pt, a: Pt, b: Pt) => {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dz));
};

/** Every footprint a tree must stay off: [x, z, halfW, halfD]. */
export function footprints(): [number, number, number, number][] {
  return [
    ...buildings.map((b) => [b.x, b.z, b.w / 2, b.d / 2] as [number, number, number, number]),
    ...FACTORY_BLOCKS.map((b) => [b.x, b.z, b.w / 2 + 1, b.d / 2 + 1] as [number, number, number, number]),
    ...cylinders.map((c) => [c.x, c.z, c.r, c.r] as [number, number, number, number]),
    [hill.x, hill.z, hill.w / 2, hill.d / 2],
    [FACTORY_ORIGIN[0] + 1, FACTORY_ORIGIN[1] + 0.5, 9, 7],
  ];
}

/** Ground strips (polyline + half-width) a tree must stay off. */
export function strips(): { pts: Pt[]; half: number }[] {
  const out: { pts: Pt[]; half: number }[] = [{ pts: riverPts, half: CLEARANCE.river }];
  for (const cn of connections) {
    const g = connectionGeometry[cn.id];
    if (!g) continue;
    out.push({ pts: g.pts, half: g.pipe ? CLEARANCE.river_pipe : (CLEARANCE[cn.group] ?? 0.4) });
  }
  return out;
}

export const treeIsClear = (p: Pt, margin = 0.9): boolean => {
  if (Math.abs(p[0]) > TOWN_W / 2 - 1.2 || Math.abs(p[1]) > TOWN_D / 2 - 1.2) return false;
  for (const [x, z, hw, hd] of footprints()) if (Math.abs(p[0] - x) < hw + margin && Math.abs(p[1] - z) < hd + margin) return false;
  for (const s of strips()) for (let i = 1; i < s.pts.length; i++) if (segDist(p, s.pts[i - 1], s.pts[i]) < s.half + margin) return false;
  for (const [x, z] of lamps) if (Math.hypot(p[0] - x, p[1] - z) < 1) return false;
  return true;
};

export function generateTrees(): [number, number, number][] {
  const out: [number, number, number][] = [];
  const step = 2.7;
  let k = 0;
  for (let x = -TOWN_W / 2 + 1.5; x < TOWN_W / 2; x += step) {
    for (let z = -TOWN_D / 2 + 1.5; z < TOWN_D / 2; z += step) {
      k++;
      const p: Pt = [x + (hash(k) - 0.5) * 1.6, z + (hash(k + 999) - 0.5) * 1.6];
      // Denser toward the rim, sparse in the middle, so the town stays open.
      const rim = Math.max(Math.abs(p[0]) / (TOWN_W / 2), Math.abs(p[1]) / (TOWN_D / 2));
      if (hash(k + 4242) > 0.3 + rim * 0.55) continue;
      if (treeIsClear(p)) out.push([p[0], p[1], 0.85 + hash(k + 77) * 0.55]);
    }
  }
  return out;
}

export const trees = generateTrees();
