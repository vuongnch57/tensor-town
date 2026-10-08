import type { ReactNode } from 'react';

type Props = { label: string; value: string; pill?: { text: string; tone: 'warn' | 'ok' } };

/** One simulation number, with an optional status pill (always names the state in text). */
export function StatCard({ label, value, pill }: Props) {
  return (
    <div className="flex items-center gap-2.5 text-[13px]" aria-live="polite">
      <span className="text-muted">
        {label} <b className="tabular text-ink">{value}</b>
      </span>
      {pill && <Pill tone={pill.tone}>{pill.text}</Pill>}
    </div>
  );
}

function Pill({ tone, children }: { tone: 'warn' | 'ok'; children: ReactNode }) {
  return (
    <span className={`rounded-pill px-[9px] py-[3px] font-semibold ${tone === 'warn' ? 'bg-warn-soft text-warn' : 'bg-accent-soft text-accent'}`}>● {children}</span>
  );
}
