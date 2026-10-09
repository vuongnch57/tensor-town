/** Pure polyline helpers for connections and parcels. Points are [x, z] in world units. */
export type Pt = [number, number];

export type Path = { pts: Pt[]; cum: number[]; length: number };

export function makePath(pts: Pt[]): Path {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, length: cum[cum.length - 1] };
}

/** Point at fraction `t` (0..1, clamped) along the path, written into `out` to avoid allocation in useFrame. */
export function pointAt(path: Path, t: number, out: Pt): Pt {
  const d = Math.min(1, Math.max(0, t)) * path.length;
  let i = 1;
  while (i < path.cum.length - 1 && path.cum[i] < d) i++;
  const seg = path.cum[i] - path.cum[i - 1] || 1;
  const k = (d - path.cum[i - 1]) / seg;
  out[0] = path.pts[i - 1][0] + (path.pts[i][0] - path.pts[i - 1][0]) * k;
  out[1] = path.pts[i - 1][1] + (path.pts[i][1] - path.pts[i - 1][1]) * k;
  return out;
}

/** Point on a quadratic Bezier (used by the curved sensor lines). */
export function bezierAt(a: [number, number, number], m: [number, number, number], b: [number, number, number], t: number, out: [number, number, number]) {
  const u = 1 - t;
  for (let i = 0; i < 3; i++) out[i] = u * u * a[i] + 2 * u * t * m[i] + t * t * b[i];
  return out;
}
