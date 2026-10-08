import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { itemsById, itemsInZone } from '@/content/registry';
import { zoneBySlug } from '@/content/zones';
import { zoneText } from '@/content/ui-text';
import { zonePath } from '@/lib/urls';
import { hasWebGL } from '@/lib/webgl';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { useFactoryStore } from '@/state/useFactoryStore';
import { pin } from '@/three/core/palette';
import { IsoCamera } from '@/three/core/IsoCamera';
import { SceneCanvas } from '@/three/core/SceneCanvas';
import { SceneInteractionContext } from '@/three/primitives/Selectable';
import { anchors } from '@/three/zones/gpu-hall/anchors';
import { FallbackArt, FALLBACK_PINS } from '@/three/zones/gpu-hall/FallbackArt';
import { GpuHallScene } from '@/three/zones/gpu-hall/Scene';
import { DetailPanel } from '@/ui/DetailPanel';
import { Fallback2D } from '@/ui/Fallback2D';
import { SimulateBar } from '@/ui/SimulateBar';
import { ZoneIndex } from '@/ui/ZoneIndex';

export default function ZonePage() {
  const { slug = '', itemId } = useParams();
  const zone = zoneBySlug(slug);
  const items = useMemo(() => (zone ? itemsInZone(zone.slug) : []), [zone]);
  if (!zone) return <p className="p-6 text-muted">Unknown zone.</p>;
  if (items.length === 0) {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <h1 className="text-[28px] font-bold leading-[34px]">{zone.title}</h1>
        <p className="mt-3 text-muted">{zoneText.zoneSoon}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-accent">{zoneText.backToMap}</Link>
      </section>
    );
  }
  return <ZoneView key={zone.slug} zoneSlug={zone.slug} itemId={itemId} />;
}

function ZoneView({ zoneSlug, itemId }: { zoneSlug: Parameters<typeof itemsInZone>[0]; itemId?: string }) {
  const zone = zoneBySlug(zoneSlug)!;
  const items = useMemo(() => itemsInZone(zoneSlug), [zoneSlug]);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduced = useReducedMotion();
  const select = useFactoryStore((s) => s.select);
  const selectedId = useFactoryStore((s) => s.selectedId);
  const [indexOpen, setIndexOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [viewReset, setViewReset] = useState(false);
  const webgl = useMemo(() => hasWebGL() && params.get('fallback') !== '1', [params]);

  // URL is the source of truth: every way of selecting navigates, and this effect calls select().
  useEffect(() => {
    const valid = itemId && itemsById[itemId]?.zone === zoneSlug ? itemId : null;
    select(valid);
    setViewReset(false);
  }, [itemId, zoneSlug, select]);
  useEffect(() => () => select(null), [select]);

  const goTo = (id: string | null) => {
    setIndexOpen(false);
    navigate(zonePath(zoneSlug, id));
  };
  const item = selectedId ? itemsById[selectedId] ?? null : null;
  const pos = items.findIndex((i) => i.id === selectedId);
  const step = (d: number) => goTo(items[(pos + d + items.length) % items.length].id);
  const focusAnchor = item?.kind === 'object' && !viewReset ? anchors[item.anchorId ?? item.id] : null;
  const interaction = useMemo(() => ({ onSelect: goTo, reducedMotion: reduced }), [reduced, zoneSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  const scenePanel = (
    <section
      aria-label={zoneText.sceneLabel(zone.title)}
      className="relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-scene-ground lg:min-h-[680px]"
    >
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 p-3 pb-0 sm:p-5 sm:pb-0 max-lg:absolute max-lg:right-0 max-lg:top-0 max-lg:p-3">
        <div className="hidden flex-col gap-0.5 lg:flex">
          <h2 className="m-0 text-xl font-semibold leading-7" style={{ color: pin.ink }}>{zone.title}</h2>
          <span className="text-sm leading-5" style={{ color: pin.muted }}>{zone.blurb}</span>
        </div>
        <div className="flex items-center gap-2">
          {focusAnchor && (
            <button type="button" onClick={() => setViewReset(true)} className="cursor-pointer rounded-pill border border-line bg-white px-3 py-1.5 text-[13px] font-semibold shadow-marker" style={{ color: pin.ink }}>
              {zoneText.resetView}
            </button>
          )}
          <span className="hidden items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-[13px] font-semibold shadow-marker sm:inline-flex" style={{ color: pin.ink }}>{zoneText.clickPrompt}</span>
        </div>
      </div>
      <div className="relative h-[270px] flex-none sm:h-[440px] lg:absolute lg:inset-0 lg:h-auto">
        {webgl ? (
          <SceneInteractionContext.Provider value={interaction}>
            <SceneCanvas onMiss={() => selectedId && goTo(null)} label={zoneText.sceneLabel(zone.title)}>
              <IsoCamera focus={focusAnchor ? focusAnchor.focus ?? focusAnchor.position : null} fitWidth={29} fitHeight={25} reducedMotion={reduced} />
              <GpuHallScene />
            </SceneCanvas>
          </SceneInteractionContext.Provider>
        ) : (
          <Fallback2D art={<FallbackArt />} pins={FALLBACK_PINS} onSelect={goTo} title={zoneText.sceneLabel(zone.title)} note={zoneText.fallbackNote} />
        )}
      </div>
      <div className="relative z-10 lg:mt-auto">
        <SimulateBar />
      </div>
    </section>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] flex-1 p-4 pb-[calc(33dvh+16px)] lg:grid lg:grid-cols-[240px_minmax(0,1fr)_360px] lg:items-start lg:gap-5 lg:p-6">
      <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
        <h1 className="m-0 text-xl font-semibold">{zone.title}</h1>
        <button type="button" onClick={() => setIndexOpen(true)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-surface-200 px-3 text-[13px] font-semibold text-ink">
          {zoneText.indexLabel(items.length)}
        </button>
      </div>

      <div className="hidden lg:block">
        <ZoneIndex zone={zone} items={items} selectedId={selectedId} onSelect={goTo} />
      </div>

      {scenePanel}

      {/* desktop detail panel */}
      <aside aria-live="polite" aria-label="Details" className="hidden max-h-[calc(100dvh-140px)] overflow-y-auto rounded-lg border border-line bg-surface-200 p-6 shadow-panel lg:sticky lg:top-6 lg:block">
        <DetailPanel zone={zone} item={item} items={items} onSelect={goTo} />
      </aside>

      {/* mobile: bottom sheet */}
      <aside
        aria-live="polite"
        aria-label="Details"
        className={`fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-lg border border-b-0 border-line bg-surface-200 shadow-panel lg:hidden ${expanded ? 'h-[88dvh]' : 'h-[33dvh]'}`}
      >
        <button type="button" aria-label={expanded ? zoneText.readLess : zoneText.readMore} onClick={() => setExpanded((v) => !v)} className="mx-auto mt-2 h-5 w-24 shrink-0 cursor-pointer border-0 bg-transparent p-0">
          <span className="mx-auto block h-[5px] w-10 rounded-pill bg-line" />
        </button>
        <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-1">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{pos >= 0 ? zoneText.position(pos + 1, items.length) : zoneText.overviewTitle}</span>
          <span className="flex gap-1.5">
            <NavButton label={zoneText.previous} onClick={() => step(-1)} path="M15 18l-6-6 6-6" />
            <NavButton label={zoneText.next} onClick={() => step(1)} path="M9 6l6 6-6 6" />
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <DetailPanel zone={zone} item={item} items={items} onSelect={goTo} />
        </div>
        <div className="flex gap-2 border-t border-line px-4 py-2.5">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="flex-1 cursor-pointer rounded-md border border-accent bg-accent px-3 py-2.5 text-sm font-semibold text-accent-ink">
            {expanded ? zoneText.readLess : zoneText.readMore}
          </button>
        </div>
      </aside>

      {/* mobile: index sheet */}
      {indexOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={zoneText.indexTitle(zone.number)}>
          <button type="button" aria-label={zoneText.closeSheet} onClick={() => setIndexOpen(false)} className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-lg bg-surface-100 p-3 shadow-panel">
            <ZoneIndex zone={zone} items={items} selectedId={selectedId} onSelect={goTo} />
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({ label, onClick, path }: { label: string; onClick: () => void; path: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-10 w-10 cursor-pointer place-items-center rounded-[12px] border border-line bg-surface-200 text-ink">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d={path} />
      </svg>
    </button>
  );
}
