import { useFactoryStore } from '@/state/useFactoryStore';
import { lineText } from '@/content/ui-text';
import type { LineNeed } from '@/content/types';

/** Zone 6: pick what the business needs and see which station of the line answers it. */
export function LineSimulateBar() {
  const need = useFactoryStore((s) => s.lineSim.need);
  const setSim = useFactoryStore((s) => s.setLineSim);
  const t = lineText.simulate;
  const a = t.answers[need];
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <label className="flex items-center gap-2 text-[13px] text-muted">
        {t.need}
        <select
          value={need}
          onChange={(e) => setSim({ need: e.target.value as LineNeed })}
          className="h-9 cursor-pointer rounded-[12px] border border-line bg-surface-300 px-2.5 text-[13px] font-semibold text-ink"
        >
          {t.needOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <span className="text-[13px] text-muted" aria-live="polite">
          {t.lights} <b className="text-ink">{a.station}</b>
        </span>
        <span className="text-xs text-muted">
          {a.why} {t.illustrative}
        </span>
      </div>
    </div>
  );
}
