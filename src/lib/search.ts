import type { Comparison, Item, ZoneSlug } from '@/content/types';
import { allItems } from '@/content/registry';
import { comparisons as allComparisons } from '@/content/comparisons';
import { districts } from '@/content/town';
import { zoneBySlug } from '@/content/zones';
import { comparePath, zonePath } from './urls';

export type SearchHit = {
  kind: 'item' | 'comparison';
  id: string;
  title: string;
  /** Short context line: category and zone for items, the compared names for comparisons. */
  subtitle: string;
  to: string;
  zone: ZoneSlug;
  score: number;
};

type Doc = { hit: Omit<SearchHit, 'score'>; fields: { text: string; weight: number }[] };

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/** Score one document: every query word must match the start of a word (full weight) or sit inside one (half weight). */
function scoreDoc(doc: Doc, tokens: string[], whole: string): number {
  let total = 0;
  for (const t of tokens) {
    let best = 0;
    for (const f of doc.fields) {
      const lower = f.text.toLowerCase();
      if (lower === whole) best = Math.max(best, f.weight * 3);
      const ws = words(f.text);
      if (ws.some((w) => w === t)) best = Math.max(best, f.weight * 2);
      else if (ws.some((w) => w.startsWith(t))) best = Math.max(best, f.weight * 1.5);
      else if (lower.includes(t)) best = Math.max(best, f.weight * 0.5);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}

const itemDoc = (i: Item): Doc => ({
  hit: { kind: 'item', id: i.id, title: i.name, subtitle: `${i.category} · ${zoneBySlug(i.zone)?.title ?? ''}`, to: zonePath(i.zone, i.id), zone: i.zone },
  fields: [
    { text: i.name, weight: 10 },
    ...(i.aliases ?? []).map((text) => ({ text, weight: 8 })),
    { text: i.category, weight: 3 },
    { text: i.metaphor, weight: 2 },
    { text: i.summary, weight: 1 },
  ],
});

const comparisonDoc = (c: Comparison): Doc => ({
  hit: { kind: 'comparison', id: c.id, title: c.title, subtitle: c.columns.join(' · '), to: comparePath(c.id), zone: c.zones[0] },
  fields: [
    { text: c.title, weight: 10 },
    ...c.columns.map((text) => ({ text, weight: 8 })),
    { text: c.whyConfused, weight: 1 },
  ],
});

/** Everything the site can find: objects and concepts, plus comparisons. */
export function buildDocs(items: Item[] = allItems, comparisons: Comparison[] = allComparisons): Doc[] {
  return [...items.map(itemDoc), ...comparisons.map(comparisonDoc)];
}

const defaultDocs = buildDocs();

export type SearchResults = { items: SearchHit[]; comparisons: SearchHit[] };

/** Search items and comparisons. An empty query returns nothing. Results are best match first, then by title. */
export function search(query: string, docs: Doc[] = defaultDocs): SearchResults {
  const tokens = words(query);
  const out: SearchResults = { items: [], comparisons: [] };
  if (tokens.length === 0) return out;
  const whole = query.trim().toLowerCase();
  const hits = docs
    .map((d) => ({ ...d.hit, score: scoreDoc(d, tokens, whole) }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  for (const h of hits) (h.kind === 'item' ? out.items : out.comparisons).push(h);
  return out;
}

/** Districts to pulse on the town while a search is typed: those whose name matches, plus the zones of matching items and comparisons. */
export function searchDistricts(query: string): ZoneSlug[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const found = new Set<ZoneSlug>(districts.filter((d) => `${d.name} ${zoneBySlug(d.slug)?.title ?? ''}`.toLowerCase().includes(q)).map((d) => d.slug));
  const r = search(query);
  for (const h of [...r.items, ...r.comparisons]) found.add(h.zone);
  return [...found];
}
