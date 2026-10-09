import { derived } from '../../core/derived';
import { Box } from '../../primitives/Box';

/** The manager's office: small, calm, cream walls and a slate roof (scene-roof). */
export function CpuOffice() {
  return (
    <group>
      <Box size={[2.8, 1.3, 2.2]} color="wall" round={0.06} />
      <Box size={[3.15, 0.16, 2.55]} position={[0, 1.3, 0]} color="roof" round={0.2} />
      <Box size={[3.0, 0.12, 2.4]} position={[0, 1.46, 0]} color="roof" round={0.2} roughness={0.9} />
      {/* door and awning on the +z face */}
      <Box size={[0.5, 0.85, 0.06]} position={[-0.6, 0, 1.12]} hex={derived.darkTrim} round={0.1} />
      <Box size={[0.8, 0.07, 0.38]} position={[-0.6, 0.95, 1.2]} color="hall" round={0.4} />
      {/* windows on the +x face and +z face */}
      {[-0.55, 0.55].map((z) => (
        <Box key={z} size={[0.06, 0.4, 0.55]} position={[1.4, 0.6, z]} color="coolant" round={0.15} shadow={false} />
      ))}
      <Box size={[0.55, 0.4, 0.06]} position={[0.7, 0.6, 1.12]} color="coolant" round={0.15} shadow={false} />
      {/* roof box + small antenna */}
      <Box size={[0.6, 0.35, 0.5]} position={[0.7, 1.62, -0.4]} color="wall" round={0.1} />
      <mesh position={[-0.9, 2.0, -0.5]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshStandardMaterial color={derived.darkTrim} roughness={0.8} metalness={0} />
      </mesh>
    </group>
  );
}
