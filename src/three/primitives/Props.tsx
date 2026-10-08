import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, CylinderGeometry, IcosahedronGeometry, InstancedMesh, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { derived, scene } from '../core/palette';
import { useSceneInteraction } from './Selectable';

/** Procedural prop library. Same interface a GLB-based version would have: positions in, meshes out. */
export type Spot = readonly [x: number, z: number, scale?: number];

export function Trees({ spots }: { spots: readonly Spot[] }) {
  const trunks = useRef<InstancedMesh>(null);
  const low = useRef<InstancedMesh>(null);
  const high = useRef<InstancedMesh>(null);
  const { reducedMotion } = useSceneInteraction();
  const trunkGeo = useMemo(() => new CylinderGeometry(0.07, 0.1, 0.55, 8), []);
  const blobGeo = useMemo(() => new IcosahedronGeometry(0.5, 2), []);
  const tmp = useMemo(() => new Object3D(), []);
  const n = spots.length;

  useEffect(() => {
    for (let i = 0; i < n; i++) {
      const s = spots[i][2] ?? 1;
      tmp.rotation.set(0, 0, 0);
      tmp.scale.setScalar(s);
      tmp.position.set(spots[i][0], 0.27 * s, spots[i][1]);
      tmp.updateMatrix();
      trunks.current?.setMatrixAt(i, tmp.matrix);
      low.current?.setColorAt(i, new Color(i % 2 ? derived.foliage : derived.foliageLight));
      high.current?.setColorAt(i, new Color(i % 2 ? derived.foliageLight : derived.foliage));
    }
    for (const r of [trunks, low, high]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
    for (const r of [low, high]) if (r.current?.instanceColor) r.current.instanceColor.needsUpdate = true;
  }, [spots, n, tmp]);

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const s = spots[i][2] ?? 1;
      const sway = Math.sin(t * 0.9 + i * 2.1) * 0.035;
      tmp.rotation.set(sway * 0.6, 0, sway);
      tmp.scale.set(s * 1.25, s * 1.05, s * 1.25);
      tmp.position.set(spots[i][0] + sway * 0.4 * s, 0.85 * s, spots[i][1]);
      tmp.updateMatrix();
      low.current?.setMatrixAt(i, tmp.matrix);
      tmp.scale.set(s * 0.9, s * 0.85, s * 0.9);
      tmp.position.set(spots[i][0] + sway * 0.9 * s, 1.3 * s, spots[i][1]);
      tmp.updateMatrix();
      high.current?.setMatrixAt(i, tmp.matrix);
    }
    if (low.current) low.current.instanceMatrix.needsUpdate = true;
    if (high.current) high.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={trunks} args={[trunkGeo, undefined, n]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={derived.wood} roughness={0.9} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={low} args={[blobGeo, undefined, n]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" roughness={0.85} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={high} args={[blobGeo, undefined, n]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color="#ffffff" roughness={0.85} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/** Street lamps: pole + warm lamp head, two instanced meshes. */
export function Lamps({ spots }: { spots: readonly Spot[] }) {
  const poles = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);
  const poleGeo = useMemo(() => new CylinderGeometry(0.035, 0.05, 1.3, 8), []);
  const headGeo = useMemo(() => new RoundedBoxGeometry(0.2, 0.16, 0.2, 3, 0.05), []);
  const tmp = useMemo(() => new Object3D(), []);
  useEffect(() => {
    spots.forEach((s, i) => {
      tmp.position.set(s[0], 0.65, s[1]);
      tmp.updateMatrix();
      poles.current?.setMatrixAt(i, tmp.matrix);
      tmp.position.set(s[0], 1.38, s[1]);
      tmp.updateMatrix();
      heads.current?.setMatrixAt(i, tmp.matrix);
    });
    for (const r of [poles, heads]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  }, [spots, tmp]);
  return (
    <group>
      <instancedMesh ref={poles} args={[poleGeo, undefined, spots.length]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={derived.darkTrim} roughness={0.8} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[headGeo, undefined, spots.length]} frustumCulled={false}>
        <meshStandardMaterial color={derived.lampGlow} emissive={derived.lampGlow} emissiveIntensity={0.5} roughness={0.7} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/** A fence along a polyline of [x, z] points: posts every `gap` units plus two rails per segment. */
export function Fence({ points, gap = 0.9 }: { points: readonly (readonly [number, number])[]; gap?: number }) {
  const posts = useRef<InstancedMesh>(null);
  const rails = useRef<InstancedMesh>(null);
  const postGeo = useMemo(() => new RoundedBoxGeometry(0.1, 0.55, 0.1, 2, 0.03), []);
  const railGeo = useMemo(() => new RoundedBoxGeometry(1, 0.06, 0.05, 2, 0.02), []);
  const tmp = useMemo(() => new Object3D(), []);
  const layout = useMemo(() => {
    const p: [number, number][] = [];
    const r: { x: number; z: number; len: number; ang: number; y: number }[] = [];
    for (let i = 1; i < points.length; i++) {
      const [ax, az] = points[i - 1];
      const [bx, bz] = points[i];
      const len = Math.hypot(bx - ax, bz - az);
      const steps = Math.max(1, Math.round(len / gap));
      for (let k = 0; k <= steps; k++) p.push([ax + ((bx - ax) * k) / steps, az + ((bz - az) * k) / steps]);
      const ang = Math.atan2(-(bz - az), bx - ax);
      for (const y of [0.22, 0.42]) r.push({ x: (ax + bx) / 2, z: (az + bz) / 2, len, ang, y });
    }
    return { p, r };
  }, [points, gap]);
  useEffect(() => {
    layout.p.forEach((s, i) => {
      tmp.rotation.set(0, 0, 0);
      tmp.scale.set(1, 1, 1);
      tmp.position.set(s[0], 0.275, s[1]);
      tmp.updateMatrix();
      posts.current?.setMatrixAt(i, tmp.matrix);
    });
    layout.r.forEach((s, i) => {
      tmp.rotation.set(0, s.ang, 0);
      tmp.scale.set(s.len, 1, 1);
      tmp.position.set(s.x, s.y, s.z);
      tmp.updateMatrix();
      rails.current?.setMatrixAt(i, tmp.matrix);
    });
    for (const r of [posts, rails]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  }, [layout, tmp]);
  return (
    <group>
      <instancedMesh ref={posts} args={[postGeo, undefined, layout.p.length]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={scene.wall} roughness={0.85} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[railGeo, undefined, layout.r.length]} castShadow frustumCulled={false}>
        <meshStandardMaterial color={scene.wall} roughness={0.85} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/** Loose crates: one instanced mesh of rounded sand boxes. `spots` = [x, z, rotation-ish scale]. */
export function Crates({ spots, stack = 1 }: { spots: readonly Spot[]; stack?: number }) {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new RoundedBoxGeometry(0.45, 0.38, 0.45, 3, 0.06), []);
  const tmp = useMemo(() => new Object3D(), []);
  useEffect(() => {
    let i = 0;
    spots.forEach((s, k) => {
      for (let h = 0; h < stack; h++) {
        tmp.rotation.set(0, k * 0.7 + h * 0.3, 0);
        tmp.scale.setScalar(s[2] ?? 1);
        tmp.position.set(s[0], 0.19 + h * 0.38, s[1]);
        tmp.updateMatrix();
        ref.current?.setMatrixAt(i++, tmp.matrix);
      }
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
  }, [spots, stack, tmp]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, spots.length * stack]} castShadow receiveShadow frustumCulled={false}>
      <meshStandardMaterial color={scene.parcel} roughness={0.8} metalness={0} />
    </instancedMesh>
  );
}
