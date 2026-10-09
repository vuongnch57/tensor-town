import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { simulate } from '@/three/zones/packing-station/sim';
import { packText } from '@/content/ui-text';
import { SegmentedControl } from './SegmentedControl';
import { StatCard } from './StatCard';

/** Zone 2: pick a number format and a model size to see how much memory the weights need. */
export function PackSimulateBar() {
  const sim = useFactoryStore((s) => s.packSim);
  const setSim = useFactoryStore((s) => s.setPackSim);
  const r = useMemo(() => simulate(sim), [sim]);
  const t = packText.simulate;
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <SegmentedControl label={t.format} value={sim.format} onChange={(format) => setSim({ format })} options={t.formatOptions} />
      <SegmentedControl label={t.model} value={sim.model} onChange={(model) => setSim({ model })} options={t.modelOptions} />
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <StatCard label={t.weights} value={t.gb(r.weightGB)} pill={r.fitsOneGpu ? { text: t.fitsYes, tone: 'ok' } : { text: t.fitsNo, tone: 'warn' }} />
        <span className="text-xs text-muted">{t.illustrative}</span>
      </div>
    </div>
  );
}
