import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { CONN_GROUPS, connGroupNames, districts } from '@/content/town';
import { zoneBySlug } from '@/content/zones';
import { zonePath } from '@/lib/urls';
import { toggleTheme } from '@/lib/theme';
import { useFactoryStore } from '@/state/useFactoryStore';

/** Pure filter for the district list: matches name, zone title and description. */
export function matchDistricts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return districts;
  return districts.filter((d) => `${d.name} ${zoneBySlug(d.slug)?.title ?? ''} ${d.text}`.toLowerCase().includes(q));
}

const groupSwatch: Record<(typeof CONN_GROUPS)[number], string> = {
  roads: 'bg-scene-path border-line',
  rail: 'bg-scene-network border-scene-network',
  belts: 'bg-scene-hall border-scene-hall',
  river: 'bg-scene-coolant border-scene-coolant',
  power: 'bg-scene-roof border-scene-roof',
  sensors: 'bg-accent border-accent',
};

/** Modal menu on a native <dialog>: focus is trapped, Esc closes, focus returns to the button that opened it. */
export function MenuModal() {
  const open = useFactoryStore((s) => s.menuOpen);
  const setOpen = useFactoryStore((s) => s.setMenuOpen);
  const hidden = useFactoryStore((s) => s.hiddenGroups);
  const toggleGroup = useFactoryStore((s) => s.toggleGroup);
  const setTour = useFactoryStore((s) => s.setTourStep);
  const navigate = useNavigate();
  const ref = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const list = useMemo(() => matchDistricts(query), [query]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setQuery('');
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
      search.current?.focus();
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
    }
  }, [open]);

  const go = (slug: string) => {
    setTour(null);
    setOpen(false);
    navigate(zonePath(slug as never));
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="menu-title"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === ref.current) setOpen(false);
      }}
      className="m-auto max-h-[min(720px,calc(100%-32px))] w-[min(560px,calc(100%-32px))] overflow-auto rounded-lg border border-line bg-surface-200 p-0 text-ink shadow-panel backdrop:bg-[rgba(20,24,29,0.5)] max-sm:h-[calc(100%-32px)]"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <h2 id="menu-title" className="text-base font-semibold">{chrome.siteName}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label={chrome.menu.close} className="ml-auto h-9 w-9 cursor-pointer rounded-md border border-line bg-surface-300 text-lg leading-none text-ink">
            ×
          </button>
        </div>
        <input
          ref={search}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && list[0]) go(list[0].slug);
          }}
          placeholder={chrome.menu.searchPlaceholder}
          aria-label={chrome.menu.searchLabel}
          className="w-full rounded-md border border-line bg-surface-100 px-3.5 py-2.5 text-ink placeholder:text-muted"
        />
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{chrome.menu.districts}</h3>
          <ul className="mt-2 flex flex-col gap-1 p-0">
            {list.map((d) => (
              <li key={d.slug} className="list-none">
                <button type="button" onClick={() => go(d.slug)} className="flex w-full cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent px-2.5 py-2 text-left text-ink hover:bg-accent-soft focus-visible:bg-accent-soft">
                  <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-pill bg-marker text-[13px] font-bold text-[#1c2430] shadow-marker">{d.number}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-5">{d.name}</span>
                    <span className="block text-xs text-muted">{chrome.district.zone} {d.number} · {zoneBySlug(d.slug)?.title}</span>
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="list-none px-2.5 py-2 text-sm text-muted">{chrome.menu.noMatch}</li>}
          </ul>
        </section>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{chrome.menu.pages}</h3>
          <nav className="mt-2 flex flex-wrap gap-2" aria-label="Pages">
            {([['/', chrome.pages.town], ['/index', chrome.pages.index], ['/compare', chrome.pages.compare], ['/about', chrome.pages.about]] as const).map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => {
                  setTour(null);
                  setOpen(false);
                }}
                className={({ isActive }) => `rounded-md border px-4 py-2 font-semibold no-underline ${isActive ? 'border-accent bg-accent text-accent-ink' : 'border-line bg-surface-300 text-ink'}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </section>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{chrome.menu.connections}</h3>
          <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
            {CONN_GROUPS.map((g) => (
              <label key={g} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line bg-surface-100 px-3 py-2 text-sm">
                <input type="checkbox" checked={!hidden.includes(g)} onChange={() => toggleGroup(g)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
                <span className={`h-1 w-[22px] shrink-0 rounded-sm border ${groupSwatch[g]}`} aria-hidden="true" />
                <span>{connGroupNames[g]}</span>
              </label>
            ))}
          </div>
        </section>
        <button type="button" onClick={toggleTheme} className="cursor-pointer self-start rounded-md border border-line bg-surface-300 px-4 py-2 font-semibold text-ink">
          {chrome.menu.theme}
        </button>
      </div>
    </dialog>
  );
}
