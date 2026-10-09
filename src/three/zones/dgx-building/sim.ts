import type { FabricInterconnect, FabricSimParams } from '@/content/types';

/**
 * Zone 3 toy model. ILLUSTRATIVE, NOT MEASURED.
 *
 * Every one of the 8 GPUs in a DGX H100 sends the same amount of data to each of its 7 peers (an "all-to-all").
 * Time is the data one GPU must push through its slowest path, in units of one peer's share, per GB/s.
 *
 *   PCIe only       all 7 peers go through PCIe Gen5 x16 (~128 GB/s)           -> 7 / 128
 *   NVLink (pairs)  1 peer sits across a bridge (900 GB/s); the other 6 still
 *                   share PCIe, which is the slower path                       -> max(1 / 900, 6 / 128)
 *   NVLink + NVSwitch  all 7 peers share the 900 GB/s NVLink of the GPU        -> 7 / 900
 *
 * Bandwidths are SPEC §8 facts (NVLink 900 GB/s per H100, PCIe Gen5 x16 ~128 GB/s). Results are shown relative to PCIe only.
 */
export const GPUS = 8;
export const PEERS = GPUS - 1;
export const PCIE_GBPS = 128;
export const NVLINK_GBPS = 900;
/** In the NVLink-only layout the scene pairs GPU rooms with bridges, so one peer is reachable over NVLink. */
export const NVLINK_PEERS_PER_GPU = 1;

export type FabricResult = {
  /** Exchange time relative to PCIe only (1 = same as PCIe only, lower is faster). */
  relativeTime: number;
  /** How many times faster than PCIe only. */
  speedup: number;
};

const rawTime = (i: FabricInterconnect): number => {
  switch (i) {
    case 'pcie':
      return PEERS / PCIE_GBPS;
    case 'nvlink':
      return Math.max(NVLINK_PEERS_PER_GPU / NVLINK_GBPS, (PEERS - NVLINK_PEERS_PER_GPU) / PCIE_GBPS);
    case 'nvswitch':
      return PEERS / NVLINK_GBPS;
  }
};

export function simulate({ interconnect }: FabricSimParams): FabricResult {
  const relativeTime = rawTime(interconnect) / rawTime('pcie');
  return { relativeTime, speedup: 1 / relativeTime };
}
