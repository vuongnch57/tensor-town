import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { pathLength, pointAt, type Pt } from '@/lib/path';
import { scene } from '../core/palette';
import { useSceneInteraction } from './Selectable';

type Props = {
  path: readonly Pt[];
  count: number;
  /** World units per second along the path. */
  speed: number;
  /** Height of the surface the parcels ride on. */
  y?: number;
  size?: number;
  hot?: boolean;
  /** Overrides the sand/hot colour. */
  tint?: string;
};

const SAND = new Color(scene.parcel);
const HOT = new Color(scene.parcelHot);
const SMOOTH = (t: number) => t * t * (3 - 2 * t);

/**
 * Instanced parcels (rounded crates) riding a path in a loop. They shrink in and out at the ends so
 * they appear to arrive and be taken inside. With reduced motion they stand still, spread along the path.
 */
export function Parcels({ path, count, speed, y = 0.04, size = 0.4, hot = false, tint }: Props) {
  const ref = useRef<InstancedMesh>(null);
  const { reducedMotion } = useSceneInteraction();
  const len = useMemo(() => pathLength(path), [path]);
  const geo = useMemo(() => new RoundedBoxGeometry(size, size * 0.8, size, 3, size * 0.14), [size]);
  const tmp = useMemo(() => new Object3D(), []);
  const pos = useMemo(() => ({ x: 0, z: 0 }), []);
  const offset = useRef(0);

  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < count; i++) m.setColorAt(i, tint ? new Color(tint) : hot ? HOT : SAND);
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [count, hot, tint]);

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    if (!reducedMotion) offset.current = (offset.current + dt * speed) % len;
    for (let i = 0; i < count; i++) {
      const d = (offset.current + (i * len) / count) % len;
      const heading = pointAt(path, d, pos);
      const u = d / len;
      const s = SMOOTH(Math.min(1, u / 0.06)) * SMOOTH(Math.min(1, (1 - u) / 0.06));
      tmp.position.set(pos.x, y + (size * 0.8 * s) / 2, pos.z);
      tmp.rotation.set(0, heading, 0);
      tmp.scale.setScalar(Math.max(0.001, s));
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} castShadow frustumCulled={false}>
      <meshStandardMaterial color="#ffffff" roughness={0.75} metalness={0} />
    </instancedMesh>
  );
}
