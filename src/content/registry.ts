import type { Anchor, Item, ZoneSlug } from './types';

// Phase 0: no zone content yet. Phase 1 registers gpu-hall.
export const allItems: Item[] = [];
export const anchorsBySlug: Partial<Record<ZoneSlug, Record<string, Anchor>>> = {};
export const itemsById: Record<string, Item> = Object.fromEntries(allItems.map((i) => [i.id, i]));
export const itemsInZone = (slug: ZoneSlug): Item[] => allItems.filter((i) => i.zone === slug);
