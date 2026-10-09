import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { indexText as t } from '@/content/pages';
import { allItems } from '@/content/registry';
import { zoneBySlug } from '@/content/zones';
import type { Item, ItemKind } from '@/content/types';
import { categoriesOf, filterItems, groupAZ, groupByZone } from '@/lib/indexList';
import { zonePath } from '@/lib/urls';
import { SegmentedControl } from '@/ui/SegmentedControl';

function Row({ item, showZone }: { item: Item; showZone: boolean }) {
  return (
    <li>
      <Link to={zonePath(item.zone, item.id)} className="flex items-center gap-3 rounded-md px-2.5 py-2 text-ink no-underline hover:bg-accent-soft focus-visible:bg-accent-soft">
        {item.kind === 'object' ? (
          <span className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full border-2 border-ink text-[11px] font-bold leading-none">{item.number}</span>
        ) : (
          <span className="grid h-[24px] w-[24px] shrink-0 place-items-center rounded-[7px] bg-surface-300 text-muted" aria-label={t.concept}>
            +
          </span>
        )}
        <span className="min-w-0 flex-1 font-semibold leading-5">{item.name}</span>
        <span className="text-[13px] text-muted">{showZone ? `${item.category} · ${zoneBySlug(item.zone)?.title}` : item.category}</span>
      </Link>
    </li>
  );
}

export function IndexPage() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<'zone' | 'az'>('zone');
  const [kind, setKind] = useState<ItemKind | 'all'>('all');
  const [category, setCategory] = useState('all');
  const categories = useMemo(() => categoriesOf(allItems), []);
  const filtered = useMemo(() => filterItems(allItems, { query, kind, category }), [query, kind, category]);
  const groups = useMemo(() => (group === 'zone' ? groupByZone(filtered) : groupAZ(filtered)), [filtered, group]);
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-14 pt-20 md:px-6">
      <h1 className="text-[28px] font-bold leading-[34px]">{t.title}</h1>
      <p className="mt-2 text-muted">{t.intro}</p>
      <div className="mt-5 flex flex-col gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
          className="w-full rounded-md border border-line bg-surface-100 px-3.5 py-2.5 text-ink placeholder:text-muted"
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <SegmentedControl label={t.groupBy} value={group} onChange={setGroup} options={t.groupOptions} />
          <SegmentedControl label={t.type} value={kind} onChange={setKind} options={t.typeOptions} />
          <label className="flex items-center gap-2 text-[13px] text-muted">
            <span>{t.category}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border border-line bg-surface-100 px-2.5 py-1.5 text-[13px] text-ink">
              <option value="all">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="m-0 text-[13px] text-muted" aria-live="polite">
          {t.count(filtered.length)}
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-6">
        {groups.map((g) => (
          <section key={g.key} aria-label={g.title}>
            <h2 className="m-0 border-b border-line pb-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-accent">{g.title}</h2>
            <ul className="m-0 mt-1.5 flex list-none flex-col p-0">
              {g.items.map((i) => (
                <Row key={i.id} item={i} showZone={group === 'az'} />
              ))}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="text-muted">{t.none}</p>}
        <p className="m-0 text-[13px] text-muted">{t.moreZones}</p>
      </div>
    </section>
  );
}
