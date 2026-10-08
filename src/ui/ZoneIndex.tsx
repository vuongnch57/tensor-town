import { Link } from 'react-router-dom';
import { useFactoryStore } from '@/state/useFactoryStore';
import { zonePath } from '@/lib/urls';
import { zoneText } from '@/content/ui-text';
import type { Item, Zone } from '@/content/types';

type Props = { zone: Zone; items: Item[]; selectedId: string | null; onSelect: (id: string) => void };

/** Per-zone table of contents. Its numbers match the hotspots in the scene. */
export function ZoneIndex({ zone, items, selectedId, onSelect }: Props) {
  const hover = useFactoryStore((s) => s.hover);
  const objects = items.filter((i) => i.kind === 'object');
  const concepts = items.filter((i) => i.kind === 'concept');
  const row = (i: Item) => {
    const on = i.id === selectedId;
    return (
      <li key={i.id}>
        <Link
          to={zonePath(zone.slug, i.id)}
          aria-current={on ? 'true' : undefined}
          onClick={(e) => {
            e.preventDefault();
            onSelect(i.id);
          }}
          onPointerEnter={() => hover(i.id)}
          onPointerLeave={() => hover(null)}
          onFocus={() => hover(i.id)}
          onBlur={() => hover(null)}
          className={`flex items-center gap-2.5 rounded-[10px] px-2 py-[7px] text-sm font-semibold leading-5 text-ink no-underline ${on ? 'bg-accent-soft' : 'hover:bg-surface-300'}`}
        >
          {i.kind === 'object' ? (
            <span
              className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold leading-none ${on ? 'border-accent bg-accent text-accent-ink' : 'border-ink'}`}
            >
              {i.number}
            </span>
          ) : (
            <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] bg-surface-300" aria-label="Concept">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-muted" aria-hidden="true">
                <path d="M4 12h16M12 4v16" />
              </svg>
            </span>
          )}
          <span className="min-w-0">{i.name}</span>
          {i.kind === 'object' && <span className="ml-auto shrink-0 text-xs font-normal text-muted">{i.category}</span>}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label={zoneText.indexTitle(zone.number)} className="flex flex-col gap-1 rounded-lg border border-line bg-surface-200 px-3.5 py-[18px]">
      <div className="flex flex-col gap-0.5 px-2 pb-2">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{zoneText.indexTitle(zone.number)}</span>
        <span className="text-[13px] leading-[18px] text-muted">{zoneText.counts(objects.length, concepts.length)}</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{objects.map(row)}</ul>
      <div className="mx-2 my-2 h-px bg-surface-300" />
      <span className="px-2 pb-1 text-xs font-semibold uppercase tracking-[0.06em] text-muted">{zoneText.concepts}</span>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{concepts.map(row)}</ul>
      <div className="mx-2 my-2 h-px bg-surface-300" />
      <div className="flex justify-between px-2 text-[13px] text-accent">
        <span className="py-1 opacity-60">{zoneText.prevZone}</span>
        <span className="py-1 opacity-60">{zoneText.nextZone}</span>
      </div>
    </nav>
  );
}
