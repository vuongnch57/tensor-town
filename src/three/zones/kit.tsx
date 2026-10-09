import { Color, MeshStandardMaterial } from 'three';

/** Small helpers shared by the zone scenes that are built from plain slabs. */
export const mix = (a: string, b: string, t: number) => `#${new Color(a).lerp(new Color(b), t).getHexString()}`;
export const mat = (color: string, roughness = 0.75) => new MeshStandardMaterial({ color, roughness, metalness: 0 });

/** Plain box standing on its own base. Cheap, for small details. */
export function Slab({ size, position, m, rot = 0 }: { size: [number, number, number]; position: [number, number, number]; m: MeshStandardMaterial; rot?: number }) {
  return (
    <mesh material={m} position={[position[0], position[1] + size[1] / 2, position[2]]} rotation={[0, rot, 0]} receiveShadow>
      <boxGeometry args={size} />
    </mesh>
  );
}
