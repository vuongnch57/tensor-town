import { useLayoutEffect, useMemo, useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import { BoxGeometry, Color, CylinderGeometry, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three';
import { accentSolid } from '../core/palette';
import { matte, shade } from '../core/materials';
import { districtLayout, hill, HS, toWorld, trees, type BoxProp, type CylProp } from './layout';
import { buildDetails } from './model';

const RADIUS = 0.07;

function Box({ p }: { p: BoxProp }) {
  const [x, z] = toWorld(p.x + p.w / 2, p.y + p.d / 2);
  const base = (p.z0 ?? 0) * HS;
  const h = p.h * HS;
  const wall = p.wall ?? 'wall';
  const ov = p.flat ? 0 : 0.12;
  const single = p.flat && wall === p.roof;
  return (
    <group position={[x, base, z]}>
      <RoundedBox args={[p.w, h, p.d]} radius={Math.min(RADIUS, p.w / 4, p.d / 4)} smoothness={2} position={[0, h / 2, 0]} castShadow receiveShadow material={matte(wall)} />
      {!single && <RoundedBox args={[p.w + ov * 2, 0.1, p.d + ov * 2]} radius={0.04} smoothness={2} position={[0, h, 0]} castShadow receiveShadow material={matte(p.roof, 0.75)} />}
    </group>
  );
}

function Cyl({ p }: { p: CylProp }) {
  const [x, z] = toWorld(p.x, p.y);
  const h = p.h * HS;
  return (
    <mesh position={[x, (p.z0 ?? 0) * HS + h / 2, z]} castShadow receiveShadow material={matte(p.color)}>
      <cylinderGeometry args={[p.r, p.r, h, 16]} />
    </mesh>
  );
}

function Hill() {
  const [x, z] = toWorld(hill.x + hill.w / 2, hill.y + hill.d / 2);
  const color = useMemo(() => shade('ground', 'ground', 0).lerp(new Color(accentSolid), 0.16), []);
  const h = hill.h * HS;
  return (
    <RoundedBox args={[hill.w, h, hill.d]} radius={0.25} smoothness={3} position={[x, h / 2, z]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </RoundedBox>
  );
}

function Details() {
  const items = useMemo(buildDetails, []);
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new MeshStandardMaterial({ color: '#ffffff', roughness: 0.4, metalness: 0 }), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new Object3D();
    items.forEach((it, i) => {
      d.position.set(it.x, it.y, it.z);
      d.scale.set(it.sx, it.sy, it.sz);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, it.color);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} />;
}

function Trees() {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  const trunkGeo = useMemo(() => new CylinderGeometry(0.05, 0.07, 1, 6), []);
  const crownGeo = useMemo(() => new SphereGeometry(1, 10, 8), []);
  const trunkMat = useMemo(() => matte('parcel', 0.9), []);
  const crownMat = useMemo(() => new MeshStandardMaterial({ color: new Color(accentSolid).lerp(new Color('#e9efe3'), 0.45), roughness: 0.9, metalness: 0 }), []);
  useLayoutEffect(() => {
    const d = new Object3D();
    trees.forEach(([tx, ty], i) => {
      const s = 0.8 + (((tx * 7 + ty * 3) % 5) / 12);
      const [x, z] = toWorld(tx, ty);
      d.rotation.set(0, 0, 0);
      d.position.set(x, 0.2 * s, z);
      d.scale.set(1, 0.4 * s, 1);
      d.updateMatrix();
      trunks.current?.setMatrixAt(i, d.matrix);
      d.position.set(x, 0.62 * s, z);
      d.scale.set(0.32 * s, 0.4 * s, 0.32 * s);
      d.updateMatrix();
      crowns.current?.setMatrixAt(i, d.matrix);
    });
    for (const m of [trunks.current, crowns.current]) if (m) m.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={trunks} args={[trunkGeo, trunkMat, trees.length]} castShadow />
      <instancedMesh ref={crowns} args={[crownGeo, crownMat, trees.length]} castShadow receiveShadow />
    </group>
  );
}

/** Low-detail placeholder buildings for all nine districts, plus the control hill and trees (Phase 1). */
export function Buildings() {
  return (
    <group>
      <Hill />
      {districtLayout.flatMap((d) => d.props.map((p, i) => (p.kind === 'box' ? <Box key={`${d.slug}-${i}`} p={p} /> : <Cyl key={`${d.slug}-${i}`} p={p} />)))}
      <Details />
      <Trees />
    </group>
  );
}
