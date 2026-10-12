import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';
import { useFactoryStore } from '@/state/useFactoryStore';
import { itemsInZone } from '@/content/registry';
import type { PodArchitecture } from '@/content/types';
import { derived } from '../../core/derived';
import { scene } from '../../core/palette';
import { Box } from '../../primitives/Box';
import { Hotspot } from '../../primitives/Hotspot';
import { Parcels } from '../../primitives/Parcels';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import { Lane as KitLane, mat, mix, Slab } from '../kit';
import { simulate, type Slot } from './sim';
import { anchors, BLOCK, BOARD, CORRIDOR_Z, CRANE, DEPOT, paths, SLOTS } from './layout';

/** Every Selectable gets its own materials, so selecting one object never tints another. */
const useMats = () =>
  useMemo(
    () => ({
      wall: mat(scene.wall),
      dark: mat(derived.darkTrim),
      glass: mat(scene.coolant, 0.4),
      hall: mat(scene.hall),
      network: mat(scene.network),
      storage: mat(scene.storage),
      idle: mat(scene.idle),
      pin: mat(scene.parcel),
      hot: mat(scene.parcelHot, 0.5),
      steel: mat(mix(scene.roof, '#ffffff', 0.35), 0.5),
      belt: mat(mix(scene.path, scene.roof, 0.45)),
      stripe: mat(mix(scene.hall, '#ffffff', 0.35)),
      cloud: mat(mix(scene.coolant, '#ffffff', 0.7), 0.9),
      plot: mat(mix(scene.path, scene.ground, 0.5)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

function Lane({ pts, w = 0.34 }: { pts: readonly (readonly [number, number])[]; w?: number }) {
  const m = useMats();
  return <KitLane pts={pts} w={w} belt={m.belt} rail={m.steel} />;
}

/** A small cloud of three spheres, the sign of rented capacity. */
function Cloud({ x, y, z, s = 1 }: { x: number; y: number; z: number; s?: number }) {
  const m = useMats();
  return (
    <group position={[x, y, z]} scale={s}>
      {[[-0.18, 0, 0, 0.16], [0.02, 0.07, 0, 0.2], [0.22, 0, 0, 0.15]].map(([dx, dy, dz, r], i) => (
        <mesh key={i} material={m.cloud} position={[dx, dy, dz]} castShadow>
          <sphereGeometry args={[r, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
}

/** One scalable unit. Owned: solid hall with its rows of racks on the roof (more rows for a SuperPOD). Rented: pale hall with a cloud and a "to let" awning. */
function Unit({ slot, kind, arch }: { slot: number; kind: 'owned' | 'rented'; arch: PodArchitecture }) {
  const m = useMats();
  const { x, z } = SLOTS[slot];
  const { w, d, h } = BLOCK;
  const fz = z + d / 2;
  const cols = arch === 'superpod' ? 8 : 3;
  const rows = arch === 'superpod' ? 4 : 2;
  const cw = (w - 0.4) / cols;
  const rd = (d - 0.5) / rows;
  const rented = kind === 'rented';
  return (
    <>
      <Box size={[w, h, d]} position={[x, 0, z]} color={rented ? 'coolant' : 'wall'} round={0.05} />
      <Box size={[w + 0.2, 0.1, d + 0.2]} position={[x, h, z]} color={rented ? 'idle' : 'storage'} round={0.25} />
      {/* rows of racks on the roof: the unit's contents, seen from above */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <Slab key={`${r}${c}`} size={[cw * 0.78, 0.05, rd * 0.7]} position={[x - w / 2 + 0.2 + cw * (c + 0.5), h + 0.1, z - d / 2 + 0.25 + rd * (r + 0.5)]} m={rented ? m.glass : (r + c) % 2 ? m.network : m.hall} />
        )),
      )}
      <Slab size={[w - 0.5, 0.3, 0.02]} position={[x - 0.05, 0.4, fz + 0.006]} m={m.glass} />
      <Slab size={[0.4, 0.62, 0.03]} position={[x + w / 2 - 0.4, 0, fz + 0.008]} m={m.dark} />
      {rented && (
        <>
          {Array.from({ length: 6 }, (_, k) => (
            <Slab key={k} size={[0.4, 0.05, 0.4]} position={[x - w / 2 + 0.2 + k * 0.4, 0.82, fz + 0.2]} m={k % 2 ? m.wall : m.hall} />
          ))}
          <Cloud x={x} y={h + 0.55} z={z} s={1.3} />
        </>
      )}
    </>
  );
}

/** A slot that is not built yet: staked-out ground with a foundation outline and tape. Part of the expansion plot. */
function Plot({ slot }: { slot: number }) {
  const m = useMats();
  const { x, z } = SLOTS[slot];
  const { w, d } = BLOCK;
  return (
    <>
      <Box size={[w, 0.04, d]} position={[x, 0, z]} hex={mix(scene.path, scene.ground, 0.6)} round={0.2} shadow={false} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Slab key={`${sx}${sz}`} size={[0.06, 0.4, 0.06]} position={[x + (sx * (w - 0.2)) / 2, 0.04, z + (sz * (d - 0.2)) / 2]} m={m.hot} />
      ))}
      <Slab size={[w - 0.2, 0.02, 0.02]} position={[x, 0.32, z + (d - 0.2) / 2]} m={m.pin} />
      <Slab size={[0.02, 0.02, d - 0.2]} position={[x + (w - 0.2) / 2, 0.32, z]} m={m.pin} />
      <Slab size={[w - 0.5, 0.06, d - 0.5]} position={[x, 0.04, z]} m={m.plot} />
    </>
  );
}

/** The master plan board by the entrance, and a tower crane on the reserved lot. */
function ExpansionPlot() {
  const m = useMats();
  const arm = useRef<Group>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    if (arm.current && !reducedMotion) arm.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 1.1;
  });
  return (
    <Selectable id="expansion-plot">
      {/* master plan board: four slots drawn on it, the unbuilt ones left blank */}
      <Slab size={[0.06, 0.8, 0.06]} position={[BOARD.x - 0.8, 0, BOARD.z]} m={m.steel} />
      <Slab size={[0.06, 0.8, 0.06]} position={[BOARD.x + 0.8, 0, BOARD.z]} m={m.steel} />
      <Slab size={[2.0, 0.95, 0.06]} position={[BOARD.x, 0.7, BOARD.z]} m={m.dark} />
      {[0, 1, 2, 3].map((k) => (
        <Slab key={k} size={[0.34, 0.26, 0.03]} position={[BOARD.x - 0.6 + (k % 4) * 0.4, 1.18, BOARD.z + 0.04]} m={k < 2 ? m.storage : m.idle} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <Slab key={`b${k}`} size={[0.34, 0.26, 0.03]} position={[BOARD.x - 0.6 + (k % 4) * 0.4, 0.82, BOARD.z + 0.04]} m={k < 3 ? m.idle : m.hot} />
      ))}
      <Slab size={[1.7, 0.05, 0.03]} position={[BOARD.x, 0.7, BOARD.z + 0.04]} m={m.stripe} />
      {/* reserved lot with a tower crane */}
      <Box size={[1.1, 0.04, 1.4]} position={[CRANE.x, 0, CRANE.z]} hex={mix(scene.path, scene.ground, 0.6)} round={0.2} shadow={false} />
      <Slab size={[0.18, 3.0, 0.18]} position={[CRANE.x, 0.04, CRANE.z]} m={m.hot} />
      <group ref={arm} position={[CRANE.x, 3.0, CRANE.z]}>
        <Slab size={[2.2, 0.1, 0.1]} position={[0, 0, 0]} m={m.hot} />
        <Slab size={[0.02, 0.5, 0.02]} position={[-0.8, -0.5, 0]} m={m.dark} />
        <Slab size={[0.3, 0.18, 0.24]} position={[-0.8, -0.68, 0]} m={m.network} />
        <Slab size={[0.4, 0.2, 0.2]} position={[0.9, -0.2, 0]} m={m.steel} />
      </group>
      {[0.5, 1.0].map((k) => (
        <Slab key={k} size={[0.3, 0.12, 0.3]} position={[CRANE.x - 0.3, 0.04 + (k - 0.5) * 0.24, CRANE.z + 0.4]} m={m.pin} />
      ))}
    </Selectable>
  );
}

/** The rented depot: a glass hall with a cloud on the roof and a "to let" sign, joined to the campus by a lease line. */
function RentedDepot() {
  const m = useMats();
  const { x, z, w, d, h } = DEPOT;
  const fz = z + d / 2;
  return (
    <Selectable id="rented-capacity">
      <Box size={[w, h, d]} position={[x, 0, z]} color="coolant" round={0.05} />
      <Box size={[w + 0.2, 0.1, d + 0.2]} position={[x, h, z]} color="idle" round={0.25} />
      {[-0.9, -0.3, 0.3, 0.9].map((dx) => (
        <Slab key={dx} size={[0.5, 0.05, 0.9]} position={[x + dx, h + 0.1, z]} m={m.glass} />
      ))}
      <Cloud x={x} y={h + 0.55} z={z} s={1.4} />
      <Slab size={[w - 0.5, 0.28, 0.02]} position={[x - 0.1, 0.45, fz + 0.006]} m={m.glass} />
      <Slab size={[0.4, 0.62, 0.03]} position={[x + w / 2 - 0.4, 0, fz + 0.008]} m={m.dark} />
      {Array.from({ length: 6 }, (_, k) => (
        <Slab key={k} size={[0.4, 0.05, 0.4]} position={[x - w / 2 + 0.3 + k * 0.4, 0.8, fz + 0.2]} m={k % 2 ? m.wall : m.hall} />
      ))}
      <Slab size={[0.05, 0.5, 0.05]} position={[x - w / 2 - 0.1, 0, fz]} m={m.steel} />
      <Slab size={[0.5, 0.26, 0.03]} position={[x - w / 2 - 0.36, 0.36, fz]} m={m.hot} />
      <Lane pts={paths.lease} w={0.24} />
    </Selectable>
  );
}

/**
 * District 9: the campus grows by scalable units. Slots fill up as the unit count rises; owned units are solid, rented units are pale with a cloud,
 * and open slots stay as the expansion plot. A spine of roads joins them and the town's road and power cable arrive at its ends.
 */
export function CampusExpansion({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const { architecture, deployment, units } = useFactoryStore((s) => s.campusSim);
  const objects = useMemo(() => itemsInZone('campus-expansion').filter((i) => i.kind === 'object'), []);
  const r = simulate({ architecture, deployment, units });
  const speed = (v: number) => (reducedMotion ? 0 : v);
  const idFor = (i: number, k: Slot) => (i === 0 && k !== 'empty' ? 'scalable-unit' : k === 'owned' ? 'superpod-campus' : k === 'rented' ? 'rented-capacity' : 'expansion-plot');
  return (
    <>
      {r.slots.map((k, i) => (
        <Selectable key={`${i}-${k}-${architecture}`} id={idFor(i, k)}>
          {k === 'empty' ? <Plot slot={i} /> : <Unit slot={i} kind={k} arch={architecture} />}
        </Selectable>
      ))}
      <Selectable id="superpod-campus">
        <Lane pts={paths.corridor} />
        <Lane pts={paths.spine} />
        {/* gate arch where the town road enters */}
        <GateArch />
      </Selectable>
      <ExpansionPlot />
      <RentedDepot />
      <Parcels path={paths.corridor} count={4} speed={speed(0.7)} y={0.05} size={0.2} tint={scene.storage} />
      <Parcels path={paths.spine} count={3} speed={speed(0.6)} y={0.05} size={0.14} tint={scene.parcelHot} />
      <Parcels path={paths.lease} count={2} speed={speed(0.5)} y={0.05} size={0.16} tint={scene.coolant} />
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}

function GateArch() {
  const m = useMats();
  return (
    <>
      {[-0.35, 0.35].map((dz) => (
        <Slab key={dz} size={[0.08, 0.9, 0.08]} position={[15.7, 0, CORRIDOR_Z + dz]} m={m.steel} />
      ))}
      <Slab size={[0.14, 0.12, 0.9]} position={[15.7, 0.9, CORRIDOR_Z]} m={m.hall} />
    </>
  );
}
