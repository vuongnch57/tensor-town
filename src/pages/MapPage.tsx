import { Link } from 'react-router-dom';
import { zones } from '@/content/zones';
import { chrome } from '@/content/chrome';
import { zonePath } from '@/lib/urls';
import { PagePlaceholder } from '@/ui/PagePlaceholder';

export function MapPage() {
  return (
    <PagePlaceholder {...chrome.placeholders.map}>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {zones.map((z) => (
          <li key={z.slug}>
            <Link to={zonePath(z.slug)} className="block rounded-md border border-line bg-surface-200 p-4 no-underline hover:border-accent">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Zone {z.number}</span>
              <span className="block font-semibold">{z.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PagePlaceholder>
  );
}
