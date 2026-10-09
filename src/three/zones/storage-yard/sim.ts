import type { StorageSimParams } from '@/content/types';

/**
 * Zone 5 toy model. ILLUSTRATIVE, NOT MEASURED. The shapes tell the story; they are not benchmark numbers.
 *
 * Training reads the whole dataset once per epoch. The first epoch has to fetch everything from the parallel file system
 * (and, with the cache on, fills the local NVMe cache on the way). From epoch 2 on, the part that fits in the cache is re-read from it.
 *
 *   share read from cache   f = cache on and epoch >= 2 ? CACHE_SHARE : 0
 *   fetch time              ((1 - f) * FS_TIME + f * CACHE_TIME) * pathFactor
 *   path factor             through the CPU = CPU_PENALTY, GPUDirect Storage = 1
 *
 * Time is shown relative to epoch 1 through the CPU with no cache (= 1.00).
 */
/** The part of the dataset the local cache can hold. */
export const CACHE_SHARE = 0.6;
/** Time to fetch one unit of data from the parallel file system. */
export const FS_TIME = 1;
/** Time to fetch one unit of data from the local NVMe cache. */
export const CACHE_TIME = 0.2;
/** Extra work when every parcel is unpacked and repacked in the CPU's memory on the way. */
export const CPU_PENALTY = 1.5;
export const MAX_EPOCH = 4;

export type StorageResult = {
  /** Share of this epoch's reads served by the local cache, 0 to 1. */
  fromCache: number;
  /** Fetch time for the epoch relative to epoch 1 through the CPU with no cache (lower is faster). */
  fetchTime: number;
};

const REFERENCE = FS_TIME * CPU_PENALTY;

export function simulate({ cache, path, epoch }: StorageSimParams): StorageResult {
  const fromCache = cache && epoch >= 2 ? CACHE_SHARE : 0;
  const raw = (1 - fromCache) * FS_TIME + fromCache * CACHE_TIME;
  const factor = path === 'cpu' ? CPU_PENALTY : 1;
  return { fromCache, fetchTime: (raw * factor) / REFERENCE };
}

/** The epoch after `epoch`, wrapping back to 1 after the last one. */
export const nextEpoch = (epoch: number): number => (epoch >= MAX_EPOCH ? 1 : epoch + 1);
