import type { Anchor } from '@/content/types';

/**
 * Geometry of the DGX building in town coordinates. The scene reads like one server chassis seen as a small town block:
 * two rows of four GPU rooms on the HGX board, the NVSwitch hub as the tall spine hall between the rows,
 * sky-bridges joining neighbouring rooms, the PCIe corridor looping round the edge, and the rest of the DGX
 * (CPU and network block, power and cooling block) in front. Everything is built around CENTER.
 */
export const CENTER: [number, number] = [-6.4, 3.8];
export const BOARD_HALF_X = 3.2;
export const BOARD_HALF_Z = 2.45;
export const BOARD_TOP = 0.25;
export const ROOM_COUNT = 8;
export const ROOM_SIZE = 0.7;
export const ROOM_HEIGHT = 1.8;
export const ROW_Z = 1.5;
export const ROOM_X = [-2.25, -0.75, 0.75, 2.25] as const;
export const SPINE = { halfX: 2.7, halfZ: 0.45, height: 2.3 };
export const NVSWITCH_CHIPS = 4;
export const BRIDGE_Y = 1.3;
export const SPOKE_Y = 0.9;
/** PCIe corridor loop (centre line), half sizes. */
export const CORRIDOR = { halfX: 2.95, halfZ: 2.2 };
/** The CPU and network block and the power and cooling block in front of the board. */
export const BLOCKS = {
  cpu: { x: -1.6, z: 3.6, w: 2.6, d: 1.2, h: 1.2 },
  power: { x: 1.5, z: 3.55, w: 1.8, d: 1.0, h: 0.95 },
};

/** Rooms 0 to 3 are the back row, 4 to 7 the front row. */
export const roomPos = (i: number): [number, number] => [ROOM_X[i % 4], i < 4 ? -ROW_Z : ROW_Z];
/** Rooms 2k and 2k+1 share an NVLink bridge. */
export const bridgePairs: [number, number][] = [[0, 1], [2, 3], [4, 5], [6, 7]];

const at = (x: number, y: number, z: number): [number, number, number] => [CENTER[0] + x, y, CENTER[1] + z];

/** World positions of each Zone 3 object. Camera looks from +x +z, so the front row and the blocks face the viewer. */
export const anchors: Record<string, Anchor> = {
  'gpu-room': { position: at(0.75, ROOM_HEIGHT + 0.75, ROW_Z), label: 'GPU room', focus: at(0.75, 0.9, ROW_Z) },
  'nvlink-bridge': {
    position: at(-1.5, BRIDGE_Y + 0.75, ROW_Z),
    label: 'NVLink bridge',
    focus: at(-1.5, BRIDGE_Y - 0.1, ROW_Z),
    // looked at from the south, a little above, and much closer, so the deck, glass sides and arch read clearly
    view: { zoom: 7.5, azimuth: 18, elevation: 40 },
  },
  'nvswitch-hub': { position: at(0, SPINE.height + 0.95, 0), label: 'NVSwitch hub', focus: at(0, 1.2, 0) },
  'hgx-board': { position: at(BOARD_HALF_X - 0.2, 0.7, BOARD_HALF_Z - 0.2), label: 'HGX board', focus: at(BOARD_HALF_X - 0.2, 0.2, BOARD_HALF_Z - 0.2) },
  'dgx-system': { position: at(BLOCKS.cpu.x, BLOCKS.cpu.h + 0.85, BLOCKS.cpu.z), label: 'DGX system', focus: at(BLOCKS.cpu.x, 0.5, BLOCKS.cpu.z) },
};
