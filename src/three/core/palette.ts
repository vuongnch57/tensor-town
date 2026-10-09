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

/** The UI accent's light value, used for foliage and the hill so greens stay inside the design tokens. */
export const accentSolid: string = (() => {
  const t = tokens.color.tokens.find((x) => x.name === 'accent');
  const v = t?.value;
  if (!v || typeof v === 'string') throw new Error('accent token missing');
  return v.light;
})();
