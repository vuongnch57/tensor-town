import { describe, expect, it } from 'vitest';
import { NEEDS, simulate } from './sim';

describe('zone 6 need picker', () => {
  it('lights one station per need', () => {
    expect(simulate({ need: 'tools' }).station).toBe('ngc');
    expect(simulate({ need: 'prepare' }).station).toBe('rapids');
    expect(simulate({ need: 'train' }).station).toBe('training-line');
    expect(simulate({ need: 'optimize' }).station).toBe('tensorrt');
  });
  it('sends both serving needs to the shipping dock, to different bays', () => {
    expect(simulate({ need: 'serve-custom' })).toEqual({ station: 'shipping-dock', bay: 'triton' });
    expect(simulate({ need: 'serve-ready' })).toEqual({ station: 'shipping-dock', bay: 'nim' });
  });
  it('covers every station and only sets a bay for the dock', () => {
    const results = NEEDS.map((need) => simulate({ need }));
    expect(new Set(results.map((r) => r.station)).size).toBe(5);
    for (const r of results) expect(r.bay === undefined).toBe(r.station !== 'shipping-dock');
  });
});
