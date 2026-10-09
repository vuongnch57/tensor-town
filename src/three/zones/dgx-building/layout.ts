import type { Anchor } from '@/content/types';

/**
 * Geometry of the DGX building in town coordinates. The scene is a round machine: 8 GPU rooms on a ring around the
 * NVSwitch hub, all standing on the HGX board, inside the DGX compound (board, ring corridor and the annex to the south).
 * Everything is built around CENTER; `at` turns a local point into a world point for anchors.
 */
export const CENTER: [number, number] = [-6.4, 3.8];
export const BOARD_HALF = 2.85;
export const BOARD_TOP = 0.25;
export const ROOM_COUNT = 8;
export const ROOM_RING = 1.8;
export const ROOM_SIZE = 0.62;
export const ROOM_HEIGHT = 2.3;
export const HUB_HEIGHT = 2.9;
export const HUB_R = 0.6;
export const BRIDGE_Y = 1.95;
export const SPOKE_Y = 0.95;
export const CORRIDOR_R = 2.52;
/** Annex (the rest of the DGX: CPUs, network cards, power) south of the board. */
export const ANNEX: { x: number; z: number; w: number; d: number; h: number } = { x: CENTER[0] - 1.4, z: CENTER[1] + 3.55, w: 2.4, d: 1.2, h: 1.3 };

export const roomAngle = (i: number) => (i / ROOM_COUNT) * Math.PI * 2;
/** Room centre relative to CENTER. */
export const roomPos = (i: number): [number, number] => [Math.cos(roomAngle(i)) * ROOM_RING, Math.sin(roomAngle(i)) * ROOM_RING];
/** Rooms 2k and 2k+1 share an NVLink bridge. */
export const bridgePairs: [number, number][] = [[0, 1], [2, 3], [4, 5], [6, 7]];

const at = (x: number, y: number, z: number): [number, number, number] => [CENTER[0] + x, y, CENTER[1] + z];

/** World positions of each Zone 3 object. Camera looks from +x +z, so the south-east side faces the viewer. */
export const anchors: Record<string, Anchor> = {
  'gpu-room': { position: at(roomPos(2)[0], ROOM_HEIGHT + 0.55, roomPos(2)[1]), label: 'GPU room', focus: at(roomPos(2)[0], 1.2, roomPos(2)[1]) },
  'nvlink-bridge': { position: at(1.53, BRIDGE_Y + 0.8, 0.64), label: 'NVLink bridge', focus: at(1.53, BRIDGE_Y - 0.6, 0.64) },
  'nvswitch-hub': { position: at(0, HUB_HEIGHT + 0.9, 0), label: 'NVSwitch hub', focus: at(0, 1.0, 0) },
  'hgx-board': { position: at(2.45, 0.7, 2.45), label: 'HGX board', focus: at(2.45, 0.2, 2.45) },
  'dgx-system': { position: at(ANNEX.x - CENTER[0], ANNEX.h + 0.7, ANNEX.z - CENTER[1]), label: 'DGX system', focus: at(ANNEX.x - CENTER[0], 0.5, ANNEX.z - CENTER[1]) },
};
