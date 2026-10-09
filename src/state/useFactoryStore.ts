import { create } from 'zustand';
import { itemsById } from '@/content/registry';
import type { ConnGroup } from '@/content/town';
import type { SimParams } from '@/content/types';

type FactoryState = {
  selectedId: string | null;
  hoveredId: string | null;
  searchQuery: string;
  sim: SimParams;
  /** Hamburger modal (SPEC §3.6). */
  menuOpen: boolean;
  /** Connection groups switched off in the menu. */
  hiddenGroups: ConnGroup[];
  /** Guided tour step index, or null when the tour is not running. */
  tourStep: number | null;
  /** The one entry point for selecting an item: scene, index, related chip, search and URL all call this. */
  select: (itemId: string | null) => void;
  hover: (itemId: string | null) => void;
  setSearchQuery: (q: string) => void;
  setSim: (patch: Partial<SimParams>) => void;
  setMenuOpen: (open: boolean) => void;
  toggleGroup: (group: ConnGroup) => void;
  setTourStep: (step: number | null) => void;
};

export const DEFAULT_SIM: SimParams = { workload: 'inference', gpu: 'h100', format: 'fp16' };

export const useFactoryStore = create<FactoryState>((set) => ({
  selectedId: null,
  hoveredId: null,
  searchQuery: '',
  sim: DEFAULT_SIM,
  menuOpen: false,
  hiddenGroups: [],
  tourStep: null,
  select: (itemId) =>
    set((s) => {
      const patch = itemId ? itemsById[itemId]?.sim : undefined;
      return { selectedId: itemId, sim: patch ? { ...s.sim, ...patch } : s.sim };
    }),
  hover: (hoveredId) => set({ hoveredId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSim: (patch) => set((s) => ({ sim: { ...s.sim, ...patch } })),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleGroup: (group) => set((s) => ({ hiddenGroups: s.hiddenGroups.includes(group) ? s.hiddenGroups.filter((g) => g !== group) : [...s.hiddenGroups, group] })),
  setTourStep: (tourStep) => set({ tourStep }),
}));
