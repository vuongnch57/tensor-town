import { describe, expect, it } from 'vitest';
import { checkContent, numbersIn, unverifiedNumbers } from './checks';
import { allItems, anchorsBySlug, forwardRefs, itemsInZone } from './registry';
import { comparisons } from './comparisons';
import type { Item } from './types';

const base: Item = { id: 'a', zone: 'gpu-hall', kind: 'object', number: 1, name: 'A', category: 'C', metaphor: 'm', summary: 's', facts: [], related: [], anchorId: 'a' };
const anchors = { 'gpu-hall': { a: { position: [0, 0, 0] as [number, number, number], label: 'A' }, b: { position: [1, 0, 0] as [number, number, number], label: 'B' } } };
const run = (items: Item[], forwardRefs: string[] = []) => checkContent({ items, anchors, comparisons: [], forwardRefs });

describe('shipped content', () => {
  it('passes every content check', () => {
    expect(checkContent({ items: allItems, anchors: anchorsBySlug as never, comparisons, forwardRefs: Object.keys(forwardRefs) })).toEqual([]);
  });
  it('has the 8 objects and 3 concepts of Zone 1, objects first', () => {
    const zone = itemsInZone('gpu-hall');
    expect(zone.filter((i) => i.kind === 'object')).toHaveLength(8);
    expect(zone.filter((i) => i.kind === 'concept')).toHaveLength(3);
    expect(zone.slice(0, 8).every((i) => i.kind === 'object')).toBe(true);
  });
});

describe('number extraction', () => {
  it('ignores product identifiers and ordinals', () => {
    expect(numbersIn('H100 SXM: 80 GB HBM3e · ~3.35 TB/s, L2 (50 MB), FP8, 4th generation')).toEqual(['80', '3.35', '50', '4']);
  });
  it('flags numbers outside SPEC §8 unless marked TODO(fact)', () => {
    expect(unverifiedNumbers('uses 64 workers')).toEqual(['64']);
    expect(unverifiedNumbers('uses 132 SMs')).toEqual([]);
    expect(unverifiedNumbers('TODO(fact) 64 workers')).toEqual([]);
  });
});

describe('checkContent', () => {
  it('accepts consistent content', () => {
    expect(run([base, { ...base, id: 'b', number: 2, anchorId: 'b', related: ['a'] }])).toEqual([]);
  });
  it('reports missing related ids, but allows listed forward references', () => {
    expect(run([{ ...base, related: ['zzz'] }])).toHaveLength(1);
    expect(run([{ ...base, related: ['zzz'] }], ['zzz'])).toEqual([]);
  });
  it('requires continuous unique object numbers', () => {
    expect(run([base, { ...base, id: 'b', number: 3, anchorId: 'b' }]).join()).toMatch(/continuous/);
    expect(run([base, { ...base, id: 'b', number: 1, anchorId: 'b' }]).join()).toMatch(/continuous/);
  });
  it('requires an anchor for every object and none for concepts', () => {
    expect(run([{ ...base, anchorId: 'missing' }]).join()).toMatch(/missing/);
    expect(run([{ ...base, kind: 'concept' }]).join()).toMatch(/concept must not/);
  });
  it('rejects unverified numbers in item text', () => {
    expect(run([{ ...base, summary: 'It has 64 cores.' }]).join()).toMatch(/not in SPEC/);
  });
});
