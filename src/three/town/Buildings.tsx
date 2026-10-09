import { useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import { derived } from '../core/derived';
import { Box } from '../primitives/Box';
import { Conveyor } from '../primitives/Conveyor';
import { Matte } from '../primitives/Matte';
import { itemsInZone } from '@/content/registry';
import { useFactoryStore } from '@/state/useFactoryStore';
import { Hotspot } from '../primitives/Hotspot';
import { Selectable, useSceneInteraction } from '../primitives/Selectable';
import { simulate } from '../zones/gpu-hall/sim';
import { simulate as packSimulate } from '../zones/packing-station/sim';
import { anchors as packAnchors } from '../zones/packing-station/anchors';
import type { SceneColor } from '../core/palette';
import { Crates, Fence, Lamps, Trees } from '../primitives/Props';
import { Workers } from '../primitives/Workers';
import { CpuOffice } from '../zones/gpu-hall/CpuOffice';
import { HallShell, SmCells, StampingPress, WORKER_SPOTS } from '../zones/gpu-hall/GpuHall';
import { HbmWarehouse } from '../zones/gpu-hall/HbmWarehouse';
import { buildings, crates, cylinders, FACTORY_ORIGIN, fences, hill, lamps, trees, type Building } from './layout';
import { DATA_SIGN, factoryAnchors } from './factory';
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

const CRATES_DEPOT = [[0.2, -1.2], [0.7, -0.9], [-1.1, -1.0]] as const;
const CRATES_WAREHOUSE = [[10.0, -2.8, 1], [9.5, -3.2, 0.9]] as const;

/**
 * District 1: the full Zone 1 scene (data sign, CPU office, hall, SM cells, workers, press, HBM warehouse, conveyor),
 * placed in the town. Every object is selectable and numbered when the camera is inside the district.
 */
function FactoryQuarter({ active }: { active: boolean }) {
  const sim = useFactoryStore((s) => s.sim);
  const result = useMemo(() => simulate(sim), [sim]);
  const { onSelect, reducedMotion } = useSceneInteraction();
  const objects = useMemo(() => itemsInZone('gpu-hall').filter((i) => i.kind === 'object'), []);
  const hot = result.bottleneck === 'memory';
  const beltSpeed = reducedMotion ? 0 : 0.9 * result.beltSpeed;
  return (
    <>
      <group position={[FACTORY_ORIGIN[0], 0, FACTORY_ORIGIN[1]]}>
        <Crates spots={CRATES_WAREHOUSE} stack={2} />
        <Selectable id="data" position={[DATA_SIGN[0], 0, DATA_SIGN[1]]}>
          <Box size={[0.1, 1.2, 0.1]} position={[-0.7, 0, 0]} hex={derived.wood} round={0.3} />
          <Box size={[0.1, 1.2, 0.1]} position={[0.7, 0, 0]} hex={derived.wood} round={0.3} />
          <Box size={[1.7, 0.55, 0.1]} position={[0, 0.75, 0]} color="hall" round={0.2} />
          <Crates spots={CRATES_DEPOT} stack={2} />
        </Selectable>
        <Selectable id="cpu" position={[-5, 0, -5.2]}>
          <CpuOffice />
        </Selectable>
        <Selectable id="gpu">
          <HallShell />
        </Selectable>
        <Selectable id="sm">
          <SmCells />
        </Selectable>
        <Selectable id="cuda-core">
          <Workers spots={WORKER_SPOTS} busy={result.smBusy} y={0.12} />
        </Selectable>
        <Selectable id="tensor-core">
          <StampingPress smBusy={result.smBusy} />
        </Selectable>
        <Selectable id="hbm" position={[8.0, 0, 1.2]}>
          <HbmWarehouse />
        </Selectable>
        <Selectable id="memory-bandwidth">
          <Conveyor from={[6.2, 2.2]} to={[2.5, 2.2]} speed={beltSpeed} hot={hot} parcels={6} />
        </Selectable>
      </group>
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={factoryAnchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}

const PACK_COLOR: Record<string, SceneColor> = { fp32: 'storage', 'bf16-fp16': 'hall', fp8: 'parcel', int8: 'network' };
const PACK_CRATES: { id: string; at: [number, number]; size: number }[] = [
  { id: 'fp32', at: [15.0, -8.4], size: 1.4 },
  { id: 'bf16-fp16', at: [16.4, -9.8], size: 1.1 },
  { id: 'fp8', at: [17.8, -11.2], size: 0.8 },
  { id: 'int8', at: [19.2, -12.6], size: 0.8 },
];
const TRUCK_CELLS = 8;

/** Cargo of the delivery truck: the same 8 cells of space hold fewer, bigger crates the more bytes each parameter takes. */
function TruckCargo() {
  const format = useFactoryStore((s) => s.packSim.format);
  const bytes = packSimulate({ format, model: '7b' }).bytesPerParam;
  const n = TRUCK_CELLS / bytes;
  const size = 0.34 * Math.sqrt(bytes);
  const color = PACK_COLOR[format === 'bf16' ? 'bf16-fp16' : format] ?? 'hall';
  const cols = Math.min(n, 4);
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} size={[size, size, size]} position={[-0.9 + (i % cols) * 0.5, 0.78, (Math.floor(i / cols) - 0.5) * 0.5]} color={color} round={0.15} />
      ))}
    </>
  );
}

/** District 2: the Packing Dock yard. Crates by number format, the Transformer Engine machine and the delivery truck. */
function PackingDock({ active }: { active: boolean }) {
  const { onSelect } = useSceneInteraction();
  const objects = useMemo(() => itemsInZone('packing-station').filter((i) => i.kind === 'object'), []);
  return (
    <>
      {PACK_CRATES.map((c) => (
        <Selectable key={c.id} id={c.id} position={[c.at[0], 0, c.at[1]]}>
          <Box size={[c.size, c.size * 0.8, c.size]} color={PACK_COLOR[c.id]} round={0.12} />
          <Box size={[c.size * 1.06, 0.08, c.size * 1.06]} position={[0, c.size * 0.8, 0]} color="roof" round={0.3} />
        </Selectable>
      ))}
      <Selectable id="transformer-engine" position={[16.8, 0, -5.6]}>
        <Box size={[1.7, 0.7, 1.3]} color="network" round={0.1} />
        <Box size={[1.1, 0.5, 0.9]} position={[0, 0.7, 0]} color="wall" round={0.15} />
        <Box size={[0.3, 0.9, 0.3]} position={[0.5, 1.2, 0]} color="roof" round={0.3} />
      </Selectable>
      <Selectable id="delivery-truck" position={[20.0, 0, -5.6]}>
        <Box size={[3.0, 0.2, 1.4]} position={[0, 0.25, 0]} color="wall" round={0.2} />
        <Box size={[0.9, 0.9, 1.4]} position={[1.55, 0.25, 0]} color="parcel" round={0.15} />
        {[-1.0, 1.4].map((x) => [-0.7, 0.7].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.22, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 14]} />
            <Matte color="roof" />
          </mesh>
        )))}
        <TruckCargo />
      </Selectable>
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={packAnchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}

/** All nine districts, the control hill and the props, in the airy diorama style of the Zone 1 scene. */
export function Buildings({ factoryActive, packingActive }: { factoryActive: boolean; packingActive: boolean }) {
  return (
    <group>
      <Hill />
      <FactoryQuarter active={factoryActive} />
      <PackingDock active={packingActive} />
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
