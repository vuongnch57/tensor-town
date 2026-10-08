# AI Factory

An explorable isometric 3D reference to AI data-center infrastructure: GPUs as production halls, memory as
warehouses, networks as roads and rails. A static React + three.js site. See `SPEC.md` for the full spec and
`PROGRESS.md` for the current state.

Personal project, not affiliated with NVIDIA.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest: simulations, content checks
npm run build    # static site in dist/
npm run preview  # serve dist/ locally
```

Node 20 or newer. No environment variables or secrets are needed.

## Deploy to Vercel

1. Import the repository in Vercel and pick the branch to deploy (each branch gets a preview URL).
2. Settings are read from `vercel.json`: framework **Vite**, build command `npm run build`, output directory `dist`.
3. `vercel.json` rewrites every path to `/index.html`, so deep links such as `/zone/gpu-hall/hbm` work.
4. No environment variables. Leave them empty.
5. Every push to a branch builds a preview. Open the preview on a machine with a real GPU and run Lighthouse (Chrome DevTools, Performance, mobile) to check the 80+ target; cloud sandboxes only have software WebGL.

For Cloudflare Pages use build command `npm run build`, output `dist`; `public/_redirects` provides the SPA fallback.

## Project layout

```
src/app/       router, layout
src/pages/     route pages (zone page is code-split)
src/three/     core (camera, lighting, ground, effects), primitives, zones/<slug>
src/ui/        2D UI components
src/content/   all user-facing text, items, comparisons, content checks
src/state/     zustand store
design/        tokens.json and visual references
public/models/ CC0 props (see its README)
```
