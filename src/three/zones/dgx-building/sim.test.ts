import { describe, expect, it } from 'vitest';
import { NVLINK_GBPS, PCIE_GBPS, simulate } from './sim';

describe('zone 3 all-to-all model', () => {
  it('takes PCIe only as the reference', () => {
    expect(simulate({ interconnect: 'pcie' })).toEqual({ relativeTime: 1, speedup: 1 });
  });
  it('NVSwitch gives every GPU the full NVLink bandwidth to all peers', () => {
    const r = simulate({ interconnect: 'nvswitch' });
    expect(r.relativeTime).toBeCloseTo(PCIE_GBPS / NVLINK_GBPS, 10);
    expect(r.speedup).toBeCloseTo(NVLINK_GBPS / PCIE_GBPS, 10);
  });
  it('NVLink bridges between pairs barely help an all-to-all: six peers still share PCIe', () => {
    const r = simulate({ interconnect: 'nvlink' });
    expect(r.relativeTime).toBeLessThan(1);
    expect(r.relativeTime).toBeGreaterThan(0.8);
  });
  it('gets faster in the order PCIe, NVLink, NVLink + NVSwitch', () => {
    const t = (i: 'pcie' | 'nvlink' | 'nvswitch') => simulate({ interconnect: i }).relativeTime;
    expect(t('pcie')).toBeGreaterThan(t('nvlink'));
    expect(t('nvlink')).toBeGreaterThan(t('nvswitch'));
  });
});
