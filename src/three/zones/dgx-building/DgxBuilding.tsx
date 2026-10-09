import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, type Group } from 'three';
import { useFactoryStore } from '@/state/useFactoryStore';
import { itemsInZone } from '@/content/registry';
import { derived } from '../../core/derived';
import { scene, type SceneColor } from '../../core/palette';
import { Box } from '../../primitives/Box';
import { Hotspot } from '../../primitives/Hotspot';
import { Parcels } from '../../primitives/Parcels';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import type { Pt } from '@/lib/path';
import {
  anchors, BLOCKS, BOARD_HALF_X, BOARD_HALF_Z, BOARD_TOP, BRIDGE_Y, bridgePairs, CENTER, CORRIDOR, NVSWITCH_CHIPS, ROOM_COUNT, ROOM_HEIGHT, ROOM_SIZE, roomPos, SPINE, SPOKE_Y,
} from './layout';

const roomsList = Array.from({ length: ROOM_COUNT }, (_, i) => i);
const mat = (color: string, roughness = 0.75) => new MeshStandardMaterial({ color, roughness, metalness: 0 });

/** Plain (non-rounded) box, standing on its own base like Box. Cheap, for small details. */
function Slab({ size, position, m }: { size: [number, number, number]; position: [number, number, number]; m: MeshStandardMaterial }) {
  return (
    <mesh material={m} position={[position[0], position[1] + size[1] / 2, position[2]]} castShadow={false} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}

/** A fan lying flat: dark rim, hub and four blades that spin (still with reduced motion). */
function Fan({ r, position, m }: { r: number; position: [number, number, number]; m: { dark: MeshStandardMaterial; blade: MeshStandardMaterial } }) {
  const spin = useRef<Group>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame((_, dt) => {
    if (!reducedMotion && spin.current) spin.current.rotation.y += dt * 9;
  });
  return (
    <group position={position}>
      <mesh material={m.dark} position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[r, r, 0.06, 20]} />
      </mesh>
      <group ref={spin} position={[0, 0.07, 0]}>
        {[0, 1, 2, 3].map((k) => (
          <mesh key={k} material={m.blade} rotation={[0, (k * Math.PI) / 2, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[r * 1.7, 0.015, r * 0.28]} />
          </mesh>
        ))}
      </group>
      <mesh material={m.dark} position={[0, 0.085, 0]}>
        <cylinderGeometry args={[r * 0.2, r * 0.2, 0.04, 10]} />
      </mesh>
    </group>
  );
}

/** A heat sink: base plate with a comb of fins. */
function Heatsink({ position, w, d, fins, base, fin }: { position: [number, number, number]; w: number; d: number; fins: number; base: MeshStandardMaterial; fin: MeshStandardMaterial }) {
  return (
    <group position={position}>
      <Slab size={[w, 0.08, d]} position={[0, 0, 0]} m={base} />
      {Array.from({ length: fins }, (_, k) => (
        <Slab key={k} size={[w / (fins * 2.2), 0.2, d * 0.9]} position={[-w / 2 + (w / fins) * (k + 0.5), 0.08, 0]} m={fin} />
      ))}
    </group>
  );
}

/** One GPU room: a tower on a socket pad, floors, windows on both visible faces and a door, with the GPU package (die and memory stacks) on the roof. */
function Room({ i, m }: { i: number; m: Record<string, MeshStandardMaterial> }) {
  const [x, z] = roomPos(i);
  const h = ROOM_HEIGHT;
  const s = ROOM_SIZE / 2;
  const rows = [0.4, 0.9, 1.4];
  return (
    <group position={[x, BOARD_TOP, z]}>
      <Box size={[ROOM_SIZE, h - 0.08, ROOM_SIZE]} position={[0, 0.05, 0]} color="wall" round={0.06} />
      {[0.62, 1.12].map((y) => (
        <Slab key={y} size={[ROOM_SIZE + 0.05, 0.05, ROOM_SIZE + 0.05]} position={[0, y, 0]} m={m.band} />
      ))}
      <Box size={[ROOM_SIZE + 0.2, 0.1, ROOM_SIZE + 0.2]} position={[0, h - 0.05, 0]} color="network" round={0.25} />
      {/* GPU package on the roof: substrate, die and six memory stacks */}
      <Slab size={[0.62, 0.03, 0.5]} position={[0, h + 0.05, 0]} m={m.substrate} />
      <Slab size={[0.24, 0.05, 0.24]} position={[0, h + 0.08, 0]} m={m.die} />
      {[-1, 1].map((sx) => [-0.11, 0, 0.11].map((zz) => (
        <Slab key={`${sx}${zz}`} size={[0.1, 0.05, 0.08]} position={[sx * 0.2, h + 0.08, zz]} m={m.memory} />
      )))}
      {/* windows: both faces the camera sees */}
      {rows.map((y) =>
        [-0.2, 0.2].map((c) => (
          <group key={`${y}${c}`}>
            <Slab size={[0.2, 0.26, 0.02]} position={[c, y, s + 0.005]} m={m.glass} />
            <Slab size={[0.02, 0.26, 0.2]} position={[s + 0.005, y, c]} m={m.glass} />
          </group>
        )),
      )}
      <Slab size={[0.24, 0.32, 0.03]} position={[0, 0.06, s + 0.008]} m={m.door} />
    </group>
  );
}

/** A sky-bridge between two rooms in a row: deck with glass-panel sides, an arch over the middle and a collar at each end. */
function Bridge({ a, b, m }: { a: Pt; b: Pt; m: Record<string, MeshStandardMaterial> }) {
  const len = Math.abs(b[0] - a[0]) - ROOM_SIZE + 0.1;
  const cx = (a[0] + b[0]) / 2;
  return (
    <group position={[cx, BRIDGE_Y, a[1]]}>
      <Box size={[len, 0.12, 0.56]} position={[0, -0.12, 0]} color="hall" round={0.25} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Slab size={[len, 0.28, 0.03]} position={[0, 0, s * 0.265]} m={m.glass} />
          <Slab size={[len, 0.04, 0.06]} position={[0, 0.28, s * 0.265]} m={m.glow} />
          <Slab size={[0.05, 0.5, 0.05]} position={[0, 0, s * 0.265]} m={m.frame} />
        </group>
      ))}
      <Slab size={[0.06, 0.06, 0.6]} position={[0, 0.5, 0]} m={m.frame} />
      {[-1, 1].map((s) => (
        <Slab key={`c${s}`} size={[0.07, 0.42, 0.64]} position={[s * (len / 2 - 0.035), -0.12, 0]} m={m.frame} />
      ))}
    </group>
  );
}

const loopPath = (): Pt[] => [
  [-CORRIDOR.halfX, -CORRIDOR.halfZ],
  [CORRIDOR.halfX, -CORRIDOR.halfZ],
  [CORRIDOR.halfX, CORRIDOR.halfZ],
  [-CORRIDOR.halfX, CORRIDOR.halfZ],
  [-CORRIDOR.halfX, -CORRIDOR.halfZ],
];

/**
 * District 3: the DGX building. Two rows of GPU rooms on the HGX board with the NVSwitch spine hall between them,
 * sky-bridges joining neighbouring rooms, the PCIe corridor looping round the board, and the CPU, network and power blocks in front.
 * The interconnect picked in Simulate decides where the data crates ride: round the PCIe loop, over the pair bridges, or along the hub's spokes.
 */
export function DgxBuilding({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const interconnect = useFactoryStore((s) => s.fabricSim.interconnect);
  const running = useFactoryStore((s) => s.fabricRunning);
  const objects = useMemo(() => itemsInZone('dgx-building').filter((i) => i.kind === 'object'), []);
  const loop = useMemo(loopPath, []);
  const c = (name: SceneColor) => scene[name];
  const m = useMemo(
    () => ({
      band: mat(c('path')),
      substrate: mat(c('wall')),
      die: mat(c('roof')),
      memory: mat(c('storage')),
      glass: mat(c('coolant'), 0.4),
      door: mat(c('roof')),
      frame: mat(c('roof')),
      dark: mat(derived.darkTrim),
      trace: mat(c('parcel')),
      cap: mat(c('roof')),
      fin: mat(c('wall')),
      base: mat(c('network')),
      glow: mat(c('parcelHot'), 0.5),
      slat: mat(derived.darkTrim),
      port: mat(c('parcel')),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const speed = (v: number) => (reducedMotion ? 0 : v * (running ? 1.6 : 1));
  const bridges = bridgePairs.map(([a, b]) => ({ a: roomPos(a) as Pt, b: roomPos(b) as Pt }));
  const sh = SPINE.height;
  return (
    <>
      <group position={[CENTER[0], 0, CENTER[1]]}>
        {/* DGX system: chassis tray with low walls and rack ears, the CPU and network block, the power and cooling block */}
        <Selectable id="dgx-system">
          <Box size={[BOARD_HALF_X * 2 + 0.5, 0.1, BOARD_HALF_Z * 2 + 0.5]} color="path" round={0.2} />
          {[-1, 1].map((s) => (
            <Slab key={`wz${s}`} size={[BOARD_HALF_X * 2 + 0.5, 0.3, 0.08]} position={[0, 0.1, s * (BOARD_HALF_Z + 0.21)]} m={m.band} />
          ))}
          {[-1, 1].map((s) => (
            <group key={`wx${s}`}>
              <Slab size={[0.08, 0.3, BOARD_HALF_Z * 2 + 0.5]} position={[s * (BOARD_HALF_X + 0.21), 0.1, 0]} m={m.band} />
              <Slab size={[0.1, 0.55, 0.6]} position={[s * (BOARD_HALF_X + 0.31), 0, 0]} m={m.frame} />
            </group>
          ))}
          {/* CPU and network block */}
          <group position={[BLOCKS.cpu.x, 0, BLOCKS.cpu.z]}>
            <Box size={[BLOCKS.cpu.w, BLOCKS.cpu.h, BLOCKS.cpu.d]} color="wall" round={0.06} />
            <Box size={[BLOCKS.cpu.w + 0.2, 0.1, BLOCKS.cpu.d + 0.2]} position={[0, BLOCKS.cpu.h, 0]} color="network" round={0.25} />
            {[0, 1].map((row) =>
              [-0.95, -0.55, -0.15].map((x) => (
                <Slab key={`${row}${x}`} size={[0.32, 0.12, 0.02]} position={[x, 0.3 + row * 0.2, BLOCKS.cpu.d / 2 + 0.005]} m={m.slat} />
              )),
            )}
            {[0.25, 0.5, 0.75, 1.0].map((x) => (
              <Slab key={x} size={[0.14, 0.14, 0.02]} position={[x, 0.28, BLOCKS.cpu.d / 2 + 0.005]} m={m.port} />
            ))}
            {[0.25, 0.5, 0.75, 1.0].map((x) => (
              <Slab key={`l${x}`} size={[0.14, 0.14, 0.02]} position={[x, 0.54, BLOCKS.cpu.d / 2 + 0.005]} m={m.glass} />
            ))}
            <Slab size={[2.2, 0.1, 0.02]} position={[0, 0.88, BLOCKS.cpu.d / 2 + 0.005]} m={m.glass} />
            <Slab size={[0.02, 0.6, 0.8]} position={[BLOCKS.cpu.w / 2 + 0.005, 0.3, 0]} m={m.glass} />
            <Slab size={[0.5, 0.06, 0.4]} position={[-0.7, BLOCKS.cpu.h + 0.1, 0]} m={m.base} />
            <Slab size={[0.5, 0.06, 0.4]} position={[0.1, BLOCKS.cpu.h + 0.1, 0]} m={m.base} />
          </group>
          {/* power and cooling block */}
          <group position={[BLOCKS.power.x, 0, BLOCKS.power.z]}>
            <Box size={[BLOCKS.power.w, BLOCKS.power.h, BLOCKS.power.d]} color="wall" round={0.06} />
            <Box size={[BLOCKS.power.w + 0.2, 0.1, BLOCKS.power.d + 0.2]} position={[0, BLOCKS.power.h, 0]} color="network" round={0.25} />
            {[0.15, 0.3, 0.45, 0.6, 0.75].map((y) => (
              <Slab key={y} size={[1.4, 0.04, 0.02]} position={[0, y, BLOCKS.power.d / 2 + 0.005]} m={m.slat} />
            ))}
            {[-0.45, 0.45].map((x) => (
              <Fan key={x} r={0.3} position={[x, BLOCKS.power.h + 0.1, 0]} m={{ dark: m.dark, blade: m.fin }} />
            ))}
          </group>
        </Selectable>

        {/* HGX board: circuit board with sockets, traces, capacitors, connectors, screws and the PCIe corridor loop */}
        <Selectable id="hgx-board">
          <Box size={[BOARD_HALF_X * 2, 0.15, BOARD_HALF_Z * 2]} position={[0, 0.1, 0]} color="hall" round={0.12} />
          {roomsList.map((i) => {
            const [x, z] = roomPos(i);
            return <Slab key={`pad${i}`} size={[ROOM_SIZE + 0.35, 0.03, ROOM_SIZE + 0.35]} position={[x, BOARD_TOP, z]} m={m.dark} />;
          })}
          {roomsList.map((i) => {
            const [x, z] = roomPos(i);
            const sign = z < 0 ? -1 : 1;
            const from = sign * (SPINE.halfZ + 0.1);
            const to = z - sign * ((ROOM_SIZE + 0.35) / 2);
            return [-0.12, 0.12].map((dx) => (
              <Slab key={`tr${i}${dx}`} size={[0.035, 0.015, Math.abs(to - from)]} position={[x + dx, BOARD_TOP, (from + to) / 2]} m={m.trace} />
            ));
          })}
          {[-0.75, 0.75].map((z) => (
            <Slab key={`lt${z}`} size={[5.2, 0.015, 0.035]} position={[0, BOARD_TOP, z]} m={m.trace} />
          ))}
          {Array.from({ length: 12 }, (_, k) => -2.75 + k * 0.5).map((x) => (
            <mesh key={`cap${x}`} material={m.cap} position={[x, BOARD_TOP + 0.07, -BOARD_HALF_Z + 0.2]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.14, 10]} />
            </mesh>
          ))}
          {[-1, 0, 1].map((z) => (
            <Slab key={`cn${z}`} size={[0.25, 0.2, 0.7]} position={[BOARD_HALF_X - 0.25, BOARD_TOP, z * 1.0]} m={m.dark} />
          ))}
          {[-1, 1].map((sx) => [-1, 1].map((sz) => (
            <mesh key={`sc${sx}${sz}`} material={m.band} position={[sx * (BOARD_HALF_X - 0.15), BOARD_TOP + 0.015, sz * (BOARD_HALF_Z - 0.15)]}>
              <cylinderGeometry args={[0.07, 0.07, 0.03, 10]} />
            </mesh>
          )))}
          {/* PCIe corridor loop */}
          {[-1, 1].map((s) => (
            <group key={`co${s}`}>
              <Slab size={[CORRIDOR.halfX * 2 + 0.2, 0.02, 0.2]} position={[0, BOARD_TOP, s * CORRIDOR.halfZ]} m={m.dark} />
              <Slab size={[0.2, 0.02, CORRIDOR.halfZ * 2]} position={[s * CORRIDOR.halfX, BOARD_TOP, 0]} m={m.dark} />
            </group>
          ))}
        </Selectable>

        <Selectable id="gpu-room">
          {roomsList.map((i) => (
            <Room key={i} i={i} m={m} />
          ))}
        </Selectable>

        <Selectable id="nvlink-bridge">
          {bridges.map((b, k) => (
            <Bridge key={k} a={b.a} b={b.b} m={m} />
          ))}
        </Selectable>

        {/* NVSwitch hub: the tall spine hall between the rows, one heat sink per NVSwitch chip on its roof, a deck to every room */}
        <Selectable id="nvswitch-hub">
          <group position={[0, BOARD_TOP, 0]}>
            <Box size={[SPINE.halfX * 2, sh - 0.2, SPINE.halfZ * 2]} color="parcel" round={0.05} />
            <Box size={[SPINE.halfX * 2 + 0.2, 0.12, SPINE.halfZ * 2 + 0.2]} position={[0, sh - 0.2, 0]} color="roof" round={0.25} />
            {Array.from({ length: 11 }, (_, k) => -2.3 + k * 0.46).map((x) => (
              <group key={x}>
                <Slab size={[0.22, 0.85, 0.02]} position={[x, 0.3, SPINE.halfZ + 0.005]} m={m.glass} />
                <Slab size={[0.22, 0.2, 0.02]} position={[x, 1.4, SPINE.halfZ + 0.005]} m={m.glass} />
              </group>
            ))}
            <Slab size={[0.02, 0.85, 0.5]} position={[SPINE.halfX + 0.005, 0.3, 0]} m={m.glass} />
            <Slab size={[5.0, 0.05, 0.06]} position={[0, sh - 0.06, SPINE.halfZ + 0.12]} m={m.glow} />
            {Array.from({ length: NVSWITCH_CHIPS }, (_, k) => -1.8 + k * 1.2).map((x) => (
              <Heatsink key={x} position={[x, sh - 0.08, 0]} w={0.8} d={0.55} fins={8} base={m.base} fin={m.fin} />
            ))}
            {roomsList.map((i) => {
              const [x, z] = roomPos(i);
              const dir = z < 0 ? -1 : 1;
              const a = dir * SPINE.halfZ;
              const b = z - dir * (ROOM_SIZE / 2);
              const len = Math.abs(b - a);
              return (
                <group key={i} position={[x, SPOKE_Y - BOARD_TOP, (a + b) / 2]}>
                  <Box size={[0.3, 0.1, len + 0.1]} position={[0, -0.1, 0]} color="coolant" round={0.25} />
                  {[-1, 1].map((s) => (
                    <Slab key={s} size={[0.04, 0.14, len + 0.1]} position={[s * 0.13, 0, 0]} m={m.frame} />
                  ))}
                </group>
              );
            })}
          </group>
        </Selectable>

        {/* data crates: where they ride depends on the interconnect picked in Simulate */}
        {interconnect !== 'nvswitch' && (
          <Parcels path={loop} count={interconnect === 'pcie' ? 8 : 6} speed={speed(0.7)} y={BOARD_TOP + 0.03} size={0.2} hot={running} />
        )}
        {interconnect === 'nvlink' &&
          bridges.map((b, k) => {
            const half = (Math.abs(b.b[0] - b.a[0]) - ROOM_SIZE + 0.1) / 2;
            const cx = (b.a[0] + b.b[0]) / 2;
            return <Parcels key={`b${k}`} path={[[cx - half, b.a[1]], [cx + half, b.a[1]]]} count={2} speed={speed(1.0)} y={BRIDGE_Y + 0.02} size={0.26} hot={running} />;
          })}
        {interconnect === 'nvswitch' &&
          roomsList.map((i) => {
            const [x, z] = roomPos(i);
            const dir = z < 0 ? -1 : 1;
            const from: Pt = [x, dir * SPINE.halfZ];
            const to: Pt = [x, z - dir * (ROOM_SIZE / 2)];
            return <Parcels key={`s${i}`} path={[from, to]} count={1} speed={speed(1.0)} y={SPOKE_Y + 0.02} size={0.18} hot={running} />;
          })}
      </group>
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
