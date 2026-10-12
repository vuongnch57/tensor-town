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

/** A belt laid under a lane: one flat slab per straight segment, with a thin rail on each side. Lanes are axis-aligned. */
export function Lane({ pts, y = 0, w = 0.34, belt, rail }: { pts: readonly (readonly [number, number])[]; y?: number; w?: number; belt: MeshStandardMaterial; rail: MeshStandardMaterial }) {
  return (
    <>
      {pts.slice(1).map(([bx, bz], i) => {
        const [ax, az] = pts[i];
        const alongX = Math.abs(bx - ax) > Math.abs(bz - az);
        const len = (alongX ? Math.abs(bx - ax) : Math.abs(bz - az)) + w;
        const cx = (ax + bx) / 2;
        const cz = (az + bz) / 2;
        const size: [number, number, number] = alongX ? [len, 0.05, w] : [w, 0.05, len];
        const rs: [number, number, number] = alongX ? [len, 0.1, 0.03] : [0.03, 0.1, len];
        const off = w / 2 + 0.015;
        return (
          <group key={i}>
            <Slab size={size} position={[cx, y, cz]} m={belt} />
            <Slab size={rs} position={[alongX ? cx : cx - off, y, alongX ? cz - off : cz]} m={rail} />
            <Slab size={rs} position={[alongX ? cx : cx + off, y, alongX ? cz + off : cz]} m={rail} />
          </group>
        );
      })}
    </>
  );
}
