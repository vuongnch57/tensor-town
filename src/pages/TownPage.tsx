import { useCallback, useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { itemsById, itemsInZone } from '@/content/registry';
import { isZoneSlug, zoneBySlug } from '@/content/zones';
import { hasWebGL } from '@/lib/webgl';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { zonePath } from '@/lib/urls';
import { useFactoryStore } from '@/state/useFactoryStore';
import { factoryAnchors } from '@/three/town/factory';
import { anchorsBySlug } from '@/content/registry';
import { TownScene } from '@/three/town/TownScene';
import { DistrictCard } from '@/ui/DistrictCard';
import { TourCard } from '@/ui/TourCard';
import { TownFallback } from '@/ui/TownFallback';
import { ZonePanels } from '@/ui/ZonePanels';
import type { ZoneSlug } from '@/content/types';

/**
 * The home page and every district view: one town scene. `/` shows the whole town; `/zone/:slug` flies the camera
 * into that district without leaving the scene.
 */
export default function TownPage() {
  const { slug, itemId } = useParams();
  const focus: ZoneSlug | null = slug && isZoneSlug(slug) ? slug : null;
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const webgl = useMemo(hasWebGL, []);
  const tourStep = useFactoryStore((s) => s.tourStep);
  const setTour = useFactoryStore((s) => s.setTourStep);
  const select = useFactoryStore((s) => s.select);
  const selectedId = useFactoryStore((s) => s.selectedId);
  const zone = focus ? zoneBySlug(focus) : null;
  const items = useMemo(() => (focus ? itemsInZone(focus) : []), [focus]);
  const built = items.length > 0;

  // The URL is the source of truth for the selected object: every way of selecting navigates, and this effect calls select().
  useEffect(() => {
    const valid = focus && itemId && itemsById[itemId]?.zone === focus ? itemId : null;
    select(valid);
    return () => select(null);
  }, [focus, itemId, select]);

  const goTo = useCallback((id: string | null) => focus && navigate(zonePath(focus, id)), [focus, navigate]);
  const item = selectedId ? itemsById[selectedId] ?? null : null;
  const anchor = item?.kind === 'object' ? (item.zone === 'gpu-hall' ? factoryAnchors : anchorsBySlug[item.zone])?.[item.anchorId ?? item.id] : undefined;
  const itemFocus = anchor ? anchor.focus ?? anchor.position : null;

  // Entering a district ends the tour.
  useEffect(() => {
    if (focus) setTour(null);
  }, [focus, setTour]);

  if (slug && !focus) return <Navigate to="/" replace />;

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {webgl ? <TownScene focus={focus} itemFocus={itemFocus} reducedMotion={reduced} onSelect={(s) => navigate(zonePath(s))} onSelectItem={goTo} onMiss={() => selectedId && goTo(null)} /> : <TownFallback />}
      {focus && !(built && selectedId) && <DistrictCard slug={focus} />}
      {focus && zone && built && selectedId && <ZonePanels zone={zone} items={items} selectedId={selectedId} onSelect={goTo} />}
      {!focus && tourStep === null && (
        <div className="absolute bottom-10 left-1/2 z-20 flex max-w-[calc(100%-32px)] -translate-x-1/2 items-center gap-2 rounded-pill border border-line bg-surface-200 py-1.5 pl-4 pr-1.5 text-sm text-muted shadow-panel max-sm:flex-col max-sm:rounded-md max-sm:px-4 max-sm:py-3 max-sm:text-center">
          <span>{chrome.townHint}</span>
          <button type="button" onClick={() => setTour(0)} className="shrink-0 cursor-pointer rounded-pill border-0 bg-accent px-3 py-1 font-semibold text-accent-ink">
            {chrome.tour.start}
          </button>
        </div>
      )}
      {!focus && <TourCard />}
    </div>
  );
}
