import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, type Group, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
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
import { DgxBuilding } from '../zones/dgx-building/DgxBuilding';
import { ControlRoom } from '../zones/control-room/ControlRoom';
import { ProductionLine } from '../zones/production-line/ProductionLine';
import { StorageYard } from '../zones/storage-yard/StorageYard';
import { TransportNetwork } from '../zones/transport-network/TransportNetwork';
import { anchors as packAnchors } from '../zones/packing-station/anchors';
import { scene, type SceneColor } from '../core/palette';
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
const PACK_CRATES: { id: string; at: [number, number]; size: number; strips: Strip[] }[] = [
  { id: 'fp32', at: [15.0, -8.4], size: 1.4, strips: [[1, 8, 23]] },
  { id: 'bf16-fp16', at: [16.4, -9.8], size: 1.1, strips: [[1, 8, 7], [1, 5, 10]] },
  { id: 'fp8', at: [17.8, -11.2], size: 0.8, strips: [[1, 4, 3], [1, 5, 2]] },
  { id: 'int8', at: [19.2, -12.6], size: 0.8, strips: [[1, 0, 7]] },
];
const TRUCK_CELLS = 8;
const LOAD_PERIOD = 1;
const BELT_OUT = { from: [0.9, 0], to: [1.9, 0] } as const;

/** Bits of one number as a strip of cells on a crate lid: [sign, exponent, mantissa] (INT8 has a sign bit and 7 value bits, no exponent). */
type Strip = readonly [sign: number, exponent: number, mantissa: number];

/** One or more rows of bit cells lying on a crate lid. Every cell is a bit; colour says what the bit is for. */
function BitStrips({ strips, width, y }: { strips: readonly Strip[]; width: number; y: number }) {
  const mats = useMemo(
    () => ({
      sign: new MeshStandardMaterial({ color: scene.roof, roughness: 0.7 }),
      exponent: new MeshStandardMaterial({ color: scene.parcelHot, roughness: 0.7 }),
      mantissa: new MeshStandardMaterial({ color: scene.coolant, roughness: 0.7 }),
    }),
    [],
  );
  const rowGap = 0.13;
  return (
    <>
      {strips.map((st, row) => {
        const total = st[0] + st[1] + st[2];
        const perRow = Math.min(total, 16);
        const lines = Math.ceil(total / perRow);
        const cell = width / perRow;
        const z0 = ((row - (strips.length - 1) / 2) * (lines + 0.4) * rowGap);
        return Array.from({ length: total }, (_, i) => {
          const kind = i < st[0] ? 'sign' : i < st[0] + st[1] ? 'exponent' : 'mantissa';
          const line = Math.floor(i / perRow);
          const col = i % perRow;
          return (
            <mesh key={`${row}-${i}`} material={mats[kind]} position={[-width / 2 + cell * (col + 0.5), y, z0 + line * rowGap]} castShadow>
              <boxGeometry args={[cell * 0.82, 0.04, rowGap * 0.8]} />
            </mesh>
          );
        });
      })}
    </>
  );
}

const formatId = (f: string) => (f === 'bf16' ? 'bf16-fp16' : f);
const cargoSize = (bytes: number) => 0.34 * Math.cbrt(bytes);

/**
 * Crates that leave the Transformer Engine, riding the output belt onto the truck bed. The load fills one crate per
 * belt arrival; the 8 cells of bed space hold fewer, bigger crates the more bytes each number takes.
 */
function TruckCargo({ bytes, color, reducedMotion }: { bytes: number; color: SceneColor; reducedMotion: boolean }) {
  const n = TRUCK_CELLS / bytes;
  const size = cargoSize(bytes);
  const refs = useRef<(Group | null)[]>([]);
  const t0 = useRef(0);
  const cols = Math.min(n, 4);
  const sp = size * 1.12;
  const place = (i: number): [number, number, number] => {
    const rows = Math.ceil(n / cols);
    return [-1.2 + (i % cols) * sp + size / 2, 0.45, (Math.floor(i / cols) - (rows - 1) / 2) * sp];
  };
  useFrame((_, dt) => {
    t0.current += dt;
    const loaded = reducedMotion ? n : Math.min(n, Math.floor(t0.current / LOAD_PERIOD) % (n + 3));
    refs.current.forEach((g, i) => g && (g.visible = i < loaded));
  });
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} position={place(i)}>
          <Box size={[size, size * 0.8, size]} color={color} round={0.15} />
        </group>
      ))}
    </>
  );
}

const WHEELS: [number, number][] = [[-1.0, 0.7], [-1.0, -0.7], [0.3, 0.7], [0.3, -0.7], [1.0, 0.7], [1.0, -0.7]];

/** Flatbed truck facing +x: dark chassis, bed with low rails, cab with windows and lights, six wheels. */
function Truck({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Box size={[2.9, 0.1, 1.1]} position={[0, 0.2, 0]} hex={derived.darkTrim} round={0.3} />
      <Box size={[2.0, 0.15, 1.45]} position={[-0.4, 0.3, 0]} color="wall" round={0.2} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[2.0, 0.12, 0.06]} position={[-0.4, 0.45, s * 0.7]} color="path" round={0.3} />
      ))}
      <Box size={[0.06, 0.2, 1.45]} position={[-1.37, 0.45, 0]} color="path" round={0.3} />
      <Box size={[0.8, 0.75, 1.4]} position={[1.0, 0.3, 0]} color="parcel" round={0.12} />
      <Box size={[0.72, 0.05, 1.46]} position={[1.0, 1.05, 0]} color="roof" round={0.3} />
      <Box size={[0.04, 0.32, 1.1]} position={[1.4, 0.68, 0]} color="coolant" round={0.2} shadow={false} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.42, 0.3, 0.04]} position={[1.0, 0.68, s * 0.7]} color="coolant" round={0.2} shadow={false} />
      ))}
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.04, 0.1, 0.2]} position={[1.4, 0.38, s * 0.45]} hex={derived.lampGlow} round={0.3} shadow={false} />
      ))}
      <Box size={[0.1, 0.1, 1.5]} position={[1.4, 0.18, 0]} color="roof" round={0.3} />
      {WHEELS.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0.22, z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 16]} />
            <Matte color="roof" />
          </mesh>
          <mesh position={[0, z > 0 ? 0.085 : -0.085, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 12]} />
            <Matte color="wall" />
          </mesh>
        </group>
      ))}
      {children}
    </>
  );
}

/** A cog lying on the machine's front face: disc, hub and teeth. */
function Cog({ r, position, spin }: { r: number; position: [number, number, number]; spin: React.RefObject<Group> }) {
  const teeth = 8;
  return (
    <group position={position}>
      <group ref={spin}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[r, r, 0.06, 20]} />
          <Matte color="path" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]}>
          <cylinderGeometry args={[r * 0.35, r * 0.35, 0.03, 12]} />
          <Matte color="roof" />
        </mesh>
        {Array.from({ length: teeth }, (_, i) => {
          const a = (i / teeth) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * (r + 0.02), Math.sin(a) * (r + 0.02), 0]} rotation={[0, 0, a]} castShadow>
              <boxGeometry args={[r * 0.4, r * 0.34, 0.06]} />
              <Matte color="path" />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

const LIGHT_ORDER = ['fp32', 'bf16', 'fp8', 'int8'] as const;

/**
 * The Transformer Engine: a packing machine with an entry and an exit hood for the belts, a control cabin with windows,
 * two meshing cogs, an exhaust stack, and a row of lights showing which number format it is packing right now.
 */
function TransformerEngineModel({ format, reducedMotion }: { format: string; reducedMotion: boolean }) {
  const stack = useRef<Group>(null);
  const cogA = useRef<Group>(null);
  const cogB = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (stack.current) stack.current.scale.y = 1 + Math.sin(t * 2.4) * 0.06;
    if (cogA.current) cogA.current.rotation.z = t * 1.2;
    if (cogB.current) cogB.current.rotation.z = -t * 1.2 * (0.2 / 0.12) + Math.PI / 8;
  });
  return (
    <>
      <Box size={[1.9, 0.12, 1.5]} hex={derived.darkTrim} round={0.25} />
      <Box size={[1.5, 0.62, 1.2]} position={[0, 0.12, 0]} color="network" round={0.1} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[0.12, 0.44, 0.66]} position={[s * 0.8, 0.2, 0]} color="roof" round={0.2} />
          <Box size={[0.03, 0.3, 0.46]} position={[s * 0.865, 0.26, 0]} hex={derived.darkTrim} round={0.1} shadow={false} />
        </group>
      ))}
      <Box size={[1.0, 0.4, 0.8]} position={[0, 0.74, 0]} color="wall" round={0.12} />
      <Box size={[1.12, 0.06, 0.92]} position={[0, 1.14, 0]} color="roof" round={0.3} />
      <Box size={[0.7, 0.18, 0.03]} position={[0, 0.85, 0.4]} color="coolant" round={0.2} shadow={false} />
      <Box size={[0.03, 0.18, 0.5]} position={[0.5, 0.85, 0]} color="coolant" round={0.2} shadow={false} />
      <group ref={stack} position={[0.55, 0.74, -0.3]}>
        <Box size={[0.24, 0.78, 0.24]} color="roof" round={0.3} />
        <Box size={[0.32, 0.06, 0.32]} position={[0, 0.78, 0]} color="path" round={0.3} />
      </group>
      <Cog r={0.2} position={[-0.4, 0.44, 0.62]} spin={cogA} />
      <Cog r={0.12} position={[-0.08, 0.34, 0.62]} spin={cogB} />
      <Box size={[0.68, 0.2, 0.03]} position={[0.33, 0.45, 0.6]} color="roof" round={0.3} />
      {LIGHT_ORDER.map((f, i) => (
        <Box
          key={f}
          size={[0.1, 0.1, 0.04]}
          position={[0.08 + i * 0.15, 0.5, 0.62]}
          hex={f === format ? scene[PACK_COLOR[formatId(f)]] : derived.darkTrim}
          round={0.3}
          shadow={false}
        />
      ))}
    </>
  );
}

/** District 2: the Packing Dock yard. Crates by number format (with their bits drawn on the lid), the Transformer Engine and the truck it loads. */
function PackingDock({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const format = useFactoryStore((s) => s.packSim.format);
  const bytes = packSimulate({ format, model: '7b' }).bytesPerParam;
  const color = PACK_COLOR[formatId(format)];
  const tint = scene[color];
  const truck = useRef<Group>(null);
  // Idle motion: the truck idles with a small bounce.
  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    if (truck.current) truck.current.position.y = Math.abs(Math.sin(t * 3)) * 0.02;
  });
  const objects = useMemo(() => itemsInZone('packing-station').filter((i) => i.kind === 'object'), []);
  const outLen = BELT_OUT.to[0] - BELT_OUT.from[0];
  const outCount = 2;
  return (
    <>
      {PACK_CRATES.map((c) => (
        <Selectable key={c.id} id={c.id} position={[c.at[0], 0, c.at[1]]}>
          <Box size={[c.size, c.size * 0.8, c.size]} color={PACK_COLOR[c.id]} round={0.12} />
          <Box size={[c.size * 1.06, 0.08, c.size * 1.06]} position={[0, c.size * 0.8, 0]} color="roof" round={0.3} />
          <BitStrips strips={c.strips} width={c.size * 0.9} y={c.size * 0.8 + 0.1} />
        </Selectable>
      ))}
      <Selectable id="transformer-engine" position={[16.8, 0, -5.6]}>
        <TransformerEngineModel format={format} reducedMotion={reducedMotion} />
        {/* In: big FP32 crates from the packing building. Out: crates in the chosen format, onto the truck. */}
        <Conveyor key={`in-${format}`} from={[-3.4, 0]} to={[-0.9, 0]} speed={reducedMotion ? 0 : 0.7} hot={false} parcels={4} size={cargoSize(4)} tint={scene.storage} />
        <Conveyor key={`out-${format}`} from={[...BELT_OUT.from]} to={[...BELT_OUT.to]} speed={reducedMotion ? 0 : outLen / (outCount * LOAD_PERIOD)} hot={false} parcels={outCount} size={cargoSize(bytes)} tint={tint} />
      </Selectable>
      <Selectable id="delivery-truck" position={[20.0, 0, -5.6]}>
        <group ref={truck}>
          <Truck>
            <TruckCargo key={format} bytes={bytes} color={color} reducedMotion={reducedMotion} />
          </Truck>
        </group>
      </Selectable>
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={packAnchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}

/** All nine districts, the control hill and the props, in the airy diorama style of the Zone 1 scene. */
export function Buildings({ factoryActive, packingActive, dgxActive, transportActive, storageActive, lineActive, controlActive }: { factoryActive: boolean; packingActive: boolean; dgxActive: boolean; transportActive: boolean; storageActive: boolean; lineActive: boolean; controlActive: boolean }) {
  return (
    <group>
      <Hill />
      <FactoryQuarter active={factoryActive} />
      <PackingDock active={packingActive} />
      <DgxBuilding active={dgxActive} />
      <TransportNetwork active={transportActive} />
      <StorageYard active={storageActive} />
      <ProductionLine active={lineActive} />
      <ControlRoom active={controlActive} />
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
