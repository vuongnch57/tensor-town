import { useNavigate } from 'react-router-dom';
import { chrome } from '@/content/chrome';
import { districts } from '@/content/town';
import type { ZoneSlug } from '@/content/types';
import { zonePath } from '@/lib/urls';
import { scene } from '@/three/core/palette';
import { connectionGeometry, districtLayout, HS, riverPts, TOWN_D, TOWN_W, type BoxProp } from '@/three/town/layout';

/** No WebGL: a flat isometric drawing of the town built from the same layout data, with the same numbered pins. */
const TW = 34;
const TH = 17;
const ZH = 26;
const OX = 560;
const OY = 150;
const P = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * TW, OY + (x + y) * TH - z * ZH * HS];
const pts = (a: [number, number][]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const line = (a: [number, number][], z = 0) => `M${a.map(([x, y]) => P(x, y, z).join(' ')).join(' L')}`;

const dark = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (s: number) => Math.round(((n >> s) & 255) * f);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

function BoxShape({ b }: { b: BoxProp }) {
  const z0 = b.z0 ?? 0;
  const top = scene[b.roof];
  const wall = scene[b.wall ?? 'wall'];
  const { x, y, w, d, h } = b;
  const zt = z0 + h;
  return (
    <g>
      <polygon points={pts([P(x, y + d, zt), P(x + w, y + d, zt), P(x + w, y + d, z0), P(x, y + d, z0)])} fill={dark(wall, 0.88)} />
      <polygon points={pts([P(x + w, y + d, zt), P(x + w, y, zt), P(x + w, y, z0), P(x + w, y + d, z0)])} fill={dark(wall, 0.74)} />
      <polygon points={pts([P(x, y, zt), P(x + w, y, zt), P(x + w, y + d, zt), P(x, y + d, zt)])} fill={top} stroke={dark(top, 0.8)} strokeWidth={0.8} strokeLinejoin="round" />
    </g>
  );
}

export function TownFallback() {
  const navigate = useNavigate();
  const go = (slug: ZoneSlug) => navigate(zonePath(slug));
  const boxes = districtLayout.flatMap((d) => d.props).filter((p): p is BoxProp => p.kind === 'box').sort((a, b) => a.x + a.w / 2 + a.y + a.d / 2 - (b.x + b.w / 2 + b.y + b.d / 2));
  const base = [P(-0.5, -0.5), P(TOWN_W + 0.5, -0.5), P(TOWN_W + 0.5, TOWN_D + 0.5), P(-0.5, TOWN_D + 0.5)];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 overflow-auto px-4 pb-16 pt-16">
      <p className="max-w-xl text-center text-sm text-muted">{chrome.fallback}</p>
      <svg viewBox="0 0 1120 640" className="max-h-full w-full max-w-5xl" role="group" aria-label="Isometric drawing of the town">
        <polygon points={pts(base)} fill={scene.ground} />
        <path d={line(riverPts)} fill="none" stroke={scene.coolant} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
        {Object.entries(connectionGeometry).map(([id, g]) => (
          <path key={id} d={line(g.pts, g.z ?? 0)} fill="none" strokeLinejoin="round" stroke={id.startsWith('rail') ? scene.network : id.startsWith('pipe') ? scene.coolant : id.startsWith('belt') || id.startsWith('bridge') ? scene.hall : id.startsWith('cable') ? scene.roof : scene.path} strokeWidth={g.cable ? 2 : 12} strokeDasharray={g.cable ? '6 4' : undefined} />
        ))}
        {boxes.map((b, i) => (
          <BoxShape key={i} b={b} />
        ))}
        {districts.map((d) => {
          const m = districtLayout.find((x) => x.slug === d.slug)!.marker;
          const [px, py] = P(m[0], m[1], m[2]);
          return (
            <g key={d.slug} transform={`translate(${px} ${py})`} role="button" tabIndex={0} aria-label={`District ${d.number}, ${d.name}`} className="cursor-pointer" onClick={() => go(d.slug)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(d.slug)}>
              <circle r={15} fill="rgb(var(--marker))" stroke="rgb(var(--surface-200))" strokeWidth={3} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill="#1c2430">{d.number}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
