import { useState } from 'react';
import { zoneText } from '@/content/ui-text';
import type { Item, Zone } from '@/content/types';
import { DetailPanel } from './DetailPanel';
import { FabricSimulateBar } from './FabricSimulateBar';
import { LineSimulateBar } from './LineSimulateBar';
import { ShareSimulateBar } from './ShareSimulateBar';
import { NetSimulateBar } from './NetSimulateBar';
import { StorageSimulateBar } from './StorageSimulateBar';
import { PackSimulateBar } from './PackSimulateBar';
import { SimulateBar } from './SimulateBar';
import { ZoneIndex } from './ZoneIndex';

type Props = { zone: Zone; items: Item[]; selectedId: string | null; onSelect: (id: string | null) => void };

/** The panels around a district that has built content: object index, details, and the simulate bar. They float over the town scene. */
export function ZonePanels({ zone, items, selectedId, onSelect }: Props) {
  const [indexOpen, setIndexOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const item = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;
  const pos = items.findIndex((i) => i.id === selectedId);
  const pick = (id: string | null) => {
    setIndexOpen(false);
    onSelect(id);
  };
  const step = (d: number) => pick(items[(pos + d + items.length) % items.length].id);

  return (
    <>
      {/* desktop: index on the left, details on the right, simulate bar at the bottom */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
        <div className="pointer-events-auto absolute bottom-24 left-4 top-16 w-[240px] overflow-y-auto rounded-lg border border-line bg-surface-200 p-3 shadow-panel">
          <ZoneIndex zone={zone} items={items} selectedId={selectedId} onSelect={pick} />
        </div>
        <aside aria-live="polite" aria-label="Details" className="pointer-events-auto absolute bottom-24 right-4 top-16 w-[360px] overflow-y-auto rounded-lg border border-line bg-surface-200 p-6 shadow-panel">
          <DetailPanel zone={zone} item={item} items={items} onSelect={pick} />
        </aside>
        <div className="pointer-events-auto absolute bottom-6 left-1/2 w-[min(860px,calc(100%-680px))] -translate-x-1/2 [&>div]:m-0">
          {zone.slug === 'packing-station' ? <PackSimulateBar /> : zone.slug === 'dgx-building' ? <FabricSimulateBar /> : zone.slug === 'transport-network' ? <NetSimulateBar /> : zone.slug === 'storage-yard' ? <StorageSimulateBar /> : zone.slug === 'production-line' ? <LineSimulateBar /> : zone.slug === 'control-room' ? <ShareSimulateBar /> : <SimulateBar />}
        </div>
      </div>

      {/* mobile: index button, bottom sheet */}
      <div className="absolute left-4 top-16 z-20 lg:hidden">
        <button type="button" onClick={() => setIndexOpen(true)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-pill border border-line bg-surface-200 px-3 text-[13px] font-semibold text-ink shadow-marker">
          {zoneText.indexLabel(items.length)}
        </button>
      </div>
      <aside aria-live="polite" aria-label="Details" className={`fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-lg border border-b-0 border-line bg-surface-200 shadow-panel lg:hidden ${expanded ? 'h-[88dvh]' : 'h-[31dvh]'}`}>
        <button type="button" aria-label={expanded ? zoneText.readLess : zoneText.readMore} onClick={() => setExpanded((v) => !v)} className="mx-auto mt-2 h-5 w-24 shrink-0 cursor-pointer border-0 bg-transparent p-0">
          <span className="mx-auto block h-[5px] w-10 rounded-pill bg-line" />
        </button>
        <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-1">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{pos >= 0 ? zoneText.position(pos + 1, items.length) : ''}</span>
          <span className="flex gap-1.5">
            <NavButton label={zoneText.previous} onClick={() => step(-1)} path="M15 18l-6-6 6-6" />
            <NavButton label={zoneText.next} onClick={() => step(1)} path="M9 6l6 6-6 6" />
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <DetailPanel zone={zone} item={item} items={items} onSelect={pick} />
        </div>
        <div className="flex gap-2 border-t border-line px-4 py-2.5">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="flex-1 cursor-pointer rounded-md border border-accent bg-accent px-3 py-2.5 text-sm font-semibold text-accent-ink">
            {expanded ? zoneText.readLess : zoneText.readMore}
          </button>
        </div>
      </aside>
      {indexOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={zoneText.indexTitle(zone.number)}>
          <button type="button" aria-label={zoneText.closeSheet} onClick={() => setIndexOpen(false)} className="absolute inset-0 h-full w-full cursor-default border-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-lg bg-surface-100 p-3 shadow-panel">
            <ZoneIndex zone={zone} items={items} selectedId={selectedId} onSelect={pick} />
          </div>
        </div>
      )}
    </>
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
