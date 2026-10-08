import { Suspense, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { ACESFilmicToneMapping, PCFSoftShadowMap, SRGBColorSpace } from 'three';
import { QualityContext, type Quality } from './quality';
import { Effects } from './Effects';
import { Lighting } from './Lighting';

type Props = { children: ReactNode; onMiss?: () => void; label?: string };

/**
 * Shared canvas: DPR clamped to [1,2], ACES tone mapping, soft shadows, shared lighting + AO.
 * PerformanceMonitor steps quality down high -> medium -> low.
 */
export function SceneCanvas({ children, onMiss, label }: Props) {
  const [quality, setQuality] = useState<Quality>('high');
  const down = () => setQuality((q) => (q === 'high' ? 'medium' : 'low'));
  const up = () => setQuality((q) => (q === 'low' ? 'medium' : 'high'));
  return (
    <div className="absolute inset-0">
    <Canvas
      orthographic
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 2]}
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, outputColorSpace: SRGBColorSpace, powerPreference: 'high-performance' }}
      onPointerMissed={onMiss}
      aria-label={label}
      role="group"
      style={{ touchAction: 'pan-y' }}
    >
      <QualityContext.Provider value={quality}>
        <PerformanceMonitor onDecline={down} onIncline={up} flipflops={3} bounds={() => [28, 55]} />
        <Lighting />
        <Suspense fallback={null}>{children}</Suspense>
        <Effects />
      </QualityContext.Provider>
    </Canvas>
    </div>
  );
}
