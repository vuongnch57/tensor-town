import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { MapPage } from '@/pages/MapPage';
import { IndexPage } from '@/pages/IndexPage';
import { ComparePage } from '@/pages/ComparePage';
import { AboutPage } from '@/pages/AboutPage';

// The zone page pulls in three.js, so it is code-split.
const ZonePage = lazy(() => import('@/pages/ZonePage'));

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MapPage />} />
          <Route
            path="zone/:slug/:itemId?"
            element={
              <Suspense fallback={<p className="p-6 text-muted">Loading zone…</p>}>
                <ZonePage />
              </Suspense>
            }
          />
          <Route path="index" element={<IndexPage />} />
          <Route path="compare/:compareId?" element={<ComparePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={<MapPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
