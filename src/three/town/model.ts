import { Color } from 'three';
import { connections, type ConnGroup } from '@/content/town';
import { scene } from '../core/palette';
import { buildings, connectionGeometry, riverPts } from './layout';

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
  segments(RIVER_ID, 'river', riverPts, layers.river, out);
  for (const cn of connections) {
    const g = connectionGeometry[cn.id];
    if (!g) continue; // sensor lines are curves, drawn separately
    const pts = g.pts;
    if (g.pipe) segments(cn.id, cn.group, pts, layers.pipe, out);
    else if (g.cable) {
      segments(cn.id, cn.group, pts, [{ w: 0.08, y: 0.66, h: 0.06, color: mix(scene.roof, '#000000', 0.2) }], out, false);
      for (const p of pts) out.push({ connId: cn.id, group: cn.group, shape: 'post', x: p[0], y: 0.35, z: p[1], sx: 0.07, sy: 0.7, sz: 0.07, rotY: 0, color: col(scene.roof) });
    } else if (g.bridge) {
      const zb = (g.z ?? 2.6);
      segments(cn.id, cn.group, pts, [{ w: 0.46, y: zb - 0.23, h: 0.46, color: col(scene.wall) }, { w: 0.54, y: zb + 0.23, h: 0.07, color: col(scene.network) }], out);
      for (const p of pts) out.push({ connId: cn.id, group: cn.group, shape: 'post', x: p[0], y: zb / 2 - 0.23, z: p[1], sx: 0.09, sy: zb - 0.46, sz: 0.09, rotY: 0, color: mix(scene.wall, scene.roof, 0.35) });
    } else segments(cn.id, cn.group, pts, layers[cn.group], out);
  }
  return out;
}

export type DetailItem = { x: number; y: number; z: number; sx: number; sy: number; sz: number; color: Color };

/** Windows (and doors) on the +z and +x faces of the buildings that ask for them: one instanced draw call for all of them. */
export function buildDetails(): DetailItem[] {
  const out: DetailItem[] = [];
  const glass = mix(scene.coolant, '#000000', 0.08);
  const door = mix(scene.roof, '#000000', 0.2);
  for (const b of buildings) {
    const base = b.y0 ?? 0;
    if (b.win) {
      const [cols, rows] = b.win;
      const wy = (j: number) => base + b.h * (0.34 + (0.56 * (j + 0.5)) / rows);
      const sy = Math.min(0.4, ((b.h * 0.56) / rows) * 0.55);
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          out.push({ x: b.x - b.w / 2 + (b.w * (i + 0.5)) / cols, y: wy(j), z: b.z + b.d / 2 + 0.01, sx: Math.min(0.5, (b.w / cols) * 0.5), sy, sz: 0.06, color: glass });
        }
        const side = Math.max(1, Math.round(cols * (b.d / b.w)));
        for (let i = 0; i < side; i++) {
          out.push({ x: b.x + b.w / 2 + 0.01, y: wy(j), z: b.z - b.d / 2 + (b.d * (i + 0.5)) / side, sx: 0.06, sy, sz: Math.min(0.5, (b.d / side) * 0.5), color: glass });
        }
      }
    }
    if (b.door) out.push({ x: b.x - b.w * 0.22, y: base + Math.min(0.45, b.h * 0.3), z: b.z + b.d / 2 + 0.012, sx: 0.55, sy: Math.min(0.9, b.h * 0.6), sz: 0.06, color: door });
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
    const y = g.bridge ? (g.z ?? 2.6) + 0.27 : cn.group === 'belts' ? 0.24 : 0.18;
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
