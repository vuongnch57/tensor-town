import { scene, type SceneColor } from '../core/palette';

type Props = { color?: SceneColor; hex?: string; roughness?: number };

/** Matte standard material in the scene palette (roughness 0.6–0.9, metalness 0). */
export function Matte({ color = 'wall', hex, roughness = 0.8 }: Props) {
  return <meshStandardMaterial color={hex ?? scene[color]} roughness={roughness} metalness={0} />;
}
