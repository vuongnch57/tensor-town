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
import { Lane as KitLane, mat, mix, Slab } from '../kit';
import { IT_RANGE, simulate } from './sim';
import { AIR, anchors, CHILL, LIQ, METER, paths, RACK, SUB } from './layout';

/** Every Selectable gets its own materials, so selecting one object never tints another. */
const useMats = () =>
  useMemo(
    () => ({
      wall: mat(scene.wall),
      roof: mat(scene.roof),
      dark: mat(derived.darkTrim),
      glass: mat(scene.coolant, 0.4),
      cool: mat(scene.coolant, 0.5),
      hall: mat(scene.hall),
      network: mat(scene.network),
      storage: mat(scene.storage),
      idle: mat(scene.idle),
      pin: mat(scene.parcel),
      hot: mat(scene.parcelHot, 0.5),
      steel: mat(mix(scene.roof, '#ffffff', 0.35), 0.5),
      belt: mat(mix(scene.path, scene.roof, 0.45)),
      stripe: mat(mix(scene.hall, '#ffffff', 0.35)),
      floor: mat(mix(scene.path, scene.wall, 0.4)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

const MAX_WISPS = 8;

/** Rising puffs of warm air. `level` (0 to 1) decides how many are in the air. They loop upward and shrink away. */
function Wisps({ x, y, z, spread, level, rise = 1.0 }: { x: number; y: number; z: number; spread: number; level: number; rise?: number }) {
  const m = useMats();
  const refs = useRef<Mesh[]>([]);
  const { reducedMotion } = useSceneInteraction();
  const shown = Math.round(level * MAX_WISPS);
  useFrame(({ clock }) => {
    const t = reducedMotion ? 0.5 : clock.elapsedTime * 0.35;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.visible = i < shown;
      const u = (t + i / MAX_WISPS) % 1;
      const s = Math.sin(Math.PI * u);
      mesh.position.set(x + Math.sin(i * 2.1) * spread * 0.5 + Math.sin(u * 5 + i) * 0.04, y + u * rise, z + Math.cos(i * 1.7) * spread * 0.5);
      mesh.scale.setScalar(0.05 + 0.9 * s);
    });
  });
  return (
    <>
      {Array.from({ length: MAX_WISPS }, (_, i) => (
        <mesh key={i} ref={(o) => { if (o) refs.current[i] = o; }} material={m.hot} visible={false}>
          <sphereGeometry args={[0.1, 10, 8]} />
        </mesh>
      ))}
    </>
  );
}

/** A roof fan: round housing with spinning blades. */
function Fan({ x, y, z, r = 0.3, speed = 6 }: { x: number; y: number; z: number; r?: number; speed?: number }) {
  const m = useMats();
  const blades = useRef<Group>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame((_, dt) => {
    if (blades.current && !reducedMotion) blades.current.rotation.y += dt * speed;
  });
  return (
    <group position={[x, y, z]}>
      <mesh material={m.steel} castShadow>
        <cylinderGeometry args={[r, r * 1.05, 0.14, 20]} />
      </mesh>
      <mesh material={m.dark} position={[0, 0.075, 0]}>
        <cylinderGeometry args={[r * 0.85, r * 0.85, 0.02, 20]} />
      </mesh>
      <group ref={blades} position={[0, 0.1, 0]}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} material={m.pin} rotation={[0, (k * Math.PI * 2) / 3, 0]} position={[0, 0, 0]}>
            <boxGeometry args={[r * 1.5, 0.02, r * 0.28]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Light beacon that marks the hall the picked rack density calls for. */
function Beacon({ on, x, y, z }: { on: boolean; x: number; y: number; z: number }) {
  const ref = useRef<Mesh>(null);
  const m = useMats();
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(on ? 1 + (reducedMotion ? 0 : 0.18 * Math.sin(clock.elapsedTime * 4)) : 0.0001);
  });
  return (
    <group position={[x, y, z]}>
      <Slab size={[0.04, 0.5, 0.04]} position={[0, 0, 0]} m={on ? m.hot : m.idle} />
      <mesh ref={ref} material={m.hot} position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.16, 14, 10]} />
      </mesh>
    </group>
  );
}

/** Wrapper so each lane uses the Selectable's own materials: a dark belt with hot rails for power, a plain belt with cool rails for coolant. */
function Lane({ pts, kind, w = 0.2 }: { pts: readonly (readonly [number, number])[]; kind: 'power' | 'coolant'; w?: number }) {
  const m = useMats();
  return <KitLane pts={pts} w={w} belt={kind === 'power' ? m.dark : m.belt} rail={kind === 'power' ? m.hot : m.cool} />;
}

/** The substation: a fenced yard with two transformers, a gantry of insulators and a control kiosk. Power leaves along the lanes and the town cable. */
function Substation() {
  const m = useMats();
  const { x, z, w, d } = SUB;
  const fz = z + d / 2;
  return (
    <Selectable id="substation">
      <Box size={[w, 0.06, d]} position={[x, 0, z]} color="path" round={0.25} />
      {/* fence along the front and east sides */}
      <Slab size={[w, 0.2, 0.03]} position={[x, 0.06, fz - 0.02]} m={m.steel} />
      <Slab size={[0.03, 0.2, d]} position={[x + w / 2 - 0.02, 0.06, z]} m={m.steel} />
      {/* two transformers with fins and bushings */}
      {[-0.4, 0.4].map((dz) => (
        <group key={dz}>
          <Box size={[0.7, 0.5, 0.5]} position={[x - 0.1, 0.06, z + dz - 0.1]} color="roof" round={0.1} />
          {[0, 1, 2, 3].map((k) => (
            <Slab key={k} size={[0.02, 0.4, 0.46]} position={[x + 0.26 + k * 0.04, 0.1, z + dz - 0.1]} m={m.steel} />
          ))}
          {[-0.2, 0, 0.2].map((bx) => (
            <mesh key={bx} material={m.pin} position={[x - 0.1 + bx, 0.72, z + dz - 0.1]} castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.28, 10]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* gantry: two posts and a beam carrying three insulators, then a wire to the town cable */}
      {[-0.7, 0.7].map((dz) => (
        <Slab key={dz} size={[0.06, 1.4, 0.06]} position={[x + 0.62, 0.06, z + dz]} m={m.steel} />
      ))}
      <Slab size={[0.08, 0.08, 1.5]} position={[x + 0.62, 1.4, z]} m={m.dark} />
      {[-0.4, 0, 0.4].map((dz) => (
        <mesh key={dz} material={m.hot} position={[x + 0.62, 1.28, z + dz]}>
          <sphereGeometry args={[0.06, 10, 8]} />
        </mesh>
      ))}
      <Slab size={[0.5, 0.02, 0.02]} position={[x + 0.62 + 0.25, 1.44, z + 0.4]} m={m.dark} />
      {/* control kiosk */}
      <Box size={[0.4, 0.4, 0.4]} position={[x - 0.55, 0.06, fz - 0.4]} color="wall" round={0.1} />
      <Box size={[0.5, 0.05, 0.5]} position={[x - 0.55, 0.46, fz - 0.4]} color="network" round={0.3} />
      <Lane pts={paths.powerDown} kind="power" />
      <Lane pts={paths.powerRow} kind="power" />
      <Lane pts={paths.powerLiq} kind="power" />
      <Lane pts={paths.powerAir} kind="power" />
    </Selectable>
  );
}

/** The GPU rack: a tall cabinet of servers. LEDs light up and warm air rises from it the denser the rack is. */
function GpuRack({ heat }: { heat: number }) {
  const m = useMats();
  const { x, z, w, d, h } = RACK;
  const fz = z + d / 2;
  const lit = Math.round(heat * 7) + 1;
  return (
    <Selectable id="gpu-rack">
      <Box size={[w + 0.2, 0.1, d + 0.2]} position={[x, 0, z]} color="path" round={0.3} />
      <Box size={[w, h, d]} position={[x, 0.1, z]} color="roof" round={0.05} />
      <Box size={[w + 0.08, 0.06, d + 0.08]} position={[x, h + 0.1, z]} color="network" round={0.3} />
      {Array.from({ length: 8 }, (_, k) => (
        <group key={k}>
          <Slab size={[w - 0.14, 0.12, 0.03]} position={[x, 0.2 + k * 0.19, fz + 0.012]} m={m.dark} />
          <Slab size={[0.06, 0.04, 0.02]} position={[x + w / 2 - 0.14, 0.24 + k * 0.19, fz + 0.04]} m={k < lit ? m.hot : m.idle} />
          <Slab size={[0.32, 0.02, 0.02]} position={[x - 0.1, 0.25 + k * 0.19, fz + 0.04]} m={m.steel} />
        </group>
      ))}
      <Slab size={[0.5, 0.06, 0.16]} position={[x, h + 0.16, z]} m={m.steel} />
      <Wisps x={x} y={h + 0.3} z={z} spread={0.5} level={heat} rise={1.1} />
    </Selectable>
  );
}

/** The air-cooled hall: fans on the roof and louvres on the wall. The denser the racks, the more warm air has to be carried out. */
function AirHall({ heat, recommended }: { heat: number; recommended: boolean }) {
  const m = useMats();
  const { x, z, w, d, h } = AIR;
  const fz = z + d / 2;
  const fx = x + w / 2;
  return (
    <Selectable id="air-cooled-hall">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[w + 0.24, 0.12, d + 0.24]} position={[x, h, z]} color="hall" round={0.25} />
      {[-0.8, 0, 0.8].map((dx) => (
        <Fan key={dx} x={x + dx} y={h + 0.2} z={z - 0.3} r={0.3} speed={4 + heat * 10} />
      ))}
      {/* louvres on the south face, and a cold-air intake on the east face */}
      {[0, 1, 2, 3, 4].map((k) => (
        <Slab key={k} size={[1.3, 0.04, 0.05]} position={[x - 0.5, 0.55 + k * 0.1, fz + 0.02]} m={m.steel} />
      ))}
      <Slab size={[1.3, 0.5, 0.02]} position={[x - 0.5, 0.5, fz + 0.006]} m={m.dark} />
      <Slab size={[0.5, 0.9, 0.03]} position={[x + 0.8, 0, fz + 0.008]} m={m.dark} />
      {[0, 1, 2].map((k) => (
        <Slab key={k} size={[0.04, 0.05, 1.6]} position={[fx + 0.02, 0.5 + k * 0.14, z]} m={m.steel} />
      ))}
      <Slab size={[0.02, 0.5, 1.6]} position={[fx + 0.006, 0.45, z]} m={m.glass} />
      <Wisps x={x} y={h + 0.4} z={z - 0.3} spread={1.8} level={heat} rise={1.2} />
      <Beacon on={recommended} x={x - 1.1} y={h + 0.12} z={z + 1.0} />
    </Selectable>
  );
}

/** The liquid cooling loop: pipes run to the racks inside, a pump and a manifold on the roof. Coolant goes in blue and comes back warm. */
function LiquidHall({ recommended }: { recommended: boolean }) {
  const m = useMats();
  const { x, z, w, d, h } = LIQ;
  const fz = z + d / 2;
  const fx = x + w / 2;
  return (
    <Selectable id="liquid-loop">
      <Box size={[w, h, d]} position={[x, 0, z]} color="wall" round={0.05} />
      <Box size={[w + 0.24, 0.12, d + 0.24]} position={[x, h, z]} color="coolant" round={0.25} />
      {/* roof manifold: a supply pipe (blue) and a return pipe (warm) with a pump */}
      {[{ dz: -0.3, mm: m.cool }, { dz: 0.2, mm: m.hot }].map(({ dz, mm }) => (
        <mesh key={dz} material={mm} position={[x, h + 0.3, z + dz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, w - 0.5, 12]} />
        </mesh>
      ))}
      <mesh material={m.steel} position={[x + 0.8, h + 0.3, z - 0.05]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
      </mesh>
      <mesh material={m.dark} position={[x + 0.8, h + 0.6, z - 0.05]}>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 16]} />
      </mesh>
      {[-0.3, 0.2].map((dz) => (
        <Slab key={dz} size={[0.1, 0.3, 0.1]} position={[x - 0.9, h + 0.1, z + dz]} m={m.steel} />
      ))}
      {/* a window onto a row of racks with their cold plates and tubes */}
      <Slab size={[2.0, 0.8, 0.02]} position={[x - 0.2, 0.4, fz + 0.006]} m={m.dark} />
      {[-0.7, -0.35, 0, 0.35, 0.7].map((dx) => (
        <group key={dx}>
          <Slab size={[0.26, 0.64, 0.03]} position={[x - 0.2 + dx, 0.46, fz + 0.03]} m={m.network} />
          <Slab size={[0.04, 0.64, 0.04]} position={[x - 0.2 + dx + 0.08, 0.46, fz + 0.05]} m={m.cool} />
          <Slab size={[0.04, 0.64, 0.04]} position={[x - 0.2 + dx - 0.08, 0.46, fz + 0.05]} m={m.hot} />
        </group>
      ))}
      <Slab size={[0.4, 0.9, 0.03]} position={[x + 1.0, 0, fz + 0.008]} m={m.dark} />
      {/* pipes down the east wall to the ground */}
      {[0.2, -0.2].map((dz, k) => (
        <mesh key={dz} material={k ? m.hot : m.cool} position={[fx + 0.08, h / 2, z + dz]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, h, 10]} />
        </mesh>
      ))}
      <Lane pts={paths.coolBack} kind="coolant" w={0.18} />
      <Beacon on={recommended} x={x + 1.2} y={h + 0.12} z={z + 1.0} />
    </Selectable>
  );
}

/** The chillers: three drums with fans on top. They cool the coolant that the loop sends back, and feed the air hall's coolers. */
function Chillers() {
  const m = useMats();
  const { x, z, w, d } = CHILL;
  const fz = z + d / 2;
  return (
    <Selectable id="chillers">
      <Box size={[w, 0.12, d]} position={[x, 0, z]} color="path" round={0.25} />
      {[-0.75, 0, 0.75].map((dx) => (
        <group key={dx}>
          <mesh material={m.cool} position={[x + dx, 0.12 + 0.34, z]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.68, 20]} />
          </mesh>
          <mesh material={m.steel} position={[x + dx, 0.84, z]}>
            <cylinderGeometry args={[0.38, 0.38, 0.05, 20]} />
          </mesh>
          <Fan x={x + dx} y={0.9} z={z} r={0.28} speed={7} />
        </group>
      ))}
      {/* grille band and a pump skid in front */}
      {[0, 1, 2].map((k) => (
        <Slab key={k} size={[w - 0.3, 0.03, 0.03]} position={[x, 0.3 + k * 0.14, fz - 0.14]} m={m.steel} />
      ))}
      <Slab size={[0.5, 0.2, 0.3]} position={[x, 0.12, fz - 0.05]} m={m.dark} />
      <Lane pts={paths.coolMain} kind="coolant" w={0.18} />
      <Lane pts={paths.coolLiq} kind="coolant" w={0.18} />
      <Lane pts={paths.coolAir} kind="coolant" w={0.18} />
    </Selectable>
  );
}

/** The PUE meter: a dial whose needle shows total facility power over IT power, and two bars for the two powers. */
function PueMeter({ pue, itMW, facilityMW }: { pue: number; itMW: number; facilityMW: number }) {
  const m = useMats();
  const needle = useRef<Group>(null);
  const itBar = useRef<Mesh>(null);
  const facBar = useRef<Mesh>(null);
  const now = useRef({ pue, it: itMW, fac: facilityMW });
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 6);
    const c = now.current;
    c.pue += (pue - c.pue) * k;
    c.it += (itMW - c.it) * k;
    c.fac += (facilityMW - c.fac) * k;
    // 1.0 (perfect) sits at the left, 2.0 or more at the right
    const t = Math.min(1, Math.max(0, c.pue - 1));
    if (needle.current) needle.current.rotation.z = Math.PI * 0.42 - t * Math.PI * 0.84;
    const bar = (mesh: Mesh | null, mw: number) => {
      if (!mesh) return;
      const hgt = Math.max(0.03, (mw / IT_RANGE.max) * 0.7);
      mesh.scale.y = hgt;
      mesh.position.y = hgt / 2;
    };
    bar(itBar.current, c.it);
    bar(facBar.current, c.fac);
  });
  const { x, z, w, d } = METER;
  const fz = z + d / 2;
  return (
    <Selectable id="pue-meter">
      <Slab size={[0.12, 0.35, 0.12]} position={[x - 0.5, 0, z]} m={m.steel} />
      <Slab size={[0.12, 0.35, 0.12]} position={[x + 0.5, 0, z]} m={m.steel} />
      <Box size={[w, 0.85, d]} position={[x, 0.3, z]} color="wall" round={0.06} />
      <Box size={[w + 0.12, 0.06, d + 0.1]} position={[x, 1.15, z]} color="network" round={0.3} />
      {/* the dial */}
      <mesh material={m.dark} position={[x - 0.45, 0.62, fz + 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.03, 28]} />
      </mesh>
      <mesh material={m.stripe} position={[x - 0.45, 0.62, fz + 0.035]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 28]} />
      </mesh>
      {[0, 1, 2, 3, 4].map((k) => {
        const a = Math.PI * 0.42 - (k / 4) * Math.PI * 0.84;
        return <Slab key={k} size={[0.025, 0.07, 0.01]} position={[x - 0.45 + Math.sin(-a) * 0.25, 0.62 + Math.cos(a) * 0.25 - 0.035, fz + 0.05]} m={k > 2 ? m.hot : m.network} rot={0} />;
      })}
      <group ref={needle} position={[x - 0.45, 0.62, fz + 0.06]}>
        <mesh material={m.dark} position={[0, 0.12, 0]}>
          <boxGeometry args={[0.03, 0.26, 0.015]} />
        </mesh>
      </group>
      <mesh material={m.hot} position={[x - 0.45, 0.62, fz + 0.07]}>
        <sphereGeometry args={[0.04, 10, 8]} />
      </mesh>
      {/* two bars: IT power (blue) and total facility power (warm) */}
      <Slab size={[0.5, 0.74, 0.02]} position={[x + 0.5, 0.4, fz + 0.012]} m={m.dark} />
      <group position={[x + 0.4, 0.4, fz + 0.04]}>
        <mesh ref={itBar} material={m.network}>
          <boxGeometry args={[0.16, 1, 0.03]} />
        </mesh>
      </group>
      <group position={[x + 0.6, 0.4, fz + 0.04]}>
        <mesh ref={facBar} material={m.hot}>
          <boxGeometry args={[0.16, 1, 0.03]} />
        </mesh>
      </group>
    </Selectable>
  );
}

/**
 * District 8: the power station and its cooling plant. The substation feeds the chillers and both halls (hot dots); coolant (blue dots) runs from the
 * chillers to the halls. The rack density decides which hall is the right one (a beacon marks it) and how much warm air the air hall has to carry out.
 * The PUE meter shows facility power over IT power.
 */
export function PowerCooling({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const { density, itMW, facilityMW } = useFactoryStore((s) => s.powerSim);
  const objects = useMemo(() => itemsInZone('power-cooling').filter((i) => i.kind === 'object'), []);
  const r = simulate({ density, itMW, facilityMW });
  const speed = (v: number) => (reducedMotion ? 0 : v);
  return (
    <>
      <Substation />
      <GpuRack heat={r.heat} />
      <AirHall heat={r.heat} recommended={r.cooling === 'air'} />
      <LiquidHall recommended={r.cooling === 'liquid'} />
      <Chillers />
      <PueMeter pue={r.pue} itMW={itMW} facilityMW={r.facilityMW} />
      <Parcels path={paths.powerDown} count={2} speed={speed(0.5)} y={0.05} size={0.12} tint={scene.parcelHot} />
      <Parcels path={paths.powerRow} count={4} speed={speed(0.7)} y={0.05} size={0.12} tint={scene.parcelHot} />
      <Parcels path={paths.powerLiq} count={1} speed={speed(0.4)} y={0.05} size={0.12} tint={scene.parcelHot} />
      <Parcels path={paths.powerAir} count={1} speed={speed(0.4)} y={0.05} size={0.12} tint={scene.parcelHot} />
      <Parcels path={paths.coolMain} count={3} speed={speed(0.6)} y={0.05} size={0.14} tint={scene.coolant} />
      <Parcels path={paths.coolLiq} count={2} speed={speed(0.5)} y={0.05} size={0.14} tint={scene.coolant} />
      <Parcels path={paths.coolAir} count={2} speed={speed(0.5)} y={0.05} size={0.14} tint={scene.coolant} />
      <Parcels path={paths.coolBack} count={2} speed={speed(0.5)} y={0.05} size={0.14} tint={scene.parcelHot} />
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
