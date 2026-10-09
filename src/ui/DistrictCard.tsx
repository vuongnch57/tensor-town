import { useNavigate } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { connectionsOf, districtBySlug } from '@/content/town';
import { itemsInZone } from '@/content/registry';
import { zoneBySlug } from '@/content/zones';
import type { ZoneSlug } from '@/content/types';
import { zonePath } from '@/lib/urls';

/** Shown while the camera is inside a district: what it is and what it connects to. Chips fly to the other end. */
export function DistrictCard({ slug }: { slug: ZoneSlug }) {
  const navigate = useNavigate();
  const d = districtBySlug(slug);
  const zone = zoneBySlug(slug);
  if (!d || !zone) return null;
  const objects = itemsInZone(slug).filter((i) => i.kind === 'object');
  return (
    <section aria-live="polite" className="absolute bottom-10 left-4 z-20 max-sm:bottom-9 w-[min(380px,calc(100%-32px))] rounded-lg border border-line bg-surface-200 p-5 shadow-panel max-sm:p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{chrome.district.zone} {d.number} · {zone.title}</div>
      <h2 className="mt-1 text-xl font-semibold leading-7">{d.name}</h2>
      <p className="mt-1 text-sm leading-5 text-muted max-sm:line-clamp-2">{d.text}</p>
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.06em] text-muted">{chrome.district.connectedTo}</div>
      <div className="mt-2 flex flex-wrap gap-2 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pb-1">
        {connectionsOf(slug).map(({ other, connection }) => (
          <button
            key={`${other}-${connection.id}`}
            type="button"
            onClick={() => navigate(zonePath(other))}
            className="shrink-0 cursor-pointer rounded-sm border border-line bg-surface-300 px-2.5 py-1 text-sm text-ink hover:border-accent"
          >
            {districtBySlug(other)?.name} <span className="text-xs text-muted">· {connection.kind.toLowerCase()}</span>
          </button>
        ))}
      </div>
      {objects.length > 0 ? (
        <button type="button" onClick={() => navigate(zonePath(slug, objects[0].id))} className="mt-3 w-full cursor-pointer rounded-md border border-accent bg-accent px-3 py-2 text-sm font-semibold text-accent-ink">
          {chrome.district.explore(objects.length)}
        </button>
      ) : (
        <p className="mt-3 border-t border-line pt-3 text-xs text-muted max-sm:hidden">{chrome.district.soon}</p>
      )}
    </section>
  );
}
