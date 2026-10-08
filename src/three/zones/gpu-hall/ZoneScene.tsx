import { useEffect, useState } from 'react';
import { Fallback2D } from '@/ui/Fallback2D';
import { zoneText } from '@/content/ui-text';
import { IsoCamera } from '../../core/IsoCamera';
import { SceneCanvas } from '../../core/SceneCanvas';
import { SceneInteractionContext, type SceneInteraction } from '../../primitives/Selectable';
import type { Anchor } from '@/content/types';
import { FallbackArt, FALLBACK_PINS } from './FallbackArt';
import { GpuHallScene } from './Scene';

type Props = {
  webgl: boolean;
  title: string;
  focus: Anchor | null;
  interaction: SceneInteraction;
  onMiss: () => void;
};

/** Everything that needs three.js lives behind this one lazy boundary, so the zone UI paints and works first. */
export default function ZoneScene({ webgl, title, focus, interaction, onMiss }: Props) {
  // Wait for the page to be idle before starting the canvas, so the index and detail panel are interactive first.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 600 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setReady(true), 50);
    return () => window.clearTimeout(id);
  }, []);

  if (!webgl) {
    return <Fallback2D art={<FallbackArt />} pins={FALLBACK_PINS} onSelect={interaction.onSelect} title={title} note={zoneText.fallbackNote} />;
  }
  if (!ready) return null;
  return (
    <SceneInteractionContext.Provider value={interaction}>
      <SceneCanvas onMiss={onMiss} label={title}>
        <IsoCamera focus={focus ? focus.focus ?? focus.position : null} fitWidth={29} fitHeight={25} reducedMotion={interaction.reducedMotion} />
        <GpuHallScene />
      </SceneCanvas>
    </SceneInteractionContext.Provider>
  );
}
