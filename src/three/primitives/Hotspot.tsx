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
  const stop = (e: { stopPropagation: () => void }) => e.stopPropagation(); // keep the canvas from treating a click on a pin as a click on empty space
  return (
    <>
      {/* The number dots and the labels are separate layers: every label sits above every dot, so a label is never covered by a neighbouring pin. */}
      <Html position={anchor.position} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
        <button
          type="button"
          aria-pressed={selected}
          aria-label={`${number}. ${anchor.label}`}
          onClick={(e) => {
            stop(e);
            onSelect(itemId);
          }}
          onPointerEnter={() => hover(itemId)}
          onPointerLeave={() => hover(null)}
          onFocus={() => hover(itemId)}
          onBlur={() => hover(null)}
          className="pointer-events-auto relative flex -translate-x-[11px] -translate-y-[11px] cursor-pointer items-center border-0 bg-transparent p-0 text-[13px] font-semibold leading-[18px]"
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
        </button>
      </Html>
      <Html position={anchor.position} zIndexRange={[19, 10]} style={{ pointerEvents: 'none' }}>
        <span
          aria-hidden="true"
          onClick={(e) => {
            stop(e);
            onSelect(itemId);
          }}
          onPointerEnter={() => hover(itemId)}
          onPointerLeave={() => hover(null)}
          className={`pointer-events-auto relative -translate-y-1/2 translate-x-[17px] cursor-pointer whitespace-nowrap rounded-full px-2 py-[3px] text-[13px] font-semibold leading-[18px] shadow-marker ${selected ? 'inline-block' : 'hidden sm:inline-block'}`}
          style={selected ? { background: pin.accent, color: pin.surface } : { background: `${pin.surface}e6`, color: pin.ink }}
        >
          {anchor.label}
        </span>
      </Html>
    </>
  );
}
