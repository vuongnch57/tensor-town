import { EffectComposer, N8AO, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useQuality } from './quality';

/** Ambient occlusion + filmic tone mapping. Dropped entirely on the 'low' tier (renderer tone mapping takes over). */
export function Effects() {
  const quality = useQuality();
  if (quality === 'low') return null;
  return (
    <EffectComposer multisampling={quality === 'high' ? 4 : 0} enableNormalPass={false}>
      <N8AO aoRadius={1.2} distanceFalloff={1} intensity={quality === 'high' ? 2.6 : 1.8} quality={quality === 'high' ? 'medium' : 'performance'} halfRes={quality !== 'high'} color="#5b6a52" />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
