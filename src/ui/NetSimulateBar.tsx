import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { simulate } from '@/three/zones/transport-network/sim';
import { netText } from '@/content/ui-text';
import { SegmentedControl } from './SegmentedControl';
import { StatCard } from './StatCard';

/** Zone 4: pick the network and how crowded the lanes are. The scene reacts as you drag. */
export function NetSimulateBar() {
  const { network, congestion } = useFactoryStore((s) => s.netSim);
  const setSim = useFactoryStore((s) => s.setNetSim);
  const r = useMemo(() => simulate({ network, congestion }), [network, congestion]);
  const t = netText.simulate;
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <SegmentedControl label={t.network} value={network} onChange={(v) => setSim({ network: v })} options={t.networkOptions} />
      <label className="flex items-center gap-2 text-[13px] text-muted">
        {t.congestion}
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(congestion * 100)}
          onChange={(e) => setSim({ congestion: Number(e.target.value) / 100 })}
          aria-valuetext={t.percent(congestion)}
          className="h-1.5 w-28 cursor-pointer accent-accent"
        />
        <b className="tabular w-9 text-ink">{t.percent(congestion)}</b>
      </label>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <StatCard label={t.throughput} value={t.percent(r.throughput)} />
        <StatCard label={t.dropped} value={t.percent(r.dropped)} pill={{ text: t.droppedPill(r.dropped), tone: r.dropped > 0 ? 'warn' : 'ok' }} />
        <span className="text-xs text-muted">{t.illustrative}</span>
      </div>
    </div>
  );
}
