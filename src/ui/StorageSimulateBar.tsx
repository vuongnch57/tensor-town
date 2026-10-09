import { useMemo } from 'react';
import { useFactoryStore } from '@/state/useFactoryStore';
import { MAX_EPOCH, nextEpoch, simulate } from '@/three/zones/storage-yard/sim';
import { storageText } from '@/content/ui-text';
import { SegmentedControl } from './SegmentedControl';
import { StatCard } from './StatCard';

/** Zone 5: cache on or off, the path to the GPU, and a button that walks through the epochs. */
export function StorageSimulateBar() {
  const { cache, path, epoch } = useFactoryStore((s) => s.storageSim);
  const setSim = useFactoryStore((s) => s.setStorageSim);
  const r = useMemo(() => simulate({ cache, path, epoch }), [cache, path, epoch]);
  const t = storageText.simulate;
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <SegmentedControl label={t.cache} value={cache ? 'on' : 'off'} onChange={(v) => setSim({ cache: v === 'on' })} options={t.cacheOptions} />
      <SegmentedControl label={t.path} value={path} onChange={(v) => setSim({ path: v })} options={t.pathOptions} />
      <button
        type="button"
        onClick={() => setSim({ epoch: nextEpoch(epoch) })}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-pill border border-accent bg-accent px-4 text-[13px] font-semibold text-accent-ink"
      >
        <span className="tabular opacity-80">{t.epoch(epoch)}</span>
        <span>{epoch >= MAX_EPOCH ? t.restart : t.next}</span>
      </button>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <StatCard label={t.fetch} value={t.time(r.fetchTime)} pill={{ text: t.faster(r.fetchTime), tone: r.fetchTime < 0.95 ? 'ok' : 'warn' }} />
        <StatCard label={t.fromCache} value={t.percent(r.fromCache)} />
        <span className="text-xs text-muted">{t.illustrative}</span>
      </div>
    </div>
  );
}
