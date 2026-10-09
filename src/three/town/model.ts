import { Color } from 'three';
import { connections, type ConnGroup } from '@/content/town';
import { scene } from '../core/palette';
import { connectionGeometry, districtLayout, HS, riverPts, toWorld, type BoxProp } from './layout';

/** Pure builders: turn the layout into flat instance lists so the scene renders each kind in one draw call. */

const col = (hex: string) => new Color(hex);
const mix = (a: string, b: string, t: number) => col(a).lerp(col(b), t);

export type RibbonItem = {
  connId: string;
  group: ConnGroup;
  shape: 'seg' | 'post';
  /** Centre, in world units. */
  x: number;
  y: number;
  z: number;
  /** Segment: length, height, width. Post: radius, height, radius (cylinder, unit height). */
  sx: number;
  sy: number;
  sz: number;
  rotY: number;
  color: Color;
};

export const RIVER_ID = 'river-main';

const layers: Record<string, { w: number; y: number; h: number; color: Color }[]> = {
  roads: [
    { w: 0.92, y: 0, h: 0.04, color: mix(scene.ground, scene.roof, 0.85) },
    { w: 0.72, y: 0.04, h: 0.03, color: col(scene.path) },
    { w: 0.06, y: 0.07, h: 0.01, color: mix(scene.path, scene.roof, 0.35) },
  ],
  rail: [
    { w: 0.8, y: 0, h: 0.04, color: mix(scene.network, scene.roof, 0.8) },
    { w: 0.62, y: 0.04, h: 0.03, color: col(scene.wall) },
    { w: 0.34, y: 0.07, h: 0.02, color: col(scene.network) },
    { w: 0.1, y: 0.09, h: 0.01, color: mix(scene.network, scene.roof, 0.6) },
  ],
  belts: [
    { w: 0.6, y: 0, h: 0.14, color: mix(scene.roof, '#000000', 0.15) },
    { w: 0.44, y: 0.14, h: 0.03, color: col(scene.wall) },
    { w: 0.16, y: 0.17, h: 0.01, color: col(scene.hall) },
  ],
  river: [
    { w: 1.5, y: 0, h: 0.06, color: mix(scene.coolant, '#000000', 0.5) },
    { w: 1.3, y: 0.06, h: 0.02, color: mix(scene.coolant, '#000000', 0.18) },
  ],
  pipe: [
    { w: 0.3, y: 0.02, h: 0.16, color: mix(scene.coolant, '#000000', 0.4) },
    { w: 0.18, y: 0.18, h: 0.02, color: col(scene.coolant) },
  ],
};

function segments(id: string, group: ConnGroup, pts: [number, number][], ls: { w: number; y: number; h: number; color: Color }[], out: RibbonItem[], joints = true) {
  for (let i = 1; i < pts.length; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const len = Math.hypot(bx - ax, bz - az);
    const rotY = -Math.atan2(bz - az, bx - ax);
    for (const l of ls) out.push({ connId: id, group, shape: 'seg', x: (ax + bx) / 2, y: l.y + l.h / 2, z: (az + bz) / 2, sx: len, sy: l.h, sz: l.w, rotY, color: l.color });
  }
  if (!joints) return;
  // Round the inside of every corner (and the river's ends) with a short cylinder per layer.
  for (let i = 1; i < pts.length - 1; i++) for (const l of ls) out.push({ connId: id, group, shape: 'post', x: pts[i][0], y: l.y + l.h / 2, z: pts[i][1], sx: l.w / 2, sy: l.h, sz: l.w / 2, rotY: 0, color: l.color });
}

/** Every road, rail, belt, bridge, pipe, cable and the river as box segments and posts. */
export function buildRibbons(): RibbonItem[] {
  const out: RibbonItem[] = [];
  segments(RIVER_ID, 'river', riverPts.map(([x, y]) => toWorld(x, y)), layers.river, out);
  for (const cn of connections) {
    const g = connectionGeometry[cn.id];
    if (!g) continue; // sensor lines are curves, drawn separately
    const pts = g.pts.map(([x, y]) => toWorld(x, y)) as [number, number][];
    if (g.pipe) segments(cn.id, cn.group, pts, layers.pipe, out);
    else if (g.cable) {
      segments(cn.id, cn.group, pts, [{ w: 0.08, y: 0.66, h: 0.06, color: mix(scene.roof, '#000000', 0.2) }], out, false);
      for (const p of pts) out.push({ connId: cn.id, group: cn.group, shape: 'post', x: p[0], y: 0.35, z: p[1], sx: 0.07, sy: 0.7, sz: 0.07, rotY: 0, color: col(scene.roof) });
    } else if (g.bridge) {
      const zb = (g.z ?? 2.6) * HS;
      segments(cn.id, cn.group, pts, [{ w: 0.46, y: zb - 0.23, h: 0.46, color: col(scene.wall) }, { w: 0.54, y: zb + 0.23, h: 0.07, color: col(scene.network) }], out);
      for (const p of pts) out.push({ connId: cn.id, group: cn.group, shape: 'post', x: p[0], y: zb / 2 - 0.23, z: p[1], sx: 0.09, sy: zb - 0.46, sz: 0.09, rotY: 0, color: mix(scene.wall, scene.roof, 0.35) });
    } else segments(cn.id, cn.group, pts, layers[cn.group], out);
  }
  return out;
}

export type DetailItem = { x: number; y: number; z: number; sx: number; sy: number; sz: number; color: Color };

const boxes = () => districtLayout.flatMap((d) => d.props).filter((p): p is BoxProp => p.kind === 'box');

/** Windows and doors on the +z face of the buildings that ask for them. */
export function buildDetails(): DetailItem[] {
  const out: DetailItem[] = [];
  const glass = mix(scene.coolant, '#000000', 0.1);
  const door = mix(scene.wall, scene.roof, 0.7);
  for (const b of boxes()) {
    const [cx0, zmin] = toWorld(b.x, b.y);
    const zface = zmin + b.d + 0.005;
    const base = (b.z0 ?? 0) * HS;
    const hh = b.h * HS;
    if (b.win) {
      const n = Math.max(1, Math.floor(b.w * 1.4));
      for (let i = 0; i < n; i++) out.push({ x: cx0 + (b.w * (i + 0.5)) / n, y: base + hh * 0.45, z: zface, sx: 0.24, sy: hh * 0.25, sz: 0.02, color: glass });
    }
    if (b.door) out.push({ x: cx0 + b.w / 2, y: base + hh * 0.2, z: zface + 0.002, sx: 0.4, sy: hh * 0.4, sz: 0.02, color: door });
  }
  return out;
}

/** Parcels that travel along connections flagged `parcels`: two per connection, offset by half a lap. */
export type ParcelSpec = { connId: string; group: ConnGroup; seconds: number; offset: number; y: number; rail: boolean };
export function buildParcels(): ParcelSpec[] {
  const out: ParcelSpec[] = [];
  connections.forEach((cn, i) => {
    const g = connectionGeometry[cn.id];
    if (!g?.parcels) return;
    const seconds = 7 + (i % 4) * 2;
    const y = g.bridge ? (g.z ?? 2.6) * HS + 0.27 : cn.group === 'belts' ? 0.24 : 0.18;
    for (let k = 0; k < 2; k++) out.push({ connId: cn.id, group: cn.group, seconds, offset: k / 2, y, rail: cn.group === 'rail' });
  });
  return out;
}

/** True when a connection should be drawn faded: a tour step is running and does not highlight it. */
export function isDimmed(connId: string, tourActive: boolean, highlighted: Set<string>): boolean {
  if (!tourActive || highlighted.has(connId)) return false;
  if (connId === RIVER_ID) return ![...highlighted].some((id) => id.startsWith('pipe-'));
  return true;
}
