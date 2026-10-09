import { describe, expect, it } from 'vitest';
import { allItems } from '@/content/registry';
import { categoriesOf, filterItems, groupAZ, groupByZone } from './indexList';

const all = { query: '', kind: 'all', category: 'all' } as const;

describe('index list', () => {
  it('keeps everything with no filters', () => expect(filterItems(allItems, all)).toHaveLength(allItems.length));
  it('filters by type', () => {
    expect(filterItems(allItems, { ...all, kind: 'object' })).toHaveLength(19);
    expect(filterItems(allItems, { ...all, kind: 'concept' })).toHaveLength(10);
  });
  it('filters by category and by query (name, alias or category)', () => {
    expect(filterItems(allItems, { ...all, category: 'Memory' }).map((i) => i.id)).toEqual(['hbm', 'memory-bandwidth', 'delivery-truck']);
    expect(filterItems(allItems, { ...all, query: 'streaming' }).map((i) => i.id)).toEqual(['sm']);
    expect(filterItems(allItems, { ...all, query: 'zzzz' })).toEqual([]);
  });
  it('groups by zone with objects numbered first, skipping empty zones', () => {
    const g = groupByZone(allItems);
    expect(g.map((x) => x.zone)).toEqual(['gpu-hall', 'packing-station', 'dgx-building']);
    expect(g[0].items.map((i) => i.id).slice(0, 3)).toEqual(['data', 'cpu', 'gpu']);
    expect(g[0].items).toHaveLength(11);
    expect(g[1].items).toHaveLength(9);
    expect(g[2].items).toHaveLength(9);
  });
  it('groups A to Z by first letter, in order', () => {
    const g = groupAZ(allItems);
    expect(g.map((x) => x.key)).toEqual([...g.map((x) => x.key)].sort());
    expect(g.flatMap((x) => x.items)).toHaveLength(allItems.length);
  });
  it('lists each category once', () => expect(new Set(categoriesOf(allItems)).size).toBe(categoriesOf(allItems).length));
});
