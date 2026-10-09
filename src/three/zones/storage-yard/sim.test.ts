import { describe, expect, it } from 'vitest';
import { CACHE_SHARE, MAX_EPOCH, nextEpoch, simulate } from './sim';

describe('zone 5 storage model', () => {
  it('takes epoch 1 through the CPU with no cache as the reference', () => {
    expect(simulate({ cache: false, path: 'cpu', epoch: 1 })).toEqual({ fromCache: 0, fetchTime: 1 });
  });
  it('without a cache every epoch costs the same', () => {
    for (let epoch = 1; epoch <= MAX_EPOCH; epoch++) expect(simulate({ cache: false, path: 'cpu', epoch }).fetchTime).toBe(1);
  });
  it('the cache does nothing in epoch 1 and pays off from epoch 2 on', () => {
    expect(simulate({ cache: true, path: 'cpu', epoch: 1 }).fromCache).toBe(0);
    const second = simulate({ cache: true, path: 'cpu', epoch: 2 });
    expect(second.fromCache).toBe(CACHE_SHARE);
    expect(second.fetchTime).toBeLessThan(1);
    expect(simulate({ cache: true, path: 'cpu', epoch: 4 })).toEqual(second);
  });
  it('GPUDirect Storage is faster than going through the CPU, with or without the cache', () => {
    for (const cache of [false, true]) {
      expect(simulate({ cache, path: 'gpudirect', epoch: 2 }).fetchTime).toBeLessThan(simulate({ cache, path: 'cpu', epoch: 2 }).fetchTime);
    }
  });
  it('cache and GPUDirect together are the fastest', () => {
    const best = simulate({ cache: true, path: 'gpudirect', epoch: 3 }).fetchTime;
    for (const cache of [false, true]) for (const path of ['cpu', 'gpudirect'] as const) expect(best).toBeLessThanOrEqual(simulate({ cache, path, epoch: 3 }).fetchTime);
  });
  it('steps through the epochs and wraps back to 1', () => {
    expect(nextEpoch(1)).toBe(2);
    expect(nextEpoch(MAX_EPOCH)).toBe(1);
  });
});
