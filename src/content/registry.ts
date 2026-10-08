import { anchors as gpuHallAnchors } from '@/three/zones/gpu-hall/anchors';
import { gpuHallItems } from './items/gpu-hall';
import type { Anchor, Item, ZoneSlug } from './types';

export const allItems: Item[] = [...gpuHallItems];
export const anchorsBySlug: Partial<Record<ZoneSlug, Record<string, Anchor>>> = { 'gpu-hall': gpuHallAnchors };
export const itemsById: Record<string, Item> = Object.fromEntries(allItems.map((i) => [i.id, i]));

/** Items in display order: objects by number, then concepts. */
export const itemsInZone = (slug: ZoneSlug): Item[] => {
  const inZone = allItems.filter((i) => i.zone === slug);
  return [...inZone.filter((i) => i.kind === 'object').sort((a, b) => (a.number ?? 0) - (b.number ?? 0)), ...inZone.filter((i) => i.kind === 'concept')];
};

/** Related ids that point at zones not built yet. Shown as "coming soon" chips; remove as zones land. */
export const forwardRefs: Record<string, string> = {
  fp8: 'FP8 · Zone 2',
  'gpudirect-storage': 'GPUDirect Storage · Zone 5',
};
