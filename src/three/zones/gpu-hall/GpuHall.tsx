import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Mesh, Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { scene } from '../../core/palette';
import { derived } from '../../core/derived';
import { Box } from '../../primitives/Box';
import { useSceneInteraction } from '../../primitives/Selectable';

const FLOOR = 0.12;
const HALF_W = 3.3;
const HALF_D = 3.2;

/** The hall shell: floor, walls with a front door and a belt gap, an orange coping and a taller back wall with vents. */
export function HallShell() {
  return (
    <group>
      <Box size={[HALF_W * 2, FLOOR, HALF_D * 2]} color="path" round={0.3} roughness={0.9} />
      {/* back wall, taller, with orange cap and vents */}
      <Box size={[HALF_W * 2, 1.8, 0.18]} position={[0, 0, -3.1]} color="wall" round={0.06} />
      <Box size={[HALF_W * 2 + 0.4, 0.14, 0.5]} position={[0, 1.8, -3.1]} color="hall" round={0.25} />
      {[-2.2, 0, 2.2].map((x) => (
        <Box key={x} size={[0.9, 0.35, 0.06]} position={[x, 1.05, -2.98]} hex={derived.darkTrim} round={0.15} shadow={false} />
      ))}
      {/* left wall (service door at z = -2) */}
      <Box size={[0.18, 1.1, 6.2]} position={[-3.21, 0, 0]} color="wall" round={0.06} />
      <Box size={[0.4, 0.1, 6.4]} position={[-3.21, 1.1, 0]} color="hall" round={0.25} />
      <Box size={[0.06, 0.8, 0.7]} position={[-3.3, FLOOR, -2.0]} hex={derived.darkTrim} round={0.1} shadow={false} />
      {/* front wall with a door gap at x = -1 */}
      <Box size={[1.7, 1.1, 0.18]} position={[-2.45, 0, 3.1]} color="wall" round={0.06} />
      <Box size={[3.7, 1.1, 0.18]} position={[1.45, 0, 3.1]} color="wall" round={0.06} />
      <Box size={[1.9, 0.1, 0.4]} position={[-2.45, 1.1, 3.1]} color="hall" round={0.25} />
      <Box size={[3.9, 0.1, 0.4]} position={[1.45, 1.1, 3.1]} color="hall" round={0.25} />
      <Box size={[0.1, 0.9, 0.2]} position={[-1.65, FLOOR, 3.1]} hex={derived.darkTrim} round={0.2} />
      <Box size={[0.1, 0.9, 0.2]} position={[-0.35, FLOOR, 3.1]} hex={derived.darkTrim} round={0.2} />
      {/* right wall with a gap at z = 2.2 where the belt enters */}
      <Box size={[0.18, 1.1, 4.7]} position={[3.21, 0, -0.65]} color="wall" round={0.06} />
      <Box size={[0.18, 1.1, 0.3]} position={[3.21, 0, 2.85]} color="wall" round={0.06} />
      <Box size={[0.4, 0.1, 4.9]} position={[3.21, 1.1, -0.65]} color="hall" round={0.25} />
    </group>
  );
}

const COLS = [-2.25, -0.75, 0.75, 2.25];
const ROWS = [-2.0, -0.6, 0.8];
const CELL = 1.1;

/** The SM workshop cells: instanced bodies, roofs and windows (3 draw calls). */
export function SmCells() {
  const body = useRef<InstancedMesh>(null);
  const roof = useRef<InstancedMesh>(null);
  const win = useRef<InstancedMesh>(null);
  const geos = useMemo(
    () => ({
      body: new RoundedBoxGeometry(CELL, 0.55, CELL, 3, 0.07),
      roof: new RoundedBoxGeometry(CELL + 0.2, 0.12, CELL + 0.2, 3, 0.05),
      win: new RoundedBoxGeometry(0.5, 0.18, 0.05, 2, 0.02),
    }),
    [],
  );
  const n = COLS.length * ROWS.length;
  useEffect(() => {
    const t = new Object3D();
    let i = 0;
    for (const z of ROWS)
      for (const x of COLS) {
        t.position.set(x, FLOOR + 0.275, z);
        t.updateMatrix();
        body.current?.setMatrixAt(i, t.matrix);
        t.position.set(x, FLOOR + 0.55 + 0.06, z);
        t.updateMatrix();
        roof.current?.setMatrixAt(i, t.matrix);
        t.position.set(x, FLOOR + 0.3, z + CELL / 2 + 0.01);
        t.updateMatrix();
        win.current?.setMatrixAt(i, t.matrix);
        i++;
      }
    for (const r of [body, roof, win]) if (r.current) r.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <group>
      <instancedMesh ref={body} args={[geos.body, undefined, n]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color={scene.wall} roughness={0.8} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={roof} args={[geos.roof, undefined, n]} castShadow receiveShadow frustumCulled={false}>
        <meshStandardMaterial color={scene.hall} roughness={0.8} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={win} args={[geos.win, undefined, n]} frustumCulled={false}>
        <meshStandardMaterial color={scene.coolant} roughness={0.6} metalness={0} />
      </instancedMesh>
    </group>
  );
}

/** Worker positions: two rows in the front aisle of the hall. */
export const WORKER_SPOTS: readonly (readonly [number, number])[] = [1.95, 2.6].flatMap((z) =>
  [-2.8, -2.3, -1.8, -1.3, -0.8, -0.3, 0.2, 0.7].map((x) => [x, z] as const),
);

/** The stamping press (Tensor Core). The head stamps faster the busier the hall is. */
export function StampingPress({ smBusy, position = [1.9, FLOOR, 2.0] }: { smBusy: number; position?: [number, number, number] }) {
  const head = useRef<Mesh>(null);
  const { reducedMotion } = useSceneInteraction();
  useFrame(({ clock }) => {
    if (!head.current) return;
    const phase = reducedMotion ? 0 : Math.abs(Math.sin(clock.elapsedTime * (1 + smBusy * 2.2)));
    head.current.position.y = 0.78 - phase * 0.18;
  });
  return (
    <group position={position}>
      <Box size={[1.0, 0.3, 0.9]} color="roof" round={0.12} />
      <Box size={[0.5, 0.08, 0.5]} position={[0, 0.3, 0]} color="parcel" round={0.2} />
      <Box size={[0.14, 1.0, 0.14]} position={[-0.38, 0.3, -0.3]} color="roof" round={0.2} />
      <Box size={[0.14, 1.0, 0.14]} position={[0.38, 0.3, -0.3]} color="roof" round={0.2} />
      <Box size={[0.9, 0.2, 0.2]} position={[0, 1.1, -0.3]} color="roof" round={0.2} />
      <mesh ref={head} position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[0.46, 0.2, 0.46]} />
        <meshStandardMaterial color={scene.network} roughness={0.7} metalness={0} />
      </mesh>
    </group>
  );
}
