import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SIM, useFactoryStore } from './useFactoryStore';
import { zonePath } from '@/lib/urls';

describe('store and urls', () => {
  beforeEach(() => useFactoryStore.setState({ selectedId: null, sim: DEFAULT_SIM }));
  it('select() sets and clears the selection', () => {
    useFactoryStore.getState().select('hbm');
    expect(useFactoryStore.getState().selectedId).toBe('hbm');
    useFactoryStore.getState().select(null);
    expect(useFactoryStore.getState().selectedId).toBeNull();
  });
  it('setSim merges', () => {
    useFactoryStore.getState().setSim({ gpu: 'h200' });
    expect(useFactoryStore.getState().sim).toEqual({ ...DEFAULT_SIM, gpu: 'h200' });
  });
  it('builds item urls', () => {
    expect(zonePath('gpu-hall')).toBe('/zone/gpu-hall');
    expect(zonePath('gpu-hall', 'hbm')).toBe('/zone/gpu-hall/hbm');
  });
});
