# Progress

SPEC v3.0 (the town concept) replaces the v2.0 per-zone dioramas. See SPEC.md §3.4 to §3.6 and `design/mockup-town.html`.

| Phase | Branch | PR | Status |
|---|---|---|---|
| 0 Scaffold | `phase-0-scaffold` | #1 | Merged |
| 1 Town shell | `claude/project-thread-xzmwed` | #3 | Merged. Built: 3D town, 7 connection types, hamburger modal, district fly-in, guided tour, 2D fallback |
| 2 Factory Quarter (Zone 1) | `claude/project-thread-xzmwed` | in review | Zone 1 lives inside the town: 8 hotspots, index, detail panel, simulate bar, URL per item, camera flies to the selected object. Old standalone zone page removed |

**Open items:** Lighthouse performance (≥ 80 desktop) is unconfirmed; check on the Vercel preview, since cloud WebGL is software-only. The Blueprint (reference architecture) view is proposed but not yet in the spec.
