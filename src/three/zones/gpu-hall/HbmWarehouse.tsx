import { useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';
import { scene } from '../../core/palette';
import { derived } from '../../core/derived';
import { Box } from '../../primitives/Box';

const W = 3.6;
const D = 3.4;
const WALL_H = 1.5;
const PITCH = 0.3;

/** The HBM warehouse: blue walls, gabled roof with overhang, roller doors, shelving, stacked pallets. */
export function HbmWarehouse() {
  const gable = useMemo(() => {
    const s = new Shape();
    s.moveTo(-W / 2, 0);
    s.lineTo(W / 2, 0);
    s.lineTo(0, 0.82);
    s.closePath();
    return new ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false });
  }, []);
  const half = 1.1;
  const yc = WALL_H + 0.38;
  const xc = half * Math.cos(PITCH) - 0.02;
  return (
    <group>
      <Box size={[W, WALL_H, D]} color="storage" round={0.05} />
      {/* gable end fills under the roof on both z faces */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={gable} position={[0, WALL_H, s * (D / 2 - (s > 0 ? 0 : 0.1))]} castShadow receiveShadow>
          <meshStandardMaterial color={scene.storage} roughness={0.8} metalness={0} />
        </mesh>
      ))}
      {/* two roof slabs, tilted, overhanging every side */}
      <mesh position={[-xc, yc, 0]} rotation={[0, 0, PITCH]} castShadow receiveShadow>
        <boxGeometry args={[half * 2, 0.14, D + 0.5]} />
        <meshStandardMaterial color={derived.storageRoof} roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[xc, yc, 0]} rotation={[0, 0, -PITCH]} castShadow receiveShadow>
        <boxGeometry args={[half * 2, 0.14, D + 0.5]} />
        <meshStandardMaterial color={derived.storageRoof} roughness={0.85} metalness={0} />
      </mesh>
      <Box size={[0.22, 0.12, D + 0.55]} position={[0, yc + half * Math.sin(PITCH) - 0.02, 0]} color="wall" round={0.3} />
      {/* two roller doors on the +z face, with a frame */}
      {[-0.95, 0.95].map((x) => (
        <group key={x}>
          <Box size={[1.2, 1.05, 0.05]} position={[x, 0, D / 2]} color="wall" round={0.08} />
          <Box size={[1.0, 0.9, 0.08]} position={[x, 0, D / 2 + 0.01]} hex={derived.darkTrim} round={0.08} />
          {[0.25, 0.5, 0.75].map((h) => (
            <Box key={h} size={[0.96, 0.02, 0.09]} position={[x, h, D / 2 + 0.02]} color="storage" round={0.2} shadow={false} />
          ))}
        </group>
      ))}
      {/* windows on the +x face */}
      {[-0.9, 0, 0.9].map((z) => (
        <Box key={z} size={[0.06, 0.35, 0.55]} position={[W / 2, 0.95, z]} color="coolant" round={0.15} shadow={false} />
      ))}
      {/* loading bay opening on the -x face where the belt arrives */}
      <Box size={[0.06, 0.8, 1.0]} position={[-W / 2, 0, 1.0]} hex={derived.darkTrim} round={0.08} shadow={false} />
      {/* shelving unit and pallets outside, on the +z side */}
      <Shelving position={[2.6, 0, 2.1]} />
    </group>
  );
}

function Shelving({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[-0.5, 0.5].flatMap((x) => [-0.2, 0.2].map((z) => <Box key={`${x}${z}`} size={[0.06, 1.3, 0.06]} position={[x, 0, z]} hex={derived.darkTrim} round={0.3} />))}
      {[0.1, 0.55, 1.0].map((y) => (
        <Box key={y} size={[1.1, 0.06, 0.5]} position={[0, y, 0]} color="path" round={0.3} />
      ))}
      {[-0.28, 0.25].map((x) => (
        <Box key={x} size={[0.4, 0.3, 0.36]} position={[x, 0.16, 0]} color="parcel" round={0.12} />
      ))}
      <Box size={[0.4, 0.3, 0.36]} position={[0.0, 0.61, 0]} color="parcel" round={0.12} />
    </group>
  );
}
