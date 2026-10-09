import { derived } from '../core/derived';
import { Box } from './Box';
import { Parcels } from './Parcels';
import type { Pt } from '@/lib/path';

type Props = {
  /** Start (source) and end (destination) on the ground plane, along x. Belt runs from `from` to `to`. */
  from: Pt;
  to: Pt;
  speed: number;
  hot: boolean;
  parcels?: number;
  size?: number;
  tint?: string;
};

const BELT_Y = 0.42;

/** Belt on legs with rails, carrying parcels from `from` to `to`. Belt speed is the memory bandwidth. */
export function Conveyor({ from, to, speed, hot, parcels = 6, size = 0.36, tint }: Props) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const mx = (from[0] + to[0]) / 2;
  const mz = (from[1] + to[1]) / 2;
  const rot = Math.atan2(to[0] - from[0], to[1] - from[1]);
  const path: Pt[] = [from, to];
  return (
    <group>
      <group position={[mx, 0, mz]} rotation={[0, rot, 0]}>
        <Box size={[0.8, 0.14, len]} position={[0, BELT_Y - 0.14, 0]} hex={derived.darkTrim} round={0.3} />
        {[-1, 1].map((s) => (
          <Box key={s} size={[0.07, 0.16, len]} position={[s * 0.42, BELT_Y - 0.04, 0]} color="wall" round={0.3} />
        ))}
        {[-1, 1].map((e) =>
          [-1, 1].map((s) => <Box key={`${e}${s}`} size={[0.08, BELT_Y - 0.14, 0.08]} position={[s * 0.34, 0, e * (len / 2 - 0.2)]} color="path" round={0.3} />),
        )}
      </group>
      <Parcels path={path} count={parcels} speed={speed} y={BELT_Y + 0.02} size={size} hot={hot} tint={tint} />
    </group>
  );
}
