import { useMemo } from 'react';
import { Color, MeshStandardMaterial } from 'three';
import { useFactoryStore } from '@/state/useFactoryStore';
import { itemsInZone } from '@/content/registry';
import { derived } from '../../core/derived';
import { scene } from '../../core/palette';
import { Box } from '../../primitives/Box';
import { Hotspot } from '../../primitives/Hotspot';
import { Matte } from '../../primitives/Matte';
import { Parcels } from '../../primitives/Parcels';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import type { Pt } from '@/lib/path';
import {
  ANNEX, anchors, BOARD_HALF, BOARD_TOP, BRIDGE_Y, bridgePairs, CENTER, CORRIDOR_R, HUB_HEIGHT, HUB_R, ROOM_COUNT, ROOM_HEIGHT, ROOM_SIZE, roomAngle, roomPos, SPOKE_Y,
} from './layout';

const roomsList = Array.from({ length: ROOM_COUNT }, (_, i) => i);
const WINDOW_ROWS = 4;

/** A flat open deck with low rails, lying along the line from a to b (local x,z) at height y. Used for bridges and spokes. */
function Deck({ a, b, y, width = 0.3, color = 'hall' }: { a: Pt; b: Pt; y: number; width?: number; color?: 'hall' | 'coolant' }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const rot = Math.atan2(b[0] - a[0], b[1] - a[1]);
  return (
    <group position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, rot, 0]}>
      <Box size={[width, 0.1, len]} position={[0, -0.1, 0]} color={color} round={0.25} />
      {[-1, 1].map((s) => (
        <Box key={s} size={[0.05, 0.12, len]} position={[s * (width / 2 - 0.025), 0, 0]} color="wall" round={0.3} />
      ))}
    </group>
  );
}

/** One GPU room: a tower facing the hub, with window rows on its faces and a lit chip square on the roof. */
function Room({ i, windows }: { i: number; windows: MeshStandardMaterial }) {
  const [x, z] = roomPos(i);
  return (
    <group position={[x, BOARD_TOP, z]} rotation={[0, -roomAngle(i) + Math.PI / 2, 0]}>
      <Box size={[ROOM_SIZE, ROOM_HEIGHT, ROOM_SIZE]} color="wall" round={0.08} />
      <Box size={[ROOM_SIZE + 0.2, 0.12, ROOM_SIZE + 0.2]} position={[0, ROOM_HEIGHT, 0]} color="network" round={0.25} />
      <Box size={[ROOM_SIZE * 0.45, 0.06, ROOM_SIZE * 0.45]} position={[0, ROOM_HEIGHT + 0.12, 0]} color="parcel" round={0.3} />
      {Array.from({ length: WINDOW_ROWS }, (_, r) =>
        [-1, 1].map((s) => (
          <mesh key={`${r}${s}`} material={windows} position={[s * 0.18, 0.55 + r * 0.45, ROOM_SIZE / 2 + 0.005]} castShadow={false}>
            <boxGeometry args={[0.2, 0.22, 0.02]} />
          </mesh>
        )),
      )}
    </group>
  );
}

const ringPath = (n: number, r: number): Pt[] => Array.from({ length: n + 1 }, (_, k) => [Math.cos((k / n) * Math.PI * 2) * r, Math.sin((k / n) * Math.PI * 2) * r]);

/**
 * District 3: the DGX building. Eight GPU rooms around the NVSwitch hub on the HGX board, joined by NVLink sky-bridges,
 * with the PCIe service corridor around the edge and the rest of the DGX (CPUs, cards, power) in the annex.
 * The interconnect picked in Simulate decides where the data crates ride: round the PCIe corridor, over the pair bridges, or through the hub.
 */
export function DgxBuilding({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const interconnect = useFactoryStore((s) => s.fabricSim.interconnect);
  const running = useFactoryStore((s) => s.fabricRunning);
  const windows = useMemo(() => new MeshStandardMaterial({ color: new Color(scene.coolant), roughness: 0.4, metalness: 0 }), []);
  const objects = useMemo(() => itemsInZone('dgx-building').filter((i) => i.kind === 'object'), []);
  const ring = useMemo(() => ringPath(32, CORRIDOR_R), []);
  const speed = (v: number) => (reducedMotion ? 0 : v * (running ? 1.6 : 1));
  const spokes = roomsList.map((i) => ({ i, from: [0, 0] as Pt, to: roomPos(i) as Pt }));
  const bridges = bridgePairs.map(([a, b]) => ({ a: roomPos(a) as Pt, b: roomPos(b) as Pt }));
  return (
    <>
      <group position={[CENTER[0], 0, CENTER[1]]}>
        <Selectable id="dgx-system">
          <Box size={[BOARD_HALF * 2 + 0.5, 0.1, BOARD_HALF * 2 + 0.5]} color="path" round={0.2} />
          <group position={[ANNEX.x - CENTER[0], 0, ANNEX.z - CENTER[1]]}>
            <Box size={[ANNEX.w, ANNEX.h, ANNEX.d]} position={[0, 0, 0]} color="wall" round={0.08} />
            <Box size={[ANNEX.w + 0.24, 0.12, ANNEX.d + 0.24]} position={[0, ANNEX.h, 0]} color="network" round={0.25} />
            {[-0.8, 0, 0.8].map((x) => (
              <Box key={x} size={[0.3, 0.1, 0.3]} position={[x, ANNEX.h + 0.12, 0]} color="roof" round={0.3} />
            ))}
            <Box size={[0.5, 0.8, 0.04]} position={[0, 0, ANNEX.d / 2 + 0.01]} color="roof" round={0.2} shadow={false} />
            {[-0.8, 0.8].map((x) => (
              <Box key={x} size={[0.4, 0.3, 0.03]} position={[x, 0.6, ANNEX.d / 2 + 0.01]} color="coolant" round={0.2} shadow={false} />
            ))}
          </group>
        </Selectable>

        <Selectable id="hgx-board">
          <Box size={[BOARD_HALF * 2, 0.15, BOARD_HALF * 2]} position={[0, 0.1, 0]} color="hall" round={0.12} />
          {roomsList.map((i) => {
            const [x, z] = roomPos(i);
            return <Box key={i} size={[ROOM_SIZE + 0.35, 0.03, ROOM_SIZE + 0.35]} position={[x, BOARD_TOP, z]} hex={derived.darkTrim} round={0.3} shadow={false} />;
          })}
          {[-1, 1].map((sx) => [-1, 1].map((sz) => (
            <Box key={`${sx}${sz}`} size={[0.4, 0.05, 0.4]} position={[sx * (BOARD_HALF - 0.45), BOARD_TOP, sz * (BOARD_HALF - 0.45)]} hex={derived.darkTrim} round={0.3} shadow={false} />
          )))}
          <mesh position={[0, BOARD_TOP + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <ringGeometry args={[CORRIDOR_R - 0.14, CORRIDOR_R + 0.14, 48]} />
            <Matte hex={derived.darkTrim} />
          </mesh>
        </Selectable>

        <Selectable id="gpu-room">
          {roomsList.map((i) => (
            <Room key={i} i={i} windows={windows} />
          ))}
        </Selectable>

        <Selectable id="nvlink-bridge">
          {bridges.map((b, k) => (
            <Deck key={k} a={b.a} b={b.b} y={BRIDGE_Y} width={0.42} />
          ))}
        </Selectable>

        <Selectable id="nvswitch-hub">
          <group position={[0, BOARD_TOP, 0]}>
            <mesh position={[0, HUB_HEIGHT / 2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[HUB_R, HUB_R + 0.05, HUB_HEIGHT, 24]} />
              <Matte color="parcel" />
            </mesh>
            <mesh position={[0, HUB_HEIGHT + 0.04, 0]} castShadow>
              <cylinderGeometry args={[HUB_R + 0.14, HUB_R + 0.14, 0.12, 24]} />
              <Matte color="roof" />
            </mesh>
            <mesh position={[0, HUB_HEIGHT + 0.35, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <Matte color="path" />
            </mesh>
            {roomsList.map((i) => (
              <Deck key={i} a={[0, 0]} b={roomPos(i) as Pt} y={SPOKE_Y - BOARD_TOP} width={0.3} color="coolant" />
            ))}
          </group>
        </Selectable>

        {/* data crates: where they ride depends on the interconnect picked in Simulate */}
        <group position={[0, BOARD_TOP + 0.02, 0]}>
          {interconnect !== 'nvswitch' && (
            <Parcels path={ring} count={interconnect === 'pcie' ? 8 : 6} speed={speed(0.55)} y={0.02} size={0.2} hot={running} />
          )}
        </group>
        {interconnect === 'nvlink' &&
          bridges.map((b, k) => <Parcels key={`b${k}`} path={[b.a, b.b]} count={1} speed={speed(1.8)} y={BRIDGE_Y + 0.02} size={0.24} hot={running} />)}
        {interconnect === 'nvswitch' &&
          spokes.map((s) => <Parcels key={`s${s.i}`} path={[s.from, s.to]} count={2} speed={speed(1.8)} y={SPOKE_Y + 0.02} size={0.2} hot={running} />)}
      </group>
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
