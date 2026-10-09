import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { itemsInZone } from '@/content/registry';
import { derived } from '../../core/derived';
import { scene } from '../../core/palette';
import { Box } from '../../primitives/Box';
import { Hotspot } from '../../primitives/Hotspot';
import { Parcels } from '../../primitives/Parcels';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import type { Pt } from '@/lib/path';
import { mat, mix, Slab } from '../kit';
import { simulate } from './sim';
import { anchors, BIN, BIN_CRATES, DPU_X, GANTRY_X, LANE_X0, LANE_X1, NODE, NODE_A_X, NODE_B_X, NODE_Z, RAIL_Z, ROAD_Z } from './layout';

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
      port: mat(scene.parcel),
      led: mat(scene.coolant, 0.4),
      network: mat(scene.network),
      hall: mat(scene.hall),
      idle: mat(scene.idle),
      steel: mat(mix(scene.roof, '#ffffff', 0.35), 0.5),
      sleeper: mat(mix(scene.network, scene.roof, 0.6)),
      ballast: mat(mix(scene.wall, scene.roof, 0.2)),
      railBase: mat(mix(scene.network, scene.roof, 0.8)),
      roadBase: mat(mix(scene.ground, scene.roof, 0.85)),
      asphalt: mat(scene.path),
      line: mat(mix(scene.path, scene.roof, 0.35)),
      crate: mat(scene.parcelHot),
      bin: mat(mix(scene.roof, '#000000', 0.15)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
type Mats = ReturnType<typeof useMats>;

/** One DGX node: a server building with a roof deck, a row of network cards (ConnectX-7 ports) and, on the lane side, dock doors. */
function Node({ x, sender, m }: { x: number; sender: boolean; m: Mats }) {
  const { w, d, h } = NODE;
  const front = NODE_Z + d / 2;
  const side = x + w / 2;
  return (
    <group>
      <Box size={[w, h, d]} position={[x, 0, NODE_Z]} color="wall" round={0.06} />
      <Box size={[w + 0.24, 0.12, d + 0.24]} position={[x, h, NODE_Z]} color="network" round={0.25} />
      <Slab size={[w + 0.06, 0.05, d + 0.06]} position={[x, 0.42, NODE_Z]} m={m.band} />
      {/* roof deck: vents and a status strip */}
      {[-0.6, -0.2, 0.2, 0.6].map((dx) => (
        <Slab key={dx} size={[0.26, 0.05, 1.5]} position={[x + dx, h + 0.12, NODE_Z]} m={m.dark} />
      ))}
      <Slab size={[w * 0.9, 0.03, 0.08]} position={[x, h + 0.12, NODE_Z + d / 2 - 0.12]} m={m.led} />
      {/* network card bay on the front: panel, four port cages with link lights */}
      <Slab size={[1.7, 0.5, 0.03]} position={[x, 0.55, front + 0.005]} m={m.dark} />
      {[-0.62, -0.21, 0.21, 0.62].map((dx) => (
        <group key={dx}>
          <Slab size={[0.26, 0.2, 0.05]} position={[x + dx, 0.66, front + 0.025]} m={m.port} />
          <Slab size={[0.1, 0.04, 0.03]} position={[x + dx, 0.58, front + 0.03]} m={m.led} />
        </group>
      ))}
      {/* vent slats and a window row */}
      {[0.9, 1.0, 1.1].map((y) => (
        <Slab key={y} size={[w * 0.8, 0.04, 0.02]} position={[x, y, front + 0.005]} m={m.dark} />
      ))}
      {[-0.55, 0.55].map((dx) => (
        <Slab key={`w${dx}`} size={[0.5, 0.2, 0.02]} position={[x + dx, 1.1, front + 0.006]} m={m.glass} />
      ))}
      {/* the side facing the lanes (and, mirrored, the one facing the camera) */}
      <Slab size={[0.02, 0.3, 1.2]} position={[side + 0.005, 0.9, NODE_Z]} m={m.glass} />
      {sender &&
        [RAIL_Z, ROAD_Z].map((z) => (
          <group key={z}>
            <Slab size={[0.04, 0.62, 0.7]} position={[side + 0.01, 0, z]} m={m.dark} />
            <Slab size={[0.05, 0.05, 0.78]} position={[side + 0.02, 0.62, z]} m={m.glow} />
          </group>
        ))}
    </group>
  );
}

function DgxNodes() {
  const m = useMats();
  return (
    <Selectable id="dgx-node">
      <Node x={NODE_A_X} sender m={m} />
      <Node x={NODE_B_X} sender={false} m={m} />
    </Selectable>
  );
}

/** The DPU gatehouse: a portal straddling both lanes. Pylons with windows, a beam with a lit strip, and a chip with pins on top. */
function DpuGatehouse() {
  const m = useMats();
  const zA = RAIL_Z - 0.85;
  const zB = ROAD_Z + 0.85;
  const mid = (zA + zB) / 2;
  const span = zB - zA;
  const pins = Array.from({ length: 9 }, (_, k) => -0.56 + k * 0.14);
  return (
    <Selectable id="dpu-gatehouse">
      {[zA, zB].map((z) => (
        <group key={z}>
          <Box size={[0.8, 1.9, 0.8]} position={[DPU_X, 0, z]} color="wall" round={0.06} />
          <Slab size={[0.5, 0.34, 0.02]} position={[DPU_X, 0.5, z + (z === zB ? 0.405 : -0.405)]} m={m.glass} />
          <Slab size={[0.02, 0.34, 0.5]} position={[DPU_X + 0.405, 0.5, z]} m={m.glass} />
          <Slab size={[0.5, 0.34, 0.02]} position={[DPU_X, 1.1, z + (z === zB ? 0.405 : -0.405)]} m={m.glass} />
          <Slab size={[0.02, 0.34, 0.5]} position={[DPU_X + 0.405, 1.1, z]} m={m.glass} />
        </group>
      ))}
      <Box size={[0.9, 0.4, span + 0.9]} position={[DPU_X, 1.9, mid]} color="network" round={0.2} />
      <Slab size={[0.02, 0.06, span - 0.1]} position={[DPU_X + 0.46, 2.05, mid]} m={m.glow} />
      {/* the chip: substrate, die and pins on all four sides */}
      <Slab size={[1.0, 0.07, 1.0]} position={[DPU_X, 2.3, mid]} m={m.roof} />
      <Slab size={[0.5, 0.1, 0.5]} position={[DPU_X, 2.37, mid]} m={m.hall} />
      <Slab size={[0.26, 0.04, 0.26]} position={[DPU_X, 2.47, mid]} m={m.wall} />
      {pins.map((dp) => (
        <group key={dp}>
          <Slab size={[0.05, 0.04, 0.1]} position={[DPU_X + dp, 2.3, mid - 0.55]} m={m.steel} />
          <Slab size={[0.05, 0.04, 0.1]} position={[DPU_X + dp, 2.3, mid + 0.55]} m={m.steel} />
          <Slab size={[0.1, 0.04, 0.05]} position={[DPU_X - 0.55, 2.3, mid + dp]} m={m.steel} />
          <Slab size={[0.1, 0.04, 0.05]} position={[DPU_X + 0.55, 2.3, mid + dp]} m={m.steel} />
        </group>
      ))}
      {/* barrier arms over each lane */}
      {[RAIL_Z, ROAD_Z].map((z) => (
        <Slab key={z} size={[0.05, 0.05, 0.62]} position={[DPU_X + 0.5, 1.5, z]} m={m.glow} />
      ))}
    </Selectable>
  );
}

/** The freight rail lane: ballast, sleepers and two steel rails between the nodes. */
function RailLane() {
  const m = useMats();
  const len = LANE_X1 - LANE_X0;
  const mid = (LANE_X0 + LANE_X1) / 2;
  const sleepers = Math.floor(len / 0.28);
  return (
    <Selectable id="infiniband">
      <Slab size={[len, 0.05, 0.86]} position={[mid, 0, RAIL_Z]} m={m.railBase} />
      <Slab size={[len, 0.04, 0.66]} position={[mid, 0.05, RAIL_Z]} m={m.ballast} />
      {Array.from({ length: sleepers }, (_, k) => LANE_X0 + 0.2 + k * 0.28).map((x) => (
        <Slab key={x} size={[0.09, 0.03, 0.56]} position={[x, 0.09, RAIL_Z]} m={m.sleeper} />
      ))}
      {[-0.2, 0.2].map((dz) => (
        <Slab key={dz} size={[len, 0.05, 0.05]} position={[mid, 0.12, RAIL_Z + dz]} m={m.steel} />
      ))}
      <Slab size={[len, 0.015, 0.03]} position={[mid, 0.17, RAIL_Z]} m={m.glass} />
    </Selectable>
  );
}

/** The Ethernet road lane: kerbs, asphalt, a dashed centre line and lamp posts. */
function RoadLane() {
  const m = useMats();
  const len = LANE_X1 - LANE_X0;
  const mid = (LANE_X0 + LANE_X1) / 2;
  const dashes = Math.floor(len / 0.6);
  return (
    <Selectable id="ethernet-road">
      <Slab size={[len, 0.05, 0.96]} position={[mid, 0, ROAD_Z]} m={m.roadBase} />
      <Slab size={[len, 0.04, 0.76]} position={[mid, 0.05, ROAD_Z]} m={m.asphalt} />
      {Array.from({ length: dashes }, (_, k) => LANE_X0 + 0.35 + k * 0.6).map((x) => (
        <Slab key={x} size={[0.32, 0.015, 0.05]} position={[x, 0.09, ROAD_Z]} m={m.line} />
      ))}
      {[-1, 1].map((s) => (
        <Slab key={s} size={[len, 0.015, 0.04]} position={[mid, 0.09, ROAD_Z + s * 0.32]} m={m.line} />
      ))}
      {[-8.8, -4.6].map((x) => (
        <group key={x}>
          <Slab size={[0.06, 0.8, 0.06]} position={[x, 0, ROAD_Z + 0.62]} m={m.dark} />
          <Slab size={[0.06, 0.05, 0.3]} position={[x, 0.78, ROAD_Z + 0.5]} m={m.dark} />
          <Slab size={[0.14, 0.05, 0.14]} position={[x, 0.76, ROAD_Z + 0.34]} m={m.glow} />
        </group>
      ))}
    </Selectable>
  );
}

/**
 * The Spectrum-X control gantry: a signal gantry over the road with route signs and traffic lights, and a cabinet with a dish beside it.
 * It only runs while Spectrum-X is the picked network (lamps lit, signs glowing); otherwise it stands idle.
 */
function SpectrumControl({ on }: { on: boolean }) {
  const m = useMats();
  const z0 = ROAD_Z - 0.62;
  const z1 = ROAD_Z + 0.62;
  return (
    <Selectable id="spectrum-x-control">
      {[z0, z1].map((z) => (
        <Slab key={z} size={[0.14, 1.5, 0.14]} position={[GANTRY_X, 0, z]} m={m.dark} />
      ))}
      <Box size={[0.2, 0.2, z1 - z0 + 0.34]} position={[GANTRY_X, 1.5, ROAD_Z]} color="roof" round={0.2} />
      {/* route signs: arrows pointing along the lanes, one per lane, lit when adaptive routing is on */}
      {[-0.35, 0, 0.35].map((dz, k) => (
        <group key={dz}>
          <Slab size={[0.04, 0.22, 0.26]} position={[GANTRY_X + 0.12, 1.15, ROAD_Z + dz]} m={m.dark} />
          <Slab size={[0.045, 0.05, 0.2 - k * 0.0]} position={[GANTRY_X + 0.14, 1.23, ROAD_Z + dz]} m={on ? m.led : m.idle} />
          <Slab size={[0.045, 0.1, 0.05]} position={[GANTRY_X + 0.14, 1.18, ROAD_Z + dz + 0.05]} m={on ? m.led : m.idle} />
        </group>
      ))}
      {/* traffic lights */}
      {[z0, z1].map((z) => (
        <group key={`l${z}`}>
          <Slab size={[0.14, 0.4, 0.14]} position={[GANTRY_X + 0.02, 1.7, z]} m={m.dark} />
          <mesh position={[GANTRY_X + 0.1, 2.0, z]} material={on ? m.led : m.idle}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
          <mesh position={[GANTRY_X + 0.1, 1.85, z]} material={m.idle}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
          <mesh position={[GANTRY_X + 0.1, 1.7, z]} material={m.idle}>
            <sphereGeometry args={[0.045, 10, 8]} />
          </mesh>
        </group>
      ))}
      {/* control cabinet and dish */}
      <Box size={[0.44, 0.7, 0.36]} position={[GANTRY_X + 0.1, 0, ROAD_Z + 1.25]} color="wall" round={0.08} />
      <Slab size={[0.3, 0.04, 0.02]} position={[GANTRY_X + 0.1 + 0.001, 0.4, ROAD_Z + 1.25 + 0.19]} m={m.dark} />
      <Slab size={[0.06, 0.05, 0.02]} position={[GANTRY_X + 0.22, 0.5, ROAD_Z + 1.25 + 0.19]} m={on ? m.led : m.idle} />
      <Slab size={[0.04, 0.4, 0.04]} position={[GANTRY_X + 0.1, 0.7, ROAD_Z + 1.25]} m={m.steel} />
      <mesh position={[GANTRY_X + 0.1, 1.15, ROAD_Z + 1.25]} rotation={[0, 0, -0.7]} material={m.steel}>
        <cylinderGeometry args={[0.2, 0.04, 0.08, 14]} />
      </mesh>
    </Selectable>
  );
}

/** The lost-property bin where parcels that fell off the road end up; the crates in it and around it are the ones dropped. */
function LostBin({ count }: { count: number }) {
  const m = useMats();
  const { x, z } = BIN;
  return (
    <Selectable id="dropped-parcels">
      <Slab size={[0.86, 0.05, 0.7]} position={[x, 0, z]} m={m.dark} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Slab size={[0.04, 0.34, 0.7]} position={[x + s * 0.41, 0.05, z]} m={m.bin} />
          <Slab size={[0.86, 0.34, 0.04]} position={[x, 0.05, z + s * 0.33]} m={m.bin} />
        </group>
      ))}
      {BIN_CRATES.slice(0, count).map(([dx, dz, r], i) => (
        <Slab key={i} size={[0.22, 0.18, 0.22]} position={[x + dx, i < 4 ? 0.08 : 0.0, z + dz]} m={m.crate} rot={r} />
      ))}
    </Selectable>
  );
}

/**
 * District 4: the network yard. The network picked in Simulate decides which lane carries the crowd:
 * InfiniBand fills the rail, Ethernet and Spectrum-X fill the road. Congestion adds traffic, throughput sets its speed,
 * and the share of dropped parcels fills the lost-property bin beside the road.
 */
export function TransportNetwork({ active }: { active: boolean }) {
  const { onSelect, reducedMotion } = useSceneInteraction();
  const network = useFactoryStore((s) => s.netSim.network);
  const congestion = useFactoryStore((s) => s.netSim.congestion);
  const objects = useMemo(() => itemsInZone('transport-network').filter((i) => i.kind === 'object'), []);
  const r = simulate({ network, congestion });
  const railPath: Pt[] = useMemo(() => [[LANE_X0 + 0.05, RAIL_Z], [LANE_X1 - 0.05, RAIL_Z]], []);
  const roadPath: Pt[] = useMemo(() => [[LANE_X0 + 0.05, ROAD_Z], [LANE_X1 - 0.05, ROAD_Z]], []);
  const dropped = Math.min(BIN_CRATES.length, Math.round(r.dropped * 20));
  const crowd = 3 + Math.round(congestion * 5);
  const base = 1.1;
  const railBusy = network === 'infiniband';
  const speed = (busy: boolean) => (reducedMotion ? 0 : busy ? base * r.throughput : base * 0.45);
  return (
    <>
      <DgxNodes />
      <RailLane />
      <RoadLane />
      <DpuGatehouse />
      <SpectrumControl on={network === 'spectrumx'} />
      <LostBin count={dropped} />
      <Parcels path={railPath} count={railBusy ? crowd : 2} speed={speed(railBusy)} y={0.13} size={0.34} tint={scene.network} />
      <Parcels path={roadPath} count={railBusy ? 2 : crowd} speed={speed(!railBusy)} y={0.09} size={0.34} hot={network === 'ethernet' && r.dropped > 0.15} />
      {active && objects.map((o) => <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />)}
    </>
  );
}
