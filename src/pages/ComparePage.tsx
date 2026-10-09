import { Link, Navigate, useParams } from 'react-router-dom';
import { comparisons } from '@/content/comparisons';
import { compareText } from '@/content/pages';
import { zoneBySlug } from '@/content/zones';
import { comparePath, zonePath } from '@/lib/urls';
import { CompareTable } from '@/ui/CompareTable';

export function ComparePage() {
  const { compareId } = useParams();
  const current = comparisons.find((c) => c.id === compareId);
  if (compareId && !current) return <Navigate to={comparePath(comparisons[0].id)} replace />;
  const c = current ?? comparisons[0];
  const zone = zoneBySlug(c.zones[0]);
  return (
    <section className="mx-auto w-full max-w-[1100px] px-4 pb-12 pt-20 md:px-6">
      <h1 className="text-[28px] font-bold leading-[34px]">{compareText.title}</h1>
      <p className="mt-2 text-muted">{compareText.intro}</p>
      <div className="mt-6 grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label={compareText.listLabel}>
          <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 md:flex-col md:overflow-visible">
            {comparisons.map((x) => (
              <li key={x.id} className="shrink-0">
                <Link
                  to={comparePath(x.id)}
                  aria-current={x.id === c.id ? 'page' : undefined}
                  className={`block rounded-md border px-3.5 py-2.5 text-sm font-semibold no-underline ${x.id === c.id ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface-200 text-ink hover:border-accent'}`}
                >
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex min-w-0 flex-col gap-5">
          <h2 className="m-0 text-xl font-semibold leading-7">{c.title}</h2>
          <CompareTable columns={c.columns} rows={c.rows} caption={c.title} />
          <section className="rounded-md border border-line bg-surface-200 p-4">
            <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-accent">{compareText.whyConfused}</h3>
            <p className="mb-0 mt-2 text-[15px] leading-6">{c.whyConfused}</p>
          </section>
          {zone && (
            <Link to={zonePath(zone.slug)} className="self-start text-[14px] font-semibold text-accent">
              {compareText.inZone(zone.title)}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
