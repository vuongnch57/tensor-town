import { ALLOWED_NUMBERS, TODO_MARK } from './facts';
import type { Anchor, Comparison, Item } from './types';

/** Numbers in free text, ignoring "24/7" (SPEC metaphor), "100% utilization" (the name of a SPEC concept), product/format identifiers (H100, FP8, HBM3, L2, E4M3) and ordinals (4th). */
export function numbersIn(text: string): string[] {
  const stripped = text.replace(/\b24\/7\b/g, ' ').replace(/\b100% utilization\b/gi, ' ').replace(/\b[A-Za-z]+\d+[A-Za-z0-9]*\b/g, ' ').replace(/\b\d+(?:st|nd|rd|th)\b/g, (m) => m.replace(/(?:st|nd|rd|th)$/, ''));
  return stripped.match(/\d+(?:\.\d+)?/g) ?? [];
}

/** Numbers in `text` that are not in SPEC §8. Text marked TODO(fact) is exempt. */
export function unverifiedNumbers(text: string): string[] {
  if (text.includes(TODO_MARK)) return [];
  return numbersIn(text).filter((n) => !ALLOWED_NUMBERS.has(n));
}

const textsOf = (item: Item): string[] => [
  item.name,
  item.category,
  item.metaphor,
  item.summary,
  ...item.facts.flatMap((f) => [f.label, f.value]),
  ...(item.compare?.rows.flatMap((r) => [r.label, ...r.values]) ?? []),
];

export type CheckInput = {
  items: Item[];
  anchors: Record<string, Record<string, Anchor>>; // zone slug -> anchorId -> anchor
  comparisons: Comparison[];
  /** Related ids that point to zones not built yet. Remove entries as zones land. */
  forwardRefs?: string[];
};

/** Returns a list of human-readable problems; empty means the content is consistent. */
export function checkContent({ items, anchors, comparisons, forwardRefs = [] }: CheckInput): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const it of items) {
    if (ids.has(it.id)) errors.push(`duplicate item id "${it.id}"`);
    ids.add(it.id);
  }
  const compareIds = new Set(comparisons.map((c) => c.id));

  for (const it of items) {
    for (const r of it.related) {
      if (!ids.has(r) && !forwardRefs.includes(r)) errors.push(`${it.id}: related id "${r}" does not exist`);
    }
    if (it.compare) {
      const cols = it.compare.with.length + 1;
      if (it.compare.with.length === 0) errors.push(`${it.id}: compare.with is empty`);
      for (const row of it.compare.rows) {
        if (row.values.length !== cols) errors.push(`${it.id}: compare row "${row.label}" has ${row.values.length} values, expected ${cols}`);
      }
      const full = it.compare.fullCompareId;
      if (full && !compareIds.has(full)) errors.push(`${it.id}: fullCompareId "${full}" does not exist`);
    }
    if (it.kind === 'object') {
      if (it.number === undefined) errors.push(`${it.id}: object has no number`);
      if (!it.anchorId) errors.push(`${it.id}: object has no anchorId`);
      else if (!anchors[it.zone]?.[it.anchorId]) errors.push(`${it.id}: anchor "${it.anchorId}" missing in ${it.zone}/anchors`);
    } else if (it.number !== undefined || it.anchorId) {
      errors.push(`${it.id}: concept must not have a number or anchor`);
    }
    for (const t of textsOf(it)) {
      const bad = unverifiedNumbers(t);
      if (bad.length) errors.push(`${it.id}: number(s) ${bad.join(', ')} not in SPEC §8 (use ${TODO_MARK}): "${t}"`);
    }
  }

  const byZone = new Map<string, number[]>();
  for (const it of items) {
    if (it.kind === 'object' && it.number !== undefined) byZone.set(it.zone, [...(byZone.get(it.zone) ?? []), it.number]);
  }
  for (const [zone, nums] of byZone) {
    const sorted = [...nums].sort((a, b) => a - b);
    sorted.forEach((n, i) => {
      if (n !== i + 1) errors.push(`${zone}: object numbers must be unique and continuous from 1, got ${sorted.join(',')}`);
    });
  }
  return [...new Set(errors)];
}
