import type { Anchor } from '@/content/types';
import type { Pt } from '@/lib/path';

/**
 * Geometry of the Control Room district in town coordinates. Everything is arranged around the control tower on its hill:
 * the dispatcher desk on the hill, the two sharing halls west of it, the container yard to the north and the cluster manager to the east.
 * The hill top is at HILL_Y. The camera looks from +x +z, so the +x and +z faces are the ones you see.
 */
export const HILL_Y = 0.6;

export const TOWER = { x: -14, z: -9, w: 2.2, d: 2.2, h: 5 };
export const DECK = { w: 3.2, h: 0.5, y: HILL_Y + TOWER.h };
export const DESK = { x: -16.4, z: -6.8, w: 1.8, d: 1.5 };
export const MIG_HALL = { x: -19.7, z: -6.6, w: 2.6, d: 2.4, h: 0.8 };
export const SHIFT_HALL = { x: -19.7, z: -10.6, w: 2.6, d: 2.8, h: 1.1 };
export const YARD = { x: -12.5, z: -15.2, w: 4.6, d: 2.8 };
export const MANAGER = { x: -8.0, z: -10.5, w: 1.8, d: 1.6, h: 1.5 };

/** The terrace the two halls stand on: the hill, extended west so tickets can run level from the desk to the halls. */
export const TERRACE = { x: -19.6, z: -8.8, w: 3.9, d: 7.2 };

/** East-face doors (x of the halls' east walls, z of each door). */
export const MIG_EAST = MIG_HALL.x + MIG_HALL.w / 2;
export const SHIFT_EAST = SHIFT_HALL.x + SHIFT_HALL.w / 2;
export const MIG_DOOR_Z = MIG_HALL.z;
export const TICKET_DOOR_Z = -10.2;
export const BOX_DOOR_Z = -11.3;

/**
 * Lanes, all axis-aligned so a belt can be laid under each. Tickets (small) leave the desk for the two halls on the terrace level.
 * Containers (large) leave the yard on a ground belt, climb a ramp onto the hill and join the shift hall's second door.
 * A second ground belt takes the yard's status reports to the cluster manager.
 */
export const paths: Record<'mig' | 'shift' | 'boxGround' | 'boxHill' | 'report', Pt[]> = {
  mig: [[-17.3, DESK.z], [MIG_EAST, DESK.z]],
  shift: [[-16.8, -7.6], [-16.8, TICKET_DOOR_Z], [SHIFT_EAST, TICKET_DOOR_Z]],
  boxGround: [[-14.7, -15.2], [-14.7, -13.4]],
  boxHill: [[-14.7, -12.3], [-17.2, -12.3], [-17.2, BOX_DOOR_Z], [SHIFT_EAST, BOX_DOOR_Z]],
  report: [[-10.2, -15.2], [-6.2, -15.2], [-6.2, -10.5], [-7.0, -10.5]],
};
/** The ramp that lifts the container belt from the ground (y 0) onto the hill. */
export const RAMP = { x: -14.7, zFrom: -13.4, zTo: -12.5 };

/** Workers in the partitioned hall: two per room. */
export const MIG_ROOMS = [-0.9, 0, 0.9].map((dx) => MIG_HALL.x + dx);
export const MIG_WORKERS: [number, number][] = MIG_ROOMS.flatMap((x) => [[x, MIG_HALL.z - 0.3], [x, MIG_HALL.z + 0.3]] as [number, number][]);
/** Workers in the shift hall wait in three lines, one per job. */
export const SHIFT_WORKERS: [number, number][] = [-0.85, 0, 0.85].flatMap((dx) => [[SHIFT_HALL.x + dx, SHIFT_HALL.z - 0.4], [SHIFT_HALL.x + dx, SHIFT_HALL.z + 0.1]] as [number, number][]);

/** Ground the district's trees must stay off: [x, z, halfW, halfD]. */
export const DISTRICT_FOOTPRINT: [number, number, number, number] = [-14.2, -11, 7.2, 5.8];

/** Camera: the default isometric angles, a little higher so the tower does not hide the yard. */
const VIEW = { azimuth: 45, elevation: 38 };

export const anchors: Record<string, Anchor> = {
  'control-tower': { position: [TOWER.x, 7.5, TOWER.z], label: 'Control tower', focus: [TOWER.x, 3.6, TOWER.z], view: { zoom: 4.6, ...VIEW } },
  'dispatcher-desk': { position: [DESK.x, 2.9, DESK.z], label: 'Dispatcher desk', focus: [DESK.x, 1.2, DESK.z], view: { zoom: 6, ...VIEW } },
  'partitioned-hall': { position: [MIG_HALL.x, 2.6, MIG_HALL.z], label: 'Partitioned hall', focus: [MIG_HALL.x, 1.0, MIG_HALL.z], view: { zoom: 6, ...VIEW } },
  'shift-hall': { position: [SHIFT_HALL.x, 3.2, SHIFT_HALL.z], label: 'Shift hall', focus: [SHIFT_HALL.x, 1.2, SHIFT_HALL.z], view: { zoom: 6, ...VIEW } },
  'container-yard': { position: [YARD.x, 3.2, YARD.z], label: 'Container yard', focus: [YARD.x, 0.8, YARD.z], view: { zoom: 5, ...VIEW } },
  'cluster-manager': { position: [MANAGER.x, 3.0, MANAGER.z], label: 'Cluster manager', focus: [MANAGER.x, 0.7, MANAGER.z], view: { zoom: 6.5, ...VIEW } },
};
