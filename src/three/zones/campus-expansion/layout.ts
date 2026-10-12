import type { Anchor } from '@/content/types';
import type { Pt } from '@/lib/path';

/**
 * Geometry of the New Development district in town coordinates. Four building slots sit in a 2 x 2 grid, split by a spine of roads:
 * a vertical spine (where the town's power cable arrives from the south) and a horizontal corridor (where the town road arrives from the west).
 * The first slot is the scalable unit shown in detail. Slots that are not built yet stay open as the expansion plot. A rented depot stands south of the grid.
 * The camera looks from +x +z, so the +x and +z faces are the ones you see.
 */
export const BLOCK = { w: 2.4, d: 2.2, h: 1.2 };
export const SLOTS: { x: number; z: number }[] = [
  { x: 16.8, z: 9.0 },
  { x: 20.0, z: 9.0 },
  { x: 16.8, z: 11.9 },
  { x: 20.0, z: 11.9 },
];
export const SPINE_X = 18.4;
export const CORRIDOR_Z = 10.45;
export const DEPOT = { x: 20.0, z: 15.7, w: 2.8, d: 1.6, h: 1.0 };
export const BOARD = { x: 16.8, z: 13.7 };
export const CRANE = { x: 21.9, z: 12.6 };

/** Lanes: cargo on the corridor, power up the spine, and the lease line from the rented depot to the nearest slot. */
export const paths: Record<'corridor' | 'spine' | 'lease', Pt[]> = {
  corridor: [[15.4, CORRIDOR_Z], [21.4, CORRIDOR_Z]],
  spine: [[SPINE_X, 13.8], [SPINE_X, 7.9]],
  lease: [[DEPOT.x, DEPOT.z - DEPOT.d / 2 - 0.1], [DEPOT.x, SLOTS[3].z + BLOCK.d / 2 + 0.1]],
};

/** Ground the district's trees must stay off: [x, z, halfW, halfD]. */
export const DISTRICT_FOOTPRINT: [number, number, number, number] = [18.8, 11.8, 4.5, 5.2];

const VIEW = { azimuth: 45, elevation: 40 };

export const anchors: Record<string, Anchor> = {
  'scalable-unit': { position: [SLOTS[0].x, BLOCK.h + 1.3, SLOTS[0].z], label: 'Scalable unit', focus: [SLOTS[0].x, 0.7, SLOTS[0].z], view: { zoom: 6, ...VIEW } },
  'superpod-campus': { position: [SPINE_X, 2.3, 11.4], label: 'SuperPOD campus', focus: [SPINE_X + 0.5, 0.5, 10.8], view: { zoom: 4.2, ...VIEW } },
  'expansion-plot': { position: [BOARD.x, 2.6, BOARD.z], label: 'Expansion plot', focus: [BOARD.x, 0.8, BOARD.z], view: { zoom: 5.5, ...VIEW } },
  'rented-capacity': { position: [DEPOT.x, DEPOT.h + 1.5, DEPOT.z], label: 'Rented capacity', focus: [DEPOT.x, 0.6, DEPOT.z], view: { zoom: 5.5, ...VIEW } },
};
