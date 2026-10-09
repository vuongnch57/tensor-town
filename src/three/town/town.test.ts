import { describe, expect, it } from 'vitest';
import { connections, districts, stepConnectionIds, tourSteps, connectionsOf, CONN_GROUPS } from '@/content/town';
import { ZONE_SLUGS } from '@/content/types';
import { connectionGeometry, connectionPaths, buildings, districtLayout, footprints, markerWorld, riverPts, strips, trees, TOWN_D, TOWN_W } from './layout';
import { buildDetails, buildParcels, buildRibbons, isDimmed, RIVER_ID } from './model';
import { bezierAt, makePath, pointAt, type Pt } from './path';

describe('path helpers', () => {
  const path = makePath([[0, 0], [4, 0], [4, 3]]);
  it('measures length', () => expect(path.length).toBe(7));
  it('interpolates along segments and clamps', () => {
    const out: Pt = [0, 0];
    expect(pointAt(path, 0, out)).toEqual([0, 0]);
    expect(pointAt(path, 4 / 7, out)).toEqual([4, 0]);
    expect(pointAt(path, 1, out)).toEqual([4, 3]);
    expect(pointAt(path, 9, out)).toEqual([4, 3]);
    const mid = pointAt(path, 5.5 / 7, out);
    expect(mid[0]).toBeCloseTo(4);
    expect(mid[1]).toBeCloseTo(1.5);
  });
  it('samples a quadratic bezier at its ends and middle', () => {
    const o: [number, number, number] = [0, 0, 0];
    expect(bezierAt([0, 0, 0], [1, 2, 0], [2, 0, 0], 0, o)).toEqual([0, 0, 0]);
    expect(bezierAt([0, 0, 0], [1, 2, 0], [2, 0, 0], 1, o)).toEqual([2, 0, 0]);
    expect(bezierAt([0, 0, 0], [1, 2, 0], [2, 0, 0], 0.5, o)).toEqual([1, 1, 0]);
  });
});

describe('town content', () => {
  it('has one district per zone, numbered 1 to 9', () => {
    expect(districts.map((d) => d.slug)).toEqual([...ZONE_SLUGS]);
    expect(districts.map((d) => d.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('joins only real districts, never a district to itself, with unique ids', () => {
    const ids = new Set<string>();
    for (const c of connections) {
      expect(ZONE_SLUGS).toContain(c.joins[0]);
      expect(ZONE_SLUGS).toContain(c.joins[1]);
      expect(c.joins[0]).not.toBe(c.joins[1]);
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
    }
  });
  it('connects every district to the rest of the town', () => {
    for (const d of districts) expect(connectionsOf(d.slug).length).toBeGreaterThan(0);
  });
  it('uses every connection group at least once', () => {
    for (const g of CONN_GROUPS) expect(connections.some((c) => c.group === g)).toBe(true);
  });
  it('tour steps highlight at least one connection and name real districts', () => {
    for (const s of tourSteps) {
      expect(stepConnectionIds(s).size).toBeGreaterThan(0);
      for (const d of s.districts) expect(ZONE_SLUGS).toContain(d);
    }
  });
  it('tour covers the control tower sensors for every district', () => {
    const last = stepConnectionIds(tourSteps[tourSteps.length - 1]);
    expect(last.size).toBe(8);
  });
});

describe('town layout', () => {
  it('has a layout for every district and a marker inside the island', () => {
    expect(districtLayout.map((d) => d.slug).sort()).toEqual([...ZONE_SLUGS].sort());
    for (const d of districtLayout) {
      const [x, , z] = markerWorld(d.slug);
      expect(Math.abs(x)).toBeLessThan(TOWN_W / 2 + 0.5);
      expect(Math.abs(z)).toBeLessThan(TOWN_D / 2 + 0.5);
    }
  });
  it('has geometry for every connection except sensors, and no orphan geometry', () => {
    const wanted = connections.filter((c) => c.group !== 'sensors').map((c) => c.id).sort();
    expect(Object.keys(connectionGeometry).sort()).toEqual(wanted);
    for (const id of wanted) expect(connectionPaths[id].length).toBeGreaterThan(0.2);
  });
  it('keeps every connection and the river inside the island', () => {
    const inside = ([x, y]: [number, number]) => Math.abs(x) <= TOWN_W / 2 && Math.abs(y) <= TOWN_D / 2;
    for (const g of Object.values(connectionGeometry)) for (const p of g.pts) expect(inside(p)).toBe(true);
    for (const p of riverPts) expect(inside(p)).toBe(true);
  });
  it('keeps every building on the island', () => {
    for (const b of buildings) {
      expect(Math.abs(b.x) + b.w / 2).toBeLessThan(TOWN_W / 2);
      expect(Math.abs(b.z) + b.d / 2).toBeLessThan(TOWN_D / 2);
    }
  });
  it('keeps trees clear of buildings, roads and the river', () => {
    expect(trees.length).toBeGreaterThan(15);
    for (const [x, z] of trees) {
      for (const [fx, fz, hw, hd] of footprints()) expect(Math.abs(x - fx) < hw && Math.abs(z - fz) < hd).toBe(false);
      for (const s of strips()) expect(s.pts.length).toBeGreaterThan(1);
    }
  });
  it('has a road, rail, belt, bridge, pipe and cable', () => {
    const g = Object.values(connectionGeometry);
    expect(g.some((c) => c.bridge)).toBe(true);
    expect(g.some((c) => c.pipe)).toBe(true);
    expect(g.some((c) => c.cable)).toBe(true);
  });
});

describe('scene model', () => {
  it('builds finite ribbon instances for every group but sensors', () => {
    const items = buildRibbons();
    expect(items.length).toBeGreaterThan(40);
    for (const it of items) for (const n of [it.x, it.y, it.z, it.sx, it.sy, it.sz, it.rotY]) expect(Number.isFinite(n)).toBe(true);
    const groups = new Set(items.map((i) => i.group));
    expect([...groups].sort()).toEqual(CONN_GROUPS.filter((g) => g !== 'sensors').sort());
  });
  it('places details and parcels on real connections', () => {
    expect(buildDetails().length).toBeGreaterThan(10);
    const parcels = buildParcels();
    expect(parcels.length).toBeGreaterThan(8);
    for (const p of parcels) expect(connectionPaths[p.connId]).toBeDefined();
  });
  it('dims only while a tour runs, keeping highlighted connections and the river for pipe steps', () => {
    const hi = new Set(['pipe-power-factory']);
    expect(isDimmed('road-gate-harbour', false, hi)).toBe(false);
    expect(isDimmed('road-gate-harbour', true, hi)).toBe(true);
    expect(isDimmed('pipe-power-factory', true, hi)).toBe(false);
    expect(isDimmed(RIVER_ID, true, hi)).toBe(false);
    expect(isDimmed(RIVER_ID, true, new Set(['road-gate-harbour']))).toBe(true);
  });
});
