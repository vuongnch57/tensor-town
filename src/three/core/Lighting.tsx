import { Environment, Lightformer } from '@react-three/drei';
import { scene } from './palette';
import { useQuality } from './quality';

/**
 * Soft daylight rig shared by every zone: hemisphere + one warm directional light,
 * a procedural studio environment for gentle reflections (no network fetch), PCF soft shadows (set on the canvas).
 */
export function Lighting() {
  const quality = useQuality();
  const shadows = quality !== 'low';
  return (
    <>
      <hemisphereLight args={['#ffffff', scene.ground, 0.4]} />
      <directionalLight
        position={[9, 14, 6]}
        intensity={1.45}
        color="#fff0d8"
        castShadow={shadows}
        shadow-mapSize={quality === 'high' ? [2048, 2048] : [1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <Environment resolution={64} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={2} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[-8, 4, 6]} scale={[10, 6, 1]} color="#fff0d8" />
        <Lightformer form="rect" intensity={0.8} position={[8, 3, -6]} scale={[10, 6, 1]} color="#dfeaf5" />
      </Environment>
    </>
  );
}
