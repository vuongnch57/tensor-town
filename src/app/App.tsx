import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { itemsInZone } from '@/content/registry';
import { isZoneSlug } from '@/content/zones';
import type { ZoneSlug } from '@/content/types';
import { Layout } from './Layout';
import { IndexPage } from '@/pages/IndexPage';
import { ComparePage } from '@/pages/ComparePage';
import { AboutPage } from '@/pages/AboutPage';

// The town page pulls in three.js, so it is code-split from the shell (hamburger, menu, placeholder pages).
const TownPage = lazy(() => import('@/pages/TownPage'));
const ZonePage = lazy(() => import('@/pages/ZonePage'));
const town = (
  <Suspense fallback={<p className="p-6 pt-20 text-muted">{chrome.loading}</p>}>
    <TownPage />
  </Suspense>
);

/** `/zone/:slug` flies into the district. A zone that has built content also serves `/zone/:slug/:itemId` as its detail page. */
function ZoneRoute() {
  const { slug, itemId } = useParams();
  const zone: ZoneSlug | null = slug && isZoneSlug(slug) ? slug : null;
  if (itemId && zone && itemsInZone(zone).length > 0) {
    return (
      <Suspense fallback={<p className="p-6 pt-20 text-muted">{chrome.loading}</p>}>
        <div className="flex flex-1 flex-col pt-14">
          <ZonePage />
        </div>
      </Suspense>
    );
  }
  return town;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={town} />
          <Route path="zone/:slug/:itemId?" element={<ZoneRoute />} />
          <Route path="index" element={<IndexPage />} />
          <Route path="compare/:compareId?" element={<ComparePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={town} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
