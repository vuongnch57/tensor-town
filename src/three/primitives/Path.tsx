import type { Pt } from '@/lib/path';
import { Matte } from './Matte';
import type { SceneColor } from '../core/palette';

type Props = { points: readonly Pt[]; width?: number; y?: number; color?: SceneColor };

/** A flat road/walkway made of slabs along a polyline, with round joints at the corners. */
export function Path({ points, width = 0.9, y = 0.02, color = 'path' }: Props) {
  return (
    <group>
      {points.slice(1).map((p, i) => {
        const a = points[i];
        const dx = p[0] - a[0];
        const dz = p[1] - a[1];
        const len = Math.hypot(dx, dz);
        return (
          <mesh key={i} position={[(a[0] + p[0]) / 2, y, (a[1] + p[1]) / 2]} rotation={[0, Math.atan2(dx, dz), 0]} receiveShadow>
            <boxGeometry args={[width, 0.04, len]} />
            <Matte color={color} roughness={0.9} />
          </mesh>
        );
      })}
      {points.slice(1, -1).map((p, i) => (
        <mesh key={`j${i}`} position={[p[0], y, p[1]]} receiveShadow>
          <cylinderGeometry args={[width / 2, width / 2, 0.04, 20]} />
          <Matte color={color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
