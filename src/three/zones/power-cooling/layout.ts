import type { Anchor } from '@/content/types';
import type { Pt } from '@/lib/path';

/**
 * Geometry of the Power Station district in town coordinates. The substation takes power from the town cable; a power lane feeds the chillers
 * and both halls. Coolant pipes run from the chillers to the halls. The air-cooled hall and the liquid-cooled hall stand side by side
 * so their different roofs and walls read at a glance; the GPU rack and the PUE meter stand in front. The river runs behind (north).
 * The camera looks from +x +z, so the +x and +z faces are the ones you see.
 */
export const AIR = { x: -17.0, z: 1.9, w: 2.8, d: 2.8, h: 1.5 };
export const LIQ = { x: -14.0, z: 1.9, w: 2.8, d: 2.8, h: 1.5 };
export const SUB = { x: -11.2, z: 1.2, w: 1.8, d: 2.2, h: 1.0 };
export const CHILL = { x: -11.4, z: 5.4, w: 2.4, d: 1.8, h: 0.8 };
export const RACK = { x: -18.2, z: 5.2, w: 0.8, d: 0.8, h: 1.7 };
export const METER = { x: -15.6, z: 5.6, w: 1.8, d: 0.4, h: 1.15 };

/** South wall of the two halls, where lanes arrive. */
export const HALL_FRONT = AIR.z + AIR.d / 2;

/** Lanes: electricity (hot dots) from the substation, coolant (blue dots) from the chillers. */
export const paths: Record<'powerDown' | 'powerRow' | 'powerAir' | 'powerLiq' | 'coolMain' | 'coolAir' | 'coolLiq' | 'coolBack', Pt[]> = {
  powerDown: [[-11.4, 2.3], [-11.4, 4.5]],
  powerRow: [[-11.4, 3.9], [-16.5, 3.9]],
  powerLiq: [[-13.5, 3.9], [-13.5, HALL_FRONT]],
  powerAir: [[-16.5, 3.9], [-16.5, HALL_FRONT]],
  coolMain: [[-12.6, 5.0], [-17.5, 5.0]],
  coolLiq: [[-14.5, 5.0], [-14.5, HALL_FRONT]],
  coolAir: [[-17.5, 5.0], [-17.5, HALL_FRONT]],
  /** The warm return from the liquid hall back to the chillers. */
  coolBack: [[-13.9, HALL_FRONT], [-13.9, 4.6], [-12.6, 4.6]],
};

/** Ground the district's trees must stay off: [x, z, halfW, halfD]. */
export const DISTRICT_FOOTPRINT: [number, number, number, number] = [-14.6, 3.3, 5.4, 4.6];

const VIEW = { azimuth: 45, elevation: 38 };

export const anchors: Record<string, Anchor> = {
  substation: { position: [SUB.x, SUB.h + 1.7, SUB.z], label: 'Substation', focus: [SUB.x, 0.7, SUB.z], view: { zoom: 6, ...VIEW } },
  'gpu-rack': { position: [RACK.x, RACK.h + 1.4, RACK.z], label: 'GPU rack', focus: [RACK.x, 0.9, RACK.z], view: { zoom: 6.5, ...VIEW } },
  'air-cooled-hall': { position: [AIR.x, AIR.h + 1.5, AIR.z], label: 'Air-cooled hall', focus: [AIR.x, 0.8, AIR.z], view: { zoom: 6, ...VIEW } },
  'liquid-loop': { position: [LIQ.x, LIQ.h + 1.5, LIQ.z], label: 'Liquid cooling loop', focus: [LIQ.x, 0.8, LIQ.z], view: { zoom: 6, ...VIEW } },
  chillers: { position: [CHILL.x, CHILL.h + 1.5, CHILL.z], label: 'Chillers', focus: [CHILL.x, 0.5, CHILL.z], view: { zoom: 6, ...VIEW } },
  'pue-meter': { position: [METER.x, METER.h + 1.0, METER.z], label: 'PUE meter', focus: [METER.x, 0.7, METER.z], view: { zoom: 6.5, ...VIEW } },
};
