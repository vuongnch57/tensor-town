import type { Anchor } from '@/content/types';

/**
 * Geometry of the Transport Network district, in town coordinates. It is the "network yard" north of the gatehouse road:
 * two DGX nodes, one at each end, joined by two lanes that run side by side. The upper lane is the private freight rail
 * (InfiniBand), the lower lane is the road (Ethernet). The DPU gatehouse straddles both lanes next to the sending node,
 * the Spectrum-X control gantry arches over the road, and the lost-property bin catches parcels that fall off.
 * The camera looks from +x +z, so screen-right is +x -z.
 */
export const NODE = { w: 1.9, d: 2.7, h: 1.3 };
export const NODE_Z = 10.6;
export const NODE_A_X = -11.5;
export const NODE_B_X = -2.6;
/** The lanes run between the two nodes' facing walls. */
export const LANE_X0 = NODE_A_X + NODE.w / 2;
export const LANE_X1 = NODE_B_X - NODE.w / 2;
export const RAIL_Z = 9.8;
export const ROAD_Z = 11.4;
export const DPU_X = -9.0;
export const GANTRY_X = -7.6;
export const BIN = { x: -5.0, z: 12.55 };
/** Ground the district's trees must stay off: [x, z, halfW, halfD]. */
export const YARD_FOOTPRINT: [number, number, number, number] = [-7.1, 10.9, 6.2, 2.5];
/** Crates the lost-property bin can show, as offsets from the bin centre: [dx, dz, rotation]. First ones sit in the bin, the rest spill out. */
export const BIN_CRATES: [number, number, number][] = [
  [-0.12, -0.1, 0.2], [0.14, 0.08, -0.3], [0.0, 0.0, 0.0], [-0.1, 0.15, 0.5],
  [0.55, 0.25, 0.7], [0.65, -0.3, -0.4], [-0.6, 0.35, 0.2], [0.2, 0.62, -0.6],
];

export const anchors: Record<string, Anchor> = {
  'dgx-node': { position: [NODE_A_X, NODE.h + 0.9, NODE_Z], label: 'DGX node', focus: [NODE_A_X, 0.5, NODE_Z] },
  'dpu-gatehouse': {
    position: [DPU_X, 2.9, NODE_Z],
    label: 'DPU gatehouse',
    focus: [DPU_X, 0.9, NODE_Z],
    view: { zoom: 6.5, azimuth: 32, elevation: 38 },
  },
  infiniband: { position: [-5.0, 1.0, RAIL_Z], label: 'InfiniBand rail', focus: [-6.0, 0.1, RAIL_Z], view: { zoom: 6, azimuth: 30, elevation: 40 } },
  'ethernet-road': { position: [-5.0, 1.0, ROAD_Z], label: 'Ethernet road', focus: [-6.0, 0.1, ROAD_Z], view: { zoom: 6, azimuth: 30, elevation: 40 } },
  'spectrum-x-control': { position: [GANTRY_X, 2.2, ROAD_Z], label: 'Spectrum-X control', focus: [GANTRY_X, 0.9, ROAD_Z], view: { zoom: 6.5, azimuth: 32, elevation: 38 } },
  'dropped-parcels': { position: [BIN.x, 1.1, BIN.z], label: 'Dropped parcels', focus: [BIN.x, 0.2, BIN.z], view: { zoom: 7, azimuth: 30, elevation: 40 } },
};
