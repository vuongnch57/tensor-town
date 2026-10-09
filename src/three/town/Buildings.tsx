import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { derived } from '../core/derived';
import { Box } from '../primitives/Box';
import { Conveyor } from '../primitives/Conveyor';
import { Matte } from '../primitives/Matte';
import { Crates, Fence, Lamps, Trees } from '../primitives/Props';
import { Workers } from '../primitives/Workers';
import { CpuOffice } from '../zones/gpu-hall/CpuOffice';
import { HallShell, SmCells, StampingPress, WORKER_SPOTS } from '../zones/gpu-hall/GpuHall';
import { HbmWarehouse } from '../zones/gpu-hall/HbmWarehouse';
import { buildings, crates, cylinders, FACTORY_ORIGIN, fences, hill, lamps, trees, type Building } from './layout';
import { buildDetails } from './model';

const hexOf = (b: Building) => (b.roofHex ? derived.storageRoof : undefined);

/** One plain building in the same soft style as the Factory Quarter: rounded body plus a slightly wider roof slab. */
function Block({ b }: { b: Building }) {
  const base = b.y0 ?? 0;
  const roofColor = b.roof ?? 'roof';
  const ov = b.flat ? 0 : 0.14;
  const single = b.flat && (b.wall ?? 'wall') === roofColor;
  return (
    <group position={[b.x, base, b.z]}>
      <Box size={[b.w, b.h, b.d]} color={b.wall ?? 'wall'} round={0.08} />
      {!single && <Box size={[b.w + ov * 2, 0.12, b.d + ov * 2]} position={[0, b.h, 0]} color={roofColor} hex={hexOf(b)} round={0.25} roughness={0.75} />}
    </group>
  );
}

function Tank({ c }: { c: (typeof cylinders)[number] }) {
  return (
    <mesh position={[c.x, (c.y0 ?? 0) + c.h / 2, c.z]} castShadow receiveShadow>
      <cylinderGeometry args={[c.r, c.r, c.h, 20]} />
      <Matte color={c.color} />
    </mesh>
  );
}

function Hill() {
  return <Box size={[hill.w, hill.h, hill.d]} position={[hill.x, 0, hill.z]} hex={derived.foliageLight} round={0.35} roughness={0.95} />;
}

/** Windows and doors for every building: one instanced draw call. */
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
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} frustumCulled={false} />;
}

/** District 1: the full Zone 1 scene (hall, SM cells, workers, press, CPU office, HBM warehouse and its conveyor), placed in the town. */
function FactoryQuarter({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group position={[FACTORY_ORIGIN[0], 0, FACTORY_ORIGIN[1]]}>
      <group position={[-5, 0, -5.2]}>
        <CpuOffice />
      </group>
      <HallShell />
      <SmCells />
      <Workers spots={WORKER_SPOTS} busy={0.8} y={0.12} />
      <StampingPress smBusy={0.8} />
      <group position={[8.0, 0, 1.2]}>
        <HbmWarehouse />
      </group>
      <Conveyor from={[6.2, 2.2]} to={[2.5, 2.2]} speed={reducedMotion ? 0 : 0.7} hot={false} parcels={6} />
    </group>
  );
}

/** All nine districts, the control hill and the props, in the airy diorama style of the Zone 1 scene. */
export function Buildings({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group>
      <Hill />
      <FactoryQuarter reducedMotion={reducedMotion} />
      {buildings.map((b, i) => (
        <Block key={i} b={b} />
      ))}
      {cylinders.map((c, i) => (
        <Tank key={i} c={c} />
      ))}
      <Details />
      <Trees spots={trees} />
      <Lamps spots={lamps} />
      {fences.map((f, i) => (
        <Fence key={i} points={f} />
      ))}
      <Crates spots={crates} stack={2} />
    </group>
  );
}
