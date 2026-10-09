import type { Anchor } from '@/content/types';
import type { Pt } from '@/lib/path';

/**
 * Geometry of the Production Line (Assembly Row) in town coordinates. Two rows of stations face a corridor with two conveyor lanes.
 * Back row, the build line (west to east): NGC tool store, RAPIDS prep area, the training line, the TensorRT compactor.
 * Front row, the serving side (east to west): the shipping dock, the 24/7 shop, and the customer queue in the plaza.
 * Data parcels ride the eastbound lane through the build line; finished packages ride the westbound lane to the shop.
 * The camera looks along the rows from the south, so both rows read side by side and their fronts (+z faces) are visible.
 */
export const BACK_Z = -1.3;
export const FRONT_Z = 3.1;
export const ROW_D = 2.0;
export const BUILD_LANE_Z = 0.3;
export const SERVE_LANE_Z = 1.5;

export const NGC = { x: 14.4, z: BACK_Z, w: 1.6, d: ROW_D, h: 1.5 };
export const RAPIDS = { x: 16.5, z: BACK_Z, w: 1.8, d: ROW_D, h: 1.3 };
export const TRAIN = { x: 19.4, z: BACK_Z, w: 3.2, d: ROW_D, h: 1.2 };
export const TRT = { x: 21.9, z: BACK_Z, w: 1.5, d: ROW_D, h: 1.9 };
export const DOCK = { x: 21.6, z: FRONT_Z, w: 1.9, d: ROW_D, h: 1.3 };
export const SHOP = { x: 18.3, z: FRONT_Z, w: 3.0, d: ROW_D, h: 1.4 };
export const PLAZA = { x: 14.9, z: FRONT_Z, w: 3.2, d: ROW_D };

/** Build lane: data parcels go east past the stations. Serve lane: finished packages go west from the dock. */
export const paths: Record<'build' | 'serve', Pt[]> = {
  build: [[13.5, BUILD_LANE_Z], [22.4, BUILD_LANE_Z]],
  serve: [[22.4, SERVE_LANE_Z], [16.9, SERVE_LANE_Z]],
};
/** The belt that carries the compacted model from the compactor down to the dock. */
export const DROP: Pt[] = [[TRT.x + 0.1, BUILD_LANE_Z], [TRT.x + 0.1, SERVE_LANE_Z]];

export const WORKER_SPOTS: [number, number][] = [
  [18.2, -0.14], [18.7, -0.14], [19.2, -0.14], [19.7, -0.14], [20.2, -0.14], [20.7, -0.14],
];
export const CUSTOMER_SPOTS: [number, number][] = [
  [13.7, 4.5], [14.1, 4.5], [14.5, 4.5], [14.9, 4.5], [15.3, 4.5], [15.7, 4.5], [16.1, 4.5],
];

/** Ground the district's trees must stay off: [x, z, halfW, halfD]. */
export const YARD_FOOTPRINT: [number, number, number, number] = [18.2, 1.2, 5.6, 4.4];

/** Camera: along the rows from the south, a little above. */
const VIEW = { azimuth: 12, elevation: 52 };

export const anchors: Record<string, Anchor> = {
  ngc: { position: [NGC.x, NGC.h + 1.1, NGC.z], label: 'NGC', focus: [NGC.x, 0.5, NGC.z], view: { zoom: 6, ...VIEW } },
  rapids: { position: [RAPIDS.x, RAPIDS.h + 1.1, RAPIDS.z], label: 'RAPIDS', focus: [RAPIDS.x, 0.5, RAPIDS.z], view: { zoom: 6, ...VIEW } },
  'training-line': { position: [TRAIN.x, TRAIN.h + 1.1, TRAIN.z], label: 'Training line', focus: [TRAIN.x, 0.4, TRAIN.z], view: { zoom: 5, ...VIEW } },
  tensorrt: { position: [TRT.x, TRT.h + 0.9, TRT.z], label: 'TensorRT', focus: [TRT.x, 0.8, TRT.z], view: { zoom: 6, ...VIEW } },
  'shipping-dock': { position: [DOCK.x, DOCK.h + 1.0, DOCK.z], label: 'Shipping dock', focus: [DOCK.x, 0.5, DOCK.z], view: { zoom: 6, ...VIEW } },
  'inference-shop': { position: [SHOP.x, SHOP.h + 1.0, SHOP.z], label: '24/7 shop', focus: [SHOP.x, 0.5, SHOP.z], view: { zoom: 5.5, ...VIEW } },
  'customer-queue': { position: [PLAZA.x, 1.3, PLAZA.z + 1.0], label: 'Customer queue', focus: [PLAZA.x, 0.2, PLAZA.z + 0.8], view: { zoom: 6, ...VIEW } },
};
