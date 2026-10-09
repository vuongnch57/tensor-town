import { chrome } from '@/content/chrome';
import { useFactoryStore } from '@/state/useFactoryStore';

/** The only permanent navigation control: a small icon button that opens the menu modal (SPEC §3.6). */
export function HamburgerButton() {
  const setMenuOpen = useFactoryStore((s) => s.setMenuOpen);
  return (
    <button
      type="button"
      onClick={() => setMenuOpen(true)}
      aria-label={chrome.menu.open}
      aria-haspopup="dialog"
      className="grid h-10 w-10 shrink-0 cursor-pointer place-content-center gap-1 rounded-md border border-line bg-surface-200 p-0 shadow-panel"
    >
      <span className="block h-0.5 w-[18px] rounded-sm bg-ink" />
      <span className="block h-0.5 w-[18px] rounded-sm bg-ink" />
      <span className="block h-0.5 w-[18px] rounded-sm bg-ink" />
    </button>
  );
}
