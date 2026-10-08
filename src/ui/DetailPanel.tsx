import { Link } from 'react-router-dom';
import { forwardRefs, itemsById } from '@/content/registry';
import { comparePath } from '@/lib/urls';
import { sceneByToken } from '@/three/core/palette';
import { zoneText } from '@/content/ui-text';
import type { Item, Zone } from '@/content/types';

type Props = { zone: Zone; item: Item | null; items: Item[]; onSelect: (id: string) => void };

const label = 'text-xs font-semibold uppercase tracking-[0.06em] text-muted';

/** The selected item in a fixed order: eyebrow, name, metaphor, summary, key facts, compare, related. */
export function DetailPanel({ zone, item, items, onSelect }: Props) {
  if (!item) return <EmptyState zone={zone} items={items} onSelect={onSelect} />;
  const eyebrow = [item.category, `Zone ${zone.number}`, item.number ? `#${item.number}` : null].filter(Boolean).join(' · ');
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-1.5">
        <span className={`${label} text-accent`}>{eyebrow}</span>
        <h1 className="m-0 text-[28px] font-bold leading-[34px]">{item.name}</h1>
        <span className="flex items-center gap-2 text-sm leading-5 text-muted">
          {item.swatch && <span className="h-3 w-3 shrink-0 rounded-[4px]" style={{ background: sceneByToken(item.swatch) }} aria-hidden="true" />}
          <span>
            {zoneText.inTheFactory} {item.metaphor.charAt(0).toLowerCase() + item.metaphor.slice(1)}
          </span>
        </span>
      </div>
      <p className="m-0 text-[15px] leading-6">{item.summary}</p>
      {item.facts.length > 0 && (
        <section>
          <h2 className={`${label} mb-2 mt-0`}>{zoneText.keyFacts}</h2>
          <dl className="m-0 grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-sm leading-5">
            {item.facts.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-muted">{f.label}</dt>
                <dd className="m-0 font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {item.compare && (
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className={`${label} m-0`}>{zoneText.compare}</h2>
            {item.compare.fullCompareId && (
              <Link to={comparePath(item.compare.fullCompareId)} className="text-[13px] font-semibold text-accent">
                {zoneText.fullComparison}
              </Link>
            )}
          </div>
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-md border border-line text-[13px] leading-[18px]">
            <thead>
              <tr>
                <th className="bg-surface-300 p-2 text-left" />
                {[item.name, ...item.compare.with].map((c) => (
                  <th key={c} scope="col" className="bg-surface-300 px-2.5 py-2 text-left font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.compare.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row" className="w-[84px] border-t border-line px-2.5 py-2 text-left align-top font-semibold text-muted">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className={`border-t border-line px-2.5 py-2 align-top ${r.best === i ? 'bg-accent-soft font-semibold' : ''}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <section>
        <h2 className={`${label} mb-2 mt-0`}>{zoneText.related}</h2>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {item.related.map((id) => {
            const rel = itemsById[id];
            const chip = 'rounded-pill border border-line px-[11px] py-[5px] text-[13px] font-semibold leading-[18px]';
            if (rel) {
              const text = rel.kind === 'object' ? `#${rel.number} ${rel.name}` : rel.name;
              return (
                <li key={id}>
                  <button type="button" onClick={() => onSelect(id)} className={`${chip} cursor-pointer bg-surface-200 text-ink hover:border-accent`}>
                    {text}
                  </button>
                </li>
              );
            }
            return (
              <li key={id}>
                <span className={`${chip} inline-block bg-surface-300 text-muted`} title={zoneText.comingSoon}>
                  {forwardRefs[id] ?? id} · {zoneText.comingSoon}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function EmptyState({ zone, items, onSelect }: { zone: Zone; items: Item[]; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <span className={`${label} text-accent`}>{zoneText.overviewTitle}</span>
      <h1 className="m-0 text-[28px] font-bold leading-[34px]">{zone.title}</h1>
      <p className="m-0 text-[15px] leading-6">{zone.blurb}</p>
      <p className="m-0 text-sm text-muted">{zoneText.emptyPrompt}</p>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {items.slice(0, 8).map((i) => (
          <li key={i.id}>
            <button type="button" onClick={() => onSelect(i.id)} className="cursor-pointer rounded-pill border border-line bg-surface-200 px-[11px] py-[5px] text-[13px] font-semibold text-ink hover:border-accent">
              #{i.number} {i.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
