import { scene } from '../../core/palette';
import { derived } from '../../core/derived';
import type { Pin } from '@/ui/Fallback2D';

/** Flat isometric picture of the zone for browsers without WebGL. Pin positions are % of the picture. */
export const FALLBACK_PINS: Pin[] = [
  { itemId: 'data', number: 1, label: 'Data', x: 20, y: 66 },
  { itemId: 'cpu', number: 2, label: 'CPU', x: 30, y: 20 },
  { itemId: 'gpu', number: 3, label: 'GPU', x: 46, y: 36 },
  { itemId: 'sm', number: 4, label: 'SM', x: 52, y: 50 },
  { itemId: 'cuda-core', number: 5, label: 'CUDA core', x: 42, y: 66 },
  { itemId: 'tensor-core', number: 6, label: 'Tensor Core', x: 60, y: 66 },
  { itemId: 'hbm', number: 7, label: 'HBM', x: 82, y: 40 },
  { itemId: 'memory-bandwidth', number: 8, label: 'Bandwidth', x: 71, y: 62 },
];

const K = 1.9;
const CX = 50;
const CY = 36;
const proj = (x: number, z: number, y = 0): string => `${(CX + (x - z) * K * 0.866).toFixed(1)},${(CY + ((x + z) * K) / 2 - y * K * 0.9).toFixed(1)}`;
const poly = (pts: string[], fill: string) => <polygon points={pts.join(' ')} fill={fill} stroke="rgba(0,0,0,0.06)" strokeWidth="0.15" strokeLinejoin="round" />;

/** An isometric block seen from +x +z: top, +z face, +x face. */
function Block({ x, z, w, d, h, wall, roof, y0 = 0 }: { x: number; z: number; w: number; d: number; h: number; wall: string; roof: string; y0?: number }) {
  const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
  return (
    <g>
      {poly([proj(x0, z1, y0), proj(x1, z1, y0), proj(x1, z1, y0 + h), proj(x0, z1, y0 + h)], wall)}
      {poly([proj(x1, z0, y0), proj(x1, z1, y0), proj(x1, z1, y0 + h), proj(x1, z0, y0 + h)], derived.storageRoof === wall ? wall : shadeHex(wall))}
      {poly([proj(x0, z0, y0 + h), proj(x1, z0, y0 + h), proj(x1, z1, y0 + h), proj(x0, z1, y0 + h)], roof)}
    </g>
  );
}
const shadeHex = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * 0.9);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

export function FallbackArt() {
  return (
    <g>
      {poly([proj(-11, -9, -0.6), proj(11, -9, -0.6), proj(11, 9, -0.6), proj(-11, 9, -0.6)], derived.soil)}
      {poly([proj(-11, -9), proj(11, -9), proj(11, 9), proj(-11, 9)], scene.ground)}
      {poly([proj(-10.2, 5.1), proj(-0.5, 5.1), proj(-0.5, 3.4), proj(-1.5, 3.4), proj(-1.5, 6.1), proj(-10.2, 6.1)], scene.path)}
      <Block x={-5} z={-5.2} w={2.8} d={2.2} h={1.3} wall={scene.wall} roof={scene.roof} />
      <Block x={0} z={0} w={6.6} d={6.4} h={1.1} wall={scene.wall} roof={scene.path} />
      {[-2.25, -0.75, 0.75, 2.25].flatMap((cx) => [-2, -0.6, 0.8].map((cz) => <Block key={`${cx}${cz}`} x={cx} z={cz} w={1.2} d={1.2} h={0.6} y0={1.1} wall={scene.wall} roof={scene.hall} />))}
      <Block x={4.4} z={2.2} w={3.7} d={0.8} h={0.2} y0={0.4} wall={derived.darkTrim} roof={scene.path} />
      <Block x={8} z={1.2} w={3.6} d={3.4} h={1.5} wall={scene.storage} roof={derived.storageRoof} />
      {[[-9.5, -6.5], [-9.6, 1.8], [0.5, -7.8], [8, -6], [9.6, 5.8], [3.5, 7.6], [-4, 8]].map(([tx, tz]) => (
        <g key={`${tx}${tz}`}>
          <circle cx={proj(tx, tz, 1.2).split(',')[0]} cy={proj(tx, tz, 1.2).split(',')[1]} r="2.3" fill={derived.foliage} />
          <circle cx={proj(tx, tz, 1.9).split(',')[0]} cy={proj(tx, tz, 1.9).split(',')[1]} r="1.6" fill={derived.foliageLight} />
        </g>
      ))}
    </g>
  );
}
