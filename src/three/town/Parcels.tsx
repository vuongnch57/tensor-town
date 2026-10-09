import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, Color, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { scene } from '../core/palette';
import { connectionPaths } from './layout';
import { buildParcels } from './model';
import { pointAt, type Pt } from './path';

type Props = { hiddenGroups: string[]; isDimmed: (connId: string) => boolean; reducedMotion: boolean };

/** Small data parcels riding the roads, rail, belts and sky-bridge. With reduced motion they stand still, spread along the line. */
export function Parcels({ hiddenGroups, isDimmed, reducedMotion }: Props) {
  const specs = useMemo(buildParcels, []);
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new BoxGeometry(0.2, 0.2, 0.2), []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: '#ffffff', roughness: 0.7, metalness: 0 }), []);
  const dummy = useMemo(() => new Object3D(), []);
  const tmp = useMemo<Pt>(() => [0, 0], []);
  const active = useRef<boolean[]>([]);

  const place = (i: number, t: number) => {
    const m = ref.current;
    if (!m) return;
    const s = specs[i];
    if (!active.current[i]) {
      dummy.scale.set(0, 0, 0);
    } else {
      pointAt(connectionPaths[s.connId], t, tmp);
      dummy.position.set(tmp[0], s.y, tmp[1]);
      dummy.scale.set(1, 1, 1);
    }
    dummy.updateMatrix();
    m.setMatrixAt(i, dummy.matrix);
  };

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const sand = new Color(scene.parcel);
    const lilac = new Color(scene.network);
    active.current = specs.map((s) => !hiddenGroups.includes(s.group) && !isDimmed(s.connId));
    specs.forEach((s, i) => {
      m.setColorAt(i, s.rail ? lilac : sand);
      place(i, s.offset);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs, hiddenGroups, isDimmed]);

  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m || reducedMotion) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < specs.length; i++) place(i, (t / specs[i].seconds + specs[i].offset) % 1);
    m.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, specs.length]} castShadow />;
}
