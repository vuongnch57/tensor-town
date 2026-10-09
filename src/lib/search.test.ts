import { describe, expect, it } from 'vitest';
import { comparisons } from '@/content/comparisons';
import { allItems } from '@/content/registry';
import { search, searchDistricts } from './search';

describe('search', () => {
  it('finds every item by its name', () => {
    for (const i of allItems) expect(search(i.name).items.map((h) => h.id), i.name).toContain(i.id);
  });
  it('finds every comparison by its title', () => {
    for (const c of comparisons) expect(search(c.title).comparisons.map((h) => h.id), c.title).toContain(c.id);
  });
  it('ranks the exact name first', () => {
    expect(search('HBM').items[0].id).toBe('hbm');
    expect(search('sm').items[0].id).toBe('sm');
    expect(search('CUDA core').items[0].id).toBe('cuda-core');
  });
  it('finds items by alias and by spelled-out name', () => {
    expect(search('streaming multiprocessor').items[0].id).toBe('sm');
    expect(search('high bandwidth memory').items[0].id).toBe('hbm');
    expect(search('graphics processing unit').items.map((h) => h.id)).toContain('gpu');
  });
  it('matches the start of a word and requires every word', () => {
    expect(search('tens').items.map((h) => h.id)).toContain('tensor-core');
    expect(search('hbm gddr').comparisons.map((h) => h.id)).toEqual(['hbm-vs-gddr']);
    expect(search('hbm zzzz').items).toEqual([]);
  });
  it('is case and punctuation insensitive', () => {
    expect(search('  Memory-  VS compute ').items.map((h) => h.id)).toContain('memory-vs-compute-bound');
  });
  it('returns nothing for an empty query', () => expect(search('   ')).toEqual({ items: [], comparisons: [] }));
  it('links items to their zone page and comparisons to the compare page', () => {
    expect(search('HBM').items[0].to).toBe('/zone/gpu-hall/hbm');
    expect(search('HBM vs GDDR').comparisons[0].to).toBe('/compare/hbm-vs-gddr');
  });
});

describe('searchDistricts', () => {
  it('pulses the district of every match and the district named', () => {
    expect(searchDistricts('hbm')).toEqual(['gpu-hall']);
    expect(searchDistricts('harbour')).toContain('storage-yard');
    expect(searchDistricts('')).toEqual([]);
    expect(searchDistricts('zzzz')).toEqual([]);
  });
});

describe('search: Zone 2', () => {
  it('finds the number formats and the truck', () => {
    expect(search('fp8').items[0].id).toBe('fp8');
    expect(search('truck').items.map((i) => i.id)).toContain('delivery-truck');
    expect(search('quantization').items.map((i) => i.id)).toContain('quantization');
  });
});

describe('search: Zone 3', () => {
  it('finds the interconnects, boards and systems', () => {
    expect(search('nvswitch').items[0].id).toBe('nvswitch-hub');
    expect(search('nvlink').items.map((i) => i.id)).toContain('nvlink-bridge');
    expect(search('hgx').items.map((i) => i.id)).toContain('hgx-board');
    expect(search('gh200').items.map((i) => i.id)).toContain('grace-hopper');
  });
  it('finds the Zone 3 comparisons', () => {
    expect(search('nvswitch').comparisons.map((c) => c.id)).toContain('nvlink-nvswitch-pcie');
  });
});
