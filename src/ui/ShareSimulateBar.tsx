import { useFactoryStore } from '@/state/useFactoryStore';
import { shareText } from '@/content/ui-text';
import type { GpuSharing } from '@/content/types';
import { simulate } from '@/three/zones/control-room/sim';

const pct = (v: number) => Math.round(v * 100);

/** Zone 7: pick how three small jobs share a GPU and watch GPU utilization and SM activity disagree. */
export function ShareSimulateBar() {
  const sharing = useFactoryStore((s) => s.shareSim.sharing);
  const setSim = useFactoryStore((s) => s.setShareSim);
  const t = shareText.simulate;
  const r = simulate({ sharing });
  const sm = pct(r.smActivity);
  const trap = sm < 50;
  return (
    <div className="m-3 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[16px] bg-surface-200 px-3.5 py-2.5 shadow-panel">
      <span className="text-xs font-semibold uppercase tracking-[0.06em] text-accent">{t.title}</span>
      <label className="flex items-center gap-2 text-[13px] text-muted">
        {t.mode}
        <select
          value={sharing}
          onChange={(e) => setSim({ sharing: e.target.value as GpuSharing })}
          className="h-9 cursor-pointer rounded-[12px] border border-line bg-surface-300 px-2.5 text-[13px] font-semibold text-ink"
        >
          {t.modeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col gap-0.5 sm:ml-auto sm:items-end">
        <span className="text-[13px] text-muted" aria-live="polite">
          {t.utilization} <b className="text-ink">{pct(r.utilization)}%</b> · {t.sm} <b className="text-ink">{sm}%</b> · {t.perJob} <b className="text-ink">{pct(r.perJob)}%</b> · {t.isolation}{' '}
          <b className="text-ink">{r.isolated ? t.isolated : t.notIsolated}</b>
        </span>
        <span className="text-xs text-muted">
          {trap ? t.trap(sm) : t.fine} {t.illustrative}
        </span>
      </div>
    </div>
  );
}
