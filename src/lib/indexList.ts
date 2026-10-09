import type { Item, ItemKind, ZoneSlug } from '@/content/types';
import { zones } from '@/content/zones';

export type IndexFilter = { query: string; kind: ItemKind | 'all'; category: string | 'all' };
export type IndexGroup = { key: string; title: string; zone?: ZoneSlug; items: Item[] };

/** Items that pass the type and category filters and whose name, aliases or category contain the query. */
export function filterItems(items: Item[], f: IndexFilter): Item[] {
  const q = f.query.trim().toLowerCase();
  return items.filter((i) => {
    if (f.kind !== 'all' && i.kind !== f.kind) return false;
    if (f.category !== 'all' && i.category !== f.category) return false;
    if (!q) return true;
    return [i.name, i.category, ...(i.aliases ?? [])].some((t) => t.toLowerCase().includes(q));
  });
}

/** One group per zone that has items, in zone order; objects before concepts, objects by number. */
export function groupByZone(items: Item[]): IndexGroup[] {
  return zones
    .map((z) => {
      const inZone = items.filter((i) => i.zone === z.slug);
      const sorted = [...inZone.filter((i) => i.kind === 'object').sort((a, b) => (a.number ?? 0) - (b.number ?? 0)), ...inZone.filter((i) => i.kind === 'concept')];
      return { key: z.slug, title: `Zone ${z.number} · ${z.title}`, zone: z.slug, items: sorted };
    })
    .filter((g) => g.items.length > 0);
}

/** One group per first letter, A to Z. */
export function groupAZ(items: Item[]): IndexGroup[] {
  const by = new Map<string, Item[]>();
  for (const i of [...items].sort((a, b) => a.name.localeCompare(b.name))) {
    const letter = i.name.charAt(0).toUpperCase();
    by.set(letter, [...(by.get(letter) ?? []), i]);
  }
  return [...by.entries()].map(([letter, list]) => ({ key: letter, title: letter, items: list }));
}

export const categoriesOf = (items: Item[]): string[] => [...new Set(items.map((i) => i.category))].sort((a, b) => a.localeCompare(b));
