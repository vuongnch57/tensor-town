# Progress

SPEC v3.0 (the town concept) replaces the v2.0 per-zone dioramas. See SPEC.md §3.4 to §3.6 and `design/mockup-town.html`.

| Phase | Branch | PR | Status |
|---|---|---|---|
| 0 Scaffold | `phase-0-scaffold` | #1 | Merged |
| 1 Town shell | `claude/project-thread-xzmwed` | #3 | Merged. Built: 3D town, 7 connection types, hamburger modal, district fly-in, guided tour, 2D fallback |
| 2 Factory Quarter (Zone 1) | `claude/project-thread-xzmwed` | #4 | Merged. Zone 1 lives inside the town: 8 hotspots, index, detail panel, simulate bar, URL per item, camera flies to the selected object. Old standalone zone page removed |
| 3 Index, Compare, Search, About | `claude/project-thread-xzmwed` | #5 | Merged. Built: site-wide search in the menu (items, comparisons, districts), Index page with filters, Compare page, About page, town markers pulse for search matches |
| 4a District 2 Packing Dock (Zone 2) | `claude/project-thread-xzmwed` | #6 Merged | 6 objects (FP32, BF16/FP16, FP8, INT8, Delivery truck, Transformer Engine) and 3 concepts, FP32/BF16/FP8/INT8 comparison, simulate bar (format x model size, weights vs 80 GB), truck cargo reacts to the format. Next: districts 3 to 5, one at a time |
| 4b District 3 DGX Building (Zone 3) | `claude/project-thread-xzmwed` | in review | 5 objects (GPU room, NVLink bridge, NVSwitch hub, HGX board, DGX system) and 4 concepts (PCIe, MGX, Grace Hopper, Scale-up vs scale-out), 2 comparisons, simulate bar (interconnect, run all-to-all, relative exchange time). Next: districts 4 and 5, one at a time |

**Open items:** MGX specifics are `TODO(fact)` (not in SPEC §8). Lighthouse performance (≥ 80 desktop) is unconfirmed; check on the Vercel preview, since cloud WebGL is software-only. The Blueprint (reference architecture) view is proposed but not yet in the spec.
