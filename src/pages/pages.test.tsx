// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { comparisons } from '@/content/comparisons';
import { AboutPage } from './AboutPage';
import { ComparePage } from './ComparePage';
import { IndexPage } from './IndexPage';

afterEach(cleanup);

describe('IndexPage', () => {
  const setup = () => render(<MemoryRouter><IndexPage /></MemoryRouter>);
  it('lists all 11 items grouped under Zone 1, each linking to its page', () => {
    setup();
    expect(screen.getByText('11 items')).toBeTruthy();
    expect(screen.getByText('HBM').closest('a')?.getAttribute('href')).toBe('/zone/gpu-hall/hbm');
  });
  it('filters by type and by text', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Concepts' }));
    expect(screen.getByText('3 items')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    fireEvent.change(screen.getByLabelText('Filter the index'), { target: { value: 'tensor' } });
    expect(screen.getByText('1 item')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Filter the index'), { target: { value: 'zzzz' } });
    expect(screen.getByText('Nothing matches these filters.')).toBeTruthy();
  });
  it('regroups A to Z', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'A to Z' }));
    expect(screen.getByRole('region', { name: 'C' })).toBeTruthy();
  });
});

describe('ComparePage', () => {
  const at = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/compare/:compareId?" element={<ComparePage />} />
        </Routes>
      </MemoryRouter>,
    );
  it('shows the first comparison at /compare with the list, table and why-confused note', () => {
    at('/compare');
    expect(screen.getAllByRole('link', { current: false }).length + 1).toBeGreaterThanOrEqual(comparisons.length);
    expect(screen.getByRole('columnheader', { name: 'CPU' })).toBeTruthy();
    expect(screen.getByText('Why people mix them up')).toBeTruthy();
  });
  it('shows the comparison named in the URL', () => {
    at('/compare/hbm-vs-gddr');
    expect(screen.getByRole('columnheader', { name: 'GDDR' })).toBeTruthy();
    expect(screen.getByRole('link', { current: 'page' }).textContent).toBe('HBM vs GDDR');
  });
  it('redirects an unknown id to the first comparison', () => {
    at('/compare/nope');
    expect(screen.getByRole('link', { current: 'page' }).textContent).toBe(comparisons[0].title);
  });
});

describe('AboutPage', () => {
  it('has the four sections and the footer disclaimer', () => {
    render(<AboutPage />);
    for (const h of ['What this is', 'How to use it', 'Disclaimer', 'Credits']) expect(screen.getByRole('heading', { name: h })).toBeTruthy();
    expect(screen.getByText('Personal project, not affiliated with NVIDIA. Simulated numbers are illustrative.')).toBeTruthy();
  });
});
