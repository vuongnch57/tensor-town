import { Html } from '@react-three/drei';
import { districts } from '@/content/town';
import type { ZoneSlug } from '@/content/types';
import { markerWorld } from './layout';

type Props = { focus: ZoneSlug | null; dimExcept: ZoneSlug[] | null; hideFocused?: boolean; pulse?: ZoneSlug[]; onSelect: (slug: ZoneSlug) => void };

/** Numbered district markers (real buttons). Name labels sit beside them on wide screens; on phones only the selected one shows. */
export function Markers({ focus, dimExcept, hideFocused = false, pulse = [], onSelect }: Props) {
  return (
    <>
      {districts.map((d) => {
        const selected = focus === d.slug;
        if (selected && hideFocused) return null;
        const dim = (focus !== null && !selected) || (dimExcept !== null && !dimExcept.includes(d.slug));
        return (
          <Html key={d.slug} position={markerWorld(d.slug)} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <button
              type="button"
              onClick={() => onSelect(d.slug)}
              aria-label={`District ${d.number}, ${d.name}`}
              aria-pressed={selected}
              className={`group pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-pill border-0 bg-transparent p-0 text-ink transition-opacity ${dim ? 'opacity-35' : ''}`}
            >
              <span
                className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-pill border-[3px] border-surface-200 text-[14px] font-bold shadow-marker group-hover:bg-accent group-hover:text-accent-ink ${pulse.includes(d.slug) ? 'motion-safe:animate-pulse ring-4 ring-accent' : ''} ${selected ? 'bg-accent text-accent-ink' : 'bg-marker text-[#1c2430]'}`}
              >
                {d.number}
              </span>
              <span className={`rounded-sm border border-line bg-surface-200 px-2.5 py-1 text-[14px] font-semibold leading-5 shadow-marker ${selected ? '' : 'hidden sm:block'}`}>{d.name}</span>
            </button>
          </Html>
        );
      })}
    </>
  );
}
