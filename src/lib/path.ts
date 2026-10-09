/** Pure polyline helpers used to move parcels along roads and belts. Points are [x, z] on the ground plane. */
export type Pt = readonly [number, number];

export function pathLength(points: readonly Pt[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
  return len;
}

/** Writes the point at distance `d` (clamped) along the polyline into `out` and returns the heading angle (radians, about +y). */
export function pointAt(points: readonly Pt[], d: number, out: { x: number; z: number }): number {
  let remaining = Math.max(0, d);
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dz = points[i][1] - points[i - 1][1];
    const seg = Math.hypot(dx, dz);
    if (remaining <= seg || i === points.length - 1) {
      const t = seg === 0 ? 0 : Math.min(1, remaining / seg);
      out.x = points[i - 1][0] + dx * t;
      out.z = points[i - 1][1] + dz * t;
      return Math.atan2(dx, dz);
    }
    remaining -= seg;
  }
  return 0;
}
