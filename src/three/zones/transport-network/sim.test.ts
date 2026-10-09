import { describe, expect, it } from 'vitest';
import { NETWORKS, simulate } from './sim';

const steps = Array.from({ length: 21 }, (_, i) => i / 20);

describe('zone 4 network model', () => {
  it('is ideal on an empty network, whatever the network', () => {
    for (const network of NETWORKS) expect(simulate({ network, congestion: 0 })).toEqual({ throughput: 1, dropped: 0 });
  });
  it('InfiniBand never drops a parcel', () => {
    for (const congestion of steps) expect(simulate({ network: 'infiniband', congestion }).dropped).toBe(0);
  });
  it('Ethernet drops more parcels as congestion rises, and only past a threshold', () => {
    expect(simulate({ network: 'ethernet', congestion: 0.2 }).dropped).toBe(0);
    expect(simulate({ network: 'ethernet', congestion: 0.6 }).dropped).toBeGreaterThan(0);
    expect(simulate({ network: 'ethernet', congestion: 1 }).dropped).toBeGreaterThan(simulate({ network: 'ethernet', congestion: 0.6 }).dropped);
  });
  it('Spectrum-X sits between: nearly no drops, and far better than plain Ethernet when jammed', () => {
    const eth = simulate({ network: 'ethernet', congestion: 1 });
    const sx = simulate({ network: 'spectrumx', congestion: 1 });
    expect(sx.dropped).toBeGreaterThan(0);
    expect(sx.dropped).toBeLessThan(eth.dropped / 5);
    expect(sx.throughput).toBeGreaterThan(eth.throughput * 2);
  });
  it('throughput never rises with congestion and ranks InfiniBand >= Spectrum-X >= Ethernet', () => {
    for (const network of NETWORKS) {
      let prev = 1;
      for (const congestion of steps) {
        const t = simulate({ network, congestion }).throughput;
        expect(t).toBeLessThanOrEqual(prev + 1e-12);
        prev = t;
      }
    }
    for (const congestion of steps) {
      const t = (network: (typeof NETWORKS)[number]) => simulate({ network, congestion }).throughput;
      expect(t('infiniband')).toBeGreaterThanOrEqual(t('spectrumx') - 1e-12);
      expect(t('spectrumx')).toBeGreaterThanOrEqual(t('ethernet') - 1e-12);
    }
  });
  it('clamps congestion into 0 to 1', () => {
    expect(simulate({ network: 'ethernet', congestion: 5 })).toEqual(simulate({ network: 'ethernet', congestion: 1 }));
    expect(simulate({ network: 'ethernet', congestion: -1 })).toEqual(simulate({ network: 'ethernet', congestion: 0 }));
  });
});
