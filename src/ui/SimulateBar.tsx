import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { simulate } from '@/three/zones/gpu-hall/sim';
import { gpuHallText } from '@/content/ui-text';
import { SegmentedControl } from './SegmentedControl';
import { StatCard } from './StatCard';

export function SimulateBar() {
  const sim = useFactoryStore((s) => s.sim);
  const setSim = useFactoryStore((s) => s.setSim);
  const r = useMemo(() => simulate(sim), [sim]);
  const t = gpuHallText.simulate;
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <SegmentedControl label={t.workload} value={sim.workload} onChange={(workload) => setSim({ workload })} options={t.workloadOptions} />
      <SegmentedControl label={t.gpu} value={sim.gpu} onChange={(gpu) => setSim({ gpu })} options={t.gpuOptions} />
      <SegmentedControl label={t.format} value={sim.format} onChange={(format) => setSim({ format })} options={t.formatOptions} />
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <StatCard
          label={t.smBusy}
          value={`${Math.round(r.smBusy * 100)}%`}
          pill={r.bottleneck === 'memory' ? { text: t.memoryBound, tone: 'warn' } : { text: t.computeBound, tone: 'ok' }}
        />
        <span className="text-xs text-muted">{t.illustrative}</span>
      </div>
    </div>
  );
}
