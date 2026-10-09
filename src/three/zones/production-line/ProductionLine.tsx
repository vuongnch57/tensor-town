import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group, type Mesh } from 'three';
import { useFactoryStore } from '@/state/useFactoryStore';
import { itemsInZone } from '@/content/registry';
import { derived } from '../../core/derived';
import { scene } from '../../core/palette';
import { Box } from '../../primitives/Box';
import { Hotspot } from '../../primitives/Hotspot';
import { Parcels } from '../../primitives/Parcels';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import { Workers } from '../../primitives/Workers';
import { mat, mix, Slab } from '../kit';
import { simulate, type LineStation } from './sim';
import { anchors, BUILD_LANE_Z, CUSTOMER_SPOTS, DOCK, DROP, NGC, paths, PLAZA, RAPIDS, SERVE_LANE_Z, SHOP, TRAIN, TRT, WORKER_SPOTS } from './layout';

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
      hall: mat(scene.hall),
      network: mat(scene.network),
      storage: mat(scene.storage),
      idle: mat(scene.idle),
      pin: mat(scene.parcel),
      steel: mat(mix(scene.roof, '#ffffff', 0.35), 0.5),
      belt: mat(mix(scene.path, scene.roof, 0.45)),
      stripe: mat(mix(scene.hall, '#ffffff', 0.35)),
      cont: [mat(scene.hall), mat(scene.network), mat(scene.coolant), mat(scene.storage)],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

type Rect = { x: number; z: number; w: number; d: number; h: number };
const front = (r: Rect) => r.z + r.d / 2;

/** A light tower that stands on the station the picked business need points to. */
function Beacon({ on, x, y, z }: { on: boolean; x: number; y: number; z: number }) {
  const ref = useRef<Mesh>(null);
  const { reducedMotion } = useSceneInteraction();
  const m = useMats();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(on ? 1 + (reducedMotion ? 0 : 0.18 * Math.sin(clock.elapsedTime * 4)) : 0.0001);
  });
  return (
    <group position={[x, y, z]}>
      <Slab size={[0.04, 0.5, 0.04]} position={[0, 0, 0]} m={on ? m.glow : m.idle} />
      <mesh ref={ref} material={m.glow} position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.16, 14, 10]} />
      </mesh>
    </group>
  );
}

function NgcStore({ lit }: { lit: boolean }) {
  const m = useMats();
  const f = front(NGC);
  return (
    <Selectable id="ngc">
      <Box size={[NGC.w, NGC.h, NGC.d]} position={[NGC.x, 0, NGC.z]} color="wall" round={0.05} />
      <Box size={[NGC.w + 0.24, 0.12, NGC.d + 0.24]} position={[NGC.x, NGC.h, NGC.z]} color="network" round={0.25} />
      {/* shelves of tools behind a big window */}
      <Slab size={[1.2, 0.8, 0.03]} position={[NGC.x, 0.3, f + 0.008]} m={m.dark} />
      {[0, 1, 2].map((row) =>
        [-0.42, -0.14, 0.14, 0.42].map((dx, k) => (
          <Slab key={`${row}${dx}`} size={[0.2, 0.18, 0.04]} position={[NGC.x + dx, 0.36 + row * 0.24, f + 0.03]} m={m.cont[(row + k) % 4]} />
        )),
      )}
      <Box size={[1.4, 0.07, 0.34]} position={[NGC.x, 1.12, f + 0.14]} color="hall" round={0.4} />
      {/* containers stacked on the roof */}
      {[-0.35, 0.35].map((dx, k) => (
        <Slab key={dx} size={[0.55, 0.3, 0.5]} position={[NGC.x + dx, NGC.h + 0.12, NGC.z]} m={m.cont[k + 1]} />
      ))}
      <Slab size={[0.55, 0.3, 0.5]} position={[NGC.x, NGC.h + 0.42, NGC.z]} m={m.cont[0]} />
      <Beacon on={lit} x={NGC.x - 0.55} y={NGC.h + 0.12} z={NGC.z + 0.7} />
    </Selectable>
  );
}

function RapidsPrep({ lit }: { lit: boolean }) {
  const m = useMats();
  const f = front(RAPIDS);
  return (
    <Selectable id="rapids">
      <Box size={[RAPIDS.w, RAPIDS.h, RAPIDS.d]} position={[RAPIDS.x, 0, RAPIDS.z]} color="wall" round={0.05} />
      <Box size={[RAPIDS.w + 0.24, 0.12, RAPIDS.d + 0.24]} position={[RAPIDS.x, RAPIDS.h, RAPIDS.z]} color="hall" round={0.25} />
      {/* hopper that feeds the prep area, and two process tanks on the roof */}
      <mesh material={m.steel} position={[RAPIDS.x - 0.35, RAPIDS.h + 0.38, RAPIDS.z]} castShadow>
        <cylinderGeometry args={[0.38, 0.12, 0.5, 14]} />
      </mesh>
      {[0.3, 0.7].map((dx) => (
        <mesh key={dx} material={m.glass} position={[RAPIDS.x + dx, RAPIDS.h + 0.3, RAPIDS.z - 0.3]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 0.34, 12]} />
        </mesh>
      ))}
      {/* open prep bay: a table with crates being sorted */}
      <Slab size={[1.3, 0.55, 0.03]} position={[RAPIDS.x, 0.25, f + 0.008]} m={m.dark} />
      <Slab size={[1.2, 0.08, 0.4]} position={[RAPIDS.x, 0.32, f + 0.22]} m={m.steel} />
      {[-0.4, -0.1, 0.2, 0.5].map((dx, k) => (
        <Slab key={dx} size={[0.18, 0.14, 0.18]} position={[RAPIDS.x + dx, 0.4, f + 0.22]} m={m.cont[k % 4]} />
      ))}
      <Slab size={[1.2, 0.26, 0.02]} position={[RAPIDS.x, 0.9, f + 0.006]} m={m.glass} />
      <Beacon on={lit} x={RAPIDS.x + 0.55} y={RAPIDS.h + 0.12} z={RAPIDS.z + 0.7} />
    </Selectable>
  );
}

/** The training line: a long saw-tooth hall, its build conveyor along the corridor, and the workers beside it. */
function TrainingLine({ lit, busy }: { lit: boolean; busy: number }) {
  const m = useMats();
  const f = front(TRAIN);
  const teeth = [-1.2, -0.4, 0.4, 1.2];
  return (
    <Selectable id="training-line">
      <Box size={[TRAIN.w, TRAIN.h, TRAIN.d]} position={[TRAIN.x, 0, TRAIN.z]} color="wall" round={0.04} />
      {teeth.map((dx) => (
        <mesh key={dx} material={m.hall} position={[TRAIN.x + dx, TRAIN.h + 0.2, TRAIN.z]} rotation={[0, 0, -0.45]} castShadow>
          <boxGeometry args={[0.8, 0.1, TRAIN.d + 0.2]} />
        </mesh>
      ))}
      {teeth.map((dx) => (
        <Slab key={`g${dx}`} size={[0.06, 0.3, TRAIN.d - 0.2]} position={[TRAIN.x + dx - 0.37, TRAIN.h, TRAIN.z]} m={m.glass} />
      ))}
      {[-1.3, 1.3].map((dx) => (
        <mesh key={`c${dx}`} material={m.steel} position={[TRAIN.x + dx, TRAIN.h + 0.55, TRAIN.z - 0.6]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 0.9, 10]} />
        </mesh>
      ))}
      <Slab size={[2.9, 0.34, 0.02]} position={[TRAIN.x, 0.7, f + 0.006]} m={m.glass} />
      <Slab size={[0.4, 0.62, 0.03]} position={[TRAIN.x - 1.2, 0, f + 0.008]} m={m.dark} />
      {/* the build conveyor along the corridor */}
      <Slab size={[8.9, 0.06, 0.5]} position={[17.95, 0, BUILD_LANE_Z]} m={m.belt} />
      <Workers spots={WORKER_SPOTS} busy={busy} y={0.02} />
      <Beacon on={lit} x={TRAIN.x - 1.3} y={TRAIN.h + 0.3} z={TRAIN.z + 0.7} />
    </Selectable>
  );
}

/** TensorRT: a press that squashes a big crate into a small one. The piston moves unless reduced motion is on. */
function Compactor({ lit }: { lit: boolean }) {
  const m = useMats();
  const piston = useRef<Group>(null);
  const crate = useRef<Mesh>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    const k = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.6);
    if (piston.current) piston.current.position.y = 1.0 + 0.5 * k;
    if (crate.current) crate.current.scale.y = 0.55 + 0.45 * k;
  });
  const { x, z } = TRT;
  return (
    <Selectable id="tensorrt">
      <Box size={[TRT.w, 0.9, TRT.d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[TRT.w + 0.2, 0.1, TRT.d + 0.2]} position={[x, 0.9, z]} color="network" round={0.25} />
      {/* press frame: two posts, a top beam and the piston */}
      {[-0.6, 0.6].map((dx) => (
        <Slab key={dx} size={[0.1, 1.0, 0.1]} position={[x + dx, 1.0, z + 0.2]} m={m.steel} />
      ))}
      <Slab size={[1.4, 0.14, 0.2]} position={[x, 1.98, z + 0.2]} m={m.dark} />
      <group ref={piston} position={[x, 1.0, z + 0.2]}>
        <mesh material={m.steel} position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 10]} />
        </mesh>
        <Slab size={[0.62, 0.08, 0.5]} position={[0, 0, 0]} m={m.dark} />
      </group>
      <mesh ref={crate} material={m.cont[0]} position={[x, 1.1, z + 0.2]} castShadow>
        <boxGeometry args={[0.5, 0.36, 0.42]} />
      </mesh>
      <Slab size={[0.7, 0.06, 0.6]} position={[x, 0.99, z + 0.2]} m={m.steel} />
      <Slab size={[0.9, 0.2, 0.02]} position={[x, 0.55, front(TRT) + 0.006]} m={m.glass} />
      {/* the belt that carries the compacted model down to the dock */}
      <Slab size={[0.5, 0.06, SERVE_LANE_Z - BUILD_LANE_Z]} position={[TRT.x + 0.1, 0, (BUILD_LANE_Z + SERVE_LANE_Z) / 2]} m={m.belt} />
      <Beacon on={lit} x={x + 0.55} y={2.08} z={z + 0.7} />
    </Selectable>
  );
}

/** The shipping dock: two bays side by side. Triton is the configurable bay (dials and sliders); NIM is the pre-packed box, sealed and ready. */
function ShippingDock({ lit, bay }: { lit: boolean; bay?: 'triton' | 'nim' }) {
  const m = useMats();
  const f = front(DOCK);
  const bayX = { triton: DOCK.x - 0.5, nim: DOCK.x + 0.5 };
  return (
    <Selectable id="shipping-dock">
      <Box size={[DOCK.w, DOCK.h, DOCK.d]} position={[DOCK.x, 0, DOCK.z]} color="wall" round={0.05} />
      <Box size={[DOCK.w + 0.24, 0.12, DOCK.d + 0.24]} position={[DOCK.x, DOCK.h, DOCK.z]} color="storage" round={0.25} />
      {(['triton', 'nim'] as const).map((b) => (
        <group key={b}>
          <Slab size={[0.8, 0.85, 0.04]} position={[bayX[b], 0, f + 0.01]} m={m.dark} />
          <Slab size={[0.86, 0.06, 0.06]} position={[bayX[b], 0.85, f + 0.02]} m={lit && bay === b ? m.glow : m.steel} />
        </group>
      ))}
      {/* Triton bay: a rack of sliders */}
      {[0.2, 0.42, 0.64].map((y, k) => (
        <group key={y}>
          <Slab size={[0.62, 0.03, 0.03]} position={[bayX.triton, y, f + 0.05]} m={m.steel} />
          <Slab size={[0.08, 0.1, 0.05]} position={[bayX.triton - 0.2 + k * 0.2, y - 0.04, f + 0.05]} m={m.pin} />
        </group>
      ))}
      {/* NIM bay: a pre-packed box, closed and sealed */}
      <Slab size={[0.5, 0.45, 0.4]} position={[bayX.nim, 0.05, f + 0.22]} m={m.hall} />
      <Slab size={[0.52, 0.04, 0.42]} position={[bayX.nim, 0.5, f + 0.22]} m={m.stripe} />
      <Slab size={[0.1, 0.46, 0.42]} position={[bayX.nim, 0.05, f + 0.221]} m={m.stripe} />
      <Slab size={[0.6, 0.03, 0.5]} position={[bayX.nim, 0, f + 0.22]} m={m.steel} />
      <Beacon on={lit} x={DOCK.x} y={DOCK.h + 0.12} z={DOCK.z + 0.7} />
    </Selectable>
  );
}

/** The 24/7 shop: striped awning, a round clock, a sun and a moon on the sign, and the westbound serve lane in front. */
function InferenceShop() {
  const m = useMats();
  const f = front(SHOP);
  return (
    <Selectable id="inference-shop">
      <Box size={[SHOP.w, SHOP.h, SHOP.d]} position={[SHOP.x, 0, SHOP.z]} color="wall" round={0.05} />
      <Box size={[SHOP.w + 0.24, 0.12, SHOP.d + 0.24]} position={[SHOP.x, SHOP.h, SHOP.z]} color="roof" round={0.25} />
      {Array.from({ length: 10 }, (_, k) => SHOP.x - 1.35 + k * 0.3).map((x, k) => (
        <Slab key={x} size={[0.3, 0.05, 0.4]} position={[x, 0.95, f + 0.2]} m={k % 2 ? m.wall : m.hall} />
      ))}
      <Slab size={[1.0, 0.5, 0.03]} position={[SHOP.x - 0.8, 0.3, f + 0.008]} m={m.glass} />
      <Slab size={[0.45, 0.72, 0.03]} position={[SHOP.x + 0.7, 0, f + 0.008]} m={m.dark} />
      <Slab size={[0.3, 0.1, 0.03]} position={[SHOP.x + 0.7, 0.8, f + 0.012]} m={m.glow} />
      {/* round clock on the front */}
      <mesh material={m.steel} position={[SHOP.x, SHOP.h - 0.2, f + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 20]} />
      </mesh>
      <Slab size={[0.03, 0.14, 0.02]} position={[SHOP.x, SHOP.h - 0.2, f + 0.05]} m={m.dark} />
      <Slab size={[0.1, 0.03, 0.02]} position={[SHOP.x + 0.03, SHOP.h - 0.2, f + 0.05]} m={m.dark} />
      {/* roof sign: sun and moon */}
      <mesh material={m.hall} position={[SHOP.x - 0.3, SHOP.h + 0.4, SHOP.z]}>
        <sphereGeometry args={[0.2, 14, 10]} />
      </mesh>
      <mesh material={m.idle} position={[SHOP.x + 0.3, SHOP.h + 0.4, SHOP.z]}>
        <sphereGeometry args={[0.2, 14, 10]} />
      </mesh>
      <Slab size={[0.9, 0.04, 0.1]} position={[SHOP.x, SHOP.h + 0.12, SHOP.z]} m={m.dark} />
      {/* serve lane: finished packages go west to the shop */}
      <Slab size={[5.7, 0.06, 0.5]} position={[19.65, 0, SERVE_LANE_Z]} m={m.belt} />
    </Selectable>
  );
}

/** The customer queue: a plaza with rope barriers, a ticket kiosk and customers waiting in line. */
function CustomerQueue({ busy }: { busy: number }) {
  const m = useMats();
  return (
    <Selectable id="customer-queue">
      <Box size={[PLAZA.w, 0.05, PLAZA.d]} position={[PLAZA.x, 0, PLAZA.z]} color="path" round={0.2} />
      {[0, 1, 2, 3, 4].map((k) => (
        <group key={k}>
          <Slab size={[0.05, 0.4, 0.05]} position={[PLAZA.x - 1.4 + k * 0.7, 0.05, PLAZA.z + 0.45]} m={m.dark} />
          <Slab size={[0.7, 0.03, 0.03]} position={[PLAZA.x - 1.05 + k * 0.7, 0.36, PLAZA.z + 0.45]} m={m.hall} />
        </group>
      ))}
      <Box size={[0.5, 0.6, 0.4]} position={[PLAZA.x - 1.3, 0.05, PLAZA.z - 0.5]} color="wall" round={0.08} />
      <Box size={[0.62, 0.07, 0.52]} position={[PLAZA.x - 1.3, 0.65, PLAZA.z - 0.5]} color="roof" round={0.3} />
      <Slab size={[0.3, 0.16, 0.02]} position={[PLAZA.x - 1.3, 0.3, PLAZA.z - 0.29]} m={m.glass} />
      <Workers spots={CUSTOMER_SPOTS} busy={busy} y={0.04} />
    </Selectable>
  );
}

/**
 * District 6: the production line. Data parcels ride the build lane past the stations and come out of the compactor as small packages;
 * those ride the serve lane to the 24/7 shop, where customers queue. The picked business need puts a light tower on the station that answers it.
 */
export function ProductionLine({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const need = useFactoryStore((s) => s.lineSim.need);
  const objects = useMemo(() => itemsInZone('production-line').filter((i) => i.kind === 'object'), []);
  const r = simulate({ need });
  const lit = (s: LineStation) => r.station === s;
  const speed = (v: number) => (reducedMotion ? 0 : v);
  return (
    <>
      <NgcStore lit={lit('ngc')} />
      <RapidsPrep lit={lit('rapids')} />
      <TrainingLine lit={lit('training-line')} busy={need === 'train' ? 1 : 0.6} />
      <Compactor lit={lit('tensorrt')} />
      <ShippingDock lit={lit('shipping-dock')} bay={r.bay} />
      <InferenceShop />
      <CustomerQueue busy={need === 'serve-custom' || need === 'serve-ready' ? 0.8 : 0.4} />
      <Parcels path={paths.build} count={7} speed={speed(0.6)} y={0.06} size={0.28} />
      <Parcels path={DROP} count={2} speed={speed(0.4)} y={0.06} size={0.2} tint={scene.coolant} />
      <Parcels path={paths.serve} count={5} speed={speed(0.7)} y={0.06} size={0.2} tint={scene.coolant} />
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
