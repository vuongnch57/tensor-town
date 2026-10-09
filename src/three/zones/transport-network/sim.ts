import type { NetSimParams, NetworkKind } from '@/content/types';

/**
 * Zone 4 toy model. ILLUSTRATIVE, NOT MEASURED. The shapes are chosen to tell the story, not to match a benchmark.
 *
 * Congestion c (0 = empty lanes, 1 = jammed) is how crowded the shared lanes are.
 *
 *   InfiniBand   lossless: nothing is dropped; waiting for credit costs a little speed          dropped 0,            speed 1 - 0.15c
 *   Ethernet     parcels start falling off the road once c passes 0.25; every one is re-sent    dropped up to 0.40,   speed (1 - 0.3c)(1 - 1.5 dropped)
 *   Spectrum-X   adaptive routing steers parcels round the jam; only near the limit does any fall dropped up to 0.04,   speed 1 - 0.2c - 1.5 dropped
 *
 * Results are shares: effective throughput as a share of the ideal, and the share of parcels dropped.
 */
export type NetResult = {
  /** Effective throughput as a share of the lane's ideal speed, 0 to 1. */
  throughput: number;
  /** Share of parcels dropped and re-sent, 0 to 1. */
  dropped: number;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const over = (c: number, from: number) => Math.max(0, c - from) / (1 - from);

export function simulate({ network, congestion }: NetSimParams): NetResult {
  const c = clamp01(congestion);
  switch (network) {
    case 'infiniband':
      return { throughput: 1 - 0.15 * c, dropped: 0 };
    case 'ethernet': {
      const dropped = 0.4 * over(c, 0.25);
      return { throughput: (1 - 0.3 * c) * (1 - 1.5 * dropped), dropped };
    }
    case 'spectrumx': {
      const dropped = 0.04 * over(c, 0.6);
      return { throughput: 1 - 0.2 * c - 1.5 * dropped, dropped };
    }
  }
}

export const NETWORKS: NetworkKind[] = ['infiniband', 'ethernet', 'spectrumx'];
