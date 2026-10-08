import { Color } from 'three';
import { scene } from './palette';


/**
 * Colours derived from scene tokens (no new hard-coded values): foliage is the ground colour
 * pushed toward a saturated, darker green; wood is the parcel colour darkened.
 */
const g = new Color(scene.ground);
export const derived = {
  foliage: '#' + g.clone().offsetHSL(0.01, 0.22, -0.34).getHexString(),
  foliageLight: '#' + g.clone().offsetHSL(0.0, 0.2, -0.24).getHexString(),
  wood: '#' + new Color(scene.parcel).offsetHSL(0, -0.1, -0.28).getHexString(),
  soil: '#' + new Color(scene.parcel).lerp(new Color(scene.roof), 0.35).multiplyScalar(0.9).getHexString(),
  storageRoof: '#' + new Color(scene.storage).lerp(new Color(scene.roof), 0.4).getHexString(),
  darkTrim: '#' + new Color(scene.roof).multiplyScalar(0.8).getHexString(),
  lampGlow: '#' + new Color(scene.parcel).offsetHSL(0, 0.2, 0.15).getHexString(),
} as const;
