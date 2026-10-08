# Progress

| Phase | Branch | PR | Status |
|---|---|---|---|
| 0 Scaffold | `phase-0-scaffold` | https://github.com/vuongnch57/tensor-town/pull/1 (base `main`) | Done, in review |
| 1 Zone 1 end to end | `phase-1-gpu-hall` (from phase-0) | https://github.com/vuongnch57/tensor-town/pull/2 (base `phase-0-scaffold`) | Done, in review |

## Phase 1 summary
Zone 1 (GPU Hall): procedural isometric scene, 8 hotspots, zone index, detail panel, 11 items, 3 comparisons,
Simulate bar with tested toy model, URL per item, reduced motion, 2D fallback, mobile sheets.
Screenshots (1440 and 390) are in `docs/screenshots/`.

## Known gaps
- CC0 prop packs could not be downloaded (see `public/models/README.md`); props are procedural.
- Lighthouse performance >= 80 could not be confirmed here (software WebGL only). Please run it on the Vercel preview.
- Cross-zone related chips (FP8, GPUDirect Storage) are inert "coming soon" until those zones exist.

**Next:** wait for review. Phase 2 (Map, Index, Compare, Search, About) only when explicitly requested.
