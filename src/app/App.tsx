import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { Layout } from './Layout';
import { IndexPage } from '@/pages/IndexPage';
import { ComparePage } from '@/pages/ComparePage';
import { AboutPage } from '@/pages/AboutPage';

// The town page pulls in three.js, so it is code-split from the shell (hamburger, menu, placeholder pages).
const TownPage = lazy(() => import('@/pages/TownPage'));
const town = (
  <Suspense fallback={<p className="p-6 pt-20 text-muted">{chrome.loading}</p>}>
    <TownPage />
  </Suspense>
);

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={town} />
          <Route path="zone/:slug/:itemId?" element={town} />
          <Route path="index" element={<IndexPage />} />
          <Route path="compare/:compareId?" element={<ComparePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="*" element={town} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
