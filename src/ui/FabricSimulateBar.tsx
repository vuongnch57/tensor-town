import { useEffect, useMemo, useRef, useState } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { simulate } from '@/three/zones/dgx-building/sim';
import { fabricText } from '@/content/ui-text';
import { SegmentedControl } from './SegmentedControl';
import { StatCard } from './StatCard';

const MAX_RUN_MS = 3000;
const MIN_RUN_MS = 450;

/** Zone 3: pick how the GPUs are joined and run an all-to-all. The run takes as long as the relative exchange time says. */
export function FabricSimulateBar() {
  const interconnect = useFactoryStore((s) => s.fabricSim.interconnect);
  const setSim = useFactoryStore((s) => s.setFabricSim);
  const running = useFactoryStore((s) => s.fabricRunning);
  const setRunning = useFactoryStore((s) => s.setFabricRunning);
  const r = useMemo(() => simulate({ interconnect }), [interconnect]);
  const t = fabricText.simulate;
  const [barOn, setBarOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const duration = Math.max(MIN_RUN_MS, r.relativeTime * MAX_RUN_MS);

  useEffect(() => () => {
    clearTimeout(timer.current);
    setRunning(false);
  }, [setRunning]);

  const run = () => {
    if (running) return;
    setRunning(true);
    setBarOn(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setBarOn(true)));
    timer.current = setTimeout(() => {
      setRunning(false);
      setBarOn(false);
    }, duration);
  };

  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <SegmentedControl label={t.interconnect} value={interconnect} onChange={(v) => !running && setSim({ interconnect: v })} options={t.interconnectOptions} />
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="relative inline-flex h-9 cursor-pointer items-center overflow-hidden rounded-pill border border-accent bg-accent px-4 text-[13px] font-semibold text-accent-ink disabled:cursor-default disabled:opacity-90"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-black/20 ease-linear"
          style={{ width: barOn ? '100%' : '0%', transitionProperty: 'width', transitionDuration: barOn ? `${duration}ms` : '0ms' }}
        />
        <span className="relative">{running ? t.running : t.run}</span>
      </button>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <StatCard label={t.exchange} value={t.time(r.relativeTime)} pill={{ text: t.faster(r.speedup), tone: r.speedup > 1.05 ? 'ok' : 'warn' }} />
        <span className="text-xs text-muted">
          {t.reference} · {t.illustrative}
        </span>
      </div>
    </div>
  );
}
