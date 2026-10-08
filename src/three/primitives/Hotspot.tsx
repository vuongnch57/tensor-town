import { Html } from '@react-three/drei';
import { useFactoryStore } from '@/state/useFactoryStore';
import type { Anchor } from '@/content/types';
import { pin } from '../core/palette';

type Props = { itemId: string; number: number; anchor: Anchor; onSelect: (id: string) => void };

/**
 * Numbered pin attached to an object. A real button with aria-pressed (SPEC §4.10).
 * Below 640 px only the dot shows; the selected pin keeps its label.
 */
export function Hotspot({ itemId, number, anchor, onSelect }: Props) {
  const selected = useFactoryStore((s) => s.selectedId === itemId);
  const hovered = useFactoryStore((s) => s.hoveredId === itemId);
  const hover = useFactoryStore((s) => s.hover);
  return (
    <Html position={anchor.position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${number}. ${anchor.label}`}
        onClick={(e) => {
          e.stopPropagation(); // keep the canvas from treating this as a click on empty space
          onSelect(itemId);
        }}
        onPointerEnter={() => hover(itemId)}
        onPointerLeave={() => hover(null)}
        onFocus={() => hover(itemId)}
        onBlur={() => hover(null)}
        className="pointer-events-auto relative flex -translate-x-[11px] -translate-y-[11px] cursor-pointer items-center gap-1.5 whitespace-nowrap border-0 bg-transparent p-0 text-[13px] font-semibold leading-[18px]"
        style={{ color: pin.ink }}
      >
        <span
          className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold leading-none shadow-marker transition-transform ${hovered && !selected ? 'scale-[1.15]' : ''}`}
          style={
            selected
              ? { background: pin.accent, color: pin.surface, borderColor: pin.surface, boxShadow: `0 0 0 5px ${pin.accent}4d` }
              : { background: pin.surface, color: pin.ink, borderColor: pin.ink }
          }
        >
          {number}
        </span>
        <span
          className={`rounded-full px-2 py-[3px] shadow-marker ${selected ? 'inline' : 'hidden sm:inline'}`}
          style={selected ? { background: pin.accent, color: pin.surface } : { background: `${pin.surface}e6` }}
        >
          {anchor.label}
        </span>
      </button>
    </Html>
  );
}
