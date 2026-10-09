import { useMemo, useRef } from 'react';
import { QuadraticBezierLine } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, InstancedMesh, MeshBasicMaterial, Object3D, SphereGeometry } from 'three';
import { connections } from '@/content/town';
import { accentSolid } from '../core/palette';
import { markerWorld, sensorStart } from './layout';
import { bezierAt } from './path';

type V3 = [number, number, number];
type Props = { hidden: boolean; isDimmed: (connId: string) => boolean; reducedMotion: boolean };

/** Thin dashed lines from the control tower to every district, each with a slow dot of telemetry. */
export function Sensors({ hidden, isDimmed, reducedMotion }: Props) {
  const lines = useMemo(() => {
    const a = sensorStart();
    return connections
      .filter((c) => c.group === 'sensors')
      .map((c, i) => {
        const end = markerWorld(c.joins[1]);
        end[1] -= 0.25;
        const mid: V3 = [(a[0] + end[0]) / 2, Math.max(a[1], end[1]) + 2.4, (a[2] + end[2]) / 2];
        return { id: c.id, a, mid, end: end as V3, seconds: 5 + (i % 3), delay: i * 0.7 };
      });
  }, []);
  const dots = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new SphereGeometry(0.07, 8, 6), []);
  const mat = useMemo(() => new MeshBasicMaterial({ color: new Color(accentSolid) }), []);
  const dummy = useMemo(() => new Object3D(), []);
  const out = useMemo<V3>(() => [0, 0, 0], []);

  useFrame(({ clock }) => {
    const m = dots.current;
    if (!m) return;
    lines.forEach((l, i) => {
      const t = reducedMotion ? 0.5 : ((clock.elapsedTime + l.delay) / l.seconds) % 1;
      bezierAt(l.a, l.mid, l.end, t, out);
      dummy.position.set(out[0], out[1], out[2]);
      const show = !hidden && !isDimmed(l.id);
      dummy.scale.setScalar(show ? 1 : 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  if (hidden) return null;
  return (
    <group>
      {lines.map((l) => (
        <QuadraticBezierLine key={l.id} start={l.a} mid={l.mid} end={l.end} color={accentSolid} lineWidth={1.6} dashed dashScale={6} gapSize={1.2} transparent opacity={isDimmed(l.id) ? 0.12 : 0.85} />
      ))}
      <instancedMesh ref={dots} args={[geo, mat, lines.length]} />
    </group>
  );
}
