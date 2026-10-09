import type { Anchor } from '@/content/types';
import type { Pt } from '@/lib/path';

/**
 * Geometry of the Storage Yard (the Harbour Depot) in town coordinates. Data flows north toward the GPU hall beside the factory:
 * the remote object-storage depot feeds the parallel file system warehouse; from there parcels go to the GPU hall through the
 * CPU's office, down the GPUDirect courier lane that skips the office, or into the local NVMe cache shed that stands next to the hall.
 * The camera looks from +x +z, so screen-right is +x -z and the hall (north) sits behind the warehouse.
 */
export const PFS = { x: 5.7, z: 11.2, w: 5, d: 2.4, h: 1.7 };
export const DEPOT = { x: 11.2, z: 11.4, w: 3, d: 2.4, h: 1.6 };
export const SHED = { x: 2.9, z: 6.3, w: 1.8, d: 1.5, h: 1.1 };
export const HALL = { x: 6.2, z: 5.9, w: 2.8, d: 2.2, h: 1.5 };
export const OFFICE = { x: 6.2, z: 8.5, w: 1.8, d: 1.0, h: 1.0 };
/** Z of the warehouse's north face, where parcels leave it, and of the hall's south face, where they arrive. */
export const PFS_N = PFS.z - PFS.d / 2;
export const HALL_S = HALL.z + HALL.d / 2;

export const DIRECT_X = 7.4;
export const OFFICE_LANE_X = 6.0;
export const FILL_X = 3.3;
export const CHECKPOINT_X = 4.95;
export const SHED_SLOTS = 5;

export const paths: Record<'direct' | 'office' | 'fill' | 'fromCache' | 'checkpoint' | 'feeder', Pt[]> = {
  direct: [[DIRECT_X, PFS_N], [DIRECT_X, HALL_S]],
  office: [[OFFICE_LANE_X, PFS_N], [OFFICE_LANE_X, HALL_S]],
  fill: [[FILL_X, PFS_N], [FILL_X, SHED.z + SHED.d / 2]],
  fromCache: [[SHED.x + SHED.w / 2, HALL.z], [HALL.x - HALL.w / 2 + 0.05, HALL.z]],
  checkpoint: [[CHECKPOINT_X, HALL_S], [CHECKPOINT_X, PFS_N]],
  feeder: [[DEPOT.x - DEPOT.w / 2, 11.0], [PFS.x + PFS.w / 2, 11.0]],
};

/** Ground the district's trees must stay off: [x, z, halfW, halfD]. */
export const YARD_FOOTPRINT: [number, number, number, number] = [6.2, 8.6, 6.4, 4.4];

/** The camera looks along the flow from the east, so the warehouse, hall and shed line up side by side instead of hiding behind each other. */
const VIEW = { azimuth: 78, elevation: 42 };

export const anchors: Record<string, Anchor> = {
  'gpu-hall': { position: [HALL.x, HALL.h + 1.0, HALL.z], label: 'GPU hall', focus: [HALL.x, 0.6, HALL.z], view: { zoom: 5.5, ...VIEW } },
  'nvme-cache-shed': { position: [SHED.x, SHED.h + 0.9, SHED.z], label: 'NVMe cache shed', focus: [SHED.x, 0.4, SHED.z], view: { zoom: 6.5, azimuth: 70, elevation: 30 } },
  'parallel-file-system': { position: [PFS.x, PFS.h + 1.0, PFS.z], label: 'Parallel file system', focus: [PFS.x, 0.7, PFS.z], view: { zoom: 4.8, ...VIEW } },
  'object-storage-depot': { position: [DEPOT.x, 3.3, DEPOT.z], label: 'Object storage depot', focus: [DEPOT.x, 0.7, DEPOT.z], view: { zoom: 5.2, ...VIEW } },
  'gpudirect-storage': { position: [DIRECT_X, 1.1, (PFS_N + HALL_S) / 2], label: 'GPUDirect Storage', focus: [DIRECT_X, 0.1, (PFS_N + HALL_S) / 2], view: { zoom: 7, ...VIEW } },
  checkpoint: { position: [CHECKPOINT_X, 1.7, (PFS_N + HALL_S) / 2], label: 'Checkpoint', focus: [CHECKPOINT_X, 0.4, (PFS_N + HALL_S) / 2], view: { zoom: 7, ...VIEW } },
};
