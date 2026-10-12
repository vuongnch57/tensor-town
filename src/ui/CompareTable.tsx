import type { CompareRow } from '@/content/types';

type Props = { columns: string[]; rows: CompareRow[]; caption: string };

/** Side-by-side comparison. The strongest cell in a row, when the row has one, gets the accent tint and bold text. */
export function CompareTable({ columns, rows, caption }: Props) {
  return (
    <>
    {/* Phones: one card per row, each column's value under its name. No sideways scrolling. */}
    <ul className="m-0 flex list-none flex-col gap-3 p-0 md:hidden" aria-label={caption}>
      {rows.map((r) => (
        <li key={r.label} className="rounded-md border border-line bg-surface-200 p-3.5">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">{r.label}</div>
          <dl className="m-0 mt-2 flex flex-col gap-2">
            {r.values.map((v, i) => (
              <div key={i} className={`rounded-md px-2.5 py-2 ${r.best === i ? 'bg-accent-soft' : 'bg-surface-100'}`}>
                <dt className="text-xs font-semibold text-muted">{columns[i]}</dt>
                <dd className={`m-0 mt-0.5 text-[14px] leading-5 ${r.best === i ? 'font-semibold' : ''}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
    <div className="hidden overflow-x-auto rounded-md border border-line md:block">
      <table className="w-full min-w-[420px] border-separate border-spacing-0 text-[14px] leading-5">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th className="bg-surface-300 p-3" />
            {columns.map((c) => (
              <th key={c} scope="col" className="bg-surface-300 px-3.5 py-3 text-left text-[15px] font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="w-[132px] border-t border-line px-3.5 py-3 text-left align-top font-semibold text-muted">
                {r.label}
              </th>
              {r.values.map((v, i) => (
                <td key={i} className={`border-t border-line px-3.5 py-3 align-top ${r.best === i ? 'bg-accent-soft font-semibold' : ''}`}>
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
