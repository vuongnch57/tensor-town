import tokens from '../../../design/tokens.json';

type TokenName = (typeof tokens.color.tokens)[number]['name'];

const hex = (name: TokenName): string => {
  const t = tokens.color.tokens.find((x) => x.name === name);
  if (!t || typeof t.value !== 'string') throw new Error(`scene token ${name} missing`);
  return t.value;
};

/** Scene colours from design/tokens.json. The scene keeps daylight colours in both UI themes. */
export const scene = {
  ground: hex('scene-ground'),
  path: hex('scene-path'),
  coolant: hex('scene-coolant'),
  hall: hex('scene-hall'),
  storage: hex('scene-storage'),
  network: hex('scene-network'),
  wall: hex('scene-wall'),
  roof: hex('scene-roof'),
  parcel: hex('scene-parcel'),
  parcelHot: hex('scene-parcel-hot'),
  idle: hex('scene-idle'),
} as const;

export type SceneColor = keyof typeof scene;

/** Scene token name (as stored in Item.swatch) -> hex. */
export const sceneByToken = (token: string): string => hex(token as TokenName);

import { Color } from 'three';

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

const light = (name: string): string => {
  const t = tokens.color.tokens.find((x) => x.name === name);
  if (!t || typeof t.value === 'string') throw new Error(`ui token ${name} missing`);
  return t.value.light;
};

/** Hotspots sit on the daylight scene, so they use the light-theme UI tokens in both themes. */
export const pin = { ink: light('ink'), muted: light('muted'), accent: light('accent'), surface: light('surface-200') } as const;
