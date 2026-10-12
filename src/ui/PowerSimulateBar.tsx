import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { simulate, IT_RANGE } from '@/three/zones/power-cooling/sim';
import { powerText } from '@/content/ui-text';

/** Zone 8: slide the rack density and the two powers; the scene shows the cooling it calls for and the PUE needle moves. */
export function PowerSimulateBar() {
  const { density, itMW, facilityMW } = useFactoryStore((s) => s.powerSim);
  const setSim = useFactoryStore((s) => s.setPowerSim);
  const r = useMemo(() => simulate({ density, itMW, facilityMW }), [density, itMW, facilityMW]);
  const t = powerText.simulate;
  const slider = (label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void, shown: string) => (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={shown} className="h-1.5 w-24 cursor-pointer accent-accent" />
      <b className="tabular w-[4.2rem] text-ink">{shown}</b>
    </label>
  );
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      {slider(t.density, Math.round(density * 100), 0, 100, 5, (v) => setSim({ density: v / 100 }), t.level(density))}
      {slider(t.it, itMW, IT_RANGE.min, IT_RANGE.max, 1, (v) => setSim({ itMW: v }), t.mw(itMW))}
      {slider(t.facility, facilityMW, IT_RANGE.min, IT_RANGE.max * 2, 1, (v) => setSim({ facilityMW: v }), t.mw(facilityMW))}
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <span className="text-[13px] text-muted" aria-live="polite">
          {t.suggested} <b className="text-ink">{t.cooling[r.cooling]}</b> · {t.pue} <b className="tabular text-ink">{r.pue.toFixed(2)}</b> · {t.overhead} <b className="tabular text-ink">{t.mw(r.overheadMW)}</b>
        </span>
        <span className="text-xs text-muted">
          {t.why[r.cooling]} {facilityMW < itMW ? t.floorNote : ''} {t.illustrative}
        </span>
      </div>
    </div>
  );
}
