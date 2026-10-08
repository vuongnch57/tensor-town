import { create } from 'zustand';
import { itemsById } from '@/content/registry';
import type { SimParams } from '@/content/types';

type FactoryState = {
  selectedId: string | null;
  hoveredId: string | null;
  searchQuery: string;
  sim: SimParams;
  /** The one entry point for selecting an item: scene, index, related chip, search and URL all call this. */
  select: (itemId: string | null) => void;
  hover: (itemId: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSim: (patch: Partial<SimParams>) => void;
};

export const DEFAULT_SIM: SimParams = { workload: 'inference', gpu: 'h100', format: 'fp16' };

export const useFactoryStore = create<FactoryState>((set) => ({
  selectedId: null,
  hoveredId: null,
  searchQuery: '',
  sim: DEFAULT_SIM,
  select: (itemId) =>
    set((s) => {
      const patch = itemId ? itemsById[itemId]?.sim : undefined;
      return { selectedId: itemId, sim: patch ? { ...s.sim, ...patch } : s.sim };
    }),
  hover: (hoveredId) => set({ hoveredId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSim: (patch) => set((s) => ({ sim: { ...s.sim, ...patch } })),
}));
