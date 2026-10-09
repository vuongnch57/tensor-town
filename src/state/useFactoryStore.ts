import { create } from 'zustand';
import { itemsById } from '@/content/registry';
import type { ConnGroup } from '@/content/town';
import type { FabricSimParams, NetSimParams, PackSimParams, SimParams } from '@/content/types';

type FactoryState = {
  selectedId: string | null;
  hoveredId: string | null;
  searchQuery: string;
  sim: SimParams;
  /** Zone 2 simulation (format and model size). */
  packSim: PackSimParams;
  /** Zone 3 simulation (interconnect) and whether an all-to-all run is in progress. */
  fabricSim: FabricSimParams;
  /** Zone 4 simulation (network and congestion). */
  netSim: NetSimParams;
  fabricRunning: boolean;
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
  setPackSim: (patch: Partial<PackSimParams>) => void;
  setFabricSim: (patch: Partial<FabricSimParams>) => void;
  setNetSim: (patch: Partial<NetSimParams>) => void;
  setFabricRunning: (running: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  toggleGroup: (group: ConnGroup) => void;
  setTourStep: (step: number | null) => void;
};

export const DEFAULT_SIM: SimParams = { workload: 'inference', gpu: 'h100', format: 'fp16' };
export const DEFAULT_PACK_SIM: PackSimParams = { format: 'bf16', model: '70b' };
export const DEFAULT_FABRIC_SIM: FabricSimParams = { interconnect: 'nvswitch' };
export const DEFAULT_NET_SIM: NetSimParams = { network: 'ethernet', congestion: 0.5 };

export const useFactoryStore = create<FactoryState>((set) => ({
  selectedId: null,
  hoveredId: null,
  searchQuery: '',
  sim: DEFAULT_SIM,
  packSim: DEFAULT_PACK_SIM,
  fabricSim: DEFAULT_FABRIC_SIM,
  netSim: DEFAULT_NET_SIM,
  fabricRunning: false,
  menuOpen: false,
  hiddenGroups: [],
  tourStep: null,
  select: (itemId) =>
    set((s) => {
      const item = itemId ? itemsById[itemId] : undefined;
      return {
        selectedId: itemId,
        sim: item?.sim ? { ...s.sim, ...item.sim } : s.sim,
        packSim: item?.packSim ? { ...s.packSim, ...item.packSim } : s.packSim,
        fabricSim: item?.fabricSim ? { ...s.fabricSim, ...item.fabricSim } : s.fabricSim,
        netSim: item?.netSim ? { ...s.netSim, ...item.netSim } : s.netSim,
      };
    }),
  hover: (hoveredId) => set({ hoveredId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSim: (patch) => set((s) => ({ sim: { ...s.sim, ...patch } })),
  setPackSim: (patch) => set((s) => ({ packSim: { ...s.packSim, ...patch } })),
  setFabricSim: (patch) => set((s) => ({ fabricSim: { ...s.fabricSim, ...patch } })),
  setNetSim: (patch) => set((s) => ({ netSim: { ...s.netSim, ...patch } })),
  setFabricRunning: (fabricRunning) => set({ fabricRunning }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleGroup: (group) => set((s) => ({ hiddenGroups: s.hiddenGroups.includes(group) ? s.hiddenGroups.filter((g) => g !== group) : [...s.hiddenGroups, group] })),
  setTourStep: (tourStep) => set({ tourStep }),
}));
