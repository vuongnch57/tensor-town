import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { MAX_UNITS, simulate } from '@/three/zones/campus-expansion/sim';
import { campusText } from '@/content/ui-text';
import { SegmentedControl } from './SegmentedControl';

/** Zone 9: pick the design, who owns the capacity and how many units; the campus fills its slots as you go. */
export function CampusSimulateBar() {
  const { architecture, deployment, units } = useFactoryStore((s) => s.campusSim);
  const setSim = useFactoryStore((s) => s.setCampusSim);
  const r = useMemo(() => simulate({ architecture, deployment, units }), [architecture, deployment, units]);
  const t = campusText.simulate;
  const fmt = (v: number | null) => (v === null ? t.todo : v.toLocaleString('en-US'));
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <SegmentedControl label={t.architecture} value={architecture} onChange={(v) => setSim({ architecture: v })} options={t.architectureOptions} />
      <SegmentedControl label={t.deployment} value={deployment} onChange={(v) => setSim({ deployment: v })} options={t.deploymentOptions} />
      <label className="flex items-center gap-2 text-[13px] text-muted">
        {t.units}
        <input type="range" min={1} max={MAX_UNITS} step={1} value={units} onChange={(e) => setSim({ units: Number(e.target.value) })} aria-valuetext={String(units)} className="h-1.5 w-20 cursor-pointer accent-accent" />
        <b className="tabular w-4 text-ink">{units}</b>
      </label>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <span className="text-[13px] text-muted" aria-live="polite">
          {t.dgx} <b className="tabular text-ink">{fmt(r.dgx)}</b> · {t.gpus} <b className="tabular text-ink">{fmt(r.gpus)}</b> · {t.owned} <b className="tabular text-ink">{r.owned}</b> · {t.rented} <b className="tabular text-ink">{r.rented}</b>
        </span>
        <span className="text-xs text-muted">
          {t.story[deployment]} {t.illustrative}
        </span>
      </div>
    </div>
  );
}
