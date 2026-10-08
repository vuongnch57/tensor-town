import { useParams } from 'react-router-dom';
import { zoneBySlug } from '@/content/zones';
import { SceneCanvas } from '@/three/core/SceneCanvas';
import { IsoCamera } from '@/three/core/IsoCamera';
import { Ground } from '@/three/core/Ground';
import { useReducedMotion } from '@/lib/useReducedMotion';

// Phase 0 placeholder: the shared rig rendering an empty diorama base.
export default function ZonePage() {
  const { slug = '' } = useParams();
  const zone = zoneBySlug(slug);
  const reduced = useReducedMotion();
  if (!zone) return <p className="p-6 text-muted">Unknown zone.</p>;
  return (
    <section className="flex flex-1 flex-col gap-3 p-4 md:p-6">
      <h1 className="text-xl font-semibold">{zone.title}</h1>
      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-lg border border-line" style={{ background: '#eef2e8' }}>
        <SceneCanvas label={`${zone.title} scene`}>
          <IsoCamera focus={null} reducedMotion={reduced} />
          <Ground />
        </SceneCanvas>
      </div>
    </section>
  );
}
