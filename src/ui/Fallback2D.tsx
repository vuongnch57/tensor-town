import { useFactoryStore } from '@/state/useFactoryStore';
import type { ReactNode } from 'react';
import { pin } from '@/three/core/palette';

export type Pin = { itemId: string; number: number; label: string; x: number; y: number };
type Props = { art: ReactNode; pins: Pin[]; onSelect: (id: string) => void; title: string; note: string };

/** No-WebGL view: a flat picture of the zone with the same numbered pins as the 3D scene. */
export function Fallback2D({ art, pins, onSelect, title, note }: Props) {
  const selectedId = useFactoryStore((s) => s.selectedId);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-[780px]">
        <svg viewBox="0 0 100 62" role="img" aria-label={title} className="block h-auto w-full">
          {art}
        </svg>
        {pins.map((p) => {
          const on = p.itemId === selectedId;
          return (
            <button
              key={p.itemId}
              type="button"
              aria-pressed={on}
              aria-label={`${p.number}. ${p.label}`}
              onClick={() => onSelect(p.itemId)}
              className="absolute grid h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-2 text-[11px] font-bold shadow-marker"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                ...(on
                  ? { background: pin.accent, color: pin.surface, borderColor: pin.surface, boxShadow: `0 0 0 4px ${pin.accent}4d` }
                  : { background: pin.surface, color: pin.ink, borderColor: pin.ink }),
              }}
            >
              {p.number}
            </button>
          );
        })}
      </div>
      <p className="mt-2 max-w-md text-center text-sm text-muted">{note}</p>
    </div>
  );
}
