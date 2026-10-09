type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = { label: string; value: T; options: Option<T>[]; onChange: (v: T) => void };

export function SegmentedControl<T extends string>({ label, value, options, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-[12px] bg-surface-300 p-[3px]">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`rounded-[9px] border-0 px-2.5 py-[7px] text-[13px] font-semibold leading-[18px] ${on ? 'bg-surface-200 text-ink shadow-marker' : 'bg-transparent text-muted hover:text-ink'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
