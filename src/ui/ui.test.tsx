// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { itemsById, itemsInZone } from '@/content/registry';
import { zoneBySlug } from '@/content/zones';
import { DetailPanel } from './DetailPanel';
import { ZoneIndex } from './ZoneIndex';

afterEach(cleanup);
const zone = zoneBySlug('gpu-hall')!;
const items = itemsInZone('gpu-hall');

describe('ZoneIndex', () => {
  it('lists 8 numbered objects then 3 concepts with counts', () => {
    render(<MemoryRouter><ZoneIndex zone={zone} items={items} selectedId="hbm" onSelect={() => {}} /></MemoryRouter>);
    expect(screen.getByText('8 clickable objects · 3 concepts')).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(11);
    expect(screen.getByText('HBM').closest('a')?.getAttribute('aria-current')).toBe('true');
  });
  it('selects an item through onSelect', () => {
    const onSelect = vi.fn();
    render(<MemoryRouter><ZoneIndex zone={zone} items={items} selectedId={null} onSelect={onSelect} /></MemoryRouter>);
    fireEvent.click(screen.getByText('SM'));
    expect(onSelect).toHaveBeenCalledWith('sm');
  });
});

describe('DetailPanel', () => {
  it('renders every part of an item in order', () => {
    render(<MemoryRouter><DetailPanel zone={zone} item={itemsById.hbm} items={items} onSelect={() => {}} /></MemoryRouter>);
    const text = document.body.textContent ?? '';
    const order = ['Memory · Zone 1 · #7', 'HBM', 'In the factory:', 'Key facts', 'Compare', 'Related'].map((t) => text.indexOf(t));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(screen.getByText('Full comparison ›')).toBeTruthy();
  });
  it('shows cross-zone related items as chips that open them', () => {
    render(<MemoryRouter><DetailPanel zone={zone} item={itemsById.hbm} items={items} onSelect={() => {}} /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /GPUDirect Storage/ })).toBeTruthy();
    expect(screen.queryByText(/coming soon/)).toBeNull();
  });
  it('shows the empty state with no selection', () => {
    render(<MemoryRouter><DetailPanel zone={zone} item={null} items={items} onSelect={() => {}} /></MemoryRouter>);
    expect(screen.getByText(/Click any numbered object/)).toBeTruthy();
  });
});
