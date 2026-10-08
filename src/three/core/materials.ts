import { Color, MeshStandardMaterial } from 'three';
import { scene, type SceneColor } from './palette';

/** Matte materials in the scene palette, shared across the scene (roughness 0.6–0.9, metalness 0). */
const cache = new Map<string, MeshStandardMaterial>();

export function matte(color: SceneColor, roughness = 0.8): MeshStandardMaterial {
  const key = `${color}:${roughness}`;
  let m = cache.get(key);
  if (!m) {
    m = new MeshStandardMaterial({ color: new Color(scene[color]), roughness, metalness: 0 });
    cache.set(key, m);
  }
  return m;
}

/** A tinted copy of a palette colour (for trims, soil, shadows under props). Not a new token: derived. */
export function shade(color: SceneColor, mixWith: SceneColor, amount: number): Color {
  return new Color(scene[color]).lerp(new Color(scene[mixWith]), amount);
}
