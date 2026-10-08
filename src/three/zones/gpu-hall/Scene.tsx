import { useMemo } from 'react';
import type { Pt } from '@/lib/path';
import { itemsInZone } from '@/content/registry';
import { useFactoryStore } from '@/state/useFactoryStore';
import { Ground } from '../../core/Ground';
import { derived } from '../../core/derived';
import { Box } from '../../primitives/Box';
import { Conveyor } from '../../primitives/Conveyor';
import { Hotspot } from '../../primitives/Hotspot';
import { Parcels } from '../../primitives/Parcels';
import { Path } from '../../primitives/Path';
import { Crates, Fence, Lamps, Trees } from '../../primitives/Props';
import { Selectable, useSceneInteraction } from '../../primitives/Selectable';
import { Workers } from '../../primitives/Workers';
import { anchors } from './anchors';
import { CpuOffice } from './CpuOffice';
import { HallShell, SmCells, StampingPress, WORKER_SPOTS } from './GpuHall';
import { HbmWarehouse } from './HbmWarehouse';
import { simulate } from './sim';

const DATA_ROAD: Pt[] = [[-10.2, 5.6], [-1.0, 5.6], [-1.0, 3.6]];
const CPU_WALK: Pt[] = [[-5.6, -4.0], [-5.6, -2.0], [-3.7, -2.0]];

const TREES = [
  [-9.5, -6.5, 1.2], [-9.8, -3.0, 1], [-8.2, -1.2, 0.9], [-9.6, 1.8, 1.1], [-3, -7.5, 1], [0.5, -7.8, 1.2],
  [4, -7.2, 0.9], [8, -6, 1.15], [10, -3.5, 1], [9.6, 5.8, 1.1], [6.5, 6.5, 0.9], [3.5, 7.6, 1.2], [-4, 8, 1], [-9, 8, 1.1],
] as const;
const LAMPS = [[-7, 4.7], [-3.8, 6.5], [4.4, 3.6], [-2.2, -3.9]] as const;
const FENCE_A: [number, number][] = [[-10.2, -8.0], [-6.8, -8.0]];
const FENCE_B: [number, number][] = [[10.2, 4.2], [10.2, 8.0], [7.4, 8.0]];
const CRATES_DEPOT = [[-8.0, 3.2], [-7.5, 3.5], [-9.3, 3.4]] as const;
const CRATES_WAREHOUSE = [[10.0, -2.8, 1], [9.5, -3.2, 0.9]] as const;

/** Zone 1: the GPU Hall diorama. */
export function GpuHallScene() {
  const sim = useFactoryStore((s) => s.sim);
  const result = useMemo(() => simulate(sim), [sim]);
  const { onSelect, reducedMotion } = useSceneInteraction();
  const objects = useMemo(() => itemsInZone('gpu-hall').filter((i) => i.kind === 'object'), []);
  const hot = result.bottleneck === 'memory';
  const beltSpeed = reducedMotion ? 0 : 0.9 * result.beltSpeed;

  return (
    <group>
      <Ground />

      {/* roads, walkways and decoration (not clickable) */}
      <Path points={DATA_ROAD} width={1.0} />
      <Path points={CPU_WALK} width={0.6} />
      <Trees spots={TREES} />
      <Lamps spots={LAMPS} />
      <Fence points={FENCE_A} />
      <Fence points={FENCE_B} />
      <Crates spots={CRATES_WAREHOUSE} stack={2} />

      {/* 1 Data: parcels on the road, a depot sign and crates */}
      <Selectable id="data">
        <Parcels path={DATA_ROAD} count={7} speed={reducedMotion ? 0 : 1.3} y={0.04} size={0.42} />
        <Box size={[0.1, 1.2, 0.1]} position={[-8.9, 0, 4.4]} hex={derived.wood} round={0.3} />
        <Box size={[0.1, 1.2, 0.1]} position={[-7.5, 0, 4.4]} hex={derived.wood} round={0.3} />
        <Box size={[1.7, 0.55, 0.1]} position={[-8.2, 0.75, 4.4]} color="hall" round={0.2} />
        <Crates spots={CRATES_DEPOT} stack={2} />
      </Selectable>

      {/* 2 CPU */}
      <Selectable id="cpu" position={[-5, 0, -5.2]}>
        <CpuOffice />
      </Selectable>

      {/* 3 GPU hall shell, 4 SM cells, 5 workers, 6 press */}
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

      {/* 7 HBM warehouse, 8 conveyor */}
      <Selectable id="hbm" position={[8.0, 0, 1.2]}>
        <HbmWarehouse />
      </Selectable>
      <Selectable id="memory-bandwidth">
        <Conveyor from={[6.2, 2.2]} to={[2.5, 2.2]} speed={beltSpeed} hot={hot} parcels={6} />
      </Selectable>

      {objects.map((o) => (
        <Hotspot key={o.id} itemId={o.id} number={o.number ?? 0} anchor={anchors[o.anchorId ?? o.id]} onSelect={onSelect} />
      ))}
    </group>
  );
}
