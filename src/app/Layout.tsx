import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { zoneBySlug } from '@/content/zones';
import { chrome } from '@/content/chrome';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2.5 text-sm font-semibold rounded-sm ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`;

export function Layout() {
  const { slug } = useParams();
  const zone = slug ? zoneBySlug(slug) : undefined;
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface-200 px-4 py-2 md:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-ink no-underline">
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-accent" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-ink">
              <path d="M3 21V10l6 4V10l6 4V6l6 4v11z" />
            </svg>
          </span>
          {chrome.siteName}
        </Link>
        {zone && (
          <span className="hidden text-[15px] text-muted sm:inline">
            <span className="text-line">/ </span>Zone {zone.number} · <b className="font-semibold text-ink">{zone.title}</b>
          </span>
        )}
        <nav aria-label="Main" className="ml-auto flex">
          <NavLink to="/" end className={navClass}>Map</NavLink>
          <NavLink to="/index" className={navClass}>Index</NavLink>
          <NavLink to="/compare" className={navClass}>Compare</NavLink>
          <NavLink to="/about" className={navClass}>About</NavLink>
        </nav>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-line px-4 py-4 text-center text-sm text-muted md:px-6">{chrome.footer}</footer>
    </div>
  );
}
