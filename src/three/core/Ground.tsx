import { useMemo } from 'react';
import { ExtrudeGeometry, MeshStandardMaterial, Shape } from 'three';
import { matte, shade } from './materials';

function roundedRect(w: number, d: number, r: number): Shape {
  const s = new Shape();
  const x = -w / 2;
  const y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

type GroundProps = { width?: number; depth?: number; thickness?: number; radius?: number };

/**
 * The rounded "diorama" base every zone sits on. Top surface is y = 0; the soil block hangs below it.
 */
export function Ground({ width = 22, depth = 18, thickness = 1.2, radius = 2.2 }: GroundProps) {
  const soil = useMemo(() => new MeshStandardMaterial({ color: shade('parcel', 'roof', 0.5).multiplyScalar(0.9), roughness: 0.95, metalness: 0 }), []);
  // Soil block: y in [-thickness, -0.12]. Grass slab: y in [-0.2, 0] so props can stand at y = 0.
  const soilGeo = useMemo(() => {
    const bt = 0.06;
    const g = new ExtrudeGeometry(roundedRect(width, depth, radius), { depth: thickness - 0.24, bevelEnabled: true, bevelSize: 0.08, bevelThickness: bt, bevelSegments: 3, curveSegments: 20 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -thickness + bt, 0);
    return g;
  }, [width, depth, thickness, radius]);
  const grassGeo = useMemo(() => {
    const bt = 0.04;
    const g = new ExtrudeGeometry(roundedRect(width - 0.1, depth - 0.1, radius), { depth: 0.12, bevelEnabled: true, bevelSize: 0.05, bevelThickness: bt, bevelSegments: 3, curveSegments: 20 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.2 + bt, 0);
    return g;
  }, [width, depth, radius]);
  return (
    <group>
      <mesh geometry={soilGeo} material={soil} receiveShadow castShadow />
      <mesh geometry={grassGeo} material={matte('ground', 0.9)} receiveShadow />
    </group>
  );
}
