import { RoundedBox } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { Matte } from './Matte';
import type { SceneColor } from '../core/palette';

type Props = Omit<ThreeElements['mesh'], 'args' | 'ref'> & {
  size: [number, number, number];
  /** Corner radius as a fraction of the smallest side (SPEC §4.13: 0.04–0.1 of the object size). */
  round?: number;
  color?: SceneColor;
  hex?: string;
  roughness?: number;
  shadow?: boolean;
};

/** Rounded box that stands on its own base: `position` is the bottom centre. */
export function Box({ size, round = 0.1, color, hex, roughness, shadow = true, position = [0, 0, 0], ...rest }: Props) {
  const [w, h, d] = size;
  const p = Array.isArray(position) ? position : [0, 0, 0];
  const radius = Math.min(w, h, d) * Math.min(round, 0.45);
  return (
    <RoundedBox args={[w, h, d]} radius={radius} smoothness={3} position={[p[0], p[1] + h / 2, p[2]]} castShadow={shadow} receiveShadow {...rest}>
      <Matte color={color} hex={hex} roughness={roughness} />
    </RoundedBox>
  );
}
