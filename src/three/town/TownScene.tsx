import { useCallback, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { connections, stepConnectionIds, tourSteps } from '@/content/town';
import type { ZoneSlug } from '@/content/types';
import { useFactoryStore } from '@/state/useFactoryStore';
import { Ground } from '../core/Ground';
import { IsoCamera } from '../core/IsoCamera';
import { SceneCanvas } from '../core/SceneCanvas';
import { Buildings } from './Buildings';
import { connectionPaths, districtCenter, TOWN_D, TOWN_W } from './layout';
import { Markers } from './Markers';
import { isDimmed } from './model';
import { Parcels } from './Parcels';
import { Ribbons } from './Ribbons';
import { Sensors } from './Sensors';

/** A short label on each connection the current tour step highlights (labels never show outside the tour). */
function TourLabels({ ids }: { ids: Set<string> }) {
  const labelled = useMemo(
    () =>
      connections
        .filter((c) => c.label && ids.has(c.id) && connectionPaths[c.id])
        .map((c) => {
          const p = connectionPaths[c.id];
          let best = 1;
          for (let i = 1; i < p.pts.length; i++) if (p.cum[i] - p.cum[i - 1] > p.cum[best] - p.cum[best - 1]) best = i;
          const a = p.pts[best - 1];
          const b = p.pts[best];
          return { id: c.id, label: c.label as string, pos: [(a[0] + b[0]) / 2, 0.9, (a[1] + b[1]) / 2] as [number, number, number] };
        }),
    [ids],
  );
  return (
    <>
      {labelled.map((l) => (
        <Html key={l.id} position={l.pos} center zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap rounded-pill border border-line bg-surface-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink shadow-marker">{l.label}</span>
        </Html>
      ))}
    </>
  );
}

type Props = { focus: ZoneSlug | null; reducedMotion: boolean; onSelect: (slug: ZoneSlug) => void };

/** The whole town in one scene. `focus` flies the camera into a district; the tour dims everything but the connections it highlights. */
export function TownScene({ focus, reducedMotion, onSelect }: Props) {
  const hiddenGroups = useFactoryStore((s) => s.hiddenGroups);
  const tourStep = useFactoryStore((s) => s.tourStep);
  const step = tourStep === null ? null : tourSteps[tourStep];
  const highlighted = useMemo(() => (step ? stepConnectionIds(step) : new Set<string>()), [step]);
  const dimmed = useCallback((id: string) => isDimmed(id, step !== null, highlighted), [step, highlighted]);
  const sensorsHidden = hiddenGroups.includes('sensors');
  return (
    <SceneCanvas label="Isometric town: nine districts joined by roads, rail, belts, a river, cables and sensor lines">
      <IsoCamera focus={focus ? districtCenter(focus) : null} home={[0, 0.6, 0]} fitWidth={25.5} fitHeight={20} focusZoom={2.4} smoothTime={0.2} reducedMotion={reducedMotion} />
      <Ground width={TOWN_W + 1} depth={TOWN_D + 1} radius={2.6} thickness={1.4} />
      <Buildings />
      <Ribbons hiddenGroups={hiddenGroups} isDimmed={dimmed} />
      <Parcels hiddenGroups={hiddenGroups} isDimmed={dimmed} reducedMotion={reducedMotion} />
      <Sensors hidden={sensorsHidden} isDimmed={dimmed} reducedMotion={reducedMotion} />
      {step && <TourLabels ids={highlighted} />}
      <Markers focus={focus} dimExcept={step ? step.districts : null} onSelect={onSelect} />
    </SceneCanvas>
  );
}
