import type { ZoneSlug } from '@/content/types';
import type { SceneColor } from '../core/palette';
import { makePath, type Path, type Pt } from './path';

/**
 * Where everything sits in the town. Coordinates are written in the grid used by design/mockup-town.html
 * (x runs right-down, y runs left-down, 18 by 14 units) and converted to world units by `toWorld`.
 * Phase 1 uses low-detail placeholder buildings; later phases swap a district for its full-detail scene.
 */
export const TOWN_W = 18;
export const TOWN_D = 14;
/** Mockup height unit to world height. */
export const HS = 0.85;

export const toWorld = (x: number, y: number): Pt => [x - TOWN_W / 2, y - TOWN_D / 2];

export type BoxProp = { kind: 'box'; x: number; y: number; w: number; d: number; h: number; z0?: number; roof: SceneColor; wall?: SceneColor; flat?: boolean; win?: boolean; door?: boolean };
export type CylProp = { kind: 'cyl'; x: number; y: number; r: number; h: number; z0?: number; color: SceneColor };
export type Prop = BoxProp | CylProp;

const box = (x: number, y: number, w: number, d: number, h: number, roof: SceneColor, o: Partial<BoxProp> = {}): BoxProp => ({ kind: 'box', x, y, w, d, h, roof, ...o });
const cyl = (x: number, y: number, r: number, h: number, color: SceneColor, z0 = 0): CylProp => ({ kind: 'cyl', x, y, r, h, color, z0 });
const crate = (x: number, y: number, color: SceneColor, s = 0.5): BoxProp => box(x, y, s, s, 0.4 * (s / 0.5), color, { wall: color, flat: true });

export type District = { slug: ZoneSlug; at: Pt; marker: [number, number, number]; props: Prop[] };

export const districtLayout: District[] = [
  {
    slug: 'gpu-hall',
    at: [10, 7.5],
    marker: [10.6, 6.6, 3.2],
    props: [
      box(8, 5, 3, 2.2, 1.5, 'hall', { win: true }),
      box(11.5, 5.2, 2.2, 3.3, 1.5, 'hall', { win: true }),
      box(8.2, 5.3, 0.8, 0.7, 0.5, 'hall', { z0: 1.5, wall: 'hall', flat: true }),
      box(9.4, 5.3, 0.8, 0.7, 0.5, 'hall', { z0: 1.5, wall: 'hall', flat: true }),
      box(11.8, 5.5, 0.7, 0.9, 0.5, 'hall', { z0: 1.5, wall: 'hall', flat: true }),
      box(8, 8.3, 2.6, 1.6, 1.1, 'storage', { door: true }),
      box(7.9, 7.5, 0.8, 0.6, 0.8, 'roof', { win: true }),
    ],
  },
  {
    slug: 'packing-station',
    at: [15, 2.8],
    marker: [15.2, 2.6, 2],
    props: [box(13.6, 1.2, 2.2, 1.8, 0.9, 'parcel', { door: true }), crate(16, 1.6, 'parcel'), crate(16, 2.2, 'parcelHot'), crate(16.6, 2, 'parcel'), crate(14.2, 3.6, 'parcel', 0.4), crate(14.8, 3.7, 'storage', 0.4), box(16.2, 3.1, 0.9, 0.5, 0.5, 'wall', { wall: 'network', flat: true })],
  },
  {
    slug: 'dgx-building',
    at: [5.7, 9.6],
    marker: [5.8, 9.2, 5],
    props: [
      box(4.2, 8.2, 1.5, 1.5, 3.8, 'network', { win: true }),
      box(6.0, 8.2, 1.2, 1.5, 3.1, 'network', { win: true }),
      box(4.9, 10.0, 1.6, 1.2, 2.4, 'network', { win: true, door: true }),
      box(5.7, 8.7, 0.3, 0.4, 0.3, 'wall', { z0: 2.2, flat: true }),
    ],
  },
  {
    slug: 'transport-network',
    at: [2, 12.8],
    marker: [2.1, 12.5, 2.4],
    props: [box(0.8, 11.4, 1, 0.9, 1.2, 'network', { door: true }), box(0.8, 12.7, 1, 0.6, 1.2, 'network'), box(0.8, 11.4, 1, 1.9, 0.3, 'network', { z0: 1.2, wall: 'network', flat: true }), box(3.6, 13.4, 1, 0.5, 0.45, 'network', { flat: true })],
  },
  {
    slug: 'storage-yard',
    at: [12, 12],
    marker: [12.2, 11.8, 2.4],
    props: [box(10.8, 10.8, 2.5, 1.4, 1, 'storage', { door: true }), box(13.5, 10.9, 0.9, 0.8, 0.6, 'storage', { door: true }), box(8.4, 10.4, 0.7, 0.6, 0.5, 'parcel'), crate(11, 13, 'parcel', 0.4)],
  },
  {
    slug: 'production-line',
    at: [16.2, 7.2],
    marker: [16.2, 6.6, 2.4],
    props: [box(15.1, 5.6, 1.5, 3.5, 1, 'hall', { win: true }), box(16.7, 5.6, 1, 3.5, 0.8, 'storage', { win: true }), cyl(15.5, 5.9, 0.2, 1.3, 'roof', 1)],
  },
  {
    slug: 'control-room',
    at: [4, 3],
    marker: [4, 3, 5.8],
    props: [
      box(3.3, 2.3, 1.4, 1.4, 3.6, 'roof', { z0: 0.7, win: true }),
      box(3, 2, 2, 2, 0.5, 'roof', { z0: 4.3, wall: 'roof' }),
      cyl(4, 3, 0.07, 1, 'roof', 4.8),
      box(2.4, 4.1, 0.9, 0.8, 0.9, 'roof', { z0: 0.7, door: true }),
    ],
  },
  {
    slug: 'power-cooling',
    at: [2.1, 8],
    marker: [1.6, 7.6, 3.4],
    props: [box(0.8, 7.2, 2.6, 1.8, 1.1, 'roof', { win: true, door: true }), cyl(1.2, 9.5, 0.45, 0.9, 'coolant'), cyl(2.2, 9.7, 0.45, 0.9, 'coolant'), cyl(3.1, 9.6, 0.4, 0.8, 'coolant'), box(3.1, 7.3, 0.5, 0.5, 2, 'roof', { wall: 'roof', flat: true })],
  },
  {
    slug: 'campus-expansion',
    at: [16.2, 12],
    marker: [16.2, 11.9, 2],
    props: [box(15, 10.8, 1.4, 1.1, 0.8, 'storage'), box(16.6, 10.8, 1, 1.1, 0.8, 'storage')],
  },
];

export const districtBySlugLayout = (slug: ZoneSlug): District => {
  const d = districtLayout.find((x) => x.slug === slug);
  if (!d) throw new Error(`no layout for ${slug}`);
  return d;
};

/** The control tower stands on this hill (mockup grid units). */
export const hill = { x: 2.2, y: 1.2, w: 3.6, d: 3.6, h: 0.7 };

export const trees: [number, number][] = [
  [7, 1.2], [8, 1.6], [9.5, 0.9], [11.8, 0.8], [1, 1.6], [1.4, 4.2], [6.2, 2.5], [16.9, 0.9], [17.3, 4.5], [13, 3.7],
  [2.2, 10.6], [3.2, 11.6], [4, 12], [7.9, 13.1], [9.6, 13.3], [17.4, 13.2], [12.2, 9.6], [14.2, 9.9], [16.5, 9.9], [7, 12.9],
];

/** Main river channel, from the top edge past the control hill, the halls and the power station. */
export const riverPts: [number, number][] = [[10, -0.5], [8, 2.5], [6.5, 4.5], [4.5, 5.7], [0, 6.3], [-0.5, 6.35]];

export type ConnGeometry = { pts: [number, number][]; z?: number; bridge?: boolean; pipe?: boolean; cable?: boolean; parcels?: boolean };

export const connectionGeometry: Record<string, ConnGeometry> = {
  'road-gate-harbour': { pts: [[1, 12.5], [10.8, 12.5]], parcels: true },
  'road-gate-factory': { pts: [[7.6, 12.5], [7.6, 7.2], [8, 7.2]], parcels: true },
  'road-factory-assembly': { pts: [[13.7, 7.4], [15, 7.4]], parcels: true },
  'road-harbour-assembly': { pts: [[13.3, 11.4], [14.5, 11.4], [14.5, 9], [15, 9]], parcels: true },
  'road-harbour-newdev': { pts: [[14.5, 11.4], [14.5, 12.3], [14.8, 12.3]] },
  'rail-gate-harbour': { pts: [[1, 13.2], [10.8, 13.2]], parcels: true },
  'rail-tower-gate': { pts: [[5.5, 11.2], [5.5, 13.2]] },
  'rail-harbour-factory': { pts: [[11.8, 10.8], [11.8, 8.5]], parcels: true },
  'belt-harbour-factory': { pts: [[10.8, 11.5], [9.2, 11.5], [9.2, 9.9]], parcels: true },
  'belt-packing-factory': { pts: [[13.5, 3], [12.6, 3], [12.6, 5.5]], parcels: true },
  'belt-packing-assembly': { pts: [[16, 4.2], [16, 5.5]] },
  'bridge-tower-factory': { pts: [[6.7, 8.4], [6.7, 6.6], [8, 6.6]], z: 2.6, bridge: true, parcels: true },
  'pipe-power-factory': { pts: [[6.6, 4.6], [8, 5.8]], pipe: true },
  'pipe-power-tower': { pts: [[5.5, 5.9], [5.5, 8.2]], pipe: true },
  'cable-power-tower': { pts: [[3.4, 8.2], [4.2, 8.5]], cable: true },
  'cable-power-newdev': { pts: [[2.1, 9.1], [2.1, 13.8], [15.6, 13.8], [15.6, 13.4]], cable: true },
};

/** World-space paths (x, z) for every non-sensor connection. */
export const connectionPaths: Record<string, Path> = Object.fromEntries(Object.entries(connectionGeometry).map(([id, g]) => [id, makePath(g.pts.map(([x, y]) => toWorld(x, y)))]));

/** World position of a district marker, and of the tower top where sensor lines start. */
export const markerWorld = (slug: ZoneSlug): [number, number, number] => {
  const m = districtBySlugLayout(slug).marker;
  const [x, z] = toWorld(m[0], m[1]);
  return [x, m[2] * HS, z];
};
export const districtCenter = (slug: ZoneSlug): [number, number, number] => {
  const [x, z] = toWorld(...districtBySlugLayout(slug).at);
  return [x, 0, z];
};
export const sensorStart = (): [number, number, number] => {
  const [x, z] = toWorld(4, 3);
  return [x, 6.1 * HS, z];
};
