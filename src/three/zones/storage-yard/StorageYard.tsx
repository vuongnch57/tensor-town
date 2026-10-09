import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { itemsInZone } from '@/content/registry';
import { derived } from '../../core/derived';
import { scene } from '../../core/palette';
import { Box } from '../../primitives/Box';
import { Hotspot } from '../../primitives/Hotspot';
import { Parcels } from '../../primitives/Parcels';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import { mat, mix, Slab } from '../kit';
import { simulate } from './sim';
import { anchors, CHECKPOINT_X, DEPOT, DIRECT_X, HALL, HALL_S, OFFICE, paths, PFS, PFS_N, SHED, SHED_SLOTS } from './layout';

/** Every Selectable gets its own materials, so selecting one object never tints another. */
const useMats = () =>
  useMemo(
    () => ({
      band: mat(scene.path),
      wall: mat(scene.wall),
      roof: mat(scene.roof),
      dark: mat(derived.darkTrim),
      glass: mat(scene.coolant, 0.4),
      glow: mat(scene.parcelHot, 0.5),
      full: mat(scene.hall),
      empty: mat(scene.idle),
      network: mat(scene.network),
      storage: mat(scene.storage),
      storageDark: mat(mix(scene.storage, scene.roof, 0.45)),
      steel: mat(mix(scene.roof, '#ffffff', 0.35), 0.5),
      stick: mat(mix(scene.roof, '#000000', 0.1)),
      pin: mat(scene.parcel),
      cont: [mat(scene.hall), mat(scene.network), mat(scene.coolant)],
      snap: mat(scene.coolant, 0.5),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

/** The GPU hall (the destination) with its manager's office in front. Two doors face the warehouse: one for the courier lane, one for the office route. */
function GpuHallBuilding() {
  const m = useMats();
  const { x, z, w, d, h } = HALL;
  const front = z + d / 2;
  return (
    <Selectable id="gpu-hall">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[w + 0.24, 0.14, d + 0.24]} position={[x, h, z]} color="hall" round={0.25} />
      {/* roof: the GPU package */}
      <Slab size={[1.3, 0.04, 1.1]} position={[x, h + 0.14, z]} m={m.roof} />
      <Slab size={[0.5, 0.06, 0.5]} position={[x, h + 0.18, z]} m={m.dark} />
      {[-1, 1].map((s) =>
        [-0.28, 0, 0.28].map((dz) => <Slab key={`${s}${dz}`} size={[0.2, 0.05, 0.16]} position={[x + s * 0.5, h + 0.18, z + dz]} m={m.network} />),
      )}
      {/* doors: the courier door (glowing frame) and the office-route door */}
      {[DIRECT_X, 6.0].map((dx, k) => (
        <group key={dx}>
          <Slab size={[0.5, 0.78, 0.04]} position={[dx, 0, front + 0.01]} m={m.dark} />
          {k === 0 && <Slab size={[0.6, 0.05, 0.06]} position={[dx, 0.78, front + 0.02]} m={m.glass} />}
        </group>
      ))}
      {[5.3, 6.7].map((wx) => (
        <Slab key={wx} size={[0.4, 0.34, 0.02]} position={[wx, 0.7, front + 0.006]} m={m.glass} />
      ))}
      {[-0.5, 0.5].map((dz) => (
        <Slab key={dz} size={[0.02, 0.4, 0.4]} position={[x + w / 2 + 0.006, 0.6, z + dz]} m={m.glass} />
      ))}
      {/* the CPU's office on the route between the warehouse and the hall */}
      <Box size={[OFFICE.w, OFFICE.h, OFFICE.d]} position={[OFFICE.x, 0, OFFICE.z]} color="wall" round={0.06} />
      <Box size={[OFFICE.w + 0.24, 0.1, OFFICE.d + 0.24]} position={[OFFICE.x, OFFICE.h, OFFICE.z]} color="roof" round={0.25} />
      <Slab size={[0.4, 0.55, 0.03]} position={[OFFICE.x - 0.3, 0, OFFICE.z + OFFICE.d / 2 + 0.006]} m={m.dark} />
      <Slab size={[0.5, 0.26, 0.02]} position={[OFFICE.x + 0.4, 0.5, OFFICE.z + OFFICE.d / 2 + 0.006]} m={m.glass} />
      <Slab size={[0.04, 0.5, 0.04]} position={[OFFICE.x + 0.6, OFFICE.h + 0.1, OFFICE.z - 0.2]} m={m.steel} />
    </Selectable>
  );
}

/** The NVMe cache shed next to the hall: a row of drive bays that fill up as the cache fills, and drive modules on the roof. */
function CacheShed({ filled }: { filled: number }) {
  const m = useMats();
  const { x, z, w, d, h } = SHED;
  const front = z + d / 2;
  return (
    <Selectable id="nvme-cache-shed">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.06} />
      <Box size={[w + 0.2, 0.1, d + 0.2]} position={[x, h, z]} color="storage" round={0.25} />
      {[-0.55, -0.18, 0.18, 0.55].map((dx) => (
        <group key={dx}>
          <Slab size={[0.26, 0.04, 0.9]} position={[x + dx, h + 0.1, z]} m={m.stick} />
          <Slab size={[0.1, 0.05, 0.1]} position={[x + dx, h + 0.14, z - 0.35]} m={m.pin} />
        </group>
      ))}
      <Slab size={[0.03, 0.4, d - 0.2]} position={[x + w / 2 + 0.008, 0.45, z]} m={m.dark} />
      {Array.from({ length: SHED_SLOTS }, (_, k) => z - 0.52 + k * 0.26).map((sz, k) => (
        <Slab key={k} size={[0.04, 0.24, 0.2]} position={[x + w / 2 + 0.02, 0.53, sz]} m={k < filled ? m.full : m.empty} />
      ))}
      <Slab size={[0.4, 0.62, 0.03]} position={[x - 0.45, 0, front + 0.008]} m={m.dark} />
    </Selectable>
  );
}

/** The parallel file system: a wide warehouse with many dock doors side by side and ribs along the roof, so many parcels can leave at once. */
function ParallelFileSystem() {
  const m = useMats();
  const { x, z, w, d, h } = PFS;
  const front = z + d / 2;
  const doors = [-1.8, -0.6, 0.6, 1.8];
  return (
    <Selectable id="parallel-file-system">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.04} />
      <Box size={[w + 0.3, 0.16, d + 0.3]} position={[x, h, z]} color="storage" round={0.25} />
      {[-2, -1, 0, 1, 2].map((k) => (
        <Slab key={k} size={[0.16, 0.12, d - 0.2]} position={[x + k * 0.9, h + 0.16, z]} m={m.storageDark} />
      ))}
      {doors.map((dx) => (
        <group key={dx}>
          <Slab size={[0.8, 1.05, 0.04]} position={[x + dx, 0, front + 0.01]} m={m.dark} />
          <Slab size={[0.86, 0.06, 0.06]} position={[x + dx, 1.05, front + 0.02]} m={m.storageDark} />
          <Slab size={[0.4, 0.04, 0.34]} position={[x + dx, 0, front + 0.2]} m={m.band} />
        </group>
      ))}
      {[-1.2, 0, 1.2].map((dx) => (
        <Slab key={dx} size={[0.5, 0.26, 0.02]} position={[x + dx, 1.25, front + 0.006]} m={m.glass} />
      ))}
      {[-0.55, 0.55].map((dz) => (
        <group key={dz}>
          <Slab size={[0.04, 0.9, 0.7]} position={[x + w / 2 + 0.01, 0, z + dz]} m={m.dark} />
          <Slab size={[0.06, 0.06, 0.78]} position={[x + w / 2 + 0.02, 0.9, z + dz]} m={m.storageDark} />
        </group>
      ))}
      <Slab size={[0.02, 0.22, 2.0]} position={[x + w / 2 + 0.006, 1.2, z]} m={m.glass} />
      {/* disk stacks on the roof: the drives behind the warehouse */}
      {[-1.5, -0.5, 0.5, 1.5].map((dx) => (
        <mesh key={dx} material={m.steel} position={[x + dx, h + 0.4, z - 0.6]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 14]} />
        </mesh>
      ))}
    </Selectable>
  );
}

/** The object-storage depot at the port: a plain warehouse with containers on the roof and a gantry crane over them. */
function ObjectDepot() {
  const m = useMats();
  const { x, z, w, d, h } = DEPOT;
  return (
    <Selectable id="object-storage-depot">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[w + 0.24, 0.12, d + 0.24]} position={[x, h, z]} color="storage" round={0.25} />
      {[-0.9, 0, 0.9].map((dx, k) => (
        <Slab key={dx} size={[0.78, 0.4, 0.5]} position={[x + dx, h + 0.12, z - 0.1]} m={m.cont[k % 3]} />
      ))}
      {[-0.45, 0.45].map((dx, k) => (
        <Slab key={dx} size={[0.78, 0.4, 0.5]} position={[x + dx, h + 0.52, z - 0.1]} m={m.cont[(k + 1) % 3]} />
      ))}
      {/* crane: two legs, a beam over the roof and a hook block */}
      {[-1, 1].map((s) => (
        <Slab key={s} size={[0.08, 1.2, 0.08]} position={[x + s * 1.2, h + 0.12, z + 0.75]} m={m.steel} />
      ))}
      <Slab size={[2.6, 0.1, 0.12]} position={[x, h + 1.32, z + 0.75]} m={m.steel} />
      <Slab size={[0.04, 0.5, 0.04]} position={[x + 0.2, h + 0.82, z + 0.75]} m={m.dark} />
      <Slab size={[0.2, 0.12, 0.16]} position={[x + 0.2, h + 0.72, z + 0.75]} m={m.glow} />
      <Slab size={[0.5, 0.62, 0.03]} position={[x - 0.6, 0, z + d / 2 + 0.008]} m={m.dark} />
      <Slab size={[0.5, 0.26, 0.02]} position={[x + 0.6, 0.6, z + d / 2 + 0.006]} m={m.glass} />
    </Selectable>
  );
}

/** The GPUDirect Storage courier lane: a glass-sided deck with a lit edge running straight from the warehouse into the hall, skipping the office. */
function CourierLane({ on }: { on: boolean }) {
  const m = useMats();
  const len = PFS_N - HALL_S;
  const mid = (PFS_N + HALL_S) / 2;
  return (
    <Selectable id="gpudirect-storage">
      <Box size={[0.46, 0.1, len]} position={[DIRECT_X, 0, mid]} color="coolant" round={0.25} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Slab size={[0.03, 0.2, len]} position={[DIRECT_X + s * 0.21, 0.1, mid]} m={m.glass} />
          <Slab size={[0.04, 0.03, len]} position={[DIRECT_X + s * 0.21, 0.3, mid]} m={on ? m.glow : m.empty} />
        </group>
      ))}
      {[PFS_N - 0.04, HALL_S + 0.04].map((cz) => (
        <Slab key={cz} size={[0.56, 0.3, 0.06]} position={[DIRECT_X, 0, cz]} m={m.steel} />
      ))}
      <Slab size={[0.6, 0.05, 0.06]} position={[DIRECT_X, 0.3, mid]} m={m.steel} />
    </Selectable>
  );
}

/** The checkpoint: a small snapshot gantry over the return lane from the hall to the warehouse, with a flash lamp. */
function CheckpointGate() {
  const m = useMats();
  const mid = (PFS_N + HALL_S) / 2;
  return (
    <Selectable id="checkpoint">
      <Slab size={[0.4, 0.04, PFS_N - HALL_S]} position={[CHECKPOINT_X, 0, mid]} m={m.band} />
      {[-1, 1].map((s) => (
        <Slab key={s} size={[0.08, 0.95, 0.08]} position={[CHECKPOINT_X + s * 0.3, 0, mid]} m={m.dark} />
      ))}
      <Box size={[0.8, 0.2, 0.24]} position={[CHECKPOINT_X, 0.95, mid]} color="network" round={0.25} />
      <Slab size={[0.16, 0.12, 0.16]} position={[CHECKPOINT_X, 1.15, mid]} m={m.glow} />
      <Slab size={[0.2, 0.16, 0.14]} position={[CHECKPOINT_X + 0.3, 0.84, mid + 0.14]} m={m.stick} />
      <Slab size={[0.4, 0.14, 0.34]} position={[CHECKPOINT_X, 0.04, mid - 0.9]} m={m.snap} />
    </Selectable>
  );
}

/**
 * District 5: the storage yard. Crates take the route the Simulate bar picks, from the warehouse to the GPU hall:
 * through the CPU's office, or down the GPUDirect courier lane. With the cache on, the share it can hold is fetched
 * from the cache shed next to the hall instead, and the shed's drive bays show how full it is.
 */
export function StorageYard({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const { cache, path, epoch } = useFactoryStore((s) => s.storageSim);
  const objects = useMemo(() => itemsInZone('storage-yard').filter((i) => i.kind === 'object'), []);
  const r = simulate({ cache, path, epoch });
  const filled = cache && epoch >= 2 ? Math.round(r.fromCache * SHED_SLOTS) : 0;
  const filling = cache && epoch === 1;
  const total = 6;
  const cachedCount = Math.round(r.fromCache * total);
  const coldCount = Math.max(1, total - cachedCount);
  const base = reducedMotion ? 0 : 1;
  const coldSpeed = base * (path === 'cpu' ? 0.6 : 1.0);
  return (
    <>
      <ObjectDepot />
      <ParallelFileSystem />
      <CacheShed filled={filled} />
      <GpuHallBuilding />
      <CourierLane on={path === 'gpudirect'} />
      <CheckpointGate />
      <Parcels path={paths.feeder} count={2} speed={base * 0.4} y={0.1} size={0.3} />
      <Parcels key={`cold-${path}-${coldCount}`} path={paths[path === 'cpu' ? 'office' : 'direct']} count={coldCount} speed={coldSpeed} y={path === 'cpu' ? 0.06 : 0.14} size={0.3} />
      {cachedCount > 0 && <Parcels key={`hot-${cachedCount}`} path={paths.fromCache} count={cachedCount} speed={base * 1.1} y={0.06} size={0.26} hot />}
      {filling && <Parcels path={paths.fill} count={3} speed={base * 0.6} y={0.06} size={0.26} />}
      <Parcels path={paths.checkpoint} count={1} speed={base * 0.35} y={0.06} size={0.3} tint={scene.coolant} />
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
