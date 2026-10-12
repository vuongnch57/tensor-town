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
import type { GpuSharing } from '@/content/types';
import { simulate } from './sim';
import { anchors, BOX_DOOR_Z, DECK, DESK, HILL_Y, MANAGER, MIG_DOOR_Z, MIG_EAST, MIG_HALL, MIG_WORKERS, paths, RAMP, SHIFT_EAST, SHIFT_HALL, SHIFT_WORKERS, TERRACE, TICKET_DOOR_Z, TOWER, YARD } from './layout';

/** Every Selectable gets its own materials, so selecting one object never tints another. */
const useMats = () =>
  useMemo(
    () => ({
      wall: mat(scene.wall),
      roof: mat(scene.roof),
      dark: mat(derived.darkTrim),
      glass: mat(scene.coolant, 0.4),
      hall: mat(scene.hall),
      network: mat(scene.network),
      storage: mat(scene.storage),
      idle: mat(scene.idle),
      pin: mat(scene.parcel),
      hot: mat(scene.parcelHot, 0.5),
      steel: mat(mix(scene.roof, '#ffffff', 0.35), 0.5),
      floor: mat(mix(scene.path, scene.wall, 0.4)),
      belt: mat(mix(scene.path, scene.roof, 0.45)),
      stripe: mat(mix(scene.hall, '#ffffff', 0.35)),
      cont: [mat(scene.hall), mat(scene.network), mat(scene.coolant), mat(scene.storage), mat(scene.parcel)],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

/** A belt laid under a lane: one flat slab per straight segment, with a thin rail on each side. Lanes are axis-aligned. */
function Lane({ pts, y = 0, w = 0.34 }: { pts: readonly (readonly [number, number])[]; y?: number; w?: number }) {
  const m = useMats();
  return (
    <>
      {pts.slice(1).map(([bx, bz], i) => {
        const [ax, az] = pts[i];
        const alongX = Math.abs(bx - ax) > Math.abs(bz - az);
        const len = (alongX ? Math.abs(bx - ax) : Math.abs(bz - az)) + w;
        const cx = (ax + bx) / 2;
        const cz = (az + bz) / 2;
        const size: [number, number, number] = alongX ? [len, 0.05, w] : [w, 0.05, len];
        const rail: [number, number, number] = alongX ? [len, 0.1, 0.03] : [0.03, 0.1, len];
        const off = w / 2 + 0.015;
        return (
          <group key={i}>
            <Slab size={size} position={[cx, y, cz]} m={m.belt} />
            <Slab size={rail} position={[alongX ? cx : cx - off, y, alongX ? cz - off : cz]} m={m.steel} />
            <Slab size={rail} position={[alongX ? cx : cx + off, y, alongX ? cz + off : cz]} m={m.steel} />
          </group>
        );
      })}
    </>
  );
}

const RAMP_LEN = Math.hypot(HILL_Y, RAMP.zTo - RAMP.zFrom);

/** The control tower: two screens on its faces. The left bar is "GPU utilization", the right bar is "SM activity", driven by the sharing mode. */
function ControlTower({ sm }: { sm: number }) {
  const m = useMats();
  const bar = useRef<Mesh>(null);
  const dish = useRef<Group>(null);
  const { reducedMotion } = useSceneInteraction();
  const smNow = useRef(sm);
  useFrame(({ clock }, dt) => {
    smNow.current += (sm - smNow.current) * Math.min(1, dt * 6);
    if (bar.current) {
      const h = Math.max(0.02, smNow.current) * 1.0;
      bar.current.scale.y = h;
      bar.current.position.y = h / 2;
    }
    if (dish.current && !reducedMotion) dish.current.rotation.y = clock.elapsedTime * 0.8;
  });
  const { x, z, w, d, h } = TOWER;
  const fz = z + d / 2;
  const fx = x + w / 2;
  const top = HILL_Y + h;
  return (
    <Selectable id="control-tower">
      <Box size={[w, h, d]} position={[x, HILL_Y, z]} color="wall" round={0.04} />
      <Box size={[DECK.w, DECK.h, DECK.w]} position={[x, DECK.y, z]} color="roof" round={0.12} />
      {/* big screen on the south face: two bars side by side */}
      <Slab size={[1.7, 1.5, 0.04]} position={[x, 2.9, fz + 0.01]} m={m.dark} />
      <Slab size={[0.46, 1.0, 0.03]} position={[x - 0.42, 3.15, fz + 0.04]} m={m.idle} />
      <Slab size={[0.46, 1.0, 0.04]} position={[x + 0.42, 3.15, fz + 0.04]} m={m.idle} />
      <Slab size={[0.46, 1.0, 0.05]} position={[x - 0.42, 3.15, fz + 0.07]} m={m.network} />
      <group position={[x + 0.42, 3.15, fz + 0.09]}>
        <mesh ref={bar} material={m.hall}>
          <boxGeometry args={[0.46, 1, 0.04]} />
        </mesh>
      </group>
      {/* labels as pips under each bar */}
      <Slab size={[0.46, 0.06, 0.03]} position={[x - 0.42, 2.98, fz + 0.04]} m={m.network} />
      <Slab size={[0.46, 0.06, 0.03]} position={[x + 0.42, 2.98, fz + 0.04]} m={m.hall} />
      {/* smaller sensor screen on the east face */}
      <Slab size={[0.04, 1.2, 1.7]} position={[fx + 0.01, 3.0, z]} m={m.dark} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <Slab key={`${r}${c}`} size={[0.03, 0.28, 0.4]} position={[fx + 0.04, 3.1 + r * 0.32 - 0.35, z - 0.55 + c * 0.55]} m={(r + c) % 3 === 0 ? m.hot : m.glass} />
        )),
      )}
      {/* window rows and the door */}
      {[0, 1].map((r) => (
        <Slab key={r} size={[1.7, 0.2, 0.02]} position={[x, top - 0.9 - r * 0.45, fz + 0.006]} m={m.glass} />
      ))}
      <Slab size={[0.5, 0.8, 0.03]} position={[x + 0.6, HILL_Y, fz + 0.008]} m={m.dark} />
      {/* roof: railing posts, mast and a turning dish */}
      {[-1.45, 1.45].flatMap((a) => [-1.45, 1.45].map((b) => <Slab key={`${a}${b}`} size={[0.08, 0.3, 0.08]} position={[x + a, DECK.y + DECK.h, z + b]} m={m.steel} />))}
      <mesh material={m.roof} position={[x, DECK.y + DECK.h + 0.6, z]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.2, 10]} />
      </mesh>
      <group ref={dish} position={[x + 0.8, DECK.y + DECK.h + 0.1, z - 0.6]}>
        <mesh material={m.steel} position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        </mesh>
        <mesh material={m.steel} position={[0.15, 0.55, 0]} rotation={[0, 0, -0.9]} castShadow>
          <coneGeometry args={[0.32, 0.18, 16, 1, true]} />
        </mesh>
      </group>
      <mesh material={m.hot} position={[x, DECK.y + DECK.h + 1.28, z]}>
        <sphereGeometry args={[0.1, 12, 8]} />
      </mesh>
    </Selectable>
  );
}

/** The dispatcher's desk: a counter, a board of tickets behind it and a worker. Tickets leave for the halls along two short lanes. */
function DispatcherDesk() {
  const m = useMats();
  const { x, z, w, d } = DESK;
  const f = z + d / 2;
  const colors = [m.hall, m.network, m.glass, m.storage];
  return (
    <Selectable id="dispatcher-desk">
      <Lane pts={paths.mig} y={HILL_Y} w={0.3} />
      <Lane pts={paths.shift} y={HILL_Y} w={0.3} />
      {/* an outbox on the back of the desk where both ticket lanes start */}
      <Slab size={[0.4, 0.18, 0.3]} position={[x + 0.6, HILL_Y + 0.5, z - d / 2 + 0.1]} m={m.steel} />
      <Slab size={[0.4, 0.04, 0.3]} position={[x - 0.9, HILL_Y + 0.5, z]} m={m.steel} />
      <Box size={[w, 0.5, d]} position={[x, HILL_Y, z]} color="wall" round={0.06} />
      <Box size={[w + 0.14, 0.08, d + 0.14]} position={[x, HILL_Y + 0.5, z]} color="roof" round={0.3} />
      {/* the ticket board behind the desk */}
      <Slab size={[1.5, 1.05, 0.06]} position={[x, HILL_Y + 0.58, z - d / 2 + 0.12]} m={m.dark} />
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <Slab key={`${r}${c}`} size={[0.28, 0.2, 0.04]} position={[x - 0.55 + c * 0.37, HILL_Y + 0.7 + r * 0.28, z - d / 2 + 0.17]} m={colors[(r + c) % 4]} />
        )),
      )}
      {/* tickets queued on the counter, and a bell */}
      {[0, 1, 2].map((k) => (
        <Slab key={k} size={[0.22, 0.03 + k * 0.03, 0.16]} position={[x - 0.5 + k * 0.08, HILL_Y + 0.58, f - 0.15]} m={m.pin} />
      ))}
      <mesh material={m.hot} position={[x + 0.55, HILL_Y + 0.65, f - 0.2]}>
        <sphereGeometry args={[0.09, 12, 8]} />
      </mesh>
      <mesh material={m.hall} position={[x + 0.2, HILL_Y + 0.78, z - 0.1]} castShadow>
        <capsuleGeometry args={[0.1, 0.18, 4, 10]} />
      </mesh>
      <mesh material={m.pin} position={[x + 0.2, HILL_Y + 1.02, z - 0.1]}>
        <sphereGeometry args={[0.085, 12, 8]} />
      </mesh>
      {/* sign over the counter */}
      <Slab size={[1.0, 0.16, 0.04]} position={[x, HILL_Y + 1.7, f - 0.1]} m={m.stripe} />
      <Slab size={[0.05, 0.4, 0.05]} position={[x - 0.45, HILL_Y + 1.3, f - 0.1]} m={m.steel} />
      <Slab size={[0.05, 0.4, 0.05]} position={[x + 0.45, HILL_Y + 1.3, f - 0.1]} m={m.steel} />
    </Selectable>
  );
}

/** The partitioned hall (MIG): an open-roof hall split into three walled rooms. Each room has its own roof panel and workers, all busy at once. */
function PartitionedHall({ on }: { on: boolean }) {
  const m = useMats();
  const { x, z, w, d, h } = MIG_HALL;
  const f = z + d / 2;
  return (
    <Selectable id="partitioned-hall" position={[0, HILL_Y, 0]}>
      <Box size={[w, 0.08, d]} position={[x, 0, z]} color="path" round={0.3} />
      {/* intake window where the ticket lane arrives, with a tray outside */}
      <Slab size={[0.04, 0.34, 0.5]} position={[MIG_EAST - 0.02, 0.12, MIG_DOOR_Z]} m={m.dark} />
      <Slab size={[0.2, 0.05, 0.4]} position={[MIG_EAST + 0.1, 0.1, MIG_DOOR_Z]} m={m.steel} />
      {/* one slice of GPU per room: a small machine with a row of lamps, brighter when the room is in use */}
      {[-0.9, 0, 0.9].map((dx) => (
        <group key={`g${dx}`}>
          <Slab size={[0.52, 0.34, 0.3]} position={[x + dx, 0.08, z - d / 2 + 0.3]} m={m.dark} />
          {[-0.15, 0, 0.15].map((lx) => (
            <Slab key={lx} size={[0.06, 0.05, 0.02]} position={[x + dx + lx, 0.26, z - d / 2 + 0.46]} m={on ? m.hot : m.idle} />
          ))}
          <Slab size={[0.4, 0.02, 0.02]} position={[x + dx, 0.14, z - d / 2 + 0.46]} m={m.steel} />
        </group>
      ))}
      {/* outer walls (low), then the two inner walls that make three rooms */}
      <Slab size={[w, h, 0.08]} position={[x, 0.04, z - d / 2 + 0.04]} m={m.wall} />
      <Slab size={[w, h, 0.08]} position={[x, 0.04, f - 0.04]} m={m.wall} />
      <Slab size={[0.08, h, d]} position={[x - w / 2 + 0.04, 0.04, z]} m={m.wall} />
      <Slab size={[0.08, h, d]} position={[x + w / 2 - 0.04, 0.04, z]} m={m.wall} />
      {[-0.45, 0.45].map((dx) => (
        <Slab key={dx} size={[0.08, h + 0.2, d]} position={[x + dx, 0.04, z]} m={m.steel} />
      ))}
      {/* room floors light up when the room is in use */}
      {[-0.9, 0, 0.9].map((dx) => (
        <Slab key={dx} size={[0.7, 0.03, d - 0.2]} position={[x + dx, 0.08, z]} m={on ? m.storage : m.floor} />
      ))}
      {/* three separate roof panels hover over the back of each room, so the front stays open to look into */}
      {[-0.9, 0, 0.9].map((dx, k) => (
        <Box key={dx} size={[0.78, 0.06, 0.8]} position={[x + dx, h + 0.35, z - 0.5]} color={k === 1 ? 'hall' : k === 0 ? 'network' : 'coolant'} round={0.3} />
      ))}
      <Workers spots={MIG_WORKERS} busy={on ? 1 : 0} y={0.1} />
      <Slab size={[w, 0.24, 0.02]} position={[x, h - 0.28, f + 0.004]} m={m.glass} />
    </Selectable>
  );
}

/** One lit door at a time: the three doors take turns when the hall is time-sliced. */
function ShiftDoors({ rotate }: { rotate: boolean }) {
  const m = useMats();
  const { reducedMotion } = useSceneInteraction();
  const lit = useRef<Mesh[]>([]);
  useFrame(({ clock }) => {
    const cur = rotate ? (reducedMotion ? 0 : Math.floor(clock.elapsedTime / 1.2) % 3) : -1;
    lit.current.forEach((mesh, k) => {
      if (mesh) mesh.visible = k === cur;
    });
  });
  const { x, z, d } = SHIFT_HALL;
  const f = z + d / 2;
  return (
    <>
      {[-0.85, 0, 0.85].map((dx, k) => (
        <group key={dx}>
          <Slab size={[0.55, 0.72, 0.03]} position={[x + dx, 0, f + 0.008]} m={m.dark} />
          <mesh ref={(o) => { if (o) lit.current[k] = o; }} material={m.hot} position={[x + dx, 0.38, f + 0.03]} visible={false}>
            <boxGeometry args={[0.45, 0.62, 0.02]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** The shift-scheduled hall (time-slicing): one big floor, three queues, a clock on the front and three doors lit in turn. Rental booths beside it light up for vGPU. */
function ShiftHall({ mode }: { mode: GpuSharing }) {
  const m = useMats();
  const hand = useRef<Mesh>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    if (hand.current) hand.current.rotation.z = reducedMotion ? 0.6 : -clock.elapsedTime * 1.2;
  });
  const { x, z, w, d, h } = SHIFT_HALL;
  const f = z + d / 2;
  const slice = mode === 'time-slicing' || mode === 'vgpu';
  return (
    <Selectable id="shift-hall" position={[0, HILL_Y, 0]}>
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[w + 0.24, 0.12, d + 0.24]} position={[x, h, z]} color="hall" round={0.25} />
      {/* skylight and the clock above the doors */}
      <Slab size={[1.4, 0.05, 1.2]} position={[x - 0.1, h + 0.12, z - 0.2]} m={m.glass} />
      <mesh material={m.stripe} position={[x, h + 0.55, f - 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.06, 24]} />
      </mesh>
      <mesh ref={hand} material={m.dark} position={[x, h + 0.55, f - 0.01]}>
        <boxGeometry args={[0.04, 0.26, 0.02]} />
      </mesh>
      <Slab size={[0.06, 0.14, 0.02]} position={[x, h + 0.5, f - 0.01]} m={m.dark} />
      <Slab size={[0.04, 0.3, 0.04]} position={[x, h + 0.12, f - 0.05]} m={m.steel} />
      {/* roof vents */}
      {[0.5, 0.85].map((vx) => (
        <mesh key={vx} material={m.steel} position={[x + vx, h + 0.26, z + 0.7]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.28, 12]} />
        </mesh>
      ))}
      {/* three doors, one per job */}
      <ShiftDoors rotate={slice} />
      <Slab size={[w - 0.2, 0.24, 0.02]} position={[x, h - 0.28, f + 0.004]} m={m.glass} />
      <Workers spots={SHIFT_WORKERS} busy={slice ? 0.5 : 0} y={0.04} />
      {/* the two east doors: tickets come in at one, containers at the other */}
      <Slab size={[0.04, 0.6, 0.5]} position={[SHIFT_EAST + 0.005, 0, TICKET_DOOR_Z]} m={m.dark} />
      <Slab size={[0.04, 0.6, 0.5]} position={[SHIFT_EAST + 0.005, 0, BOX_DOOR_Z]} m={m.dark} />
      <Slab size={[0.06, 0.06, 0.56]} position={[SHIFT_EAST + 0.01, 0.6, TICKET_DOOR_Z]} m={m.network} />
      <Slab size={[0.06, 0.06, 0.56]} position={[SHIFT_EAST + 0.01, 0.6, BOX_DOOR_Z]} m={m.storage} />
      {/* rented booths between the halls: lit and handed out in vGPU mode */}
      {[-0.8, 0, 0.8].map((dx, k) => (
        <group key={k} position={[x + dx, 0, -8.5]}>
          <Box size={[0.44, 0.46, 0.44]} position={[0, 0, 0]} color="wall" round={0.1} />
          <Box size={[0.54, 0.06, 0.54]} position={[0, 0.46, 0]} color={mode === 'vgpu' ? 'hall' : 'idle'} round={0.3} />
          <Slab size={[0.28, 0.18, 0.02]} position={[0, 0.16, 0.23]} m={mode === 'vgpu' ? m.hot : m.glass} />
          <Slab size={[0.02, 0.18, 0.28]} position={[0.23, 0.16, 0]} m={mode === 'vgpu' ? m.hot : m.glass} />
        </group>
      ))}
    </Selectable>
  );
}

/** The container yard (Kubernetes): rows of stacked containers and a gantry crane that keeps moving one of them. */
function ContainerYard() {
  const m = useMats();
  const crane = useRef<Group>(null);
  const hook = useRef<Group>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    const t = reducedMotion ? 0.4 : clock.elapsedTime;
    if (crane.current) crane.current.position.x = YARD.x + Math.sin(t * 0.5) * 1.5;
    if (hook.current) hook.current.position.y = 1.0 + 0.45 * Math.sin(t * 1.5);
  });
  const { x, z, w, d } = YARD;
  const stacks: [number, number, number][] = [
    [-1.8, -0.5, 2], [-1.2, -0.5, 1], [-0.6, -0.5, 3], [0.6, -0.5, 2], [1.2, -0.5, 1], [1.8, -0.5, 2],
    [-1.8, 0.5, 1], [-1.2, 0.5, 2], [0.0, 0.5, 1], [0.6, 0.5, 2], [1.8, 0.5, 3],
  ];
  return (
    <Selectable id="container-yard">
      <Lane pts={paths.boxGround} w={0.4} />
      <Lane pts={paths.boxHill} y={HILL_Y} w={0.4} />
      <Lane pts={paths.report} w={0.3} />
      {/* the ramp that lifts the container belt onto the hill */}
      <mesh material={m.belt} position={[RAMP.x, HILL_Y / 2, (RAMP.zFrom + RAMP.zTo) / 2]} rotation={[Math.asin(HILL_Y / RAMP_LEN), 0, 0]} receiveShadow>
        <boxGeometry args={[0.4, 0.05, RAMP_LEN]} />
      </mesh>
      {/* gatehouse with a barrier at the east gate, where the status belt leaves */}
      <Box size={[0.4, 0.4, 0.4]} position={[x + w / 2 - 0.4, 0.06, z + d / 2 - 0.3]} color="wall" round={0.1} />
      <Box size={[0.5, 0.05, 0.5]} position={[x + w / 2 - 0.4, 0.46, z + d / 2 - 0.3]} color="roof" round={0.3} />
      <Slab size={[0.5, 0.04, 0.04]} position={[x + w / 2 - 0.7, 0.3, z + d / 2 - 0.62]} m={m.hot} />
      {/* loading bay where containers leave the yard */}
      <Slab size={[0.6, 0.1, 0.6]} position={[-14.7, 0.06, -15.2]} m={m.steel} />
      <Box size={[w, 0.06, d]} position={[x, 0, z]} color="path" round={0.25} />
      {stacks.map(([dx, dz, n], i) =>
        Array.from({ length: n }, (_, l) => (
          <group key={`${i}${l}`}>
            <Slab size={[0.5, 0.26, 0.38]} position={[x + dx, 0.06 + l * 0.27, z + dz]} m={m.cont[(i + l) % 5]} />
            {/* ribs along the front and door bars on the end, so each box reads as a shipping container */}
            {[-0.15, -0.05, 0.05, 0.15].map((rx) => (
              <Slab key={rx} size={[0.02, 0.22, 0.01]} position={[x + dx + rx, 0.08 + l * 0.27, z + dz + 0.195]} m={m.dark} />
            ))}
            <Slab size={[0.01, 0.2, 0.12]} position={[x + dx + 0.255, 0.09 + l * 0.27, z + dz]} m={m.steel} />
          </group>
        )),
      )}
      {/* the gantry: two legs on rails, a beam, and a trolley with a hanging container */}
      <group ref={crane} position={[x, 0, z]}>
        {[-0.95, 0.95].map((dz) => (
          <group key={dz}>
            <Slab size={[0.1, 1.6, 0.1]} position={[0, 0.06, dz]} m={m.steel} />
            <Slab size={[0.5, 0.06, 0.12]} position={[0, 0.06, dz]} m={m.dark} />
          </group>
        ))}
        <Slab size={[0.16, 0.14, 2.1]} position={[0, 1.6, 0]} m={m.hot} />
        <group ref={hook} position={[0, 1.0, 0.05]}>
          <Slab size={[0.02, 0.5, 0.02]} position={[0, 0.3, 0]} m={m.dark} />
          <Slab size={[0.5, 0.26, 0.38]} position={[0, 0, 0]} m={m.cont[2]} />
        </group>
      </group>
      {[-1.6, 1.6].map((dz) => (
        <Slab key={dz} size={[w - 0.4, 0.03, 0.05]} position={[x, 0.06, z + dz * 0.6]} m={m.dark} />
      ))}
    </Selectable>
  );
}

/** The cluster manager (Base Command Manager): a small office with a wall of status screens and a dish on the roof. */
function ClusterManager() {
  const m = useMats();
  const dish = useRef<Group>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    if (dish.current && !reducedMotion) dish.current.rotation.y = -clock.elapsedTime * 0.6;
  });
  const { x, z, w, d, h } = MANAGER;
  const f = z + d / 2;
  return (
    <Selectable id="cluster-manager">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[w + 0.2, 0.1, d + 0.2]} position={[x, h, z]} color="network" round={0.25} />
      {/* a wall of status tiles on the south face: most are healthy, one is not */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <Slab key={`${r}${c}`} size={[0.26, 0.2, 0.03]} position={[x - 0.51 + c * 0.34, 0.65 + r * 0.26, f + 0.01]} m={r === 1 && c === 2 ? m.hot : m.glass} />
        )),
      )}
      <Slab size={[0.4, 0.55, 0.03]} position={[x + 0.55, 0, f + 0.008]} m={m.dark} />
      {/* hatch where the yard's status reports arrive, on the east face */}
      <Slab size={[0.04, 0.4, 0.5]} position={[x + w / 2 + 0.005, 0.02, -10.5]} m={m.dark} />
      <group ref={dish} position={[x, h + 0.1, z]}>
        <mesh material={m.steel} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
        </mesh>
        <mesh material={m.steel} position={[0.12, 0.46, 0]} rotation={[0, 0, -0.9]} castShadow>
          <coneGeometry args={[0.3, 0.16, 16, 1, true]} />
        </mesh>
      </group>
    </Selectable>
  );
}

/**
 * District 7: the control tower and the things it watches over. The tower shows two bars: GPU utilization (always full once any job runs)
 * and SM activity (what the sharing mode actually fills). The dispatcher hands tickets to a partitioned hall and a shift hall;
 * Kubernetes cranes shuffle containers in the yard; the cluster manager keeps the status wall.
 */
export function ControlRoom({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const sharing = useFactoryStore((s) => s.shareSim.sharing);
  const objects = useMemo(() => itemsInZone('control-room').filter((i) => i.kind === 'object'), []);
  const r = simulate({ sharing });
  const speed = (v: number) => (reducedMotion ? 0 : v);
  return (
    <>
      <Box size={[TERRACE.w, HILL_Y, TERRACE.d]} position={[TERRACE.x, 0, TERRACE.z]} hex={derived.foliageLight} round={0.35} roughness={0.95} />
      <ControlTower sm={r.smActivity} />
      <DispatcherDesk />
      <PartitionedHall on={sharing === 'mig'} />
      <ShiftHall mode={sharing} />
      <ContainerYard />
      <ClusterManager />
      <Parcels path={paths.mig} count={3} speed={speed(0.4)} y={HILL_Y + 0.05} size={0.14} tint={scene.network} />
      <Parcels path={paths.shift} count={4} speed={speed(0.6)} y={HILL_Y + 0.05} size={0.14} tint={scene.storage} />
      <Parcels path={paths.boxGround} count={2} speed={speed(0.5)} y={0.05} size={0.26} tint={scene.coolant} />
      <Parcels path={paths.boxHill} count={4} speed={speed(0.7)} y={HILL_Y + 0.05} size={0.26} tint={scene.coolant} />
      <Parcels path={paths.report} count={3} speed={speed(0.5)} y={0.05} size={0.14} tint={scene.parcelHot} />
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
