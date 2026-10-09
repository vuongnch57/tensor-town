import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { districtBySlug } from '@/content/town';
import { useFactoryStore } from '@/state/useFactoryStore';
import { HamburgerButton } from '@/ui/HamburgerButton';
import { MenuModal } from '@/ui/MenuModal';

/**
 * No navigation bar: only a small hamburger and the wordmark (SPEC §3.6). On the town pages the scene fills the
 * viewport and these float over it; on the other pages they sit above normal content.
 */
export function Layout() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const setMenuOpen = useFactoryStore((s) => s.setMenuOpen);
  const district = slug ? districtBySlug(slug) : undefined;
  const isTown = pathname === '/' || pathname.startsWith('/zone/');

  // "/" opens the menu (search focused) unless the user is typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === '/' && !(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable))) {
        e.preventDefault();
        setMenuOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMenuOpen]);

  return (
    <div className={`flex flex-col ${isTown ? 'h-screen' : 'min-h-screen'}`}>
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center gap-3 px-4 pt-3">
        <div className="pointer-events-auto flex items-center gap-3">
          <HamburgerButton />
          <Link to="/" className="rounded-md bg-surface-200/85 px-3 py-1.5 text-sm font-semibold text-ink no-underline">
            {chrome.siteName}
            {district && <span className="font-normal text-muted"> / {district.name}</span>}
          </Link>
          {district && (
            <button type="button" onClick={() => navigate('/')} className="cursor-pointer rounded-md border border-line bg-surface-200 px-3 py-1.5 text-sm font-semibold text-ink shadow-panel">
              {chrome.backToTown}
            </button>
          )}
        </div>
      </div>
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      {isTown ? (
        <footer className="pointer-events-none absolute bottom-2 left-0 right-0 z-10 px-4 text-center text-xs text-muted">{chrome.footer}</footer>
      ) : (
        <footer className="border-t border-line px-4 py-4 text-center text-sm text-muted md:px-6">{chrome.footer}</footer>
      )}
      <MenuModal />
    </div>
  );
}
