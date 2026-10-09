import type { GpuSharing, ShareSimParams } from '@/content/types';

/**
 * Zone 7 toy model: the 100% utilization trap. ILLUSTRATIVE, NOT MEASURED.
 *
 * "GPU utilization" (what nvidia-smi shows) is the share of time at least one kernel was running.
 * "SM activity" (what DCGM can report) is the share of the GPU's SMs that were actually busy.
 * A small job keeps the first at 100% while using only a few SMs, which is the trap.
 *
 *   JOBS jobs share the GPU, each filling FOOTPRINT of its SMs while it runs.
 *
 *   one job        a kernel is always running                       utilization 1,  SM activity FOOTPRINT
 *   MIG            each job gets its own slice and they run at once  utilization 1,  SM activity JOBS * FOOTPRINT
 *   time-slicing   jobs take turns on the whole GPU, one at a time   utilization 1,  SM activity FOOTPRINT
 *   vGPU           virtual GPUs are time-sliced by the hypervisor    utilization 1,  SM activity FOOTPRINT (minus VGPU_OVERHEAD)
 *
 * `perJob` is how much of its stand-alone speed each job gets.
 */
export const JOBS = 3;
export const FOOTPRINT = 0.25;
export const VGPU_OVERHEAD = 0.05;

export type ShareResult = {
  /** Share of time a kernel is running, 0 to 1. */
  utilization: number;
  /** Share of SMs busy, 0 to 1. */
  smActivity: number;
  /** Each job's speed relative to having the GPU to itself, 0 to 1. */
  perJob: number;
  /** Whether one job's memory and faults are walled off from the others. */
  isolated: boolean;
};

export function simulate({ sharing }: ShareSimParams): ShareResult {
  switch (sharing) {
    case 'one':
      return { utilization: 1, smActivity: FOOTPRINT, perJob: 1, isolated: true };
    case 'mig':
      return { utilization: 1, smActivity: JOBS * FOOTPRINT, perJob: 1, isolated: true };
    case 'time-slicing':
      return { utilization: 1, smActivity: FOOTPRINT, perJob: 1 / JOBS, isolated: false };
    case 'vgpu':
      return { utilization: 1, smActivity: FOOTPRINT * (1 - VGPU_OVERHEAD), perJob: (1 - VGPU_OVERHEAD) / JOBS, isolated: true };
  }
}

export const SHARING_MODES: GpuSharing[] = ['one', 'mig', 'time-slicing', 'vgpu'];
