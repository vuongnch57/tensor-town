import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleGeometry, Color, InstancedMesh, Object3D, SphereGeometry } from 'three';
import { scene } from '../core/palette';
import { useSceneInteraction } from './Selectable';

type Props = {
  /** [x, z] of each worker inside the hall (floor y = base). */
  spots: readonly (readonly [number, number])[];
  /** 0..1: share of workers that are busy (bobbing, orange). The rest stand idle and grey. */
  busy: number;
  y?: number;
};

const BUSY = new Color(scene.hall);
const IDLE = new Color(scene.idle);

/** Instanced workers: busy ones bob, idle ones are grey and still. Two draw calls in total. */
export function Workers({ spots, busy, y = 0.16 }: Props) {
  const bodies = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);
  const { reducedMotion } = useSceneInteraction();
  const n = spots.length;
  const bodyGeo = useMemo(() => new CapsuleGeometry(0.1, 0.16, 4, 10), []);
  const headGeo = useMemo(() => new SphereGeometry(0.085, 14, 10), []);
  const tmp = useMemo(() => new Object3D(), []);
  // Golden-ratio spread: busy workers are scattered evenly, and raising `busy` only ever adds busy workers.
  const isBusy = useMemo(() => spots.map((_, i) => (i * 0.6180339887) % 1 < busy), [spots, busy]);

  useEffect(() => {
    for (let i = 0; i < n; i++) bodies.current?.setColorAt(i, isBusy[i] ? BUSY : IDLE);
    if (bodies.current?.instanceColor) bodies.current.instanceColor.needsUpdate = true;
  }, [isBusy, n]);

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const bob = isBusy[i] ? Math.abs(Math.sin(t * 4 + i * 1.7)) * 0.07 : 0;
      tmp.position.set(spots[i][0], y + 0.18 + bob, spots[i][1]);
      tmp.updateMatrix();
      bodies.current?.setMatrixAt(i, tmp.matrix);
      tmp.position.y += 0.26;
      tmp.updateMatrix();
      heads.current?.setMatrixAt(i, tmp.matrix);
    }
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodies} args={[bodyGeo, undefined, n]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, undefined, n]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={scene.wall} roughness={0.8} metalness={0} />
      </instancedMesh>
    </group>
  );
}
