import { anchors as gpuHallAnchors } from '@/three/zones/gpu-hall/anchors';
import { gpuHallItems } from './items/gpu-hall';
import { controlRoomItems } from './items/control-room';
import { dgxBuildingItems } from './items/dgx-building';
import { productionLineItems } from './items/production-line';
import { storageYardItems } from './items/storage-yard';
import { transportNetworkItems } from './items/transport-network';
import { packingStationItems } from './items/packing-station';
import { anchors as controlRoomAnchors } from '@/three/zones/control-room/layout';
import { anchors as dgxBuildingAnchors } from '@/three/zones/dgx-building/layout';
import { anchors as productionLineAnchors } from '@/three/zones/production-line/layout';
import { anchors as storageYardAnchors } from '@/three/zones/storage-yard/layout';
import { anchors as transportNetworkAnchors } from '@/three/zones/transport-network/layout';
import { anchors as packingStationAnchors } from '@/three/zones/packing-station/anchors';
import type { Anchor, Item, ZoneSlug } from './types';

export const allItems: Item[] = [...gpuHallItems, ...packingStationItems, ...dgxBuildingItems, ...transportNetworkItems, ...storageYardItems, ...productionLineItems, ...controlRoomItems];
export const anchorsBySlug: Partial<Record<ZoneSlug, Record<string, Anchor>>> = { 'gpu-hall': gpuHallAnchors, 'packing-station': packingStationAnchors, 'dgx-building': dgxBuildingAnchors, 'transport-network': transportNetworkAnchors, 'storage-yard': storageYardAnchors, 'production-line': productionLineAnchors, 'control-room': controlRoomAnchors };
export const itemsById: Record<string, Item> = Object.fromEntries(allItems.map((i) => [i.id, i]));

/** Items in display order: objects by number, then concepts. */
export const itemsInZone = (slug: ZoneSlug): Item[] => {
  const inZone = allItems.filter((i) => i.zone === slug);
  return [...inZone.filter((i) => i.kind === 'object').sort((a, b) => (a.number ?? 0) - (b.number ?? 0)), ...inZone.filter((i) => i.kind === 'concept')];
};

/** Related ids that point at zones not built yet. Shown as "coming soon" chips; remove as zones land. */
export const forwardRefs: Record<string, string> = {
};
